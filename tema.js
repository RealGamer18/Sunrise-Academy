// =====================================================================
// tema.js — Tema "Fantasía oscura + diegético"
//   · Paneles de acero oscuro con marcos rúnicos
//   · HUD con orbes de vida y maná
//   · Panel de personaje unificado (equipo + stats + estados)
//   · Inventario con cintas de rareza y orden automático
//   · Diario de misiones (pergamino), mapa con notas y objetivo
//   · Rueda radial de acciones/hechizos en combate (teléfono)
// Se carga el último (después de iconos.js).
// =====================================================================
(function () {
  if (typeof gameView !== "function") return;
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const escx = (s) => (typeof esc === "function" ? esc(s) : String(s ?? ""));
  const RAR_ORDER = { l: 0, e: 1, r: 2, c: 3 };
  const RAR_NM = () => ({ c: Lx("Común", "Common"), r: Lx("Raro", "Rare"), e: Lx("Épico", "Epic"), l: Lx("Legendario", "Legendary") });

  // ---------------------------------------------------------------
  // Rareza de cualquier objeto
  // ---------------------------------------------------------------
  function rarOf(n, cat) {
    try {
      const W = window.SA_EXTRA?.WEAR || {};
      if (W[n]?.r) return W[n].r;
      if (n === "Núcleo de evolución") return "l";
      const ev = window.SA_EVO?.info(n)?.tier || 0; if (ev >= 2) return "l"; if (ev === 1) return "e";
      if (cat === "armas" || (typeof WEAPONS !== "undefined" && WEAPONS[n] != null && cat !== "material")) {
        const p = (typeof WEAPONS !== "undefined" && WEAPONS[n]) || 0;
        return p >= 60 ? "l" : p >= 35 ? "e" : p >= 20 ? "r" : "c";
      }
      const s = typeof SHOP !== "undefined" ? SHOP.find((x) => x.n === n) : null;
      if (s) { const pr = s.precio || 0; return pr >= 500 ? "l" : pr >= 150 ? "e" : pr >= 40 ? "r" : "c"; }
      if (typeof ATTR_ITEMS !== "undefined" && ATTR_ITEMS[n]) return "e";
      if (/drag[oó]n|f[eé]nix|Lágrima|estrella|tiempo|divin|antigu/i.test(n)) return "e";
      if (/Esencia|Corazón|Fragmento|Cristal|Perla|Rubí|Obsidiana|Pluma|Escama|Seda/i.test(n)) return "r";
    } catch (e) {}
    return "c";
  }

  // ---------------------------------------------------------------
  // HUD: orbes
  // ---------------------------------------------------------------
  function orbify(out) {
    return out.replace(/<span class="m m-(pv|mn)">(<em>[\s\S]*?<\/em>)\s*([^<\d]*?)\s*(\d+)\s*\/\s*(\d+)\s*<span class="bar (?:pv|mn)"><i style="width:([\d.]+)%"><\/i><\/span><\/span>/g,
      (m, k, em, lb, v, mx, pct) => `<span class="m m-${k} orb orb-${k}" style="--f:${Math.max(0, Math.min(100, +pct))}" title="${escx(lb.trim())} ${v}/${mx}"><i class="orb-glass"><i class="orb-liq"></i><i class="orb-shine"></i><i class="orb-val"><b>${v}</b><small>/${mx}</small></i></i><i class="orb-lb">${em}${escx(lb.trim())}</i></span>`);
  }

  // ---------------------------------------------------------------
  // Combate: rueda radial
  // ---------------------------------------------------------------
  function wheelify(out) {
    out = out.replace(/<div class="cmdgrid main">([\s\S]*?)<\/div>/, (m, inner) => {
      const n = (inner.match(/class="cbtn/g) || []).length; let i = 0;
      inner = inner.replace(/<button type="button" class="cbtn/g, () => `<button type="button" style="--i:${i++};--n:${n}" class="cbtn`);
      return `<div class="cmdgrid main sa-wheel">${inner}</div>`;
    });
    out = out.replace(/<div class="cmdgrid">((?:\s*<button type="button" class="cbtn spell[\s\S]*?<\/button>)+)\s*<\/div>/, (m, inner) => {
      const n = (inner.match(/class="cbtn spell/g) || []).length; if (n < 1 || n > 8) return m;
      let i = 1;
      inner = inner.replace(/<button type="button" class="cbtn spell/g, () => `<button type="button" style="--i:${i++};--n:${n + 1}" class="cbtn spell`);
      return `<div class="cmdgrid sa-wheel spells"><button type="button" class="cbtn sa-hub" style="--i:0;--n:${n + 1}" data-bm="main"><b>↩</b><small>${Lx("Volver", "Back")}</small></button>${inner}</div>`;
    });
    return out;
  }

  const _gv = gameView;
  gameView = function () {
    let out = _gv.apply(this, arguments);
    try { if (G?.g) { out = orbify(out); if (G.g.combat) out = wheelify(out); } } catch (e) { console.warn("tema:", e); }
    return out;
  };

  // ---------------------------------------------------------------
  // Panel de personaje unificado
  // ---------------------------------------------------------------
  function statuses() {
    const s = [];
    try {
      const g = G.g;
      if (g.food && g.food.left > 0) s.push([(window.SAI && window.SAI.obj(g.food.n, "🍲")) || "🍲", escx(g.food.n), Lx(`${g.food.left} combates`, `${g.food.left} fights`), "good"]);
      if (g.oil && g.oil.left > 0) s.push([(window.SAI && window.SAI.obj(g.oil.n, g.oil.ic || "🛢️")) || g.oil.ic || "🛢️", escx(g.oil.n), Lx(`${g.oil.left} combates`, `${g.oil.left} fights`), "good"]);
      if (g.mascota) s.push([(window.SAI && window.SAI.pet(g.mascota)) || "🐾", escx(g.mascota), Lx("Mascota contigo", "Pet with you"), "good"]);
      if (g.montura) s.push([(window.SAI && window.SAI.pet(g.montura)) || "🐎", escx(g.montura), Lx("Montura", "Mount"), "good"]);
      const esc2 = g.quests?.find((q) => q.type === "escolta" && !q.done); if (esc2) s.push([esc2.wi || "🧑", escx(esc2.who), Lx("Escoltando", "Escorting"), ""]);
      if (typeof weatherFor === "function" && typeof CLIMAS !== "undefined") { const w = weatherFor(g.loc.r, g.day); s.push([(window.SAI && window.SAI.wx(w, CLIMAS[w]?.icon)) || CLIMAS[w]?.icon || "☁", escx(w), Lx("Clima", "Weather"), ""]); }
      if (G.pv < G.pvMax * 0.3) s.push(["🩸", Lx("Herido", "Wounded"), Lx("Cúrate o descansa", "Heal or rest"), "bad"]);
      if (G.energia <= 0) s.push(["😴", Lx("Agotado", "Exhausted"), Lx("Descansa en una posada", "Rest at an inn"), "bad"]);
      if (G.estres >= 7) s.push(["😵", Lx("Estresado", "Stressed"), `${G.estres}/10`, "bad"]);
      if (g.puntosAtributo) s.push(["⬆️", Lx("Puntos libres", "Free points"), `${g.puntosAtributo}`, "good"]);
    } catch (e) {}
    return s;
  }
  if (typeof heroView === "function") {
    const _hv = heroView;
    heroView = function () {
      const out = _hv.apply(this, arguments);
      try {
        if (!G?.g || typeof bagView !== "function") return out;
        const t = document.createElement("template"); t.innerHTML = out;
        const hs = t.content.querySelector(".herosum");
        const bt = document.createElement("template"); bt.innerHTML = bagView();
        const doll = bt.content.querySelector(".doll");
        if (!hs || !doll) return out;
        hs.remove();
        const st = statuses();
        const stHtml = `<div class="sa-status"><h3>✦ ${Lx("Estados activos", "Active effects")}</h3>${st.length ? `<div class="sa-stl">${st.map(([ic, n, d, k]) => `<span class="sa-st ${k}"><em>${ic}</em><b>${n}</b><small>${d}</small></span>`).join("")}</div>` : `<p class="muted">${Lx("Ningún efecto ahora mismo.", "No effects right now.")}</p>`}</div>`;
        const dash = `<div class="sa-dash"><div class="sa-dl"><div class="sa-cap">⚔ ${Lx("Equipo", "Equipment")} <small>${Lx("toca una ranura para cambiarla", "tap a slot to change it")}</small></div>${doll.outerHTML}</div><div class="sa-dr">${hs.outerHTML}${stHtml}</div></div>`;
        const tmp = document.createElement("div"); tmp.appendChild(t.content.cloneNode(true));
        return dash + tmp.innerHTML;
      } catch (e) { console.warn("tema hero:", e); return out; }
    };
  }

  // ---------------------------------------------------------------
  // Después de dibujar
  // ---------------------------------------------------------------
  function bagPost() {
    const grid = document.querySelector(".bgrid"); if (!grid) return;
    const cells = [...grid.querySelectorAll(".bcell")];
    for (const c of cells) {
      if (!/\br-[cerl]\b/.test(c.className)) { const cat = (c.className.match(/\bc-(\w+)/) || [])[1]; c.classList.add("r-" + rarOf(c.dataset.uiitem || "", cat)); }
      const r = (c.className.match(/\br-([cerl])\b/) || [])[1]; c.dataset.rar = r;
      if (!c.querySelector(".sa-rib")) c.insertAdjacentHTML("afterbegin", `<i class="sa-rib" title="${RAR_NM()[r]}"></i>`);
    }
    const mode = gsel.saSort || "tipo";
    if (mode !== "tipo") {
      const empties = [...grid.querySelectorAll(".bempty")];
      const sorted = cells.slice().sort((a, b) => (mode === "rar" ? RAR_ORDER[a.dataset.rar] - RAR_ORDER[b.dataset.rar] : 0) || (a.title || "").localeCompare(b.title || ""));
      sorted.forEach((c) => grid.appendChild(c)); empties.forEach((e) => grid.appendChild(e));
    }
    const cats = document.querySelector(".bcats");
    if (cats && !document.querySelector(".sa-sort")) {
      const nm = RAR_NM();
      cats.insertAdjacentHTML("afterend", `<div class="sa-sort"><span>${Lx("Ordenar", "Sort")}:</span>${[["tipo", Lx("Tipo", "Type")], ["rar", Lx("Rareza", "Rarity")], ["nom", Lx("Nombre", "Name")]].map(([k, lb]) => `<button type="button" class="chip ${mode === k ? "on" : ""}" data-sasort="${k}">${lb}</button>`).join("")}<span class="sa-leg">${["c", "r", "e", "l"].map((k) => `<i class="lg r-${k}"></i>${nm[k]}`).join(" ")}</span></div>`);
    }
    // rareza en la ficha del objeto
    const det = document.querySelector(".bdet.open");
    const sel = gsel.uiSel?.item;
    if (det && sel && !det.querySelector(".rar")) {
      const cell = grid.querySelector(`.bcell[data-uiitem="${CSS.escape(sel)}"]`); const r = cell?.dataset.rar;
      if (r) det.querySelector(".bdh b")?.insertAdjacentHTML("afterend", `<small class="rar r-${r}">${RAR_NM()[r]}</small>`);
    }
  }

  function goalKey() {
    try {
      const S = window.SA_STORY; if (!S) return null;
      const st = S.stepsOf(S.cap())[S.step()]; if (st && st.r != null) return `${st.r}:${st.p}`;
    } catch (e) {}
    const b = document.querySelector(".qtrack:not(.fq) [data-go]"); return b ? b.dataset.go : null;
  }
  const NS = "http://www.w3.org/2000/svg";
  function mapPost() {
    const svg = document.querySelector(".minimap svg"); if (!svg) return;
    const notes = G.g.mapNotes || {};
    const goal = goalKey();
    svg.querySelectorAll("g.gpin").forEach((g) => {
      const k = g.dataset.pin; const c = g.querySelector("circle"); if (!c) return;
      const cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy");
      if (k === goal && !g.querySelector(".sa-ring")) {
        g.classList.add("sa-goal");
        const r = document.createElementNS(NS, "circle"); r.setAttribute("class", "sa-ring"); r.setAttribute("cx", cx); r.setAttribute("cy", cy); r.setAttribute("r", 24); g.insertBefore(r, g.firstChild);
      }
      if (notes[k] && !g.querySelector(".sa-pn")) {
        const n = document.createElementNS(NS, "g"); n.setAttribute("class", "sa-pn");
        n.innerHTML = `<rect x="${cx + 9}" y="${cy - 34}" width="22" height="22" rx="3"></rect><text x="${cx + 20}" y="${cy - 18}" text-anchor="middle">📌</text>`;
        g.appendChild(n);
        const t = g.querySelector("title"); if (t && !t.textContent.includes("📌")) t.textContent += ` · 📌 ${notes[k]}`;
      }
    });
    const wrap = document.querySelector(".mapwrap");
    if (wrap && !document.querySelector(".sa-notes")) {
      const pins = [...svg.querySelectorAll("g.gpin")].map((g) => [g.dataset.pin, g.getAttribute("aria-label") || g.dataset.pin]);
      const here = `${G.g.loc.r}:${G.g.loc.p}`;
      const list = Object.entries(notes);
      const name = (k) => (pins.find(([p]) => p === k) || [k, k])[1];
      wrap.insertAdjacentHTML("afterend", `<div class="sa-notes"><div class="sa-nh"><b>📜 ${Lx("Notas del mapa", "Map notes")}</b><small>${Lx("Apunta lo que quieras en un lugar; saldrá un 📌 en el mapa.", "Pin a note to a place; it shows as 📌 on the map.")}</small></div>
        <div class="sa-nf"><select id="sa-np">${pins.map(([k, n]) => `<option value="${escx(k)}" ${k === here ? "selected" : ""}>${escx(n)}</option>`).join("")}</select><input id="sa-nt" maxlength="80" placeholder="${Lx("Ej.: aquí sale el lobo raro", "e.g. rare wolf here")}"><button type="button" class="btn small primary" data-sanote="add">📌 ${Lx("Clavar", "Pin")}</button></div>
        ${goal ? `<div class="sa-ngoal">🎯 ${Lx("Objetivo de la historia", "Story goal")}: <b>${escx(name(goal))}</b> <small>${Lx("(anillo rojo en el mapa)", "(red ring on the map)")}</small></div>` : ""}
        ${list.length ? `<ul class="sa-nl">${list.map(([k, t]) => `<li><b>📌 ${escx(name(k))}</b><span>${escx(t)}</span><button type="button" class="link" data-sanote="del|${escx(k)}" aria-label="${Lx("Quitar", "Remove")}">✕</button></li>`).join("")}</ul>` : ""}</div>`);
    }
  }

  function post() {
    if (!G?.g) return;
    document.body.classList.add("sa-theme");
    if (G.g.combat) return;
    if (gtab === "bolsa") bagPost();
    if (gtab === "mapa") mapPost();
  }

  const _r = render;
  render = function () {
    const o = _r.apply(this, arguments);
    try { post(); } catch (e) { console.warn("tema post:", e); }
    return o;
  };

  // ---------------------------------------------------------------
  // Clics
  // ---------------------------------------------------------------
  document.addEventListener("click", (ev) => {
    const s = ev.target.closest?.("[data-sasort]");
    if (s) { gsel.saSort = s.dataset.sasort; render(); return; }
    const n = ev.target.closest?.("[data-sanote]");
    if (n) {
      const v = n.dataset.sanote; G.g.mapNotes = G.g.mapNotes || {};
      if (v === "add") { const k = document.getElementById("sa-np")?.value; const t = (document.getElementById("sa-nt")?.value || "").trim(); if (!k || !t) return; G.g.mapNotes[k] = t.slice(0, 80); }
      else if (v.startsWith("del|")) delete G.g.mapNotes[v.slice(4)];
      if (typeof persist === "function") persist(); render(); return;
    }
  });
  // En la pestaña Personaje, una ranura del muñeco abre la Bolsa con esa ranura elegida
  document.addEventListener("click", (ev) => {
    const sl = ev.target.closest?.(".sa-dash [data-uislot]");
    if (sl && typeof gtab !== "undefined") { gtab = "bolsa"; setTimeout(() => { if (gtab === "bolsa" && document.querySelector("section.panel")?.dataset.tab !== "bolsa") { render(); scrollTo({ top: 0, behavior: "smooth" }); } }, 60); }
  }, true);
  document.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && ev.target?.id === "sa-nt") document.querySelector('[data-sanote="add"]')?.click(); });

  window.SA_TEMA = { rarOf };

  // ---------------------------------------------------------------
  // Estilos
  // ---------------------------------------------------------------
  const FRAME = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23d9a441'%3E%3Cpath d='M1.5 22V1.5H22M50 1.5H70.5V22M70.5 50V70.5H50M22 70.5H1.5V50' stroke-width='1.6'/%3E%3Cpath d='M1.5 22V50M22 1.5H50M70.5 22V50M22 70.5H50' stroke-opacity='.3'/%3E%3Cpath d='M5 26V5H26M46 5H67V26M67 46V67H46M26 67H5V46' stroke-opacity='.35'/%3E%3C/g%3E%3Cg fill='%23d9a441'%3E%3Cpath d='M10 6l4 4-4 4-4-4z'/%3E%3Cpath d='M62 6l4 4-4 4-4-4z'/%3E%3Cpath d='M62 58l4 4-4 4-4-4z'/%3E%3Cpath d='M10 58l4 4-4 4-4-4z'/%3E%3C/g%3E%3C/svg%3E")`;
  const css = document.createElement("style"); css.id = "sa-tema";
  css.textContent = `
/* ================= BASE: acero oscuro + runas ================= */
body.sa-theme{--steel1:#151d28;--steel2:#0c1219;--rune:#d9a441;--ink-dark:#2b1d0e;--parch1:#f2e4c0;--parch2:#dcc690;--parch3:#c4a66c;
  --rc:#9aa3ad;--rr:#4aa3ff;--re:#b56cff;--rl:#ffa53a;
  background:radial-gradient(1200px 600px at 50% -10%,#1b2738 0%,transparent 60%),radial-gradient(900px 500px at 100% 100%,#1a1424 0%,transparent 60%),#080c12}
.sa-theme .hud,.sa-theme section.panel,.sa-theme .sa-dash>div{border:1px solid transparent;border-image:${FRAME} 22 / 22px / 0 stretch;border-radius:3px;
  background:repeating-linear-gradient(90deg,#ffffff04 0 1px,transparent 1px 4px),linear-gradient(180deg,var(--steel1),var(--steel2));box-shadow:0 14px 34px #000a,inset 0 1px 0 #ffffff0a}
.sa-theme section.panel{padding:18px}
.sa-theme .gtabs{border-radius:3px;border:1px solid #d9a44133;background:linear-gradient(180deg,#121a24ee,#0a0f15ee);box-shadow:0 6px 20px #0008,inset 0 0 0 1px #00000088}
.sa-theme .gtabs button{font-family:var(--display);letter-spacing:.06em;border-radius:2px}
.sa-theme .gtabs button+button::before{content:"";position:absolute;left:-4px;top:50%;width:5px;height:5px;transform:translateY(-50%) rotate(45deg);background:#d9a44144}
.sa-theme .gtabs button.on{background:linear-gradient(180deg,#d9a4412e,#d9a4410a);clip-path:polygon(8px 0,calc(100% - 8px) 0,100% 50%,calc(100% - 8px) 100%,8px 100%,0 50%)}
.sa-theme .card,.sa-theme .lsec{border-radius:3px}
.sa-theme h3{color:#d9b56a}
.sa-theme .btn.primary{background:linear-gradient(180deg,#2f6a55,#1d4a3a);border-color:#6fd2a6;box-shadow:inset 0 1px 0 #ffffff22,0 2px 8px #0008}

/* ================= HUD con orbes ================= */
.sa-theme .hud{gap:16px}
.sa-theme .hud .meters{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"pv en mn" "pv es mn" "pv so mn";gap:6px 14px;align-items:center;justify-items:stretch}
.sa-theme .hud .meters .m{min-width:0}
.sa-theme .hud .m-pv{grid-area:pv}.sa-theme .hud .m-mn{grid-area:mn}.sa-theme .hud .m-en{grid-area:en}.sa-theme .hud .m-es{grid-area:es}.sa-theme .hud .m-so{grid-area:so}
.sa-theme .hud .m-en,.sa-theme .hud .m-es,.sa-theme .hud .m-so{padding:5px 10px!important;border-radius:2px!important;background:linear-gradient(90deg,#0b131ccc,#0b131c55)!important;border:1px solid #ffffff10!important;border-left:2px solid #d9a44166!important;display:grid!important;grid-template-columns:auto 1fr;align-items:center;column-gap:7px;row-gap:3px;font-size:13px;text-align:left!important;min-height:0!important}
.sa-theme .hud .m-en em,.sa-theme .hud .m-es em,.sa-theme .hud .m-so em{margin:0!important}
.sa-theme .hud .m-en em .sai,.sa-theme .hud .m-es em .sai,.sa-theme .hud .m-so em .sai{width:18px!important;height:18px!important}
.sa-theme .hud .m-so{display:flex!important;justify-content:flex-start!important;gap:6px}
.sa-theme .hud .m-en .bar{grid-column:1/-1;display:block!important;width:100%!important;height:6px!important;margin:0!important}
.orb{display:flex!important;flex-direction:column;align-items:center;gap:5px;padding:0!important;background:none!important;border:0!important;min-width:0!important;box-shadow:none!important}
.orb i{font-style:normal}
.orb .orb-glass{position:relative;flex:0 0 auto;display:grid!important;place-items:center;width:86px!important;height:86px!important;padding:0!important;margin:0!important;border-radius:50%!important;overflow:hidden;
  background:radial-gradient(circle at 50% 55%,#0a0d12,#05070a 70%);box-shadow:0 0 0 2px #2a2f38,0 0 0 4px #d9a441aa,0 0 0 6px #1a1408,0 0 22px var(--og),inset 0 -8px 18px #000c}
.orb-pv{--oc1:#ff6a55;--oc2:#7a0c10;--og:#ff3b2f66}
.orb-mn{--oc1:#6ab8ff;--oc2:#0f2f78;--og:#3b8cff66}
.orb .orb-liq{position:absolute;left:0;right:0;bottom:0;height:calc(var(--f) * 1%);background:linear-gradient(180deg,var(--oc1),var(--oc2) 85%);transition:height .8s cubic-bezier(.2,1,.3,1);box-shadow:inset 0 3px 6px #ffffff40}
.orb .orb-liq::before{content:"";position:absolute;left:-12%;width:124%;height:12px;top:-6px;border-radius:50%;background:var(--oc1);opacity:.75;animation:saWave 2.6s ease-in-out infinite alternate}
@keyframes saWave{from{transform:translateX(-7%)}to{transform:translateX(7%)}}
.orb .orb-shine{position:absolute;inset:0;border-radius:50%;background:radial-gradient(38% 26% at 34% 24%,#ffffffb0,#ffffff00 70%),radial-gradient(70% 70% at 50% 50%,transparent 62%,#00000077);pointer-events:none;z-index:2}
.orb .orb-val{position:relative;z-index:3;display:block;text-align:center;line-height:1;text-shadow:0 1px 3px #000,0 0 8px #000}
.orb .orb-val b{display:block;font-family:var(--display);font-size:22px;color:#fff}
.orb .orb-val small{display:block;font-size:11px;color:#ffffffd0;margin-top:2px}
.orb .orb-lb{display:flex;align-items:center;gap:4px;font-family:var(--display);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2)}
.orb .orb-lb em{font-style:normal}.orb .orb-lb .sai{width:16px;height:16px}
@media (max-width:820px){.sa-theme .hud{grid-template-columns:1fr!important}}
@media (max-width:560px){.orb .orb-glass{width:78px!important;height:78px!important}.orb .orb-val b{font-size:19px}.sa-theme .hud .meters{gap:6px 10px}.sa-theme .hud .m-en,.sa-theme .hud .m-es,.sa-theme .hud .m-so{font-size:12px;padding:4px 8px!important}}

/* ================= Panel de personaje unificado ================= */
.sa-dash{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:14px;margin-bottom:18px}
.sa-dash>div{padding:14px;min-width:0}
.sa-cap{font-family:var(--display);color:#d9b56a;letter-spacing:.1em;font-size:13px;margin-bottom:8px;text-transform:uppercase}
.sa-cap small{text-transform:none;letter-spacing:0;color:var(--muted);font-family:var(--body);font-size:12px;margin-left:6px}
.sa-dash .doll{border:0!important;background:none!important;box-shadow:none!important;padding:0!important}
.sa-dash .doll .dname,.sa-dash .doll .dstats{display:none}
.sa-dash .herosum{grid-template-columns:1fr!important;margin:0 0 12px;border:0;background:none;padding:0;box-shadow:none}
.sa-status h3{margin:4px 0 8px}
.sa-stl{display:flex;flex-wrap:wrap;gap:6px}
.sa-st{display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:center;padding:6px 10px 6px 8px;border:1px solid #d9a44133;background:linear-gradient(90deg,#d9a44112,#0b131c);min-width:140px;flex:1 1 140px;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
.sa-st em{grid-row:1/span 2;font-style:normal;font-size:20px}.sa-st em .sai{width:28px;height:28px;vertical-align:middle}.sa-st b{font-size:13.5px}.sa-st small{color:var(--ink-2);font-size:11.5px}
.sa-st.good{border-color:#79c29a55;background:linear-gradient(90deg,#79c29a18,#0b131c)}
.sa-st.bad{border-color:#e0735c66;background:linear-gradient(90deg,#e0735c22,#0b131c)}
@media (max-width:860px){.sa-dash{grid-template-columns:1fr}}

/* ================= Inventario por rareza ================= */
.sa-theme .bcell{border-radius:3px}
.sa-theme .bcell.r-c{--rk:var(--rc)}.sa-theme .bcell.r-r{--rk:var(--rr)}.sa-theme .bcell.r-e{--rk:var(--re)}.sa-theme .bcell.r-l{--rk:var(--rl)}
.sa-theme .bcell[data-rar]{border-color:color-mix(in srgb,var(--rk) 55%,#000)!important;background:radial-gradient(90% 70% at 50% 110%,color-mix(in srgb,var(--rk) 30%,transparent),transparent 70%),linear-gradient(180deg,#1a120b,#0e0905)!important}
.sa-theme .bcell[data-rar="c"]{background:linear-gradient(180deg,#1a120b,#0e0905)!important}
.sa-theme .bcell.r-e,.sa-theme .bcell.r-l{box-shadow:inset 0 0 12px color-mix(in srgb,var(--rk) 35%,transparent),0 0 8px color-mix(in srgb,var(--rk) 30%,transparent)}
.sa-theme .bcell.r-l::after{content:"";position:absolute;inset:0;border-radius:3px;background:linear-gradient(115deg,transparent 30%,#ffd98a55 48%,transparent 62%);background-size:250% 100%;animation:saShim 3.2s ease-in-out infinite;pointer-events:none}
@keyframes saShim{0%{background-position:120% 0}60%,100%{background-position:-60% 0}}
.sa-rib{position:absolute;top:0;left:0;width:0;height:0;border-top:15px solid var(--rk);border-right:15px solid transparent;z-index:2;filter:drop-shadow(0 1px 1px #000)}
.bcell[data-rar="c"] .sa-rib{opacity:.55}
.sa-sort{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:4px 0 8px;font-size:12px;color:var(--ink-2)}
.sa-sort .chip{padding:3px 9px;font-size:12px}
.sa-leg{margin-left:auto;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.sa-leg .lg{display:inline-block;width:10px;height:10px;transform:rotate(45deg);margin-left:6px}
.sa-leg .lg.r-c{background:var(--rc)}.sa-leg .lg.r-r{background:var(--rr)}.sa-leg .lg.r-e{background:var(--re)}.sa-leg .lg.r-l{background:var(--rl)}
.sa-theme .rar.r-c{color:var(--rc)}.sa-theme .rar.r-r{color:var(--rr)}.sa-theme .rar.r-e{color:var(--re)}.sa-theme .rar.r-l{color:var(--rl)}
.sa-theme .bagp{border-radius:4px;outline:1px dashed #d9a44133;outline-offset:-6px}
@media (max-width:560px){.sa-leg{margin-left:0;width:100%}}

/* ================= Diario de misiones (pergamino) ================= */
.sa-theme .qtrack{position:relative;border:0!important;border-radius:2px;color:var(--ink-dark);padding:12px 16px 12px 46px!important;
  background:radial-gradient(130% 90% at 20% 0%,var(--parch1),var(--parch2) 60%,var(--parch3))!important;
  box-shadow:inset 0 0 28px #7a5a2a77,inset 0 0 3px #5a3f1a,0 8px 20px #000a!important;
  clip-path:polygon(0 3px,4% 0,12% 2px,24% 0,40% 3px,58% 0,74% 2px,88% 0,100% 3px,100% calc(100% - 2px),90% 100%,72% calc(100% - 3px),55% 100%,36% calc(100% - 2px),18% 100%,6% calc(100% - 3px),0 100%)}
.sa-theme .qtrack::before{content:"☀";position:absolute;left:10px;top:12px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:14px;color:#f7d9a0;
  background:radial-gradient(circle at 35% 30%,#d8504a,#8e1c18 70%);box-shadow:0 2px 4px #0007,inset 0 -2px 3px #0005,0 0 0 2px #8e1c1855}
.sa-theme .qtrack.fq::before{content:"♥";background:radial-gradient(circle at 35% 30%,#e77ab8,#8c2a62 70%)}
.sa-theme .qt-l small{color:#6b4c22!important;font-family:var(--display);font-size:11.5px!important;letter-spacing:.06em}
.sa-theme .qt-l b{color:#2b1a08!important;font-family:var(--body)!important;font-size:19px!important;font-style:italic;letter-spacing:0!important}
.sa-theme .qtrack .qt-bar{background:#b8995f88;height:5px}.sa-theme .qtrack .qt-bar i{background:linear-gradient(90deg,#7a2a16,#b8451f)}
.sa-theme .qtrack .qt-behind{color:#8e1c18}
.sa-theme .qtrack .btn{background:linear-gradient(180deg,#4a2e18,#2e1b0d)!important;color:#f6e6c2!important;border:1px solid #2a180a!important;box-shadow:inset 0 1px 0 #ffffff1a,0 2px 4px #0006!important}
.sa-theme .qtrack .btn:hover{filter:brightness(1.15)}
.sa-theme .qtrack .note{color:#5a3e1c}
.sa-theme .qtrack .mate{background:#fff8e655;border-color:#8a6a3a66;color:#2b1a08}.sa-theme .qtrack .mate small{color:#5a3e1c}.sa-theme .qtrack .mate.same{border-color:#2f7a4f}
@media (max-width:560px){.sa-theme .qtrack{padding:12px 12px 12px 42px!important}.sa-theme .qt-l b{font-size:17px!important}}

/* ================= Mapa: marco, objetivo y notas ================= */
.sa-theme .minimap{position:relative;border-radius:3px;box-shadow:0 0 0 2px #d9a44166,0 0 0 8px #2a1c10,0 0 0 9px #d9a44144,0 16px 34px #000b}
.sa-theme .minimap::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 55%,#2a1a0a77 100%);z-index:3}
.gpin.sa-goal circle:not(.sa-ring){stroke:#ff6b4a!important;stroke-width:3px}
.sa-ring{fill:none;stroke:#ff6b4a;stroke-width:3;transform-box:fill-box;transform-origin:center;animation:saRing 1.6s ease-out infinite;pointer-events:none}
@keyframes saRing{from{transform:scale(.6);opacity:1}to{transform:scale(1.6);opacity:0}}
.sa-pn rect{fill:#f2e4c0;stroke:#7a5a2a;stroke-width:1.5}.sa-pn text{font-size:15px;pointer-events:none}
.sa-notes{margin-top:18px;padding:14px 16px 14px;color:var(--ink-dark);border-radius:2px;background:radial-gradient(130% 90% at 20% 0%,var(--parch1),var(--parch2) 60%,var(--parch3));box-shadow:inset 0 0 26px #7a5a2a77,0 8px 20px #000a}
.sa-nh b{font-family:var(--display);font-size:15px;color:#3a2410}.sa-nh small{display:block;color:#5a3e1c;margin:2px 0 8px}
.sa-nf{display:flex;gap:8px;flex-wrap:wrap}
.sa-nf select,.sa-nf input{flex:1 1 160px;min-width:0;background:#fff8e6aa;color:#2b1a08;border:1px solid #8a6a3a;border-radius:2px;padding:8px;font-family:var(--body);font-size:15px}
.sa-nf .btn{background:linear-gradient(180deg,#4a2e18,#2e1b0d)!important;color:#f6e6c2!important;border-color:#2a180a!important}
.sa-ngoal{margin-top:10px;color:#3a2410}.sa-ngoal small{color:#6b4c22}
.sa-nl{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px}
.sa-nl li{display:flex;gap:8px;align-items:baseline;padding:6px 8px;border-bottom:1px dashed #8a6a3a88}
.sa-nl li b{color:#3a2410;white-space:nowrap}.sa-nl li span{flex:1;font-style:italic;color:#2b1a08;overflow-wrap:anywhere}.sa-nl .link{color:#8e1c18}

/* ================= Combate ================= */
.sa-theme .cbtn{border-radius:2px;background:linear-gradient(180deg,#18222f,#0d141c);border:1px solid #d9a44133;clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)}
.sa-theme .cbtn.atk{border-color:#e0735c88;background:linear-gradient(180deg,#3a1a16,#1a0c0a)}
.sa-theme .cbtn.mag{border-color:#5ab0ff77;background:linear-gradient(180deg,#16263f,#0b1220)}
.sa-hub{display:none}
@media (max-width:640px){
  .sa-wheel{position:relative!important;display:block!important;height:300px;max-width:320px;margin:6px auto 4px}
  .sa-wheel::before{content:"";position:absolute;left:50%;top:50%;width:222px;height:222px;margin:-111px 0 0 -111px;border-radius:50%;border:1px dashed #d9a44155;box-shadow:0 0 0 14px #0b131c88,0 0 0 15px #d9a44122;animation:saSpin 60s linear infinite}
  @keyframes saSpin{to{transform:rotate(360deg)}}
  .sa-wheel .cbtn{--a:calc((var(--i) - 1) * 360deg / (var(--n) - 1));position:absolute!important;left:50%;top:50%;width:76px;height:76px;margin:0!important;padding:4px!important;border-radius:50%!important;clip-path:none!important;
    display:flex!important;flex-direction:column;align-items:center;justify-content:center;text-align:center;
    transform:translate(-50%,-50%) rotate(var(--a)) translateY(-112px) rotate(calc(-1 * var(--a)));
    background:radial-gradient(circle at 50% 35%,#223246,#0b1119 75%)!important;border:2px solid #d9a44188!important;box-shadow:0 4px 12px #000a,inset 0 0 10px #000a;animation:saPop .35s cubic-bezier(.2,1.4,.4,1) both!important;animation-delay:calc(var(--i) * 40ms)!important}
  @keyframes saPop{from{scale:.2}to{scale:1}}
  .sa-wheel .cbtn b{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px!important;line-height:1.1;font-family:var(--display);letter-spacing:.02em}
  .sa-wheel .cbtn b .sai{width:26px!important;height:26px!important}
  .sa-wheel .cbtn small{display:none!important}
  .sa-wheel .cbtn[style*="--i:0;"]{width:100px;height:100px;transform:translate(-50%,-50%)!important;border-width:3px!important}
  .sa-wheel .cbtn.atk[style*="--i:0;"]{background:radial-gradient(circle at 50% 35%,#7a2a20,#2a0c09 75%)!important;border-color:#ff8a6a!important;box-shadow:0 0 22px #ff5a4a55,0 4px 14px #000a,inset 0 0 14px #000a}
  .sa-wheel .cbtn.atk b{font-size:13px!important}.sa-wheel .cbtn.atk b .sai{width:34px!important;height:34px!important}
  .sa-wheel .cbtn.mag{border-color:#5ab0ffaa!important}
  .sa-wheel .cbtn.run{border-color:#9aa3adaa!important}
  .sa-wheel .cbtn.god{border-color:#ffd98a!important;box-shadow:0 0 14px #ffd98a55!important}
  .sa-wheel .cbtn:disabled{opacity:.45;filter:grayscale(.6)}
  .sa-wheel .cbtn:active{transform:translate(-50%,-50%) rotate(var(--a)) translateY(-112px) rotate(calc(-1 * var(--a))) scale(.92)}
  .sa-wheel .cbtn[style*="--i:0;"]:active{transform:translate(-50%,-50%) scale(.92)!important}
  .sa-wheel.spells .sa-hub{display:flex!important}
  .sa-wheel.spells .cbtn.spell{width:80px;height:80px}
  .sa-wheel.spells .cbtn.spell b{font-size:10px!important;overflow-wrap:anywhere}
  .sa-wheel.spells .sa-hub b{font-size:22px!important}
  .sa-wheel.spells .cbtn.spell small,.sa-wheel.spells .sa-hub small{display:block!important;font-size:9.5px;color:#9fd0ff;max-width:66px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
}
`;
  document.head.appendChild(css);
})();
