// ===================== MOTOR DEL JUEGO =====================
const PLACE_OF = (r, p) => P[r][p];
const regionName = (r) => R.find((x) => x.id === r)?.name || r;
function parseLvl(s) {
  const m = String(s).match(/(\d+)(?:[–-](\d+))?/); if (!m) return null;
  const a = +m[1], b = m[2] ? +m[2] : a + 4; return [a, b];
}
function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }
function weatherFor(r, day) { const ks = Object.keys(R.find((x) => x.id === r).wx); return ks[hash(r + ":" + day) % ks.length]; }
function roll2d6(mode) { // mode: 1 ventaja, -1 desventaja
  const n = mode ? 3 : 2; const ds = Array.from({ length: n }, () => d(6));
  const s = [...ds].sort((a, b) => b - a); const kept = mode === -1 ? s.slice(-2) : s.slice(0, 2);
  return { ds, sum: kept[0] + kept[1], crit: kept[0] === 6 && kept[1] === 6 };
}
const tierOf = (t, spell) => (t >= 10 ? "hit" : t >= (spell ? 5 : 6) ? "mix" : "miss");
const TIER = { hit: "Éxito", mix: "Éxito con costo", miss: "Fallo" };

// ---------- estado de juego dentro de la ficha ----------
function ensureGame(ch) {
  if (ch.g) { if (ch.g.epilogo && !ch.g.epilogos) ch.g.epilogos = { 1: ch.g.epilogo }; return ch; }
  const arma = ch.draft?.arma || "Espada";
  ch.g = { loc: { r: "alba", p: 0 }, day: 1, hour: 8, inv: { "Poción de vida": 2 }, arma: { n: arma, poder: WEAPONS[arma] || 10 },
    spells: [], puntosAtributo: 0, usedItems: {}, bossDone: {}, kills: {}, quests: [], story: {}, log: [], combat: null, flags: {}, questBoard: {} };
  return ch;
}
let G = null; // personaje activo (copia de trabajo)
let gtab = "lugar";
let gsel = { region: null, mode: "pie", freeText: "", busy: false, shop: false, board: false, trainAttr: "fuerza", err: "" };
function activeId() { try { return localStorage.getItem("sa-active"); } catch (e) { return null; } }
function setActive(id) { try { localStorage.setItem("sa-active", id); } catch (e) {} }
function startGame(id) {
  const ch = Store.all.find((c) => c.id === id && c.owner === Store.uid); if (!ch) return;
  G = ensureGame(JSON.parse(JSON.stringify(ch))); setActive(id);
  // Curva de XP nueva (2026-09-29): convierte la XP guardada al mismo porcentaje del nivel actual.
  if (!G.g.xpv) { G.xp = Math.round((G.xp || 0) * xpToNext(G.nivel) / xpToNextOld(G.nivel)); G.g.xpv = 2; persist(); }
  if ((G.hpv || 1) < 2) { G.hpv = 2; G.pvMax += 30 + 2 * (G.atributos.defensa || 0) + 2 * Math.max(0, G.nivel - 1); G.pv = G.pvMax; persist(); } view = { name: "game" }; gtab = G.g.combat ? "lugar" : gtab; render();
}
let saveTimer = null;
function persist() { G.updatedAt = Date.now(); G.lastSeen = Date.now(); Store.saveChar(G).catch(() => toast("No se pudo guardar el progreso.")); }
function log(t) { G.g.log = [...G.g.log.slice(-39), { d: G.g.day, h: Math.floor(G.g.hour), t, at: Date.now() }]; }
const attr = (k) => G.atributos[k] || 0;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// ---------- tiempo ----------
function advance(h) {
  const before = G.g.day * 24 + G.g.hour;
  G.g.hour += h;
  while (G.g.hour >= 24) { G.g.hour -= 24; G.g.day++; }
  const blocks = Math.floor((G.g.day * 24 + G.g.hour) / 6) - Math.floor(before / 6);
  if (blocks > 0 && G.manaMax > 0) G.mana = Math.min(G.manaMax, G.mana + Math.floor(G.manaMax * 0.1) * blocks);
}
const clockStr = () => `Día ${G.g.day}, ${String(Math.floor(G.g.hour)).padStart(2, "0")}:${String(Math.round((G.g.hour % 1) * 60)).padStart(2, "0")}`;

// ---------- efectos y progresión ----------
function gainXP(n) {
  if (!n) return;
  G.xp += Math.round(n);
  while (G.xp >= xpToNext(G.nivel)) {
    G.xp -= xpToNext(G.nivel); G.nivel++;
    G.puntosAfinidad = (G.puntosAfinidad || 0) + 1;
    let m = 0; if (G.afinidades.length) { m = d(100); if (G.afinidades.some((a) => a.abs)) m = Math.floor(m * 1.5); G.manaMax += m; G.mana += m; }
    G.pvMax += 5; G.pv = G.pvMax;
    if (G.nivel % 3 === 0) G.g.puntosAtributo++;
    if (G.nivel % 10 === 0) { G.energiaMax++; }
    log(`Subiste a nivel ${G.nivel}${m ? ` (+${m} de maná máximo)` : ""}.`);
    toast(`¡Nivel ${G.nivel}! +1 punto de afinidad${G.nivel % 3 === 0 ? " y +1 punto de atributo" : ""}.`);
  }
}
function addRayos(r, arena) {
  const human = G.raza === "Humano" ? 1.1 : 1;
  for (const [k, v] of Object.entries(r || {})) G.rayos[k] = Math.max(0, (G.rayos[k] || 0) + Math.round(v * (v > 0 ? human * raysMult(k, arena) : 1)));
  const total = Object.values(G.rayos).reduce((a, b) => a + b, 0);
  const pel = peldanoFor(total)[0];
  if (pel !== G.peldano) { G.peldano = pel; log(`Subiste al peldaño ${pel} de la Escalera del Alba.`); toast(`Peldaño ${pel} alcanzado.`); }
}
function addItem(n, q = 1) { G.g.inv[n] = (G.g.inv[n] || 0) + q; if (G.g.inv[n] <= 0) delete G.g.inv[n]; }
function raiseAttr(k) {
  G.atributos[k] = (G.atributos[k] || 0) + 1;
  if (k === "defensa") { const inc = Math.max(1, Math.floor(G.pvMax * 0.025)); G.pvMax += inc; G.pv += inc; }
  if (k === "inteligencia" && G.manaMax > 0) { const inc = Math.max(1, Math.floor(G.manaMax * 0.05)); G.manaMax += inc; G.mana += inc; }
}
function applyFx(fx = {}, story) {
  const out = [];
  if (fx.xp) { const x = story ? storyXP(fx.xp, G.nivel) : fx.xp; gainXP(x); out.push(`+${x} XP`); }
  if (fx.rayos) { addRayos(fx.rayos); for (const [k, v] of Object.entries(fx.rayos)) out.push(`${v > 0 ? "+" : ""}${v} Rayos de ${k}`); }
  if (fx.soles) { G.dinero.soles = Math.max(0, G.dinero.soles + fx.soles); out.push(`${fx.soles > 0 ? "+" : ""}${fx.soles} Soles`); }
  if (fx.pv) { G.pv = clamp(G.pv + fx.pv, 1, G.pvMax); out.push(`${fx.pv > 0 ? "+" : ""}${fx.pv} PV`); }
  if (fx.estres) { G.estres = clamp(G.estres + fx.estres, 0, 10); out.push(`${fx.estres > 0 ? "+" : ""}${fx.estres} Estrés`); }
  if (fx.energiaMax) { G.energiaMax += fx.energiaMax; G.energia += fx.energiaMax; out.push(`+${fx.energiaMax} Energía máxima`); }
  if (fx.item) { addItem(fx.item); out.push(`Objeto: ${fx.item}`); }
  if (fx.vinc) for (const [n, v] of Object.entries(fx.vinc)) { const x = G.vinculos.find((y) => y.nombre === n); if (x) x.valor = clamp((x.valor || 0) + v, -3, 3); else G.vinculos.push({ nombre: n, tipo: "Personaje", valor: v }); out.push(`Vínculo con ${n} ${v > 0 ? "+" : ""}${v}`); }
  if (fx.flag) G.g.flags[fx.flag] = true;
  return out;
}

// ---------- viajes ----------
function tripHours(to, mode) {
  const here = G.g.loc; const m = MODES[mode].mult;
  if (here.r === to.r) return (to.p === here.p ? 0 : Math.max(0.5, Math.abs(P[to.r][to.p].h - P[here.r][here.p].h))) * m * travelMult(mode, false);
  const rt = route(here.r, to.r, mode); const sea = rt.path.some((x) => x.sea);
  return (P[here.r][here.p].h * m + rt.hours + P[to.r][to.p].h * m) * travelMult(mode, sea);
}
function travel(to, mode) {
  if (G.g.combat) return;
  const h = tripHours(to, mode);
  const free = freeMounts();
  if (!free && mode === "caballo" && G.dinero.soles < 5) { toast("Alquilar un caballo cuesta 5 Soles."); return; }
  if (!free && mode === "caravana" && G.dinero.soles < 3) { toast("La caravana cuesta 3 Soles."); return; }
  if (!free && mode === "caballo") G.dinero.soles -= 5; if (!free && mode === "caravana") G.dinero.soles -= 3;
  dg().nextTrip = 1;
  const hpd = hoursPerDay(); const nights = Math.floor(h / hpd);
  advance(h + nights * (24 - hpd));
  G.g.loc = { ...to };
  const pl = PLACE_OF(to.r, to.p);
  log(`Viajaste a ${pl.n} (${regionName(to.r)}) en ${fmtH(h)}.`);
  gtab = "lugar"; gsel.shop = false; gsel.board = false;
  // encuentro en el camino
  if (h >= 8 && mode !== "caravana" && Math.random() < ambushChance()) {
    const cand = P[to.r].filter((p) => p.mon.length && parseLvl(p.lvl));
    if (cand.length) { const tp = cand.sort((a, b) => parseLvl(a.lvl)[0] - parseLvl(b.lvl)[0])[0]; startCombat(makeMonster(tp, to.r, false), "monster", `${to.r}:${P[to.r].indexOf(tp)}`, "¡Emboscada en el camino!"); }
  }
  persist(); render();
}

// ---------- combate ----------
function makeMonster(pl, r, boss) {
  const [a, b] = parseLvl(pl.lvl) || [G.nivel, G.nivel + 2];
  let lvl, name;
  if (boss) { lvl = +(pl.boss.match(/nivel (\d+)/)?.[1] || b); name = pl.boss.replace(/\s*\(.*\)/, ""); }
  else { lvl = a + Math.floor(Math.random() * (b - a + 1)); const opts = pl.mon.filter((m) => !/duelo/i.test(m)); name = (opts.length ? opts : ["Criatura salvaje"])[Math.floor(Math.random() * Math.max(1, opts.length))]; }
  const scale = 0.55; // un personaje (5.7)
  const pv = Math.round((boss ? 40 + 22 * lvl : 15 + 10 * lvl) * scale);
  return { n: name, lvl, pv, pvMax: pv, poder: boss ? 10 + 3 * lvl : 5 + 2 * lvl, def: boss ? Math.floor(lvl / 4) + 1 : Math.floor(lvl / 6), aff: REGION_AFF[r], boss, st: {} };
}
function startCombat(enemy, kind, placeKey, intro) {
  const c = { enemies: [enemy], kind, placeKey, log: [], round: 1, pst: { shield: 0, buff: 0, defend: false, st: {}, exposed: false, barrier: 0, forge: 0, grito: 0, velo: 0, asterDodge: blessed("aster", 75), nornaSave: blessed("norna", 75) } };
  if (blessed("solen", 25) && G.g.hour >= 6 && G.g.hour < 18) c.pst.barrier = Math.round(G.pvMax * 0.1);
  if (kind === "monster" && enemy.lvl >= 12 && Math.random() < 0.35) { const pl = P[placeKey.split(":")[0]][+placeKey.split(":")[1]]; c.enemies.push(makeMonster(pl, placeKey.split(":")[0], false)); }
  G.g.combat = c; gtab = "lugar";
  const pi = d(6) + attr("agilidad") + initBonus() + (G.raza === "Bestial" ? 1 : 0) - (["Enano", "Semigigante"].includes(G.raza) ? 1 : 0) + (blessed("kronea", 75) ? 99 : 0);
  const ei = d(6) + Math.floor(enemy.lvl / 5);
  clog(`${intro ? intro + " " : ""}${c.enemies.map((e) => `${e.n} (nivel ${e.lvl})`).join(" y ")} ${c.enemies.length > 1 ? "aparecen" : "aparece"}. Iniciativa: tú ${pi > 90 ? "primero (Kronea)" : pi}, enemigo ${ei}.${c.pst.barrier ? ` Escudo de luz: ${c.pst.barrier}.` : ""}`);
  if (ei > pi) { clog("El enemigo actúa primero."); enemyTurn(); }
}
function clog(t) { G.g.combat.log = [...G.g.combat.log.slice(-14), t]; }
function alive() { return G.g.combat.enemies.filter((e) => e.pv > 0); }
function playerStart() {
  const ps = G.g.combat.pst;
  if (ps.st.Quemado) { G.pv = Math.max(0, G.pv - 5); clog("Te quemas: −5 PV."); if (--ps.st.Quemado <= 0) delete ps.st.Quemado; }
  if (G.pv <= 0) return defeat();
}
function tryStatus(target, st, isPlayer) {
  if (isPlayer && statusImmune(st)) { clog(`Tu dios te protege del estado ${st}.`); return; }
  const res = isPlayer ? roll2d6().sum + (st === "Asustado" ? attr("voluntad") : attr("defensa")) : roll2d6().sum + Math.floor(target.lvl / 5);
  if (res >= 10) { clog(`${isPlayer ? "Resistes" : target.n + " resiste"} el estado ${st}.`); return; }
  const dur = { Quemado: 3, Aturdido: 1, Cegado: 2, Asustado: 2 }[st] || 1;
  const t = isPlayer ? G.g.combat.pst.st : target.st; t[st] = res >= 6 ? Math.max(1, Math.ceil(dur / 2)) : dur;
  clog(`${isPlayer ? "Quedas" : target.n + " queda"} ${st.toLowerCase()}.`);
}
function pAttack(ti, spell) {
  const c = G.g.combat; if (!c) return; const e = c.enemies[ti]; if (!e || e.pv <= 0) return;
  const ps = c.pst; let mode = ps.buff > 0 ? 1 : 0; if (ps.st.Cegado) mode = mode === 1 ? 0 : -1; if (ps.buff > 0) ps.buff--;
  if (!spell) {
    const fz = attr("fuerza") + ctxBonus("fuerza", ["arena", "duel"].includes(c.kind) ? "arena" : "combat");
    const wt = wTraits(G.g.arma.n); const r = rollX(mode); if (wt.includes("critica") && !r.crit) { const s = [...r.ds].sort((a, b) => b - a); if (s[0] >= 5 && s[1] >= 5) r.crit = true; }
    const tot = rollTotal(r, fz - (wt.includes("pesada") ? 1 : 0)); const tier = tierOf(tot);
    if (tier === "miss") { clog(`Atacas con ${G.g.arma.n}: ${r.ds.join("+")} ${sgn(fz)} = ${tot}. Fallas.`); ps.exposed = true; }
    else {
      let dmg = G.g.arma.poder + weaponBonus() + 2 * fz - 2 * e.def; dmg = Math.max(1, Math.round(dmg * affMult(WEAPON_AFF[G.g.arma.n], e.aff) * (r.crit ? 2 : 1) * dmgMult() + (r.crit && blessed("tharon", 25) ? 3 : 0)));
      e.pv = Math.max(0, e.pv - dmg); ps.exposed = tier === "mix";
      clog(`Atacas con ${G.g.arma.n}: ${r.ds.join("+")} ${sgn(fz)} = ${tot}. ${r.crit ? "¡Crítico! " : ""}${dmg} de daño${tier === "mix" ? ", pero quedas expuesto" : ""}.`);
      if (wt.includes("doble") && e.pv > 0) { const d2 = Math.max(1, Math.round(dmg / 2)); e.pv = Math.max(0, e.pv - d2); clog(`Segundo golpe: ${d2} de daño.`); }
      if (wt.includes("aturde") && e.pv > 0 && Math.random() < 0.25) { e.st.Aturdido = 1; clog(`${e.n} queda aturdido.`); }
    }
  } else {
    const sp = spell; const dom = G.afinidades.find((a) => a.n === sp.aff)?.dominio || 0;
    let over = 0; const cost = spellCost(sp); c.usedAff = sp.aff;
    if (G.mana < cost) { const falta = cost - G.mana; over = Math.ceil(falta / 50); if (G.energia < over) { toast("No tienes maná ni Energía suficientes."); return; } G.energia -= over; G.mana = 0; mode = mode === 1 ? 0 : -1; clog(`Sobrecarga: pagas ${over} de Energía.`); }
    else G.mana -= cost;
    const r = rollX(mode); const tot = rollTotal(r, dom); const tier = tierOf(tot, true);
    if (tier === "miss") { G.pv = Math.max(0, G.pv - 5); clog(`${sp.n}: ${r.ds.join("+")} ${sgn(dom)} = ${tot}. Falla y rebota: −5 PV.`); if (G.pv <= 0) return defeat(); }
    else {
      if (tier === "mix") { const extra = Math.ceil(cost / 2); if (G.mana >= extra) G.mana -= extra; else G.estres = Math.min(10, G.estres + 1); }
      let txt = `${sp.n}: ${r.ds.join("+")} ${sgn(dom)} = ${tot}${tier === "mix" ? " (con costo)" : ""}.`;
      if (sp.kind === "dmg") { let dmg = sp.val + 2 * dom - 2 * e.def; dmg = Math.max(1, Math.round(dmg * affMult(sp.aff, e.aff) * (r.crit ? 2 : 1) * dmgMult() + (r.crit && blessed("tharon", 25) ? 3 : 0))); e.pv = Math.max(0, e.pv - dmg); txt += ` ${dmg} de daño${affMult(sp.aff, e.aff) > 1 ? " (¡súper eficaz!)" : affMult(sp.aff, e.aff) < 1 ? " (poco eficaz)" : ""}.`; }
      if (sp.kind === "heal") { const h = Math.min(G.pvMax - G.pv, Math.round(sp.val * (blessed("lumina", 75) ? 1.25 : 1))); G.pv += h; txt += ` Recuperas ${h} PV.`; }
      if (sp.kind === "shield") { ps.shield = sp.val; txt += ` Escudo durante ${sp.val} turnos.`; }
      if (sp.kind === "buff") { ps.buff += sp.val; txt += ` Ventaja en tus próximas ${sp.val} tiradas.`; }
      clog(txt);
      if (sp.st && e.pv > 0 && (sp.kind === "status" || Math.random() < 0.5)) tryStatus(e, sp.st, false);
    }
  }
  afterPlayer();
}
function pDefend() { const c = G.g.combat; c.pst.defend = true; clog("Te pones en guardia: recibirás la mitad del daño."); afterPlayer(); }
function pItem(n) {
  const it = SHOP.find((s) => s.n === n); if (!it || !G.g.inv[n]) return;
  addItem(n, -1);
  if (it.kind === "potion") { const h = Math.min(G.pvMax - G.pv, it.val); G.pv += h; }
  if (it.kind === "mana") G.mana = Math.min(G.manaMax, G.mana + it.val);
  if (it.kind === "energy") G.energia = Math.min(G.energiaMax, G.energia + it.val);
  if (G.g.combat) { clog(`Usas ${n}.`); afterPlayer(); } else { toast(`Usaste ${n}.`); persist(); render(); }
}
function pFlee() {
  const c = G.g.combat; const r = roll2d6(c.pst.fleeAdv ? 1 : 0); const tot = r.sum + attr("agilidad") - (c.enemies.some((e) => e.boss) ? 2 : 0);
  if (tot >= 7) { log(`Huiste de ${c.enemies[0].n}.`); G.g.combat = null; toast("Escapaste."); persist(); render(); return; }
  clog(`Intentas huir (${tot}) pero no lo logras.`); afterPlayer();
}
function afterPlayer() {
  const c = G.g.combat;
  if (!alive().length) return victory();
  enemyTurn();
  if (!G.g.combat) return;
  c.round++; playerStart();
  persist(); render();
}
function enemyTurn() {
  const c = G.g.combat; const ps = c.pst;
  for (const e of alive()) {
    const acts = e.boss ? 2 : 1;
    for (let k = 0; k < acts; k++) {
      if (e.st.Quemado) { e.pv = Math.max(0, e.pv - 5); clog(`${e.n} se quema: −5 PV.`); if (--e.st.Quemado <= 0) delete e.st.Quemado; if (e.pv <= 0) break; }
      if (e.st.Aturdido) { clog(`${e.n} está aturdido y pierde el turno.`); delete e.st.Aturdido; continue; }
      let mode = ps.exposed ? 1 : 0; if (e.st.Cegado) { mode = mode === 1 ? 0 : -1; if (--e.st.Cegado <= 0) delete e.st.Cegado; }
      if (ps.velo > 0) mode = mode === 1 ? 0 : -1;
      const r = roll2d6(mode); const tot = r.sum + Math.floor(e.lvl / 5); const tier = tierOf(tot);
      if (tier === "miss") { clog(`${e.n} ataca y falla.`); continue; }
      if (ps.asterDodge) { ps.asterDodge = false; clog(`Aster abre un umbral: el ataque de ${e.n} pasa de largo.`); continue; }
      if (blessed("zefira", 75) && d(6) === 6) { clog(`Una ráfaga de Zefira desvía el ataque de ${e.n}.`); continue; }
      let dmg = e.poder - 2 * (attr("defensa") + defBonus()); if (tier === "mix") dmg /= 2; if (r.crit) dmg *= 2;
      if (e.st.Asustado) { dmg /= 2; if (--e.st.Asustado <= 0) delete e.st.Asustado; }
      if (ps.defend) dmg /= 2; if (ps.shield > 0) dmg /= 2;
      dmg = Math.max(1, Math.round(dmg));
      let absorbed = 0; if (ps.barrier > 0) { absorbed = Math.min(ps.barrier, dmg); ps.barrier -= absorbed; dmg -= absorbed; }
      G.pv = Math.max(0, G.pv - dmg);
      if (G.pv <= 0 && ps.nornaSave) { ps.nornaSave = false; G.pv = 1; clog("El hilo de Norna no se corta: quedas a 1 PV."); }
      clog(`${e.n} te golpea: ${dmg} de daño${absorbed ? ` (el escudo absorbe ${absorbed})` : ""}${r.crit ? " (crítico)" : ""}.`);
      if (e.boss && Math.random() < 0.3) { const st = { Fuego: "Quemado", Rayo: "Aturdido", Sombra: "Asustado", Luz: "Cegado" }[e.aff]; if (st) tryStatus(null, st, true); }
      if (G.pv <= 0) return defeat();
    }
  }
  ps.exposed = false; ps.defend = false; if (ps.shield > 0) ps.shield--; if (ps.velo > 0) ps.velo--; if (ps.grito > 0) ps.grito--;
  if (ps.st.Cegado && --ps.st.Cegado <= 0) delete ps.st.Cegado;
  if (ps.st.Aturdido) { delete ps.st.Aturdido; clog("Estás aturdido y pierdes el turno."); enemyTurn(); }
  if (ps.st.Asustado && --ps.st.Asustado <= 0) delete ps.st.Asustado;
}
function xpFor(e) {
  let xp = (e.boss ? 60 : 10) * e.lvl; // jefe ≈ 6 monstruos (ajustado con la nueva curva de XP)
  // curva suave: −10% por nivel por debajo (mín. 25%), +10% por nivel por encima (máx. +50%)
  const diff = e.lvl - G.nivel; xp *= diff >= 0 ? 1 + Math.min(diff, 5) * 0.1 : Math.max(0.25, 1 + diff * 0.1);
  return Math.round(xp);
}
function victory() {
  const c = G.g.combat; const [r, pi] = c.placeKey.split(":"); const pl = P[r][+pi];
  let xp = 0, soles = 0; const loot = [];
  for (const e of c.enemies) {
    xp += xpFor(e); soles += e.boss ? e.lvl * 10 : e.lvl * 2;
    G.g.kills[c.placeKey] = (G.g.kills[c.placeKey] || 0) + 1;
    if (e.avatar) { addRayos({ poder: e.lvl, fama: 5 }); continue; }
    if (e.god) liberate(e.god);
    if (e.story) { G.g.flags[`jefe_${e.story}`] = true; addRayos({ poder: e.lvl, fama: 15 }); continue; }
    if (e.god) { addRayos({ poder: e.lvl, fama: 20 }); continue; }
    if (e.boss) {
      G.g.bossDone[c.placeKey] = G.g.day;
      for (const o of pl.obj) loot.push(cleanItem(o));
      addRayos({ poder: e.lvl, fama: 10 });
    } else {
      const commons = pl.obj.filter((o) => !/\(\+1|legendario|muy rara/i.test(o));
      if (commons.length && Math.random() < 0.6) loot.push(cleanItem(commons[Math.floor(Math.random() * commons.length)]));
    }
  }
  if (c.kind === "duel") { addRayos({ poder: 10 }); soles = 0; loot.length = 0; }
  if (c.kind === "arena") { addRayos({ poder: 10, fama: 10 }, true); soles += 15; }
  if (c.kind === "avatar") soles = 0; if (c.kind === "story" || c.kind === "corrupt") soles = Math.round(soles / 2);
  onVictoryGods(c);
  loot.forEach((l) => addItem(l));
  G.dinero.soles += soles;
  const names = c.enemies.map((e) => e.n).join(" y ");
  G.g.combat = null;
  log(`Derrotaste a ${names}: +${xp} XP, +${soles} Soles${loot.length ? ", " + loot.join(", ") : ""}.`);
  gainXP(xp);
  G.g.lastResult = { title: `Victoria contra ${names}`, lines: [`+${xp} XP`, `+${soles} Soles`, ...loot.map((l) => "Obtienes: " + l)] };
  persist(); render();
}
function defeat() {
  const c = G.g.combat; const lost = Math.floor(G.dinero.soles * 0.1);
  G.dinero.soles -= lost; G.pv = 1; G.estres = Math.min(10, G.estres + 2);
  G.g.loc = { r: G.g.loc.r, p: 0 }; G.g.combat = null;
  log(`Caíste ante ${c.enemies[0].n}. Despiertas en ${P[G.g.loc.r][0].n} con 1 PV y ${lost} Soles menos.`);
  G.g.lastResult = { title: "Derrota", lines: [`Despiertas en ${P[G.g.loc.r][0].n} con 1 PV.`, `Pierdes ${lost} Soles.`, "+2 Estrés"] };
  onAvatarLoss(c);
  persist(); render();
}

// ---------- acciones de lugar ----------
const HUB_TYPES = ["pueblo", "ciudad", "puerto"];
function needEnergy(n) { if (G.energia < n) { toast("No tienes Energía suficiente: descansa en una posada."); return false; } G.energia -= n; return true; }
function explore() {
  if (G.g.combat || !needEnergy(1)) return;
  const pl = PLACE_OF(G.g.loc.r, G.g.loc.p); advance(2);
  const sb = attr("sabiduria") + ctxBonus("sabiduria", "explore");
  const r = rollX(); const tot = rollTotal(r, sb); const tier = tierOf(tot);
  const w = weatherFor(G.g.loc.r, G.g.day); const reg = R.find((x) => x.id === G.g.loc.r);
  const commons = pl.obj.filter((o) => !/\(\+1|legendario|muy rara|Premios|Puntos|Posada|Tienda|mercado|Barcos|Entrenamiento|Forja|Fabricar|Castillo|Tablón|Encantamientos|Pergamino de Reasignación|Establos|Caravanas|Romper|Pociones prohibidas|Refugio|Barca|Uniforme|Libros de hechizos|arquero/i.test(o));
  const found = [];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  if (tier !== "miss") {
    if (commons.length) found.push(cleanItem(pick(commons)));
    const wx = reg.wx[w] || []; if (wx.length && (tier === "hit" || Math.random() < 0.5)) found.push(cleanItem(pick(wx)));
    if (tier === "hit") { const rare = pl.obj.filter((o) => /\(\+1/.test(o) && !/^Esencia/.test(o)); if (rare.length && Math.random() < 0.08) found.push(cleanItem(pick(rare))); if (r.crit && reg.fixed.length) found.push(pick(reg.fixed)); }
    if (found.length && blessed("genna", 25)) found.push(found[0]);
    found.forEach((f) => addItem(f));
  }
  const lines = [`Tirada: ${r.ds.join("+")}${r.plus ? " +1" : ""} ${sgn(sb)} = ${tot} · ${TIER[tier]}`];
  lines.push(found.length ? "Encuentras: " + found.join(", ") : "No encuentras nada útil.");
  log(`Exploraste ${pl.n}: ${found.length ? found.join(", ") : "nada"}.`);
  addRayos({ saber: tier === "hit" ? 3 : 1 }); gainXP(5 * Math.max(1, (parseLvl(pl.lvl) || [G.nivel])[0]));
  G.g.lastResult = { title: `Explorando ${pl.n}`, lines };
  const fight = pl.mon.length && parseLvl(pl.lvl) && !/Duelos|Ladrones$/.test(pl.mon.join()) && (tier === "miss" ? 0.6 : tier === "mix" ? 0.35 : 0.1) > Math.random();
  if (fight) startCombat(makeMonster(pl, G.g.loc.r, false), "monster", `${G.g.loc.r}:${G.g.loc.p}`, "Mientras exploras, algo te ataca.");
  persist(); render();
}
function fight(kind) {
  if (G.g.combat || !needEnergy(1)) return;
  const pl = PLACE_OF(G.g.loc.r, G.g.loc.p); const key = `${G.g.loc.r}:${G.g.loc.p}`;
  if (kind === "boss") return startCombat(makeMonster(pl, G.g.loc.r, true), "boss", key, "El jefe te enfrenta."), persist(), render();
  if (kind === "duel") { const lvl = Math.max(1, G.nivel); const e = { n: ["Darius Valcor", "Seraphina Lux", "Thorne Colmillo", "Garrok Piedraluna"][d(4) - 1], lvl, pv: Math.round((15 + 10 * lvl) * 0.8), pvMax: Math.round((15 + 10 * lvl) * 0.8), poder: 5 + 2 * lvl, def: 0, aff: null, boss: false, st: {} }; startCombat(e, "duel", key, "Duelo de práctica."); persist(); render(); return; }
  if (kind === "arena") { const [a, b] = parseLvl(pl.lvl); const lvl = clamp(G.nivel + d(3) - 1, a, b); const e = { n: "Luchador de la arena", lvl, pv: Math.round((15 + 10 * lvl) * 0.6), pvMax: Math.round((15 + 10 * lvl) * 0.6), poder: 5 + 2 * lvl, def: Math.floor(lvl / 6), aff: null, boss: false, st: {} }; startCombat(e, "arena", key, "¡Combate en la arena!"); persist(); render(); return; }
  startCombat(makeMonster(pl, G.g.loc.r, false), "monster", key, ""); persist(); render();
}
function rest() {
  const cost = blessed("brasa", 25) ? 0 : 2; if (G.dinero.soles < cost) { toast("La posada cuesta 2 Soles."); return; }
  G.dinero.soles -= cost; advance(8);
  G.pv = G.pvMax; G.energia = G.energiaMax; G.mana = G.manaMax; G.estres = Math.max(0, G.estres - (blessed("brasa", 75) ? 4 : 2));
  if (blessed("nyssa", 75)) G.estres = 0; if (blessed("brasa", 75)) addRayos({ corazon: 2 });
  log(`Descansaste en ${PLACE_OF(G.g.loc.r, G.g.loc.p).n}.`);
  G.g.lastResult = { title: "Descansaste 8 horas", lines: ["PV, Energía y maná al máximo", "Menos Estrés", cost ? "−2 Soles" : "Gratis gracias a Brasa"] };
  persist(); render();
}
function meditate() { advance(4); G.mana = G.manaMax; G.estres = Math.max(0, G.estres - 2); log("Meditaste en el santuario."); G.g.lastResult = { title: "Meditaste 4 horas", lines: ["Maná al máximo", "−2 Estrés"] }; persist(); render(); }
function studyClass() {
  const dd = dg(); if (dd.freeClass) dd.freeClass = false; else if (!needEnergy(1)) return; advance(4);
  const ib = attr("inteligencia") + ctxBonus("inteligencia", "class");
  const r = rollX(); const tot = rollTotal(r, ib); const tier = tierOf(tot);
  const rs = { hit: 30, mix: 15, miss: -10 }[tier]; addRayos({ saber: rs }); gainXP(10 * G.nivel);
  log(`Clase en la academia: ${TIER[tier]} (${rs > 0 ? "+" : ""}${rs} Rayos de Saber).`);
  G.g.lastResult = { title: "Clase y examen", lines: [`Tirada: ${r.ds.join("+")}${r.plus ? " +1" : ""} ${sgn(ib)} = ${tot} · ${TIER[tier]}`, `${rs > 0 ? "+" : ""}${rs} Rayos de Saber`, `+${10 * G.nivel} XP`] };
  persist(); render();
}
function train() {
  if (!needEnergy(2)) return; advance(4);
  const k = gsel.trainAttr; const r = rollX(); const tot = rollTotal(r, attr(k)); const tier = tierOf(tot);
  const lines = [`Tirada de ${ATTR_NAME[k]}: ${r.ds.join("+")} ${sgn(attr(k))} = ${tot} · ${TIER[tier]}`];
  addRayos({ poder: tier === "hit" ? 10 : 5 }); gainXP(8 * G.nivel); lines.push(`+${tier === "hit" ? 10 : 5} Rayos de Poder`, `+${8 * G.nivel} XP`);
  if ((k === "defensa" || k === "agilidad") && d(100) >= 76) { G.energiaMax++; G.energia++; lines.push("¡+1 Energía máxima!"); }
  log(`Entrenaste ${ATTR_NAME[k]}.`); G.g.lastResult = { title: "Entrenamiento", lines }; persist(); render();
}
function buy(n) {
  const it = SHOP.find((s) => s.n === n); if (!it) return;
  const disc = Object.values(G.rayos).reduce((a, b) => a + b, 0) >= 150 ? 0.9 : 1; const price = Math.ceil(it.precio * disc * shopMult() * (G.trasfondo === "Mercader ambulante" ? 0.9 : 1));
  if (G.dinero.soles < price) { toast("No tienes Soles suficientes."); return; }
  G.dinero.soles -= price;
  if (it.kind === "weapon") { G.g.arma = { n: it.n, poder: WEAPONS[it.n] }; log(`Compraste y equipaste ${it.n}.`); toast(`Equipaste ${it.n}.`); }
  else { addItem(it.n); toast(`Compraste ${it.n}.`); }
  persist(); render();
}
function sellPrice(n) { if (SHOP.find((s) => s.n === n)) return 0; if (ATTR_ITEMS[n]) return 25; return 2; }
function sell(n) { let p = sellPrice(n); if (!p || !G.g.inv[n]) return; if (dg().nextSale) { p = Math.ceil(p * 1.5); dg().nextSale = false; } addItem(n, -1); G.dinero.soles += p; toast(`Vendiste ${n} por ${p} Soles.`); persist(); render(); }
function useAttrItem(n, pickAttr) {
  const a = ATTR_ITEMS[n]; if (!a || !G.g.inv[n]) return;
  if (G.g.usedItems[n]) { toast("Ese objeto solo funciona una vez por personaje."); return; }
  const k = a[0] === "elegir" ? pickAttr : a[0]; if (!k) return;
  addItem(n, -1); G.g.usedItems[n] = true; raiseAttr(k); log(`Usaste ${n}: +1 ${ATTR_NAME[k]}.`); toast(`+1 ${ATTR_NAME[k]}`); persist(); render();
}

// ---------- misiones del tablón ----------
function boardFor(r, day) {
  const key = `${r}:${day}`; if (G.g.questBoard[key]) return G.g.questBoard[key];
  const places = P[r].map((p, i) => ({ p, i })).filter((x) => x.p.mon.length && parseLvl(x.p.lvl) && !/Duelos/.test(x.p.mon.join()));
  const out = [];
  places.slice(0, 3).forEach(({ p, i }, k) => {
    const n = 2 + ((hash(key + k) % 3));
    const lvl = parseLvl(p.lvl)[0];
    out.push({ id: `${key}:${k}`, t: `Derrota ${n} criaturas en ${p.n}`, place: `${r}:${i}`, need: n, soles: 10 * n + lvl * 2, xp: 30 * lvl, fama: 20 });
  });
  G.g.questBoard = { [key]: out }; return out;
}
function acceptQuest(q) { if (G.g.quests.some((x) => x.id === q.id)) return; G.g.quests.push({ ...q, start: G.g.kills[q.place] || 0 }); log(`Aceptaste la misión: ${q.t}.`); toast("Misión aceptada."); persist(); render(); }
function questProgress(q) { return Math.min(q.need, (G.g.kills[q.place] || 0) - q.start); }
function turnIn(id) {
  const q = G.g.quests.find((x) => x.id === id); if (!q || questProgress(q) < q.need) return;
  G.g.quests = G.g.quests.filter((x) => x.id !== id);
  const qs = Math.round(q.soles * (blessed("aurum", 75) ? 1.2 : 1)); G.dinero.soles += qs; addRayos({ fama: q.fama }); gainXP(q.xp);
  let extra = ""; if (d(100) >= 51) { G.puntosAfinidad++; extra = " y +1 punto de afinidad"; }
  log(`Completaste: ${q.t} (+${qs} Soles, +${q.xp} XP${extra}).`); toast(`Misión completada${extra}.`); persist(); render();
}

// ---------- magia ----------
function learnSpell(aff, name) {
  const sp = spellInfo(aff, name); const a = G.afinidades.find((x) => x.n === aff); if (!sp || !a) return;
  if (G.g.spells.some((s) => s.n === name)) return;
  if (a.dominio < sp.c - 1) { toast(`Necesitas Dominio ${sgn(sp.c - 1)} en ${aff}.`); return; }
  const pc = Math.max(1, sp.c - (blessed("ruen", 75) ? 1 : 0));
  if ((G.puntosAfinidad || 0) < pc) { toast(`Necesitas ${pc} puntos de afinidad.`); return; }
  G.puntosAfinidad -= pc; G.g.spells.push({ aff, n: name }); log(`Aprendiste ${name}.`); toast(`Aprendiste ${name}.`); persist(); render();
}
function raiseDominio(aff) {
  const a = G.afinidades.find((x) => x.n === aff); if (!a) return;
  if (a.dominio >= 3) { toast("Dominio máximo al crear el personaje: +3. Más adelante habrá entrenamientos especiales."); return; }
  if ((G.puntosAfinidad || 0) < 3) { toast("Necesitas 3 puntos de afinidad."); return; }
  G.puntosAfinidad -= 3; a.dominio++; log(`Tu Dominio en ${aff} sube a ${sgn(a.dominio)}.`); persist(); render();
}

// ---------- historia (mundo compartido) ----------
function worldCap() { return Store.world?.cap || 1; }
function chapter() { return STORY.find((s) => s.cap === worldCap()); }
function storyChoice(i) {
  const ch = chapter(); if (!ch || G.g.story[ch.cap]) return;
  const c = ch.choices[i]; const sm = attr(c.stat) + ctxBonus(c.stat, "story"); const adv = c.adv && G.g.flags[c.adv]; const r = rollX(adv ? 1 : 0); const tot = rollTotal(r, sm + (RISK_MOD[c.risk] || 0)); const tier = tierOf(tot);
  const o = c.out[tier]; const fx = applyFx(o.fx, true);
  G.g.story[ch.cap] = { l: c.l, tier, text: o.t, roll: `${r.ds.join("+")}${r.plus ? " +1" : ""} ${sgn(sm)} = ${tot}${adv ? " (con ventaja)" : ""}`, fx };
  log(`Capítulo ${ch.cap}: ${c.l} → ${TIER[tier]}. ${o.t}`);
  advance(3); persist(); render();
}
async function freeAction(ctx) {
  const txt = gsel.freeText.trim(); if (!txt || !Store.sample || gsel.busy) return;
  gsel.busy = true; gsel.err = ""; render();
  const pl = PLACE_OF(G.g.loc.r, G.g.loc.p);
  const context = ctx === "story" ? `Capítulo ${chapter().cap}, "${chapter().t}": ${chapter().text.join(" ")}` : `Lugar: ${pl.n} (${regionName(G.g.loc.r)}). ${pl.note || ""} Monstruos: ${pl.mon.join(", ") || "ninguno"}.`;
  const prompt = `Eres el narrador de un juego de rol de fantasía en español: Solvaria, donde está Sunrise Academy. El sol se apaga lentamente (el Ocaso) y la Orden del Crepúsculo conspira. Arbitra una acción libre.
${context}
Personaje: ${G.nombre}, ${G.raza} ${G.sub || ""}, nivel ${G.nivel}${G.descripcion ? ". Aspecto: " + G.descripcion : ""}. Arma: ${G.g.arma.n}. Atributos: ${ATTRS.map(([k, n]) => `${n} ${sgn(attr(k))}`).join(", ")}. Afinidades: ${G.afinidades.map((a) => a.n).join(", ") || "ninguna"}.
Acción: "${txt.slice(0, 500)}"
Elige el atributo que la acción usa (fuerza, agilidad, defensa, inteligencia, sabiduria, carisma, voluntad o suerte) y el riesgo (Bajo, Moderado, Alto). Escribe 3 desenlaces de 1-2 frases en segunda persona: exito, parcial (con costo) y fallo. Efectos enteros opcionales por desenlace: pv (-15 a 5), soles (-10 a 15), estres (-1 a 2), rayos {poder|saber|corazon|fama: 0 a 15}.
Responde SOLO JSON: {"atributo":"carisma","riesgo":"Bajo","exito":{"texto":"...","efectos":{"rayos":{"corazon":10}}},"parcial":{"texto":"...","efectos":{}},"fallo":{"texto":"...","efectos":{"estres":1}}}`;
  try {
    const res = await Store.sample.json(prompt, { modelTier: "default", cache: false });
    const k = ATTRS.some(([x]) => x === res?.atributo) ? res.atributo : "voluntad";
    const fm = attr(k) + ctxBonus(k, ctx === "story" ? "story" : "free"); const r = rollX(); const tot = rollTotal(r, fm); const tier = tierOf(tot);
    const b = res?.[{ hit: "exito", mix: "parcial", miss: "fallo" }[tier]] || {};
    const e = b.efectos || {}; const fx = { pv: clamp(Math.round(+e.pv || 0), -15, 5), soles: clamp(Math.round(+e.soles || 0), -10, 15), estres: clamp(Math.round(+e.estres || 0), -1, 2), rayos: {}, xp: 10 * G.nivel };
    for (const p of ["poder", "saber", "corazon", "fama"]) { const v = clamp(Math.round(+e.rayos?.[p] || 0), 0, 15); if (v) fx.rayos[p] = v; }
    const lines = applyFx(fx); advance(2);
    const text = String(b.texto || "No pasa nada especial.").slice(0, 600);
    if (ctx === "story" && !G.g.story[chapter().cap]) G.g.story[chapter().cap] = { l: txt.slice(0, 120), tier, text, roll: `${r.ds.join("+")} ${sgn(fm)} = ${tot}`, fx: lines };
    G.g.lastResult = { title: `Acción libre (${ATTR_NAME[k]})`, lines: [`Tirada: ${r.ds.join("+")} ${sgn(fm)} = ${tot} · ${TIER[tier]}`, text, ...lines] };
    log(`Acción libre: ${txt.slice(0, 80)} → ${TIER[tier]}.`);
    gsel.freeText = ""; persist();
  } catch (e) { gsel.err = e?.code === "not_granted" ? "Sin permiso para usar la IA." : "La IA no respondió. Inténtalo otra vez."; }
  gsel.busy = false; render();
}
function playersInGame() { return [...new Set(Store.all.map((c) => c.owner))]; }
async function vote(opt) {
  const ch = chapter(); if (!ch || !Store.world) return;
  await Store.setVote(ch.cap, opt);
  setTimeout(() => tryCloseVote(false), 500);
}
async function tryCloseVote(force) {
  const ch = chapter(); if (!ch || !Store.world) return;
  const votes = Store.world.votes?.[ch.cap] || {}; const players = playersInGame();
  if (!force && players.some((u) => !votes[u])) return;
  const counts = {}; ch.vote.options.forEach((o) => (counts[o.id] = 0)); Object.values(votes).forEach((v) => { if (v in counts) counts[v]++; });
  const best = ch.vote.options.reduce((a, o) => (counts[o.id] > counts[a.id] ? o : a), ch.vote.options[0]);
  const bonus = solenLight();
  await Store.closeChapter(ch.cap, bonus ? { ...best, fx: { ...(best.fx || {}), luz: ((best.fx || {}).luz || 0) + bonus } } : best, counts);
}

// ---------- vistas ----------
function bar(v, m, cls) { const pct = m ? clamp((v / m) * 100, 0, 100) : 0; return `<span class="bar ${cls}"><i style="width:${pct}%"></i></span>`; }
function hud() {
  const pl = PLACE_OF(G.g.loc.r, G.g.loc.p); const w = weatherFor(G.g.loc.r, G.g.day);
  return `<div class="hud">
    <div class="who">${raceImg(G.raza, "rimg hud-img")}<b>${esc(G.nombre)}</b><small>Nivel ${G.nivel} · ${esc(G.raza)} · ${esc(G.peldano)}</small>
      <small>XP ${G.xp} / ${xpToNext(G.nivel)} ${bar(G.xp, xpToNext(G.nivel), "xp")}</small></div>
    <div class="meters">
      <span>PV ${G.pv}/${G.pvMax} ${bar(G.pv, G.pvMax, "pv")}</span>
      <span>Maná ${G.mana}/${G.manaMax} ${bar(G.mana, G.manaMax, "mn")}</span>
      <span>Energía ${G.energia}/${G.energiaMax} ${bar(G.energia, G.energiaMax, "en")}</span>
      <span>Estrés ${G.estres}/10</span><span>☀ ${G.dinero.soles} Soles</span>
    </div>
    <div class="where">📍 ${esc(pl.n)}, ${esc(regionName(G.g.loc.r))}<br>🕰️ ${clockStr()} · ${CLIMAS[w].icon} ${esc(w)}</div>
  </div>`;
}
const TABS = [["lugar", "Lugar"], ["mapa", "Mapa"], ["historia", "Historia"], ["heroe", "Personaje"], ["magia", "Magia"], ["dioses", "Dioses"], ["bolsa", "Bolsa"], ["escalera", "Escalera"], ["grupo", "Grupo"]];
function gameView() {
  if (!G) return homeView();
  const body = G.g.combat ? combatView() : { lugar: placeView, mapa: mapView, historia: storyView, heroe: heroView, magia: magicView, dioses: diosesView, bolsa: bagView, escalera: ladderView, grupo: groupView }[gtab]();
  return `<div class="gtop"><button type="button" class="link" id="home">← Personajes</button></div>
    ${hud()}
    ${G.g.combat ? "" : `<nav class="gtabs">${TABS.map(([k, n]) => `<button type="button" data-gtab="${k}" class="${gtab === k ? "on" : ""}">${n}${k === "historia" && chapter() && !G.g.story[chapter().cap] ? " •" : ""}${k === "heroe" && G.g.puntosAtributo ? " •" : ""}${k === "magia" && G.puntosAfinidad ? " •" : ""}</button>`).join("")}</nav>`}
    <section class="panel">${body}</section>`;
}
function resultBox() {
  const r = G.g.lastResult; if (!r) return "";
  return `<div class="result"><div class="row between"><b>${esc(r.title)}</b><button type="button" class="link" data-g="clearres">Cerrar</button></div>${r.lines.map((l) => `<div>${esc(l)}</div>`).join("")}</div>`;
}
function placeView() {
  const { r, p } = G.g.loc; const pl = PLACE_OF(r, p); const key = `${r}:${p}`;
  const acts = [];
  const lv = parseLvl(pl.lvl);
  const fightable = pl.mon.length && lv && !/Duelos|Ladrones$|Premios/.test(pl.mon.join());
  if (fightable || pl.t === "zona" || pl.t === "mina") acts.push(["explore", "🔎 Explorar y recolectar", "2 h · 1 Energía · tirada de Sabiduría"]);
  if (fightable && pl.t !== "arena") acts.push(["fight", "⚔️ Buscar pelea", `1 Energía · monstruos de nivel ${pl.lvl}`]);
  if (pl.boss && !/aparece al azar/.test(pl.boss)) acts.push(bossDown(key) ? ["", `💀 ${pl.boss.replace(/\s*\(.*\)/, "")} ya fue derrotado`, `Vuelve el día ${bossBack(key)}`] : ["boss", `💀 Enfrentar a ${pl.boss}`, "1 Energía · recompensa especial"]);
  if (pl.boss && /aparece al azar/.test(pl.boss) && !bossDown(key) && G.g.day % 3 === 0) acts.push(["boss", `🐈 ¡${pl.boss.replace(/\s*\(.*\)/, "")} apareció!`, "Solo hoy"]);
  if (pl.t === "arena") acts.push(["arena", "⚔️ Combatir en la arena", "1 Energía · Rayos de Poder y Fama"]);
  if (pl.t === "academia") { acts.push(["class", "📚 Ir a clase y examen", "4 h · 1 Energía · Rayos de Saber"]); acts.push(["duel", "🤺 Duelo de práctica", "1 Energía · Rayos de Poder"]); }
  if (pl.t === "academia" || /Entrenamiento|entrena/i.test((pl.obj.join(" ") + (pl.note || "")))) acts.push(["train", "💪 Entrenar", "4 h · 2 Energía"]);
  if (HUB_TYPES.includes(pl.t) || pl.t === "academia") acts.push(["rest", "🛏️ Descansar en la posada", "8 h · 2 Soles · todo al máximo"]);
  if (pl.t === "santuario") acts.push(["meditate", "✨ Meditar", "4 h · maná al máximo, −2 Estrés"]);
  if (HUB_TYPES.includes(pl.t) || pl.t === "tienda") { acts.push(["shop", "🛒 Tienda", "Comprar y vender"]); }
  if (HUB_TYPES.includes(pl.t)) acts.push(["board", "📜 Tablón de misiones", "Misiones de la región"]);
  const shop = gsel.shop ? shopView() : ""; const board = gsel.board ? boardView() : "";
  return `${resultBox()}
    <div class="row between"><h2>${T[pl.t].icon} ${esc(pl.n)}</h2><span class="pill">${esc(T[pl.t].name)} · nivel ${esc(pl.lvl)}</span></div>
    ${pl.note ? `<p class="lead">${esc(pl.note)}</p>` : ""}
    <p class="muted">${pl.mon.length ? "Monstruos: " + esc(pl.mon.join(", ")) + " · " : ""}Se consigue: ${esc(pl.obj.join(", "))}</p>
    <div class="acts">${acts.map(([a, l, s]) => `<button type="button" class="act" ${a ? `data-g="${a}"` : "disabled"}><b>${esc(l)}</b><small>${esc(s)}</small></button>`).join("")}</div>
    ${acts.some((a) => a[0] === "train") ? `<label class="f">Atributo a entrenar <select id="g-train">${["fuerza", "agilidad", "defensa", "voluntad"].map((k) => `<option value="${k}" ${gsel.trainAttr === k ? "selected" : ""}>${ATTR_NAME[k]}</option>`).join("")}</select></label>` : ""}
    ${shop}${board}
    ${templeBlock(r, p)}
    <h3 class="sub">Otros lugares de ${esc(regionName(r))}</h3>
    <div class="places">${P[r].map((x, i) => i === p ? "" : `<button type="button" class="pl" data-go="${r}:${i}"><span>${T[x.t].icon} ${esc(x.n)}</span><small>${esc(fmtH(tripHours({ r, p: i }, "pie")))} a pie</small></button>`).join("")}</div>
    ${Store.sample ? freeBox("lugar") : ""}`;
}
function freeBox(ctx) {
  return `<div class="free"><h3>Acción libre con IA</h3><p class="note">Describe lo que quieres hacer. La IA decide el atributo y el riesgo, y después se tiran los dados.</p>
    <textarea id="g-free" rows="2" maxlength="500" placeholder="Ej.: Busco a alguien en la taberna que sepa algo de la Orden.">${esc(gsel.freeText)}</textarea>
    <div class="row"><button type="button" class="btn primary" data-g="free:${ctx}" ${gsel.busy ? "disabled" : ""}>Intentarlo</button>${gsel.busy ? `<span class="muted">La IA está pensando…</span>` : ""}${gsel.err ? `<span class="warn inline">${esc(gsel.err)}</span>` : ""}</div></div>`;
}
function shopView() {
  const disc = Object.values(G.rayos).reduce((a, b) => a + b, 0) >= 150 ? 0.9 : 1; const merc = G.trasfondo === "Mercader ambulante" ? 0.9 : 1;
  const sellables = Object.keys(G.g.inv).filter((n) => sellPrice(n) > 0);
  return `<div class="card"><h3>Tienda</h3>${disc < 1 || merc < 1 ? `<p class="note">Tienes descuento.</p>` : ""}
    <div class="shop">${SHOP.map((s) => `<div class="si"><span><b>${esc(s.n)}</b><small>${esc(s.desc)}</small></span><button type="button" class="btn small" data-buy="${esc(s.n)}">${Math.ceil(s.precio * disc * merc)} Soles</button></div>`).join("")}</div>
    ${sellables.length ? `<h3 class="sub">Vender</h3><div class="shop">${sellables.map((n) => `<div class="si"><span><b>${esc(n)}</b><small>Tienes ${G.g.inv[n]}</small></span><button type="button" class="btn small ghost" data-sell="${esc(n)}">+${sellPrice(n)} Soles</button></div>`).join("")}</div>` : ""}</div>`;
}
function boardView() {
  const b = boardFor(G.g.loc.r, G.g.day);
  return `<div class="card"><h3>Tablón de misiones · ${esc(regionName(G.g.loc.r))}</h3>
    ${b.length ? b.map((q) => { const has = G.g.quests.some((x) => x.id === q.id); return `<div class="si"><span><b>${esc(q.t)}</b><small>+${q.soles} Soles · +${q.xp} XP · +${q.fama} Rayos de Fama · 50% de +1 punto de afinidad</small></span>${has ? `<span class="muted">Aceptada</span>` : `<button type="button" class="btn small" data-quest="${esc(q.id)}">Aceptar</button>`}</div>`; }).join("") : `<p class="muted">No hay misiones hoy.</p>`}</div>`;
}
function combatView() {
  const c = G.g.combat; const ps = c.pst;
  const known = G.g.spells.map((s) => spellInfo(s.aff, s.n)).filter(Boolean);
  const pots = SHOP.filter((s) => ["potion", "mana", "energy"].includes(s.kind) && G.g.inv[s.n]);
  return `<h2>⚔️ Combate · ronda ${c.round}</h2>
    <div class="foes">${c.enemies.map((e, i) => `<div class="foe ${e.pv <= 0 ? "dead" : ""}"><b>${esc(e.n)}</b><small>Nivel ${e.lvl}${e.aff ? " · " + esc(e.aff) : ""}${e.boss ? " · JEFE" : ""}</small>
      <span>${e.pv}/${e.pvMax} PV ${bar(e.pv, e.pvMax, "pv")}</span>${Object.keys(e.st).length ? `<small class="st">${esc(Object.keys(e.st).join(", "))}</small>` : ""}
      ${e.pv > 0 ? `<button type="button" class="btn small" data-atk="${i}">Atacar con ${esc(G.g.arma.n)}</button>` : "<small>Derrotado</small>"}</div>`).join("")}</div>
    ${ps.shield || ps.buff || Object.keys(ps.st).length ? `<p class="note">${ps.shield ? `Escudo ${ps.shield} · ` : ""}${ps.buff ? `Ventaja ${ps.buff} · ` : ""}${esc(Object.keys(ps.st).join(", "))}</p>` : ""}
    ${known.length ? `<h3 class="sub">Hechizos</h3><div class="spells">${known.map((sp) => `<button type="button" class="act" data-cast="${esc(sp.aff)}|${esc(sp.n)}"><b>${esc(sp.n)}</b><small>${spellCost(sp)} maná · ${esc(spellDesc(sp))}</small></button>`).join("")}</div>` : ""}
    ${c.pst.barrier || c.pst.forge || c.pst.grito || c.pst.velo ? `<p class="note">${[c.pst.barrier ? `Escudo ${c.pst.barrier} PV` : "", c.pst.forge ? `Arma +${c.pst.forge}` : "", c.pst.grito ? `Grito ${c.pst.grito} rondas` : "", c.pst.velo ? `Velo ${c.pst.velo} rondas` : ""].filter(Boolean).join(" · ")}</p>` : ""}
    <div class="row cm">${combatGodButtons()}<button type="button" class="btn" data-g="defend">🛡️ Defenderse</button>${pots.map((s) => `<button type="button" class="btn" data-use="${esc(s.n)}">🧪 ${esc(s.n)} (${G.g.inv[s.n]})</button>`).join("")}<button type="button" class="btn ghost" data-g="flee">🏃 Huir</button></div>
    <div class="clog">${c.log.slice().reverse().map((l) => `<div>${esc(l)}</div>`).join("")}</div>`;
}
function mapView() {
  const sel = gsel.region || G.g.loc.r; const reg = R.find((x) => x.id === sel);
  const pin = gsel.pin && gsel.pin.startsWith(sel + ":") ? +gsel.pin.split(":")[1] : null;
  const gods = (r, i) => (typeof godsAt === "function" ? godsAt(r, i).filter((g) => !["brasa", "lyss"].includes(g)) : []);
  const pins = [];
  for (const r in P) P[r].forEach((x, i) => {
    const mine = r === sel; const g = gods(r, i); const temple = g.length && (x.t === "templo" || x.t === "cumbre" || g.some((k) => k !== "vaelmor"));
    if (!mine && !temple) return;
    pins.push(`<g class="gpin ${mine ? "" : "far"} ${pin === i && mine ? "on" : ""} ${temple ? "tem" : ""}" data-pin="${r}:${i}" tabindex="0" role="button" aria-label="${esc(x.n)}"><title>${esc(x.n)}${g.length ? " · " + esc(g.map((k) => DIOS[k].c).join(", ")) : ""}</title><circle cx="${x.xy[0]}" cy="${x.xy[1]}" r="${mine ? 17 : 12}"></circle><text x="${x.xy[0]}" y="${x.xy[1] + 1}">${mine ? T[x.t].icon : "🛕"}</text></g>`);
  });
  let card = "";
  if (pin != null) {
    const x = P[sel][pin]; const here = G.g.loc.r === sel && G.g.loc.p === pin; const g = gods(sel, pin);
    card = `<div class="card pcard"><div class="row between"><h3>${T[x.t].icon} ${esc(x.n)}</h3><span class="pill">${esc(T[x.t].name)} · nivel ${esc(x.lvl)}</span></div>
      ${x.note ? `<p class="lead">${esc(x.note)}</p>` : ""}
      ${x.mon.length ? `<p><b>Monstruos:</b> ${esc(x.mon.join(", "))}</p>` : ""}${x.boss ? `<p><b>Jefe:</b> ${esc(x.boss)}</p>` : ""}
      <p><b>Se consigue:</b> ${esc(x.obj.join(", "))}</p>
      ${g.map((k) => `<p class="godline">🛕 <b>${esc(DIOS[k].n)}</b> · ${esc(DIOS[k].t)}${DIOS[k].afin ? " · " + esc(DIOS[k].afin) : ""}${typeof favorOf === "function" && k !== "vaelmor" ? ` · tu favor: ${favorOf(k)}` : ""}${typeof godCorrupt === "function" && godCorrupt(k) ? " · <span class='warn inline'>corrupto</span>" : ""}<br><small class="muted">${k === "vaelmor" ? "Aquí se hace el pacto secreto." : "Rezar, ofrendas, juramento y avatar. Devoto: " + esc(DIOS[k].dev)}</small></p>`).join("")}
      <div class="row">${here ? `<button type="button" class="btn small" data-gtab="lugar">Estás aquí · ir a Lugar</button>` : `<button type="button" class="btn primary small" data-go="${sel}:${pin}">Viajar aquí · ${esc(fmtH(tripHours({ r: sel, p: pin }, gsel.mode)))}</button>`}</div></div>`;
  }
  return `<div class="mapwrap"><div class="minimap"><img src="mapa.jpg" alt="Mapa de Solvaria"><svg viewBox="0 0 1080 1024" preserveAspectRatio="none">
      ${R.map((x) => `<ellipse class="hot ${x.id === sel ? "sel" : ""}" data-reg="${x.id}" cx="${x.shape[0]}" cy="${x.shape[1]}" rx="${x.shape[2]}" ry="${x.shape[3]}"></ellipse>`).join("")}
      ${pins.join("")}
      ${(() => { const l = PLACE_OF(G.g.loc.r, G.g.loc.p).xy; return `<circle class="me" cx="${l[0]}" cy="${l[1]}" r="22"></circle>`; })()}
    </svg></div>
    <div><div class="scene small" style="background-image:url(bg/${sel}.jpg)"><div><b>${esc(reg.name)}</b><span>Peligro ${esc(reg.lvl)}</span></div></div>
      <p class="muted">${esc(reg.desc)} · Clima: ${CLIMAS[weatherFor(sel, G.g.day)].icon} ${esc(weatherFor(sel, G.g.day))}</p>
      <div class="row"><span>Viajar:</span>${Object.entries(MODES).map(([k, m]) => `<button type="button" class="chip ${gsel.mode === k ? "on" : ""}" data-mode="${k}">${m.icon} ${m.name}${k === "caballo" ? " (5 Soles)" : k === "caravana" ? " (3 Soles)" : ""}</button>`).join("")}</div>
      ${card}
      <div class="places">${P[sel].map((x, i) => { const here = G.g.loc.r === sel && G.g.loc.p === i; return `<button type="button" class="pl ${pin === i ? "on" : ""}" data-pin="${sel}:${i}"><span>${T[x.t].icon} ${esc(x.n)} <small>nivel ${esc(x.lvl)}</small></span><small>${here ? "Estás aquí" : esc(fmtH(tripHours({ r: sel, p: i }, gsel.mode)))}</small></button>`; }).join("")}</div>
      <p class="note">Toca una región o un icono del mapa para ver ese lugar. Los 🛕 son templos de las deidades. En viajes largos a pie o a caballo puede haber emboscadas.</p></div></div>`;
}
const FLAG_NAME = { pista_ocaso: "viste que la luz se apaga", pista_cumbre: "leíste el reglamento de la Cumbre", espia_atrapado: "atrapaste al espía", pip_info: "Pip te debe información", casimir_habla: "Casimir te habló", ilvara_notas: "estudiaste las notas de Ilvara", planos_festival: "conoces los planos del Festival", voz_conocida: "oíste la voz en las alcantarillas", prueba_letra: "comparaste la letra", ilvara_duda: "Ilvara dudó ante ti" };
function epiloguesBox() {
  const done = ARCS.filter((a) => worldCap() > a.to);
  if (!done.length) return "";
  const ep = G.g.epilogos || {};
  return `<h3 class="sub">Arcos terminados</h3>${done.map((a) => `<div class="card mini"><div class="row between"><b>Arco ${a.n}: ${esc(a.t)}</b>${Store.sample ? `<button type="button" class="btn small ${ep[a.n] ? "ghost" : "primary"}" data-g="epilogo:${a.n}" ${gsel.busy ? "disabled" : ""}>${ep[a.n] ? "Reescribir" : "Escribir"} mi epílogo con IA</button>` : ""}</div>
    <p class="muted">${esc(a.fin)} El grupo decidió: ${esc((Store.world?.history || []).find((h) => h.cap === a.to)?.label || "—")}.</p>${ep[a.n] ? `<p>${esc(ep[a.n])}</p>` : ""}</div>`).join("")}`;
}
function arc2Outcome() {
  const m = Store.world?.markers || {}; const f = Store.world?.flags || {}; const o = m.orden ?? 0;
  const rel = ["reliquia_grudhal", "reliquia_kronea", "reliquia_marenna"].filter((k) => f[k]).length;
  const orden = o <= 0 ? "La Orden del Crepúsculo queda rota: sin su líder y sin reliquias, sus células se esconden." : o <= 3 ? "La Orden está herida, pero sigue viva en las sombras." : "La Orden sigue fuerte: el Eclipse cayó, pero otros esperan su turno.";
  const il = f.ilvara_aliada ? "Ilvara Nocturna trabaja ahora con vosotros, bajo vigilancia, buscando otra forma de salvar el sol." : f.ilvara_libre ? "Ilvara desapareció en la noche. Nadie sabe qué hará." : "Ilvara espera juicio en las mazmorras del rey.";
  return `${orden} Recuperasteis ${rel} de 3 reliquias. ${il}`;
}
function arc3Outcome() {
  const f = Store.world?.flags || {}; const lib = Object.keys(f.liberated || {}).filter((k) => f.liberated[k]); const fal = Object.keys(f.fallen || {}).filter((k) => f.fallen[k]); const cor = Object.keys(f.corrupt || {}).filter((k) => f.corrupt[k]);
  const how = f.vaelmor_sellado ? "Vaelmor vuelve a dormir, sellado por la máquina de Tobble. Las reliquias se quedaron dentro con él." : f.vaelmor_pacto ? "El grupo aceptó la oferta de Vaelmor. La noche avanza sobre Solvaria, tranquila y sin fin." : f.solen_despierta ? "La luz de los dioses despertó a Solen por un instante. Vaelmor, cegado, se hundió otra vez en su sueño." : "Vaelmor sigue ahí abajo, esperando.";
  const name = (ids) => ids.map((k) => DIOS[k]?.c || k).join(", ");
  return `${how} ${lib.length ? `Dioses liberados: ${name(lib)}.` : ""} ${fal.length ? `Dioses caídos: ${name(fal)}.` : ""} ${cor.length ? `Siguen corruptos: ${name(cor)}.` : ""}`.trim();
}
function godsStateBox() {
  const f = Store.world?.flags || {}; const ids = Object.keys(CORRUPT_LVL);
  if (!ids.some((k) => f.corrupt?.[k] || f.fallen?.[k] || f.liberated?.[k])) return "";
  return `<div class="card mini"><b>Guardianes de la tumba</b><div class="chips">${ids.map((k) => { const st = f.fallen?.[k] ? "caído" : f.corrupt?.[k] ? "corrupto" : f.liberated?.[k] ? "libre" : "a salvo"; return `<span class="chip ${st === "libre" || st === "a salvo" ? "on" : ""}">${esc(DIOS[k].c)}: ${st}</span>`; }).join("")}</div>
    ${ids.some((k) => f.corrupt?.[k]) ? `<p class="note">Cada dios corrupto apaga el sol 2% por capítulo. Libéralos en sus templos.</p>` : ""}</div>`;
}
function storyView() {
  const ch = chapter(); const w = Store.world;
  if (!ch) { const last = ARCS[ARCS.length - 1]; return `<p class="eyebrow">Fin del Arco ${last.n}</p><h2>${esc(last.t)}</h2><p class="lead">${esc(last.fin)}</p><p class="lead">${esc(finalOutcome())}</p>${sacrificeBox()}
    <div class="result"><b>Fin de la historia principal</b><div>El mundo sigue abierto: podéis seguir explorando, cazando, subiendo niveles, sirviendo a vuestros dioses y trepando la Escalera del Alba.</div></div>${godsStateBox()}${epiloguesBox()}${historyList()}`; }
  const arc = arcOf(ch.cap); const k = ch.cap - arc.from + 1;
  const mine = G.g.story[ch.cap]; const here = G.g.loc.r === ch.r && G.g.loc.p === ch.p;
  const votes = w?.votes?.[ch.cap] || {}; const players = playersInGame(); const myVote = votes[Store.uid];
  const prevOath = ch.textBy ? (w?.history || []).find((h) => h.cap === ch.cap - 1)?.id : null;
  const bossDone = ch.boss && G.g.flags[`jefe_${ch.cap}`];
  return `${k === 1 && arc.n > 1 ? `<div class="result"><b>Empieza el Arco ${arc.n}: ${esc(arc.t)}</b><div>${esc(ARCS[arc.n - 2].fin)}</div></div>` : ""}
    <p class="eyebrow">Arco ${arc.n} · ${esc(arc.t)} · Capítulo ${k} de ${arc.to - arc.from + 1}</p><h2>${esc(ch.t)}</h2>
    ${arc.n === 3 ? godsStateBox() : ""}
    ${ch.text.map((t) => `<p class="lead">${esc(t)}</p>`).join("")}
    ${prevOath && ch.textBy[prevOath] ? `<p class="lead"><i>${esc(ch.textBy[prevOath])}</i></p>` : ""}
    ${mine ? `<div class="result"><b>Tu acción: ${esc(mine.l)}</b><div>${esc(mine.roll)} · ${TIER[mine.tier]}</div><div>${esc(mine.text)}</div>${(mine.fx || []).map((f) => `<div class="muted">${esc(f)}</div>`).join("")}</div>`
      : here ? `<h3 class="sub">¿Qué haces?</h3><div class="acts">${ch.choices.map((c, i) => { const adv = c.adv && G.g.flags[c.adv]; return `<button type="button" class="act" data-story="${i}"><b>${esc(c.l)}</b><small>${ATTR_NAME[c.stat]} ${sgn(attr(c.stat))} · riesgo ${c.risk}${adv ? ` · ventaja: ${esc(FLAG_NAME[c.adv] || "lo que ya sabes")}` : ""}</small></button>`; }).join("")}</div>${Store.sample ? freeBox("story") : ""}`
      : `<div class="warn">Este capítulo pasa en ${esc(P[ch.r][ch.p].n)} (${esc(regionName(ch.r))}). <button type="button" class="link" data-go="${ch.r}:${ch.p}">Viajar allí · ${esc(fmtH(tripHours({ r: ch.r, p: ch.p }, "pie")))} a pie</button></div>`}
    ${ch.boss ? `<div class="card"><div class="row between"><h3>💀 ${esc(ch.boss.n)}</h3><span class="pill">Nivel ${ch.boss.lvl} · jefe del capítulo</span></div>
      ${bossDone ? `<span class="pill ok">Derrotado</span>` : here ? `<button type="button" class="btn primary small" data-g="storyboss">⚔️ Enfrentarlo (1 Energía)</button><span class="note"> Opcional: cada jugador puede pelear el suyo.</span>` : `<p class="note">Aparece en ${esc(P[ch.r][ch.p].n)}.</p>`}</div>` : ""}
    <h3 class="sub">Votación del grupo</h3><p>${esc(ch.vote.q)}</p>
    <div class="acts">${ch.vote.options.map((o) => { const n = Object.values(votes).filter((v) => v === o.id).length; return `<button type="button" class="act ${myVote === o.id ? "sel" : ""}" data-vote="${o.id}"><b>${esc(o.l)} <span class="pill">${n}</span></b><small>${esc(o.d)}</small></button>`; }).join("")}</div>
    <p class="note">${Object.keys(votes).length} de ${players.length} jugadores han votado. El capítulo avanza cuando votan todos.</p>
    ${Store.isOwner ? `<button type="button" class="btn ghost small" data-g="forcevote">Cerrar la votación ahora (anfitrión)</button>` : ""}
    ${epiloguesBox()}${historyList()}`;
}
function storyBoss() {
  const ch = chapter(); if (!ch?.boss || G.g.combat || G.g.flags[`jefe_${ch.cap}`]) return;
  if (!(G.g.loc.r === ch.r && G.g.loc.p === ch.p) || !needEnergy(1)) return;
  const b = ch.boss; const pv = Math.round((40 + 22 * b.lvl) * 0.55);
  if (b.god && !godCorrupt(b.god)) { G.g.flags[`jefe_${ch.cap}`] = true; toast(`${DIOS[b.god].c} ya fue liberado.`); return render(); }
  startCombat({ n: b.n, lvl: b.lvl, pv, pvMax: pv, poder: 10 + 3 * b.lvl, def: Math.floor(b.lvl / 4) + 1, aff: b.aff, boss: true, st: {}, story: ch.cap, god: b.god }, "story", `${ch.r}:${ch.p}`, `${b.n} te cierra el paso.`);
  persist(); render();
}
function historyList() {
  const h = Store.world?.history || []; if (!h.length) return "";
  return `<h3 class="sub">Lo que ha decidido el grupo</h3>${h.slice().reverse().map((x) => `<p><b>Cap. ${x.cap}:</b> ${esc(x.label)}</p>`).join("")}`;
}
function heroView() {
  const pts = G.g.puntosAtributo;
  return `${pts ? `<div class="card"><h3>Tienes ${pts} punto${pts > 1 ? "s" : ""} de atributo</h3><div class="chips">${ATTRS.map(([k, n]) => `<button type="button" class="chip" data-raise="${k}">+1 ${esc(n)}</button>`).join("")}</div><p class="note">Defensa/Resistencia sube un 2.5% tus PV máximos; Inteligencia, un 5% tu maná máximo.</p></div>` : ""}
    <div class="row"><button type="button" class="btn ghost small" data-g="export">Descargar copia</button></div>
    ${sheetHTML({ ...G, equipo: [`${G.g.arma.n} (Poder ${G.g.arma.poder}, equipada)`, ...Object.entries(G.g.inv).map(([n, q]) => `${n} ×${q}`)] }, Store.priv[G.id])}
    <h3 class="sub">Crónica de ${esc(G.nombre)}</h3><div class="clog">${G.g.log.slice().reverse().map((l) => `<div><span class="muted">Día ${l.d}, ${l.h}:00 ·</span> ${esc(l.t)}</div>`).join("") || `<p class="muted">Aún no hay nada.</p>`}</div>`;
}
function magicView() {
  if (!G.afinidades.length) return `<h2>Magia</h2><p class="lead">Naciste sin afinidad. Puedes pelear con armas y comprar armas mágicas en las tiendas (Espada de fuego, Arco de rayo, Báculo de luz).</p>`;
  return `<div class="row between"><h2>Magia</h2><span class="pill">${G.puntosAfinidad || 0} puntos de afinidad</span></div>
    <p class="note">Aprender un hechizo cuesta tantos puntos como su círculo y pide Dominio de al menos el círculo − 1. Subir el Dominio cuesta 3 puntos.</p>
    ${G.afinidades.map((a) => `<div class="card"><div class="row between"><h3>${esc(a.n)} ${a.abs ? `<span class="pill abs">Abstracta</span>` : ""} <span class="pill">Dominio ${sgn(a.dominio)}</span></h3><button type="button" class="btn small ghost" data-dom="${esc(a.n)}">Subir Dominio (3 puntos)</button></div>
      <p class="muted">Sub-afinidades (se abren con Dominio +2): ${esc(SUBAFIN[a.n] || "")}</p>
      <div class="shop">${(SPELLS[a.n] || []).map(([n]) => { const sp = spellInfo(a.n, n); const has = G.g.spells.some((s) => s.n === n); return `<div class="si"><span><b>${esc(n)}</b><small>Círculo ${sp.c} · ${esc(sp.cat)} · ${sp.cost} maná · ${esc(spellDesc(sp))}</small></span>${has ? `<span class="pill ok">Aprendido</span>` : `<button type="button" class="btn small" data-learn="${esc(a.n)}|${esc(n)}">Aprender (${sp.c})</button>`}</div>`; }).join("")}</div></div>`).join("")}`;
}
function bagView() {
  const items = Object.entries(G.g.inv);
  return `<h2>Bolsa</h2><p>Arma equipada: <b>${esc(G.g.arma.n)}</b> (Poder ${G.g.arma.poder}) · ☀ ${G.dinero.soles} Soles</p>
    ${items.length ? `<div class="shop">${items.map(([n, q]) => { const s = SHOP.find((x) => x.n === n); const at = ATTR_ITEMS[n];
      return `<div class="si"><span><b>${esc(n)} ×${q}</b><small>${s ? esc(s.desc) : at ? (at[0] === "elegir" ? "+1 al atributo que elijas (una vez)" : `+1 ${ATTR_NAME[at[0]]} permanente (una vez)`) : "Material"}</small></span>
      ${s && s.kind !== "weapon" ? `<button type="button" class="btn small" data-use="${esc(n)}">Usar</button>` : ""}
      ${at && at[0] !== "elegir" ? `<button type="button" class="btn small" data-attritem="${esc(n)}">Usar</button>` : ""}
      ${at && at[0] === "elegir" ? `<select data-attrpick="${esc(n)}"><option value="">Elegir atributo…</option>${ATTRS.map(([k, nn]) => `<option value="${k}">${nn}</option>`).join("")}</select>` : ""}</div>`; }).join("")}</div>` : `<p class="muted">La bolsa está vacía.</p>`}
    <h3 class="sub">Misiones aceptadas</h3>${G.g.quests.length ? G.g.quests.map((q) => { const pr = questProgress(q); return `<div class="si"><span><b>${esc(q.t)}</b><small>${pr} de ${q.need}</small></span>${pr >= q.need ? `<button type="button" class="btn small primary" data-turnin="${esc(q.id)}">Entregar</button>` : ""}</div>`; }).join("") : `<p class="muted">Ninguna. Busca el tablón de misiones en pueblos y ciudades.</p>`}`;
}
function ladderView() {
  const maxDay = Math.max(1, ...Store.all.map((c) => c.g?.day || 1));
  const rows = [
    ...Store.all.map((c) => ({ n: c.nombre, raza: c.raza, own: c.owner === Store.uid, total: Object.values(c.rayos || {}).reduce((a, b) => a + b, 0), rayos: c.rayos })),
    ...RIVALES.map(([n, raza, base, per]) => ({ n, raza, rival: true, total: base + per * (maxDay - 1) })),
  ].sort((a, b) => b.total - a.total);
  return `<h2>Escalera del Alba</h2>
    <div class="res" style="margin-bottom:14px"><div><span>Poder</span><b>${G.rayos.poder}</b></div><div><span>Saber</span><b>${G.rayos.saber}</b></div><div><span>Corazón</span><b>${G.rayos.corazon}</b></div><div><span>Fama</span><b>${G.rayos.fama}</b></div></div>
    <table class="tt"><thead><tr><th>#</th><th>Estudiante</th><th>Peldaño</th><th>Rayos</th></tr></thead><tbody>
    ${rows.map((x, i) => `<tr class="${x.n === G.nombre && x.own ? "hit" : ""}"><td>${i + 1}</td><td>${esc(x.n)} <small class="muted">${esc(x.raza)}${x.rival ? " · rival" : ""}</small></td><td>${esc(peldanoFor(x.total)[0])}</td><td>${x.total}</td></tr>`).join("")}</tbody></table>
    <h3 class="sub">Peldaños</h3><table class="tt"><tbody>${PELDANOS.map(([n, r, t]) => `<tr><td>${n}</td><td>${r}</td><td>${esc(t)}</td></tr>`).join("")}</tbody></table>`;
}
function groupView() {
  const all = Store.all.map((c) => ({ ...c, g: c.g || {} }));
  const logs = []; for (const c of all) for (const l of c.g.log || []) logs.push({ ...l, who: c.nombre });
  logs.sort((a, b) => (b.at || 0) - (a.at || 0));
  const m = Store.world?.markers || {};
  return `<h2>El grupo</h2>
    <div class="res" style="margin-bottom:12px"><div><span>Luz del sol</span><b>${m.luz ?? 80}%</b></div><div><span>Poder de la Orden</span><b>${m.orden ?? 0}/10</b></div><div><span>Reputación de la academia</span><b>${sgn(m.rep ?? 0)}</b></div><div><span>Capítulo</span><b>${worldCap() > STORY.length ? "Arcos completos" : `Arco ${arcOf(worldCap()).n} · ${worldCap() - arcOf(worldCap()).from + 1}`}</b></div></div>
    <table class="tt"><thead><tr><th>Personaje</th><th>Jugador</th><th>Nivel</th><th>Dónde</th><th>PV</th></tr></thead><tbody>
    ${all.map((c) => `<tr><td>${esc(c.nombre)}</td><td>${c.owner === Store.uid ? "tú" : esc(profileName(c.owner))}</td><td>${c.nivel}</td><td>${c.g.loc ? esc(P[c.g.loc.r][c.g.loc.p].n) : "Sin empezar"}</td><td>${c.pv}/${c.pvMax}</td></tr>`).join("")}</tbody></table>
    <h3 class="sub">Crónica del grupo</h3><div class="clog">${logs.slice(0, 40).map((l) => `<div><b>${esc(l.who)}</b> <span class="muted">· día ${l.d}</span> ${esc(l.t)}</div>`).join("") || `<p class="muted">Todavía no ha pasado nada.</p>`}</div>`;
}

// ---------- eventos del juego ----------
document.addEventListener("click", async (ev) => {
  if (view.name !== "game" || !G) return;
  const pinEl = ev.target.closest("[data-pin]");
  if (pinEl) { const [r, p] = pinEl.dataset.pin.split(":"); gsel.region = r; gsel.pin = `${r}:${p}`; return render(); }
  const t = ev.target.closest("button, ellipse"); if (!t) return;
  const ds = t.dataset;
  if (ds.gtab) { gtab = ds.gtab; gsel.shop = false; gsel.board = false; return render(); }
  if (ds.reg) { gsel.region = ds.reg; gsel.pin = null; return render(); }
  if (ds.mode) { gsel.mode = ds.mode; return render(); }
  if (ds.go) { const [r, p] = ds.go.split(":"); return travel({ r, p: +p }, gtab === "mapa" ? gsel.mode : "pie"); }
  if (ds.atk) return pAttack(+ds.atk);
  if (ds.cast) { const [a, n] = ds.cast.split("|"); const target = G.g.combat.enemies.findIndex((e) => e.pv > 0); return pAttack(target, spellInfo(a, n)); }
  if (ds.use) return pItem(ds.use);
  if (ds.buy) return buy(ds.buy);
  if (ds.sell) return sell(ds.sell);
  if (ds.quest) { const q = boardFor(G.g.loc.r, G.g.day).find((x) => x.id === ds.quest); if (q) acceptQuest(q); return; }
  if (ds.turnin) return turnIn(ds.turnin);
  if (ds.learn) { const [a, n] = ds.learn.split("|"); return learnSpell(a, n); }
  if (ds.dom) return raiseDominio(ds.dom);
  if (ds.raise) { if (G.g.puntosAtributo > 0) { G.g.puntosAtributo--; raiseAttr(ds.raise); log(`+1 ${ATTR_NAME[ds.raise]}.`); persist(); render(); } return; }
  if (ds.attritem) return useAttrItem(ds.attritem);
  if (ds.story) return storyChoice(+ds.story);
  if (ds.vote) return vote(ds.vote);
  const g = ds.g; if (!g) return;
  if (g === "explore") return explore();
  if (g === "fight") return fight("monster");
  if (g === "boss") return fight("boss");
  if (g === "arena") return fight("arena");
  if (g === "duel") return fight("duel");
  if (g === "class") return studyClass();
  if (g === "train") return train();
  if (g === "rest") return rest();
  if (g === "meditate") return meditate();
  if (g === "shop") { gsel.shop = !gsel.shop; gsel.board = false; return render(); }
  if (g === "board") { gsel.board = !gsel.board; gsel.shop = false; return render(); }
  if (g === "defend") return pDefend();
  if (g === "flee") return pFlee();
  if (g === "clearres") { G.g.lastResult = null; return render(); }
  if (g.startsWith("free:")) return freeAction(g.slice(5));
  if (g === "forcevote") return tryCloseVote(true);
  if (g === "storyboss") return storyBoss();
  if (g === "export") return exportChar(G.id);
  if (g.startsWith("epilogo")) {
    if (!Store.sample || gsel.busy) return; gsel.busy = true; render();
    const p = Store.priv[G.id] || {}; const an = +(g.split(":")[1] || 1); const arc = ARCS.find((a) => a.n === an) || ARCS[0];
    const hechos = Object.entries(G.g.story).filter(([c]) => +c >= arc.from && +c <= arc.to).map(([, s]) => s.l + " (" + TIER[s.tier] + ")").join("; ");
    const prompt = `Escribe en español el epílogo del arco «${arc.t}» (arco ${arc.n}) de un personaje de rol, en segunda persona, 100 a 150 palabras, sin títulos. Mundo: Solvaria, Sunrise Academy; el sol se apaga y la Orden del Crepúsculo conspira. Personaje: ${G.nombre}, ${G.raza}, nivel ${G.nivel}, peldaño ${G.peldano} de la Escalera del Alba. Motivo: ${p.motivo || "—"}. Secreto: ${p.secreto || "—"}. Lo que hizo: ${hechos || "—"}. Decisión final del grupo: ${(Store.world?.history || []).find((h) => h.cap === arc.to)?.label || "—"}.${an === 2 ? " " + arc2Outcome() : an === 3 ? " " + arc3Outcome() : an === 4 ? " " + finalOutcome() + (Store.world?.flags?.sacrificio_de?.id === G.id ? " Este personaje fue quien se unió al sol: escribe un final heroico y legendario." : "") : ""}`;
    try { const { text } = await Store.sample(prompt, { modelTier: "default", cache: false }); G.g.epilogos = { ...(G.g.epilogos || {}), [an]: text.trim() }; persist(); } catch (e) { toast("La IA no respondió."); }
    gsel.busy = false; return render();
  }
});
document.addEventListener("input", (ev) => { if (ev.target.id === "g-free") gsel.freeText = ev.target.value; });
document.addEventListener("change", (ev) => {
  if (view.name !== "game" || !G) return;
  if (ev.target.id === "g-train") { gsel.trainAttr = ev.target.value; }
  if (ev.target.dataset.attrpick && ev.target.value) useAttrItem(ev.target.dataset.attrpick, ev.target.value);
});
document.addEventListener("keydown", (ev) => {
  if (view.name !== "game" || !G || (ev.key !== "Enter" && ev.key !== " ")) return;
  const pinEl = ev.target.closest?.("[data-pin]"); if (!pinEl || pinEl.tagName === "BUTTON") return;
  ev.preventDefault(); const [r, p] = pinEl.dataset.pin.split(":"); gsel.region = r; gsel.pin = `${r}:${p}`; render();
});
