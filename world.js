// ===== Mundo: regiones, lugares, rutas y clima (del mapa interactivo) =====
const CLIMAS = {
  "Despejado": { icon: "☀️", up: ["Luz", "Fuego"], down: ["Sombra"] },
  "Lluvia": { icon: "🌧️", up: ["Agua", "Rayo"], down: ["Fuego"] },
  "Nieve o granizo": { icon: "❄️", up: ["Agua (Hielo)"], down: ["Aire"] },
  "Niebla": { icon: "🌫️", up: ["Sombra"], down: ["Luz"] },
  "Tormenta": { icon: "⛈️", up: ["Rayo", "Aire"], down: ["Tierra"] },
  "Ola de calor": { icon: "🔥", up: ["Fuego", "Tierra"], down: ["Agua"] },
};
const R = [
  { id: "alba", name: "Valle del Alba", aff: "Luz", lvl: "1–10", shape: [920, 530, 130, 95],
    desc: "Praderas y acantilados en la costa este, donde el sol sale primero. Aquí está Sunrise Academy y el pueblo de Amanecer, donde empieza todo.",
    acts: ["Descansar", "Estudiar en la academia", "Entrenar", "Comerciar", "Aceptar misiones"],
    res: [["Directora Aurelia Solenne", "Dirige Sunrise Academy"], ["Profesor Kael Dorn", "Instructor de combate"], ["Mira", "Tabernera de Amanecer"]],
    fixed: ["Hierba del alba", "Pan de miel"],
    wx: { "Despejado": ["Pétalos solares", "Cristal de luz"], "Lluvia": ["Setas doradas"], "Niebla": ["Rocío del amanecer"], "Tormenta": ["Fragmento de trueno"] } },
  { id: "verde", name: "Bosque de Verdemar", aff: "Tierra", lvl: "5–15", shape: [320, 370, 230, 185],
    desc: "Bosques antiguos, lagos y cascadas al oeste. Aldeas construidas en los árboles y ruinas cubiertas de musgo.",
    acts: ["Descansar", "Recolectar", "Cazar", "Explorar ruinas", "Aceptar misiones"],
    res: [["Sylwen", "Anciana élfica, guardiana del bosque"], ["Tarek", "Guardabosques bestial"], ["Musgoviejo", "Ent que casi nunca habla"]],
    fixed: ["Madera antigua", "Musgo curativo"],
    wx: { "Despejado": ["Bayas de sol"], "Lluvia": ["Setas brillantes", "Perlas de río"], "Niebla": ["Flor de hada"], "Tormenta": ["Savia cargada"] } },
  { id: "llan", name: "Llanuras Doradas", aff: "Aire", lvl: "10–20", shape: [590, 500, 195, 140],
    desc: "Sabanas y trigales en el centro sur, cruzados por ríos y rutas de caravanas. Aquí está el mercado más grande del continente.",
    acts: ["Comerciar en el Gran Mercado", "Viajar en caravana", "Aceptar misiones", "Descansar"],
    res: [["Bako", "Mercader bestial (zorro)"], ["Rhea", "Capitana de caravana"], ["El Oráculo del Viento", "Vende profecías a buen precio"]],
    fixed: ["Trigo dorado", "Plumas comunes"],
    wx: { "Despejado": ["Grano solar"], "Tormenta": ["Pluma de grifo (rara)"], "Ola de calor": ["Sal de viento"], "Lluvia": ["Trébol de cuatro hojas"] } },
  { id: "costa", name: "Costa Tormenta", aff: "Rayo", lvl: "15–30", shape: [930, 740, 150, 125],
    desc: "Islas y acantilados al sureste, con faros y tormentas que nunca paran. Territorio de piratas.",
    acts: ["Navegar", "Pescar", "Comerciar con piratas", "Aceptar misiones"],
    res: [["Capitán Varo «Trueno»", "Pirata, dueño de medio puerto"], ["Isolde", "Farera sirénida"]],
    fixed: ["Coral azul", "Sal marina"],
    wx: { "Tormenta": ["Fragmento de trueno", "Perla eléctrica"], "Lluvia": ["Perla de mar"], "Niebla": ["Mapa de un naufragio"], "Despejado": ["Conchas"] } },
  { id: "esc", name: "Picos Escarcha", aff: "Agua (Hielo)", lvl: "20–35", shape: [650, 185, 195, 125],
    desc: "Montañas nevadas en el norte central. Monasterios escondidos, cuevas congeladas y torres de vigía.",
    acts: ["Entrenar en el monasterio", "Minar", "Escalar", "Descansar"],
    res: [["Maestro Durgan", "Herrero enano"], ["Hermana Kiri", "Monja del monasterio"], ["El Yeti", "Nadie sabe si es amigo"]],
    fixed: ["Cristal de hielo", "Piel de lobo blanco"],
    wx: { "Nieve o granizo": ["Flor de escarcha", "Cristal eterno"], "Despejado": ["Mineral de plata"], "Niebla": ["Esencia helada"], "Tormenta": ["Granizo mágico"] } },
  { id: "quem", name: "Tierras Quemadas", aff: "Fuego", lvl: "25–40", shape: [510, 800, 235, 165],
    desc: "Desierto de roca y volcanes en la península sur, con ríos de lava. Forjas, minas de gemas y dragones de lava.",
    acts: ["Forjar", "Minar gemas", "Cazar", "Aceptar misiones"],
    res: [["Ignara", "Herrera dracónida"], ["Rukh", "Domador de salamandras"]],
    fixed: ["Obsidiana", "Carbón ardiente"],
    wx: { "Ola de calor": ["Sal de fuego", "Arena de vidrio"], "Despejado": ["Rubí en bruto"], "Tormenta": ["Ceniza cargada"], "Lluvia": ["Vapor alquímico"] } },
  { id: "viol", name: "Páramo Violeta", aff: "Sombra", lvl: "30–50", shape: [860, 350, 150, 95],
    desc: "Ciénaga morada con niebla eterna, al este de los picos. Brujas, maldiciones y la entrada a lo que hay debajo.",
    acts: ["Hacer tratos con brujas", "Romper maldiciones", "Explorar el subsuelo"],
    res: [["Morwen", "Bruja umbría"], ["El Barquero", "Cruza la ciénaga por un precio"]],
    fixed: ["Flor nocturna", "Agua negra"],
    wx: { "Niebla": ["Esencia de sombra", "Pétalo de luna"], "Lluvia": ["Setas venenosas"], "Tormenta": ["Fragmento maldito"], "Despejado": ["Cristal violeta (raro)"] } },
  { id: "cap", name: "Capital de Solvaria", aff: "Ninguna (todas)", lvl: "10–30", shape: [955, 200, 110, 105],
    desc: "Ciudad amurallada en las montañas del noreste. Aquí viven el rey y la nobleza, y se reúnen los gremios y los torneos.",
    acts: ["Visitar gremios", "Participar en torneos", "Comerciar", "Pedir audiencia", "Descansar"],
    res: [["Rey Aldric III", "Gobierna Solvaria"], ["Gran Maestre Oren", "Líder de los gremios"], ["Capitana Lysa", "Jefa de la guardia real"]],
    fixed: ["Mercancía de gremio"],
    wx: { "Despejado": ["Invitación a un torneo"], "Lluvia": ["Rumores de palacio"], "Niebla": ["Contrabando"], "Tormenta": ["Mensaje sellado"] } },
  { id: "lost", name: "Islas Perdidas", aff: "Abstractas", lvl: "60+", shape: [150, 720, 115, 120],
    desc: "Islas flotantes fuera del mapa, envueltas en el Mar de Bruma. Aquí nacieron las afinidades abstractas; casi nadie vuelve.",
    acts: ["Explorar (nivel 60 o más)"],
    res: [["???", "Nadie sabe quién vive aquí"]],
    fixed: ["Polvo de estrella"],
    wx: { "Niebla": ["Esencia abstracta"], "Tormenta": ["Fragmento de tiempo"], "Despejado": ["Nada visible"] } },
];

// ===== Lugares por región =====
// t: tipo; lvl: nivel; h: horas a pie desde el centro de la región; xy: posición en el mapa (1080×1024)
const T = {
  pueblo: { icon: "🏘️", name: "Pueblo" }, academia: { icon: "🏛️", name: "Academia" }, ciudad: { icon: "🏰", name: "Ciudad" },
  zona: { icon: "🌿", name: "Zona de recolección" }, mina: { icon: "⛏️", name: "Mina" }, mazmorra: { icon: "🕳️", name: "Mazmorra" },
  jefe: { icon: "💀", name: "Guarida de jefe" }, guardian: { icon: "🛡️", name: "Guardián" }, arena: { icon: "⚔️", name: "Arena" },
  santuario: { icon: "✨", name: "Santuario" }, tienda: { icon: "🛒", name: "Tienda" }, puerto: { icon: "⚓", name: "Puerto" },
};
const P = {
  alba: [
    { n: "Pueblo de Amanecer", t: "pueblo", lvl: "—", h: 0, xy: [880, 522], obj: ["Posada", "Taberna de Mira", "Tienda de pociones"], mon: [], note: "Centro del Valle. Aquí se empieza la partida." },
    { n: "Sunrise Academy", t: "academia", lvl: "1+", h: 0.5, xy: [935, 478], obj: ["Libros de hechizos de Círculo 1", "Uniforme de la academia"], mon: ["Duelos de práctica"], note: "Clases, entrenamiento y el ranking de la Escalera del Alba." },
    { n: "Acantilados del Alba", t: "zona", lvl: "3–6", h: 2, xy: [990, 590], obj: ["Cristal de luz", "Hierba del alba"], mon: ["Gaviotas de fuego", "Cangrejos de roca"] },
    { n: "Faro Antiguo", t: "guardian", lvl: "6–9", h: 3, xy: [1010, 500], obj: ["Esencia de temple (+1 Voluntad)", "Mapa del tesoro"], mon: ["Espectros menores"], boss: "Espectro de la Torre (nivel 9)" },
    { n: "Cueva del Primer Rayo", t: "guardian", lvl: "8–12", h: 4, xy: [850, 578], obj: ["Esencia de roca (+1 Defensa/Resistencia)", "Amuleto del alba"], mon: ["Murciélagos de cuarzo"], boss: "Gólem de Basalto (nivel 12)" },
  ],
  verde: [
    { n: "Aldea Copaalta", t: "pueblo", lvl: "—", h: 0, xy: [330, 300], obj: ["Posada en los árboles", "Arquero élfico (tienda)"], mon: [], note: "Aldea élfica construida en las copas." },
    { n: "Lago Espejo", t: "zona", lvl: "6–10", h: 3, xy: [250, 385], obj: ["Perlas de río", "Escama de tortuga ancestral (muy rara, luna llena)"], mon: ["Nixies", "Sapos gigantes"] },
    { n: "Cascada de los Susurros", t: "santuario", lvl: "8–12", h: 5, xy: [190, 470], obj: ["Té de loto lunar (+1 Sabiduría)", "Agua bendita"], mon: ["Espíritus del agua"] },
    { n: "Ruinas de Musgo", t: "mazmorra", lvl: "10–15", h: 6, xy: [430, 280], obj: ["Seda de araña", "Arco élfico"], mon: ["Gólems de musgo", "Arañas tejedoras"], boss: "Reina Araña Tejesombra (nivel 15)" },
    { n: "Guarida del Lobo de Sombra", t: "guardian", lvl: "14–16", h: 8, xy: [400, 435], obj: ["Esencia veloz (+1 Agilidad & Velocidad)"], mon: ["Lobos del bosque"], boss: "Lobo de Sombra (nivel 16)" },
  ],
  llan: [
    { n: "Trigalia, el Gran Mercado", t: "ciudad", lvl: "—", h: 0, xy: [600, 455], obj: ["El mercado más grande de Solvaria", "Establos (caballos)", "Caravanas"], mon: [], note: "Todo se compra y se vende aquí." },
    { n: "Callejones de Trigalia", t: "guardian", lvl: "10+", h: 0.5, xy: [640, 485], obj: ["Esencia de fortuna (+1 Suerte)", "Trébol de siete hojas (legendario)"], mon: ["Ladrones"], boss: "Gato de las Mil Vidas (aparece al azar)" },
    { n: "Campos de Trigo", t: "zona", lvl: "10–13", h: 2, xy: [515, 525], obj: ["Trigo dorado", "Grano solar"], mon: ["Escarabajos gigantes", "Espantapájaros vivientes"] },
    { n: "Arena del Viento", t: "arena", lvl: "12–20", h: 1, xy: [555, 590], obj: ["Premios de torneo", "Puntos de Poder (Escalera del Alba)"], mon: ["Duelos contra luchadores"] },
    { n: "Nidos del Grifo", t: "zona", lvl: "14–18", h: 6, xy: [695, 425], obj: ["Pluma de grifo (+1 Agilidad & Velocidad)"], mon: ["Grifos salvajes"] },
    { n: "Laberinto del Minotauro", t: "guardian", lvl: "18–20", h: 10, xy: [655, 565], obj: ["Esencia de bravura (+1 Fuerza)", "Hacha de bronce"], mon: ["Bestias del laberinto"], boss: "Minotauro (nivel 20)" },
  ],
  costa: [
    { n: "Puerto Rayo", t: "puerto", lvl: "—", h: 0, xy: [880, 720], obj: ["Barcos a otras regiones", "Mercado pirata"], mon: [], note: "Único puerto con barcos a las Islas Perdidas." },
    { n: "Faro de Isolde", t: "santuario", lvl: "15+", h: 1, xy: [990, 715], obj: ["Perfume de sirena (+1 Carisma)", "Mapas del mar"], mon: [] },
    { n: "Arrecife Chispeante", t: "zona", lvl: "15–20", h: 3, xy: [840, 800], obj: ["Perla eléctrica", "Coral azul"], mon: ["Anguilas de trueno", "Medusas de rayo"], note: "Se llega en bote." },
    { n: "Barco Fantasma", t: "mazmorra", lvl: "22–26", h: 8, xy: [960, 835], obj: ["Brújula maldita", "Oro pirata"], mon: ["Marineros ahogados"], boss: "Capitana Ahogada (nivel 26)" },
    { n: "Ojo de la Tormenta", t: "jefe", lvl: "28–30", h: 12, xy: [1015, 660], obj: ["Escama de trueno", "Tridente de rayo (arma mágica)"], mon: ["Elementales de tormenta"], boss: "Serpiente de Trueno (nivel 30)" },
  ],
  esc: [
    { n: "Monasterio Nube Blanca", t: "pueblo", lvl: "—", h: 0, xy: [600, 205], obj: ["Entrenamiento de Voluntad y Defensa", "Posada del monasterio"], mon: [], note: "La Hermana Kiri entrena a quien lo pida." },
    { n: "Minas de Plata de Durgan", t: "mina", lvl: "20–24", h: 4, xy: [705, 225], obj: ["Mineral de plata", "Armas enanas"], mon: ["Kóbolds de hielo"] },
    { n: "Cueva Congelada", t: "mazmorra", lvl: "25–30", h: 8, xy: [540, 150], obj: ["Cristal eterno", "Flor de escarcha"], mon: ["Lobos blancos", "Elementales de hielo"], boss: "Wyrm de Escarcha (nivel 30)" },
    { n: "Torre del Búho Anciano", t: "guardian", lvl: "28–32", h: 24, xy: [765, 160], obj: ["Esencia de visión (+1 Sabiduría)"], mon: ["Cuervos de hielo"], boss: "Búho Anciano (nivel 32)" },
    { n: "Cumbre del Yeti", t: "zona", lvl: "30–35", h: 36, xy: [655, 95], obj: ["Piel de yeti", "Piedra de cumbre"], mon: ["Yetis salvajes"] },
  ],
  quem: [
    { n: "Forjaroja", t: "ciudad", lvl: "—", h: 0, xy: [565, 745], obj: ["Forja de Ignara", "Armas y armaduras de fuego"], mon: [], note: "La mejor forja de Solvaria." },
    { n: "Minas de Rubí", t: "mina", lvl: "25–30", h: 4, xy: [440, 760], obj: ["Rubí en bruto", "Carbón ardiente"], mon: ["Salamandras"] },
    { n: "Mar de Ceniza", t: "zona", lvl: "28–33", h: 8, xy: [385, 845], obj: ["Sal de fuego", "Arena de vidrio"], mon: ["Gusanos de arena"] },
    { n: "Cuevas de los Troles", t: "mazmorra", lvl: "30–34", h: 10, xy: [605, 865], obj: ["Corazón de trol (+1 Fuerza)"], mon: ["Troles de lava"], boss: "Rey Trol (nivel 34)" },
    { n: "Cráter del Dragón", t: "jefe", lvl: "38–40", h: 48, xy: [480, 690], obj: ["Escama de dragón", "Cristal de potencial (legendario)"], mon: ["Dracos menores"], boss: "Pyrax, Dragón de Lava (nivel 40)" },
  ],
  viol: [
    { n: "Muelle del Barquero", t: "pueblo", lvl: "—", h: 0, xy: [800, 385], obj: ["Barca por la ciénaga", "Refugio"], mon: [], note: "Sin el Barquero no se cruza el páramo." },
    { n: "Choza de Morwen", t: "tienda", lvl: "30+", h: 3, xy: [885, 300], obj: ["Pociones prohibidas", "Romper maldiciones"], mon: [] },
    { n: "Bosque Marchito", t: "zona", lvl: "30–36", h: 6, xy: [760, 330], obj: ["Flor nocturna", "Pétalo de luna"], mon: ["Espectros", "Brujas menores"] },
    { n: "Salón de Baile Hundido", t: "guardian", lvl: "38–42", h: 12, xy: [935, 385], obj: ["Esencia de encanto (+1 Carisma o Lujuria)", "Rosa carmesí"], mon: ["Bailarines sombríos"], boss: "Súcubo o Íncubo del Salón (nivel 42)" },
    { n: "La Entrada de Abajo", t: "jefe", lvl: "45–50", h: 48, xy: [845, 425], obj: ["Piedra del silencio (+1 Voluntad)", "Fragmento maldito"], mon: ["Criaturas del subsuelo"], boss: "El Que Duerme Debajo (nivel 50)" },
  ],
  cap: [
    { n: "Plaza Real", t: "ciudad", lvl: "—", h: 0, xy: [950, 175], obj: ["Castillo del rey", "Posada real", "Tablón de misiones"], mon: [], note: "Corazón de la capital." },
    { n: "Barrio de los Gremios", t: "tienda", lvl: "10+", h: 0.5, xy: [1005, 235], obj: ["Fabricar", "Encantamientos", "Pergamino de Reasignación"], mon: [] },
    { n: "Coliseo Real", t: "arena", lvl: "15–30", h: 0.5, xy: [900, 225], obj: ["Premios de torneo", "Puntos de Fama (Escalera del Alba)"], mon: ["Campeones del coliseo"] },
    { n: "Archivo de la Esfinge", t: "guardian", lvl: "25–30", h: 1, xy: [965, 118], obj: ["Esencia de enigma (+1 Inteligencia)", "Pergamino del sabio (+1 Inteligencia)"], mon: ["Libros vivientes"], boss: "La Esfinge (nivel 30)" },
    { n: "Alcantarillas", t: "mazmorra", lvl: "10–15", h: 1, xy: [1015, 165], obj: ["Contrabando", "Llave maestra"], mon: ["Ratas gigantes", "Contrabandistas"], boss: "Rey de las Ratas (nivel 15)" },
  ],
  lost: [
    { n: "Isla del Umbral", t: "puerto", lvl: "60+", h: 0, xy: [190, 680], obj: ["Polvo de estrella"], mon: ["Guardianes de bruma"], note: "Donde atracan los pocos barcos que llegan." },
    { n: "Torre del Reloj Roto", t: "mazmorra", lvl: "65+", h: 6, xy: [110, 650], obj: ["Fragmento de tiempo"], mon: ["Ecos del pasado"], boss: "El Relojero (nivel 70)" },
    { n: "Jardín del Vacío", t: "zona", lvl: "70+", h: 12, xy: [155, 785], obj: ["Esencia abstracta"], mon: ["Criaturas sin forma"] },
    { n: "Trono de la Creación", t: "jefe", lvl: "80+", h: 24, xy: [85, 745], obj: ["??? (nadie lo ha visto)"], mon: [], boss: "El Primer Abstracto (nivel ???)" },
  ],
};

// ===== Rutas entre regiones (horas a pie; sea = solo en barco) =====
const EDGES = [
  ["alba", "cap", 24], ["alba", "viol", 30], ["alba", "llan", 36], ["alba", "costa", 18],
  ["llan", "verde", 36], ["llan", "esc", 40], ["llan", "quem", 30], ["llan", "viol", 30], ["llan", "costa", 36],
  ["esc", "verde", 40], ["esc", "cap", 36], ["esc", "viol", 30], ["viol", "cap", 24], ["verde", "quem", 44],
  ["costa", "quem", 30, "sea"], ["costa", "alba", 10, "sea"], ["costa", "lost", 72, "sea"], ["verde", "lost", 80, "sea"],
];
const MODES = {
  pie: { name: "A pie", icon: "🥾", mult: 1, note: "Gratis" },
  caballo: { name: "A caballo", icon: "🐎", mult: 0.5, note: "Hay que alquilar o comprar un caballo" },
  caravana: { name: "En caravana", icon: "🛻", mult: 0.75, note: "Más lenta que el caballo, pero más segura: el riesgo del viaje baja un nivel" },
};
const SEA_HOURS_MULT = 1; // el barco va a su propia velocidad
const HOURS_PER_DAY = 10; // horas de viaje por día; el resto es descanso

function neighbors(id, mode) {
  const out = [];
  for (const [a, b, h, kind] of EDGES) {
    const sea = kind === "sea";
    const cost = sea ? h * SEA_HOURS_MULT : h * MODES[mode].mult;
    if (a === id) out.push([b, cost, sea]);
    if (b === id) out.push([a, cost, sea]);
  }
  return out;
}
function route(from, to, mode) {
  const dist = {}, prev = {}, how = {}; const q = new Set(R.map((r) => r.id));
  for (const id of q) dist[id] = Infinity; dist[from] = 0;
  while (q.size) {
    let u = null; for (const id of q) if (u === null || dist[id] < dist[u]) u = id;
    q.delete(u); if (u === to) break;
    for (const [v, c, sea] of neighbors(u, mode)) if (dist[u] + c < dist[v]) { dist[v] = dist[u] + c; prev[v] = u; how[v] = sea; }
  }
  const path = []; let c = to; while (c && c !== from) { path.unshift({ id: c, sea: how[c] }); c = prev[c]; }
  return { hours: dist[to], path };
}
function fmtH(h) {
  if (h === 0) return "aquí mismo";
  if (h < 1) return `${Math.round(h * 60)} min`;
  const days = Math.floor(h / HOURS_PER_DAY), rest = Math.round((h % HOURS_PER_DAY) * 10) / 10;
  const hh = `${Math.round(h * 10) / 10} h`;
  if (days === 0) return hh;
  return `${hh} · ${days} ${days === 1 ? "día" : "días"}${rest ? ` y ${rest} h` : ""} de viaje`;
}

