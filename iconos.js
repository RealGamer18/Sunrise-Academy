// ===================== ICONOS PERSONALIZADOS (hojas 1–3) =====================
// Carga al final (después de ui.js). Cambia los emojis por los iconos de la carpeta iconos/.
// Si una imagen no carga, vuelve a salir el emoji de antes.
(function () {
  if (typeof gameView !== "function") return;
  const V = "?v=2";
  const EMO = {}; // ruta -> emoji de respaldo
  function img(path, fb, cls) {
    if (fb) EMO[path] = fb;
    return `<img class="sai ${cls || ""}" src="iconos/${path}.png${V}" alt="${fb || ""}" draggable="false" data-fb="${fb || ""}">`;
  }
  // Si falta un archivo, se cambia por su emoji.
  document.addEventListener("error", (ev) => { const t = ev.target; if (t && t.classList && t.classList.contains("sai")) { t.replaceWith(document.createTextNode(t.dataset.fb || "")); } }, true);

  const TAB = { lugar: "lugar", mapa: "mapa", historia: "historia", heroe: "personaje", magia: "magia", dioses: "dioses", bolsa: "bolsa", escalera: "escalera", vinculos: "vinculos", grupo: "grupo" };
  const AFF = { Fuego: "fuego", Agua: "agua", Tierra: "tierra", Aire: "aire", Rayo: "rayo", Luz: "luz", Sombra: "sombra", Gravedad: "gravedad", Tiempo: "tiempo", Espacio: "espacio", "Creación": "creacion", Realidad: "realidad", Destino: "destino", Alma: "alma" };
  const WX = { Despejado: "despejado", Lluvia: "lluvia", "Nieve o granizo": "nieve", Niebla: "niebla", Tormenta: "tormenta", "Ola de calor": "calor" };
  const ST = { Quemado: "quemado", Aturdido: "aturdido", Cegado: "cegado", Asustado: "asustado" };
  const PL = { pueblo: "pueblo", academia: "academia", ciudad: "ciudad", zona: "caza", mina: "mina", mazmorra: "mazmorra", jefe: "guarida", guardian: "guardian", arena: "arena", santuario: "santuario", tienda: "tienda", puerto: "puerto", templo: "templo", cumbre: "cumbre" };
  const NODE = { centro: "centro", hechizo: "hechizo", pasiva: "pasiva", mejora: "mejora", puerta: "puerta", maestro: "maestro" };
  const OBJ = {"Contrabando": "contrabando", "Flor de hada": "flor-de-hada", "Fragmento de trueno": "fragmento-de-trueno", "Setas doradas": "setas-doradas", "Núcleo de evolución": "nucleo-de-evolucion", "Polvo de luna": "polvo-de-luna", "Caramelo embrujado": "caramelo-embrujado", "Copo de nieve": "copo-de-nieve", "Pétalo del Alba": "petalo-del-alba", "Pez dorado": "pez-dorado", "Bota vieja": "bota-vieja", "Alga": "alga", "Piedra común": "piedra-comun", "Obsidiana": "obsidiana", "Cristal de hielo": "cristal-de-hielo", "Poción de vida": "pocion-de-vida", "Poción mayor de vida": "pocion-mayor-de-vida", "Poción de maná": "pocion-de-mana", "Tónico de energía": "tonico-de-energia", "Pergamino de Reasignación": "pergamino-de-reasignacion", "Antídoto": "antidoto", "Elixir de fuerza": "elixir-de-fuerza", "Elixir de piedra": "elixir-de-piedra", "Bomba de humo": "bomba-de-humo", "Elixir de dragón": "elixir-de-dragon", "Pan dorado": "pan-dorado", "Estofado del cazador": "estofado-del-cazador", "Sopa de la abuela Mira": "sopa-de-la-abuela-mira", "Pastel solar": "pastel-solar", "Brocheta picante": "brocheta-picante", "Té de las estrellas": "te-de-las-estrellas", "Aceite de fuego": "aceite-de-fuego", "Aceite de escarcha": "aceite-de-escarcha", "Aceite de luz": "aceite-de-luz", "Aceite de sombra": "aceite-de-sombra", "Cristal de Olvido": "cristal-de-olvido", "Paquete de entrega": "paquete-de-entrega", "Esencia de temple": "esencia-de-temple", "Esencia de roca": "esencia-de-roca", "Esencia veloz": "esencia-veloz", "Esencia de bravura": "esencia-de-bravura", "Esencia de visión": "esencia-de-vision", "Esencia de encanto": "esencia-de-encanto", "Esencia de fortuna": "esencia-de-fortuna", "Esencia de enigma": "esencia-de-enigma", "Té de loto lunar": "te-de-loto-lunar", "Pluma de grifo": "pluma-de-grifo", "Escama de tortuga ancestral": "escama-de-tortuga-ancestral", "Perfume de sirena": "perfume-de-sirena", "Corazón de trol": "corazon-de-trol", "Trébol de siete hojas": "trebol-de-siete-hojas", "Cristal de potencial": "cristal-de-potencial", "Cristal de luz": "cristal-de-luz", "Hierba del alba": "hierba-del-alba", "Rocío del amanecer": "rocio-del-amanecer", "Perlas de río": "perlas-de-rio", "Agua bendita": "agua-bendita", "Seda de araña": "seda-de-arana", "Savia cargada": "savia-cargada", "Trigo dorado": "trigo-dorado", "Grano solar": "grano-solar", "Perla eléctrica": "perla-electrica", "Coral azul": "coral-azul", "Oro pirata": "oro-pirata", "Escama de trueno": "escama-de-trueno", "Perla de mar": "perla-de-mar", "Sal de viento": "sal-de-viento", "Mineral de plata": "mineral-de-plata", "Cristal eterno": "cristal-eterno", "Flor de escarcha": "flor-de-escarcha", "Piel de yeti": "piel-de-yeti", "Piedra de cumbre": "piedra-de-cumbre", "Rubí en bruto": "rubi-en-bruto", "Carbón ardiente": "carbon-ardiente", "Sal de fuego": "sal-de-fuego", "Arena de vidrio": "arena-de-vidrio", "Escama de dragón": "escama-de-dragon", "Flor nocturna": "flor-nocturna", "Pétalo de luna": "petalo-de-luna", "Rosa carmesí": "rosa-carmesi", "Fragmento maldito": "fragmento-maldito", "Fragmento de tiempo": "fragmento-de-tiempo", "Polvo de estrella": "polvo-de-estrella", "Carne de caza": "carne-de-caza", "Pescado fresco": "pescado-fresco", "Mapa del tesoro": "mapa-del-tesoro", "Mapas del mar": "mapas-del-mar", "Brújula maldita": "brujula-maldita", "Llave maestra": "llave-maestra", "Trébol de cuatro hojas": "trebol-de-cuatro-hojas", "Esencia abstracta": "esencia-abstracta", "Pergamino del sabio": "piedra-del-sabio"};
  const WPN = {"Bastón de loto": "baston-de-loto", "Tridente de rayo": "tridente-de-rayo", "Lanza de escarcha": "lanza-de-escarcha", "Arco del archivo": "arco-del-archivo", "Hoz de calabaza": "hoz-de-calabaza", "Bastón de caramelo": "baston-de-caramelo", "Lanza del amanecer": "lanza-del-amanecer", "Puños": "punos", "Hacha pesada": "hacha-pesada", "Espada de fuego": "espada-de-fuego", "Arco de rayo": "arco-de-rayo", "Báculo de luz": "baculo-de-luz", "Guadaña de sombra": "guadana-de-sombra", "Kunais de rayo": "kunais-de-rayo", "Mandoble de escarcha": "mandoble-de-escarcha", "Martillo de roca": "martillo-de-roca", "Abanico del vendaval": "abanico-del-vendaval", "Katana de luz": "katana-de-luz", "Espada": "espada", "Lanza": "lanza", "Arco": "arco", "Daga": "daga", "Bastón": "baston", "Mandoble": "mandoble", "Guadaña": "guadana", "Kunais": "kunais", "Shurikens": "shurikens", "Katana": "katana", "Hacha": "hacha", "Martillo de guerra": "martillo-de-guerra", "Maza": "maza", "Estoque": "estoque", "Dagas gemelas": "dagas-gemelas", "Nunchakus": "nunchakus", "Alabarda": "alabarda", "Ballesta": "ballesta", "Látigo": "latigo", "Espada y escudo": "espada-y-escudo", "Guanteletes": "guanteletes", "Tridente": "tridente", "Kusarigama": "kusarigama", "Hoz": "hoz", "Abanico de guerra": "abanico-de-guerra", "Bumerán": "bumeran", "Honda": "honda", "Cimitarra": "cimitarra", "Hacha doble": "hacha-doble", "Espada de aprendiz": "espada-de-aprendiz", "Arco de tejo": "arco-de-tejo", "Daga del alba": "daga-del-alba", "Bastón del faro": "baston-del-faro", "Lanza de patrulla": "lanza-de-patrulla", "Arco élfico": "arco-elfico", "Cerbatana de espinas": "cerbatana-de-espinas", "Espada de hoja viva": "espada-de-hoja-viva", "Látigo de liana": "latigo-de-liana", "Hacha de bronce": "hacha-de-bronce", "Lanza de la caravana": "lanza-de-la-caravana", "Cimitarra del mercado": "cimitarra-del-mercado", "Mangual de torneo": "mangual-de-torneo", "Guantes de campeón": "guantes-de-campeon", "Boleadoras": "boleadoras", "Sable pirata": "sable-pirata", "Arpón de coral": "arpon-de-coral", "Ancla de guerra": "ancla-de-guerra", "Trabuco de sal": "trabuco-de-sal", "Hacha rúnica enana": "hacha-runica-enana", "Martillo enano": "martillo-enano", "Pico de mithril": "pico-de-mithril", "Espada de plata": "espada-de-plata", "Arco de la cumbre": "arco-de-la-cumbre", "Espada de magma": "espada-de-magma", "Hacha de obsidiana": "hacha-de-obsidiana", "Guanteletes de brasa": "guanteletes-de-brasa", "Látigo ígneo": "latigo-igneo", "Mandoble de la forja": "mandoble-de-la-forja", "Dagas de la ciénaga": "dagas-de-la-cienaga", "Guadaña del velo": "guadana-del-velo", "Bastón maldito": "baston-maldito", "Estoque carmesí": "estoque-carmesi", "Espada real": "espada-real", "Alabarda de la guardia": "alabarda-de-la-guardia", "Ballesta de gremio": "ballesta-de-gremio", "Kusarigama de acero azul": "kusarigama-de-acero-azul", "Katana del amanecer": "katana-del-amanecer", "Filo estelar": "filo-estelar", "Martillo del tiempo": "martillo-del-tiempo", "Arco del vacío": "arco-del-vacio", "Farol del espectro": "farol-del-espectro", "Maza de basalto": "maza-de-basalto", "Aguijón de la reina": "aguijon-de-la-reina", "Colmillo de sombra": "colmillo-de-sombra", "Garras del gato": "garras-del-gato", "Hacha del Minotauro": "hacha-del-minotauro", "Sable de la capitana": "sable-de-la-capitana", "Lanza del trueno": "lanza-del-trueno", "Colmillo del Wyrm": "colmillo-del-wyrm", "Arco del búho": "arco-del-buho", "Garrote del Rey Trol": "garrote-del-rey-trol", "Espada de Pyrax": "espada-de-pyrax", "Abanico del salón": "abanico-del-salon", "Hoja del abismo": "hoja-del-abismo", "Báculo del enigma": "baculo-del-enigma", "Cetro roído": "cetro-roido", "Agujas del Relojero": "agujas-del-relojero", "Filo de la Creación": "filo-de-la-creacion", "Daga del culto": "daga-del-culto", "Espada del capitán": "espada-del-capitan", "Báculo de la marea": "baculo-de-la-marea", "Media luna de Ilvara": "media-luna-de-ilvara", "Velo de Nyssa": "velo-de-nyssa", "Ancla de Orvath": "ancla-de-orvath", "Martillo de Ignar": "martillo-de-ignar", "Espejo de Mirael": "espejo-de-mirael", "Lanza del Heraldo": "lanza-del-heraldo", "Colmillo de Vaelmor": "colmillo-de-vaelmor", "Espada del Campeón": "espada-del-campeon", "Llave del Umbral": "llave-del-umbral", "Hoja de la Cumbre": "hoja-de-la-cumbre", "Sol naciente": "sol-naciente", "Cuchillo de Mira": "cuchillo-de-mira", "Arco de Verdemar": "arco-de-verdemar", "Puños de Bako": "punos-de-bako", "Garfio de Varo": "garfio-de-varo", "Hacha rúnica de Durgan": "hacha-runica-de-durgan", "Martillo de Ignara": "martillo-de-ignara", "Espada dracónica": "espada-draconica", "Varita maldita": "varita-maldita", "Estoque del gremio": "estoque-del-gremio"};
  const EQ = {"Lágrima de estrella": "lagrima-de-estrella", "Capucha de cuero": "capucha-de-cuero", "Casco de hojas": "casco-de-hojas", "Yelmo de bronce": "yelmo-de-bronce", "Tricornio de coral": "tricornio-de-coral", "Yelmo enano": "yelmo-enano", "Casco de obsidiana": "casco-de-obsidiana", "Capucha del velo": "capucha-del-velo", "Yelmo real": "yelmo-real", "Diadema estelar": "diadema-estelar", "Hombreras de cuero": "hombreras-de-cuero", "Hombreras de corteza": "hombreras-de-corteza", "Hombreras de bronce": "hombreras-de-bronce", "Hombreras de caparazón": "hombreras-de-caparazon", "Hombreras de mithril": "hombreras-de-mithril", "Hombreras de magma": "hombreras-de-magma", "Hombreras de sombra": "hombreras-de-sombra", "Hombreras reales": "hombreras-reales", "Hombreras del cometa": "hombreras-del-cometa", "Túnica acolchada": "tunica-acolchada", "Cuero de lobo": "cuero-de-lobo", "Cota de mallas": "cota-de-mallas", "Coraza de coral": "coraza-de-coral", "Armadura enana": "armadura-enana", "Placas de obsidiana": "placas-de-obsidiana", "Coraza del pantano": "coraza-del-pantano", "Armadura real": "armadura-real", "Armadura estelar": "armadura-estelar", "Guantes de cuero": "guantes-de-cuero", "Guantes de enredadera": "guantes-de-enredadera", "Guanteletes de bronce": "guanteletes-de-bronce", "Guantes de pescador": "guantes-de-pescador", "Guanteletes enanos": "guanteletes-enanos", "Guanteletes de ceniza": "guanteletes-de-ceniza", "Guantes del velo": "guantes-del-velo", "Guanteletes reales": "guanteletes-reales", "Guantes astrales": "guantes-astrales", "Botas de viaje": "botas-de-viaje", "Botas del bosque": "botas-del-bosque", "Grebas de bronce": "grebas-de-bronce", "Botas de marinero": "botas-de-marinero", "Botas de nieve": "botas-de-nieve", "Grebas de obsidiana": "grebas-de-obsidiana", "Botas de ciénaga": "botas-de-cienaga", "Grebas reales": "grebas-reales", "Botas de nube": "botas-de-nube", "Capa de lana": "capa-de-lana", "Capa de hojas": "capa-de-hojas", "Capa del mercader": "capa-del-mercader", "Capa de vela": "capa-de-vela", "Capa de piel de yeti": "capa-de-piel-de-yeti", "Capa de ceniza": "capa-de-ceniza", "Manto del velo": "manto-del-velo", "Capa real": "capa-real", "Capa de las estrellas": "capa-de-las-estrellas", "Colgante de madera": "colgante-de-madera", "Amuleto del viento": "amuleto-del-viento", "Colgante de la suerte": "colgante-de-la-suerte", "Collar de conchas": "collar-de-conchas", "Colgante de plata": "colgante-de-plata", "Collar de rubíes": "collar-de-rubies", "Gargantilla maldita": "gargantilla-maldita", "Collar del gremio": "collar-del-gremio", "Collar de constelaciones": "collar-de-constelaciones", "Anillo de cobre": "anillo-de-cobre", "Anillo de raíz": "anillo-de-raiz", "Anillo de bronce": "anillo-de-bronce", "Anillo de coral": "anillo-de-coral", "Anillo rúnico": "anillo-runico", "Anillo de rubí": "anillo-de-rubi", "Anillo de sombra": "anillo-de-sombra", "Anillo del rey": "anillo-del-rey", "Anillo del cometa": "anillo-del-cometa", "Pata de conejo": "pata-de-conejo", "Bellota tallada": "bellota-tallada", "Dado de la fortuna": "dado-de-la-fortuna", "Perla de marea": "perla-de-marea", "Runa de escarcha": "runa-de-escarcha", "Brasa eterna": "brasa-eterna", "Ojo del velo": "ojo-del-velo", "Sello del gremio": "sello-del-gremio", "Fragmento de estrella": "fragmento-de-estrella", "Escudo de madera": "escudo-de-madera", "Escudo de corteza": "escudo-de-corteza", "Escudo de bronce": "escudo-de-bronce", "Escudo de caparazón": "escudo-de-caparazon", "Escudo enano": "escudo-enano", "Escudo de obsidiana": "escudo-de-obsidiana", "Escudo del velo": "escudo-del-velo", "Escudo real": "escudo-real", "Égida estelar": "egida-estelar", "Amuleto del alba": "amuleto-del-alba", "Anillo de Valcor": "anillo-de-valcor", "Brazalete de brasa": "brazalete-de-brasa", "Escamas de dragón": "escamas-de-dragon", "Corazón de dragón": "corazon-de-dragon", "Yelmo del Minotauro": "yelmo-del-minotauro", "Capa de la Capitana": "capa-de-la-capitana", "Botas del Viento Norte": "botas-del-viento-norte", "Hombreras del Rey Trol": "hombreras-del-rey-trol", "Escudo del Gólem": "escudo-del-golem", "Anillo de la Esfinge": "anillo-de-la-esfinge", "Colgante de la Reina Araña": "colgante-de-la-reina-arana", "Guanteletes de Pyrax": "guanteletes-de-pyrax", "Coraza del Titán": "coraza-del-titan", "Armadura del Umbral": "armadura-del-umbral", "Corona del Relojero": "corona-del-relojero", "Égida del Amanecer": "egida-del-amanecer"};
  const PET = {"Cría de grifo": "cria-de-grifo", "Lobito de medianoche": "lobito-de-medianoche", "Chispita de tormenta": "chispita-de-tormenta", "Fantasmita": "fantasmita", "Escarabajo dorado": "escarabajo-dorado", "Gato de calabaza": "gato-de-calabaza", "Renito de escarcha": "renito-de-escarcha", "Zorro de luz": "zorro-de-luz", "Conejo del alba": "conejo-del-alba", "Pollito solar": "pollito-solar", "Tortuguita de río": "tortuguita-de-rio", "Ardilla de Copaalta": "ardilla-de-copaalta", "Cervatillo del bosque": "cervatillo-del-bosque", "Gato de la suerte": "gato-de-la-suerte", "Perro pastor": "perro-pastor", "Tejón de Trigalia": "tejon-de-trigalia", "Nutria del puerto": "nutria-del-puerto", "Loro pirata": "loro-pirata", "Pulpito de coral": "pulpito-de-coral", "Cabrito de las nubes": "cabrito-de-las-nubes", "Pingüino de escarcha": "pinguino-de-escarcha", "Salamandra de forja": "salamandra-de-forja", "Escarabajo de brasa": "escarabajo-de-brasa", "Dragoncito de ceniza": "dragoncito-de-ceniza", "Murciélago del velo": "murcielago-del-velo", "Polilla lunar": "polilla-lunar", "Gato de sombra": "gato-de-sombra", "Búho mensajero": "buho-mensajero", "Cachorro de león real": "cachorro-de-leon-real", "Hada de bolsillo": "hada-de-bolsillo", "Dragoncito de tormenta": "dragoncito-de-tormenta", "Tigre de las islas": "tigre-de-las-islas", "Gólem de bolsillo": "golem-de-bolsillo", "Fénix bebé": "fenix-bebe", "Unicornio pequeño": "unicornio-pequeno", "Golosina para mascotas": "golosina-para-mascotas", "Lobezno": "lobezno", "Lobezno de las nieves": "lobezno-de-las-nieves", "Arañita tejedora": "aranita-tejedora", "Cangrejito de roca": "cangrejito-de-roca", "Sapito saltarín": "sapito-saltarin", "Murcielaguito de cuarzo": "murcielaguito-de-cuarzo", "Salamandrita": "salamandrita", "Yeti bebé": "yeti-bebe", "Draco bebé": "draco-bebe", "Poni del Alba": "poni-del-alba", "Ciervo plateado": "ciervo-plateado", "Caballo de Trigalia": "caballo-de-trigalia", "Grifo joven": "grifo-joven", "Caballito de mar gigante": "caballito-de-mar-gigante", "Cabra de las cumbres": "cabra-de-las-cumbres", "Lagarto de lava": "lagarto-de-lava", "Lobo de sombra": "lobo-de-sombra", "Corcel real": "corcel-real", "Pegaso del Umbral": "pegaso-del-umbral"};
  const petEmo = (n) => window.SA_EXTRA?.PETS?.[n]?.i || window.SA_EXTRA?.MOUNTS?.[n]?.i || "🐾";
  const PET_RE = new RegExp("([^\\s>]+) (" + Object.keys(PET).sort((x, y) => y.length - x.length).join("|") + ")(?=[\\s<(])", "g");
  const fbOf = (e) => (String(e || "").startsWith("<img") ? (String(e).match(/data-fb="([^"]*)"/) || [])[1] || "" : e);
  const objOf = (n) => { n = String(n || "").replace(/&amp;/g, "&").replace(/ \+\d+$/, "").replace(/ ★{1,3} \S+$/, "").trim(); return PET[n] ? "pet/" + PET[n] : WPN[n] ? "arma/" + WPN[n] : EQ[n] ? "eq/" + EQ[n] : OBJ[n] ? "obj/" + OBJ[n] : /^Paquete/.test(n) ? "obj/paquete-de-entrega" : null; };
  const oimg = (n, e) => { const f = objOf(n); return f ? img(f, e) : null; };
  const QT = { caza: "caza", recolectar: "recolectar", entrega: "entrega", escolta: "escolta", buscado: "buscado" };

  const SAI = (window.SAI = {
    img,
    tab: (k, fb) => (TAB[k] ? img("tab/" + TAB[k], fb) : null),
    aff: (a, fb) => (AFF[a] ? img("af/" + AFF[a], fb) : null),
    wx: (w, fb) => (WX[w] ? img("wx/" + WX[w], fb) : null),
    st: (s, fb) => (ST[s] ? img("st/" + ST[s], fb) : null),
    stat: (s, fb) => img("stat/" + s, fb),
    obj: (n, fb) => oimg(n, fb),
    pet: (n) => (PET[n] ? img("pet/" + PET[n], petEmo(n), "pet") : null),
    src: (path) => `iconos/${path}.png${V}`,
    path: (n) => objOf(n),
    names: () => [...Object.keys(OBJ), ...Object.keys(WPN), ...Object.keys(EQ), ...Object.keys(PET)],
  });

  // --- Tipos de lugar: el icono sale en títulos, listas y chinchetas del mapa ---
  const PL_EMO = {};
  if (typeof T === "object") for (const k in T) if (PL[k]) { PL_EMO[k] = T[k].icon; T[k].icon = img("pl/" + PL[k], T[k].icon); }

  // --- Ranuras de equipo (Bolsa, armerías, detalle) ---
  const SLOT_FILE = { cabeza: "cabeza", hombros: "hombros", pecho: "pecho", manos: "manos", pies: "pies", capa: "capa", cuello: "cuello", anillo: "amuleto", amuleto: "colgante", escudo: "escudo" };
  function patchSlots() {
    const S = window.SA_EXTRA?.SLOT_IC; if (!S || S.__sai) return;
    for (const k in SLOT_FILE) if (S[k]) S[k] = img("slot/" + SLOT_FILE[k], S[k]);
    Object.defineProperty(S, "__sai", { value: true });
  }
  patchSlots();

  // --- Tipos de misión (tablón) ---
  if (typeof window.SA_QINFO === "function") {
    const _qi = window.SA_QINFO;
    window.SA_QINFO = function (q) { const r = _qi(q); const k = QT[q.type || "caza"]; if (r && k) r.i = img("q/" + k, r.i); return r; };
  }

  // --- Pasar un <img> dentro de un <text> de SVG a <image> ---
  const svgImg = (src, x, y, s, cls) => `<image class="${cls || ""}" href="${src}" x="${(x - s / 2).toFixed(1)}" y="${(y - s / 2).toFixed(1)}" width="${s}" height="${s}"></image>`;

  function post(out) {
    // Pestañas
    out = out.replace(/(data-gtab="(\w+)"[^>]*>)<i class="tic">([^<]*)<\/i>/g, (m, a, k, e) => (TAB[k] ? `${a}<i class="tic">${img("tab/" + TAB[k], e)}</i>` : m));
    // HUD
    out = out.replace("<em>❤️</em>", `<em>${img("stat/pv", "❤️")}</em>`).replace("<em>💧</em>", `<em>${img("stat/mana", "💧")}</em>`).replace("<em>⚡</em>", `<em>${img("stat/energia", "⚡")}</em>`).replace("<em>😰</em>", `<em>${img("stat/estres", "😰")}</em>`).replace("<em>☀</em>", `<em>${img("stat/soles", "☀")}</em>`);
    // Muñeco: arma, mascota, montura y estadísticas
    out = out.replace(/(data-uislot="arma"[^>]*><span class="usi">)[^<]*(<\/span>)/, `$1${oimg(G.g.arma?.n, "🗡️") || img("slot/arma", "🗡️")}$2`);
    out = out.replace(/(data-uislot="mascota"[^>]*>)<i class="ghost">[^<]*<\/i>/, `$1<i class="ghost">${img("slot/mascota", "🐾")}</i>`);
    out = out.replace(/(data-uislot="montura"[^>]*>)<i class="ghost">[^<]*<\/i>/, `$1<i class="ghost">${img("slot/montura", "🐎")}</i>`);
    const DS = { "DAÑO": "dano", DAMAGE: "dano", DEFENSA: "defensa", DEFENSE: "defensa", PV: "pv", HP: "pv", INICIATIVA: "iniciativa", INIT: "iniciativa", XP: "xp" };
    out = out.replace(/(<div class="dstats">)([\s\S]*?)(<\/div><\/div>|<\/div>\s*<div class="dbot">)/, (m, a, body, c) => a + body.replace(/<div><small>([A-ZÑ]+)<\/small>/g, (mm, k) => (DS[k] ? `<div>${img("stat/" + DS[k], "", "ds")}<small>${k}</small>` : mm)) + c);
    // Combate: acciones
    out = out.replace("<b>⚔️ Atacar</b>", `<b>${img("act/atacar", "⚔️")} Atacar</b>`).replace("<b>✨ Magia</b>", `<b>${img("act/magia", "✨")} Magia</b>`).replace("<b>🎒 Objetos</b>", `<b>${img("act/objetos", "🎒")} Objetos</b>`).replace("<b>🛡️ Defender</b>", `<b>${img("act/defender", "🛡️")} Defender</b>`).replace("<b>🏃 Huir</b>", `<b>${img("act/huir", "🏃")} Huir</b>`);
    // Combate: estados, hechizos y afinidad del enemigo
    out = out.replace(/(<span class="stc"[^>]*>)(\S+) (Quemado|Aturdido|Cegado|Asustado)\b/g, (m, a, e, s) => `${a}${img("st/" + ST[s], e)} ${s}`);
    out = out.replace(/(data-bcast="([^"|]+)\|[^"]*"[^>]*><b>)(\S+) /g, (m, a, af, e) => (AFF[af] ? `${a}${img("af/" + AFF[af], e)} ` : m));
    out = out.replace(/<span class="aff">(\S+) ([^<]+)<\/span>/g, (m, e, af) => (AFF[af.trim()] ? `<span class="aff">${img("af/" + AFF[af.trim()], e)} ${af}</span>` : m));
    // Magia: grupos de hechizos y chips de afinidad
    out = out.replace(/<span class="spic">([^<]*)<\/span><b>([^<]+)<\/b>/g, (m, e, af) => (AFF[af] ? `<span class="spic">${img("af/" + AFF[af], e)}</span><b>${af}</b>` : m));
    out = out.replace(/(data-g="taff:([^"]+)"[^>]*>)([^<\s]*) /g, (m, a, af, e) => (AFF[af] ? `${a}${img("af/" + AFF[af], e)} ` : m));
    // Objetos: Bolsa (cuadrícula y detalle), Tienda, Taller y Objetos en combate
    out = out.replace(/(data-uiitem="([^"]+)"[^>]*><span>)((?:<img[^>]*>)|[^<]*)(<\/span>)/g, (m, a, n, e, c) => { const i = oimg(n, fbOf(e)); return i ? a + i + c : m; });
    out = out.replace(/(<span class="bdi[^"]*">)((?:<img[^>]*>)|[^<]*)(<\/span><div><b>)([^<]+?)( <small>|<\/b>)/g, (m, a, e, c, n, d) => { const i = oimg(n, fbOf(e)); return i ? a + i + c + n + d : m; });
    out = out.replace(/(<div class="shi">)([^<]*)(<\/div>\s*<div class="shb"><b>)([^<]+)(<\/b>)/g, (m, a, e, c, n, d) => { const i = oimg(n, e); return i ? a + i + c + n + d : m; });
    out = out.replace(/(<div class="rec-ic">)([^<]*)(<\/div><div class="rec-b"><b>)([^<]+?)( ×\d+)?(<\/b>)/g, (m, a, e, c, n, q, d) => { const i = oimg(n, e); return i ? a + i + c + n + (q || "") + d : m; });
    out = out.replace(/(data-use="([^"]+)"[^>]*><b>)(\S+) /g, (m, a, n, e) => { const i = oimg(n, e); return i ? a + i + " " : m; });
    // Armaduras y accesorios: ranuras del muñeco, listas, tienda de armaduras
    out = out.replace(/(data-uislot="\w+" title="([^"]+)"><span class="usi">)(<img[^>]*>)(<\/span>)/g, (m, a, n, e, c) => { const i = EQ[n] ? oimg(n, fbOf(e)) : null; return i ? a + i + c : m; });
    out = out.replace(/(<img class="sai [^"]*" src="iconos\/slot\/[^"]+"[^>]*>) ([^<]+?)(?= <)/g, (m, e, n) => { const i = EQ[n.trim()] ? oimg(n.trim(), fbOf(e)) : null; return i ? i + " " + n : m; });
    out = out.replace(/(<div class="wic">)(<img[^>]*>|[^<]*)(<\/div><div class="wb"><b>)([^<]+)(<\/b>)/g, (m, a, e, c, n, d) => { const i = oimg(n, fbOf(e)); return i ? a + i + c + n + d : m; });
    // Mascotas y monturas: chips, establo, mini ranura
    out = out.replace(/(data-uislot="(?:mascota|montura)"[^>]*title="([^"]+)"[^>]*>)([^<]+)(<b class="plvm"|<\/button>)/g, (m, a, n, e, c) => (PET[n] ? a + img("pet/" + PET[n], e, "pet") + c : m));
    out = out.replace(PET_RE, (m, e, n) => (e === petEmo(n) ? img("pet/" + PET[n], e, "pet") + " " + n : m));
    // Armas en listas (armerías, cambiar arma, arsenal)
    out = out.replace(/(🗡️|✨) ([^<]+?)(?= <|<)/g, (m, e, n) => { const f = objOf(n); return f && f.startsWith("arma/") ? img(f, e) + " " + n : m; });
    // Árbol de magia (hexágonos + detalle)
    const SYM = { "◉": "centro", "✦": "hechizo", "◆": "pasiva", "▲": "mejora", "⬡": "puerta", "★": "maestro" };
    out = out.replace(/<text x="([\d.-]+)" y="([\d.-]+)" class="ic">([^<]*)<\/text>/g, (m, x, y, s) => (SYM[s] ? svgImg(SAI.src("tree/" + SYM[s]), +x, +y - 3, 17, "ic hxi") : m));
    out = out.replace(/<h3>(◉|✦|◆|▲|⬡|★) /, (m, s) => `<h3>${img("tree/" + SYM[s], s)} `);
    if (!G.g.combat && gtab === "magia") out = out.replace(/(✦|◆|▲|⬡|★) (hechizo|pasiva|mejora|puerta|maestro)/g, (m, s, w) => `${img("tree/" + SYM[s], s)} ${w}`);
    // Clima (texto)
    if (typeof CLIMAS === "object") for (const w in CLIMAS) if (WX[w]) out = out.split(`${CLIMAS[w].icon} ${w}`).join(`${img("wx/" + WX[w], CLIMAS[w].icon)} ${w}`);
    // Clima sobre el mapa
    out = out.replace(/<text class="mwx" x="([\d.-]+)" y="([\d.-]+)"([^>]*)><title>([^<]*)<\/title>[^<]*<\/text>/g, (m, x, y, rest, title) => { const w = Object.keys(WX).find((k) => title.endsWith(": " + k)); if (!w) return m; return `<g class="mwx"${rest}><title>${title}</title>${svgImg(SAI.src("wx/" + WX[w]), +x, +y - 10, 34)}</g>`; });
    // Modos de viaje
    out = out.replace(/(data-mode="(pie|caballo|caravana)"[^>]*>)(\S+) /g, (m, a, k, e) => `${a}${img("via/" + k, e)} `);
    // Chinchetas del mapa (SVG)
    out = out.replace(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="(\d+)"><\/circle><text x="[\d.-]+" y="[\d.-]+">(?:<img[^>]*src="([^"]+)"[^>]*>|🛕)<\/text>/g, (m, cx, cy, r, src) => `<circle cx="${cx}" cy="${cy}" r="${r}"></circle>${svgImg(src || SAI.src("pl/templo"), +cx, +cy, +r * 1.9, "pini")}`);
    return out;
  }

  const _gv = gameView;
  gameView = function () { patchSlots(); const out = _gv(); return G ? post(out) : out; };

  const css = document.createElement("style");
  css.textContent = `
.sai{width:1.3em;height:1.3em;object-fit:contain;display:inline-block;vertical-align:-.3em;filter:drop-shadow(0 1px 2px #0009);-webkit-user-drag:none;user-select:none}
.tic .sai{width:22px;height:22px;vertical-align:middle}
.m em .sai{width:24px;height:24px;vertical-align:-6px}
.usi .sai{width:1.45em;height:1.45em;vertical-align:middle}
.uslot.mini .sai{width:30px;height:30px}
.uslot .ghost .sai{filter:grayscale(1)}
.bdi .sai,.wic .sai{width:1.35em;height:1.35em}
.cbtn b .sai{width:26px;height:26px;vertical-align:-8px}
.stc .sai{width:18px;height:18px;vertical-align:-4px}
.spic .sai{width:28px;height:28px;vertical-align:middle}
.afchip .sai{width:20px;height:20px;vertical-align:-5px}
.qtype .sai{width:20px;height:20px;vertical-align:-5px}
.dstats>div{display:flex;flex-direction:column;align-items:center}
.dstats .sai.ds{width:22px;height:22px;margin-bottom:1px}
.hextree image.hxi{pointer-events:none}
.hx.off image.hxi{opacity:.45;filter:grayscale(.8)}
.minimap svg g.mwx{animation:mWx 4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.minimap svg image.pini{pointer-events:none;filter:drop-shadow(0 2px 3px #000c)}
.bcell>span .sai{width:1.85em;height:1.85em;vertical-align:middle}
.bdrow>span>.sai,.si b>.sai{width:28px;height:28px;vertical-align:middle;margin-right:4px}
.shi .sai,.rec-ic .sai{width:1.5em;height:1.5em}
.sai.pet{border-radius:50%;object-fit:cover;filter:none}
.uslot.mini .sai.pet{width:34px;height:34px}
h2 .sai,h3 .sai{width:1.25em;height:1.25em}
`;
  document.head.appendChild(css);
  try { if (G) render(); } catch (e) {}
})();
