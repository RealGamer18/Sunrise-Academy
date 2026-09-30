// ===================== ANIMACIONES 2: posada · tablón · tienda · más mapa =====================
// Carga después de anim.js.
(function () {
  if (typeof render !== "function") return;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const RM = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  const sfx = (k, ...a) => { try { window.SA_SFX?.[k]?.(...a); } catch (e) {} };
  const layer = () => { let l = document.getElementById("xanim"); if (!l) { l = document.createElement("div"); l.id = "xanim"; document.body.appendChild(l); } return l; };
  const X = () => window.SA_EXTRA || {};
  let lastClick = null;
  document.addEventListener("pointerdown", (ev) => { const b = ev.target.closest?.("button, .act"); if (b) { const r = b.getBoundingClientRect(); lastClick = { x: r.left + r.width / 2, y: r.top + r.height / 2, at: Date.now() }; } }, true);
  const origin = () => (lastClick && Date.now() - lastClick.at < 3000 ? lastClick : { x: innerWidth / 2, y: innerHeight / 2 });
  const tabPos = (tab) => { const t = document.querySelector(`[data-gtab="${tab}"]`); if (!t) return null; const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  function fly(html, from, to, cls = "", ms = 900) {
    if (RM() || !from || !to) return; const el = document.createElement("div"); el.className = "xfly " + cls; el.innerHTML = html;
    el.style.left = from.x + "px"; el.style.top = from.y + "px"; layer().appendChild(el);
    const dx = to.x - from.x, dy = to.y - from.y;
    el.animate([{ transform: "translate(-50%,-50%) scale(.6)", opacity: 0 }, { transform: `translate(calc(-50% + ${dx * 0.2}px), calc(-50% + ${dy * 0.2 - 70}px)) scale(1.35)`, opacity: 1, offset: 0.3 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.45)`, opacity: 0.2 }], { duration: ms, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    setTimeout(() => { el.remove(); const t = document.elementFromPoint(to.x, to.y)?.closest?.("[data-gtab]"); if (t) { t.classList.remove("xbump"); void t.offsetWidth; t.classList.add("xbump"); } }, ms);
  }
  function coins(from, n = 8, sign = -1, amount) {
    if (RM() || !from) return;
    const hud = [...document.querySelectorAll(".hud .meters span")].find((s) => /Soles/.test(s.textContent)); const r = hud?.getBoundingClientRect(); const to = r ? { x: r.left + 20, y: r.top + r.height / 2 } : { x: innerWidth - 80, y: 40 };
    for (let i = 0; i < n; i++) setTimeout(() => { const a = sign < 0 ? to : from, b = sign < 0 ? from : to; fly("☀", { x: a.x + (Math.random() - 0.5) * 30, y: a.y + (Math.random() - 0.5) * 16 }, { x: b.x + (Math.random() - 0.5) * 30, y: b.y }, "coin", 650); }, i * 55);
    if (amount) { const t = document.createElement("div"); t.className = "xfloat " + (sign < 0 ? "neg" : "pos"); t.textContent = `${sign < 0 ? "−" : "+"}${amount} ☀`; t.style.left = from.x + "px"; t.style.top = from.y + "px"; layer().appendChild(t); setTimeout(() => t.remove(), 1200); }
  }
  function burst(at, color, icon, n = 14) {
    if (RM() || !at) return; const b = document.createElement("div"); b.className = "xburst"; b.style.cssText = `left:${at.x}px;top:${at.y}px;--c:${color}`;
    let h = `<i class="ring"></i>${icon ? `<em>${icon}</em>` : ""}`;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const d = 40 + Math.random() * 60; h += `<i class="sp" style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px"></i>`; }
    b.innerHTML = h; layer().appendChild(b); setTimeout(() => b.remove(), 1300);
  }

  // =====================================================================
  // 1. POSADA: noche → amanecer
  // =====================================================================
  function sleepScene(kind, lines) {
    if (RM()) return; document.getElementById("xsleep")?.remove();
    const med = kind === "med"; const el = document.createElement("div"); el.id = "xsleep"; el.className = med ? "med" : "";
    let stars = ""; for (let i = 0; i < 40; i++) stars += `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 60).toFixed(1)}%;animation-delay:${(Math.random() * 2).toFixed(2)}s"></i>`;
    el.innerHTML = `<div class="sl-sky"></div><div class="sl-stars">${stars}</div><div class="sl-moon">${med ? "✨" : "🌙"}</div><div class="sl-sun"></div>
      <div class="sl-room"><span class="sl-bed">${med ? "🧘" : "🛏️"}</span><span class="sl-candle">🕯️</span><span class="sl-z z1">z</span><span class="sl-z z2">z</span><span class="sl-z z3">Z</span></div>
      <div class="sl-clock"><b class="sl-h">0 h</b><small>${med ? L("Meditando…", "Meditating…") : L("Descansando en la posada…", "Resting at the inn…")}</small></div>
      <div class="sl-wake"><b>${med ? L("Mente en calma", "Calm mind") : L("¡Buenos días!", "Good morning!")}</b>${(lines || []).map((l) => `<small>${esc(l)}</small>`).join("")}</div>
      <button type="button" class="sl-skip">${L("Saltar ⏭", "Skip ⏭")}</button>`;
    document.body.appendChild(el); sfx("status");
    const hours = med ? 4 : 8; const hEl = el.querySelector(".sl-h"); let h = 0;
    const iv = setInterval(() => { h++; if (hEl) hEl.textContent = `${h} h`; if (h >= hours) clearInterval(iv); }, 1500 / hours);
    const t1 = setTimeout(() => { el.classList.add("dawn"); sfx("heal"); }, 1900);
    const t2 = setTimeout(() => { el.classList.add("out"); }, 3900);
    const t3 = setTimeout(() => { el.remove(); bars(); }, 4400);
    el.querySelector(".sl-skip").onclick = () => { clearInterval(iv); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); el.remove(); bars(); };
  }
  function bars() { document.querySelectorAll(".hud .bar i").forEach((b, i) => { b.classList.remove("xfill"); void b.offsetWidth; b.classList.add("xfill"); b.style.animationDelay = i * 0.08 + "s"; }); }
  const _rest = rest;
  rest = function () {
    const day = G.g.day, hr = G.g.hour; const r = _rest.apply(this, arguments);
    if (G.g.day !== day || G.g.hour !== hr) sleepScene("rest", G.g.lastResult?.lines);
    return r;
  };
  const _med = meditate;
  meditate = function () { const hr = G.g.hour, day = G.g.day; const r = _med.apply(this, arguments); if (G.g.day !== day || G.g.hour !== hr) sleepScene("med", G.g.lastResult?.lines); return r; };

  // =====================================================================
  // 2. TABLÓN DE MISIONES
  // =====================================================================
  let boardWasOpen = false, justAcc = null;
  boardView = function () {
    const b = boardFor(G.g.loc.r, G.g.day); const enter = !boardWasOpen && !RM(); boardWasOpen = true;
    const mine = G.g.quests.length;
    return `<div class="card qboard ${enter ? "enter" : ""}"><div class="qb-head"><h3>📜 ${L("Tablón de misiones", "Quest board")} · ${esc(regionName(G.g.loc.r))}</h3><small class="muted">${L("Día", "Day")} ${G.g.day} · ${L("se renueva cada día", "renews daily")}${mine ? ` · ${mine} ${L("aceptada(s): mira la pestaña Bolsa", "accepted: see the Bag tab")}` : ""}</small></div>
      <div class="qb-wood">${b.length ? b.map((q, i) => { const has = G.g.quests.some((x) => x.id === q.id); const [rr, pp] = String(q.place || q.dest || ":").split(":"); const just = justAcc && justAcc.id === q.id && Date.now() - justAcc.at < 1600;
        const qi = window.SA_QINFO ? window.SA_QINFO(q) : null;
        return `<div class="qnote ${has ? "taken" : ""} ${just ? "stampin" : ""} ${qi?.wanted ? "wanted" : ""}" data-qnote="${esc(q.id)}" style="--rot:${[-3, 2, -1.5, 3][i % 4]}deg;animation-delay:${(i * 0.12).toFixed(2)}s"><i class="pin"></i>
          ${qi ? `<span class="qtype">${qi.i} ${esc(qi.l)}</span>` : ""}
          ${qi?.wanted ? `<div class="wface">${typeof monIcon === "function" ? monIcon({ n: qi.mon, img: qi.mon }) : ""}<b>«${esc(qi.ap)}»</b></div><small>${esc(qi.mon)} · ${L("Nv", "Lv")} ${q.lvl}</small>` : `<b>${esc(q.t)}</b>`}<small>📍 ${esc(qi ? qi.where : P[rr]?.[+pp]?.n || "")}</small>
          <div class="qrw"><span>☀ ${q.soles}</span><span>✨ ${q.xp} XP</span><span>⭐ ${q.fama} ${L("Fama", "Fame")}</span><span>🎲 50% +1 ${L("afinidad", "affinity")}</span></div>
          ${has ? `<span class="stamp">${L("ACEPTADA", "ACCEPTED")}</span>` : `<button type="button" class="btn small primary" data-quest="${esc(q.id)}">✍️ ${L("Aceptar", "Accept")}</button>`}</div>`; }).join("") : `<p class="muted">${L("No hay misiones hoy.", "No quests today.")}</p>`}</div></div>`;
  };
  const _pvB = placeView;
  placeView = function () { const out = _pvB(); if (!gsel.board) boardWasOpen = false; return out; };
  const _acc = acceptQuest;
  acceptQuest = function (q) {
    const had = G.g.quests.some((x) => x.id === q.id); const from = origin(); const r = _acc.apply(this, arguments);
    if (!had && G.g.quests.some((x) => x.id === q.id)) {
      justAcc = { id: q.id, at: Date.now() }; sfx("buff"); render();
      setTimeout(() => { const n = document.querySelector(`[data-qnote="${CSS.escape(q.id)}"]`); const rc = n?.getBoundingClientRect(); fly("📜", rc ? { x: rc.left + rc.width / 2, y: rc.top + rc.height / 2 } : from, tabPos("bolsa"), "scroll", 1000); }, 550);
    }
    return r;
  };
  const _turn = turnIn;
  turnIn = function (id) {
    const had = G.g.quests.some((x) => x.id === id); const so = G.dinero.soles; const from = origin(); const r = _turn.apply(this, arguments);
    if (had && !G.g.quests.some((x) => x.id === id)) { sfx("victory"); burst(from, "#ffd84a", "🏅", 18); coins(from, 10, +1, G.dinero.soles - so); }
    return r;
  };

  // =====================================================================
  // 3. TIENDA POR CATEGORÍAS
  // =====================================================================
  const CATS = [
    ["pociones", "🧪", () => L("Pociones", "Potions"), (s) => !s.craft && ["potion", "mana", "energy"].includes(s.kind)],
    ["armas", "⚔️", () => L("Armas", "Weapons"), (s) => !s.craft && s.kind === "weapon" && !WEAPON_AFF[s.n]],
    ["magicas", "✨", () => L("Armas mágicas", "Magic weapons"), (s) => !s.craft && s.kind === "weapon" && !!WEAPON_AFF[s.n]],
    ["especial", "📜", () => L("Especiales", "Special"), (s) => !s.craft && !["potion", "mana", "energy", "weapon"].includes(s.kind)],
  ];
  const KICON = { potion: "❤️", mana: "💧", energy: "⚡", weapon: "🗡️", respec: "📜" };
  const AFC = { Fuego: "#ff7a2e", Agua: "#4fb3ff", Tierra: "#c79a55", Aire: "#9fe6ff", Rayo: "#ffe14d", Luz: "#fff2a8", Sombra: "#9b5cff" };
  function sellCat(n) {
    const W = X().WEAR || {}; if (W[n]) return ["equipo", "🛡️", L("Armaduras y accesorios", "Gear")];
    if (ATTR_ITEMS[n]) return ["esencias", "💎", L("Esencias y objetos raros", "Essences")];
    if (SHOP.some((s) => s.n === n)) return ["tienda", "🧪", L("Objetos de tienda", "Shop items")];
    return ["mat", "🪨", L("Materiales", "Materials")];
  }
  shopView = function () {
    const disc = Object.values(G.rayos).reduce((a, b) => a + b, 0) >= 150 ? 0.9 : 1; const merc = G.trasfondo === "Mercader ambulante" ? 0.9 : 1;
    const price = (s) => Math.ceil(s.precio * disc * merc * (typeof shopMult === "function" ? shopMult() : 1));
    const cat = gsel.shopCat || "pociones"; const sellMode = cat === "vender";
    const tabs = [...CATS.map(([k, ic, lb, f]) => [k, ic, lb(), SHOP.filter(f).length]), ["vender", "💰", L("Vender", "Sell"), Object.keys(G.g.inv).filter((n) => sellPrice(n) > 0).length]].filter((t) => t[3] || t[0] === "vender");
    let body = "";
    if (!sellMode) {
      const f = (CATS.find((c) => c[0] === cat) || CATS[0])[3]; const list = SHOP.filter(f);
      const eqP = G.g.arma?.poder || 0;
      body = `<div class="shgrid">${list.map((s, i) => { const p = price(s); const can = G.dinero.soles >= p; const w = s.kind === "weapon"; const pw = w ? WEAPONS[s.n] : 0; const af = WEAPON_AFF[s.n];
        return `<div class="shc ${w ? "w" : ""} ${can ? "" : "poor"}" style="animation-delay:${(i * 0.03).toFixed(2)}s;${af ? `--c:${AFC[af] || "#d9a441"}` : ""}"><div class="shi">${w ? (af ? "✨" : "🗡️") : KICON[s.kind] || "📦"}</div>
          <div class="shb"><b>${esc(s.n)}</b><small>${esc(s.desc)}</small>${w ? `<small class="${pw > eqP ? "up" : pw < eqP ? "down" : ""}">${pw > eqP ? `▲ +${pw - eqP}` : pw < eqP ? `▼ ${pw - eqP}` : "="} ${L("vs tu arma", "vs yours")}</small>` : G.g.inv[s.n] ? `<small>${L("Tienes", "You have")} ${G.g.inv[s.n]}</small>` : ""}</div>
          <button type="button" class="btn small ${can ? "primary" : ""}" data-buy="${esc(s.n)}" ${can ? "" : "disabled"}>☀ ${p}</button></div>`; }).join("")}</div>`;
    } else {
      const items = Object.keys(G.g.inv).filter((n) => sellPrice(n) > 0); const groups = {};
      for (const n of items) { const [k, ic, lb] = sellCat(n); (groups[k] = groups[k] || { ic, lb, list: [] }).list.push(n); }
      body = items.length ? Object.values(groups).map((g) => `<div class="shsub">${g.ic} ${esc(g.lb)}</div><div class="shgrid">${g.list.map((n) => `<div class="shc sell"><div class="shi">${g.ic}</div><div class="shb"><b>${esc(n)}</b><small>${L("Tienes", "You have")} ${G.g.inv[n]}</small></div><button type="button" class="btn small ghost" data-sell="${esc(n)}">+☀ ${sellPrice(n)}</button></div>`).join("")}</div>`).join("") : `<p class="muted">${L("No tienes nada que vender.", "Nothing to sell.")}</p>`;
    }
    return `<div class="card shopc"><div class="row between"><h3>🛒 ${L("Tienda", "Shop")}</h3><span class="pill">☀ ${G.dinero.soles} Soles${disc < 1 || merc < 1 ? ` · ${L("con descuento", "discount")}` : ""}</span></div>
      <div class="shtabs">${tabs.map(([k, ic, lb, n]) => `<button type="button" class="chip ${cat === k ? "on" : ""}" data-shcat="${k}">${ic} ${esc(lb)} <small>${n}</small></button>`).join("")}</div>${body}
      ${sellMode ? `<p class="note">${L("Los materiales valen más cuanto más peligrosa es la zona donde salen. Las armas se venden desde el arsenal (Bolsa).", "Materials from dangerous zones sell for more.")}</p>` : ""}</div>`;
  };
  const _buy = buy;
  buy = function (n) {
    const so = G.dinero.soles; const it = SHOP.find((s) => s.n === n); const from = origin(); const r = _buy.apply(this, arguments);
    if (!it || G.dinero.soles >= so) return r;
    const paid = so - G.dinero.soles; coins(from, Math.min(10, 3 + Math.round(paid / 30)), -1, paid);
    if (it.kind === "weapon") { weaponReveal(n); }
    else if (it.kind === "potion") { sfx("potion"); burst(from, "#e0584a", "❤️"); fly("🧪", from, tabPos("bolsa"), "", 900); }
    else if (it.kind === "mana") { sfx("potion"); burst(from, "#4fb3ff", "💧"); fly("🧪", from, tabPos("bolsa"), "", 900); }
    else if (it.kind === "energy") { sfx("buff"); burst(from, "#ffe14d", "⚡"); fly("⚡", from, tabPos("bolsa"), "", 900); }
    else { sfx("chapter"); burst(from, "#d9a441", "📜", 18); fly("📜", from, tabPos("bolsa"), "scroll", 1000); }
    return r;
  };
  function weaponReveal(n) {
    sfx("level"); if (RM()) return; document.getElementById("xwep")?.remove();
    const af = WEAPON_AFF[n]; const c = AFC[af] || "#ffd84a"; const el = document.createElement("div"); el.id = "xwep"; el.style.setProperty("--c", c);
    let rays = ""; for (let i = 0; i < 12; i++) rays += `<i style="transform:rotate(${i * 30}deg)"></i>`;
    el.innerHTML = `<div class="wr-rays">${rays}</div><div class="wr-icon">${af ? "✨" : "🗡️"}</div><b>${esc(n)}</b><small>${L("Poder", "Power")} ${WEAPONS[n]}${af ? ` · ${af}` : ""} · ${L("¡equipada!", "equipped!")}</small>`;
    layer().appendChild(el); setTimeout(() => el.classList.add("out"), 1500); setTimeout(() => el.remove(), 2000);
  }
  const _sell = sell;
  sell = function (n) { const so = G.dinero.soles; const from = origin(); const r = _sell.apply(this, arguments); if (G.dinero.soles > so) { sfx("click"); coins(from, 5, +1, G.dinero.soles - so); } return r; };

  document.addEventListener("click", (ev) => {
    if (view.name !== "game" || !G) return; const t = ev.target.closest("button"); if (!t) return;
    if (t.dataset.shcat) { ev.stopPropagation(); gsel.shopCat = t.dataset.shcat; return render(); }
  }, true);
  // compras de otras tiendas (armería, armaduras, establo, trueque): se mira el antes y el después del clic
  let pre = null;
  document.addEventListener("pointerdown", (ev) => { if (G?.g) pre = { soles: G.dinero.soles, arma: G.g.arma?.n, inv: JSON.stringify(G.g.inv), pets: (G.g.mascotas || []).length + (G.g.monturas || []).length, armas: (G.g.armas || []).length }; }, true);
  document.addEventListener("click", (ev) => {
    if (view.name !== "game" || !G || !pre) return; const t = ev.target.closest("button"); if (!t) return; const d = t.dataset; const p0 = pre; const from = origin();
    setTimeout(() => {
      try {
        const paid = p0.soles - G.dinero.soles;
        if (d.armbuy && G.g.arma?.n !== p0.arma) { coins(from, 8, -1, paid); weaponReveal(G.g.arma.n); }
        else if (d.xwearbuy && paid > 0) { coins(from, 6, -1, paid); sfx("shield"); burst(from, "#8be0a8", "🛡️", 16); fly("🛡️", from, tabPos("bolsa")); }
        else if (d.xbuy && (G.g.mascotas || []).length + (G.g.monturas || []).length > p0.pets) { coins(from, 6, -1, paid); sfx("level"); const [k, n] = d.xbuy.split("|"); const ic = k === "pet" ? X().PETS?.[n]?.i : X().MOUNTS?.[n]?.i; burst(from, "#f0b35b", ic || "🐾", 18); hearts(from); }
        else if (d.xforge && G.g.arma?.n !== p0.arma) { coins(from, 6, -1, paid); forgeFx(from); }
        else if (d.trqdo && JSON.stringify(G.g.inv) !== p0.inv) { sfx("level"); burst(from, "#d9a441", "🤝", 16); if ((G.g.armas || []).length > p0.armas) fly("🗡️", from, tabPos("bolsa"), "", 1000); }
        else if (d.wsell && paid < 0) coins(from, 5, +1, -paid);
      } catch (e) {}
    }, 30);
  });
  function hearts(at) { if (RM()) return; for (let i = 0; i < 6; i++) setTimeout(() => { const h = document.createElement("div"); h.className = "xfloat pos"; h.textContent = "💛"; h.style.left = at.x + (Math.random() - 0.5) * 60 + "px"; h.style.top = at.y + "px"; layer().appendChild(h); setTimeout(() => h.remove(), 1200); }, i * 120); }
  function forgeFx(at) {
    sfx("crit"); if (RM()) return; const el = document.createElement("div"); el.className = "xforge"; el.style.left = at.x + "px"; el.style.top = at.y + "px";
    el.innerHTML = `<span class="hm">🔨</span><span class="an">⚒️</span>`; layer().appendChild(el); setTimeout(() => el.remove(), 1300);
    setTimeout(() => { burst({ x: at.x, y: at.y - 30 }, "#ff9a3d", "✨", 20); sfx("impact", "Fuego"); }, 420);
  }

  // =====================================================================
  // 4. MÁS MAPA: clima por región, hora del día, pájaros, nombre de la región
  // =====================================================================
  const _mv = mapView;
  mapView = function () {
    let out = _mv(); if (!G?.g || typeof R === "undefined") return out;
    const sel = gsel.region || G.g.loc.r; const reg = R.find((x) => x.id === sel);
    const wx = R.map((r, i) => { const w = typeof weatherFor === "function" ? weatherFor(r.id, G.g.day) : null; const ic = w && typeof CLIMAS !== "undefined" ? CLIMAS[w]?.icon : null; if (!ic || !r.shape) return "";
      return `<text class="mwx" x="${r.shape[0] + r.shape[2] * 0.55}" y="${r.shape[1] - r.shape[3] * 0.7}" style="animation-delay:-${(i * 0.7).toFixed(1)}s"><title>${esc(r.name)}: ${esc(w)}</title>${ic}</text>`; }).join("");
    const lab = reg?.shape ? `<text class="mreg" x="${reg.shape[0]}" y="${reg.shape[1] + reg.shape[3] + 26}">${esc(reg.name)}</text>` : "";
    const at = out.indexOf('<circle class="mering"'); const ins = wx + lab;
    out = at >= 0 ? out.slice(0, at) + ins + out.slice(at) : out.replace("</svg>", ins + "</svg>");
    const hr = G.g.hour || 12; const tint = hr < 5 || hr >= 21 ? "night" : hr < 8 ? "dawn" : hr >= 18 ? "dusk" : "";
    const t = ((Date.now() / 1000) % 40).toFixed(1);
    out = out.replace(/(<div class="minimap">)/, `$1<div class="mtint ${tint}"></div><div class="mbirds" style="animation-delay:-${t}s"><span>🕊️</span><span>🕊️</span><span>🕊️</span></div>`);
    return out;
  };

  const css = `
.xfly{position:fixed;z-index:76;font-size:28px;pointer-events:none;filter:drop-shadow(0 3px 6px #000a)}
.xfly.coin{font-size:18px;color:#ffd84a;text-shadow:0 0 6px #ffb300}
.xfloat{position:fixed;transform:translate(-50%,-50%);font-family:var(--display);font-size:20px;font-weight:700;pointer-events:none;animation:xFloat 1.2s ease-out forwards;text-shadow:0 2px 6px #000}
.xfloat.neg{color:#ffb36b}.xfloat.pos{color:#8be0a8}
@keyframes xFloat{from{opacity:0;transform:translate(-50%,-30%)}20%{opacity:1}to{opacity:0;transform:translate(-50%,-220%)}}
[data-gtab].xbump{animation:xBump .45s cubic-bezier(.2,1.6,.4,1)}
@keyframes xBump{40%{transform:scale(1.18);border-color:#ffd84a;color:#ffd84a}}
.xburst{position:fixed;width:0;height:0;pointer-events:none}.xburst i{position:absolute;left:0;top:0;border-radius:50%}
.xburst .ring{width:26px;height:26px;margin:-13px;border:3px solid var(--c);animation:hbRing .8s ease-out forwards}
.xburst .sp{width:6px;height:6px;margin:-3px;background:var(--c);box-shadow:0 0 8px var(--c);animation:hbSpark .8s ease-out forwards}
.xburst em{position:absolute;transform:translate(-50%,-50%);font-style:normal;font-size:30px;animation:hbIcon 1.2s ease-out forwards}
@keyframes hbRing{from{transform:scale(.4);opacity:1}to{transform:scale(5);opacity:0}}
@keyframes hbSpark{from{transform:translate(0,0);opacity:1}to{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0}}
@keyframes hbIcon{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}30%{transform:translate(-50%,-90%) scale(1.3);opacity:1}100%{transform:translate(-50%,-190%);opacity:0}}
.hud .bar i.xfill{animation:xFill 1s cubic-bezier(.2,1,.3,1) both}
@keyframes xFill{from{width:0 !important;filter:brightness(2)}}
/* posada */
#xsleep{position:fixed;inset:0;z-index:90;overflow:hidden;display:grid;place-items:center;cursor:default;animation:slIn .5s ease}
@keyframes slIn{from{opacity:0}}
#xsleep.out{opacity:0;transition:opacity .5s}
.sl-sky{position:absolute;inset:0;background:linear-gradient(180deg,#050a1a,#0d1b3a 60%,#1d2a4a);transition:background 1.6s ease}
#xsleep.dawn .sl-sky{background:linear-gradient(180deg,#3b5f9e,#f4a65b 65%,#ffd89a)}
#xsleep.med .sl-sky{background:linear-gradient(180deg,#1a0f33,#3a2466 60%,#5b3a8a)}
#xsleep.med.dawn .sl-sky{background:linear-gradient(180deg,#4b3a8a,#b98cf0 70%,#e8d6ff)}
.sl-stars{position:absolute;inset:0;transition:opacity 1.2s}.sl-stars i{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;animation:slTw 1.6s ease-in-out infinite}
#xsleep.dawn .sl-stars{opacity:0}
@keyframes slTw{50%{opacity:.2;transform:scale(.6)}}
.sl-moon{position:absolute;right:16%;top:12%;font-size:64px;filter:drop-shadow(0 0 20px #fff8);animation:slMoon 2s ease-out both;transition:transform 1.4s ease,opacity 1.2s}
#xsleep.dawn .sl-moon{transform:translateY(-160px);opacity:0}
@keyframes slMoon{from{transform:translateY(80px);opacity:0}}
.sl-sun{position:absolute;left:50%;bottom:-160px;width:220px;height:220px;margin-left:-110px;border-radius:50%;background:radial-gradient(circle,#fff6c8,#ffd84a 45%,#ff9a3d 70%,transparent 72%);box-shadow:0 0 120px 40px #ffb34d88;transition:bottom 1.8s cubic-bezier(.2,.9,.3,1)}
#xsleep.dawn .sl-sun{bottom:18%}#xsleep.med .sl-sun{background:radial-gradient(circle,#fff,#e0c8ff 50%,transparent 72%);box-shadow:0 0 120px 40px #b98cf088}
.sl-room{position:relative;display:flex;gap:18px;align-items:flex-end;font-size:70px;margin-top:40px}
.sl-candle{font-size:34px;animation:slFl 0.8s ease-in-out infinite alternate;transition:opacity 1s}#xsleep.dawn .sl-candle{opacity:0}
@keyframes slFl{to{filter:brightness(1.5) drop-shadow(0 0 12px #ffb300);transform:scale(1.05)}}
.sl-z{position:absolute;left:62px;top:-10px;font-family:var(--display);color:#cfe0ff;font-size:26px;opacity:0;animation:slZ 2.2s ease-out infinite}
.sl-z.z2{animation-delay:.6s;font-size:32px}.sl-z.z3{animation-delay:1.2s;font-size:40px}#xsleep.dawn .sl-z{display:none}
@keyframes slZ{0%{opacity:0;transform:translate(0,0)}30%{opacity:1}100%{opacity:0;transform:translate(50px,-90px) rotate(15deg)}}
.sl-clock{position:absolute;top:18%;left:50%;transform:translateX(-50%);text-align:center;color:#fff3d6;display:flex;flex-direction:column;gap:4px;transition:opacity .6s}
.sl-clock b{font-family:var(--display);font-size:44px;letter-spacing:.06em}.sl-clock small{color:#cfd9ff}
#xsleep.dawn .sl-clock{opacity:0}
.sl-wake{position:absolute;bottom:14%;left:50%;transform:translate(-50%,20px);opacity:0;background:#0b131ccc;border:1px solid #ffd84a;border-radius:10px;padding:12px 22px;text-align:center;display:flex;flex-direction:column;gap:3px;transition:all .6s .5s}
.sl-wake b{font-family:var(--display);font-size:22px;color:#ffd84a}.sl-wake small{color:#fff3d6}
#xsleep.dawn .sl-wake{opacity:1;transform:translate(-50%,0)}
.sl-skip{position:absolute;top:14px;right:16px;background:#0b131ccc;border:1px solid var(--line);color:var(--ink-2);border-radius:999px;padding:6px 14px;cursor:pointer;font-family:var(--display)}
/* tablón */
.qboard .qb-head{display:flex;flex-direction:column;gap:2px;margin-bottom:10px}
.qb-wood{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;padding:18px 14px;border-radius:8px;background:repeating-linear-gradient(90deg,#3a2615 0 46px,#33210f 46px 48px),linear-gradient(#3a2615,#2a1a0d);box-shadow:inset 0 0 30px #000a}
.qnote{position:relative;background:linear-gradient(160deg,#f3e3bf,#e2c992);color:#2b1d0e;border-radius:3px;padding:18px 14px 12px;transform:rotate(var(--rot));box-shadow:0 6px 14px #0009;display:flex;flex-direction:column;gap:6px;transition:transform .2s}
.qnote:hover{transform:rotate(0) translateY(-3px) scale(1.02)}
.qnote b{font-family:var(--display);font-size:15.5px;color:#2b1d0e}.qnote small{color:#5a4326}
.qnote .pin{position:absolute;top:6px;left:50%;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff8a7a,#b3261e);box-shadow:0 2px 3px #0008}
.qrw{display:flex;flex-wrap:wrap;gap:4px}.qrw span{font-size:12px;background:#2b1d0e14;border:1px solid #2b1d0e33;border-radius:10px;padding:1px 7px;color:#3b2a14}
.qboard.enter .qnote{animation:qDrop .55s cubic-bezier(.2,1.4,.4,1) both}
@keyframes qDrop{from{opacity:0;transform:translateY(-40px) rotate(calc(var(--rot) * -4))}70%{transform:translateY(4px) rotate(calc(var(--rot) * 1.5))}to{opacity:1;transform:rotate(var(--rot))}}
.qnote.taken{opacity:.8}
.qnote .stamp{position:absolute;right:10px;bottom:12px;font-family:var(--display);font-weight:700;letter-spacing:.12em;color:#b3261e;border:3px solid #b3261e;border-radius:6px;padding:2px 10px;transform:rotate(-14deg);opacity:.85;mix-blend-mode:multiply}
.qnote.stampin .stamp{animation:qStamp .45s cubic-bezier(.2,1.6,.4,1) both}
.qnote.stampin{animation:qShake .35s .12s}
@keyframes qStamp{from{transform:rotate(-14deg) scale(3);opacity:0}to{transform:rotate(-14deg) scale(1);opacity:.85}}
@keyframes qShake{25%{transform:rotate(var(--rot)) translateX(-3px)}75%{transform:rotate(var(--rot)) translateX(3px)}}
.xfly.scroll{font-size:34px}
.xforge{position:fixed;transform:translate(-50%,-100%);pointer-events:none;font-size:40px}
.xforge .hm{display:inline-block;transform-origin:80% 80%;animation:fgHit .45s ease-in 2}
@keyframes fgHit{0%{transform:rotate(-60deg)}80%{transform:rotate(10deg)}100%{transform:rotate(0)}}
/* tienda */
.shopc{animation:tsIn .3s ease}
.shtabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px}.shtabs small{opacity:.7}
.shgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.shc{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:8px;padding:10px;background:var(--panel-2);animation:plIn .35s ease both;transition:transform .15s,border-color .15s,box-shadow .15s}
.shc:hover{transform:translateY(-2px);border-color:var(--c,#d9a441);box-shadow:0 6px 16px #0006}
.shc.w{--c:#d9a441}.shc.poor{opacity:.6}
.shi{font-size:26px;width:42px;height:42px;display:grid;place-items:center;border-radius:8px;background:#0b131c;border:1px solid color-mix(in srgb,var(--c,#d9a441) 50%,transparent);flex:none}
.shc:hover .shi{animation:shWob .5s ease}
@keyframes shWob{30%{transform:rotate(-10deg) scale(1.12)}60%{transform:rotate(8deg)}}
.shb{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}.shb small{color:var(--ink-2);font-size:12.5px}.shb small.up{color:#8be0a8}.shb small.down{color:#e0584a}
.shsub{margin:12px 0 6px;font-family:var(--display);color:var(--gold,#d9a441);letter-spacing:.04em}
#xwep{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;animation:wrIn .5s cubic-bezier(.2,1.4,.4,1);transition:opacity .45s,transform .45s}
#xwep.out{opacity:0;transform:translate(-50%,-70%)}
#xwep b{font-family:var(--display);font-size:24px;color:#fff3d6;text-shadow:0 0 12px var(--c),0 2px 6px #000}#xwep small{color:var(--c);text-shadow:0 1px 4px #000}
.wr-icon{font-size:72px;animation:wrSpin .9s cubic-bezier(.2,1.2,.4,1);filter:drop-shadow(0 0 18px var(--c))}
.wr-rays{position:absolute;left:50%;top:44px;width:0;height:0;animation:wrRot 4s linear infinite}
.wr-rays i{position:absolute;left:-3px;top:0;width:6px;height:150px;transform-origin:3px 0;background:linear-gradient(var(--c),transparent);opacity:.5}
@keyframes wrIn{from{opacity:0;transform:translate(-50%,-50%) scale(.4)}}
@keyframes wrSpin{from{transform:rotate(-540deg) scale(.2)}}
@keyframes wrRot{to{transform:rotate(360deg)}}
/* mapa */
.mtint{position:absolute;inset:0;pointer-events:none;transition:background 1s}
.mtint.night{background:radial-gradient(ellipse at 50% 40%,#0b1a4a33,#020818aa)}.mtint.dawn{background:linear-gradient(180deg,#ffb36b33,#6b8cff22)}.mtint.dusk{background:linear-gradient(180deg,#ff7a2e2e,#5a1f6b33)}
.mbirds{position:absolute;inset:0;pointer-events:none;overflow:hidden;animation-delay:inherit}
.mbirds span{position:absolute;left:-8%;top:22%;font-size:14px;opacity:.8;animation:mBird 40s linear infinite;animation-delay:inherit}
.mbirds span:nth-child(2){top:25%;font-size:11px;margin-left:-26px;margin-top:10px}.mbirds span:nth-child(3){top:20%;font-size:10px;margin-left:-44px;margin-top:-6px}
@keyframes mBird{0%{transform:translate(0,0)}25%{transform:translate(30vw,-20px)}50%{transform:translate(60vw,10px)}100%{transform:translate(130vw,-30px)}}
.minimap svg .mwx{font-size:30px;text-anchor:middle;pointer-events:auto;animation:mWx 4s ease-in-out infinite;filter:drop-shadow(0 2px 3px #000)}
@keyframes mWx{50%{transform:translateY(-8px)}}
.minimap svg .mreg{font-family:var(--display);font-size:34px;fill:#fff3d6;text-anchor:middle;paint-order:stroke;stroke:#000b;stroke-width:6px;letter-spacing:.08em;pointer-events:none;animation:mReg .6s ease both}
@keyframes mReg{from{opacity:0;transform:translateY(10px)}}
.minimap svg .gpin.tem circle{animation:mTem 3s ease-in-out infinite}
@keyframes mTem{50%{stroke:#ffe9a0;filter:drop-shadow(0 0 6px #ffd84a)}}
@media (prefers-reduced-motion:reduce){.mbirds,.minimap svg .mwx,.minimap svg .gpin.tem circle{animation:none!important}}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
