// ===================== TÁCTICA: Amanecer, intenciones, racha, peligro y debilidades =====================
// Se carga el último. Envuelve pAttack / enemyTurn / render sin cambiar el resto de las reglas.
//   · Barra de Amanecer (G.g.alba 0–100): se llena al golpear y al recibir daño; llena → ataque "Amanecer".
//   · Intención del enemigo (e.intent): atk · heavy (×1.6) · guard (absorbe ½ de tu siguiente golpe) · hex (estado).
//   · Racha (pst.combo): +10% de daño por golpe seguido (máx +50%); se pierde al fallar o al recibir daño.
//   · Aviso de peligro en "Buscar pelea" y debilidades visibles en cada enemigo.
(function () {
  if (typeof pAttack !== "function" || typeof enemyTurn !== "function") return;
  const L = (es, en) => (typeof I18N !== "undefined" && I18N.lang === "en" ? en : es);
  const escx = (s) => (typeof esc === "function" ? esc(s) : String(s ?? ""));
  const C = () => G?.g?.combat;
  const gainAlba = (n) => { G.g.alba = Math.max(0, Math.min(100, Math.round((G.g.alba || 0) + n))); };
  const HEX = { Fuego: "Quemado", Rayo: "Quemado" };
  const fx = (ev) => { try { window.SA_FXQ?.(ev); } catch (e) {} };

  // ---------- intenciones ----------
  function pickIntent(e) {
    const r = Math.random();
    if (e.boss) return r < 0.4 ? "heavy" : r < 0.55 ? "hex" : "atk";
    return r < 0.2 ? "heavy" : r < 0.33 ? "guard" : r < 0.43 ? "hex" : "atk";
  }
  function setIntents() { const c = C(); if (c) c.enemies.forEach((e) => { if (e.pv > 0) e.intent = pickIntent(e); }); }

  let inET = false;
  const _et = enemyTurn;
  enemyTurn = function () {
    const c = C(); if (!c || inET) return _et.apply(this, arguments);
    inET = true; const pv0 = G.pv; const skip = new Set(); const restore = [];
    c.enemies.forEach((e) => { e.guard = false; });
    for (const e of c.enemies) {
      if (e.pv <= 0 || e.st?.Aturdido) continue;
      const it = e.intent || "atk";
      if (it === "guard") { skip.add(e); e.guard = true; clog(`${e.n} se pone en guardia.`); fx({ k: "foeguard", i: c.enemies.indexOf(e) }); }
      else if (it === "hex") { skip.add(e); clog(`${e.n} lanza un maleficio.`); fx({ k: "hex", i: c.enemies.indexOf(e) }); tryStatus(null, HEX[e.aff] || "Cegado", true); }
      else if (it === "heavy") { restore.push([e, e.poder]); e.poder = Math.round(e.poder * 1.6); clog(`${e.n} descarga un golpe brutal.`); fx({ k: "heavy", i: c.enemies.indexOf(e) }); }
    }
    const _alive = alive; alive = () => _alive().filter((e) => !skip.has(e));
    try { return _et.apply(this, arguments); }
    finally {
      alive = _alive; restore.forEach(([e, p]) => { e.poder = p; }); inET = false;
      if (C()) { if (G.pv < pv0) { C().pst.combo = 0; gainAlba(((pv0 - G.pv) / Math.max(1, G.pvMax)) * 120); } setIntents(); }
    }
  };

  // ---------- racha, guardia y Amanecer al golpear ----------
  const _pa = pAttack;
  pAttack = function (ti, spell) {
    const c = C(); const e = c?.enemies[ti]; if (!c || !e || e.pv <= 0) return _pa.apply(this, arguments);
    const before = c.enemies.map((x) => x.pv);
    const _ap = afterPlayer;
    afterPlayer = function () {
      afterPlayer = _ap;
      try {
        const ps = c.pst; const dealt = before[ti] - e.pv;
        const last = c.log.slice(-3).join(" ");
        if (dealt > 0) {
          if (e.guard) { const back = Math.floor(dealt / 2); e.pv += back; clog(`La guardia de ${e.n} absorbe ${back} de daño.`); }
          ps.combo = (ps.combo || 0) + 1;
          const bonus = Math.min(ps.combo - 1, 5) * 0.1;
          if (bonus > 0 && e.pv > 0) { const extra = Math.max(1, Math.round((before[ti] - e.pv) * bonus)); e.pv = Math.max(0, e.pv - extra); clog(`Racha ×${(1 + bonus).toFixed(1)}: +${extra} de daño.`); fx({ k: "combo", i: ti, n: ps.combo, extra }); }
          gainAlba(/¡Crítico!/.test(last) ? 18 : 10);
        } else if (!spell || spell.kind === "dmg") ps.combo = 0;
      } catch (x) { console.warn("tactica:", x); }
      return _ap.apply(this, arguments);
    };
    try { return _pa.apply(this, arguments); } finally { afterPlayer = _ap; }
  };

  // ---------- subida de nivel: anota lo ganado para la cinemática (efectos.js) ----------
  if (typeof gainXP === "function") {
    const _gx = gainXP;
    gainXP = function () {
      const b = { n: G.nivel, pv: G.pvMax, mana: G.manaMax, pa: G.puntosAfinidad || 0, pat: G.g?.puntosAtributo || 0 };
      const o = _gx.apply(this, arguments);
      if (G.nivel > b.n) window.SA_LVL = { to: G.nivel, pv: G.pvMax - b.pv, mana: G.manaMax - b.mana, pa: (G.puntosAfinidad || 0) - b.pa, pat: (G.g?.puntosAtributo || 0) - b.pat };
      return o;
    };
  }

  // ---------- Amanecer ----------
  function doAlba() {
    const c = C(); if (!c || (G.g.alba || 0) < 100) return;
    G.g.alba = 0;
    const base = (G.g.arma?.poder || 5) + (typeof weaponBonus === "function" ? weaponBonus() : 0) + 2 * attr("fuerza");
    const dmg = Math.round(base * 2.5 + G.nivel * 2);
    alive().forEach((e) => { e.pv = Math.max(0, e.pv - dmg); });
    clog(`¡Amanecer! La luz del alba arrasa: ${dmg} de daño a todos.`);
    c.pst.combo = (c.pst.combo || 0) + 1;
    fx({ k: "alba" });
    afterPlayer();
  }
  document.addEventListener("click", (ev) => { if (ev.target.closest?.("[data-alba]")) { ev.stopPropagation(); doAlba(); } }, true);

  // ---------- dibujo: barra, racha, intenciones, debilidades, aviso ----------
  const INTENT = {
    atk: ["⚔️", () => L("Atacará", "Will attack"), ""],
    heavy: ["💥", () => L("Golpe brutal", "Heavy blow"), "heavy"],
    guard: ["🛡️", () => L("Se defenderá", "Will guard"), "guard"],
    hex: ["🌀", () => L("Maleficio", "Hex"), "hex"],
  };
  function weakTo(e) {
    if (!e.aff || typeof affMult !== "function") return [];
    return (G.afinidades || []).map((a) => a.n).filter((a) => affMult(a, e.aff) > 1);
  }
  function post() {
    const c = C();
    if (c) {
      if (c.enemies.some((e) => e.pv > 0 && !e.intent)) c.enemies.forEach((e) => { if (e.pv > 0 && !e.intent) e.intent = pickIntent(e); });
      document.querySelectorAll(".foes2 .foe2").forEach((f, i) => {
        const e = c.enemies[i]; const plate = f.querySelector(".plate"); if (!e || !plate || e.pv <= 0) return;
        const [ic, lb, cls] = INTENT[e.intent] || INTENT.atk; const wk = weakTo(e);
        plate.querySelector(".sa-int")?.remove();
        plate.querySelectorAll(".sa-int").forEach((x) => x.remove());
        plate.insertAdjacentHTML("beforeend", `${e.lvl >= G.nivel + 3 ? `<div class="sa-int strong">⚠️ ${L("Más fuerte que tú", "Stronger than you")}</div>` : ""}<div class="sa-int ${cls}">${ic} ${escx(lb())}${e.guard ? ` · 🛡️ ${L("en guardia", "guarding")}` : ""}</div>${wk.length ? `<div class="sa-int weak">🎯 ${L("Débil a", "Weak to")} ${wk.map(escx).join(", ")}</div>` : ""}${typeof xpFor === "function" ? `<div class="sa-int xp">✨ ≈ ${xpFor(e)} XP</div>` : ""}`);
      });
      // números de daño: crítico / súper eficaz según el último golpe
      const recent = c.log.slice(-4).join(" ");
      document.querySelectorAll(".foes2 .float:not(.heal)").forEach((f) => { if (/¡Crítico!/.test(recent)) f.classList.add("crit"); else if (/súper eficaz/.test(recent)) f.classList.add("eff"); });
      if (/\(crítico\)/.test(c.log.slice(-2).join(" "))) document.querySelector(".me2 .float:not(.heal)")?.classList.add("crit");
      const me = document.querySelector(".battle .me2 .plate");
      if (me && !me.querySelector(".sa-limit")) {
        const a = G.g.alba || 0, k = c.pst.combo || 0;
        me.insertAdjacentHTML("beforeend", `<div class="sa-limit ${a >= 100 ? "full" : ""}" title="${L("Se llena al golpear y al recibir daño", "Fills as you hit and get hit")}"><span>🌅 ${L("Amanecer", "Dawn")}</span><i><b style="width:${a}%"></b></i><em>${a}%</em></div>${k >= 2 ? `<div class="sa-combo">🔥 ${L("Racha", "Streak")} ${k} · +${Math.min(k - 1, 5) * 10}%</div>` : ""}`);
      }
      const grid = document.querySelector(".battle .cmdgrid.main");
      if (grid && (G.g.alba || 0) >= 100 && !grid.querySelector("[data-alba]")) grid.insertAdjacentHTML("afterbegin", `<button type="button" class="cbtn alba" data-alba="1"><b>🌅 ${L("Amanecer", "Dawn")}</b><small>${L("Golpea a todos · no falla", "Hits all · never misses")}</small></button>`);
    }
    const fb = document.querySelector('[data-g="fight"]');
    if (fb && !fb.parentElement.querySelector(".sa-risk")) {
      const pl = PLACE_OF(G.g.loc.r, G.g.loc.p); const lv = typeof parseLvl === "function" ? parseLvl(pl.lvl) : null; if (!lv) return;
      const [a, b] = lv; const h = G.g.hour; const night = h >= 20 || h < 6; const w = typeof weatherFor === "function" ? weatherFor(G.g.loc.r, G.g.day) : "";
      const notes = [];
      if (b >= G.nivel + 3) notes.push(["bad", `⚠️ ${L("Peligroso: monstruos hasta nivel", "Dangerous: monsters up to level")} ${b}`]);
      else if (b <= G.nivel - 5) notes.push(["ok", `🟢 ${L("Fácil para ti (poca XP)", "Easy for you (little XP)")}`]);
      else notes.push(["ok", `🟡 ${L("Adecuado para tu nivel", "Right for your level")}`]);
      if (b >= 12) notes.push(["warn", `👥 ${L("Pueden salir en grupo", "May come in groups")}`]);
      if (night) notes.push(["warn", `🌙 ${L("De noche son más fuertes", "Stronger at night")}`]);
      if (w === "Tormenta" || w === "Niebla" || night) notes.push(["warn", `✦ ${L("Más monstruos raros (doble vida)", "More rare monsters (double HP)")}`]);
      fb.insertAdjacentHTML("afterend", `<div class="sa-risk">${notes.map(([k, t]) => `<span class="${k}">${escx(t)}</span>`).join("")}</div>`);
    }
  }
  const _r = render;
  render = function () { const o = _r.apply(this, arguments); try { if (G?.g) post(); } catch (e) { console.warn("tactica:", e); } return o; };

  const css = document.createElement("style"); css.id = "sa-tactica"; css.textContent = `
.sa-int{margin-top:4px;font-size:12px;padding:2px 8px;border-radius:2px;background:#ffffff10;border-left:2px solid #e6c47a99;color:var(--ink);text-align:left;font-family:var(--body)}
.sa-int.heavy{border-left-color:#ff5a4a;background:#ff5a4a22;color:#ffb4a8;animation:saIntPulse 1s ease-in-out infinite alternate}
.sa-int.guard{border-left-color:#7fc8ff;background:#7fc8ff1a;color:#cfe8ff}
.sa-int.hex{border-left-color:#c58cff;background:#c58cff1a;color:#e6d0ff}
.sa-int.strong{border-left-color:#ff3b2e;background:linear-gradient(90deg,#ff3b2e33,#ff3b2e0a);color:#ffc2b8;font-family:var(--display);letter-spacing:.04em}
.sa-int.xp{border-left-color:#b6f5c8;color:#d8ffe4;background:#b6f5c80d}
.sa-int.weak{border-left-color:#ffd84a;background:#ffd84a14;color:#ffe9a0}
@keyframes saIntPulse{to{box-shadow:0 0 12px #ff5a4a66}}
.sa-limit{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px;margin-top:6px;font-size:12px;font-family:var(--display);letter-spacing:.06em;color:#ffd38a}
.sa-limit i{display:block;height:8px;border-radius:4px;background:#00000066;box-shadow:inset 0 0 0 1px #ffd38a44;overflow:hidden}
.sa-limit b{display:block;height:100%;background:linear-gradient(90deg,#e8843f,#ffcf6a,#fff2c8);transition:width .6s cubic-bezier(.2,.9,.3,1)}
.sa-limit em{font-style:normal;min-width:34px;text-align:right}
.sa-limit.full b{animation:saFull 1s linear infinite;background-size:200% 100%;background-image:linear-gradient(90deg,#e8843f,#fff2c8,#ffcf6a,#e8843f)}
@keyframes saFull{to{background-position:-200% 0}}
.sa-combo{margin-top:4px;font-size:12.5px;color:#ffb35a;font-family:var(--display);letter-spacing:.06em;animation:saCombo .35s cubic-bezier(.2,1.6,.4,1)}
@keyframes saCombo{from{scale:1.6;opacity:0}}
body .cbtn.alba,body.sa-alq .cbtn.alba{grid-column:1/-1;border:1px solid #ffd38a!important;background:linear-gradient(180deg,#ffcf6a,#e8843f)!important;color:#3a1606!important;box-shadow:0 0 18px #ffb85a88,inset 0 1px 0 #fff8!important;animation:saAlbaBtn 1.2s ease-in-out infinite alternate}
body.sa-alq .cbtn.alba b{color:#3a1606!important;text-shadow:0 1px 0 #fff6}body .cbtn.alba small,body.sa-alq .cbtn.alba small{color:#5a2a0a!important}
@keyframes saAlbaBtn{to{box-shadow:0 0 30px #ffcf6acc,inset 0 1px 0 #fff8}}
.sa-risk{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:4px 6px;margin:6px 0 4px;font-size:12.5px}
.sa-risk span{padding:2px 8px;border-radius:2px;background:#ffffff0d;border:1px solid #ffffff1a}
.sa-risk .bad{color:#ffb4a8;border-color:#ff5a4a66;background:#ff5a4a1a}.sa-risk .warn{color:#ffe0a0}.sa-risk .ok{color:#a8e6c0}
@media (prefers-reduced-motion:reduce){.sa-int.heavy,.sa-limit.full b,.cbtn.alba,.sa-combo{animation:none}}`;
  document.head.appendChild(css);
})();
