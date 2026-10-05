// =====================================================================
// vida.js — Mundo vivo
//   · Día y noche (20:00–6:00): monstruos +30% más fuertes, XP ×1.5, botín extra,
//     tiendas cerradas (la posada sigue abierta), botón «Esperar al amanecer»
//   · Monstruos raros (✦): de Medianoche, de la Tormenta, Espectral, Dorado → Núcleo + mascota única
//   · Eventos por temporada (fecha real): Halloween, Invierno, Festival del Alba
//     monstruos de evento, moneda, tenderete en los pueblos, decoración
//   · Pesca y minería con minijuego de puntería
// Se carga después de evo.js.
// =====================================================================
(function () {
  if (typeof makeMonster !== "function") return;
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const escx = (s) => (typeof esc === "function" ? esc(s) : String(s ?? ""));
  const CORE = "Núcleo de evolución";
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const hereK = () => `${G.g.loc.r}:${G.g.loc.p}`;
  const placeHere = () => PLACE_OF(G.g.loc.r, G.g.loc.p);
  const save = () => { if (typeof persist === "function") persist(); };

  // ---------------------------------------------------------------
  // Día y noche
  // ---------------------------------------------------------------
  const isNight = () => !!G?.g && (G.g.hour >= 20 || G.g.hour < 6);
  const NIGHT_HP = 1.3, NIGHT_POW = 1.2, NIGHT_XP = 1.5;

  // ---------------------------------------------------------------
  // Temporadas (fecha real)
  // ---------------------------------------------------------------
  const SEASONS = {
    halloween: {
      n: "Noche de Brujas", ic: "🎃", cur: "Caramelo embrujado", curIc: "🍬", until: "3 de noviembre",
      on: (m, d) => m === 10 || (m === 11 && d <= 3),
      mons: [["Calabaza maldita", "🎃", "Fuego"], ["Espantapájaros vivo", "🧟", "Tierra"], ["Fantasma travieso", "👻", "Sombra"], ["Murciélago vampiro", "🦇", "Sombra"], ["Bruja del caldero", "🧙", "Sombra"]],
      pet: "Gato de calabaza", weapon: "Hoz de calabaza",
      deco: ["🦇", "🎃", "🕸️", "🦇", "👻"],
    },
    invierno: {
      n: "Invierno Estelar", ic: "❄️", cur: "Copo de nieve", curIc: "❄️", until: "6 de enero",
      on: (m, d) => (m === 12 && d >= 12) || (m === 1 && d <= 6),
      mons: [["Muñeco de nieve furioso", "⛄", "Agua"], ["Duende travieso", "🧝", "Luz"], ["Oso polar hambriento", "🐻‍❄️", "Agua"], ["Espíritu del frío", "🌬️", "Aire"]],
      pet: "Renito de escarcha", weapon: "Bastón de caramelo",
      deco: ["❄️", "✨", "❄️", "⭐", "❄️"],
    },
    alba: {
      n: "Festival del Alba", ic: "🌅", cur: "Pétalo del Alba", curIc: "🌸", until: "28 de marzo",
      on: (m, d) => m === 3 && d >= 18 && d <= 28,
      mons: [["Espíritu del amanecer", "✨", "Luz"], ["Colibrí de fuego", "🐦", "Fuego"], ["Florecilla traviesa", "🌺", "Tierra"]],
      pet: "Pollito solar", weapon: "Lanza del amanecer",
      deco: ["🌸", "🌼", "🌸", "☀️", "🌸"],
    },
  };
  function season() {
    let k = null; try { k = localStorage.getItem("sa-season"); } catch (e) {}
    if (k && SEASONS[k]) return { k, ...SEASONS[k] };
    if (k === "none") return null;
    const t = new Date(); const m = t.getMonth() + 1, d = t.getDate();
    for (const [key, s] of Object.entries(SEASONS)) if (s.on(m, d)) return { k: key, ...s };
    return null;
  }

  // armas de evento (siempre registradas para que se puedan intercambiar todo el año)
  const EV_WEAPONS = { "Hoz de calabaza": [34, "Sombra", ["critica"]], "Bastón de caramelo": [32, "Agua", ["aturde"]], "Lanza del amanecer": [33, "Luz", ["alcance"]] };
  for (const [n, [p, a, t]] of Object.entries(EV_WEAPONS)) { if (WEAPONS[n] == null) WEAPONS[n] = p; WEAPON_AFF[n] = a; WEAPON_TRAITS[n] = t; }
  // íconos de monstruos de evento
  try { for (const s of Object.values(SEASONS)) for (const [n, ic] of s.mons) MON_ICON.unshift([new RegExp(n, "i"), ic]); } catch (e) {}

  // ---------------------------------------------------------------
  // Mascotas únicas
  // ---------------------------------------------------------------
  const UNIQ = {
    "Lobito de medianoche": { d: "+5 de daño · aparece con monstruos de medianoche", i: "🐺", role: "atk", aff: "Sombra", r: "l", k: "dmg", v: 5, uniq: true },
    "Chispita de tormenta": { d: "+4 de daño mágico · nace en las tormentas", i: "⚡", role: "magia", aff: "Rayo", r: "e", k: "dmg", v: 4, uniq: true },
    "Fantasmita": { d: "+10% XP · vive en la niebla", i: "👻", role: "heal", aff: "Sombra", r: "e", k: "xp", v: 0.1, uniq: true },
    "Escarabajo dorado": { d: "+3 de defensa · brilla con el sol", i: "🪲", role: "guard", aff: "Luz", r: "e", k: "def", v: 3, uniq: true },
    "Gato de calabaza": { d: "+3 de iniciativa · mascota de Halloween", i: "🐈‍⬛", role: "magia", aff: "Fuego", r: "l", k: "init", v: 3, uniq: true },
    "Renito de escarcha": { d: "+3 de defensa · mascota de invierno", i: "🦌", role: "guard", aff: "Agua", r: "l", k: "def", v: 3, uniq: true },
    "Pollito solar": { d: "+12% XP · mascota del Festival del Alba", i: "🐥", role: "heal", aff: "Luz", r: "l", k: "xp", v: 0.12, uniq: true },
  };
  function regPets() { try { const PETS = window.SA_EXTRA?.PETS; if (PETS) for (const [n, x] of Object.entries(UNIQ)) if (!PETS[n]) PETS[n] = x; } catch (e) {} }
  regPets();
  function givePet(n) {
    regPets(); G.g.mascotas = G.g.mascotas || [];
    if (G.g.mascotas.includes(n)) return false;
    G.g.mascotas.push(n); return true;
  }

  // ---------------------------------------------------------------
  // Monstruos: noche, raros y de evento
  // ---------------------------------------------------------------
  const RARE = {
    noche: { suf: "de Medianoche", aff: "Sombra", pet: "Lobito de medianoche" },
    Tormenta: { suf: "de la Tormenta", aff: "Rayo", pet: "Chispita de tormenta" },
    Niebla: { suf: "Espectral", aff: "Sombra", pet: "Fantasmita" },
    dia: { suf: "Dorado", aff: "Luz", pet: "Escarabajo dorado" },
  };
  const _mm = makeMonster;
  makeMonster = function (pl, r, boss) {
    const e = _mm.apply(this, arguments);
    try {
      if (!G?.g || boss || !e) return e;
      const night = isNight(); const w = typeof weatherFor === "function" ? weatherFor(G.g.loc.r, G.g.day) : "";
      // evento de temporada
      const s = season();
      if (s && Math.random() < 0.2) {
        const [n, , aff] = rnd(s.mons); e.n = n; e.aff = aff; e.ev = s.k;
      }
      // raro
      let ch = 0.03; if (night) ch *= 2; if (w === "Tormenta" || w === "Niebla") ch *= 2;
      if (!e.ev && Math.random() < ch) {
        const k = w === "Tormenta" ? "Tormenta" : w === "Niebla" ? "Niebla" : night ? "noche" : "dia"; const rr = RARE[k];
        e.n = `✦ ${e.n} ${rr.suf}`; e.aff = rr.aff; e.rare = k; e.lvl += 2;
        e.pv = e.pvMax = Math.round(e.pv * 2); e.poder = Math.round(e.poder * 1.3); e.def = (e.def || 0) + 1;
      }
      // noche
      if (night) { e.night = true; e.pv = e.pvMax = Math.round(e.pv * NIGHT_HP); e.poder = Math.round(e.poder * NIGHT_POW); }
    } catch (x) { console.warn("vida mm:", x); }
    return e;
  };

  let xpBoost = 1;
  if (typeof gainXP === "function") { const _gx = gainXP; gainXP = function (n) { return _gx.call(this, n && xpBoost !== 1 ? Math.round(n * xpBoost) : n); }; }

  const _v = victory;
  victory = function () {
    const c = G?.g?.combat; const es = c ? c.enemies.slice() : [];
    const night = es.some((e) => e.night); const rares = es.filter((e) => e.rare); const evs = es.filter((e) => e.ev);
    if (night) xpBoost = NIGHT_XP;
    let r; try { r = _v.apply(this, arguments); } finally { xpBoost = 1; }
    try {
      if (!c || ["arena", "duel", "pvp"].includes(c.kind)) return r;
      const lines = [];
      if (night) {
        lines.push(`🌙 ${Lx("Victoria nocturna: XP ×1.5", "Night victory: XP ×1.5")}`);
        if (Math.random() < 0.6) { addItem("Polvo de luna", 1); lines.push(`🌙 +1 Polvo de luna`); }
        const so = 5 + Math.round(Math.max(...es.map((e) => e.lvl || 1)) * 1.5); G.dinero.soles += so; lines.push(`☀ +${so} Soles ${Lx("(noche)", "(night)")}`);
      }
      for (const e of rares) {
        addItem(CORE, 1); lines.push(`✦ ${Lx("¡Monstruo raro vencido!", "Rare monster defeated!")} 🔮 +1 ${CORE}`);
        const pet = RARE[e.rare]?.pet; if (pet && Math.random() < 0.3 && givePet(pet)) lines.push(`🐾 ${Lx(`¡${pet} quiere venir contigo! (mascota única)`, `${pet} joins you! (unique pet)`)}`);
      }
      if (evs.length) {
        const s = SEASONS[evs[0].ev]; const n = evs.length * (2 + Math.floor(Math.random() * 3)) * (night ? 2 : 1);
        addItem(s.cur, n); lines.push(`${s.curIc} +${n} ${s.cur}`);
      }
      if (lines.length) { const b = G.g.lastBattle || G.g.lastResult; if (b) b.lines = [...(b.lines || []), ...lines]; save(); render(); }
    } catch (x) { console.warn("vida vic:", x); }
    return r;
  };

  // ---------------------------------------------------------------
  // Tenderete de temporada
  // ---------------------------------------------------------------
  const EV_SHOP = (s) => [
    { id: "treat", n: "Golosina para mascotas", ic: "🍖", p: 8 },
    { id: "pot", n: "Poción mayor de vida", ic: "❤️‍🔥", p: 10 },
    { id: "core", n: CORE, ic: "🔮", p: 60 },
    { id: "weapon", n: s.weapon, ic: "🗡️", p: 120, d: () => `${Lx("Poder", "Power")} ${WEAPONS[s.weapon]} · ${WEAPON_AFF[s.weapon]}` },
    { id: "pet", n: s.pet, ic: UNIQ[s.pet]?.i || "🐾", p: 150, d: () => Lx("Mascota única de temporada", "Unique seasonal pet") },
  ];
  const isHub = () => G.g.loc.p === 0;
  function eventCard() {
    const s = season(); if (!s) return "";
    const have = G.g.inv[s.cur] || 0;
    const SI = window.SAI; const curI = (SI && SI.obj(s.cur, s.curIc)) || s.curIc;
    const hdI = SI ? SI.img(({ halloween: "pet/gato-de-calabaza", invierno: "obj/copo-de-nieve", alba: "obj/petalo-del-alba" })[s.k] || "obj/" + "x", s.ic) : s.ic;
    const itI = (it) => (SI && (it.id === "pet" ? SI.pet(it.n) : SI.obj(it.n, it.ic))) || it.ic;
    const shop = isHub() ? `<div class="sa-evshop">${EV_SHOP(s).map((it) => {
      const owned = (it.id === "pet" && (G.g.mascotas || []).includes(it.n)) || (it.id === "weapon" && (G.g.arma?.n === it.n || (G.g.armas || []).includes(it.n)));
      return `<div class="sa-evit"><em>${itI(it)}</em><div><b>${escx(it.n)}</b>${it.d ? `<small>${it.d()}</small>` : ""}</div><button type="button" class="btn small ${owned ? "" : "primary"}" data-saev="${it.id}" ${owned || have < it.p ? "disabled" : ""}>${owned ? Lx("Ya lo tienes", "Owned") : `${curI} ${it.p}`}</button></div>`;
    }).join("")}</div>` : `<p class="note">${Lx("El tenderete del evento está en los pueblos y ciudades principales.", "The event stall is in the main towns.")}</p>`;
    return `<div class="sa-evcard ev-${s.k}"><div class="sa-evh"><span class="sa-evic">${hdI}</span><div><b>${escx(s.n)}</b><small>${Lx(`Hasta el ${s.until} · monstruos de evento en todas partes · sueltan`, `Until ${s.until} · event monsters drop`)} ${curI} ${escx(s.cur)}</small></div><span class="pill">${curI} ${have}</span></div>${shop}</div>`;
  }
  function buyEv(id) {
    const s = season(); if (!s || !isHub()) return; const it = EV_SHOP(s).find((x) => x.id === id); if (!it) return;
    if ((G.g.inv[s.cur] || 0) < it.p) return toast(Lx(`Te faltan ${s.curIc}.`, `Not enough ${s.curIc}.`));
    if (it.id === "pet") { if (!givePet(it.n)) return toast(Lx("Ya la tienes.", "Already owned.")); }
    else if (it.id === "weapon") { G.g.armas = G.g.armas || []; if (G.g.arma?.n === it.n || G.g.armas.includes(it.n)) return; G.g.armas.push(it.n); }
    else addItem(it.n, 1);
    addItem(s.cur, -it.p); toast(`${it.ic} ${it.n}`); try { sfx("buy"); } catch (e) {}
    save(); render();
  }

  // ---------------------------------------------------------------
  // Pesca y minería
  // ---------------------------------------------------------------
  const FISH_RE = /Lago|Cascada|Puerto|Faro|Arrecife|Mareas|Muelle|Ancla|Acantilado/;
  const MINE_RE = /Mina|Cueva|Cumbre|Cráter|Ruinas|Laberinto/;
  const FISH = {
    base: [["Pescado fresco", 1]],
    good: { _: ["Perlas de río"], costa: ["Perla de mar", "Perla eléctrica"], viol: ["Perla de mar"] },
    great: ["Pez dorado", "Botella con mensaje"],
  };
  const MINE = {
    base: { _: ["Mineral de plata"], quem: ["Carbón ardiente", "Obsidiana"], esc: ["Cristal de hielo", "Mineral de plata"], alba: ["Cristal de luz", "Mineral de plata"] },
    good: { _: ["Mineral de plata"], quem: ["Rubí en bruto"], esc: ["Cristal de hielo"], alba: ["Cristal de luz"] },
    great: ["Cristal eterno", CORE],
  };
  const pickR = (tab, r) => rnd(tab[r] || tab._);
  function gatherKinds() { const n = placeHere().n; const k = []; if (FISH_RE.test(n)) k.push("fish"); if (MINE_RE.test(n)) k.push("mine"); return k; }
  function gatherCard() {
    const ks = gatherKinds(); if (!ks.length) return "";
    return `<div class="card mini forge sa-gather"><b>${ks.includes("fish") ? "🎣 " + Lx("Pesca", "Fishing") : ""}${ks.length > 1 ? " · " : ""}${ks.includes("mine") ? "⛏️ " + Lx("Minería", "Mining") : ""}</b>
      <p class="note">${Lx("Un minijuego corto: toca cuando la marca esté en la zona verde. Sacas materiales para la forja sin pelear.", "Tap when the marker is in the green zone. Get forge materials without fighting.")}${isNight() ? " " + Lx("🌙 De noche salen cosas más raras.", "🌙 Rarer finds at night.") : ""}</p>
      <div class="row">${ks.map((k) => `<button type="button" class="btn small primary" data-sagather="${k}" ${G.energia < 1 ? "disabled" : ""}>${window.SAI?.img ? window.SAI.img(k === "fish" ? "act/pescar" : "act/minar", k === "fish" ? "🎣" : "⛏️") : k === "fish" ? "🎣" : "⛏️"} ${k === "fish" ? Lx("Pescar", "Fish") : Lx("Minar", "Mine")} · 1 ⚡ · 1 h</button>`).join("")}</div></div>`;
  }

  let game = null;
  function startGather(kind) {
    if (G.g.combat || game) return;
    if (G.energia < 1) return toast(Lx("No tienes Energía: descansa en una posada.", "No Energy."));
    G.energia -= 1; advance(1); save();
    const tries = kind === "fish" ? 1 : 3;
    game = { kind, tries, left: tries, score: 0, marks: [] };
    const el = document.createElement("div"); el.id = "sa-mg"; el.className = "k-" + kind;
    el.innerHTML = `<div class="sa-mgin"><span class="sa-mgic">${window.SAI?.img ? window.SAI.img(kind === "fish" ? "act/pescar" : "act/minar", kind === "fish" ? "🎣" : "⛏️") : ""}</span><b class="sa-mgt">${kind === "fish" ? Lx("Pescando…", "Fishing…") : Lx("Minando…", "Mining…")}</b>
      <small class="sa-mgs">${kind === "fish" ? Lx("Espera a que pique…", "Wait for a bite…") : Lx("Golpea 3 veces en la zona verde", "Strike 3 times in the green")}</small>
      <div class="sa-bar"><i class="z"></i><i class="p"></i><i class="m"></i></div>
      <div class="sa-hits"></div>
      <button type="button" class="btn primary sa-go" disabled>${kind === "fish" ? "🎣 " + Lx("¡Tirar!", "Pull!") : "⛏️ " + Lx("¡Golpe!", "Strike!")}</button></div>`;
    document.body.appendChild(el);
    game.el = el; newZone();
    const go = el.querySelector(".sa-go");
    const begin = () => { go.disabled = false; el.querySelector(".sa-mgs").textContent = kind === "fish" ? Lx("¡Picó! Tira cuando la marca esté en lo verde", "Bite! Pull in the green") : Lx("Golpea en la zona verde", "Strike in the green"); game.t0 = performance.now(); loop(); };
    if (kind === "fish") setTimeout(begin, 700 + Math.random() * 1500); else setTimeout(begin, 300);
    go.addEventListener("click", hit);
  }
  function newZone() {
    const w = game.kind === "fish" ? 20 : 24; const x = 8 + Math.random() * (84 - w);
    game.zone = [x, x + w]; game.perf = [x + w / 2 - 3.5, x + w / 2 + 3.5];
    game.speed = 0.9 + Math.random() * 0.6 + (game.kind === "mine" ? (game.tries - game.left) * 0.25 : 0);
    const z = game.el.querySelector(".z"), p = game.el.querySelector(".p");
    z.style.left = x + "%"; z.style.width = w + "%"; p.style.left = game.perf[0] + "%"; p.style.width = "7%";
  }
  function pos() { const t = (performance.now() - game.t0) / 1000 * game.speed; const ph = t % 2; return (ph < 1 ? ph : 2 - ph) * 100; }
  function loop() { if (!game || game.done) return; game.el.querySelector(".m").style.left = `calc(${pos()}% - 3px)`; game.raf = requestAnimationFrame(loop); }
  function hit() {
    if (!game || game.done || !game.t0) return;
    const x = pos(); const q = x >= game.perf[0] && x <= game.perf[1] ? 2 : x >= game.zone[0] && x <= game.zone[1] ? 1 : 0;
    game.score += q; game.left--; game.marks.push(q);
    game.el.querySelector(".sa-hits").innerHTML = game.marks.map((m) => `<span class="h${m}">${m === 2 ? Lx("¡Perfecto!", "Perfect!") : m ? Lx("Bien", "Good") : Lx("Fallo", "Miss")}</span>`).join("");
    game.el.classList.remove("flash0", "flash1", "flash2"); void game.el.offsetWidth; game.el.classList.add("flash" + q);
    try { sfx(q ? "impact" : "miss"); } catch (e) {}
    if (game.left > 0) { newZone(); game.t0 = performance.now(); return; }
    game.done = true; cancelAnimationFrame(game.raf);
    setTimeout(finish, 450);
  }
  function finish() {
    const g = game; const r = G.g.loc.r; const night = isNight(); const got = [];
    const max = g.tries * 2; const ratio = g.score / max;
    if (g.kind === "fish") {
      if (ratio === 0) got.push(rnd(["Bota vieja", "Alga"]));
      else {
        got.push("Pescado fresco"); if (ratio >= 0.5 && Math.random() < 0.6) got.push(pickR(FISH.good, r));
        if (ratio === 1 && Math.random() < (night ? 0.35 : 0.2)) got.push(rnd(FISH.great));
      }
    } else {
      const n = g.score; // 0..6
      for (let i = 0; i < Math.ceil(n / 2); i++) got.push(pickR(MINE.base, r));
      if (n >= 4) got.push(pickR(MINE.good, r));
      if (n === 6 && Math.random() < (night ? 0.3 : 0.18)) got.push(Math.random() < 0.4 ? CORE : MINE.great[0]);
      if (!got.length) got.push("Piedra común");
    }
    const lines = [];
    for (const it of got) {
      if (it === "Botella con mensaje") { const so = 20 + Math.floor(Math.random() * 60); G.dinero.soles += so; lines.push(`📜 ${Lx("Botella con mensaje", "Message in a bottle")}: ☀ +${so} Soles`); continue; }
      addItem(it, 1); lines.push(`+1 ${it}`);
    }
    try { gainXP(4 + g.score * 3); } catch (e) {}
    try { log(`${g.kind === "fish" ? "Pescaste" : "Minaste"} en ${placeHere().n}: ${got.join(", ")}.`); } catch (e) {}
    const box = g.el.querySelector(".sa-mgin");
    box.innerHTML = `<b class="sa-mgt">${g.kind === "fish" ? "🎣" : "⛏️"} ${ratio === 1 ? Lx("¡Perfecto!", "Perfect!") : ratio >= 0.5 ? Lx("¡Bien hecho!", "Well done!") : ratio > 0 ? Lx("Algo es algo", "Something") : Lx("Nada bueno…", "Nothing good…")}</b>
      <ul class="sa-got">${lines.map((l) => `<li>${escx(l)}</li>`).join("")}</ul>
      <div class="row"><button type="button" class="btn primary" data-sagather="${g.kind}" ${G.energia < 1 ? "disabled" : ""}>${Lx("Otra vez", "Again")} · 1 ⚡</button><button type="button" class="btn" data-samgclose="1">${Lx("Cerrar", "Close")}</button></div>`;
    save();
  }
  function closeGame() { if (game) { cancelAnimationFrame(game.raf); game.el?.remove(); game = null; render(); } }

  // ---------------------------------------------------------------
  // Lugar: tarjetas
  // ---------------------------------------------------------------
  const SHOP_SEL = '[data-g="shop"], .wearshop button, .armb button, .stableb [data-xbuy]';
  const _pv = placeView;
  placeView = function () {
    let out = _pv.apply(this, arguments);
    try {
      if (!G?.g || G.g.combat) return out;
      const night = isNight();
      const nightCard = night ? `<div class="sa-nightc"><span>${window.SAI?.img ? window.SAI.img("act/noche", "🌙") : "🌙"}</span><div><b>${Lx("Es de noche", "It's night")}</b><small>${Lx("Monstruos +30% más fuertes, pero dan XP ×1.5, más Soles y Polvo de luna. Las tiendas abren a las 6:00; la posada sigue abierta.", "Monsters are stronger but give XP ×1.5. Shops open at 6:00.")}</small></div><button type="button" class="btn small" data-savida="wait">⏳ ${Lx("Esperar al amanecer", "Wait for dawn")}</button></div>` : "";
      out = eventCard() + nightCard + out + gatherCard();
    } catch (e) { console.warn("vida pv:", e); }
    return out;
  };

  // ---------------------------------------------------------------
  // Dibujado
  // ---------------------------------------------------------------
  let decoFor = null;
  function deco() {
    const s = G?.g ? season() : null; const k = s?.k || null;
    document.body.classList.toggle("sa-night", !!G?.g && isNight() && !!document.querySelector(".hud"));
    for (const x of Object.keys(SEASONS)) document.body.classList.toggle("sa-ev-" + x, k === x && !!G?.g);
    if (decoFor === k) return; decoFor = k;
    document.getElementById("sa-deco")?.remove(); if (!s) return;
    const d = document.createElement("div"); d.id = "sa-deco"; d.setAttribute("aria-hidden", "true");
    const DI = { "🦇": "mon/murcielago-vampiro", "🎃": "mon/calabaza-maldita", "👻": "mon/fantasma-travieso", "❄️": "obj/copo-de-nieve", "🌸": "obj/petalo-del-alba", "☀️": "stat/soles" };
    d.innerHTML = s.deco.map((ic, i) => `<span style="left:${8 + i * 19}%;animation-delay:${-i * 3.1}s;animation-duration:${16 + i * 3}s">${window.SAI && DI[ic] ? window.SAI.img(DI[ic], ic) : ic}</span>`).join("");
    document.body.appendChild(d);
  }
  function post() {
    deco(); if (!G?.g) return;
    // marca de noche en el HUD
    const where = document.querySelector(".hud .where");
    if (where && isNight() && !where.querySelector(".sa-dn")) where.insertAdjacentHTML("afterbegin", `<span class="sa-dn">🌙 ${Lx("Noche", "Night")}</span> `);
    // tiendas cerradas
    if (!G.g.combat && isNight()) document.querySelectorAll(".wearshop, .armb, .stableb").forEach((c) => c.classList.add("sa-shut"));
    if (!G.g.combat && isNight()) document.querySelectorAll('[data-g="shop"]').forEach((b) => b.classList.add("sa-shutb"));
    // raros y evento en combate
    if (G.g.combat) document.querySelectorAll(".foe2").forEach((f, i) => { const e = G.g.combat.enemies[i]; if (!e) return; f.classList.toggle("sa-rare", !!e.rare); f.classList.toggle("sa-evm", !!e.ev); f.classList.toggle("sa-nightm", !!e.night); });
  }
  const _r = render;
  render = function () { regPets(); const o = _r.apply(this, arguments); try { post(); } catch (e) { console.warn("vida post:", e); } return o; };

  // ---------------------------------------------------------------
  // Clics
  // ---------------------------------------------------------------
  document.addEventListener("click", (ev) => {
    if (!G?.g) return;
    if (isNight() && !G.g.combat && ev.target.closest?.(SHOP_SEL) && !ev.target.closest(".sa-evcard")) {
      ev.stopPropagation(); ev.preventDefault();
      toast(Lx("🌙 Está cerrado de noche. Abre a las 6:00 (puedes esperar o descansar en la posada).", "🌙 Closed at night. Opens at 6:00."));
    }
  }, true);
  document.addEventListener("click", (ev) => {
    if (!G?.g) return;
    const w = ev.target.closest?.('[data-savida="wait"]');
    if (w) { const h = G.g.hour; const need = h >= 20 ? 24 - h + 6 : 6 - h; advance(need); try { log(`Esperaste hasta el amanecer.`); } catch (e) {} toast(`🌅 ${Lx("Amanece. Las tiendas abren.", "Dawn. Shops open.")}`); save(); render(); return; }
    const e2 = ev.target.closest?.("[data-saev]"); if (e2 && !e2.disabled) { buyEv(e2.dataset.saev); return; }
    const g = ev.target.closest?.("[data-sagather]"); if (g && !g.disabled) { if (game) { cancelAnimationFrame(game.raf); game.el?.remove(); game = null; } startGather(g.dataset.sagather); return; }
    if (ev.target.closest?.("[data-samgclose]")) { closeGame(); return; }
  });
  document.addEventListener("keydown", (ev) => { if (game && !game.done && (ev.key === " " || ev.key === "Enter")) { ev.preventDefault(); hit(); } if (game && ev.key === "Escape" && game.done) closeGame(); });

  window.SA_VIDA = { isNight, season, SEASONS, UNIQ, givePet };

  // ---------------------------------------------------------------
  // Estilos
  // ---------------------------------------------------------------
  const css = document.createElement("style"); css.id = "sa-vida";
  css.textContent = `
/* noche */
body.sa-night::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(120% 80% at 50% 0%,#0a1440 0%,transparent 60%),linear-gradient(180deg,#05081a55,#05081a22);mix-blend-mode:multiply}
body.sa-night .scene{filter:brightness(.6) saturate(.8) hue-rotate(-15deg)}
.sa-dn{display:inline-block;padding:1px 8px;margin-right:4px;border-radius:10px;background:#1b2a5a;border:1px solid #6a8cff66;color:#cdd8ff;font-size:12px}
.sa-nightc{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 12px;padding:10px 14px;border:1px solid #6a8cff44;border-radius:3px;background:linear-gradient(90deg,#1b2a5a66,#0b131c)}
.sa-nightc>span{font-size:26px}.sa-nightc>div{flex:1 1 200px;display:flex;flex-direction:column}.sa-nightc small{color:#b9c3e8}
.sa-shut{position:relative;opacity:.55;filter:grayscale(.5)}
.sa-shut::after{content:"🌙 Cerrado hasta las 6:00";position:absolute;right:10px;top:10px;padding:2px 8px;border-radius:10px;background:#1b2a5a;color:#cdd8ff;font-size:11px;border:1px solid #6a8cff66}
.sa-shutb{opacity:.5;filter:grayscale(.6)}
/* combate: raros, evento, noche */
.foe2.sa-rare .plate{border-color:#ffd98a!important;box-shadow:0 0 0 1px #ffd98a,0 0 18px #ffd98a88!important}
.foe2.sa-rare .sprite{filter:drop-shadow(0 0 10px #ffd98a)}
.foe2.sa-evm .plate{border-color:#ff8a3a!important;box-shadow:0 0 14px #ff8a3a77!important}
.foe2.sa-nightm .plate::after{content:"🌙";position:absolute;top:-8px;left:-8px;font-size:14px}
.foe2 .plate{position:relative}
/* temporada */
.sa-evcard{margin:0 0 12px;padding:12px 14px;border-radius:3px;border:1px solid #ff8a3a66;background:linear-gradient(135deg,#3a1a0a,#1a0d1f 70%)}
.sa-evcard.ev-invierno{border-color:#9fd0ff66;background:linear-gradient(135deg,#0d2340,#141a2e 70%)}
.sa-evcard.ev-alba{border-color:#ffb3c866;background:linear-gradient(135deg,#40202e,#2a1a14 70%)}
.sa-evh{display:flex;align-items:center;gap:12px}
.sa-evic{font-size:32px;filter:drop-shadow(0 0 10px #ff8a3a88);animation:saBob 3s ease-in-out infinite}
@keyframes saBob{50%{transform:translateY(-4px) rotate(-6deg)}}
.sa-evh>div{flex:1;display:flex;flex-direction:column}.sa-evh b{font-family:var(--display);font-size:17px;color:#ffcf9a}.sa-evh small{color:#e8c9b0}
.sa-evshop{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(210px,100%),1fr));gap:6px;margin-top:10px}
.sa-evit{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:3px;background:#00000044;border:1px solid #ffffff12}
.sa-evit em{font-style:normal;font-size:22px}.sa-evit em .sai{width:40px;height:40px;vertical-align:middle}.sa-evic .sai{width:56px;height:56px;vertical-align:middle}.sa-evcard .btn .sai,.sa-evh .pill .sai,.sa-evh small .sai{width:18px;height:18px;vertical-align:-4px}.sa-evit>div{flex:1;min-width:0;display:flex;flex-direction:column}.sa-evit b{font-size:13.5px}.sa-evit small{color:var(--ink-2);font-size:11.5px}
#sa-deco{position:fixed;inset:0;pointer-events:none;z-index:2;overflow:hidden}
#sa-deco span{position:absolute;top:-40px;font-size:22px;opacity:.35;animation:saFall linear infinite}#sa-deco .sai{width:34px;height:34px}
body.sa-ev-halloween #sa-deco span{animation-name:saFly;top:auto;bottom:-40px}
@keyframes saFall{to{transform:translateY(110vh) rotate(360deg)}}
@keyframes saFly{0%{transform:translate(0,0)}50%{transform:translate(40px,-55vh) rotate(-10deg)}100%{transform:translate(-20px,-115vh)}}
body.sa-ev-halloween .hud{box-shadow:0 14px 34px #000a,0 0 0 1px #ff8a3a44,0 0 30px #ff8a3a22!important}
body.sa-ev-invierno .hud{box-shadow:0 14px 34px #000a,0 0 0 1px #9fd0ff44,0 0 30px #9fd0ff22!important}
/* pesca y minería */
#sa-mg{position:fixed;inset:0;z-index:85;display:grid;place-items:center;background:#000a;backdrop-filter:blur(3px);animation:saFade .2s both}
.sa-mgin{width:min(420px,calc(100vw - 32px));padding:18px;border-radius:6px;border:1px solid #d9a44166;background:linear-gradient(180deg,#151d28,#0a0f15);box-shadow:0 20px 50px #000c;display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center}
#sa-mg.k-fish .sa-mgin{background:linear-gradient(180deg,#0f2a44,#0a1420)}
#sa-mg.k-mine .sa-mgin{background:linear-gradient(180deg,#2a1d14,#120c08)}
.sa-mgt{font-family:var(--display);font-size:20px;color:#ffe9b8}.sa-mgs{color:var(--ink-2)}
.sa-bar{position:relative;width:100%;height:30px;border-radius:15px;background:#05070a;box-shadow:inset 0 0 0 1px #ffffff22;overflow:hidden}
.sa-bar .z{position:absolute;top:0;bottom:0;background:#3fae6a88}
.sa-bar .p{position:absolute;top:0;bottom:0;background:#8affb0cc}
.sa-bar .m{position:absolute;top:-2px;bottom:-2px;width:6px;border-radius:3px;background:#ffd98a;box-shadow:0 0 10px #ffd98a}
.sa-hits{display:flex;gap:6px;min-height:22px}.sa-hits span{padding:2px 8px;border-radius:10px;font-size:12px;border:1px solid}
.sa-hits .h2{color:#8affb0;border-color:#8affb066}.sa-hits .h1{color:#ffd98a;border-color:#ffd98a66}.sa-hits .h0{color:#e0735c;border-color:#e0735c66}
.sa-go{min-width:180px;font-size:16px!important;padding:12px 18px!important}
#sa-mg.flash2 .sa-mgin{animation:saOk .35s}#sa-mg.flash0 .sa-mgin{animation:saBad .35s}
@keyframes saOk{40%{box-shadow:0 0 0 3px #8affb0,0 20px 50px #000c}}
@keyframes saBad{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.sa-got{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:15px}
.sa-gather .row{display:flex;gap:8px;flex-wrap:wrap}.sa-gather .btn .sai{width:22px;height:22px;border-radius:50%;vertical-align:middle}
.sa-nightc>span .sai{width:48px;height:48px;border-radius:50%}
.sa-mgic .sai{width:72px;height:72px;border-radius:50%;filter:drop-shadow(0 0 14px #5ab0ff88);animation:saBob 2s ease-in-out infinite}
@keyframes saBob{50%{transform:translateY(-4px)}}
@keyframes saFade{from{opacity:0}}
`;
  document.head.appendChild(css);
})();
