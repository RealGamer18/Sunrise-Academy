// =====================================================================
// menus.js — Menús más limpios y modernos
//   · Misiones en el Mapa (diario con viajar, progreso y pines)
//   · Barra de navegación abajo en el teléfono (+ hoja "Más")
//   · Mini-HUD fijo arriba al bajar por la página
//   · Secciones plegables en Lugar y hoja completa plegable en Personaje
// Se carga después de tema.js.
// =====================================================================
(function () {
  if (typeof render !== "function") return;
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const escx = (s) => (typeof esc === "function" ? esc(s) : String(s ?? ""));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const inGame = () => !!(G?.g) && !!document.querySelector(".hud");

  // ---------------------------------------------------------------
  // Misiones (datos)
  // ---------------------------------------------------------------
  const pname = (k) => { try { const [r, p] = k.split(":"); return PLACE_OF(r, +p)?.n || k; } catch (e) { return k; } };
  const rname = (k) => { try { return typeof regionName === "function" ? regionName(k.split(":")[0]) : ""; } catch (e) { return ""; } };
  function keyByName(n) {
    if (!n || typeof P === "undefined") return null;
    try { for (const r of Object.keys(P)) { const i = (P[r] || []).findIndex((x) => x && x.n === n); if (i >= 0) return `${r}:${i}`; } } catch (e) {}
    return null;
  }
  function keyByPinName(n) {
    const g = [...document.querySelectorAll(".minimap g.gpin")].find((x) => (x.getAttribute("aria-label") || "") === n);
    return g ? g.dataset.pin : keyByName(n);
  }
  function hoursTo(k) {
    try { const [r, p] = k.split(":"); const h = tripHours({ r, p: +p }, "pie"); return typeof fmtH === "function" ? fmtH(h) : `${h} h`; } catch (e) { return ""; }
  }
  function missions() {
    const out = []; const here = `${G.g.loc.r}:${G.g.loc.p}`;
    // historia
    try {
      const S = window.SA_STORY;
      if (S) {
        const st = S.stepsOf(S.cap())[S.step()];
        const k = st && st.r != null ? `${st.r}:${st.p}` : null;
        out.push({ kind: "story", ic: "📜", t: S.label() || Lx("Sigue la historia", "Follow the story"), sub: Lx("Historia", "Story"), key: k, pr: null });
      }
    } catch (e) {}
    // aceptadas del tablón
    for (const q of G.g.quests || []) {
      if (q.claimed) continue;
      const ty = q.type || "caza";
      let k = (ty === "entrega" || ty === "escolta" ? q.dest : q.place) || q.place || q.dest || null;
      if (ty === "recolectar" && !k) k = keyByPinName(q.where);
      let pr = 0;
      try { pr = typeof questProgress === "function" ? questProgress(q) : 0; } catch (e) { pr = 0; }
      pr = Math.max(0, Math.min(q.need || 1, +pr || 0));
      const ic = { caza: "⚔️", recolectar: "🌿", escolta: q.wi || "🛡️", buscado: "🎯", entrega: "📦" }[ty] || "📌";
      out.push({ kind: "quest", ic, t: q.t, sub: { caza: Lx("Caza", "Hunt"), recolectar: Lx("Recolectar", "Gather"), escolta: Lx("Escolta", "Escort"), buscado: Lx("Se busca", "Wanted"), entrega: Lx("Entrega", "Delivery") }[ty] || Lx("Misión", "Quest"), key: k, pr, need: q.need, ready: pr >= q.need });
    }
    return out.map((m) => ({ ...m, here: m.key && m.key === here }));
  }

  function missionPanel() {
    const list = missions(); const open = store.get("sa-mq-open", true);
    const focus = gsel.saFocus;
    const rows = list.map((m) => {
      const pct = m.need > 1 ? Math.round((m.pr / m.need) * 100) : null;
      const where = m.key ? `${escx(pname(m.key))}${rname(m.key) ? `<span> · ${escx(rname(m.key))}</span>` : ""}` : Lx("Sin lugar fijo", "Anywhere");
      const act = m.ready ? `<button type="button" class="btn small primary" data-gtab="bolsa">💰 ${Lx("Cobrar", "Claim")}</button>`
        : m.here ? `<span class="sa-here">📍 ${Lx("Estás aquí", "You're here")}</span>`
        : m.key ? `<button type="button" class="btn small" data-go="${escx(m.key)}">🧭 ${escx(hoursTo(m.key))}</button>` : "";
      return `<li class="sa-mq ${m.kind} ${m.ready ? "ready" : ""} ${m.key && m.key === focus ? "focus" : ""}" ${m.key ? `data-safocus="${escx(m.key)}"` : ""}>
        <em>${m.ic}</em><div class="sa-mqt"><small>${escx(m.sub)}</small><b>${escx(m.t)}</b><span class="sa-mqw">📍 ${where}</span>${pct != null ? `<i class="sa-mqb"><i style="width:${pct}%"></i></i><small class="sa-mqp">${m.pr}/${m.need}</small>` : ""}</div><div class="sa-mqa">${act}</div></li>`;
    }).join("");
    return `<details class="sa-mqp-box" ${open ? "open" : ""}><summary><span>📜 ${Lx("Misiones", "Quests")}</span><b class="sa-cnt">${list.length}</b><small>${Lx("toca una para verla en el mapa", "tap one to see it on the map")}</small></summary>
      ${list.length ? `<ul class="sa-mql ${gsel.saMqAll ? "all" : ""}">${rows}</ul>${list.length > 4 ? `<button type="button" class="sa-mqmore" data-samqall="1">${gsel.saMqAll ? Lx("Ver menos", "Show less") : Lx(`Ver todas (${list.length})`, `Show all (${list.length})`)}</button>` : ""}` : `<p class="muted">${Lx("No tienes misiones. Busca el Tablón de misiones en pueblos y ciudades.", "No quests. Find a quest board in towns.")}</p>`}</details>`;
  }

  const NS = "http://www.w3.org/2000/svg";
  function mapMissions() {
    const panel = document.querySelector('section.panel[data-tab="mapa"]'); if (!panel || panel.querySelector(".sa-mqp-box")) return;
    const hunt = [...panel.querySelectorAll(":scope > .card.mini")].find((c) => c.querySelector(".places"));
    if (hunt && !hunt.dataset.fold) {
      hunt.dataset.fold = "1"; const t = hunt.querySelector(":scope > b"); const n = hunt.querySelectorAll(".places .pl").length;
      const d = document.createElement("details"); d.className = "sa-hunt"; d.open = store.get("sa-hunt-open", false);
      d.innerHTML = `<summary>${t ? t.innerHTML : "🎯"} <b class="sa-cnt">${n}</b></summary>`; if (t) t.remove();
      hunt.before(d); d.appendChild(hunt); d.addEventListener("toggle", () => store.set("sa-hunt-open", d.open));
    }
    panel.insertAdjacentHTML("afterbegin", missionPanel());
    const svg = panel.querySelector(".minimap svg"); if (!svg) return;
    const ms = missions(); const keys = new Set(ms.filter((m) => m.kind === "quest" && m.key && !m.ready).map((m) => m.key));
    svg.querySelectorAll("g.gpin").forEach((g) => {
      const k = g.dataset.pin; const c = g.querySelector("circle:not(.sa-ring)"); if (!c) return;
      const cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy");
      if (keys.has(k) && !g.querySelector(".sa-qb")) {
        const n = document.createElementNS(NS, "g"); n.setAttribute("class", "sa-qb");
        n.innerHTML = `<circle cx="${cx - 18}" cy="${cy - 18}" r="11"></circle><text x="${cx - 18}" y="${cy - 13}" text-anchor="middle">!</text>`;
        g.appendChild(n);
      }
      if (k === gsel.saFocus && !g.querySelector(".sa-fring")) {
        const r = document.createElementNS(NS, "circle"); r.setAttribute("class", "sa-fring"); r.setAttribute("cx", cx); r.setAttribute("cy", cy); r.setAttribute("r", 26); g.insertBefore(r, g.firstChild);
      }
    });
  }

  // ---------------------------------------------------------------
  // Lugar: secciones plegables
  // ---------------------------------------------------------------
  const LSEC_DEF = { ldaily: false, lppl: false };
  function foldLugar() {
    const panel = document.querySelector('section.panel[data-tab="lugar"]'); if (!panel) return;
    const st = store.get("sa-lsec", {});
    panel.querySelectorAll(".lsec").forEach((s) => {
      if (s.dataset.fold) return; s.dataset.fold = "1";
      const k = [...s.classList].find((c) => c !== "lsec") || "x";
      const h = s.querySelector(".lsech"); const body = s.querySelector(".lbody"); if (!h || !body) return;
      const n = body.children.length;
      h.insertAdjacentHTML("beforeend", `${n > 1 ? `<b class="sa-cnt">${n}</b>` : ""}<i class="sa-chev">▾</i>`);
      h.setAttribute("role", "button"); h.tabIndex = 0; h.dataset.salsec = k;
      const open = st[k] ?? LSEC_DEF[k] ?? true; if (!open) s.classList.add("sa-closed");
    });
  }

  // ---------------------------------------------------------------
  // Personaje: hoja completa plegable
  // ---------------------------------------------------------------
  function foldHero() {
    const panel = document.querySelector('section.panel[data-tab="heroe"]'); if (!panel || panel.dataset.fold) return;
    const dash = panel.querySelector(".sa-dash"); if (!dash) return; panel.dataset.fold = "1";
    const rest = []; let n = dash.nextSibling; while (n) { rest.push(n); n = n.nextSibling; }
    if (!rest.length) return;
    const d = document.createElement("details"); d.className = "sa-more";
    const open = G.g.puntosAtributo > 0 || store.get("sa-hero-more", false); if (open) d.open = true;
    d.innerHTML = `<summary><span>📖 ${Lx("Hoja completa del personaje", "Full character sheet")}</span><small>${Lx("atributos, raza, magia, trasfondo, crónica…", "attributes, race, magic, background, chronicle…")}</small></summary>`;
    const box = document.createElement("div"); box.className = "sa-morebody"; rest.forEach((x) => box.appendChild(x)); d.appendChild(box);
    d.addEventListener("toggle", () => store.set("sa-hero-more", d.open));
    dash.after(d);
  }

  // ---------------------------------------------------------------
  // Barra de navegación abajo (teléfono)
  // ---------------------------------------------------------------
  const MAIN = ["lugar", "mapa", "historia", "bolsa", "heroe"];
  let bnav, sheet;
  function tabBtn(k) { return document.querySelector(`.gtabs [data-gtab="${k}"]`); }
  function tabInfo(b) {
    const img = b.querySelector("img.sai, .tic"); const ic = img ? img.outerHTML : "";
    const label = (b.textContent || "").replace(/[•\d]+\s*$/, "").replace("•", "").trim();
    const dot = /•/.test(b.textContent) || !!b.querySelector(".trbadge");
    return { ic, label, dot };
  }
  function buildNav() {
    const tabs = document.querySelector(".gtabs");
    const show = inGame() && tabs && !G.g.combat;
    document.body.classList.toggle("sa-bnav-on", !!show);
    if (!show) { if (bnav) bnav.hidden = true; if (sheet) sheet.hidden = true; return; }
    if (!bnav) { bnav = document.createElement("nav"); bnav.id = "sa-bnav"; document.body.appendChild(bnav); }
    if (!sheet) { sheet = document.createElement("div"); sheet.id = "sa-sheet"; sheet.hidden = true; document.body.appendChild(sheet); }
    bnav.hidden = false;
    const all = [...tabs.querySelectorAll("[data-gtab]")].map((b) => ({ k: b.dataset.gtab, ...tabInfo(b) }));
    const main = MAIN.map((k) => all.find((x) => x.k === k)).filter(Boolean);
    const more = all.filter((x) => !MAIN.includes(x.k));
    const moreOn = more.some((x) => x.k === gtab); const moreDot = more.some((x) => x.dot);
    bnav.innerHTML = main.map((t) => `<button type="button" data-sanav="${t.k}" class="${gtab === t.k ? "on" : ""}"><span class="ic">${t.ic}${t.dot ? '<i class="dot"></i>' : ""}</span><small>${escx(t.label)}</small></button>`).join("")
      + `<button type="button" data-sanav="__more" class="${moreOn ? "on" : ""}"><span class="ic"><b class="sa-dots">•••</b>${moreDot ? '<i class="dot"></i>' : ""}</span><small>${Lx("Más", "More")}</small></button>`;
    sheet.innerHTML = `<div class="sa-sh-in"><div class="sa-sh-h"><b>${Lx("Más menús", "More")}</b><button type="button" class="link" data-sanav="__close">✕</button></div><div class="sa-sh-g">${more.map((t) => `<button type="button" data-sanav="${t.k}" class="${gtab === t.k ? "on" : ""}"><span class="ic">${t.ic}${t.dot ? '<i class="dot"></i>' : ""}</span><small>${escx(t.label)}</small></button>`).join("")}</div></div>`;
  }

  // ---------------------------------------------------------------
  // Mini-HUD fijo
  // ---------------------------------------------------------------
  let mini;
  function pct(v, m) { return m ? Math.max(0, Math.min(100, (v / m) * 100)) : 0; }
  function buildMini() {
    if (!inGame()) { if (mini) mini.hidden = true; document.body.classList.remove("sa-mini-on"); return; }
    if (!mini) { mini = document.createElement("div"); mini.id = "sa-mini"; mini.hidden = true; document.body.appendChild(mini); mini.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" })); }
    const src = document.querySelector(".hud .hud-img")?.getAttribute("src") || "";
    mini.innerHTML = `${src ? `<img src="${escx(src)}" alt="">` : ""}<b>${escx(G.nombre)}</b><small>${Lx("Nv", "Lv")} ${G.nivel}</small>
      <span class="mb pv" title="PV ${G.pv}/${G.pvMax}"><i style="width:${pct(G.pv, G.pvMax)}%"></i><em>${G.pv}</em></span>
      <span class="mb mn" title="${Lx("Maná", "Mana")} ${G.mana}/${G.manaMax}"><i style="width:${pct(G.mana, G.manaMax)}%"></i><em>${G.mana}</em></span>
      <span class="mx">⚡${G.energia}</span><span class="mx gold">☀${G.dinero?.soles ?? 0}</span>`;
    onScroll();
  }
  function onScroll() {
    if (!mini) return;
    const hud = document.querySelector(".hud"); const on = !!hud && inGame() && hud.getBoundingClientRect().bottom < 0;
    mini.hidden = !on; document.body.classList.toggle("sa-mini-on", on);
  }
  addEventListener("scroll", onScroll, { passive: true });

  // ---------------------------------------------------------------
  // Enganche al dibujado
  // ---------------------------------------------------------------
  function post() {
    if (!G?.g) { buildNav(); buildMini(); return; }
    if (!G.g.combat) {
      if (gtab === "mapa") mapMissions();
      if (gtab === "lugar") foldLugar();
      if (gtab === "heroe") foldHero();
    }
    buildNav(); buildMini();
  }
  const _r = render;
  render = function () {
    const o = _r.apply(this, arguments);
    try { post(); } catch (e) { console.warn("menus:", e); }
    return o;
  };

  // ---------------------------------------------------------------
  // Clics
  // ---------------------------------------------------------------
  document.addEventListener("click", (ev) => {
    const nav = ev.target.closest?.("[data-sanav]");
    if (nav) {
      const k = nav.dataset.sanav;
      if (k === "__more") { sheet.hidden = !sheet.hidden; return; }
      if (k === "__close") { sheet.hidden = true; return; }
      sheet.hidden = true;
      const b = tabBtn(k); if (b) b.click(); else { gtab = k; render(); }
      scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (sheet && !sheet.hidden && ev.target === sheet) { sheet.hidden = true; return; }
    const h = ev.target.closest?.("[data-salsec]");
    if (h) {
      const s = h.closest(".lsec"); s.classList.toggle("sa-closed");
      const st = store.get("sa-lsec", {}); st[h.dataset.salsec] = !s.classList.contains("sa-closed"); store.set("sa-lsec", st); return;
    }
    if (ev.target.closest?.("[data-samqall]")) { gsel.saMqAll = !gsel.saMqAll; render(); return; }
    const f = ev.target.closest?.("[data-safocus]");
    if (f && !ev.target.closest("button")) {
      gsel.saFocus = gsel.saFocus === f.dataset.safocus ? null : f.dataset.safocus; render();
      if (gsel.saFocus) document.querySelector(".minimap")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  });
  document.addEventListener("toggle", (ev) => { if (ev.target?.classList?.contains("sa-mqp-box")) store.set("sa-mq-open", ev.target.open); }, true);
  document.addEventListener("keydown", (ev) => { if ((ev.key === "Enter" || ev.key === " ") && ev.target?.dataset?.salsec) { ev.preventDefault(); ev.target.click(); } });

  // ---------------------------------------------------------------
  // Estilos
  // ---------------------------------------------------------------
  const css = document.createElement("style"); css.id = "sa-menus";
  css.textContent = `
/* ---- contador y chevron comunes ---- */
.sa-cnt{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#d9a44122;border:1px solid #d9a44155;color:#ffd98a;font:600 11px var(--display);letter-spacing:0}
.sa-chev{font-style:normal;color:#d9a441;transition:transform .2s;margin-left:2px}

/* ---- Misiones en el mapa ---- */
.sa-mqp-box{margin:0 0 14px;border-radius:2px;color:#2b1a08;background:radial-gradient(130% 90% at 20% 0%,#f2e4c0,#dcc690 60%,#c4a66c);box-shadow:inset 0 0 26px #7a5a2a77,0 8px 20px #000a}
.sa-mqp-box>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 14px}
.sa-mqp-box>summary::-webkit-details-marker{display:none}
.sa-mqp-box>summary span{font-family:var(--display);font-size:15px;color:#3a2410;letter-spacing:.04em}
.sa-mqp-box>summary .sa-cnt{background:#7a2a1622;border-color:#7a2a1666;color:#7a2a16}
.sa-mqp-box>summary small{color:#6b4c22;font-size:12.5px;margin-left:auto}
.sa-mqp-box>summary::after{content:"▾";color:#7a2a16;transition:transform .2s}
.sa-mqp-box:not([open])>summary::after{transform:rotate(-90deg)}
.sa-mqp-box>p{padding:0 14px 12px;margin:0;color:#5a3e1c}
.sa-mql{list-style:none;margin:0;padding:0 8px 8px;display:grid;gap:6px}
.sa-mq{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 10px;border-radius:2px;background:#fff8e644;border:1px solid #8a6a3a44;cursor:pointer;transition:background .15s,border-color .15s}
.sa-mq:hover{background:#fff8e688}
.sa-mq.focus{border-color:#b8451f;background:#fff8e6aa;box-shadow:0 0 0 2px #b8451f44}
.sa-mq.story{border-left:3px solid #8e1c18}
.sa-mq.ready{border-left:3px solid #2f7a4f}
.sa-mq>em{font-style:normal;font-size:20px;text-align:center}.sa-mq>em .sai{width:24px;height:24px}
.sa-mqt{min-width:0;display:flex;flex-direction:column;gap:1px}
.sa-mqt small{color:#7a5a2a;font:600 10.5px var(--display);letter-spacing:.08em;text-transform:uppercase}
.sa-mqt b{font-size:15px;color:#2b1a08;line-height:1.2;overflow-wrap:anywhere}
.sa-mqw{font-size:12.5px;color:#5a3e1c}.sa-mqw span{opacity:.8}
.sa-mqb{display:block;height:4px;border-radius:2px;background:#b8995f88;margin-top:4px;overflow:hidden}.sa-mqb i{display:block;height:100%;background:linear-gradient(90deg,#7a2a16,#b8451f)}
.sa-mq.ready .sa-mqb i{background:linear-gradient(90deg,#2f7a4f,#4fae7a)}
.sa-mqp{font-size:11px!important;text-transform:none!important;letter-spacing:0!important}
.sa-mqa .btn{background:linear-gradient(180deg,#4a2e18,#2e1b0d)!important;color:#f6e6c2!important;border:1px solid #2a180a!important;white-space:nowrap}
.sa-mqa .btn.primary{background:linear-gradient(180deg,#2f7a4f,#1d4f33)!important}
.sa-here{font-size:12px;color:#2f7a4f;font-weight:600;white-space:nowrap}
.sa-qb circle{fill:#ffd84a;stroke:#3a2410;stroke-width:2}.sa-qb text{font:700 15px var(--display);fill:#3a2410;pointer-events:none}
.sa-fring{fill:none;stroke:#ffd84a;stroke-width:4;transform-box:fill-box;transform-origin:center;animation:saRing 1.2s ease-out infinite;pointer-events:none}
.sa-mql:not(.all) .sa-mq:nth-child(n+5){display:none}
.sa-mqmore{display:block;width:calc(100% - 16px);margin:0 8px 10px;padding:8px;border:1px dashed #8a6a3a88;border-radius:2px;background:#fff8e633;color:#5a3e1c;font:600 12px var(--display);letter-spacing:.06em;cursor:pointer}
@media (max-width:560px){.sa-mq{grid-template-columns:24px minmax(0,1fr) auto;gap:8px;padding:8px}.sa-mqt b{font-size:14px}.sa-mqa .btn{padding:6px 8px!important;font-size:11.5px!important}.sa-mqp-box>summary small{display:none}.sa-mqw span{display:none}}

/* ---- Mapa: lugares para cazar plegable ---- */
.sa-hunt{margin:0 0 14px;border:1px solid #d9a44133;border-radius:2px;background:#0b131c66}
.sa-hunt>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:11px 14px;font-weight:600}
.sa-hunt>summary::-webkit-details-marker{display:none}
.sa-hunt>summary::after{content:"▾";margin-left:auto;color:#d9a441;transition:transform .2s}
.sa-hunt:not([open])>summary::after{transform:rotate(-90deg)}
.sa-hunt>.card{margin:0!important;border:0!important;background:none!important;box-shadow:none!important;padding:0 10px 10px!important}
.sa-hunt .places .pl{display:flex!important;flex-direction:column;align-items:flex-start!important;text-align:left;gap:2px}
.sa-hunt .places .pl>small{text-align:left!important;font-size:12px;opacity:.85}

/* ---- Lugar plegable ---- */
.lsech[data-salsec]{cursor:pointer;user-select:none;padding:8px 10px;margin:14px 0 8px;border-radius:2px;background:linear-gradient(90deg,#d9a44114,transparent 70%);border-left:2px solid #d9a44188;transition:background .15s}
.lsech[data-salsec]:hover{background:linear-gradient(90deg,#d9a44128,transparent 70%)}
.lsech[data-salsec]::after{order:5}
.lsech[data-salsec] .sa-cnt{order:6}.lsech[data-salsec] .sa-chev{order:7}
.lsec.sa-closed .lbody{display:none!important}
.lsec.sa-closed .sa-chev{transform:rotate(-90deg)}

/* ---- Personaje: hoja completa ---- */
.sa-more{margin-top:4px;border:1px solid #d9a44133;border-radius:2px;background:#0b131c66}
.sa-more>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 14px;font-family:var(--display);color:#d9b56a;letter-spacing:.06em}
.sa-more>summary::-webkit-details-marker{display:none}
.sa-more>summary small{font-family:var(--body);letter-spacing:0;color:var(--muted)}
.sa-more>summary::after{content:"▾";margin-left:auto;transition:transform .2s}
.sa-more:not([open])>summary::after{transform:rotate(-90deg)}
.sa-morebody{padding:4px 14px 14px}

/* ---- Mini-HUD ---- */
#sa-mini{position:fixed;top:0;left:0;right:0;z-index:70;display:flex;align-items:center;gap:10px;padding:6px max(12px,calc((100vw - 1160px)/2));height:46px;box-sizing:border-box;cursor:pointer;
  background:linear-gradient(180deg,#121a24f2,#0a0f15f2);backdrop-filter:blur(8px);border-bottom:1px solid #d9a44155;box-shadow:0 6px 18px #000a;animation:saDrop .25s ease both}
#sa-mini[hidden]{display:none}
@keyframes saDrop{from{transform:translateY(-100%)}to{transform:none}}
#sa-mini img{width:32px;height:32px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px #d9a441}
#sa-mini b{font-family:var(--display);color:#ffd98a;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px}
#sa-mini small{color:var(--ink-2);font-size:12px;white-space:nowrap}
#sa-mini .mb{position:relative;flex:1 1 90px;max-width:200px;height:14px;border-radius:7px;background:#05070a;box-shadow:inset 0 0 0 1px #ffffff18;overflow:hidden}
#sa-mini .mb i{position:absolute;inset:0 auto 0 0;border-radius:7px}
#sa-mini .mb.pv i{background:linear-gradient(90deg,#8a0f14,#ff5a4a)}#sa-mini .mb.mn i{background:linear-gradient(90deg,#123a8a,#5ab0ff)}
#sa-mini .mb em{position:absolute;inset:0;display:grid;place-items:center;font:600 10.5px var(--display);color:#fff;text-shadow:0 1px 2px #000;font-style:normal}
#sa-mini .mx{font-size:12.5px;white-space:nowrap;color:var(--ink)}#sa-mini .mx.gold{color:#ffd98a}
body.sa-mini-on .gtabs{top:46px!important}

/* ---- Barra de navegación abajo (teléfono) ---- */
#sa-bnav,#sa-sheet{display:none}
@media (max-width:760px){
  body.sa-bnav-on{padding-bottom:calc(74px + env(safe-area-inset-bottom))}
  body.sa-bnav-on .gtabs{display:none!important}
  body.sa-bnav-on #sa-bnav:not([hidden]){display:grid;grid-template-columns:repeat(6,1fr);position:fixed;left:0;right:0;bottom:0;z-index:65;padding:6px 6px calc(6px + env(safe-area-inset-bottom));
    background:linear-gradient(180deg,#121a24f5,#080c12fa);backdrop-filter:blur(10px);border-top:1px solid #d9a44155;box-shadow:0 -8px 24px #000b}
  #sa-bnav button,#sa-sheet .sa-sh-g button{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 2px;border:0;border-radius:10px;background:none;color:var(--ink-2);font:500 10px var(--display);letter-spacing:.04em;cursor:pointer;min-width:0}
  #sa-bnav .ic,#sa-sheet .ic{position:relative;display:grid;place-items:center;width:30px;height:30px;transition:transform .2s}
  #sa-bnav .ic .sai,#sa-sheet .ic .sai{width:26px!important;height:26px!important}
  #sa-bnav small,#sa-sheet small{font-size:10px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #sa-bnav button.on{color:#ffe9b8}
  #sa-bnav button.on .ic{transform:translateY(-3px) scale(1.12);filter:drop-shadow(0 0 6px #d9a441aa)}
  #sa-bnav button.on::before{content:"";position:absolute;top:-6px;left:28%;right:28%;height:2px;border-radius:2px;background:#ffd98a;box-shadow:0 0 8px #ffd98a}
  #sa-bnav .dot,#sa-sheet .dot{position:absolute;top:-1px;right:-3px;width:8px;height:8px;border-radius:50%;background:#e0584a;box-shadow:0 0 0 2px #0a0f15}
  .sa-dots{font-size:16px;letter-spacing:1px;color:#d9a441}
  body.sa-bnav-on #sa-sheet:not([hidden]){display:flex;align-items:flex-end;position:fixed;inset:0;z-index:66;background:#0008;animation:saFade .2s ease both}
  @keyframes saFade{from{opacity:0}}
  .sa-sh-in{width:100%;padding:12px 14px calc(84px + env(safe-area-inset-bottom));background:linear-gradient(180deg,#151d28,#0a0f15);border-top:1px solid #d9a44166;border-radius:16px 16px 0 0;box-shadow:0 -10px 30px #000c;animation:saUp .25s cubic-bezier(.2,1,.3,1) both}
  @keyframes saUp{from{transform:translateY(100%)}}
  .sa-sh-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.sa-sh-h b{font-family:var(--display);color:#ffd98a;letter-spacing:.06em}
  .sa-sh-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  #sa-sheet .sa-sh-g button{padding:10px 4px;background:#ffffff08;border:1px solid #ffffff10}
  #sa-sheet .sa-sh-g button.on{border-color:#d9a44188;color:#ffe9b8;background:#d9a4411a}
  body.sa-bnav-on #xchat{bottom:calc(84px + env(safe-area-inset-bottom))}
  #sa-mini{padding:6px 10px;gap:8px}#sa-mini b{max-width:80px}#sa-mini small{display:none}
  body.sa-mini-on #sa-mini{top:0}
}
`;
  document.head.appendChild(css);
})();
