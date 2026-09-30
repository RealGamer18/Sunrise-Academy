// ===================== AVENTURA: tablón variado · combates con estrategia · alquimia y cocina =====================
// Carga después de anim2.js.
(function () {
  if (typeof render !== "function") return;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const RM = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  const sfx = (k, ...a) => { try { window.SA_SFX?.[k]?.(...a); } catch (e) {} };
  const hereKey = () => `${G.g.loc.r}:${G.g.loc.p}`;
  const pname = (k) => { const [r, p] = String(k).split(":"); return P[r]?.[+p]?.n || "?"; };
  const rname = (r) => (typeof regionName === "function" ? regionName(r) : r);
  const pickH = (arr, h) => arr[h % arr.length];

  // =====================================================================
  // 1. TABLÓN DE MISIONES VARIADO
  // =====================================================================
  const APODOS = ["Colmillo Rojo", "Ojo Tuerto", "Garra Negra", "el Viejo Gruñón", "Sombra Hambrienta", "Cicatriz", "el Terror del Camino", "Pezuña de Hierro", "la Reina Pálida", "Mil Dientes", "el Insaciable", "Cuerno Roto"];
  const VIAJEROS = [["Mercader Tobías", "🧳"], ["Peregrina Alia", "🕯️"], ["Anciano Ferro", "🧓"], ["Cartógrafa Lune", "🗺️"], ["Bardo Quill", "🎻"], ["Sanadora Ema", "🌿"], ["Niño perdido Tito", "🧒"], ["Herrero Bruno", "🔨"]];
  const QT = {
    caza: { i: "⚔️", l: () => L("Caza", "Hunt") }, recolectar: { i: "🧺", l: () => L("Recolección", "Gathering") }, entrega: { i: "📦", l: () => L("Entrega", "Delivery") },
    escolta: { i: "🛡️", l: () => L("Escolta", "Escort") }, buscado: { i: "🎯", l: () => L("SE BUSCA", "WANTED") },
  };
  const isMatName = (n) => !SHOP.some((s) => s.n === n) && !ATTR_ITEMS[n] && WEAPONS[n] == null && !/Posada|Taberna|Tienda|Libros|Uniforme|Premios|Puntos|Mapa|Armas|Barcos|Mercado|Establos|Caravanas|Entrenamiento|Refugio|Castillo|Fabricar|Encantamientos|Pergamino|Contrabando|Llave|Romper|Pociones|Brújula|\?\?\?|Tablón/.test(n);
  const _bf = boardFor;
  boardFor = function (r, day) {
    const key = `${r}:${day}`; if (G.g.questBoard?.[key]?.v2) return G.g.questBoard[key].list;
    const H = (k) => hash(key + "#" + k);
    const fight = P[r].map((p, i) => ({ p, i })).filter((x) => x.p.mon?.length && parseLvl(x.p.lvl) && !/Duelos|Ladrones$|Premios/.test(x.p.mon.join()));
    const out = [];
    // caza (1-2)
    fight.slice(0, 2).forEach(({ p, i }, k) => { const n = 2 + (H("c" + k) % 3); const lvl = parseLvl(p.lvl)[0]; out.push({ id: `${key}:c${k}`, type: "caza", t: `Derrota ${n} criaturas en ${p.n}`, place: `${r}:${i}`, need: n, soles: 10 * n + lvl * 2, xp: 30 * lvl, fama: 20, lvl }); });
    // recolectar
    const mats = []; fight.forEach(({ p }) => (p.obj || []).forEach((o) => { const n = cleanItem(o); if (isMatName(n) && !mats.some((m) => m.n === n)) mats.push({ n, lvl: parseLvl(p.lvl)[0], at: p.n }); }));
    if (mats.length) { const m = pickH(mats, H("r")); const n = 2 + (H("rn") % 3); out.push({ id: `${key}:r`, type: "recolectar", t: `Reúne ${n}× ${m.n}`, item: m.n, where: m.at, need: n, soles: 12 * n + m.lvl * 3, xp: 25 * Math.max(1, m.lvl), fama: 15, lvl: m.lvl }); }
    // entrega o escolta (alternan por día)
    const hubs = []; for (const rr in P) P[rr].forEach((x, i) => { if (HUB_TYPES.includes(x.t) || x.t === "academia") hubs.push(`${rr}:${i}`); });
    const here = hereKey(); const regLvl = parseLvl(R.find((x) => x.id === r)?.lvl || "1")?.[0] || 1;
    if (H("t") % 2 === 0) {
      const cand = hubs.filter((k) => k !== here).map((k) => ({ k, h: (() => { try { const [a, b] = k.split(":"); return tripHours({ r: a, p: +b }, "pie"); } catch (e) { return 99; } })() })).filter((x) => x.h <= 60).sort((a, b) => a.h - b.h);
      if (cand.length) { const d = cand[H("e") % Math.min(cand.length, 6)]; const [dr] = d.k.split(":"); const lvl = Math.max(regLvl, parseLvl(R.find((x) => x.id === dr)?.lvl || "1")?.[0] || 1);
        out.push({ id: `${key}:e`, type: "entrega", t: `Lleva un paquete a ${pname(d.k)} (${rname(dr)})`, dest: d.k, pkg: `Paquete para ${pname(d.k)}`, need: 1, soles: 25 + Math.round(d.h * 4) + lvl * 2, xp: 20 * lvl + Math.round(d.h * 5), fama: 20, lvl }); }
    } else {
      const same = P[r].map((x, i) => `${r}:${i}`).filter((k) => k !== here && fight.some((f) => `${r}:${f.i}` === k));
      if (same.length) { const d = pickH(same, H("s")); const [nm, ic] = pickH(VIAJEROS, H("v")); const lvl = parseLvl(P[r][+d.split(":")[1]].lvl)[0];
        out.push({ id: `${key}:s`, type: "escolta", t: `Escolta a ${nm} hasta ${pname(d)}`, who: nm, wi: ic, dest: d, need: 1, soles: 50 + lvl * 4, xp: 40 * lvl, fama: 30, lvl }); }
    }
    // se busca
    if (fight.length) { const f = pickH(fight, H("b")); const mon = pickH(f.p.mon.filter((m) => !/duelo/i.test(m)), H("bm")); const ap = pickH(APODOS, H("ba")); const lvl = (parseLvl(f.p.lvl)[1] || parseLvl(f.p.lvl)[0]) + 2;
      out.push({ id: `${key}:b`, type: "buscado", t: `SE BUSCA: «${ap}» (${mon}) en ${f.p.n}`, mon, ap, place: `${r}:${f.i}`, need: 1, soles: 80 + lvl * 8, xp: 80 * lvl, fama: 40, lvl }); }
    G.g.questBoard = { [key]: { v2: true, list: out } }; return out;
  };
  window.SA_QINFO = (q) => { const t = QT[q.type || "caza"]; const where = q.type === "entrega" || q.type === "escolta" ? `➜ ${pname(q.dest)}` : q.type === "recolectar" ? `${L("Se consigue en", "Found at")} ${q.where}` : pname(q.place); return { i: t.i, l: t.l(), where, wanted: q.type === "buscado", ap: q.ap, mon: q.mon, who: q.who, wi: q.wi }; };
  const _qp = questProgress;
  questProgress = function (q) {
    switch (q.type) {
      case "recolectar": return Math.min(q.need, G.g.inv[q.item] || 0);
      case "entrega": return hereKey() === q.dest && G.g.inv[q.pkg] ? 1 : 0;
      case "escolta": case "buscado": return q.done ? 1 : 0;
      default: return _qp(q);
    }
  };
  const _acc = acceptQuest;
  acceptQuest = function (q) {
    const had = G.g.quests.some((x) => x.id === q.id); const r = _acc.apply(this, arguments);
    if (!had && G.g.quests.some((x) => x.id === q.id)) {
      if (q.type === "entrega") { addItem(q.pkg, 1); toast(L(`📦 Llevas el paquete. Entrégalo en ${pname(q.dest)}.`, `📦 Deliver it to ${pname(q.dest)}.`)); }
      if (q.type === "escolta") toast(L(`${q.wi} ${q.who} viaja contigo. Llévalo a ${pname(q.dest)}.`, `${q.who} travels with you.`));
      if (q.type === "buscado") toast(L(`🎯 Ve a ${pname(q.place)} y busca a «${q.ap}».`, `🎯 Hunt «${q.ap}».`));
      persist(); render();
    }
    return r;
  };
  const _turn = turnIn;
  turnIn = function (id) {
    const q = G.g.quests.find((x) => x.id === id); const ok = q && questProgress(q) >= q.need; const r = _turn.apply(this, arguments);
    if (ok && !G.g.quests.some((x) => x.id === id)) {
      if (q.type === "recolectar") addItem(q.item, -q.need);
      if (q.type === "entrega") addItem(q.pkg, -1);
      if (q.type === "buscado") { addItem("Poción mayor de vida", 2); G.g.lastResult = { title: L("Recompensa por «" + q.ap + "»", "Bounty reward"), lines: [`+${q.soles} Soles`, `+${q.xp} XP`, `+${q.fama} ${L("Rayos de Fama", "Fame")}`, L("+2 Pociones mayores de vida", "+2 Greater potions")] }; }
      persist(); render();
    }
    return r;
  };
  const _spQ = sellPrice; sellPrice = function (n) { return /^Paquete para /.test(n) ? 0 : _spQ(n); };
  function questFight(id) {
    const q = G.g.quests.find((x) => x.id === id); if (!q || q.done || G.g.combat) return;
    const lvl = Math.max(1, q.lvl || G.nivel); const r = hereKey().split(":")[0]; const aff = typeof REGION_AFF !== "undefined" ? REGION_AFF[r] : null;
    if (q.type === "buscado") {
      if (hereKey() !== q.place || !needEnergy(1)) return;
      const pv = Math.round((40 + 22 * lvl) * 0.5);
      startCombat({ n: `«${q.ap}»`, img: q.mon, lvl, pv, pvMax: pv, poder: 9 + 3 * lvl, def: Math.floor(lvl / 4), aff, boss: true, st: {}, wanted: true }, "quest", hereKey(), L(`¡Ahí está «${q.ap}», el ${q.mon.toLowerCase()} que buscan todos!`, `There's «${q.ap}»!`));
    } else if (q.type === "escolta") {
      if (hereKey() !== q.dest) return;
      const mk = (n, k) => { const l = Math.max(1, lvl - k); const pv = Math.round((15 + 10 * l) * 0.65); return { n, lvl: l, pv, pvMax: pv, poder: 5 + 2 * l, def: Math.floor(l / 6), aff: null, boss: false, st: {} }; };
      startCombat(mk("Bandido del camino", 0), "quest", hereKey(), L(`¡Bandidos! Quieren robarle a ${q.who}.`, `Bandits attack ${q.who}!`));
      if (G.g.combat) { G.g.combat.enemies.push(mk("Curandera de los bandidos", 2)); if (lvl >= 10) G.g.combat.enemies.push(mk("Bandido del camino", 1)); }
    } else return;
    if (G.g.combat) G.g.combat.questId = id; sfx("fight"); persist(); render();
  }
  const _travel = travel;
  travel = function () {
    const r = _travel.apply(this, arguments);
    try { if (!G.g.combat) { const q = G.g.quests.find((x) => x.type === "escolta" && !x.done && x.dest === hereKey()); if (q) setTimeout(() => { if (!G.g.combat && hereKey() === q.dest) questFight(q.id); }, 2200); } } catch (e) {}
    return r;
  };
  function questBox() {
    const k = hereKey(); const qs = (G.g.quests || []).filter((q) => !q.done && ((q.type === "buscado" && q.place === k) || (q.type === "escolta" && q.dest === k) || (q.type === "entrega" && q.dest === k)));
    if (!qs.length) return "";
    return `<div class="card mini qhere">${qs.map((q) => q.type === "entrega" ? `<div class="row between"><span>📦 ${L("Aquí esperan tu paquete", "Your package goes here")}: <b>${esc(q.pkg)}</b></span><button type="button" class="btn small primary" data-turnin="${esc(q.id)}">📦 ${L("Entregar", "Deliver")}</button></div>`
      : q.type === "buscado" ? `<div class="row between"><span class="wanted">🎯 <b>«${esc(q.ap)}»</b> ${L("anda por aquí", "is around here")} (${esc(q.mon)} · ${L("Nv", "Lv")} ${q.lvl})</span><button type="button" class="btn small danger" data-qfight="${esc(q.id)}">⚔️ ${L("Enfrentar (1 Energía)", "Fight")}</button></div>`
      : `<div class="row between"><span>${q.wi} ${L(`Llegaste con ${esc(q.who)}… pero unos bandidos os cortan el paso.`, `Bandits block your way.`)}</span><button type="button" class="btn small danger" data-qfight="${esc(q.id)}">🛡️ ${L("Defender", "Defend")} ${esc(q.who.split(" ").pop())}</button></div>`).join("")}</div>`;
  }

  // =====================================================================
  // 2. COMBATES CON ESTRATEGIA
  // =====================================================================
  const SPECIAL = { Fuego: ["toma aire… ¡va a escupir fuego!", "Aliento de fuego", "Quemado"], Agua: ["levanta una ola enorme…", "Maremoto", "Aturdido"], Tierra: ["golpea el suelo y todo tiembla…", "Terremoto", "Aturdido"], Aire: ["gira cada vez más rápido…", "Tornado", null], Rayo: ["se carga de electricidad…", "Tormenta eléctrica", "Aturdido"], Luz: ["brilla con una luz cegadora…", "Estallido de luz", "Cegado"], Sombra: ["se envuelve en sombras…", "Abrazo de la oscuridad", "Asustado"] };
  const specOf = (e) => (/Pyrax|dragón|Draco|Wyrm/i.test(e.n) ? ["está tomando aire… ¡va a soltar fuego!", "Aliento de dragón", "Quemado"] : SPECIAL[e.aff] || ["prepara un golpe devastador…", "Golpe devastador", null]);
  const HEALER = /Bruja|Sacerdot|Espíritu|Nixie|Druida|Curander|Chamán|Hada|Sirena|Monje|Cultista/i;
  const PACK = /Lobo|Rata|Kóbold|Contrabandist|Araña|Bandido|Cuervo|Murciélago|Gaviota|Cangrejo|Sapo|Escarabajo|Gusano/i;
  function ai(e, c) {
    if (e.ai) return e.ai;
    const raid = !!c.raid; const pvp = !!e.pvp;
    e.ai = { role: pvp ? "none" : HEALER.test(e.n) && !raid ? "heal" : PACK.test(e.n) && !e.boss && !raid ? "pack" : "none", cd: 2, hcd: 1, p2: false, p3: false, charge: null, called: false };
    return e.ai;
  }
  const ratio = (e) => e.pv / Math.max(1, e.pvMax);
  function strongUnit(e) { return (e.boss || e.wanted) && !e.pvp; }
  const _et = enemyTurn;
  enemyTurn = function () {
    const c = G.g.combat; if (!c) return _et();
    const ps = c.pst; const all = c.enemies; const normal = [];
    for (const e of all.filter((x) => x.pv > 0)) {
      const A = ai(e, c);
      // fases
      if (strongUnit(e) && !A.p2 && ratio(e) < 0.5) {
        A.p2 = true; e.poder = Math.round(e.poder * 1.2); A.cd = Math.min(A.cd, 1); clog(`🔥 ${e.n} se enfurece: ¡segunda fase! (más fuerte)`); sfx("boss");
        if (!c.raid && all.length < 3 && e.boss && !e.story && !e.god) { const add = minion(e, c); if (add) { all.push(add); clog(`📯 ${e.n} llama refuerzos: aparece ${add.n}.`); } }
      }
      if (strongUnit(e) && !A.p3 && ratio(e) < 0.25) { A.p3 = true; e.poder = Math.round(e.poder * 1.1); A.fast = true; clog(`💢 ${e.n} está desesperado: ataca con todo.`); }
      if (e.st.Aturdido && A.charge) { clog(`✨ ¡Interrumpiste el ataque de ${e.n}! Pierde su ${A.charge.name}.`); A.charge = null; A.cd = 2; normal.push(e); continue; }
      // ataque cargado
      if (A.charge) {
        const lost = A.charge.hp - e.pv;
        if (lost >= e.pvMax * 0.15) { clog(`✨ ¡Le hiciste tanto daño que ${e.n} pierde la concentración! El ${A.charge.name} se deshace.`); A.charge = null; A.cd = A.fast ? 1 : 2; continue; }
        unleash(e, A); A.charge = null; A.cd = A.fast ? 2 : 3; if (G.pv <= 0 || !G.g.combat) return; continue;
      }
      if (strongUnit(e)) { A.cd--; if (A.cd <= 0 && Math.random() < 0.75) { const [txt, name] = specOf(e); A.charge = { name, hp: e.pv }; clog(`⚠️ ${e.n} ${txt} Usará ${name} el próximo turno.`); sfx("windup"); continue; } }
      // curanderos
      if (A.role === "heal") { A.hcd--; const hurt = all.filter((x) => x.pv > 0 && ratio(x) < 0.55).sort((a, b) => ratio(a) - ratio(b))[0]; if (hurt && A.hcd <= 0) { const h = Math.round(hurt.pvMax * 0.25); hurt.pv = Math.min(hurt.pvMax, hurt.pv + h); A.hcd = 3; clog(`💚 ${e.n} cura a ${hurt === e ? "sí mismo" : hurt.n}: +${h} PV.`); sfx("heal"); continue; } }
      // manadas: piden ayuda una vez
      if (A.role === "pack" && !A.called && all.filter((x) => x.pv > 0).length < 3 && (ratio(e) < 0.6 || (c.round >= 2 && Math.random() < 0.25))) { A.called = true; const add = minion(e, c); if (add) { all.push(add); clog(`📯 ${e.n} llama a su manada: ¡aparece otro!`); continue; } }
      normal.push(e);
    }
    c.enemies = normal; let r;
    try { r = _et(); } finally { c.enemies = all; }
    return r;
  };
  function minion(e, c) {
    const lvl = Math.max(1, e.lvl - (e.boss ? 3 : 2)); const pv = Math.round((15 + 10 * lvl) * 0.5);
    let name = e.n, img = e.img;
    if (e.boss) { const [r, p] = c.placeKey.split(":"); const pl = P[r]?.[+p]; const opts = (pl?.mon || []).filter((m) => !/duelo/i.test(m)); name = opts.length ? opts[Math.floor(Math.random() * opts.length)] : "Esbirro"; img = null; }
    const m = { n: name, lvl, pv, pvMax: pv, poder: 5 + 2 * lvl, def: Math.floor(lvl / 6), aff: e.aff, boss: false, st: {}, minion: true }; if (img) m.img = img; m.ai = { role: "none", cd: 9, hcd: 9, called: true };
    return m;
  }
  function unleash(e, A) {
    const ps = G.g.combat.pst; const spec = specOf(e);
    let dmg = e.poder * 2.2 - 2 * (attr("defensa") + defBonus());
    const cov = ps.defend; if (cov) dmg *= 0.25; if (ps.shield > 0) dmg *= 0.5;
    dmg = Math.max(1, Math.round(dmg)); let absorbed = 0; if (ps.barrier > 0) { absorbed = Math.min(ps.barrier, dmg); ps.barrier -= absorbed; dmg -= absorbed; }
    clog(`💥 ¡${A.charge.name}!${cov ? " Te cubriste a tiempo." : " No te cubriste…"}`);
    G.pv = Math.max(0, G.pv - dmg);
    if (G.pv <= 0 && ps.nornaSave) { ps.nornaSave = false; G.pv = 1; clog("El hilo de Norna no se corta: quedas a 1 PV."); }
    clog(`${e.n} te golpea: ${dmg} de daño${absorbed ? ` (el escudo absorbe ${absorbed})` : ""}${cov ? "" : " (crítico)"}.`);
    if (!cov && spec[2]) tryStatus(null, spec[2], true);
    if (G.pv <= 0) defeat();
  }
  // insignias de intención en los enemigos + aviso grande
  const _cv = combatView;
  combatView = function () {
    let out = _cv(); const c = G?.g?.combat; if (!c) return out;
    let i = 0; const es = c.enemies;
    out = out.replace(/<button type="button" class="foe2 ([^"]*)"([^>]*)>\s*<div class="plate">/g, (m, cls, rest) => {
      const e = es[i++]; if (!e || e.pv <= 0) return m; const A = e.ai || {};
      const tags = [A.charge ? `<span class="itn charge">⚠️ ${esc(A.charge.name)}</span>` : "", A.role === "heal" ? `<span class="itn heal">💚 ${L("Sanador", "Healer")}</span>` : "", A.role === "pack" && !A.called ? `<span class="itn pack">📯 ${L("Llama a la manada", "Calls the pack")}</span>` : "", A.p3 ? `<span class="itn rage">💢 ${L("Desesperado", "Desperate")}</span>` : A.p2 ? `<span class="itn rage">🔥 ${L("Fase 2", "Phase 2")}</span>` : "", e.wanted ? `<span class="itn wanted">🎯 ${L("Buscado", "Wanted")}</span>` : "", e.minion ? `<span class="itn">➕ ${L("Refuerzo", "Reinforcement")}</span>` : ""].filter(Boolean).join("");
      return `<button type="button" class="foe2 ${cls} ${A.charge ? "charging" : ""} ${A.p2 ? "enraged" : ""}"${rest}><div class="plate">${tags ? `<div class="itns">${tags}</div>` : ""}`;
    });
    const ch = es.find((e) => e.pv > 0 && e.ai?.charge);
    if (ch) {
      out = out.replace('<div class="cmd">', `<div class="warnbar">⚠️ <b>${esc(ch.n)}</b> ${L("va a usar", "will use")} <b>${esc(ch.ai.charge.name)}</b> ${L("en su próximo turno", "next turn")}. <span>🛡️ ${L("Defiéndete (recibes solo ¼ del daño), aturdirlo o quitarle mucha vida lo interrumpe.", "Defend (¼ damage), stun it or hit it hard to interrupt.")}</span></div><div class="cmd">`);
      out = out.replace('<button type="button" class="cbtn" data-g="defend">', '<button type="button" class="cbtn defpulse" data-g="defend">');
    }
    return out;
  };

  // =====================================================================
  // 3. ALQUIMIA, COCINA Y ACEITES
  // =====================================================================
  const GROUPS = {
    hierba: { i: "🌿", l: () => L("hierba o flor", "herb"), m: ["Hierba del alba", "Flor de escarcha", "Flor nocturna", "Pétalo de luna", "Rosa carmesí", "Madera antigua"] },
    cristal: { i: "💎", l: () => L("cristal o perla", "crystal"), m: ["Cristal de luz", "Cristal eterno", "Perlas de río", "Perla eléctrica", "Coral azul", "Polvo de estrella", "Fragmento de tiempo", "Arena de vidrio"] },
    mineral: { i: "🪨", l: () => L("mineral", "mineral"), m: ["Mineral de plata", "Rubí en bruto", "Carbón ardiente", "Sal de fuego", "Piedra de cumbre", "Obsidiana", "Oro pirata"] },
    bestia: { i: "🦴", l: () => L("parte de bestia", "beast part"), m: ["Carne de caza", "Seda de araña", "Piel de yeti", "Escama de trueno", "Escama de dragón", "Fragmento maldito"] },
    comida: { i: "🍖", l: () => L("ingrediente de cocina", "food"), m: ["Carne de caza", "Pescado fresco", "Trigo dorado", "Grano solar"] },
  };
  // objetos nuevos (se registran en SHOP con craft:true: no salen en la tienda, pero sí en Objetos del combate)
  const ITEMS = [
    { n: "Antídoto", kind: "potion", val: 10, desc: "Quita los estados malos y cura 10 PV", fx: "cure", ic: "🧴" },
    { n: "Elixir de fuerza", kind: "potion", val: 0, desc: "Combate: +6 de daño el resto del combate", fx: "str", combat: true, ic: "💪" },
    { n: "Elixir de piedra", kind: "potion", val: 0, desc: "Combate: recibes la mitad de daño 3 turnos", fx: "stone", combat: true, ic: "🪨" },
    { n: "Bomba de humo", kind: "potion", val: 0, desc: "Combate: escapas seguro (no sirve contra jefes)", fx: "smoke", combat: true, ic: "💨" },
    { n: "Elixir de dragón", kind: "potion", val: 0, desc: "Combate: +12 de daño y escudo del 20% de tu vida", fx: "dragon", combat: true, ic: "🐉" },
    { n: "Pan dorado", kind: "food", desc: "+20 PV ahora y +1 Defensa durante 5 combates", food: { pv: 20, def: 1 }, ic: "🍞" },
    { n: "Estofado del cazador", kind: "food", desc: "+3 de daño durante 5 combates", food: { dmg: 3 }, ic: "🍲" },
    { n: "Sopa de la abuela Mira", kind: "food", desc: "Recupera 3 de Energía y 30 PV", food: { en: 3, pv: 30, now: true }, ic: "🥣" },
    { n: "Pastel solar", kind: "food", desc: "+15% de XP durante 5 combates", food: { xp: 0.15 }, ic: "🥧" },
    { n: "Brocheta picante", kind: "food", desc: "+2 iniciativa y +2 de daño durante 5 combates", food: { init: 2, dmg: 2 }, ic: "🍢" },
    { n: "Té de las estrellas", kind: "food", desc: "Maná al máximo y −2 Estrés", food: { mana: 999, estres: -2, now: true }, ic: "🍵" },
    { n: "Aceite de fuego", kind: "oil", desc: "Arma: 30% de quemar al golpear durante 5 combates", oil: "Quemado", ic: "🔥" },
    { n: "Aceite de escarcha", kind: "oil", desc: "Arma: 30% de aturdir al golpear durante 5 combates", oil: "Aturdido", ic: "❄️" },
    { n: "Aceite de luz", kind: "oil", desc: "Arma: 30% de cegar al golpear durante 5 combates", oil: "Cegado", ic: "☀️" },
    { n: "Aceite de sombra", kind: "oil", desc: "Arma: 30% de asustar al golpear durante 5 combates", oil: "Asustado", ic: "🌑" },
  ];
  for (const it of ITEMS) if (!SHOP.some((s) => s.n === it.n)) SHOP.push({ ...it, precio: 0, craft: true });
  const ITEM = (n) => SHOP.find((s) => s.n === n);
  const RECIPES = [
    { t: "alq", out: "Poción de vida", q: 2, need: [["hierba", 2]] }, { t: "alq", out: "Poción de maná", q: 2, need: [["cristal", 2]] },
    { t: "alq", out: "Poción mayor de vida", q: 1, need: [["hierba", 2], ["cristal", 1]] }, { t: "alq", out: "Tónico de energía", q: 2, need: [["hierba", 1], ["comida", 1]] },
    { t: "alq", out: "Antídoto", q: 2, need: [["hierba", 1]], soles: 5 }, { t: "alq", out: "Elixir de fuerza", q: 1, need: [["mineral", 1], ["hierba", 1]] },
    { t: "alq", out: "Elixir de piedra", q: 1, need: [["mineral", 2]] }, { t: "alq", out: "Bomba de humo", q: 2, need: [["bestia", 1], ["mineral", 1]] },
    { t: "alq", out: "Elixir de dragón", q: 1, need: [["i:Escama de dragón", 1], ["cristal", 2]] },
    { t: "coc", out: "Pan dorado", q: 1, need: [["comida", 2]] }, { t: "coc", out: "Estofado del cazador", q: 1, need: [["comida", 1], ["bestia", 1]] },
    { t: "coc", out: "Sopa de la abuela Mira", q: 1, need: [["comida", 2], ["hierba", 1]] }, { t: "coc", out: "Pastel solar", q: 1, need: [["comida", 2], ["cristal", 1]] },
    { t: "coc", out: "Brocheta picante", q: 1, need: [["comida", 1], ["mineral", 1]] }, { t: "coc", out: "Té de las estrellas", q: 1, need: [["hierba", 1], ["cristal", 1]] },
    { t: "ace", out: "Aceite de fuego", q: 1, need: [["mineral", 1], ["bestia", 1]] }, { t: "ace", out: "Aceite de escarcha", q: 1, need: [["cristal", 1], ["bestia", 1]] },
    { t: "ace", out: "Aceite de luz", q: 1, need: [["cristal", 1], ["hierba", 1]] }, { t: "ace", out: "Aceite de sombra", q: 1, need: [["bestia", 1], ["hierba", 1]] },
  ];
  const TABS = { alq: ["⚗️", () => L("Alquimia", "Alchemy")], coc: ["🍳", () => L("Cocina", "Cooking")], ace: ["🛢️", () => L("Aceites", "Oils")] };
  function plan(rec) { // qué objetos concretos se gastarían
    const inv = { ...G.g.inv }; const use = []; let ok = true;
    for (const [g, q] of rec.need) {
      let left = q;
      if (g.startsWith("i:")) { const n = g.slice(2); const t = Math.min(inv[n] || 0, left); if (t) { use.push([n, t]); inv[n] -= t; left -= t; } }
      else for (const n of GROUPS[g].m.filter((x) => inv[x] > 0).sort((a, b) => inv[b] - inv[a])) { if (!left) break; const t = Math.min(inv[n], left); use.push([n, t]); inv[n] -= t; left -= t; }
      if (left > 0) ok = false;
    }
    if ((rec.soles || 0) > G.dinero.soles) ok = false;
    return { ok, use };
  }
  const canWork = () => { const pl = P[G.g.loc.r][G.g.loc.p]; return HUB_TYPES.includes(pl.t) || ["academia", "santuario"].includes(pl.t); };
  function craft(i) {
    const rec = RECIPES[i]; if (!rec || G.g.combat || !canWork()) return; const pl = plan(rec); if (!pl.ok) return toast(L("Te faltan ingredientes.", "Missing ingredients."));
    for (const [n, q] of pl.use) addItem(n, -q); if (rec.soles) G.dinero.soles -= rec.soles;
    addItem(rec.out, rec.q); log(`Preparó ${rec.q > 1 ? rec.q + "× " : ""}${rec.out}.`);
    try { window.SA_EXTRA?.dq?.("craft"); } catch (e) {}
    craftFx(rec); persist(); render();
  }
  function craftFx(rec) {
    const ic = ITEM(rec.out)?.ic || (rec.out.includes("maná") ? "💧" : rec.out.includes("Tónico") ? "⚡" : "🧪");
    sfx(rec.t === "coc" ? "heal" : rec.t === "ace" ? "impact" : "potion", "Fuego");
    if (RM()) return toast(`${ic} ${rec.out}`);
    const el = document.createElement("div"); el.className = `xcraft ${rec.t}`;
    let bub = ""; for (let k = 0; k < 10; k++) bub += `<i style="left:${20 + Math.random() * 60}%;animation-delay:${(Math.random() * 0.8).toFixed(2)}s"></i>`;
    el.innerHTML = `<div class="xc-pot">${rec.t === "alq" ? "⚗️" : rec.t === "coc" ? "🍳" : "🗡️"}<div class="xc-bub">${bub}</div></div><div class="xc-out">${ic}<b>${esc(rec.out)}${rec.q > 1 ? ` ×${rec.q}` : ""}</b></div>`;
    document.body.appendChild(el); setTimeout(() => el.classList.add("done"), 1100); setTimeout(() => el.classList.add("out"), 2100); setTimeout(() => el.remove(), 2600);
  }
  function workshopBox() {
    if (!canWork()) return ""; const open = gsel.xws; const tab = gsel.xwsTab || "alq";
    const head = `<div class="row between"><b>⚗️ ${L("Taller: alquimia, cocina y aceites", "Workshop: alchemy, cooking & oils")}</b><button type="button" class="btn small ${open ? "" : "primary"}" data-xws="1">${open ? L("Cerrar", "Close") : L("Abrir", "Open")}</button></div>`;
    if (!open) return `<div class="card mini wsbox">${head}<small class="muted">${L("Convierte tus materiales en pociones, comidas con bonos y aceites para el arma.", "Turn materials into potions, food and oils.")}</small></div>`;
    const list = RECIPES.map((r, i) => ({ r, i })).filter((x) => x.r.t === tab);
    const cards = list.map(({ r, i }) => { const it = ITEM(r.out); const p = plan(r); const ic = it?.ic || (r.out.includes("maná") ? "💧" : r.out.includes("Tónico") ? "⚡" : r.out.includes("mayor") ? "❤️‍🔥" : "❤️");
      const need = r.need.map(([g, q]) => { const have = g.startsWith("i:") ? G.g.inv[g.slice(2)] || 0 : GROUPS[g].m.reduce((a, n) => a + (G.g.inv[n] || 0), 0); const lb = g.startsWith("i:") ? g.slice(2) : GROUPS[g].l(); const gi = g.startsWith("i:") ? "✦" : GROUPS[g].i;
        return `<span class="ing ${have >= q ? "ok" : "no"}" title="${g.startsWith("i:") ? "" : esc(GROUPS[g].m.join(", "))}">${gi} ${q}× ${esc(lb)} <small>(${have})</small></span>`; }).join("") + (r.soles ? `<span class="ing ${G.dinero.soles >= r.soles ? "ok" : "no"}">☀ ${r.soles}</span>` : "");
      return `<div class="rec ${p.ok ? "can" : ""}"><div class="rec-ic">${ic}</div><div class="rec-b"><b>${esc(r.out)}${r.q > 1 ? ` ×${r.q}` : ""}</b><small>${esc(it?.desc || SHOP.find((s) => s.n === r.out)?.desc || "")}</small><div class="ings">${need}</div>${p.ok ? `<small class="uses">${L("Usará", "Uses")}: ${p.use.map(([n, q]) => `${q}× ${esc(n)}`).join(", ")}</small>` : ""}</div>
        <button type="button" class="btn small ${p.ok ? "primary" : ""}" data-xcraft="${i}" ${p.ok ? "" : "disabled"}>${TABS[r.t][0]} ${L("Preparar", "Make")}</button></div>`; }).join("");
    return `<div class="card mini wsbox open">${head}<div class="shtabs">${Object.entries(TABS).map(([k, [ic, lb]]) => `<button type="button" class="chip ${tab === k ? "on" : ""}" data-xwstab="${k}">${ic} ${lb()}</button>`).join("")}</div>
      <div class="recs">${cards}</div><p class="note">${L("Cada ingrediente pide un tipo (hierba, cristal, mineral, bestia o comida): se usa el que más tengas. La carne sale al cazar animales y el pescado al explorar en lagos y costas. Las comidas y aceites se usan desde la Bolsa; los elixires, en combate (Objetos).", "Any item of the right type works.")}</p></div>`;
  }
  // usar objetos nuevos
  const _pi = pItem;
  pItem = function (n) {
    const it = ITEM(n); if (!it || !G.g.inv[n] || !it.craft) return _pi.apply(this, arguments);
    const c = G.g.combat;
    if (it.combat && !c) return toast(L("Esto se usa en combate (botón Objetos).", "Use it in combat."));
    if (it.kind === "food") {
      if (c) return; addItem(n, -1); const f = it.food;
      if (f.pv) G.pv = Math.min(G.pvMax, G.pv + f.pv); if (f.en) G.energia = Math.min(G.energiaMax, G.energia + f.en); if (f.mana) G.mana = G.manaMax; if (f.estres) G.estres = Math.max(0, G.estres + f.estres);
      if (!f.now) G.g.food = { n, left: 5, fx: f };
      sfx("heal"); toast(`${it.ic} ${n}${f.now ? "" : L(" · efecto por 5 combates", " · 5 fights")}`); eatFx(it.ic); persist(); return render();
    }
    if (it.kind === "oil") { if (c) return; addItem(n, -1); G.g.oil = { n, st: it.oil, left: 5, ic: it.ic }; sfx("impact", "Fuego"); toast(L(`${it.ic} Untaste tu arma con ${n}.`, `Oil applied.`)); eatFx(it.ic); persist(); return render(); }
    if (c) {
      const ps = c.pst;
      if (it.fx === "smoke") { if (c.enemies.some((e) => e.boss) || c.raid) return toast(L("El humo no sirve contra jefes.", "Useless against bosses.")); addItem(n, -1); log(`Escapó con una bomba de humo.`); G.g.combat = null; sfx("flee"); toast(L("💨 Desapareces entre el humo.", "💨 You vanish in smoke.")); persist(); return render(); }
      if (it.fx === "str") { ps.forge = (ps.forge || 0) + 6; clog("💪 Te sientes mucho más fuerte: +6 de daño."); }
      if (it.fx === "stone") { ps.shield = Math.max(ps.shield || 0, 3); clog("🪨 Tu piel se endurece como la piedra."); }
      if (it.fx === "dragon") { ps.forge = (ps.forge || 0) + 12; ps.barrier = (ps.barrier || 0) + Math.round(G.pvMax * 0.2); clog("🐉 ¡El poder del dragón te recorre!"); }
      if (it.fx === "cure") { ps.st = {}; clog("🧴 Te libras de todos los estados."); }
    } else if (it.fx === "cure") { addItem(n, -1); G.pv = Math.min(G.pvMax, G.pv + 10); toast("🧴 +10 PV"); persist(); return render(); }
    return _pi.apply(this, arguments);
  };
  function eatFx(ic) { if (RM()) return; const el = document.createElement("div"); el.className = "xeat"; el.textContent = ic; document.body.appendChild(el); setTimeout(() => el.remove(), 1200); }
  const active = (k) => { const x = G?.g?.[k]; return x && (x.left > 0 || (G.g.combat && G.g.combat[k] === x.n)); };
  const fb = (key) => (active("food") ? G.g.food.fx[key] || 0 : 0);
  const _wb = weaponBonus; weaponBonus = function () { return _wb() + (G?.g ? fb("dmg") : 0); };
  const _db = defBonus; defBonus = function () { return _db() + (G?.g ? fb("def") : 0); };
  const _ib = initBonus; initBonus = function () { return _ib() + (G?.g ? fb("init") : 0); };
  const _gx = gainXP; gainXP = function (n) { return _gx.call(this, n && G?.g && fb("xp") ? Math.round(n * (1 + fb("xp"))) : n); };
  const _sc = startCombat;
  startCombat = function () {
    const r = _sc.apply(this, arguments); const c = G.g.combat;
    if (c) for (const k of ["food", "oil"]) { const x = G.g[k]; if (x && x.left > 0) { c[k] = x.n; x.left--; } }
    return r;
  };
  const _pa = pAttack;
  pAttack = function (ti, spell) {
    const c = G.g.combat; const e = c?.enemies?.[ti]; const before = e ? e.pv : 0; const r = _pa.apply(this, arguments);
    try { if (!spell && e && active("oil") && e.pv > 0 && e.pv < before && Math.random() < 0.3 && G.g.combat === c) { e.st[G.g.oil.st] = G.g.oil.st === "Aturdido" ? 1 : 2; clog(`${G.g.oil.ic} El ${G.g.oil.n.toLowerCase()} hace efecto: ${e.n} queda ${G.g.oil.st.toLowerCase()}.`); } } catch (x) {}
    return r;
  };
  // carne y pescado
  const _vic = victory;
  victory = function () {
    const c = G.g.combat; const es = c ? c.enemies.filter((e) => !e.boss && !e.pvp && /Lobo|Grifo|Jabalí|Oso|Yeti|Sapo|Tortuga|Ciervo|Gaviota|Cangrejo|Rata|Serpiente|Anguila|Bestia|Salamandra|Cuervo|Murciélago|Escarabajo|Gusano|Draco|Wyrm|Minotauro/i.test(e.n)) : [];
    const qid = c?.questId; const r = _vic.apply(this, arguments);
    try {
      const lines = []; let meat = 0; for (const e of es) if (Math.random() < 0.45) meat++;
      if (meat) { addItem("Carne de caza", meat); lines.push(`🍖 ${L("Obtienes", "You get")}: ${meat}× Carne de caza`); }
      if (qid) { const q = G.g.quests.find((x) => x.id === qid); if (q) { q.done = true; lines.push(q.type === "buscado" ? L(`🎯 ¡«${q.ap}» ha caído! Cobra la recompensa en la Bolsa (Misiones aceptadas).`, "🎯 Bounty done! Claim it in the Bag.") : L(`🛡️ ${q.who} está a salvo. Entrega la misión en la Bolsa.`, `🛡️ ${q.who} is safe.`)); sfx("victory"); } }
      if (lines.length) { const b = G.g.lastBattle || G.g.lastResult; if (b) b.lines = [...(b.lines || []), ...lines]; persist(); render(); }
    } catch (e) { console.warn("aventura:", e); }
    return r;
  };
  const _ex = explore;
  explore = function () {
    const ok = G && !G.g.combat && G.energia >= 1; const k = hereKey(); const r = _ex.apply(this, arguments);
    try { if (ok && (/^costa:/.test(k) || k === "verde:1" || k === "verde:2") && Math.random() < 0.55) { addItem("Pescado fresco", 1); if (G.g.lastResult) G.g.lastResult.lines = [...G.g.lastResult.lines, "🐟 +1 Pescado fresco"]; persist(); render(); } } catch (e) {}
    return r;
  };
  const _spF = sellPrice; sellPrice = function (n) { return n === "Carne de caza" ? 3 : n === "Pescado fresco" ? 4 : _spF(n); };

  // =====================================================================
  // 4. VISTAS
  // =====================================================================
  const _pv = placeView;
  placeView = function () {
    const out = _pv(); if (!G?.g) return out; const extra = questBox() + workshopBox(); if (!extra) return out;
    const re = /(<div class="scene"[\s\S]*?<\/div><\/div>)/; return re.test(out) ? out.replace(re, `$1${extra}`) : extra + out;
  };
  const _hud = hud;
  hud = function () {
    const out = _hud(); if (!G?.g) return out; const b = [];
    if (G.g.food && G.g.food.left > 0) b.push(`${ITEM(G.g.food.n)?.ic || "🍲"} ${esc(G.g.food.n)} (${G.g.food.left})`);
    if (G.g.oil && G.g.oil.left > 0) b.push(`${G.g.oil.ic} ${esc(G.g.oil.n)} (${G.g.oil.left})`);
    const esc2 = G.g.quests?.find((q) => q.type === "escolta" && !q.done); if (esc2) b.push(`${esc2.wi} ${esc(esc2.who)}`);
    return b.length ? out.replace('<div class="where">', `<div class="where"><small class="xbuffs">${b.join(" · ")}</small><br>`) : out;
  };
  const _bag = bagView;
  bagView = function () {
    let out = _bag(); if (!G?.g) return out;
    // descripción y tipo en cada misión aceptada
    for (const q of G.g.quests) { const t = QT[q.type || "caza"]; const hint = q.type === "entrega" ? L(`Llévalo a ${pname(q.dest)}`, `Take it to ${pname(q.dest)}`) : q.type === "escolta" ? (q.done ? L("¡Cumplida!", "Done!") : L(`Viaja a ${pname(q.dest)} con ${q.who}`, `Travel to ${pname(q.dest)}`)) : q.type === "buscado" ? (q.done ? L("¡Cumplida!", "Done!") : L(`Búscalo en ${pname(q.place)}`, `Find it at ${pname(q.place)}`)) : q.type === "recolectar" ? L(`Tienes ${Math.min(q.need, G.g.inv[q.item] || 0)} de ${q.need}`, "") : "";
      out = out.replace(`<b>${esc(q.t)}</b><small>`, `<b>${t.i} ${esc(q.t)}</b><small>${hint ? esc(hint) + " · " : ""}`); }
    return out;
  };
  document.addEventListener("click", (ev) => {
    if (view.name !== "game" || !G) return; const t = ev.target.closest("button"); if (!t) return; const d = t.dataset; const stop = () => ev.stopPropagation();
    if (d.xws) { stop(); gsel.xws = !gsel.xws; return render(); }
    if (d.xwstab) { stop(); gsel.xwsTab = d.xwstab; return render(); }
    if (d.xcraft) { stop(); return craft(+d.xcraft); }
    if (d.qfight) { stop(); return questFight(d.qfight); }
  }, true);
  const _render = render;
  render = function () {
    try { if (G?.g && !G.g.combat) { if (G.g.food && G.g.food.left <= 0) G.g.food = null; if (G.g.oil && G.g.oil.left <= 0) G.g.oil = null; } } catch (e) {}
    return _render.apply(this, arguments);
  };

  const css = `
.itns{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px}
.itn{font-size:11px;padding:1px 6px;border-radius:8px;background:#0b131ccc;border:1px solid var(--line);color:var(--ink-2);white-space:nowrap}
.itn.charge{border-color:#ffb34d;color:#ffd84a;animation:itnP .8s ease-in-out infinite}.itn.heal{border-color:#8be0a8;color:#8be0a8}.itn.pack{border-color:#c79a55;color:#e8c878}.itn.rage{border-color:#e0584a;color:#ff8a7a}.itn.wanted{border-color:#e0584a;color:#ffd84a}
@keyframes itnP{50%{box-shadow:0 0 10px #ffb34d;transform:scale(1.06)}}
.foe2.charging .sprite{animation:foeCh .6s ease-in-out infinite alternate;filter:drop-shadow(0 0 14px #ffb34d)}
@keyframes foeCh{from{transform:scale(1)}to{transform:scale(1.08) translateY(-4px)}}
.foe2.enraged .sprite{filter:drop-shadow(0 0 10px #e0584a) saturate(1.3)}
.warnbar{margin:8px 0;padding:8px 12px;border:1px solid #ffb34d;border-radius:8px;background:linear-gradient(90deg,#ffb34d22,#e0584a18);color:#fff3d6;animation:wbIn .4s ease, wbPulse 1.2s ease-in-out infinite alternate}
.warnbar span{display:block;color:#ffd84a;font-size:13px;margin-top:2px}
@keyframes wbIn{from{opacity:0;transform:translateY(-6px)}}@keyframes wbPulse{to{box-shadow:0 0 16px #ffb34d66}}
.cbtn.defpulse{border-color:#ffd84a !important;box-shadow:0 0 0 2px #ffd84a88;animation:itnP 1s ease-in-out infinite}
.qhere{border-color:#ffd84a88}.qhere .row{gap:10px;flex-wrap:wrap}.qhere .row+.row{margin-top:8px}.wanted b{color:#ff8a7a}
.wsbox.open{border-color:#9be07a66}
.recs{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:10px;margin-top:6px}
.rec{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:8px;padding:10px;background:var(--panel-2);opacity:.7;transition:transform .15s,opacity .15s,border-color .15s}
.rec.can{opacity:1;border-color:#9be07a66}.rec:hover{transform:translateY(-2px)}
.rec-ic{font-size:28px;width:44px;height:44px;display:grid;place-items:center;border-radius:8px;background:#0b131c;flex:none}
.rec.can .rec-ic{box-shadow:0 0 10px #9be07a55}
.rec-b{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}.rec-b small{color:var(--ink-2);font-size:12.5px}.rec-b small.uses{color:#9be07a}
.ings{display:flex;flex-wrap:wrap;gap:4px}.ing{font-size:12px;border-radius:10px;padding:1px 7px;border:1px solid var(--line)}.ing.ok{border-color:#8be0a888;color:#8be0a8}.ing.no{border-color:#e0584a66;color:#ff8a7a}.ing small{opacity:.7}
.xcraft{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:78;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:10px;transition:opacity .45s,transform .45s}
.xcraft.out{opacity:0;transform:translate(-50%,-70%)}
.xc-pot{position:relative;font-size:84px;animation:xcShake .25s ease-in-out 4 alternate;filter:drop-shadow(0 0 20px #9be07a88)}
.xcraft.coc .xc-pot{filter:drop-shadow(0 0 20px #ffb34d88)}.xcraft.ace .xc-pot{filter:drop-shadow(0 0 20px #ff7a2e88)}
@keyframes xcShake{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
.xc-bub{position:absolute;inset:-40px 0 50% 0}.xc-bub i{position:absolute;bottom:0;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#9be07a 60%,transparent);animation:xcBub 1s ease-out infinite}
.xcraft.coc .xc-bub i{background:radial-gradient(circle,#ffffffcc,#ffffff22 70%,transparent);width:18px;height:18px}.xcraft.ace .xc-bub i{background:radial-gradient(circle,#ffe14d,#ff7a2e 60%,transparent)}
@keyframes xcBub{from{transform:translateY(0) scale(.6);opacity:1}to{transform:translateY(-70px) scale(1.2);opacity:0}}
.xc-out{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:46px;opacity:0;transform:scale(.3)}
.xcraft.done .xc-out{opacity:1;transform:scale(1);transition:all .45s cubic-bezier(.2,1.6,.4,1)}.xcraft.done .xc-pot{opacity:.25;animation:none}
.xc-out b{font-family:var(--display);font-size:20px;color:#fff3d6;text-shadow:0 0 12px #9be07a,0 2px 6px #000}
.xeat{position:fixed;left:50%;top:45%;font-size:64px;transform:translate(-50%,-50%);z-index:78;pointer-events:none;animation:xEat 1.1s ease forwards}
@keyframes xEat{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}30%{opacity:1;transform:translate(-50%,-50%) scale(1.3)}60%{transform:translate(-50%,-50%) scale(1) rotate(-10deg)}100%{opacity:0;transform:translate(-50%,-120%) scale(.6)}}
.xbuffs{color:#9be07a}
.qnote.wanted{background:linear-gradient(160deg,#f6d9b0,#d9b07a)}.qnote .qtype{align-self:flex-start;font-size:11px;font-weight:700;letter-spacing:.08em;border-radius:4px;padding:1px 6px;background:#2b1d0e;color:#f3e3bf}
.qnote.wanted .qtype{background:#b3261e;color:#fff}
.qnote .wface{display:flex;align-items:center;gap:8px}.qnote .wface .mimg,.qnote .wface img{width:48px;height:48px;border-radius:6px;object-fit:cover;border:2px solid #2b1d0e;filter:sepia(.5)}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
