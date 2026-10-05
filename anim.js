// ===================== ANIMACIONES: mapa y magia =====================
// Mapa: viaje animado de zona en zona, nubes, pines que laten, tu posición con radar, tarjetas que entran.
// Magia: hexágonos del color de la afinidad, aparición escalonada, estallido al desbloquear,
// y lista de hechizos ordenada por afinidad (y sub-afinidad). Carga después de extra.js.
(function () {
  if (typeof render !== "function") return;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const RM = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  const sfx = (k, ...a) => { try { window.SA_SFX?.[k]?.(...a); } catch (e) {} };
  const COL = { Fuego: "#ff7a2e", Agua: "#4fb3ff", Tierra: "#c79a55", Aire: "#9fe6ff", Rayo: "#ffe14d", Luz: "#fff2a8", Sombra: "#9b5cff", Tiempo: "#8fe0cf", Espacio: "#a98bff", Gravedad: "#7d6bd6", Realidad: "#e07ad6", "Creación": "#9be07a", Destino: "#e8c878", Alma: "#cfd9ff" };
  const ICON = { Fuego: "🔥", Agua: "💧", Tierra: "🪨", Aire: "🌪️", Rayo: "⚡", Luz: "☀️", Sombra: "🌑", Tiempo: "⏳", Espacio: "🌌", Gravedad: "🪐", Realidad: "🎭", "Creación": "🌱", Destino: "🎲", Alma: "👻" };
  const col = (a) => COL[a] || "#d9a441";
  const layer = () => { let l = document.getElementById("xanim"); if (!l) { l = document.createElement("div"); l.id = "xanim"; document.body.appendChild(l); } return l; };

  // =====================================================================
  // MAGIA
  // =====================================================================
  let lastAff = null, lastNode = null, burst = null;
  const dist = (id) => { const [q, r] = id.split(",").map(Number); return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2; };
  function spellsByAff() {
    const groups = G.afinidades.map((a) => ({ aff: a.n, list: [] }));
    for (const s of G.g.spells) { const sp = spellInfo(s.aff, s.n); if (!sp) continue; let g = groups.find((x) => x.aff === s.aff); if (!g) groups.push((g = { aff: s.aff, list: [] })); g.list.push(sp); }
    return groups;
  }
  function spellList() {
    const groups = spellsByAff(); const total = groups.reduce((a, g) => a + g.list.length, 0);
    if (!total) return `<h3 class="sub">${L("Tus hechizos", "Your spells")}</h3><p class="muted">${L("Aún no tienes hechizos. Desbloquea los del anillo núcleo.", "No spells yet. Unlock the core ring.")}</p>`;
    return `<h3 class="sub">${L("Tus hechizos por afinidad", "Your spells by affinity")} <small class="muted">(${total})</small></h3><div class="spg">${groups.map((g) => {
      const subs = [null, ...new Set(g.list.map((s) => s.sub).filter(Boolean))];
      const body = subs.map((sub) => { const ls = g.list.filter((s) => (s.sub || null) === sub).sort((a, b) => a.c - b.c || a.n.localeCompare(b.n)); if (!ls.length) return "";
        return `${sub ? `<div class="spsub">⬡ ${esc(sub)}</div>` : ""}<div class="splist">${ls.map((sp) => `<div class="spc"><span class="spcirc">${sp.c}</span><div><b>${esc(sp.n)}${sp.up ? " ▲" : ""}</b><small>${esc(sp.cat || "")} · ${spellCost(sp)} ${L("maná", "mana")}</small><small>${esc(spellDesc(sp))}</small></div></div>`).join("")}</div>`; }).join("");
      return `<details class="spaff" open style="--af:${col(g.aff)}"><summary><span class="spic">${ICON[g.aff] || "✦"}</span><b>${esc(g.aff)}</b><small>${g.list.length} ${g.list.length === 1 ? L("hechizo", "spell") : L("hechizos", "spells")}</small></summary>${g.list.length ? body : `<p class="muted">${L("Aún nada en esta afinidad.", "Nothing here yet.")}</p>`}</details>`; }).join("")}</div>`;
  }
  const _mv = magicView;
  magicView = function () {
    let out = _mv();
    if (!G?.afinidades?.length || typeof tsel === "undefined") return out;
    const aff = tsel.aff; const c = col(aff); const enter = aff !== lastAff && !RM(); lastAff = aff;
    out = out.replace('<svg class="hextree"', `<svg class="hextree af ${enter ? "enter" : ""}" style="--af:${c}"`);
    if (enter) out = out.replace(/<g class="hx ([^"]*)" data-hex="([^"]+)"/g, (m, cls, id) => `<g class="hx ${cls}" data-hex="${id}" style="animation-delay:${(dist(id) * 0.07).toFixed(2)}s"`);
    // color de las pastillas de afinidad
    out = out.replace(/<button type="button" class="chip ([^"]*)" data-g="taff:([^"]+)">([^<]+)<\/button>/g, (m, cls, a, t) => `<button type="button" class="chip afchip ${cls}" data-g="taff:${a}" style="--af:${col(a)}">${ICON[a] || ""} ${t}</button>`);
    // tarjeta del hexágono elegido: entra con animación solo cuando cambia
    if (tsel.node && tsel.node !== lastNode && !RM()) out = out.replace('<div class="treeside"><div class="card">', '<div class="treeside"><div class="card tsnew">');
    lastNode = tsel.node;
    // hechizos ordenados por afinidad
    out = out.replace(/<h3 class="sub">Tus hechizos<\/h3>[\s\S]*$/, spellList());
    return out;
  };
  if (typeof unlockNode === "function") {
    const _un = unlockNode;
    unlockNode = function (aff, id) {
      const was = !!unlocked(aff)[id]; const r = _un.apply(this, arguments);
      if (!was && unlocked(aff)[id]) { burst = { aff, id, at: Date.now() }; requestAnimationFrame(playBurst); }
      return r;
    };
  }
  function playBurst() {
    const b = burst; if (!b) return; burst = null;
    sfx("level"); setTimeout(() => sfx("impact", b.aff), 120);
    const g = document.querySelector(`.hextree [data-hex="${b.id}"]`); if (!g) return;
    g.classList.add("just");
    const [q, r] = b.id.split(",").map(Number);
    for (const d of HEX_DIRS) { const n = document.querySelector(`.hextree [data-hex="${q + d[0]},${r + d[1]}"]`); if (n && n.classList.contains("can")) { n.classList.add("newcan"); } }
    if (RM()) return;
    const rc = g.getBoundingClientRect(); const x = rc.left + rc.width / 2, y = rc.top + rc.height / 2; const c = col(b.aff);
    const box = document.createElement("div"); box.className = "hxburst"; box.style.cssText = `left:${x}px;top:${y}px;--af:${c}`;
    let h = `<i class="ring"></i><i class="ring r2"></i><i class="core"></i><em>${ICON[b.aff] || "✦"}</em>`;
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + Math.random() * 0.3; const d = 60 + Math.random() * 70; h += `<i class="spark" style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px;animation-delay:${(Math.random() * 0.08).toFixed(2)}s"></i>`; }
    box.innerHTML = h; layer().appendChild(box); setTimeout(() => box.remove(), 1400);
    const fl = document.createElement("div"); fl.className = "hxflash"; fl.style.setProperty("--af", c); layer().appendChild(fl); setTimeout(() => fl.remove(), 700);
  }

  // =====================================================================
  // MAPA
  // =====================================================================
  let trav = null, lastRegion = null, lastPin = null, lastPlace = null, raf = 0;
  const xyOf = (loc) => P[loc.r]?.[+loc.p]?.xy;
  const _travel = travel;
  travel = function (to, mode) {
    const from = { ...G.g.loc }; let h = 0; try { h = tripHours({ r: to.r, p: +to.p }, mode); } catch (e) {}
    const onMap = gtab === "mapa";
    const r = _travel.apply(this, arguments);
    try {
      const moved = G.g.loc.r !== from.r || G.g.loc.p !== from.p;
      if (moved && !RM()) {
        let after = null;
        if (onMap && gtab !== "mapa" && !G.g.combat) { after = gtab; gtab = "mapa"; render(); }
        startTravel(from, { ...G.g.loc }, mode || "pie", h, onMap, after);
      }
    } catch (e) { console.warn("anim:", e); }
    return r;
  };
  function startTravel(from, to, mode, hours, onMap, after) {
    const a = xyOf(from), b = xyOf(to); if (!a || !b) return;
    const icon = (G.g.montura && mode === "pie" && typeof window !== "undefined" ? ({ "Poni del Alba": "🐴", "Caballo de Trigalia": "🐎", "Lagarto de lava": "🦎", "Grifo joven": "🦅" }[G.g.montura]) : null) || (typeof MODES !== "undefined" && MODES[mode]?.icon) || "🥾";
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const dur = Math.max(1100, Math.min(2600, 700 + len * 3.2));
    const lift = Math.min(160, 40 + len * 0.25); const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - lift;
    trav = { a, b, c: [mx, my], t0: performance.now(), dur, icon, name: P[to.r][to.p].n, hours, sea: from.r !== to.r, after };
    sfx("flee");
    if (onMap && gtab === "mapa" && !G.g.combat) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    else if (!G.g.combat) travelCard(trav);
  }
  const qb = (t, p0, p1, p2) => (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  function tick(now) {
    const T = trav; if (!T) return;
    const svg = document.querySelector(".minimap svg");
    let t = Math.min(1, (now - T.t0) / T.dur); const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    if (svg) {
      svg.classList.add("traveling");
      let g = svg.querySelector("#xtrav");
      if (!g) {
        g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = "xtrav";
        const d = `M${T.a[0]},${T.a[1]} Q${T.c[0]},${T.c[1]} ${T.b[0]},${T.b[1]}`;
        g.innerHTML = `<path class="tr-bg" d="${d}"></path><path class="tr-fg" d="${d}" pathLength="100"></path><circle class="tr-from" cx="${T.a[0]}" cy="${T.a[1]}" r="14"></circle><g class="tr-tok"><circle r="24"></circle><text y="1">${T.icon}</text></g>`;
        svg.appendChild(g);
      }
      const fg = g.querySelector(".tr-fg"); fg.style.strokeDasharray = "100"; fg.style.strokeDashoffset = String(100 - e * 100);
      const x = qb(e, T.a[0], T.c[0], T.b[0]), y = qb(e, T.a[1], T.c[1], T.b[1]) - Math.abs(Math.sin(e * Math.PI * 7)) * 7;
      g.querySelector(".tr-tok").setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)})`);
    }
    if (t < 1 && gtab === "mapa") { raf = requestAnimationFrame(tick); return; }
    // llegada
    if (svg) {
      svg.classList.remove("traveling"); svg.querySelector("#xtrav")?.remove();
      const ns = "http://www.w3.org/2000/svg"; const ar = document.createElementNS(ns, "g"); ar.setAttribute("class", "tr-arrive");
      ar.innerHTML = `<circle cx="${T.b[0]}" cy="${T.b[1]}" r="22"></circle><circle class="a2" cx="${T.b[0]}" cy="${T.b[1]}" r="22"></circle>`; svg.appendChild(ar); setTimeout(() => ar.remove(), 1100);
      const lab = document.createElement("div"); lab.className = "tr-label"; lab.textContent = `📍 ${T.name}`; const mm = document.querySelector(".minimap"); if (mm) { mm.appendChild(lab); setTimeout(() => lab.remove(), 1800); }
    }
    sfx("click"); trav = null;
    if (T.after) setTimeout(() => { if (gtab === "mapa" && G && !G.g.combat) { gtab = T.after; render(); } }, 900);
  }
  function travelCard(T) {
    const el = document.createElement("div"); el.className = "trcard";
    el.innerHTML = `<div class="trc-in"><div class="trc-road"><i class="trc-dots"></i><span class="trc-tok">${T.icon}</span><span class="trc-end">📍</span></div><b>${L("Llegas a", "You arrive at")} ${esc(T.name)}</b>${T.hours ? `<small>${esc(typeof fmtH === "function" ? fmtH(T.hours) : T.hours + " h")} ${L("de viaje", "of travel")}${T.sea ? " · " + L("otra región", "new region") : ""}</small>` : ""}</div>`;
    layer().appendChild(el); setTimeout(() => el.classList.add("out"), 1500); setTimeout(() => el.remove(), 2000);
    trav = null;
  }
  const _mapView = mapView;
  mapView = function () {
    let out = _mapView();
    if (!G?.g) return out;
    const sel = gsel.region || G.g.loc.r; const regionChanged = sel !== lastRegion; lastRegion = sel;
    const pinChanged = gsel.pin && gsel.pin !== lastPin; lastPin = gsel.pin;
    const t = (Date.now() / 1000) % 240;
    out = out.replace(/(<div class="minimap"><img[^>]*>)/, `$1<div class="mclouds" style="animation-delay:-${t.toFixed(1)}s"><i></i><i></i><i></i></div>`);
    out = out.replace('<svg viewBox="0 0 1080 1024"', `<svg viewBox="0 0 1080 1024" class="${regionChanged && !RM() ? "mpop" : ""}"`);
    out = out.replace(/<circle class="me" cx="([\d.]+)" cy="([\d.]+)" r="22"><\/circle>/, (m, x, y) => `<circle class="mering" cx="${x}" cy="${y}" r="22"></circle><circle class="mering r2" cx="${x}" cy="${y}" r="22"></circle>${m}`);
    if (pinChanged && !RM()) out = out.replace('<div class="card pcard">', '<div class="card pcard pnew">');
    if (regionChanged && !RM()) out = out.replace('<div class="places">', '<div class="places pnew">');
    return out;
  };
  // Lugar: la escena entra con un zoom cuando llegas a un sitio nuevo
  const _pv = placeView;
  placeView = function () {
    let out = _pv(); if (!G?.g) return out; const k = `${G.g.loc.r}:${G.g.loc.p}`;
    if (k !== lastPlace && lastPlace !== null && !RM()) out = out.replace('<div class="scene"', '<div class="scene arrive"');
    lastPlace = k; return out;
  };
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    try { if (trav && gtab === "mapa" && document.querySelector(".minimap svg") && !document.querySelector("#xtrav")) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); } } catch (e) {}
    return r;
  };

  const css = `
#xanim{position:fixed;inset:0;pointer-events:none;z-index:75}
/* ---------- magia ---------- */
.hextree.af{background:radial-gradient(circle at 50% 50%,color-mix(in srgb,var(--af) 18%,transparent),transparent 70%);border-color:color-mix(in srgb,var(--af) 35%,var(--line))}
.hextree.af .hx{transform-box:fill-box;transform-origin:center;transition:transform .18s ease}
.hextree.af .hx:hover{transform:scale(1.07)}
.hextree.af .hx.on polygon{fill:color-mix(in srgb,var(--af) 30%,#0e1824);stroke:var(--af);filter:drop-shadow(0 0 3px color-mix(in srgb,var(--af) 55%,transparent))}
.hextree.af .hx.on text{fill:color-mix(in srgb,var(--af) 70%,#fff)}
.hextree.af .hx.on.puerta polygon,.hextree.af .hx.on.maestro polygon{fill:color-mix(in srgb,var(--af) 45%,#1a1030);stroke:#fff}
.hextree.af .hx.on.puerta text,.hextree.af .hx.on.maestro text{fill:#fff}
.hextree.af .hx.centro polygon{fill:color-mix(in srgb,var(--af) 55%,#0e1824);stroke:var(--af);stroke-width:3;filter:drop-shadow(0 0 8px var(--af))}
.hextree.af .hx.centro text{fill:#fff}
.hextree.af .hx.can polygon{stroke:var(--af);animation:hxCan 1.8s ease-in-out infinite}
.hextree.af .hx.can text{fill:#fff}
.hextree.af .hx.near polygon{stroke:color-mix(in srgb,var(--af) 45%,transparent)}
.hextree.af .hx.sel polygon{stroke:#fff;stroke-width:3;animation:hxSel 1.2s ease-in-out infinite}
@keyframes hxCan{50%{stroke-opacity:.35}}
@keyframes hxSel{50%{filter:drop-shadow(0 0 7px var(--af))}}
.hextree.enter .hx{animation:hxIn .45s cubic-bezier(.2,1.4,.4,1) both}
@keyframes hxIn{from{opacity:0;transform:scale(.3) rotate(-30deg)}to{opacity:1;transform:none}}
.hextree .hx.just{animation:hxJust .9s cubic-bezier(.2,1.5,.4,1)}
@keyframes hxJust{0%{transform:scale(.6)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
.hextree .hx.just polygon{animation:hxGlow 1.2s ease-out}
@keyframes hxGlow{0%{fill:#fff}100%{}}
.hextree .hx.newcan{animation:hxNew .8s .25s ease-out both}
@keyframes hxNew{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
.hxburst{position:fixed;width:0;height:0}
.hxburst i{position:absolute;left:0;top:0;border-radius:50%}
.hxburst .ring{width:30px;height:30px;margin:-15px;border:3px solid var(--af);animation:hbRing .9s ease-out forwards;box-shadow:0 0 18px var(--af)}
.hxburst .ring.r2{animation-delay:.12s;border-width:2px}
.hxburst .core{width:40px;height:40px;margin:-20px;background:radial-gradient(circle,#fff,var(--af) 45%,transparent 70%);animation:hbCore .6s ease-out forwards}
.hxburst .spark{width:7px;height:7px;margin:-3.5px;background:var(--af);box-shadow:0 0 8px var(--af);animation:hbSpark .9s ease-out forwards}
.hxburst em{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-style:normal;font-size:34px;animation:hbIcon 1.3s ease-out forwards;filter:drop-shadow(0 0 8px var(--af))}
@keyframes hbRing{from{transform:scale(.4);opacity:1}to{transform:scale(6);opacity:0}}
@keyframes hbCore{from{transform:scale(.2);opacity:1}to{transform:scale(2.4);opacity:0}}
@keyframes hbSpark{from{transform:translate(0,0) scale(1);opacity:1}to{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0}}
@keyframes hbIcon{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}30%{transform:translate(-50%,-90%) scale(1.3);opacity:1}100%{transform:translate(-50%,-190%) scale(1);opacity:0}}
.hxflash{position:fixed;inset:0;background:radial-gradient(circle,color-mix(in srgb,var(--af) 28%,transparent),transparent 70%);animation:hxFl .7s ease-out forwards}
@keyframes hxFl{from{opacity:1}to{opacity:0}}
.treeside .card.tsnew{animation:tsIn .35s cubic-bezier(.2,1.2,.4,1)}
@keyframes tsIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
.chip.afchip{border-color:color-mix(in srgb,var(--af) 55%,var(--line))}
.chip.afchip.on{background:color-mix(in srgb,var(--af) 22%,transparent);border-color:var(--af);color:#fff;box-shadow:0 0 10px color-mix(in srgb,var(--af) 40%,transparent)}
.spg{display:flex;flex-direction:column;gap:10px}
.spaff{border:1px solid color-mix(in srgb,var(--af) 45%,var(--line));border-left:4px solid var(--af);border-radius:8px;background:linear-gradient(90deg,color-mix(in srgb,var(--af) 10%,transparent),transparent 60%),var(--panel-2);padding:8px 12px}
.spaff summary{cursor:pointer;display:flex;align-items:center;gap:8px;list-style:none}.spaff summary::-webkit-details-marker{display:none}
.spaff summary b{font-family:var(--display);font-size:17px;color:var(--af)}.spaff summary small{color:var(--ink-2)}
.spic{font-size:20px}.spsub{margin:10px 0 4px;color:var(--af);font-family:var(--display);font-size:13.5px;letter-spacing:.04em}
.splist{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(250px,100%),1fr));gap:8px;margin-top:8px}
.spc{display:flex;gap:10px;align-items:flex-start;background:#0b131c99;border:1px solid var(--line);border-radius:6px;padding:8px 10px;transition:transform .15s,border-color .15s}
.spc:hover{transform:translateY(-2px);border-color:var(--af)}
.spc>div{display:flex;flex-direction:column;gap:2px;min-width:0}.spc small{color:var(--ink-2);font-size:12.5px}
.spcirc{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:12.5px;font-weight:700;color:#0b131c;background:var(--af);box-shadow:0 0 8px color-mix(in srgb,var(--af) 50%,transparent)}
/* ---------- mapa ---------- */
.mclouds{position:absolute;inset:0;pointer-events:none;overflow:hidden;opacity:.55;mix-blend-mode:screen}
.mclouds i{position:absolute;width:55%;height:32%;border-radius:50%;background:radial-gradient(ellipse at center,#ffffff38,#ffffff10 45%,transparent 70%);filter:blur(6px);animation:mcl 240s linear infinite;animation-delay:inherit}
.mclouds i:nth-child(1){top:8%;left:-60%}.mclouds i:nth-child(2){top:48%;left:-60%;animation-duration:180s;opacity:.7}.mclouds i:nth-child(3){top:70%;left:-60%;animation-duration:300s;width:40%}
@keyframes mcl{from{transform:translateX(0)}to{transform:translateX(330%)}}
.minimap svg .gpin{transform-box:fill-box;transform-origin:center;transition:transform .18s ease}
.minimap svg .gpin:hover{transform:scale(1.18)}
.minimap svg .gpin.on{transform:scale(1.22)}
.minimap svg .gpin.on circle{animation:pinOn 1.4s ease-in-out infinite}
@keyframes pinOn{50%{stroke-width:6;stroke:#ffd84a}}
.minimap svg.mpop .gpin:not(.far){animation:pinPop .5s cubic-bezier(.2,1.5,.4,1) both}
.minimap svg.mpop .gpin:nth-child(3n){animation-delay:.05s}.minimap svg.mpop .gpin:nth-child(3n+1){animation-delay:.1s}.minimap svg.mpop .gpin:nth-child(3n+2){animation-delay:.15s}
@keyframes pinPop{from{opacity:0;transform:translateY(-18px) scale(.4)}to{opacity:1;transform:none}}
.minimap .hot.sel{animation:regGlow 2.4s ease-in-out infinite}
@keyframes regGlow{50%{fill:#d9a44133;stroke-width:6}}
.minimap circle.mering{fill:none;stroke:#e0735c;stroke-width:4;pointer-events:none;transform-box:fill-box;transform-origin:center;animation:meRing 2.2s ease-out infinite}
.minimap circle.mering.r2{animation-delay:1.1s}
@keyframes meRing{from{transform:scale(1);opacity:.9}to{transform:scale(2.6);opacity:0}}
.minimap svg.traveling circle.me,.minimap svg.traveling circle.mering{opacity:0}
#xtrav path{fill:none;pointer-events:none}#xtrav .tr-bg{stroke:#0008;stroke-width:9;stroke-dasharray:2 14;stroke-linecap:round}
#xtrav .tr-fg{stroke:#ffd84a;stroke-width:6;stroke-linecap:round;filter:drop-shadow(0 0 5px #ffd84a)}
#xtrav .tr-from{fill:none;stroke:#ffd84a88;stroke-width:3}
#xtrav .tr-tok circle{fill:#0e1a26;stroke:#ffd84a;stroke-width:4;filter:drop-shadow(0 4px 6px #000)}
#xtrav .tr-tok text{font-size:26px;text-anchor:middle;dominant-baseline:central}
.tr-arrive circle{fill:none;stroke:#ffd84a;stroke-width:6;transform-box:fill-box;transform-origin:center;animation:meRing 1s ease-out forwards}.tr-arrive .a2{animation-delay:.2s}
.tr-label{position:absolute;left:50%;top:10px;transform:translateX(-50%);background:#0b131cdd;border:1px solid #ffd84a;border-radius:999px;padding:4px 14px;font-family:var(--display);color:#fff3d6;animation:trLab 1.8s ease forwards;white-space:nowrap}
@keyframes trLab{0%{opacity:0;transform:translate(-50%,-10px)}15%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
.pcard.pnew{animation:tsIn .35s cubic-bezier(.2,1.2,.4,1)}
.places.pnew .pl{animation:plIn .4s ease both}.places.pnew .pl:nth-child(2){animation-delay:.04s}.places.pnew .pl:nth-child(3){animation-delay:.08s}.places.pnew .pl:nth-child(4){animation-delay:.12s}.places.pnew .pl:nth-child(5){animation-delay:.16s}.places.pnew .pl:nth-child(6){animation-delay:.2s}.places.pnew .pl:nth-child(n+7){animation-delay:.24s}
@keyframes plIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.pl{transition:transform .15s,border-color .15s}.pl:hover{transform:translateY(-2px)}
.trcard{position:fixed;left:50%;top:34%;transform:translate(-50%,-50%);animation:trcIn .35s ease;transition:opacity .45s,transform .45s}
.trcard.out{opacity:0;transform:translate(-50%,-60%)}
.trc-in{background:#0b131cf0;border:1px solid #ffd84a99;border-radius:12px;padding:16px 22px;display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:0 10px 40px #000c;min-width:260px}
.trc-in b{font-family:var(--display);color:#fff3d6;font-size:18px}.trc-in small{color:var(--ink-2)}
.trc-road{position:relative;width:220px;height:34px}
.trc-dots{position:absolute;left:10px;right:20px;top:50%;border-top:3px dashed #ffd84a88}
.trc-tok{position:absolute;left:0;top:50%;transform:translateY(-50%);font-size:24px;animation:trcTok 1.3s cubic-bezier(.4,0,.2,1) forwards}
.trc-end{position:absolute;right:0;top:50%;transform:translateY(-50%);font-size:20px;animation:trcEnd 1.3s ease forwards}
@keyframes trcIn{from{opacity:0;transform:translate(-50%,-40%)}to{opacity:1;transform:translate(-50%,-50%)}}
@keyframes trcTok{0%{left:0}20%{transform:translateY(-70%)}40%{transform:translateY(-40%)}60%{transform:translateY(-70%)}80%{transform:translateY(-40%)}100%{left:calc(100% - 44px);transform:translateY(-50%)}}
@keyframes trcEnd{0%,85%{transform:translateY(-50%) scale(1)}95%{transform:translateY(-50%) scale(1.5)}100%{transform:translateY(-50%) scale(1.2)}}
.scene.arrive{animation:scArr .8s cubic-bezier(.2,1,.3,1)}
@keyframes scArr{from{filter:brightness(1.7) blur(4px);clip-path:inset(0 35% 0 35% round 8px)}to{filter:none;clip-path:inset(0 0 0 0 round 8px)}}
@media (prefers-reduced-motion:reduce){.mclouds,.minimap circle.mering,.hextree.af .hx.can polygon,.minimap .hot.sel,.minimap svg .gpin.on circle{animation:none!important}}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
