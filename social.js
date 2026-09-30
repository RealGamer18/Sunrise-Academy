// ===================== SOCIAL: armas · intercambio · presencia =====================
// Muchas armas nuevas + arsenal · armerías por región · trofeos de jefes
// Trueque con comerciantes · venta de materiales · intercambio entre jugadores (con depósito)
// Dónde está y qué hace cada jugador (mapa, lugar, historia, grupo) · caza y peleas de historia en grupo.
// Carga después de mundo.js.
(function () {
  if (typeof render !== "function") return;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const sfx = (k) => { try { window.SA_SFX?.[k]?.(); } catch (e) {} };
  const NPC = window.SA_NPC || {};
  const ACTIVE = 20 * 60e3;
  const isOn = (c) => Date.now() - (c.lastSeen || c.updatedAt || 0) < ACTIVE;
  const pname = (r, p) => (P[r] && P[r][p] ? P[r][p].n : "?");
  const rname = (r) => (typeof regionName === "function" ? regionName(r) : r);
  const keyOf = (loc) => (loc ? `${loc.r}:${loc.p}` : "");
  const hereKey = () => keyOf(G.g.loc);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const W = () => { const g = G.g; if (!g.w) g.w = {}; const w = g.w; for (const k of ["trSet", "drops"]) if (!w[k]) w[k] = {}; return w; };
  const ago = (t) => { const m = Math.round((Date.now() - (t || 0)) / 60e3); if (m < 1) return L("ahora", "now"); if (m < 60) return L(`hace ${m} min`, `${m} min ago`); const h = Math.round(m / 60); if (h < 48) return L(`hace ${h} h`, `${h} h ago`); return L(`hace ${Math.round(h / 24)} días`, `${Math.round(h / 24)} days ago`); };
  const raceId = (n) => (typeof RAZAS !== "undefined" ? RAZAS.find((x) => x.n === n || x.id === n)?.id : null);
  const who = (c) => (c.owner === Store.uid ? L("tú", "you") : typeof profileName === "function" ? profileName(c.owner) : "");
  const others = () => Store.all.filter((c) => c.owner !== Store.uid && c.g && c.g.loc);

  // =====================================================================
  // 1. ARMAS NUEVAS
  // =====================================================================
  // [nombre, poder, rasgos, afinidad, precio, dónde]  dónde: "region:lugar" (armería) · "drop" (trofeo) · "trq" (solo trueque)
  const NW = [
    // Pueblo del Alba
    ["Espada de aprendiz", 16, [], null, 30, "alba:0"], ["Arco de tejo", 15, ["alcance"], null, 30, "alba:0"], ["Daga del alba", 13, ["critica"], "Luz", 45, "alba:0"],
    ["Bastón del faro", 15, ["aturde"], "Luz", 50, "alba:0"], ["Lanza de patrulla", 18, ["alcance"], null, 60, "alba:0"],
    // Bosque Verdemar
    ["Arco élfico", 24, ["alcance"], "Aire", 140, "verde:0"], ["Cerbatana de espinas", 17, ["doble", "alcance"], "Tierra", 110, "verde:0"], ["Espada de hoja viva", 25, [], "Tierra", 150, "verde:0"],
    ["Látigo de liana", 19, ["alcance", "aturde"], "Tierra", 120, "verde:0"], ["Bastón de loto", 23, ["aturde"], "Agua", 150, "verde:0"],
    // Llanuras / Trigalia
    ["Hacha de bronce", 27, ["pesada"], null, 170, "llan:0"], ["Lanza de la caravana", 26, ["alcance"], null, 170, "llan:0"], ["Cimitarra del mercado", 25, ["critica"], null, 180, "llan:0"],
    ["Mangual de torneo", 29, ["pesada", "aturde"], null, 210, "llan:0"], ["Guantes de campeón", 23, ["doble"], null, 190, "llan:0"], ["Boleadoras", 21, ["alcance", "aturde"], "Aire", 160, "llan:0"],
    // Costa
    ["Sable pirata", 31, ["critica"], null, 260, "costa:0"], ["Arpón de coral", 33, ["alcance"], "Agua", 280, "costa:0"], ["Tridente de rayo", 35, ["alcance"], "Rayo", 320, "costa:0"],
    ["Ancla de guerra", 38, ["pesada", "aturde"], "Agua", 340, "costa:0"], ["Trabuco de sal", 34, ["alcance"], "Fuego", 300, "costa:0"],
    // Escarcha (Minas de Durgan: armas enanas)
    ["Hacha rúnica enana", 40, ["pesada"], "Tierra", 380, "esc:1"], ["Martillo enano", 42, ["pesada", "aturde"], "Tierra", 400, "esc:1"], ["Pico de mithril", 37, ["critica"], null, 360, "esc:1"],
    ["Espada de plata", 38, [], "Luz", 380, "esc:1"], ["Lanza de escarcha", 40, ["alcance"], "Agua", 400, "esc:1"], ["Arco de la cumbre", 38, ["alcance"], "Aire", 380, "esc:1"],
    // Tierras Quemadas (Forjaroja)
    ["Espada de magma", 46, [], "Fuego", 520, "quem:0"], ["Hacha de obsidiana", 50, ["pesada"], "Fuego", 560, "quem:0"], ["Guanteletes de brasa", 42, ["doble"], "Fuego", 520, "quem:0"],
    ["Látigo ígneo", 43, ["alcance", "aturde"], "Fuego", 530, "quem:0"], ["Mandoble de la forja", 54, ["pesada"], "Fuego", 620, "quem:0"],
    // Ciénaga Violeta
    ["Dagas de la ciénaga", 44, ["doble", "critica"], "Sombra", 600, "viol:0"], ["Guadaña del velo", 56, ["pesada", "critica"], "Sombra", 720, "viol:0"],
    ["Bastón maldito", 50, ["aturde"], "Sombra", 650, "viol:0"], ["Estoque carmesí", 52, ["critica"], null, 680, "viol:0"],
    // Capital (Gremios)
    ["Espada real", 58, ["escudo"], "Luz", 800, "cap:1"], ["Alabarda de la guardia", 60, ["pesada", "alcance"], null, 820, "cap:1"], ["Arco del archivo", 55, ["alcance", "critica"], "Luz", 800, "cap:1"],
    ["Ballesta de gremio", 57, ["alcance"], null, 780, "cap:1"], ["Kusarigama de acero azul", 52, ["doble", "alcance"], "Rayo", 760, "cap:1"], ["Katana del amanecer", 62, ["critica"], "Luz", 900, "cap:1"],
    // Tierras Perdidas
    ["Filo estelar", 78, ["critica"], "Luz", 1500, "lost:0"], ["Martillo del tiempo", 84, ["pesada", "aturde"], null, 1700, "lost:0"], ["Arco del vacío", 74, ["alcance", "doble"], "Sombra", 1600, "lost:0"],
    // Trofeos de jefes de zona
    ["Farol del espectro", 20, ["aturde"], "Luz", 120, "drop"], ["Maza de basalto", 24, ["pesada", "aturde"], "Tierra", 150, "drop"], ["Aguijón de la reina", 26, ["critica"], "Sombra", 180, "drop"],
    ["Colmillo de sombra", 27, ["doble", "critica"], "Sombra", 200, "drop"], ["Garras del gato", 25, ["doble", "critica"], null, 200, "drop"], ["Hacha del Minotauro", 34, ["pesada"], "Tierra", 260, "drop"],
    ["Sable de la capitana", 38, ["critica"], "Agua", 320, "drop"], ["Lanza del trueno", 42, ["alcance"], "Rayo", 380, "drop"], ["Colmillo del Wyrm", 42, ["critica"], "Agua", 380, "drop"],
    ["Arco del búho", 42, ["alcance", "critica"], "Aire", 380, "drop"], ["Garrote del Rey Trol", 46, ["pesada", "aturde"], "Tierra", 420, "drop"], ["Espada de Pyrax", 56, ["critica"], "Fuego", 600, "drop"],
    ["Abanico del salón", 52, ["critica", "alcance"], "Sombra", 560, "drop"], ["Hoja del abismo", 64, ["pesada", "critica"], "Sombra", 750, "drop"], ["Báculo del enigma", 42, ["aturde"], "Luz", 380, "drop"],
    ["Cetro roído", 22, ["aturde"], "Sombra", 140, "drop"], ["Agujas del Relojero", 82, ["doble", "critica"], null, 1600, "drop"], ["Filo de la Creación", 100, ["critica"], "Luz", 2500, "drop"],
    // Trofeos de la historia
    ["Daga del culto", 24, ["critica"], "Sombra", 180, "drop"], ["Espada del capitán", 27, ["escudo"], "Sombra", 200, "drop"], ["Báculo de la marea", 32, ["aturde"], "Agua", 260, "drop"],
    ["Media luna de Ilvara", 40, ["critica", "alcance"], "Sombra", 360, "drop"], ["Velo de Nyssa", 40, ["alcance", "aturde"], "Sombra", 360, "drop"], ["Ancla de Orvath", 48, ["pesada", "aturde"], "Tierra", 460, "drop"],
    ["Martillo de Ignar", 54, ["pesada", "aturde"], "Fuego", 540, "drop"], ["Espejo de Mirael", 58, ["critica"], "Agua", 600, "drop"], ["Lanza del Heraldo", 60, ["alcance"], "Sombra", 640, "drop"],
    ["Colmillo de Vaelmor", 66, ["pesada", "critica"], "Sombra", 760, "drop"], ["Espada del Campeón", 66, ["critica"], "Luz", 760, "drop"], ["Llave del Umbral", 72, ["aturde"], null, 900, "drop"],
    ["Hoja de la Cumbre", 80, ["critica"], "Luz", 1200, "drop"], ["Sol naciente", 90, ["critica", "alcance"], "Luz", 2000, "drop"],
    // Solo por trueque con comerciantes
    ["Cuchillo de Mira", 14, ["critica"], null, 40, "trq"], ["Arco de Verdemar", 30, ["alcance", "critica"], "Aire", 260, "trq"], ["Puños de Bako", 30, ["doble", "aturde"], null, 260, "trq"],
    ["Garfio de Varo", 36, ["doble", "alcance"], "Agua", 320, "trq"], ["Hacha rúnica de Durgan", 46, ["pesada", "critica"], "Tierra", 460, "trq"], ["Martillo de Ignara", 52, ["pesada", "aturde"], "Fuego", 540, "trq"],
    ["Espada dracónica", 62, ["critica"], "Fuego", 760, "trq"], ["Varita maldita", 55, ["aturde", "critica"], "Sombra", 620, "trq"], ["Estoque del gremio", 58, ["critica", "escudo"], null, 700, "trq"],
  ];
  const PRICE = {}, ARMERIA = {};
  for (const [n, pw, tr, af, pr, wh] of NW) {
    WEAPONS[n] = pw; WEAPON_TRAITS[n] = tr; if (af) WEAPON_AFF[n] = af; PRICE[n] = pr;
    if (wh.includes(":")) (ARMERIA[wh] = ARMERIA[wh] || []).push(n);
  }
  for (const s of SHOP) if (s.kind === "weapon") PRICE[s.n] = PRICE[s.n] || s.precio;
  const ALIAS = { "Armas enanas": ["Hacha rúnica enana", "Martillo enano", "Pico de mithril"] };
  const BOSS_DROP = { "alba:3": "Farol del espectro", "alba:4": "Maza de basalto", "verde:3": "Aguijón de la reina", "verde:4": "Colmillo de sombra", "llan:1": "Garras del gato", "llan:5": "Hacha del Minotauro", "costa:3": "Sable de la capitana", "costa:4": "Lanza del trueno", "esc:2": "Colmillo del Wyrm", "esc:3": "Arco del búho", "quem:3": "Garrote del Rey Trol", "quem:4": "Espada de Pyrax", "viol:3": "Abanico del salón", "viol:4": "Hoja del abismo", "cap:3": "Báculo del enigma", "cap:4": "Cetro roído", "lost:1": "Agujas del Relojero", "lost:3": "Filo de la Creación" };
  const STORY_DROP = { 12: "Daga del culto", 14: "Espada del capitán", 17: "Báculo de la marea", 20: "Media luna de Ilvara", 22: "Velo de Nyssa", 24: "Ancla de Orvath", 25: "Martillo de Ignar", 26: "Espejo de Mirael", 29: "Lanza del Heraldo", 30: "Colmillo de Vaelmor", 33: "Espada del Campeón", 37: "Llave del Umbral", 39: "Hoja de la Cumbre", 40: "Sol naciente" };
  const TRN = { pesada: L("pesada", "heavy"), critica: L("crítica", "crit"), doble: L("doble golpe", "double"), aturde: L("aturde", "stun"), alcance: L("alcance", "reach"), escudo: L("escudo", "shield") };
  const wDesc = (n) => [`${L("Poder", "Power")} ${WEAPONS[n] ?? "?"}`, ...(WEAPON_TRAITS[n] || []).map((t) => TRN[t] || t), WEAPON_AFF[n] ? `✦ ${WEAPON_AFF[n]}` : ""].filter(Boolean).join(" · ");
  const wValue = (n) => PRICE[n] || (WEAPONS[n] || 5) * 3;
  const wSell = (n) => Math.max(1, Math.round(wValue(n) * 0.4));

  // ---------- arsenal ----------
  const ars = () => (G.g.armas || (G.g.armas = []));
  const _add = addItem;
  const isConsumable = (n) => SHOP.some((s) => s.n === n && s.kind !== "weapon");
  addItem = function (n, q = 1) {
    if (q > 0 && G?.g) {
      if (ALIAS[n]) { for (let i = 0; i < q; i++) ars().push(pick(ALIAS[n])); return; }
      if (WEAPONS[n] != null && !isConsumable(n)) { for (let i = 0; i < q; i++) ars().push(n); return; }
    }
    return _add(n, q);
  };
  function migrate() {
    ars();
    for (const n of Object.keys(G.g.inv || {})) if (ALIAS[n] || (WEAPONS[n] != null && !isConsumable(n))) { const q = G.g.inv[n]; delete G.g.inv[n]; addItem(n, q); }
  }
  const _buy = buy;
  buy = function (n) {
    const old = G.g.arma; const r = _buy.apply(this, arguments);
    if (G.g.arma !== old && old?.n) { ars().push(old.n); persist(); render(); }
    return r;
  };
  function equip(i) {
    if (G.g.combat) return; const n = ars()[i]; if (!n) return;
    ars().splice(i, 1); if (G.g.arma?.n) ars().push(G.g.arma.n);
    G.g.arma = { n, poder: WEAPONS[n] ?? 10 }; sfx("status"); toast(L(`Equipaste ${n}.`, `Equipped ${n}.`)); log(`Equipaste ${n}.`); persist(); render();
  }
  function sellW(i) {
    const n = ars()[i]; if (!n) return; const p = wSell(n);
    ars().splice(i, 1); G.dinero.soles += p; toast(L(`Vendiste ${n} por ${p} Soles.`, `Sold ${n} for ${p} Soles.`)); persist(); render();
  }
  function armBuy(n) {
    const price = Math.ceil(PRICE[n] * (G.trasfondo === "Mercader ambulante" ? 0.9 : 1));
    if (G.dinero.soles < price) return toast(L("No tienes Soles suficientes.", "Not enough Soles."));
    G.dinero.soles -= price; if (G.g.arma?.n) ars().push(G.g.arma.n); G.g.arma = { n, poder: WEAPONS[n] };
    sfx("level"); log(`Compraste y equipaste ${n}.`); toast(L(`Equipaste ${n}. Tu arma anterior está en el arsenal (Bolsa).`, `Equipped ${n}.`)); persist(); render();
  }

  // ---------- trofeos ----------
  function dropsFor(enemies, pk, kind) {
    const got = [];
    for (const e of enemies) {
      if (e.story && STORY_DROP[e.story]) { if (!W().drops["s" + e.story]) { W().drops["s" + e.story] = 1; got.push(STORY_DROP[e.story]); } continue; }
      if (kind === "boss" && e.boss && !e.god && !e.avatar && BOSS_DROP[pk]) { const k = W().drops[pk] || 0; if (!k || Math.random() < 0.15) { W().drops[pk] = k + 1; got.push(BOSS_DROP[pk]); } }
    }
    got.forEach((n) => ars().push(n));
    return got;
  }
  const dropLine = (n) => L(`🗡️ ¡Trofeo! ${n} (${wDesc(n)}) · guardada en tu arsenal`, `🗡️ Trophy! ${n}`);
  const _vic = victory;
  victory = function () {
    const c = G.g.combat; const es = c ? c.enemies.slice() : []; const pk = c?.placeKey; const kind = c?.kind;
    const r = _vic.apply(this, arguments);
    try {
      const got = dropsFor(es, pk, kind);
      if (got.length) { const b = G.g.lastBattle || G.g.lastResult; if (b) b.lines = [...(b.lines || []), ...got.map(dropLine)]; log(`Trofeo: ${got.join(", ")}.`); sfx("level"); persist(); render(); }
    } catch (e) { console.warn("social:", e); }
    return r;
  };
  window.SA_SOCIAL = { onRaidWin(r) { const got = dropsFor([{ ...r.e, boss: r.e.boss !== false }], r.place, r.kind); if (got.length) toast(dropLine(got[0])); } };

  // ---------- precio de materiales ----------
  const MATV = {};
  for (const r in P) P[r].forEach((x) => {
    const lv = typeof parseLvl === "function" ? parseLvl(x.lvl) : null; if (!lv || !x.mon?.length) return;
    for (const o of x.obj || []) { const n = cleanItem(o); if (SHOP.some((s) => s.n === n) || ATTR_ITEMS[n] || WEAPONS[n] != null || ALIAS[n]) continue; MATV[n] = Math.max(MATV[n] || 0, 3 + Math.round(lv[0] * 1.2)); }
  });
  const _sp = sellPrice;
  sellPrice = function (n) { if (SHOP.some((s) => s.n === n) || ATTR_ITEMS[n]) return _sp(n); return MATV[n] || _sp(n); };

  // =====================================================================
  // 2. PAQUETES (lo que se da y se recibe)
  // =====================================================================
  const B = () => ({ items: {}, armas: [], soles: 0 });
  const bEmpty = (b) => !b || (!Object.keys(b.items || {}).length && !(b.armas || []).length && !(b.soles > 0));
  const countIn = (arr, n) => arr.filter((x) => x === n).length;
  function bHas(b) {
    if (!b) return true;
    for (const [n, q] of Object.entries(b.items || {})) if ((G.g.inv[n] || 0) < q) return false;
    for (const n of new Set(b.armas || [])) if (countIn(ars(), n) < countIn(b.armas, n)) return false;
    return (b.soles || 0) <= G.dinero.soles;
  }
  function bApply(b, sign) {
    if (!b) return;
    for (const [n, q] of Object.entries(b.items || {})) _add(n, sign * q);
    for (const n of b.armas || []) { if (sign > 0) ars().push(n); else { const i = ars().indexOf(n); if (i >= 0) ars().splice(i, 1); } }
    G.dinero.soles += sign * (b.soles || 0);
  }
  const bText = (b) => {
    const p = [...Object.entries(b.items || {}).map(([n, q]) => `${q}× ${n}`), ...(b.armas || []).map((n) => `🗡️ ${n}`), b.soles > 0 ? `☀ ${b.soles} Soles` : ""].filter(Boolean);
    return p.length ? p.map(esc).join(", ") : L("nada", "nothing");
  };

  // =====================================================================
  // 3. TRUEQUE CON COMERCIANTES
  // =====================================================================
  const T = (give, get, note) => ({ give: { items: {}, armas: [], soles: 0, ...give }, get: { items: {}, armas: [], soles: 0, ...get }, note });
  const TRQ = {
    mira: [T({ items: { "Hierba del alba": 3 } }, { items: { "Poción de vida": 2 } }), T({ items: { "Cristal de luz": 2, "Hierba del alba": 2 } }, { armas: ["Cuchillo de Mira"] }, "«Me lo dio mi abuela. Corta hasta la mala suerte.»")],
    sylwen: [T({ items: { "Seda de araña": 3, "Perlas de río": 2 }, soles: 60 }, { armas: ["Arco de Verdemar"] }, "«Tejido con cuerda de araña. No falla.»"), T({ items: { "Perlas de río": 3 } }, { items: { "Poción de maná": 2 } })],
    bako: [T({ items: { "Trigo dorado": 4, "Grano solar": 3 }, soles: 50 }, { armas: ["Puños de Bako"] }, "«Los usé en mi primera Cumbre. ¡Ja!»"), T({ items: { "Trigo dorado": 3 } }, { items: { "Tónico de energía": 2 } })],
    varo: [T({ items: { "Oro pirata": 3, "Coral azul": 2 } }, { armas: ["Garfio de Varo"] }, "«No preguntes de dónde lo saqué.»"), T({ items: { "Brújula maldita": 1 } }, { armas: ["Sable pirata"] }), T({ items: { "Perla eléctrica": 3 } }, { soles: 90 })],
    durgan: [T({ items: { "Mineral de plata": 4, "Cristal eterno": 2 }, soles: 150 }, { armas: ["Hacha rúnica de Durgan"] }, "«Runas de mi clan. Cuídala más que a tu vida.»"), T({ items: { "Mineral de plata": 3 }, armas: ["Hacha de bronce"] }, { armas: ["Hacha rúnica enana"] }, "«Dame tu bronce y te doy acero de verdad.»"), T({ items: { "Piel de yeti": 2 } }, { items: { "Poción mayor de vida": 2 } })],
    ignara: [T({ items: { "Rubí en bruto": 3, "Carbón ardiente": 3 }, soles: 200 }, { armas: ["Martillo de Ignara"] }, "«Forjado en mi yunque. Quema a quien lo merece.»"), T({ items: { "Escama de dragón": 2, "Sal de fuego": 3 }, soles: 300 }, { armas: ["Espada dracónica"] }), T({ items: { "Carbón ardiente": 3 } }, { items: { "Poción mayor de vida": 1, "Tónico de energía": 1 } })],
    morwen: [T({ items: { "Fragmento maldito": 2, "Flor nocturna": 3, "Pétalo de luna": 2 } }, { armas: ["Varita maldita"] }, "«Todo tiene un precio, cariño. Este ya está pagado.»"), T({ items: { "Rosa carmesí": 2 } }, { items: { "Poción de maná": 3 } })],
    oren: [T({ items: { "Oro pirata": 2, "Rubí en bruto": 2, "Cristal eterno": 1 }, soles: 150 }, { armas: ["Estoque del gremio"] }, "«Mercancía de gremio: con sello y todo.»"), T({ items: { "Polvo de estrella": 2 }, soles: 400 }, { armas: ["Filo estelar"] })],
  };
  function trqDo(id, i) {
    const d = TRQ[id]?.[i]; if (!d) return;
    if (!bHas(d.give)) return toast(L("Te falta algo para este trueque.", "You're missing something."));
    bApply(d.give, -1); bApply(d.get, +1); sfx("level");
    const nm = NPC[id]?.n || id; log(`Trueque con ${nm}: diste ${bText(d.give).replace(/&[^;]+;/g, "")} y recibiste ${bText(d.get).replace(/&[^;]+;/g, "")}.`);
    toast(L(`Trueque hecho con ${nm}.`, `Trade done with ${nm}.`)); persist(); render();
  }
  function trqBox() {
    const id = gsel.trq; const deals = TRQ[id]; if (!deals) return "";
    const face = window.SA_SCENE?.face ? window.SA_SCENE.face(id) : "";
    return `<div class="card mini trq"><div class="row between"><div class="row">${face}<b>🔁 ${L("Trueque con", "Barter with")} ${esc(NPC[id]?.n || id)}</b></div><button type="button" class="link" data-trqx="1">${L("Cerrar", "Close")}</button></div>
      ${deals.map((d, i) => { const ok = bHas(d.give); const w = d.get.armas?.[0];
        return `<div class="trqd"><div><small>${L("Das", "You give")}</small><b>${bText(d.give)}</b></div><div class="arr">➜</div><div><small>${L("Recibes", "You get")}</small><b>${bText(d.get)}</b>${w ? `<small>${esc(wDesc(w))}</small>` : ""}${d.note ? `<small class="q">${esc(d.note)}</small>` : ""}</div>
          <button type="button" class="btn small ${ok ? "primary" : ""}" data-trqdo="${id}:${i}" ${ok ? "" : "disabled"}>${ok ? L("Intercambiar", "Trade") : L("Te falta", "Missing")}</button></div>`; }).join("")}
      <p class="note">${L("Los materiales salen de cazar y explorar. También puedes venderlos en la Tienda.", "Materials come from hunting and exploring.")}</p></div>`;
  }

  // ---------- armería ----------
  function armBox() {
    const list = ARMERIA[hereKey()]; if (!list) return "";
    const open = gsel.arm === hereKey(); const m = G.trasfondo === "Mercader ambulante" ? 0.9 : 1;
    return `<div class="card mini armb"><div class="row between"><b>⚒️ ${L("Armería de", "Armory of")} ${esc(pname(G.g.loc.r, G.g.loc.p))}</b><button type="button" class="btn small ${open ? "" : "primary"}" data-arm="1">${open ? L("Cerrar", "Close") : L(`Ver ${list.length} armas`, `See ${list.length} weapons`)}</button></div>
      ${open ? `<div class="shop">${list.map((n) => { const better = WEAPONS[n] > (G.g.arma?.poder || 0);
        return `<div class="si"><span><b>🗡️ ${esc(n)} ${better ? `<span class="pill ok">+${WEAPONS[n] - (G.g.arma?.poder || 0)}</span>` : ""}</b><small>${esc(wDesc(n))}</small></span><button type="button" class="btn small" data-armbuy="${esc(n)}">${Math.ceil(PRICE[n] * m)} Soles</button></div>`; }).join("")}</div>
        <p class="note">${L("Al comprar, te la equipas y tu arma anterior va al arsenal (pestaña Bolsa). Allí puedes cambiar de arma o venderla.", "Buying equips it; your old weapon goes to your arsenal.")}</p>` : ""}</div>`;
  }

  // =====================================================================
  // 4. INTERCAMBIO ENTRE JUGADORES (con depósito)
  // =====================================================================
  // world_state.trades[id] = {id, from, fromChar, fromName, to, toChar, toName, give, want, at, acc?, rej?, cx?, done?}
  // Quien ofrece deja lo que da "en depósito" (se le quita al enviar). Si el otro acepta, recibe lo que pidió;
  // si rechaza o se cancela, se le devuelve. Cada uno solo modifica su propio personaje.
  const TR = () => Store.world?.trades || {};
  const open = (t) => t && !t.acc && !t.rej && !t.cx && !t.done;
  const incoming = () => Object.values(TR()).filter((t) => open(t) && t.toChar === G.id);
  const outgoing = () => Object.values(TR()).filter((t) => t && !t.done && t.fromChar === G.id);
  let draft = null;
  const charById = (id) => Store.all.find((c) => c.id === id);
  function draftStart(id) { const c = charById(id); if (!c) return; draft = { to: id, give: B(), want: B() }; gtab = "grupo"; render(); setTimeout(() => document.querySelector(".trb")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
  function draftStep(side, kind, n, dlt) {
    if (!draft) return; const b = draft[side]; const c = charById(draft.to);
    if (kind === "items") { const max = side === "give" ? G.g.inv[n] || 0 : c?.g?.inv?.[n] || 0; const v = Math.max(0, Math.min(max, (b.items[n] || 0) + dlt)); if (v) b.items[n] = v; else delete b.items[n]; }
    if (kind === "armas") { const pool = side === "give" ? ars() : c?.g?.armas || []; if (dlt > 0 && countIn(b.armas, n) < countIn(pool, n)) b.armas.push(n); if (dlt < 0) { const i = b.armas.indexOf(n); if (i >= 0) b.armas.splice(i, 1); } }
    render();
  }
  async function tradeSend() {
    if (!draft) return; const c = charById(draft.to); if (!c) return;
    const give = draft.give, want = draft.want;
    if (bEmpty(give) && bEmpty(want)) return toast(L("Elige algo para dar o pedir.", "Pick something to give or ask for."));
    if (!bHas(give)) return toast(L("Ya no tienes todo lo que ofreces.", "You no longer have everything you offer."));
    const id = "t" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    bApply(give, -1); persist();
    try {
      await Store.updateWorld({ trades: { [id]: { id, from: Store.uid, fromChar: G.id, fromName: G.nombre, to: c.owner, toChar: c.id, toName: c.nombre, give, want, at: Date.now() } } });
      W().trSet[id] = 0; draft = null; sfx("status"); toast(L(`Oferta enviada a ${c.nombre}. Lo que das queda guardado hasta que responda.`, `Offer sent to ${c.nombre}.`)); log(`Ofreciste un intercambio a ${c.nombre}.`);
    } catch (e) { bApply(give, +1); toast(L("No se pudo enviar la oferta.", "Couldn't send the offer.")); }
    persist(); render();
  }
  async function tradeAccept(id) {
    const t = TR()[id]; if (!open(t) || t.toChar !== G.id) return;
    if (!bHas(t.want)) return toast(L("No tienes todo lo que te piden.", "You don't have everything they ask for."));
    try { await Store.updateWorld({ trades: { [id]: { acc: Date.now() } } }); } catch (e) { return toast(L("No se pudo aceptar.", "Couldn't accept.")); }
    const now = TR()[id]; if (now?.done) return toast(L("La oferta ya se había cancelado.", "The offer was already cancelled."));
    bApply(t.want, -1); bApply(t.give, +1); sfx("level");
    log(`Intercambio con ${t.fromName}: recibiste ${bText(t.give).replace(/&[^;]+;/g, "")}.`); toast(L(`¡Intercambio hecho con ${t.fromName}!`, `Trade done with ${t.fromName}!`)); persist(); render();
  }
  async function tradeMark(id, k) { try { await Store.updateWorld({ trades: { [id]: { [k]: Date.now() } } }); } catch (e) {} render(); }
  let settling = false;
  function settle() {
    if (settling || !G) return;
    for (const t of Object.values(TR())) {
      if (!t || t.fromChar !== G.id || t.done || W().trSet[t.id] === 1) continue;
      if (open(t) && Date.now() - (t.at || 0) > 7 * 864e5) { tradeMark(t.id, "cx"); continue; }
      if (t.acc) { bApply(t.want, +1); toast(L(`🔁 ${t.toName} aceptó tu intercambio.`, `🔁 ${t.toName} accepted your trade.`)); log(`Intercambio con ${t.toName}: recibiste ${bText(t.want).replace(/&[^;]+;/g, "")}.`); sfx("level"); }
      else if (t.rej || t.cx) { bApply(t.give, +1); if (t.rej) toast(L(`${t.toName} rechazó tu intercambio. Te devolvimos lo que ofreciste.`, `${t.toName} declined your trade.`)); }
      else continue;
      W().trSet[t.id] = 1; settling = true; persist();
      Store.updateWorld({ trades: { [t.id]: { done: Date.now() } } }).catch(() => {}).finally(() => { settling = false; });
    }
  }
  let seenIn = null;
  function notifyTrades() {
    const ids = incoming().map((t) => t.id);
    if (seenIn) for (const t of incoming()) if (!seenIn.includes(t.id)) { sfx("status"); toast(L(`📦 ${t.fromName} te ofrece un intercambio (pestaña Grupo).`, `📦 ${t.fromName} offers you a trade (Group tab).`)); }
    seenIn = ids;
  }
  function inboxBox() {
    const inc = incoming(), out = outgoing();
    if (!inc.length && !out.length) return "";
    return `<div class="card trin"><b>📦 ${L("Intercambios", "Trades")}</b>
      ${inc.map((t) => { const ok = bHas(t.want); return `<div class="trr in"><div><small>${esc(t.fromName)} ${L("te ofrece", "offers")}</small><b>${bText(t.give)}</b><small>${L("y pide a cambio", "and asks for")}: ${bText(t.want)}</small></div>
        <div class="row"><button type="button" class="btn small primary" data-tracc="${t.id}" ${ok ? "" : "disabled"}>✔ ${L("Aceptar", "Accept")}</button><button type="button" class="btn small ghost" data-trrej="${t.id}">✖ ${L("Rechazar", "Decline")}</button>${ok ? "" : `<span class="note">${L("No tienes lo que pide.", "You lack what they ask.")}</span>`}</div></div>`; }).join("")}
      ${out.map((t) => `<div class="trr"><div><small>${L("Ofreciste a", "You offered")} ${esc(t.toName)}</small><b>${bText(t.give)}</b><small>${L("por", "for")}: ${bText(t.want)} · ${t.acc ? L("aceptado ✔", "accepted ✔") : t.rej ? L("rechazado", "declined") : t.cx ? L("cancelado", "cancelled") : L("esperando respuesta… (lo que das está guardado)", "waiting… (your items are held)")}</small></div>
        ${open(t) ? `<button type="button" class="btn small ghost" data-trcx="${t.id}">${L("Cancelar", "Cancel")}</button>` : ""}</div>`).join("")}</div>`;
  }
  function pickList(side, c) {
    const b = draft[side]; const mine = side === "give";
    const inv = mine ? G.g.inv : c.g.inv || {}; const armas = mine ? ars() : c.g.armas || []; const soles = mine ? G.dinero.soles : c.dinero?.soles || 0;
    const uniq = [...new Set(armas)];
    const items = Object.entries(inv).filter(([, q]) => q > 0);
    return `<div class="trcol"><h4>${mine ? L("Tú das", "You give") : L(`Pides a ${esc(c.nombre)}`, `You ask ${esc(c.nombre)}`)}</h4>
      ${uniq.length ? `<small class="lbl">🗡️ ${L("Armas del arsenal", "Arsenal weapons")}</small><div class="chips">${uniq.map((n) => { const k = countIn(b.armas, n), h = countIn(armas, n);
        return `<span class="tcnt"><button type="button" class="chip ${k ? "on" : ""}" data-trq="${side}|armas|${esc(n)}|1" title="${esc(wDesc(n))}">${esc(n)}${h > 1 ? ` ×${h}` : ""}${k ? ` ✔${k > 1 ? k : ""}` : ""}</button>${k ? `<button type="button" class="chip" data-trq="${side}|armas|${esc(n)}|-1">−</button>` : ""}</span>`; }).join("")}</div>` : `<small class="lbl">🗡️ ${L("Sin armas guardadas", "No stored weapons")}${mine ? L(" (el arma equipada no se puede dar)", " (equipped can't be traded)") : ""}</small>`}
      ${items.length ? `<small class="lbl">🎒 ${L("Objetos", "Items")}</small><div class="tlist">${items.map(([n, q]) => { const k = b.items[n] || 0;
        return `<div class="ti ${k ? "on" : ""}"><span>${esc(n)} <small>(${q})</small></span><span><button type="button" class="chip" data-trq="${side}|items|${esc(n)}|-1" ${k ? "" : "disabled"}>−</button><b>${k}</b><button type="button" class="chip" data-trq="${side}|items|${esc(n)}|1" ${k < q ? "" : "disabled"}>+</button></span></div>`; }).join("")}</div>` : `<small class="lbl">🎒 ${L("Bolsa vacía", "Empty bag")}</small>`}
      <label class="lbl">☀ Soles <small>(${L("tiene", "has")} ${soles})</small> <input type="number" min="0" max="${soles}" value="${b.soles || 0}" data-trsol="${side}" style="width:90px"></label></div>`;
  }
  function draftBox() {
    if (!draft) return ""; const c = charById(draft.to); if (!c) { draft = null; return ""; }
    return `<div class="card trb"><div class="row between"><b>🔁 ${L("Intercambio con", "Trade with")} ${esc(c.nombre)} <small class="muted">(${esc(who(c))})</small></b><button type="button" class="link" data-trclose="1">${L("Cerrar", "Close")}</button></div>
      <div class="trcols">${pickList("give", c)}${pickList("want", c)}</div>
      <div class="trsum"><div>${L("Das", "You give")}: <b>${bText(draft.give)}</b></div><div>${L("Recibes", "You get")}: <b>${bText(draft.want)}</b></div></div>
      <div class="row"><button type="button" class="btn primary" data-trsend="1">📦 ${L("Enviar oferta", "Send offer")}</button><span class="note">${L(`${c.nombre} la verá en su pestaña Grupo. Lo que das se guarda mientras decide; si rechaza, vuelve a ti.`, "They'll see it in their Group tab.")}</span></div></div>`;
  }

  // =====================================================================
  // 5. PRESENCIA: qué hace cada uno
  // =====================================================================
  const setAct = (t) => { if (G?.g) G.g.act = { t, at: Date.now() }; };
  // las funciones de game.js son globales: se reasignan con su nombre
  const _explore = explore; explore = function () { setAct(`🔎 ${L("Explorando", "Exploring")} ${pname(G.g.loc.r, G.g.loc.p)}`); return _explore.apply(this, arguments); };
  const _rest = rest; rest = function () { setAct(`💤 ${L("Descansando en", "Resting at")} ${pname(G.g.loc.r, G.g.loc.p)}`); return _rest.apply(this, arguments); };
  const _travel = travel; travel = function (to) { gsel.trq = null; gsel.arm = null; try { setAct(`🧭 ${L("Viajó a", "Traveled to")} ${pname(to.r, to.p)}`); } catch (e) {} return _travel.apply(this, arguments); };
  const _class = studyClass; studyClass = function () { setAct(`📚 ${L("En clase en la academia", "In class")}`); return _class.apply(this, arguments); };
  const _train = train; train = function () { setAct(`🏋️ ${L("Entrenando", "Training")}`); return _train.apply(this, arguments); };
  const _med = meditate; meditate = function () { setAct(`🧘 ${L("Meditando", "Meditating")}`); return _med.apply(this, arguments); };
  if (typeof storyChoice === "function") { const _sc = storyChoice; storyChoice = function () { setAct(`📜 ${L("Tomando una decisión de la historia", "Making a story choice")}`); return _sc.apply(this, arguments); }; }
  if (window.SA_SCENE?.open) { const _op = window.SA_SCENE.open; window.SA_SCENE.open = function () { setAct(`🎬 ${L("Viendo una escena de la historia", "Watching a story scene")}`); return _op.apply(this, arguments); }; }
  const _persist = persist;
  persist = function () {
    try { if (G?.g) { migrate(); if (G.g.combat) { const e = G.g.combat.enemies.find((x) => x.pv > 0) || G.g.combat.enemies[0]; setAct(`⚔️ ${G.g.combat.raid ? L("Combate de grupo contra", "Group fight vs") : L("Peleando contra", "Fighting")} ${e?.n || "?"}`); } else if (/^⚔️/.test(G.g.act?.t || "")) setAct(`🏆 ${L("Acaba de ganar un combate", "Just won a fight")}`); } } catch (e) {}
    return _persist.apply(this, arguments);
  };
  setInterval(() => { try { if (G && view.name === "game" && !document.hidden) persist(); } catch (e) {} }, 90000);

  function actOf(c) {
    if (!isOn(c)) return `💤 ${L("Desconectado", "Offline")} · ${L("visto", "seen")} ${ago(c.lastSeen || c.updatedAt)}`;
    if (c.g?.combat) { const e = c.g.combat.enemies?.find((x) => x.pv > 0) || c.g.combat.enemies?.[0]; return `⚔️ ${c.g.combat.raid ? L("Combate de grupo contra", "Group fight vs") : L("Peleando contra", "Fighting")} ${e?.n || "?"}`; }
    return c.g?.act?.t || `📍 ${L("Por", "Around")} ${pname(c.g.loc.r, c.g.loc.p)}`;
  }
  const capName = (cap) => { const a = typeof arcOf === "function" ? arcOf(cap) : null; return a ? L(`Arco ${a.n} · Cap. ${cap - a.from + 1}`, `Arc ${a.n} · Ch. ${cap - a.from + 1}`) : L(`Cap. ${cap}`, `Ch. ${cap}`); };
  function relOf(c) {
    const m = c.g?.mis; const me = G.g.mis; if (!m || !me || !window.SA_STORY) return { t: "", k: "" };
    const mc = window.SA_STORY.cap(), mi = window.SA_STORY.step();
    if (m.cap > mc) return { t: L(`va ${m.cap - mc} cap. por delante`, `${m.cap - mc} ch. ahead`), k: "ahead" };
    if (m.cap < mc) return { t: L(`va ${mc - m.cap} cap. por detrás`, `${mc - m.cap} ch. behind`), k: "behind" };
    if (m.i === mi) return { t: L("¡en el mismo paso que tú!", "same step as you!"), k: "same" };
    return { t: m.i > mi ? L(`mismo capítulo · ${m.i - mi} paso(s) por delante`, "same chapter, ahead") : L(`mismo capítulo · ${mi - m.i} paso(s) por detrás`, "same chapter, behind"), k: "samecap" };
  }
  const storyOf = (c) => { const m = c.g?.mis; if (!m || !window.SA_STORY) return ""; const ch = typeof STORY !== "undefined" ? STORY.find((s) => s.cap === m.cap) : null; return `📜 ${capName(m.cap)}${ch ? ` «${ch.t}»` : ""} · ${window.SA_STORY.labelOf(m)}`; };
  const face = (c, cls = "rimg pface") => (typeof raceImg === "function" ? raceImg(c.raza, cls) : "") || `<span class="pface e">🧑</span>`;
  const byRecent = (a, b) => (isOn(b) - isOn(a)) || (b.lastSeen || 0) - (a.lastSeen || 0);

  function playersBox() {
    const list = others().sort(byRecent);
    if (!list.length) return `<div class="card mini"><b>🧭 ${L("Jugadores", "Players")}</b><p class="muted">${L("Todavía no hay otros personajes en la partida.", "No other characters yet.")}</p></div>`;
    return `<h3 class="sub">🧭 ${L("Dónde está y qué hace cada jugador", "Where everyone is and what they're doing")}</h3><div class="plist">${list.map((c) => { const rel = relOf(c); const same = keyOf(c.g.loc) === hereKey();
      return `<div class="pc ${isOn(c) ? "on" : "off"}">${face(c)}<div><b><i class="dot"></i>${esc(c.nombre)}</b><small>${esc(who(c))} · ${L("Nv", "Lv")} ${c.nivel} · ${esc(c.raza)}</small>
        <small>📍 ${esc(pname(c.g.loc.r, c.g.loc.p))}, ${esc(rname(c.g.loc.r))}${same ? ` · <b class="okc">${L("¡aquí contigo!", "here with you!")}</b>` : ""}</small>
        <small>${esc(actOf(c))}</small><small>${esc(storyOf(c))}${rel.t ? ` · <span class="rel ${rel.k}">${esc(rel.t)}</span>` : ""}</small>
        <div class="row"><button type="button" class="btn small" data-trnew="${c.id}">🔁 ${L("Intercambiar", "Trade")}</button>${same ? "" : `<button type="button" class="btn small ghost" data-go="${keyOf(c.g.loc)}">🧭 ${L("Ir con", "Go to")} ${esc(c.nombre.split(" ")[0])}</button>`}</div></div></div>`; }).join("")}</div>`;
  }
  function hereBox() {
    const list = others().filter((c) => keyOf(c.g.loc) === hereKey() && isOn(c));
    if (!list.length) return "";
    return `<div class="card mini herep"><b>👥 ${L("Aquí también están", "Also here")}</b><div class="plist sm">${list.map((c) => `<div class="pc on">${face(c)}<div><b><i class="dot"></i>${esc(c.nombre)}</b><small>${esc(actOf(c))}</small><small>${esc(storyOf(c))}</small>
      <div class="row"><button type="button" class="btn small" data-trnew="${c.id}">🔁 ${L("Intercambiar", "Trade")}</button></div></div></div>`).join("")}</div>
      <p class="note">${L("Para pelear juntos usa «Cazar en grupo» o «Pelea de la historia en grupo» en Combates de grupo.", "Use «Hunt together» to fight together.")}</p></div>`;
  }
  function matesStrip() {
    const list = others().filter((c) => c.g.mis).sort(byRecent).slice(0, 8); if (!list.length) return "";
    return `<div class="qt-mates">${list.map((c) => { const rel = relOf(c); return `<span class="mate ${isOn(c) ? "" : "off"} ${rel.k}" title="${esc(storyOf(c))} · ${esc(actOf(c))}">${face(c, "rimg mface")}<b>${esc(c.nombre.split(" ")[0])}</b><small>${esc(rel.t || capName(c.g.mis.cap))}</small></span>`; }).join("")}</div>`;
  }
  function coopBtns() {
    if (!window.SA_STORY || !window.SA_RAID) return "";
    const list = window.SA_RAID.activeRaids(); const fe = window.SA_STORY.fightEnemy();
    if (fe && fe.place === hereKey()) {
      const r = list.find(([, x]) => x.mis === fe.key); if (r) return `<button type="button" class="btn small" data-raid="${r[0]}">👥 ${L("Unirse al grupo", "Join group")}</button>`;
      return `<button type="button" class="btn small" data-raidnew="mision">👥 ${L("Pelear con el grupo", "Fight with group")}</button>`;
    }
    const st = window.SA_STORY.stepsOf(window.SA_STORY.cap())[window.SA_STORY.step()];
    if (st && st.k === "hunt" && `${st.r}:${st.p}` === hereKey()) {
      const r = list.find(([, x]) => x.kind === "monster" && x.place === hereKey()); if (r) return `<button type="button" class="btn small" data-raid="${r[0]}">🐾 ${L("Unirse a la caza", "Join hunt")}</button>`;
      return `<button type="button" class="btn small" data-raidnew="monster">🐾👥 ${L("Cazar en grupo", "Hunt together")}</button>`;
    }
    return "";
  }

  // =====================================================================
  // 6. VISTAS
  // =====================================================================
  const _gameView = gameView;
  gameView = function () {
    let out = _gameView();
    if (!G || G.g.combat) return out;
    const n = incoming().length;
    if (n) out = out.replace(/(<button type="button" data-gtab="grupo" class="[^"]*">[^<]*)/, `$1 <span class="trbadge">${n}</span>`);
    const i = out.indexOf('<div class="qtrack">');
    if (i >= 0) { const j = out.indexOf('<div class="qt-r">', i); if (j >= 0) out = out.slice(0, j) + matesStrip() + `<div class="qt-r">` + coopBtns() + out.slice(j + '<div class="qt-r">'.length); }
    return out;
  };
  const _placeView = placeView;
  placeView = function () {
    const out = _placeView(); const extra = hereBox() + armBox() + trqBox();
    if (!extra) return out;
    const re = /(<div class="scene"[\s\S]*?<\/div><\/div>)/;
    return re.test(out) ? out.replace(re, `$1${extra}`) : extra + out;
  };
  // botón de trueque junto a «Hablar» de los comerciantes
  const _pv2 = placeView;
  placeView = function () {
    return _pv2().replace(/(<button type="button" class="btn small" data-talk="([a-z]+)">[^<]*<\/button>)/g, (m, b, id) => (TRQ[id] ? `${b}<button type="button" class="btn small primary" data-trqopen="${id}">🔁 ${L("Trueque", "Barter")}</button>` : b));
  };
  const _groupView = groupView;
  groupView = function () {
    const out = _groupView();
    const add = inboxBox() + draftBox() + playersBox();
    return out.replace(/(<h2>[^<]*<\/h2>)/, `$1${add}`);
  };
  const _bagView = bagView;
  bagView = function () {
    const out = _bagView(); const a = ars();
    const box = `<div class="card mini arsenal"><b>🗡️ ${L("Arsenal", "Arsenal")}</b>
      <div class="si eq"><span><b>✔ ${esc(G.g.arma.n)}</b><small>${L("Equipada", "Equipped")} · ${esc(wDesc(G.g.arma.n))}</small></span></div>
      ${a.length ? a.map((n, i) => { const dlt = (WEAPONS[n] ?? 0) - (G.g.arma.poder || 0);
        return `<div class="si"><span><b>${esc(n)} ${dlt ? `<span class="pill ${dlt > 0 ? "ok" : ""}">${dlt > 0 ? "+" : ""}${dlt}</span>` : ""}</b><small>${esc(wDesc(n))}</small></span><span class="row"><button type="button" class="btn small" data-equip="${i}">${L("Equipar", "Equip")}</button><button type="button" class="btn small ghost" data-wsell="${i}">+${wSell(n)} Soles</button></span></div>`; }).join("")
        : `<p class="muted">${L("No tienes más armas. Cómpralas en las armerías (Pueblo del Alba, Copaalta, Trigalia, el Puerto, Minas de Durgan, Forjaroja, el Muelle de la ciénaga, los Gremios de la Capital), consíguelas como trofeo de jefes o por trueque e intercambio.", "No other weapons yet.")}</p>`}</div>`;
    return out.replace(/(<\/p>)/, `$1${box}`);
  };
  const _storyView = storyView;
  storyView = function () {
    let out = _storyView();
    if (!window.SA_STORY) return out;
    const cap = window.SA_STORY.cap(); const all = others().filter((c) => c.g.mis);
    if (!all.length) return out;
    const same = all.filter((c) => c.g.mis.cap === cap);
    const parts = out.split('<li class="qs ');
    for (let k = 1; k < parts.length; k++) {
      const here = same.filter((c) => c.g.mis.i === k - 1); if (!here.length) continue;
      parts[k] = parts[k].replace("</b>", `</b><span class="stepm">${here.map((c) => `<span class="mate ${isOn(c) ? "" : "off"}" title="${esc(actOf(c))}">${face(c, "rimg mface")}<b>${esc(c.nombre.split(" ")[0])}</b></span>`).join("")}</span>`);
    }
    out = parts.join('<li class="qs ');
    const box = `<div class="card mini gprog"><b>👥 ${L("Progreso del grupo en la historia", "Group story progress")}</b>${all.sort(byRecent).map((c) => { const rel = relOf(c); return `<div class="gp ${isOn(c) ? "" : "off"}">${face(c, "rimg mface")}<div><b>${esc(c.nombre)}</b> <small>${esc(storyOf(c))}</small>${rel.t ? ` <span class="rel ${rel.k}">${esc(rel.t)}</span>` : ""}</div></div>`; }).join("")}
      <p class="note">${L("Si alguien está en la misma pelea que tú, pulsa «Pelear con el grupo» o únete a su combate: la vida del enemigo se comparte y el paso cuenta para los dos.", "Fight story battles together: the step counts for everyone on it.")}</p></div>`;
    return out.replace('<ol class="qsteps">', box + '<ol class="qsteps">');
  };
  const _mapView = mapView;
  mapView = function () {
    let out = _mapView();
    const all = Store.all.filter((c) => c.g?.loc && c.id !== G.id && P[c.g.loc.r]?.[c.g.loc.p]);
    const slot = {}; let mk = "";
    all.sort(byRecent).forEach((c, idx) => {
      const k = keyOf(c.g.loc); const s = (slot[k] = (slot[k] || 0) + 1) - 1; const xy = P[c.g.loc.r][c.g.loc.p].xy;
      const ang = (-90 + s * 55) * Math.PI / 180; const x = Math.round(xy[0] + 40 * Math.cos(ang)), y = Math.round(xy[1] + 40 * Math.sin(ang));
      const rid = raceId(c.raza);
      mk += `<g class="pmk ${isOn(c) ? "on" : "off"}" data-pin="${k}"><title>${esc(c.nombre)} · ${esc(actOf(c))}</title><line x1="${xy[0]}" y1="${xy[1]}" x2="${x}" y2="${y}"></line><clipPath id="pmc${idx}"><circle cx="${x}" cy="${y}" r="19"></circle></clipPath><circle class="ring" cx="${x}" cy="${y}" r="22"></circle>${rid ? `<image href="razas/${rid}.png" x="${x - 19}" y="${y - 19}" width="38" height="38" clip-path="url(#pmc${idx})" preserveAspectRatio="xMidYMid slice"></image>` : `<text x="${x}" y="${y + 6}" class="em">🧑</text>`}<text class="nm" x="${x}" y="${y + 38}">${esc(c.nombre.split(" ")[0])}</text></g>`;
    });
    const at = out.lastIndexOf("</svg>");
    if (mk && at >= 0) out = out.slice(0, at) + mk + out.slice(at);
    const list = [G, ...others().sort(byRecent)];
    const where = `<div class="card mini wherebox"><b>🧭 ${L("Dónde está cada jugador", "Where everyone is")}</b>${list.map((c) => { const me = c.id === G.id; const l = c.g.loc;
      return `<div class="wr ${me || isOn(c) ? "" : "off"}">${face(c, "rimg mface")}<div><b>${esc(c.nombre)}${me ? ` <small>(${L("tú", "you")})</small>` : ""}</b><small>📍 ${esc(pname(l.r, l.p))}, ${esc(rname(l.r))} · ${esc(me ? L("Aquí estás", "You are here") : actOf(c))}</small></div>
        ${me ? "" : `<button type="button" class="btn small ghost" data-pin="${keyOf(l)}">${L("Ver", "View")}</button>`}</div>`; }).join("")}</div>`;
    return out + where;
  };

  // =====================================================================
  // 7. CLICS Y ENGANCHES
  // =====================================================================
  document.addEventListener("click", (ev) => {
    if (view.name !== "game" || !G) return;
    const t = ev.target.closest("button"); if (!t) return; const d = t.dataset;
    const stop = () => ev.stopPropagation();
    if (d.trnew) { stop(); return draftStart(d.trnew); }
    if (d.trq) { stop(); const [side, kind, n, dl] = d.trq.split("|"); return draftStep(side, kind, n, +dl); }
    if (d.trsend) { stop(); return tradeSend(); }
    if (d.trclose) { stop(); draft = null; return render(); }
    if (d.tracc) { stop(); return tradeAccept(d.tracc); }
    if (d.trrej) { stop(); return tradeMark(d.trrej, "rej"); }
    if (d.trcx) { stop(); return tradeMark(d.trcx, "cx"); }
    if (d.trqopen) { stop(); gsel.trq = gsel.trq === d.trqopen ? null : d.trqopen; render(); return setTimeout(() => document.querySelector(".trq")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); }
    if (d.trqx) { stop(); gsel.trq = null; return render(); }
    if (d.trqdo) { stop(); const [id, i] = d.trqdo.split(":"); return trqDo(id, +i); }
    if (d.arm) { stop(); gsel.arm = gsel.arm === hereKey() ? null : hereKey(); return render(); }
    if (d.armbuy) { stop(); return armBuy(d.armbuy); }
    if (d.equip) { stop(); return equip(+d.equip); }
    if (d.wsell) { stop(); return sellW(+d.wsell); }
  }, true);
  document.addEventListener("change", (ev) => {
    const s = ev.target?.dataset?.trsol; if (!s || !draft) return;
    const c = charById(draft.to); const max = s === "give" ? G.dinero.soles : c?.dinero?.soles || 0;
    draft[s].soles = Math.max(0, Math.min(max, Math.floor(+ev.target.value || 0))); ev.target.value = draft[s].soles; render();
  });
  const _render = render;
  render = function () {
    try { if (G && view.name === "game") { migrate(); settle(); } } catch (e) { console.warn("social:", e); }
    const r = _render.apply(this, arguments);
    try { if (G && view.name === "game") notifyTrades(); } catch (e) {}
    return r;
  };

  const css = `
.trbadge{display:inline-block;min-width:18px;padding:0 5px;border-radius:9px;background:#e0584a;color:#fff;font-size:11px;line-height:18px;text-align:center;margin-left:4px}
.qt-mates{display:flex;gap:6px;flex-wrap:wrap;width:100%;order:3}
.mate{display:inline-flex;align-items:center;gap:5px;padding:2px 8px 2px 2px;border-radius:14px;background:#0b131c99;border:1px solid var(--line);font-size:12px}
.mate b{font-weight:600}.mate small{color:var(--ink-2)}.mate.off{opacity:.45}.mate.same{border-color:#8be0a8}.mate.ahead{border-color:#d9a44188}
.mface{width:24px;height:24px;border-radius:50%;object-fit:cover;background:#1b2635}
.stepm{display:inline-flex;gap:4px;margin-left:8px;vertical-align:middle;flex-wrap:wrap}
.rel{font-size:12px;padding:1px 6px;border-radius:8px;background:#1b2635;color:var(--ink-2)}.rel.same{color:#8be0a8}.rel.ahead{color:#ffd84a}.rel.behind{color:#9bc3ff}.rel.samecap{color:#cfe8ff}
.plist{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px;margin:8px 0 14px}.plist.sm{grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.pc{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:8px;padding:10px;background:var(--panel-2)}
.pc>div{display:flex;flex-direction:column;gap:3px;min-width:0}.pc small{color:var(--ink-2);font-size:12.5px}.pc.off{opacity:.6}
.pface{width:46px;height:46px;border-radius:50%;object-fit:cover;flex:none;background:#1b2635}.pface.e{display:flex;align-items:center;justify-content:center;font-size:24px}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#56657a;margin-right:6px;vertical-align:middle}.pc.on .dot{background:#8be0a8;box-shadow:0 0 6px #8be0a8}
.okc{color:#8be0a8}
.gprog .gp{display:flex;gap:8px;align-items:center;margin-top:6px}.gprog .gp.off{opacity:.55}.gprog small{color:var(--ink-2)}
.trin .trr{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:8px;margin-top:8px}
.trin .trr>div:first-child{display:flex;flex-direction:column;gap:2px;flex:1;min-width:220px}.trin .trr.in{background:#d9a44112;border-radius:6px;padding:8px}.trin small{color:var(--ink-2)}
.trb{border-color:#d9a44166}.trcols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}@media(max-width:700px){.trcols{grid-template-columns:1fr}}
.trcol{border:1px solid var(--line);border-radius:8px;padding:10px;background:#0b131c66;display:flex;flex-direction:column;gap:6px}.trcol h4{margin:0}
.trcol .lbl{color:var(--ink-2);font-size:12.5px}.tcnt{display:inline-flex;gap:2px}
.tlist{display:flex;flex-direction:column;gap:4px;max-height:220px;overflow:auto}.ti{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:13px;padding:2px 4px;border-radius:4px}.ti.on{background:#8be0a814}
.ti span:last-child{display:inline-flex;align-items:center;gap:6px}.ti small{color:var(--ink-2)}
.trsum{display:flex;flex-direction:column;gap:4px;margin:6px 0 10px;font-size:13.5px}
.trq .trqd{display:grid;grid-template-columns:1fr auto 1fr auto;gap:10px;align-items:center;border-top:1px solid var(--line);padding-top:8px;margin-top:8px}
.trq .trqd>div{display:flex;flex-direction:column;gap:2px}.trq small{color:var(--ink-2)}.trq small.q{font-style:italic;color:#d9c9a0}.trq .arr{color:#d9a441;font-size:18px}
.trq .npcface{width:44px;height:44px}@media(max-width:700px){.trq .trqd{grid-template-columns:1fr}.trq .arr{display:none}}
.arsenal .si.eq{border-left:3px solid #8be0a8;padding-left:8px}
.pmk line{stroke:#fff8;stroke-width:2;stroke-dasharray:4 3}.pmk .ring{fill:#0b131c;stroke:#8be0a8;stroke-width:3}.pmk.off .ring{stroke:#56657a}.pmk.off{opacity:.6}
.pmk .nm{fill:#fff;font-size:17px;font-weight:700;text-anchor:middle;paint-order:stroke;stroke:#000c;stroke-width:4px}.pmk .em{font-size:20px;text-anchor:middle}
.pmk{cursor:pointer}.pmk.on .ring{animation:pmkp 2s ease-in-out infinite}@keyframes pmkp{50%{stroke-width:6}}
.wherebox .wr{display:flex;gap:8px;align-items:center;margin-top:6px}.wherebox .wr>div{flex:1;display:flex;flex-direction:column}.wherebox small{color:var(--ink-2)}.wherebox .wr.off{opacity:.55}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
