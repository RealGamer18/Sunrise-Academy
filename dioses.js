// ===================== DEIDADES (diseño 3.8) =====================
// Carga después de game.js. Añade templos al mapa, favor, juramento, bendiciones, avatares y el pacto de Vaelmor.
const DIOSES = [
  { id: "solen", n: "Solen, el Sol Naciente", c: "Solen", t: "Primordial", afin: null, tabu: "Dejar morir a un inocente pudiendo salvarlo", gusta: ["Pétalos solares", "Grano solar", "Bayas de sol"],
    dev: "De día (6:00–18:00) empiezas cada combate con un escudo de luz del 10% de tus PV", ele: "Amanecer: recuperas 30% de PV", cam: "Inmune a Miedo y Ceguera; cuentas doble para la Luz del sol" },
  { id: "lumina", n: "Lúmina, la Primera Chispa", c: "Lúmina", t: "Mayor", afin: "Luz", tabu: "Mentir para hacer daño", gusta: ["Cristal de luz", "Rocío del amanecer"],
    dev: "+1 a las tiradas de Sabiduría", ele: "Chispa: ciega a un enemigo 2 turnos", cam: "Luz −25% maná; tus curaciones +25%" },
  { id: "ignar", n: "Ignar, el Herrero Rojo", c: "Ignar", t: "Mayor", afin: "Fuego", tabu: "Huir de un duelo que aceptaste", gusta: ["Rubí en bruto", "Carbón ardiente"],
    dev: "+2 de daño con armas", ele: "Forja: tu arma gana +5 de Poder en este combate", cam: "Fuego −25% maná; inmune a Quemadura" },
  { id: "marenna", n: "Marenna, Madre de las Mareas", c: "Marenna", t: "Mayor", afin: "Agua", tabu: "Abandonar a alguien en el agua", gusta: ["Perla de mar", "Perlas de río", "Coral azul"],
    dev: "Viajes con tramos por mar ×0.75 de tiempo", ele: "Marea: curas 25% de PV y te quitas los estados", cam: "Agua −25% maná; respiras bajo el agua" },
  { id: "tharon", n: "Tharon, el Martillo del Cielo", c: "Tharon", t: "Mayor", afin: "Rayo", tabu: "Atacar por la espalda", gusta: ["Perla eléctrica", "Escama de trueno", "Fragmento de trueno"],
    dev: "+3 de daño en los críticos", ele: "Trueno: 15 + 5 × nivel de daño y aturde", cam: "Rayo −25% maná; inmune a Aturdido" },
  { id: "grudhal", n: "Grudhal, el Que Sostiene", c: "Grudhal", t: "Mayor", afin: "Tierra", tabu: "Robar", gusta: ["Trigo dorado", "Mineral de plata", "Obsidiana"],
    dev: "+1 de Defensa en combate", ele: "Muralla: escudo igual al 20% de tus PV máximos", cam: "Tierra −25% maná; no te pueden aturdir" },
  { id: "zefira", n: "Zefira, la Voz del Viento", c: "Zefira", t: "Mayor", afin: "Aire", tabu: "Encerrar a un ser vivo sin razón", gusta: ["Sal de viento", "Plumas comunes"],
    dev: "+2 a la iniciativa", ele: "Viento a favor: huir con ventaja y tu próximo viaje tarda 25% menos", cam: "Aire −25% maná; 1 de cada 6 ataques contra ti falla" },
  { id: "nyssa", n: "Nyssa, Madre de la Noche", c: "Nyssa", t: "Mayor", afin: "Sombra", tabu: "Revelar un secreto que te confiaron", gusta: ["Flor nocturna", "Pétalo de luna"],
    dev: "+1 de Agilidad de noche (20:00–6:00) fuera de combate", ele: "Velo: 2 rondas en las que los enemigos te atacan con desventaja", cam: "Sombra −25% maná; descansar te quita todo el Estrés" },
  { id: "orvath", n: "Orvath, el Ancla", c: "Orvath", t: "Mayor", afin: "Gravedad", tabu: "Romper una promesa", gusta: ["Piedra de cumbre", "Cristal eterno"],
    dev: "+1 de Fuerza fuera de combate (cargar, empujar, sujetar)", ele: "Peso: un enemigo pierde su próximo turno (un jefe queda cegado)", cam: "Gravedad −25% maná; las caídas no te hacen daño" },
  { id: "kronea", n: "Kronea, la Tejedora de Horas", c: "Kronea", t: "Mayor", afin: "Tiempo", tabu: "Hacer trampa con el tiempo o llegar tarde a una cita importante", gusta: ["Fragmento de tiempo"],
    dev: "Viajas 11 horas al día en vez de 10", ele: "Rebobinar: ventaja en tu próxima tirada", cam: "Tiempo −25% maná; siempre actúas primero en la primera ronda" },
  { id: "aster", n: "Aster, el Umbral", c: "Aster", t: "Mayor", afin: "Espacio", tabu: "Negar refugio a un viajero", gusta: ["Polvo de estrella"],
    dev: "Viajar a pie tarda ×0.9", ele: "Paso: te teletransportas a un templo que ya visitaste (1 vez por semana)", cam: "Espacio −25% maná; esquivas el primer ataque de cada combate" },
  { id: "mirael", n: "Mirael, la del Espejo", c: "Mirael", t: "Mayor", afin: "Realidad", tabu: "Negar lo que hiciste", gusta: ["Cristal violeta", "Setas brillantes"],
    dev: "+1 de Sabiduría para notar mentiras e ilusiones (acciones libres)", ele: "Reescribir: tu próxima tirada no puede ser Fallo (queda en Éxito con costo)", cam: "Realidad −25% maná; inmune a Confusión" },
  { id: "genna", n: "Genna, la Primera Mano", c: "Genna", t: "Mayor", afin: "Creación", tabu: "Destruir lo que otro creó", gusta: ["Flor de hada", "Madera antigua", "Savia cargada"],
    dev: "Explorar te da 1 material extra", ele: "Dar forma: creas una Poción de vida", cam: "Creación −25% maná; crear hechizos cuesta 25% menos" },
  { id: "norna", n: "Norna, la Hilandera", c: "Norna", t: "Mayor", afin: "Destino", tabu: "Hacer trampa en un juego o apuesta", gusta: ["Trébol de cuatro hojas", "Trébol de siete hojas"],
    dev: "+1 a una tirada al día, la que elijas", ele: "Hilo: ventaja en tu próxima tirada", cam: "Destino −25% maná; una vez por combate, un golpe mortal te deja a 1 PV" },
  { id: "seren", n: "Seren, el Guardián de Almas", c: "Seren", t: "Mayor", afin: "Alma", tabu: "Profanar una tumba", gusta: ["Agua bendita", "Musgo curativo"],
    dev: "+10% de maná máximo", ele: "Llamar al alma: recuperas 25% de PV y pierdes el miedo (en grupo: levanta a un aliado caído)", cam: "Alma −25% maná; inmune a Miedo y posesión" },
  { id: "brasa", n: "Brasa, la del Hogar", c: "Brasa", t: "Menor", afin: null, tabu: "Negar comida a quien tiene hambre", gusta: ["Pan de miel", "Setas doradas"],
    dev: "Descansar en posadas es gratis", ele: "Comida caliente: +2 de Energía", cam: "Descansar cura también 2 de Estrés extra y da +2 Rayos de Corazón" },
  { id: "aurum", n: "Aurum, el Mercader", c: "Aurum", t: "Menor", afin: null, tabu: "No pagar una deuda", gusta: ["Oro pirata"],
    dev: "10% de descuento en tiendas", ele: "Buen trato: tu próxima venta paga 150%", cam: "+20% de Soles en misiones" },
  { id: "varak", n: "Varak, el de la Arena", c: "Varak", t: "Menor", afin: null, tabu: "Rendirse sin pelear", gusta: ["Piel de lobo blanco", "Piel de yeti"],
    dev: "+1 de Fuerza en duelos y arena", ele: "Grito de guerra: +3 de daño durante 3 rondas", cam: "+50% de Rayos de Poder en la arena" },
  { id: "lyss", n: "Lyss, la de los Caminos", c: "Lyss", t: "Menor", afin: null, tabu: "Abandonar a un compañero en el camino", gusta: ["Mapa de un naufragio", "Conchas"],
    dev: "Emboscadas en viajes: 10% en vez de 20%", ele: "Atajo: tu próximo viaje tarda la mitad", cam: "Caballo y caravana gratis" },
  { id: "amara", n: "Amara, la del Corazón", c: "Amara", t: "Menor", afin: null, tabu: "Engañar a alguien que te ama", gusta: ["Rosa carmesí", "Perfume de sirena"],
    dev: "+1 de Carisma en escenas sociales y románticas", ele: "Lazo: +5 Rayos de Corazón (y +1 de vínculo en la historia)", cam: "+50% de Rayos de Corazón" },
  { id: "ruen", n: "Ruen, el Estudioso", c: "Ruen", t: "Menor", afin: null, tabu: "Destruir un libro", gusta: ["Mensaje sellado", "Rumores de palacio"],
    dev: "+1 de Inteligencia en clases y exámenes", ele: "Recordar: tu próxima clase no gasta Energía", cam: "+50% de Rayos de Saber; aprender hechizos cuesta 1 punto menos" },
  { id: "vaelmor", n: "Vaelmor, El Que Duerme Debajo", c: "Vaelmor", t: "Caído", afin: "Sombra", tabu: "No tiene: pide sacrificios", gusta: ["Fragmento maldito", "Agua negra", "Esencia de sombra"],
    dev: "Pacto secreto: +50% de daño y +25% de maná máximo", ele: "Cada victoria baja 1% la Luz del sol y te da +1 Estrés", cam: "Nadie lo sabe salvo tú" },
];
const DIOS = Object.fromEntries(DIOSES.map((x) => [x.id, x]));
const AFF_GOD = Object.fromEntries(DIOSES.filter((x) => x.afin && x.id !== "vaelmor").map((x) => [x.afin, x.id]));

// ---------- templos en el mapa ----------
T.templo = { icon: "🛕", name: "Templo" };
const NEW_TEMPLES = [
  ["alba", { n: "Templo de la Primera Chispa", t: "templo", lvl: "—", h: 1, xy: [915, 545], obj: ["Cristal de luz"], mon: [], dios: ["lumina"], note: "Un templo blanco donde la luz nunca se apaga del todo." }],
  ["quem", { n: "Templo de la Forja", t: "templo", lvl: "—", h: 0.5, xy: [590, 772], obj: ["Carbón ardiente"], mon: [], dios: ["ignar"], note: "El yunque sagrado de Ignar, en el corazón de Forjaroja." }],
  ["costa", { n: "Santuario de las Mareas", t: "templo", lvl: "—", h: 2, xy: [915, 765], obj: ["Perla de mar"], mon: [], dios: ["marenna"], note: "Una cueva que el mar llena y vacía dos veces al día." }],
  ["costa", { n: "Templo del Rayo", t: "templo", lvl: "—", h: 0.5, xy: [855, 700], obj: ["Perla eléctrica"], mon: [], dios: ["tharon"], note: "Su campana suena sola cuando se acerca una tormenta." }],
  ["llan", { n: "Templo de Piedra", t: "templo", lvl: "—", h: 3, xy: [560, 420], obj: ["Trigo dorado"], mon: [], dios: ["grudhal"], note: "Un círculo de piedras en medio de los trigales." }],
  ["esc", { n: "Altar de los Vientos", t: "templo", lvl: "—", h: 0.5, xy: [622, 188], obj: ["Sal de viento"], mon: [], dios: ["zefira"], note: "En el tejado del Monasterio Nube Blanca." }],
  ["esc", { n: "El Ancla", t: "templo", lvl: "—", h: 4, xy: [690, 150], obj: ["Piedra de cumbre"], mon: [], dios: ["orvath"], note: "Una cadena enorme clavada en la montaña. Nadie sabe qué sujeta." }],
  ["viol", { n: "Templo del Velo", t: "templo", lvl: "—", h: 3, xy: [830, 300], obj: ["Flor nocturna"], mon: [], dios: ["nyssa"], note: "Siempre es de noche dentro. Guarda la tumba de Vaelmor." }],
  ["cap", { n: "Torre de las Horas", t: "templo", lvl: "—", h: 1, xy: [930, 150], obj: ["Fragmento de tiempo"], mon: [], dios: ["kronea"], note: "El reloj de la torre marca horas que todavía no han pasado." }],
  ["cap", { n: "Jardín de Amara", t: "templo", lvl: "—", h: 1, xy: [985, 205], obj: ["Rosa carmesí"], mon: [], dios: ["amara"], note: "Las parejas dejan cintas atadas a los rosales." }],
  ["verde", { n: "Árbol Madre", t: "templo", lvl: "—", h: 3, xy: [290, 240], obj: ["Savia cargada"], mon: [], dios: ["genna"], note: "El primer árbol que Genna creó. Sus raíces llegan al mar." }],
  ["lost", { n: "Telar de Norna", t: "templo", lvl: "60+", h: 3, xy: [120, 712], obj: ["Trébol de cuatro hojas"], mon: [], dios: ["norna"], note: "Hilos de luz cuelgan del techo. Uno es el tuyo." }],
];
for (const [r, pl] of NEW_TEMPLES) if (!P[r].some((x) => x.n === pl.n)) P[r].push(pl);
const TEMPLE_AT = { "alba:Sunrise Academy": ["solen", "ruen"], "verde:Lago Espejo": ["mirael"], "verde:Cascada de los Susurros": ["seren"], "lost:Isla del Umbral": ["aster"],
  "llan:Trigalia, el Gran Mercado": ["aurum"], "llan:Arena del Viento": ["varak"], "cap:Coliseo Real": ["varak"], "viol:La Entrada de Abajo": ["vaelmor"] };
function godsAt(r, p) {
  const pl = P[r][p]; const out = [...(pl.dios || []), ...(TEMPLE_AT[`${r}:${pl.n}`] || [])];
  if (["pueblo", "ciudad", "puerto", "academia"].includes(pl.t)) out.push("brasa");
  if (["pueblo", "ciudad", "puerto"].includes(pl.t)) out.push("lyss");
  return [...new Set(out)];
}
function templePlaces() { const out = []; for (const r in P) P[r].forEach((pl, i) => { const g = godsAt(r, i).filter((x) => !["brasa", "lyss", "vaelmor"].includes(x)); if (g.length) out.push({ r, p: i, pl, g }); }); return out; }

// ---------- estado ----------
function dg() {
  const g = G.g; if (!g.dioses) g.dioses = { favor: {}, patron: null, campeon: false, day: {}, banUntil: 0, visited: {}, asterDay: -99, miracleArc: 0, serenBonus: 0, nextAdv: false, nextPlus: false, nextNoMiss: false, nextTrip: 1, nextSale: false, freeClass: false };
  return g.dioses;
}
const favorOf = (id) => dg().favor[id] || 0;
const godCorrupt = (id) => !!Store.world?.flags?.corrupt?.[id];
const godFallen = (id) => !!Store.world?.flags?.fallen?.[id];
function liberate(id) {
  Store.updateWorld({ flags: { corrupt: { [id]: false }, liberated: { [id]: true } } }).catch(() => {});
  G.g.flags["lib_" + id] = true; addFavor(id, 10);
  log(`Liberaste a ${DIOS[id].c} de la sombra de Vaelmor.`); toast(`¡${DIOS[id].c} es libre! Todo el grupo gana +10 de favor con ${DIOS[id].c}.`);
}
function claimLiberations() {
  const lib = Store.world?.flags?.liberated || {};
  for (const id of Object.keys(lib)) if (lib[id] && !G.g.flags["lib_" + id]) { G.g.flags["lib_" + id] = true; addFavor(id, 10); }
}
function freeGod() {
  const d = dg(); const id = gsel.libGod; if (!id || !godCorrupt(id) || G.g.combat || !needEnergy(1)) return;
  const lvl = CORRUPT_LVL[id] || 30; const pv = Math.round((40 + 22 * lvl) * 0.55);
  startCombat({ n: `Avatar corrupto de ${DIOS[id].c}`, lvl, pv, pvMax: pv, poder: 10 + 3 * lvl, def: Math.floor(lvl / 4) + 1, aff: DIOS[id].afin === "Gravedad" ? "Tierra" : DIOS[id].afin === "Realidad" ? "Sombra" : DIOS[id].afin, boss: true, st: {}, god: id }, "corrupt", `${G.g.loc.r}:${G.g.loc.p}`, "La sombra de Vaelmor se alza:");
  persist(); render();
}
function godLevel() { const d = dg(); if (!d.patron) return 0; const f = favorOf(d.patron); return f >= 100 && d.campeon ? 100 : f >= 75 && d.campeon ? 75 : f >= 50 ? 50 : f >= 25 ? 25 : 0; }
function blessed(id, lvl) { if (!G?.g) return false; const d = dg(); return d.patron === id && godLevel() >= lvl && !godFallen(id) && !(lvl >= 50 && godCorrupt(id)); }
function pactoVaelmor() { return !!(G && Store.priv[G.id]?.pacto); }
const LEVEL_NAME = { 0: "Sin juramento", 25: "Devoto", 50: "Elegido", 75: "Campeón", 100: "Avatar" };
function swearNeed(id) { const x = DIOS[id]; return x.afin && ABSTRACT_SET.has(x.afin) ? 40 : 25; }
const ABSTRACT_SET = new Set(["Gravedad", "Tiempo", "Espacio", "Realidad", "Creación", "Destino", "Alma"]);
function addFavor(id, n, why) {
  const d = dg(); const cap = d.patron === id ? 100 : 24; const before = favorOf(id);
  d.favor[id] = clamp(before + n, 0, cap);
  const after = d.favor[id];
  if (d.patron === id) for (const lv of [25, 50, 75, 100]) if (before < lv && after >= lv) {
    if (lv === 75 && !d.campeon) { toast(`Tu favor con ${DIOS[id].c} llegó a 75: vence a su avatar en su templo para ser Campeón.`); continue; }
    toast(`${DIOS[id].c}: ahora eres ${LEVEL_NAME[lv]}.`); log(`Ahora eres ${LEVEL_NAME[lv]} de ${DIOS[id].c}.`); onLevelUp(id, lv);
  }
  return after - before;
}
function onLevelUp(id, lv) {
  const d = dg();
  if (id === "seren" && lv === 25 && !d.serenBonus && G.manaMax > 0) { d.serenBonus = Math.floor(G.manaMax * 0.1); G.manaMax += d.serenBonus; G.mana += d.serenBonus; }
  if (lv === 75 && !G.afinidades.length) grantDivineAffinity(id);
}
function grantDivineAffinity(id) {
  let aff = DIOS[id].afin;
  if (!aff) aff = ELEMENTALES[d(7) - 1][2];
  const abs = ABSTRACT_SET.has(aff); let m = d(1000); if (abs) m = Math.floor(m * 1.5);
  G.afinidades.push({ n: aff, abs, dominio: 0 }); G.manaMax += m; G.mana += m;
  log(`${DIOS[id].c} despertó tu magia: afinidad ${aff} y ${m} de maná.`);
  G.g.lastResult = { title: "Despertar divino", lines: [`${DIOS[id].c} te da la afinidad ${aff} (Dominio +0).`, `1d1000${abs ? " × 1.5" : ""} de maná: ${m}`] };
}

// ---------- acciones de templo ----------
function pray(id) {
  const d = dg(); const key = `${id}:${G.g.day}`;
  if (d.day["p:" + key]) { toast("Ya rezaste hoy a este dios."); return; }
  d.day["p:" + key] = 1; advance(1);
  const r = rollX(); const tot = r.sum + attr("voluntad"); const tier = tierOf(tot);
  const gain = addFavor(id, { hit: 5, mix: 3, miss: 1 }[tier]);
  d.visited[`${G.g.loc.r}:${G.g.loc.p}`] = true;
  log(`Rezaste a ${DIOS[id].c}.`);
  G.g.lastResult = { title: `Rezas a ${DIOS[id].c}`, lines: [`Tirada de Voluntad: ${r.ds.join("+")}${r.plus ? " +1" : ""} ${sgn(attr("voluntad"))} = ${tot} · ${TIER[tier]}`, gain ? `+${gain} de favor (${favorOf(id)})` : `Tu favor no puede subir más sin jurarle lealtad (máximo 24).`] };
  pruneDay(); persist(); render();
}
function offer(id) {
  const d = dg(); const key = `o:${id}:${G.g.day}`; const n = d.day[key] || 0;
  const it = DIOS[id].gusta.find((x) => G.g.inv[x]);
  if (it) { addItem(it, -1); const g = addFavor(id, 5); toast(`Ofreces ${it}: +${g} de favor.`); log(`Ofreciste ${it} a ${DIOS[id].c}.`); persist(); render(); return; }
  if (n >= 3) { toast("Máximo 3 ofrendas de Soles al día."); return; }
  if (G.dinero.soles < 10) { toast("Una ofrenda cuesta 10 Soles."); return; }
  G.dinero.soles -= 10; d.day[key] = n + 1; const g = addFavor(id, 2); toast(`Ofrenda de 10 Soles: +${g} de favor.`);
  pruneDay(); persist(); render();
}
function swear(id) {
  const d = dg(); if (d.patron) { toast("Ya tienes un dios patrón. Renuncia primero."); return; }
  if (G.g.day < d.banUntil) { toast(`No puedes jurar a nadie hasta el día ${d.banUntil}.`); return; }
  if (favorOf(id) < swearNeed(id)) { toast(`Necesitas ${swearNeed(id)} de favor.`); return; }
  d.patron = id; d.campeon = false; advance(1);
  log(`Juraste lealtad a ${DIOS[id].c}.`); toast(`${DIOS[id].c} es ahora tu dios patrón.`);
  const f = favorOf(id); for (const lv of [25, 50]) if (f >= lv) onLevelUp(id, lv);
  persist(); render();
}
function renounce() {
  const d = dg(); if (!d.patron) return; const old = d.patron;
  d.favor[old] = 0; d.patron = null; d.campeon = false; d.banUntil = G.g.day + 7;
  if (d.serenBonus) { G.manaMax = Math.max(0, G.manaMax - d.serenBonus); G.mana = Math.min(G.mana, G.manaMax); d.serenBonus = 0; }
  log(`Renunciaste a ${DIOS[old].c}.`); toast(`Dejaste a ${DIOS[old].c}. Podrás jurar a otro dios el día ${d.banUntil}.`);
  persist(); render();
}
function pruneDay() { const d = dg(); for (const k of Object.keys(d.day)) if (!k.endsWith(":" + G.g.day)) delete d.day[k]; }
function trial() {
  const d = dg(); const id = d.patron; if (!id || favorOf(id) < 75 || d.campeon || G.g.combat) return;
  if (!needEnergy(1)) return;
  const lvl = G.nivel + 2; const pv = Math.round((40 + 22 * lvl) * 0.55);
  const e = { n: `Avatar de ${DIOS[id].c}`, lvl, pv, pvMax: pv, poder: 10 + 3 * lvl, def: Math.floor(lvl / 4) + 1, aff: DIOS[id].afin, boss: true, st: {}, avatar: id };
  startCombat(e, "avatar", `${G.g.loc.r}:${G.g.loc.p}`, "La Prueba del Campeón:"); persist(); render();
}
function onAvatarWin(c) {
  const d = dg(); const id = c.enemies[0].avatar; if (!id || d.patron !== id) return;
  d.campeon = true; log(`Venciste al avatar de ${DIOS[id].c}: ahora eres su Campeón.`); toast(`¡Eres Campeón de ${DIOS[id].c}!`);
  onLevelUp(id, 75); if (favorOf(id) >= 100) onLevelUp(id, 100);
}
function onAvatarLoss(c) { if (c.enemies[0].avatar) G.g.lastResult?.lines.push("No pierdes favor. Puedes volver a intentarlo cuando quieras recuperarte."); }
async function pacto(accept) {
  const p = { ...(Store.priv[G.id] || {}) };
  if (accept) { if (p.pacto) return; p.pacto = true; const b = Math.floor(G.manaMax * 0.25); p.pactoMana = b; G.manaMax += b; G.mana += b; G.estres = Math.min(10, G.estres + 2); }
  else { if (!p.pacto) return; G.manaMax = Math.max(0, G.manaMax - (p.pactoMana || 0)); G.mana = Math.min(G.mana, G.manaMax); p.pacto = false; p.pactoMana = 0; }
  G.updatedAt = Date.now();
  try { await Store.saveChar(G, p); } catch (e) { toast("No se pudo guardar."); }
  G.g.lastResult = accept ? { title: "Algo te escucha desde abajo", lines: ["+50% de daño y +25% de maná máximo.", "Cada victoria bajará 1% la Luz del sol y te dará +1 Estrés.", "Esto se guarda en tu parte privada: nadie más lo ve."] } : { title: "Rompiste el pacto", lines: ["Pierdes el maná extra. La voz se calla, por ahora."] };
  render();
}
function onVictoryGods(c) {
  if (c.kind === "avatar") onAvatarWin(c);
  if (pactoVaelmor()) {
    G.estres = Math.min(10, G.estres + 1);
    const luz = Store.world?.markers?.luz ?? 80;
    Store.updateWorld({ markers: { luz: Math.max(0, luz - 1) } }).catch(() => {});
  }
  // actuar según su dominio: ganar con la afinidad de tu patrón
  const d = dg(); if (d.patron && c.usedAff && DIOS[d.patron].afin === c.usedAff) addFavor(d.patron, 1);
}

// ---------- tiradas con bendiciones ----------
function rollX(mode) {
  const d = G?.g ? dg() : null; let m = mode || 0, plus = 0, nomiss = false;
  if (d?.nextAdv) { m = 1; d.nextAdv = false; }
  if (d?.nextPlus) { plus = 1; d.nextPlus = false; }
  if (d?.nextNoMiss) { nomiss = true; d.nextNoMiss = false; }
  const r = roll2d6(m); r.sum += plus; r.plus = plus;
  if (nomiss) r.floor = 6; // Mirael: el total mínimo cuenta como Éxito con costo
  return r;
}
function rollTotal(r, mod) { const t = r.sum + mod; return r.floor ? Math.max(t, r.floor) : t; }
function ctxBonus(k, ctx) {
  let b = 0; const h = G.g.hour; const night = h >= 20 || h < 6;
  if (k === "sabiduria" && blessed("lumina", 25)) b++;
  if (k === "sabiduria" && ctx === "free" && blessed("mirael", 25)) b++;
  if (k === "agilidad" && ctx !== "combat" && night && blessed("nyssa", 25)) b++;
  if (k === "fuerza" && ctx !== "combat" && blessed("orvath", 25)) b++;
  if (k === "carisma" && (ctx === "free" || ctx === "story") && blessed("amara", 25)) b++;
  if (k === "inteligencia" && ctx === "class" && blessed("ruen", 25)) b++;
  if (k === "fuerza" && ctx === "arena" && blessed("varak", 25)) b++;
  return b;
}
function spellCost(sp) {
  let m = 1; const god = AFF_GOD[sp.aff]; if (god && blessed(god, 75)) m *= 0.75;
  return Math.ceil(sp.cost * m);
}
function weaponBonus() { return (blessed("ignar", 25) ? 2 : 0) + (G.g.combat?.pst.forge || 0) + (G.g.combat?.pst.grito > 0 ? 3 : 0); }
function dmgMult() { return pactoVaelmor() ? 1.5 : 1; }
function defBonus() { return (blessed("grudhal", 25) ? 1 : 0) + (wTraits(G.g.arma.n).includes("escudo") ? 1 : 0); }
function initBonus() { return (blessed("zefira", 25) ? 2 : 0) + (wTraits(G.g.arma.n).includes("alcance") ? 2 : 0); }
function statusImmune(st) {
  if (st === "Asustado" && (blessed("solen", 75) || blessed("seren", 75))) return true;
  if (st === "Cegado" && blessed("solen", 75)) return true;
  if (st === "Quemado" && blessed("ignar", 75)) return true;
  if (st === "Aturdido" && (blessed("tharon", 75) || blessed("grudhal", 75))) return true;
  return false;
}
function travelMult(mode, hasSea) { let m = 1; if (mode === "pie" && blessed("aster", 25)) m *= 0.9; if (hasSea && blessed("marenna", 25)) m *= 0.75; const d = dg(); if (d.nextTrip !== 1) m *= d.nextTrip; return m; }
function hoursPerDay() { return blessed("kronea", 25) ? 11 : HOURS_PER_DAY; }
function ambushChance() { return blessed("lyss", 25) ? 0.1 : 0.2; }
function freeMounts() { return blessed("lyss", 75); }
function shopMult() { return blessed("aurum", 25) ? 0.9 : 1; }
function raysMult(k, arena) {
  let m = 1;
  if (k === "corazon" && blessed("amara", 75)) m *= 1.5;
  if (k === "saber" && blessed("ruen", 75)) m *= 1.5;
  if (k === "poder" && arena && blessed("varak", 75)) m *= 1.5;
  return m;
}

// ---------- bendición activa (Elegido) y milagro (Avatar) ----------
function canBless() { const d = dg(); return d.patron && blessed(d.patron, 50) && !d.day[`b:${G.g.day}`]; }
function blessNeedsCombat(id) { return ["lumina", "ignar", "tharon", "grudhal", "nyssa", "orvath", "varak"].includes(id); }
function bless() {
  const d = dg(); const id = d.patron; if (!canBless()) return;
  const c = G.g.combat; const target = c ? c.enemies.find((e) => e.pv > 0) : null;
  if (blessNeedsCombat(id) && !c) { toast("Esta bendición se usa en combate."); return; }
  if (id === "aster") { gsel.aster = !gsel.aster; return render(); }
  const lines = []; const heal = (pct) => { const h = Math.min(G.pvMax - G.pv, Math.round(G.pvMax * pct * (blessed("lumina", 75) ? 1.25 : 1))); G.pv += h; lines.push(`Recuperas ${h} PV.`); };
  switch (id) {
    case "solen": heal(0.3); break;
    case "lumina": target.st.Cegado = 2; lines.push(`${target.n} queda cegado.`); break;
    case "ignar": c.pst.forge = 5; lines.push("Tu arma arde: +5 de Poder en este combate."); break;
    case "marenna": heal(0.25); if (c) c.pst.st = {}; lines.push("Te quitas los estados."); break;
    case "tharon": { const dmg = Math.round((15 + 5 * G.nivel) * dmgMult()); target.pv = Math.max(0, target.pv - dmg); if (target.pv > 0) target.st.Aturdido = 1; lines.push(`Un trueno cae sobre ${target.n}: ${dmg} de daño.`); break; }
    case "grudhal": c.pst.barrier = Math.round(G.pvMax * 0.2); lines.push(`Muralla de ${c.pst.barrier} PV.`); break;
    case "zefira": d.nextTrip = 0.75; if (c) c.pst.fleeAdv = true; lines.push("El viento te empuja: tu próximo viaje tarda 25% menos" + (c ? " y huyes con ventaja." : ".")); break;
    case "nyssa": c.pst.velo = 2; lines.push("Te envuelve el Velo: 2 rondas con los enemigos en desventaja."); break;
    case "orvath": if (target.boss) { target.st.Cegado = 1; lines.push(`${target.n} se vuelve pesado y lento.`); } else { target.st.Aturdido = 1; lines.push(`${target.n} queda aplastado y pierde su turno.`); } break;
    case "kronea": case "norna": d.nextAdv = true; lines.push("Ventaja en tu próxima tirada."); break;
    case "mirael": d.nextNoMiss = true; lines.push("Tu próxima tirada no puede ser Fallo."); break;
    case "genna": addItem("Poción de vida"); lines.push("Creas una Poción de vida."); break;
    case "seren": heal(0.25); if (c) delete c.pst.st.Asustado; break;
    case "brasa": { const e = Math.min(2, G.energiaMax - G.energia); G.energia += e; lines.push(`+${e} Energía.`); break; }
    case "aurum": d.nextSale = true; lines.push("Tu próxima venta paga 150%."); break;
    case "varak": c.pst.grito = 3; lines.push("¡Grito de guerra! +3 de daño durante 3 rondas."); break;
    case "lyss": d.nextTrip = 0.5; lines.push("Conoces un atajo: tu próximo viaje tarda la mitad."); break;
    case "amara": addRayos({ corazon: 5 }); lines.push("+5 Rayos de Corazón."); break;
    case "ruen": d.freeClass = true; lines.push("Tu próxima clase no gasta Energía."); break;
  }
  d.day[`b:${G.g.day}`] = 1; pruneDay();
  if (c) { clog(`Bendición de ${DIOS[id].c}: ${lines.join(" ")}`); return afterPlayer(); }
  G.g.lastResult = { title: `Bendición de ${DIOS[id].c}`, lines }; persist(); render();
}
function asterJump(r, p) {
  const d = dg(); if (!canBless() || dg().patron !== "aster") return;
  if (G.g.day - d.asterDay < 7) { toast(`Paso se puede usar otra vez el día ${d.asterDay + 7}.`); return; }
  d.asterDay = G.g.day; d.day[`b:${G.g.day}`] = 1; gsel.aster = false;
  G.g.loc = { r, p }; log(`Aster te llevó a ${P[r][p].n}.`); gtab = "lugar";
  G.g.lastResult = { title: "Paso de Aster", lines: [`Apareces en ${P[r][p].n}.`] }; persist(); render();
}
function canMiracle() { const d = dg(); return d.patron && godLevel() >= 100 && d.miracleArc < currentArc() && G.g.combat; }
function currentArc() { return worldCap() > STORY.length ? ARCS.length + 1 : arcOf(worldCap()).n; }
function miracle() {
  if (!canMiracle()) return; const d = dg(); const c = G.g.combat; d.miracleArc = currentArc();
  G.pv = G.pvMax; for (const e of c.enemies) if (e.pv > 0) e.pv = Math.max(0, e.pv - Math.ceil(e.pvMax / 2));
  clog(`¡Milagro! El avatar de ${DIOS[d.patron].c} aparece: te cura por completo y golpea a todos los enemigos.`);
  log(`${DIOS[d.patron].c} hizo un milagro.`);
  if (!c.enemies.some((e) => e.pv > 0)) return victory(); persist(); render();
}
function solenLight() { // al cerrar un capítulo: +1% de Luz por cada 25 de favor con Solen del grupo
  let pts = 0; for (const ch of Store.all) { const f = ch.g?.dioses?.favor?.solen || 0; const camp = ch.g?.dioses?.patron === "solen" && ch.g.dioses.campeon; pts += f * (camp ? 2 : 1); }
  return Math.floor(pts / 25);
}

// ---------- vistas ----------
function favorBar(id) { const f = favorOf(id); return `<span class="bar fv"><i style="width:${f}%"></i></span>`; }
function templeCard(id) {
  const x = DIOS[id]; const d = dg(); const f = favorOf(id); const isP = d.patron === id;
  if (id === "vaelmor") {
    const has = pactoVaelmor();
    return `<div class="card god dark"><div class="row between"><h3>🌑 ${esc(x.n)}</h3><span class="pill">Caído</span></div>
      <p class="note">Desde el fondo de la grieta algo respira. No hay templo, solo una piedra negra con marcas de manos.</p>
      <p>${esc(x.dev)}. ${esc(x.ele)}.</p>
      ${has ? `<button type="button" class="btn danger small" data-g="pacto:no">Romper el pacto</button>` : `<button type="button" class="btn danger small" data-g="pacto:si">Hacer un pacto en secreto</button>`}
      <p class="note">El pacto se guarda en tu parte privada: tus amigos no lo ven.</p></div>`;
  }
  if (godFallen(id)) return `<div class="card god dark"><h3>🕯️ ${esc(x.n)}</h3><p class="note">El grupo dejó caer a ${esc(x.c)}. Su templo está vacío y frío; ya no responde a nadie.</p></div>`;
  if (godCorrupt(id)) return `<div class="card god dark"><div class="row between"><h3>🌑 ${esc(x.n)}</h3><span class="pill">Corrupto</span></div>
    <p>La sombra de Vaelmor envuelve a ${esc(x.c)}. Mientras siga así, el sol pierde 2% de luz cada capítulo y sus devotos no tienen bendición de Elegido.</p>
    <button type="button" class="btn primary small" data-g="liberar:${id}">⚔️ Liberar a ${esc(x.c)} (avatar corrupto, nivel ${CORRUPT_LVL[id] || 30})</button></div>`;
  const need = swearNeed(id); const prayed = d.day[`p:${id}:${G.g.day}`];
  const gift = x.gusta.find((n) => G.g.inv[n]);
  return `<div class="card god"><div class="row between"><h3>🛕 ${esc(x.n)}</h3><span class="pill">${esc(x.t)}${x.afin ? " · " + esc(x.afin) : ""}</span></div>
    <p class="muted">Tabú: ${esc(x.tabu)} · Le gusta: ${esc(x.gusta.join(", "))}</p>
    <div class="row"><span>Favor ${f}${isP ? " · tu patrón (" + LEVEL_NAME[godLevel()] + ")" : f >= 24 ? " (máximo sin juramento)" : ""}</span>${favorBar(id)}</div>
    ${godCorrupt(id) ? `<div class="warn">La Orden corrompió a ${esc(x.c)}. Sus devotos pierden la bendición de Elegido hasta liberarlo.</div>` : ""}
    <div class="row" style="margin-top:8px">
      <button type="button" class="btn small" data-g="pray:${id}" ${prayed ? "disabled" : ""}>${prayed ? "Ya rezaste hoy" : "🙏 Rezar (1 h)"}</button>
      <button type="button" class="btn small ghost" data-g="offer:${id}">${gift ? `Ofrecer ${esc(gift)} (+5)` : "Ofrenda de 10 Soles (+2)"}</button>
      ${!d.patron && f >= need ? `<button type="button" class="btn small primary" data-g="swear:${id}">Jurar lealtad</button>` : ""}
      ${!d.patron && f < need ? `<span class="note">Jurar pide ${need} de favor.</span>` : ""}
      ${isP && f >= 75 && !d.campeon ? `<button type="button" class="btn small primary" data-g="trial">⚔️ Prueba del Campeón</button>` : ""}
    </div></div>`;
}
function templeBlock(r, p) {
  const gs = godsAt(r, p); if (!gs.length) return ""; claimLiberations();
  dg().visited[`${r}:${p}`] = dg().visited[`${r}:${p}`] || godsAt(r, p).some((x) => !["brasa", "lyss"].includes(x));
  const major = gs.filter((x) => !["brasa", "lyss"].includes(x)); const minor = gs.filter((x) => ["brasa", "lyss"].includes(x));
  return `<h3 class="sub">${major.length ? "Templo" : "Altares"}</h3>${major.map(templeCard).join("")}${minor.length ? `<details class="card mini"><summary>Altares de ${minor.map((x) => DIOS[x].c).join(" y ")}</summary>${minor.map(templeCard).join("")}</details>` : ""}`;
}
function diosesView() {
  claimLiberations(); const d = dg(); const lv = godLevel(); const p = d.patron && DIOS[d.patron];
  const temples = templePlaces();
  return `<div class="row between"><h2>Dioses</h2>${p ? `<span class="pill ok">Patrón: ${esc(p.c)} · ${LEVEL_NAME[lv]}</span>` : `<span class="pill">Sin dios patrón</span>`}</div>
    ${p ? `<div class="card"><div class="row between"><h3>${esc(p.n)}</h3><span>Favor ${favorOf(d.patron)} ${favorBar(d.patron)}</span></div>
      <dl><dt>Devoto</dt><dd>${lv >= 25 ? "✓ " : ""}${esc(p.dev)}</dd><dt>Elegido</dt><dd>${lv >= 50 ? "✓ " : ""}${esc(p.ele)}</dd><dt>Campeón</dt><dd>${lv >= 75 ? "✓ " : ""}${esc(p.cam)}</dd><dt>Avatar</dt><dd>${lv >= 100 ? "✓ " : ""}Milagro una vez por arco en combate: te cura del todo y quita la mitad de la vida a los enemigos</dd></dl>
      <div class="row">${lv >= 50 ? `<button type="button" class="btn primary small" data-g="bless" ${canBless() ? "" : "disabled"}>${canBless() ? "Usar bendición" : "Bendición usada hoy"}</button>` : ""}
        ${d.patron === "norna" && lv >= 25 ? `<button type="button" class="btn small" data-g="norna" ${d.day["n:" + G.g.day] ? "disabled" : ""}>+1 a mi próxima tirada</button>` : ""}
        <button type="button" class="btn ghost small" data-g="renounce">Renunciar</button></div>
      ${gsel.aster ? `<h3 class="sub">¿A qué templo?</h3><div class="places">${temples.filter((t) => d.visited[`${t.r}:${t.p}`]).map((t) => `<button type="button" class="pl" data-g="aster:${t.r}:${t.p}"><span>🛕 ${esc(t.pl.n)}</span><small>${esc(regionName(t.r))}</small></button>`).join("") || `<p class="muted">Aún no has visitado ningún templo.</p>`}</div>` : ""}
      ${favorOf(d.patron) >= 75 && !d.campeon ? `<p class="note">Para ser Campeón ve a su templo y vence a su avatar.</p>` : ""}</div>`
      : `<p class="lead">Reza y haz ofrendas en los templos para ganar favor. Con 25 de favor (40 para los dioses abstractos) puedes jurarle lealtad a uno y recibir sus bendiciones.${G.g.day < d.banUntil ? ` Podrás jurar otra vez el día ${d.banUntil}.` : ""}</p>`}
    <table class="tt"><thead><tr><th>Deidad</th><th>Dominio</th><th>Templo</th><th>Favor</th></tr></thead><tbody>
    ${DIOSES.filter((x) => x.id !== "vaelmor").map((x) => { const t = temples.find((y) => y.g.includes(x.id)); const where = x.id === "brasa" ? "Cualquier posada" : x.id === "lyss" ? "Cualquier pueblo o puerto" : t ? `${t.pl.n} (${regionName(t.r)})` : "—";
      return `<tr class="${d.patron === x.id ? "hit" : ""}"><td><b>${esc(x.c)}</b> <small class="muted">${esc(x.t)}</small></td><td>${esc(x.afin || "—")}</td><td>${t ? `<button type="button" class="link" data-go="${t.r}:${t.p}">${esc(where)}</button>` : esc(where)}</td><td>${godFallen(x.id) ? "Caído" : godCorrupt(x.id) ? `${favorOf(x.id)} · corrupto` : favorOf(x.id)}</td></tr>`; }).join("")}</tbody></table>
    <details class="card mini"><summary>Qué da cada dios</summary><table class="tt"><thead><tr><th>Deidad</th><th>Devoto (25)</th><th>Elegido (50)</th><th>Campeón (75)</th></tr></thead><tbody>
      ${DIOSES.filter((x) => x.id !== "vaelmor").map((x) => `<tr><td>${esc(x.c)}</td><td>${esc(x.dev)}</td><td>${esc(x.ele)}</td><td>${esc(x.cam)}</td></tr>`).join("")}</tbody></table></details>
    <p class="note">Solen sostiene el sol: al cerrar cada capítulo, la Luz sube 1% por cada 25 de favor con Solen que sume el grupo.</p>`;
}
function combatGodButtons() {
  const d = dg(); const out = [];
  if (d.patron && godLevel() >= 50) out.push(`<button type="button" class="btn" data-g="bless" ${canBless() && d.patron !== "aster" ? "" : "disabled"}>✨ ${esc(DIOS[d.patron].ele.split(":")[0])}</button>`);
  if (canMiracle()) out.push(`<button type="button" class="btn primary" data-g="miracle">🌟 Milagro</button>`);
  return out.join("");
}

// ---------- eventos ----------
document.addEventListener("click", (ev) => {
  if (view.name !== "game" || !G) return;
  const t = ev.target.closest("button"); if (!t) return; const g = t.dataset.g; if (!g) return;
  const [a, b, c2] = g.split(":");
  if (a === "pray") return pray(b);
  if (a === "liberar" && DIOS[b]) { gsel.libGod = b; return freeGod(); }
  if (a === "offer") return offer(b);
  if (a === "swear") return swear(b);
  if (a === "renounce") return renounce();
  if (a === "trial") return trial();
  if (a === "bless") return bless();
  if (a === "miracle") return miracle();
  if (a === "aster") return asterJump(b, +c2);
  if (a === "pacto") return pacto(b === "si");
  if (a === "norna") { const d = dg(); d.day["n:" + G.g.day] = 1; d.nextPlus = true; toast("+1 a tu próxima tirada."); persist(); return render(); }
});
