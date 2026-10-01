// ===================== HISTORIA 2.0 =====================
// Convierte cada capítulo en una misión con pasos, escenas con diálogos y un panel "Qué hacer ahora".
// Cada jugador avanza a su ritmo; solo la decisión del grupo es compartida, y ya no se bloquea
// por jugadores que no están conectados. Carga después de efectos.js y misiones.js.
(function () {
  if (typeof STORY === "undefined" || typeof render !== "function") return;
  const MISIONES = window.MISIONES || {}, ESCENAS = window.ESCENAS || {}, NPC = window.SA_NPC || {};
  const ACTIVE_MS = 20 * 60 * 1000; // conectado en los últimos 20 minutos
  const sfx = (k, ...a) => { try { window.SA_SFX?.[k]?.(...a); } catch (e) {} };
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const T = (s) => String(s || "").replace(/\{n\}/g, G?.nombre || "").replace(/\{r\}/g, (G?.raza || "").toLowerCase());
  const chOf = (cap) => STORY.find((s) => s.cap === cap);
  const here = (r, p) => G.g.loc.r === r && G.g.loc.p === +p;
  const placeName = (r, p) => (P[r] && P[r][p] ? P[r][p].n : "?");

  // ---------- misión de un capítulo (las que no están escritas usan una genérica) ----------
  function missionOf(cap) {
    if (MISIONES[cap]) return MISIONES[cap];
    const ch = chOf(cap); if (!ch) return null;
    const steps = [{ k: "scene", id: `gen_${cap}`, t: L("Lo que está pasando", "What is happening"), auto: true }, { k: "go", r: ch.r, p: ch.p }, { k: "choice" }];
    if (ch.boss) steps.push({ k: "boss" });
    steps.push({ k: "vote" });
    return { steps, generic: true };
  }
  function sceneOf(id) {
    if (ESCENAS[id]) return ESCENAS[id];
    const m = /^gen_(\d+)$/.exec(id); if (!m) return null; const ch = chOf(+m[1]); if (!ch) return null;
    return { bg: ch.r, lines: [...ch.text] };
  }

  // ---------- estado del jugador ----------
  function M() {
    const g = G.g;
    if (!g.mis || !chOf(g.mis.cap)) {
      const wc = worldCap(); let pc = Math.min(wc, STORY[STORY.length - 1].cap);
      for (let c = 1; c <= wc; c++) if (chOf(c) && !g.story[c]) { pc = c; break; }
      g.mis = { cap: pc, i: 0, n: 0, seen: {}, intro: false };
    }
    return g.mis;
  }
  const curStep = () => { const m = M(); const mi = missionOf(m.cap); return mi ? mi.steps[m.i] : null; };
  function stepDone(st, m) {
    if (!st) return false;
    if (st.k === "go") return here(st.r, st.p);
    if (st.k === "choice") return !!G.g.story[m.cap];
    if (st.k === "boss") { const ch = chOf(m.cap); return !ch?.boss || !!G.g.flags[`jefe_${m.cap}`] || (ch.boss.god && typeof godCorrupt === "function" && !godCorrupt(ch.boss.god)); }
    if (st.k === "vote") return worldCap() > m.cap;
    if (st.k === "hunt" || st.k === "explore") return m.n >= (st.n || 1);
    return false; // scene y fight se completan al terminarlos
  }
  let pendingIntro = false, pendingDone = null;
  function sync() {
    if (!G || !G.g) return false;
    const m = M(); let changed = false; let guard = 0;
    while (guard++ < 30) {
      const mi = missionOf(m.cap); if (!mi) break;
      const st = mi.steps[m.i];
      if (!st) { // capítulo completado
        let done = null; if (m.fin !== m.cap) { done = completeChapter(m.cap); m.fin = m.cap; changed = true; }
        if (!chOf(m.cap + 1)) { if (done) pendingDone = done; break; }
        m.cap++; m.i = 0; m.n = 0; m.intro = false; if (done) pendingDone = done; changed = true;
        continue;
      }
      if (stepDone(st, m)) { finishStep(st, m, true); changed = true; continue; }
      break;
    }
    if (!m.intro && chOf(m.cap)) { m.intro = true; pendingIntro = true; changed = true; }
    return changed;
  }
  function finishStep(st, m, silent) {
    if (st.k === "explore" && st.give) { addItem(st.give); if (!silent) toast(L(`Consigues: ${st.give}`, `You got: ${st.give}`)); }
    m.i++; m.n = 0;
  }
  function completeChapter(cap) {
    const ch = chOf(cap); const xp = Math.round(0.5 * xpToNext(G.nivel)); const soles = 5 + 3 * cap;
    const before = G.nivel; gainXP(xp); G.dinero.soles += soles; addRayos({ fama: 10 });
    const h = (Store.world?.history || []).find((x) => x.cap === cap);
    log(`Completaste el capítulo ${cap}: ${ch?.t || ""}.`);
    return { cap, t: ch?.t || "", xp, soles, lvl: G.nivel > before ? G.nivel : 0, decision: h?.label || "" };
  }
  function markStep() { const m = M(); const st = curStep(); if (st) finishStep(st, m, false); sync(); persist(); render(); }

  // ---------- retratos ----------
  function face(id, cls = "") {
    if (id === "tu") { const img = typeof raceImg === "function" ? raceImg(G.raza, "rimg") : ""; return `<span class="npcface ${cls}" style="--c:#d9a441">${img || `<b>${esc((G.nombre || "?")[0])}</b>`}</span>`; }
    const n = NPC[id] || { n: id, c: "#9aa4b2" }; const ini = n.n.split(/\s+/).filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w)).slice(0, 2).map((w) => w[0]).join("") || "?";
    return `<span class="npcface ${cls}" style="--c:${n.c}"><b>${esc(ini)}</b><img src="${n.img || `npc/${id}.png`}" alt="" onerror="this.remove()"></span>`;
  }
  if (typeof monIcon === "function") { // rivales con retrato de personaje, y monstruos con imagen prestada
    const _mi = monIcon; const FIGHT = window.SA_NPC_FIGHT || {};
    monIcon = function (e) {
      const npc = e && (e.npc || FIGHT[e.n]);
      if (npc) return `<span class="npcface fight" style="--c:${(NPC[npc] || {}).c || "#999"}"><b>${esc(e.n[0])}</b><img src="npc/${npc}.png" alt="" onerror="this.remove()"></span>`;
      return _mi(e && e.img ? { ...e, n: e.img } : e);
    };
  }


  // ---------- dioses: retratos (carpeta dioses/) ----------
  const GODS = typeof DIOSES !== "undefined" ? DIOSES : [];
  const godImg = (id, cls = "gimg") => `<img class="${cls}" src="dioses/${id}.png" alt="" onerror="this.remove()">`;
  GODS.forEach((x) => { if (!NPC[x.id]) NPC[x.id] = { n: x.n, t: x.t === "Caído" ? "Dios caído" : `Dios ${x.t.toLowerCase()}`, c: ({ Luz: "#fff2a8", Fuego: "#ff7a2e", Agua: "#4fb3ff", Rayo: "#6e8cff", Tierra: "#9ab060", Aire: "#c8f3ff", Sombra: "#9b5cff", Gravedad: "#7d6bd6", Tiempo: "#d9a441", Espacio: "#a98bff", Realidad: "#e07ad6", "Creación": "#8be0a8", Destino: "#e05050", Alma: "#cfd9ff" })[x.afin] || (x.id === "solen" ? "#ffd84a" : "#d9a441"), img: `dioses/${x.id}.png` }; });
  if (typeof monIcon === "function") {
    const _mi2 = monIcon;
    monIcon = function (e) {
      const m = e && /^Avatar de (.+)$/.exec(e.n); const g = m && GODS.find((x) => x.c === m[1]);
      if (g) return `<span class="npcface fight" style="--c:${NPC[g.id].c}"><b>${esc(g.c[0])}</b>${godImg(g.id, "")}</span>`;
      if (e && e.n === "Luchador de la arena") return `<img class="mimg" src="dioses/luchador-de-la-arena.png" alt="">`;
      return _mi2(e);
    };
  }
  if (typeof diosesView === "function") {
    const _dv = diosesView;
    diosesView = function () {
      let h = _dv();
      for (const x of GODS) {
        h = h.split(`<h3>${esc(x.n)}</h3>`).join(`<h3 class="ghead">${godImg(x.id, "gimg big")}${esc(x.n)}</h3>`);
        h = h.split(`<td><b>${esc(x.c)}</b>`).join(`<td><b>${godImg(x.id)}${esc(x.c)}</b>`);
      }
      return h;
    };
  }

  // ---------- reproductor de escenas ----------
  const SCENE_BGS = ["taberna", "patio", "salon", "faro", "arena", "copaalta", "observatorio", "cueva", "cumbre", "puerto"];
  let S = null; // escena en curso
  function flatten(lines) { return lines.slice(); }
  function openScene(id, opts = {}) {
    const sc = sceneOf(id); if (!sc) { if (opts.onEnd) opts.onEnd(); return; }
    closeScene(true);
    S = { id, q: flatten(sc.lines), bg: sc.bg || G.g.loc.r, replay: !!opts.replay, onEnd: opts.onEnd, typing: null, choice: null, last: null };
    const el = document.createElement("div"); el.id = "sov"; el.className = "sov"; document.body.appendChild(el);
    el.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-sc]"); if (b) { ev.stopPropagation(); return pickChoice(+b.dataset.sc); }
      if (ev.target.closest(".sov-skip")) { ev.stopPropagation(); return skipScene(); }
      if (S && !S.choice) nextLine();
    });
    sfx("click"); nextLine();
  }
  function closeScene(silent) { const el = document.getElementById("sov"); if (el) el.remove(); if (S?.typing) clearInterval(S.typing); if (!silent) S = null; }
  function drawScene(speaker, text, choices) {
    const el = document.getElementById("sov"); if (!el || !S) return;
    const isNpc = speaker && speaker !== "narr"; const npc = speaker === "tu" ? { n: G.nombre, t: G.raza } : NPC[speaker] || null;
    const strip = SCENE_BGS.includes(S.bg); const bgu = strip ? `escenas/${S.bg}.jpg` : `bg/${S.bg}.jpg`;
    el.innerHTML = `<div class="sov-bg ${strip ? "blur" : ""}" style="background-image:url(${bgu})"></div>${strip ? `<div class="sov-strip" style="background-image:url(${bgu})"></div>` : ""}<div class="sov-shade"></div>
      <div class="sov-top"><span>${esc(chOf(M().cap) && !S.replay ? "" : "")}</span><button type="button" class="sov-skip">${L("Saltar ⏭", "Skip ⏭")}</button></div>
      <div class="sov-cast">${isNpc ? `<div class="sov-face ${speaker === "tu" ? "me" : ""}">${face(speaker, "big")}</div>` : ""}</div>
      <div class="sov-box ${isNpc ? "talk" : "narr"}" style="--c:${speaker === "tu" ? "#d9a441" : (NPC[speaker] || {}).c || "#d9a441"}">
        ${isNpc && npc ? `<div class="sov-name">${esc(npc.n)}${npc.t ? ` <small>${esc(npc.t)}</small>` : ""}</div>` : ""}
        <div class="sov-text"></div>
        ${choices ? `<div class="sov-choices">${choices.map((c, i) => `<button type="button" class="sov-ch" data-sc="${i}">${esc(T(c.l))}</button>`).join("")}</div>` : `<div class="sov-next">▼</div>`}
      </div>`;
    const t = el.querySelector(".sov-text"); const full = T(text || "");
    if (S.typing) clearInterval(S.typing);
    if (choices) { t.textContent = full; return; }
    let k = 0; S.full = full; S.tEl = t;
    S.typing = setInterval(() => { k += 2; t.textContent = full.slice(0, k); if (k >= full.length) { clearInterval(S.typing); S.typing = null; } }, 18);
  }
  function nextLine() {
    if (!S) return;
    if (S.typing) { clearInterval(S.typing); S.typing = null; if (S.tEl) S.tEl.textContent = S.full; return; }
    let ln;
    while (S.q.length) {
      ln = S.q.shift();
      if (ln && typeof ln === "object" && !Array.isArray(ln)) {
        if (ln.if) { let ok = false; try { ok = !!ln.if(G); } catch (e) {} S.q.unshift(...((ok ? ln.then : ln.else) || [])); continue; }
        if (ln.bg) { S.bg = ln.bg; continue; }
        if (ln.sfx) { sfx(ln.sfx); continue; }
        if (ln.fx) { if (!S.replay) applyFx(ln.fx); continue; }
        if (ln.c) { S.choice = ln.c; drawScene(S.last?.[0] || "narr", S.last?.[1] || "", ln.c.map((c) => ({ l: c.l }))); return; }
        continue;
      }
      break;
    }
    if (ln === undefined || (!S.q.length && ln === undefined)) return endScene();
    if (typeof ln === "string") { S.last = ["narr", ln]; drawScene("narr", ln); }
    else if (Array.isArray(ln)) { S.last = ln; drawScene(ln[0], ln[1]); }
    else return endScene();
    sfx("click");
  }
  function pickChoice(i) {
    if (!S?.choice) return; const c = S.choice[i]; S.choice = null; sfx("click");
    if (c?.fx && !S.replay) { const out = applyFx(c.fx); if (out.length) toast(out.join(" · ")); }
    const says = /^«/.test(c.l); // lo que va entre comillas lo dice tu personaje; lo demás es una acción
    S.q.unshift(...(says ? [["tu", c.l.replace(/^«|»$/g, "")]] : []), ...((c && c.then) || []));
    nextLine();
  }
  function skipScene() {
    if (!S) return; if (S.typing) { clearInterval(S.typing); S.typing = null; }
    while (S.q.length) { const ln = S.q[0]; if (ln && ln.c) break; if (ln && ln.if) { S.q.shift(); let ok = false; try { ok = !!ln.if(G); } catch (e) {} S.q.unshift(...((ok ? ln.then : ln.else) || [])); continue; } if (ln && ln.fx && !S.replay) applyFx(ln.fx); S.q.shift(); }
    if (S.q.length) nextLine(); else endScene();
  }
  function endScene() { const cb = S?.onEnd; closeScene(); if (cb) cb(); }
  function playStepScene() {
    const st = curStep(); if (!st || st.k !== "scene") return; const m = M(); const id = st.id;
    openScene(id, { onEnd: () => { const s2 = curStep(); if (s2 && s2.k === "scene" && s2.id === id && M().cap === m.cap) { M().seen[id] = true; markStep(); } } });
  }
  document.addEventListener("keydown", (ev) => { if (!S || !document.getElementById("sov")) return; if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); if (!S.choice) nextLine(); } else if (ev.key === "Escape") skipScene(); });

  // ---------- tarjetas grandes: capítulo nuevo y capítulo completado ----------
  function chapterCard(cap, then) {
    const ch = chOf(cap); if (!ch) return then && then();
    const arc = arcOf(cap); const mi = missionOf(cap);
    const el = document.createElement("div"); el.className = "chcard";
    el.innerHTML = `<div><small>${L("Arco", "Arc")} ${arc.n} · ${esc(arc.t)}${mi?.sub ? ` · ${esc(mi.sub)}` : ""}</small><span>${L("Capítulo", "Chapter")} ${cap - arc.from + 1}</span><b>${esc(ch.t)}</b></div>`;
    document.body.appendChild(el); sfx("chapter");
    const go = () => { if (!el.isConnected) return; el.classList.add("out"); setTimeout(() => { el.remove(); if (then) then(); }, 450); };
    el.addEventListener("click", go); setTimeout(go, 2600);
  }
  function doneCard(d, then) {
    const el = document.createElement("div"); el.className = "chcard done";
    el.innerHTML = `<div><small>${L("Capítulo completado", "Chapter complete")}</small><b>${esc(d.t)}</b>
      <p>+${d.xp} XP · +${d.soles} Soles · +10 ${L("Rayos de Fama", "Fame Rays")}${d.lvl ? ` · ⬆️ ${L("Nivel", "Level")} ${d.lvl}` : ""}</p>
      ${d.decision ? `<p class="dec">${L("El grupo decidió", "The group decided")}: <b>${esc(d.decision)}</b></p>` : ""}<em>${L("Toca para seguir", "Tap to continue")}</em></div>`;
    document.body.appendChild(el); sfx("victory");
    const go = () => { if (!el.isConnected) return; el.classList.add("out"); setTimeout(() => { el.remove(); if (then) then(); }, 450); };
    el.addEventListener("click", go); setTimeout(go, 4500);
  }
  let busyCards = false;
  function runPending() {
    if (busyCards || S || !G || view.name !== "game" || G.g.combat) return;
    if (pendingDone) { const d = pendingDone; pendingDone = null; busyCards = true; return doneCard(d, () => { busyCards = false; runPending(); }); }
    if (pendingIntro) { pendingIntro = false; busyCards = true; return chapterCard(M().cap, () => { busyCards = false; autoScene(); }); }
    autoScene();
  }
  let lastAuto = "";
  function autoScene() {
    const st = curStep(); if (!st || st.k !== "scene" || !st.auto || S || G.g.combat) return;
    const key = M().cap + ":" + M().i; if (lastAuto === key) return; lastAuto = key;
    setTimeout(() => { if (!S && curStep() === st) playStepScene(); }, 350);
  }

  function fLvl(e) { return e.lvl === "rec" ? Math.max(1, (typeof recLvl === "function" ? recLvl(M().cap) : G.nivel) + (e.plus || 0)) : e.lvl; }
  // ---------- pasos: textos y botones ----------
  function stepLabel(st, m) {
    if (!st) return "";
    if (st.t) return T(st.t);
    const ch = chOf(m.cap);
    return { go: L(`Viaja a ${placeName(st.r, st.p)}`, `Travel to ${placeName(st.r, st.p)}`), choice: L("Decide qué haces en este capítulo", "Decide what you do"), boss: L(`Vence a ${ch?.boss?.n}`, `Defeat ${ch?.boss?.n}`), vote: L("Decisión del grupo", "Group decision"), scene: L("Escena", "Scene") }[st.k] || st.k;
  }
  function goBtn(r, p) { const h = tripHours({ r, p: +p }, "pie"); return `<button type="button" class="btn primary small" data-go="${r}:${p}">🧭 ${L("Viajar a", "Travel to")} ${esc(placeName(r, p))} · ${esc(fmtH(h))}</button>`; }
  function stepAction(st, m) {
    if (!st) return "";
    const need = st.r != null && !here(st.r, st.p);
    switch (st.k) {
      case "scene": return `<button type="button" class="btn primary small" data-mis="scene">▶ ${L("Ver escena", "Play scene")}</button>`;
      case "go": return goBtn(st.r, st.p);
      case "hunt": return need ? goBtn(st.r, st.p) : `<button type="button" class="btn primary small" data-g="fight" ${G.energia < 1 ? "disabled" : ""}>⚔️ ${L("Cazar aquí", "Hunt here")} (${m.n}/${st.n})</button>${G.energia < 1 ? `<span class="note"> ${L("Sin Energía: descansa en una posada.", "No Energy: rest at an inn.")}</span>` : ""}`;
      case "explore": return need ? goBtn(st.r, st.p) : `<button type="button" class="btn primary small" data-g="explore" ${G.energia < 1 ? "disabled" : ""}>🔎 ${L("Explorar aquí", "Explore here")} (${m.n}/${st.n})</button>`;
      case "fight": return need ? goBtn(st.r, st.p) : `<button type="button" class="btn primary small" data-mis="fight">⚔️ ${esc(st.e.n)} · ${L("Nv", "Lv")} ${fLvl(st.e)}</button>`;
      case "choice": return gtab === "historia" ? `<span class="note">${L("Elige abajo.", "Choose below.")}</span>` : `<button type="button" class="btn primary small" data-gtab="historia">🎲 ${L("Decidir", "Decide")}</button>`;
      case "boss": { const ch = chOf(m.cap); return !here(ch.r, ch.p) ? goBtn(ch.r, ch.p) : `<button type="button" class="btn primary small" data-g="storyboss">💀 ${L("Enfrentar", "Fight")} · ${esc(ch.boss.n)}</button>`; }
      case "vote": {
        const w = Store.world; const myVote = w?.votes?.[m.cap]?.[Store.uid];
        if (myVote) { const wait = waitingFor(m.cap); return `<span class="note">✅ ${L("Votaste.", "You voted.")} ${wait.length ? L(`Esperando a: ${wait.join(", ")}`, `Waiting for: ${wait.join(", ")}`) : L("Cerrando la votación…", "Closing the vote…")}</span>`; }
        return gtab === "historia" ? `<span class="note">${L("Vota abajo.", "Vote below.")}</span>` : `<button type="button" class="btn primary small" data-gtab="historia">🗳️ ${L("Votar", "Vote")}</button>`;
      }
    }
    return "";
  }
  function tracker() {
    if (!G || G.g.combat) return "";
    const m = M(); const ch = chOf(m.cap); if (!ch) return "";
    const mi = missionOf(m.cap); const st = mi.steps[m.i]; const arc = arcOf(m.cap);
    const behind = m.cap < worldCap();
    return `<div class="qtrack"><div class="qt-l"><small>📜 ${L("Qué hacer ahora", "What to do now")} · ${L("Cap.", "Ch.")} ${m.cap - arc.from + 1}/${arc.to - arc.from + 1} · ${esc(ch.t)}${behind ? ` · <span class="qt-behind">${L("te estás poniendo al día", "catching up")}</span>` : ""}</small>
      <b>${st ? esc(stepLabel(st, m)) : L("Capítulo terminado", "Chapter done")}</b>
      <span class="qt-bar"><i style="width:${Math.round((m.i / mi.steps.length) * 100)}%"></i></span></div>
      <div class="qt-r">${stepAction(st, m)}</div></div>`;
  }

  // ---------- votación: quién cuenta ----------
  const isActive = (c) => Date.now() - (c.lastSeen || c.updatedAt || 0) < ACTIVE_MS;
  function atCap(c, cap) { const mc = c.g?.mis?.cap; return mc == null || mc >= cap; }
  function requiredVoters(cap) {
    const need = new Set();
    for (const c of Store.all) if (isActive(c) && atCap(c, cap)) need.add(c.owner);
    if (Store.uid) need.add(Store.uid);
    return [...need];
  }
  function waitingFor(cap) {
    const votes = Store.world?.votes?.[cap] || {};
    return requiredVoters(cap).filter((u) => !votes[u] && u !== Store.uid).map((u) => (typeof profileName === "function" ? profileName(u) : "otro jugador"));
  }
  tryCloseVote = async function (force) {
    const ch = chapter(); if (!ch || !Store.world) return;
    const votes = Store.world.votes?.[ch.cap] || {};
    if (!force) {
      if (!Object.keys(votes).length) return;
      if (requiredVoters(ch.cap).some((u) => !votes[u])) return;
      const pausedActive = Store.all.filter((c) => c.g?.pausa && isActive(c) && atCap(c, ch.cap));
      if (pausedActive.some((c) => c.id !== G?.id || G.g.pausa)) return;
    }
    const counts = {}; ch.vote.options.forEach((o) => (counts[o.id] = 0)); Object.values(votes).forEach((v) => { if (v in counts) counts[v]++; });
    const best = ch.vote.options.reduce((a, o) => (counts[o.id] > counts[a.id] ? o : a), ch.vote.options[0]);
    const bonus = typeof solenLight === "function" ? solenLight() : 0;
    await Store.closeChapter(ch.cap, bonus ? { ...best, fx: { ...(best.fx || {}), luz: ((best.fx || {}).luz || 0) + bonus } } : best, counts);
  };
  setInterval(() => { try { if (G && view.name === "game" && Store.world?.votes?.[worldCap()]?.[Store.uid]) tryCloseVote(false); } catch (e) {} }, 45000);

  // ---------- acción del capítulo (también para capítulos atrasados) ----------
  storyChoice = function (i) {
    const m = M(); const ch = chOf(m.cap); if (!ch || G.g.story[ch.cap]) return;
    const c = ch.choices[i]; if (!c) return;
    const sm = attr(c.stat) + ctxBonus(c.stat, "story"); const adv = c.adv && G.g.flags[c.adv]; const r = rollX(adv ? 1 : 0); const tot = rollTotal(r, sm + (RISK_MOD[c.risk] || 0)); const tier = tierOf(tot);
    const o = c.out[tier]; const fx = applyFx(o.fx, true);
    G.g.story[ch.cap] = { l: c.l, tier, text: o.t, roll: `${r.ds.join("+")}${r.plus ? " +1" : ""} ${sgn(sm)} = ${tot}${adv ? " (con ventaja)" : ""}`, fx };
    log(`Capítulo ${ch.cap}: ${c.l} → ${TIER[tier]}. ${o.t}`);
    sfx(tier === "hit" ? "level" : tier === "mix" ? "status" : "defeat");
    advance(3); sync(); persist(); render();
  };
  const _storyBoss = storyBoss;
  storyBoss = function () {
    const m = M(); const ch = chOf(m.cap); if (!ch?.boss) return;
    if (m.cap === worldCap()) return _storyBoss();
    if (G.g.combat || G.g.flags[`jefe_${ch.cap}`] || !here(ch.r, ch.p) || !needEnergy(1)) return;
    const b = ch.boss; const pv = Math.round((40 + 22 * b.lvl) * 0.55);
    startCombat({ n: b.n, lvl: b.lvl, pv, pvMax: pv, poder: 10 + 3 * b.lvl, def: Math.floor(b.lvl / 4) + 1, aff: b.aff, boss: true, st: {}, story: ch.cap, god: b.god }, "story", `${ch.r}:${ch.p}`, `${b.n} te cierra el paso.`);
    persist(); render();
  };

  // ---------- peleas de la historia ----------
  function misFight() {
    const st = curStep(); if (!st || st.k !== "fight" || G.g.combat) return;
    if (st.r != null && !here(st.r, st.p)) return;
    const e = st.e; const lvl = fLvl(e);
    let pv, poder, def;
    if (e.boss) { pv = Math.round((40 + 22 * lvl) * 0.55); poder = 10 + 3 * lvl; def = Math.floor(lvl / 4) + 1; }
    else if (e.rival) { pv = Math.round((15 + 10 * lvl) * 0.8); poder = 5 + 2 * lvl; def = 0; }
    else { pv = Math.round((15 + 10 * lvl) * 0.7); poder = 5 + 2 * lvl; def = Math.floor(lvl / 6); }
    startCombat({ n: e.n, lvl, pv, pvMax: pv, poder, def, aff: e.aff || null, boss: !!e.boss, st: {}, img: e.img, npc: e.npc }, "mision", `${G.g.loc.r}:${G.g.loc.p}`, T(st.t) + ".");
    if (G.g.combat) G.g.combat.misStep = `${M().cap}:${M().i}`;
    persist(); render();
  }
  const _victory = victory;
  victory = function () {
    const c = G.g.combat; const info = c ? { key: c.placeKey, names: c.enemies.map((e) => e.n), mis: c.misStep, kind: c.kind } : null;
    _victory();
    if (info) afterFight(info, true);
  };
  const _defeat = defeat;
  defeat = function () {
    const c = G.g.combat; const info = c ? { mis: c.misStep } : null;
    _defeat();
    if (info) afterFight(info, false);
  };
  function afterFight(info, won) {
    const m = M(); const st = curStep(); let note = "";
    if (st && st.k === "fight" && info.mis === `${m.cap}:${m.i}` && (won || st.any)) { G.g.misLastWin = won; finishStep(st, m, false); note = L(`📜 Misión: ${stepLabel(st, m)} ✔`, `📜 Quest: ${stepLabel(st, m)} ✔`); }
    else if (won && st && st.k === "hunt" && info.key === `${st.r}:${st.p}`) {
      const n = info.names.filter((x) => !st.mon || x === st.mon).length;
      if (n) { m.n = Math.min(st.n, m.n + n); note = L(`📜 Misión: ${m.n}/${st.n}`, `📜 Quest: ${m.n}/${st.n}`); }
    }
    if (note && G.g.lastBattle) G.g.lastBattle.lines = [...(G.g.lastBattle.lines || []), note];
    if (note) { sync(); persist(); render(); }
  }
  const _explore = explore;
  explore = function () {
    const st = curStep(); const m = M(); const was = st && st.k === "explore" && here(st.r, st.p) && !G.g.combat && G.energia >= 1;
    _explore();
    if (was) { m.n = Math.min(st.n, m.n + 1); if (G.g.lastResult) G.g.lastResult.lines = [...G.g.lastResult.lines, L(`📜 Misión: ${m.n}/${st.n}`, `📜 Quest: ${m.n}/${st.n}`)]; sync(); persist(); render(); }
  };

  // ---------- pantalla de Historia ----------
  const _storyView = storyView;
  storyView = function () {
    const m = M(); const ch = chOf(m.cap);
    if (!ch) return _storyView();
    const arc = arcOf(m.cap); const mi = missionOf(m.cap); const k = m.cap - arc.from + 1;
    const behind = m.cap < worldCap(); const w = Store.world;
    const mine = G.g.story[m.cap];
    const stepsHtml = mi.steps.map((st, i) => {
      const state = i < m.i ? "ok" : i === m.i ? "now" : "next";
      let extra = "";
      if (state === "now") {
        if (st.k === "choice") extra = `<div class="acts">${ch.choices.map((c, j) => { const adv = c.adv && G.g.flags[c.adv]; return `<button type="button" class="act" data-story="${j}"><b>${esc(c.l)}</b><small>${ATTR_NAME[c.stat]} ${sgn(attr(c.stat))} · ${L("riesgo", "risk")} ${c.risk}${adv ? ` · ${L("ventaja", "advantage")}: ${esc(FLAG_NAME[c.adv] || "")}` : ""}</small></button>`; }).join("")}</div>`;
        else if (st.k === "vote") extra = behind ? "" : voteBox(ch);
        else extra = `<div class="row">${stepAction(st, m)}</div>`;
      }
      if (st.k === "choice" && mine && i < m.i) extra = `<div class="result mini"><b>${esc(mine.l)}</b><div>${esc(mine.roll)} · ${TIER[mine.tier]}</div><div>${esc(mine.text)}</div></div>`;
      if (st.k === "scene" && i < m.i) extra = `<button type="button" class="link" data-replay="${esc(st.id)}">↺ ${L("Ver otra vez", "Watch again")}</button>`;
      if (st.k === "vote" && behind) { const h = (w?.history || []).find((x) => x.cap === m.cap); extra = `<div class="note">${L("El grupo ya decidió", "The group already decided")}: <b>${esc(h?.label || "—")}</b></div>`; }
      return `<li class="qs ${state}"><span class="qs-i">${state === "ok" ? "✔" : state === "now" ? "➤" : "○"}</span><div><b>${esc(stepLabel(st, m))}</b>${extra}</div></li>`;
    }).join("");
    const banner = typeof sceneBanner === "function" ? sceneBanner(ch.r, placeName(ch.r, ch.p), regionName(ch.r)) : "";
    return `${banner}${!behind && typeof pauseBar === "function" ? pauseBar() : ""}
      <p class="eyebrow">${L("Arco", "Arc")} ${arc.n} · ${esc(arc.t)} · ${L("Capítulo", "Chapter")} ${k} ${L("de", "of")} ${arc.to - arc.from + 1}${mi.sub ? ` · ${esc(mi.sub)}` : ""}</p><h2>${esc(ch.t)}</h2>
      ${behind ? `<div class="note">${L(`El grupo ya va por el capítulo ${worldCap() - arcOf(worldCap()).from + 1} del arco ${arcOf(worldCap()).n}. Juega este capítulo a tu ritmo para ponerte al día; las decisiones del grupo ya están tomadas.`, "The group is ahead. Play this chapter at your own pace to catch up.")}</div>` : ""}
      <ol class="qsteps">${stepsHtml}</ol>
      ${typeof epiloguesBox === "function" ? epiloguesBox() : ""}${typeof historyList === "function" ? historyList() : ""}`;
  };
  function voteBox(ch) {
    const w = Store.world; const votes = w?.votes?.[ch.cap] || {}; const myVote = votes[Store.uid];
    const owners = [...new Set(Store.all.map((c) => c.owner))];
    const who = owners.map((u) => {
      const cs = Store.all.filter((c) => c.owner === u); const act = cs.some(isActive); const c0 = cs.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))[0];
      const mc = c0?.g?.mis; const behindC = mc && mc.cap < ch.cap; const stp = mc && missionOf(mc.cap)?.steps[mc.i];
      const nm = u === Store.uid ? L("Tú", "You") : (typeof profileName === "function" ? profileName(u) : "?");
      const st = votes[u] ? `✅ ${L("votó", "voted")}` : !act ? `💤 ${L("no está conectado · no bloquea", "offline · won't block")}` : behindC ? `📖 ${L("poniéndose al día · no bloquea", "catching up · won't block")}` : `⏳ ${stp ? esc(stepLabel(stp, mc)) : L("jugando", "playing")}`;
      return `<div class="vwho"><b>${esc(nm)}</b> <small>${esc(c0?.nombre || "")}</small><span>${st}</span></div>`;
    }).join("");
    return `<p>${esc(ch.vote.q)}</p>
      <div class="acts">${ch.vote.options.map((o) => { const n = Object.values(votes).filter((v) => v === o.id).length; return `<button type="button" class="act ${myVote === o.id ? "sel" : ""}" data-vote="${o.id}"><b>${esc(o.l)} <span class="pill">${n}</span></b><small>${esc(o.d)}</small></button>`; }).join("")}</div>
      <div class="whos">${who}</div>
      <p class="note">${L("La votación se cierra cuando votan todos los que están conectados y van por este capítulo. Quien no esté conectado no bloquea al grupo.", "The vote closes when everyone online on this chapter has voted.")}</p>
      ${Store.isOwner ? `<button type="button" class="btn ghost small" data-g="forcevote">${L("Cerrar la votación ahora (anfitrión)", "Close the vote now (host)")}</button>` : ""}`;
  }

  // ---------- panel en todas las pestañas ----------
  const _gameView = gameView;
  gameView = function () {
    const out = _gameView();
    if (!G || G.g.combat) return out;
    return out.replace('<section class="panel">', tracker() + '<section class="panel">');
  };

  // ---------- clics ----------
  document.addEventListener("click", (ev) => {
    if (view.name !== "game" || !G) return;
    const t = ev.target.closest("button"); if (!t) return;
    if (t.dataset.mis === "scene") { ev.stopPropagation(); return playStepScene(); }
    if (t.dataset.mis === "fight") { ev.stopPropagation(); return misFight(); }
    if (t.dataset.replay) { ev.stopPropagation(); return openScene(t.dataset.replay, { replay: true }); }
  }, true);

  window.SA_SCENE = { open: openScene, face, busy: () => !!S || busyCards };
  function fightEnemy() {
    const m = M(); const st = curStep(); if (!st || st.k !== "fight") return null;
    const e = st.e; const lvl = fLvl(e); let pv, poder, def;
    if (e.boss) { pv = Math.round((40 + 22 * lvl) * 0.55); poder = 10 + 3 * lvl; def = Math.floor(lvl / 4) + 1; }
    else if (e.rival) { pv = Math.round((15 + 10 * lvl) * 0.8); poder = 5 + 2 * lvl; def = 0; }
    else { pv = Math.round((15 + 10 * lvl) * 0.7); poder = 5 + 2 * lvl; def = Math.floor(lvl / 6); }
    return { key: `${m.cap}:${m.i}`, place: st.r != null ? `${st.r}:${st.p}` : `${G.g.loc.r}:${G.g.loc.p}`, t: T(st.t || ""), e: { n: e.n, lvl, pv, poder, def, aff: e.aff || null, img: e.img || null, npc: e.npc || null } };
  }
  function markFight(key) { const m = M(); const st = curStep(); if (st && st.k === "fight" && `${m.cap}:${m.i}` === key) { finishStep(st, m, false); sync(); persist(); render(); return true; } return false; }
  function labelOf(mis) { if (!mis) return ""; const mi = missionOf(mis.cap); const st = mi && mi.steps[mis.i]; return st ? stepLabel(st, mis) : L("Capítulo terminado", "Chapter done"); }
  window.SA_STORY = { cap: () => M().cap, step: () => M().i, key: () => `${M().cap}:${M().i}`, label: () => { const m = M(); const st = curStep(); return st ? stepLabel(st, m) : ""; }, sync, fightEnemy, markFight, labelOf, stepsOf: (cap) => missionOf(cap)?.steps || [] };
  // ---------- engancharse al dibujado ----------
  const _render = render;
  let saveT = null;
  render = function () {
    let changed = false;
    try { if (G && view.name === "game") changed = sync(); } catch (e) { console.warn("historia:", e); }
    const r = _render.apply(this, arguments);
    if (changed) { clearTimeout(saveT); saveT = setTimeout(() => { try { persist(); } catch (e) {} }, 300); }
    try { if (G && view.name === "game") setTimeout(runPending, 60); else closeScene(); } catch (e) {}
    return r;
  };

  // ---------- estilos ----------
  const css = `
.qtrack{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:0 0 12px;padding:10px 14px;border:1px solid #d9a44166;border-radius:8px;background:linear-gradient(90deg,#d9a44118,#0b131c00 70%),var(--panel-2);box-shadow:0 0 0 1px #0004 inset}
.qt-l{display:flex;flex-direction:column;gap:3px;min-width:min(220px,100%);flex:1 1 220px}
.qt-l small{color:var(--ink-2);font-size:12.5px;letter-spacing:.03em}
.qt-l b{font-family:var(--display);font-size:16px;color:#fff3d6;letter-spacing:.02em}
.qt-behind{color:#8be0a8}
.qt-bar{display:block;height:4px;border-radius:3px;background:#1b2635;overflow:hidden;max-width:360px}.qt-bar i{display:block;height:100%;background:linear-gradient(90deg,#d9a441,#ffe9a0);transition:width .6s}
.qt-r{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.qt-r .btn{max-width:100%;white-space:normal}
@media (max-width:560px){.qtrack{padding:10px 12px}.qt-l,.qt-r{flex:1 1 100%}.qt-r .btn{flex:1 1 auto}.qt-l b{font-size:15px}}
.qsteps{list-style:none;padding:0;margin:14px 0;display:flex;flex-direction:column;gap:6px}
.qs{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:6px;border:1px solid transparent}
.qs .qs-i{width:20px;text-align:center;flex:none;color:var(--muted)}
.qs.ok{opacity:.75}.qs.ok .qs-i{color:#8be0a8}
.qs.now{border-color:#d9a44188;background:#d9a44112}.qs.now .qs-i{color:#ffd84a}
.qs.next{opacity:.45}
.qs > div{flex:1;display:flex;flex-direction:column;gap:6px}
.result.mini{padding:8px 10px;margin:0}
.whos{display:flex;flex-direction:column;gap:4px;margin:8px 0}
.vwho{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-size:14px}.vwho span{margin-left:auto;color:var(--ink-2)}
.npcface{position:relative;display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--c) 70%,#fff),var(--c) 55%,color-mix(in srgb,var(--c) 45%,#000));box-shadow:0 0 0 3px #1a120c,0 0 0 5px var(--c),0 6px 14px #000a;overflow:hidden;flex:none}
.npcface b{font-family:var(--display);font-size:18px;color:#1a120c;text-shadow:0 1px 0 #fff6}
.npcface img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%}
.gimg{width:30px;height:30px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;box-shadow:0 0 0 2px #d9a44188}.gimg.big{width:56px;height:56px}.ghead{display:flex;align-items:center}
.npcface.big{width:150px;height:150px}.npcface.big b{font-size:54px}
.sprite span .npcface.fight{width:104px;height:104px}.sprite span .npcface.fight b{font-size:40px}
.sov{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;justify-content:flex-end;cursor:pointer;animation:sovIn .35s ease}
@keyframes sovIn{from{opacity:0}to{opacity:1}}
.sov-bg{position:absolute;inset:0;background-size:cover;background-position:center 40%;animation:sovPan 30s ease-in-out infinite alternate;filter:saturate(1.1)}
@keyframes sovPan{from{transform:scale(1.05) translateX(-1%)}to{transform:scale(1.12) translateX(1%)}}
.sov-bg.blur{filter:blur(16px) brightness(.5) saturate(1.2);transform:scale(1.15);animation:none}
.sov-strip{position:absolute;left:0;right:0;top:7%;height:clamp(150px,19vw,46vh);background-size:cover;background-position:center;box-shadow:0 10px 50px #000c;-webkit-mask:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);animation:sovStrip 26s ease-in-out infinite alternate}
@keyframes sovStrip{from{background-position:40% center}to{background-position:60% center}}
.sov-shade{position:absolute;inset:0;background:linear-gradient(180deg,#0b131c55 0%,#0b131c11 35%,#0b131ccc 70%,#0b131cf5 100%)}
.sov-top{position:absolute;top:12px;left:16px;right:16px;display:flex;justify-content:space-between;align-items:center;z-index:2}
.sov-skip{background:#0b131ccc;border:1px solid var(--line);color:var(--ink-2);border-radius:999px;padding:6px 14px;font-family:var(--display);cursor:pointer}
.sov-cast{position:relative;z-index:2;display:flex;justify-content:flex-end;width:min(900px,calc(100% - 32px));margin:0 auto 24px;padding:0 10px;min-height:20px}
.sov-face{animation:sovFace .4s cubic-bezier(.2,1.3,.4,1)}.sov-face.me{margin-right:auto}
@keyframes sovFace{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:none}}
.sov-box{position:relative;z-index:1;margin:0 auto 24px;width:min(900px,calc(100% - 32px));background:#0b131cee;border:1px solid color-mix(in srgb,var(--c) 60%,transparent);border-radius:10px;padding:34px 22px 18px;box-shadow:0 10px 40px #000c,0 0 30px color-mix(in srgb,var(--c) 20%,transparent)}
.sov-box.narr{padding-top:20px;font-style:italic}
.sov-name{position:absolute;top:-14px;left:18px;background:#0b131c;border:1px solid var(--c);color:#fff3d6;border-radius:6px;padding:3px 12px;font-family:var(--display);letter-spacing:.04em;font-size:15px}
.sov-name small{color:var(--c);font-size:12px;margin-left:6px}
.sov-text{font-size:19px;line-height:1.5;color:#f3ead6;min-height:58px;white-space:pre-wrap}
.sov-next{text-align:right;color:var(--c);animation:sovBlink 1s steps(2) infinite;font-size:14px}
@keyframes sovBlink{50%{opacity:0}}
.sov-choices{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.sov-ch{text-align:left;background:#131e2b;border:1px solid #d9a44166;color:#fff3d6;border-radius:6px;padding:10px 14px;font-size:16px;cursor:pointer;font-family:var(--body);transition:background .15s,transform .1s}
.sov-ch:hover{background:#1c2a3a;border-color:#d9a441}.sov-ch:active{transform:scale(.98)}
.chcard{position:fixed;inset:0;z-index:85;display:grid;place-items:center;background:radial-gradient(circle,#0b131ccc,#000f 80%);animation:sovIn .5s ease;cursor:pointer;text-align:center}
.chcard.out{animation:chOut .45s ease forwards}@keyframes chOut{to{opacity:0}}
.chcard>div{display:flex;flex-direction:column;gap:8px;padding:24px;max-width:600px}
.chcard small{color:var(--ink-2);letter-spacing:.3em;font-family:var(--display);font-size:12px;text-transform:uppercase}
.chcard span{font-family:var(--display);color:#d9a441;letter-spacing:.5em;font-size:14px;text-transform:uppercase;animation:chRise .8s ease both}
.chcard b{font-family:var(--display);font-size:clamp(28px,6vw,46px);color:#fff3d6;text-shadow:0 0 30px #d9a44188;letter-spacing:.06em;animation:chRise .9s .15s ease both}
.chcard p{color:#e8dcc0;margin:0}.chcard .dec{color:#ffe9a0}.chcard em{color:var(--muted);font-size:13px;margin-top:10px}
.chcard.done b{color:#ffe9a0}
@keyframes chRise{from{opacity:0;transform:translateY(14px);letter-spacing:.3em}to{opacity:1;transform:none}}
@media (max-width:640px){.npcface.big{width:96px;height:96px}.sov-text{font-size:16.5px}.sov-box{padding:28px 16px 14px;margin-bottom:14px}}
@media (prefers-reduced-motion:reduce){.sov,.sov-bg,.sov-face,.chcard,.chcard b,.chcard span{animation:none!important}}
`;
  const st = document.createElement("style"); st.id = "historia-css"; st.textContent = css; document.head.appendChild(st);
})();
