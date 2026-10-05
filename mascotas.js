// ===================== MASCOTAS: niveles, crecimiento, amistad, ayuda en combate y al cazar =====================
// Carga después de ui.js (y antes de iconos.js). Amplía SA_EXTRA.PETS / MOUNTS (mismos objetos que usa extra.js).
(function () {
  const X = window.SA_EXTRA; if (!X || !X.PETS || typeof render !== "function") return;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const sfx = (k, ...a) => { try { window.SA_SFX?.[k]?.(...a); } catch (e) {} };
  const fxq = (ev) => { try { window.SA_FXQ?.(ev); } catch (e) {} };
  const RM = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  const PETS = X.PETS, MOUNTS = X.MOUNTS;
  const pic = (n) => { try { return (window.SAI && window.SAI.pet && window.SAI.pet(n)) || PETS[n].i; } catch (e) { return PETS[n]?.i || "🐾"; } };

  // ---------------------------------------------------------------------
  // 1. CATÁLOGO
  // role: atk (ataca), guard (protege con escudo), heal (cura), magia (daño + estado), hunt (caza: más botín), luck (suerte: Soles)
  // r: rareza c/r/e/l · k/v: bono pasivo (dmg, def, init, xp, soles) que crece con el nivel
  // ---------------------------------------------------------------------
  const BASE = {
    "Zorro de luz": { role: "atk", aff: "Luz", r: "c" },
    "Tortuguita de río": { role: "guard", aff: "Agua", r: "c" },
    "Gato de la suerte": { role: "luck", r: "r" },
    "Búho mensajero": { role: "heal", aff: "Aire", r: "r" },
    "Murciélago del velo": { role: "magia", aff: "Sombra", r: "r" },
    "Dragoncito de ceniza": { role: "atk", aff: "Fuego", r: "e" },
  };
  const NEW = {
    // Valle del Alba
    "Conejo del alba": { i: "🐇", role: "heal", aff: "Luz", r: "c", k: "init", v: 1, p: 110, at: "alba:0" },
    "Pollito solar": { i: "🐤", role: "magia", aff: "Luz", r: "c", k: "xp", v: 0.04, p: 140, at: "alba:1" },
    // Bosque de Verdemar
    "Ardilla de Copaalta": { i: "🐿️", role: "hunt", r: "c", k: "init", v: 1, p: 160, at: "verde:0" },
    "Cervatillo del bosque": { i: "🦌", role: "heal", aff: "Tierra", r: "r", k: "def", v: 1, p: 380, at: "verde:0" },
    // Llanuras
    "Perro pastor": { i: "🐕", role: "guard", r: "c", k: "def", v: 1, p: 200, at: "llan:0" },
    "Tejón de Trigalia": { i: "🦡", role: "hunt", r: "r", k: "soles", v: 0.08, p: 320, at: "llan:0" },
    // Costa
    "Nutria del puerto": { i: "🦦", role: "hunt", aff: "Agua", r: "c", k: "soles", v: 0.06, p: 220, at: "costa:0" },
    "Loro pirata": { i: "🦜", role: "luck", r: "r", k: "soles", v: 0.12, p: 450, at: "costa:0" },
    "Pulpito de coral": { i: "🐙", role: "magia", aff: "Agua", r: "r", k: "init", v: 1, p: 520, at: "costa:0" },
    // Escarcha
    "Cabrito de las nubes": { i: "🐐", role: "guard", r: "c", k: "def", v: 1, p: 260, at: "esc:0" },
    "Pingüino de escarcha": { i: "🐧", role: "magia", aff: "Agua", r: "r", k: "def", v: 1, p: 600, at: "esc:0" },
    // Tierras Quemadas
    "Salamandra de forja": { i: "🦎", role: "magia", aff: "Fuego", r: "r", k: "dmg", v: 2, p: 700, at: "quem:0" },
    "Escarabajo de brasa": { i: "🪲", role: "guard", aff: "Fuego", r: "r", k: "def", v: 2, p: 480, at: "quem:0" },
    // Violeta
    "Polilla lunar": { i: "🦋", role: "heal", aff: "Luz", r: "e", k: "xp", v: 0.06, p: 900, at: "viol:0" },
    "Gato de sombra": { i: "🐈‍⬛", role: "magia", aff: "Sombra", r: "r", k: "init", v: 2, p: 650, at: "viol:0" },
    // Capital
    "Cachorro de león real": { i: "🦁", role: "atk", r: "e", k: "dmg", v: 4, p: 1400, at: "cap:0" },
    "Hada de bolsillo": { i: "🧚", role: "heal", aff: "Luz", r: "e", k: "xp", v: 0.1, p: 1300, at: "cap:0" },
    "Dragoncito de tormenta": { i: "🐲", role: "magia", aff: "Rayo", r: "l", k: "dmg", v: 6, p: 2500, need: { "Escama de trueno": 3 }, at: "cap:0" },
    // Isla del Umbral
    "Tigre de las islas": { i: "🐯", role: "atk", r: "e", k: "dmg", v: 4, p: 1600, at: "lost:0" },
    "Gólem de bolsillo": { i: "🗿", role: "guard", aff: "Tierra", r: "e", k: "def", v: 3, p: 1500, at: "lost:0" },
    "Fénix bebé": { i: "🐦", role: "heal", aff: "Fuego", r: "l", k: "xp", v: 0.12, p: 3000, need: { "Carbón ardiente": 3, "Pluma de grifo": 2 }, at: "lost:0" },
    "Unicornio pequeño": { i: "🦄", role: "heal", aff: "Luz", r: "l", k: "def", v: 3, p: 3200, need: { "Cristal eterno": 2 }, at: "lost:0" },
    // Salvajes: no se compran; a veces una cría te sigue después de ganar
    "Lobezno": { i: "🐺", role: "atk", r: "c", k: "dmg", v: 2, wild: /Lobos del bosque/, ch: 0.06 },
    "Lobezno de las nieves": { i: "🐺", role: "atk", aff: "Agua", r: "r", k: "dmg", v: 3, wild: /Lobos blancos/, ch: 0.04 },
    "Arañita tejedora": { i: "🕷️", role: "magia", aff: "Tierra", r: "r", k: "init", v: 1, wild: /Arañas/, ch: 0.04 },
    "Cangrejito de roca": { i: "🦀", role: "guard", aff: "Tierra", r: "c", k: "def", v: 1, wild: /Cangrejos/, ch: 0.06 },
    "Sapito saltarín": { i: "🐸", role: "heal", aff: "Agua", r: "c", k: "init", v: 1, wild: /Sapos/, ch: 0.06 },
    "Murcielaguito de cuarzo": { i: "🦇", role: "magia", aff: "Tierra", r: "c", k: "init", v: 1, wild: /Murciélagos/, ch: 0.06 },
    "Salamandrita": { i: "🦎", role: "magia", aff: "Fuego", r: "c", k: "dmg", v: 1, wild: /Salamandras/, ch: 0.06 },
    "Yeti bebé": { i: "🐻‍❄️", role: "guard", aff: "Agua", r: "e", k: "def", v: 2, wild: /Yetis/, ch: 0.03 },
    "Cría de grifo": { i: "🦅", role: "atk", aff: "Aire", r: "e", k: "init", v: 2, wild: /Grifos/, ch: 0.03 },
    "Draco bebé": { i: "🐉", role: "atk", aff: "Fuego", r: "l", k: "dmg", v: 5, wild: /Dracos/, ch: 0.015 },
  };
  for (const [n, x] of Object.entries(NEW)) if (!PETS[n]) PETS[n] = x;
  for (const [n, x] of Object.entries(BASE)) if (PETS[n]) Object.assign(PETS[n], x);

  const NEWM = {
    "Ciervo plateado": { i: "🦌", m: 0.6, p: 650, at: "verde:0" },
    "Cabra de las cumbres": { i: "🐐", m: 0.62, p: 550, at: "esc:0" },
    "Caballito de mar gigante": { i: "🐴", m: 0.58, p: 800, at: "costa:0" },
    "Lobo de sombra": { i: "🐺", m: 0.5, p: 1100, at: "viol:0" },
    "Corcel real": { i: "🐎", m: 0.45, p: 1800, at: "cap:0" },
    "Pegaso del Umbral": { i: "🦄", m: 0.3, p: 3000, need: { "Pluma de grifo": 5, "Cristal eterno": 2 }, at: "lost:0" },
  };
  for (const [n, x] of Object.entries(NEWM)) if (!MOUNTS[n]) MOUNTS[n] = x;

  const ROLE = {
    atk: { ic: "⚔️", n: () => L("Atacante", "Attacker"), b: 3, g: 1.4 },
    magia: { ic: "✨", n: () => L("Mágica", "Mystic"), b: 2, g: 1.15 },
    guard: { ic: "🛡️", n: () => L("Guardiana", "Guardian"), b: 1.5, g: 0.75 },
    heal: { ic: "💚", n: () => L("Sanadora", "Healer"), b: 1, g: 0.6 },
    hunt: { ic: "🎯", n: () => L("Cazadora", "Hunter"), b: 2.5, g: 1.1 },
    luck: { ic: "🍀", n: () => L("Suertuda", "Lucky"), b: 2, g: 0.9 },
  };
  const RAR = { c: 1, r: 1.12, e: 1.28, l: 1.5 };
  const RARN = () => ({ c: L("Común", "Common"), r: L("Rara", "Rare"), e: L("Épica", "Epic"), l: L("Legendaria", "Legendary") });
  const STATUS = { Fuego: "Quemado", Rayo: "Aturdido", Sombra: "Asustado", Luz: "Cegado", Agua: "Aturdido", Tierra: "Aturdido", Aire: "Cegado" };
  const MAXL = 30;
  const STAGES = [[1, "cria", () => L("Cría", "Baby"), 0.85], [5, "joven", () => L("Joven", "Young"), 1], [12, "adulta", () => L("Adulta", "Adult"), 1.15], [20, "ancestral", () => L("Ancestral", "Ancestral"), 1.35]];
  const PASS = { dmg: (v) => L(`+${v} de daño`, `+${v} damage`), def: (v) => L(`+${v} Defensa`, `+${v} Defense`), init: (v) => L(`+${v} iniciativa`, `+${v} initiative`), xp: (v) => `+${Math.round(v * 100)}% XP`, soles: (v) => L(`+${Math.round(v * 100)}% Soles al ganar`, `+${Math.round(v * 100)}% Soles`) };

  // ---------------------------------------------------------------------
  // 2. ESTADO POR MASCOTA
  // ---------------------------------------------------------------------
  const today = () => G.g.day || 0;
  function st(n) {
    const g = G.g; g.pets = g.pets || {}; g.mascotas = g.mascotas || [];
    if (!g.pets[n]) g.pets[n] = { lvl: 1, xp: 0, am: 10, pet: -1, play: -1, feed: 0, feedDay: -1, train: -1, exDay: -1, exN: 0 };
    return g.pets[n];
  }
  const need = (lvl) => 25 + 20 * lvl;
  const stage = (lvl) => { let s = STAGES[0]; for (const x of STAGES) if (lvl >= x[0]) s = x; return s; };
  const hearts = (n) => Math.min(5, Math.floor((st(n).am || 0) / 20));
  const lvlOf = (n) => (G?.g?.pets?.[n]?.lvl) || 1;
  function power(n) {
    const p = PETS[n]; const s = st(n); const R = ROLE[p.role] || ROLE.atk;
    return Math.round((R.b + R.g * s.lvl) * (RAR[p.r] || 1) * stage(s.lvl)[3] * (1 + 0.05 * hearts(n)));
  }
  const actChance = (n) => Math.min(0.78, 0.4 + 0.075 * hearts(n));
  // El bono pasivo (lo lee extra.js con petB) crece con el nivel: se vuelve un getter.
  for (const [n, p] of Object.entries(PETS)) {
    const vb = typeof p.v === "number" ? p.v : 0; const kb = p.k;
    try {
      Object.defineProperty(p, "vb", { value: vb, writable: true, configurable: true });
      Object.defineProperty(p, "v", { configurable: true, enumerable: true, get() { const l = lvlOf(n); return kb === "xp" || kb === "soles" ? +(vb * (1 + 0.05 * (l - 1))).toFixed(3) : Math.round(vb * (1 + 0.12 * (l - 1))); } });
      Object.defineProperty(p, "d", { configurable: true, enumerable: true, get() { const R = ROLE[p.role]; return `${R ? R.ic + " " + R.n() + " · " : ""}${PASS[kb] ? PASS[kb](p.v) : ""}`; } });
    } catch (e) {}
  }

  function addPetXP(n, amt, lines) {
    if (!n || !PETS[n]) return; const s = st(n); const cap = Math.min(MAXL, (G.nivel || 1) + 3);
    if (s.lvl >= cap) { s.xp = Math.min(s.xp + amt, need(s.lvl) - 1); return; }
    s.xp += amt; let up = false; const st0 = stage(s.lvl)[1];
    while (s.lvl < cap && s.xp >= need(s.lvl)) { s.xp -= need(s.lvl); s.lvl++; up = true; }
    if (up) {
      const grew = stage(s.lvl)[1] !== st0;
      const msg = grew ? L(`¡${n} creció! Ahora es ${stage(s.lvl)[2]().toLowerCase()} (nivel ${s.lvl}).`, `${n} grew up! Now ${stage(s.lvl)[2]()} (lv ${s.lvl}).`) : L(`${n} sube a nivel ${s.lvl}.`, `${n} reached level ${s.lvl}.`);
      lines && lines.push(`${PETS[n].i} ${msg}`); toast(`${PETS[n].i} ${msg}`); sfx("level");
      if (grew) G.g.petGrow = { n, at: Date.now() };
    }
  }
  function addAm(n, a) { if (!n || !PETS[n]) return 0; const s = st(n); const h0 = hearts(n); s.am = Math.max(0, Math.min(100, (s.am || 0) + a)); const h1 = hearts(n); if (h1 > h0) toast(`${PETS[n].i} ${L(`¡Tu amistad con ${n} sube a ${"♥".repeat(h1)}!`, `Friendship with ${n}: ${"♥".repeat(h1)}!`)}`); return h1 - h0; }

  // ---------------------------------------------------------------------
  // 3. COMBATE: la mascota actúa después de ti
  // ---------------------------------------------------------------------
  const noPets = (c) => ["pvp", "duel"].includes(c.kind);
  function petAct() {
    const c = G.g.combat; const n = G.g.mascota; const p = PETS[n]; if (!c || !p || noPets(c)) return;
    const al = c.enemies.map((e, i) => ({ e, i })).filter((x) => x.e.pv > 0); if (!al.length) return;
    const ps = c.pst; const s = st(n); const pw = power(n); const nm = n.split(" ")[0];
    // Vínculo total (♥5): una vez por combate, si estás en peligro
    if (hearts(n) >= 5 && !c.petBond && G.pv > 0 && G.pv < G.pvMax * 0.35) {
      c.petBond = true; const h = Math.round(G.pvMax * 0.18); G.pv = Math.min(G.pvMax, G.pv + h); ps.barrier = (ps.barrier || 0) + Math.round(pw * 1.5);
      fxq({ k: "ally", heal: h, who: nm }); clog(L(`💞 Vínculo total: ${n} se pone delante de ti. Recuperas ${h} PV y ganas un escudo.`, `💞 Full bond: ${n} shields you (+${h} HP).`)); c.petHop = c.round + 1; return;
    }
    if (Math.random() > actChance(n)) { if (Math.random() < 0.25) clog(L(`${n} te mira, esperando su momento.`, `${n} waits for an opening.`)); return; }
    c.petHop = c.round + 1;
    const t = al.find((x) => x.i === (gsel.target ?? 0)) || al[0];
    const hit = (mult = 1) => { const d = Math.max(1, Math.round((pw - 2 * t.e.def) * mult * (typeof affMult === "function" && p.aff ? affMult(p.aff, t.e.aff) : 1))); t.e.pv = Math.max(0, t.e.pv - d); fxq({ k: "ally", i: t.i, who: nm, dmg: d, c: "#ffcf6e" }); return d; };
    const R = p.role;
    if (R === "heal" && G.pv < G.pvMax * 0.8) { const h = Math.max(2, Math.round(G.pvMax * (0.03 + 0.003 * s.lvl) * (RAR[p.r] || 1))); G.pv = Math.min(G.pvMax, G.pv + h); fxq({ k: "ally", heal: h, who: nm }); clog(L(`${p.i} ${n} te cura: +${h} PV.`, `${p.i} ${n} heals you: +${h} HP.`)); return; }
    if (R === "guard") { const d = hit(); const b = Math.round(2 + 0.8 * s.lvl); ps.barrier = Math.min((ps.barrier || 0) + b, Math.round(G.pvMax * 0.4)); clog(L(`${p.i} ${n} embiste (${d} de daño) y te cubre: escudo +${b}.`, `${p.i} ${n} hits (${d}) and guards you: +${b} shield.`)); return; }
    if (R === "magia") { const d = hit(); let extra = ""; const S = STATUS[p.aff]; if (S && t.e.pv > 0 && !t.e.boss && Math.random() < 0.2 + 0.03 * hearts(n)) { t.e.st[S] = S === "Quemado" ? 2 : 1; extra = L(` ${t.e.n} queda ${S.toLowerCase()}.`, ` ${t.e.n}: ${S}.`); } clog(`${p.i} ${n} ${L("lanza magia", "casts")} (${p.aff || "✦"}): ${d} ${L("de daño", "damage")}.${extra}`); return; }
    if (R === "luck") { const d = hit(); let extra = ""; if (Math.random() < 0.15) { const so = 2 * s.lvl + 3; G.dinero.soles += so; extra = L(` ¡Y encuentra ${so} Soles!`, ` Found ${so} Soles!`); } clog(`${p.i} ${n} ${L("ataca", "attacks")}: ${d} ${L("de daño", "damage")}.${extra}`); return; }
    const crit = R === "atk" && Math.random() < 0.12 + 0.02 * hearts(n); const d = hit(crit ? 2 : 1);
    clog(`${p.i} ${n} ${R === "hunt" ? L("se lanza a la presa", "pounces") : L("muerde", "bites")}: ${d} ${L("de daño", "damage")}${crit ? L(" (¡crítico!)", " (crit!)") : ""}.`);
  }
  const _ap = afterPlayer;
  afterPlayer = function () { try { if (G.g.combat && G.g.combat.enemies.some((e) => e.pv > 0)) petAct(); } catch (e) { console.warn(e); } return _ap.apply(this, arguments); };

  // ---------------------------------------------------------------------
  // 4. VICTORIA / DERROTA: experiencia, amistad, botín de caza, crías salvajes
  // ---------------------------------------------------------------------
  const _vic = victory;
  victory = function () {
    const c = G.g.combat; const n = G.g.mascota; const r = _vic.apply(this, arguments);
    try {
      if (!c || noPets(c)) return r;
      const lines = []; const pl = typeof PLACE_OF === "function" && c.placeKey ? (() => { const [a, b] = c.placeKey.split(":"); return P[a]?.[+b]; })() : null;
      if (n && PETS[n]) {
        const xp = 5 + c.enemies.reduce((a, e) => a + (e.lvl || 1) * (e.boss ? 6 : 2), 0);
        lines.push(`${PETS[n].i} ${n}: +${xp} XP ${L("de mascota", "pet XP")}`);
        addPetXP(n, xp, lines); addAm(n, c.enemies.some((e) => e.boss) ? 3 : 1);
        if (PETS[n].role === "hunt" && pl && Math.random() < 0.35 + 0.04 * hearts(n)) {
          const commons = (pl.obj || []).filter((o) => !/\(\+1|legendario|muy rara/i.test(o)); const animal = c.enemies.some((e) => /Lobo|Sapo|Cangrejo|Rata|Escarabajo|Gaviota|Murci|Yeti|Grifo|Salamandra|Anguila|Gusano|Cuervo/.test(e.n));
          const it = animal && Math.random() < 0.5 ? "Carne de caza" : commons.length ? cleanItem(commons[Math.floor(Math.random() * commons.length)]) : "Carne de caza";
          addItem(it); lines.push(`${PETS[n].i} ${L(`${n} trae algo más: ${it}`, `${n} brings extra: ${it}`)}`);
        }
      }
      // Crías salvajes que te siguen
      const g = G.g; g.mascotas = g.mascotas || [];
      for (const e of c.enemies) {
        if (e.boss) continue;
        const cand = Object.entries(PETS).find(([k, x]) => x.wild && x.wild.test(e.n) && !g.mascotas.includes(k));
        if (cand && Math.random() < cand[1].ch * (1 + 0.1 * (n ? hearts(n) : 0))) {
          const [k, x] = cand; g.mascotas.push(k); st(k).am = 20; if (!g.mascota) g.mascota = k;
          lines.push(`${x.i} ${L(`¡Una cría te sigue después del combate! ${k} ahora es tu mascota.`, `A baby follows you! ${k} is now your pet.`)}`);
          toast(`${x.i} ${L("¡Nueva mascota!", "New pet!")} ${k}`); sfx("level"); log(L(`${k} se unió a ti después de un combate.`, `${k} joined you.`)); G.g.petNew = { n: k, at: Date.now() };
          break;
        }
      }
      if (lines.length) { const tgt = G.g.lastResult?.lines ? G.g.lastResult : G.g.lastBattle?.lines ? G.g.lastBattle : null; if (tgt) tgt.lines.push(...lines); else G.g.lastResult = { title: L("Tu mascota", "Your pet"), lines }; persist(); render(); }
    } catch (e) { console.warn(e); }
    return r;
  };
  const _def = defeat;
  defeat = function () { const n = G?.g?.mascota; const r = _def.apply(this, arguments); try { if (n && PETS[n]) { addAm(n, -2); persist(); } } catch (e) {} return r; };

  // Explorar: la mascota a veces encuentra algo
  const _ex = explore;
  explore = function () {
    const n = G?.g?.mascota; const before = G?.g && !G.g.combat && G.energia >= 1; const r = _ex.apply(this, arguments);
    try {
      if (!before || !n || !PETS[n]) return r; const s = st(n); const p = PETS[n];
      if (s.exDay !== today()) { s.exDay = today(); s.exN = 0; }
      if (s.exN < 5) { s.exN++; addAm(n, 1); }
      addPetXP(n, 3);
      const ch = 0.15 + 0.03 * hearts(n) + (p.role === "hunt" ? 0.2 : 0);
      if (Math.random() < ch) {
        const pl = PLACE_OF(G.g.loc.r, G.g.loc.p); const commons = (pl.obj || []).filter((o) => !/\(\+1|legendario|muy rara|Posada|Tienda|mercado|Barcos|Entrenamiento|Forja|Fabricar|Castillo|Tablón|Encantamientos|Pergamino|Establos|Caravanas|Refugio|Barca|Uniforme|Libros|arquero|Premios|Puntos/i.test(o));
        if (commons.length) { const it = cleanItem(commons[Math.floor(Math.random() * commons.length)]); addItem(it); const line = `${p.i} ${L(`${n} olfatea y encuentra: ${it}`, `${n} sniffs out: ${it}`)}`; if (G.g.lastResult?.lines) G.g.lastResult.lines.push(line); else toast(line); }
      }
      persist(); render();
    } catch (e) { console.warn(e); }
    return r;
  };

  // ---------------------------------------------------------------------
  // 5. CUIDAR: acariciar, jugar, dar de comer, entrenar
  // ---------------------------------------------------------------------
  SHOP.push({ n: "Golosina para mascotas", precio: 12, desc: "Tu mascota la adora: +8 amistad y +15 XP de mascota", kind: "treat" });
  const FOOD = { "Golosina para mascotas": [8, 15], "Carne de caza": [6, 20], "Pescado fresco": [6, 20], "Pan dorado": [4, 10], "Pastel solar": [10, 25], "Brocheta picante": [6, 18] };
  function care(act, n) {
    if (!n || !PETS[n] || !(G.g.mascotas || []).includes(n)) return; const s = st(n); const p = PETS[n]; const d = today();
    if (act === "pet") { if (s.pet === d) return toast(L("Ya la acariciaste hoy. Vuelve mañana.", "Already petted today.")); s.pet = d; addAm(n, 3); addPetXP(n, 5); fxHearts(n, 5); toast(`${p.i} ${L(`${n} ronronea feliz. +3 amistad`, `${n} is happy. +3`)}`); }
    else if (act === "play") { if (s.play === d) return toast(L("Ya jugaron hoy.", "Already played today.")); if (G.energia < 1) return toast(L("Necesitas 1 Energía para jugar.", "Needs 1 Energy.")); G.energia -= 1; s.play = d; addAm(n, 5); addPetXP(n, 12 + 2 * s.lvl); fxHearts(n, 8); toast(`${p.i} ${L(`Juegas con ${n}. +5 amistad`, `You play with ${n}. +5`)}`); }
    else if (act === "train") { if (s.train === d) return toast(L("Ya entrenó hoy.", "Already trained today.")); const cost = 10 + 3 * s.lvl; if (G.dinero.soles < cost) return toast(L(`Entrenar cuesta ${cost} Soles.`, `Costs ${cost} Soles.`)); if (G.energia < 1) return toast(L("Necesitas 1 Energía.", "Needs 1 Energy.")); G.dinero.soles -= cost; G.energia -= 1; s.train = d; const xp = 25 + 8 * s.lvl; addPetXP(n, xp); addAm(n, 1); fxHearts(n, 3, "💪"); toast(`${p.i} ${L(`${n} entrena duro: +${xp} XP`, `${n} trains: +${xp} XP`)}`); }
    else if (act.startsWith("feed:")) {
      const it = act.slice(5); const f = FOOD[it]; if (!f || !G.g.inv[it]) return; if (s.feedDay !== d) { s.feedDay = d; s.feed = 0; }
      if (s.feed >= 3) return toast(L(`${n} está llena. Mañana come más.`, `${n} is full.`)); s.feed++; addItem(it, -1); addAm(n, f[0]); addPetXP(n, f[1]); fxHearts(n, 6, "🍖"); toast(`${p.i} ${L(`${n} se come ${it}. +${f[0]} amistad`, `${n} eats ${it}.`)}`);
    }
    sfx("heal"); persist(); render();
  }
  function fxHearts(n, k, ch) {
    if (RM()) return; const el = document.querySelector(`[data-pcard="${CSS.escape(n)}"] .pbig`) || document.querySelector(".petbud"); if (!el) return;
    const r = el.getBoundingClientRect(); let l = document.getElementById("xanim"); if (!l) { l = document.createElement("div"); l.id = "xanim"; document.body.appendChild(l); }
    for (let i = 0; i < k; i++) { const h = document.createElement("i"); h.className = "pheart"; h.textContent = ch || "♥"; h.style.left = r.left + r.width / 2 + (Math.random() - 0.5) * r.width + "px"; h.style.top = r.top + r.height / 3 + "px"; h.style.animationDelay = i * 0.07 + "s"; h.style.setProperty("--dx", (Math.random() - 0.5) * 60 + "px"); l.appendChild(h); setTimeout(() => h.remove(), 1600); }
  }
  // Usar la golosina desde la Bolsa: se la da a la mascota activa
  const _pi = pItem;
  pItem = function (n) { const it = SHOP.find((s) => s.n === n); if (it?.kind === "treat") { if (G.g.combat) return; if (!G.g.mascota) return toast(L("No tienes mascota contigo.", "No active pet.")); return care("feed:" + n, G.g.mascota); } return _pi.apply(this, arguments); };

  // ---------------------------------------------------------------------
  // 6. PANEL "TUS MASCOTAS" (Bolsa) · compañera en el combate · mini ranura
  // ---------------------------------------------------------------------
  const hrt = (n) => { const h = hearts(n); return `<span class="phrt" title="${L("Amistad", "Friendship")} ${st(n).am}/100">${"♥".repeat(h)}<i>${"♥".repeat(5 - h)}</i></span>`; };
  function petCard(n, on) {
    const p = PETS[n]; const s = st(n); const R = ROLE[p.role] || ROLE.atk; const sg = stage(s.lvl); const d = today(); const cap = Math.min(MAXL, (G.nivel || 1) + 3);
    const feeds = Object.keys(FOOD).filter((k) => G.g.inv[k] > 0);
    const pct = s.lvl >= cap ? 100 : Math.round((100 * s.xp) / need(s.lvl));
    return `<div class="pcard r-${p.r} st-${sg[1]} ${on ? "on" : ""}" data-pcard="${esc(n)}">
      <div class="pbig"><span>${pic(n)}</span><b class="plv">${s.lvl}</b></div>
      <div class="pbody"><div class="row between"><b>${esc(n)}</b>${on ? `<span class="pill ok">${L("Contigo", "With you")}</span>` : ""}</div>
        <small class="rar r-${p.r}">${RARN()[p.r]} · ${sg[2]()} · ${R.ic} ${R.n()}${p.aff ? " · " + esc(p.aff) : ""}</small>
        <div class="pxp"><i style="width:${pct}%"></i></div><small class="muted">${L("Nivel", "Level")} ${s.lvl}${s.lvl >= cap ? (cap < MAXL ? L(" · sube tú de nivel para que siga creciendo", " · level up yourself first") : " · MAX") : ` · ${s.xp}/${need(s.lvl)} XP`}</small>
        <div class="row between"><span>${hrt(n)}</span><small>${L("Poder", "Power")} <b>${power(n)}</b> · ${esc(PASS[p.k] ? PASS[p.k](p.v) : "")}</small></div>
        <div class="pacts">${on ? "" : `<button type="button" class="btn small primary" data-pact="use|${esc(n)}">${L("Llevar conmigo", "Take along")}</button>`}
          <button type="button" class="btn small" data-pact="pet|${esc(n)}" ${s.pet === d ? "disabled" : ""}>🤚 ${L("Acariciar", "Pet")}</button>
          <button type="button" class="btn small" data-pact="play|${esc(n)}" ${s.play === d ? "disabled" : ""}>🎾 ${L("Jugar", "Play")}</button>
          <button type="button" class="btn small" data-pact="train|${esc(n)}" ${s.train === d ? "disabled" : ""}>💪 ${L("Entrenar", "Train")} <small>☀${10 + 3 * s.lvl}</small></button>
          ${feeds.length ? feeds.map((k) => `<button type="button" class="btn small ghost" data-pact="feed:${esc(k)}|${esc(n)}">🍖 ${esc(k)} <small>×${G.g.inv[k]}</small></button>`).join("") : `<small class="muted">${L("Sin comida para ella: compra Golosinas en la tienda o caza carne/pescado.", "No food: buy treats or hunt.")}</small>`}</div></div></div>`;
  }
  function petPanel() {
    const own = (G.g.mascotas || []).filter((n) => PETS[n]); const cur = G.g.mascota;
    const wildN = Object.values(PETS).filter((x) => x.wild).length; const total = Object.keys(PETS).length;
    const list = own.length ? [cur, ...own.filter((n) => n !== cur)].filter((n) => n && own.includes(n)).map((n) => petCard(n, n === cur)).join("") : `<p class="muted">${L("Aún no tienes mascotas. Adóptalas en los establos de los pueblos y ciudades, o gánate a una cría salvaje (lobos, sapos, cangrejos, salamandras…) venciendo en combate.", "No pets yet. Adopt at stables or befriend wild babies.")}</p>`;
    return `<div class="card petpanel"><div class="row between"><h3>🐾 ${L("Tus mascotas", "Your pets")} <small class="muted">${own.length}/${total}</small></h3>${cur ? "" : `<small class="muted">${L("Elige una para que te acompañe.", "Pick one to bring.")}</small>`}</div>
      <div class="pgrid">${list}</div>
      <details class="phelp"><summary>${L("¿Cómo funcionan?", "How do they work?")}</summary><ul>
        <li>${L("<b>Crecen:</b> ganan XP cuando vences con ellas, al explorar, al jugar, al entrenar y al comer. Pasan de Cría → Joven (nv 5) → Adulta (nv 12) → Ancestral (nv 20). Nivel máximo 30 (y como mucho 3 por encima del tuyo).", "<b>Growth:</b> they gain XP from fights, exploring, play, training and food.")}</li>
        <li>${L("<b>Amistad (♥):</b> acarícialas y juega con ellas cada día, dales de comer (3 veces al día) y gana combates juntos. Más corazones = actúan más a menudo, pegan más fuerte y encuentran más cosas. Con ♥♥♥♥♥ se desbloquea el <b>Vínculo total</b>: te salvan cuando estás en peligro.", "<b>Friendship:</b> more hearts = more help. 5 hearts unlocks Full Bond.")}</li>
        <li>${L("<b>En combate</b> actúan después de ti según su tipo: ⚔️ atacan, ✨ lanzan magia y estados, 🛡️ te dan escudo, 💚 te curan, 🎯 cazan (más botín) y 🍀 encuentran Soles. No entran en los duelos entre jugadores.", "<b>In combat</b> they act after you based on their type.")}</li>
        <li>${L(`<b>Al explorar</b> a veces olfatean algo extra. Hay ${total - wildN} mascotas en establos y ${wildN} crías salvajes que solo se consiguen en combate.`, "They also find items while exploring.")}</li></ul></details></div>`;
  }
  const _bv = bagView;
  bagView = function () {
    let out = _bv(); if (!G?.g) return out;
    const n = G.g.mascota; if (n && PETS[n]) out = out.replace(/(data-uislot="mascota"[^>]*>)([\s\S]*?)(<\/button>)/, (m, a, b, c) => `${a}${b}<b class="plvm">${st(n).lvl}</b>${c}`);
    return out + petPanel();
  };
  const _cv = combatView;
  combatView = function () {
    let out = _cv(); const c = G?.g?.combat; const n = G?.g?.mascota; const p = PETS[n];
    if (!c || !p || noPets(c)) return out;
    const sg = stage(st(n).lvl)[1];
    const bud = `<span class="petbud st-${sg} ${c.petHop === c.round ? "hop" : ""}" title="${esc(n)} · ${L("nivel", "level")} ${st(n).lvl}"><span>${pic(n)}</span><b>${st(n).lvl}</b></span>`;
    return out.replace(/(<div class="sprite me portrait">)/, `$1${bud}`);
  };

  document.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-pact]"); if (!b) return; ev.stopPropagation();
    const [a, n] = b.dataset.pact.split("|");
    if (a === "use") { G.g.mascota = n; sfx("heal"); persist(); return render(); }
    care(a, n);
  }, true);

  window.SA_PETS = { st, power, hearts, stage: (n) => stage(st(n).lvl)[2](), addPetXP, addAm, ROLE, list: () => Object.keys(PETS) };

  const css = document.createElement("style");
  css.textContent = `
.petpanel h3 small{font-weight:400}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(290px,100%),1fr));gap:10px;margin-top:8px}
.pcard{display:flex;gap:10px;padding:10px;border-radius:12px;border:1px solid color-mix(in srgb,var(--rc,#8a96a8) 55%,transparent);background:linear-gradient(160deg,#1b2638,#111a26);box-shadow:inset 0 0 18px color-mix(in srgb,var(--rc,#8a96a8) 18%,transparent);animation:pcIn .35s ease both}
.pcard.on{border-color:#ffd84a;box-shadow:0 0 0 2px #ffd84a55,inset 0 0 18px #ffd84a22}
.pbig{position:relative;flex:none;width:74px;height:74px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,color-mix(in srgb,var(--rc,#8a96a8) 35%,#0b131c),#0b131c 70%);border:2px solid color-mix(in srgb,var(--rc,#8a96a8) 70%,transparent)}
.pbig>span .sai,.petbud>span .sai{width:1.7em;height:1.7em;border-radius:50%;object-fit:cover;vertical-align:middle;filter:none}
.pbig>span{font-size:30px;line-height:1;animation:pBob 2.6s ease-in-out infinite;display:inline-block}
.st-joven .pbig>span{font-size:38px}.st-adulta .pbig>span{font-size:44px}.st-ancestral .pbig>span{font-size:48px;filter:drop-shadow(0 0 8px var(--rc,#ffd84a))}
.st-ancestral .pbig{box-shadow:0 0 16px color-mix(in srgb,var(--rc,#ffd84a) 60%,transparent)}
.plv,.plvm{position:absolute;right:-4px;bottom:-4px;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:linear-gradient(#ffe38a,#d9a441);color:#2a1a05;font-size:12px;display:grid;place-items:center;border:1px solid #6b4a12}
.plvm{right:-6px;bottom:-6px;min-width:18px;height:18px;font-size:10px}
.pbody{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.pxp{height:6px;border-radius:4px;background:#0b131c;overflow:hidden;box-shadow:inset 0 1px 2px #000}.pxp i{display:block;height:100%;background:linear-gradient(90deg,#7be0a0,#d9f27a);transition:width .6s}
.phrt{color:#ff6b8a;letter-spacing:1px;text-shadow:0 0 6px #ff6b8a66}.phrt i{font-style:normal;color:#ff6b8a33;text-shadow:none}
.pacts{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.phelp{margin-top:8px}.phelp ul{margin:6px 0 0 18px;padding:0;display:grid;gap:4px;font-size:.92em}
.pheart{position:fixed;z-index:80;font-style:normal;color:#ff6b8a;font-size:18px;pointer-events:none;animation:pHeart 1.3s ease-out both;text-shadow:0 0 8px #ff6b8a}
.sprite.me{position:relative}
.petbud{position:absolute;right:-18px;bottom:-4px;z-index:3;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(#2a3a52,#101824);border:2px solid #d9a441;box-shadow:0 2px 8px #000a}
.petbud>span{font-size:22px;animation:pBob 2.2s ease-in-out infinite;display:inline-block}.petbud.st-adulta>span,.petbud.st-ancestral>span{font-size:26px}
.petbud>b{position:absolute;right:-6px;top:-6px;font-size:10px;min-width:16px;height:16px;border-radius:8px;background:#d9a441;color:#2a1a05;display:grid;place-items:center}
.petbud.hop{animation:pHop .6s ease 2}
@keyframes pBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes pHop{0%,100%{transform:translateY(0) scale(1)}40%{transform:translateY(-14px) scale(1.12)}}
@keyframes pHeart{0%{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0),-70px) scale(1.2)}}
@keyframes pcIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (max-width:520px){.pgrid{grid-template-columns:1fr}.pbig{width:62px;height:62px}}
@media (prefers-reduced-motion:reduce){.pbig>span,.petbud>span,.petbud.hop,.pcard{animation:none!important}}
`;
  document.head.appendChild(css);
})();
