// ===== Datos del juego (Sunrise Academy · documento de diseño) =====
const ATTRS = [
  ["fuerza", "Fuerza"], ["agilidad", "Agilidad & Velocidad"], ["defensa", "Defensa/Resistencia"], ["inteligencia", "Inteligencia"],
  ["sabiduria", "Sabiduría"], ["carisma", "Carisma"], ["voluntad", "Voluntad"], ["suerte", "Suerte"],
];
const ATTR_NAME = Object.fromEntries(ATTRS);

const PERSONALIDADES = ["Valiente e impulsivo", "Callado y observador", "Bromista", "Ambicioso", "Amable", "Desconfiado", "Curioso", "Orgulloso", "Perezoso pero brillante", "Leal hasta el final", "Rebelde", "Misterioso"];

// b: bono (attrs, pv, mana%, dom, choose, afin)
const RAZAS = [
  { id: "humano", n: "Humano", bono: "Versátiles: +1 a dos atributos a elección y 1 punto de afinidad extra", b: { choose: 2, afin: 1 },
    hab: "Ambición: ganan un 10% más de Rayos en la Escalera del Alba", deb: "Sin sentidos ni resistencias especiales", donde: "En todas partes",
    subs: [["Norteños", "Resisten el frío"], ["Costeños", "Nadan como sirénidos"], ["Capitalinos", "Ventaja social en la Capital"]] },
  { id: "elfo", n: "Elfo", bono: "Sangre arcana: +1 Sabiduría, +1 Inteligencia, +15% de maná inicial y sienten la magia cercana", b: { attrs: { sabiduria: 1, inteligencia: 1 }, mana: 0.15 },
    hab: "Memoria antigua: una vez por capítulo recuerdan un dato de historia o magia antigua", deb: "Frágiles: −5 PV iniciales", pvDeb: -5, donde: "Bosque de Verdemar",
    subs: [["Del bosque", "+1 Dominio en Tierra", { dom: { Tierra: 1 } }], ["De la luna", "Ven de noche"], ["Del mar", "Respiran 10 minutos bajo el agua"]] },
  { id: "enano", n: "Enano", bono: "Piel de piedra: +2 Defensa/Resistencia, +10 PV e inmunes a Envenenado", b: { attrs: { defensa: 2 }, pv: 10 },
    hab: "Forja: fabrican armas y armaduras un 25% más barato; ven en la oscuridad", deb: "Lentos: −1 al orden de turno", donde: "Picos Escarcha",
    subs: [["De montaña", "Resisten el frío"], ["De las minas profundas", "Encuentran gemas más fácil"], ["De forja", "Resisten el calor"]] },
  { id: "bestial", n: "Bestial", bono: "Cuerpo salvaje: +2 Agilidad & Velocidad, +1 al orden de turno y garras (ataque desarmado de Poder 10)", b: { attrs: { agilidad: 2 } },
    hab: "Instinto: ventaja para rastrear y para notar emboscadas", deb: "La nobleza los mira mal: −1 vínculo inicial con nobles", donde: "Llanuras Doradas",
    subs: [["Lobo", "Ventaja cazando en grupo"], ["Zorro", "Ventaja al engañar"], ["Felino", "Ventaja en sigilo"], ["Oso", "+1 Fuerza temporal en combate"], ["Ave", "Planean al caer"], ["Conejo", "+1 al huir"]] },
  { id: "draconido", n: "Dracónido", bono: "Herencia de dragón: +2 Fuerza, +10 PV y la mitad de daño de su elemento", b: { attrs: { fuerza: 2 }, pv: 10 },
    hab: "Aliento de dragón: una vez por combate, un ataque de Poder 15 del elemento de su color, sin maná", deb: "Sangre fría: con nieve o granizo, −1 a todas sus tiradas", donde: "Tierras Quemadas",
    subs: [["Rojo", "Elemento Fuego"], ["Azul", "Elemento Rayo"], ["Blanco", "Elemento Hielo; sin la debilidad al frío"], ["Verde", "Elemento veneno"], ["Negro", "Elemento Sombra"], ["Dorado", "Elemento Luz"]] },
  { id: "sirenido", n: "Sirénido", bono: "Voz del mar: +1 Carisma, +1 Sabiduría, +1 Dominio en Agua y nadan al doble de velocidad", b: { attrs: { carisma: 1, sabiduria: 1 }, dom: { Agua: 1 } },
    hab: "Anfibios: respiran bajo el agua; su canto da ventaja social una vez por escena", deb: "Piel seca: con ola de calor o tras 2 días lejos del agua, −1 a sus tiradas", donde: "Costa Tormenta",
    subs: [["De arrecife", "—"], ["De las profundidades", "Ven en la oscuridad del mar"], ["De río", "Sin la debilidad lejos del mar"]] },
  { id: "feerico", n: "Feérico", bono: "Polvo de hada: +2 Suerte, +1 Carisma y una vez al día repiten cualquier tirada", b: { attrs: { suerte: 2, carisma: 1 } },
    hab: "Vuelan distancias cortas y pueden hacerse diminutos", deb: "El hierro los quema: las armas de hierro les hacen +50% de daño", donde: "Claros escondidos de Verdemar",
    subs: [["Pixies", "Diminutos siempre"], ["Sidhe", "Altos y nobles, ventaja social con elfos"], ["Duendes", "Bromistas, ventaja al robar"]] },
  { id: "umbrio", n: "Umbrío", bono: "Sangre infernal: +1 Voluntad, +1 Carisma, +1 Dominio en Sombra y ven en la oscuridad", b: { attrs: { voluntad: 1, carisma: 1 }, dom: { Sombra: 1 } },
    hab: "Reciben la mitad de daño de Sombra y tienen ventaja al resistir estados mentales", deb: "La Luz les hace +50% de daño; los Celestiales desconfían de ellos", donde: "Páramo Violeta",
    subs: [["Cornudos", "—"], ["Alados", "Planean"], ["De llama infernal", "Resisten el fuego"]] },
  { id: "orco", n: "Orco", bono: "Fuerza del clan: +2 Fuerza, +1 Defensa/Resistencia y +15 PV", b: { attrs: { fuerza: 2, defensa: 1 }, pv: 15 },
    hab: "Furia: una vez por combate, +50% de daño durante 2 turnos", deb: "Temperamento: desventaja al negociar", donde: "Tierras Quemadas y bordes de las Llanuras",
    subs: [["De las cenizas", "Resisten el calor"], ["De la estepa", "Ventaja a caballo"], ["De montaña", "Resisten el frío"]] },
  { id: "celestial", n: "Celestial", bono: "Gracia divina: +1 Carisma, +1 Sabiduría, +1 Dominio en Luz y +10% de maná inicial", b: { attrs: { carisma: 1, sabiduria: 1 }, dom: { Luz: 1 }, mana: 0.10 },
    hab: "Luz interior: una vez por escena curan 10 PV a un aliado sin gastar maná", deb: "La Sombra les hace +50% de daño; los Umbríos desconfían de ellos", donde: "Templos de la Capital de Solvaria",
    subs: [["Aasimar", "Humanos bendecidos"], ["Alados", "Vuelan distancias cortas"], ["Estelares", "+1 Dominio en afinidades abstractas", { domAbs: 1 }]] },
  { id: "vampiro", n: "Vampiro", bono: "Noche eterna: +1 Agilidad & Velocidad, +1 Carisma, +1 Lujuria y ven en la oscuridad", b: { attrs: { agilidad: 1, carisma: 1, lujuria: 1 } },
    hab: "Drenar: al hacer daño cuerpo a cuerpo recuperan la mitad como PV, una vez por turno; no envejecen", deb: "El sol: de día con cielo despejado, −2 a sus tiradas y −5 PV por hora", donde: "Nobleza de la Capital y castillos del Páramo",
    subs: [["Nobles", "Ventaja social con la nobleza"], ["Salvajes", "Drenar dos veces por turno"], ["Diurnos", "Aguantan el sol, pero no pueden Drenar"]] },
  { id: "semigigante", n: "Semigigante", bono: "Tamaño colosal: +2 Defensa/Resistencia, +1 Fuerza y +25 PV", b: { attrs: { defensa: 2, fuerza: 1 }, pv: 25 },
    hab: "Cargan el doble y usan armas pesadas con una mano", deb: "Enormes: desventaja en sigilo y −1 al orden de turno", donde: "Montañas de los Picos Escarcha",
    subs: [["De piedra", "—"], ["De escarcha", "Resisten el frío"], ["De fuego", "Resisten el calor"]] },
  { id: "gnomo", n: "Gnomo", bono: "Mente brillante: +2 Inteligencia, +10% de maná inicial y fabrican objetos en la mitad de tiempo", b: { attrs: { inteligencia: 2 }, mana: 0.10 },
    hab: "Inventores: construyen artefactos simples y crean ilusiones menores sin maná", deb: "Pequeños: −5 PV iniciales y no pueden usar armas pesadas", pvDeb: -5, donde: "Barrio de los Gremios de la Capital",
    subs: [["De gremio", "Fabrican más rápido"], ["De jardín", "Hablan con animales pequeños"], ["De las minas", "Ven en la oscuridad"]] },
  { id: "forjado", n: "Forjado", bono: "Cuerpo de metal: +2 Defensa/Resistencia, +20 PV y un arma integrada en el brazo (Poder 10)", b: { attrs: { defensa: 2 }, pv: 20 },
    hab: "No comen, descansan solo 4 horas e ignoran el veneno", deb: "No se curan con pociones, solo en una forja; el Rayo les hace +50% de daño", donde: "Talleres de la Capital",
    subs: [["De hierro", "+10 PV", { pv: 10 }], ["De cristal", "+1 Dominio en Luz", { dom: { Luz: 1 } }], ["De madera rúnica", "Sin la debilidad al Rayo, pero el Fuego les hace +50%"]] },
  { id: "silvano", n: "Sílvano", bono: "Raíces profundas: +1 Sabiduría, +1 Defensa/Resistencia, +1 Dominio en Tierra y no necesitan comer", b: { attrs: { sabiduria: 1, defensa: 1 }, dom: { Tierra: 1 } },
    hab: "Fotosíntesis: con cielo despejado recuperan 5 PV por hora; hablan con las plantas", deb: "El Fuego les hace +50% de daño; con ola de calor, −1 a sus tiradas", donde: "Lo más profundo de Verdemar",
    subs: [["De roble", "+10 PV", { pv: 10 }], ["De flor", "Ventaja social"], ["De hongo", "Viven en el Páramo y no necesitan sol"]] },
  { id: "naga", n: "Naga", bono: "Sangre antigua: +1 Inteligencia, +1 Voluntad, +15% de maná inicial y resisten el veneno", b: { attrs: { inteligencia: 1, voluntad: 1 }, mana: 0.15 },
    hab: "Mirada hipnótica: una vez por escena, Asustado o Controlado 1 turno (se resiste con Voluntad)", deb: "Sangre fría: con nieve o granizo, −1 a todas sus tiradas", donde: "Ciénagas del Páramo y templos de la Costa",
    subs: [["De ciénaga", "—"], ["De templo", "+10% de maná inicial", { mana: 0.10 }], ["Marinas", "Respiran bajo el agua"]] },
];

const NACIMIENTO = [
  [1, 10, "sin", "Sin afinidad: no tiene poderes propios"],
  [11, 85, "una", "Una afinidad elemental"],
  [86, 90, "dos", "Dos afinidades elementales"],
  [91, 95, "abs", "Solo una afinidad abstracta"],
  [96, 100, "una+abs", "Una afinidad elemental y una abstracta"],
];
const ELEMENTALES = [[1, 14, "Fuego"], [15, 28, "Agua"], [29, 42, "Tierra"], [43, 56, "Aire"], [57, 70, "Rayo"], [71, 85, "Luz"], [86, 100, "Sombra"]];
const ABSTRACTAS = [[1, 14, "Gravedad"], [15, 28, "Tiempo"], [29, 42, "Espacio"], [43, 57, "Realidad"], [58, 71, "Creación"], [72, 85, "Destino"], [86, 100, "Alma"]];
const SUBAFIN = { Fuego: "Lava, Ceniza, Llama azul, Explosión", Agua: "Hielo, Vapor, Niebla, Marea", Tierra: "Cristal, Metal, Arena, Lodo", Aire: "Tormenta, Sonido, Nube, Vendaval", Rayo: "Plasma, Magnetismo, Trueno", Luz: "Sanación, Ilusión, Estelar", Sombra: "Oscuridad, Maldición, Espectro",
  Gravedad: "Levitación, Presión, Singularidad", Tiempo: "Aceleración, Pausa, Eco", Espacio: "Portales, Distorsión, Bolsillo", Realidad: "Ilusión real, Reescritura", Creación: "Forja, Vida, Invocación", Destino: "Presagio, Hilo, Fortuna", Alma: "Vínculo, Posesión, Memoria" };

const TRASFONDOS = [
  { n: "Noble de la Capital", hab: "Ventaja social con la nobleza", obj: ["Ropa fina", "Anillo con escudo familiar"], soles: 100, contacto: "Tu familia noble" },
  { n: "Huérfano de Amanecer", hab: "Ventaja al moverse sin ser visto en pueblos y ciudades", obj: ["Ganzúa", "Capa vieja"], soles: 5, contacto: "Mira, la tabernera" },
  { n: "Hijo de herreros", hab: "Reparas armas y armaduras sin forja", obj: ["Arma de buena calidad a elegir"], soles: 20, contacto: "Ignara o Durgan" },
  { n: "Aprendiz de mago", hab: "Empiezas con 1 hechizo de Círculo 1 extra", obj: ["Libro de hechizos", "Varita"], soles: 25, contacto: "Profesora Ilvara" },
  { n: "Cazador del bosque", hab: "Ventaja al rastrear y cazar", obj: ["Arco", "Trampas"], soles: 15, contacto: "Tarek, el guardabosques" },
  { n: "Marinero", hab: "Sabes navegar; los viajes en barco duran un 25% menos", obj: ["Cuchillo", "Mapa de la costa"], soles: 20, contacto: "Capitán Varo «Trueno»" },
  { n: "Mercader ambulante", hab: "10% de descuento al comprar y vender", obj: ["Mula", "Mercancía variada"], soles: 50, contacto: "Bako, el mercader" },
  { n: "Acólito del templo", hab: "Una vez por escena curas 5 PV sin maná", obj: ["Símbolo sagrado", "3 vendas"], soles: 15, contacto: "El templo de la Capital" },
  { n: "Gladiador del Coliseo", hab: "Empiezas con +20 Rayos de Poder", obj: ["Armadura de cuero", "Arma pesada"], soles: 30, contacto: "El maestro del Coliseo Real", rayos: { poder: 20 } },
  { n: "Estudiante becado", hab: "Ventaja en los exámenes de la academia", obj: ["Libros usados"], soles: 5, contacto: "El profesor que te dio la beca" },
  { n: "Superviviente del Ocaso", hab: "Ventaja al resistir el miedo", obj: ["Recuerdo de tu pueblo", "Arma improvisada"], soles: 10, contacto: "Otro superviviente" },
  { n: "Exiliado", hab: "Sabes esconder tu identidad", obj: ["Capa con capucha", "Carta sellada"], soles: 20, contacto: "Un enemigo que te busca" },
];
const ARMAS = ["Espada", "Lanza", "Arco", "Daga", "Bastón"];
const EQUIPO_BASE = ["Uniforme de Sunrise Academy", "2 pociones de vida (20 PV cada una)", "Mochila", "Cantimplora", "Comida para 3 días"];
const PROFESORES = [["Aurelia Solenne", "Directora"], ["Kael Dorn", "Combate"], ["Ilvara Nocturna", "Magia y hechizos"], ["Tobble Engranaje", "Runas y artefactos"], ["Yara Florvieja", "Sanación y herbolaria"], ["Lord Casimir Vael", "Etiqueta, política y torneos"], ["Brisa Sal", "Exploración y navegación"]];
const RELACIONES = ["Amigos de la infancia", "Rivales desde siempre", "Uno le salvó la vida al otro", "Familia lejana, aunque no se llevan bien", "Se odian por un malentendido", "Comparten un secreto peligroso"];

// ===== Apariencia (opciones listas) =====
const LOOK = [
  ["pelo_tipo", "Tipo de pelo", ["Corto", "Largo", "Rizado", "Ondulado", "Liso", "Trenzado", "Rapado", "Coleta", "Moño", "Cresta", "Melena salvaje", "Rastas", "Flequillo largo", "Calvo"]],
  ["pelo_color", "Color de pelo", ["Negro", "Castaño", "Rubio", "Pelirrojo", "Blanco", "Plateado", "Gris", "Azul", "Verde", "Violeta", "Rosa", "Dorado", "Bicolor"]],
  ["ojos", "Color de ojos", ["Marrones", "Negros", "Azules", "Verdes", "Grises", "Ámbar", "Dorados", "Violetas", "Rojos", "Plateados", "Uno de cada color", "Brillan en la oscuridad"]],
  ["piel", "Piel", ["Pálida", "Clara", "Trigueña", "Morena", "Oscura", "Bronceada", "Verdosa", "Azulada", "Grisácea", "Con escamas", "Con pelaje", "De corteza", "Metálica"]],
  ["altura", "Altura", ["Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"]],
  ["complexion", "Complexión", ["Delgada", "Atlética", "Musculosa", "Robusta", "Corpulenta", "Fibrosa"]],
  ["ropa", "Estilo de ropa", ["Uniforme de la academia", "Armadura ligera", "Armadura pesada", "Túnica de mago", "Capa de viajero", "Ropa noble", "Estilo pirata", "Estilo ninja", "Ropa de cazador", "Ropa de monje", "Estilo gótico", "Ropa de bardo", "Ropa de explorador", "Harapos"]],
  ["ropa_color", "Colores de la ropa", ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Dorado", "Plateado", "Morado", "Marrón", "Gris", "Carmesí y negro", "Azul y dorado", "Verde y marrón", "Blanco y plateado"]],
  ["rasgo", "Rasgo distintivo", ["Ninguno", "Cicatriz en la cara", "Tatuajes", "Pecas", "Marca de nacimiento", "Lunar", "Colmillos", "Cuernos pequeños", "Ojo cubierto", "Quemadura antigua", "Runas en la piel", "Mechón de otro color"]],
  ["voz", "Voz", ["Suave", "Grave", "Aguda", "Ronca", "Melodiosa", "Seria", "Alegre", "Susurrante"]],
];
const ACCESORIOS = ["Anillo", "Collar", "Pendientes", "Gafas", "Monóculo", "Parche en el ojo", "Bufanda", "Sombrero", "Capucha", "Diadema", "Máscara", "Guantes", "Brazaletes", "Cinturón con bolsas", "Amuleto", "Pluma en el pelo", "Cinta en el pelo", "Flor en el pelo", "Colgante familiar", "Reloj de bolsillo", "Libro atado al cinto", "Mascota pequeña"];
const MOTIVOS = [
  "Quiero el deseo de la Cumbre para encontrar a alguien que perdí.",
  "Quiero demostrarle a mi familia que valgo más de lo que creen.",
  "Quiero ser la persona más fuerte de Solvaria.",
  "Necesito el dinero y la fama para salvar a mi pueblo.",
  "Busco la verdad sobre por qué el sol se apaga.",
  "Quiero vengarme de quien destruyó mi hogar.",
  "Quiero curar una maldición que llevo encima.",
  "Me obligaron a venir; solo quiero sobrevivir y volver a casa.",
  "Quiero proteger a mis amigos, cueste lo que cueste.",
  "Quiero entender mi propio poder antes de que me controle.",
  "Quiero pagar una deuda enorme.",
  "Quiero escribir mi nombre en la historia.",
  "Sigo los pasos de un hermano que ganó la Cumbre y nunca volvió.",
  "Me enamoré de alguien de la academia y lo seguí hasta aquí.",
];
const SECRETOS = [
  "Robé la beca con la que entré a la academia.",
  "Soy hijo ilegítimo de un noble importante.",
  "Una voz me habla en sueños y no sé de quién es.",
  "Trabajé para la Orden del Crepúsculo antes de venir.",
  "Mi afinidad no es la que digo tener.",
  "Maté a alguien por accidente y nadie lo sabe.",
  "Tengo una deuda con Morwen, la bruja del Páramo.",
  "No recuerdo nada de mi vida antes de los diez años.",
  "Estoy prometido en matrimonio en contra de mi voluntad.",
  "Llevo una reliquia robada escondida en mi equipaje.",
  "Me estoy muriendo poco a poco y lo oculto.",
  "Espío para alguien de la Capital.",
  "Tengo miedo a la oscuridad y lo escondo.",
  "Un dios me marcó al nacer y no sé para qué.",
];
// ===== Armas =====
// poder, rasgos: pesada (−1 a la tirada), critica (crítico con dos 5 o más), doble (segundo golpe al 50%),
// aturde (25% de aturdir), alcance (+2 iniciativa), escudo (+1 Defensa en combate)
const ARMAS_INFO = {
  "Espada": [15, []], "Lanza": [15, ["alcance"]], "Arco": [12, ["alcance"]], "Daga": [10, ["critica"]], "Bastón": [11, ["aturde"]],
  "Mandoble": [21, ["pesada"]], "Guadaña": [19, ["pesada", "critica"]], "Kunais": [9, ["doble", "alcance"]], "Shurikens": [8, ["doble", "alcance"]],
  "Katana": [14, ["critica"]], "Hacha": [16, []], "Martillo de guerra": [20, ["pesada", "aturde"]], "Maza": [13, ["aturde"]],
  "Estoque": [12, ["critica"]], "Dagas gemelas": [8, ["doble", "critica"]], "Nunchakus": [9, ["doble", "aturde"]], "Alabarda": [18, ["pesada", "alcance"]],
  "Ballesta": [14, ["alcance"]], "Látigo": [9, ["alcance", "aturde"]], "Espada y escudo": [12, ["escudo"]], "Guanteletes": [10, ["doble"]],
  "Tridente": [15, ["alcance"]], "Kusarigama": [12, ["doble", "alcance"]], "Hoz": [11, ["critica"]], "Abanico de guerra": [10, ["critica", "alcance"]],
  "Bumerán": [9, ["alcance", "aturde"]], "Honda": [7, ["alcance"]], "Cimitarra": [14, ["critica"]], "Hacha doble": [18, ["pesada", "doble"]],
};
ARMAS.splice(0, ARMAS.length, ...Object.keys(ARMAS_INFO));
const RASGO_ARMA = { pesada: "Pesada: −1 a la tirada de ataque", critica: "Crítico con dos 5 o más", doble: "Golpea dos veces (el segundo al 50%)", aturde: "25% de aturdir", alcance: "+2 a la iniciativa", escudo: "+1 Defensa en combate" };
