// ===================== EXTRA =====================
// Chat del grupo · Forja (+1…+6) · Armaduras y accesorios · Jefe mundial semanal · Mazmorras (en grupo)
// Duelos entre jugadores · Cofre del grupo · Misiones diarias · Mascotas y monturas · Guía para nuevos + Novedades.
// Carga después de social.js.
(function () {
  if (typeof render !== "function") return;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const sfx = (k) => { try { window.SA_SFX?.[k]?.(); } catch (e) {} };
  const ACTIVE = 20 * 60e3;
  const isOn = (c) => Date.now() - (c.lastSeen || c.updatedAt || 0) < ACTIVE;
  const pname = (r, p) => (P[r] && P[r][p] ? P[r][p].n : "?");
  const hereKey = () => `${G.g.loc.r}:${G.g.loc.p}`;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const today = () => new Date().toLocaleDateString("sv");
  const W = () => { const g = G.g; if (!g.w) g.w = {}; const w = g.w; for (const k of ["dunDay", "pvpDay", "wb"]) if (!w[k]) w[k] = {}; return w; };
  const others = () => Store.all.filter((c) => c.owner !== Store.uid && c.g && c.g.loc);
  const meAll = () => Store.all.map((c) => (c.id === G.id ? G : c));
  const isMat = (n) => !SHOP.some((s) => s.n === n) && !ATTR_ITEMS[n] && !WEAR[n] && WEAPONS[n] == null && !/Libros|Uniforme|Poción|Tónico|Núcleo de evolución/.test(n);
  const addAct = (t) => { if (G?.g) G.g.act = { t, at: Date.now() }; };

  // =====================================================================
  // 1. ARMADURAS Y ACCESORIOS (son objetos de la bolsa: se pueden intercambiar)
  // =====================================================================
  // s: tipo de ranura (cabeza, hombros, pecho, manos, pies, capa, cuello, anillo, amuleto, escudo)
  // def, pv, dmg, init, xp (fracción), mana · p: precio · at: tienda ("drop" = solo botín) · r: rareza c/r/e/l
  const WEAR = {
    "Túnica acolchada": { s: "pecho", def: 1, pv: 10, p: 60, at: "alba:0" }, "Cuero de lobo": { s: "pecho", def: 1, pv: 20, p: 140, at: "verde:0" },
    "Cota de mallas": { s: "pecho", def: 2, pv: 25, p: 260, at: "llan:0" }, "Coraza de coral": { s: "pecho", def: 2, pv: 40, p: 380, at: "costa:0" },
    "Armadura enana": { s: "pecho", def: 3, pv: 50, p: 520, at: "esc:1" }, "Placas de obsidiana": { s: "pecho", def: 4, pv: 70, p: 800, at: "quem:0" },
    "Coraza del pantano": { s: "pecho", def: 4, pv: 65, p: 820, at: "viol:0" }, "Armadura real": { s: "pecho", def: 5, pv: 90, p: 1100, at: "cap:1" }, "Armadura estelar": { s: "pecho", def: 6, pv: 140, p: 1900, at: "lost:0" },
    "Manto del velo": { s: "capa", def: 2, pv: 30, init: 2, p: 780, at: "viol:0" },
    "Anillo de cobre": { s: "anillo", dmg: 1, p: 40, at: "alba:0" }, "Amuleto del viento": { s: "cuello", init: 2, pv: 10, p: 120, at: "verde:0" },
    "Colgante de la suerte": { s: "cuello", xp: 0.05, pv: 15, p: 200, at: "llan:0" }, "Perla de marea": { s: "amuleto", mana: 40, p: 250, at: "costa:0" },
    "Anillo rúnico": { s: "anillo", dmg: 3, p: 450, at: "esc:1" }, "Ojo del velo": { s: "amuleto", init: 3, xp: 0.05, p: 700, at: "viol:0" }, "Sello del gremio": { s: "amuleto", xp: 0.1, p: 900, at: "cap:1" },
    // botín (épico / legendario)
    "Amuleto del alba": { s: "cuello", def: 1, init: 1, pv: 10, p: 90, at: "drop", r: "e" }, "Anillo de Valcor": { s: "anillo", dmg: 2, pv: 20, p: 300, at: "drop", r: "e" },
    "Brazalete de brasa": { s: "manos", dmg: 4, p: 600, at: "drop", r: "e" }, "Escamas de dragón": { s: "pecho", def: 6, pv: 120, p: 1500, at: "drop", r: "e" },
    "Corazón de dragón": { s: "amuleto", dmg: 5, pv: 50, p: 1400, at: "drop", r: "e" }, "Yelmo del Minotauro": { s: "cabeza", def: 3, pv: 40, dmg: 1, p: 700, at: "drop", r: "e" },
    "Capa de la Capitana": { s: "capa", def: 2, init: 3, pv: 30, p: 900, at: "drop", r: "e" }, "Botas del Viento Norte": { s: "pies", init: 4, def: 1, p: 850, at: "drop", r: "e" },
    "Hombreras del Rey Trol": { s: "hombros", def: 3, pv: 70, p: 1000, at: "drop", r: "e" }, "Escudo del Gólem": { s: "escudo", def: 5, pv: 40, p: 900, at: "drop", r: "e" },
    "Anillo de la Esfinge": { s: "anillo", dmg: 4, xp: 0.05, p: 1100, at: "drop", r: "e" }, "Colgante de la Reina Araña": { s: "cuello", dmg: 2, init: 2, pv: 30, p: 950, at: "drop", r: "e" },
    "Guanteletes de Pyrax": { s: "manos", dmg: 6, def: 2, p: 1600, at: "drop", r: "e" },
    "Coraza del Titán": { s: "pecho", def: 6, pv: 140, dmg: 2, p: 1800, at: "drop", r: "l" }, "Armadura del Umbral": { s: "pecho", def: 7, pv: 160, p: 2200, at: "drop", r: "l" },
    "Corona del Relojero": { s: "cabeza", dmg: 6, init: 3, def: 2, p: 2000, at: "drop", r: "l" }, "Lágrima de estrella": { s: "amuleto", xp: 0.15, mana: 100, p: 1800, at: "drop", r: "l" },
    "Égida del Amanecer": { s: "escudo", def: 8, pv: 80, p: 2400, at: "drop", r: "l" },
  };
  // armaduras por región (9 niveles de tienda)
  const TIER_AT = ["alba:0", "verde:0", "llan:0", "costa:0", "esc:1", "quem:0", "viol:0", "cap:1", "lost:0"];
  const TMUL = [1, 2.3, 4, 6, 8, 12, 13, 17, 28];
  const GEN = {
    cabeza: [40, ["Capucha de cuero", "Casco de hojas", "Yelmo de bronce", "Tricornio de coral", "Yelmo enano", "Casco de obsidiana", "Capucha del velo", "Yelmo real", "Diadema estelar"], (t) => ({ def: Math.ceil(t / 3), pv: 5 * t })],
    hombros: [35, ["Hombreras de cuero", "Hombreras de corteza", "Hombreras de bronce", "Hombreras de caparazón", "Hombreras de mithril", "Hombreras de magma", "Hombreras de sombra", "Hombreras reales", "Hombreras del cometa"], (t) => ({ def: Math.ceil(t / 3), pv: 4 * t })],
    manos: [35, ["Guantes de cuero", "Guantes de enredadera", "Guanteletes de bronce", "Guantes de pescador", "Guanteletes enanos", "Guanteletes de ceniza", "Guantes del velo", "Guanteletes reales", "Guantes astrales"], (t) => ({ dmg: Math.ceil(t / 2), def: Math.floor(t / 3) })],
    pies: [30, ["Botas de viaje", "Botas del bosque", "Grebas de bronce", "Botas de marinero", "Botas de nieve", "Grebas de obsidiana", "Botas de ciénaga", "Grebas reales", "Botas de nube"], (t) => ({ init: Math.ceil(t / 3), def: Math.floor(t / 3), pv: 2 * t })],
    capa: [35, ["Capa de lana", "Capa de hojas", "Capa del mercader", "Capa de vela", "Capa de piel de yeti", "Capa de ceniza", null, "Capa real", "Capa de las estrellas"], (t) => ({ def: Math.ceil(t / 3), init: Math.floor(t / 3), pv: 3 * t })],
    cuello: [40, ["Colgante de madera", null, null, "Collar de conchas", "Colgante de plata", "Collar de rubíes", "Gargantilla maldita", "Collar del gremio", "Collar de constelaciones"], (t) => ({ pv: 5 * t, mana: 8 * t })],
    anillo: [40, [null, "Anillo de raíz", "Anillo de bronce", "Anillo de coral", null, "Anillo de rubí", "Anillo de sombra", "Anillo del rey", "Anillo del cometa"], (t) => ({ dmg: Math.ceil(t / 1.5) })],
    amuleto: [50, ["Pata de conejo", "Bellota tallada", "Dado de la fortuna", null, "Runa de escarcha", "Brasa eterna", null, null, "Fragmento de estrella"], (t) => ({ xp: Math.min(0.18, 0.02 * t), mana: 10 * t })],
    escudo: [45, ["Escudo de madera", "Escudo de corteza", "Escudo de bronce", "Escudo de caparazón", "Escudo enano", "Escudo de obsidiana", "Escudo del velo", "Escudo real", "Égida estelar"], (t) => ({ def: Math.ceil(t * 0.6), pv: 3 * t })],
  };
  for (const [s, [base, names, st]] of Object.entries(GEN)) names.forEach((n, i) => { if (n && !WEAR[n]) WEAR[n] = { s, ...st(i + 1), p: Math.round(base * TMUL[i]), at: TIER_AT[i], r: i >= 4 ? "r" : "c", t: i + 1 }; });
  for (const w of Object.values(WEAR)) if (!w.r) w.r = w.p >= 500 ? "r" : "c";
  const SLOTS = ["cabeza", "hombros", "pecho", "manos", "pies", "capa", "cuello", "anillo1", "anillo2", "amuleto", "escudo"];
  const slotType = (sl) => (sl.startsWith("anillo") ? "anillo" : sl);
  const wearDesc = (n) => { const w = WEAR[n]; if (!w) return ""; return [w.def && `+${w.def} ${L("Defensa", "Defense")}`, w.pv && `+${w.pv} PV`, w.dmg && `+${w.dmg} ${L("daño", "dmg")}`, w.init && `+${w.init} ${L("iniciativa", "init")}`, w.xp && `+${Math.round(w.xp * 100)}% XP`, w.mana && `+${w.mana} ${L("maná", "mana")}`].filter(Boolean).join(" · "); };
  const OLD_ACC = { "Anillo de cobre": "anillo1", "Anillo rúnico": "anillo1", "Anillo de Valcor": "anillo1", "Brazalete de brasa": "manos", "Corona del Relojero": "cabeza", "Amuleto del alba": "cuello", "Amuleto del viento": "cuello", "Colgante de la suerte": "cuello" };
  const eq = () => {
    const e = G.g.eq || (G.g.eq = { pvB: 0, manaB: 0 });
    if ("armadura" in e || "accesorio" in e) { const a = e.armadura, c = e.accesorio; delete e.armadura; delete e.accesorio; if (a) e[a === "Manto del velo" ? "capa" : "pecho"] = a; if (c) e[OLD_ACC[c] || "amuleto"] = c; }
    for (const s of SLOTS) if (!(s in e)) e[s] = null;
    return e;
  };
  const heavy = () => (typeof wTraits === "function" ? wTraits(G.g.arma?.n).includes("pesada") : false);
  const gear = () => SLOTS.filter((s) => !(s === "escudo" && heavy())).map((s) => WEAR[eq()[s]]).filter(Boolean);
  const gsum = (k) => gear().reduce((a, w) => a + (w[k] || 0), 0);
  function applyStats() {
    const e = eq(); const pv = gsum("pv"), mana = gsum("mana");
    if (pv !== e.pvB) { G.pvMax += pv - e.pvB; G.pv = Math.max(1, Math.min(G.pvMax, G.pv + Math.max(0, pv - e.pvB))); e.pvB = pv; }
    if (mana !== e.manaB) { G.manaMax += mana - e.manaB; G.mana = Math.max(0, Math.min(G.manaMax, G.mana + Math.max(0, mana - e.manaB))); e.manaB = mana; }
  }
  function wear(n, slot) {
    const w = WEAR[n]; if (!w || !G.g.inv[n] || G.g.combat) return;
    const e = eq(); if (!slot || slotType(slot) !== w.s) slot = w.s === "anillo" ? (!e.anillo1 ? "anillo1" : !e.anillo2 ? "anillo2" : "anillo1") : w.s;
    const old = e[slot]; addItem(n, -1); if (old) addItem(old, 1); e[slot] = n; applyStats();
    sfx("shield"); toast(L(`Te pusiste ${n}.`, `Equipped ${n}.`) + (slot === "escudo" && heavy() ? L(" (con un arma pesada el escudo no cuenta)", " (no effect with heavy weapon)") : "")); persist(); render();
  }
  function unwear(slot) { const e = eq(); if (!e[slot] || G.g.combat) return; addItem(e[slot], 1); e[slot] = null; applyStats(); persist(); render(); }
  const _wb = weaponBonus; weaponBonus = function () { return _wb() + (G?.g ? gsum("dmg") + petB("dmg") : 0); };
  const _db = defBonus; defBonus = function () { return _db() + (G?.g ? gsum("def") + petB("def") : 0); };
  const _ib = initBonus; initBonus = function () { return _ib() + (G?.g ? gsum("init") + petB("init") : 0); };
  const _gx = gainXP; gainXP = function (n) { const m = G?.g ? 1 + gsum("xp") + petB("xp") : 1; return _gx.call(this, n ? Math.round(n * m) : n); };
  const _sp = sellPrice; sellPrice = function (n) { return WEAR[n] ? Math.max(5, Math.round(WEAR[n].p * 0.4)) : _sp(n); };
  function randomGear(lvl, pool = "all") {
    const cand = Object.entries(WEAR).filter(([, w]) => (pool === "drop" ? w.at === "drop" : true) && w.p <= 200 + lvl * 45 && w.p >= Math.min(1500, lvl * 12));
    return (cand.length ? pick(cand) : pick(Object.entries(WEAR)))[0];
  }

  // =====================================================================
  // 2. MASCOTAS Y MONTURAS
  // =====================================================================
  const PETS = {
    "Zorro de luz": { i: "🦊", k: "dmg", v: 2, d: "+2 de daño", p: 150, at: "alba:0" }, "Tortuguita de río": { i: "🐢", k: "def", v: 1, d: "+1 Defensa", p: 250, at: "verde:0" },
    "Gato de la suerte": { i: "🐈", k: "soles", v: 0.15, d: "+15% Soles al ganar", p: 350, at: "llan:0" }, "Búho mensajero": { i: "🦉", k: "xp", v: 0.08, d: "+8% XP", p: 400, at: "cap:0" },
    "Murciélago del velo": { i: "🦇", k: "init", v: 2, d: "+2 iniciativa", p: 500, at: "viol:0" }, "Dragoncito de ceniza": { i: "🐉", k: "dmg", v: 5, d: "+5 de daño", p: 1200, at: "quem:0" },
  };
  const MOUNTS = {
    "Poni del Alba": { i: "🐴", m: 0.8, p: 120, at: "alba:0" }, "Caballo de Trigalia": { i: "🐎", m: 0.65, p: 400, at: "llan:0" },
    "Lagarto de lava": { i: "🦎", m: 0.55, p: 900, at: "quem:0" }, "Grifo joven": { i: "🦅", m: 0.4, p: 1500, need: { "Pluma de grifo": 3 }, at: "llan:4" },
  };
  const petB = (k) => { const p = PETS[G.g.mascota]; return p && p.k === k ? p.v : 0; };
  const own = () => { const g = G.g; g.mascotas = g.mascotas || []; g.monturas = g.monturas || []; return g; };
  const _th = tripHours; tripHours = function (to, mode) { const h = _th.apply(this, arguments); const m = G?.g && mode === "pie" && MOUNTS[G.g.montura]; return m ? h * m.m : h; };
  function buyPet(n, kind) {
    const T = kind === "pet" ? PETS : MOUNTS; const x = T[n]; if (!x) return; const g = own(); const list = kind === "pet" ? g.mascotas : g.monturas;
    if (list.includes(n)) return; if (G.dinero.soles < x.p) return toast(L("No tienes Soles suficientes.", "Not enough Soles."));
    for (const [it, q] of Object.entries(x.need || {})) if ((G.g.inv[it] || 0) < q) return toast(L(`Necesitas ${q}× ${it}.`, `You need ${q}× ${it}.`));
    for (const [it, q] of Object.entries(x.need || {})) addItem(it, -q);
    G.dinero.soles -= x.p; list.push(n); if (kind === "pet") G.g.mascota = n; else G.g.montura = n;
    sfx("level"); log(`${kind === "pet" ? "Adoptaste" : "Compraste"} ${n}.`); toast(`${x.i} ${n}!`); persist(); render();
  }
  function stableBox() {
    const k = hereKey(); const pets = Object.entries(PETS).filter(([, x]) => x.at === k); const mts = Object.entries(MOUNTS).filter(([, x]) => x.at === k);
    if (!pets.length && !mts.length) return ""; const g = own();
    const row = (n, x, kind) => { const has = (kind === "pet" ? g.mascotas : g.monturas).includes(n);
      return `<div class="si"><span><b>${x.i} ${esc(n)}</b><small>${kind === "pet" ? esc(x.d) : L(`Viajes a pie ${Math.round((1 - x.m) * 100)}% más rápidos`, `${Math.round((1 - x.m) * 100)}% faster on foot`)}${x.need ? ` · ${L("pide", "needs")} ${Object.entries(x.need).map(([a, b]) => `${b}× ${esc(a)}`).join(", ")}` : ""}</small></span>${has ? `<span class="pill ok">${L("Tuyo", "Owned")}</span>` : `<button type="button" class="btn small" data-xbuy="${kind}|${esc(n)}">${x.p} Soles</button>`}</div>`; };
    return `<div class="card mini stableb"><b>🐾 ${L("Establo y mascotas", "Stable & pets")}</b><div class="shop">${pets.map(([n, x]) => row(n, x, "pet")).join("")}${mts.map(([n, x]) => row(n, x, "mount")).join("")}</div><p class="note">${L("Cambia de mascota o montura en la pestaña Bolsa.", "Switch pets and mounts in the Bag tab.")}</p></div>`;
  }

  // =====================================================================
  // 3. FORJA: mejorar el arma equipada (+1 … +6)
  // =====================================================================
  const FORGE = { "alba:0": { max: 3, who: "Herrero del pueblo" }, "esc:1": { max: 5, who: "Durgan" }, "quem:0": { max: 10, who: "Ignara" }, "cap:1": { max: 8, who: "Gremio de herreros" } };
  const UP = /^(.*) \+(\d+)$/;
  function ensureW(n) {
    if (!n || WEAPONS[n] != null) return; try { window.SA_EVO?.ensure(n); } catch (e) {} if (WEAPONS[n] != null) return; const m = UP.exec(n); if (!m) return; try { window.SA_EVO?.ensure(m[1]); } catch (e) {} if (WEAPONS[m[1]] == null) return;
    const base = m[1], k = +m[2]; WEAPONS[n] = WEAPONS[base] + k * Math.max(2, Math.round(WEAPONS[base] * 0.08));
    WEAPON_TRAITS[n] = WEAPON_TRAITS[base] || []; if (WEAPON_AFF[base]) WEAPON_AFF[n] = WEAPON_AFF[base];
  }
  function ensureAll() {
    const names = new Set();
    for (const c of meAll()) { if (c.g?.arma?.n) names.add(c.g.arma.n); for (const a of c.g?.armas || []) names.add(a); for (const a of Object.keys(c.g?.bank?.armas || {})) names.add(a); }
    for (const t of Object.values(Store.world?.trades || {})) for (const b of [t?.give, t?.want]) for (const a of b?.armas || []) names.add(a);
    names.forEach(ensureW);
  }
  const lvlOf = (n) => +(UP.exec(n)?.[2] || 0); const baseOf = (n) => UP.exec(n)?.[1] || n;
  function forgeCost(k) { const mats = Object.entries(G.g.inv).filter(([n, q]) => q > 0 && isMat(n)).sort((a, b) => b[1] - a[1]); const need = 2 * k; const use = []; let left = need; for (const [n, q] of mats) { if (!left) break; const t = Math.min(q, left); use.push([n, t]); left -= t; } return { soles: 40 * k * k, need, use, ok: !left }; }
  function forge() {
    const f = FORGE[hereKey()]; if (!f || G.g.combat) return; const n = G.g.arma.n; const k = lvlOf(n) + 1;
    if (k > f.max) return toast(L(`${f.who} no puede subirla más. Busca una forja mejor.`, "This forge can't go higher."));
    const c = forgeCost(k); if (!c.ok) return toast(L(`Necesitas ${c.need} materiales.`, `You need ${c.need} materials.`)); if (G.dinero.soles < c.soles) return toast(L("No tienes Soles suficientes.", "Not enough Soles."));
    G.dinero.soles -= c.soles; for (const [m, q] of c.use) addItem(m, -q);
    const nn = `${baseOf(n)} +${k}`; ensureW(nn); G.g.arma = { n: nn, poder: WEAPONS[nn] };
    sfx("crit"); log(`Forjaste ${nn} (Poder ${WEAPONS[nn]}).`); toast(L(`🔨 ¡${nn}! Poder ${WEAPONS[nn]}`, `🔨 ${nn}! Power ${WEAPONS[nn]}`)); dq("forge"); persist(); render();
  }
  function forgeBox() {
    const f = FORGE[hereKey()]; if (!f) return ""; const n = G.g.arma.n; const k = lvlOf(n) + 1; const c = forgeCost(k); const nn = `${baseOf(n)} +${k}`; ensureW(nn);
    return `<div class="card mini forge"><b>🔨 ${L("Forja", "Forge")} · ${esc(f.who)} <small class="muted">(${L("hasta", "up to")} +${f.max})</small></b>
      ${k > f.max ? `<p class="note">${L(`Tu ${esc(n)} ya está al máximo de esta forja. ${f.max < 10 ? "Ignara, en Forjaroja, llega a +10." : "Ya puedes evolucionarla (mira abajo)."}`, "Max for this forge.")}</p>` : `<p>${esc(n)} <b>(${L("Poder", "Power")} ${G.g.arma.poder})</b> ➜ <b>${esc(nn)} (${L("Poder", "Power")} ${WEAPONS[nn]})</b></p>
      <p class="note">${L("Cuesta", "Costs")} ${c.soles} Soles + ${c.need} ${L("materiales", "materials")}${c.use.length ? `: ${c.use.map(([m, q]) => `${q}× ${esc(m)}`).join(", ")}` : ""}${c.ok ? "" : L(" · te faltan materiales (caza y explora)", " · not enough materials")}</p>
      <button type="button" class="btn small primary" data-xforge="1" ${c.ok && G.dinero.soles >= c.soles ? "" : "disabled"}>🔨 ${L("Mejorar arma", "Upgrade weapon")}</button>`}</div>`;
  }
  const SLOT_IC = { cabeza: "🪖", hombros: "🦺", pecho: "🥋", manos: "🧤", pies: "🥾", capa: "🧥", cuello: "📿", anillo: "💍", amuleto: "🔮", escudo: "🛡️" };
  const SLOT_NM = () => ({ cabeza: L("Cabeza", "Head"), hombros: L("Hombros", "Shoulders"), pecho: L("Pecho", "Chest"), manos: L("Manos", "Hands"), pies: L("Pies", "Feet"), capa: L("Capa", "Cape"), cuello: L("Cuello", "Neck"), anillo: L("Anillo", "Ring"), amuleto: L("Amuleto", "Charm"), escudo: L("Escudo", "Shield") });
  function wearShopBox() {
    const list = Object.entries(WEAR).filter(([, w]) => w.at === hereKey()); if (!list.length) return "";
    const open = gsel.xwear === hereKey(); const e = eq();
    const cur = (s) => (s === "anillo" ? [e.anillo1, e.anillo2] : [e[s]]).map((n) => WEAR[n]).filter(Boolean);
    const score = (w) => (w.def || 0) * 3 + (w.dmg || 0) * 3 + (w.pv || 0) / 5 + (w.init || 0) * 2 + (w.mana || 0) / 10 + (w.xp || 0) * 60;
    return `<div class="card mini wearshop"><div class="row between"><b>🛡️ ${L("Armaduras y accesorios", "Armor & accessories")}</b><button type="button" class="btn small ${open ? "" : "primary"}" data-xwearshop="1">${open ? L("Cerrar", "Close") : L(`Ver ${list.length}`, `See ${list.length}`)}</button></div>
      ${open ? `<div class="wgrid">${list.map(([n, w]) => { const c = cur(w.s); const better = !c.length || score(w) > Math.min(...c.map(score)); const can = G.dinero.soles >= w.p;
        return `<div class="witem r-${w.r}"><div class="wic">${SLOT_IC[w.s]}</div><div class="wb"><b>${esc(n)}</b><small>${SLOT_NM()[w.s]}${better ? ` · <span class="up">▲ ${L("mejora", "upgrade")}</span>` : ""}</small><small>${esc(wearDesc(n))}</small></div><button type="button" class="btn small ${can ? "primary" : ""}" data-xwearbuy="${esc(n)}" ${can ? "" : "disabled"}>☀ ${w.p}</button></div>`; }).join("")}</div>
      <p class="note">${L("Al comprar te lo pones enseguida (lo anterior vuelve a la bolsa). Cámbialo cuando quieras en la pestaña Bolsa.", "Bought gear is equipped right away.")}</p>` : ""}</div>`;
  }
  function wearBuy(n) { const w = WEAR[n]; if (!w) return; if (G.dinero.soles < w.p) return toast(L("No tienes Soles suficientes.", "Not enough Soles.")); G.dinero.soles -= w.p; addItem(n, 1); toast(L(`Compraste ${n}. Póntelo en la Bolsa.`, `Bought ${n}.`)); wear(n); }

  // =====================================================================
  // 4. MISIONES DIARIAS
  // =====================================================================
  const DQ = {
    hunt: [5, "⚔️ Derrota 5 monstruos"], explore: [3, "🔎 Explora 3 veces"], boss: [1, "💀 Vence a un jefe"], group: [1, "👥 Gana un combate de grupo"],
    train: [2, "🏋️ Entrena o ve a clase 2 veces"], trade: [1, "🔁 Haz un trueque o intercambio"], dungeon: [2, "🏰 Supera 2 pisos de mazmorra"], chat: [1, "💬 Escribe en el chat del grupo"],
    pvp: [1, "🤺 Reta a un jugador en la Arena"], travel: [2, "🧭 Viaja 2 veces"], forge: [1, "🔨 Mejora un arma en la forja"],
  };
  function daily() {
    const w = W(); const d = today();
    if (w.daily?.date !== d) {
      let h = 0; for (const ch of d + G.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      const pool = Object.keys(DQ).filter((k) => !(k === "pvp" && !others().length) && !(k === "dungeon" && G.nivel < 8) && !(k === "boss" && G.nivel < 5));
      const q = []; while (q.length < 3 && pool.length) { const i = h % pool.length; q.push({ k: pool[i], n: 0 }); pool.splice(i, 1); h = Math.floor(h / 7) + 13; }
      w.daily = { date: d, q, bonus: false };
    }
    return w.daily;
  }
  function dq(k, n = 1) { if (!G?.g) return; const d = daily(); for (const q of d.q) if (q.k === k && !q.claimed) { const was = q.n >= DQ[k][0]; q.n = Math.min(DQ[k][0], q.n + n); if (!was && q.n >= DQ[k][0]) { sfx("status"); toast(L(`📅 Misión diaria lista: ${DQ[k][1]}`, `📅 Daily ready`)); } } }
  function dqClaim(i) {
    const d = daily(); const q = d.q[i]; if (!q || q.claimed || q.n < DQ[q.k][0]) return;
    q.claimed = true; const xp = Math.round(xpToNext(G.nivel) * 0.12); const so = 8 * G.nivel; G.dinero.soles += so; gainXP(xp);
    const lines = [`+${xp} XP`, `+${so} Soles`];
    if (d.q.every((x) => x.claimed) && !d.bonus) { d.bonus = true; addItem("Tónico de energía", 2); lines.push(L("🎁 Cofre diario: 2× Tónico de energía", "🎁 Daily chest")); if (Math.random() < 0.35) { const gI = randomGear(G.nivel); addItem(gI, 1); lines.push(`🎁 ${gI}`); } }
    sfx("level"); G.g.lastResult = { title: L("Misión diaria completada", "Daily quest complete"), lines }; persist(); render();
  }
  function dailyBox() {
    const d = daily(); const open = gsel.xdaily !== false; const done = d.q.filter((q) => q.claimed).length;
    return `<div class="card mini daily"><div class="row between"><b>📅 ${L("Misiones de hoy", "Today's quests")} <small class="muted">${done}/3${d.bonus ? " · 🎁 ✔" : ""}</small></b><button type="button" class="link" data-xdaily="1">${open ? L("Ocultar", "Hide") : L("Ver", "Show")}</button></div>
      ${open ? `<div class="dq">${d.q.map((q, i) => { const need = DQ[q.k][0]; const ok = q.n >= need;
        return `<div class="dqi ${q.claimed ? "ok" : ""}"><span>${esc(DQ[q.k][1])} <small>${q.n}/${need}</small></span>${q.claimed ? "✔" : ok ? `<button type="button" class="btn small primary" data-xdq="${i}">${L("Cobrar", "Claim")}</button>` : `<span class="qt-bar"><i style="width:${Math.round((q.n / need) * 100)}%"></i></span>`}</div>`; }).join("")}</div>
        <p class="note">${L("Se renuevan cada día. Si cobras las 3, abres el cofre diario.", "Renew daily. Claim all 3 for a bonus chest.")}</p>` : ""}</div>`;
  }
  const _log = log; log = function (t) { try { if (/^(Trueque con|Intercambio con)/.test(t)) dq("trade"); if (/^(Entrenaste|Clase en la academia)/.test(t)) dq("train"); } catch (e) {} return _log.apply(this, arguments); };
  const _explore = explore; explore = function () { const ok = G && !G.g.combat && G.energia >= 1; const r = _explore.apply(this, arguments); if (ok) dq("explore"); return r; };
  const _travel = travel; travel = function (to) { const from = hereKey(); const r = _travel.apply(this, arguments); try { if (hereKey() !== from) dq("travel"); } catch (e) {} return r; };

  // =====================================================================
  // 5. MAZMORRAS
  // =====================================================================
  const DUN = [
    { id: "catacumbas", n: "Catacumbas del Alba", at: "alba:4", lv: [8, 12], f: 4, boss: { n: "Rey Esqueleto", img: "Espectros", aff: "Sombra" }, rw: "Anillo de Valcor" },
    { id: "raices", n: "Raíces Profundas", at: "verde:3", lv: [13, 17], f: 4, boss: { n: "Raíz Devoradora", img: "Gólems de musgo", aff: "Tierra" }, rw: "Amuleto del viento" },
    { id: "pecio", n: "Pecio Sumergido", at: "costa:2", lv: [21, 27], f: 5, boss: { n: "Kraken del Pecio", img: "Anguilas de trueno", aff: "Agua" }, rw: "Perla de marea" },
    { id: "minas", n: "Minas Olvidadas", at: "esc:1", lv: [27, 33], f: 5, boss: { n: "Gólem de Mithril", img: "Gólem de Basalto", aff: "Tierra" }, rw: "Armadura enana" },
    { id: "volcan", n: "Corazón del Volcán", at: "quem:4", lv: [36, 42], f: 5, boss: { n: "Salamandra Ancestral", img: "Salamandras", aff: "Fuego" }, rw: "Escamas de dragón" },
    { id: "cripta", n: "Cripta del Velo", at: "viol:2", lv: [44, 50], f: 6, boss: { n: "Liche del Velo", img: "Brujas menores", aff: "Sombra" }, rw: "Corazón de dragón" },
    { id: "bovedas", n: "Bóvedas del Tiempo", at: "lost:1", lv: [62, 70], f: 6, boss: { n: "Guardián de las Horas", img: "El Relojero", aff: null }, rw: "Corona del Relojero" },
  ];
  const dunOf = (id) => DUN.find((d) => d.id === id);
  const run = () => G.g.dun && dunOf(G.g.dun.id) ? G.g.dun : null;
  const dunKey = () => { const r = run(); return r ? `${r.id}:${r.f}` : ""; };
  function floorEnemy(d, f) {
    const lvl = Math.round(d.lv[0] + ((d.lv[1] - d.lv[0]) * f) / Math.max(1, d.f - 1)); const [r, p] = d.at.split(":");
    if (f === d.f - 1) { const pv = Math.round((40 + 22 * lvl) * 0.55); return { n: d.boss.n, img: d.boss.img, lvl, pv, pvMax: pv, poder: 10 + 3 * lvl, def: Math.floor(lvl / 4) + 1, aff: d.boss.aff, boss: true, st: {} }; }
    const pl = P[r][+p]; const opts = (pl.mon || []).filter((m) => !/duelo/i.test(m)); const pv = Math.round((15 + 10 * lvl) * 0.7);
    return { n: pick(opts.length ? opts : ["Criatura de la mazmorra"]), lvl, pv, pvMax: pv, poder: 5 + 2 * lvl, def: Math.floor(lvl / 6), aff: typeof REGION_AFF !== "undefined" ? REGION_AFF[r] : null, boss: false, st: {} };
  }
  function dunEnter(id) {
    const d = dunOf(id); if (!d || G.g.combat || run()) return;
    if (W().dunDay[id] === today()) return toast(L("Ya completaste esta mazmorra hoy. Vuelve mañana.", "Already cleared today."));
    if (!needEnergy(2)) return;
    G.g.dun = { id, f: 0, at: Date.now() }; addAct(`🏰 ${L("En", "In")} ${d.n}`); sfx("boss"); toast(L(`Entras en ${d.n}. Cada piso sin descanso.`, `You enter ${d.n}.`)); persist(); render();
  }
  function dunFight() {
    const r = run(); if (!r || G.g.combat) return; const d = dunOf(r.id); if (hereKey() !== d.at) return;
    const e = floorEnemy(d, r.f); startCombat(e, "dun", d.at, L(`${d.n} · piso ${r.f + 1}/${d.f}.`, `${d.n} · floor ${r.f + 1}.`));
    if (G.g.combat) G.g.combat.dunStep = dunKey(); addAct(`🏰 ${d.n} · ${L("piso", "floor")} ${r.f + 1}/${d.f}`); persist(); render();
  }
  async function dunGroup() {
    const r = run(); if (!r || G.g.combat) return; const d = dunOf(r.id); if (hereKey() !== d.at) return;
    const e = floorEnemy(d, r.f); const n = Math.max(2, others().filter(isOn).length + 1);
    const id = "d" + Date.now().toString(36); const pvMax = Math.round(e.pv * (1 + 0.6 * (n - 1)));
    await Store.updateWorld({ raids: { [id]: { id, kind: "dun", dun: dunKey(), t: `${d.n} · ${L("piso", "floor")} ${r.f + 1}`, place: d.at, by: Store.uid, byName: G.nombre, at: Date.now(), pvMax, e: { n: e.n, lvl: e.lvl, poder: e.poder, def: e.def, aff: e.aff || null, boss: !!e.boss, img: e.img || null, npc: null, story: null, god: null }, parts: {} } } });
    toast(L("Llamaste al grupo para este piso.", "You called the group.")); window.SA_RAID?.join(id);
  }
  function dunAdvance(lines) {
    const r = run(); if (!r) return; const d = dunOf(r.id); r.f++; dq("dungeon");
    if (r.f >= d.f) {
      W().dunDay[r.id] = today(); G.g.dun = null; const lvl = d.lv[1]; const so = 25 * lvl; G.dinero.soles += so;
      const got = [Math.random() < 0.5 ? d.rw : randomGear(lvl)]; if (Math.random() < 0.3) got.push(randomGear(lvl, "drop"));
      got.forEach((x) => addItem(x, 1)); addItem("Poción mayor de vida", 1);
      lines.push(L(`🏰 ¡Mazmorra superada! Cofre: +${so} Soles, ${got.join(", ")}, Poción mayor de vida`, `🏰 Dungeon cleared!`));
      log(`Superó ${d.n}.`); addAct(`🏆 ${L("Superó", "Cleared")} ${d.n}`); sfx("chapter");
    } else lines.push(L(`🏰 Piso ${r.f}/${d.f} superado. Sigue bajando (sin descanso).`, `🏰 Floor cleared.`));
  }
  function dunBox() {
    const d = DUN.find((x) => x.at === hereKey()); const r = run();
    if (r && dunOf(r.id).at !== hereKey()) return `<div class="card mini dun"><b>🏰 ${esc(dunOf(r.id).n)}</b><p class="note">${L("Estás a mitad de una mazmorra. Vuelve a", "You're mid-dungeon. Return to")} ${esc(pname(...dunOf(r.id).at.split(":")))} ${L("o abandónala.", "or leave.")}</p><button type="button" class="btn small ghost" data-xdun="leave">${L("Abandonar", "Leave")}</button></div>`;
    if (!d) return "";
    const mates = others().filter((c) => isOn(c) && c.g.dun?.id === d.id);
    const doneToday = W().dunDay[d.id] === today();
    if (!r) return `<div class="card mini dun"><b>🏰 ${L("Mazmorra", "Dungeon")}: ${esc(d.n)}</b> <small class="muted">${L("Nv", "Lv")} ${d.lv[0]}–${d.lv[1]} · ${d.f} ${L("pisos", "floors")} · ${L("jefe", "boss")}: ${esc(d.boss.n)}</small>
      <p class="note">${L("Pisos seguidos sin descansar; al final hay un cofre con armadura o accesorio. Puedes llamar al grupo en cualquier piso: a todos los que estén en el mismo piso se les cuenta. Una vez al día.", "Floors in a row; chest at the end. Call the group on any floor.")}</p>
      ${mates.length ? `<p>👥 ${L("Dentro ahora", "Inside now")}: ${mates.map((c) => `<b>${esc(c.nombre)}</b> (${L("piso", "floor")} ${c.g.dun.f + 1})`).join(", ")}</p>` : ""}
      <button type="button" class="btn small primary" data-xdun="enter:${d.id}" ${doneToday ? "disabled" : ""}>${doneToday ? L("Superada hoy ✔", "Cleared today ✔") : L("Entrar (2 Energía)", "Enter (2 Energy)")}</button></div>`;
    const e = floorEnemy(d, r.f); const raid = window.SA_RAID?.activeRaids().find(([, x]) => x.dun === dunKey());
    return `<div class="card mini dun on"><b>🏰 ${esc(d.n)} · ${L("piso", "floor")} ${r.f + 1}/${d.f}</b><div class="dfl">${Array.from({ length: d.f }, (_, i) => `<i class="${i < r.f ? "ok" : i === r.f ? "now" : ""}">${i === d.f - 1 ? "💀" : i + 1}</i>`).join("")}</div>
      <p>${r.f === d.f - 1 ? L("Jefe", "Boss") : L("Enemigo", "Enemy")}: <b>${esc(e.n)}</b> · ${L("Nv", "Lv")} ${e.lvl}</p>
      ${mates.length ? `<p>👥 ${mates.map((c) => `<b>${esc(c.nombre)}</b> (${L("piso", "floor")} ${c.g.dun.f + 1})`).join(", ")}</p>` : ""}
      <div class="row"><button type="button" class="btn small primary" data-xdun="fight">⚔️ ${L("Pelear", "Fight")}</button>${raid ? `<button type="button" class="btn small" data-raid="${raid[0]}">👥 ${L("Unirse al grupo", "Join group")}</button>` : `<button type="button" class="btn small" data-xdun="group">👥 ${L("Piso en grupo", "Floor with group")}</button>`}<button type="button" class="btn small ghost" data-xdun="leave">${L("Abandonar", "Leave")}</button></div></div>`;
  }

  // =====================================================================
  // 6. JEFE MUNDIAL SEMANAL
  // =====================================================================
  const WB = [
    { n: "Titán del Amanecer Roto", img: "Gólem de Basalto", aff: "Luz", at: "alba:2" }, { n: "Hidra del Lago", img: "Serpiente de Trueno", aff: "Agua", at: "verde:1" },
    { n: "Behemot de las Llanuras", img: "Minotauro", aff: "Tierra", at: "llan:2" }, { n: "Leviatán del Arrecife", img: "Anguilas de trueno", aff: "Rayo", at: "costa:2" },
    { n: "Yeti Primigenio", img: "Yetis salvajes", aff: "Agua", at: "esc:4" }, { n: "Coloso de Ceniza", img: "Troles de lava", aff: "Fuego", at: "quem:2" },
    { n: "Madre de la Ciénaga", img: "Brujas menores", aff: "Sombra", at: "viol:2" }, { n: "Campeón Caído del Coliseo", img: "Espectros", aff: "Luz", at: "cap:2" },
  ];
  const week = () => Math.floor((Date.now() - new Date(2026, 0, 5).getTime()) / (7 * 864e5));
  const wbId = () => "w" + week();
  let wbBusy = false;
  function wbEnsure() {
    if (wbBusy || !Store.world) return; const id = wbId(); if (Store.world.raids?.[id]) return;
    const b = WB[week() % WB.length]; const lvl = Math.max(8, Math.max(...Store.all.map((c) => c.nivel || 1)) + 2); const n = Math.max(2, new Set(Store.all.map((c) => c.owner)).size);
    const pvMax = Math.round((40 + 22 * lvl) * 0.55 * (4 + 2.5 * n));
    wbBusy = true;
    Store.updateWorld({ raids: { [id]: { id, kind: "world", place: b.at, by: "world", byName: L("🌋 Jefe mundial", "🌋 World boss"), at: Date.now(), pvMax, t: L("Jefe mundial de la semana", "Weekly world boss"), e: { n: b.n, lvl, poder: 10 + 3 * lvl, def: Math.floor(lvl / 4) + 1, aff: b.aff, boss: true, img: b.img, npc: null, story: null, god: null }, parts: {} } } }).catch(() => {}).finally(() => { wbBusy = false; });
  }
  const WB_TRIES = 3, WB_TURNS = 6;
  function wbTries() { const w = W().wb; if (w.date !== today()) { w.date = today(); w.n = 0; } return w; }
  function wbBox() {
    const r = Store.world?.raids?.[wbId()]; if (!r) return ""; const R = window.SA_RAID; const pv = R ? R.raidPv(r) : r.pvMax; const pct = Math.round((pv / r.pvMax) * 100);
    const parts = Object.entries(r.parts || {}).sort((a, b) => (b[1].dmg || 0) - (a[1].dmg || 0)); const mine = r.parts?.[Store.uid]?.dmg || 0; const [rr, pp] = r.place.split(":");
    return `<div class="card mini wboss"><div class="row between"><b>🌋 ${L("Jefe mundial de la semana", "Weekly world boss")}: ${esc(r.e.n)} <small class="muted">${L("Nv", "Lv")} ${r.e.lvl} · ${esc(pname(rr, +pp))}</small></b>${r.done || pv <= 0 ? `<span class="pill ok">${L("¡Derrotado!", "Defeated!")}</span>` : ""}</div>
      <span class="qt-bar wbbar"><i style="width:${pct}%"></i></span><small>${pv} / ${r.pvMax} PV · ${L("tu daño", "your damage")}: ${mine} · ${L("intentos hoy", "tries today")}: ${wbTries().n}/${WB_TRIES}</small>
      ${parts.length ? `<small>🏅 ${parts.slice(0, 5).map(([, p], i) => `${["🥇", "🥈", "🥉", "4.", "5."][i]} ${esc(p.n)} ${p.dmg}`).join(" · ")}</small>` : ""}
      <p class="note">${L(`Todos le bajan vida durante la semana. Cada intento dura ${WB_TURNS} turnos (máx. ${WB_TRIES} al día) y tu daño se guarda. Cuando cae, todos los que ayudaron reciben el premio.`, "Everyone chips away all week.")}</p>
      ${r.done || pv <= 0 ? "" : hereKey() === r.place ? `<button type="button" class="btn small primary" data-raid="${r.id}" ${wbTries().n >= WB_TRIES ? "disabled" : ""}>⚔️ ${L("Atacar (1 Energía)", "Attack (1 Energy)")}</button>` : `<button type="button" class="btn small" data-go="${r.place}">🧭 ${L("Ir a", "Go to")} ${esc(pname(rr, +pp))}</button>`}</div>`;
  }
  const _ap = afterPlayer;
  afterPlayer = function () {
    const c = G.g.combat; const r = _ap.apply(this, arguments);
    try {
      if (c && G.g.combat === c && c.kind === "world") {
        c.wt = (c.wt || 0) + 1; const e = c.enemies[0];
        if (c.wt >= WB_TURNS && e && e.pv > 0 && G.pv > 0) {
          const dmg = (c.myDmg || 0) + Math.max(0, (c.lastPv || 0) - e.pv);
          Store.updateWorld({ raids: { [c.raid]: { parts: { [Store.uid]: { dmg, n: G.nombre } } } } }).catch(() => {});
          G.g.combat = null; G.g.lastResult = { title: L(`¡${e.n} te repele!`, `${e.n} pushes you back`), lines: [L(`Tu daño total: ${dmg}`, `Your total damage: ${dmg}`), L("Vuelve a intentarlo más tarde.", "Try again later.")] };
          sfx("flee"); persist(); render();
        }
      }
    } catch (e) { console.warn("extra:", e); }
    return r;
  };
  function wbReward(r) {
    const lvl = r.e.lvl; const so = 25 * lvl; G.dinero.soles += so; const g1 = randomGear(lvl, "drop"); addItem(g1, 1); addItem("Poción mayor de vida", 2);
    return L(`🌋 Premio del jefe mundial: +${so} Soles, ${g1}, 2× Poción mayor de vida`, `🌋 World boss reward`);
  }

  // =====================================================================
  // 7. DUELOS ENTRE JUGADORES (Arena)
  // =====================================================================
  const ARENAS = ["llan:3", "cap:2"];
  function pvpEnemy(c) {
    const lvl = c.nivel || 1; const wp = c.g?.arma?.poder || 10; const a = c.atributos || {};
    const pv = Math.round((c.pvMax || 60) * 0.7);
    return { n: c.nombre, lvl, pv, pvMax: pv, poder: 5 + 2 * lvl + Math.round(wp / 3) + (a.fuerza || 0), def: Math.floor((a.defensa || 0) / 2) + Math.floor(lvl / 8), aff: WEAPON_AFF[c.g?.arma?.n] || null, boss: false, st: {}, pvp: c.id, raza: c.raza };
  }
  function pvpStart(id) {
    const c = Store.all.find((x) => x.id === id); if (!c || G.g.combat || !ARENAS.includes(hereKey())) return;
    if (!needEnergy(1)) return;
    startCombat(pvpEnemy(c), "pvp", hereKey(), L(`Duelo en la Arena contra ${c.nombre} (${c.g?.arma?.n || "puños"}).`, `Arena duel vs ${c.nombre}.`));
    if (G.g.combat) G.g.combat.pvp = id; sfx("fight"); addAct(`🤺 ${L("Duelo contra", "Dueling")} ${c.nombre}`); persist(); render();
  }
  function pvpDone(win, id) {
    const c = Store.all.find((x) => x.id === id); const p = G.g.pvp || (G.g.pvp = { w: 0, l: 0 });
    p[win ? "w" : "l"]++; p.last = { vs: id, vsName: c?.nombre || "?", win, at: Date.now() }; dq("pvp");
    const first = W().pvpDay[id] !== today(); W().pvpDay[id] = today();
    return first && win ? L("🤺 Primer duelo ganado hoy contra este rival: +15 Rayos de Fama", "🤺 First win today: +15 Fame") : "";
  }
  function arenaBox() {
    if (!ARENAS.includes(hereKey())) return ""; const list = others().sort((a, b) => (b.nivel || 0) - (a.nivel || 0)); const p = G.g.pvp || { w: 0, l: 0 };
    return `<div class="card mini arenab"><b>🤺 ${L("Duelos contra jugadores", "Player duels")}</b> <small class="muted">${L("Tu récord", "Your record")}: ${p.w}–${p.l}</small>
      <p class="note">${L("Peleas contra el personaje de tu amigo (sus estadísticas y su arma), aunque no esté conectado. Perder un duelo no te quita Soles.", "Fight a friend's character even if offline.")}</p>
      ${list.length ? `<div class="shop">${list.map((c) => { const e = pvpEnemy(c); const pr = c.g?.pvp || { w: 0, l: 0 };
        return `<div class="si"><span><b>${esc(c.nombre)}</b><small>${L("Nv", "Lv")} ${c.nivel} · ${esc(c.g?.arma?.n || "—")} · PV ${e.pv} · ${L("récord", "record")} ${pr.w}–${pr.l}</small></span><button type="button" class="btn small primary" data-xpvp="${c.id}">⚔️ ${L("Retar (1 Energía)", "Challenge")}</button></div>`; }).join("")}</div>` : `<p class="muted">${L("Todavía no hay otros jugadores.", "No other players yet.")}</p>`}</div>`;
  }
  const _mi = monIcon; monIcon = function (e) { if (e && e.pvp && typeof raceImg === "function") { const h = raceImg(e.raza, "mimg"); if (h) return h; } return _mi(e); };
  const _def = defeat;
  defeat = function () {
    const c = G.g.combat;
    if (c && c.kind === "pvp") {
      const e = c.enemies[0]; pvpDone(false, c.pvp); G.g.combat = null; G.pv = Math.max(1, Math.round(G.pvMax * 0.3));
      log(`Perdió un duelo contra ${e.n}.`); G.g.lastResult = { title: L(`${e.n} ganó el duelo`, `${e.n} won the duel`), lines: [L("No pierdes Soles en la Arena.", "No Soles lost in the Arena."), L(`Récord: ${G.g.pvp.w}–${G.g.pvp.l}`, `Record: ${G.g.pvp.w}–${G.g.pvp.l}`)] };
      sfx("defeat"); persist(); render(); return;
    }
    if (c && c.kind === "world") {
      const e = c.enemies[0]; const dmg = (c.myDmg || 0) + Math.max(0, (c.lastPv || 0) - (e?.pv || 0));
      if (c.raid && dmg > 0) Store.updateWorld({ raids: { [c.raid]: { parts: { [Store.uid]: { dmg, n: G.nombre } } } } }).catch(() => {});
      G.g.combat = null; G.pv = Math.max(1, Math.round(G.pvMax * 0.25));
      G.g.lastResult = { title: L(`${e?.n || "El jefe"} te derribó`, "The world boss knocked you down"), lines: [L(`Tu daño total: ${dmg}. Se guarda para el grupo.`, `Your damage: ${dmg}.`), L("Contra el jefe mundial no pierdes Soles.", "No Soles lost vs the world boss.")] };
      sfx("defeat"); persist(); render(); return;
    }
    if (c && c.kind === "dun") { const d = run() && dunOf(run().id); G.g.dun = null; const r = _def.apply(this, arguments); if (d) { const b = G.g.lastBattle || G.g.lastResult; if (b) b.lines = [...(b.lines || []), L(`🏰 Caíste en ${d.n}. La mazmorra se reinicia.`, "🏰 Dungeon failed.")]; } return r; }
    return _def.apply(this, arguments);
  };

  // =====================================================================
  // 8. VICTORIA: mazmorra, jefe mundial, duelo, mascota, diarias
  // =====================================================================
  const _vic = victory;
  victory = function () {
    const c = G.g.combat; const info = c ? { kind: c.kind, n: c.enemies.length, boss: c.enemies.some((e) => e.boss), raid: c.raid, dun: c.dunStep, pvp: c.pvp, name: c.enemies[0]?.n } : null;
    const so0 = G.dinero.soles; const r = _vic.apply(this, arguments);
    try {
      if (!info) return r; const lines = [];
      if (petB("soles")) { const extra = Math.round(Math.max(0, G.dinero.soles - so0) * petB("soles")); if (extra) { G.dinero.soles += extra; lines.push(`🐈 +${extra} Soles`); } }
      if (info.kind !== "pvp") dq("hunt", info.n); if (info.boss) dq("boss"); if (info.raid) dq("group");
      if (info.dun && info.dun === dunKey()) dunAdvance(lines);
      if (info.kind === "world") { const rr = Store.world?.raids?.[info.raid]; if (rr) lines.push(wbReward(rr)); }
      if (info.kind === "pvp") { const t = pvpDone(true, info.pvp); if (t) { lines.push(t); addRayos({ fama: 15, poder: 5 }); } log(`Ganó un duelo contra ${info.name}.`); }
      if (lines.length) { const b = G.g.lastBattle || G.g.lastResult; if (b) b.lines = [...(b.lines || []), ...lines]; persist(); render(); }
    } catch (e) { console.warn("extra:", e); }
    return r;
  };
  window.SA_EXTRA = {
    canJoin(r) { if (r.kind === "world") { if (wbTries().n >= WB_TRIES) { toast(L("Ya usaste tus 3 intentos de hoy contra el jefe mundial.", "No tries left today.")); return false; } } return true; },
    onJoin(r, c) { if (r.kind === "world") { wbTries().n++; c.wt = 0; } if (r.dun && r.dun === dunKey()) c.dunStep = r.dun; },
    onClaim(r) {
      dq("group"); const lines = [];
      if (r.dun && r.dun === dunKey()) dunAdvance(lines);
      if (r.kind === "world") lines.push(wbReward(r));
      if (lines.length) { toast(lines.join(" · ")); G.g.lastResult = { title: L("El grupo ganó", "The group won"), lines }; }
    },
    dq, WEAR, PETS, MOUNTS, SLOTS, SLOT_IC, SLOT_NM, eq: () => eq(), wearDesc, gsum: (k) => gsum(k), heavy: () => heavy(),
  };

  // =====================================================================
  // 9. COFRE DEL GRUPO (cada uno apunta lo que mete y saca en su propio personaje)
  // =====================================================================
  const bank = () => { const b = G.g.bank || (G.g.bank = {}); b.items = b.items || {}; b.armas = b.armas || {}; b.soles = b.soles || 0; return b; };
  function bankTotal() {
    const t = { items: {}, armas: {}, soles: 0 };
    for (const c of meAll()) { const b = c.g?.bank; if (!b) continue; for (const [n, q] of Object.entries(b.items || {})) t.items[n] = (t.items[n] || 0) + q; for (const [n, q] of Object.entries(b.armas || {})) t.armas[n] = (t.armas[n] || 0) + q; t.soles += b.soles || 0; }
    for (const o of [t.items, t.armas]) for (const n of Object.keys(o)) if (o[n] <= 0) delete o[n];
    t.soles = Math.max(0, t.soles); return t;
  }
  function bankMove(kind, n, dir) {
    if (G.g.combat) return; const b = bank(); const t = bankTotal();
    if (kind === "items") { if (dir > 0) { if (!G.g.inv[n]) return; addItem(n, -1); b.items[n] = (b.items[n] || 0) + 1; } else { if (!t.items[n]) return; b.items[n] = (b.items[n] || 0) - 1; addItem(n, 1); } }
    if (kind === "armas") { const ars = G.g.armas || (G.g.armas = []); if (dir > 0) { const i = ars.indexOf(n); if (i < 0) return; ars.splice(i, 1); b.armas[n] = (b.armas[n] || 0) + 1; } else { if (!t.armas[n]) return; b.armas[n] = (b.armas[n] || 0) - 1; ars.push(n); } }
    if (kind === "soles") { const q = Math.floor(+n || 0); if (q <= 0) return; if (dir > 0) { if (G.dinero.soles < q) return; G.dinero.soles -= q; b.soles += q; } else { const v = Math.min(q, t.soles); if (!v) return; b.soles -= v; G.dinero.soles += v; } }
    log(`${dir > 0 ? "Guardó" : "Sacó"} ${kind === "soles" ? n + " Soles" : n} ${dir > 0 ? "en" : "del"} cofre del grupo.`); sfx("click"); persist(); render();
  }
  function bankBox() {
    const t = bankTotal(); const open = gsel.xbank; const items = Object.entries(t.items), armas = Object.entries(t.armas);
    return `<div class="card mini bankb"><div class="row between"><b>🏦 ${L("Cofre del grupo", "Group chest")}</b><button type="button" class="btn small ${open ? "" : "primary"}" data-xbank="1">${open ? L("Cerrar", "Close") : L("Abrir", "Open")}</button></div>
      <small class="muted">☀ ${t.soles} Soles · ${items.reduce((a, [, q]) => a + q, 0)} ${L("objetos", "items")} · ${armas.reduce((a, [, q]) => a + q, 0)} ${L("armas", "weapons")}</small>
      ${open ? `<div class="trcols"><div class="trcol"><h4>${L("En el cofre", "In the chest")}</h4>
        ${items.length || armas.length ? `<div class="tlist">${armas.map(([n, q]) => `<div class="ti"><span>🗡️ ${esc(n)} <small>×${q}</small></span><button type="button" class="chip" data-xbk="armas|${esc(n)}|-1">${L("Sacar", "Take")}</button></div>`).join("")}${items.map(([n, q]) => `<div class="ti"><span>${esc(n)} <small>×${q}</small></span><button type="button" class="chip" data-xbk="items|${esc(n)}|-1">${L("Sacar 1", "Take 1")}</button></div>`).join("")}</div>` : `<p class="muted">${L("Vacío.", "Empty.")}</p>`}
        <label class="lbl">☀ <input type="number" min="1" value="10" id="xbk-sol-out" style="width:80px"> <button type="button" class="chip" data-xbk="soles|out|-1">${L("Sacar Soles", "Take Soles")}</button></label></div>
        <div class="trcol"><h4>${L("Guardar de tu bolsa", "Store from your bag")}</h4><div class="tlist">${(G.g.armas || []).map((n) => `<div class="ti"><span>🗡️ ${esc(n)}</span><button type="button" class="chip" data-xbk="armas|${esc(n)}|1">${L("Guardar", "Store")}</button></div>`).join("")}${Object.entries(G.g.inv).map(([n, q]) => `<div class="ti"><span>${esc(n)} <small>(${q})</small></span><button type="button" class="chip" data-xbk="items|${esc(n)}|1">${L("Guardar 1", "Store 1")}</button></div>`).join("")}</div>
        <label class="lbl">☀ <input type="number" min="1" value="10" id="xbk-sol-in" style="width:80px"> <button type="button" class="chip" data-xbk="soles|in|1">${L("Guardar Soles", "Store Soles")}</button></label></div></div>
        <p class="note">${L("Todo el grupo puede meter y sacar. Úsalo para compartir pociones, materiales y armas.", "Everyone can store and take.")}</p>` : ""}</div>`;
  }

  // =====================================================================
  // 10. CHAT DEL GRUPO (cada uno guarda sus últimos mensajes en su personaje)
  // =====================================================================
  const QUICK = [() => L(`¡Ven a ${pname(G.g.loc.r, G.g.loc.p)}!`, `Come to ${pname(G.g.loc.r, G.g.loc.p)}!`), () => L("Necesito ayuda 🆘", "Need help 🆘"), () => L("¿Hacemos la historia juntos?", "Story together?"), () => L("Voy para allá 🏃", "On my way 🏃"), () => L("¡Gané! 🎉", "I won! 🎉"), () => "gg"];
  const msgs = () => { const out = []; for (const c of meAll()) for (const m of c.g?.chat || []) out.push({ ...m, n: c.nombre, me: c.owner === Store.uid, raza: c.raza, cid: c.id }); return out.sort((a, b) => a.at - b.at).slice(-60); };
  let chatOpen = false; let lastSeenChat = (() => { try { return +localStorage.getItem("sa-chat-seen") || 0; } catch (e) { return 0; } })();
  function chatSend(t) {
    t = String(t || "").trim().slice(0, 200); if (!t || !G) return;
    G.g.chat = [...(G.g.chat || []), { t, at: Date.now() }].slice(-25); dq("chat"); sfx("click"); persist(); chatDraw(true); render();
  }
  function chatDraw(scroll) {
    let root = document.getElementById("xchat");
    const inGame = G && view.name === "game";
    if (!inGame) { if (root) root.hidden = true; return; }
    if (!root) {
      root = document.createElement("div"); root.id = "xchat";
      root.innerHTML = `<button type="button" id="xchat-btn" class="btn">💬 <span id="xchat-n"></span></button><div id="xchat-p" hidden><div class="xh"><b>💬 ${L("Chat del grupo", "Group chat")}</b><button type="button" class="link" id="xchat-x">✕</button></div><div id="xchat-l"></div><div id="xchat-q"></div><form id="xchat-f"><input id="xchat-i" maxlength="200" autocomplete="off" placeholder="${L("Escribe algo…", "Say something…")}"><button type="submit" class="btn small primary">${L("Enviar", "Send")}</button></form></div>`;
      document.body.appendChild(root);
      root.querySelector("#xchat-btn").onclick = () => { chatOpen = !chatOpen; chatDraw(true); if (chatOpen) setTimeout(() => root.querySelector("#xchat-i")?.focus(), 30); };
      root.querySelector("#xchat-x").onclick = () => { chatOpen = false; chatDraw(); };
      root.querySelector("#xchat-f").onsubmit = (ev) => { ev.preventDefault(); const i = root.querySelector("#xchat-i"); chatSend(i.value); i.value = ""; };
      root.querySelector("#xchat-q").onclick = (ev) => { const b = ev.target.closest("[data-q]"); if (b) chatSend(QUICK[+b.dataset.q]()); };
    }
    root.hidden = false; const list = msgs(); const p = root.querySelector("#xchat-p"); p.hidden = !chatOpen;
    if (chatOpen && list.length) { lastSeenChat = list[list.length - 1].at; try { localStorage.setItem("sa-chat-seen", String(lastSeenChat)); } catch (e) {} }
    const unread = list.filter((m) => !m.me && m.at > lastSeenChat).length; root.querySelector("#xchat-n").textContent = unread ? unread : ""; root.querySelector("#xchat-btn").classList.toggle("has", !!unread);
    if (chatOpen) {
      const l = root.querySelector("#xchat-l"); const atBottom = l.scrollHeight - l.scrollTop - l.clientHeight < 40;
      l.innerHTML = list.length ? list.map((m) => `<div class="xm ${m.me ? "me" : ""}">${(window.SA_AV && window.SA_AV.faceById(m.cid, "rimg mface")) || (typeof raceImg === "function" ? raceImg(m.raza, "rimg mface") : "")}<div><b>${esc(m.n)}</b> <small>${new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small><div>${esc(m.t)}</div></div></div>`).join("") : `<p class="muted">${L("Nadie ha escrito todavía. ¡Saluda!", "No messages yet. Say hi!")}</p>`;
      if (scroll || atBottom) l.scrollTop = l.scrollHeight;
      const q = root.querySelector("#xchat-q"); q.innerHTML = QUICK.map((f, i) => `<button type="button" class="chip" data-q="${i}">${esc(f())}</button>`).join("");
    }
  }
  let lastMsgAt = null;
  function chatNotify() {
    const list = msgs().filter((m) => !m.me); const last = list[list.length - 1];
    if (lastMsgAt != null && last && last.at > lastMsgAt && !chatOpen) { sfx("status"); toast(`💬 ${last.n}: ${last.t.slice(0, 60)}`); }
    lastMsgAt = last ? last.at : 0;
  }

  // =====================================================================
  // 11. GUÍA PARA NUEVOS Y NOVEDADES
  // =====================================================================
  const TUTO = [
    [null, () => L("¡Bienvenido a Solvaria! Eres estudiante de primer año en Sunrise Academy. Esta guía corta te enseña dónde está todo.", "Welcome to Solvaria! This short guide shows where everything is.")],
    [".hud", () => L("Arriba ves tu vida (PV), maná, Energía y Soles. Casi todo cuesta Energía: descansa en una posada para recuperarla.", "Your HP, mana, Energy and Soles. Rest at an inn to recover Energy.")],
    [".qtrack", () => L("«Qué hacer ahora» siempre te dice el siguiente paso de la historia, con un botón para hacerlo. Si no sabes qué hacer, mira aquí.", "«What to do now» always shows your next story step.")],
    ['[data-gtab="lugar"]', () => L("Lugar: lo que puedes hacer donde estás (cazar, explorar, hablar con gente, tiendas, forja, mazmorras) y quién más está aquí.", "Place: what you can do here.")],
    ['[data-gtab="mapa"]', () => L("Mapa: viaja a otros sitios y mira dónde están tus amigos (sus retratos salen en el mapa).", "Map: travel and see your friends.")],
    ['[data-gtab="historia"]', () => L("Historia: tus capítulos, escenas y las votaciones del grupo.", "Story: chapters, scenes and group votes.")],
    ['[data-gtab="bolsa"]', () => L("Bolsa: objetos, tu arsenal de armas, armadura, accesorio, mascota y montura.", "Bag: items, weapons, gear, pet and mount.")],
    ['[data-gtab="grupo"]', () => L("Grupo: los demás jugadores, intercambios, el cofre compartido y el jefe mundial de la semana.", "Group: players, trades, shared chest and world boss.")],
    ["#xchat-btn", () => L("Chat: habla con tu grupo y usa mensajes rápidos como «¡Ven aquí!».", "Chat with your group.")],
    [null, () => L("Cada día tienes 3 misiones diarias en la pestaña Lugar. ¡Eso es todo! Puedes volver a ver esta guía con el botón ❓ de arriba.", "3 daily quests in the Place tab. Reopen this guide with ❓.")],
  ];
  const NEWS = () => L(`<b>🆕 Novedades en Solvaria</b><ul>
    <li>💬 <b>Chat del grupo</b> (botón abajo a la derecha)</li><li>🔨 <b>Forja</b>: mejora tu arma hasta +10 y evolúcionala (Pueblo del Alba, Minas de Durgan, Gremios, Forjaroja)</li>
    <li>🛡️ <b>Armaduras y accesorios</b> en las armerías, mazmorras y jefes</li><li>🌋 <b>Jefe mundial</b> cada semana: todos le bajan la vida</li>
    <li>🏰 <b>Mazmorras</b> con pisos seguidos, en solitario o en grupo</li><li>🤺 <b>Duelos</b> contra tus amigos en la Arena de Trigalia y el Coliseo</li>
    <li>🏦 <b>Cofre del grupo</b> en la pestaña Grupo</li><li>📅 <b>3 misiones diarias</b> en la pestaña Lugar</li><li>🐾 <b>Mascotas y monturas</b> (la montura acorta los viajes a pie)</li></ul>`, "<b>🆕 What's new</b>: chat, forge, armor, world boss, dungeons, duels, group chest, dailies, pets & mounts.");
  let tuto = null; let tutoT = null; // índice de paso o "news"
  function tutoDraw() {
    document.querySelectorAll(".xtuto-hl").forEach((e) => e.classList.remove("xtuto-hl"));
    let box = document.getElementById("xtuto");
    if (tuto == null || !G || view.name !== "game") { if (box) box.remove(); return; }
    if (window.SA_SCENE?.busy?.()) { if (box) box.hidden = true; clearTimeout(tutoT); tutoT = setTimeout(tutoDraw, 800); return; }
    if (box) box.hidden = false;
    if (!box) { box = document.createElement("div"); box.id = "xtuto"; document.body.appendChild(box); box.addEventListener("click", tutoClick); }
    if (tuto === "news") { box.innerHTML = `<div class="xt-c">${NEWS()}<div class="row"><button type="button" class="btn primary small" data-xt="close">${L("¡A jugar!", "Let's play!")}</button><button type="button" class="btn ghost small" data-xt="tour">${L("Ver la guía", "Show the guide")}</button></div></div>`; return; }
    const [sel, txt] = TUTO[tuto]; const el = sel && document.querySelector(sel); if (el) { el.classList.add("xtuto-hl"); el.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
    box.innerHTML = `<div class="xt-c"><small class="muted">${L("Guía", "Guide")} ${tuto + 1}/${TUTO.length}</small><p>${txt()}</p><div class="row">${tuto > 0 ? `<button type="button" class="btn ghost small" data-xt="prev">←</button>` : ""}<button type="button" class="btn primary small" data-xt="next">${tuto === TUTO.length - 1 ? L("Terminar", "Finish") : L("Siguiente", "Next")}</button><button type="button" class="link" data-xt="close">${L("Saltar", "Skip")}</button></div></div>`;
  }
  setInterval(() => { const box = document.getElementById("xtuto"); if (box) { const b = !!window.SA_SCENE?.busy?.(); if (box.hidden !== b) { box.hidden = b; if (!b) tutoDraw(); } } }, 700);
  function tutoClick(ev) {
    const b = ev.target.closest("[data-xt]"); if (!b) return; const a = b.dataset.xt;
    if (a === "close") { tuto = null; G.g.tuto = 1; G.g.news = 3; persist(); }
    else if (a === "tour") tuto = 0;
    else if (a === "next") { if (tuto >= TUTO.length - 1) { tuto = null; G.g.tuto = 1; G.g.news = 3; persist(); } else tuto++; }
    else if (a === "prev") tuto = Math.max(0, tuto - 1);
    tutoDraw();
  }
  function helpButton() {
    let b = document.getElementById("xhelp"); const lang = document.getElementById("langbtn");
    if (!b && lang && lang.parentNode) { b = document.createElement("button"); b.id = "xhelp"; b.type = "button"; b.className = "btn small ghost"; b.textContent = "❓"; b.title = L("Guía", "Guide"); lang.parentNode.insertBefore(b, lang); b.addEventListener("click", () => { if (!G || view.name !== "game") return toast(L("Entra con un personaje para ver la guía.", "Open a character first.")); tuto = 0; tutoDraw(); }); }
    if (b) b.hidden = !(G && view.name === "game");
  }
  let tutoChecked = null;
  function tutoAuto() {
    if (!G || view.name !== "game" || tutoChecked === G.id) return; tutoChecked = G.id;
    if (G.g.tuto) { if (G.g.news !== 3) { tuto = "news"; } return; }
    const fresh = (G.nivel || 1) <= 3 && (G.g.day || 1) <= 2;
    tuto = fresh ? 0 : "news";
  }

  // =====================================================================
  // 12. VISTAS
  // =====================================================================
  const _pv = placeView;
  placeView = function () {
    const out = _pv(); const extra = dailyBox() + dunBox() + arenaBox() + forgeBox() + wearShopBox() + stableBox() + (Store.world?.raids?.[wbId()]?.place === hereKey() ? wbBox() : "");
    const re = /(<div class="scene"[\s\S]*?<\/div><\/div>)/;
    return re.test(out) ? out.replace(re, `$1${extra}`) : extra + out;
  };
  const _gv = groupView;
  groupView = function () { return _gv().replace(/(<h2>[^<]*<\/h2>)/, `$1${wbBox()}${bankBox()}`); };
  const _bv = bagView;
  bagView = function () {
    const out = _bv(); const e = eq(); const g = own();
    const wearInv = Object.keys(G.g.inv).filter((n) => WEAR[n]);
    const slot = (s, ic, lb) => `<div class="si ${e[s] ? "eq" : ""}"><span><b>${ic} ${lb}: ${e[s] ? esc(e[s]) : L("nada", "none")}</b>${e[s] ? `<small>${esc(wearDesc(e[s]))}</small>` : ""}</span>${e[s] ? `<button type="button" class="btn small ghost" data-xunwear="${s}">${L("Quitar", "Remove")}</button>` : ""}</div>`;
    const box = `<div class="card mini gearb"><b>🛡️ ${L("Equipo", "Gear")}</b>${SLOTS.map((sl) => slot(sl, SLOT_IC[slotType(sl)], SLOT_NM()[slotType(sl)])).join("")}
      ${wearInv.map((n) => `<div class="si"><span><b>${SLOT_IC[WEAR[n].s]} ${esc(n)}</b><small>${esc(wearDesc(n))} · ${L("en la bolsa", "in bag")} (${G.g.inv[n]})</small></span><button type="button" class="btn small" data-xwear="${esc(n)}">${L("Ponerse", "Wear")}</button></div>`).join("")}
      <div class="row pm"><span>🐾 ${L("Mascota", "Pet")}:</span>${g.mascotas.length ? [null, ...g.mascotas].map((n) => `<button type="button" class="chip ${G.g.mascota === n ? "on" : ""}" data-xpet="${n ? esc(n) : ""}">${n ? `${PETS[n].i} ${esc(n)}` : L("ninguna", "none")}</button>`).join("") : `<small class="muted">${L("Adopta una en Pueblo del Alba, Copaalta, Trigalia, la Plaza Real, el Muelle o Forjaroja.", "Adopt one in town.")}</small>`}</div>
      ${G.g.mascota ? `<small class="muted">${PETS[G.g.mascota].i} ${esc(PETS[G.g.mascota].d)}</small>` : ""}
      <div class="row pm"><span>🐎 ${L("Montura", "Mount")}:</span>${g.monturas.length ? [null, ...g.monturas].map((n) => `<button type="button" class="chip ${G.g.montura === n ? "on" : ""}" data-xmount="${n ? esc(n) : ""}">${n ? `${MOUNTS[n].i} ${esc(n)}` : L("a pie", "on foot")}</button>`).join("") : `<small class="muted">${L("Compra una en los establos (Pueblo del Alba, Trigalia, Forjaroja o los Nidos del Grifo).", "Buy one at a stable.")}</small>`}</div></div>`;
    return out.replace(/(<\/p>)/, `$1${box}`);
  };
  const _hud = hud;
  hud = function () {
    const out = _hud(); if (!G?.g) return out; const b = [];
    if (G.g.mascota && PETS[G.g.mascota]) b.push(`${PETS[G.g.mascota].i} ${esc(G.g.mascota)}`); if (G.g.montura && MOUNTS[G.g.montura]) b.push(`${MOUNTS[G.g.montura].i} ${esc(G.g.montura)}`);
    if (eq().pecho) b.push(`🥋 ${esc(eq().pecho)}`);
    return b.length ? out.replace('<div class="where">', `<div class="where"><small class="xbadges">${b.join(" · ")}</small><br>`) : out;
  };
  let lastPvpSeen = null;
  function pvpNotify() {
    const hits = others().map((c) => c.g?.pvp?.last).filter((l) => l && l.vs === G.id);
    const newest = Math.max(0, ...hits.map((l) => l.at));
    if (lastPvpSeen != null && newest > lastPvpSeen) { const l = hits.find((x) => x.at === newest); const who = others().find((c) => c.g?.pvp?.last === l); toast(L(`🤺 ${who?.nombre || "Alguien"} te retó en la Arena y ${l.win ? "ganó" : "perdió"}.`, `🤺 ${who?.nombre || "Someone"} dueled you.`)); }
    lastPvpSeen = newest;
  }

  // =====================================================================
  // 13. CLICS Y ENGANCHES
  // =====================================================================
  document.addEventListener("click", (ev) => {
    if (view.name !== "game" || !G) return;
    const t = ev.target.closest("button"); if (!t) return; const d = t.dataset; const stop = () => ev.stopPropagation();
    if (d.xforge) { stop(); return forge(); }
    if (d.xwear) { stop(); const [n, sl] = d.xwear.split("|"); return wear(n, sl); }
    if (d.xunwear) { stop(); return unwear(d.xunwear); }
    if (d.xwearshop) { stop(); gsel.xwear = gsel.xwear === hereKey() ? null : hereKey(); return render(); }
    if (d.xwearbuy) { stop(); return wearBuy(d.xwearbuy); }
    if (d.xbuy) { stop(); const [k, n] = d.xbuy.split("|"); return buyPet(n, k); }
    if (d.xpet != null) { stop(); G.g.mascota = d.xpet || null; persist(); return render(); }
    if (d.xmount != null) { stop(); G.g.montura = d.xmount || null; persist(); return render(); }
    if (d.xdq) { stop(); return dqClaim(+d.xdq); }
    if (d.xdaily) { stop(); gsel.xdaily = gsel.xdaily === false ? true : false; return render(); }
    if (d.xdun) { stop(); const [a, id] = d.xdun.split(":"); if (a === "enter") return dunEnter(id); if (a === "fight") return dunFight(); if (a === "group") return dunGroup(); if (a === "leave") { G.g.dun = null; persist(); return render(); } }
    if (d.xpvp) { stop(); return pvpStart(d.xpvp); }
    if (d.xbank) { stop(); gsel.xbank = !gsel.xbank; return render(); }
    if (d.xbk) { stop(); const [k, n, dir] = d.xbk.split("|"); if (k === "soles") return bankMove("soles", document.getElementById(n === "in" ? "xbk-sol-in" : "xbk-sol-out")?.value, +dir); return bankMove(k, n, +dir); }
  }, true);
  const _render = render;
  render = function () {
    try { if (G && view.name === "game") { ensureAll(); eq(); own(); daily(); applyStats(); wbEnsure(); tutoAuto(); } } catch (e) { console.warn("extra:", e); }
    const r = _render.apply(this, arguments);
    try { chatDraw(); helpButton(); if (G && view.name === "game") { chatNotify(); pvpNotify(); tutoDraw(); } else tutoDraw(); } catch (e) { console.warn("extra:", e); }
    return r;
  };

  const css = `
#xchat{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
#xchat-btn{border-radius:22px;padding:8px 14px;box-shadow:0 4px 16px #0008}#xchat-btn.has{border-color:#e0584a;color:#fff;background:#e0584a33}#xchat-n:empty{display:none}
#xchat-p{width:min(360px,calc(100vw - 32px));max-height:min(520px,70vh);display:flex;flex-direction:column;background:var(--panel,#0f1822);border:1px solid var(--line);border-radius:10px;box-shadow:0 10px 30px #000a;overflow:hidden;order:-1}
#xchat-p[hidden]{display:none}.xh{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--line)}
#xchat-l{flex:1;overflow:auto;padding:8px 10px;display:flex;flex-direction:column;gap:8px;min-height:120px}
.xm{display:flex;gap:6px;align-items:flex-start;font-size:13.5px}.xm small{color:var(--ink-2);font-size:11px}.xm.me>div{background:#d9a44114;border-radius:6px;padding:2px 6px}
#xchat-q{display:flex;gap:4px;flex-wrap:wrap;padding:6px 10px;border-top:1px solid var(--line)}#xchat-q .chip{font-size:11.5px;padding:2px 8px}
#xchat-f{display:flex;gap:6px;padding:8px 10px;border-top:1px solid var(--line)}#xchat-i{flex:1;min-width:0}
#xtuto{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:70;width:min(520px,calc(100vw - 32px))}
.xt-c{background:var(--panel,#0f1822);border:1px solid #d9a441aa;border-radius:10px;padding:14px 16px;box-shadow:0 10px 40px #000c;display:flex;flex-direction:column;gap:8px}.xt-c p{margin:0}.xt-c ul{margin:6px 0;padding-left:18px;display:flex;flex-direction:column;gap:3px}
.xtuto-hl{outline:3px solid #ffd84a !important;outline-offset:3px;border-radius:6px;position:relative;z-index:5;box-shadow:0 0 0 9999px #0006 !important}
.daily .dq{display:flex;flex-direction:column;gap:6px;margin-top:6px}.dqi{display:flex;justify-content:space-between;align-items:center;gap:10px}.dqi small{color:var(--ink-2)}.dqi.ok{opacity:.55}.dqi .qt-bar{width:120px}
.dun.on{border-color:#9b5cff66}.dfl{display:flex;gap:4px;margin:6px 0}.dfl i{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:12px;background:#1b2635;color:var(--ink-2)}.dfl i.ok{background:#8be0a833;color:#8be0a8}.dfl i.now{background:#9b5cff55;color:#fff;box-shadow:0 0 8px #9b5cff}
.wboss{border-color:#e0584a77;background:linear-gradient(90deg,#e0584a14,transparent 70%),var(--panel-2)}.wboss small{display:block;color:var(--ink-2);margin-top:3px}.wbbar{max-width:none;height:8px}.wbbar i{background:linear-gradient(90deg,#e0584a,#ffb36b)}
.wgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin-top:8px}
.witem{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-left:3px solid var(--rc,#8a96a8);border-radius:8px;padding:8px 10px;background:var(--panel-2)}
.witem .wic{font-size:24px;width:40px;height:40px;display:grid;place-items:center;border-radius:8px;background:#0b131c;box-shadow:inset 0 0 0 1px var(--rc,#8a96a8)}
.witem .wb{flex:1;display:flex;flex-direction:column;gap:1px;min-width:0}.witem small{color:var(--ink-2);font-size:12.5px}.witem .up{color:#8be0a8}
.r-c{--rc:#8a96a8}.r-r{--rc:#4fb3ff}.r-e{--rc:#b98cf0}.r-l{--rc:#ff9a3d}
.gearb .si.eq{border-left:3px solid #8be0a8;padding-left:8px}.gearb .pm{gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center}
.xbadges{color:#d9c9a0}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
