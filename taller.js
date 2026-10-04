// =====================================================================
// taller.js — Fabricación ampliada
//   · Pestaña «🔨 Armas» en el Taller (solo en forjas): fabricar armas nuevas con materiales
//   · Minijuego de calidad al preparar (alquimia, cocina, aceites, armas):
//       Normal / Buena / Excelente → más cantidad o arma ya mejorada (+1 / +2)
//   · Desmontar armas del arsenal para sacar materiales (y Núcleos de armas evolucionadas)
//   · Animación de yunque al mejorar en la forja
// Necesita window.SA_TALLER (aventura.js). Se carga después de bestias.js.
// =====================================================================
(function () {
  const T = window.SA_TALLER; if (!T) return;
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const escx = (s) => (typeof esc === "function" ? esc(s) : String(s ?? ""));
  const save = () => { if (typeof persist === "function") persist(); };
  const CORE = "Núcleo de evolución";
  const FORGES = ["alba:0", "esc:1", "quem:0", "cap:1"];

  // materiales nuevos en los grupos
  const add = (g, arr) => { const m = T.GROUPS[g]?.m; if (m) for (const n of arr) if (!m.includes(n)) m.push(n); };
  add("hierba", ["Alga", "Pétalo del Alba"]); add("cristal", ["Cristal de hielo", "Polvo de luna", "Perla de mar", "Copo de nieve"]); add("mineral", ["Piedra común", "Obsidiana"]); add("comida", ["Pez dorado", "Caramelo embrujado"]);

  // armas fabricables (registradas siempre)
  const CW = [
    { n: "Daga de colmillo", p: 20, a: null, t: ["critica"], ic: "🗡️", need: [["bestia", 3], ["mineral", 1]], s: 120, lv: 1 },
    { n: "Hoja de plata", p: 24, a: "Luz", t: [], ic: "⚔️", need: [["i:Mineral de plata", 3], ["bestia", 1]], s: 250, lv: 5 },
    { n: "Arco de cristal", p: 26, a: "Luz", t: ["alcance"], ic: "🏹", need: [["cristal", 3], ["hierba", 2]], s: 300, lv: 8 },
    { n: "Báculo de perla", p: 28, a: "Agua", t: [], ic: "🔱", need: [["i:Perla de mar", 2], ["cristal", 2]], s: 400, lv: 10 },
    { n: "Martillo de obsidiana", p: 34, a: "Tierra", t: ["pesada", "aturde"], ic: "🔨", need: [["i:Obsidiana", 3], ["mineral", 2]], s: 600, lv: 14 },
    { n: "Lanza lunar", p: 36, a: "Sombra", t: ["alcance"], ic: "🌙", need: [["i:Polvo de luna", 3], ["mineral", 3]], s: 800, lv: 18 },
    { n: "Espada del núcleo", p: 46, a: "Luz", t: ["critica"], ic: "🔮", need: [["i:" + CORE, 1], ["i:Cristal eterno", 1], ["mineral", 4]], s: 1500, lv: 25 },
  ];
  for (const w of CW) { if (WEAPONS[w.n] == null) WEAPONS[w.n] = w.p; if (w.a) WEAPON_AFF[w.n] = w.a; WEAPON_TRAITS[w.n] = w.t; }
  const isCW = (n) => CW.some((w) => w.n === n);
  T.TABS.arm = ["🔨", () => Lx("Armas", "Weapons")];
  for (const w of CW) if (!T.RECIPES.some((r) => r.out === w.n)) T.RECIPES.push({ t: "arm", out: w.n, q: 1, ic: w.ic, need: w.need, soles: w.s, where: FORGES, lv: w.lv, desc: () => `${Lx("Poder", "Power")} ${w.p}${w.a ? " · " + w.a : ""}${w.t.length ? " · " + w.t.map((x) => ({ critica: Lx("críticos fáciles", "easy crits"), alcance: Lx("+2 iniciativa", "+2 init"), pesada: Lx("pesada", "heavy"), aturde: Lx("aturde", "stuns") }[x] || x)).join(", ") : ""} · ${Lx("nivel", "level")} ${w.lv}+` });

  const step = (b) => Math.max(2, Math.round(b * 0.08));
  function regPlus(base, k) { const n = k ? `${base} +${k}` : base; if (k && WEAPONS[n] == null) { WEAPONS[n] = WEAPONS[base] + k * step(WEAPONS[base]); WEAPON_TRAITS[n] = WEAPON_TRAITS[base] || []; if (WEAPON_AFF[base]) WEAPON_AFF[n] = WEAPON_AFF[base]; } return n; }

  // ---------------------------------------------------------------
  // Minijuego de calidad
  // ---------------------------------------------------------------
  const GAME = {
    alq: { hits: 1, ic: "⚗️", t: () => Lx("Remueve la poción", "Stir the potion"), b: () => Lx("🥄 ¡Remover!", "🥄 Stir!"), col: "#b56cff" },
    coc: { hits: 2, ic: "🍳", t: () => Lx("Dale la vuelta a tiempo", "Flip it in time"), b: () => Lx("🍳 ¡Vuelta!", "🍳 Flip!"), col: "#ffa53a" },
    ace: { hits: 1, ic: "🛢️", t: () => Lx("Mezcla el aceite", "Mix the oil"), b: () => Lx("💧 ¡Mezclar!", "💧 Mix!"), col: "#6fd2a6" },
    arm: { hits: 3, ic: "🔨", t: () => Lx("Golpea el metal al rojo", "Strike the hot metal"), b: () => Lx("🔨 ¡Martillazo!", "🔨 Strike!"), col: "#ff6a3a" },
  };
  const QN = () => [Lx("Normal", "Normal"), Lx("Buena", "Good"), Lx("¡Excelente!", "Excellent!")];
  let g = null;
  function start(i) {
    const rec = T.RECIPES[i]; if (!rec || G.g.combat || !T.canWork()) return;
    if (rec.lv && G.nivel < rec.lv) return toast(Lx(`Necesitas nivel ${rec.lv}.`, `Need level ${rec.lv}.`));
    const p = T.plan(rec); if (!p.ok) return toast(Lx("Te faltan ingredientes.", "Missing ingredients."));
    const cfg = GAME[rec.t] || GAME.alq;
    g = { i, rec, cfg, left: cfg.hits, score: 0, marks: [] };
    const el = document.createElement("div"); el.id = "sa-tg"; el.style.setProperty("--tc", cfg.col);
    el.innerHTML = `<div class="sa-tgin k-${rec.t}"><div class="sa-tgic">${cfg.ic}</div><b>${escx(rec.out)}</b><small>${cfg.t()} · ${Lx("la calidad depende de tu puntería", "aim for quality")}</small>
      <div class="sa-tgbar"><i class="z"></i><i class="p"></i><i class="m"></i></div><div class="sa-tghits"></div>
      <div class="row"><button type="button" class="btn primary sa-tggo">${cfg.b()}</button><button type="button" class="btn ghost sa-tgskip">${Lx("Sin minijuego (Normal)", "Skip (Normal)")}</button></div></div>`;
    document.body.appendChild(el); g.el = el; zone(); g.t0 = performance.now(); loop();
    el.querySelector(".sa-tggo").addEventListener("click", hit); el.querySelector(".sa-tgskip").addEventListener("click", () => end(0));
  }
  function zone() { const w = 22; const x = 6 + Math.random() * (88 - w); g.z = [x, x + w]; g.p = [x + w / 2 - 3.5, x + w / 2 + 3.5]; g.sp = 1 + Math.random() * 0.5 + (g.cfg.hits - g.left) * 0.2; const z = g.el.querySelector(".z"), p = g.el.querySelector(".p"); z.style.left = x + "%"; z.style.width = w + "%"; p.style.left = g.p[0] + "%"; p.style.width = "7%"; }
  const pos = () => { const t = ((performance.now() - g.t0) / 1000) * g.sp; const ph = t % 2; return (ph < 1 ? ph : 2 - ph) * 100; };
  function loop() { if (!g || g.done) return; g.el.querySelector(".m").style.left = `calc(${pos()}% - 3px)`; g.raf = requestAnimationFrame(loop); }
  function hit() {
    if (!g || g.done) return; const x = pos(); const q = x >= g.p[0] && x <= g.p[1] ? 2 : x >= g.z[0] && x <= g.z[1] ? 1 : 0;
    g.score += q; g.left--; g.marks.push(q);
    g.el.querySelector(".sa-tghits").innerHTML = g.marks.map((m) => `<span class="h${m}">${m === 2 ? Lx("¡Perfecto!", "Perfect!") : m ? Lx("Bien", "Good") : Lx("Fallo", "Miss")}</span>`).join("");
    const ic = g.el.querySelector(".sa-tgic"); ic.classList.remove("bump"); void ic.offsetWidth; ic.classList.add("bump");
    if (g.rec.t === "arm") sparks(ic, q);
    try { sfx(q ? "impact" : "miss", "Fuego"); } catch (e) {}
    if (g.left > 0) { zone(); g.t0 = performance.now(); return; }
    const r = g.score / (g.cfg.hits * 2); end(r >= 0.83 ? 2 : r >= 0.5 ? 1 : 0);
  }
  function sparks(el, q) { for (let k = 0; k < 6 + q * 6; k++) { const s = document.createElement("i"); s.className = "sa-spark"; s.style.setProperty("--dx", `${(Math.random() - 0.5) * 160}px`); s.style.setProperty("--dy", `${-20 - Math.random() * 90}px`); el.appendChild(s); setTimeout(() => s.remove(), 700); } }
  function end(qual) {
    if (!g || g.done) return; g.done = true; cancelAnimationFrame(g.raf);
    const rec = g.rec; const p = T.plan(rec); const el = g.el;
    if (!p.ok) { el.remove(); g = null; return toast(Lx("Te faltan ingredientes.", "Missing ingredients.")); }
    for (const [n, q] of p.use) addItem(n, -q); if (rec.soles) G.dinero.soles -= rec.soles;
    let got;
    if (rec.t === "arm") { const nm = regPlus(rec.out, qual); G.g.armas = G.g.armas || []; G.g.armas.push(nm); got = `${nm} (${Lx("Poder", "Power")} ${WEAPONS[nm]})`; try { log(`Fabricaste ${nm}.`); } catch (e) {} }
    else { const extra = qual === 2 ? Math.max(1, Math.ceil(rec.q / 2)) : qual === 1 && Math.random() < 0.5 ? 1 : 0; addItem(rec.out, rec.q + extra); got = `${rec.out} ×${rec.q + extra}${extra ? ` (+${extra} ${Lx("por calidad", "quality bonus")})` : ""}`; try { log(`Preparó ${rec.q + extra}× ${rec.out}.`); } catch (e) {} }
    try { window.SA_EXTRA?.dq?.("craft"); } catch (e) {}
    try { sfx(qual === 2 ? "level" : "potion"); } catch (e) {}
    el.querySelector(".sa-tgin").innerHTML = `<div class="sa-tgic done q${qual}">${rec.ic || T.ITEM(rec.out)?.ic || g.cfg.ic}</div><b class="sa-q q${qual}">${QN()[qual]}</b><span>${escx(got)}</span>
      <div class="row"><button type="button" class="btn primary sa-tgagain">${Lx("Otra vez", "Again")}</button><button type="button" class="btn sa-tgclose">${Lx("Cerrar", "Close")}</button></div>`;
    const i = g.i; g = null; save();
    el.querySelector(".sa-tgclose").addEventListener("click", () => { el.remove(); render(); });
    el.querySelector(".sa-tgagain").addEventListener("click", () => { el.remove(); render(); start(i); });
  }
  T.start = start;

  // ---------------------------------------------------------------
  // Desmontar armas
  // ---------------------------------------------------------------
  function salvageOut(n) {
    const pw = WEAPONS[n] || 10; const out = [["Mineral de plata", 1 + Math.floor(pw / 18)]];
    const tier = window.SA_EVO?.info(n)?.tier || 0; if (tier) out.push([CORE, tier]);
    if (/Obsidiana/.test(n)) out.push(["Obsidiana", 1]); if (/cristal|perla/i.test(n)) out.push(["Cristal de luz", 1]);
    return out;
  }
  function salvageBox() {
    const arms = G.g.armas || []; if (!arms.length) return `<p class="note">🧰 ${Lx("Cuando tengas armas de sobra en el arsenal, aquí podrás desmontarlas para sacar materiales.", "Spare arsenal weapons can be salvaged here.")}</p>`;
    const uniq = [...new Set(arms)];
    return `<div class="sa-salv"><b>🧰 ${Lx("Desmontar armas del arsenal", "Salvage arsenal weapons")}</b><small class="muted">${Lx("Devuelve materiales (y los Núcleos de un arma evolucionada).", "Returns materials (and cores).")}</small>
      ${uniq.map((n) => `<div class="sa-sv"><span>${escx(n)} <small>(${Lx("Poder", "Power")} ${WEAPONS[n] ?? "?"})</small></span><small>→ ${salvageOut(n).map(([m, q]) => `${q}× ${escx(m)}`).join(", ")}</small><button type="button" class="btn small ghost" data-sasalv="${escx(n)}">🧰 ${Lx("Desmontar", "Salvage")}</button></div>`).join("")}</div>`;
  }
  function salvage(n) {
    const i = (G.g.armas || []).indexOf(n); if (i < 0 || G.g.combat) return;
    G.g.armas.splice(i, 1); const out = salvageOut(n); for (const [m, q] of out) addItem(m, q);
    toast(`🧰 ${n} → ${out.map(([m, q]) => `${q}× ${m}`).join(", ")}`); try { sfx("impact"); log(`Desmontaste ${n}.`); } catch (e) {}
    save(); render();
  }

  // ---------------------------------------------------------------
  // Animación de forja
  // ---------------------------------------------------------------
  function anvil(name, pw) {
    const el = document.createElement("div"); el.className = "sa-anvil";
    el.innerHTML = `<div class="in"><div class="an-ham">🔨</div><div class="an-anv">⚒️</div><div class="an-sp"></div><b>${escx(name)}</b><small>${Lx("Poder", "Power")} ${pw}</small></div>`;
    document.body.appendChild(el); const sp = el.querySelector(".an-sp");
    [250, 650, 1050].forEach((t) => setTimeout(() => sparks(sp, 2), t));
    setTimeout(() => el.classList.add("out"), 1900); setTimeout(() => el.remove(), 2400); el.addEventListener("click", () => el.remove());
  }
  document.addEventListener("click", (ev) => {
    if (!G?.g) return;
    const f = ev.target.closest?.("[data-xforge]"); if (f) { const before = G.g.arma?.n; setTimeout(() => { if (G.g.arma?.n !== before) anvil(G.g.arma.n, G.g.arma.poder); }, 30); return; }
    const s = ev.target.closest?.("[data-sasalv]"); if (s) { salvage(s.dataset.sasalv); }
  });

  // insertar desmontar en la pestaña de armas del taller
  const _r = render;
  render = function () {
    const o = _r.apply(this, arguments);
    try { if (G?.g && !G.g.combat && gsel.xws && gsel.xwsTab === "arm") { const box = document.querySelector(".wsbox.open .recs"); if (box && !box.parentElement.querySelector(".sa-salv, .sa-salvn")) { const d = document.createElement("div"); d.className = "sa-salvn"; d.innerHTML = salvageBox(); box.after(d); } } } catch (e) { console.warn("taller:", e); }
    return o;
  };

  window.SA_TALLER2 = { CW, salvageOut };

  const css = document.createElement("style"); css.id = "sa-taller";
  css.textContent = `
#sa-tg{position:fixed;inset:0;z-index:86;display:grid;place-items:center;background:#000a;backdrop-filter:blur(3px);animation:saFade .2s both}
.sa-tgin{width:min(420px,calc(100vw - 32px));padding:18px;border-radius:6px;border:1px solid color-mix(in srgb,var(--tc) 60%,transparent);background:radial-gradient(120% 80% at 50% 0%,color-mix(in srgb,var(--tc) 22%,transparent),transparent 60%),linear-gradient(180deg,#151d28,#0a0f15);box-shadow:0 20px 50px #000c,0 0 30px color-mix(in srgb,var(--tc) 25%,transparent);display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.sa-tgin>b{font-family:var(--display);font-size:19px;color:#ffe9b8}.sa-tgin>small{color:var(--ink-2)}
.sa-tgic{position:relative;font-size:54px;filter:drop-shadow(0 0 14px var(--tc));animation:saTgBob 1.6s ease-in-out infinite}
.sa-tgic.bump{animation:saTgBump .3s ease}
.sa-tgin.k-alq .sa-tgic{animation:saTgSwirl 2s ease-in-out infinite}
.sa-tgin.k-coc .sa-tgic.bump{animation:saTgFlip .45s ease}
.sa-tgic.done{animation:saTgWin .7s cubic-bezier(.2,1.5,.4,1) both}.sa-tgic.done.q2{filter:drop-shadow(0 0 24px #ffd98a)}
@keyframes saTgBob{50%{transform:translateY(-5px)}}
@keyframes saTgSwirl{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg) translateY(-4px)}}
@keyframes saTgBump{40%{transform:scale(1.25) rotate(-10deg)}}
@keyframes saTgFlip{50%{transform:translateY(-30px) rotateX(180deg)}}
@keyframes saTgWin{from{transform:scale(.2) rotate(-90deg);opacity:0}}
.sa-tgbar{position:relative;width:100%;height:30px;border-radius:15px;background:#05070a;box-shadow:inset 0 0 0 1px #ffffff22;overflow:hidden}
.sa-tgbar .z{position:absolute;top:0;bottom:0;background:#3fae6a88}.sa-tgbar .p{position:absolute;top:0;bottom:0;background:#8affb0cc}
.sa-tgbar .m{position:absolute;top:-2px;bottom:-2px;width:6px;border-radius:3px;background:var(--tc);box-shadow:0 0 12px var(--tc)}
.sa-tghits{display:flex;gap:6px;min-height:22px}.sa-tghits span{padding:2px 8px;border-radius:10px;font-size:12px;border:1px solid}
.sa-tghits .h2{color:#8affb0;border-color:#8affb066}.sa-tghits .h1{color:#ffd98a;border-color:#ffd98a66}.sa-tghits .h0{color:#e0735c;border-color:#e0735c66}
.sa-tgin .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.sa-tggo{min-width:180px;font-size:16px!important;padding:12px 18px!important}
.sa-q{font-family:var(--display);font-size:24px}.sa-q.q0{color:#c9d1d9}.sa-q.q1{color:#8affb0}.sa-q.q2{color:#ffd98a;text-shadow:0 0 14px #ffd98a}
.sa-spark{position:absolute;left:50%;top:50%;width:5px;height:5px;border-radius:50%;background:#ffd98a;box-shadow:0 0 8px #ff8a3a;pointer-events:none;animation:saSpk .7s ease-out forwards}
@keyframes saSpk{to{transform:translate(var(--dx),var(--dy));opacity:0}}
.sa-salvn{margin-top:12px}.sa-salv{display:flex;flex-direction:column;gap:6px;padding:10px;border:1px dashed #d9a44155;border-radius:3px}
.sa-sv{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:6px 0;border-bottom:1px solid #ffffff0d}.sa-sv span{flex:1 1 160px}.sa-sv>small{flex:1 1 160px;color:var(--muted)}
.sa-anvil{position:fixed;inset:0;z-index:88;display:grid;place-items:center;background:radial-gradient(circle,#ff6a3a33,#000b 70%);animation:saFade .2s both;cursor:pointer}
.sa-anvil.out{opacity:0;transition:opacity .5s}
.sa-anvil .in{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px}
.an-anv{font-size:70px;filter:drop-shadow(0 0 20px #ff6a3a)}
.an-ham{position:absolute;top:-56px;left:50%;font-size:52px;transform-origin:80% 80%;animation:saHam .4s ease-in 3}
@keyframes saHam{0%{transform:translateX(-10%) rotate(-50deg)}70%{transform:translateX(-30%) rotate(15deg)}100%{transform:translateX(-10%) rotate(-50deg)}}
.an-sp{position:absolute;top:30px;left:50%;width:1px;height:1px}
.sa-anvil b{font-family:var(--display);font-size:22px;color:#ffe9b8;text-shadow:0 0 14px #ff8a3a;margin-top:8px}.sa-anvil small{color:#ffd98a}
@keyframes saFade{from{opacity:0}}
`;
  document.head.appendChild(css);
})();
