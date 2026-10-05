// =====================================================================
// gremio.js — Pestaña «Gremio»: gremios con salón, mercado entre jugadores,
//             cuarto propio en la academia y jefe de gremio con roles.
// Todo lo compartido vive en Store.world (merge_world). Cada jugador solo escribe
// SUS entradas (donaciones, partes del jefe, compras), así no se pisan los datos.
//   world.guilds[gid]  = { id, name, ic, col, at, by, members{charId:{n,uid,rank,at}}, don{charId:{s,m}}, spent{s,m}, lvl, boss{...} }
//   world.market[id]   = { id, su, sc, sn, k:'item'|'arma', n, q, price, at, b?, bn?, bu?, bat?, paid?, cx?, ret? }
//   world.likes[charId]= { visitorCharId: 1 }
//   G.g.cuarto = { t: tema, s: [9 ids] } · G.g.gbt = [trofeos de jefe de gremio]
// Se carga después de clases.js.
// =====================================================================
(function () {
  if (typeof gameView !== "function" || typeof TABS === "undefined") return;
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const escx = (s) => (typeof esc === "function" ? esc(s) : String(s ?? ""));
  const save = () => { if (typeof persist === "function") persist(); };
  const W = () => Store.world || {};
  const now = () => Date.now();
  const today = () => new Date().toISOString().slice(0, 10);
  const uidN = () => "x" + now().toString(36) + Math.floor(Math.random() * 1e5).toString(36);
  async function upd(patch, fail) { try { await Store.updateWorld(patch); return true; } catch (e) { console.warn("gremio upd:", e); toast(fail || Lx("No se pudo guardar en el mundo. Revisa tu conexión.", "Couldn't save. Check connection.")); return false; } }
  const CORE = "Núcleo de evolución";
  const charsAll = () => (Store.all || []).filter((c) => c && c.g);
  const charById = (id) => (id === G?.id ? G : charsAll().find((c) => c.id === id));

  // ---------------------------------------------------------------
  // Pestaña nueva
  // ---------------------------------------------------------------
  if (!TABS.some(([k]) => k === "gremio")) TABS.splice(TABS.findIndex(([k]) => k === "grupo") + 1 || TABS.length, 0, ["gremio", "Gremio"]);
  const SIMG = (p, fb) => (window.SAI?.img ? window.SAI.img(p, fb) : fb);
  const SUBS = () => [["gremio", SIMG("gr/gremio", "🏰"), Lx("Gremio", "Guild")], ["jefe", SIMG("gr/jefe", "🐲"), Lx("Jefe", "Boss")], ["mercado", SIMG("gr/mercado", "🏪"), Lx("Mercado", "Market")], ["cuarto", SIMG("gr/cuartos", "🛏️"), Lx("Cuartos", "Rooms")]];
  const _gv = gameView;
  gameView = function () {
    if (!G?.g || gtab !== "gremio" || G.g.combat) return _gv.apply(this, arguments);
    gtab = "grupo"; let out;
    try { out = _gv.apply(this, arguments); } finally { gtab = "gremio"; }
    try {
      const body = view();
      out = out.replace(/(<section[^>]*class="panel[^"]*"[^>]*>)[\s\S]*<\/section>/, `$1${body}</section>`);
      out = out.replace(/(data-gtab="grupo"[^>]*class=")on(")/, "$1$2").replace(/(class=")on("[^>]*data-gtab="grupo")/, "$1$2");
      out = out.replace(/data-gtab="gremio" class="[^"]*"/, 'data-gtab="gremio" class="on"');
    } catch (e) { console.warn("gremio view:", e); }
    return out;
  };
  // ícono de la pestaña
  const _gv2 = gameView;
  gameView = function () {
    let out = _gv2.apply(this, arguments);
    try { out = out.replace(/(<button type="button" data-gtab="gremio"[^>]*>)(?!<i class="tic)/, `$1<i class="tic">${SIMG("gr/gremio", "🏰")}</i> `); } catch (e) {}
    return out;
  };
  function view() {
    const sub = gsel.gr || "gremio";
    const tabs = `<div class="sa-gtabs">${SUBS().map(([k, ic, n]) => `<button type="button" class="chip ${sub === k ? "on" : ""}" data-sagr="${k}">${ic} ${n}${k === "mercado" && mySoldUnpaid() ? ' <i class="sa-dot"></i>' : ""}</button>`).join("")}</div>`;
    const body = { gremio: guildView, jefe: bossView, mercado: marketView, cuarto: roomView }[sub] || guildView;
    return tabs + body();
  }

  // ---------------------------------------------------------------
  // GREMIOS
  // ---------------------------------------------------------------
  const CRESTS = ["🦁", "🐉", "🦅", "🐺", "🌙", "☀️", "⚔️", "🛡️", "🔥", "🌊", "🌿", "💀", "🦄", "🐻", "⭐", "👑"];
  const COLS = ["#d9a441", "#e0735c", "#5ab0ff", "#6fd2a6", "#b56cff", "#ff8ad0", "#c9d1d9"];
  const RANKS = { lider: [4, "👑", () => Lx("Líder", "Leader")], oficial: [3, "⭐", () => Lx("Oficial", "Officer")], miembro: [2, "🔹", () => Lx("Miembro", "Member")], recluta: [1, "▫️", () => Lx("Recluta", "Recruit")] };
  const CREATE_COST = 500;
  const HALL = [null,
    { s: 1000, m: 10, n: () => Lx("Salón de reuniones", "Meeting hall"), p: () => "+5% XP", b: { xp: 0.05 } },
    { s: 3000, m: 25, n: () => Lx("Armería del gremio", "Guild armory"), p: () => Lx("+1 defensa", "+1 def"), b: { def: 1 } },
    { s: 7000, m: 50, n: () => Lx("Tesorería", "Treasury"), p: () => Lx("+10% Soles al ganar", "+10% Soles"), b: { soles: 0.1 } },
    { s: 15000, m: 90, n: () => Lx("Forja del gremio", "Guild forge"), p: () => Lx("+2 de daño", "+2 dmg"), b: { dmg: 2 } },
    { s: 30000, m: 150, n: () => Lx("Gran estandarte", "Great banner"), p: () => Lx("+10% XP y +1 Núcleo en el jefe de gremio", "+10% XP, +1 core from guild boss"), b: { xp: 0.1, core: 1 } },
  ];
  const guilds = () => Object.values(W().guilds || {}).filter((g) => g && g.id && g.members);
  const memOf = (g, cid) => { const m = g?.members?.[cid]; return m && m.rank ? m : null; };
  const myGuild = () => (G?.g ? guilds().find((g) => memOf(g, G.id)) : null);
  const members = (g) => Object.entries(g.members || {}).filter(([, m]) => m && m.rank).map(([id, m]) => ({ id, ...m })).sort((a, b) => RANKS[b.rank][0] - RANKS[a.rank][0] || a.n.localeCompare(b.n));
  const myRank = () => memOf(myGuild(), G.id)?.rank;
  const canLead = () => ["lider", "oficial"].includes(myRank());
  function totals(g) { let s = 0, m = 0; for (const d of Object.values(g.don || {})) if (d) { s += d.s || 0; m += d.m || 0; } return { s: s - (g.spent?.s || 0), m: m - (g.spent?.m || 0) }; }
  function perks(g) { const t = { xp: 0, def: 0, dmg: 0, soles: 0, core: 0 }; if (!g) return t; for (let i = 1; i <= (g.lvl || 0); i++) for (const [k, v] of Object.entries(HALL[i]?.b || {})) t[k] += v; return t; }
  const crest = (g, big) => g ? `<span class="sa-crest ${big ? "big" : ""}" style="--gc:${escx(g.col || "#d9a441")}">${escx(g.ic || "🛡️")}</span>` : "";

  // bonos del salón
  let perkCache = { at: 0, v: perks(null) };
  const myPerks = () => { if (now() - perkCache.at > 500) perkCache = { at: now(), v: perks(myGuild()) }; return perkCache.v; };
  const _wb = weaponBonus; weaponBonus = function () { return _wb() + (G?.g ? myPerks().dmg : 0); };
  const _db = defBonus; defBonus = function () { return _db() + (G?.g ? myPerks().def : 0); };
  const _gx = gainXP; gainXP = function (n) { const m = G?.g ? 1 + myPerks().xp : 1; return _gx.call(this, n && m !== 1 ? Math.round(n * m) : n); };
  const _v = victory;
  victory = function () {
    const c = G?.g?.combat; const s0 = G?.dinero?.soles || 0; const gb = c?.gb;
    const r = _v.apply(this, arguments);
    try {
      const p = myPerks();
      if (c && p.soles && !["arena", "duel", "pvp"].includes(c.kind)) { const extra = Math.round(Math.max(0, G.dinero.soles - s0) * p.soles); if (extra > 0) { G.dinero.soles += extra; const b = G.g.lastBattle || G.g.lastResult; if (b) b.lines = [...(b.lines || []), `🏰 ${Lx("Tesorería del gremio", "Guild treasury")}: ☀ +${extra}`]; save(); } }
    } catch (e) {}
    return r;
  };

  function guildView() {
    const g = myGuild();
    if (!g) {
      const list = guilds();
      return `<div class="sa-gbox"><h2>🏰 ${Lx("Gremios", "Guilds")}</h2><p class="muted">${Lx("Únete al gremio de tus amigos o funda el tuyo. Entre todos mejoran el salón (más XP, defensa, daño y Soles para todos) y pueden invocar un jefe de gremio.", "Join or found a guild.")}</p>
        ${list.length ? `<div class="sa-glist">${list.map((x) => `<div class="sa-grow">${crest(x)}<div><b>${escx(x.name)}</b><small>${members(x).length} ${Lx("miembros", "members")} · ${Lx("salón nivel", "hall lvl")} ${x.lvl || 0}</small></div><button type="button" class="btn small primary" data-sagjoin="${escx(x.id)}">${Lx("Unirme", "Join")}</button></div>`).join("")}</div>` : `<p class="note">${Lx("Todavía no hay gremios. ¡Funda el primero!", "No guilds yet.")}</p>`}
        <details class="sa-gnew" ${list.length ? "" : "open"}><summary>➕ ${Lx("Fundar un gremio", "Found a guild")} · ${CREATE_COST} Soles</summary>
          <label class="f">${Lx("Nombre", "Name")}<input id="sa-gname" maxlength="24" value="${escx(gsel.gName || "")}" placeholder="${Lx("Ej.: Los Hijos del Alba", "e.g. Dawn Children")}"></label>
          <div class="sa-pick"><small>${Lx("Escudo", "Crest")}</small><div>${CRESTS.map((c, i) => `<button type="button" class="chip ${(gsel.gIc ?? 0) === i ? "on" : ""}" data-sagic="${i}">${c}</button>`).join("")}</div></div>
          <div class="sa-pick"><small>${Lx("Color", "Color")}</small><div>${COLS.map((c, i) => `<button type="button" class="sa-col ${(gsel.gCol ?? 0) === i ? "on" : ""}" style="--gc:${c}" data-sagcol="${i}"></button>`).join("")}</div></div>
          <button type="button" class="btn primary" data-sagnew="1" ${G.dinero.soles < CREATE_COST ? "disabled" : ""}>🏰 ${Lx("Fundar", "Found")}</button></details></div>`;
    }
    const t = totals(g); const lv = g.lvl || 0; const next = HALL[lv + 1]; const ms = members(g); const me = myRank();
    const mats = Object.entries(G.g.inv).filter(([n, q]) => q > 0 && isMatG(n)).reduce((a, [, q]) => a + q, 0);
    return `<div class="sa-gbox">
      <div class="sa-ghead" style="--gc:${escx(g.col)}">${crest(g, true)}<div><h2>${escx(g.name)}</h2><small>${RANKS[me][1]} ${Lx("Tu rango", "Your rank")}: <b>${RANKS[me][2]()}</b> · ${ms.length} ${Lx("miembros", "members")}</small></div></div>
      <div class="sa-hall"><h3>🏛️ ${Lx("Salón del gremio", "Guild hall")} · ${Lx("nivel", "level")} ${lv}/5</h3>
        <div class="sa-hlv">${HALL.slice(1).map((h, i) => `<div class="${i < lv ? "on" : i === lv ? "nx" : ""}"><b>${i + 1}. ${h.n()}</b><small>${h.p()}</small></div>`).join("")}</div>
        <div class="sa-fund"><span>☀ <b>${t.s}</b> Soles</span><span>🪨 <b>${t.m}</b> ${Lx("materiales", "materials")}</span>${next ? `<span class="muted">${Lx("Siguiente", "Next")}: ${next.s} Soles + ${next.m} ${Lx("materiales", "mats")}</span>` : `<span class="ok">✔ ${Lx("¡Salón completo!", "Hall complete!")}</span>`}</div>
        ${next ? `<i class="sa-fbar"><i style="width:${Math.min(100, Math.round((Math.min(1, t.s / next.s) + Math.min(1, t.m / next.m)) * 50))}%"></i></i>` : ""}
        <div class="row">
          <button type="button" class="btn small" data-sagdon="s|100" ${G.dinero.soles < 100 ? "disabled" : ""}>☀ ${Lx("Donar", "Give")} 100</button>
          <button type="button" class="btn small" data-sagdon="s|500" ${G.dinero.soles < 500 ? "disabled" : ""}>☀ 500</button>
          <button type="button" class="btn small" data-sagdon="s|2000" ${G.dinero.soles < 2000 ? "disabled" : ""}>☀ 2000</button>
          <button type="button" class="btn small" data-sagdon="m|5" ${mats < 5 ? "disabled" : ""}>🪨 ${Lx("Donar 5 materiales", "Give 5 mats")}</button>
          ${next && canLead() ? `<button type="button" class="btn small primary" data-saglvl="1" ${t.s >= next.s && t.m >= next.m ? "" : "disabled"}>⬆️ ${Lx("Mejorar salón", "Upgrade hall")}</button>` : ""}
        </div><small class="muted">${Lx("Tú donaste", "You gave")}: ☀ ${g.don?.[G.id]?.s || 0} · 🪨 ${g.don?.[G.id]?.m || 0}</small></div>
      <div class="sa-mems"><h3>👥 ${Lx("Miembros", "Members")}</h3>${ms.map((m) => {
        const c = charById(m.id); const isMe = m.id === G.id; const d = g.don?.[m.id] || {};
        const acts = me === "lider" && !isMe ? `${m.rank !== "oficial" ? `<button type="button" class="chip" data-sagrank="${m.id}|up" title="${Lx("Ascender", "Promote")}">⬆️</button>` : ""}${m.rank !== "recluta" ? `<button type="button" class="chip" data-sagrank="${m.id}|down" title="${Lx("Bajar", "Demote")}">⬇️</button>` : ""}<button type="button" class="chip" data-sagkick="${m.id}" title="${Lx("Expulsar", "Kick")}">✖</button>` : me === "oficial" && m.rank === "recluta" ? `<button type="button" class="chip" data-sagrank="${m.id}|up">⬆️</button>` : "";
        return `<div class="sa-mem ${isMe ? "me" : ""}"><span>${RANKS[m.rank][1]}</span><div><b>${escx(m.n)}</b><small>${RANKS[m.rank][2]()}${c?.nivel ? ` · ${Lx("Nv", "Lv")} ${c.nivel}` : ""}${c?.g?.clase && window.SA_CLASES?.CLS[c.g.clase] ? ` · ${(window.SA_CLASES.CLS[c.g.clase].im || window.SA_CLASES.CLS[c.g.clase].ic)}` : ""} · ☀ ${d.s || 0} 🪨 ${d.m || 0}</small></div><div class="sa-macts">${acts}</div></div>`;
      }).join("")}</div>
      <div class="row"><button type="button" class="btn small ghost" data-sagleave="1">🚪 ${Lx("Salir del gremio", "Leave guild")}</button></div></div>`;
  }
  const isMatG = (n) => !(typeof SHOP !== "undefined" && SHOP.some((s) => s.n === n)) && !(typeof ATTR_ITEMS !== "undefined" && ATTR_ITEMS[n]) && !window.SA_EXTRA?.WEAR?.[n] && (typeof WEAPONS === "undefined" || WEAPONS[n] == null) && !/Libros|Uniforme|Poción|Tónico|Núcleo|Paquete|Caramelo|Copo de nieve|Pétalo del Alba/.test(n);

  async function gJoin(gid) {
    if (myGuild()) return toast(Lx("Ya estás en un gremio.", "Already in a guild."));
    if (await upd({ guilds: { [gid]: { members: { [G.id]: { n: G.nombre, uid: Store.uid, rank: "recluta", at: now() } } } } })) { toast(Lx("¡Te uniste al gremio!", "Joined!")); try { log("Te uniste a un gremio."); } catch (e) {} }
    render();
  }
  async function gNew() {
    if (myGuild()) return;
    const name = (document.getElementById("sa-gname")?.value || gsel.gName || "").trim().slice(0, 24);
    if (name.length < 3) return toast(Lx("Ponle un nombre de al menos 3 letras.", "Name too short."));
    if (guilds().some((g) => g.name.toLowerCase() === name.toLowerCase())) return toast(Lx("Ya existe un gremio con ese nombre.", "Name taken."));
    if (G.dinero.soles < CREATE_COST) return;
    const id = "g" + uidN();
    const ok = await upd({ guilds: { [id]: { id, name, ic: CRESTS[gsel.gIc || 0], col: COLS[gsel.gCol || 0], at: now(), by: G.id, lvl: 0, spent: { s: 0, m: 0 }, members: { [G.id]: { n: G.nombre, uid: Store.uid, rank: "lider", at: now() } } } } });
    if (!ok) return;
    G.dinero.soles -= CREATE_COST; save(); gsel.gName = ""; toast(`🏰 ${Lx("¡Fundaste", "You founded")} ${name}!`); try { sfx("level"); log(`Fundaste el gremio ${name}.`); } catch (e) {}
    render();
  }
  async function gDonate(kind, n) {
    const g = myGuild(); if (!g) return; const d = g.don?.[G.id] || { s: 0, m: 0 };
    if (kind === "s") { if (G.dinero.soles < n) return; if (!(await upd({ guilds: { [g.id]: { don: { [G.id]: { s: (d.s || 0) + n, m: d.m || 0 } } } } }))) return; G.dinero.soles -= n; }
    else {
      const mats = Object.entries(G.g.inv).filter(([k, q]) => q > 0 && isMatG(k)).sort((a, b) => b[1] - a[1]); let left = n; const use = [];
      for (const [k, q] of mats) { if (!left) break; const t = Math.min(q, left); use.push([k, t]); left -= t; }
      if (left) return toast(Lx("No tienes materiales suficientes.", "Not enough materials."));
      if (!(await upd({ guilds: { [g.id]: { don: { [G.id]: { s: d.s || 0, m: (d.m || 0) + n } } } } }))) return;
      for (const [k, t] of use) addItem(k, -t);
    }
    try { sfx("buy"); } catch (e) {} toast(Lx("¡Gracias por tu donación!", "Thanks!")); save(); render();
  }
  async function gLevel() {
    const g = myGuild(); if (!g || !canLead()) return; const lv = g.lvl || 0; const next = HALL[lv + 1]; if (!next) return; const t = totals(g);
    if (t.s < next.s || t.m < next.m) return;
    if (await upd({ guilds: { [g.id]: { lvl: lv + 1, spent: { s: (g.spent?.s || 0) + next.s, m: (g.spent?.m || 0) + next.m } } } })) { toast(`🏛️ ${next.n()}!`); try { sfx("level"); } catch (e) {} }
    render();
  }
  async function gRank(cid, dir) {
    const g = myGuild(); const m = memOf(g, cid); if (!m) return; const me = myRank();
    const order = ["recluta", "miembro", "oficial"]; let i = order.indexOf(m.rank); if (i < 0) return;
    i = dir === "up" ? Math.min(2, i + 1) : Math.max(0, i - 1);
    if (me === "oficial" && (dir !== "up" || m.rank !== "recluta")) return; if (me !== "lider" && me !== "oficial") return;
    await upd({ guilds: { [g.id]: { members: { [cid]: { rank: order[i] } } } } }); render();
  }
  async function gKick(cid) { const g = myGuild(); if (!g || myRank() !== "lider") return; await upd({ guilds: { [g.id]: { members: { [cid]: { rank: null, left: now() } } } } }); render(); }
  async function gLeave() {
    const g = myGuild(); if (!g) return; const me = myRank();
    const patch = { members: { [G.id]: { rank: null, left: now() } } };
    if (me === "lider") { const heir = members(g).find((m) => m.id !== G.id); if (heir) patch.members[heir.id] = { rank: "lider" }; }
    if (await upd({ guilds: { [g.id]: patch } })) toast(Lx("Saliste del gremio.", "You left the guild."));
    render();
  }

  // ---------------------------------------------------------------
  // MERCADO
  // ---------------------------------------------------------------
  const FEE = 0.05, DAYS = 7;
  const mk = () => Object.values(W().market || {}).filter((x) => x && x.id);
  const openL = (x) => !x.b && !x.cx;
  function marketView() {
    const q = (gsel.mkQ || "").toLowerCase();
    const list = mk().filter(openL).filter((x) => !q || x.n.toLowerCase().includes(q)).sort((a, b) => (gsel.mkS === "new" ? b.at - a.at : a.price - b.price));
    const mine = mk().filter((x) => x.sc === G.id && !(x.paid || x.ret));
    const items = Object.entries(G.g.inv).filter(([n, q2]) => q2 > 0 && !/^Paquete/.test(n));
    const arms = [...new Set(G.g.armas || [])];
    const sel = gsel.mkSel || "";
    const selQ = sel.startsWith("i|") ? G.g.inv[sel.slice(2)] || 0 : sel ? 1 : 0;
    const ic = (x) => (x.k === "arma" ? window.SAI?.obj?.(x.n, "🗡️") || "🗡️" : window.SAI?.obj?.(x.n, "📦") || (x.n === CORE ? "🔮" : "📦"));
    return `<div class="sa-gbox"><h2>🏪 ${Lx("Mercado entre jugadores", "Player market")}</h2><p class="muted">${Lx(`Pon algo a la venta: queda guardado en el mercado y otro jugador lo puede comprar aunque no estés conectado. Cobras al volver (el mercado se queda un ${Math.round(FEE * 100)}%). Lo que no se vende en ${DAYS} días vuelve a tu Bolsa.`, "List items; others can buy while you're offline.")}</p>
      <div class="sa-mkbar"><input id="sa-mkq" placeholder="🔎 ${Lx("Buscar…", "Search…")}" value="${escx(gsel.mkQ || "")}"><button type="button" class="chip ${gsel.mkS !== "new" ? "on" : ""}" data-samks="price">${Lx("Más baratos", "Cheapest")}</button><button type="button" class="chip ${gsel.mkS === "new" ? "on" : ""}" data-samks="new">${Lx("Nuevos", "Newest")}</button></div>
      ${list.length ? `<div class="sa-mkl">${list.map((x) => { const own = x.sc === G.id; return `<div class="sa-mki"><em>${ic(x)}</em><div><b>${escx(x.n)}${x.q > 1 ? ` ×${x.q}` : ""}</b><small>${Lx("Vende", "Seller")}: ${escx(x.sn)} · ${Math.max(0, DAYS - Math.floor((now() - x.at) / 864e5))} ${Lx("días", "days")}</small></div><span class="sa-price">☀ ${x.price}</span>${own ? `<button type="button" class="btn small ghost" data-samkcx="${x.id}">${Lx("Quitar", "Remove")}</button>` : `<button type="button" class="btn small primary" data-samkbuy="${x.id}" ${G.dinero.soles < x.price ? "disabled" : ""}>${Lx("Comprar", "Buy")}</button>`}</div>`; }).join("")}</div>` : `<p class="note">${Lx("No hay nada a la venta ahora mismo.", "Nothing for sale.")}</p>`}
      <details class="sa-mksell" ${gsel.mkOpen ? "open" : ""}><summary>💰 ${Lx("Vender algo", "Sell something")}</summary>
        <label class="f">${Lx("Qué", "What")}<select id="sa-mksel"><option value="">—</option>${arms.length ? `<optgroup label="🗡️ ${Lx("Armas del arsenal", "Arsenal")}">${arms.map((n) => `<option value="a|${escx(n)}" ${sel === "a|" + n ? "selected" : ""}>${escx(n)}</option>`).join("")}</optgroup>` : ""}<optgroup label="🎒 ${Lx("Bolsa", "Bag")}">${items.map(([n, q2]) => `<option value="i|${escx(n)}" ${sel === "i|" + n ? "selected" : ""}>${escx(n)} (${q2})</option>`).join("")}</optgroup></select></label>
        <div class="row"><label class="f">${Lx("Cantidad", "Qty")}<input id="sa-mkn" type="number" min="1" max="${Math.max(1, selQ)}" value="${escx(gsel.mkN || 1)}" ${sel.startsWith("i|") ? "" : "disabled"}></label><label class="f">☀ ${Lx("Precio total", "Total price")}<input id="sa-mkp" type="number" min="1" max="999999" value="${escx(gsel.mkP || 100)}"></label></div>
        <button type="button" class="btn primary" data-samksell="1">📤 ${Lx("Poner a la venta", "List it")}</button></details>
      ${mine.length ? `<h3>📦 ${Lx("Mis ventas", "My listings")}</h3><div class="sa-mkl">${mine.map((x) => `<div class="sa-mki ${x.b ? "sold" : ""}"><em>${ic(x)}</em><div><b>${escx(x.n)}${x.q > 1 ? ` ×${x.q}` : ""}</b><small>${x.b ? `✔ ${Lx("Vendido a", "Sold to")} ${escx(x.bn)}` : x.cx ? Lx("Retirado", "Removed") : Lx("A la venta", "For sale")}</small></div><span class="sa-price">☀ ${x.price}</span>${!x.b && !x.cx ? `<button type="button" class="btn small ghost" data-samkcx="${x.id}">${Lx("Quitar", "Remove")}</button>` : ""}</div>`).join("")}</div>` : ""}</div>`;
  }
  const mySoldUnpaid = () => mk().some((x) => x.sc === G?.id && x.b && !x.paid);
  async function mkSell() {
    const sel = document.getElementById("sa-mksel")?.value || ""; if (!sel) return toast(Lx("Elige qué vender.", "Pick an item."));
    const price = Math.floor(+document.getElementById("sa-mkp")?.value || 0); if (!(price >= 1)) return toast(Lx("Pon un precio.", "Set a price."));
    const k = sel[0] === "a" ? "arma" : "item"; const n = sel.slice(2);
    let q = k === "arma" ? 1 : Math.floor(+document.getElementById("sa-mkn")?.value || 1);
    if (k === "item") { const have = G.g.inv[n] || 0; q = Math.max(1, Math.min(have, q)); if (!have) return; }
    else { const i = (G.g.armas || []).indexOf(n); if (i < 0) return; }
    // depósito
    if (k === "item") addItem(n, -q); else G.g.armas.splice(G.g.armas.indexOf(n), 1);
    save();
    const id = "m" + uidN();
    const ok = await upd({ market: { [id]: { id, su: Store.uid, sc: G.id, sn: G.nombre, k, n, q, price, at: now() } } });
    if (!ok) { if (k === "item") addItem(n, q); else G.g.armas.push(n); save(); return render(); }
    gsel.mkSel = ""; gsel.mkP = ""; gsel.mkN = ""; toast(Lx("¡Puesto a la venta!", "Listed!")); try { sfx("buy"); } catch (e) {} render();
  }
  const pending = new Set();
  async function mkBuy(id) {
    const x = (W().market || {})[id]; if (!x || !openL(x) || x.sc === G.id || pending.has(id)) return;
    if (G.dinero.soles < x.price) return toast(Lx("No tienes Soles suficientes.", "Not enough Soles."));
    pending.add(id);
    const ok = await upd({ market: { [id]: { b: G.id, bn: G.nombre, bu: Store.uid, bat: now() } } });
    if (!ok) { pending.delete(id); return; }
    toast(Lx("Comprando…", "Buying…"));
    setTimeout(() => {
      pending.delete(id);
      const y = (W().market || {})[id];
      if (!y || y.b !== G.id || y.cx) { toast(Lx("Otro jugador lo compró primero.", "Someone else bought it.")); return render(); }
      if (G.dinero.soles < y.price) return;
      G.dinero.soles -= y.price;
      if (y.k === "arma") { G.g.armas = G.g.armas || []; G.g.armas.push(y.n); } else addItem(y.n, y.q);
      try { sfx("level"); log(`Compraste ${y.n} a ${y.sn} por ${y.price} Soles.`); } catch (e) {}
      toast(`🛍️ ${Lx("¡Compraste", "Bought")} ${y.n}!`); save(); render();
    }, 1500);
  }
  async function mkCancel(id) { const x = (W().market || {})[id]; if (!x || x.sc !== G.id || !openL(x)) return; await upd({ market: { [id]: { cx: now() } } }); render(); }
  let settling = false;
  function mkSettle() {
    if (settling || !G?.g || !Store.world) return;
    for (const x of mk()) {
      if (x.sc !== G.id) continue;
      if (openL(x) && now() - x.at > DAYS * 864e5) { settling = true; upd({ market: { [x.id]: { cx: now() } } }).finally(() => (settling = false)); return; }
      if (x.b && !x.paid) {
        const get = Math.max(1, Math.round(x.price * (1 - FEE)));
        settling = true;
        upd({ market: { [x.id]: { paid: now() } } }).then((ok) => { if (ok) { G.dinero.soles += get; toast(`💰 ${x.bn} ${Lx("compró tu", "bought your")} ${x.n}: ☀ +${get}`); try { sfx("level"); log(`${x.bn} compró tu ${x.n}: +${get} Soles.`); } catch (e) {} save(); render(); } }).finally(() => (settling = false));
        return;
      }
      if (x.cx && !x.b && !x.ret) {
        settling = true;
        upd({ market: { [x.id]: { ret: now() } } }).then((ok) => { if (ok) { if (x.k === "arma") { G.g.armas = G.g.armas || []; G.g.armas.push(x.n); } else addItem(x.n, x.q); toast(`↩️ ${x.n} ${Lx("volvió a tu Bolsa", "returned")}`); save(); render(); } }).finally(() => (settling = false));
        return;
      }
    }
  }

  // ---------------------------------------------------------------
  // CUARTO PROPIO
  // ---------------------------------------------------------------
  const THEMES = { madera: ["🪵", () => Lx("Madera cálida", "Warm wood")], piedra: ["🏰", () => Lx("Piedra del castillo", "Castle stone")], noche: ["🌌", () => Lx("Noche estrellada", "Starry night")], jardin: ["🌿", () => Lx("Jardín", "Garden")], real: ["👑", () => Lx("Real", "Royal")] };
  const SLOTS = 9;
  function collectibles(c) {
    const g = c.g || {}; const out = [];
    for (const k of Object.keys(g.bossDone || {})) { const [r, p] = k.split(":"); const pl = P[r]?.[+p]; if (pl?.boss) out.push({ id: "boss:" + k, ic: "🏆", n: Lx("Trofeo", "Trophy") + ": " + String(pl.boss).replace(/\s*\(.*\)/, "") }); }
    for (const t of g.gbt || []) out.push({ id: "gb:" + t, ic: "🐲", n: Lx("Trofeo de gremio", "Guild trophy") + ": " + t });
    for (const n of g.mascotas || []) out.push({ id: "pet:" + n, pet: n, n });
    for (const n of g.monturas || []) out.push({ id: "mnt:" + n, ic: "🐎", n });
    const ws = new Set([g.arma?.n, ...(g.armas || [])].filter(Boolean));
    for (const n of ws) if (/★|calabaza|caramelo|amanecer/i.test(n) || (typeof WEAPONS !== "undefined" && WEAPONS[n] >= 30)) out.push({ id: "arma:" + n, arma: n, n });
    for (const n of [CORE, "Caramelo embrujado", "Copo de nieve", "Pétalo del Alba", "Pez dorado", "Cristal eterno", "Polvo de luna"]) if ((g.inv || {})[n] > 0) out.push({ id: "item:" + n, it: n, n });
    return out;
  }
  function collIc(o) {
    if (!o) return "";
    if (o.pet) return window.SAI?.pet?.(o.pet) || window.SA_EXTRA?.PETS?.[o.pet]?.i || "🐾";
    if (o.arma) return window.SAI?.obj?.(o.arma, "🗡️") || "🗡️";
    if (o.it) return o.it === CORE ? "🔮" : window.SAI?.obj?.(o.it, "💎") || "💎";
    return o.ic || "✨";
  }
  function roomOf(c) { const r = c.g?.cuarto || {}; return { t: THEMES[r.t] ? r.t : "madera", s: Array.from({ length: SLOTS }, (_, i) => (r.s || [])[i] || null) }; }
  function roomHtml(c, edit) {
    const r = roomOf(c); const col = Object.fromEntries(collectibles(c).map((o) => [o.id, o]));
    const likes = Object.keys(W().likes?.[c.id] || {}).length;
    return `<div class="sa-room th-${r.t}"><div class="sa-roomh"><b>🛏️ ${Lx("Cuarto de", "Room of")} ${escx(c.nombre)}</b><span>❤️ ${likes}</span></div>
      <div class="sa-shelves">${r.s.map((id, i) => { const o = col[id]; return `<div class="sa-spot ${o ? "full" : ""} ${edit && gsel.rmPick === i ? "pick" : ""}" ${edit ? `data-sarmspot="${i}"` : ""} title="${o ? escx(o.n) : ""}">${o ? `<span class="ic">${collIc(o)}</span><small>${escx(o.n)}</small>` : edit ? `<span class="plus">＋</span>` : ""}</div>`; }).join("")}</div></div>`;
  }
  function roomView() {
    const visit = gsel.rmVisit && gsel.rmVisit !== G.id ? charById(gsel.rmVisit) : null;
    if (visit) {
      const liked = !!W().likes?.[visit.id]?.[G.id];
      return `<div class="sa-gbox"><button type="button" class="link" data-sarmvisit="">← ${Lx("Volver a mi cuarto", "Back to my room")}</button>${roomHtml(visit, false)}<div class="row"><button type="button" class="btn small ${liked ? "" : "primary"}" data-sarmlike="${escx(visit.id)}" ${liked ? "disabled" : ""}>❤️ ${liked ? Lx("Te gusta", "Liked") : Lx("Me gusta", "Like")}</button></div></div>`;
    }
    const r = roomOf(G); const col = collectibles(G); const used = new Set(r.s.filter(Boolean));
    const others = charsAll().filter((c) => c.id !== G.id && c.owner !== undefined && c.g?.cuarto?.s?.some(Boolean));
    const pick = gsel.rmPick;
    return `<div class="sa-gbox"><h2>🛏️ ${Lx("Tu cuarto en la academia", "Your academy room")}</h2><p class="muted">${Lx("Decóralo con trofeos de jefes, tus mascotas, armas especiales y cosas raras. Tus amigos lo pueden visitar.", "Decorate it; friends can visit.")}</p>
      <div class="sa-themes">${Object.entries(THEMES).map(([k, [ic, n]]) => `<button type="button" class="chip ${r.t === k ? "on" : ""}" data-sarmtheme="${k}">${ic} ${n()}</button>`).join("")}</div>
      ${roomHtml(G, true)}
      ${pick != null ? `<div class="sa-rmpick"><b>${Lx("Elige qué poner en el hueco", "Pick something for spot")} ${pick + 1}</b><div class="sa-rmgrid">${r.s[pick] ? `<button type="button" class="sa-rmc rm" data-sarmput="">🗑️ ${Lx("Quitar", "Remove")}</button>` : ""}${col.filter((o) => !used.has(o.id) || r.s[pick] === o.id).map((o) => `<button type="button" class="sa-rmc" data-sarmput="${escx(o.id)}"><span>${collIc(o)}</span><small>${escx(o.n)}</small></button>`).join("") || `<p class="note">${Lx("Todavía no tienes cosas para exponer: vence jefes, consigue mascotas o evoluciona un arma.", "Nothing to display yet.")}</p>`}</div><button type="button" class="link" data-sarmspot="-1">${Lx("Cerrar", "Close")}</button></div>` : `<p class="note">${Lx("Toca un hueco de la estantería para poner algo.", "Tap a spot to place something.")}</p>`}
      <h3>🚪 ${Lx("Visitar cuartos", "Visit rooms")}</h3>${others.length ? `<div class="sa-glist">${others.map((c) => `<div class="sa-grow"><span class="sa-crest">🛏️</span><div><b>${escx(c.nombre)}</b><small>❤️ ${Object.keys(W().likes?.[c.id] || {}).length} · ${c.g.cuarto.s.filter(Boolean).length} ${Lx("cosas", "items")}</small></div><button type="button" class="btn small" data-sarmvisit="${escx(c.id)}">${Lx("Visitar", "Visit")}</button></div>`).join("")}</div>` : `<p class="note">${Lx("Ningún amigo ha decorado su cuarto todavía.", "No decorated rooms yet.")}</p>`}</div>`;
  }

  // ---------------------------------------------------------------
  // JEFE DE GREMIO (roles)
  // ---------------------------------------------------------------
  const GB = [["Gólem del Abismo", "🗿", "Tierra"], ["Hidra de Ceniza", "🐉", "Fuego"], ["Reina Araña de Cristal", "🕷️", "Sombra"], ["Titán de Escarcha", "🧊", "Agua"], ["Fénix Corrupto", "🔥", "Fuego"], ["Leviatán de la Tormenta", "🐋", "Rayo"]];
  const ROLES = {
    tanque: { ic: "🛡️", n: () => Lx("Tanque", "Tank"), d: () => Lx("Rompe la coraza del jefe con «Provocar» (fase 1).", "Breaks the boss armor (phase 1)."), sk: () => Lx("Provocar", "Taunt") },
    sanador: { ic: "💚", n: () => Lx("Sanador", "Healer"), d: () => Lx("Calma la furia del jefe con «Bendecir» (fase 2).", "Calms the fury (phase 2)."), sk: () => Lx("Bendecir", "Bless") },
    dano: { ic: "⚔️", n: () => Lx("Daño", "Damage"), d: () => Lx("Pega fuerte. En la fase 3 hace ×1.5 de daño.", "Hits hard. ×1.5 in phase 3."), sk: () => Lx("Golpe concentrado", "Focused strike") },
  };
  const SHIELD_NEED = 6, BLESS_NEED = 6, TRIES = 3, ROUNDS = 6;
  const boss = (g) => (g?.boss && g.boss.id ? g.boss : null);
  const parts = (b) => Object.entries(b?.parts || {}).filter(([, p]) => p).map(([id, p]) => ({ id, ...p }));
  function bstate(b) {
    const ps = parts(b); const dmg = ps.reduce((a, p) => a + (p.dmg || 0), 0); const sh = ps.reduce((a, p) => a + (p.sh || 0), 0); const bl = ps.reduce((a, p) => a + (p.bl || 0), 0);
    const pv = Math.max(0, b.max - dmg); const pct = pv / b.max;
    const phase = pv <= 0 ? 4 : pct > 0.66 ? 1 : pct > 0.33 ? 2 : 3;
    return { ps, dmg, sh, bl, pv, pct, phase, broken: sh >= SHIELD_NEED, calm: bl >= BLESS_NEED, dead: pv <= 0, old: now() - b.at > 7 * 864e5 };
  }
  const myPart = (b) => b?.parts?.[G.id] || null;
  const triesToday = (b) => { const p = myPart(b); return p && p.day === today() ? p.tries || 0 : 0; };
  function bossView() {
    const g = myGuild();
    if (!g) return `<div class="sa-gbox"><h2>🐲 ${Lx("Jefe de gremio", "Guild boss")}</h2><p class="note">${Lx("Primero únete a un gremio (o funda uno).", "Join a guild first.")}</p></div>`;
    const b = boss(g); const st = b ? bstate(b) : null;
    const canSummon = canLead() && (g.lvl || 0) >= 1 && (!b || st.dead || st.old);
    const summon = `<div class="row">${canSummon ? `<button type="button" class="btn primary" data-sagbsum="1">🐲 ${Lx("Invocar jefe de gremio", "Summon guild boss")}</button>` : ""}${!canLead() ? `<span class="note">${Lx("Solo el líder o los oficiales pueden invocarlo.", "Only leader/officers can summon.")}</span>` : (g.lvl || 0) < 1 ? `<span class="note">${Lx("El salón tiene que estar al menos en nivel 1.", "Hall must be level 1+.")}</span>` : ""}</div>`;
    const help = `<details class="sa-gbhelp"><summary>❓ ${Lx("Cómo funciona", "How it works")}</summary><ul>
      <li>${Lx("Cada uno elige un rol y pelea contra el jefe en su propio turno (hasta", "Pick a role and fight on your own turn (up to")} ${ROUNDS} ${Lx("rondas por intento,", "rounds per try,")} ${TRIES} ${Lx("intentos al día). La vida del jefe es compartida.", "tries/day). Boss HP is shared.")}</li>
      <li>🛡️ <b>${Lx("Fase 1 · Coraza", "Phase 1 · Armor")}</b>: ${Lx(`el daño baja mucho hasta que los Tanques usen «Provocar» ${SHIELD_NEED} veces en total.`, `damage is reduced until Tanks Taunt ${SHIELD_NEED} times.`)}</li>
      <li>💢 <b>${Lx("Fase 2 · Furia", "Phase 2 · Fury")}</b>: ${Lx(`el jefe pega muy fuerte hasta que los Sanadores usen «Bendecir» ${BLESS_NEED} veces.`, `hits hard until Healers Bless ${BLESS_NEED} times.`)}</li>
      <li>⚔️ <b>${Lx("Fase 3 · Último aliento", "Phase 3 · Last breath")}</b>: ${Lx("los de Daño pegan ×1.5. ¡A rematarlo!", "Damage role hits ×1.5.")}</li>
      <li>🎁 ${Lx("Si cae, todos los que ayudaron cobran Núcleos, Soles, XP y un trofeo para su cuarto.", "If it falls, everyone who helped claims rewards.")}</li></ul></details>`;
    if (!b) return `<div class="sa-gbox"><h2>🐲 ${Lx("Jefe de gremio", "Guild boss")}</h2><p class="muted">${Lx("Un jefe enorme que solo se vence en equipo: hacen falta Tanques, Sanadores y gente de Daño.", "A huge boss that needs teamwork.")}</p>${help}${summon}</div>`;
    const p = myPart(b); const role = p?.role || gsel.gbRole || null; const tries = triesToday(b);
    const phN = [null, Lx("Fase 1 · Coraza de piedra", "Phase 1 · Stone armor"), Lx("Fase 2 · Furia", "Phase 2 · Fury"), Lx("Fase 3 · Último aliento", "Phase 3 · Last breath"), Lx("¡Derrotado!", "Defeated!")][st.phase];
    const byRole = (k) => st.ps.filter((x) => x.role === k);
    return `<div class="sa-gbox"><div class="sa-gbcard ph${st.phase}"><span class="sa-gbic">${escx(b.ic)}</span><div class="sa-gbm"><b>${escx(b.n)} <small>${Lx("Nv", "Lv")} ${b.lvl}</small></b><span class="sa-gbph">${phN}</span>
        <i class="sa-gbhp"><i style="width:${Math.round(st.pct * 100)}%"></i><em>${st.pv} / ${b.max}</em></i>
        <div class="sa-gbreq"><span class="${st.broken ? "ok" : ""}">🛡️ ${Lx("Coraza", "Armor")} ${Math.min(st.sh, SHIELD_NEED)}/${SHIELD_NEED}</span><span class="${st.calm ? "ok" : ""}">💚 ${Lx("Calma", "Calm")} ${Math.min(st.bl, BLESS_NEED)}/${BLESS_NEED}</span></div></div></div>
      ${help}
      ${st.dead ? (p && !p.claimed && ((p.dmg || 0) + (p.sh || 0) + (p.bl || 0)) > 0 ? `<button type="button" class="btn primary" data-sagbclaim="1">🎁 ${Lx("Cobrar recompensa", "Claim reward")}</button>` : `<p class="note">${p?.claimed ? Lx("Ya cobraste tu recompensa.", "Reward claimed.") : Lx("Ya cayó. Espera al próximo jefe.", "Already defeated.")}</p>`) + summon
        : `<div class="sa-roles">${Object.entries(ROLES).map(([k, r]) => `<button type="button" class="sa-role ${role === k ? "on" : ""}" data-sagbrole="${k}"><em>${SIMG("rol/" + k, r.ic)}</em><b>${r.n()}</b><small>${r.d()}</small><span>${byRole(k).length} ${Lx("en este rol", "in role")}</span></button>`).join("")}</div>
        <div class="row"><button type="button" class="btn primary" data-sagbfight="1" ${role && tries < TRIES && G.energia >= 2 && G.pv > G.pvMax * 0.3 ? "" : "disabled"}>⚔️ ${Lx("Luchar", "Fight")} (2 ⚡ · ${TRIES - tries}/${TRIES} ${Lx("hoy", "today")})</button>${!role ? `<span class="note">${Lx("Elige un rol primero.", "Pick a role.")}</span>` : G.pv <= G.pvMax * 0.3 ? `<span class="note">${Lx("Cúrate antes de luchar.", "Heal first.")}</span>` : ""}</div>`}
      <h3>📜 ${Lx("Aportes", "Contributions")}</h3><div class="sa-gbps">${st.ps.sort((a, c) => (c.dmg || 0) - (a.dmg || 0)).map((x) => `<div><span>${ROLES[x.role] ? SIMG("rol/" + x.role, ROLES[x.role].ic) : "•"}</span><b>${escx(x.n)}</b><small>⚔️ ${x.dmg || 0} · 🛡️ ${x.sh || 0} · 💚 ${x.bl || 0}</small></div>`).join("") || `<p class="note">${Lx("Nadie ha luchado todavía.", "Nobody fought yet.")}</p>`}</div></div>`;
  }
  async function gbSummon() {
    const g = myGuild(); if (!g || !canLead()) return; const b0 = boss(g); if (b0) { const s = bstate(b0); if (!s.dead && !s.old) return; }
    const lvls = members(g).map((m) => charById(m.id)?.nivel || 1); const avg = lvls.reduce((a, v) => a + v, 0) / Math.max(1, lvls.length);
    const lvl = Math.max(10, Math.round(avg) + 3); const [n, ic, aff] = GB[Math.floor(Math.random() * GB.length)];
    const max = Math.round((40 + 22 * lvl) * 0.55 * Math.max(6, 4 + 2 * lvls.length));
    const id = "b" + uidN();
    if (await upd({ guilds: { [g.id]: { boss: { id, n, ic, aff, lvl, max, at: now(), by: G.nombre, parts: null } } } })) { toast(`🐲 ${n} ${Lx("ha aparecido", "appeared")}!`); try { sfx("crit"); } catch (e) {} }
    render();
  }
  async function gbRole(k) {
    const g = myGuild(); const b = boss(g); if (!b || !ROLES[k]) return; gsel.gbRole = k;
    const p = myPart(b) || {}; await upd({ guilds: { [g.id]: { boss: { parts: { [G.id]: { n: G.nombre, role: k, dmg: p.dmg || 0, sh: p.sh || 0, bl: p.bl || 0, tries: p.tries || 0, day: p.day || "" } } } } } });
    render();
  }
  let cur = null; // intento en curso
  function gbFight() {
    const g = myGuild(); const b = boss(g); if (!b || G.g.combat) return; const st = bstate(b); if (st.dead) return;
    const p = myPart(b); const role = p?.role || gsel.gbRole; if (!role) return;
    if (triesToday(b) >= TRIES) return toast(Lx("Ya usaste tus intentos de hoy.", "No tries left today."));
    if (!needEnergy(2)) return;
    const fury = st.phase === 2 && !st.calm ? 1.7 : st.phase === 3 ? 1.2 : 1;
    const e = { n: b.n, lvl: b.lvl, pv: st.pv, pvMax: b.max, poder: Math.round((14 + 3.2 * b.lvl) * fury), def: Math.floor(b.lvl / 5) + 1, aff: b.aff, boss: false, gb: true, st: {} };
    cur = { gid: g.id, bid: b.id, role, start: st.pv, phase: st.phase, broken: st.broken, sh: 0, bl: 0, c: null };
    startCombat(e, "gboss", `${G.g.loc.r}:${G.g.loc.p}`, `${b.ic} ${b.n} ${Lx("te ruge. ¡Por el gremio!", "roars. For the guild!")}`);
    const c = G.g.combat; if (!c) { cur = null; return; }
    c.gb = true; c.gbRole = role; cur.c = c;
    clog(`${ROLES[role].ic} ${Lx("Rol", "Role")}: ${ROLES[role].n()} · ${[null, Lx("Fase 1: coraza", "Phase 1: armor"), Lx("Fase 2: furia", "Phase 2: fury"), Lx("Fase 3: último aliento", "Phase 3: last breath")][st.phase]}${fury > 1.3 ? " · " + Lx("¡El jefe está furioso!", "The boss is furious!") : ""}`);
    save(); render();
  }
  // daño reducido por la coraza / bonus fase 3
  const _pa = pAttack;
  pAttack = function (ti, spell) {
    const c = G?.g?.combat; const e = c?.enemies?.[ti];
    if (!c?.gb || !e || !cur) return _pa.apply(this, arguments);
    const before = e.pv; const r = _pa.apply(this, arguments);
    try {
      const dealt = before - e.pv; if (dealt > 0) {
        let mult = 1;
        if (cur.phase === 1 && !cur.broken && cur.sh + 0 < 1) mult = 0.35;
        if (cur.phase === 3 && cur.role === "dano") mult = 1.5;
        if (mult !== 1) { const adj = Math.round(dealt * mult); e.pv = Math.max(0, before - adj); if (mult < 1) clog(`🪨 ${Lx("La coraza absorbe parte del golpe", "The armor absorbs part")} (${adj}).`); else clog(`⚔️ ${Lx("¡Último aliento! Daño ×1.5", "Last breath! ×1.5")} (${adj}).`); }
      }
    } catch (x) {}
    return r;
  };
  function gbSkill() {
    const c = G.g.combat; if (!c?.gb || !cur) return; const ps = c.pst;
    if (cur.role === "tanque") { ps.defend = true; ps.shield = Math.max(ps.shield || 0, 1); cur.sh++; if (cur.phase === 1) cur.broken = cur.broken || false; clog(`🛡️ ${Lx("¡Provocas al jefe! Golpeas su coraza y te cubres.", "You taunt the boss!")} (+1 🛡️)`); try { sfx("shield"); } catch (e) {} afterPlayer(); }
    else if (cur.role === "sanador") { const h = Math.round(G.pvMax * 0.2); G.pv = Math.min(G.pvMax, G.pv + h); ps.st = {}; cur.bl++; clog(`💚 ${Lx("Bendices al grupo", "You bless the group")}: +${h} PV (+1 💚)`); try { sfx("heal"); } catch (e) {} afterPlayer(); }
    else { const add = Math.max(4, Math.round((G.g.arma?.poder || 0) * 0.5)); ps.forge = (ps.forge || 0) + add; clog(`🔥 ${Lx("Golpe concentrado", "Focused strike")}!`); const ti = c.enemies.findIndex((e) => e.pv > 0); pAttack(ti); if (G.g.combat === c) ps.forge = Math.max(0, ps.forge - add); }
    save(); render();
  }
  // límite de rondas por intento
  const _ap = afterPlayer;
  afterPlayer = function () {
    const c = G?.g?.combat; const r = _ap.apply(this, arguments);
    try {
      if (c && c.gb && G.g.combat === c && c.round > ROUNDS) {
        const e = c.enemies[0]; G.g.combat = null;
        G.g.lastResult = { title: `${e.n} ${Lx("se retira por ahora", "retreats for now")}`, lines: [Lx(`Aguantaste ${ROUNDS} rondas.`, `You lasted ${ROUNDS} rounds.`), `⚔️ ${Lx("Daño al jefe", "Damage")}: ${Math.max(0, (cur?.start || 0) - e.pv)}`] };
        save(); render();
      }
    } catch (x) {}
    return r;
  };
  let finishing = false;
  async function gbFinish() {
    if (!cur || finishing) return; const c = cur.c; if (!c || G.g.combat === c) return;
    finishing = true; const done = cur; cur = null;
    try {
      const e = c.enemies[0]; const dealt = Math.max(0, done.start - Math.max(0, e.pv));
      const g = guilds().find((x) => x.id === done.gid); const b = boss(g); if (!b || b.id !== done.bid) return;
      const p = myPart(b) || {}; const day = today(); const tries = (p.day === day ? p.tries || 0 : 0) + 1;
      await upd({ guilds: { [g.id]: { boss: { parts: { [G.id]: { n: G.nombre, role: done.role, dmg: (p.dmg || 0) + dealt, sh: (p.sh || 0) + done.sh, bl: (p.bl || 0) + done.bl, tries, day } } } } } });
      const line = `🐲 ${Lx("Aporte al jefe de gremio", "Guild boss contribution")}: ⚔️ ${dealt}${done.sh ? ` · 🛡️ +${done.sh}` : ""}${done.bl ? ` · 💚 +${done.bl}` : ""}`;
      const res = G.g.lastBattle || G.g.lastResult; if (res) res.lines = [...(res.lines || []), line]; else toast(line);
      save(); render();
    } finally { finishing = false; }
  }
  async function gbClaim() {
    const g = myGuild(); const b = boss(g); if (!b) return; const st = bstate(b); const p = myPart(b); if (!st.dead || !p || p.claimed) return;
    if (!(await upd({ guilds: { [g.id]: { boss: { parts: { [G.id]: { claimed: now() } } } } } }))) return;
    const cores = 2 + (perks(g).core || 0); const so = 500 + b.lvl * 20;
    addItem(CORE, cores); G.dinero.soles += so; try { gainXP(60 * b.lvl); } catch (e) {}
    G.g.gbt = G.g.gbt || []; if (!G.g.gbt.includes(b.n)) G.g.gbt.push(b.n);
    G.g.lastResult = { title: `🐲 ${b.n} ${Lx("derrotado", "defeated")}`, lines: [`🔮 +${cores} ${CORE}`, `☀ +${so} Soles`, `+${60 * b.lvl} XP`, `🏆 ${Lx("Trofeo para tu cuarto", "Trophy for your room")}: ${b.n}`] };
    try { sfx("victory"); log(`El gremio venció a ${b.n}.`); } catch (e) {}
    save(); render();
  }
  const _gv3 = gameView;
  gameView = function () {
    let out = _gv3.apply(this, arguments);
    try {
      const c = G?.g?.combat;
      if (c?.gb && cur && /class="cmdgrid main/.test(out)) {
        const r = ROLES[cur.role];
        const btn = `<button type="button" class="cbtn sa-skill sa-gbsk" data-sagbsk="1" style="--cc:#ffd98a"><b>${SIMG("rol/" + cur.role, r.ic)} ${r.sk()}</b><small>${Lx("rol", "role")}: ${r.n()} · ${Lx("ronda", "round")} ${c.round}/${ROUNDS}</small></button>`;
        out = out.replace(/(<div class="cmdgrid main[^"]*">\s*<button[^>]*class="cbtn atk"[\s\S]*?<\/button>)/, `$1${btn}`);
        out = out.replace(/<div class="cmdgrid main sa-wheel">([\s\S]*?)<\/div>/, (m, inner) => { inner = inner.replace(/ style="--i:\d+;--n:\d+"/g, ""); const n = (inner.match(/class="cbtn/g) || []).length; let i = 0; inner = inner.replace(/<button type="button" class="cbtn/g, () => `<button type="button" style="--i:${i++};--n:${n}" class="cbtn`); return `<div class="cmdgrid main sa-wheel">${inner}</div>`; });
      }
      // escudo del gremio junto al nombre
      if (G?.g && !c) { const g = myGuild(); if (g) out = out.replace(/(<div class="who">[\s\S]*?<b>[^<]*<\/b>)/, `$1<span class="sa-gtag" style="--gc:${escx(g.col)}" title="${escx(g.name)}">${escx(g.ic)} ${escx(g.name)}</span>`); }
    } catch (e) { console.warn("gremio gv3:", e); }
    return out;
  };

  // ---------------------------------------------------------------
  // Dibujado y avisos
  // ---------------------------------------------------------------
  const _r = render;
  render = function () {
    const o = _r.apply(this, arguments);
    try { if (G?.g) { if (cur && G.g.combat !== cur.c) gbFinish(); mkSettle(); } } catch (e) { console.warn("gremio post:", e); }
    return o;
  };
  try { Store.listeners?.add?.(() => { try { if (G?.g && !G.g.combat && gtab === "gremio" && !document.activeElement?.matches?.("input,select")) render(); else if (G?.g) mkSettle(); } catch (e) {} }); } catch (e) {}

  // ---------------------------------------------------------------
  // Clics
  // ---------------------------------------------------------------
  document.addEventListener("click", (ev) => {
    if (!G?.g) return; const t = ev.target.closest?.("[data-sagr],[data-sagic],[data-sagcol],[data-sagnew],[data-sagjoin],[data-sagdon],[data-saglvl],[data-sagrank],[data-sagkick],[data-sagleave],[data-samks],[data-samksell],[data-samkbuy],[data-samkcx],[data-sarmtheme],[data-sarmspot],[data-sarmput],[data-sarmvisit],[data-sarmlike],[data-sagbsum],[data-sagbrole],[data-sagbfight],[data-sagbclaim],[data-sagbsk]");
    if (!t || t.disabled) return; const d = t.dataset;
    if (d.sagr) { gsel.gr = d.sagr; return render(); }
    if (d.sagic != null) { gsel.gIc = +d.sagic; return render(); }
    if (d.sagcol != null) { gsel.gCol = +d.sagcol; return render(); }
    if (d.sagnew) return gNew();
    if (d.sagjoin) return gJoin(d.sagjoin);
    if (d.sagdon) { const [k, n] = d.sagdon.split("|"); return gDonate(k, +n); }
    if (d.saglvl) return gLevel();
    if (d.sagrank) { const [id, dir] = d.sagrank.split("|"); return gRank(id, dir); }
    if (d.sagkick) return gKick(d.sagkick);
    if (d.sagleave) return gLeave();
    if (d.samks) { gsel.mkS = d.samks; return render(); }
    if (d.samksell) return mkSell();
    if (d.samkbuy) return mkBuy(d.samkbuy);
    if (d.samkcx) return mkCancel(d.samkcx);
    if (d.sarmtheme) { G.g.cuarto = { ...roomOf(G), t: d.sarmtheme }; save(); return render(); }
    if (d.sarmspot != null) { const i = +d.sarmspot; gsel.rmPick = i < 0 || gsel.rmPick === i ? null : i; return render(); }
    if (d.sarmput != null) { const r = roomOf(G); if (gsel.rmPick == null) return; r.s[gsel.rmPick] = d.sarmput || null; G.g.cuarto = r; gsel.rmPick = null; save(); try { sfx("click"); } catch (e) {} return render(); }
    if (d.sarmvisit != null) { gsel.rmVisit = d.sarmvisit || null; return render(); }
    if (d.sarmlike) { upd({ likes: { [d.sarmlike]: { [G.id]: 1 } } }).then(() => render()); return; }
    if (d.sagbsum) return gbSummon();
    if (d.sagbrole) return gbRole(d.sagbrole);
    if (d.sagbfight) return gbFight();
    if (d.sagbclaim) return gbClaim();
    if (d.sagbsk) { ev.stopPropagation(); return gbSkill(); }
  });
  document.addEventListener("input", (ev) => { if (ev.target?.id === "sa-gname") gsel.gName = ev.target.value; if (ev.target?.id === "sa-mkp") gsel.mkP = ev.target.value; if (ev.target?.id === "sa-mkn") gsel.mkN = ev.target.value; if (ev.target?.id === "sa-mkq") { gsel.mkQ = ev.target.value; clearTimeout(window.__saMkT); window.__saMkT = setTimeout(() => { const pos = ev.target.selectionStart; render(); const el = document.getElementById("sa-mkq"); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) {} } }, 350); } });
  document.addEventListener("change", (ev) => { if (ev.target?.id === "sa-mksel") { gsel.mkSel = ev.target.value; gsel.mkOpen = true; render(); } });
  document.addEventListener("toggle", (ev) => { if (ev.target?.classList?.contains("sa-mksell")) gsel.mkOpen = ev.target.open; }, true);

  window.SA_GREMIO = { myGuild, guilds, perks, totals, bstate, mk, collectibles };

  // ---------------------------------------------------------------
  // Estilos
  // ---------------------------------------------------------------
  const css = document.createElement("style"); css.id = "sa-gremio";
  css.textContent = `
.sa-gtabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}
.sa-gtabs .chip{padding:7px 14px;font-size:14px;position:relative}.sa-gtabs .chip .sai{width:24px;height:24px;vertical-align:middle;border-radius:4px}
.sa-role em .sai{width:56px;height:56px;border-radius:50%}.sa-gbps span .sai{width:22px;height:22px;border-radius:50%;vertical-align:middle}.cbtn.sa-gbsk b .sai{width:22px;height:22px;border-radius:50%;vertical-align:middle}
.gtabs [data-gtab="gremio"] .tic .sai{width:22px;height:22px;border-radius:4px}
.sa-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#e0584a;vertical-align:middle}
.sa-gbox h2{margin:0 0 6px}.sa-gbox h3{margin:16px 0 8px}
.sa-glist{display:grid;gap:6px;margin:10px 0}
.sa-grow{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #ffffff14;border-radius:3px;background:#0b131c88}
.sa-grow>div{flex:1;min-width:0;display:flex;flex-direction:column}.sa-grow small{color:var(--muted)}
.sa-crest{display:inline-grid;place-items:center;width:34px;height:38px;font-size:18px;background:linear-gradient(180deg,color-mix(in srgb,var(--gc,#d9a441) 55%,#000),#0b0f15);clip-path:polygon(0 0,100% 0,100% 70%,50% 100%,0 70%);box-shadow:inset 0 0 0 2px var(--gc,#d9a441);flex:0 0 auto}
.sa-crest.big{width:64px;height:72px;font-size:32px}
.sa-gnew{margin-top:12px;padding:12px;border:1px dashed #d9a44155;border-radius:3px}.sa-gnew summary{cursor:pointer;font-family:var(--display);color:#ffd98a}
.sa-gnew .f,.sa-mksell .f{display:flex;flex-direction:column;gap:4px;margin:10px 0;flex:1 1 160px}
.sa-gnew input,.sa-mksell input,.sa-mksell select,.sa-mkbar input{background:#0b131c;color:var(--ink);border:1px solid var(--line);border-radius:3px;padding:8px;font:inherit;min-width:0}
.sa-pick{margin:8px 0}.sa-pick>div{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.sa-pick .chip{font-size:18px;padding:3px 7px}
.sa-col{width:28px;height:28px;border-radius:50%;border:2px solid #0008;background:var(--gc);cursor:pointer}.sa-col.on{box-shadow:0 0 0 2px #fff}
.sa-ghead{display:flex;align-items:center;gap:14px;padding:12px;border-radius:3px;background:linear-gradient(90deg,color-mix(in srgb,var(--gc) 22%,transparent),transparent 70%);border-left:3px solid var(--gc)}
.sa-ghead h2{margin:0;color:var(--gc)}.sa-ghead small{color:var(--ink-2)}
.sa-hall{margin-top:12px;padding:12px;border:1px solid #d9a44133;border-radius:3px;background:#0b131c66}
.sa-hlv{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-bottom:10px}
.sa-hlv>div{padding:8px;border:1px solid #ffffff12;border-radius:3px;opacity:.55;display:flex;flex-direction:column;gap:2px}
.sa-hlv>div.on{opacity:1;border-color:#8affb066;background:#8affb00f}.sa-hlv>div.nx{opacity:.9;border-color:#d9a44188}
.sa-hlv b{font-size:12.5px}.sa-hlv small{font-size:11.5px;color:var(--ink-2)}
@media (max-width:760px){.sa-hlv{grid-template-columns:1fr 1fr}}
.sa-fund{display:flex;flex-wrap:wrap;gap:6px 16px;margin:4px 0 6px}.sa-fund .ok{color:#8affb0}
.sa-fbar{display:block;height:6px;border-radius:3px;background:#05070a;overflow:hidden;margin-bottom:10px}.sa-fbar i{display:block;height:100%;background:linear-gradient(90deg,#b8862b,#ffd98a)}
.sa-hall .row,.sa-gbox .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0}
.sa-mems{margin-top:12px}.sa-mem{display:flex;align-items:center;gap:10px;padding:6px 8px;border-bottom:1px solid #ffffff0d}
.sa-mem.me{background:#d9a4410f}.sa-mem>div{flex:1;min-width:0;display:flex;flex-direction:column}.sa-mem small{color:var(--muted)}
.sa-macts{display:flex;gap:4px;flex:0 0 auto!important;flex-direction:row!important}.sa-macts .chip{padding:2px 7px}
.sa-gtag{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:3px;font:600 11px var(--display);color:var(--gc);border:1px solid color-mix(in srgb,var(--gc) 60%,transparent);background:color-mix(in srgb,var(--gc) 12%,transparent);vertical-align:middle}
/* mercado */
.sa-mkbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:10px 0}.sa-mkbar input{flex:1 1 180px}
.sa-mkl{display:grid;gap:6px}
.sa-mki{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #ffffff14;border-radius:3px;background:#0b131c88}
.sa-mki.sold{border-color:#8affb055}.sa-mki em{font-style:normal;font-size:22px;width:32px;text-align:center}.sa-mki em .sai{width:30px;height:30px}
.sa-mki>div{flex:1;min-width:0;display:flex;flex-direction:column}.sa-mki small{color:var(--muted)}
.sa-price{font-family:var(--display);color:#ffd98a;white-space:nowrap}
.sa-mksell{margin:14px 0;padding:12px;border:1px solid #d9a44144;border-radius:3px}.sa-mksell summary{cursor:pointer;font-family:var(--display);color:#ffd98a}
.sa-mksell .row{display:flex;gap:10px;flex-wrap:wrap}
/* cuarto */
.sa-themes{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
.sa-room{padding:14px;border-radius:4px;box-shadow:inset 0 0 40px #0009,0 10px 24px #000a;margin:8px 0}
.sa-room.th-madera{background:repeating-linear-gradient(90deg,#3b2614 0 46px,#352211 46px 48px),#3b2614}
.sa-room.th-piedra{background:repeating-linear-gradient(0deg,#2a2d33 0 28px,#202328 28px 30px),repeating-linear-gradient(90deg,transparent 0 58px,#1a1c20 58px 60px),#2a2d33}
.sa-room.th-noche{background:radial-gradient(2px 2px at 20% 30%,#fff,transparent),radial-gradient(2px 2px at 70% 20%,#fff,transparent),radial-gradient(1px 1px at 40% 70%,#fff,transparent),radial-gradient(1px 1px at 85% 60%,#fff,transparent),linear-gradient(180deg,#0b1030,#1d1440)}
.sa-room.th-jardin{background:radial-gradient(circle at 20% 20%,#3c6b3a55,transparent 40%),linear-gradient(180deg,#1f3a24,#142817)}
.sa-room.th-real{background:repeating-linear-gradient(45deg,#3a1420 0 14px,#33111c 14px 28px);box-shadow:inset 0 0 0 3px #d9a44177,inset 0 0 40px #0009}
.sa-roomh{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.sa-roomh b{font-family:var(--display);color:#ffe9b8;text-shadow:0 2px 4px #000}
.sa-shelves{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 12px}
.sa-spot{position:relative;aspect-ratio:1.15;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px;border-radius:3px;background:#00000040;border-bottom:6px solid #5a3a1c;box-shadow:inset 0 -10px 16px #0006;text-align:center;cursor:default}
.sa-room.th-piedra .sa-spot{border-bottom-color:#555b66}.sa-room.th-noche .sa-spot{border-bottom-color:#4a3a8a}.sa-room.th-jardin .sa-spot{border-bottom-color:#5a3a1c}.sa-room.th-real .sa-spot{border-bottom-color:#d9a441}
.sa-spot[data-sarmspot]{cursor:pointer}.sa-spot[data-sarmspot]:hover{background:#ffffff14}.sa-spot.pick{box-shadow:0 0 0 2px #ffd98a,inset 0 -10px 16px #0006}
.sa-spot .ic{font-size:30px;filter:drop-shadow(0 4px 6px #000)}.sa-spot .ic .sai{width:44px;height:44px}
.sa-spot small{font-size:11px;color:#f2e4c0;text-shadow:0 1px 2px #000;line-height:1.15;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sa-spot .plus{font-size:22px;color:#ffffff55}
.sa-rmpick{padding:10px;border:1px solid #d9a44155;border-radius:3px;background:#0b131c}
.sa-rmgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(110px,100%),1fr));gap:6px;margin:8px 0}
.sa-rmc{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border:1px solid #ffffff18;border-radius:3px;background:#ffffff08;color:var(--ink);cursor:pointer;font:inherit}
.sa-rmc span{font-size:24px}.sa-rmc .sai{width:32px;height:32px}.sa-rmc small{font-size:11px;text-align:center}.sa-rmc.rm{border-color:#e0735c66}
/* jefe de gremio */
.sa-gbcard{display:flex;gap:14px;align-items:center;padding:14px;border-radius:4px;border:1px solid #e0735c66;background:radial-gradient(120% 120% at 0% 50%,#5a1a1444,transparent 60%),#0b131c}
.sa-gbcard.ph2{border-color:#ff5a4a;box-shadow:0 0 20px #ff5a4a33}.sa-gbcard.ph3{border-color:#ffd98a;box-shadow:0 0 20px #ffd98a33}.sa-gbcard.ph4{opacity:.6}
.sa-gbic{font-size:54px;filter:drop-shadow(0 6px 12px #000);animation:saBob 3s ease-in-out infinite}
@keyframes saBob{50%{transform:translateY(-4px)}}
.sa-gbm{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}.sa-gbm>b{font-family:var(--display);font-size:18px;color:#ffcf9a}.sa-gbm>b small{color:var(--muted);font-size:12px}
.sa-gbph{font-size:13px;color:#ffd98a}
.sa-gbhp{position:relative;display:block;height:18px;border-radius:9px;background:#05070a;overflow:hidden;box-shadow:inset 0 0 0 1px #ffffff1a}
.sa-gbhp>i{display:block;height:100%;background:linear-gradient(90deg,#7a0c10,#ff5a4a)}.sa-gbhp em{position:absolute;inset:0;display:grid;place-items:center;font:600 11px var(--display);font-style:normal;text-shadow:0 1px 2px #000}
.sa-gbreq{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;color:var(--muted)}.sa-gbreq .ok{color:#8affb0}
.sa-gbhelp{margin:10px 0;font-size:14px}.sa-gbhelp summary{cursor:pointer;color:var(--ink-2)}.sa-gbhelp ul{margin:6px 0;padding-left:18px;display:grid;gap:4px}
.sa-roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}
.sa-role{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px;text-align:left;border:1px solid #ffffff18;border-radius:3px;background:#0b131c;color:var(--ink);cursor:pointer;font:inherit}
.sa-role.on{border-color:#ffd98a;box-shadow:0 0 12px #ffd98a44;background:#d9a44114}
.sa-role em{font-style:normal;font-size:24px}.sa-role b{font-family:var(--display)}.sa-role small{color:var(--ink-2);font-size:12.5px}.sa-role span{font-size:11.5px;color:var(--muted)}
@media (max-width:640px){.sa-roles{grid-template-columns:1fr}}
.sa-gbps{display:grid;gap:4px}.sa-gbps>div{display:flex;gap:8px;align-items:center;padding:5px 8px;border-bottom:1px solid #ffffff0d}.sa-gbps b{flex:1}.sa-gbps small{color:var(--muted)}
`;
  document.head.appendChild(css);
})();
