// =====================================================================
// clases.js — Clases (desde nivel 10) y conjuntos de armadura
//   Clases: Guerrero, Mago, Pícaro, Sanador → bonos pasivos + habilidad de combate (cada 3 rondas)
//   Conjuntos: las piezas de la misma región (o de botín) dan bonos con 2 / 4 / 6 piezas
// Se carga después de vida.js.
// =====================================================================
(function () {
  if (typeof gameView !== "function") return;
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const escx = (s) => (typeof esc === "function" ? esc(s) : String(s ?? ""));
  const save = () => { if (typeof persist === "function") persist(); };
  const LVL = 10, CHANGE = 1000, CD = 3;

  // ---------------------------------------------------------------
  // Clases
  // ---------------------------------------------------------------
  const CLS = {
    guerrero: { n: "Guerrero", ic: "⚔️", col: "#e0735c", sk: "Golpe brutal", skIc: "💥",
      pas: () => Lx("+2 de daño · +2 de defensa", "+2 dmg · +2 def"), skd: () => Lx("Un ataque con +60% de daño", "An attack with +60% damage"), dmg: 2, def: 2, init: 0 },
    mago: { n: "Mago", ic: "🔮", col: "#8a9cff", sk: "Torrente arcano", skIc: "🌀",
      pas: () => Lx("+1 iniciativa · empiezas cada combate con +25% de maná", "+1 init · +25% mana each fight"), skd: () => Lx("Daña a TODOS los enemigos con magia pura", "Hits ALL enemies"), dmg: 0, def: 0, init: 1 },
    picaro: { n: "Pícaro", ic: "🗡️", col: "#6fd2a6", sk: "Golpe sombrío", skIc: "🌑",
      pas: () => Lx("+2 iniciativa · +25% de Soles al ganar", "+2 init · +25% Soles"), skd: () => Lx("Ataque con ventaja y +8 de daño (casi siempre crítico)", "Advantage attack +8 dmg"), dmg: 0, def: 0, init: 2 },
    sanador: { n: "Sanador", ic: "✨", col: "#ffd98a", sk: "Luz curativa", skIc: "💖",
      pas: () => Lx("+1 defensa · curas 15% de PV al ganar", "+1 def · heal 15% after wins"), skd: () => Lx("Curas 35% de tu PV y quitas los estados malos", "Heal 35% and cleanse"), dmg: 0, def: 1, init: 0 },
  };
  const SIMG = (p, fb) => (window.SAI?.img ? window.SAI.img(p, fb) : fb);
  const CLS_IM = { guerrero: ["guerrero", "golpe-brutal"], mago: ["mago", "torrente-arcano"], picaro: ["picaro", "golpe-sombrio"], sanador: ["sanador", "luz-curativa"] };
  for (const [id, c] of Object.entries(CLS)) { c.im = SIMG("cls/" + CLS_IM[id][0], c.ic); c.skIm = SIMG("cls/" + CLS_IM[id][1], c.skIc); }
  const cls = () => (G?.g?.clase && CLS[G.g.clase]) || null;

  // pasivos
  const _wb = weaponBonus; weaponBonus = function () { return _wb() + (cls()?.dmg || 0) + setSum("dmg"); };
  const _db = defBonus; defBonus = function () { return _db() + (cls()?.def || 0) + setSum("def"); };
  const _ib = initBonus; initBonus = function () { return _ib() + (cls()?.init || 0) + setSum("init"); };
  const _gx = gainXP; gainXP = function (n) { const m = 1 + setSum("xp"); return _gx.call(this, n && m !== 1 ? Math.round(n * m) : n); };

  const _sc = startCombat;
  startCombat = function () {
    const r = _sc.apply(this, arguments);
    try { const c = G.g.combat; if (c && G.g.clase === "mago" && G.manaMax) { G.mana = Math.min(G.manaMax, G.mana + Math.round(G.manaMax * 0.25)); } } catch (e) {}
    return r;
  };
  const _v = victory;
  victory = function () {
    const c = G?.g?.combat; const so0 = G?.dinero?.soles || 0;
    const r = _v.apply(this, arguments);
    try {
      if (!c || ["arena", "duel", "pvp"].includes(c.kind)) return r;
      const lines = [];
      if (G.g.clase === "picaro") { const gain = Math.max(0, (G.dinero.soles || 0) - so0); const extra = Math.round(gain * 0.25); if (extra > 0) { G.dinero.soles += extra; lines.push(`🗡️ ${Lx("Pícaro", "Rogue")}: ☀ +${extra} Soles`); } }
      if (G.g.clase === "sanador") { const h = Math.round(G.pvMax * 0.15); G.pv = Math.min(G.pvMax, G.pv + h); lines.push(`✨ ${Lx("Sanador", "Healer")}: +${h} PV`); }
      if (lines.length) { const b = G.g.lastBattle || G.g.lastResult; if (b) b.lines = [...(b.lines || []), ...lines]; save(); }
    } catch (e) {}
    return r;
  };

  // habilidad de combate
  function skillReady(c) { return c && (c.saSk == null || c.round - c.saSk >= CD); }
  function useSkill() {
    const c = G.g.combat; const k = cls(); if (!c || !k || !skillReady(c)) return;
    const ps = c.pst; const ti = (typeof gsel !== "undefined" && c.enemies[gsel.target]?.pv > 0) ? gsel.target : c.enemies.findIndex((e) => e.pv > 0);
    c.saSk = c.round;
    try { sfx(G.g.clase === "sanador" ? "heal" : "crit"); } catch (e) {}
    if (G.g.clase === "guerrero") {
      const add = Math.max(4, Math.round(((G.g.arma?.poder || 0) + 2 * attr("fuerza")) * 0.6));
      clog(`💥 ${CLS.guerrero.sk}!`); ps.forge = (ps.forge || 0) + add; pAttack(ti); if (G.g.combat === c) ps.forge = Math.max(0, ps.forge - add);
    } else if (G.g.clase === "picaro") {
      clog(`🌑 ${CLS.picaro.sk}!`); ps.buff = (ps.buff || 0) + 1; ps.forge = (ps.forge || 0) + 8; pAttack(ti); if (G.g.combat === c) ps.forge = Math.max(0, ps.forge - 8);
    } else if (G.g.clase === "mago") {
      const dmg = Math.round(8 + 3 * attr("inteligencia") + G.nivel * 1.6 + (G.manaMax || 0) * 0.08);
      for (const e of c.enemies) if (e.pv > 0) { const d2 = Math.max(1, dmg - (e.def || 0)); e.pv = Math.max(0, e.pv - d2); }
      clog(`🌀 ${CLS.mago.sk}: ${dmg} ${Lx("de daño a todos los enemigos", "damage to all")}.`); afterPlayer();
    } else if (G.g.clase === "sanador") {
      const h = Math.round(G.pvMax * 0.35); G.pv = Math.min(G.pvMax, G.pv + h); ps.st = {};
      clog(`💖 ${CLS.sanador.sk}: +${h} PV ${Lx("y te libras de los estados", "and cleansed")}.`); afterPlayer();
    }
    save(); render();
  }

  // ---------------------------------------------------------------
  // Conjuntos de armadura
  // ---------------------------------------------------------------
  const SETS = {
    alba: { n: "Set del Alba", b: [{ def: 1 }, { dmg: 2 }, { xp: 0.08 }] },
    verde: { n: "Set de Verdemar", b: [{ init: 1 }, { def: 2 }, { dmg: 3 }] },
    llan: { n: "Set de las Llanuras", b: [{ dmg: 2 }, { init: 1 }, { xp: 0.1 }] },
    costa: { n: "Set de la Costa", b: [{ init: 1 }, { dmg: 2 }, { def: 3 }] },
    esc: { n: "Set de Escarcha", b: [{ def: 2 }, { def: 2 }, { dmg: 4 }] },
    quem: { n: "Set de las Brasas", b: [{ dmg: 2 }, { dmg: 3 }, { def: 2 }] },
    viol: { n: "Set del Velo", b: [{ xp: 0.05 }, { init: 2 }, { dmg: 4 }] },
    cap: { n: "Set Real", b: [{ dmg: 1, def: 1 }, { init: 2 }, { dmg: 4 }] },
    lost: { n: "Set del Umbral", b: [{ dmg: 2 }, { def: 3 }, { dmg: 5, xp: 0.1 }] },
    drop: { n: "Set del Cazador", b: [{ dmg: 2 }, { init: 2 }, { dmg: 4 }] },
  };
  const NEEDS = [2, 4, 6];
  const X = () => window.SA_EXTRA || {};
  const setOf = (n) => { const w = X().WEAR?.[n]; if (!w || !w.at) return null; const r = w.at === "drop" ? "drop" : String(w.at).split(":")[0]; return SETS[r] ? r : null; };
  function setCounts() {
    const out = {}; try {
      const e = X().eq?.(); if (!e) return out; const heavy = X().heavy?.();
      for (const [s, n] of Object.entries(e)) { if (!n || s === "pvB" || s === "manaB" || (s === "escudo" && heavy)) continue; const k = setOf(n); if (k) out[k] = (out[k] || 0) + 1; }
    } catch (e) {}
    return out;
  }
  function setBonus() {
    const tot = { dmg: 0, def: 0, init: 0, xp: 0 };
    for (const [k, c] of Object.entries(setCounts())) SETS[k].b.forEach((b, i) => { if (c >= NEEDS[i]) for (const [s, v] of Object.entries(b)) tot[s] += v; });
    return tot;
  }
  function setSum(k) { try { return G?.g ? setBonus()[k] || 0 : 0; } catch (e) { return 0; } }
  const bTxt = (b) => Object.entries(b).map(([s, v]) => (s === "xp" ? `+${Math.round(v * 100)}% XP` : `+${v} ${{ dmg: Lx("daño", "dmg"), def: Lx("defensa", "def"), init: Lx("iniciativa", "init") }[s]}`)).join(" · ");
  function setsPanel(compact) {
    const cs = setCounts(); const ks = Object.keys(cs).filter((k) => cs[k] >= 1).sort((a, b) => cs[b] - cs[a]);
    const rows = ks.map((k) => { const c = cs[k]; return `<div class="sa-set ${c >= 2 ? "on" : ""}"><b>🛡️ ${escx(SETS[k].n)} <small>${Math.min(c, 6)}/6</small></b><div class="sa-setb">${SETS[k].b.map((b, i) => `<span class="${c >= NEEDS[i] ? "ok" : ""}">${NEEDS[i]}: ${bTxt(b)}</span>`).join("")}</div></div>`; }).join("");
    return `<div class="sa-sets"><h3>🛡️ ${Lx("Conjuntos", "Armor sets")}</h3>${rows || `<p class="muted">${Lx("Ponte 2 o más piezas de la misma región (o de botín) para activar un conjunto.", "Wear 2+ pieces from the same region to activate a set.")}</p>`}${compact ? "" : ""}</div>`;
  }

  // ---------------------------------------------------------------
  // Vistas
  // ---------------------------------------------------------------
  function classCard() {
    const k = cls();
    if (!k) {
      if (G.nivel < LVL) return `<div class="sa-clsbox lock"><b>🎓 ${Lx("Clase", "Class")}</b><small>${Lx(`Al llegar al nivel ${LVL} eliges una clase: Guerrero, Mago, Pícaro o Sanador.`, `At level ${LVL} you choose a class.`)} (${Lx("ahora", "now")} ${G.nivel})</small></div>`;
      return `<div class="sa-clsbox pick"><b>🎓 ${Lx("¡Elige tu clase!", "Choose your class!")}</b><small>${Lx("Cada una da bonos siempre y una habilidad especial en combate (cada 3 rondas). Puedes cambiarla después por", "Each gives passive bonuses and a combat skill. Change later for")} ${CHANGE} Soles.</small>
        <div class="sa-clsg">${Object.entries(CLS).map(([id, c]) => `<div class="sa-cls" style="--cc:${c.col}"><em>${c.im}</em><b>${c.n}</b><small>${c.pas()}</small><span>${c.skIm} <b>${c.sk}</b>: ${c.skd()}</span><button type="button" class="btn small primary" data-saclass="${id}">${Lx("Elegir", "Choose")}</button></div>`).join("")}</div></div>`;
    }
    return `<div class="sa-clsbox has" style="--cc:${k.col}"><div class="sa-clsh"><em>${k.im}</em><div><b>${k.n}</b><small>${k.pas()}</small><small>${k.skIm} <b>${k.sk}</b>: ${k.skd()} · ${Lx("cada", "every")} ${CD} ${Lx("rondas", "rounds")}</small></div>
      <details class="sa-clsch"><summary>${Lx("Cambiar", "Change")}</summary><div>${Object.entries(CLS).filter(([id]) => id !== G.g.clase).map(([id, c]) => `<button type="button" class="btn small" data-saclass="${id}" ${G.dinero.soles < CHANGE ? "disabled" : ""}>${c.im || c.ic} ${c.n}</button>`).join("")}<small class="muted">${CHANGE} Soles</small></div></details></div></div>`;
  }
  if (typeof heroView === "function") {
    const _hv = heroView;
    heroView = function () {
      const out = _hv.apply(this, arguments);
      try { if (!G?.g) return out; return classCard() + out.replace('<div class="sa-status">', setsPanel() + '<div class="sa-status">'); } catch (e) { return out; }
    };
  }
  function renumber(out) {
    return out.replace(/<div class="cmdgrid main sa-wheel">([\s\S]*?)<\/div>/, (m, inner) => {
      inner = inner.replace(/ style="--i:\d+;--n:\d+"/g, ""); const n = (inner.match(/class="cbtn/g) || []).length; let i = 0;
      inner = inner.replace(/<button type="button" class="cbtn/g, () => `<button type="button" style="--i:${i++};--n:${n}" class="cbtn`);
      return `<div class="cmdgrid main sa-wheel">${inner}</div>`;
    });
  }
  const _gv = gameView;
  gameView = function () {
    let out = _gv.apply(this, arguments);
    try {
      const c = G?.g?.combat; const k = cls();
      if (c && k && /class="cmdgrid main/.test(out)) {
        const ready = skillReady(c); const left = ready ? 0 : CD - (c.round - c.saSk);
        const btn = `<button type="button" class="cbtn sa-skill" data-saskill="1" style="--cc:${k.col}" ${ready ? "" : "disabled"}><b>${k.skIm} ${k.sk}</b><small>${ready ? Lx("¡Lista!", "Ready!") : Lx(`en ${left} ronda${left === 1 ? "" : "s"}`, `in ${left}`)}</small></button>`;
        out = out.replace(/(<div class="cmdgrid main[^"]*">\s*<button[^>]*class="cbtn atk"[\s\S]*?<\/button>)/, `$1${btn}`);
        out = renumber(out);
      }
      if (G?.g && !c && k) out = out.replace(/(<div class="who">[\s\S]*?<b>[^<]*<\/b>)/, `$1<span class="sa-clsb" style="--cc:${k.col}" title="${k.n}">${k.im} ${k.n}</span>`);
    } catch (e) { console.warn("clases gv:", e); }
    return out;
  };

  // detalle de pieza en la Bolsa + panel de conjuntos
  const _r = render;
  render = function () {
    const o = _r.apply(this, arguments);
    try {
      if (G?.g && !G.g.combat && gtab === "bolsa") {
        const bag = document.querySelector(".bagp"); if (bag && !document.querySelector(".invright .sa-sets")) bag.insertAdjacentHTML("afterend", setsPanel(true));
        const sel = gsel.uiSel?.item || (gsel.uiSel?.slot ? X().eq?.()[gsel.uiSel.slot] : null); const det = document.querySelector(".bdet.open");
        const k = sel && setOf(sel);
        if (det && k && !det.querySelector(".sa-setl")) { const c = setCounts()[k] || 0; det.querySelector(".bdh")?.insertAdjacentHTML("beforeend", `<small class="sa-setl">🛡️ ${escx(SETS[k].n)} · ${Lx("llevas", "wearing")} ${Math.min(c, 6)}/6</small>`); }
      }
    } catch (e) { console.warn("clases post:", e); }
    return o;
  };

  document.addEventListener("click", (ev) => {
    if (!G?.g) return;
    const s = ev.target.closest?.("[data-saskill]"); if (s && !s.disabled) { ev.stopPropagation(); useSkill(); return; }
    const c = ev.target.closest?.("[data-saclass]");
    if (c && !c.disabled) {
      const id = c.dataset.saclass; if (!CLS[id] || G.g.combat) return;
      if (G.g.clase) { if (G.dinero.soles < CHANGE) return toast(Lx("No tienes Soles suficientes.", "Not enough Soles.")); G.dinero.soles -= CHANGE; }
      else if (G.nivel < LVL) return;
      G.g.clase = id; try { sfx("crit"); log(`Ahora eres ${CLS[id].n}.`); } catch (e) {}
      toast(`${CLS[id].ic} ${Lx("¡Ahora eres", "You are now")} ${CLS[id].n}!`); save(); render();
    }
  });

  window.SA_CLASES = { CLS, SETS, setCounts, setBonus, cls };

  const css = document.createElement("style"); css.id = "sa-clases";
  css.textContent = `
.sa-clsbox{margin:0 0 14px;padding:12px 14px;border:1px solid #d9a44144;border-radius:3px;background:linear-gradient(135deg,#1a2436,#0d131c)}
.sa-clsbox>b{font-family:var(--display);color:#ffd98a;font-size:16px}.sa-clsbox>small{display:block;color:var(--ink-2);margin:2px 0 8px}
.sa-clsbox.lock{opacity:.8}
.sa-clsg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.sa-cls{display:flex;flex-direction:column;gap:4px;padding:10px;border:1px solid color-mix(in srgb,var(--cc) 50%,transparent);border-radius:3px;background:linear-gradient(180deg,color-mix(in srgb,var(--cc) 14%,transparent),#0b131c)}
.sa-cls em{font-style:normal;font-size:28px}.sa-cls>b{font-family:var(--display);font-size:16px;color:var(--cc)}.sa-cls small{color:var(--ink-2)}.sa-cls span{font-size:13px;flex:1}
.sa-cls .btn{align-self:flex-start}
@media (max-width:760px){.sa-clsg{grid-template-columns:repeat(2,minmax(0,1fr))}}
.sa-clsbox.has{border-color:color-mix(in srgb,var(--cc) 55%,transparent);background:linear-gradient(90deg,color-mix(in srgb,var(--cc) 16%,transparent),#0d131c 70%)}
.sa-clsh{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.sa-clsh em{font-style:normal;font-size:30px}.sa-clsh em .sai{width:64px;height:64px;border-radius:50%}
.sa-cls em .sai{width:72px;height:72px;border-radius:50%;filter:drop-shadow(0 4px 10px #000a)}.sa-cls span .sai,.sa-clsh small .sai{width:22px;height:22px;vertical-align:middle;border-radius:50%}
.sa-clsb .sai{width:16px;height:16px;vertical-align:-3px;border-radius:50%}
.cbtn.sa-skill b .sai{width:22px;height:22px;border-radius:50%;vertical-align:middle}
.sa-wheel .cbtn.sa-skill b .sai{width:30px!important;height:30px!important}
.sa-clsh>div{flex:1 1 220px;display:flex;flex-direction:column;gap:2px}.sa-clsh>div>b{font-family:var(--display);font-size:18px;color:var(--cc)}.sa-clsh small{color:var(--ink-2)}
.sa-clsch summary{cursor:pointer;color:var(--muted);font-size:13px}.sa-clsch>div{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
.sa-clsb{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:10px;font:600 11px var(--display);letter-spacing:.04em;color:var(--cc);border:1px solid color-mix(in srgb,var(--cc) 60%,transparent);background:color-mix(in srgb,var(--cc) 12%,transparent);vertical-align:middle}
.cbtn.sa-skill{border-color:var(--cc)!important;background:linear-gradient(180deg,color-mix(in srgb,var(--cc) 25%,#0d141c),#0d141c)!important}
.cbtn.sa-skill:not(:disabled){box-shadow:0 0 12px color-mix(in srgb,var(--cc) 50%,transparent)}
.sa-wheel .cbtn.sa-skill{border-color:var(--cc)!important;background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--cc) 45%,#0b1119),#0b1119 75%)!important}
.sa-wheel .cbtn.sa-skill:disabled{opacity:.5}
.sa-sets{margin:10px 0}.sa-sets h3{margin:4px 0 8px}
.sa-set{padding:8px 10px;margin-bottom:6px;border:1px solid #ffffff14;border-radius:3px;background:#0b131c88;opacity:.75}
.sa-set.on{opacity:1;border-color:#d9a44155}
.sa-set>b{font-size:14px}.sa-set>b small{color:var(--muted);margin-left:4px}
.sa-setb{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:4px;font-size:12px;color:var(--muted)}
.sa-setb span.ok{color:#8affb0}
.sa-setl{display:block;color:#d9b56a!important}
`;
  document.head.appendChild(css);
})();
