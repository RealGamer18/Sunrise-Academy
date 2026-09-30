// ===================== MUNDO VIVO =====================
// Hablar con la gente · Misiones de amistad · Compañeros en combate · Combates de grupo
// Música · Diario · Logros y títulos · Avisos del grupo.
// Carga después de historia.js (usa SA_SCENE, SA_STORY, SA_NPC y ESCENAS).
(function () {
  if (typeof render !== "function" || !window.SA_SCENE) return;
  const NPC = window.SA_NPC, ESC = window.ESCENAS;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const sfx = (k) => { try { window.SA_SFX?.[k]?.(); } catch (e) {} };
  const fxq = (ev) => { try { window.SA_FXQ?.(ev); } catch (e) {} };
  const W = () => { const g = G.g; if (!g.w) g.w = {}; const w = g.w; for (const k of ["met", "talkDay", "talkCap", "fq", "ach", "regs", "svc", "raidClaim"]) if (!w[k]) w[k] = {}; return w; };
  const bond = (id) => (G.vinculos || []).find((v) => v.nombre === NPC[id]?.n)?.valor || 0;
  const cap = () => (window.SA_STORY ? window.SA_STORY.cap() : 1);
  const arcN = () => (typeof arcOf === "function" ? arcOf(cap()).n : 1);
  const hist = (c) => (Store.world?.history || []).find((h) => h.cap === c)?.id;
  const flag = (f) => !!G.g.flags?.[f] || !!Store.world?.flags?.[f];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const here = (key) => `${G.g.loc.r}:${G.g.loc.p}` === key;
  const pname = (r, p) => (P[r] && P[r][p] ? P[r][p].n : "?");

  // =====================================================================
  // 1. GENTE DEL MUNDO: dónde está cada uno y qué dice
  // =====================================================================
  // at: lugares "region:indice" · from/to: capítulos en que está disponible · bg: fondo de la charla
  const PEOPLE = {
    mira: { at: ["alba:0"], bg: "taberna",
      intro: [["mira", "¡Bienvenido a mi taberna! Aquí se sirve sopa caliente, cerveza fría y los mejores rumores de Amanecer."]],
      hi: [[["mira", "¡{n}! Tu mesa de siempre está libre. Bueno, siempre que echemos al borracho de Tobble."]], [["mira", "Mira quién ha vuelto. Siéntate, que se te ve en la cara que traes historias."]]],
      arc: {
        1: [["mira", "Los pescadores dicen que el sol sale cada día un poco más tarde. Yo solo sé que gasto más velas que el año pasado."]],
        2: [["mira", "Desde que la Orden asaltó el templo de Grudhal, la gente cierra la puerta con dos vueltas de llave."]],
        3: [["mira", "La tierra tiembla cada amanecer. Se me caen los vasos. Dime que vosotros vais a arreglar esto."]],
        4: [["mira", "Los clientes ya no hablan de otra cosa: la Cumbre, el rey, el sol. Yo solo quiero volver a ver un verano de verdad."]],
      },
      rumor: true,
      kind: { l: "Te quedas a ayudarla a recoger las mesas.", r: [["mira", "Eres un encanto. Si algún día necesitas esconderte de alguien, mi bodega tiene una puerta trasera."]] } },
    aurelia: { at: ["alba:1"], bg: "patio",
      intro: [["aurelia", "Me alegra verte fuera de clase. La academia es más que exámenes: también es la gente con la que caminas."]],
      hi: [[["aurelia", "{n}. Tienes esa mirada de quien lleva demasiado peso. Siéntate conmigo un momento."]]],
      arc: {
        1: [["aurelia", "A veces miro la Cumbre y siento que olvidé algo muy importante allí arriba. Tonterías de vieja, supongo."]],
        2: [["aurelia", "La Orden cree que la oscuridad nos hará iguales. Pero en la oscuridad nadie ve a nadie. Eso no es igualdad: es soledad."]],
        3: [["aurelia", "Hace treinta años subí la escalera de luz. Volví. Y todavía no sé por qué solo volví yo."]],
        4: [["aurelia", "Ahora ya sé lo que deseé. Deseé volver. Y el sol pagó mi regreso. Cada día desde entonces me pregunto si valió la pena."]],
      },
      kind: { l: "«Usted no está sola, directora.»", r: [["aurelia", "…Gracias. Hacía mucho tiempo que nadie me decía eso."]] } },
    kael: { at: ["alba:1"], bg: "patio",
      intro: [["kael", "¿Vienes a entrenar o a mirar? Aquí las dos cosas duelen."]],
      hi: [[["kael", "Buen trabajo el otro día. No te acostumbres a que lo diga."]], [["kael", "Tienes mejor postura que al principio. Algo es algo."]]],
      arc: {
        1: [["kael", "Mi trabajo es que sobreviváis. Ganar la Cumbre… eso no se lo deseo a nadie."]],
        2: [["kael", "La Orden no pelea limpio. Aprende a pelear sucio tú también, pero solo para volver a casa."]],
        3: [["kael", "Cuando la tierra tiembla me acuerdo de mi hijo. Él también era valiente. Demasiado."]],
        4: [["kael", "Si de verdad subís esa escalera… prometedme que bajaréis. Todos."]],
      },
      kind: { l: "Le pides que te enseñe su mejor golpe.", r: [["kael", "Ja. Así se habla. Codo abajo, cadera primero. Otra vez. ¡Otra vez!"]] } },
    ilvara: { at: ["alba:1"], to: 18, bg: "observatorio",
      intro: [["ilvara", "Si vienes a preguntar si habrá examen: sí. Siempre hay examen."]],
      hi: [[["ilvara", "Eres de los pocos que piensan antes de hablar. Sigue así."]]],
      arc: { 1: [["ilvara", "Los números no mienten. Las personas sí. Recuérdalo cuando te cuenten cuentos sobre la Cumbre."]], 2: [["ilvara", "A veces una decisión terrible es la única decisión razonable. ¿Tú lo entenderías?"]] },
      kind: { l: "Le preguntas por sus mediciones con interés sincero.", r: [["ilvara", "…Nadie me pregunta eso nunca. Mira, esta curva es el sol. Y esta línea, cada deseo."]] } },
    tobble: { at: ["alba:1"], bg: "patio",
      intro: [["tobble", "¡Cuidado con el cable! No, ese no. ¡Ese tampoco! …Vale, ya ha explotado. Hola."]],
      hi: [[["tobble", "¡Mi ayudante favorito! ¿Me pasas la llave inglesa? La que no echa humo."]]],
      arc: {
        1: [["tobble", "Estoy construyendo algo en el sótano. No, no puedo decirte qué. Sí, hace ruido de noche."]],
        2: [["tobble", "Las reliquias de los dioses tienen una frecuencia curiosa. Si pudiera medirlas… ¡para la ciencia, claro!"]],
        3: [["tobble", "Mi máquina puede guardar luz. Solo necesito las reliquias y que nada vuelva a explotar. Bueno, que explote poco."]],
        4: [["tobble", "Si el sol se apaga, mi máquina tendrá luz para una ciudad durante un año. No para un mundo. Ojalá fuera más grande."]],
      },
      kind: { l: "Le ayudas a apagar un pequeño incendio.", r: [["tobble", "¡Salvado! El taller y mis cejas. Te debo una. Bueno, te debo varias."]] } },
    yara: { at: ["alba:1"], bg: "patio", heal: true,
      intro: [["yara", "Siéntate, cariño. Tienes un rasguño ahí. No, no es nada, pero déjame verlo igual."]],
      hi: [[["yara", "Te he guardado una infusión de flor de luna. Para los nervios. Y para el corazón."]]],
      arc: {
        1: [["yara", "Las plantas notan el Ocaso antes que nadie. Mis flores de sol ya no se abren del todo."]],
        2: [["yara", "Estoy un poco cansada estos días. No es nada. El invierno, supongo."]],
        3: [["yara", "Cuando el sol se debilita, yo también. Soy sílvana, cariño. Somos flores con piernas."]],
        4: [["yara", "Pase lo que pase en la Cumbre, prométeme una cosa: vive. Es lo único que importa de verdad."]],
      },
      kind: { l: "Le llevas agua y la ayudas a regar el invernadero.", r: [["yara", "Qué manos tan buenas tienes. Las plantas lo notan, ¿sabes? Y yo también."]] } },
    casimir: { at: ["alba:1"], bg: "salon",
      intro: [["casimir", "Ah, un alumno que visita a su profesor por voluntad propia. Qué deliciosamente raro."]],
      hi: [[["casimir", "Querido mío, empiezas a tener modales. Casi me emociono."]]],
      arc: {
        1: [["casimir", "La política es como el baile: gana quien hace creer al otro que es él quien lleva los pasos."]],
        2: [["casimir", "Todos sospechan de mí. Es agotador ser el sospechoso obvio. Deberían probar a mirar a quien nunca levanta la voz."]],
        3: [["casimir", "El Ocaso me hace más fuerte, sí. Y aun así prefiero un mundo con sol. Sorprendente, ¿verdad?"]],
        4: [["casimir", "El rey compra paz con luz ajena. Un trato muy elegante… y muy podrido."]],
      },
      kind: { l: "Le haces una reverencia perfecta.", r: [["casimir", "¡Bravo! Por fin alguien que me escucha en clase. Te concedo el honor de mi sonrisa."]] } },
    brisa: { at: ["alba:1", "costa:0"], bg: "puerto",
      intro: [["brisa", "¡Eh! ¿Te vienes a bucear? No hay tiburones. Bueno, pocos. Bueno, simpáticos."]],
      hi: [[["brisa", "¡Mi grumete favorito! Un día te llevo a ver las Islas Perdidas. Un día."]]],
      arc: {
        1: [["brisa", "El mar sabe cosas. Últimamente la marea sube menos. Como si el mundo respirara más despacio."]],
        2: [["brisa", "Varo es un pirata, pero es un pirata con palabra. Si le das algo a cambio, cumple."]],
        3: [["brisa", "Traje algo de las Islas Perdidas. Aún no puedo contarlo. Cuando llegue el momento, serás el primero en saberlo."]],
        4: [["brisa", "El mapa que traje de las Islas no lleva a un tesoro. Lleva al principio de todo."]],
      },
      kind: { l: "Le cuentas un chiste malo de marineros.", r: [["brisa", "¡Ja! Ese es horrible. Me lo quedo."]] } },
    darius: { at: ["alba:1", "cap:0"], bg: "patio",
      intro: [["darius", "¿Qué quieres? Si vienes a pedirme un autógrafo, hoy no firmo."]],
      hi: [[["darius", "…Hola. Eres de las pocas personas con las que no tengo que fingir."]]],
      arc: {
        1: [["darius", "Mi padre dice que un Valcor no pierde. Yo he perdido. Y el mundo sigue girando. Curioso."]],
        2: [["darius", "La Capital huele a perfume caro para tapar el miedo. Odio volver a casa."]],
        3: [["darius", "Mi familia quiere que gane la Cumbre. Nadie me ha preguntado nunca qué quiero yo."]],
        4: [["darius", "Si subo esa escalera, que sea porque yo lo decido. No por un apellido."]],
      },
      kind: { l: "Le preguntas qué quiere él, no su familia.", r: [["darius", "…Nadie me había preguntado eso. Déjame pensarlo. De verdad."]] } },
    seraphina: { at: ["alba:1"], bg: "patio",
      intro: [["seraphina", "Si vienes a comparar notas, te aviso: las mías son mejores."]],
      hi: [[["seraphina", "He estado pensando en lo que me dijiste. Tenías razón. No se lo cuentes a nadie."]]],
      arc: {
        1: [["seraphina", "A veces sueño cosas que luego pasan. Seguramente es casualidad. Seguramente."]],
        2: [["seraphina", "He soñado con una torre y un reloj que va hacia atrás. No me mires así."]],
        3: [["seraphina", "Veo trozos del futuro. Muchos terminan a oscuras. Algunos no. Intento recordar cuáles."]],
        4: [["seraphina", "Te vi en la Cumbre. Estabas asustado. Pero no te ibas."]],
      },
      kind: { l: "Le dices que no pasa nada por no saberlo todo.", r: [["seraphina", "…Eso es lo más irritante y lo más bonito que me han dicho nunca."]] } },
    thorne: { at: ["alba:1"], bg: "patio",
      intro: [["thorne", "¡Eh! Tú eres el del duelo con Darius. Me caes bien. ¿Echamos un pulso?"]],
      hi: [[["thorne", "¡Manada! Digo… amigo. Bueno, para mí es lo mismo."]]],
      arc: {
        1: [["thorne", "Los lobos no tenemos academias. Aprendemos corriendo detrás de los mayores. Esto es raro, pero me gusta."]],
        2: [["thorne", "La Orden quemó mi manada. Algún día los encontraré. Y ese día, no me detengas."]],
        3: [["thorne", "Cuando tiembla la tierra, huelo algo debajo. Algo viejo y con hambre."]],
        4: [["thorne", "Pase lo que pase allá arriba, aúllo contigo. Así hacemos los lobos."]],
      },
      kind: { l: "Aceptas el pulso (y pierdes con dignidad).", r: [["thorne", "¡Ja! Buen intento. Tienes fuerza de cachorro. Eso es un cumplido, ¿eh?"]] } },
    garrok: { at: ["alba:1"], bg: "patio",
      intro: [["garrok", "Hola… ¿Te importa si me siento contigo? La gente se aparta cuando me siento solo."]],
      hi: [[["garrok", "¡Amigo! Te he guardado el trozo de pastel más grande. Bueno, el segundo. El primero me lo comí."]]],
      arc: {
        1: [["garrok", "Los libros de la academia son muy… gordos. ¿Tú lees rápido? Yo leo… a mi manera."]],
        2: [["garrok", "Si alguien de la Orden se acerca a los pequeños de primero, yo me pongo delante. Para eso soy grande."]],
        3: [["garrok", "Mi abuela decía que las montañas también sueñan. Creo que la que está debajo del Páramo tiene pesadillas."]],
        4: [["garrok", "Da igual lo que haya arriba. Si subimos, subimos juntos. Yo llevo a quien se canse."]],
      },
      kind: { l: "Te sientas con él a comer.", r: [["garrok", "*sonríe tanto que le cruje la cara* Gracias. De verdad."]] } },
    pip: { at: ["alba:1", "alba:0"], bg: "taberna",
      intro: [["pip", "Hola, hola. ¿Compras o vendes? Rumores, digo. Los precios varían según lo bien que me caigas."]],
      hi: [[["pip", "¡Mi cliente favorito! Para ti, descuento del cero por ciento. Es un honor."]]],
      arc: {
        1: [["pip", "Se dice que Darius llora en el baño después de cada duelo. ¿Verdad o mentira? Eso cuesta extra."]],
        2: [["pip", "Hay rumores que no deberían venderse. Y hay gente que paga demasiado por ellos. Eso me da miedo."]],
        3: [["pip", "Los dioses están cayendo uno a uno. Ese rumor no lo vendo. Lo regalo. Cuidaos."]],
        4: [["pip", "Cuando esto termine, voy a escribir una canción sobre vosotros. Y va a ser un éxito, claro."]],
      },
      rumor: true,
      kind: { l: "Le das un rumor tuyo a cambio (inventado).", r: [["pip", "¡Me encanta! Es completamente falso y lo voy a vender carísimo."]] } },
    nyx: { at: ["alba:1"], from: 11, bg: "salon",
      intro: [["nyx", "…"], "La figura enmascarada te mira un largo rato. Luego asiente, como si hubieras pasado una prueba que no sabías que estabas haciendo."],
      hi: [[["nyx", "Te estaba esperando. No se lo digas a nadie."]]],
      arc: { 2: [["nyx", "Subo la Escalera por alguien. No por mí."]], 3: [["nyx", "Mi hermana ganó la Cumbre hace tres años. Nunca bajó. Voy a buscarla."]], 4: [["nyx", "Si la encuentro allí arriba… ¿crees que me reconocerá?"]] },
      kind: { l: "No preguntas nada. Solo te quedas a su lado en silencio.", r: [["nyx", "…Gracias. Casi nadie sabe estar callado."]] } },
    sylwen: { at: ["verde:0"], bg: "copaalta",
      intro: [["sylwen", "Los jóvenes corréis mucho. Los árboles no. Siéntate y escucha el bosque un momento."]],
      hi: [[["sylwen", "El bosque te recuerda. Eso no le pasa a cualquiera."]]],
      arc: { 1: [["sylwen", "Cada año hay menos luz entre las hojas. Los árboles lo cuentan en sus anillos."]], 2: [["sylwen", "Grudhal sostenía la tierra. Sin su reliquia, las raíces tiemblan."]], 3: [["sylwen", "Mirael duerme en el lago y sueña mentiras. Cuidado con lo que veas en el agua."]], 4: [["sylwen", "Los árboles más viejos ya no esperan otra primavera. Dadles una razón para hacerlo."]] },
      kind: { l: "Le ayudas a cuidar un árbol joven.", r: [["sylwen", "Crecerá. Y cuando sea viejo, recordará tus manos."]] } },
    kiri: { at: ["esc:0"], bg: "observatorio", calm: true,
      intro: [["kiri", "Respira. No, más hondo. La montaña no tiene prisa. Tú tampoco deberías."]],
      hi: [[["kiri", "Tu respiración ha mejorado. Tu impaciencia, no tanto."]]],
      arc: { 1: [["kiri", "La voluntad es un músculo. Duele al principio. Luego sostiene montañas."]], 3: [["kiri", "El Ancla de Orvath está cerca de aquí. Cuando se soltó, la nieve empezó a caer hacia arriba."]] },
      kind: { l: "Meditas con ella al amanecer.", r: [["kiri", "Bien. Por un momento, tu mente ha estado en silencio. Eso vale más que mil golpes."]] } },
    bako: { at: ["llan:0"], bg: "arena",
      intro: [["bako", "¡Amigo, amigo! Todo lo que buscas lo tengo. Y lo que no buscas, también. A buen precio. Para ti."]],
      hi: [[["bako", "¡Mi cliente preferido! Hoy no te engaño. Casi nada."]]],
      arc: { 1: [["bako", "Los precios de las velas han subido. ¿Por qué será? Yo no pregunto, yo vendo."]], 2: [["bako", "La Orden compra mucho aceite negro últimamente. No me mires así, el dinero no tiene bando."]], 3: [["bako", "Desde que tiembla la tierra, vendo más amuletos que pan."]], 4: [["bako", "Si el sol se apaga, ¿quién me comprará gafas de sol? Pensadlo."]] },
      kind: { l: "Le compras una baratija sin regatear.", fx: { soles: -2 }, r: [["bako", "¡Sin regatear! Me has roto el corazón comercial. Toma, este amuleto va de regalo."]] } },
    varo: { at: ["costa:0"], from: 11, bg: "puerto",
      intro: [["varo", "¿Estudiantes en mi puerto? O venís a robarme, o venís a pagarme. Espero que lo segundo."]],
      hi: [[["varo", "¡Grumete! Siéntate. Esta ronda la pago yo. La siguiente, tú."]]],
      arc: { 2: [["varo", "La Orden paga en oro limpio. Yo no hago preguntas. Pero tú sí, ¿verdad?"]], 3: [["varo", "El mar está raro. Los peces huyen hacia el sur. Cuando los peces huyen, yo también."]], 4: [["varo", "Si os hace falta un barco a las Islas Perdidas, tengo uno. Pocos vuelven de allí, pero el barco sí."]] },
      kind: { l: "Brindas con él por el mar.", r: [["varo", "¡Ja! Por el mar, que no perdona pero tampoco olvida."]] } },
    isolde: { at: ["costa:1"], bg: "faro",
      intro: [["isolde", "La luz del faro nunca se apaga. Es lo único en Solvaria de lo que estoy segura."]],
      hi: [[["isolde", "Brisa habla mucho de ti. Casi tanto como del mar."]]],
      arc: { 1: [["isolde", "Cada noche enciendo la lámpara un poco antes. El sol se va antes cada año."]], 3: [["isolde", "Brisa trajo algo de las Islas. Lo guarda aquí, en mi faro. Pregúntale cuando esté lista."]], 4: [["isolde", "Si el sol se apaga, mi faro será la única luz de la costa. No es suficiente."]] },
      kind: { l: "Le ayudas a limpiar la lente del faro.", r: [["isolde", "Mira cómo brilla ahora. Gracias. Cuidar una luz es cosa de dos."]] } },
    durgan: { at: ["esc:1"], bg: "cueva",
      intro: [["durgan", "¿Vienes a comprar plata o a molestar? Si es lo segundo, la puerta está detrás de ti."]],
      hi: [[["durgan", "Hmph. Tú otra vez. …Te he guardado un buen trozo de plata."]]],
      arc: { 1: [["durgan", "Los kóbolds de hielo se han vuelto más agresivos. Algo los empuja desde lo hondo."]], 3: [["durgan", "Desde que se soltó el Ancla, las vetas de plata cambian de sitio. Las montañas se mueven, chico."]] },
      kind: { l: "Le ayudas a cargar mineral.", r: [["durgan", "Hmph. Brazos flojos, pero buena voluntad. Vuelve cuando quieras."]] } },
    ignara: { at: ["quem:0"], from: 11, bg: "taberna",
      intro: [["ignara", "¿Buscas un arma? Aquí no vendo juguetes. Vendo fuego con forma de espada."]],
      hi: [[["ignara", "¡Tú! Pasa, pasa. La forja está caliente y yo de buen humor. Aprovecha."]]],
      arc: { 2: [["ignara", "El fuego de Forjaroja viene de Ignar. Mientras él arda, nosotros ardemos."]], 3: [["ignara", "Si Ignar cae, Forjaroja se apaga. Y yo con ella."]], 4: [["ignara", "Te forjaría la mejor espada del mundo si con eso se arreglara el sol."]] },
      kind: { l: "Le das al fuelle hasta que te arden los brazos.", r: [["ignara", "¡Ja! Aguantas. Tienes madera de herrero. O de leña, ya veremos."]] } },
    morwen: { at: ["viol:1"], from: 21, bg: "cueva", calm: true,
      intro: [["morwen", "Te esperaba. Bueno, esperaba a alguien. Tú servirás."]],
      hi: [[["morwen", "Mi cliente favorito. Todavía no te he maldecido. Eso es amor, en mi idioma."]]],
      arc: { 3: [["morwen", "Las semillas de sombra son trocitos de Vaelmor. Cada dios que se traga una, lo acerca más a la superficie."]], 4: [["morwen", "La Cumbre y la tumba son dos caras de la misma moneda. Solen da, Vaelmor come."]] },
      kind: { l: "Le traes hierbas del Páramo para su caldero.", r: [["morwen", "Mmm, raíz de medianoche. Sabes lo que me gusta. Da miedo."]] } },
    aldric: { at: ["cap:0"], from: 13, bg: "salon",
      intro: [["aldric", "Los estudiantes de Sunrise. Aurelia habla bien de vosotros. Veamos si tiene razón."]],
      hi: [[["aldric", "Ah, el joven héroe. Mi corte habla de ti. No todo es bueno, pero todo es interesante."]]],
      arc: { 2: [["aldric", "Un rey protege a su pueblo. A veces eso exige decisiones que un estudiante no entendería."]], 3: [["aldric", "Los temblores llegan hasta palacio. Mis consejeros dicen que no es nada. Mis consejeros mienten bien."]], 4: [["aldric", "Cada rey antes que yo lo supo. Los deseos compran paz. El sol es el precio."]] },
      kind: { l: "Le escuchas sin juzgarlo.", r: [["aldric", "…Pocos me escuchan sin querer algo. Lo recordaré."]] } },
    lysa: { at: ["cap:0"], from: 13, bg: "patio",
      intro: [["lysa", "Capitana Lysa, guardia real. Si causas problemas en mi ciudad, me conocerás mejor. No te lo recomiendo."]],
      hi: [[["lysa", "Buen trabajo en la ciudad. No lo digo a menudo."]]],
      arc: { 2: [["lysa", "La Orden se mueve por las alcantarillas. Mis guardias no caben ahí. Tú sí."]], 3: [["lysa", "La ciudad tiene miedo. El miedo hace a la gente estúpida. Mi trabajo es que no sea peligrosa."]], 4: [["lysa", "Si el rey se equivoca, yo sigo protegiendo a la gente. Esa es mi única lealtad."]] },
      kind: { l: "Patrullas con ella una ronda.", r: [["lysa", "Buena vista y buena espalda. Podrías servir en la guardia. Piénsalo."]] } },
    oren: { at: ["cap:1"], from: 13, bg: "taberna",
      intro: [["oren", "Los gremios mueven Solvaria. Espadas, pociones, barcos. Todo pasa por aquí, y todo paga su parte."]],
      hi: [[["oren", "¡Joven socio! Los gremios tienen buena memoria para quien cumple sus tratos."]]],
      arc: { 2: [["oren", "La Orden compra en mis gremios con oro limpio. No me gusta, pero el oro es oro."]], 3: [["oren", "Con los temblores, se hunden las minas y suben los precios. Malos tiempos para todos."]], 4: [["oren", "Si Solvaria se queda a oscuras, los gremios fabricarán velas. Pero no sé si eso es un negocio o un funeral."]] },
      kind: { l: "Cierras un pequeño trato honrado con él.", r: [["oren", "Honrado. Qué palabra tan rara en este barrio. Me gusta."]] } },
  };
  // Encuentra quién está en un lugar ahora
  function peopleHere() {
    const key = `${G.g.loc.r}:${G.g.loc.p}`; const c = cap();
    return Object.entries(PEOPLE).filter(([id, p]) => p.at.includes(key) && (!p.from || c >= p.from) && (!p.to || c <= p.to) && NPC[id]).map(([id]) => id);
  }
  function talk(id) {
    const p = PEOPLE[id]; if (!p) return; const w = W(); const n = NPC[id].n; const b = bond(id); const c = cap();
    const lines = [];
    if (!w.met[id]) { lines.push(...p.intro); w.met[id] = 1; }
    else if (b >= 2 && p.hi) lines.push(...pick(p.hi));
    const a = p.arc[arcN()] || p.arc[1] || [];
    lines.push(...a);
    if (p.rumor) { const hint = window.SA_STORY?.label(); if (hint) lines.push([id, L(`Y un rumor gratis: dicen que lo próximo que deberías hacer es… «${hint}». No me preguntes cómo lo sé.`, `Free rumor: they say your next step is "${hint}".`)]); }
    const fq = FQ[id]; const st = w.fq[id];
    if (fq && b >= 2 && !st) lines.push([id, fq.hook], L("💛 Se ha abierto una misión de amistad. Búscala en la pestaña Vínculos.", "💛 A friendship quest is available (Bonds tab)."));
    if (w.talkCap[id] !== c && b < 2 && p.kind) {
      w.talkCap[id] = c;
      lines.push({ c: [{ l: p.kind.l, fx: { ...(p.kind.fx || {}), vinc: { [n]: 1 } }, then: p.kind.r }, { l: L("Te despides con una sonrisa.", "You say goodbye.") }] });
    }
    persist();
    ESC["_talk"] = { bg: p.bg || G.g.loc.r, lines };
    window.SA_SCENE.open("_talk", { onEnd: () => { persist(); render(); } });
  }
  function service(id, kind) {
    const w = W(); const key = `${id}:${kind}`;
    if (w.svc[key] === G.g.day) { toast(L("Ya lo hiciste hoy. Vuelve mañana.", "Already done today.")); return; }
    if (kind === "heal") { G.pv = G.pvMax; toast(L("Yara te cura por completo.", "Yara heals you fully.")); sfx("heal"); }
    if (kind === "calm") { if (id === "morwen" && G.dinero.soles < 10) { toast(L("Morwen cobra 10 Soles.", "Morwen charges 10 Soles.")); return; } if (id === "morwen") G.dinero.soles -= 10; G.estres = Math.max(0, G.estres - 3); toast(L("−3 Estrés.", "−3 Stress.")); sfx("heal"); }
    w.svc[key] = G.g.day; persist(); render();
  }
  function peopleBox() {
    const ids = peopleHere(); if (!ids.length) return "";
    return `<div class="card mini ppl"><b>🗨️ ${L("Personas aquí", "People here")}</b><div class="pplrow">${ids.map((id) => {
      const p = PEOPLE[id]; const b = bond(id); const fq = FQ[id] && W().fq[id]; const newFq = FQ[id] && b >= 2 && !fq;
      return `<div class="pplc">${window.SA_SCENE.face(id)}<div><b>${esc(NPC[id].n)}</b><small>${esc(NPC[id].t || "")} · ${L("vínculo", "bond")} ${b >= 0 ? "+" : ""}${b}${newFq ? " · 💛" : ""}</small>
        <div class="row"><button type="button" class="btn small" data-talk="${id}">${L("Hablar", "Talk")}</button>${p.heal ? `<button type="button" class="btn small ghost" data-svc="${id}:heal">🩹 ${L("Curarme", "Heal")}</button>` : ""}${p.calm ? `<button type="button" class="btn small ghost" data-svc="${id}:calm">🧘 ${L("Calmarme", "Calm")}${id === "morwen" ? " (10)" : ""}</button>` : ""}</div></div></div>`;
    }).join("")}</div></div>`;
  }

  // =====================================================================
  // 2. MISIONES DE AMISTAD (vínculo +2)
  // =====================================================================
  // pasos: scene{lines} · go{r,p} · fight{e:{n,lvl,img,aff}} · hunt{r,p,n}
  const romance = (id, extra) => ({ c: [
    { l: L("Le dices lo que sientes de verdad.", "Tell them how you really feel."), fx: { rayos: { corazon: 20 } }, then: [...extra, { fx: { flag: `romance_${id}` } }] },
    { l: L("Le das un abrazo de amigo.", "Give them a friendly hug."), fx: { rayos: { corazon: 10 } }, then: [[id, L("Gracias por estar. De verdad.", "Thanks for being here.")]] },
  ] });
  const FQ = {
    darius: { t: "El peso del apellido", hook: "¿Tienes un momento? Hay algo que… no le he contado a nadie.", reward: { rayos: { poder: 30, fama: 20 }, item: "Anillo de Valcor" },
      steps: [
        { k: "scene", t: "Una confesión en el patio", bg: "patio", lines: [["darius", "Mi familia no quiere un hijo. Quiere un ganador de la Cumbre."], ["darius", "Mi padre llega mañana a la Capital para ver el torneo de exhibición. Si pierdo, me saca de la academia."], ["darius", "Y lo peor… es que no quiero ganar. No quiero subir esa escalera. Quiero vivir."], ["darius", "¿Vendrías conmigo? Solo… para no estar solo delante de él."]] },
        { k: "go", r: "cap", p: 2, t: "Acompaña a Darius al Coliseo Real" },
        { k: "fight", t: "El campeón de la casa Valcor", e: { n: "Campeón de la casa Valcor", lvl: "me", plus: 1 } },
        { k: "scene", t: "Padre e hijo", bg: "arena", lines: ["El campeón de su familia cae en la arena. Lord Valcor se levanta del palco, furioso.", ["darius", "Padre. Ha ganado mi amigo, no yo. Y está bien así."], ["darius", "No voy a subir a la Cumbre por ti. Si subo algún día, será por mí."], "El silencio dura una eternidad. Luego Lord Valcor se marcha sin decir nada. Darius tiembla… y sonríe.", ["darius", "Lo he dicho. Lo he dicho de verdad."], romance("darius", [["darius", "…¿En serio? Yo… llevo meses queriendo decírtelo y no me atrevía. Un Valcor sin palabras. Qué vergüenza."]])] },
      ] },
    thorne: { t: "La manada perdida", hook: "He olido algo en el viento. Algo de mi manada. Necesito que vengas.", reward: { rayos: { poder: 20, corazon: 30 }, item: "Colmillo de la manada" },
      steps: [
        { k: "scene", t: "Un olor conocido", bg: "verde", lines: [["thorne", "Mi manada vivía en el Bosque de Verdemar. La Orden la quemó cuando yo era un cachorro."], ["thorne", "Anoche olí a uno de ellos. En la Guarida del Lobo de Sombra. Alguien de mi manada sigue vivo… o algo que huele como ellos."]] },
        { k: "go", r: "verde", p: 4, t: "Ve con Thorne a la Guarida del Lobo de Sombra" },
        { k: "hunt", r: "verde", p: 4, n: 2, t: "Abrete paso entre los lobos (2)" },
        { k: "fight", t: "El cazador de la Orden", e: { n: "Cazador del Crepúsculo", lvl: "me", plus: 1, img: "Cultista del Crepúsculo", aff: "Sombra" } },
        { k: "scene", t: "El collar", bg: "verde", lines: ["Entre las cosas del cazador hay un collar de cuero con un colmillo tallado. Thorne lo coge con las manos temblando.", ["thorne", "Era de mi hermana pequeña. Se lo hizo mi madre."], ["thorne", "Él la cazó. Pero ella… dice aquí que escapó. Que sigue viva, en algún sitio del norte."], "Thorne levanta la cabeza y aúlla. Un aullido largo, roto y lleno de esperanza.", ["thorne", "Ahora tú también eres manada. Eso no se rompe nunca."], romance("thorne", [["thorne", "…Los lobos elegimos una sola vez. Y yo ya había elegido. Tardaste mucho en darte cuenta, ¿eh?"]])] },
      ] },
    garrok: { t: "Letras de piedra", hook: "¿Puedo contarte un secreto? Uno… vergonzoso.", reward: { rayos: { corazon: 30, saber: 15 }, item: "Libro de cuentos de Garrok" },
      steps: [
        { k: "scene", t: "El secreto de Garrok", bg: "patio", lines: [["garrok", "Yo… no sé leer. Nunca aprendí. En la montaña no había escuelas."], ["garrok", "Hago como que leo. Miro los libros y asiento. Nadie se ha dado cuenta. Solo tú, ahora."], ["garrok", "¿Me enseñarías? En secreto. Por favor."], { c: [{ l: "«Claro que sí. Empezamos hoy.»" }, { l: "«No hay nada de qué avergonzarse, Garrok.»", then: [["garrok", "*se le humedecen los ojos* Gracias."]] }] }] },
        { k: "go", r: "alba", p: 0, t: "Compra un libro de cuentos en el Pueblo de Amanecer" },
        { k: "fight", t: "Los matones que se ríen de Garrok", e: { n: "Matones de tercero", lvl: "me", img: "Contrabandistas" } },
        { k: "scene", t: "La primera página", bg: "taberna", lines: ["Semanas de práctica en la taberna de Mira, a escondidas. Letra a letra.", ["garrok", "«Había… una vez… un gigante… que tenía… miedo… de las… palabras.»"], ["garrok", "¡He leído una frase! ¡Una frase entera!"], ["mira", "(desde la barra) ¡Esa es buena! ¡Una ronda de sopa para el lector!"], ["garrok", "Cuando sea mayor, voy a enseñar a leer a los pequeños de la montaña. Como tú me enseñaste a mí."], romance("garrok", [["garrok", "¿A… a mí? *se pone rojo como una piedra al atardecer* Yo también. Desde el primer día. Desde el mapa al revés."]])] },
      ] },
    seraphina: { t: "Lo que ve el Destino", hook: "Necesito hablar con alguien que no me tome por loca.", reward: { rayos: { saber: 35 }, item: "Estrella de Seraphina" },
      steps: [
        { k: "scene", t: "Visiones", bg: "observatorio", lines: [["seraphina", "Tengo una afinidad que nadie conoce. Destino. Veo fragmentos del futuro."], ["seraphina", "Anoche vi el Faro Antiguo lleno de ecos. Y a ti, en medio, gritando mi nombre."], ["seraphina", "Si no voy, quizá no pase. Si voy, quizá sí. ¿Qué harías tú?"], { c: [{ l: "«Vamos juntos. Así, pase lo que pase, no estarás sola.»" }] }] },
        { k: "go", r: "alba", p: 3, t: "Ve al Faro Antiguo con Seraphina" },
        { k: "fight", t: "El eco del futuro", e: { n: "Eco del futuro", lvl: "me", plus: 1, img: "Espectros menores", aff: "Luz" } },
        { k: "scene", t: "Un futuro distinto", bg: "faro", lines: ["El eco se deshace en luz. Seraphina te mira con los ojos muy abiertos.", ["seraphina", "En mi visión, tú gritabas mi nombre porque yo caía. Pero no he caído."], ["seraphina", "El futuro puede cambiar. Lo hemos cambiado. Tú lo has cambiado."], ["seraphina", "No soporto perder. Pero creo que no me importaría perder contra el destino si es contigo al lado."], romance("seraphina", [["seraphina", "…Eso no lo vi venir. Y es la primera vez en mi vida que me alegro de no saberlo todo."]])] },
      ] },
    pip: { t: "Rumores caros", hook: "Estoy metida en un lío. Uno de verdad. ¿Me ayudas? No se lo digas a nadie. Por favor.", reward: { rayos: { fama: 30, corazon: 15 }, soles: 40 },
      steps: [
        { k: "scene", t: "La deuda de Pip", bg: "taberna", lines: [["pip", "Vendí rumores a la Orden. Pocos. Tontos. Pero ahora quieren más, y si no se los doy…"], ["pip", "…me han dicho que contarán a toda la academia lo que hice. Y que luego vendrán a por mí."], ["pip", "Me citan esta noche detrás de la taberna. No quiero ir sola."], { c: [{ l: "«Iremos juntos. Y se acabó el chantaje.»" }] }] },
        { k: "go", r: "alba", p: 0, t: "Ve con Pip al callejón detrás de la taberna" },
        { k: "fight", t: "El chantajista de la Orden", e: { n: "Chantajista del Crepúsculo", lvl: "me", img: "Cultista del Crepúsculo", aff: "Sombra" } },
        { k: "scene", t: "Sin secretos", bg: "taberna", lines: [["pip", "Se acabó. Ya no tienen nada contra mí. Bueno, lo que pasa es que… mañana se lo voy a contar yo a todos."], ["pip", "Prefiero que lo sepan por mí. Es mi último rumor sobre Pip Brizna. Y es gratis."], ["pip", "Oye… gracias. Nadie había hecho algo por mí sin pedir nada a cambio."], romance("pip", [["pip", "Vaya. Por primera vez en mi vida, no sé qué decir. Apúntalo, es histórico. …Yo también, tonto."]])] },
      ] },
    brisa: { t: "Lo que trajo de las Islas", hook: "Creo que ya puedo contártelo. Ven al faro de Isolde.", reward: { rayos: { saber: 25, fama: 15 }, item: "Brújula de las Islas" },
      steps: [
        { k: "scene", t: "Una promesa de marinera", bg: "puerto", lines: [["brisa", "Soy la única que ha vuelto de las Islas Perdidas. Y no volví con las manos vacías."], ["brisa", "Lo guardo en el faro de mi amiga Isolde. Quiero que lo veas. Pero el camino se ha llenado de ahogados."]] },
        { k: "go", r: "costa", p: 1, t: "Viaja al Faro de Isolde" },
        { k: "fight", t: "Los ahogados del faro", e: { n: "Marineros ahogados", lvl: "me", aff: "Rayo" } },
        { k: "scene", t: "El mapa", bg: "faro", lines: [["isolde", "Así que por fin se lo enseñas a alguien. Ya era hora, Brisa."], "Brisa despliega un mapa pintado sobre piel de ballena. No se parece a ningún mapa que hayas visto.", ["brisa", "No lleva a un tesoro. Lleva al sitio donde los dioses hicieron a Solen. El principio de todo."], ["brisa", "Cuando llegue el momento, iremos juntos. Te lo prometo por la marea."], { fx: { flag: "mapa_islas" } }] },
      ] },
    kael: { t: "El hijo que no volvió", hook: "Tengo que ir a un sitio. Hace años que no voy. ¿Me acompañas?", reward: { rayos: { poder: 30, corazon: 20 }, item: "Espada del hijo de Kael" },
      steps: [
        { k: "scene", t: "Una petición", bg: "patio", lines: [["kael", "Mi hijo entrenaba en la Cueva del Primer Rayo. Grabó su nombre en la piedra la noche antes de la Prueba."], ["kael", "Nunca he tenido valor de volver a verlo. Quizá hoy sí. Contigo."]] },
        { k: "go", r: "alba", p: 4, t: "Ve con Kael a la Cueva del Primer Rayo" },
        { k: "hunt", r: "alba", p: 4, n: 2, t: "Despeja la cueva (2)" },
        { k: "scene", t: "Un nombre en la piedra", bg: "cueva", lines: ["En lo más hondo, entre cristales, hay letras torcidas grabadas a cuchillo: «Volveré, papá. Te lo prometo».", ["kael", "…"], "Kael pone la mano sobre las letras. Es la primera vez que lo ves llorar.", ["kael", "No te pido que lo traigas de vuelta. Solo que no dejes que otro chico grabe una promesa así."], ["kael", "Toma. Era su espada. Él habría querido que la usara alguien como tú."]] },
      ] },
    nyx: { t: "Dos hermanas", hook: "Hay un sitio al que no puedo volver sola.", from: 11, reward: { rayos: { corazon: 25, poder: 15 }, item: "Máscara de Nyx" },
      steps: [
        { k: "scene", t: "Sin máscara", bg: "salon", lines: ["Nyx se quita la máscara. Debajo hay una chica umbría de ojos plateados, cansada, muy joven.", ["nyx", "Mi hermana y yo bailábamos en el Salón de Baile Hundido cuando éramos niñas. Antes de que se inundara."], ["nyx", "Quiero volver una última vez. Pero ahora está lleno de fantasmas."]] },
        { k: "go", r: "viol", p: 3, t: "Ve con Nyx al Salón de Baile Hundido" },
        { k: "fight", t: "Los bailarines sombríos", e: { n: "Bailarines sombríos", lvl: "me", aff: "Sombra" } },
        { k: "scene", t: "El último baile", bg: "salon", lines: ["Cuando los fantasmas desaparecen, el salón queda en silencio. Nyx tararea una canción muy vieja.", ["nyx", "¿Bailas conmigo? Como bailaba con ella."], "Bailáis sobre el suelo inundado, entre reflejos morados, hasta que la canción se acaba.", ["nyx", "Voy a encontrarla. Y cuando lo haga, quiero que la conozcas."], romance("nyx", [["nyx", "…Llevaba años con una máscara para que nadie viera lo que sentía. Contigo ya no la necesito."]])] },
      ] },
  };
  function fqActive() { const w = W(); for (const [id, st] of Object.entries(w.fq)) if (st && !st.done) return id; return null; }
  function fqStep(id) { const st = W().fq[id]; return st && !st.done ? FQ[id].steps[st.i] : null; }
  function fqStart(id) {
    if (fqActive()) { toast(L("Termina primero la misión de amistad que tienes en curso.", "Finish your current friendship quest first.")); return; }
    W().fq[id] = { i: 0, n: 0 }; persist(); fqPlay(id);
  }
  function fqPlay(id) {
    const st = fqStep(id); if (!st) return;
    if (st.k === "scene") { ESC["_fq"] = { bg: st.bg || G.g.loc.r, lines: st.lines }; window.SA_SCENE.open("_fq", { onEnd: () => fqAdvance(id) }); }
    else render();
  }
  function fqAdvance(id) {
    const q = W().fq[id]; if (!q || q.done) return; q.i++; q.n = 0;
    if (q.i >= FQ[id].steps.length) {
      q.done = true; const f = FQ[id]; const out = applyFx({ ...f.reward, vinc: { [NPC[id].n]: 3 - bond(id) } });
      sfx("level"); toast(L(`💛 Amistad con ${NPC[id].n}: ${out.join(" · ")}`, `💛 Friendship with ${NPC[id].n}`));
      log(`Completaste la misión de amistad «${f.t}» con ${NPC[id].n}.`);
    }
    fqSync(); persist(); render();
    const nx = fqStep(id); if (nx && nx.k === "scene") setTimeout(() => fqPlay(id), 300);
  }
  function fqSync() {
    const id = fqActive(); if (!id) return; const st = fqStep(id);
    if (st && st.k === "go" && here(`${st.r}:${st.p}`)) fqAdvance(id);
    else if (st && st.k === "hunt" && W().fq[id].n >= st.n) fqAdvance(id);
  }
  function fqLvl(e) { return e.lvl === "me" ? Math.max(1, G.nivel + (e.plus || 0)) : e.lvl; }
  function fqFight(id) {
    const st = fqStep(id); if (!st || st.k !== "fight" || G.g.combat) return;
    const e = st.e; const lvl = fqLvl(e); const pv = Math.round((15 + 10 * lvl) * 0.9);
    startCombat({ n: e.n, lvl, pv, pvMax: pv, poder: 5 + 2 * lvl, def: Math.floor(lvl / 6), aff: e.aff || null, boss: false, st: {}, img: e.img }, "amistad", `${G.g.loc.r}:${G.g.loc.p}`, `${st.t}.`);
    if (G.g.combat) G.g.combat.fq = id; persist(); render();
  }
  function fqRow(id) {
    const st = fqStep(id); if (!st) return "";
    const act = st.k === "scene" ? `<button type="button" class="btn primary small" data-fq="${id}">▶ ${L("Ver escena", "Play scene")}</button>`
      : st.k === "go" ? `<button type="button" class="btn primary small" data-go="${st.r}:${st.p}">🧭 ${esc(pname(st.r, st.p))}</button>`
      : st.k === "fight" ? (st.r != null && !here(`${st.r}:${st.p}`) ? "" : `<button type="button" class="btn primary small" data-fqf="${id}">⚔️ ${esc(st.e.n)} · Nv ${fqLvl(st.e)}</button>`)
      : st.k === "hunt" ? (here(`${st.r}:${st.p}`) ? `<button type="button" class="btn primary small" data-g="fight">⚔️ ${L("Cazar", "Hunt")} (${W().fq[id].n}/${st.n})</button>` : `<button type="button" class="btn primary small" data-go="${st.r}:${st.p}">🧭 ${esc(pname(st.r, st.p))}</button>`) : "";
    return `<div class="qtrack fq"><div class="qt-l"><small>💛 ${L("Amistad", "Friendship")} · ${esc(NPC[id].n)} · ${esc(FQ[id].t)}</small><b>${esc(st.t || "")}</b></div><div class="qt-r">${act}</div></div>`;
  }

  // =====================================================================
  // 3. COMPAÑEROS EN COMBATE
  // =====================================================================
  const COMP = {
    thorne: { d: L("Mordisco: golpe fuerte, a veces doble.", "Bite: strong, sometimes double."), c: "#c8c8d0" },
    garrok: { d: L("Muro: recibe el 30% del daño que te hacen.", "Wall: takes 30% of damage aimed at you."), c: "#c0a080" },
    darius: { d: L("Espada noble: golpe con 25% de crítico.", "Noble blade: 25% crit."), c: "#e0b050" },
    seraphina: { d: L("Visión: cada 2 rondas te da ventaja.", "Vision: advantage every 2 rounds."), c: "#cfd9ff" },
    pip: { d: L("Canción: te cura un poco cada ronda; +20% Soles al ganar.", "Song: small heal each round; +20% Soles."), c: "#f08ad0" },
    brisa: { d: L("Marea: golpe de agua y curación cada 2 rondas.", "Tide: water strike and heal every 2 rounds."), c: "#4fb3ff" },
    nyx: { d: L("Sombra: golpe que a veces ciega.", "Shadow: strike that may blind."), c: "#9b5cff" },
  };
  const compId = () => { const id = W().comp; return id && COMP[id] && bond(id) >= 2 ? id : null; };
  const _start = startCombat;
  startCombat = function (enemy, kind, placeKey, intro) {
    const cid = compId(); if (cid && enemy && !enemy.raid) { enemy.pv = Math.round(enemy.pv * 1.27); enemy.pvMax = enemy.pv; }
    const r = _start.apply(this, arguments);
    if (G.g.combat && cid) G.g.combat.comp = cid;
    return r;
  };
  function compAct() {
    const c = G.g.combat; if (!c || !c.comp) return; const id = c.comp; const nm = NPC[id].n.split(" ")[0]; const lv = G.nivel;
    const al = c.enemies.map((e, i) => ({ e, i })).filter((x) => x.e.pv > 0); if (!al.length) return;
    const t = al.find((x) => x.i === (gsel.target ?? 0)) || al[0];
    const hit = (base, mult = 1) => { const d = Math.max(1, Math.round((base - 2 * t.e.def) * mult)); t.e.pv = Math.max(0, t.e.pv - d); fxq({ k: "ally", i: t.i, who: nm, dmg: d, c: COMP[id].c }); return d; };
    if (id === "thorne") { const d = hit(4 + 1.6 * lv); clog(`${nm} muerde: ${d} de daño.`); if (t.e.pv > 0 && Math.random() < 0.25) { const d2 = hit(2 + 0.8 * lv); clog(`${nm} vuelve a morder: ${d2}.`); } }
    if (id === "garrok") { const d = hit(2 + 1 * lv); clog(`${nm} golpea con el puño: ${d} de daño.`); }
    if (id === "darius") { const cr = Math.random() < 0.25; const d = hit(3 + 1.8 * lv, cr ? 2 : 1); clog(`${nm} ataca: ${d} de daño${cr ? " (¡crítico!)" : ""}.`); }
    if (id === "seraphina") { const d = hit(2 + 1.2 * lv); clog(`${nm} lanza un destello: ${d} de daño.`); if (c.round % 2 === 0) { c.pst.buff = (c.pst.buff || 0) + 1; clog(`${nm} ve tu siguiente movimiento: ventaja.`); } }
    if (id === "pip") { const h = Math.max(1, Math.round(G.pvMax * 0.05)); G.pv = Math.min(G.pvMax, G.pv + h); fxq({ k: "ally", heal: h, who: nm }); clog(`${nm} canta: recuperas ${h} PV.`); }
    if (id === "brisa") { const d = hit(3 + 1.3 * lv); clog(`${nm} lanza una ola: ${d} de daño.`); if (c.round % 2 === 0) { const h = Math.round(G.pvMax * 0.08); G.pv = Math.min(G.pvMax, G.pv + h); fxq({ k: "ally", heal: h, who: nm }); clog(`${nm} te cura ${h} PV.`); } }
    if (id === "nyx") { const d = hit(3 + 1.7 * lv); clog(`${nm} ataca desde la sombra: ${d} de daño.`); if (t.e.pv > 0 && Math.random() < 0.2) { t.e.st.Cegado = 1; clog(`${t.e.n} queda cegado.`); } }
  }
  const _after = afterPlayer;
  afterPlayer = function () { try { if (G.g.combat && G.g.combat.enemies.some((e) => e.pv > 0)) compAct(); } catch (e) { console.warn(e); } return _after.apply(this, arguments); };
  const _eturn = enemyTurn;
  enemyTurn = function () {
    const c = G.g.combat; const before = G.pv; const r = _eturn.apply(this, arguments);
    if (c && c.comp === "garrok" && G.g.combat === c && G.pv < before) { const back = Math.round((before - G.pv) * 0.3); if (back > 0 && G.pv > 0) { G.pv = Math.min(G.pvMax, G.pv + back); clog(`Garrok se pone delante: absorbe ${back} de daño.`); } }
    return r;
  };
  function compBadge() {
    const c = G?.g?.combat; if (!c || !c.comp) return "";
    return `<div class="compb">${window.SA_SCENE.face(c.comp)}<small>${esc(NPC[c.comp].n.split(" ")[0])}</small></div>`;
  }

  // =====================================================================
  // 4. COMBATES DE GRUPO (jefes)
  // =====================================================================
  const raids = () => Store.world?.raids || {};
  const raidPv = (r) => Math.max(0, r.pvMax - Object.values(r.parts || {}).reduce((a, p) => a + (p.dmg || 0), 0));
  const activeRaids = () => Object.entries(raids()).filter(([, r]) => r && !r.done && raidPv(r) > 0 && Date.now() - (r.at || 0) < (r.kind === "world" ? 168 : r.kind === "monster" || r.kind === "mision" || r.kind === "dun" ? 2 : 6) * 3600e3);
  const activePlayers = () => new Set(Store.all.filter((c) => Date.now() - (c.lastSeen || c.updatedAt || 0) < 20 * 60e3).map((c) => c.owner)).size;
  async function raidCreate(kind) {
    const key = `${G.g.loc.r}:${G.g.loc.p}`; const pl = PLACE_OF(G.g.loc.r, G.g.loc.p); let e, extra = {};
    const n = Math.max(2, activePlayers());
    if (kind === "boss") { e = makeMonster(pl, G.g.loc.r, true); }
    else if (kind === "monster") { e = makeMonster(pl, G.g.loc.r, false); }
    else if (kind === "mision") { const fe = window.SA_STORY?.fightEnemy?.(); if (!fe || !here(fe.place)) return; e = { ...fe.e }; extra = { mis: fe.key, t: fe.t }; }
    else { const ch = typeof chapter === "function" ? STORY.find((s) => s.cap === cap()) : null; if (!ch?.boss) return; const b = ch.boss; e = { n: b.n, lvl: b.lvl, poder: 10 + 3 * b.lvl, def: Math.floor(b.lvl / 4) + 1, aff: b.aff, boss: true, st: {}, story: ch.cap, god: b.god }; }
    const pvMax = kind === "monster" || kind === "mision" ? Math.round(e.pv * (1 + 0.6 * (n - 1))) : Math.round((40 + 22 * e.lvl) * (0.4 + 0.15 * n));
    const id = "r" + Date.now().toString(36);
    const raid = { id, kind, place: key, by: Store.uid, byName: G.nombre, at: Date.now(), pvMax, ...extra, e: { n: e.n, lvl: e.lvl, poder: e.poder, def: e.def, aff: e.aff || null, story: e.story || null, god: e.god || null, boss: kind === "monster" ? false : kind === "mision" ? !!e.boss : true, img: e.img || null, npc: e.npc || null }, parts: {} };
    await Store.updateWorld({ raids: { [id]: raid } });
    toast(L("Has llamado al grupo. Tus amigos verán el aviso.", "You called the group."));
    raidJoin(id);
  }
  function raidJoin(id) {
    const r = raids()[id]; if (!r || G.g.combat) return;
    if (!here(r.place)) { const [rr, pp] = r.place.split(":"); return travel({ r: rr, p: +pp }, "pie"); }
    if (window.SA_EXTRA?.canJoin && !window.SA_EXTRA.canJoin(r)) return;
    if (!needEnergy(1)) return;
    const pv = raidPv(r); const e = { ...r.e, pv, pvMax: r.pvMax, boss: r.e.boss !== false, st: {}, raid: id }; if (!e.img) delete e.img; if (!e.npc) delete e.npc;
    _start(e, { story: "story", monster: "monster", mision: "mision", world: "world", dun: "dun" }[r.kind] || "boss", r.place, L(`Combate de grupo contra ${r.e.n}.`, `Group fight vs ${r.e.n}.`));
    const c = G.g.combat; if (c) { c.enemies = c.enemies.slice(0, 1); c.raid = id; c.myDmg = (r.parts?.[Store.uid]?.dmg) || 0; c.lastPv = c.enemies[0].pv; const cid = compId(); if (cid) c.comp = cid; if (r.mis && window.SA_STORY?.key() === r.mis) c.misStep = r.mis; try { window.SA_EXTRA?.onJoin?.(r, c); } catch (e) {} }
    persist(); render();
  }
  let pushT = null;
  function raidSync() {
    const c = G?.g?.combat; if (!c || !c.raid) return;
    const r = raids()[c.raid]; const e = c.enemies[0]; if (!r || !e) return;
    if (e.pv < c.lastPv) { c.myDmg += c.lastPv - e.pv; clearTimeout(pushT); const id = c.raid, dmg = c.myDmg, n = G.nombre; pushT = setTimeout(() => Store.updateWorld({ raids: { [id]: { parts: { [Store.uid]: { dmg, n } } } } }).catch(() => {}), 250); }
    const others = Object.entries(r.parts || {}).filter(([u]) => u !== Store.uid).reduce((a, [, p]) => a + (p.dmg || 0), 0);
    const shared = Math.max(0, r.pvMax - others - c.myDmg);
    if (shared < e.pv) { const d = e.pv - shared; e.pv = shared; const who = Object.entries(r.parts || {}).find(([u]) => u !== Store.uid)?.[1]?.n || L("Aliado", "Ally"); fxq({ k: "ally", i: 0, who, dmg: d, c: "#8be0a8" }); }
    c.lastPv = e.pv;
    if (e.pv <= 0 && G.g.combat === c) { W().raidClaim[c.raid] = 1; Store.updateWorld({ raids: { [c.raid]: { done: true, parts: { [Store.uid]: { dmg: c.myDmg, n: G.nombre } } } } }).catch(() => {}); setTimeout(() => { if (G.g.combat === c) victory(); }, 50); }
  }
  function raidClaims() {
    for (const [id, r] of Object.entries(raids())) {
      if (!r || !r.parts?.[Store.uid] || W().raidClaim[id]) continue;
      if (r.done || raidPv(r) <= 0) {
        if (G.g.combat?.raid === id) continue;
        W().raidClaim[id] = 1; const bs = r.e.boss !== false; const xp = xpFor({ lvl: r.e.lvl, boss: bs }); const so = r.e.lvl * (bs ? 10 : 4); gainXP(xp); G.dinero.soles += so;
        if (r.e.story) G.g.flags[`jefe_${r.e.story}`] = true;
        if (r.mis && window.SA_STORY?.key() === r.mis) setTimeout(() => window.SA_STORY.markFight(r.mis), 0);
        try { window.SA_SOCIAL?.onRaidWin?.(r); } catch (e) {}
        try { window.SA_EXTRA?.onClaim?.(r); } catch (e) {}
        W().raidWins = (W().raidWins || 0) + 1; sfx("victory");
        toast(L(`⚔️ ¡El grupo venció a ${r.e.n}! +${xp} XP, +${so} Soles`, `The group defeated ${r.e.n}!`)); persist();
      }
    }
  }
  window.SA_RAID = { raids, activeRaids, raidPv, create: (k) => raidCreate(k), join: (id) => raidJoin(id) };
  const _vic = victory;
  victory = function () {
    const c = G.g.combat; if (c?.raid) { W().raidClaim[c.raid] = 1; W().raidWins = (W().raidWins || 0) + 1; const dmg = (c.myDmg || 0) + Math.max(0, c.lastPv || 0); Store.updateWorld({ raids: { [c.raid]: { done: true, parts: { [Store.uid]: { dmg, n: G.nombre } } } } }).catch(() => {}); }
    const so = G.dinero.soles; const r = _vic.apply(this, arguments);
    if (c?.comp === "pip") G.dinero.soles += Math.max(0, Math.round((G.dinero.soles - so) * 0.2));
    if (c?.fq && W().fq[c.fq]) fqAdvance(c.fq);
    return r;
  };
  const _def = defeat;
  defeat = function () { const c = G.g.combat; if (c?.raid && c.enemies[0]) { const dmg = (c.myDmg || 0) + Math.max(0, (c.lastPv || 0) - c.enemies[0].pv); if (dmg > 0) Store.updateWorld({ raids: { [c.raid]: { parts: { [Store.uid]: { dmg, n: G.nombre } } } } }).catch(() => {}); } const r = _def.apply(this, arguments); return r; };
  function raidBox() {
    const list = activeRaids(); const key = `${G.g.loc.r}:${G.g.loc.p}`; const pl = PLACE_OF(G.g.loc.r, G.g.loc.p);
    const rows = list.map(([id, r]) => { const ps = Object.values(r.parts || {}).map((p) => esc(p.n)).join(", "); const pct = Math.round((raidPv(r) / r.pvMax) * 100);
      const tag = { world: L("🌋 Jefe mundial", "🌋 World boss"), dun: L("🏰 Mazmorra", "🏰 Dungeon"), monster: L("🐾 Caza", "🐾 Hunt"), mision: L("📜 Historia", "📜 Story"), story: L("💀 Jefe de la historia", "💀 Story boss"), boss: L("💀 Jefe", "💀 Boss") }[r.kind] || "";
      return `<div class="raidr"><div><b>⚔️ ${esc(r.e.n)}</b> <span class="pill">${tag}</span>${r.t ? ` <small>${esc(r.t)}</small>` : ""} <small>${L("Nv", "Lv")} ${r.e.lvl} · ${esc(pname(...r.place.split(":")))} · ${L("llamó", "called by")} ${esc(r.byName)}</small><span class="qt-bar"><i style="width:${pct}%;background:#e0584a"></i></span><small>${ps ? L("Peleando: ", "Fighting: ") + ps : L("Nadie ha entrado todavía", "Nobody yet")}</small></div>
        <button type="button" class="btn primary small" data-raid="${id}" ${G.g.combat ? "disabled" : ""}>${here(r.place) ? L("Unirse (1 Energía)", "Join") : L("Viajar allí", "Travel")}</button></div>`; }).join("");
    let call = "";
    {
      const bossHere = pl.boss && !/aparece al azar/.test(pl.boss) && !(typeof bossDown === "function" && bossDown(key));
      const ch = STORY.find((s) => s.cap === cap()); const storyHere = ch?.boss && key === `${ch.r}:${ch.p}` && !G.g.flags[`jefe_${ch.cap}`];
      const has = (k) => list.some(([, r]) => r.place === key && r.kind === k);
      const lv = typeof parseLvl === "function" ? parseLvl(pl.lvl) : null; const huntHere = pl.mon?.length && lv && !/Duelos|Ladrones$|Premios/.test(pl.mon.join());
      const fe = window.SA_STORY?.fightEnemy?.(); const misHere = fe && here(fe.place) && !list.some(([, r]) => r.mis === fe.key);
      const b = [];
      if (bossHere && !has("boss")) b.push(`<button type="button" class="btn small" data-raidnew="boss">👥 ${L("Llamar al grupo contra", "Call the group vs")} ${esc(pl.boss.replace(/\s*\(.*\)/, ""))}</button>`);
      if (storyHere && !has("story")) b.push(`<button type="button" class="btn small" data-raidnew="story">👥 ${L("Llamar al grupo contra", "Call the group vs")} ${esc(ch.boss.n)}</button>`);
      if (misHere) b.push(`<button type="button" class="btn small" data-raidnew="mision">📜👥 ${L("Pelea de la historia en grupo", "Story fight together")}: ${esc(fe.e.n)}</button>`);
      if (huntHere && !has("monster")) b.push(`<button type="button" class="btn small" data-raidnew="monster">🐾👥 ${L("Cazar en grupo", "Hunt together")}</button>`);
      if (b.length) call = `<div class="row">${b.join("")}<span class="note">${L("Todos pelean contra el mismo enemigo, cada uno en su turno; la vida es compartida y cada uno gana su recompensa.", "Everyone fights the same enemy with shared HP.")}</span></div>`;
    }
    if (!rows && !call) return "";
    return `<div class="card mini raidbox"><b>👥 ${L("Combates de grupo", "Group fights")}</b>${rows}${call}</div>`;
  }
  function raidAllies() {
    const c = G?.g?.combat; if (!c?.raid) return ""; const r = raids()[c.raid]; if (!r) return "";
    const ps = Object.entries(r.parts || {}).filter(([u]) => u !== Store.uid);
    return `<div class="raidallies">👥 ${L("Vida compartida", "Shared HP")} · ${ps.length ? ps.map(([, p]) => `${esc(p.n)} −${p.dmg}`).join(" · ") : L("esperando aliados…", "waiting for allies…")}</div>`;
  }

  // hunts de amistad: contar victorias en el lugar
  const _vic2 = victory;
  victory = function () {
    const c = G.g.combat; const id = fqActive(); const st = id && fqStep(id);
    const r = _vic2.apply(this, arguments);
    if (c && st && st.k === "hunt" && c.placeKey === `${st.r}:${st.p}` && c.kind === "monster") { W().fq[id].n += c.enemies.length; fqSync(); persist(); render(); }
    return r;
  };

  // =====================================================================
  // 5. MÚSICA DE FONDO (generada, sin archivos)
  // =====================================================================
  const MUS = { on: (() => { try { return localStorage.getItem("sa-music") !== "off"; } catch (e) { return true; } })(), ctx: null, g: null, timer: null, mood: null, step: 0 };
  const SCALES = {
    alba: { root: 261.6, prog: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [4, 7, 11]], wave: "triangle", tempo: 3.2 },
    verde: { root: 220, prog: [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]], wave: "sine", tempo: 3.6 },
    llan: { root: 293.7, prog: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], wave: "triangle", tempo: 3 },
    costa: { root: 246.9, prog: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]], wave: "sine", tempo: 3.4 },
    esc: { root: 196, prog: [[0, 3, 7], [8, 12, 15], [5, 8, 12], [7, 10, 14]], wave: "sine", tempo: 4 },
    quem: { root: 174.6, prog: [[0, 3, 7], [1, 5, 8], [0, 3, 7], [10, 13, 17]], wave: "sawtooth", tempo: 3 },
    viol: { root: 185, prog: [[0, 3, 6], [1, 4, 8], [0, 3, 7], [6, 9, 13]], wave: "sine", tempo: 4.2 },
    cap: { root: 261.6, prog: [[0, 4, 7], [5, 9, 12], [2, 5, 9], [7, 11, 14]], wave: "triangle", tempo: 2.8 },
    lost: { root: 207.7, prog: [[0, 4, 7, 11], [2, 6, 9, 13], [4, 7, 11, 14], [5, 9, 12, 16]], wave: "sine", tempo: 4.5 },
    combat: { root: 146.8, prog: [[0, 3, 7], [0, 3, 7], [8, 12, 15], [10, 14, 17]], wave: "sawtooth", tempo: 1.6, drums: true },
  };
  function musCtx() { if (!MUS.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; MUS.ctx = new A(); MUS.g = MUS.ctx.createGain(); MUS.g.gain.value = 0; const lp = MUS.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800; MUS.g.connect(lp); lp.connect(MUS.ctx.destination); } if (MUS.ctx.state === "suspended") MUS.ctx.resume(); return MUS.ctx; }
  function note(f, t, dur, vol, type) { const c = MUS.ctx; const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(); o.type = type; o2.type = type; o.frequency.value = f; o2.frequency.value = f * 1.004; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(g); o2.connect(g); g.connect(MUS.g); o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1); }
  function kick(t) { const c = MUS.ctx; const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.connect(g); g.connect(MUS.g); o.start(t); o.stop(t + 0.25); }
  function musTick() {
    if (!MUS.on || !MUS.ctx || !MUS.mood) return; const s = SCALES[MUS.mood] || SCALES.alba; const c = MUS.ctx; const t = c.currentTime + 0.05;
    const ch = s.prog[MUS.step % s.prog.length]; MUS.step++;
    const warm = s.wave === "sawtooth" ? 0.018 : 0.04;
    ch.forEach((semi) => note(s.root * Math.pow(2, semi / 12) / 2, t, s.tempo * 1.05, warm, s.wave));
    note(s.root * Math.pow(2, ch[0] / 12) / 4, t, s.tempo, 0.05, "sine");
    const arpN = s.drums ? 8 : 4; for (let k = 0; k < arpN; k++) if (Math.random() < (s.drums ? 0.7 : 0.55)) { const semi = ch[k % ch.length] + (k > 2 ? 12 : 0); note(s.root * Math.pow(2, semi / 12), t + (k * s.tempo) / arpN, 0.5, 0.025, "sine"); }
    if (s.drums) for (let k = 0; k < 4; k++) kick(t + (k * s.tempo) / 4);
    MUS.timer = setTimeout(musTick, s.tempo * 1000);
  }
  function musSet() {
    if (!G || view.name !== "game") { if (MUS.g && MUS.ctx) MUS.g.gain.setTargetAtTime(0, MUS.ctx.currentTime, 0.5); return; }
    const mood = G.g.combat ? "combat" : G.g.loc.r;
    if (!MUS.on) { if (MUS.g) MUS.g.gain.setTargetAtTime(0, MUS.ctx.currentTime, 0.3); return; }
    if (!MUS.ctx) return; // espera un clic del jugador
    if (mood !== MUS.mood) { MUS.mood = mood; MUS.step = 0; clearTimeout(MUS.timer); MUS.g.gain.setTargetAtTime(0.6, MUS.ctx.currentTime, 1.2); musTick(); }
  }
  document.addEventListener("pointerdown", () => { if (MUS.on && !MUS.ctx) { if (musCtx()) { MUS.mood = null; musSet(); } } }, true);
  function musButton() {
    let b = document.getElementById("musbtn"); const ref = document.getElementById("sndbtn") || document.getElementById("langbtn");
    if (!b && ref && ref.parentNode) { b = document.createElement("button"); b.id = "musbtn"; b.type = "button"; b.className = "btn small ghost"; b.style.marginRight = "6px"; ref.parentNode.insertBefore(b, ref); b.addEventListener("click", () => { MUS.on = !MUS.on; try { localStorage.setItem("sa-music", MUS.on ? "on" : "off"); } catch (e) {} if (MUS.on) { musCtx(); MUS.mood = null; } else { clearTimeout(MUS.timer); MUS.mood = null; } musSet(); musButton(); }); }
    if (b) { b.textContent = MUS.on ? "🎵" : "🎵̸"; b.title = MUS.on ? L("Quitar música", "Music off") : L("Poner música", "Music on"); b.style.opacity = MUS.on ? 1 : 0.5; }
  }

  // =====================================================================
  // 6. LOGROS, TÍTULOS, DIARIO Y AVISOS
  // =====================================================================
  const kills = () => Object.values(G.g.kills || {}).reduce((a, b) => a + b, 0);
  const fqDone = () => Object.values(W().fq).filter((x) => x && x.done).length;
  const ACH = [
    ["sangre", "Primera sangre", "Gana tu primer combate.", () => kills() >= 1],
    ["cazador", "Cazador", "Vence 50 monstruos.", () => kills() >= 50],
    ["leyenda_caza", "Leyenda de la caza", "Vence 250 monstruos.", () => kills() >= 250],
    ["n10", "Promesa", "Llega a nivel 10.", () => G.nivel >= 10],
    ["n25", "Veterano", "Llega a nivel 25.", () => G.nivel >= 25],
    ["n50", "Héroe de Solvaria", "Llega a nivel 50.", () => G.nivel >= 50],
    ["a1", "Primer año", "Completa el Arco 1.", () => !!G.g.story?.[10] && (G.g.mis?.cap || 1) > 10],
    ["a2", "Cazador del Eclipse", "Completa el Arco 2.", () => (G.g.mis?.cap || 1) > 20],
    ["a3", "Lo que hay debajo", "Completa el Arco 3.", () => (G.g.mis?.cap || 1) > 30],
    ["a4", "La verdad de la Cumbre", "Completa la historia principal.", () => !!G.g.story?.[40] && (G.g.mis?.fin === 40)],
    ["viajero", "Viajero", "Visita las 9 regiones de Solvaria.", () => Object.keys(W().regs).length >= 9],
    ["amigo", "Amigo de verdad", "Completa una misión de amistad.", () => fqDone() >= 1],
    ["corazon", "Corazón del grupo", "Completa 4 misiones de amistad.", () => fqDone() >= 4],
    ["juntos", "Juntos somos más", "Gana un combate de grupo.", () => (W().raidWins || 0) >= 1],
    ["rico", "Bolsillos llenos", "Junta 1000 Soles.", () => (G.dinero?.soles || 0) >= 1000],
    ["devoto", "Devoto", "Jura lealtad a un dios.", () => !!(typeof dg === "function" && dg().patron)],
    ["pistas", "Detective", "Descubre 10 pistas.", () => Object.keys(G.g.flags || {}).filter((f) => typeof FLAG_NAME !== "undefined" && FLAG_NAME[f]).length >= 10],
    ["charlas", "Conocido en todas partes", "Habla con 15 personas distintas.", () => Object.keys(W().met).length >= 15],
  ];
  function checkAch() {
    const w = W(); w.regs[G.g.loc.r] = 1; let got = false;
    for (const [id, n] of ACH) if (!w.ach[id]) { const a = ACH.find((x) => x[0] === id); let ok = false; try { ok = a[3](); } catch (e) {} if (ok) { w.ach[id] = G.g.day; got = true; setTimeout(() => { sfx("level"); toast(`🏆 ${L("Logro", "Achievement")}: ${n}`); }, 400); } }
    if (got) persist();
  }
  function journal() {
    const fl = Object.keys(G.g.flags || {}).filter((f) => typeof FLAG_NAME !== "undefined" && FLAG_NAME[f]);
    const caps = Object.keys(G.g.story || {}).map(Number).sort((a, b) => a - b);
    return `<h3 class="sub">📖 ${L("Diario", "Journal")}</h3>
      <div class="card mini"><b>${L("Pistas descubiertas", "Clues")} (${fl.length})</b>${fl.length ? `<ul class="jl">${fl.map((f) => `<li>🔎 ${esc(FLAG_NAME[f][0].toUpperCase() + FLAG_NAME[f].slice(1))}</li>`).join("")}</ul>` : `<p class="muted">${L("Todavía ninguna. Algunas acciones de la historia revelan pistas.", "None yet.")}</p>`}</div>
      ${caps.length ? `<div class="card mini"><b>${L("Tu historia", "Your story")}</b><ul class="jl">${caps.slice().reverse().map((c) => { const s = G.g.story[c]; const ch = STORY.find((x) => x.cap === c); const h = (Store.world?.history || []).find((x) => x.cap === c); return `<li><b>${L("Cap.", "Ch.")} ${c} · ${esc(ch?.t || "")}</b><br><small>${esc(s.l)} → ${esc(s.text)}${h ? `<br>${L("El grupo decidió", "Group decided")}: ${esc(h.label)}` : ""}</small></li>`; }).join("")}</ul></div>` : ""}`;
  }
  function achBox() {
    const w = W(); const got = ACH.filter(([id]) => w.ach[id]);
    return `<h3 class="sub">🏆 ${L("Logros y títulos", "Achievements & titles")} (${got.length}/${ACH.length})</h3>
      <p class="note">${L("Cada logro desbloquea un título. Elige uno para mostrarlo junto a tu nombre.", "Each achievement unlocks a title.")}</p>
      <div class="achs">${ACH.map(([id, n, d]) => `<button type="button" class="ach ${w.ach[id] ? "on" : ""} ${w.title === id ? "sel" : ""}" ${w.ach[id] ? `data-title="${id}"` : "disabled"}><b>${w.ach[id] ? "🏆" : "🔒"} ${esc(n)}</b><small>${esc(d)}</small></button>`).join("")}</div>
      ${w.title ? `<button type="button" class="link" data-title="">${L("Quitar título", "Remove title")}</button>` : ""}`;
  }
  const _hud = hud;
  hud = function () { const h = _hud(); const t = G && W().title && ACH.find((a) => a[0] === W().title); return t ? h.replace(`<b>${esc(G.nombre)}</b>`, `<b>${esc(G.nombre)}</b><em class="ttl">«${esc(t[1])}»</em>`) : h; };

  // avisos del grupo
  let snap = null;
  function notify() {
    if (!G || view.name !== "game") return;
    const w = Store.world || {}; const c = cap();
    const now = { hist: (w.history || []).length, votes: Object.keys(w.votes?.[typeof worldCap === "function" ? worldCap() : c] || {}), raids: Object.keys(w.raids || {}), mates: Object.fromEntries(Store.all.filter((x) => x.owner !== Store.uid).map((x) => [x.id, { cap: x.g?.mis?.cap || 1, n: x.nombre, fin: x.g?.mis?.fin }])) };
    if (snap) {
      if (now.hist > snap.hist) { const h = w.history[w.history.length - 1]; toast(`📜 ${L("El grupo decidió", "The group decided")}: ${h.label}`); }
      for (const u of now.votes) if (!snap.votes.includes(u) && u !== Store.uid) toast(`🗳️ ${esc(typeof profileName === "function" ? profileName(u) : "Alguien")} ${L("ha votado", "voted")}`);
      for (const id of now.raids) if (!snap.raids.includes(id)) { const r = w.raids[id]; if (r && r.by !== Store.uid && !r.done) { sfx("boss"); toast(`⚔️ ${r.byName} ${L("pide ayuda contra", "needs help vs")} ${r.e.n} ${L("en", "at")} ${pname(...r.place.split(":"))}`); } }
      for (const [id, m] of Object.entries(now.mates)) { const o = snap.mates[id]; if (o && (m.fin !== o.fin) && m.fin) toast(`✅ ${m.n} ${L("terminó el capítulo", "finished chapter")} ${m.fin}`); }
    }
    snap = now;
  }

  // =====================================================================
  // 7. PESTAÑA "VÍNCULOS"
  // =====================================================================
  if (typeof TABS !== "undefined" && !TABS.some((t) => t[0] === "vinculos")) TABS.splice(TABS.findIndex((t) => t[0] === "grupo"), 0, ["vinculos", "Vínculos"]);
  function where(id) { const p = PEOPLE[id]; return p ? p.at.map((k) => pname(...k.split(":"))).join(" / ") : ""; }
  function bondsView() {
    const w = W(); const ids = Object.keys(PEOPLE).filter((id) => w.met[id] || bond(id) !== 0 || FQ[id]);
    const comp = compId(); const elig = Object.keys(COMP).filter((id) => bond(id) >= 2);
    return `<h2>${L("Vínculos", "Bonds")}</h2>
      <p class="lead">${L("Habla con la gente en los lugares donde vive (botón «Hablar» en la pestaña Lugar). Con vínculo +2 se abre su misión de amistad; algunos también pueden pelear a tu lado.", "Talk to people where they live. At bond +2 their friendship quest opens.")}</p>
      <h3 class="sub">🤝 ${L("Compañero de combate", "Combat companion")}</h3>
      ${elig.length ? `<div class="chips">${elig.map((id) => `<button type="button" class="chip ${comp === id ? "on" : ""}" data-comp="${comp === id ? "" : id}">${comp === id ? "✔ " : ""}${esc(NPC[id].n.split(" ")[0])}</button>`).join("")}</div>${comp ? `<p class="note">${esc(NPC[comp].n)}: ${esc(COMP[comp].d)} ${L("Los enemigos tienen algo más de vida cuando vas acompañado.", "Enemies have a bit more HP when you have a companion.")}</p>` : `<p class="note">${L("Elige a quién llevar contigo.", "Pick someone to bring.")}</p>`}` : `<p class="note">${L("Consigue vínculo +2 con Thorne, Garrok, Darius, Seraphina, Pip, Brisa o Nyx para que peleen contigo.", "Reach bond +2 with a student to bring them along.")}</p>`}
      <h3 class="sub">👥 ${L("Personas", "People")}</h3>
      <div class="bgrid">${ids.map((id) => { const b = bond(id); const q = w.fq[id]; const f = FQ[id]; const can = f && b >= 2 && !q && (!f.from || cap() >= f.from);
        return `<div class="bcard">${window.SA_SCENE.face(id)}<div><b>${esc(NPC[id].n)}</b><small>${esc(NPC[id].t || "")}${where(id) ? ` · 📍 ${esc(where(id))}` : ""}</small>
          <span class="bbar">${[-3, -2, -1, 0, 1, 2, 3].map((v) => `<i class="${v === 0 ? "z" : v <= b && v > 0 ? "p" : v >= b && v < 0 ? "n" : ""}"></i>`).join("")}</span>
          ${f ? `<small>💛 ${esc(f.t)}: ${q?.done ? L("completada ✔", "done ✔") : q ? L("en curso", "in progress") : b >= 2 ? "" : L("se abre con vínculo +2", "opens at bond +2")}</small>` : ""}
          ${can ? `<button type="button" class="btn small primary" data-fqs="${id}">💛 ${L("Empezar", "Start")}</button>` : ""}${G.g.flags[`romance_${id}`] ? `<small>❤️ ${L("Pareja", "Partner")}</small>` : ""}</div></div>`; }).join("")}</div>
      ${journal()}${achBox()}`;
  }
  const _gv = gameView;
  gameView = function () {
    if (!G) return _gv();
    let out;
    if (gtab === "vinculos" && !G.g.combat) { gtab = "grupo"; out = _gv(); gtab = "vinculos"; out = out.replace(/<button type="button" data-gtab="grupo" class="on">/, '<button type="button" data-gtab="grupo" class="">').replace('<button type="button" data-gtab="vinculos" class="">', '<button type="button" data-gtab="vinculos" class="on">'); out = out.replace(/<section class="panel">[\s\S]*<\/section>\s*$/, `<section class="panel">${bondsView()}</section>`); }
    else out = _gv();
    if (!G.g.combat) { const id = fqActive(); if (id) out = out.replace('<section class="panel">', fqRow(id) + '<section class="panel">'); }
    else out = out.replace(/(<div class="me2[^"]*">)/, `${raidAllies()}$1${compBadge()}`);
    return out;
  };
  const _pv = placeView;
  placeView = function () { const out = _pv(); const extra = raidBox() + peopleBox(); return extra ? out.replace(/(<div class="scene"[\s\S]*?<\/div><\/div>)/, `$1${extra}`) : out; };

  // ---------- clics ----------
  document.addEventListener("click", (ev) => {
    if (view.name !== "game" || !G) return;
    const t = ev.target.closest("button"); if (!t) return; const d = t.dataset;
    if (d.talk) { ev.stopPropagation(); return talk(d.talk); }
    if (d.svc) { ev.stopPropagation(); const [a, b] = d.svc.split(":"); return service(a, b); }
    if (d.fqs) { ev.stopPropagation(); return fqStart(d.fqs); }
    if (d.fq) { ev.stopPropagation(); return fqPlay(d.fq); }
    if (d.fqf) { ev.stopPropagation(); return fqFight(d.fqf); }
    if (d.comp != null) { ev.stopPropagation(); W().comp = d.comp || null; persist(); return render(); }
    if (d.title != null) { ev.stopPropagation(); W().title = d.title || null; persist(); return render(); }
    if (d.raid) { ev.stopPropagation(); return raidJoin(d.raid); }
    if (d.raidnew) { ev.stopPropagation(); return raidCreate(d.raidnew); }
  }, true);

  // ---------- enganche con el dibujado ----------
  const _render = render;
  render = function () {
    try { if (G && view.name === "game") { W(); fqSync(); raidClaims(); } } catch (e) { console.warn("mundo:", e); }
    const r = _render.apply(this, arguments);
    try { if (G && view.name === "game") { raidSync(); checkAch(); notify(); } musSet(); musButton(); } catch (e) { console.warn("mundo:", e); }
    return r;
  };

  const css = `
.ppl .pplrow{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
.pplc{display:flex;gap:10px;align-items:center;background:#0b131c88;border:1px solid var(--line);border-radius:8px;padding:8px 10px;min-width:240px;flex:1}
.pplc>div{display:flex;flex-direction:column;gap:3px}.pplc small{color:var(--ink-2);font-size:12.5px}
.pplc .row{gap:6px;margin-top:2px}
.qtrack.fq{border-color:#f08ad066;background:linear-gradient(90deg,#f08ad018,#0b131c00 70%),var(--panel-2)}
.bgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.bcard{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:8px;padding:10px;background:var(--panel-2)}
.bcard>div{display:flex;flex-direction:column;gap:4px}.bcard small{color:var(--ink-2);font-size:12.5px}
.bbar{display:flex;gap:3px}.bbar i{width:16px;height:6px;border-radius:2px;background:#1b2635}.bbar i.z{background:#3a4a5e}.bbar i.p{background:#8be0a8}.bbar i.n{background:#e0584a}
.chip.on{border-color:#8be0a8;color:#8be0a8}
.achs{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin:8px 0}
.ach{text-align:left;border:1px solid var(--line);border-radius:6px;background:var(--panel-2);color:var(--ink);padding:8px 10px;display:flex;flex-direction:column;gap:2px;font-family:var(--body);cursor:pointer}
.ach:disabled{opacity:.45;cursor:default}.ach.on{border-color:#d9a44188}.ach.sel{box-shadow:0 0 0 2px #d9a441}.ach small{color:var(--ink-2)}
.ttl{font-style:italic;color:#d9a441;font-size:12.5px;margin-left:6px}
.jl{margin:6px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:6px}
.raidbox .raidr{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:8px;margin-top:8px}
.raidbox .raidr>div{display:flex;flex-direction:column;gap:3px;flex:1;min-width:200px}.raidbox small{color:var(--ink-2)}
.compb{display:flex;flex-direction:column;align-items:center;gap:2px;margin-right:6px}.compb small{font-size:11px;color:var(--ink-2)}.compb .npcface{width:52px;height:52px}
.raidallies{width:100%;font-size:12.5px;color:#8be0a8;font-family:var(--display);letter-spacing:.04em;margin-bottom:4px}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
