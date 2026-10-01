// ===== Utilidades =====
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const d = (n) => 1 + Math.floor(Math.random() * n);
const sgn = (n) => (n > 0 ? "+" + n : String(n));
const rid = () => Math.random().toString(36).slice(2, 10);
const inRange = (table, v) => table.find((r) => v >= r[0] && v <= r[1]);

// ===== Guardado: una sola interfaz, varios motores =====
// Para mudar el juego fuera de claude.ai basta con escribir otro motor con estos mismos métodos
// (por ejemplo con Firebase o Supabase) y elegirlo en Store.init().
const Store = {
  mode: "local", uid: null, isOwner: false, db: null, user: null, sample: null, downloads: null,
  all: [], priv: {}, world: null, listeners: new Set(),
  async init() {
    const c = window.claude;
    const [db, user, sample, downloads] = c && c.use ? await Promise.all(["db", "user", "sample", "downloads"].map((n) => c.use(n).catch(() => null))) : [null, null, null, null];
    this.user = user; this.sample = sample; this.downloads = downloads;
    if (user) { this.uid = await user.id(); this.isOwner = await user.isOwner(); }
    if (db && this.uid) { this.db = db; this.mode = "claude"; return this.initClaude(); }
    return this.initLocal();
  },
  onChange(fn) { this.listeners.add(fn); },
  emit() { this.listeners.forEach((f) => f()); },
  mine() { return this.all.filter((c) => c.owner === this.uid); },
  others() { return this.all.filter((c) => c.owner !== this.uid); },

  // --- motor claude.ai: chars/<uid> = { owner, chars: {id: ficha} } ; data/users/<uid>/priv = { chars: {id: privado} }
  initClaude() {
    this.db.collection("chars").onSnapshot((snap) => {
      const out = [];
      for (const doc of snap.docs) { const data = doc.data() || {}; for (const ch of Object.values(data.chars || {})) out.push({ ...ch, owner: doc.id }); }
      this.all = out.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); this.emit();
    }, () => {});
    this.db.doc("data/users/" + this.uid + "/priv").onSnapshot((snap) => { this.priv = (snap.exists && snap.data().chars) || {}; this.emit(); }, () => {});
    let seeded = false;
    this.db.doc("world/state").onSnapshot((snap) => {
      if (snap.exists) { this.world = snap.data(); this.emit(); return; }
      if (seeded) return; seeded = true;
      this.db.doc("world/state").set(newWorld()).catch(() => {});
    }, () => {});
  },
  // --- estado compartido del mundo (capítulo, votos, marcadores)
  async updateWorld(patch) {
    if (this.mode === "local") { this.world = deepMerge(this.world || newWorld(), patch); this.saveWorldLocal(); return; }
    this.world = deepMerge(this.world || newWorld(), patch); this.emit();
    await this.db.doc("world/state").update(patch);
  },
  async closeChapter(cap, option, counts) {
    const apply = (w) => {
      if ((w.cap || 1) !== cap) return null;
      const m = { ...(w.markers || {}) };
      for (const k of ["luz", "orden", "rep"]) m[k] = (m[k] || 0) + ((option.fx || {})[k] || 0);
      m.orden = Math.max(0, Math.min(10, m.orden || 0)); m.luz = Math.max(0, Math.min(100, m.luz ?? 80));
      const flags = { ...(w.flags || {}) }; const fx = option.fx || {}; if (fx.flag) flags[fx.flag] = true;
      const corrupt = { ...(flags.corrupt || {}) }; const fallen = { ...(flags.fallen || {}) };
      m.luz -= 2 * Object.values(corrupt).filter(Boolean).length; // cada dios corrupto apaga el sol
      if (fx.fall) { fallen[fx.fall] = true; corrupt[fx.fall] = false; }
      const next = typeof STORY !== "undefined" ? STORY.find((s) => s.cap === cap + 1) : null;
      if (next?.corrupt && !fallen[next.corrupt] && !flags.liberated?.[next.corrupt]) corrupt[next.corrupt] = true;
      flags.corrupt = corrupt; flags.fallen = fallen;
      m.luz = Math.max(0, Math.min(100, m.luz));
      return { cap: cap + 1, markers: m, flags, history: [...(w.history || []), { cap, id: option.id, label: option.l, counts, at: Date.now() }] };
    };
    if (this.mode === "local") { const p = apply(this.world || newWorld()); if (p) { this.world = { ...this.world, ...p }; this.saveWorldLocal(); } return; }
    const ref = this.db.doc("world/state");
    const lease = await ref.acquire({ holder: this.uid, ttlMs: 5000 }).catch(() => ({ acquired: false }));
    if (!lease.acquired) return;
    const snap = await ref.get(); const p = apply(snap.exists ? snap.data() : newWorld());
    if (p) await ref.update(p);
  },
  saveWorldLocal() { try { localStorage.setItem("sa-world", JSON.stringify(this.world)); } catch (e) {} this.emit(); },
  _chain: Promise.resolve(),
  async saveChar(ch, priv) {
    ch = { ...ch, owner: this.uid, updatedAt: Date.now() };
    if (this.mode === "local") return this.saveLocal(ch, priv);
    const job = async () => {
      const mineMap = Object.fromEntries(this.mine().map((c) => [c.id, c]));
      mineMap[ch.id] = ch;
      await this.db.doc("chars/" + this.uid).set({ owner: this.uid, chars: mineMap });
      if (priv) { const p = { ...this.priv, [ch.id]: priv }; await this.db.doc("data/users/" + this.uid + "/priv").set({ chars: p }); }
    };
    this._chain = this._chain.then(job, job); return this._chain;
  },
  async deleteChar(id) {
    if (this.mode === "local") return this.deleteLocal(id);
    const job = async () => {
      const mineMap = Object.fromEntries(this.mine().filter((c) => c.id !== id).map((c) => [c.id, c]));
      await this.db.doc("chars/" + this.uid).set({ owner: this.uid, chars: mineMap });
      const p = { ...this.priv }; delete p[id];
      await this.db.doc("data/users/" + this.uid + "/priv").set({ chars: p });
    };
    this._chain = this._chain.then(job, job); return this._chain;
  },

  // --- motor local (respaldo sin conexión; solo este navegador)
  initLocal() {
    let id = null; try { id = localStorage.getItem("sa-uid"); } catch (e) {}
    if (!id) { id = "local-" + rid(); try { localStorage.setItem("sa-uid", id); } catch (e) {} }
    this.uid = this.uid || id; this.isOwner = true;
    try { this.all = JSON.parse(localStorage.getItem("sa-chars") || "[]"); this.priv = JSON.parse(localStorage.getItem("sa-priv") || "{}"); } catch (e) { this.all = []; this.priv = {}; }
    try { this.world = JSON.parse(localStorage.getItem("sa-world") || "null"); } catch (e) {}
    if (!this.world) this.world = newWorld();
    this.emit();
  },
  saveLocal(ch, priv) {
    this.all = [...this.all.filter((c) => c.id !== ch.id), ch].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    if (priv) this.priv[ch.id] = priv;
    try { localStorage.setItem("sa-chars", JSON.stringify(this.all)); localStorage.setItem("sa-priv", JSON.stringify(this.priv)); } catch (e) {}
    this.emit();
  },
  deleteLocal(id) {
    this.all = this.all.filter((c) => c.id !== id); delete this.priv[id];
    try { localStorage.setItem("sa-chars", JSON.stringify(this.all)); localStorage.setItem("sa-priv", JSON.stringify(this.priv)); } catch (e) {}
    this.emit();
  },
};

function newWorld() { return { cap: 1, votes: {}, markers: { luz: 80, orden: 0, rep: 0 }, flags: {}, history: [] }; }
function deepMerge(a, b) {
  const out = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) out[k] = v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k]) ? deepMerge(out[k], v) : v;
  return out;
}

// ===== Borrador del personaje =====
function blankDraft() {
  return {
    step: 0, nombre: "", edad: 18, apariencia: "", personalidad: "",
    raza: "", sub: "", mestizo: false, raza2: "", debDe: "a",
    humanChoice: [],
    nac: null, afin: [],
    alloc: Object.fromEntries(ATTRS.map(([k]) => [k, 0])),
    manaRoll: null,
    trasfondo: "", arma: "Espada",
    motivo: "", secreto: "", look: {}, accesorios: [],
    profesor: "", vinculos: [],
  };
}
let draft = blankDraft();
function saveDraft() { try { localStorage.setItem("sa-draft", JSON.stringify(draft)); } catch (e) {} }
function loadDraft() { try { const s = localStorage.getItem("sa-draft"); if (s) draft = { ...blankDraft(), ...JSON.parse(s) }; } catch (e) {} }

const raceById = (id) => RAZAS.find((r) => r.id === id);
function raceImg(nameOrId, cls = "rimg") { const r = RAZAS.find((x) => x.id === nameOrId || x.n === nameOrId); return r ? `<img class="${cls}" src="razas/${r.id}.png" alt="" loading="lazy">` : ""; }
function subBonus(r, subName) { const s = r?.subs.find((x) => x[0] === subName); return (s && s[2]) || {}; }

// ===== Cálculos =====
function compute(df = draft) {
  const ra = raceById(df.raza); const rb = df.mestizo ? raceById(df.raza2) : null;
  const bonusRace = ra; // el bono viene de la raza principal
  const b = bonusRace?.b || {};
  const sb = subBonus(ra, df.sub);
  const sinAfin = df.nac === "sin";
  const pointsTotal = 6 + (sinAfin ? 2 : 0) + ATTRS.filter(([k]) => df.alloc[k] < 0).length;
  const spent = ATTRS.reduce((a, [k]) => a + Math.max(0, df.alloc[k]), 0);
  const attrs = {}; for (const [k] of ATTRS) attrs[k] = df.alloc[k] + (b.attrs?.[k] || 0) + (b.choose && df.humanChoice.includes(k) ? 1 : 0);
  const lujuria = b.attrs?.lujuria || 0;
  // PV
  const debRace = df.mestizo ? (df.debDe === "b" ? rb : ra) : ra;
  const pv = 60 + 12 * attrs.defensa + 5 + (b.pv || 0) + (sb.pv || 0) + (debRace?.pvDeb || 0);
  // maná
  const hasAbs = df.afin.some((a) => a.abs);
  let manaMult = 1 + (b.mana || 0) + (sb.mana || 0);
  let mana = 0;
  if (!sinAfin && df.manaRoll != null) { mana = Math.max(50, df.manaRoll); if (hasAbs) mana *= 1.5; mana = Math.floor(mana * manaMult); }
  // dominio
  const dom = df.afin.map((a, i) => {
    let v = i === 0 ? 1 : 0;
    v += (b.dom?.[a.n] || 0) + (sb.dom?.[a.n] || 0) + (a.abs ? sb.domAbs || 0 : 0);
    return { ...a, dominio: v };
  });
  const tf = TRASFONDOS.find((t) => t.n === df.trasfondo);
  return { ra, rb, pointsTotal, spent, left: pointsTotal - spent, attrs, lujuria, pv, mana, hasAbs, dom, tf, afinPts: 2 + (b.afin || 0), sinAfin };
}

// ===== Pasos del asistente =====
const STEPS = ["Concepto", "Raza", "Nacimiento", "Atributos", "Afinidad", "Maná", "Vida y Energía", "Trasfondo", "Motivo y secreto", "Vínculos", "Resumen"];

function dieBtn(action, label) { return `<button type="button" class="die" data-act="${action}" title="Tirar los dados">🎲 ${esc(label)}</button>`; }
function roll(label, value, detail) { return `<div class="roll"><span class="rv">${value}</span><span>${esc(label)}${detail ? ` · <b>${esc(detail)}</b>` : ""}</span></div>`; }

function stepConcept() {
  return `<p class="lead">¿Quién es tu personaje? Una o dos frases bastan.</p>
  <div class="grid2">
    <label class="f">Nombre<input id="f-nombre" value="${esc(draft.nombre)}" maxlength="40" placeholder="Ej.: Kira"></label>
    <label class="f">Edad<input id="f-edad" type="number" min="18" max="999" value="${esc(draft.edad)}"></label>
  </div>
  <div class="card look"><div class="row between"><h3>Apariencia</h3>${dieBtn("look", "Todo al azar")}</div>
    <div class="lookgrid">${LOOK.map(([k, n, opts]) => `<label class="f">${esc(n)}<div class="row"><select data-look="${k}"><option value="">Elige…</option>${opts.map((o) => `<option ${draft.look?.[k] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select><button type="button" class="die small" data-act="look:${k}" title="Tirar">🎲</button></div></label>`).join("")}</div>
    <div class="row between" style="margin-top:6px"><h3>Accesorios <span class="muted">(hasta 4)</span></h3>${dieBtn("acc", "Al azar")}</div>
    <div class="chips">${ACCESORIOS.map((a) => `<button type="button" class="chip ${draft.accesorios?.includes(a) ? "on" : ""}" data-acc="${esc(a)}">${esc(a)}</button>`).join("")}</div>
  </div>
  <label class="f">Otros detalles (opcional)<textarea id="f-apariencia" rows="2" maxlength="300" placeholder="Algo más que quieras contar de su aspecto…">${esc(draft.apariencia)}</textarea></label>
  <label class="f">Personalidad
    <div class="row"><select id="f-personalidad"><option value="">Elige…</option>${PERSONALIDADES.map((p) => `<option ${draft.personalidad === p ? "selected" : ""}>${esc(p)}</option>`).join("")}</select>${dieBtn("pers", "1d12")}</div></label>
  <p class="note">Todos los personajes tienen 18 años o más.</p>`;
}

function raceCard(r, sel) {
  return `<button type="button" class="rc ${sel ? "sel" : ""}" data-raza="${r.id}" aria-pressed="${sel}">${raceImg(r.id, "rimg rc-img")}<b>${esc(r.n)}</b><small>${esc(r.bono)}</small></button>`;
}
function stepRace() {
  const r = raceById(draft.raza);
  let detail = "";
  if (r) {
    detail = `<div class="card">
      <h3>${esc(r.n)}</h3>
      <dl>
        <dt>Bono racial</dt><dd>${esc(r.bono)}</dd>
        <dt>Habilidad</dt><dd>${esc(r.hab)}</dd>
        <dt>Debilidad</dt><dd>${esc(r.deb)}</dd>
        <dt>De dónde</dt><dd>${esc(r.donde)}</dd>
      </dl>
      <label class="f">Sub-raza<div class="row"><select id="f-sub"><option value="">Elige…</option>${r.subs.map(([n, t]) => `<option value="${esc(n)}" ${draft.sub === n ? "selected" : ""}>${esc(n)} — ${esc(t)}</option>`).join("")}</select>${dieBtn("sub", "1d" + r.subs.length)}</div></label>
      ${r.b.choose ? `<div class="f">Elige 2 atributos para tu +1 humano ${dieBtn("hc", "Tirar 2d8")}<div class="chips">${ATTRS.map(([k, n]) => `<button type="button" class="chip ${draft.humanChoice.includes(k) ? "on" : ""}" data-hc="${k}">${esc(n)}</button>`).join("")}</div></div>` : ""}
      <label class="check"><input type="checkbox" id="f-mestizo" ${draft.mestizo ? "checked" : ""}> Es mestizo (hijo de dos razas)</label>
      ${draft.mestizo ? `<div class="grid2">
        <label class="f">Segunda raza (da la habilidad)<select id="f-raza2"><option value="">Elige…</option>${RAZAS.filter((x) => x.id !== r.id).map((x) => `<option value="${x.id}" ${draft.raza2 === x.id ? "selected" : ""}>${esc(x.n)}</option>`).join("")}</select></label>
        <label class="f">Debilidad de<select id="f-debde"><option value="a" ${draft.debDe === "a" ? "selected" : ""}>${esc(r.n)}</option>${draft.raza2 ? `<option value="b" ${draft.debDe === "b" ? "selected" : ""}>${esc(raceById(draft.raza2).n)}</option>` : ""}</select></label>
      </div><p class="note">El mestizo toma el bono de ${esc(r.n)}, la habilidad de la segunda raza y la debilidad que elijas.</p>` : ""}
    </div>`;
  }
  return `<div class="row between"><p class="lead">Elige una de las 16 razas o déjalo a la suerte.</p>${dieBtn("raza", "1d16")}</div>
    <div class="races">${RAZAS.map((x) => raceCard(x, x.id === draft.raza)).join("")}</div>${detail}`;
}

function stepBirth() {
  const row = NACIMIENTO.find((r) => r[2] === draft.nac);
  return `<p class="lead">La tirada de nacimiento decide con cuántas afinidades naces. Aquí no se elige: se tira.</p>
    <table class="tt"><thead><tr><th>d100</th><th>Resultado</th></tr></thead><tbody>${NACIMIENTO.map((r) => `<tr class="${r[2] === draft.nac ? "hit" : ""}"><td>${r[0]}–${r[1]}</td><td>${esc(r[3])}</td></tr>`).join("")}</tbody></table>
    <div class="row">${dieBtn("nac", draft.nac ? "Volver a tirar d100" : "Tirar d100")}</div>
    ${draft.nacRoll ? roll("Sacaste", draft.nacRoll, row?.[3]) : ""}`;
}

function stepAttrs() {
  const c = compute();
  return `<p class="lead">Todos empiezan en 0. Reparte <b>${c.pointsTotal}</b> puntos sin pasar de +3. Puedes bajar hasta dos atributos a −1 para ganar un punto por cada uno.${c.sinAfin ? " Como naciste sin afinidad, tienes 2 puntos extra." : ""} Después se suma el bono de raza.</p>
    <div class="row between"><span class="pill ${c.left === 0 ? "ok" : ""}">Te quedan ${c.left} puntos</span>${dieBtn("attrs", "Repartir al azar")}</div>
    <div class="attrs">${ATTRS.map(([k, n]) => {
      const base = draft.alloc[k]; const tot = c.attrs[k]; const bonus = tot - base;
      return `<div class="attr"><span class="an">${esc(n)}</span>
        <span class="ctrl"><button type="button" data-dec="${k}" aria-label="Bajar ${esc(n)}">−</button><b>${sgn(base)}</b><button type="button" data-inc="${k}" aria-label="Subir ${esc(n)}">+</button></span>
        <span class="at">${bonus ? `<small>raza ${sgn(bonus)}</small>` : ""}<b>${sgn(tot)}</b></span></div>`;
    }).join("")}
    ${c.lujuria ? `<div class="attr"><span class="an">Lujuria (sub-atributo)</span><span></span><span class="at"><small>raza +${c.lujuria}</small><b>+${c.lujuria}</b></span></div>` : ""}</div>`;
}

function stepAffinity() {
  if (!draft.nac) return `<p class="lead">Primero haz la tirada de nacimiento.</p>`;
  if (draft.nac === "sin") return `<p class="lead">Naciste sin afinidad: no tienes poderes propios, pero puedes usar objetos y armas mágicas. El día que consigas una afinidad, tirarás 1d1000 para tu maná.</p>`;
  const need = { una: [false], dos: [false, false], abs: [true], "una+abs": [false, true] }[draft.nac];
  const c = compute();
  return `<p class="lead">Tira un d100 por cada afinidad que te tocó. Si sale una elemental repetida, se vuelve a tirar.</p>
    <div class="grid2">
      <table class="tt"><thead><tr><th>d100</th><th>Elemental</th></tr></thead><tbody>${ELEMENTALES.map((r) => `<tr class="${draft.afin.some((a) => a.n === r[2]) ? "hit" : ""}"><td>${r[0]}–${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>
      <table class="tt"><thead><tr><th>d100</th><th>Abstracta</th></tr></thead><tbody>${ABSTRACTAS.map((r) => `<tr class="${draft.afin.some((a) => a.n === r[2]) ? "hit" : ""}"><td>${r[0]}–${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>
    </div>
    <div class="row">${dieBtn("afin", draft.afin.length ? "Volver a tirar" : `Tirar ${need.length} × d100`)}</div>
    ${c.dom.map((a, i) => `<div class="card mini"><b>${esc(a.n)}</b> ${a.abs ? `<span class="pill abs">Abstracta</span>` : ""} <span class="pill">Dominio ${sgn(a.dominio)}</span>${i === 0 ? ` <span class="pill">Principal</span>` : ""}<br><small>Tirada: ${a.roll} · Sub-afinidades: ${esc(SUBAFIN[a.n])}</small></div>`).join("")}
    ${draft.afin.length ? `<p class="note">Empiezas con el centro del árbol desbloqueado y ${c.afinPts} puntos de afinidad para el anillo núcleo.</p>` : ""}`;
}

function stepMana() {
  const c = compute();
  if (c.sinAfin) return `<p class="lead">Sin afinidad, tu maná es 0. Cuando consigas una afinidad tirarás 1d1000 (mínimo 50).</p>`;
  const parts = [];
  if (draft.manaRoll != null) {
    parts.push(`1d1000 = ${draft.manaRoll}${draft.manaRoll < 50 ? " → mínimo 50" : ""}`);
    if (c.hasAbs) parts.push("× 1.5 por afinidad abstracta");
    const b = c.ra?.b?.mana || 0, sb = subBonus(c.ra, draft.sub).mana || 0;
    if (b + sb) parts.push(`+${Math.round((b + sb) * 100)}% por raza`);
  }
  return `<p class="lead">Tu maná máximo inicial es aleatorio: 1d1000, con un mínimo de 50.</p>
    <div class="row">${dieBtn("mana", draft.manaRoll != null ? "Volver a tirar 1d1000" : "Tirar 1d1000")}</div>
    ${draft.manaRoll != null ? `<div class="big">${c.mana}<small>maná</small></div><p class="note">${esc(parts.join(" · "))}</p>` : ""}`;
}

function stepVida() {
  const c = compute();
  const b = c.ra?.b?.pv || 0, sb = subBonus(c.ra, draft.sub).pv || 0;
  const deb = (draft.mestizo && draft.debDe === "b" ? c.rb : c.ra)?.pvDeb || 0;
  return `<p class="lead">Se calculan solos a partir de tus atributos y tu raza.</p>
    <div class="grid2"><div class="big">${c.pv}<small>PV</small></div><div class="big">10<small>Energía</small></div></div>
    <p class="note">PV = 60 + 12 × Defensa/Resistencia (${sgn(c.attrs.defensa)}) + 5${b ? ` + ${b} por raza` : ""}${sb ? ` + ${sb} por sub-raza` : ""}${deb ? ` ${deb} por debilidad` : ""}.</p>`;
}

function stepTrasfondo() {
  const t = TRASFONDOS.find((x) => x.n === draft.trasfondo);
  return `<div class="row between"><p class="lead">¿De dónde vienes?</p>${dieBtn("tras", "1d12")}</div>
    <div class="races">${TRASFONDOS.map((x) => `<button type="button" class="rc ${x.n === draft.trasfondo ? "sel" : ""}" data-tras="${esc(x.n)}"><b>${esc(x.n)}</b><small>${esc(x.hab)}</small></button>`).join("")}</div>
    ${t ? `<div class="card"><h3>${esc(t.n)}</h3><dl><dt>Habilidad</dt><dd>${esc(t.hab)}</dd><dt>Objetos</dt><dd>${esc(t.obj.join(", "))}</dd><dt>Dinero</dt><dd>${t.soles} Soles (+10 que recibe todo el mundo)</dd><dt>Contacto</dt><dd>${esc(t.contacto)}</dd></dl>
      <label class="f">Arma básica (la reciben todos)<select id="f-arma">${ARMAS.map((a) => `<option value="${esc(a)}" ${a === draft.arma ? "selected" : ""}>${esc(a)} · Poder ${ARMAS_INFO[a][0]}</option>`).join("")}</select>${dieBtn("arma", "Al azar")}
        <span class="note">${(ARMAS_INFO[draft.arma]?.[1] || []).map((t) => esc(RASGO_ARMA[t])).join(" · ") || "Sin rasgos especiales"}</span></label></div>` : ""}`;
}

function stepMotivo() {
  return `<p class="lead">Solo tú y la IA verán esto. La IA lo usa para personalizar tu historia.</p>
    <label class="f">¿Por qué quieres subir la Escalera del Alba?
      <div class="row"><select data-preset="motivo"><option value="">Elige uno ya hecho… o escribe el tuyo abajo</option>${MOTIVOS.map((m) => `<option ${draft.motivo === m ? "selected" : ""}>${esc(m)}</option>`).join("")}</select>${dieBtn("motivo", "Al azar")}</div>
      <textarea id="f-motivo" rows="3" maxlength="500" placeholder="Ej.: Quiero el deseo de la Cumbre para encontrar a mi madre.">${esc(draft.motivo)}</textarea></label>
    <label class="f">Un secreto de tu personaje
      <div class="row"><select data-preset="secreto"><option value="">Elige uno ya hecho… o escribe el tuyo abajo</option>${SECRETOS.map((m) => `<option ${draft.secreto === m ? "selected" : ""}>${esc(m)}</option>`).join("")}</select>${dieBtn("secreto", "Al azar")}</div>
      <textarea id="f-secreto" rows="3" maxlength="500" placeholder="Ej.: Robé la beca con la que entré a la academia.">${esc(draft.secreto)}</textarea></label>`;
}

function stepVinculos() {
  const others = Store.others();
  const rows = others.map((o) => {
    const v = draft.vinculos.find((x) => x.id === o.id) || {};
    return `<div class="card mini"><div class="row between"><b>${esc(o.nombre)}</b><small>${esc(o.raza)}${o.sub ? " · " + esc(o.sub) : ""}</small></div>
      <div class="row"><select data-vrel="${o.id}"><option value="">¿Qué relación tienen?</option>${RELACIONES.map((r) => `<option ${v.rel === r ? "selected" : ""}>${esc(r)}</option>`).join("")}</select>${dieBtn("vrel:" + o.id, "1d6")}</div>
      ${v.rel && Store.sample ? `<div class="row"><button type="button" class="btn ghost small" data-vstory="${o.id}">${v.story ? "Reescribir" : "Escribir"} la historia con IA</button></div>` : ""}
      ${v.story ? `<p class="story">${esc(v.story)}</p>` : ""}</div>`;
  }).join("");
  return `<p class="lead">Elige un profesor con quien empiezas en vínculo +1, y tu relación con los personajes de los demás jugadores.</p>
    <label class="f">Profesor<div class="row"><select id="f-profe"><option value="">Elige…</option>${PROFESORES.map(([n, r]) => `<option value="${esc(n)}" ${draft.profesor === n ? "selected" : ""}>${esc(n)} — ${esc(r)}</option>`).join("")}</select>${dieBtn("profe", "1d7")}</div></label>
    <h3 class="sub">Personajes de otros jugadores</h3>
    ${rows || `<p class="note">Todavía no hay personajes de otros jugadores en esta partida. Cuando se unan, puedes volver a editar tus vínculos desde tu ficha.</p>`}
    ${others.length ? `<div class="row">${dieBtn("vall", "Tirar todas las relaciones")}</div>` : ""}`;
}

function missing() {
  const m = [];
  if (!draft.nombre.trim()) m.push("nombre");
  if (!(draft.edad >= 18)) m.push("edad (18 o más)");
  if (!draft.raza) m.push("raza");
  if (draft.raza && !draft.sub) m.push("sub-raza");
  if (draft.mestizo && !draft.raza2) m.push("segunda raza");
  if (raceById(draft.raza)?.b.choose && draft.humanChoice.length !== 2) m.push("los 2 atributos humanos");
  if (!draft.nac) m.push("tirada de nacimiento");
  if (draft.nac && draft.nac !== "sin" && !draft.afin.length) m.push("tirada de afinidad");
  if (draft.nac && draft.nac !== "sin" && draft.manaRoll == null) m.push("tirada de maná");
  if (compute().left !== 0) m.push("repartir todos los puntos de atributo");
  if (!draft.trasfondo) m.push("trasfondo");
  return m;
}

function stepResumen() {
  const ch = buildChar();
  const m = missing();
  return `${m.length ? `<div class="warn">Falta: ${esc(m.join(", "))}.</div>` : `<p class="lead">Así queda tu personaje. Puedes volver a cualquier paso antes de guardarlo.</p>`}
    ${sheetHTML(ch, { secreto: draft.secreto, motivo: draft.motivo }, true)}
    <div class="row"><button type="button" class="btn primary" id="save" ${m.length ? "disabled" : ""}>${draft.editId ? "Guardar cambios" : "Crear y guardar personaje"}</button></div>`;
}

const STEP_FN = [stepConcept, stepRace, stepBirth, stepAttrs, stepAffinity, stepMana, stepVida, stepTrasfondo, stepMotivo, stepVinculos, stepResumen];

// ===== Construir la ficha =====
function lookText(df) {
  const L = df.look || {}; const p = [];
  if (L.pelo_tipo || L.pelo_color) p.push(`pelo ${[L.pelo_tipo, L.pelo_color].filter(Boolean).join(" ").toLowerCase()}`);
  if (L.ojos) p.push(`ojos ${L.ojos.toLowerCase()}`);
  if (L.piel) p.push(`piel ${L.piel.toLowerCase()}`);
  if (L.altura || L.complexion) p.push([L.altura, L.complexion].filter(Boolean).join(", ").toLowerCase());
  if (L.ropa) p.push(`${L.ropa.toLowerCase()}${L.ropa_color ? ` (${L.ropa_color.toLowerCase()})` : ""}`);
  if (L.rasgo && L.rasgo !== "Ninguno") p.push(L.rasgo.toLowerCase());
  if (L.voz) p.push(`voz ${L.voz.toLowerCase()}`);
  if (df.accesorios?.length) p.push(`lleva ${df.accesorios.join(", ").toLowerCase()}`);
  if (df.apariencia?.trim()) p.push(df.apariencia.trim());
  const t = p.join("; "); return t ? t[0].toUpperCase() + t.slice(1) : "";
}
function buildChar() {
  const c = compute();
  const t = c.tf;
  return {
    id: draft.editId || "c" + rid(), createdAt: draft.createdAt || Date.now(),
    nombre: draft.nombre.trim(), edad: +draft.edad, apariencia: draft.apariencia, descripcion: lookText(draft), look: { ...(draft.look || {}) }, accesorios: [...(draft.accesorios || [])], hpv: 2, personalidad: draft.personalidad,
    raza: c.ra?.n || "", sub: draft.sub, mestizo: draft.mestizo ? (c.rb?.n || "") : "",
    bonoRacial: c.ra?.bono || "", habilidad: (draft.mestizo ? c.rb?.hab : c.ra?.hab) || "", debilidad: ((draft.mestizo && draft.debDe === "b" ? c.rb : c.ra)?.deb) || "",
    subTexto: c.ra?.subs.find((s) => s[0] === draft.sub)?.[1] || "",
    nacimiento: NACIMIENTO.find((r) => r[2] === draft.nac)?.[3] || "", nacRoll: draft.nacRoll || null,
    atributos: c.attrs, lujuria: c.lujuria,
    nivel: 1, xp: 0, rango: "E · Iniciado", peldano: "Chispa",
    rayos: { poder: t?.rayos?.poder || 0, saber: 0, corazon: 0, fama: 0 },
    pv: c.pv, pvMax: c.pv, energia: 10, energiaMax: 10, estres: 0, mana: c.mana, manaMax: c.mana, creditos: 0,
    dinero: { soles: 10 + (t?.soles || 0), lunas: 0, estrellas: 0 },
    afinidades: c.dom.map((a) => ({ n: a.n, abs: !!a.abs, dominio: a.dominio })), puntosAfinidad: c.afinPts,
    hechizos: t?.n === "Aprendiz de mago" ? ["Un hechizo de Círculo 1 extra (por elegir)"] : [],
    trasfondo: t?.n || "", habTrasfondo: t?.hab || "", contacto: t?.contacto || "",
    equipo: [draft.arma, ...EQUIPO_BASE, ...(t?.obj || [])],
    vinculos: [...(draft.profesor ? [{ nombre: draft.profesor, valor: 1, tipo: "Profesor" }] : []), ...draft.vinculos.filter((v) => v.rel).map((v) => ({ nombre: v.nombre, id: v.id, tipo: "Jugador", rel: v.rel, story: v.story || "" }))],
    estados: [],
    draft: JSON.parse(JSON.stringify({ ...draft, motivo: "", secreto: "" })),
  };
}

function sheetHTML(ch, priv, preview) {
  const owner = ch.owner && Store.user && ch.owner !== Store.uid ? profileName(ch.owner) : "";
  return `<article class="sheet">
    <header class="sh-head"><div class="sh-who">${raceImg(ch.raza, "rimg sh-img")}<div><h2>${esc(ch.nombre || "Sin nombre")}</h2>
      <p>${esc(ch.raza)}${ch.sub ? " · " + esc(ch.sub) : ""}${ch.mestizo ? " · mestizo con " + esc(ch.mestizo) : ""} · ${esc(ch.edad)} años · ${esc(ch.trasfondo || "sin trasfondo")}${owner ? ` · jugador: ${esc(owner)}` : ""}</p>
      ${ch.personalidad ? `<p class="muted">${esc(ch.personalidad)}${ch.apariencia ? " · " + esc(ch.apariencia) : ""}</p>` : ""}</div></div>
      <div class="badges"><span class="pill">Nivel ${ch.nivel}</span><span class="pill">Rango ${esc(ch.rango)}</span><span class="pill">Peldaño ${esc(ch.peldano)}</span></div></header>
    <div class="sh-grid">
      <section><h3>Atributos</h3><div class="stats">${ATTRS.map(([k, n]) => `<div class="st"><b>${sgn(ch.atributos[k] || 0)}</b><small>${esc(n)}</small></div>`).join("")}${ch.lujuria ? `<div class="st"><b>+${ch.lujuria}</b><small>Lujuria</small></div>` : ""}</div></section>
      <section><h3>Recursos</h3><div class="res">
        <div><span>PV</span><b>${ch.pv} / ${ch.pvMax}</b></div><div><span>Energía</span><b>${ch.energia} / ${ch.energiaMax}</b></div>
        <div><span>Maná</span><b>${ch.mana} / ${ch.manaMax}</b></div><div><span>Estrés</span><b>${ch.estres} / 10</b></div>
        <div><span>XP</span><b>${ch.xp}</b></div><div><span>Dinero</span><b>${ch.dinero.soles} Soles</b></div></div></section>
      ${ch.look && Object.keys(ch.look).length || ch.accesorios?.length ? `<section class="wide"><h3>Apariencia</h3><dl class="lookdl">${LOOK.filter(([k]) => ch.look?.[k]).map(([k, n]) => `<dt>${esc(n)}</dt><dd>${esc(ch.look[k])}</dd>`).join("")}${ch.accesorios?.length ? `<dt>Accesorios</dt><dd>${esc(ch.accesorios.join(", "))}</dd>` : ""}</dl></section>` : ""}
      <section><h3>Raza</h3><dl><dt>Bono</dt><dd>${esc(ch.bonoRacial)}</dd><dt>Habilidad</dt><dd>${esc(ch.habilidad)}</dd><dt>Debilidad</dt><dd>${esc(ch.debilidad)}</dd>${ch.subTexto ? `<dt>Sub-raza</dt><dd>${esc(ch.subTexto)}</dd>` : ""}</dl></section>
      <section><h3>Magia</h3>${ch.afinidades.length ? ch.afinidades.map((a) => `<div class="afi"><b>${esc(a.n)}</b>${a.abs ? ` <span class="pill abs">Abstracta</span>` : ""}<span class="pill">Dominio ${sgn(a.dominio)}</span></div>`).join("") + `<p class="muted">${ch.puntosAfinidad} puntos de afinidad por gastar</p>` : `<p class="muted">Sin afinidad (${esc(ch.nacimiento)})</p>`}${ch.hechizos.length ? `<p>${esc(ch.hechizos.join(", "))}</p>` : ""}</section>
      <section><h3>Escalera del Alba</h3><div class="res"><div><span>Poder</span><b>${ch.rayos.poder}</b></div><div><span>Saber</span><b>${ch.rayos.saber}</b></div><div><span>Corazón</span><b>${ch.rayos.corazon}</b></div><div><span>Fama</span><b>${ch.rayos.fama}</b></div></div></section>
      <section><h3>Trasfondo</h3><dl><dt>Habilidad</dt><dd>${esc(ch.habTrasfondo)}</dd><dt>Contacto</dt><dd>${esc(ch.contacto)}</dd></dl></section>
      <section class="wide"><h3>Equipo</h3><p>${esc(ch.equipo.join(" · "))}</p></section>
      <section class="wide"><h3>Vínculos</h3>${ch.vinculos.length ? ch.vinculos.map((v) => `<p><b>${esc(v.nombre)}</b> · ${esc(v.tipo)}${v.valor ? ` · vínculo ${sgn(v.valor)}` : ""}${v.rel ? ` · ${esc(v.rel)}` : ""}${v.story ? `<br><span class="muted">${esc(v.story)}</span>` : ""}</p>`).join("") : `<p class="muted">Sin vínculos todavía.</p>`}</section>
      ${priv && (priv.motivo || priv.secreto) ? `<section class="wide private"><h3>🔒 Privado (solo tú y la IA)</h3>${priv.motivo ? `<p><b>Motivo:</b> ${esc(priv.motivo)}</p>` : ""}${priv.secreto ? `<p><b>Secreto:</b> ${esc(priv.secreto)}</p>` : ""}</section>` : ""}
    </div></article>`;
}

// ===== Vistas =====
let view = { name: "home", id: null, confirmDel: false };
let profileCache = {};
function profileName(uid) { return profileCache[uid]?.name || "otro jugador"; }
async function refreshProfiles() {
  if (!Store.user) return;
  const ids = [...new Set(Store.all.map((c) => c.owner))];
  if (!ids.length) return;
  try { profileCache = await Store.user.profiles(ids); render(); } catch (e) {}
}

function homeView() {
  const mine = Store.mine(), others = Store.others();
  const card = (c, own) => `<div class="ccw"><button type="button" class="cc" data-open="${c.id}">
      ${raceImg(c.raza, "rimg cc-img")}<b>${esc(c.nombre)}</b><small>${esc(c.raza)}${c.sub ? " · " + esc(c.sub) : ""} · ${esc(c.trasfondo)}</small>
      <span>${c.afinidades.map((a) => esc(a.n)).join(" + ") || "Sin afinidad"} · Nivel ${c.nivel}${own ? "" : ` · ${esc(profileName(c.owner))}`}</span>
      ${c.g?.loc ? `<span>📍 ${esc(P[c.g.loc.r]?.[c.g.loc.p]?.n || "")} · día ${c.g.day}</span>` : ""}</button>
      ${own ? `<button type="button" class="btn primary small play" data-play="${c.id}">${c.g ? "▶ Continuar" : "▶ Jugar"}</button>` : ""}</div>`;
  const act = Store.mine().find((c) => c.id === activeId());
  return `${act ? `<section class="panel hero-cta"><div class="row between"><div><h3>Última partida</h3><b class="big2">${esc(act.nombre)}</b> <span class="muted">nivel ${act.nivel}${act.g?.loc ? " · " + esc(P[act.g.loc.r]?.[act.g.loc.p]?.n || "") : ""}</span></div><button type="button" class="btn primary" data-play="${act.id}">▶ Continuar la aventura</button></div></section>` : ""}
    <section class="panel">
      <div class="row between"><h2>Mis personajes</h2><div class="row"><button type="button" class="btn ghost" id="import">Importar</button><button type="button" class="btn primary" id="new">Crear personaje</button></div></div>
      ${mine.length ? `<div class="cards">${mine.map((c) => card(c, true)).join("")}</div>` : `<p class="muted">Todavía no tienes personajes. Crea el primero: son 10 pasos y cualquiera se puede dejar a la suerte.</p>`}
      ${draft.step > 0 && !draft.editId ? `<p class="note">Tienes un personaje a medias. <button type="button" class="link" id="resume">Seguir donde lo dejaste</button></p>` : ""}
    </section>
    <section class="panel"><h2>Personajes del grupo</h2>
      ${others.length ? `<div class="cards">${others.map((c) => card(c, false)).join("")}</div>` : `<p class="muted">Cuando tus amigos creen sus personajes en esta partida, aparecerán aquí.</p>`}
    </section>
    <input type="file" id="file" accept="application/json,.json" hidden>`;
}

function wizardView() {
  const s = draft.step;
  return `<section class="panel wiz">
    <div class="row between"><button type="button" class="link" id="home">← Mis personajes</button><span class="muted">Paso ${s + 1} de ${STEPS.length}</span></div>
    <ol class="steps">${STEPS.map((n, i) => `<li><button type="button" data-step="${i}" class="${i === s ? "cur" : ""} ${i < s ? "done" : ""}">${i + 1}. ${esc(n)}</button></li>`).join("")}</ol>
    <h2>${s + 1}. ${esc(STEPS[s])}</h2>
    <div class="stepbody">${STEP_FN[s]()}</div>
    <div class="row between nav"><button type="button" class="btn ghost" id="prev" ${s === 0 ? "disabled" : ""}>Anterior</button>${s < STEPS.length - 1 ? `<button type="button" class="btn primary" id="next">Siguiente</button>` : ""}</div>
  </section>`;
}

function charView() {
  const ch = Store.all.find((c) => c.id === view.id);
  if (!ch) { view = { name: "home" }; return homeView(); }
  const own = ch.owner === Store.uid;
  return `<section class="panel"><div class="row between"><button type="button" class="link" id="home">← Mis personajes</button>
    ${own ? `<div class="row"><button type="button" class="btn primary" data-play="${ch.id}">▶ Jugar con ${esc(ch.nombre)}</button><button type="button" class="btn ghost" id="edit">Editar</button>${Store.downloads ? `<button type="button" class="btn ghost" id="export">Descargar copia</button>` : ""}${view.confirmDel ? `<span class="warn inline">¿Borrar a ${esc(ch.nombre)} para siempre?</span><button type="button" class="btn danger" id="delyes">Sí, borrar</button><button type="button" class="btn ghost" id="delno">Cancelar</button>` : `<button type="button" class="btn danger" id="del">Borrar</button>`}</div>` : ""}</div>
    ${sheetHTML(ch, own ? Store.priv[ch.id] : null)}</section>`;
}

function render() {
  const main = $("#main");
  const active = document.activeElement; const fid = active && active.id; const ss = active?.selectionStart, se = active?.selectionEnd;
  main.innerHTML = view.name === "game" ? gameView() : view.name === "wizard" ? wizardView() : view.name === "char" ? charView() : homeView();
  document.body.classList.toggle("ingame", view.name === "game");
  $("#mode").textContent = Store.mode === "claude" ? "Guardado en línea" : "Guardado solo en este navegador";
  if (fid) { const el = document.getElementById(fid); if (el) { el.focus(); try { if (ss != null) el.setSelectionRange(ss, se); } catch (e) {} } }
}
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3500); }

// ===== Dados =====
function act(a) {
  if (a === "pers") { const v = d(12); draft.personalidad = PERSONALIDADES[v - 1]; toast(`1d12 = ${v}: ${draft.personalidad}`); }
  if (a === "raza") { const v = d(16); const r = RAZAS[v - 1]; draft.raza = r.id; draft.sub = ""; draft.humanChoice = []; toast(`1d16 = ${v}: ${r.n}`); }
  if (a === "sub") { const r = raceById(draft.raza); const v = d(r.subs.length); draft.sub = r.subs[v - 1][0]; toast(`1d${r.subs.length} = ${v}: ${draft.sub}`); }
  if (a === "nac") { const v = d(100); draft.nacRoll = v; draft.nac = inRange(NACIMIENTO, v)[2]; draft.afin = []; draft.manaRoll = null; toast(`d100 = ${v}`); }
  if (a === "afin") {
    const need = { una: [false], dos: [false, false], abs: [true], "una+abs": [false, true] }[draft.nac] || [];
    const out = [];
    for (const abs of need) {
      let v, n; do { v = d(100); n = inRange(abs ? ABSTRACTAS : ELEMENTALES, v)[2]; } while (out.some((o) => o.n === n));
      out.push({ n, abs, roll: v });
    }
    draft.afin = out; toast(out.map((o) => `${o.roll} → ${o.n}`).join(" · "));
  }
  if (a === "mana") { draft.manaRoll = d(1000); toast(`1d1000 = ${draft.manaRoll}`); }
  if (a === "attrs") {
    const c = compute(); const total = 6 + (c.sinAfin ? 2 : 0);
    draft.alloc = Object.fromEntries(ATTRS.map(([k]) => [k, 0]));
    let left = total; let guard = 0;
    while (left > 0 && guard++ < 500) { const k = ATTRS[d(8) - 1][0]; if (draft.alloc[k] < 3) { draft.alloc[k]++; left--; } }
    toast("Puntos repartidos al azar");
  }
  if (a === "hc") { const ks = []; while (ks.length < 2) { const k = ATTRS[d(8) - 1][0]; if (!ks.includes(k)) ks.push(k); } draft.humanChoice = ks; toast(`+1 humano: ${ks.map((k) => ATTR_NAME[k]).join(" y ")}`); }
  if (a === "look") { draft.look = Object.fromEntries(LOOK.map(([k, , o]) => [k, o[d(o.length) - 1]])); const n = 1 + d(3); draft.accesorios = []; while (draft.accesorios.length < n) { const x = ACCESORIOS[d(ACCESORIOS.length) - 1]; if (!draft.accesorios.includes(x)) draft.accesorios.push(x); } toast("Apariencia al azar"); }
  if (a.startsWith("look:")) { const k = a.slice(5); const o = LOOK.find((x) => x[0] === k)[2]; draft.look = { ...(draft.look || {}), [k]: o[d(o.length) - 1] }; }
  if (a === "acc") { const n = 1 + d(3); draft.accesorios = []; while (draft.accesorios.length < n) { const x = ACCESORIOS[d(ACCESORIOS.length) - 1]; if (!draft.accesorios.includes(x)) draft.accesorios.push(x); } }
  if (a === "motivo") { draft.motivo = MOTIVOS[d(MOTIVOS.length) - 1]; }
  if (a === "secreto") { draft.secreto = SECRETOS[d(SECRETOS.length) - 1]; }
  if (a === "arma") { draft.arma = ARMAS[d(ARMAS.length) - 1]; toast(`Arma: ${draft.arma}`); }
  if (a === "tras") { const v = d(12); draft.trasfondo = TRASFONDOS[v - 1].n; toast(`1d12 = ${v}: ${draft.trasfondo}`); }
  if (a === "profe") { const v = d(7); draft.profesor = PROFESORES[v - 1][0]; toast(`1d7 = ${v}: ${draft.profesor}`); }
  if (a.startsWith("vrel:") || a === "vall") {
    const ids = a === "vall" ? Store.others().map((o) => o.id) : [a.slice(5)];
    for (const id of ids) { const o = Store.others().find((x) => x.id === id); const v = d(6); setVinc(id, { nombre: o.nombre, rel: RELACIONES[v - 1], story: "" }); }
    toast("Relaciones tiradas");
  }
  saveDraft(); render();
}
function setVinc(id, patch) {
  const i = draft.vinculos.findIndex((x) => x.id === id);
  if (i < 0) draft.vinculos.push({ id, ...patch }); else draft.vinculos[i] = { ...draft.vinculos[i], ...patch };
}

async function writeStory(id) {
  const o = Store.others().find((x) => x.id === id); const v = draft.vinculos.find((x) => x.id === id);
  if (!o || !v || !Store.sample) return;
  const c = compute();
  const prompt = `Escribe en español, en 2 o 3 frases, cómo nació la relación entre dos personajes de un juego de rol de fantasía (Solvaria, Sunrise Academy). Tono cercano, concreto, sin títulos.
Personaje A: ${draft.nombre || "sin nombre"}, ${c.ra?.n || ""} ${draft.sub || ""}, trasfondo: ${draft.trasfondo || "desconocido"}, personalidad: ${draft.personalidad || "—"}.
Personaje B: ${o.nombre}, ${o.raza} ${o.sub || ""}, trasfondo: ${o.trasfondo || "desconocido"}, personalidad: ${o.personalidad || "—"}.
Relación: ${v.rel}.`;
  toast("La IA está escribiendo…");
  try { const { text } = await Store.sample(prompt, { modelTier: "quick", cache: false }); setVinc(id, { story: text.trim().slice(0, 600) }); saveDraft(); render(); }
  catch (e) { toast(e?.code === "not_granted" ? "Sin permiso para usar la IA." : "La IA no respondió. Inténtalo otra vez."); }
}

// ===== Eventos =====
document.addEventListener("click", async (ev) => {
  const t = ev.target.closest("button"); if (!t) return;
  if (t.dataset.act) return act(t.dataset.act);
  if (t.dataset.raza) { if (draft.raza !== t.dataset.raza) { draft.raza = t.dataset.raza; draft.sub = ""; draft.humanChoice = []; draft.raza2 = ""; } saveDraft(); return render(); }
  if (t.dataset.hc) { const k = t.dataset.hc; draft.humanChoice = draft.humanChoice.includes(k) ? draft.humanChoice.filter((x) => x !== k) : [...draft.humanChoice, k].slice(-2); saveDraft(); return render(); }
  if (t.dataset.inc) { const k = t.dataset.inc; if (draft.alloc[k] < 3 && compute().left > 0) draft.alloc[k]++; saveDraft(); return render(); }
  if (t.dataset.dec) { const k = t.dataset.dec; const negs = ATTRS.filter(([x]) => draft.alloc[x] < 0).length; if (draft.alloc[k] > 0 || (draft.alloc[k] === 0 && negs < 2)) draft.alloc[k]--; saveDraft(); return render(); }
  if (t.dataset.acc) { const x = t.dataset.acc; const l = draft.accesorios || []; draft.accesorios = l.includes(x) ? l.filter((y) => y !== x) : [...l, x].slice(-4); saveDraft(); return render(); }
  if (t.dataset.tras) { draft.trasfondo = t.dataset.tras; saveDraft(); return render(); }
  if (t.dataset.step) { draft.step = +t.dataset.step; saveDraft(); return render(); }
  if (t.dataset.vstory) return writeStory(t.dataset.vstory);
  if (t.dataset.open) { view = { name: "char", id: t.dataset.open }; return render(); }
  if (t.dataset.play) { window.scrollTo({ top: 0 }); return startGame(t.dataset.play); }
  switch (t.id) {
    case "new": draft = blankDraft(); saveDraft(); view = { name: "wizard" }; return render();
    case "resume": view = { name: "wizard" }; return render();
    case "home": if (view.name === "game") { G = null; setActive(""); } view = { name: "home" }; window.scrollTo({ top: 0 }); return render();
    case "prev": draft.step = Math.max(0, draft.step - 1); saveDraft(); return render();
    case "next": draft.step = Math.min(STEPS.length - 1, draft.step + 1); saveDraft(); window.scrollTo({ top: 0, behavior: "smooth" }); return render();
    case "save": {
      if (missing().length) return;
      let ch = buildChar(); t.disabled = true;
      const prev = Store.all.find((c) => c.id === ch.id);
      if (prev?.g) { // ya ha jugado: la edición cambia la presentación, no el progreso
        const keep = ["nivel", "xp", "rango", "peldano", "rayos", "pv", "pvMax", "mana", "manaMax", "energia", "energiaMax", "estres", "dinero", "atributos", "afinidades", "puntosAfinidad", "hechizos", "equipo", "vinculos", "g"];
        ch = { ...ch, ...Object.fromEntries(keep.filter((k) => k in prev).map((k) => [k, prev[k]])) };
      }
      try { await Store.saveChar(ch, { motivo: draft.motivo, secreto: draft.secreto }); draft = blankDraft(); saveDraft(); view = { name: "char", id: ch.id }; toast(`${ch.nombre} está guardado.`); }
      catch (e) { toast("No se pudo guardar. Revisa que tengas permiso para editar esta partida."); t.disabled = false; }
      return render();
    }
    case "edit": {
      const ch = Store.all.find((c) => c.id === view.id); if (!ch) return;
      const p = Store.priv[ch.id] || {};
      draft = { ...blankDraft(), ...(ch.draft || {}), motivo: p.motivo || "", secreto: p.secreto || "", editId: ch.id, createdAt: ch.createdAt, step: 0 };
      view = { name: "wizard" }; saveDraft(); return render();
    }
    case "del": view.confirmDel = true; return render();
    case "delno": view.confirmDel = false; return render();
    case "delyes": { const ch = Store.all.find((c) => c.id === view.id); await Store.deleteChar(view.id); view = { name: "home" }; toast(`${ch?.nombre || "El personaje"} fue borrado.`); return render(); }
    case "export": return exportChar(view.id);
    case "import": $("#file").click(); return;
  }
});
async function exportChar(id) {
      const ch = (G && G.id === id ? G : null) || Store.all.find((c) => c.id === id); if (!ch || !Store.downloads) return;
      const payload = JSON.stringify({ tipo: "sunrise-academy-personaje", version: 1, ficha: ch, privado: Store.priv[ch.id] || {} }, null, 2);
      try { const r = await Store.downloads.save({ filename: `${ch.nombre.replace(/[^\p{L}\p{N}_-]+/gu, "_")}.sunrise.json`, data: payload }); if (r?.status === "saved") toast("Copia descargada."); }
      catch (e) { if (e?.code !== "cancelled") toast("No se pudo descargar la copia."); }
}
document.addEventListener("input", (ev) => {
  const t = ev.target; const map = { "f-nombre": "nombre", "f-apariencia": "apariencia", "f-motivo": "motivo", "f-secreto": "secreto" };
  if (map[t.id]) { draft[map[t.id]] = t.value; saveDraft(); }
  if (t.id === "f-edad") { draft.edad = +t.value; saveDraft(); }
});
document.addEventListener("change", async (ev) => {
  const t = ev.target;
  if (view.name === "game") return;
  if (t.matches("textarea, input:not([type]), input[type=text], input[type=number]")) return;
  if (t.id === "f-personalidad") draft.personalidad = t.value;
  if (t.id === "f-sub") draft.sub = t.value;
  if (t.id === "f-mestizo") { draft.mestizo = t.checked; if (!t.checked) { draft.raza2 = ""; draft.debDe = "a"; } }
  if (t.id === "f-raza2") draft.raza2 = t.value;
  if (t.id === "f-debde") draft.debDe = t.value;
  if (t.id === "f-arma") draft.arma = t.value;
  if (t.dataset.look) draft.look = { ...(draft.look || {}), [t.dataset.look]: t.value };
  if (t.dataset.preset && t.value) draft[t.dataset.preset] = t.value;
  if (t.id === "f-profe") draft.profesor = t.value;
  if (t.dataset.vrel) { const o = Store.others().find((x) => x.id === t.dataset.vrel); setVinc(t.dataset.vrel, { nombre: o?.nombre || "", rel: t.value, story: "" }); }
  if (t.id === "file" && t.files?.[0]) {
    try {
      const data = JSON.parse(await t.files[0].text());
      if (data?.tipo !== "sunrise-academy-personaje" || !data.ficha?.nombre) throw new Error("formato");
      const ch = { ...data.ficha, id: "c" + rid(), createdAt: Date.now() }; delete ch.owner;
      await Store.saveChar(ch, data.privado || {});
      view = { name: "char", id: ch.id }; toast(`${ch.nombre} fue importado.`);
    } catch (e) { toast("Ese archivo no es un personaje de Sunrise Academy."); }
    t.value = "";
  }
  if (t.id !== "file") saveDraft();
  render();
});

// ===== Arranque ===== (espera a que carguen todos los scripts: game.js va después)
window.addEventListener("DOMContentLoaded", () => {
loadDraft();
let lastRender = 0, renderQueued = false;
Store.onChange(() => {
  // En el juego, G es la copia de trabajo: no se pisa con la instantánea.
  if (view.name === "game" && document.activeElement?.id === "g-free") return; // no interrumpir mientras escribe
  render(); refreshProfiles();
});
render();
Store.init().then(() => {
  const a = activeId();
  if (a && Store.mine().some((c) => c.id === a) && view.name === "home") startGame(a);
  else render();
  refreshProfiles();
});
});
