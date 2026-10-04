// =====================================================================
// evo.js — Evolución de armas por ramas + forja hasta +10
//   · Arma +10 → Evolucionar en una forja grande (Gremio de Capitalia o Forjaroja)
//   · 3 ramas: ⚔️ Rompedora (fuerza) · 🔥 Elemental (afinidad + estados) · 💨 Veloz (iniciativa + golpes extra)
//   · 3 etapas ★ / ★★ / ★★★ ; la rama queda fija al primer ★. Cada evolución vuelve a +0.
//   · Requisitos: arma +10, nivel, Soles y 🔮 Núcleos de evolución (jefes, mazmorras, grupo, se busca…)
// Nombres: "Espada ★ Rompedora", "Espada ★★ Ígnea +3", "Katana ★★★ Veloz".
// Se carga después de menus.js.
// =====================================================================
(function () {
  if (typeof WEAPONS === "undefined") return;
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const escx = (s) => (typeof esc === "function" ? esc(s) : String(s ?? ""));
  const CORE = "Núcleo de evolución";
  const MAXUP = 10;
  const STARS = ["", "★", "★★", "★★★"];
  // rama Elemental: adjetivo por afinidad
  const ELEM = { Fuego: "Ígnea", Agua: "Glacial", Tierra: "Pétrea", Aire: "Ventosa", Rayo: "Tronante", Luz: "Radiante", Sombra: "Umbría" };
  const ELEM_INV = Object.fromEntries(Object.entries(ELEM).map(([a, n]) => [n, a]));
  const ELEM_ST = { Fuego: "Quemado", Agua: "Aturdido", Tierra: "Aturdido", Aire: "Asustado", Rayo: "Aturdido", Luz: "Cegado", Sombra: "Asustado" };
  const BR = {
    rom: { n: "Rompedora", ic: "⚔️", f: 1.1, t: [["critica"], ["critica", "aturde"], ["critica", "aturde"]],
      d: () => [Lx("Más poder · críticos más fáciles", "More power · easier crits"), Lx("+ aturde al golpear (25%)", "+ stuns (25%)"), Lx("+ rompe la defensa del enemigo", "+ ignores enemy defense")] },
    ele: { n: "Elemental", ic: "🔥", f: 1.05, t: [[], [], ["critica"]],
      d: () => [Lx("Gana afinidad · 20% de causar un estado", "Gains affinity · 20% status"), Lx("Estado al 30%", "Status 30%"), Lx("Estado al 40% · críticos más fáciles", "Status 40% · easier crits")] },
    vel: { n: "Veloz", ic: "💨", f: 1.05, t: [["alcance"], ["alcance", "doble"], ["alcance", "doble"]],
      d: () => [Lx("+2 iniciativa (atacas antes)", "+2 initiative"), Lx("+ segundo golpe en cada ataque", "+ double hit"), Lx("+ 25% de tercer golpe", "+ 25% third hit")] },
  };
  const NEED = [null, { lvl: 10, cores: 1, soles: 1500 }, { lvl: 22, cores: 2, soles: 5000 }, { lvl: 35, cores: 4, soles: 12000 }];
  const EVO_FORGES = { "cap:1": "Gremio de herreros", "quem:0": "Ignara" };

  const UP = /^(.*) \+(\d+)$/;
  const EVO = /^(.+?) (★{1,3}) (\S+)$/;
  const plusOf = (n) => +(UP.exec(n)?.[2] || 0);
  const noPlus = (n) => UP.exec(n)?.[1] || n;
  const step = (b) => Math.max(2, Math.round(b * 0.08));
  const p10 = (b) => b + MAXUP * step(b);

  // { orig, tier, br, aff } de un nombre (con o sin +k)
  function info(n) {
    const b = noPlus(String(n || "")); const m = EVO.exec(b);
    if (!m) return { orig: b, tier: 0, br: null, aff: WEAPON_AFF[b] || null, base: b };
    const word = m[3]; const tier = m[2].length;
    const br = word === BR.rom.n ? "rom" : word === BR.vel.n ? "vel" : ELEM_INV[word] ? "ele" : null;
    if (!br) return { orig: b, tier: 0, br: null, aff: WEAPON_AFF[b] || null, base: b };
    return { orig: m[1], tier, br, aff: br === "ele" ? ELEM_INV[word] : WEAPON_AFF[m[1]] || null, base: b };
  }
  function evoName(orig, tier, br, aff) { return `${orig} ${STARS[tier]} ${br === "ele" ? ELEM[aff] : BR[br].n}`; }
  function basePower(orig, tier, br) {
    let b = WEAPONS[orig]; if (b == null) return null; const s0 = step(b);
    for (let t = 1; t <= tier; t++) b = Math.round((b + MAXUP * s0) * BR[br].f);
    return b;
  }
  // registra el arma evolucionada (y su +k) en WEAPONS / rasgos / afinidad
  function ensure(n) {
    if (!n) return;
    const i = info(n); if (!i.tier) return;
    if (WEAPONS[i.orig] == null) return;
    if (WEAPONS[i.base] == null) {
      WEAPONS[i.base] = basePower(i.orig, i.tier, i.br);
      const tr = new Set([...(WEAPON_TRAITS[i.orig] || []), ...BR[i.br].t[i.tier - 1]]);
      WEAPON_TRAITS[i.base] = [...tr];
      if (i.aff) WEAPON_AFF[i.base] = i.aff;
    }
    const k = plusOf(n);
    if (k && WEAPONS[n] == null) { WEAPONS[n] = WEAPONS[i.base] + k * step(WEAPONS[i.orig]); WEAPON_TRAITS[n] = WEAPON_TRAITS[i.base]; if (WEAPON_AFF[i.base]) WEAPON_AFF[n] = WEAPON_AFF[i.base]; }
  }
  function ensureMine() {
    try {
      if (!G?.g) return;
      ensure(G.g.arma?.n); (G.g.armas || []).forEach(ensure); Object.keys(G.g.bank?.armas || {}).forEach(ensure);
      if (G.g.arma && WEAPONS[G.g.arma.n] != null && G.g.arma.poder !== WEAPONS[G.g.arma.n]) G.g.arma.poder = WEAPONS[G.g.arma.n];
    } catch (e) {}
  }
  window.SA_EVO = { ensure, info, CORE, ELEM, BR, NEED, evoName, basePower };

  // ---------------------------------------------------------------
  // Evolucionar
  // ---------------------------------------------------------------
  const hereK = () => `${G.g.loc.r}:${G.g.loc.p}`;
  function check(n) {
    const i = info(n); const next = i.tier + 1;
    if (next > 3) return { max: true, i };
    const need = NEED[next]; const k = plusOf(n);
    const have = G.g.inv[CORE] || 0;
    const ok = { plus: k >= MAXUP, lvl: G.nivel >= need.lvl, cores: have >= need.cores, soles: (G.dinero?.soles || 0) >= need.soles };
    return { i, next, need, k, have, ok, all: ok.plus && ok.lvl && ok.cores && ok.soles };
  }
  function evolve(br, aff) {
    if (!G?.g || G.g.combat || !EVO_FORGES[hereK()]) return;
    const n = G.g.arma.n; const c = check(n); if (c.max || !c.all) return toast(Lx("Todavía no cumples los requisitos.", "Requirements not met."));
    const i = c.i; const b = i.tier ? i.br : br; if (!BR[b]) return;
    let a = i.tier ? i.aff : b === "ele" ? (i.aff || aff) : i.aff;
    if (b === "ele" && !ELEM[a]) return toast(Lx("Elige un elemento.", "Pick an element."));
    const nn = evoName(i.orig, c.next, b, a); ensure(nn);
    G.dinero.soles -= c.need.soles; addItem(CORE, -c.need.cores);
    const old = n; G.g.arma = { n: nn, poder: WEAPONS[nn] };
    try { if (typeof sfx === "function") sfx("crit"); } catch (e) {}
    try { log(`Tu ${old} evolucionó a ${nn} (Poder ${WEAPONS[nn]}).`); } catch (e) {}
    flash(nn);
    if (typeof persist === "function") persist(); render();
  }
  function flash(nn) {
    try {
      const el = document.createElement("div"); el.className = "sa-evofx";
      el.innerHTML = `<div class="in"><i></i><b>✨ ${Lx("¡Evolución!", "Evolution!")}</b><span>${escx(nn)}</span><small>${Lx("Poder", "Power")} ${WEAPONS[nn]}</small></div>`;
      document.body.appendChild(el); setTimeout(() => el.classList.add("out"), 2300); setTimeout(() => el.remove(), 2900);
      el.addEventListener("click", () => el.remove());
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // Tarjeta en la forja
  // ---------------------------------------------------------------
  function evoBox() {
    const who = EVO_FORGES[hereK()]; if (!who || !G.g.arma) return "";
    const n = G.g.arma.n; ensure(n); const c = check(n); const i = c.i;
    const head = `<b>${window.SAI?.img ? window.SAI.img("act/evolucionar", "✨") : "✨"} ${Lx("Evolución de armas", "Weapon evolution")} · ${escx(who)}</b>`;
    if (c.max) return `<div class="card mini forge sa-evo">${head}<p>${escx(n)} ${Lx("ya está en su forma final ★★★. ¡Sigue mejorándola hasta +10!", "is at its final form.")}</p></div>`;
    const tick = (b) => (b ? "✅" : "▫️");
    const req = `<ul class="sa-req">
      <li>${tick(c.ok.plus)} ${Lx("Arma a", "Weapon at")} +${MAXUP} <small>(${Lx("ahora", "now")} +${c.k})</small></li>
      <li>${tick(c.ok.lvl)} ${Lx("Nivel", "Level")} ${c.need.lvl} <small>(${Lx("tienes", "you")} ${G.nivel})</small></li>
      <li>${tick(c.ok.cores)} ${c.need.cores}× 🔮 ${CORE} <small>(${Lx("tienes", "you")} ${c.have})</small></li>
      <li>${tick(c.ok.soles)} ${c.need.soles} Soles</li></ul>`;
    const pw = (b) => basePower(i.orig, c.next, b);
    let choices;
    if (i.tier) {
      const b = i.br; const nn = evoName(i.orig, c.next, b, i.aff);
      choices = `<div class="sa-brs one"><div class="sa-br on b-${b}"><em>${BR[b].ic}</em><b>${escx(nn)}</b><small>${Lx("Poder", "Power")} ${pw(b)} (+0)</small><span>${BR[b].d()[c.next - 1]}</span>
        <button type="button" class="btn small primary" data-saevo="${b}" ${c.all ? "" : "disabled"}>✨ ${Lx("Evolucionar", "Evolve")} ${STARS[c.next]}</button></div></div>`;
    } else {
      const eleAff = i.aff; const pick = gsel.saEvoAff || (G.afinidades || []).find((a) => ELEM[a]) || "Fuego";
      choices = `<div class="sa-brs">${["rom", "ele", "vel"].map((b) => {
        const a = b === "ele" ? eleAff || pick : null;
        const nn = evoName(i.orig, 1, b, a);
        return `<div class="sa-br b-${b}"><em>${BR[b].ic}</em><b>${escx(nn)}</b><small>${Lx("Poder", "Power")} ${pw(b)} (+0)</small><span>${BR[b].d()[0]}</span>
          ${b === "ele" && !eleAff ? `<div class="sa-els">${Object.keys(ELEM).map((x) => `<button type="button" class="chip ${x === pick ? "on" : ""}" data-saevoaff="${x}" title="${x}">${(typeof AFF_ICON !== "undefined" && AFF_ICON[x]) || x}</button>`).join("")}</div>` : b === "ele" ? `<small class="muted">${Lx("Usa la afinidad de tu arma", "Uses your weapon's affinity")}: ${escx(eleAff)}</small>` : ""}
          <button type="button" class="btn small primary" data-saevo="${b}" ${a ? `data-saevoa="${a}"` : ""} ${c.all ? "" : "disabled"}>${Lx("Elegir", "Choose")} ${BR[b].ic}</button></div>`;
      }).join("")}</div><p class="note">${Lx("La rama que elijas queda para siempre en esta arma. Al evolucionar vuelve a +0, pero con mucho más poder.", "Your branch is permanent. The weapon goes back to +0 but much stronger.")}</p>`;
    }
    return `<div class="card mini forge sa-evo">${head}<p>${escx(n)} <b>(${Lx("Poder", "Power")} ${G.g.arma.poder})</b> ${i.tier ? `<span class="sa-stars">${STARS[i.tier]}</span>` : ""}</p>${req}${choices}</div>`;
  }
  if (typeof placeView === "function") {
    const _pv = placeView;
    placeView = function () {
      const out = _pv.apply(this, arguments);
      try { if (G?.g && !G.g.combat) { ensureMine(); return out + evoBox(); } } catch (e) { console.warn("evo:", e); }
      return out;
    };
  }

  // ---------------------------------------------------------------
  // Efectos en combate
  // ---------------------------------------------------------------
  if (typeof pAttack === "function") {
    const _pa = pAttack;
    pAttack = function (ti, spell) {
      const c = G?.g?.combat; const e = c?.enemies?.[ti];
      if (!c || !e || spell) return _pa.apply(this, arguments);
      const i = info(G.g.arma?.n); const before = e.pv; let def = null;
      if (i.br === "rom" && i.tier >= 3) { def = e.def; e.def = 0; }
      const r = _pa.apply(this, arguments);
      if (def != null) e.def = def;
      try {
        if (G.g.combat !== c || !i.tier || e.pv >= before || e.pv <= 0) return r;
        if (i.br === "ele" && i.aff) {
          const ch = [0, 0.2, 0.3, 0.4][i.tier]; const st = ELEM_ST[i.aff];
          if (st && Math.random() < ch) { e.st = e.st || {}; e.st[st] = st === "Aturdido" ? 1 : 2; clog(`${(typeof AFF_ICON !== "undefined" && AFF_ICON[i.aff]) || "✨"} ${G.g.arma.n}: ${e.n} queda ${st.toLowerCase()}.`); }
        }
        if (i.br === "vel" && i.tier >= 3 && Math.random() < 0.25) {
          const d3 = Math.max(1, Math.round((G.g.arma.poder || 0) * 0.4)); e.pv = Math.max(0, e.pv - d3); clog(`💨 ${Lx("¡Tercer golpe!", "Third hit!")} ${d3} de daño.`);
        }
      } catch (x) {}
      return r;
    };
  }

  // ---------------------------------------------------------------
  // Núcleos de evolución: dónde salen
  // ---------------------------------------------------------------
  const BOSSK = ["boss", "story", "corrupt", "avatar", "world"];
  if (typeof victory === "function") {
    const _v = victory;
    victory = function () {
      const c = G?.g?.combat; const kind = c?.kind; const raid = !!c?.raid; const boss = c?.enemies?.some((e) => e.boss); const lv = Math.max(0, ...(c?.enemies || []).map((e) => e.lvl || 0));
      const r = _v.apply(this, arguments);
      try {
        if (!c || ["arena", "duel", "pvp"].includes(kind)) return r;
        let n = 0;
        if (BOSSK.includes(kind) || boss) n = 1;
        else if (kind === "dun" || raid) n = Math.random() < 0.35 ? 1 : 0;
        else n = Math.random() < (lv >= 20 ? 0.06 : 0.03) ? 1 : 0;
        if (n) {
          addItem(CORE, n);
          const b = G.g.lastBattle || G.g.lastResult; const line = `🔮 ${Lx("¡Encontraste", "Found")} ${n}× ${CORE}!`;
          if (b) b.lines = [...(b.lines || []), line]; else toast(line);
          if (typeof persist === "function") persist(); render();
        }
      } catch (e) { console.warn("evo core:", e); }
      return r;
    };
  }
  if (typeof turnIn === "function") {
    const _t = turnIn;
    turnIn = function (id) {
      const q = G?.g?.quests?.find((x) => x.id === id); const had = !!q;
      const r = _t.apply(this, arguments);
      try { if (had && q.type === "buscado" && !G.g.quests.some((x) => x.id === id)) { addItem(CORE, 1); toast(`🔮 +1 ${CORE}`); persist(); render(); } } catch (e) {}
      return r;
    };
  }

  // ---------------------------------------------------------------
  // Dibujado y clics
  // ---------------------------------------------------------------
  const _r = render;
  render = function () {
    ensureMine();
    const o = _r.apply(this, arguments);
    try {
      document.querySelectorAll(`.bcell[data-uiitem="${CORE}"] > span`).forEach((s) => { if (!s.dataset.evo && !s.querySelector("img")) { s.dataset.evo = "1"; s.textContent = "🔮"; } });
      document.querySelectorAll(".bcell.c-armas").forEach((c) => { const t = info(c.dataset.uiitem).tier; if (t) { c.classList.add("sa-evo" + t); if (!c.querySelector(".sa-st3")) c.insertAdjacentHTML("beforeend", `<b class="sa-st3">${STARS[t]}</b>`); } });
    } catch (e) {}
    return o;
  };
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest?.("[data-saevoaff]"); if (a) { gsel.saEvoAff = a.dataset.saevoaff; render(); return; }
    const b = ev.target.closest?.("[data-saevo]"); if (b && !b.disabled) { evolve(b.dataset.saevo, b.dataset.saevoa); }
  });

  // ---------------------------------------------------------------
  // Estilos
  // ---------------------------------------------------------------
  const css = document.createElement("style"); css.id = "sa-evo";
  css.textContent = `
.sa-evo{border-color:#b56cff66!important;background:radial-gradient(120% 80% at 0% 0%,#b56cff1c,transparent 60%),var(--panel-2)!important}
.sa-evo>b .sai{width:30px;height:30px;border-radius:50%;vertical-align:middle;margin-right:4px}
.sa-evo .sa-stars{color:#ffd98a;letter-spacing:2px;text-shadow:0 0 8px #ffd98a88}
.sa-req{list-style:none;margin:6px 0 10px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:4px 12px;font-size:14px}
.sa-req small{color:var(--muted)}
.sa-brs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.sa-brs.one{grid-template-columns:minmax(0,420px)}
.sa-br{display:flex;flex-direction:column;gap:4px;padding:10px;border:1px solid #ffffff18;border-radius:3px;background:#0b131c99;min-width:0}
.sa-br em{font-style:normal;font-size:24px}.sa-br b{font-family:var(--display);font-size:14px;color:#ffe9b8;overflow-wrap:anywhere}
.sa-br small{color:var(--ink-2)}.sa-br span{font-size:13px;flex:1}
.sa-br.b-rom{border-color:#e0735c66;background:linear-gradient(180deg,#e0735c14,#0b131c99)}
.sa-br.b-ele{border-color:#ffa53a66;background:linear-gradient(180deg,#ffa53a14,#0b131c99)}
.sa-br.b-vel{border-color:#6fd2a666;background:linear-gradient(180deg,#6fd2a614,#0b131c99)}
.sa-br .btn{align-self:flex-start;margin-top:4px}
.sa-els{display:flex;flex-wrap:wrap;gap:4px}.sa-els .chip{padding:2px 6px;font-size:15px;min-width:0}
@media (max-width:640px){.sa-brs{grid-template-columns:1fr}}
.bcell .sa-st3{position:absolute;left:2px;bottom:1px;font-size:9px;color:#ffd98a;text-shadow:0 0 4px #000,0 0 6px #ffd98a;letter-spacing:-1px;z-index:2}
.bcell.sa-evo1{box-shadow:0 0 8px #b56cff66,inset 0 0 8px #b56cff44}
.bcell.sa-evo2{box-shadow:0 0 10px #ffa53a77,inset 0 0 10px #ffa53a44}
.bcell.sa-evo3{box-shadow:0 0 14px #ffd98aaa,inset 0 0 12px #ffd98a55;animation:saEvoP 2s ease-in-out infinite}
@keyframes saEvoP{50%{box-shadow:0 0 22px #ffd98add,inset 0 0 16px #ffd98a77}}
.sa-evofx{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:radial-gradient(circle,#b56cff44,#000c 70%);animation:saFade .3s ease both;cursor:pointer}
.sa-evofx.out{opacity:0;transition:opacity .5s}
.sa-evofx .in{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:26px 34px;text-align:center;animation:saEvoIn .7s cubic-bezier(.2,1.4,.4,1) both}
.sa-evofx .in i{position:absolute;inset:-60px;border-radius:50%;background:conic-gradient(from 0deg,#ffd98a00,#ffd98a66,#b56cff66,#ffd98a00);animation:saSpin 3s linear infinite;filter:blur(8px);z-index:-1}
.sa-evofx b{font-family:var(--display);font-size:30px;color:#ffe9b8;text-shadow:0 0 18px #ffd98a}
.sa-evofx span{font-family:var(--display);font-size:20px;color:#fff}
.sa-evofx small{color:#ffd98a;font-size:16px}
@keyframes saEvoIn{from{transform:scale(.3);opacity:0}}
@keyframes saFade{from{opacity:0}}
@keyframes saSpin{to{transform:rotate(360deg)}}
`;
  document.head.appendChild(css);
})();
