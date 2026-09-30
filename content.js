// ===== Magia =====
// [nombre, categoría, círculo, tipo, valor, estado]  tipo: dmg | heal | shield | buff | status
const CAT_BASE = { Utilidad: 5, Apoyo: 10, Defensa: 10, Control: 15, Ataque: 15, "Invocación": 20, "Transformación": 20, Ritual: 30 };
const CIRC_MULT = { 1: 1, 2: 5, 3: 15, 4: 40, 5: 100 };
const ABSTRACT = ["Gravedad", "Tiempo", "Espacio", "Realidad", "Creación", "Destino", "Alma"];
const SPELLS = {
  Fuego: [["Chispa", "Ataque", 1, "dmg", 10, "Quemado"], ["Brasa protectora", "Defensa", 1, "shield", 2], ["Bola de fuego", "Ataque", 2, "dmg", 25], ["Lluvia de fuego", "Ataque", 3, "dmg", 50, "Quemado"]],
  Agua: [["Chorro de agua", "Ataque", 1, "dmg", 10], ["Rocío", "Apoyo", 1, "heal", 15], ["Lanza de hielo", "Ataque", 2, "dmg", 25, "Aturdido"], ["Marea sanadora", "Apoyo", 3, "heal", 60]],
  Tierra: [["Pedrada", "Ataque", 1, "dmg", 10], ["Piel de piedra", "Defensa", 1, "shield", 2], ["Temblor", "Control", 2, "dmg", 20, "Aturdido"], ["Muralla viva", "Defensa", 3, "shield", 4]],
  Aire: [["Ráfaga", "Ataque", 1, "dmg", 10], ["Paso de viento", "Utilidad", 1, "buff", 1], ["Cuchillas de viento", "Ataque", 2, "dmg", 25], ["Tornado", "Control", 3, "dmg", 45, "Aturdido"]],
  Rayo: [["Descarga", "Ataque", 1, "dmg", 10, "Aturdido"], ["Reflejos eléctricos", "Utilidad", 1, "buff", 1], ["Relámpago", "Ataque", 2, "dmg", 28], ["Tormenta de rayos", "Ataque", 3, "dmg", 55]],
  Luz: [["Destello", "Control", 1, "status", 0, "Cegado"], ["Luz sanadora", "Apoyo", 1, "heal", 15], ["Lanza de luz", "Ataque", 2, "dmg", 25], ["Juicio solar", "Ataque", 3, "dmg", 55]],
  Sombra: [["Toque sombrío", "Ataque", 1, "dmg", 10], ["Velo", "Utilidad", 1, "shield", 2], ["Maldición", "Control", 2, "dmg", 18, "Asustado"], ["Abismo", "Ataque", 3, "dmg", 55]],
  Gravedad: [["Peso", "Control", 1, "status", 0, "Aturdido"], ["Presión", "Ataque", 2, "dmg", 30], ["Singularidad", "Ataque", 3, "dmg", 65]],
  Tiempo: [["Instante", "Utilidad", 1, "buff", 1], ["Aceleración", "Utilidad", 2, "buff", 2], ["Pausa", "Control", 3, "dmg", 30, "Aturdido"]],
  Espacio: [["Paso corto", "Utilidad", 1, "shield", 2], ["Distorsión", "Ataque", 2, "dmg", 30], ["Portal cortante", "Ataque", 3, "dmg", 60]],
  Realidad: [["Duda", "Control", 1, "status", 0, "Cegado"], ["Reescribir herida", "Apoyo", 2, "heal", 40], ["Negación", "Ataque", 3, "dmg", 65]],
  "Creación": [["Moldear escudo", "Defensa", 1, "shield", 2], ["Espada invocada", "Invocación", 2, "dmg", 30], ["Aliento de vida", "Apoyo", 3, "heal", 70]],
  Destino: [["Augurio", "Utilidad", 1, "buff", 1], ["Hilo cortado", "Ataque", 2, "dmg", 30], ["Fortuna", "Apoyo", 3, "heal", 50]],
  Alma: [["Lectura del alma", "Utilidad", 1, "buff", 1], ["Vínculo sanador", "Apoyo", 2, "heal", 35], ["Posesión", "Control", 3, "dmg", 40, "Aturdido"]],
};
function spellInfo(aff, name) {
  const s = (SPELLS[aff] || []).find((x) => x[0] === name); if (!s) return null;
  const [n, cat, c, kind, val, st] = s;
  const cost = CAT_BASE[cat] * CIRC_MULT[c] * (ABSTRACT.includes(aff) ? 2 : 1);
  return { n, aff, cat, c, kind, val, st, cost };
}
function spellDesc(sp) {
  const k = { dmg: `Daño ${sp.val}`, heal: `Cura ${sp.val} PV`, shield: `Escudo ${sp.val} turnos (mitad de daño)`, buff: `Ventaja en ${sp.val} tirada${sp.val > 1 ? "s" : ""}`, status: "" }[sp.kind];
  return [k, sp.st ? `Estado: ${sp.st}` : ""].filter(Boolean).join(" · ");
}
const STATUS_INFO = { Quemado: "−5 PV al empezar su turno (3 turnos)", Aturdido: "Pierde su próximo turno", Cegado: "Sus ataques tienen desventaja (2 turnos)", Asustado: "Hace la mitad de daño (2 turnos)" };
const ADV = { Fuego: "Aire", Aire: "Tierra", Tierra: "Rayo", Rayo: "Agua", Agua: "Fuego", Luz: "Sombra", Sombra: "Luz" };
function affMult(att, def) {
  if (!att || !def) return 1;
  if (ADV[att] === def) return 1.5;
  if (ADV[def] === att && !(att === "Luz" || att === "Sombra")) return 0.5;
  return 1;
}
const REGION_AFF = { alba: "Luz", verde: "Tierra", llan: "Aire", costa: "Rayo", esc: "Agua", quem: "Fuego", viol: "Sombra", cap: null, lost: null };

// ===== Armas y tienda =====
const WEAPONS = { "Puños": 5, "Hacha pesada": 15, "Espada de fuego": 22, "Arco de rayo": 22, "Báculo de luz": 22, "Guadaña de sombra": 26, "Kunais de rayo": 18, "Mandoble de escarcha": 28, "Martillo de roca": 27, "Abanico del vendaval": 20, "Katana de luz": 24 };
for (const [n, [p]] of Object.entries(ARMAS_INFO)) WEAPONS[n] = p;
const WEAPON_AFF = { "Espada de fuego": "Fuego", "Arco de rayo": "Rayo", "Báculo de luz": "Luz", "Guadaña de sombra": "Sombra", "Kunais de rayo": "Rayo", "Mandoble de escarcha": "Agua", "Martillo de roca": "Tierra", "Abanico del vendaval": "Aire", "Katana de luz": "Luz" };
const WEAPON_TRAITS = { ...Object.fromEntries(Object.entries(ARMAS_INFO).map(([n, [, t]]) => [n, t])), "Hacha pesada": ["pesada"], "Guadaña de sombra": ["pesada", "critica"], "Kunais de rayo": ["doble", "alcance"], "Mandoble de escarcha": ["pesada", "aturde"], "Martillo de roca": ["pesada", "aturde"], "Abanico del vendaval": ["critica", "alcance"], "Katana de luz": ["critica"] };
const wTraits = (n) => WEAPON_TRAITS[n] || [];
const SHOP = [
  { n: "Poción de vida", precio: 5, desc: "Recupera 20 PV", kind: "potion", val: 20 },
  { n: "Poción mayor de vida", precio: 20, desc: "Recupera 60 PV", kind: "potion", val: 60 },
  { n: "Poción de maná", precio: 8, desc: "Recupera 50 de maná", kind: "mana", val: 50 },
  { n: "Tónico de energía", precio: 6, desc: "Recupera 3 de Energía", kind: "energy", val: 3 },
  { n: "Lanza", precio: 25, desc: "Arma, Poder 15", kind: "weapon" },
  { n: "Hacha pesada", precio: 30, desc: "Arma, Poder 15", kind: "weapon" },
  { n: "Mandoble", precio: 40, desc: "Arma pesada, Poder 21", kind: "weapon" },
  { n: "Guadaña", precio: 40, desc: "Pesada y crítica, Poder 19", kind: "weapon" },
  { n: "Katana", precio: 35, desc: "Crítica, Poder 14", kind: "weapon" },
  { n: "Kunais", precio: 25, desc: "Doble golpe y alcance, Poder 9", kind: "weapon" },
  { n: "Shurikens", precio: 20, desc: "Doble golpe y alcance, Poder 8", kind: "weapon" },
  { n: "Martillo de guerra", precio: 40, desc: "Pesado, aturde, Poder 20", kind: "weapon" },
  { n: "Alabarda", precio: 35, desc: "Pesada con alcance, Poder 18", kind: "weapon" },
  { n: "Ballesta", precio: 30, desc: "Alcance, Poder 14", kind: "weapon" },
  { n: "Espada y escudo", precio: 30, desc: "+1 Defensa en combate, Poder 12", kind: "weapon" },
  { n: "Hacha doble", precio: 45, desc: "Pesada y doble golpe, Poder 18", kind: "weapon" },
  { n: "Guadaña de sombra", precio: 220, desc: "Arma mágica de Sombra, Poder 26", kind: "weapon" },
  { n: "Kunais de rayo", precio: 180, desc: "Arma mágica de Rayo, doble golpe, Poder 18", kind: "weapon" },
  { n: "Mandoble de escarcha", precio: 240, desc: "Arma mágica de Agua, aturde, Poder 28", kind: "weapon" },
  { n: "Martillo de roca", precio: 230, desc: "Arma mágica de Tierra, aturde, Poder 27", kind: "weapon" },
  { n: "Abanico del vendaval", precio: 170, desc: "Arma mágica de Aire, crítica, Poder 20", kind: "weapon" },
  { n: "Katana de luz", precio: 200, desc: "Arma mágica de Luz, crítica, Poder 24", kind: "weapon" },
  { n: "Espada de fuego", precio: 150, desc: "Arma mágica de Fuego, Poder 22", kind: "weapon" },
  { n: "Arco de rayo", precio: 150, desc: "Arma mágica de Rayo, Poder 22", kind: "weapon" },
  { n: "Báculo de luz", precio: 150, desc: "Arma mágica de Luz, Poder 22", kind: "weapon" },
];
// objetos que suben atributos (del documento)
const ATTR_ITEMS = {
  "Esencia de temple": ["voluntad"], "Esencia de roca": ["defensa"], "Esencia veloz": ["agilidad"], "Esencia de bravura": ["fuerza"],
  "Esencia de visión": ["sabiduria"], "Esencia de encanto": ["carisma"], "Esencia de fortuna": ["suerte"], "Esencia de enigma": ["inteligencia"],
  "Té de loto lunar": ["sabiduria"], "Pluma de grifo": ["agilidad"], "Escama de tortuga ancestral": ["defensa"], "Perfume de sirena": ["carisma"],
  "Corazón de trol": ["fuerza"], "Piedra del silencio": ["voluntad"], "Pergamino del sabio": ["inteligencia"], "Trébol de siete hojas": ["suerte"],
  "Cristal de potencial": ["elegir"],
};
function cleanItem(s) { return s.replace(/\s*\(.*?\)\s*/g, "").trim(); }

// ===== Escalera del Alba =====
const PELDANOS = [["Chispa", 0, "Uniforme y dormitorio compartido"], ["Brasa", 150, "10% de descuento en la tienda"], ["Llama", 400, "Dormitorio propio y un objeto de atributo"], ["Resplandor", 900, "Biblioteca restringida y clases privadas"], ["Aurora", 1800, "Un arma mágica"], ["Cenit", 3500, "Invitación a la Prueba de la Cumbre"]];
function peldanoFor(total) { let p = PELDANOS[0]; for (const x of PELDANOS) if (total >= x[1]) p = x; return p; }
const RIVALES = [["Darius Valcor", "Humano", 120, 9], ["Seraphina Lux", "Celestial", 100, 8], ["Thorne Colmillo", "Bestial", 60, 7], ["Pip Brizna", "Feérica", 50, 6], ["Garrok Piedraluna", "Semigigante", 40, 5], ["El Enmascarado", "???", 30, 8]];

// ===== Progresión =====
// XP para subir de nivel (reducido 2026-09-29): unas 6-9 victorias contra monstruos de tu nivel por nivel.
// Antes era Math.round(100 * Math.pow(n, 1.5)) (≈1.850 XP en nivel 7). La XP de la historia se escala para mantener su ritmo.
const xpToNext = (n) => Math.round((60 * n + 5 * Math.pow(n, 1.4)) / 10) * 10;
const xpToNextOld = (n) => Math.round(100 * Math.pow(n, 1.5));
const storyXP = (xp, lvl) => Math.max(1, Math.round((xp * xpToNext(lvl)) / xpToNextOld(lvl) / 5) * 5);

// ===== Historia: Arco 1, El Primer Año =====
// choices: stat, risk (Bajo/Moderado/Alto), out: hit/mix/miss -> {t, fx}
// fx de personaje: xp, rayos{}, soles, pv, estres, item, vinc{nombre:+n}
// votos: fx de mundo: luz, orden, rep ; flags
const STORY = [
  { cap: 1, t: "Llegada a Amanecer", r: "alba", p: 1,
    text: ["El carruaje te deja frente a las puertas de Sunrise Academy justo cuando sale el sol. La directora Aurelia Solenne da la bienvenida a los nuevos estudiantes desde la escalinata.", "En el patio, Darius Valcor ya presume de ser el número uno de la Escalera del Alba. Esta tarde hay duelos de práctica para medir a los recién llegados."],
    choices: [
      { l: "Aceptar el duelo de práctica contra Darius", stat: "fuerza", risk: "Moderado", out: { hit: { t: "Tu golpe lo tumba sobre la arena. Media academia te ha visto.", fx: { rayos: { poder: 20, fama: 10 }, xp: 30 } }, mix: { t: "Ganas por poco y acabas con un ojo morado.", fx: { rayos: { poder: 10 }, pv: -5, xp: 20 } }, miss: { t: "Darius te derriba en tres movimientos. Se ríe, pero te ofrece la mano.", fx: { xp: 15, estres: 1 } } } },
      { l: "Ayudar a Garrok, que no encuentra su dormitorio", stat: "carisma", risk: "Bajo", out: { hit: { t: "Garrok te abraza tan fuerte que crujen tus costillas. Tienes un amigo enorme.", fx: { rayos: { corazon: 15 }, vinc: { "Garrok Piedraluna": 1 }, xp: 20 } }, mix: { t: "Lo ayudas, pero llegas tarde a la ceremonia.", fx: { rayos: { corazon: 10 }, xp: 15 } }, miss: { t: "Os perdéis los dos. Terminan durmiendo en la biblioteca.", fx: { xp: 10, estres: 1 } } } },
      { l: "Leer el reglamento de la Escalera en la biblioteca", stat: "inteligencia", risk: "Bajo", out: { hit: { t: "Descubres una regla vieja: los ganadores de la Cumbre nunca firman su salida.", fx: { rayos: { saber: 15 }, xp: 25, flag: "pista_cumbre" } }, mix: { t: "Aprendes las reglas básicas. Nada extraño.", fx: { rayos: { saber: 10 }, xp: 15 } }, miss: { t: "Te quedas dormido sobre el libro.", fx: { xp: 10 } } } },
    ],
    vote: { q: "La directora pregunta al grupo qué quiere aprender primero.", options: [
      { id: "combate", l: "Combate con el profesor Kael", d: "Preparados para pelear desde el primer día.", fx: { rep: 0 } },
      { id: "magia", l: "Magia con la profesora Ilvara", d: "Entender el poder antes de usarlo.", fx: { rep: 0 } },
      { id: "explorar", l: "Exploración con Brisa Sal", d: "Conocer Solvaria cuanto antes.", fx: { rep: 1 } } ] } },
  { cap: 2, t: "El primer examen", r: "alba", p: 2,
    text: ["El primer examen de la academia es práctico: traer un Cristal de luz de los Acantilados del Alba.", "Esta mañana los pescadores dicen que algo grande baja por los acantilados de noche."],
    choices: [
      { l: "Escalar hasta los cristales más altos", stat: "agilidad", risk: "Moderado", out: { hit: { t: "Llegas arriba y arrancas el cristal más brillante del acantilado.", fx: { rayos: { saber: 20 }, item: "Cristal de luz", xp: 40 } }, mix: { t: "Consigues un cristal, pero resbalas y te raspas entero.", fx: { rayos: { saber: 10 }, item: "Cristal de luz", pv: -8, xp: 30 } }, miss: { t: "Caes al agua. El profesor Kael te saca de una oreja.", fx: { pv: -10, xp: 20 } } } },
      { l: "Seguir las huellas de la criatura", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Las huellas llevan a un nido de cangrejos de roca gigantes. Avisas a tiempo a los pescadores.", fx: { rayos: { corazon: 15, fama: 10 }, xp: 40 } }, mix: { t: "Encuentras el nido, pero un cangrejo te pellizca la pierna.", fx: { rayos: { corazon: 10 }, pv: -6, xp: 30 } }, miss: { t: "Te pierdes entre las rocas hasta el anochecer.", fx: { xp: 20, estres: 1 } } } },
      { l: "Estudiar cómo brillan los cristales", stat: "inteligencia", risk: "Bajo", out: { hit: { t: "Notas que brillan menos que en los libros viejos. La luz se está apagando.", fx: { rayos: { saber: 25 }, xp: 40, flag: "pista_ocaso" } }, mix: { t: "Tomas buenas notas para el examen.", fx: { rayos: { saber: 15 }, xp: 25 } }, miss: { t: "Tus notas no sirven de mucho.", fx: { xp: 15 } } } },
    ],
    vote: { q: "Uno de los estudiantes se lesiona en el acantilado. ¿Qué hace el grupo?", options: [
      { id: "ayudar", l: "Llevarlo de vuelta, aunque suspendan", d: "El examen puede esperar.", fx: { rep: 1 } },
      { id: "seguir", l: "Avisar a un profesor y terminar el examen", d: "Cumplir con lo que toca.", fx: {} } ] } },
  { cap: 3, t: "El Faro Antiguo", r: "alba", p: 3,
    text: ["Por la noche, una luz verde se enciende en el Faro Antiguo, abandonado desde hace un siglo.", "Dentro, un espectro repite la misma frase una y otra vez: «La luz se va… la luz se va…»"],
    choices: [
      { l: "Hablar con el espectro", stat: "voluntad", risk: "Moderado", out: { hit: { t: "El espectro te mira: «Cada deseo apaga un poco el sol». Luego se desvanece.", fx: { rayos: { saber: 20 }, xp: 50, flag: "pista_deseo" } }, mix: { t: "Solo entiendes palabras sueltas: «deseo», «sol», «cumbre».", fx: { rayos: { saber: 10 }, xp: 35, estres: 1 } }, miss: { t: "Su grito te deja temblando hasta el amanecer.", fx: { xp: 25, estres: 2 } } } },
      { l: "Registrar el faro", stat: "sabiduria", risk: "Bajo", out: { hit: { t: "Encuentras un diario de hace 30 años firmado por una tal Aurelia.", fx: { rayos: { saber: 20 }, xp: 45, item: "Diario de Aurelia", flag: "diario" } }, mix: { t: "Encuentras un mapa del tesoro empapado.", fx: { item: "Mapa del tesoro", xp: 30 } }, miss: { t: "Solo hay polvo y gaviotas.", fx: { xp: 20 } } } },
      { l: "Proteger a los que vinieron contigo", stat: "defensa", risk: "Moderado", out: { hit: { t: "Aguantas los golpes del espectro mientras los demás escapan.", fx: { rayos: { corazon: 20 }, xp: 45 } }, mix: { t: "Todos salen, pero tú con quemaduras frías en los brazos.", fx: { rayos: { corazon: 10 }, pv: -10, xp: 35 } }, miss: { t: "El espectro te atraviesa y te deja helado.", fx: { pv: -12, xp: 25 } } } },
    ],
    vote: { q: "¿Qué hacen con lo que vieron en el faro?", options: [
      { id: "directora", l: "Contárselo a la directora Aurelia", d: "Ella sabrá qué hacer.", fx: { rep: 1 } },
      { id: "secreto", l: "Guardar el secreto e investigar por su cuenta", d: "Algo no cuadra en la academia.", fx: {} } ] } },
  { cap: 4, t: "Torneo de otoño", r: "llan", p: 3,
    text: ["La academia viaja a Trigalia para el Torneo de otoño en la Arena del Viento. Hay que llegar hasta allí.", "Durante la final, figuras encapuchadas aparecen en las gradas: la Orden del Crepúsculo."],
    choices: [
      { l: "Competir en el torneo", stat: "fuerza", risk: "Alto", out: { hit: { t: "Llegas a la final y el público corea tu nombre.", fx: { rayos: { poder: 60, fama: 30 }, soles: 50, xp: 80 } }, mix: { t: "Quedas tercero y te llevas una buena bolsa.", fx: { rayos: { poder: 30, fama: 10 }, soles: 20, xp: 60 } }, miss: { t: "Caes en la primera ronda.", fx: { pv: -15, xp: 40 } } } },
      { l: "Vigilar a los encapuchados", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Ves a uno pasarle una nota a alguien de la academia.", fx: { rayos: { saber: 25 }, xp: 70, flag: "espia_visto" } }, mix: { t: "Te descubren y huyen antes de que avises.", fx: { rayos: { saber: 10 }, xp: 50 } }, miss: { t: "Te pierdes entre la multitud.", fx: { xp: 35 } } } },
      { l: "Proteger a la gente cuando empiece el caos", stat: "carisma", risk: "Moderado", out: { hit: { t: "Guías a cien personas a la salida sin un solo herido.", fx: { rayos: { corazon: 35, fama: 20 }, xp: 70 } }, mix: { t: "Salvas a muchos, pero te pisotean en la huida.", fx: { rayos: { corazon: 20 }, pv: -10, xp: 55 } }, miss: { t: "Nadie te escucha en medio del pánico.", fx: { xp: 35, estres: 1 } } } },
    ],
    vote: { q: "La Orden ataca la arena. ¿Qué hace el grupo?", options: [
      { id: "pelear", l: "Enfrentarse a la Orden", d: "Aunque sean muchos.", fx: { orden: -1, rep: 1 } },
      { id: "civiles", l: "Sacar a los civiles primero", d: "Las vidas antes que la gloria.", fx: { rep: 1 } },
      { id: "seguir", l: "Seguir a los encapuchados en secreto", d: "Descubrir a dónde van.", fx: { orden: 0 } } ] } },
  { cap: 5, t: "Las raíces de Verdemar", r: "verde", p: 0,
    text: ["La anciana Sylwen os recibe en Aldea Copaalta. Los árboles más viejos de Verdemar se están secando.", "«Los días son más cortos cada año», dice. «El sol se está apagando, y nadie en la Capital quiere oírlo.»"],
    choices: [
      { l: "Escuchar la historia de Sylwen", stat: "sabiduria", risk: "Bajo", out: { hit: { t: "Sylwen te cuenta que el Ocaso empezó con la primera Prueba de la Cumbre.", fx: { rayos: { saber: 30 }, xp: 90, vinc: { Sylwen: 1 }, flag: "origen_ocaso" } }, mix: { t: "Te habla de ciclos de luz y oscuridad.", fx: { rayos: { saber: 15 }, xp: 70 } }, miss: { t: "Te duermes con el murmullo del bosque.", fx: { xp: 50 } } } },
      { l: "Curar los árboles enfermos", stat: "voluntad", risk: "Moderado", out: { hit: { t: "Un árbol viejo vuelve a dar hojas. Los elfos te miran con respeto.", fx: { rayos: { corazon: 30 }, xp: 90, vinc: { Sylwen: 1 } } }, mix: { t: "Salvas una rama, a costa de agotarte.", fx: { rayos: { corazon: 15 }, xp: 70, estres: 1 } }, miss: { t: "El árbol se deshace en polvo entre tus manos.", fx: { xp: 50, estres: 1 } } } },
      { l: "Explorar las Ruinas de Musgo", stat: "agilidad", risk: "Alto", out: { hit: { t: "Encuentras un mural: un sol que se come a sus propios hijos.", fx: { rayos: { saber: 25, fama: 15 }, xp: 100, flag: "mural" } }, mix: { t: "Ves el mural antes de que las arañas te echen.", fx: { rayos: { saber: 15 }, xp: 80, pv: -12 } }, miss: { t: "Las arañas te persiguen hasta el lago.", fx: { xp: 55, pv: -18 } } } },
    ],
    vote: { q: "Sylwen pide ayuda para convencer a la Capital. ¿Qué responde el grupo?", options: [
      { id: "aliados", l: "Prometer ayuda a los elfos", d: "Llevar su mensaje a la Capital.", fx: { rep: 1, luz: 0 } },
      { id: "academia", l: "Primero hablar con la academia", d: "No meterse en política todavía.", fx: {} } ] } },
  { cap: 6, t: "Un espía entre nosotros", r: "alba", p: 1,
    text: ["De vuelta en la academia, alguien ha robado los planos del observatorio de la profesora Ilvara.", "Pip Brizna jura que sabe quién fue, pero quiere algo a cambio."],
    choices: [
      { l: "Pagarle a Pip por la información", stat: "carisma", risk: "Bajo", out: { hit: { t: "Pip te da un nombre y te guiña un ojo: sabe más de lo que cuenta.", fx: { soles: -10, xp: 100, vinc: { "Pip Brizna": 1 }, flag: "pip_info" } }, mix: { t: "Te cobra el doble por medio nombre.", fx: { soles: -20, xp: 80 } }, miss: { t: "Pip se ríe y se va volando con tu dinero.", fx: { soles: -15, xp: 60 } } } },
      { l: "Investigar el observatorio", stat: "inteligencia", risk: "Moderado", out: { hit: { t: "Encuentras polvo de hada y una pluma negra: dos pistas distintas.", fx: { rayos: { saber: 30 }, xp: 110 } }, mix: { t: "Solo encuentras la pluma negra.", fx: { rayos: { saber: 15 }, xp: 90 } }, miss: { t: "El conserje te echa del observatorio.", fx: { xp: 60 } } } },
      { l: "Tender una trampa al espía", stat: "suerte", risk: "Moderado", out: { hit: { t: "La trampa atrapa a un estudiante de segundo año con un símbolo de la Orden en la muñeca.", fx: { rayos: { fama: 30 }, xp: 120, flag: "espia_atrapado" } }, mix: { t: "Algo cae en la trampa, pero escapa.", fx: { xp: 90 } }, miss: { t: "Caes tú en tu propia trampa.", fx: { xp: 60, pv: -5 } } } },
    ],
    vote: { q: "¿En quién confía el grupo?", options: [
      { id: "confiar_pip", l: "En Pip, aunque venda secretos", d: "Mejor tenerla cerca.", fx: {} },
      { id: "desconfiar", l: "En nadie de fuera del grupo", d: "Ni profesores ni estudiantes.", fx: { rep: -1 } },
      { id: "casimir", l: "En Lord Casimir, que ofrece ayuda", d: "El vampiro parece saber mucho.", fx: { orden: 1 } } ] } },
  { cap: 7, t: "El baile de invierno", r: "alba", p: 1,
    text: ["La academia se llena de faroles para el baile de invierno. Es una noche para bailar, hacer alianzas… o declararse.", "A medianoche, las luces se apagan de golpe."],
    choices: [
      { l: "Bailar con alguien especial", stat: "carisma", risk: "Bajo", out: { hit: { t: "Bailáis hasta que se apagan las luces. Nadie olvida esa noche.", fx: { rayos: { corazon: 30 }, xp: 120, estres: -2 } }, mix: { t: "Pisas a tu pareja, pero se ríe contigo.", fx: { rayos: { corazon: 15 }, xp: 100, estres: -1 } }, miss: { t: "Te dicen que no delante de todos.", fx: { xp: 70, estres: 1 } } } },
      { l: "Vigilar las puertas", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Ves a los atacantes entrar por las cocinas y das la alarma a tiempo.", fx: { rayos: { fama: 30 }, xp: 130 } }, mix: { t: "Avisas tarde, pero avisas.", fx: { rayos: { fama: 15 }, xp: 100 } }, miss: { t: "Te quedas dormido en la guardia.", fx: { xp: 70 } } } },
      { l: "Proteger a los profesores cuando ataquen", stat: "defensa", risk: "Alto", out: { hit: { t: "Cubres a la profesora Yara con tu cuerpo. Ella no lo olvidará.", fx: { rayos: { corazon: 30, poder: 20 }, xp: 140, vinc: { "Yara Florvieja": 1 } } }, mix: { t: "La proteges, pero te llevas un buen golpe.", fx: { rayos: { corazon: 20 }, xp: 110, pv: -15 } }, miss: { t: "Te derriban antes de llegar.", fx: { xp: 80, pv: -20 } } } },
    ],
    vote: { q: "Los atacantes huyen con algo del despacho de la directora. ¿Qué hace el grupo?", options: [
      { id: "perseguir", l: "Perseguirlos en la oscuridad", d: "Recuperar lo robado.", fx: { orden: -1 } },
      { id: "heridos", l: "Quedarse con los heridos", d: "Nadie se queda atrás.", fx: { rep: 1 } } ] } },
  { cap: 8, t: "Expedición a los Picos", r: "esc", p: 0,
    text: ["La profesora Ilvara lleva al grupo al Monasterio Nube Blanca, donde tiene un observatorio secreto.", "Sus mediciones son claras: cada vez que alguien gana la Prueba de la Cumbre, el sol pierde fuerza."],
    choices: [
      { l: "Revisar los cálculos de Ilvara", stat: "inteligencia", risk: "Moderado", out: { hit: { t: "Los números no mienten: a este ritmo, el sol se apagará en diez años.", fx: { rayos: { saber: 40 }, xp: 160, flag: "diez_anos" } }, mix: { t: "Confirmas que la luz baja cada año.", fx: { rayos: { saber: 20 }, xp: 130 } }, miss: { t: "Los cálculos te dan dolor de cabeza.", fx: { xp: 90, estres: 1 } } } },
      { l: "Entrenar con la Hermana Kiri", stat: "voluntad", risk: "Moderado", out: { hit: { t: "Kiri te enseña a respirar en el frío. Te sientes más fuerte.", fx: { rayos: { poder: 30 }, xp: 150, energiaMax: 1 } }, mix: { t: "Aguantas el entrenamiento a duras penas.", fx: { rayos: { poder: 15 }, xp: 120 } }, miss: { t: "Te desmayas en la nieve.", fx: { xp: 90, pv: -10 } } } },
      { l: "Explorar la Cueva Congelada", stat: "agilidad", risk: "Alto", out: { hit: { t: "Encuentras un Cristal eterno que brilla con luz propia.", fx: { item: "Cristal eterno", rayos: { fama: 25 }, xp: 170 } }, mix: { t: "Sacas un fragmento del cristal antes de que se derrumbe la cueva.", fx: { item: "Flor de escarcha", xp: 140, pv: -12 } }, miss: { t: "Quedas atrapado entre el hielo hasta el amanecer.", fx: { xp: 100, pv: -20 } } } },
    ],
    vote: { q: "¿Qué hace el grupo con la verdad sobre la Cumbre?", options: [
      { id: "publico", l: "Contarlo a toda la academia", d: "Todos merecen saberlo.", fx: { rep: -1, orden: 1 } },
      { id: "ilvara", l: "Guardarlo con Ilvara hasta tener pruebas", d: "Nadie les creería todavía.", fx: {} } ] } },
  { cap: 9, t: "La traición", r: "alba", p: 1,
    text: ["Alguien de dentro abrió las puertas a la Orden el día del baile. Todas las pistas apuntan a un profesor.", "Lord Casimir, Tobble o Brisa Sal: cada uno tuvo la oportunidad."],
    choices: [
      { l: "Interrogar a Lord Casimir", stat: "voluntad", risk: "Alto", out: { hit: { t: "Casimir sonríe: «No soy de la Orden. Pero el Ocaso me conviene». Te da un nombre.", fx: { rayos: { saber: 30 }, xp: 200, flag: "casimir_habla" } }, mix: { t: "Casimir esquiva cada pregunta con elegancia.", fx: { xp: 160, estres: 1 } }, miss: { t: "Su mirada te deja sin palabras.", fx: { xp: 110, estres: 2 } } } },
      { l: "Revisar el taller de Tobble", stat: "inteligencia", risk: "Moderado", out: { hit: { t: "Tobble construye una máquina para atrapar la luz del sol. No es un traidor: es un plan.", fx: { rayos: { saber: 40 }, xp: 200, vinc: { "Tobble Engranaje": 1 } } }, mix: { t: "Encuentras planos que no entiendes.", fx: { xp: 160 } }, miss: { t: "Algo explota en el taller.", fx: { xp: 110, pv: -15 } } } },
      { l: "Seguir a Brisa Sal hasta el puerto", stat: "agilidad", risk: "Moderado", out: { hit: { t: "Brisa esconde algo traído de las Islas Perdidas, pero no es de la Orden.", fx: { rayos: { fama: 20 }, xp: 190, vinc: { "Brisa Sal": 1 } } }, mix: { t: "La pierdes de vista en el muelle.", fx: { xp: 150 } }, miss: { t: "Brisa te descubre y te echa al agua.", fx: { xp: 100, pv: -8 } } } },
    ],
    vote: { q: "El grupo debe acusar a alguien ante la directora.", options: [
      { id: "casimir", l: "Acusar a Lord Casimir", d: "El vampiro gana con el Ocaso.", fx: { orden: -1 } },
      { id: "tobble", l: "Acusar a Tobble", d: "Su máquina es sospechosa.", fx: { rep: -1 } },
      { id: "nadie", l: "No acusar a nadie sin pruebas", d: "Seguir investigando.", fx: { orden: 1 } } ] } },
  { cap: 10, t: "La Prueba de la Cumbre", r: "alba", p: 1,
    text: ["Termina el primer año. Toda la academia se reúne para ver la Prueba de la Cumbre.", "El ganador sube la escalera de luz hasta la Cumbre del Alba, pide su deseo… y desaparece. Esa noche, el sol sale más débil que nunca."],
    choices: [
      { l: "Intentar detener el ascenso", stat: "fuerza", risk: "Alto", out: { hit: { t: "Llegas a tocar la escalera de luz. Por un instante ves a los ganadores anteriores, hechos de luz.", fx: { rayos: { poder: 40, fama: 40 }, xp: 300, flag: "vio_cumbre" } }, mix: { t: "La guardia te detiene a mitad de camino.", fx: { rayos: { fama: 20 }, xp: 240 } }, miss: { t: "La luz te lanza de vuelta al suelo.", fx: { xp: 180, pv: -20 } } } },
      { l: "Observar a la directora durante la prueba", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Aurelia llora en silencio. Ella sabe lo que pasa.", fx: { rayos: { saber: 40 }, xp: 280, flag: "aurelia_sabe" } }, mix: { t: "Notas que no aplaude.", fx: { rayos: { saber: 20 }, xp: 230 } }, miss: { t: "La multitud no te deja ver nada.", fx: { xp: 180 } } } },
      { l: "Consolar a los que pierden a su amigo", stat: "carisma", risk: "Bajo", out: { hit: { t: "Esa noche nadie está solo. El grupo es más fuerte que nunca.", fx: { rayos: { corazon: 50 }, xp: 280, estres: -3 } }, mix: { t: "Haces lo que puedes.", fx: { rayos: { corazon: 25 }, xp: 230 } }, miss: { t: "No encuentras las palabras.", fx: { xp: 180, estres: 1 } } } },
    ],
    vote: { q: "Fin del primer año. ¿Qué jura el grupo?", options: [
      { id: "verdad", l: "Descubrir la verdad de la Cumbre", d: "Cueste lo que cueste.", fx: { luz: -5 } },
      { id: "orden", l: "Destruir a la Orden del Crepúsculo", d: "Primero el enemigo visible.", fx: { orden: -2, luz: -5 } },
      { id: "subir", l: "Llegar ellos mismos a la Cumbre", d: "Y cambiar el deseo desde dentro.", fx: { luz: -5 } } ] } },

  // ===================== ARCO 2: LA ORDEN DEL CREPÚSCULO =====================
  { cap: 11, t: "Un año más oscuro", r: "alba", p: 1,
    text: ["Empieza el segundo año. El sol sale tarde y se pone temprano; en el patio de la academia ya nadie bromea con eso.", "En su primera clase, la profesora Ilvara Nocturna proyecta sus mediciones: el sol pierde un poco de luz cada año, y mucha más cada vez que alguien gana la Cumbre. Esa misma tarde llega la noticia: la Orden del Crepúsculo asaltó el Templo de Piedra y se llevó la reliquia de Grudhal."],
    textBy: { verdad: "El grupo juró descubrir la verdad de la Cumbre, y las mediciones de Ilvara son la primera pista seria.", orden: "El grupo juró destruir a la Orden, y ahora la Orden les ha dado un rastro que seguir.", subir: "El grupo juró llegar a la Cumbre, pero los números de Ilvara hacen dudar a cualquiera." },
    choices: [
      { l: "Estudiar a fondo las mediciones de Ilvara", stat: "inteligencia", risk: "Moderado", adv: "pista_ocaso", out: { hit: { t: "Encuentras algo raro: sus cuentas no buscan salvar el sol, sino calcular cuándo se apagará.", fx: { rayos: { saber: 40 }, xp: 320, flag: "ilvara_notas" } }, mix: { t: "Entiendes lo básico: si nada cambia, al sol le quedan pocas generaciones.", fx: { rayos: { saber: 25 }, xp: 260 } }, miss: { t: "Tanto número te da dolor de cabeza.", fx: { xp: 200, estres: 1 } } } },
      { l: "Entrenar con Kael para lo que viene", stat: "fuerza", risk: "Moderado", out: { hit: { t: "Kael asiente, serio: «Este año no será de exámenes»", fx: { rayos: { poder: 40 }, xp: 300, vinc: { "Kael Dorn": 1 } } }, mix: { t: "Terminas molido, pero más fuerte.", fx: { rayos: { poder: 25 }, xp: 250, pv: -10 } }, miss: { t: "Kael te tumba una y otra vez.", fx: { xp: 200, pv: -15 } } } },
      { l: "Hablar con Thorne sobre la Orden", stat: "carisma", risk: "Bajo", out: { hit: { t: "Thorne te cuenta cómo la Orden destruyó su manada. Promete pelear a tu lado.", fx: { rayos: { corazon: 40 }, xp: 280, vinc: { "Thorne Colmillo": 2 } } }, mix: { t: "Thorne habla poco, pero te deja acompañarlo a entrenar.", fx: { rayos: { corazon: 20 }, xp: 240, vinc: { "Thorne Colmillo": 1 } } }, miss: { t: "Thorne se cierra y se va.", fx: { xp: 200 } } } },
    ],
    vote: { q: "¿Por dónde empieza el grupo a buscar a la Orden?", options: [
      { id: "templo", l: "Seguir el rastro de la reliquia robada", d: "Ir al Templo de Piedra, en las Llanuras Doradas.", fx: { orden: -1 } },
      { id: "capital", l: "Pedir ayuda en la Capital", d: "El rey tiene espías y soldados.", fx: { rep: 1 } },
      { id: "puerto", l: "Preguntar en Puerto Rayo", d: "Todo lo que se roba acaba en un barco.", fx: {} } ] } },
  { cap: 12, t: "La Piedra robada", r: "llan", p: 6,
    boss: { n: "Cultista del Crepúsculo", lvl: 14, aff: "Sombra" },
    text: ["El círculo de piedras del Templo de Grudhal está roto. Donde estaba la reliquia solo queda un hueco lleno de ceniza negra.", "Los campesinos vieron encapuchados huyendo entre los trigales. Uno de ellos se quedó atrás: todavía ronda el templo."],
    choices: [
      { l: "Rastrear las huellas entre el trigo", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Las huellas llevan a un carro con destino a la Capital. Alguien paga a la Orden desde allí.", fx: { rayos: { saber: 40 }, xp: 340, flag: "rastro_capital" } }, mix: { t: "Pierdes el rastro en el río, pero encuentras un broche con un sol negro.", fx: { rayos: { saber: 20 }, xp: 280, item: "Fragmento maldito" } }, miss: { t: "El trigo te traga. Das vueltas hasta el anochecer.", fx: { xp: 220, estres: 1 } } } },
      { l: "Reunir a los campesinos para proteger el templo", stat: "carisma", risk: "Bajo", out: { hit: { t: "Los campesinos montan guardia día y noche. Grudhal parece agradecerlo: el suelo tiembla suave bajo tus pies.", fx: { rayos: { corazon: 40, fama: 20 }, xp: 320 } }, mix: { t: "Aceptan, pero con miedo.", fx: { rayos: { corazon: 20 }, xp: 260 } }, miss: { t: "Nadie quiere meterse con la Orden.", fx: { xp: 220 } } } },
      { l: "Reparar el círculo de piedras", stat: "defensa", risk: "Moderado", out: { hit: { t: "Colocas la última piedra y el templo vuelve a zumbar.", fx: { rayos: { poder: 30 }, xp: 320, energiaMax: 1 } }, mix: { t: "El círculo aguanta, a medias.", fx: { rayos: { poder: 15 }, xp: 260, pv: -8 } }, miss: { t: "Una piedra te cae en el pie.", fx: { xp: 220, pv: -15 } } } },
    ],
    vote: { q: "Los ladrones se esconden en los trigales esta noche. ¿Qué hace el grupo?", options: [
      { id: "cazar", l: "Cazarlos de noche", d: "Peligroso, pero pueden recuperar la reliquia.", fx: { orden: -1, flag: "reliquia_grudhal" } },
      { id: "avisar", l: "Avisar a la guardia real", d: "Más seguro, pero lento.", fx: { rep: 1, orden: 1 } } ] } },
  { cap: 13, t: "La corte del Rey", r: "cap", p: 0,
    text: ["El rey Aldric III invita a los mejores estudiantes de Sunrise a la Capital: quiere que ayuden a proteger el Festival del Sol.", "La corte brilla demasiado para un mundo que se apaga. La Capitana Lysa te mira como si ya supiera que algo va a salir mal."],
    choices: [
      { l: "Ganarte a la corte en el banquete", stat: "carisma", risk: "Moderado", out: { hit: { t: "El rey brinda por ti. La mitad de la nobleza quiere conocerte.", fx: { rayos: { fama: 50 }, xp: 360, soles: 30 } }, mix: { t: "Caes bien, pero derramas vino sobre un duque.", fx: { rayos: { fama: 25 }, xp: 300 } }, miss: { t: "Un noble se ríe de tu acento toda la noche.", fx: { xp: 240, estres: 1 } } } },
      { l: "Colarte en el Archivo de la Esfinge", stat: "inteligencia", risk: "Alto", adv: "pista_cumbre", out: { hit: { t: "Encuentras un mapa de las tres reliquias: Piedra, Perla y Reloj. Juntas abren algo bajo el Páramo Violeta.", fx: { rayos: { saber: 50 }, xp: 380, flag: "archivo_mapa" } }, mix: { t: "La esfinge te pilla, pero te deja ir tras una adivinanza.", fx: { rayos: { saber: 30 }, xp: 320 } }, miss: { t: "Los guardias te echan del archivo.", fx: { xp: 240, rayos: { fama: -10 } } } } },
      { l: "Patrullar con la Capitana Lysa", stat: "defensa", risk: "Bajo", out: { hit: { t: "Lysa te enseña los pasadizos del palacio. «Por si acaso», dice.", fx: { rayos: { poder: 30, corazon: 20 }, xp: 340, vinc: { "Capitana Lysa": 1 } } }, mix: { t: "Una noche larga y tranquila.", fx: { rayos: { poder: 15 }, xp: 280 } }, miss: { t: "Te quedas dormido en la guardia.", fx: { xp: 240 } } } },
    ],
    vote: { q: "El rey pide al grupo que proteja el Festival del Sol. ¿Aceptan?", options: [
      { id: "aceptar", l: "Aceptar el encargo del rey", d: "Estar donde la Orden va a atacar.", fx: { rep: 1 } },
      { id: "solos", l: "Investigar por su cuenta", d: "No fiarse de nadie en la corte.", fx: { orden: -1 } } ] } },
  { cap: 14, t: "Bajo la Capital", r: "cap", p: 4,
    boss: { n: "Capitán del Crepúsculo", lvl: 16, aff: "Sombra" },
    text: ["Pip Brizna vende un rumor: la Orden se reúne en las alcantarillas, bajo la Plaza Real.", "Allí abajo, detrás de una reja oxidada, se oyen voces. Una de ellas habla de «mediciones» y de «cuántos deseos le quedan al sol»."],
    choices: [
      { l: "Acercarte sin que te vean", stat: "agilidad", risk: "Moderado", adv: "espia_atrapado", out: { hit: { t: "Llegas hasta la reja. La voz es de mujer, tranquila, casi amable. Te suena de algo.", fx: { rayos: { saber: 30 }, xp: 380, flag: "voz_conocida" } }, mix: { t: "Oyes la reunión, pero pisas un charco y tienes que huir.", fx: { rayos: { saber: 20 }, xp: 320, estres: 1 } }, miss: { t: "Te descubren y te persiguen por los túneles.", fx: { xp: 260, pv: -15 } } } },
      { l: "Entrar peleando", stat: "fuerza", risk: "Alto", out: { hit: { t: "Los cultistas huyen y dejan atrás sus planos del Festival.", fx: { rayos: { poder: 50, fama: 20 }, xp: 400, flag: "planos_festival" } }, mix: { t: "Ganas la pelea, pero los líderes escapan.", fx: { rayos: { poder: 30 }, xp: 340, pv: -12 } }, miss: { t: "Son demasiados. Sales arrastrándote.", fx: { xp: 260, pv: -25, estres: 1 } } } },
      { l: "Escuchar a través de las paredes", stat: "sabiduria", risk: "Bajo", out: { hit: { t: "Oyes el plan: robar el Reloj de Kronea durante el Festival.", fx: { rayos: { saber: 40 }, xp: 360, flag: "planos_festival" } }, mix: { t: "Solo entiendes la palabra «Festival».", fx: { rayos: { saber: 20 }, xp: 300 } }, miss: { t: "El eco lo mezcla todo.", fx: { xp: 240 } } } },
    ],
    vote: { q: "¿Le cuentan a alguien lo que oyeron en las alcantarillas?", options: [
      { id: "aurelia", l: "Contárselo a la directora Aurelia", d: "Ella sabrá qué hacer.", fx: { rep: 1 } },
      { id: "secreto", l: "Guardarlo en secreto", d: "Si hay un espía en la academia, mejor que no lo sepa nadie.", fx: { orden: -1 } } ] } },
  { cap: 15, t: "El Festival del Sol", r: "cap", p: 2,
    text: ["El Coliseo Real está lleno. Cuando el rey alza la antorcha del sol, las luces se apagan y la Orden cae desde las gradas.", "Entre el humo, alguien corre hacia la Torre de las Horas con el Reloj de Kronea bajo el brazo."],
    choices: [
      { l: "Proteger a la multitud", stat: "defensa", risk: "Moderado", out: { hit: { t: "Aguantas en la puerta mientras cientos de personas escapan. Te aplauden al salir.", fx: { rayos: { corazon: 50, fama: 40 }, xp: 420 } }, mix: { t: "Salvas a muchos, pero te llevas golpes por todos lados.", fx: { rayos: { corazon: 30 }, xp: 360, pv: -15 } }, miss: { t: "La multitud te arrastra.", fx: { xp: 280, pv: -20 } } } },
      { l: "Perseguir al ladrón del Reloj", stat: "agilidad", risk: "Alto", adv: "planos_festival", out: { hit: { t: "Lo alcanzas en la escalera de la torre y le arrancas la capucha: es un alumno de tercero. Lleva un sello con las iniciales I. N.", fx: { rayos: { poder: 40, saber: 30 }, xp: 440, flag: "sello_in" } }, mix: { t: "El ladrón escapa, pero se le cae un guante que huele a tinta de observatorio.", fx: { rayos: { saber: 20 }, xp: 380, flag: "guante" } }, miss: { t: "Te cierran una puerta en la cara.", fx: { xp: 280, pv: -10 } } } },
      { l: "Deshacer la tormenta mágica", stat: "voluntad", risk: "Alto", out: { hit: { t: "Rompes el hechizo y vuelve la luz. Reconoces el estilo: es magia de academia.", fx: { rayos: { saber: 40, fama: 30 }, xp: 440, flag: "magia_academia" } }, mix: { t: "Debilitas la tormenta, pero te sangra la nariz.", fx: { rayos: { saber: 20 }, xp: 360, pv: -12 } }, miss: { t: "La tormenta te tira al suelo.", fx: { xp: 280, estres: 2 } } } },
    ],
    vote: { q: "Solo da tiempo a una cosa. ¿Qué salva el grupo?", options: [
      { id: "rey", l: "Salvar al rey", d: "Si el rey muere, Solvaria cae en el caos.", fx: { rep: 2, orden: 1 } },
      { id: "reloj", l: "Recuperar el Reloj de Kronea", d: "Sin las reliquias, la Orden no puede terminar su plan.", fx: { orden: -1, flag: "reliquia_kronea" } } ] } },
  { cap: 16, t: "Los barcos de Varo", r: "costa", p: 0,
    text: ["Todas las pistas llevan a Puerto Rayo. Los barcos del Capitán Varo «Trueno» llevan de noche a gente encapuchada hacia el Santuario de las Mareas.", "Varo no es de la Orden, pero le pagan bien. Y a Varo le gusta que le paguen bien."],
    choices: [
      { l: "Negociar con Varo", stat: "carisma", risk: "Moderado", adv: "pip_info", out: { hit: { t: "Varo se ríe y cambia de bando: «La Orden paga poco para lo que pide»", fx: { rayos: { fama: 40 }, xp: 440, flag: "varo_aliado" } }, mix: { t: "Te dice adónde van, a cambio de 20 Soles.", fx: { rayos: { fama: 20 }, xp: 380, soles: -20 } }, miss: { t: "Varo te tira al agua del puerto.", fx: { xp: 300, estres: 1 } } } },
      { l: "Colarte en un barco", stat: "agilidad", risk: "Moderado", out: { hit: { t: "Escondido en la bodega, oyes el plan: robar la Perla de Marenna en la próxima tormenta.", fx: { rayos: { saber: 40 }, xp: 420, flag: "plan_perla" } }, mix: { t: "Te descubren a mitad de viaje y saltas al mar.", fx: { rayos: { saber: 20 }, xp: 360, pv: -10 } }, miss: { t: "Te encierran en la bodega hasta el amanecer.", fx: { xp: 300, estres: 1 } } } },
      { l: "Retar a Varo a un duelo", stat: "fuerza", risk: "Alto", out: { hit: { t: "Ganas. Los piratas te respetan y Varo te deja un barco.", fx: { rayos: { poder: 50, fama: 30 }, xp: 460, flag: "varo_aliado" } }, mix: { t: "Empate. Varo te invita a beber.", fx: { rayos: { poder: 30 }, xp: 380 } }, miss: { t: "Varo te deja en el suelo con un rayo.", fx: { xp: 300, pv: -25 } } } },
    ],
    vote: { q: "¿Qué hace el grupo con los piratas?", options: [
      { id: "aliarse", l: "Aliarse con los piratas", d: "Son rápidos y conocen el mar.", fx: { orden: -1, rep: -1 } },
      { id: "denunciar", l: "Denunciarlos a la guardia", d: "La ley es la ley.", fx: { rep: 1 } } ] } },
  { cap: 17, t: "La Perla de Marenna", r: "costa", p: 5,
    boss: { n: "Sacerdotisa del Crepúsculo", lvl: 20, aff: "Agua" },
    text: ["Llega la tormenta. En el Santuario de las Mareas, la Orden rodea el altar mientras el mar se retira.", "Brisa Sal aparece empapada: «Si se llevan la Perla, el mar se volverá loco. Ayudadme a sostener la marea»."],
    choices: [
      { l: "Bucear hasta la Perla antes que ellos", stat: "defensa", risk: "Alto", out: { hit: { t: "Llegas al fondo y sacas la Perla. Marenna te da aire cuando ya no te quedaba.", fx: { rayos: { poder: 40, fama: 40 }, xp: 500, flag: "perla_salvada" } }, mix: { t: "La tocas, pero la corriente te la arranca.", fx: { rayos: { poder: 20 }, xp: 420, pv: -15 } }, miss: { t: "El mar te escupe contra las rocas.", fx: { xp: 340, pv: -25 } } } },
      { l: "Sostener la marea con Brisa Sal", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Juntos frenáis el mar. Brisa te cuenta, sin aliento, qué trajo de las Islas Perdidas: un mapa de la tumba de Vaelmor.", fx: { rayos: { saber: 40, corazon: 30 }, xp: 480, vinc: { "Brisa Sal": 2 }, flag: "mapa_tumba" } }, mix: { t: "La marea aguanta a medias.", fx: { rayos: { saber: 20 }, xp: 400 } }, miss: { t: "Una ola os arrastra a los dos.", fx: { xp: 340, pv: -20 } } } },
      { l: "Romper el círculo de la Orden", stat: "fuerza", risk: "Moderado", out: { hit: { t: "El círculo se rompe y los cultistas caen de rodillas.", fx: { rayos: { poder: 50 }, xp: 480 } }, mix: { t: "Rompes medio círculo antes de que te empujen fuera.", fx: { rayos: { poder: 25 }, xp: 400, pv: -10 } }, miss: { t: "La magia del círculo te quema las manos.", fx: { xp: 340, pv: -20 } } } },
    ],
    vote: { q: "La Perla está a salvo, por ahora. ¿Dónde la guardan?", options: [
      { id: "templo", l: "Devolverla al Santuario", d: "Es de Marenna. Que ella la proteja.", fx: { luz: 2, flag: "reliquia_marenna" } },
      { id: "academia", l: "Llevarla a la academia", d: "Más cerca, más vigilada… en teoría.", fx: { orden: 1 } } ] } },
  { cap: 18, t: "La voz conocida", r: "alba", p: 1,
    text: ["De vuelta en la academia, todas las pistas apuntan a un profesor. Media escuela sospecha de Lord Casimir: el Ocaso lo hace más fuerte y nunca lo ha negado.", "Pero algunas cosas no encajan: un sello con las iniciales I. N., magia de academia, una voz tranquila hablando de mediciones."],
    choices: [
      { l: "Comparar la letra de las notas de la Orden", stat: "inteligencia", risk: "Moderado", adv: "ilvara_notas", out: { hit: { t: "La letra es idéntica a la de las mediciones que Ilvara proyecta en clase.", fx: { rayos: { saber: 50 }, xp: 520, flag: "prueba_letra" } }, mix: { t: "Se parece a la letra de alguien de la academia, pero no sabes de quién.", fx: { rayos: { saber: 25 }, xp: 440 } }, miss: { t: "Todas las letras te parecen iguales.", fx: { xp: 360 } } } },
      { l: "Enfrentar a Lord Casimir", stat: "voluntad", risk: "Alto", adv: "casimir_habla", out: { hit: { t: "Casimir suspira: «Yo solo me aprovecho de la noche. Quien la trae mide el cielo cada noche en la torre norte»", fx: { rayos: { saber: 40, fama: 20 }, xp: 520, flag: "casimir_pista" } }, mix: { t: "Casimir no confiesa nada, pero tampoco miente.", fx: { rayos: { saber: 20 }, xp: 440 } }, miss: { t: "Casimir te deja en ridículo delante de todos.", fx: { xp: 360, rayos: { fama: -15 }, estres: 1 } } } },
      { l: "Vigilar la torre norte de noche", stat: "agilidad", risk: "Moderado", adv: "voz_conocida", out: { hit: { t: "Ves a Ilvara bajar de la torre con una capucha negra y un sol negro bordado.", fx: { rayos: { saber: 40 }, xp: 520, flag: "vio_ilvara" } }, mix: { t: "Alguien encapuchado sale de la torre, pero no le ves la cara.", fx: { rayos: { saber: 20 }, xp: 440 } }, miss: { t: "Te quedas dormido en la escalera.", fx: { xp: 360 } } } },
    ],
    vote: { q: "¿Qué hace el grupo con sus sospechas?", options: [
      { id: "casimir", l: "Acusar a Lord Casimir en público", d: "Es el sospechoso obvio.", fx: { orden: 2, rep: -1, flag: "casimir_acusado" } },
      { id: "esperar", l: "Seguir investigando en silencio", d: "Si se equivocan, el verdadero culpable huirá.", fx: { orden: -1 } } ] } },
  { cap: 19, t: "El Eclipse", r: "alba", p: 1,
    text: ["En lo alto de la torre norte, Ilvara Nocturna os espera con una taza de té, como si os hubiera citado ella.", "«Sí, soy el Eclipse», dice. «He medido el sol durante treinta años. Va a morir. Cuando muera, Vaelmor ocupará su lugar de todas formas. Yo solo quiero que ocurra con orden, antes de que la Cumbre nos deje a oscuras y sin nada»"],
    choices: [
      { l: "Discutir con ella", stat: "carisma", risk: "Alto", adv: "prueba_letra", out: { hit: { t: "Por primera vez Ilvara duda. «¿Y si hay otra salida?», pregunta, casi en un susurro.", fx: { rayos: { corazon: 50, saber: 30 }, xp: 560, flag: "ilvara_duda" } }, mix: { t: "Te escucha, pero no cambia de idea.", fx: { rayos: { corazon: 25 }, xp: 480 } }, miss: { t: "Ilvara sonríe con pena: «Sois muy jóvenes»", fx: { xp: 400, estres: 1 } } } },
      { l: "Atacarla antes de que huya", stat: "fuerza", risk: "Alto", out: { hit: { t: "La tomas por sorpresa y rompes su báculo. Huye herida por la ventana.", fx: { rayos: { poder: 60 }, xp: 560, flag: "ilvara_herida" } }, mix: { t: "La hieres, pero te lanza por las escaleras.", fx: { rayos: { poder: 30 }, xp: 480, pv: -20 } }, miss: { t: "Una ola de sombra te estrella contra la pared.", fx: { xp: 400, pv: -30 } } } },
      { l: "Robar sus mediciones", stat: "agilidad", risk: "Moderado", out: { hit: { t: "Te llevas el cuaderno. En la última página: «Torre de las Horas, luna nueva. Las tres reliquias»", fx: { rayos: { saber: 50 }, xp: 560, flag: "cuaderno" } }, mix: { t: "Arrancas unas hojas antes de que te vea.", fx: { rayos: { saber: 25 }, xp: 480 } }, miss: { t: "Ilvara te congela la mano. «Eso es mío»", fx: { xp: 400, pv: -15 } } } },
    ],
    vote: { q: "Ilvara escapa hacia la Capital. ¿Qué hace el grupo?", options: [
      { id: "perseguir", l: "Perseguirla sin descanso", d: "No darle tiempo a prepararse.", fx: { orden: -1 } },
      { id: "aurelia", l: "Contárselo todo a Aurelia", d: "La directora tiene que saberlo.", fx: { rep: 1, flag: "aurelia_informada" } },
      { id: "convencer", l: "Buscar la forma de convencerla", d: "Quizá tenga razón en algo.", fx: { luz: 1, flag: "intento_convencer" } } ] } },
  { cap: 20, t: "Tormenta sobre la Capital", r: "cap", p: 5,
    boss: { n: "El Eclipse (Ilvara Nocturna)", lvl: 25, aff: "Sombra" },
    text: ["Luna nueva. En lo alto de la Torre de las Horas, Ilvara coloca las reliquias que ha conseguido en un círculo de sombra. El reloj de la torre empieza a marcar horas hacia atrás.", "Muy lejos, bajo el Páramo Violeta, algo enorme se da la vuelta en su sueño."],
    choices: [
      { l: "Romper el círculo de reliquias", stat: "fuerza", risk: "Alto", out: { hit: { t: "El círculo se rompe con un trueno. Las reliquias salen volando y el reloj se detiene.", fx: { rayos: { poder: 70, fama: 40 }, xp: 700, flag: "circulo_roto" } }, mix: { t: "Lo agrietas. El ritual va más lento.", fx: { rayos: { poder: 35 }, xp: 600, pv: -20 } }, miss: { t: "La sombra te lanza por el aire.", fx: { xp: 500, pv: -35 } } } },
      { l: "Proteger a los que llegan a ayudar", stat: "defensa", risk: "Moderado", out: { hit: { t: "Aguantas la puerta mientras Kael, Lysa y Aurelia suben la escalera.", fx: { rayos: { corazon: 60, poder: 30 }, xp: 660 } }, mix: { t: "Aguantas, pero caes al final.", fx: { rayos: { corazon: 30 }, xp: 580, pv: -25 } }, miss: { t: "La puerta cede.", fx: { xp: 500, pv: -30 } } } },
      { l: "Hablarle al corazón de Ilvara", stat: "carisma", risk: "Alto", adv: "ilvara_duda", out: { hit: { t: "Ilvara baja el báculo. «Si hay otra salida… ayudadme a encontrarla»", fx: { rayos: { corazon: 70 }, xp: 700, flag: "ilvara_escucha" } }, mix: { t: "Duda un segundo; basta para que los demás la rodeen.", fx: { rayos: { corazon: 35 }, xp: 600 } }, miss: { t: "«Demasiado tarde», dice, y su sombra te envuelve.", fx: { xp: 500, pv: -30, estres: 2 } } } },
    ],
    vote: { q: "Ilvara está vencida. ¿Qué decide el grupo?", options: [
      { id: "prision", l: "Entregarla a la justicia del rey", d: "Que pague por lo que hizo.", fx: { orden: -2, rep: 1 } },
      { id: "aliada", l: "Darle una oportunidad de redimirse", d: "Sabe más del sol que nadie. La necesitan.", fx: { orden: -1, luz: 3, flag: "ilvara_aliada" } },
      { id: "huye", l: "Dejarla ir", d: "Tiene razón en demasiadas cosas.", fx: { orden: 1, flag: "ilvara_libre" } } ] } },

  // ===================== ARCO 3: LO QUE HAY DEBAJO =====================
  { cap: 21, t: "Temblores", r: "alba", p: 1, corrupt: "nyssa",
    text: ["Desde la noche de la Torre de las Horas, la tierra tiembla cada amanecer. En el Páramo Violeta, el cielo ya no tiene estrellas.", "Esta mañana, los devotos de Nyssa despiertan gritando: su diosa ya no les responde. Algo la ha envuelto desde abajo."],
    textBy: { prision: "Ilvara, desde su celda, manda un mensaje: «Os lo dije. Ya ha empezado».", aliada: "Ilvara llega corriendo con sus cuadernos: «Vaelmor se alimenta de los dioses que guardan su tumba. Nyssa es la primera».", huye: "Nadie sabe dónde está Ilvara, pero alguien ha dejado en tu cuarto un mapa del Páramo con una cruz sobre el Templo del Velo." },
    choices: [
      { l: "Preguntar a Aurelia qué sabe de Vaelmor", stat: "sabiduria", risk: "Moderado", adv: "aurelia_sabe", out: { hit: { t: "Aurelia cierra la puerta: «Los catorce dioses lo enterraron. Si caen los que guardan la tumba, se levanta»", fx: { rayos: { saber: 50 }, xp: 700, flag: "sabe_guardianes" } }, mix: { t: "Aurelia solo dice: «Proteged los templos».", fx: { rayos: { saber: 30 }, xp: 600 } }, miss: { t: "Aurelia está demasiado ocupada para recibirte.", fx: { xp: 500 } } } },
      { l: "Cuidar a la profesora Yara, que se apaga con el sol", stat: "carisma", risk: "Bajo", out: { hit: { t: "Yara sonríe débil: «Mientras alguien me hable, aguanto». Te regala sus mejores hierbas.", fx: { rayos: { corazon: 60 }, xp: 650, item: "Poción mayor de vida", vinc: { "Yara Florvieja": 2 } } }, mix: { t: "Pasas la noche con ella. Descansa un poco.", fx: { rayos: { corazon: 30 }, xp: 560 } }, miss: { t: "Yara duerme todo el día. No sabes qué hacer.", fx: { xp: 500, estres: 1 } } } },
      { l: "Medir los temblores con Tobble", stat: "inteligencia", risk: "Moderado", out: { hit: { t: "Los temblores vienen de cuatro templos: el Velo, el Ancla, la Forja y el Lago Espejo.", fx: { rayos: { saber: 60 }, xp: 700, flag: "cuatro_templos" } }, mix: { t: "La máquina de Tobble explota, pero señala el Páramo.", fx: { rayos: { saber: 30 }, xp: 600, pv: -10 } }, miss: { t: "Tobble y tú acabáis cubiertos de hollín.", fx: { xp: 500 } } } },
    ],
    vote: { q: "Nyssa ha caído en la sombra. ¿Qué hace el grupo?", options: [
      { id: "velo", l: "Ir al Templo del Velo a liberarla", d: "Si cae la guardiana, Vaelmor sube más rápido.", fx: {} },
      { id: "prepararse", l: "Prepararse primero en la academia", d: "Sin prisa, pero sin pausa.", fx: { rep: 1 } } ] } },
  { cap: 22, t: "El Velo roto", r: "viol", p: 5, boss: { n: "Avatar corrupto de Nyssa", lvl: 25, aff: "Sombra", god: "nyssa" },
    text: ["Dentro del Templo del Velo la noche es total. Donde antes descansaban los peregrinos, ahora hay cultistas que alimentan una sombra con forma de mujer.", "Es el avatar de Nyssa, con los ojos llenos de algo que no es suyo. Si lo derrotáis, Nyssa volverá en sí."],
    choices: [
      { l: "Guiar a los peregrinos fuera del templo", stat: "voluntad", risk: "Moderado", out: { hit: { t: "Sacas a todos. Una anciana te besa la frente: «Nyssa te lo pagará»", fx: { rayos: { corazon: 60, fama: 30 }, xp: 780 } }, mix: { t: "Sacas a casi todos.", fx: { rayos: { corazon: 30 }, xp: 680, estres: 1 } }, miss: { t: "La oscuridad te hace perder el camino tres veces.", fx: { xp: 560, estres: 2 } } } },
      { l: "Robar las semillas de sombra de los cultistas", stat: "agilidad", risk: "Alto", out: { hit: { t: "Te llevas un saco de semillas negras: así corrompe la Orden a los dioses.", fx: { rayos: { saber: 60 }, xp: 800, item: "Fragmento maldito", flag: "semillas" } }, mix: { t: "Coges un puñado antes de que te vean.", fx: { rayos: { saber: 30 }, xp: 700, flag: "semillas" } }, miss: { t: "Una semilla se te clava en la mano. Oyes susurros toda la noche.", fx: { xp: 560, pv: -20, estres: 2 } } } },
      { l: "Hablarle a Nyssa a través de la sombra", stat: "carisma", risk: "Alto", out: { hit: { t: "Por un instante la sombra se aparta y una voz cansada dice: «Gracias, pequeño». Tu favor con ella crece.", fx: { rayos: { corazon: 50 }, xp: 780, flag: "nyssa_habla" } }, mix: { t: "La sombra duda antes de atacarte.", fx: { rayos: { corazon: 25 }, xp: 680 } }, miss: { t: "La sombra te grita con mil voces.", fx: { xp: 560, estres: 2 } } } },
    ],
    vote: { q: "Liberar a Nyssa es muy peligroso. ¿Qué decide el grupo?", options: [
      { id: "seguir", l: "Seguir intentando liberarla", d: "Nadie se queda atrás, ni una diosa.", fx: {} },
      { id: "caer", l: "Dejarla caer y centrarse en los demás", d: "Nyssa desaparece del panteón para siempre.", fx: { fall: "nyssa", orden: 1 } } ] } },
  { cap: 23, t: "La bruja del Páramo", r: "viol", p: 1,
    text: ["Morwen vive en una choza que cambia de sitio. Sabe cosas de Vaelmor que nadie más sabe, y cobra caro.", "«Las semillas de sombra son trocitos de él», dice mientras remueve un caldero. «Cada dios que se traga una, lo acerca a la superficie»"],
    choices: [
      { l: "Pagar el precio de Morwen", stat: "voluntad", risk: "Moderado", out: { hit: { t: "Morwen se lleva un recuerdo feliz tuyo y te enseña a limpiar una semilla de sombra.", fx: { rayos: { saber: 60 }, xp: 820, flag: "limpiar_semillas", estres: 1 } }, mix: { t: "El precio duele más de lo esperado, pero aprendes algo.", fx: { rayos: { saber: 30 }, xp: 720, estres: 2 } }, miss: { t: "Morwen se ríe: «No tienes nada que me interese»", fx: { xp: 580 } } } },
      { l: "Engañar a Morwen", stat: "carisma", risk: "Alto", out: { hit: { t: "Morwen cae en tu trampa y te cuenta dónde golpeará la Orden después: el Ancla de Orvath.", fx: { rayos: { saber: 50, fama: 20 }, xp: 820, flag: "aviso_ancla" } }, mix: { t: "Te pilla, pero le haces gracia.", fx: { rayos: { saber: 25 }, xp: 720 } }, miss: { t: "Te convierte las orejas en orejas de burro durante un día.", fx: { xp: 580, rayos: { fama: -15 } } } } },
      { l: "Ayudarla con su caldero a cambio de información", stat: "inteligencia", risk: "Moderado", out: { hit: { t: "La poción sale perfecta. Morwen te regala un frasco y un secreto: Vaelmor teme a la luz de los dioses unidos.", fx: { rayos: { saber: 50 }, xp: 800, item: "Poción mayor de vida", flag: "luz_unida" } }, mix: { t: "La poción sale regular. Morwen gruñe, pero habla.", fx: { rayos: { saber: 25 }, xp: 700 } }, miss: { t: "La poción explota.", fx: { xp: 580, pv: -20 } } } },
    ],
    vote: { q: "Morwen ofrece al grupo un amuleto que esconde a los devotos de los ojos de Vaelmor, a cambio de un favor futuro. ¿Aceptan?", options: [
      { id: "aceptar", l: "Aceptar el trato", d: "Un favor a una bruja nunca sale barato…", fx: { orden: -1, flag: "deuda_morwen" } },
      { id: "rechazar", l: "Rechazarlo", d: "Mejor no deberle nada a nadie.", fx: { rep: 1 } } ] } },
  { cap: 24, t: "El Ancla se suelta", r: "esc", p: 6, corrupt: "orvath", boss: { n: "Avatar corrupto de Orvath", lvl: 30, aff: "Tierra", god: "orvath" },
    text: ["En los Picos Escarcha, las piedras flotan y la nieve cae hacia arriba. La gran cadena de Orvath se ha soltado de la montaña.", "El avatar de Orvath, cubierto de semillas negras, arrastra la cadena hacia el Páramo. Si la cadena llega, la tumba de Vaelmor se abrirá un poco más."],
    choices: [
      { l: "Sujetar la cadena", stat: "fuerza", risk: "Alto", adv: "aviso_ancla", out: { hit: { t: "Clavas los pies en la nieve y la cadena se detiene. Toda la montaña cruje.", fx: { rayos: { poder: 80 }, xp: 880, energiaMax: 1 } }, mix: { t: "La frenas un rato, con los brazos destrozados.", fx: { rayos: { poder: 40 }, xp: 780, pv: -25 } }, miss: { t: "La cadena te arrastra montaña abajo.", fx: { xp: 640, pv: -35 } } } },
      { l: "Pedir ayuda al Monasterio Nube Blanca", stat: "carisma", risk: "Moderado", out: { hit: { t: "La hermana Kiri y sus monjes rezan con vosotros. La gravedad vuelve a su sitio a su alrededor.", fx: { rayos: { corazon: 50, fama: 30 }, xp: 840 } }, mix: { t: "Solo vienen tres monjes, pero ayudan.", fx: { rayos: { corazon: 25 }, xp: 740 } }, miss: { t: "Los monjes no bajan de la montaña.", fx: { xp: 620 } } } },
      { l: "Limpiar las semillas del cuerpo del avatar", stat: "sabiduria", risk: "Alto", adv: "limpiar_semillas", out: { hit: { t: "Arrancas tres semillas. El avatar se tambalea y te mira con ojos de piedra agradecidos.", fx: { rayos: { saber: 70 }, xp: 880 } }, mix: { t: "Arrancas una semilla. Quema.", fx: { rayos: { saber: 35 }, xp: 780, pv: -15 } }, miss: { t: "El avatar te aplasta contra la nieve.", fx: { xp: 640, pv: -30 } } } },
    ],
    vote: { q: "La cadena de Orvath no puede volver entera a la montaña. ¿Qué hace el grupo?", options: [
      { id: "anclar", l: "Anclarla de nuevo, aunque cueste luz", d: "La tumba se queda cerrada.", fx: { luz: -2, orden: -1 } },
      { id: "caer", l: "Dejar caer a Orvath", d: "Orvath desaparece del panteón.", fx: { fall: "orvath", orden: 1 } } ] } },
  { cap: 25, t: "La Forja apagada", r: "quem", p: 5, corrupt: "ignar", boss: { n: "Avatar corrupto de Ignar", lvl: 35, aff: "Fuego", god: "ignar" },
    text: ["Por primera vez en mil años, el fuego de Forjaroja se ha apagado. En el Templo de la Forja, el yunque de Ignar está frío y negro.", "La herrera Ignara llora de rabia: «Mi fuego viene de él. Si Ignar cae, Forjaroja cae con él»"],
    choices: [
      { l: "Encender la forja con Ignara", stat: "defensa", risk: "Moderado", out: { hit: { t: "Aguantas el calor hasta que la forja vuelve a rugir. Ignara te forja un arma nueva.", fx: { rayos: { poder: 60 }, xp: 900, vinc: { "Ignara": 2 }, flag: "arma_ignara" } }, mix: { t: "Una chispa prende. No es mucho, pero es algo.", fx: { rayos: { poder: 30 }, xp: 800, pv: -15 } }, miss: { t: "Te quemas las manos.", fx: { xp: 660, pv: -25 } } } },
      { l: "Buscar a los cultistas en las Minas de Rubí", stat: "agilidad", risk: "Alto", out: { hit: { t: "Encuentras su almacén de semillas y lo hundes en la lava.", fx: { rayos: { poder: 50, fama: 40 }, xp: 920, flag: "almacen_hundido" } }, mix: { t: "Destruyes parte del almacén.", fx: { rayos: { fama: 20 }, xp: 820 } }, miss: { t: "Los cultistas te persiguen por los túneles.", fx: { xp: 660, pv: -25 } } } },
      { l: "Rezar a Ignar en su lengua", stat: "voluntad", risk: "Alto", out: { hit: { t: "Entre el humo oyes un martillo lejano. Ignar sigue ahí, luchando.", fx: { rayos: { corazon: 50, saber: 30 }, xp: 900, flag: "ignar_lucha" } }, mix: { t: "Solo oyes el silencio del yunque.", fx: { rayos: { corazon: 20 }, xp: 780 } }, miss: { t: "El humo negro te hace toser sangre.", fx: { xp: 660, pv: -20 } } } },
    ],
    vote: { q: "Ignara pide que el grupo se quede a defender Forjaroja. ¿Se quedan?", options: [
      { id: "quedarse", l: "Quedarse a defender la ciudad", d: "Forjaroja no cae hoy.", fx: { rep: 2 } },
      { id: "seguir", l: "Seguir hacia el Lago Espejo", d: "Mirael es la última guardiana en pie.", fx: { orden: -1 } } ] } },
  { cap: 26, t: "El Lago que miente", r: "verde", p: 1, corrupt: "mirael", boss: { n: "Avatar corrupto de Mirael", lvl: 40, aff: "Sombra", god: "mirael" },
    text: ["El Lago Espejo ya no refleja lo que hay: refleja lo que temes. Al asomarte ves a tus amigos dándote la espalda.", "Mirael, la diosa de la realidad, está atrapada en su propio reflejo. Todo lo que dice el lago es mentira… o casi todo."],
    choices: [
      { l: "Mirar tu reflejo sin apartar la vista", stat: "voluntad", risk: "Alto", out: { hit: { t: "Aguantas hasta que el reflejo se rompe. Detrás, Mirael te tiende la mano.", fx: { rayos: { corazon: 60, saber: 40 }, xp: 960, estres: -2 } }, mix: { t: "Apartas la vista a tiempo, temblando.", fx: { rayos: { corazon: 30 }, xp: 860, estres: 1 } }, miss: { t: "El reflejo te convence de cosas horribles durante días.", fx: { xp: 720, estres: 3 } } } },
      { l: "Descubrir qué reflejos dicen la verdad", stat: "inteligencia", risk: "Moderado", out: { hit: { t: "Uno no miente: ves a Aurelia en la Cumbre, hace 30 años, pidiendo un deseo que la dejara volver.", fx: { rayos: { saber: 70 }, xp: 960, flag: "deseo_aurelia" } }, mix: { t: "Solo ves sombras moviéndose en el agua.", fx: { rayos: { saber: 35 }, xp: 860 } }, miss: { t: "Te pierdes entre mentiras.", fx: { xp: 720, estres: 2 } } } },
      { l: "Sacar a los elfos atrapados en el agua", stat: "agilidad", risk: "Moderado", out: { hit: { t: "Sacas a cinco elfos de Copaalta. Sylwen te nombra amigo del bosque.", fx: { rayos: { corazon: 50, fama: 40 }, xp: 940, vinc: { "Sylwen": 2 } } }, mix: { t: "Sacas a dos antes de que el lago se cierre.", fx: { rayos: { corazon: 25 }, xp: 840 } }, miss: { t: "El agua fría casi te lleva a ti.", fx: { xp: 720, pv: -30 } } } },
    ],
    vote: { q: "El lago muestra al grupo un camino rápido hasta la tumba de Vaelmor. ¿Se fían?", options: [
      { id: "fiarse", l: "Fiarse del lago", d: "Llegar antes que la Orden.", fx: { orden: -1, luz: -2 } },
      { id: "camino", l: "Ir por el camino largo", d: "El lago miente. Casi siempre.", fx: { rep: 1 } } ] } },
  { cap: 27, t: "La máquina de Tobble", r: "alba", p: 1,
    text: ["Tobble Engranaje por fin enseña su secreto: una máquina enorme en el sótano de la academia, hecha para atrapar la luz del sol.", "«No la construí para robar luz», dice avergonzado. «La construí para guardarla. Con las tres reliquias podría encerrar a Vaelmor en su propia oscuridad»"],
    choices: [
      { l: "Ayudar a Tobble a terminar la máquina", stat: "inteligencia", risk: "Moderado", adv: "cuatro_templos", out: { hit: { t: "La máquina zumba. Una esfera de luz dorada se enciende en el centro.", fx: { rayos: { saber: 80 }, xp: 1000, flag: "maquina_lista" } }, mix: { t: "Funciona a medias. Tobble dice que servirá… probablemente.", fx: { rayos: { saber: 40 }, xp: 900 } }, miss: { t: "Algo explota. Tobble no tiene cejas.", fx: { xp: 760, pv: -15 } } } },
      { l: "Llevar la noticia a Aurelia", stat: "carisma", risk: "Bajo", adv: "deseo_aurelia", out: { hit: { t: "Aurelia te escucha y confiesa: «Mi deseo fue volver. Por eso el sol perdió tanta luz aquel año»", fx: { rayos: { corazon: 60, saber: 40 }, xp: 960, flag: "aurelia_confiesa" } }, mix: { t: "Aurelia aprueba el plan sin decir más.", fx: { rayos: { corazon: 30 }, xp: 860 } }, miss: { t: "Aurelia no está en su despacho.", fx: { xp: 760 } } } },
      { l: "Proteger la máquina de espías", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Atrapas a un cultista disfrazado de conserje.", fx: { rayos: { fama: 50, poder: 30 }, xp: 960 } }, mix: { t: "Alguien huye por los tejados.", fx: { rayos: { fama: 20 }, xp: 860 } }, miss: { t: "Te distraes y alguien roba unos planos.", fx: { xp: 760, estres: 1 } } } },
    ],
    vote: { q: "La máquina de Tobble puede usarse de dos formas. ¿Cuál elige el grupo?", options: [
      { id: "sellar", l: "Para sellar a Vaelmor", d: "Encerrarlo para siempre con las reliquias.", fx: { flag: "plan_sellar" } },
      { id: "solen", l: "Para devolverle luz a Solen", d: "Salvar el sol primero; Vaelmor después.", fx: { luz: 5, flag: "plan_solen" } } ] } },
  { cap: 28, t: "El Mar de Ceniza", r: "quem", p: 2,
    text: ["El ejército de la Orden marcha por el Mar de Ceniza hacia el Páramo Violeta. Son cientos, y llevan carros llenos de semillas de sombra.", "Thorne ve entre ellos a los que destruyeron su manada. Aprieta los puños hasta sangrar."],
    choices: [
      { l: "Frenar a Thorne antes de que ataque solo", stat: "carisma", risk: "Moderado", out: { hit: { t: "Thorne se calma. «Juntos», dice. Y juntos lo hacéis.", fx: { rayos: { corazon: 70 }, xp: 1000, vinc: { "Thorne Colmillo": 2 } } }, mix: { t: "Thorne ataca igual, pero no va solo: vas con él.", fx: { rayos: { corazon: 35, poder: 30 }, xp: 900, pv: -15 } }, miss: { t: "Thorne desaparece entre la ceniza.", fx: { xp: 780, estres: 2 } } } },
      { l: "Quemar los carros de semillas", stat: "agilidad", risk: "Alto", adv: "almacen_hundido", out: { hit: { t: "Los carros arden y las semillas gritan al quemarse.", fx: { rayos: { poder: 60, fama: 50 }, xp: 1040, flag: "carros_quemados" } }, mix: { t: "Quemas la mitad.", fx: { rayos: { poder: 30 }, xp: 920, pv: -15 } }, miss: { t: "Te rodean y tienes que huir.", fx: { xp: 780, pv: -30 } } } },
      { l: "Atacar de frente con todo", stat: "fuerza", risk: "Alto", out: { hit: { t: "Rompes la primera línea. La Orden retrocede.", fx: { rayos: { poder: 80 }, xp: 1040 } }, mix: { t: "La línea aguanta, pero la dañas.", fx: { rayos: { poder: 40 }, xp: 920, pv: -25 } }, miss: { t: "Son demasiados.", fx: { xp: 780, pv: -40 } } } },
    ],
    vote: { q: "El ejército se retira hacia la Entrada de Abajo. ¿Qué hace el grupo?", options: [
      { id: "perseguir", l: "Perseguirlos hasta la Entrada", d: "Terminar esto de una vez.", fx: { orden: -2 } },
      { id: "reunir", l: "Reunir aliados primero", d: "Kael, Lysa, los piratas, los monjes…", fx: { rep: 2 } } ] } },
  { cap: 29, t: "La Entrada de Abajo", r: "viol", p: 4, boss: { n: "Heraldo de Vaelmor", lvl: 42, aff: "Sombra" },
    text: ["La grieta del Páramo se ha convertido en una escalera que baja hacia la oscuridad. Cada escalón susurra tu nombre.", "Al fondo hay una puerta enorme, medio abierta. Delante, una figura hecha de noche guarda el paso: el Heraldo de Vaelmor."],
    choices: [
      { l: "Bajar sin escuchar los susurros", stat: "voluntad", risk: "Alto", out: { hit: { t: "Llegas abajo con la mente clara. Los susurros no te han tocado.", fx: { rayos: { corazon: 50, poder: 50 }, xp: 1100, estres: -2 } }, mix: { t: "Llegas, pero con una voz metida en la cabeza.", fx: { rayos: { poder: 30 }, xp: 1000, estres: 2 } }, miss: { t: "Los susurros te hacen dudar de todos tus amigos.", fx: { xp: 860, estres: 3 } } } },
      { l: "Estudiar la puerta de la tumba", stat: "inteligencia", risk: "Moderado", adv: "archivo_mapa", out: { hit: { t: "La puerta tiene catorce cerraduras, una por dios. Ves cuáles siguen cerradas.", fx: { rayos: { saber: 80 }, xp: 1100, flag: "cerraduras" } }, mix: { t: "Entiendes que la puerta se cierra con luz, no con fuerza.", fx: { rayos: { saber: 40 }, xp: 980 } }, miss: { t: "Las runas se mueven cuando las miras.", fx: { xp: 860, estres: 1 } } } },
      { l: "Proteger a los compañeros que bajan detrás", stat: "defensa", risk: "Moderado", out: { hit: { t: "Nadie se queda atrás.", fx: { rayos: { corazon: 70 }, xp: 1080 } }, mix: { t: "Llegan todos, algunos heridos.", fx: { rayos: { corazon: 35 }, xp: 960, pv: -20 } }, miss: { t: "Una sombra te arrastra fuera de la escalera.", fx: { xp: 860, pv: -35 } } } },
    ],
    vote: { q: "Delante de la puerta de la tumba, ¿cuál es el plan del grupo?", options: [
      { id: "entrar", l: "Entrar y enfrentarse a Vaelmor", d: "Ahora que aún está medio dormido.", fx: { orden: -1 } },
      { id: "esperar", l: "Esperar a los aliados", d: "Más fuerza, pero Vaelmor despierta un poco más.", fx: { rep: 1, luz: -3 } } ] } },
  { cap: 30, t: "Lo que hay debajo", r: "viol", p: 4, boss: { n: "Vaelmor, medio despierto", lvl: 45, aff: "Sombra" },
    text: ["Dentro de la tumba no hay suelo ni techo: solo una oscuridad inmensa que respira. En el centro, dos ojos del tamaño de lunas se abren despacio.", "«Pequeños», dice Vaelmor, y su voz hace temblar el mundo. «Mi hermano se muere. Dejadme ocupar su sitio y nadie volverá a tener miedo de la noche»"],
    choices: [
      { l: "Resistir la voz de Vaelmor", stat: "voluntad", risk: "Alto", out: { hit: { t: "No te arrodillas. Vaelmor te mira con algo parecido al respeto.", fx: { rayos: { poder: 80, corazon: 60 }, xp: 1200, flag: "resistio_vaelmor" } }, mix: { t: "Te tiemblan las piernas, pero sigues en pie.", fx: { rayos: { poder: 40 }, xp: 1080, estres: 2 } }, miss: { t: "Caes de rodillas. La voz se te queda dentro.", fx: { xp: 900, estres: 3 } } } },
      { l: "Colocar las reliquias en la máquina", stat: "agilidad", risk: "Alto", adv: "maquina_lista", out: { hit: { t: "La esfera dorada se enciende en el corazón de la oscuridad. Vaelmor ruge.", fx: { rayos: { saber: 70, fama: 60 }, xp: 1200, flag: "reliquias_colocadas" } }, mix: { t: "Colocas una reliquia antes de que la sombra te aparte.", fx: { rayos: { saber: 35 }, xp: 1080, pv: -20 } }, miss: { t: "La máquina se te escapa de las manos.", fx: { xp: 900, pv: -30 } } } },
      { l: "Llamar a los dioses liberados", stat: "carisma", risk: "Alto", adv: "luz_unida", out: { hit: { t: "Una por una, las voces de los dioses responden. La oscuridad retrocede un paso.", fx: { rayos: { corazon: 80 }, xp: 1200, flag: "dioses_responden" } }, mix: { t: "Responde solo un dios, lejano.", fx: { rayos: { corazon: 40 }, xp: 1080 } }, miss: { t: "Nadie responde. Vaelmor se ríe.", fx: { xp: 900, estres: 2 } } } },
    ],
    vote: { q: "Vaelmor está débil, pero no vencido. ¿Qué hace el grupo?", options: [
      { id: "sellar", l: "Sellarlo con la máquina de Tobble", d: "Cerrar la tumba otra vez. Las reliquias se pierden dentro.", fx: { orden: -3, flag: "vaelmor_sellado" } },
      { id: "pacto", l: "Aceptar su oferta", d: "Que Vaelmor sea el nuevo sol. La noche será eterna, pero tranquila.", fx: { luz: -20, orden: 3, flag: "vaelmor_pacto" } },
      { id: "solen", l: "Usar la luz de los dioses para despertar a Solen", d: "Arriesgarlo todo: si Solen despierta, Vaelmor vuelve a dormir.", fx: { luz: 10, flag: "solen_despierta" } } ] } },

  // ===================== ARCO 4: LA VERDAD DE LA CUMBRE =====================
  { cap: 31, t: "El sol que queda", r: "alba", p: 1,
    text: ["Último año en Sunrise Academy. El sol ya no calienta: ilumina, como una lámpara cansada. Los profesores dan clase con velas encendidas a mediodía.", "Seraphina Lux te busca en el pasillo, pálida: «He visto el final del año. Todos estamos en la Cumbre. Y el sol… no sé si el sol está»"],
    textBy: { sellar: "Vaelmor duerme sellado bajo el Páramo, pero Solen sigue apagándose: el problema nunca fue solo Vaelmor.", pacto: "Desde el pacto con Vaelmor, la noche dura veinte horas. La gente empieza a olvidar el color del cielo.", solen: "Desde que la luz de los dioses tocó a Solen, a veces se oye una voz en el amanecer, débil, como alguien que habla en sueños." },
    choices: [
      { l: "Preguntar a Seraphina por su visión", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Seraphina te dibuja lo que vio: una escalera de luz hecha de personas. Las caras de los ganadores.", fx: { rayos: { saber: 80 }, xp: 1300, flag: "vision_escalera", vinc: { "Seraphina Lux": 1 } } }, mix: { t: "Solo recuerda luz y mucho frío.", fx: { rayos: { saber: 40 }, xp: 1150 } }, miss: { t: "Seraphina se asusta y no quiere hablar más.", fx: { xp: 1000 } } } },
      { l: "Leer el diario de Aurelia", stat: "inteligencia", risk: "Alto", adv: "aurelia_confiesa", out: { hit: { t: "Aurelia lo escribió todo: «Pedí volver. El sol pagó mi vuelta con diez años de luz. No sé cómo devolverlos»", fx: { rayos: { saber: 90 }, xp: 1350, flag: "diario_aurelia" } }, mix: { t: "Muchas páginas están arrancadas.", fx: { rayos: { saber: 45 }, xp: 1200 } }, miss: { t: "Aurelia te pilla leyendo. No dice nada, pero su mirada duele.", fx: { xp: 1000, estres: 2 } } } },
      { l: "Entrenar para la última Prueba", stat: "fuerza", risk: "Moderado", out: { hit: { t: "Kael te mira entrenar sin decir nada. Al final asiente una sola vez.", fx: { rayos: { poder: 90 }, xp: 1300 } }, mix: { t: "Mejoras, pero te duele todo.", fx: { rayos: { poder: 45 }, xp: 1150, pv: -20 } }, miss: { t: "Te lesionas el hombro.", fx: { xp: 1000, pv: -35 } } } },
    ],
    vote: { q: "¿Por dónde empieza el grupo a buscar la verdad de la Cumbre?", options: [
      { id: "ganadores", l: "Buscar a los ganadores que no volvieron", d: "Sus ecos todavía rondan el Valle.", fx: {} },
      { id: "rey", l: "Preguntar al rey, que paga la Prueba", d: "Si alguien sabe, es él.", fx: { rep: -1 } } ] } },
  { cap: 32, t: "Los que no volvieron", r: "alba", p: 3,
    text: ["El espectro del Faro Antiguo sigue repitiendo su frase, pero esta vez no está solo: decenas de luces pequeñas flotan a su alrededor.", "Son los ganadores de la Cumbre. No están muertos. Están dentro del sol, y el sol les está olvidando."],
    choices: [
      { l: "Hablar con los ecos de luz", stat: "voluntad", risk: "Alto", adv: "pista_deseo", out: { hit: { t: "Una luz te habla: «Cada año, la luz de uno más. Solen nos sostiene, pero ya no puede con tantos»", fx: { rayos: { saber: 80, corazon: 40 }, xp: 1400, flag: "ecos_hablan" } }, mix: { t: "Las luces te rodean, cálidas, sin decir nada.", fx: { rayos: { corazon: 50 }, xp: 1250 } }, miss: { t: "Mirar tanta luz te deja ciego un día entero.", fx: { xp: 1100, estres: 2 } } } },
      { l: "Contar las luces", stat: "inteligencia", risk: "Bajo", out: { hit: { t: "Hay 97 luces. 97 ganadores. Y la Cumbre existe desde hace 97 años.", fx: { rayos: { saber: 90 }, xp: 1350 } }, mix: { t: "Pierdes la cuenta después de sesenta.", fx: { rayos: { saber: 45 }, xp: 1200 } }, miss: { t: "Se mueven demasiado rápido.", fx: { xp: 1100 } } } },
      { l: "Buscar entre ellas a la hermana de Nyx", stat: "sabiduria", risk: "Moderado", out: { hit: { t: "Una luz violeta reacciona al nombre de Nyx. Está aquí.", fx: { rayos: { corazon: 70 }, xp: 1400, flag: "hermana_nyx" } }, mix: { t: "Crees verla, pero no estás seguro.", fx: { rayos: { corazon: 35 }, xp: 1250 } }, miss: { t: "Todas las luces parecen iguales.", fx: { xp: 1100 } } } },
    ],
    vote: { q: "¿Se lo cuentan a Kael, cuyo hijo ganó la Cumbre hace cinco años?", options: [
      { id: "contar", l: "Contárselo a Kael", d: "Tiene derecho a saberlo.", fx: { rep: 1 } },
      { id: "callar", l: "Esperar a tener pruebas", d: "No hacerle daño sin estar seguros.", fx: {} } ] } },
  { cap: 33, t: "El hijo de Kael", r: "alba", p: 4, boss: { n: "Eco del Campeón", lvl: 45, aff: "Luz" },
    text: ["En lo más hondo de la Cueva del Primer Rayo brilla un eco más fuerte que los demás: el hijo de Kael, atrapado entre la luz y la piedra.", "Ya no recuerda su nombre. Solo recuerda pelear, y ataca a todo lo que se acerca."],
    choices: [
      { l: "Traer a Kael hasta la cueva", stat: "carisma", risk: "Alto", out: { hit: { t: "Kael dice el nombre de su hijo. El eco se detiene… y sonríe. Por un momento, se abrazan.", fx: { rayos: { corazon: 100 }, xp: 1500, vinc: { "Kael Dorn": 3 }, flag: "kael_abrazo" } }, mix: { t: "Kael llega tarde, pero el eco lo reconoce desde lejos.", fx: { rayos: { corazon: 50 }, xp: 1300, vinc: { "Kael Dorn": 2 } } }, miss: { t: "Kael no quiere venir. «No quiero verlo así»", fx: { xp: 1150, estres: 1 } } } },
      { l: "Aguantar sus golpes sin devolverlos", stat: "defensa", risk: "Alto", out: { hit: { t: "Aguantas hasta que el eco se cansa y se sienta a tu lado, confundido.", fx: { rayos: { corazon: 60, poder: 50 }, xp: 1450, energiaMax: 1 } }, mix: { t: "Aguantas, a duras penas.", fx: { rayos: { poder: 30 }, xp: 1300, pv: -30 } }, miss: { t: "Un golpe de luz te deja inconsciente.", fx: { xp: 1150, pv: -50 } } } },
      { l: "Estudiar cómo la luz lo sujeta", stat: "inteligencia", risk: "Moderado", out: { hit: { t: "La luz no lo sujeta: lo está usando como combustible. La Cumbre se alimenta de los ganadores.", fx: { rayos: { saber: 90 }, xp: 1450, flag: "combustible" } }, mix: { t: "Ves hilos de luz saliendo de él hacia el cielo.", fx: { rayos: { saber: 45 }, xp: 1300 } }, miss: { t: "El eco te ve y te ataca.", fx: { xp: 1150, pv: -30 } } } },
    ],
    vote: { q: "El eco del hijo de Kael puede liberarse, pero el sol perdería su luz. ¿Qué hace el grupo?", options: [
      { id: "liberar", l: "Liberarlo", d: "Nadie debería ser combustible.", fx: { luz: -5, rep: 1, flag: "eco_liberado" } },
      { id: "dejar", l: "Dejarlo donde está, por ahora", d: "El sol no puede perder más luz.", fx: {} } ] } },
  { cap: 34, t: "El baile hundido", r: "viol", p: 3,
    text: ["El Enmascarado de la Escalera por fin se quita la máscara: es Nyx, una umbría. Su hermana ganó la Cumbre hace tres años.", "Nyx te cita en el Salón de Baile Hundido, donde bailaban juntas de niñas. Quiere entrar en la Cumbre antes de tiempo, y quiere que la ayudes."],
    choices: [
      { l: "Bailar con Nyx para ganarte su confianza", stat: "carisma", risk: "Moderado", out: { hit: { t: "Bailáis entre los fantasmas del salón. Nyx se ríe por primera vez en años.", fx: { rayos: { corazon: 90 }, xp: 1500, vinc: { "Nyx": 2 } } }, mix: { t: "Le pisas los pies, pero lo agradece igual.", fx: { rayos: { corazon: 45 }, xp: 1350, vinc: { "Nyx": 1 } } }, miss: { t: "Nyx se marcha antes de acabar la música.", fx: { xp: 1200 } } } },
      { l: "Convencerla de no entrar sola", stat: "voluntad", risk: "Alto", adv: "hermana_nyx", out: { hit: { t: "Le cuentas que viste a su hermana entre las luces. Nyx llora y promete esperar al grupo.", fx: { rayos: { corazon: 80, saber: 30 }, xp: 1550, flag: "nyx_espera" } }, mix: { t: "Nyx duda. Dice que lo pensará.", fx: { rayos: { corazon: 40 }, xp: 1400 } }, miss: { t: "«Tú no lo entiendes», dice, y desaparece en la sombra.", fx: { xp: 1200, estres: 1 } } } },
      { l: "Pelear con los fantasmas del salón", stat: "fuerza", risk: "Moderado", out: { hit: { t: "Limpias el salón. Nyx te mira con otros ojos.", fx: { rayos: { poder: 90 }, xp: 1500 } }, mix: { t: "Los fantasmas se retiran, pero te dejan helado.", fx: { rayos: { poder: 45 }, xp: 1350, pv: -25 } }, miss: { t: "Son demasiados.", fx: { xp: 1200, pv: -40 } } } },
    ],
    vote: { q: "Nyx quiere colarse en la Cumbre esta misma noche. ¿La acompaña el grupo?", options: [
      { id: "acompanar", l: "Acompañarla ya", d: "Llegar antes que la Prueba.", fx: { luz: -3, flag: "entrada_nyx" } },
      { id: "esperar", l: "Esperar a la Prueba oficial", d: "Entrar por la puerta grande.", fx: { rep: 1 } } ] } },
  { cap: 35, t: "La corona y la luz", r: "cap", p: 0,
    text: ["El rey Aldric III recibe al grupo de noche, sin cortesanos. Sabe lo que habéis descubierto.", "«Cada rey antes que yo lo supo», dice. «Los deseos compran paz. Un deseo cada año, y Solvaria no tiene guerras, ni hambre, ni plagas. El sol es el precio»"],
    choices: [
      { l: "Discutir con el rey", stat: "carisma", risk: "Alto", out: { hit: { t: "El rey se quita la corona y la deja en la mesa. «Entonces decidid vosotros»", fx: { rayos: { fama: 100 }, xp: 1600, flag: "rey_cede" } }, mix: { t: "El rey escucha, pero no promete nada.", fx: { rayos: { fama: 50 }, xp: 1450 } }, miss: { t: "Os echan de palacio.", fx: { xp: 1300, rayos: { fama: -30 } } } } },
      { l: "Buscar los registros de deseos en el Archivo", stat: "inteligencia", risk: "Moderado", adv: "archivo_mapa", out: { hit: { t: "97 deseos anotados. Casi todos los pidió un rey a través del ganador. Solo uno fue egoísta: el de Aurelia.", fx: { rayos: { saber: 100 }, xp: 1600, flag: "registro_deseos" } }, mix: { t: "Encuentras los deseos de los últimos diez años.", fx: { rayos: { saber: 50 }, xp: 1450 } }, miss: { t: "La esfinge no te deja pasar esta vez.", fx: { xp: 1300 } } } },
      { l: "Hablar con Darius, que cenaba en palacio", stat: "sabiduria", risk: "Bajo", out: { hit: { t: "Darius confiesa que su familia quiere que gane para pedir el trono. Él no quiere. Te ofrece su ayuda.", fx: { rayos: { corazon: 80 }, xp: 1550, vinc: { "Darius Valcor": 2 }, flag: "darius_aliado" } }, mix: { t: "Darius habla poco, pero te da la mano.", fx: { rayos: { corazon: 40 }, xp: 1400 } }, miss: { t: "Darius está demasiado borracho para hablar.", fx: { xp: 1300 } } } },
    ],
    vote: { q: "¿Qué hace el grupo con lo que sabe del rey?", options: [
      { id: "contar", l: "Contárselo a todo Solvaria", d: "La gente merece saber qué paga el sol.", fx: { rep: 2, orden: 1 } },
      { id: "secreto", l: "Guardar el secreto a cambio de ayuda real", d: "El rey pondrá su guardia al servicio del grupo.", fx: { rep: -1, orden: -1, flag: "ayuda_real" } } ] } },
  { cap: 36, t: "La última Prueba", r: "alba", p: 1,
    text: ["Llega el final del año. La Prueba de la Cumbre mezcla los cuatro caminos: un combate, un enigma, una decisión y una hazaña ante toda la academia.", "Esta vez, todo el grupo se ha clasificado. Y esta vez, todos saben lo que hay arriba."],
    choices: [
      { l: "Ganar el combate de la Prueba", stat: "fuerza", risk: "Alto", adv: "cenit", out: { hit: { t: "Tu último golpe hace temblar la arena. La academia entera grita tu nombre.", fx: { rayos: { poder: 120, fama: 60 }, xp: 1800 } }, mix: { t: "Ganas por los pelos.", fx: { rayos: { poder: 60 }, xp: 1600, pv: -30 } }, miss: { t: "Pierdes el combate, pero sigues en la Prueba.", fx: { xp: 1400, pv: -40 } } } },
      { l: "Resolver el enigma de la esfinge", stat: "inteligencia", risk: "Alto", adv: "cenit", out: { hit: { t: "«¿Qué se apaga cuanto más se usa?» Respondes: «El sol». La esfinge se aparta en silencio.", fx: { rayos: { saber: 120 }, xp: 1800 } }, mix: { t: "Aciertas al segundo intento.", fx: { rayos: { saber: 60 }, xp: 1600 } }, miss: { t: "Te equivocas. La esfinge suspira.", fx: { xp: 1400, estres: 1 } } } },
      { l: "Ayudar a un rival caído en plena Prueba", stat: "carisma", risk: "Moderado", out: { hit: { t: "Paras a ayudar a Garrok. Pierdes tiempo, pero toda la academia se pone en pie.", fx: { rayos: { corazon: 120, fama: 60 }, xp: 1750, vinc: { "Garrok Piedraluna": 2 } } }, mix: { t: "Lo ayudas y los dos llegáis tarde.", fx: { rayos: { corazon: 60 }, xp: 1550 } }, miss: { t: "Tropezáis juntos.", fx: { xp: 1400, pv: -20 } } } },
    ],
    vote: { q: "El grupo gana la Prueba. Solo uno puede subir la escalera de luz… ¿o no?", options: [
      { id: "todos", l: "Subir todos juntos", d: "Nunca se ha hecho. Nadie sabe qué pasará.", fx: { flag: "suben_todos" } },
      { id: "uno", l: "Que suba uno, y los demás lo sigan en secreto", d: "Cumplir las reglas… a medias.", fx: { rep: 1 } } ] } },
  { cap: 37, t: "La Puerta de Aster", r: "lost", p: 0, boss: { n: "Guardián del Umbral", lvl: 52, aff: null },
    text: ["Antes de subir, Brisa Sal tiene algo que enseñaros: el mapa que trajo de las Islas Perdidas no lleva a la tumba de Vaelmor, sino al lugar donde los dioses hicieron a Solen.", "En la Isla del Umbral, la Puerta de Aster se abre solo para quien trae una pregunta sincera. Un guardián sin cara espera la vuestra."],
    choices: [
      { l: "Hacer tu pregunta al guardián", stat: "voluntad", risk: "Alto", out: { hit: { t: "«¿Cómo se salva al sol?» El guardián responde: «Con la misma luz que se le quitó»", fx: { rayos: { saber: 100 }, xp: 1800, flag: "respuesta_umbral" } }, mix: { t: "El guardián responde con otra pregunta.", fx: { rayos: { saber: 50 }, xp: 1600 } }, miss: { t: "El guardián no te considera sincero.", fx: { xp: 1400, estres: 2 } } } },
      { l: "Buscar los murales de la creación de Solen", stat: "sabiduria", risk: "Moderado", adv: "mural", out: { hit: { t: "Los murales muestran a los catorce dioses dando un poco de su luz para crear a Solen.", fx: { rayos: { saber: 110 }, xp: 1800, flag: "creacion_solen" } }, mix: { t: "Los murales están medio borrados por el mar.", fx: { rayos: { saber: 55 }, xp: 1600 } }, miss: { t: "La marea sube y tienes que huir.", fx: { xp: 1400, pv: -30 } } } },
      { l: "Proteger al grupo de las criaturas de bruma", stat: "defensa", risk: "Alto", out: { hit: { t: "Nadie resulta herido. Brisa te da un beso en la mejilla.", fx: { rayos: { corazon: 90, poder: 50 }, xp: 1750, vinc: { "Brisa Sal": 1 } } }, mix: { t: "Aguantas, con arañazos por todas partes.", fx: { rayos: { poder: 50 }, xp: 1550, pv: -35 } }, miss: { t: "La bruma te arrastra lejos del grupo.", fx: { xp: 1400, pv: -45 } } } },
    ],
    vote: { q: "El guardián ofrece al grupo un fragmento de la luz original de Solen. ¿Lo aceptan?", options: [
      { id: "aceptar", l: "Aceptar el fragmento", d: "Podría devolverle la vida al sol… o romperlo.", fx: { luz: 5, flag: "fragmento_solen" } },
      { id: "rechazar", l: "Dejarlo donde está", d: "No es vuestro.", fx: { rep: 1 } } ] } },
  { cap: 38, t: "El Telar de Norna", r: "lost", p: 4,
    text: ["En el Telar de Norna cuelgan hilos de luz, uno por cada vida de Solvaria. Algunos brillan. Otros están a punto de cortarse.", "Norna os enseña vuestros propios hilos. Todos llegan hasta la Cumbre del Alba. Allí, uno de ellos se convierte en sol."],
    choices: [
      { l: "Mirar tu propio hilo", stat: "voluntad", risk: "Alto", out: { hit: { t: "Tu hilo no termina en la Cumbre: sigue más allá. Hay un después.", fx: { rayos: { corazon: 80, saber: 60 }, xp: 1900, estres: -3, flag: "hilo_sigue" } }, mix: { t: "Tu hilo se pierde en la luz. No sabes qué significa.", fx: { rayos: { saber: 50 }, xp: 1700, estres: 1 } }, miss: { t: "Ver tu final te llena de miedo.", fx: { xp: 1500, estres: 3 } } } },
      { l: "Preguntar a Norna por los hilos del grupo", stat: "carisma", risk: "Moderado", out: { hit: { t: "Norna sonríe: «Los hilos que se tocan son más fuertes. Los vuestros están muy enredados»", fx: { rayos: { corazon: 110 }, xp: 1850 } }, mix: { t: "Norna solo dice: «Ya lo veréis»", fx: { rayos: { corazon: 55 }, xp: 1650 } }, miss: { t: "Norna no responde a preguntas por otros.", fx: { xp: 1500 } } } },
      { l: "Reparar hilos a punto de romperse", stat: "agilidad", risk: "Moderado", out: { hit: { t: "Salvas doce hilos. En algún lugar de Solvaria, doce personas se levantan de la cama sin saber por qué se sienten mejor.", fx: { rayos: { corazon: 100, fama: 40 }, xp: 1900 } }, mix: { t: "Salvas tres antes de que te tiemblen las manos.", fx: { rayos: { corazon: 50 }, xp: 1700 } }, miss: { t: "Rompes uno sin querer. No sabes de quién era.", fx: { xp: 1500, estres: 2 } } } },
    ],
    vote: { q: "Norna ofrece mostrar al grupo cuál de sus hilos se convierte en sol. ¿Quieren saberlo?", options: [
      { id: "saber", l: "Querer saberlo", d: "Mejor preparados, aunque duela.", fx: { flag: "saben_hilo" } },
      { id: "no", l: "No querer saberlo", d: "El destino se decide arriba, no aquí.", fx: { luz: 2 } } ] } },
  { cap: 39, t: "La escalera de luz", r: "alba", p: 6, boss: { n: "Guardián de la Cumbre", lvl: 58, aff: "Luz" },
    text: ["La escalera de luz se abre sobre Sunrise Academy. Cada peldaño es un ganador de años anteriores; cada uno susurra su deseo al pasar.", "Arriba espera el Guardián de la Cumbre, hecho de 97 deseos. Detrás de él, Solen respira muy despacio."],
    choices: [
      { l: "Subir escuchando cada deseo", stat: "voluntad", risk: "Alto", adv: "ecos_hablan", out: { hit: { t: "Escuchas los 97 deseos. Ninguno pidió apagar el sol. Todos pedían algo bueno.", fx: { rayos: { corazon: 120 }, xp: 2000, flag: "escucho_deseos" } }, mix: { t: "Escuchas algunos. Pesan.", fx: { rayos: { corazon: 60 }, xp: 1800, estres: 1 } }, miss: { t: "Los deseos te aplastan contra los peldaños.", fx: { xp: 1600, estres: 3 } } } },
      { l: "Subir corriendo sin mirar atrás", stat: "agilidad", risk: "Moderado", out: { hit: { t: "Llegas el primero. Solen abre un ojo y te ve.", fx: { rayos: { poder: 100, fama: 60 }, xp: 2000 } }, mix: { t: "Llegas, sin aliento.", fx: { rayos: { poder: 50 }, xp: 1800, pv: -30 } }, miss: { t: "Un peldaño se deshace bajo tus pies.", fx: { xp: 1600, pv: -50 } } } },
      { l: "Sostener a Aurelia, que sube con vosotros", stat: "defensa", risk: "Alto", adv: "diario_aurelia", out: { hit: { t: "Aurelia llega arriba contigo. «Voy a devolver lo que tomé», dice.", fx: { rayos: { corazon: 120 }, xp: 2000, flag: "aurelia_devuelve" } }, mix: { t: "Aurelia llega, muy débil.", fx: { rayos: { corazon: 60 }, xp: 1800 } }, miss: { t: "Aurelia se queda atrás.", fx: { xp: 1600, estres: 2 } } } },
    ],
    vote: { q: "Ante el Guardián de la Cumbre, ¿cómo pasa el grupo?", options: [
      { id: "luchar", l: "Luchar", d: "Abrirse paso por la fuerza.", fx: { orden: -1 } },
      { id: "hablar", l: "Pedir paso a los deseos", d: "Recordarles quiénes eran.", fx: { luz: 3 } } ] } },
  { cap: 40, t: "La verdad de la Cumbre", r: "alba", p: 6, boss: { n: "El eco de todos los deseos", lvl: 60, aff: "Luz" },
    text: ["En la Cumbre del Alba no hay nada más que luz, y en el centro de la luz, Solen: un anciano de oro que apenas puede abrir los ojos.", "«Cada deseo lo pagué yo», dice. «Ya no me queda casi nada. Decidid qué hacer conmigo. Yo ya no puedo»"],
    choices: [
      { l: "Devolverle a Solen la luz de los ganadores", stat: "voluntad", risk: "Extremo", adv: "respuesta_umbral", out: { hit: { t: "Los 97 ecos vuelven a Solen como un río dorado. Por un instante, el sol vuelve a ser joven.", fx: { rayos: { corazon: 150, saber: 80 }, xp: 2400, flag: "luz_devuelta" } }, mix: { t: "Algunos ecos vuelven. Solen respira mejor.", fx: { rayos: { corazon: 75 }, xp: 2100 } }, miss: { t: "La luz te atraviesa y te deja sin fuerzas.", fx: { xp: 1800, pv: -60, estres: 2 } } } },
      { l: "Proteger la Cumbre mientras el grupo decide", stat: "defensa", risk: "Alto", out: { hit: { t: "Nadie os interrumpe. Ni la Orden, ni el rey, ni el miedo.", fx: { rayos: { poder: 120, corazon: 60 }, xp: 2300 } }, mix: { t: "Aguantas, aunque la luz quema.", fx: { rayos: { poder: 60 }, xp: 2000, pv: -40 } }, miss: { t: "La luz te derriba.", fx: { xp: 1800, pv: -60 } } } },
      { l: "Hablar con Solen como a un amigo", stat: "carisma", risk: "Moderado", out: { hit: { t: "Solen se ríe por primera vez en cien años. «Nadie me había hablado así»", fx: { rayos: { corazon: 150 }, xp: 2300, flag: "amigo_solen" } }, mix: { t: "Solen te escucha con los ojos cerrados.", fx: { rayos: { corazon: 75 }, xp: 2000 } }, miss: { t: "Solen está demasiado cansado para escuchar.", fx: { xp: 1800 } } } },
    ],
    vote: { q: "Ha llegado el momento. ¿Qué hace el grupo con el sol?", options: [
      { id: "romper", l: "Romper la Cumbre", d: "No más deseos. El sol se recupera poco a poco y los ganadores vuelven como luz.", fx: { luz: 15, orden: -2, flag: "final_romper" } },
      { id: "sacrificio", l: "Un sacrificio", d: "Uno de vosotros se une al sol para salvarlo de golpe.", fx: { luz: 40, flag: "final_sacrificio" } },
      { id: "dioses", l: "Un pacto con los dioses", d: "Las deidades toman el control del sol.", fx: { luz: 20, flag: "final_dioses" } },
      { id: "apagar", l: "Dejar que se apague", d: "La Orden gana. Empieza una era de oscuridad.", fx: { luz: -80, orden: 5, flag: "final_apagar" } },
      { id: "poder", l: "Tomar el poder", d: "El grupo controla la luz de Solvaria, para bien o para mal.", fx: { luz: 10, rep: -2, flag: "final_poder" } } ] } },
];
const ARCS = [
  { n: 1, t: "El Primer Año", from: 1, to: 10, fin: "El sol salió más débil esa noche." },
  { n: 2, t: "La Orden del Crepúsculo", from: 11, to: 20, fin: "El reloj de la Torre de las Horas se detuvo. Bajo el Páramo Violeta, Vaelmor abrió un ojo." },
  { n: 3, t: "Lo que hay debajo", from: 21, to: 30, fin: "La tumba de Vaelmor quedó en silencio. Pero en la Cumbre del Alba, el sol seguía pagando cada deseo." },
  { n: 4, t: "La verdad de la Cumbre", from: 31, to: 40, fin: "Así terminó la historia de la Cumbre del Alba. Pero Solvaria sigue ahí, esperando lo que hagáis después." },
];
const arcOf = (cap) => ARCS.find((a) => cap >= a.from && cap <= a.to) || ARCS[ARCS.length - 1];
const CORRUPT_LVL = { nyssa: 25, orvath: 30, ignar: 35, mirael: 40 };
const RISK_MOD = { Bajo: 0, Moderado: 0, Alto: 0, Extremo: -1 };
