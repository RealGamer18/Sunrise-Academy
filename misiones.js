// ===================== MISIONES DE LA HISTORIA (Arco 1) =====================
// Cada capítulo de STORY se juega como una misión con pasos. El motor está en historia.js.
//
// Pasos (k):
//   scene   { id, t, auto? }          escena con diálogos (auto: se abre sola al llegar a este paso)
//   go      { r, p, t? }              viajar a un lugar
//   hunt    { r, p, n, mon?, t }      vencer n monstruos en ese lugar (mon: solo ese tipo)
//   explore { r, p, n, t, give? }     explorar n veces en ese lugar (give: objeto al terminar)
//   fight   { t, e:{n,lvl,boss?,rival?,aff?,img?,npc?}, r?, p?, any? }  pelea de la historia (any: cuenta aunque pierdas)
//   choice  { t? }                    la acción personal del capítulo (las opciones de STORY)
//   boss    { t? }                    el jefe del capítulo (si STORY lo tiene)
//   vote    { t? }                    decisión del grupo
//
// Diálogos (lines):
//   "texto"                 narración
//   ["id", "texto"]         habla un personaje (id de SA_NPC, o "tu" para tu personaje)
//   { c: [ { l, fx?, then? } ] }   elección del jugador dentro de la escena
//   { if: (G) => bool, then: [...], else: [...] }
//   { bg: "verde" }         cambia el fondo · { sfx: "boss" } sonido · { fx: {...} } efecto sin elección
// En los textos: {n} = nombre de tu personaje, {r} = tu raza.

window.SA_NPC = {
  aurelia: { n: "Aurelia Solenne", t: "Directora", c: "#e8c878" },
  kael: { n: "Kael Dorn", t: "Profesor de combate", c: "#c0703a" },
  ilvara: { n: "Ilvara Nocturna", t: "Profesora de magia", c: "#8f7ae0" },
  tobble: { n: "Tobble Engranaje", t: "Profesor de runas", c: "#d9a441" },
  yara: { n: "Yara Florvieja", t: "Profesora de sanación", c: "#8be0a8" },
  casimir: { n: "Lord Casimir Vael", t: "Profesor de etiqueta y torneos", c: "#b0344a" },
  brisa: { n: "Brisa Sal", t: "Profesora de exploración", c: "#4fb3ff" },
  darius: { n: "Darius Valcor", t: "Nº 1 de la Escalera", c: "#e0b050" },
  seraphina: { n: "Seraphina Lux", t: "Rival", c: "#cfd9ff" },
  thorne: { n: "Thorne Colmillo", t: "Rival", c: "#9aa4b2" },
  garrok: { n: "Garrok Piedraluna", t: "Compañero", c: "#a08a70" },
  pip: { n: "Pip Brizna", t: "Bardo chismosa", c: "#f08ad0" },
  mira: { n: "Mira", t: "Tabernera de Amanecer", c: "#d98a5a" },
  sylwen: { n: "Sylwen", t: "Guardiana de Verdemar", c: "#7fc26a" },
  kiri: { n: "Hermana Kiri", t: "Monasterio Nube Blanca", c: "#c8f3ff" },
  espectro: { n: "El espectro del faro", t: "", c: "#7fe0c0" },
  pescador: { n: "Viejo pescador", t: "Acantilados del Alba", c: "#6a8aa0" },
  encapuchado: { n: "Encapuchado", t: "La Orden del Crepúsculo", c: "#6a3a9a" },
  maelis: { n: "Maelis Aurora", t: "Estudiante de último año", c: "#ffe9a0" },
  tomas: { n: "Tomás", t: "Estudiante de primer año", c: "#8a9ab8" },
  // Arcos 2–4 y figuras del mundo
  nyx: { n: "Nyx", t: "«El Enmascarado»", c: "#9b5cff" },
  varo: { n: "Capitán Varo «Trueno»", t: "Pirata de Puerto Rayo", c: "#4fb3ff" },
  morwen: { n: "Morwen", t: "Bruja del Páramo Violeta", c: "#b07ae0" },
  lysa: { n: "Capitana Lysa", t: "Jefa de la guardia real", c: "#5a7ae0" },
  ignara: { n: "Ignara", t: "Herrera de Forjaroja", c: "#ff5a3a" },
  aldric: { n: "Rey Aldric III", t: "Rey de Solvaria", c: "#e0c060" },
  isolde: { n: "Isolde", t: "Farera", c: "#4fd0c8" },
  durgan: { n: "Maestro Durgan", t: "Herrero de los Picos", c: "#c08050" },
  bako: { n: "Bako", t: "Mercader de Trigalia", c: "#e08a3a" },
  oren: { n: "Gran Maestre Oren", t: "Líder de los gremios", c: "#a0a0b0" },
};

// Retratos de rivales en combate (se usan cuando haya npc/<id>.png)
window.SA_NPC_FIGHT = { "Darius Valcor": "darius", "Seraphina Lux": "seraphina", "Thorne Colmillo": "thorne", "Garrok Piedraluna": "garrok" };

const ENC = { n: "Encapuchado de la Orden", img: "Cultista del Crepúsculo", aff: "Sombra" };

window.MISIONES = {
  // ------------------------------------------------------------------ 1
  1: {
    sub: "Otoño · Año 1",
    steps: [
      { k: "scene", id: "c1_llegada", t: "Llegar a Amanecer", auto: true },
      { k: "go", r: "alba", p: 1, t: "Sube a Sunrise Academy" },
      { k: "scene", id: "c1_ceremonia", t: "La ceremonia de bienvenida", auto: true },
      { k: "fight", t: "Duelo de práctica contra Darius", any: true, e: { n: "Darius Valcor", lvl: 1, rival: true } },
      { k: "scene", id: "c1_tras_duelo", t: "Después del duelo", auto: true },
      { k: "choice", t: "Decide qué haces esta tarde" },
      { k: "scene", id: "c1_noche", t: "La primera noche", auto: true },
      { k: "vote", t: "El grupo elige su primera clase" },
    ],
  },
  // ------------------------------------------------------------------ 2
  2: {
    sub: "Otoño · Año 1",
    steps: [
      { k: "scene", id: "c2_clase", t: "La primera clase", auto: true },
      { k: "go", r: "alba", p: 2, t: "Ve a los Acantilados del Alba" },
      { k: "scene", id: "c2_pescador", t: "El viejo pescador", auto: true },
      { k: "hunt", r: "alba", p: 2, n: 3, t: "Despeja el camino: vence 3 criaturas de los acantilados" },
      { k: "explore", r: "alba", p: 2, n: 1, give: "Cristal de luz", t: "Explora los acantilados y consigue un Cristal de luz" },
      { k: "choice", t: "El examen: decide cómo lo haces" },
      { k: "fight", r: "alba", p: 2, t: "Lo que baja de noche", e: { n: "Cangrejo de roca gigante", lvl: 4, img: "Cangrejos de roca", aff: "Luz" } },
      { k: "scene", id: "c2_herido", t: "Un compañero herido", auto: true },
      { k: "vote", t: "Decisión del grupo" },
    ],
  },
  // ------------------------------------------------------------------ 3
  3: {
    sub: "Otoño · Año 1",
    steps: [
      { k: "scene", id: "c3_luz", t: "Una luz verde en la noche", auto: true },
      { k: "go", r: "alba", p: 3, t: "Ve al Faro Antiguo" },
      { k: "fight", r: "alba", p: 3, t: "Los guardianes del faro", e: { n: "Espectros menores", lvl: 4, aff: "Luz" } },
      { k: "scene", id: "c3_espectro", t: "La voz del faro", auto: true },
      { k: "choice", t: "Decide qué haces en el faro" },
      { k: "scene", id: "c3_grito", t: "El grito", auto: true },
      { k: "vote", t: "Decisión del grupo" },
    ],
  },
  // ------------------------------------------------------------------ 4
  4: {
    sub: "Otoño · Año 1",
    steps: [
      { k: "scene", id: "c4_viaje", t: "Rumbo a Trigalia", auto: true },
      { k: "go", r: "llan", p: 3, t: "Llega a la Arena del Viento (Llanuras Doradas)" },
      { k: "scene", id: "c4_arena", t: "El Torneo de otoño", auto: true },
      { k: "fight", r: "llan", p: 3, t: "Primera ronda del torneo", e: { n: "Luchador de la arena", lvl: 5 } },
      { k: "fight", r: "llan", p: 3, t: "Semifinal contra Seraphina", any: true, e: { n: "Seraphina Lux", lvl: 6, rival: true, aff: "Luz" } },
      { k: "scene", id: "c4_orden", t: "Figuras en las gradas", auto: true },
      { k: "choice", t: "Decide qué haces durante el caos" },
      { k: "fight", r: "llan", p: 3, t: "Enfréntate a un encapuchado", e: { ...ENC, lvl: 6 } },
      { k: "vote", t: "Decisión del grupo" },
    ],
  },
  // ------------------------------------------------------------------ 5
  5: {
    sub: "Invierno · Año 1",
    steps: [
      { k: "scene", id: "c5_encargo", t: "Un encargo de la directora", auto: true },
      { k: "go", r: "verde", p: 0, t: "Viaja a la Aldea Copaalta (Bosque de Verdemar)" },
      { k: "scene", id: "c5_sylwen", t: "La guardiana del bosque", auto: true },
      { k: "hunt", r: "verde", p: 1, n: 3, t: "Calma el Lago Espejo: vence 3 criaturas" },
      { k: "scene", id: "c5_raices", t: "Lo que recuerdan los árboles", auto: true },
      { k: "choice", t: "Decide cómo ayudas a Verdemar" },
      { k: "vote", t: "Decisión del grupo" },
    ],
  },
  // ------------------------------------------------------------------ 6
  6: {
    sub: "Invierno · Año 1",
    steps: [
      { k: "scene", id: "c6_robo", t: "El robo del observatorio", auto: true },
      { k: "go", r: "alba", p: 0, t: "Busca pistas en el Pueblo de Amanecer" },
      { k: "scene", id: "c6_mira", t: "Lo que oyó Mira", auto: true },
      { k: "fight", r: "alba", p: 0, t: "Atrapa al contrabandista del callejón", e: { n: "Contrabandistas", lvl: 8 } },
      { k: "go", r: "alba", p: 1, t: "Vuelve a la academia" },
      { k: "choice", t: "Decide cómo sigues la pista" },
      { k: "scene", id: "c6_casimir", t: "Una oferta de ayuda", auto: true },
      { k: "vote", t: "Decisión del grupo" },
    ],
  },
  // ------------------------------------------------------------------ 7
  7: {
    sub: "Invierno · Año 1",
    steps: [
      { k: "scene", id: "c7_preparativos", t: "Invitaciones para el baile", auto: true },
      { k: "scene", id: "c7_baile", t: "La noche del baile", auto: true },
      { k: "fight", r: "alba", p: 1, t: "¡Ataque en la oscuridad!", e: { ...ENC, lvl: 9 } },
      { k: "choice", t: "Decide qué haces en el caos" },
      { k: "scene", id: "c7_despacho", t: "El despacho saqueado", auto: true },
      { k: "vote", t: "Decisión del grupo" },
    ],
  },
  // ------------------------------------------------------------------ 8
  8: {
    sub: "Primavera · Año 1",
    steps: [
      { k: "scene", id: "c8_invitacion", t: "La invitación de Ilvara", auto: true },
      { k: "go", r: "esc", p: 0, t: "Viaja al Monasterio Nube Blanca (Picos Escarcha)" },
      { k: "scene", id: "c8_kiri", t: "El monasterio", auto: true },
      { k: "fight", r: "esc", p: 0, t: "Lobos en la nieve", e: { n: "Lobos blancos", lvl: 11, aff: "Agua" } },
      { k: "choice", t: "Decide cómo pasas los días en el monasterio" },
      { k: "scene", id: "c8_verdad", t: "Lo que muestran los números", auto: true },
      { k: "vote", t: "Decisión del grupo" },
    ],
  },
  // ------------------------------------------------------------------ 9
  9: {
    sub: "Primavera · Año 1",
    steps: [
      { k: "scene", id: "c9_sospechosos", t: "Tres sospechosos", auto: true },
      { k: "choice", t: "Decide a quién investigas" },
      { k: "go", r: "alba", p: 4, t: "Sigue el rastro hasta la Cueva del Primer Rayo" },
      { k: "fight", r: "alba", p: 4, t: "La reunión secreta", e: { ...ENC, lvl: 12, n: "Emisario del Crepúsculo" } },
      { k: "scene", id: "c9_mensaje", t: "El mensaje", auto: true },
      { k: "vote", t: "Decisión del grupo" },
    ],
  },
  // ------------------------------------------------------------------ 10
  10: {
    sub: "Verano · Fin del Año 1",
    steps: [
      { k: "scene", id: "c10_final", t: "La última semana del año", auto: true },
      { k: "go", r: "alba", p: 1, t: "Vuelve a Sunrise Academy" },
      { k: "fight", r: "alba", p: 1, t: "La revancha contra Darius", any: true, e: { n: "Darius Valcor", lvl: 13, rival: true } },
      { k: "scene", id: "c10_prueba", t: "La Prueba de la Cumbre", auto: true },
      { k: "choice", t: "Decide qué haces durante la ascensión" },
      { k: "scene", id: "c10_amanecer", t: "El amanecer más débil", auto: true },
      { k: "vote", t: "El juramento del grupo" },
    ],
  },
};

const firstVote = () => (typeof Store !== "undefined" && (Store.world?.history || []).find((h) => h.cap === 1)?.id) || "magia";

window.ESCENAS = {
  // =============================== CAPÍTULO 1
  c1_llegada: { bg: "alba", lines: [
    "El carruaje cruza el último puente cuando el cielo empieza a clarear. Abajo, el Pueblo de Amanecer despierta entre olor a pan y a sal.",
    "Arriba, sobre la colina, las torres blancas de Sunrise Academy atrapan la primera luz del día.",
    { bg: "taberna" },
    ["mira", "¡Eh, tú! Llevas cara de estudiante nuevo. ¿Primera vez en Amanecer?"],
    { c: [
      { l: "«Sí. Vengo a subir la Escalera del Alba.»", then: [["mira", "Tú y otros cien. Pero me gusta esa mirada. Que el sol te sea largo, {n}."]] },
      { l: "«¿Tanto se nota?»", then: [["mira", "Se nota en los zapatos: demasiado limpios para este pueblo. Ya se ensuciarán."]] },
      { l: "No contestas. Solo miras las torres.", then: [["mira", "De pocas palabras, ¿eh? Allí arriba te harán hablar, créeme."]] },
    ] },
    ["mira", "Un consejo de tabernera: la academia te dará Rayos por todo lo que hagas bien. Poder, Saber, Corazón, Fama. Cuantos más juntes, más alto subes en la Escalera."],
    ["mira", "Y al final de cada año, el mejor de todos sube a la Cumbre del Alba y pide un deseo."],
    ["mira", "…Aunque nunca he visto a ninguno bajar de allí. Pero eso son cuentos de taberna. Anda, sube, que la ceremonia empieza pronto."],
    "Sigue el camino de piedra hasta la academia. La aventura empieza allí.",
  ] },
  c1_ceremonia: { bg: "patio", lines: [
    "El patio está lleno de estudiantes de todas las razas: elfos, orcos, dracónidos, sirénidos que llegaron en barriles de agua salada…",
    { if: (G) => ["Vampiro", "Umbrío"].includes(G.raza), then: ["Algunos se apartan un paso cuando pasas. Un {r} en una academia del sol todavía llama la atención."] },
    { if: (G) => ["Semigigante", "Orco"].includes(G.raza), then: ["Tienes que agacharte para pasar bajo el arco de la entrada. Varios estudiantes te miran con respeto… o con miedo."] },
    ["aurelia", "Bienvenidos a Sunrise Academy. Hoy empezáis a subir la Escalera del Alba."],
    ["aurelia", "Aquí no importa de dónde venís. Importa lo que hacéis. Cada acción valiente, cada cosa que aprendéis, cada persona a la que ayudáis… os da Rayos."],
    ["aurelia", "Y al final del año, quien esté más alto hará la Prueba de la Cumbre."],
    "La directora sonríe, pero por un segundo su mirada se pierde en el cielo, como si recordara algo que no puede alcanzar.",
    ["darius", "La Cumbre es mía este año. Que nadie se haga ilusiones."],
    ["seraphina", "Qué original, Valcor. Lo mismo dijiste el curso pasado."],
    ["pip", "Psst. Tú, el nuevo. ¿Sabías que Darius lleva tres años siendo el número uno? Su familia le compra hasta los aplausos."],
    ["kael", "¡Silencio! Esta tarde, duelos de práctica. Quiero ver de qué estáis hechos."],
    ["kael", "Tú. Sí, tú, {n}. Empiezas contra Valcor."],
    ["darius", "¿Contra el novato? Esto va a ser rápido."],
    "Ve al patio de duelos. En combate puedes Atacar, usar Magia, beber pociones o Defenderte. Tira los dados y que el sol te acompañe.",
  ] },
  c1_tras_duelo: { bg: "patio", lines: [
    { if: (G) => G.g.misLastWin, then: [
      "Darius está en el suelo del patio, con la boca abierta. Nadie dice nada durante un segundo eterno.",
      ["darius", "Ha sido… suerte."],
      ["kael", "Ha sido un buen golpe. Aprende la diferencia, Valcor."],
      ["thorne", "¡Ja! Me caes bien, {n}. Nadie le había bajado los humos tan pronto."],
    ], else: [
      "Terminas en el suelo, con la arena en la boca. Darius se inclina sobre ti… y te tiende la mano.",
      ["darius", "No ha estado mal para ser el primer día. De verdad."],
      ["kael", "Perder el primer duelo no es vergüenza. Volver a perderlo de la misma forma, sí."],
      ["thorne", "Tranquilo. A mí me tumbó en la primera semana. Le devolveré el golpe antes del invierno."],
    ] },
    ["garrok", "Eh… perdona. ¿Sabes dónde está el ala de los dormitorios? Llevo toda la mañana dando vueltas."],
    "Un semigigante enorme, con un mapa de la academia al revés entre sus manos, te mira con cara de apuro.",
    "Tienes la tarde libre. Decide qué haces con ella.",
  ] },
  c1_noche: { bg: "alba", lines: [
    "Esa noche, desde la ventana del dormitorio, ves cómo el sol se esconde detrás de los Picos.",
    ["garrok", "Mi abuela decía que antes los días eran más largos. Que el sol se iba a dormir más tarde."],
    ["pip", "Tu abuela y todos los viejos de Solvaria. Pero hay un rumor mejor…"],
    ["pip", "Los que ganan la Cumbre nunca vuelven. Ni uno. Solo la directora, hace treinta años. Y dicen que ni ella recuerda qué deseó."],
    ["thorne", "Rumores de bardo."],
    ["pip", "Los rumores de bardo son los únicos que resultan ciertos, lobito."],
    "Mañana la directora os preguntará qué queréis aprender primero. Esa decisión es del grupo.",
  ] },

  // =============================== CAPÍTULO 2
  c2_clase: { bg: "patio", lines: [
    { if: () => firstVote() === "combate", then: [
      ["kael", "Posición. Más baja. ¡Más baja! Un monstruo no esperará a que termines de pensar."],
      ["kael", "Y hablando de monstruos: vuestro primer examen es fuera de estas paredes."],
    ] },
    { if: () => firstVote() === "magia", then: [
      ["ilvara", "La magia no es un truco. Es una deuda. Cada hechizo se paga con algo, aunque no lo veáis."],
      ["ilvara", "Tomad nota. Y ahora, vuestro primer examen."],
    ] },
    { if: () => firstVote() === "explorar", then: [
      ["brisa", "¡Arriba, dormilones! La mejor clase de exploración es la que te moja los pies."],
      ["brisa", "Primer examen, y nada de libros."],
    ] },
    ["aurelia", "Traedme un Cristal de luz de los Acantilados del Alba. Crecen en las grietas donde da el primer sol."],
    ["seraphina", "Un examen de recolectar piedras. Qué emocionante."],
    ["pip", "Dicen los pescadores que algo grande baja por los acantilados de noche. Solo lo digo."],
    "Viaja a los Acantilados del Alba. Está cerca, en el mismo valle.",
  ] },
  c2_pescador: { bg: "alba", lines: [
    "El viento de los acantilados huele a sal y a algo quemado. Plumas encendidas caen del cielo como ceniza.",
    ["pescador", "¿Estudiantes? Llegáis tarde, las gaviotas de fuego ya están despiertas."],
    ["pescador", "Y los cangrejos de roca bajan cada noche más cerca del pueblo. Algo los está asustando allá arriba."],
    { c: [
      { l: "«¿Algo? ¿Como qué?»", then: [["pescador", "Algo grande. Deja huellas del tamaño de una barca. Yo no subo después del anochecer."]] },
      { l: "«Nosotros nos encargamos.»", fx: { rayos: { corazon: 5 } }, then: [["pescador", "Ojalá. Mi nieto juega en esas rocas. Gracias, chico."]] },
    ] },
    "Las criaturas bloquean el paso hacia las grietas de cristal. Tendrás que abrirte camino.",
  ] },
  c2_herido: { bg: "alba", lines: [
    "El cangrejo gigante cae con un estruendo que hace temblar la roca. Detrás de él, un estudiante de tu curso está atrapado entre dos piedras, con la pierna torcida.",
    ["garrok", "¡Es Tomás! Se separó del grupo buscando cristales."],
    ["tomas", "No… no me dejéis aquí, por favor. No puedo apoyar la pierna."],
    ["seraphina", "Si lo llevamos de vuelta ahora, no llegaremos a entregar el examen a tiempo."],
    ["thorne", "¿Y qué? ¿Lo dejamos aquí?"],
    "Todos se giran hacia vosotros. El grupo tiene que decidir.",
  ] },

  // =============================== CAPÍTULO 3
  c3_luz: { bg: "alba", lines: [
    "Medianoche. Algo te despierta: una luz verde parpadea sobre el mar, donde no debería haber nada.",
    ["thorne", "¿Lo ves tú también? Viene del Faro Antiguo. Lleva cien años apagado."],
    ["pip", "Os apuesto diez Soles a que no os atrevéis a subir."],
    ["garrok", "No me gustan los fantasmas… pero no os voy a dejar ir solos."],
    { c: [
      { l: "«Vamos. Ahora.»", fx: { rayos: { poder: 5 } } },
      { l: "«Deberíamos avisar a un profesor…» (pero vas igual)", fx: { rayos: { saber: 5 } } },
      { l: "«Acepto la apuesta, Pip.»", fx: { rayos: { fama: 5 } }, then: [["pip", "¡Ja! Pagaré si volvéis. Si no, me quedo con vuestras cosas."]] },
    ] },
    "El Faro Antiguo está al final del valle, sobre las rocas. Ve allí.",
  ] },
  c3_espectro: { bg: "faro", lines: [
    "Las sombras se disuelven como humo. En lo alto de la escalera de caracol, la luz verde late como un corazón.",
    "Una figura transparente mira el horizonte. Lleva el uniforme de la academia… de hace cien años.",
    ["espectro", "La luz se va… la luz se va…"],
    ["espectro", "Subí tan alto… pedí tanto… y ahora la luz se va…"],
    ["garrok", "(susurrando) ¿Está hablando de la Cumbre?"],
    "El espectro no os ha visto todavía. Tienes una oportunidad.",
  ] },
  c3_grito: { bg: "faro", lines: [
    "De pronto, el espectro gira la cabeza. Sus ojos son dos soles apagados.",
    ["espectro", "¡¡NO SUBÁIS!!"],
    { sfx: "boss" },
    "El grito revienta los cristales del faro. Salís corriendo escaleras abajo, entre esquirlas de luz verde, hasta la playa.",
    { bg: "alba" },
    "Cuando miras atrás, el faro está oscuro otra vez. Como si nada hubiera pasado.",
    ["thorne", "Decidme que no he sido el único que lo ha oído."],
    ["pip", "…Os debo diez Soles. Y no pienso volver a apostar nada con vosotros."],
  ] },

  // =============================== CAPÍTULO 4
  c4_viaje: { bg: "patio", lines: [
    ["casimir", "Queridos alumnos. El Torneo de otoño es la cita más elegante del año en Trigalia."],
    ["casimir", "Allí se ganan Rayos de Fama, patrocinadores y, si sois torpes, enemigos. Procurad ganar lo primero."],
    ["darius", "Mi padre estará en el palco. No pienso perder delante de él."],
    "Por un segundo, Darius no parece arrogante. Parece asustado.",
    ["casimir", "La caravana sale al amanecer. Los que prefieran ir a pie… que disfruten del polvo."],
    "Viaja a la Arena del Viento, en las Llanuras Doradas. El viaje es largo: puedes ir a pie, a caballo o en caravana desde el Mapa.",
  ] },
  c4_arena: { bg: "arena", lines: [
    "La Arena del Viento ruge. Miles de personas, banderas de todos los reinos, olor a pan dulce y a sudor.",
    ["casimir", "Recordad: el público ama a quien pelea con estilo. Y odia a quien pierde aburriendo."],
    ["seraphina", "He calculado el cuadro del torneo. Si ganas tu primer combate, {n}, te toca conmigo en semifinales."],
    ["seraphina", "Te lo digo para que no te lleves una sorpresa cuando pierdas."],
    { c: [
      { l: "«Ya veremos, Seraphina.»", fx: { rayos: { poder: 5 } } },
      { l: "«¿Siempre eres tan simpática?»", then: [["seraphina", "Solo con quien me parece una amenaza. Tómatelo como un cumplido."]], fx: { vinc: { "Seraphina Lux": 1 } } },
    ] },
    "El heraldo grita tu nombre. Es tu turno.",
  ] },
  c4_orden: { bg: "arena", lines: [
    "La final está a punto de empezar cuando el viento se detiene. De golpe. Las banderas caen sin fuerza.",
    "En lo alto de las gradas aparecen figuras con capuchas del color del atardecer. Decenas.",
    ["encapuchado", "¡Pueblo de Solvaria! El sol se muere, y vuestros reyes os lo esconden."],
    ["encapuchado", "¡La Orden del Crepúsculo trae la noche que nos hará iguales!"],
    { sfx: "boss" },
    "Una explosión de sombra rompe el palco real. La gente grita y corre en todas direcciones.",
    ["thorne", "(con los dientes apretados) Ellos… ellos quemaron mi manada."],
    ["casimir", "¡Estudiantes! ¡Conmigo! …O donde podáis ser útiles, supongo."],
  ] },

  // =============================== CAPÍTULO 5
  c5_encargo: { bg: "patio", lines: [
    ["aurelia", "Después de lo de Trigalia, necesito ojos en todo Solvaria. Y confío en los vuestros."],
    ["aurelia", "La anciana Sylwen, de Verdemar, me ha escrito. Dice que los árboles más viejos se están secando."],
    ["aurelia", "Id a la Aldea Copaalta. Escuchadla. Y volved con lo que sepáis."],
    { c: [
      { l: "«¿Por qué nosotros, directora?»", then: [["aurelia", "Porque todavía no habéis aprendido a no ver lo que tenéis delante. Eso es valioso."]] },
      { l: "«Cuente con nosotros.»", fx: { vinc: { "Aurelia Solenne": 1 } } },
    ] },
    "Viaja a la Aldea Copaalta, en el Bosque de Verdemar.",
  ] },
  c5_sylwen: { bg: "copaalta", lines: [
    "Copaalta está construida sobre los árboles: puentes de raíz, casas dentro de troncos huecos. Pero muchas hojas están grises.",
    ["sylwen", "Llegáis más tarde de lo que esperaba. Y sois más jóvenes. Da igual. Escuchad."],
    ["sylwen", "El Lago Espejo se ha vuelto loco. Las nixies atacan a los que van a por agua, y los sapos gigantes salen del fango de día."],
    ["sylwen", "Calmadlo, y os contaré lo que recuerdan los árboles."],
    "El Lago Espejo está cerca de la aldea, en el mismo bosque.",
  ] },
  c5_raices: { bg: "verde", lines: [
    "El lago vuelve a quedarse quieto. Sylwen apoya la mano en el tronco de un árbol gris.",
    ["sylwen", "Este árbol tiene seiscientos años. Recuerda veranos en los que el sol no se ponía hasta muy tarde."],
    ["sylwen", "Cada año, el día es un poco más corto. Cada año, un poco menos de luz. Lo llamamos el Ocaso."],
    ["sylwen", "Y hay años en los que la luz cae de golpe. Siempre al final del verano."],
    { if: (G) => G.g.flags.pista_ocaso, then: ["Recuerdas los cristales de los acantilados: brillaban menos que en los libros. Todo encaja."] },
    ["sylwen", "La Capital no quiere oírlo. Vosotros sí. ¿Qué vais a hacer?"],
  ] },

  // =============================== CAPÍTULO 6
  c6_robo: { bg: "patio", lines: [
    "La profesora Ilvara entra en el comedor como una tormenta.",
    ["ilvara", "Alguien ha entrado en mi observatorio. Se han llevado los planos. Treinta años de mediciones."],
    ["ilvara", "Si esos planos llegan a la Orden, sabrán exactamente cuánto le queda al sol."],
    ["pip", "(a tu oído) Yo sé quién fue. Bueno… sé quién sabe quién fue. Todo tiene un precio, cariño."],
    "Antes de decidir, busca pistas. En el pueblo, alguien siempre ve algo.",
  ] },
  c6_mira: { bg: "taberna", lines: [
    ["mira", "¿Un robo en la academia? Anoche vino un tipo encapuchado. Pagó con monedas de la Capital, de las nuevas."],
    ["mira", "Preguntó por barcos hacia Puerto Rayo. Y se fue hacia el callejón de los contrabandistas."],
    { c: [
      { l: "Le dejas una propina por la información.", fx: { soles: -3, vinc: { Mira: 1 } }, then: [["mira", "Sabía que me caías bien. Ten cuidado ahí atrás."]] },
      { l: "«Gracias, Mira.»" },
    ] },
    "El callejón de los contrabandistas está detrás de la taberna.",
  ] },
  c6_casimir: { bg: "patio", lines: [
    "Esa noche, Lord Casimir te espera apoyado en una columna, como si llevara horas allí.",
    ["casimir", "He oído que andáis jugando a los detectives. Qué encantador."],
    ["casimir", "Puedo ayudaros. Conozco a la gente de la Capital… y a la que se esconde de ella."],
    ["casimir", "Solo os pido una cosa a cambio: que confiéis en mí. ¿Es mucho?"],
    "Sus ojos brillan en la oscuridad un segundo más de lo normal. El grupo tendrá que decidir en quién confía.",
  ] },

  // =============================== CAPÍTULO 7
  c7_preparativos: { bg: "salon", lines: [
    "La academia se llena de faroles de papel. Lord Casimir obliga a todo el mundo a practicar reverencias.",
    ["casimir", "El baile de invierno es una batalla, queridos. Se gana con alianzas, no con espadas."],
    ["pip", "¿Ya tienes pareja para el baile? Porque medio curso está haciendo apuestas."],
    { c: [
      { l: "Invitas a Thorne.", fx: { vinc: { "Thorne Colmillo": 1 } }, then: [["thorne", "¿Yo? No sé bailar. …Pero vale. Si me pisas, te muerdo."]] },
      { l: "Invitas a Seraphina.", fx: { vinc: { "Seraphina Lux": 1 } }, then: [["seraphina", "Acepto. Pero yo marco los pasos."]] },
      { l: "Invitas a Darius.", fx: { vinc: { "Darius Valcor": 1 } }, then: [["darius", "…Nadie me había invitado nunca. Siempre invito yo. Sí. Quiero decir, claro."]] },
      { l: "Invitas a Garrok.", fx: { vinc: { "Garrok Piedraluna": 1 } }, then: [["garrok", "¡¿De verdad?! Intentaré no romper el suelo."]] },
      { l: "Vas con todo el grupo, sin pareja.", fx: { rayos: { corazon: 5 } }, then: [["pip", "Aburrido. Pero sensato."]] },
    ] },
  ] },
  c7_baile: { bg: "salon", lines: [
    "El gran salón brilla con mil faroles. La música suena, los vestidos giran, y por una noche nadie habla del sol.",
    ["aurelia", "Disfrutad. Este es el tipo de noche que uno recuerda cuando todo se vuelve oscuro."],
    "Bailas. Ríes. Por un momento, la academia parece el lugar más seguro del mundo.",
    "Entonces suenan las doce campanadas.",
    { sfx: "boss" },
    "Todos los faroles se apagan a la vez. En la oscuridad, alguien grita.",
    ["kael", "¡Al suelo! ¡Hay intrusos!"],
  ] },
  c7_despacho: { bg: "salon", lines: [
    "Cuando vuelven las luces, hay heridos en el suelo y la puerta del despacho de la directora está abierta de par en par.",
    ["aurelia", "…Se han llevado mi diario. El de hace treinta años."],
    "Es la primera vez que ves miedo en la cara de Aurelia Solenne.",
    { if: (G) => G.g.flags.diario, then: ["Tú encontraste páginas de ese diario en el faro. ¿Por qué lo querría la Orden?"] },
    ["thorne", "Los que huyen van hacia el bosque. Todavía podemos alcanzarlos."],
    ["yara", "¡Aquí hay gente sangrando! ¡Necesito manos!"],
  ] },

  // =============================== CAPÍTULO 8
  c8_invitacion: { bg: "patio", lines: [
    ["ilvara", "Vosotros. Los del faro, los del torneo, los del bosque. Venid conmigo a los Picos."],
    ["ilvara", "Tengo un observatorio en el Monasterio Nube Blanca. Allí nadie roba planos."],
    ["ilvara", "Quiero enseñaros algo que la Capital no quiere ver."],
    { c: [
      { l: "«¿Por qué confía en nosotros?»", then: [["ilvara", "No confío en nadie. Pero vosotros ya habéis visto demasiado para ignorarlo."]] },
      { l: "«Allí estaremos.»", fx: { vinc: { "Ilvara Nocturna": 1 } } },
    ] },
    "Viaja al Monasterio Nube Blanca, en los Picos Escarcha. Es un viaje largo y frío.",
  ] },
  c8_kiri: { bg: "esc", lines: [
    "El monasterio cuelga de la montaña como un nido de piedra. El viento corta la piel.",
    ["kiri", "Bienvenidos. Aquí se entrena la voluntad, no el ego. Dejad el vuestro en la puerta."],
    ["kiri", "Y tened cuidado de noche: los lobos blancos bajan de los picos cuando el frío aprieta."],
    "Esa misma noche, los aullidos rodean el monasterio.",
  ] },
  c8_verdad: { bg: "observatorio", lines: [
    "En lo alto de la torre, Ilvara despliega mapas del cielo llenos de números y líneas.",
    ["ilvara", "Treinta años midiendo el sol. Cada año pierde un poco de luz. Eso ya lo sabíais."],
    ["ilvara", "Pero mirad aquí. Y aquí. Y aquí. Cada caída brusca coincide con un final de verano."],
    ["ilvara", "Con cada Prueba de la Cumbre. Cada vez que alguien pide un deseo, el sol paga."],
    { if: (G) => G.g.flags.pista_deseo, then: ["«Cada deseo apaga un poco el sol.» Las palabras del espectro vuelven a tu cabeza como un escalofrío."] },
    ["ilvara", "A este ritmo, al sol le quedan décadas. Quizá menos."],
    "Ilvara mira las estrellas con una calma extraña, casi aliviada. Como si ya hubiera decidido algo.",
    ["ilvara", "Ahora sabéis la verdad. ¿Qué vais a hacer con ella?"],
  ] },

  // =============================== CAPÍTULO 9
  c9_sospechosos: { bg: "patio", lines: [
    ["kael", "Alguien abrió las puertas de la academia la noche del baile. Desde dentro."],
    ["kael", "Tres personas tuvieron la llave esa noche: Lord Casimir, Tobble… y Brisa Sal."],
    ["tobble", "¡Yo estaba en mi taller! ¡Con una explosión muy pequeña! ¡Casi nada!"],
    ["brisa", "Yo estaba en el puerto. Sola. Sí, ya sé cómo suena."],
    ["casimir", "Yo bailaba, naturalmente. Con la mitad de las damas del salón. Preguntadles."],
    "Cada uno tuvo la oportunidad. Tú decides a quién investigas.",
  ] },
  c9_mensaje: { bg: "cueva", lines: [
    "El emisario cae. Entre sus ropas encuentras un papel con el sello de la Orden: un sol partido en dos.",
    "«La llave estará lista la noche de la Cumbre. El Eclipse lo ha visto todo. Nadie en la academia sospecha.»",
    ["thorne", "El Eclipse… ¿es su líder?"],
    ["pip", "Nadie sabe quién es. Ni yo. Y yo lo sé todo. Eso me da más miedo que cualquier monstruo."],
    "Ahora hay que decidir qué contar a la directora. Y a quién acusar.",
  ] },

  // =============================== CAPÍTULO 10
  c10_final: { bg: "patio", lines: [
    "Termina el primer año. Los pasillos huelen a verano y a nervios: mañana se anuncia quién hará la Prueba de la Cumbre.",
    ["maelis", "Soy yo. Maelis Aurora, de último curso. Número uno de la Escalera este año."],
    ["maelis", "Mañana subo. Voy a pedir que mi pueblo nunca vuelva a pasar hambre."],
    ["kael", "(en voz baja) Mi hijo también tenía un deseo bonito."],
    ["darius", "{n}. Antes de que acabe el año, quiero la revancha. Delante de todos."],
    "Vuelve a la academia para el último duelo del año.",
  ] },
  c10_prueba: { bg: "cumbre", lines: [
    "Toda la academia está en el patio. Sobre la colina, una escalera de luz baja del cielo hasta los pies de Maelis.",
    ["aurelia", "Maelis Aurora. Has llegado más alto que nadie este año. La Cumbre te espera."],
    "La voz de la directora tiembla. Solo un poco. Solo tú pareces notarlo.",
    ["maelis", "Gracias, directora. Volveré para contarlo."],
    ["pip", "(muy bajito) Eso dicen todos."],
    "Maelis empieza a subir. Peldaño a peldaño, su figura se vuelve más brillante, más ligera…",
    { if: (G) => G.g.flags.pista_deseo || G.g.flags.diez_anos, then: ["Sabes lo que dicen las pistas. Si pide su deseo, el sol pagará. Todavía estás a tiempo de hacer algo."] },
  ] },
  c10_amanecer: { bg: "cumbre", lines: [
    "Maelis llega arriba. Hay un destello blanco… y la escalera de luz se apaga.",
    "Maelis no baja.",
    "Esa noche nadie duerme. Y al amanecer, el sol sale tarde, pálido, como si le costara levantarse.",
    ["kael", "Otra vez. Otra vez igual."],
    ["aurelia", "…"],
    "La directora no dice nada. Se queda mirando la Cumbre hasta que el sol ya está alto.",
    ["ilvara", "Os lo dije. El sol paga cada deseo."],
    ["thorne", "Entonces alguien tiene que hacer algo."],
    "Es el final del primer año. Antes de separaros para el verano, el grupo hace un juramento.",
  ] },
};

// Ajustes pequeños a las opciones del Arco 1 para que encajen con las misiones.
(function () {
  const c1 = typeof STORY !== "undefined" && STORY.find((s) => s.cap === 1);
  if (c1 && c1.choices[0]) c1.choices[0].l = "Pedir la revancha a Darius en el patio";
})();
