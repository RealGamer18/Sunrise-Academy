// ===================== ÁRBOL DE HABILIDADES EN HEXÁGONOS (diseño 1.11) =====================
// Carga después de dioses.js. Centro → anillo núcleo → puertas de sub-afinidad → panales → nodo maestro.
const HEX_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const hadd = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const hid = (h) => h[0] + "," + h[1];
const NODE_COST = { pasiva: 1, mejora: 2, puerta: 3, maestro: 5 };
const RES_ST = { Fuego: "Quemado", Agua: "Quemado", Tierra: "Aturdido", Aire: "Aturdido", Rayo: "Aturdido", Luz: "Cegado", Sombra: "Asustado" };
const SUB_PROFILE = {
  Lava: ["dmg", "Quemado"], Ceniza: ["dmg", "Cegado"], "Llama azul": ["dmg", "Quemado"], "Explosión": ["dmg"],
  Hielo: ["dmg", "Aturdido"], Vapor: ["dmg", "Cegado"], Niebla: ["shield"], Marea: ["heal"],
  Cristal: ["shield"], Metal: ["dmg"], Arena: ["dmg", "Cegado"], Lodo: ["dmg", "Aturdido"],
  Tormenta: ["dmg", "Aturdido"], Sonido: ["dmg", "Asustado"], Nube: ["shield"], Vendaval: ["dmg"],
  Plasma: ["dmg", "Quemado"], Magnetismo: ["dmg", "Aturdido"], Trueno: ["dmg", "Aturdido"],
  "Sanación": ["heal"], "Ilusión": ["dmg", "Cegado"], Estelar: ["dmg"],
  Oscuridad: ["dmg", "Cegado"], "Maldición": ["dmg", "Asustado"], Espectro: ["dmg", "Asustado"],
  "Levitación": ["shield"], "Presión": ["dmg"], Singularidad: ["dmg", "Aturdido"],
  "Aceleración": ["buff"], Pausa: ["dmg", "Aturdido"], Eco: ["dmg"],
  Portales: ["shield"], "Distorsión": ["dmg", "Cegado"], Bolsillo: ["buff"],
  "Ilusión real": ["dmg", "Cegado"], Reescritura: ["heal"],
  Forja: ["dmg"], Vida: ["heal"], "Invocación": ["dmg"],
  Presagio: ["buff"], Hilo: ["dmg"], Fortuna: ["heal"],
  "Vínculo": ["heal"], "Posesión": ["dmg", "Aturdido"], Memoria: ["buff"],
};
const SUB_WORDS = { dmg: ["Lanza", "Estallido"], heal: ["Toque", "Ola"], shield: ["Escudo", "Fortaleza"], buff: ["Impulso", "Foco"] };
const SUB_VAL = { dmg: [30, 55, 100], heal: [40, 70, 120], shield: [3, 4, 5], buff: [2, 3, 4] };
const SUB_CAT = { dmg: "Ataque", heal: "Apoyo", shield: "Defensa", buff: "Utilidad" };
const subsOf = (aff) => (SUBAFIN[aff] || "").split(",").map((s) => s.trim()).filter(Boolean);
function subSpells(aff, sub) {
  const [kind, st] = SUB_PROFILE[sub] || ["dmg"]; const low = sub.toLowerCase();
  const mk = (i, name) => [name, SUB_CAT[kind], i + 2, kind, SUB_VAL[kind][i], st, sub];
  return [mk(0, `${SUB_WORDS[kind][0]} de ${low}`), mk(1, `${SUB_WORDS[kind][1]} de ${low}`), mk(2, `Corazón de ${low}`)];
}
// registrar los hechizos de sub-afinidad para que spellInfo los encuentre
for (const aff of Object.keys(SPELLS)) for (const sub of subsOf(aff)) for (const s of subSpells(aff, sub)) if (!SPELLS[aff].some((x) => x[0] === s[0])) SPELLS[aff].push(s);

const TREE_CACHE = {};
function treeOf(aff) {
  if (TREE_CACHE[aff]) return TREE_CACHE[aff];
  const nodes = {}; const add = (h, n) => { nodes[hid(h)] = { id: hid(h), q: h[0], r: h[1], ...n }; };
  const core = (SPELLS[aff] || []).filter((s) => !s[6]); const subs = subsOf(aff);
  add([0, 0], { type: "centro", name: aff, desc: `El corazón de tu afinidad ${aff}. Desbloqueado gratis.` });
  const ringSpells = core.slice(0, 3);
  const ring = [["hechizo", ringSpells[0]], ["pasiva", "eff"], ["hechizo", ringSpells[1]], ["pasiva", "dom"], ["hechizo", ringSpells[2]], ["pasiva", "res"]];
  ring.forEach(([type, x], i) => {
    const h = HEX_DIRS[i];
    if (type === "hechizo" && x) add(h, { type, spell: x[0], c: x[2] });
    else if (type === "pasiva") add(h, { type, eff: x });
  });
  const gateDirs = [0, 2, 4, 1, 3, 5].slice(0, subs.length);
  subs.forEach((sub, k) => {
    const di = gateDirs[k]; const D = HEX_DIRS[di]; const E = HEX_DIRS[(di + 1) % 6]; const sp = subSpells(aff, sub);
    add(hadd([0, 0], D, 2), { type: "puerta", sub, role: "gate" });
    add(hadd([0, 0], D, 3), { type: "hechizo", spell: sp[0][0], c: 2, sub, role: "a" });
    add(hadd(hadd([0, 0], D, 3), E), { type: "pasiva", eff: "pow", sub, role: "b" });
    add(hadd(hadd([0, 0], D, 4), E), { type: "hechizo", spell: sp[1][0], c: 3, sub, role: "c" });
    add(hadd([0, 0], D, 4), { type: "mejora", target: sp[0][0], sub, role: "u" });
    add(hadd([0, 0], D, 5), { type: "maestro", spell: sp[2][0], c: 4, sub, role: "m" });
  });
  const free = [0, 1, 2, 3, 4, 5].filter((i) => !gateDirs.includes(i));
  const extras = [];
  if (core[3]) extras.push({ type: "hechizo", spell: core[3][0], c: core[3][2] });
  if (ringSpells[2]) extras.push({ type: "mejora", target: ringSpells[2][0] });
  if (ringSpells[0]) extras.push({ type: "mejora", target: ringSpells[0][0] });
  extras.push({ type: "pasiva", eff: "pow" });
  if (ringSpells[1]) extras.push({ type: "mejora", target: ringSpells[1][0] });
  free.forEach((di, i) => { if (extras[i]) add(hadd([0, 0], HEX_DIRS[di], 2), extras[i]); });
  return (TREE_CACHE[aff] = nodes);
}
function nodeCost(n) { return n.type === "hechizo" ? n.c : n.type === "centro" ? 0 : NODE_COST[n.type]; }
function nodeName(n, aff) {
  if (n.type === "centro") return aff;
  if (n.type === "hechizo" || n.type === "maestro") return n.spell;
  if (n.type === "puerta") return `Puerta: ${n.sub}`;
  if (n.type === "mejora") return `Mejora: ${n.target}`;
  return { eff: "Eficiencia", dom: "Canal", res: "Resistencia", pow: n.sub ? `Afinidad con ${n.sub.toLowerCase()}` : "Potencia" }[n.eff];
}
function nodeDesc(n, aff) {
  if (n.type === "centro") return n.desc;
  if (n.type === "hechizo" || n.type === "maestro") { const sp = spellInfo(aff, n.spell); return `${n.type === "maestro" ? "Habilidad maestra. " : ""}Hechizo de círculo ${sp.c} (${sp.cat}): ${spellDesc(sp)}. Cuesta ${spellCost(sp)} de maná.`; }
  if (n.type === "puerta") return `Abre la sub-afinidad ${n.sub}. Pide Dominio +2.`;
  if (n.type === "mejora") { const s = SPELLS[aff].find((x) => x[0] === n.target); return s && s[3] === "status" ? `${n.target} también hace 15 de daño.` : `${n.target} es un 50% más fuerte${s && ["shield", "buff"].includes(s[3]) ? " (+1 turno)" : ""}.`; }
  return { eff: `Tus hechizos de ${aff} cuestan 10% menos maná.`, dom: `+1 al Dominio de ${aff}.`, res: `Inmune al estado ${resOf(aff)}.`, pow: n.sub ? `Los hechizos de ${n.sub.toLowerCase()} hacen y curan 15% más.` : `Tus hechizos de ${aff} hacen y curan 15% más.` }[n.eff];
}
const resOf = (aff) => RES_ST[aff] || "Asustado";
const NODE_ICON = { centro: "◉", hechizo: "✦", pasiva: "◆", mejora: "▲", puerta: "⬡", maestro: "★" };

// ---------- estado ----------
function tr() {
  const g = G.g; if (!g.tree) g.tree = { a: {}, noCast: 0, resets: 0 };
  for (const a of G.afinidades) {
    if (!g.tree.a[a.n]) {
      const u = { "0,0": true }; const nodes = treeOf(a.n);
      for (const s of g.spells.filter((x) => x.aff === a.n)) { const n = Object.values(nodes).find((x) => x.spell === s.n); if (n) u[n.id] = true; }
      g.tree.a[a.n] = { u };
    }
  }
  return g.tree;
}
const unlocked = (aff) => tr().a[aff]?.u || {};
function isAvail(aff, n) {
  const u = unlocked(aff); if (u[n.id]) return false;
  return HEX_DIRS.some((dd) => u[hid([n.q + dd[0], n.r + dd[1]])]);
}
function reqFail(aff, n) {
  const a = G.afinidades.find((x) => x.n === aff); const dom = a?.dominio || 0;
  if (n.type === "puerta" && dom < 2) return "Pide Dominio +2";
  if (n.type === "puerta") { const lim = { normal: 99, dificil: 2, pesadilla: 1 }[difficulty()]; const open = Object.values(treeOf(aff)).filter((x) => x.type === "puerta" && unlocked(aff)[x.id]).length; if (open >= lim) return `Esta dificultad permite ${lim} sub-afinidad${lim > 1 ? "es" : ""} por afinidad`; }
  if ((n.type === "hechizo" || n.type === "maestro") && dom < n.c - 1) return `Pide Dominio ${sgn(n.c - 1)}`;
  if (!isAvail(aff, n)) return "Tiene que tocar un hexágono que ya tengas";
  if ((G.puntosAfinidad || 0) < nodeCost(n)) return `Necesitas ${nodeCost(n)} puntos de afinidad`;
  return "";
}
const difficulty = () => Store.world?.flags?.dificultad || "normal";
function unlockNode(aff, id) {
  const n = treeOf(aff)[id]; if (!n || unlocked(aff)[id]) return;
  const why = reqFail(aff, n); if (why) { toast(why); return; }
  G.puntosAfinidad -= nodeCost(n); tr().a[aff].u[id] = true;
  applyNode(aff, n, 1);
  log(`Árbol de ${aff}: ${nodeName(n, aff)}.`); toast(`Desbloqueado: ${nodeName(n, aff)}`);
  persist(); render();
}
function applyNode(aff, n, sign) {
  const a = G.afinidades.find((x) => x.n === aff);
  if ((n.type === "hechizo" || n.type === "maestro")) {
    if (sign > 0 && !G.g.spells.some((s) => s.n === n.spell)) G.g.spells.push({ aff, n: n.spell });
    if (sign < 0) G.g.spells = G.g.spells.filter((s) => s.n !== n.spell);
  }
  if (n.type === "pasiva" && n.eff === "dom" && a) a.dominio += sign;
}
function refundNodes(aff, ids) {
  let pts = 0; const u = tr().a[aff].u;
  for (const id of ids) { const n = treeOf(aff)[id]; if (!n || !u[id] || n.type === "centro") continue; pts += nodeCost(n); applyNode(aff, n, -1); delete u[id]; }
  G.puntosAfinidad = (G.puntosAfinidad || 0) + pts; return pts;
}
function branchIds(aff, sub) { return Object.values(treeOf(aff)).filter((n) => n.sub === sub).map((n) => n.id); }
function useCrystal(aff, sub) {
  if (!G.g.inv["Cristal de Olvido"]) return;
  const pts = refundNodes(aff, branchIds(aff, sub)); addItem("Cristal de Olvido", -1);
  log(`Usaste un Cristal de Olvido en ${sub}.`); G.g.lastResult = { title: "Cristal de Olvido", lines: [`La rama ${sub} vuelve a cerrarse.`, `Recuperas ${pts} puntos de afinidad.`] };
  tsel.respec = null; persist(); render();
}
function useScroll(aff, from, to) {
  if (!G.g.inv["Pergamino de Reasignación"] || from === to) return;
  const nodes = treeOf(aff); const u = tr().a[aff].u;
  const roles = Object.values(nodes).filter((n) => n.sub === from && u[n.id]).map((n) => n.role);
  if (!roles.length) return;
  for (const n of Object.values(nodes)) if (n.sub === from && u[n.id]) { applyNode(aff, n, -1); delete u[n.id]; }
  for (const n of Object.values(nodes)) if (n.sub === to && roles.includes(n.role)) { u[n.id] = true; applyNode(aff, n, 1); }
  addItem("Pergamino de Reasignación", -1);
  log(`Pergamino de Reasignación: ${from} → ${to}.`); G.g.lastResult = { title: "Pergamino de Reasignación", lines: [`Todo lo que tenías en ${from} pasa a ${to}.`] };
  tsel.respec = null; persist(); render();
}
function totalReset(aff, newAff) {
  const t = tr();
  if (difficulty() === "pesadilla" && t.resets >= 1) { toast("En Pesadilla el reinicio total solo se puede usar una vez por campaña."); return; }
  const ids = Object.keys(t.a[aff].u); const pts = refundNodes(aff, ids);
  const a = G.afinidades.find((x) => x.n === aff); a.dominio = 1;
  t.a[aff] = { u: { "0,0": true } };
  if (newAff && newAff !== aff && !G.afinidades.some((x) => x.n === newAff)) { delete t.a[aff]; a.n = newAff; t.a[newAff] = { u: { "0,0": true } }; }
  t.resets++; t.noCast = worldCap();
  log(`Reinicio total del árbol de ${aff}${a.n !== aff ? ` (ahora ${a.n})` : ""}.`);
  G.g.lastResult = { title: "Reinicio total", lines: [`Recuperas ${pts} puntos de afinidad.`, "Tu Dominio vuelve a +1.", "No puedes lanzar hechizos hasta el próximo capítulo de la historia."] };
  tsel.aff = a.n; tsel.node = null; tsel.respec = null; persist(); render();
}
const treeNoCast = () => G?.g?.tree?.noCast && G.g.tree.noCast === worldCap();

// ---------- efectos del árbol en hechizos ----------
function treeHas(aff, pred) { const u = G?.g?.tree?.a?.[aff]?.u; if (!u) return 0; return Object.values(treeOf(aff)).filter((n) => u[n.id] && pred(n)).length; }
const _spellInfo = spellInfo;
spellInfo = function (aff, name) {
  const sp = _spellInfo(aff, name); if (!sp || !G?.g) return sp;
  const raw = SPELLS[aff].find((x) => x[0] === name); sp.sub = raw?.[6] || null;
  const up = treeHas(aff, (n) => n.type === "mejora" && n.target === name);
  if (up) {
    if (sp.kind === "status") { sp.kind = "dmg"; sp.val = 15; }
    else if (["shield", "buff"].includes(sp.kind)) sp.val += 1;
    else sp.val = Math.round(sp.val * 1.5);
    sp.up = true;
  }
  if (["dmg", "heal"].includes(sp.kind)) { const pw = treeHas(aff, (n) => n.type === "pasiva" && n.eff === "pow" && (!n.sub || n.sub === sp.sub)); if (pw) sp.val = Math.round(sp.val * (1 + 0.15 * pw)); }
  return sp;
};
const _spellCost = spellCost;
spellCost = function (sp) { const e = G?.g ? treeHas(sp.aff, (n) => n.type === "pasiva" && n.eff === "eff") : 0; return Math.ceil(_spellCost(sp) * Math.pow(0.9, e)); };
const _statusImmune = statusImmune;
statusImmune = function (st) { if (_statusImmune(st)) return true; return G.afinidades.some((a) => resOf(a.n) === st && treeHas(a.n, (n) => n.type === "pasiva" && n.eff === "res")); };
const _pAttack = pAttack;
pAttack = function (ti, spell) { if (spell && treeNoCast()) { toast("Después de un reinicio total no puedes lanzar hechizos hasta el próximo capítulo."); return; } return _pAttack(ti, spell); };
// objetos para cambiar el árbol
SHOP.push({ n: "Pergamino de Reasignación", precio: 150, desc: "Cambia una sub-afinidad por otra de la misma afinidad (se usa en Magia)", kind: "respec" });
const _pItem = pItem;
pItem = function (n) { const it = SHOP.find((s) => s.n === n); if (it?.kind === "respec") { gtab = "magia"; tsel.respec = "scroll"; return render(); } return _pItem(n); };
const _sellPrice = sellPrice;
sellPrice = function (n) { return n === "Cristal de Olvido" ? 30 : _sellPrice(n); };
const _onVictoryGods = onVictoryGods;
onVictoryGods = function (c) { _onVictoryGods(c); if (c.enemies.some((e) => e.boss && !e.avatar) && Math.random() < 0.25) { addItem("Cristal de Olvido"); toast("¡Encontraste un Cristal de Olvido!"); log("Encontraste un Cristal de Olvido."); } };

// ---------- vista ----------
let tsel = { aff: null, node: null, respec: null, from: "", to: "", newAff: "" };
const HEX_S = 30, SQ3 = Math.sqrt(3);
function hexPts(cx, cy, s) { const out = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); out.push((cx + s * Math.cos(a)).toFixed(1) + "," + (cy + s * Math.sin(a)).toFixed(1)); } return out.join(" "); }
function shortLabel(s) { const w = s.replace(/^(Puerta|Mejora): /, "").split(" "); const l1 = []; const l2 = []; for (const x of w) (l1.join(" ").length + x.length < 10 ? l1 : l2).push(x); return [l1.join(" "), l2.join(" ").slice(0, 11)]; }
function treeSVG(aff) {
  const nodes = Object.values(treeOf(aff)); const u = unlocked(aff);
  const px = (n) => [HEX_S * SQ3 * (n.q + n.r / 2), HEX_S * 1.5 * n.r];
  const xs = nodes.map((n) => px(n)[0]), ys = nodes.map((n) => px(n)[1]);
  const pad = HEX_S + 4; const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad, minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
  return `<svg class="hextree" viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}" role="img" aria-label="Árbol de ${esc(aff)}">
    ${nodes.map((n) => {
      const [x, y] = px(n); const st = u[n.id] ? "on" : isAvail(aff, n) ? (reqFail(aff, n) ? "near" : "can") : "off";
      const [l1, l2] = shortLabel(typeof tx === "function" ? tx(nodeName(n, aff)) : nodeName(n, aff));
      return `<g class="hx ${n.type} ${st} ${tsel.node === n.id ? "sel" : ""}" data-hex="${n.id}" tabindex="0"><polygon points="${hexPts(x, y, HEX_S - 1.5)}"></polygon>
        <text x="${x.toFixed(1)}" y="${(y - 9).toFixed(1)}" class="ic">${NODE_ICON[n.type]}</text>
        <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${esc(l1)}</text><text x="${x.toFixed(1)}" y="${(y + 14).toFixed(1)}">${esc(l2)}</text></g>`;
    }).join("")}</svg>`;
}
function treeView() {
  if (!G.afinidades.length) return `<h2>Magia</h2><p class="lead">No tienes afinidad. Puedes pelear con armas mágicas de la tienda, o despertar la magia llegando a Campeón de un dios (pestaña Dioses).</p>`;
  tr(); if (!tsel.aff || !G.afinidades.some((a) => a.n === tsel.aff)) tsel.aff = G.afinidades[0].n;
  const aff = tsel.aff; const a = G.afinidades.find((x) => x.n === aff); const nodes = treeOf(aff); const u = unlocked(aff);
  const n = tsel.node && nodes[tsel.node]; const opened = Object.values(nodes).filter((x) => x.type === "puerta" && u[x.id]).map((x) => x.sub);
  const closed = subsOf(aff).filter((s) => !opened.includes(s));
  const detail = n ? `<div class="card"><div class="row between"><h3>${NODE_ICON[n.type]} ${esc(nodeName(n, aff))}</h3><span class="pill">${esc({ centro: "Centro", hechizo: "Hechizo", pasiva: "Pasiva", mejora: "Mejora", puerta: "Puerta", maestro: "Maestro" }[n.type])}${n.sub ? " · " + esc(n.sub) : ""}</span></div>
      <p>${esc(nodeDesc(n, aff))}</p>
      ${u[n.id] ? `<span class="pill ok">Desbloqueado</span>` : (() => { const why = reqFail(aff, n); return `<div class="row"><button type="button" class="btn primary small" data-g="tunlock" ${why ? "disabled" : ""}>Desbloquear · ${nodeCost(n)} punto${nodeCost(n) > 1 ? "s" : ""}</button>${why ? `<span class="note">${esc(why)}</span>` : ""}</div>`; })()}</div>`
    : `<p class="note">Toca un hexágono para ver qué da. Los brillantes ya son tuyos; los de borde dorado los puedes comprar ahora.</p>`;
  return `<div class="row between"><h2>Magia</h2><span class="pill">${G.puntosAfinidad || 0} puntos de afinidad</span></div>
    ${G.afinidades.length > 1 ? `<div class="chips">${G.afinidades.map((x) => `<button type="button" class="chip ${x.n === aff ? "on" : ""}" data-g="taff:${esc(x.n)}">${esc(x.n)}</button>`).join("")}</div>` : ""}
    <div class="row between" style="margin:8px 0"><span><b>${esc(aff)}</b> ${a.abs ? `<span class="pill abs">Abstracta</span>` : ""} <span class="pill">Dominio ${sgn(a.dominio)}</span> <span class="pill">Dificultad: ${esc({ normal: "Normal", dificil: "Difícil", pesadilla: "Pesadilla" }[difficulty()])}</span></span>
      <button type="button" class="btn small ghost" data-dom="${esc(aff)}">Subir Dominio (3 puntos)</button></div>
    ${treeNoCast() ? `<div class="warn">Hiciste un reinicio total: no puedes lanzar hechizos hasta el próximo capítulo.</div>` : ""}
    <div class="treewrap">${treeSVG(aff)}<div class="treeside">${detail}
      <div class="legend"><span><i class="lg on"></i>Tuyo</span><span><i class="lg can"></i>Disponible</span><span><i class="lg near"></i>Falta requisito</span><span><i class="lg off"></i>Lejos</span></div>
      <p class="note">✦ hechizo (1 punto por círculo) · ◆ pasiva (1) · ▲ mejora (2) · ⬡ puerta de sub-afinidad (3 y Dominio +2) · ★ maestro (5)</p>
      <h3 class="sub">Cambiar el árbol</h3>
      <div class="row">
        <button type="button" class="btn small ghost" data-g="trespec:crystal" ${G.g.inv["Cristal de Olvido"] && opened.length ? "" : "disabled"}>Cristal de Olvido (${G.g.inv["Cristal de Olvido"] || 0})</button>
        <button type="button" class="btn small ghost" data-g="trespec:scroll" ${G.g.inv["Pergamino de Reasignación"] && opened.length && closed.length ? "" : "disabled"}>Pergamino (${G.g.inv["Pergamino de Reasignación"] || 0})</button>
        <button type="button" class="btn small danger" data-g="trespec:total">Reinicio total</button></div>
      ${tsel.respec === "crystal" ? `<div class="card mini"><p>¿Qué rama olvidas? Recuperas sus puntos.</p><div class="chips">${opened.map((s) => `<button type="button" class="chip" data-g="tcrystal:${esc(s)}">${esc(s)}</button>`).join("")}</div></div>` : ""}
      ${tsel.respec === "scroll" ? `<div class="card mini"><p>Mueve una rama abierta a otra sub-afinidad, con todo lo que tenías.</p>
        <div class="row"><select data-tsel="from"><option value="">De…</option>${opened.map((s) => `<option ${tsel.from === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select>
        <select data-tsel="to"><option value="">A…</option>${closed.map((s) => `<option ${tsel.to === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select>
        <button type="button" class="btn small primary" data-g="tscroll" ${tsel.from && tsel.to ? "" : "disabled"}>Usar pergamino</button></div>${!G.g.inv["Pergamino de Reasignación"] ? `<p class="note">Lo venden en las tiendas por 150 Soles.</p>` : ""}</div>` : ""}
      ${tsel.respec === "total" ? `<div class="card mini"><p class="warn">Borra todo el árbol de ${esc(aff)} y te devuelve todos los puntos. Tu Dominio vuelve a +1 y no puedes lanzar hechizos hasta el próximo capítulo.${difficulty() === "pesadilla" ? " En Pesadilla solo se puede una vez por campaña." : ""}</p>
        <div class="row"><select data-tsel="newAff"><option value="">Mantener ${esc(aff)}</option>${(a.abs ? ABSTRACTAS : ELEMENTALES).map((r) => r[2]).filter((x) => !G.afinidades.some((y) => y.n === x)).map((x) => `<option ${tsel.newAff === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>
        <button type="button" class="btn small danger" data-g="ttotal">Confirmar reinicio</button><button type="button" class="btn small ghost" data-g="trespec:">Cancelar</button></div></div>` : ""}
      ${Store.isOwner ? `<p class="note">Anfitrión: dificultad de la partida <select data-tsel="dif">${[["normal", "Normal"], ["dificil", "Difícil"], ["pesadilla", "Pesadilla"]].map(([k, l]) => `<option value="${k}" ${difficulty() === k ? "selected" : ""}>${l}</option>`).join("")}</select></p>` : ""}
    </div></div>
    <h3 class="sub">Tus hechizos</h3>${G.g.spells.length ? `<div class="shop">${G.g.spells.map((s) => { const sp = spellInfo(s.aff, s.n); return sp ? `<div class="si"><span><b>${esc(sp.n)}${sp.up ? " ▲" : ""}</b><small>${esc(sp.aff)}${sp.sub ? " · " + esc(sp.sub) : ""} · círculo ${sp.c} · ${spellCost(sp)} maná · ${esc(spellDesc(sp))}</small></span></div>` : ""; }).join("")}</div>` : `<p class="muted">Aún no tienes hechizos. Desbloquea los del anillo núcleo.</p>`}`;
}
magicView = treeView;

// ---------- eventos ----------
document.addEventListener("click", (ev) => {
  if (view.name !== "game" || !G) return;
  const hx = ev.target.closest("[data-hex]"); if (hx) { tsel.node = hx.dataset.hex; return render(); }
  const t = ev.target.closest("button"); if (!t) return; const g = t.dataset.g; if (!g) return;
  const i = g.indexOf(":"); const a = i < 0 ? g : g.slice(0, i); const b = i < 0 ? "" : g.slice(i + 1);
  if (a === "taff") { tsel.aff = b; tsel.node = null; tsel.respec = null; return render(); }
  if (a === "tunlock") return unlockNode(tsel.aff, tsel.node);
  if (a === "trespec") { tsel.respec = tsel.respec === b ? null : b || null; return render(); }
  if (a === "tcrystal") return useCrystal(tsel.aff, b);
  if (a === "tscroll") return useScroll(tsel.aff, tsel.from, tsel.to);
  if (a === "ttotal") return totalReset(tsel.aff, tsel.newAff);
});
document.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && ev.target.matches?.("[data-hex]")) { tsel.node = ev.target.dataset.hex; render(); } });
document.addEventListener("change", (ev) => {
  if (view.name !== "game" || !G) return; const k = ev.target.dataset?.tsel; if (!k) return;
  if (k === "dif") { Store.updateWorld({ flags: { dificultad: ev.target.value } }).then(render).catch(() => toast("No se pudo cambiar la dificultad.")); return; }
  tsel[k] = ev.target.value; render();
});
