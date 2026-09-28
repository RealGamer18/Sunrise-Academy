// ===================== PANTALLA DE COMBATE, FARMEO, PAUSA Y FINAL =====================
// Carga la última: redefine combatView y añade la Cumbre del Alba, pausar la historia, zonas para farmear y el final del Arco 4.

// ---------- la Cumbre del Alba (Arco 4) ----------
T.cumbre = { icon: "☀️", name: "Cumbre" };
if (!P.alba.some((x) => x.n === "Cumbre del Alba")) P.alba.push({ n: "Cumbre del Alba", t: "cumbre", lvl: "55+", h: 1.5, xy: [965, 455], obj: ["Rocío del amanecer"], mon: [], note: "Una escalera de luz sobre la academia. Solo se abre al final de cada año." });
TEMPLE_AT["alba:Cumbre del Alba"] = ["solen"];

// ---------- jefes que vuelven cada 7 días (para farmear) ----------
function bossDown(key) { const v = G.g.bossDone[key]; if (v === undefined || v === false) return false; if (v === true) return true; return G.g.day - v < 7; }
function bossBack(key) { const v = G.g.bossDone[key]; return typeof v === "number" ? v + 7 : "—"; }

// ---------- nivel recomendado y pausa para entrenar ----------
function recLvl(cap) { const a = arcOf(cap); const k = cap - a.from; return Math.round([1, 12, 25, 45][a.n - 1] + k * [1.4, 1.4, 2, 1.7][a.n - 1]); }
const pausedChars = () => Store.all.filter((c) => c.g?.pausa);
function togglePause() {
  G.g.pausa = !G.g.pausa; log(G.g.pausa ? "Pausaste la historia para entrenar." : "Volviste a la historia principal.");
  toast(G.g.pausa ? "Historia en pausa: el capítulo no avanzará hasta que la reanudes." : "Historia reanudada.");
  persist(); render(); if (!G.g.pausa) setTimeout(() => tryCloseVote(false), 600);
}
const _tryCloseVote = tryCloseVote;
tryCloseVote = async function (force) {
  if (!force && pausedChars().some((c) => c.id !== G?.id || G.g.pausa)) return; // alguien está entrenando
  return _tryCloseVote(force);
};
function pauseBar() {
  const ch = chapter(); if (!ch) return "";
  G.g.flags.cenit = ["Aurora", "Cenit"].includes(G.peldano);
  const rec = recLvl(ch.cap); const low = G.nivel < rec - 2; const others = pausedChars().filter((c) => c.id !== G.id);
  return `<div class="pausebar ${G.g.pausa ? "on" : ""}">
    <div><b>Nivel recomendado: ${rec}</b> <span class="muted">· tú: ${G.nivel}</span>${low ? `<div class="note">Vas por debajo. Puedes pausar la historia y cazar, hacer misiones o ir a la arena hasta estar listo.</div>` : ""}
      ${others.length ? `<div class="note">Entrenando ahora: ${others.map((c) => esc(c.nombre)).join(", ")}. El capítulo espera a que terminen.</div>` : ""}</div>
    <button type="button" class="btn small ${G.g.pausa ? "primary" : "ghost"}" data-g="pausa">${G.g.pausa ? "▶ Reanudar la historia" : "⏸ Pausar para entrenar"}</button></div>`;
}
const _storyView = storyView;
storyView = function () { return pauseBar() + _storyView(); };

// ---------- zonas buenas para tu nivel ----------
function farmSpots() {
  const out = [];
  for (const r in P) P[r].forEach((pl, i) => {
    const lv = parseLvl(pl.lvl); if (!lv || !pl.mon.length || /Duelos|Premios/.test(pl.mon.join())) return;
    if (lv[0] <= G.nivel + 2 && lv[1] >= G.nivel - 3) out.push({ r, p: i, pl, lv });
  });
  return out.sort((a, b) => Math.abs(a.lv[0] - G.nivel) - Math.abs(b.lv[0] - G.nivel)).slice(0, 6);
}
function farmBox() {
  const sp = farmSpots(); if (!sp.length) return "";
  return `<div class="card mini"><b>🎯 Buenos lugares para cazar a tu nivel (${G.nivel})</b><div class="places">${sp.map((x) => `<button type="button" class="pl" data-go="${x.r}:${x.p}"><span>${T[x.pl.t].icon} ${esc(x.pl.n)} <small>nivel ${esc(x.pl.lvl)}</small></span><small>${esc(regionName(x.r))} · ${esc(fmtH(tripHours({ r: x.r, p: x.p }, gsel.mode)))}</small></button>`).join("")}</div></div>`;
}
const _mapView = mapView;
mapView = function () { return farmBox() + _mapView(); };

// ---------- final de la historia ----------
function finalOutcome() {
  const f = Store.world?.flags || {}; const s = f.sacrificio_de;
  if (f.final_romper) return "El grupo rompió la Cumbre. No habrá más deseos. Los 97 ganadores bajaron como lluvia de luz y el sol empezó, muy despacio, a recuperarse. Empieza una era de reconstrucción.";
  if (f.final_sacrificio) return s ? `${s.nombre} subió los últimos peldaños y se unió al sol. Esa mañana amaneció como hace cien años. Nadie en Solvaria volverá a olvidar su nombre.` : "El grupo decidió que uno de ellos se uniría al sol. Falta saber quién da el paso.";
  if (f.final_dioses) return "Los dioses aceptaron el pacto y tomaron el sol entre todos. La luz vuelve, pero ahora los dioses caminan más cerca de los mortales… y no todos son amables.";
  if (f.final_apagar) return "El grupo dejó que el sol se apagara. La Orden del Crepúsculo celebra en las calles. Empieza una era de noche donde reinan los vampiros y la Sombra.";
  if (f.final_poder) return "El grupo tomó el control de la luz de la Cumbre. Ahora sois vosotros quienes decidís quién recibe luz en Solvaria. Para bien o para mal.";
  return typeof arc3Outcome === "function" ? arc3Outcome() : "";
}
function sacrificeBox() {
  const f = Store.world?.flags || {}; if (!f.final_sacrificio) return "";
  if (f.sacrificio_de) return f.sacrificio_de.id === G.id ? `<div class="result"><b>Te uniste al sol</b><div>Tu personaje es ahora parte de la luz de Solvaria. Escribe tu epílogo: te lo has ganado.</div></div>` : "";
  return `<div class="card"><h3>¿Quién se une al sol?</h3><p>Solo uno puede hacerlo. Quien dé el paso tendrá un final heroico y quedará como leyenda.</p><button type="button" class="btn primary small" data-g="sacrificio">☀️ Ofrecer a ${esc(G.nombre)}</button></div>`;
}
async function volunteer() {
  if (Store.world?.flags?.sacrificio_de) return;
  await Store.updateWorld({ flags: { sacrificio_de: { id: G.id, uid: Store.uid, nombre: G.nombre } } });
  G.g.flags.leyenda = true; addRayos({ corazon: 500, fama: 500 }); log("Te uniste al sol. Eres leyenda."); persist(); render();
}

// ---------- pantalla de combate ----------
const RACE_ICON = { Humano: "🧑", Elfo: "🧝", Enano: "🧔", Bestial: "🐺", "Dracónido": "🐲", "Sirénido": "🧜", "Feérico": "🧚", "Umbrío": "🌘", Orco: "👹", Celestial: "😇", Vampiro: "🧛", Semigigante: "🗿", Gnomo: "🧙", Forjado: "🤖", "Sílvano": "🌳", Naga: "🐍" };
const MON_ICON = [[/lobo/i, "🐺"], [/grifo|águila|halc/i, "🦅"], [/drag/i, "🐉"], [/cangrejo/i, "🦀"], [/espectro|fantasma|eco|espíritu|bruma/i, "👻"], [/trol/i, "🧌"], [/araña/i, "🕷️"], [/serpiente|naga|víbora/i, "🐍"], [/esqueleto|muert|zombi/i, "💀"], [/murciélago/i, "🦇"], [/jabalí/i, "🐗"], [/oso/i, "🐻"], [/yeti/i, "🦍"], [/gólem|golem|piedra/i, "🗿"], [/limo|slime/i, "🟢"], [/minotauro|toro/i, "🐂"], [/sapo|rana/i, "🐸"], [/nixie|sirena/i, "🧜"], [/hada|duende|pixie/i, "🧚"], [/gaviota|pájaro|ave|pluma/i, "🐦"], [/tiburón/i, "🦈"], [/kraken|pulpo/i, "🐙"], [/rata/i, "🐀"], [/búho/i, "🦉"], [/esfinge|león/i, "🦁"], [/vaelmor|heraldo/i, "👁️"], [/avatar|guardián|guardian/i, "🌟"], [/eclipse|cultista|sacerdot|capitán|luchador|ladr|pirata|bandido|darius|seraphina|thorne|garrok/i, "🥷"], [/elemental|fuego|llama/i, "🔥"], [/tormenta|rayo|chispa/i, "⚡"], [/hielo|escarcha/i, "❄️"], [/planta|árbol|raíz|enredadera/i, "🌿"]];
const AFF_ICON = { Fuego: "🔥", Agua: "💧", Tierra: "🪨", Aire: "🌪️", Rayo: "⚡", Luz: "✨", Sombra: "🌑" };
function monIcon(e) { for (const [re, ic] of MON_ICON) if (re.test(e.n)) return ic; return AFF_ICON[e.aff] || "👾"; }
const REGION_BG = { alba: ["#3a2c1a", "#6e5230"], verde: ["#132a1c", "#2c5a36"], llan: ["#3a3316", "#6d6128"], costa: ["#10233a", "#2a4d6e"], esc: ["#1c2a3a", "#4a6680"], quem: ["#3a1410", "#6e2a1c"], viol: ["#23143a", "#4a2a6e"], cap: ["#1f2530", "#434c5e"], lost: ["#0d0d1f", "#2b2450"] };
const ST_ICON = { Quemado: "🔥", Aturdido: "💫", Cegado: "🙈", Asustado: "😱" };
let bsnap = null; // para animar lo que cambió desde el último dibujo
function snapNow(c) { return { c, pv: G.pv, mana: G.mana, foes: c.enemies.map((e) => e.pv), last: c.log[c.log.length - 1], round: c.round }; }
function hpBar(v, m, cls) { const pct = m ? Math.max(0, Math.min(100, (v / m) * 100)) : 0; return `<span class="hp ${cls} ${pct < 25 ? "low" : pct < 55 ? "mid" : ""}"><i style="width:${pct}%"></i></span>`; }
function combatView() {
  const c = G.g.combat; const ps = c.pst;
  const alive = c.enemies.map((e, i) => ({ e, i })).filter((x) => x.e.pv > 0);
  if (gsel.target == null || !c.enemies[gsel.target] || c.enemies[gsel.target].pv <= 0) gsel.target = alive[0]?.i ?? 0;
  const prev = bsnap && bsnap.c === c ? bsnap : null;
  let dmgP = prev ? prev.pv - G.pv : 0; let dmgF = c.enemies.map((e, i) => (prev ? (prev.foes[i] ?? e.pv) - e.pv : 0));
  const idx = prev ? c.log.lastIndexOf(prev.last) : -1;
  let newLines = prev ? (idx < 0 ? Math.min(4, c.log.length) : c.log.length - 1 - idx) : Math.min(3, c.log.length);
  const changed = dmgP || dmgF.some(Boolean) || newLines;
  if (!changed && prev?.fx && Date.now() - prev.fx.at < 1200) ({ dmgP, dmgF, newLines } = prev.fx); // otro dibujo justo después: conserva la animación
  bsnap = { ...snapNow(c), fx: changed ? { dmgP, dmgF, newLines, at: Date.now() } : prev?.fx };
  const [bg1, bg2] = REGION_BG[G.g.loc.r] || REGION_BG.cap;
  const known = G.g.spells.map((s) => spellInfo(s.aff, s.n)).filter(Boolean);
  const pots = SHOP.filter((s) => ["potion", "mana", "energy"].includes(s.kind) && G.g.inv[s.n]);
  const pl = PLACE_OF(G.g.loc.r, G.g.loc.p);
  const pst = Object.entries(ps.st || {}).map(([k, v]) => `<span class="stc" title="${esc(STATUS_INFO[k] || k)}">${ST_ICON[k] || "•"} ${esc(k)} ${v}</span>`).join("");
  const buffs = [ps.barrier ? `🛡️ ${ps.barrier}` : "", ps.shield ? `🔰 ${ps.shield}` : "", ps.buff ? `⬆️ ventaja ${ps.buff}` : "", ps.forge ? `🔨 +${ps.forge}` : "", ps.grito ? `📣 ${ps.grito}` : "", ps.velo ? `🌫️ ${ps.velo}` : "", ps.defend ? "🛡️ guardia" : ""].filter(Boolean).map((b) => `<span class="stc buff">${b}</span>`).join("");
  const menu = gsel.cmenu || "main";
  const noCast = typeof treeNoCast === "function" && treeNoCast();
  let cmd;
  if (menu === "spells") cmd = `<div class="cmdhead"><button type="button" class="link" data-bm="main">← Volver</button><span class="muted">Maná ${G.mana}/${G.manaMax} · objetivo: ${esc(c.enemies[gsel.target]?.n || "")}</span></div>
    <div class="cmdgrid">${known.length ? known.map((sp) => { const cost = spellCost(sp); const short = G.mana < cost; return `<button type="button" class="cbtn spell" data-bcast="${esc(sp.aff)}|${esc(sp.n)}" ${noCast ? "disabled" : ""}><b>${AFF_ICON[sp.aff] || "✦"} ${esc(sp.n)}</b><small>${cost} maná${short ? " · sobrecarga" : ""} · ${esc(spellDesc(sp))}</small></button>`; }).join("") : `<p class="muted">No tienes hechizos. Desbloquéalos en el árbol de Magia.</p>`}</div>`;
  else if (menu === "items") cmd = `<div class="cmdhead"><button type="button" class="link" data-bm="main">← Volver</button></div>
    <div class="cmdgrid">${pots.length ? pots.map((s) => `<button type="button" class="cbtn" data-use="${esc(s.n)}"><b>🧪 ${esc(s.n)} ×${G.g.inv[s.n]}</b><small>${esc(s.desc)}</small></button>`).join("") : `<p class="muted">No llevas pociones. Cómpralas en cualquier tienda.</p>`}</div>`;
  else {
    const d = typeof dg === "function" ? dg() : null; const canB = d?.patron && godLevel() >= 50;
    cmd = `<div class="cmdgrid main">
      <button type="button" class="cbtn atk" data-atk="${gsel.target}"><b>⚔️ Atacar</b><small>${esc(G.g.arma.n)} · Poder ${G.g.arma.poder}</small></button>
      <button type="button" class="cbtn mag" data-bm="spells" ${known.length ? "" : "disabled"}><b>✨ Magia</b><small>${known.length} hechizo${known.length === 1 ? "" : "s"}${noCast ? " · bloqueada" : ""}</small></button>
      <button type="button" class="cbtn" data-bm="items"><b>🎒 Objetos</b><small>${pots.reduce((a, s) => a + G.g.inv[s.n], 0)} pociones</small></button>
      <button type="button" class="cbtn" data-g="defend"><b>🛡️ Defender</b><small>Mitad de daño esta ronda</small></button>
      ${canB ? `<button type="button" class="cbtn god" data-g="bless" ${canBless() && d.patron !== "aster" ? "" : "disabled"}><b>🙏 ${esc(DIOS[d.patron].ele.split(":")[0])}</b><small>${canBless() ? "Bendición de " + esc(DIOS[d.patron].c) : "Usada hoy"}</small></button>` : ""}
      ${typeof canMiracle === "function" && canMiracle() ? `<button type="button" class="cbtn god" data-g="miracle"><b>🌟 Milagro</b><small>Una vez por arco</small></button>` : ""}
      <button type="button" class="cbtn run" data-g="flee"><b>🏃 Huir</b><small>Agilidad${c.enemies.some((e) => e.boss) ? " −2 (jefe)" : ""}</small></button>
    </div>`;
  }
  const lines = c.log.slice(-Math.max(2, Math.min(4, newLines)));
  return `<div class="battle" style="--bg1:${bg1};--bg2:${bg2};--bgimg:url(bg/${G.g.loc.r}.jpg)">
    <div class="bhead"><span>⚔️ ${esc(c.kind === "boss" || c.kind === "story" || c.kind === "corrupt" || c.kind === "avatar" ? "Combate contra jefe" : c.kind === "arena" ? "Arena" : c.kind === "duel" ? "Duelo" : "Combate")} · ${esc(pl.n)}</span><span class="turn">Ronda ${c.round} · tu turno</span></div>
    <div class="stage">
      <div class="foes2">${c.enemies.map((e, i) => `<button type="button" class="foe2 ${e.pv <= 0 ? "dead" : ""} ${i === gsel.target && e.pv > 0 ? "tgt" : ""} ${dmgF[i] > 0 ? "hit" : ""}" data-tgt="${i}" ${e.pv <= 0 ? "disabled" : ""}>
          <div class="plate"><div class="pn"><b>${esc(e.n)}</b><span>Nv ${e.lvl}${e.boss ? " · JEFE" : ""}</span></div>${hpBar(e.pv, e.pvMax, "")}<div class="pv">${e.pv}/${e.pvMax} ${e.aff ? `<span class="aff">${AFF_ICON[e.aff] || ""} ${esc(e.aff)}</span>` : ""}</div>
            <div class="sts">${Object.entries(e.st || {}).map(([k, v]) => `<span class="stc">${ST_ICON[k] || "•"} ${esc(k)} ${v}</span>`).join("")}</div></div>
          <div class="sprite ${e.boss ? "boss" : ""}"><span>${monIcon(e)}</span><i class="pad"></i>${dmgF[i] > 0 ? `<em class="float">−${dmgF[i]}</em>` : dmgF[i] < 0 ? `<em class="float heal">+${-dmgF[i]}</em>` : ""}</div>
        </button>`).join("")}</div>
      <div class="me2 ${dmgP > 0 ? "hit" : ""}">
        <div class="sprite me portrait">${raceImg(G.raza, "rimg bt-img") || `<span>${RACE_ICON[G.raza] || "🧑"}</span>`}<i class="pad"></i>${dmgP > 0 ? `<em class="float">−${dmgP}</em>` : dmgP < 0 ? `<em class="float heal">+${-dmgP}</em>` : ""}</div>
        <div class="plate"><div class="pn"><b>${esc(G.nombre)}</b><span>Nv ${G.nivel}</span></div>
          <div class="lbl">PV ${hpBar(G.pv, G.pvMax, "")} <span class="pv">${G.pv}/${G.pvMax}</span></div>
          ${G.manaMax ? `<div class="lbl">MP ${hpBar(G.mana, G.manaMax, "mp")} <span class="pv">${G.mana}/${G.manaMax}</span></div>` : ""}
          <div class="lbl">EN ${hpBar(G.energia, G.energiaMax, "en")} <span class="pv">${G.energia}/${G.energiaMax}</span></div>
          <div class="sts">${pst}${buffs}</div></div>
      </div>
    </div>
    <div class="msgbox">${lines.map((l, i) => `<div class="${i >= lines.length - newLines ? "new" : "old"}" style="animation-delay:${Math.max(0, i - (lines.length - newLines)) * 0.35}s">${esc(l)}</div>`).join("")}</div>
    <div class="cmd">${cmd}</div>
    <details class="blog"><summary>Registro del combate</summary><div class="clog">${c.log.slice().reverse().map((l) => `<div>${esc(l)}</div>`).join("")}</div></details>
  </div>`;
}

// ---------- pantalla de victoria / derrota ----------
const _victory = victory;
victory = function () {
  const c = G.g.combat; const lv0 = G.nivel; const info = { kind: c.kind, key: c.placeKey, foes: c.enemies.map((e) => ({ n: e.n, lvl: e.lvl, aff: e.aff, boss: e.boss })), rounds: c.round };
  _victory();
  G.g.lastBattle = { won: true, ...info, lines: G.g.lastResult?.lines || [], lvlUp: G.nivel > lv0 ? G.nivel : 0 }; G.g.lastResult = null; gsel.cmenu = "main"; bsnap = null;
  persist(); render();
};
const _defeat = defeat;
defeat = function () {
  const c = G.g.combat; const info = { kind: c.kind, key: c.placeKey, foes: c.enemies.map((e) => ({ n: e.n, lvl: e.lvl, aff: e.aff, boss: e.boss })), rounds: c.round };
  _defeat();
  G.g.lastBattle = { won: false, ...info, lines: G.g.lastResult?.lines || [] }; G.g.lastResult = null; gsel.cmenu = "main"; bsnap = null;
  persist(); render();
};
const _pFlee = pFlee;
pFlee = function () { const before = !!G.g.combat; _pFlee(); if (before && !G.g.combat) { gsel.cmenu = "main"; bsnap = null; } };
function canHuntHere() {
  const pl = PLACE_OF(G.g.loc.r, G.g.loc.p); const lv = parseLvl(pl.lvl);
  return pl.mon.length && lv && !/Duelos|Ladrones$|Premios/.test(pl.mon.join()) && pl.t !== "arena";
}
function battleResult() {
  const b = G.g.lastBattle; if (!b) return "";
  const hunt = b.won && ["monster"].includes(b.kind) && canHuntHere();
  return `<div class="bresult ${b.won ? "win" : "lose"}">
    <div class="bres-title">${b.won ? "¡Victoria!" : "Derrota"}</div>
    <div class="bres-foes">${b.foes.map((f) => `<span>${monIcon(f)} ${esc(f.n)} <small>Nv ${f.lvl}</small></span>`).join("")}</div>
    <div class="bres-lines">${b.lines.map((l) => `<div>${esc(l)}</div>`).join("")}${b.won ? `<div class="muted">${b.rounds} ronda${b.rounds === 1 ? "" : "s"}</div>` : ""}</div>
    ${b.lvlUp ? `<div class="lvlup">⬆️ ¡Subiste a nivel ${b.lvlUp}!</div>` : ""}
    <div class="row">${hunt ? `<button type="button" class="btn primary" data-g="hunt" ${G.energia < 1 ? "disabled" : ""}>⚔️ Seguir cazando aquí (1 Energía)</button>` : ""}
      ${b.won && canHuntHere() ? `<button type="button" class="btn ghost" data-g="huntexplore">🔎 Explorar</button>` : ""}
      <button type="button" class="btn ghost" data-g="clearbattle">Continuar</button></div>
    ${hunt && G.energia < 1 ? `<p class="note">Sin Energía: descansa en una posada o usa un Tónico de energía.</p>` : ""}
  </div>`;
}
const _placeView = placeView;
function sceneBanner(r, title, sub) { return `<div class="scene" style="background-image:url(bg/${r}.jpg)"><div><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ""}</div></div>`; }
placeView = function () {
  const w = weatherFor(G.g.loc.r, G.g.day);
  return sceneBanner(G.g.loc.r, regionName(G.g.loc.r), `${CLIMAS[w].icon} ${w} · ${clockStr()}`) + battleResult() + _placeView();
};
const _storyView2 = storyView;
storyView = function () { const ch = chapter(); return (ch ? sceneBanner(ch.r, P[ch.r][ch.p].n, regionName(ch.r)) : sceneBanner("alba", "Cumbre del Alba", "Fin de la historia principal")) + _storyView2(); };
const _gameView = gameView;
gameView = function () { if (G) document.body.style.setProperty("--rbg", `url(bg/${G.g.combat ? G.g.loc.r : (gtab === "mapa" ? gsel.region || G.g.loc.r : G.g.loc.r)}.jpg)`); return _gameView(); };

// ---------- eventos ----------
document.addEventListener("click", (ev) => {
  if (view.name !== "game" || !G) return;
  const t = ev.target.closest("button"); if (!t) return;
  if (t.dataset.tgt != null && G.g.combat) { gsel.target = +t.dataset.tgt; return render(); }
  if (t.dataset.bm) { gsel.cmenu = t.dataset.bm; return render(); }
  if (t.dataset.bcast && G.g.combat) { const [a, n] = t.dataset.bcast.split("|"); gsel.cmenu = "main"; return pAttack(gsel.target ?? 0, spellInfo(a, n)); }
  const g = t.dataset.g; if (!g) return;
  if (g === "pausa") return togglePause();
  if (g === "sacrificio") return volunteer();
  if (g === "clearbattle") { G.g.lastBattle = null; return render(); }
  if (g === "hunt") { G.g.lastBattle = null; return fight("monster"); }
  if (g === "huntexplore") { G.g.lastBattle = null; return explore(); }
});
