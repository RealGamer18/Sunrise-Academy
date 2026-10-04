// ===================== PULIDO DE ICONOS =====================
// Último script. Cambia los emojis que aún quedaban por los iconos de iconos/
// (bolsa, taller, forja, mascotas, diarias, resultados de combate, pesca…).
// Solo toca texto ya pintado: si una imagen falla, vuelve el emoji (iconos.js).
(function () {
  const SAI = window.SAI; if (!SAI) return;
  const VS = "️";
  const norm = (e) => e.replace(/️/g, "");
  // [selector, { emoji: ruta }]
  const RULES = [
    [".bcats .chip", { "🎒": "tab/bolsa", "🗡": "slot/arma", "🛡": "slot/escudo", "🧪": "obj/pocion-de-vida", "🍲": "obj/estofado-del-cazador", "🛢": "obj/aceite-de-fuego", "🪨": "obj/mineral-de-plata", "💠": "obj/cristal-de-potencial", "📦": "obj/paquete-de-entrega" }],
    [".shtabs .chip", { "⚗": "obj/pocion-de-vida", "🍳": "obj/estofado-del-cazador", "🛢": "obj/aceite-de-fuego", "🔨": "slot/arma" }],
    [".ings .ing", { "🌿": "obj/hierba-del-alba", "💎": "obj/cristal-de-luz", "🪨": "obj/mineral-de-plata", "🦴": "obj/piel-de-yeti", "🍖": "obj/carne-de-caza" }],
    [".sa-req li", { "🔮": "obj/nucleo-de-evolucion" }],
    [".sa-br > em", { "⚔": "stat/dano", "🔥": "af/fuego", "💨": "stat/iniciativa", "⚡": "af/rayo" }],
    [".hs-tiles em", { "⚔": "stat/dano", "🛡": "stat/defensa", "❤": "stat/pv", "💧": "stat/mana", "⚡": "stat/energia", "💨": "stat/iniciativa" }],
    [".stableb small, .sa-pets small, .petrole", { "⚔": "rol/dano", "✨": "stat/mana", "🛡": "rol/tanque", "💚": "rol/sanador" }],
    [".dqi > span", { "⚔": "q/caza", "💀": "gr/jefe" }],
    [".bres-lines > div, .result > div, .sa-got li, .toast", { "🍬": "obj/caramelo-embrujado", "❄": "obj/copo-de-nieve", "🌸": "obj/petalo-del-alba", "🔮": "obj/nucleo-de-evolucion", "🌙": "act/noche", "🏰": "gr/gremio", "🐟": "obj/pescado-fresco", "🎣": "act/pescar", "⛏": "act/minar" }],
    [".rec .btn", { "⚗": "obj/pocion-de-vida", "🍳": "obj/estofado-del-cazador", "🛢": "obj/aceite-de-fuego" }],
    [".sa-br .btn", { "⚔": "stat/dano", "🔥": "af/fuego", "💨": "stat/iniciativa" }],
    [".sa-mgt", { "🎣": "act/pescar", "⛏": "act/minar" }],
    [".sa-gather > b", { "🎣": "act/pescar", "⛏": "act/minar" }],
  ];
  const keyRe = (keys) => new RegExp("(" + keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length).join("|") + ")" + VS + "?", "gu");
  const COMP = RULES.map(([sel, map]) => [sel, map, keyRe(Object.keys(map))]);
  // Soles: ☀ (sin variante) en cualquier sitio
  const SOL = /☀(?!️)/g;
  const mk = (path, fb) => { const t = document.createElement("template"); t.innerHTML = SAI.img(path, fb); return t.content.firstChild; };

  function swapNode(tn, re, map) {
    const s = tn.nodeValue; re.lastIndex = 0; if (!re.test(s)) return; re.lastIndex = 0;
    const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = re.exec(s))) {
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      const p = typeof map === "function" ? map(m[0]) : map[norm(m[1] || m[0])];
      frag.appendChild(p ? mk(p, m[0]) : document.createTextNode(m[0]));
      last = m.index + m[0].length;
    }
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    tn.replaceWith(frag);
  }
  function texts(el) {
    const out = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && /^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE)$/.test(n.parentElement.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    while (w.nextNode()) out.push(w.currentNode); return out;
  }
  // Líneas de botín: "🎁 +2 Polvo de luna" → el emoji del principio pasa a ser el icono del objeto
  let NAMES = null;
  function lootLines(root) {
    if (!NAMES) NAMES = SAI.names().sort((a, b) => b.length - a.length);
    root.querySelectorAll(".bres-lines > div, .result > div, .sa-got li").forEach((el) => {
      if (el.dataset.saLoot) return; el.dataset.saLoot = "1";
      const first = el.firstChild; if (!first || first.nodeType !== 3) return;
      const txt = el.textContent; const n = NAMES.find((x) => txt.includes(x)); if (!n) return;
      const m = first.nodeValue.match(/^\s*(\p{Extended_Pictographic}[️‍\p{Extended_Pictographic}]*)\s/u); if (!m) return;
      const p = SAI.path(n); if (!p) return;
      first.nodeValue = first.nodeValue.slice(m[0].length - 1);
      el.insertBefore(mk(p, m[1]), first);
    });
  }
  // Títulos de tarjetas: solo el emoji del principio
  const HEAD = { "🐾": "slot/mascota", "⚗": "obj/pocion-de-vida", "🛡": "slot/pecho", "⚒": "slot/arma", "🔨": "slot/arma", "🛒": "pl/tienda", "🛕": "pl/templo", "👥": "tab/grupo", "🏰": "gr/gremio", "🎒": "tab/bolsa", "🌋": "gr/jefe", "🏪": "pl/tienda", "🎓": "pl/academia", "⚔": "act/atacar", "🧭": "tab/mapa", "📖": "tab/personaje" };
  const HEAD_RE = new RegExp("^(\\s*)(" + Object.keys(HEAD).join("|") + ")\uFE0F?");
  const HEAD_SEL = ".card.mini > b, .row.between > b, .act > b, .sa-gbox > h2, .invhead > h2, .bagh > b, .raidbox .pill, .sa-clsbox > b, .sa-sets > h3";
  function heads(root) {
    root.querySelectorAll(HEAD_SEL).forEach((el) => {
      const t = el.firstChild; if (!t || t.nodeType !== 3) return; const m = t.nodeValue.match(HEAD_RE); if (!m) return;
      t.nodeValue = m[1] + t.nodeValue.slice(m[0].length); el.insertBefore(mk(HEAD[m[2]], m[2]), t);
    });
  }
  function pass() {
    try { heads(document.body); } catch (e) {}
    const root = document.body; if (!root) return;
    try { lootLines(root); } catch (e) {}
    for (const [sel, map, re] of COMP) root.querySelectorAll(sel).forEach((el) => texts(el).forEach((t) => swapNode(t, re, map)));
    texts(root).forEach((t) => { if (t.nodeValue.includes("☀")) swapNode(t, SOL, () => "stat/soles"); });
  }
  let q = false;
  const run = () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; obs.disconnect(); try { pass(); } catch (e) { console.warn("pulido:", e); } obs.observe(document.body, { childList: true, subtree: true, characterData: true }); }); };
  const obs = new MutationObserver(run);
  const start = () => { run(); };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);

  const css = document.createElement("style");
  css.textContent = `
.bcats .chip .sai,.shtabs .chip .sai{width:20px;height:20px;vertical-align:-5px}
.ings .ing .sai,.sa-req .sai,.dqi .sai,.pill .sai,.btn .sai{width:1.25em;height:1.25em;vertical-align:-.3em}
.sa-br>em .sai{width:32px;height:32px}
.hs-tiles em .sai{width:26px;height:26px;vertical-align:middle}
.bres-lines .sai,.result .sai,.sa-got .sai,.toast .sai{width:1.35em;height:1.35em;vertical-align:-.35em}
.card.mini>b>.sai,.row.between>b>.sai,.act>b>.sai,.sa-gbox>h2>.sai,.invhead>h2>.sai,.bagh>b>.sai,.sa-clsbox>b>.sai,.sa-sets>h3>.sai{width:1.45em;height:1.45em;vertical-align:-.38em;margin-right:2px}
.sa-mgt .sai{width:28px;height:28px;vertical-align:-7px}
`;
  document.head.appendChild(css);
})();
