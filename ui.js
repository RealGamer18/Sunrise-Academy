// ===================== UI: aspecto nuevo, bolsa con equipo por ranuras, pestañas organizadas =====================
// Carga al final (después de aventura.js).
(function () {
  if (typeof render !== "function") return;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const RM = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  const sfx = (k, ...a) => { try { window.SA_SFX?.[k]?.(...a); } catch (e) {} };
  const X = () => window.SA_EXTRA || {};
  const layer = () => { let l = document.getElementById("xanim"); if (!l) { l = document.createElement("div"); l.id = "xanim"; document.body.appendChild(l); } return l; };

  // =====================================================================
  // PESTAÑAS CON ICONOS · HUD
  // =====================================================================
  const TAB_IC = { lugar: "📍", mapa: "🗺️", historia: "📜", heroe: "🧙", magia: "✨", dioses: "🛕", bolsa: "🎒", escalera: "🏆", vinculos: "💞", grupo: "👥" };
  let lastTab = null;
  const _gv = gameView;
  gameView = function () {
    let out = _gv(); if (!G) return out;
    out = out.replace(/<button type="button" data-gtab="(\w+)" class="([^"]*)">/g, (m, k, cls) => `<button type="button" data-gtab="${k}" class="${cls} gt-${k}"><i class="tic">${TAB_IC[k] || "•"}</i>`);
    const changed = gtab !== lastTab; lastTab = gtab;
    if (changed && !RM()) out = out.replace('<section class="panel">', '<section class="panel tabin">');
    return out.replace('<section class="panel', `<section data-tab="${G.g.combat ? "combate" : gtab}" class="panel`);
  };
  const _hud = hud;
  hud = function () {
    let out = _hud(); if (!G?.g) return out;
    out = out.replace(/(<img class="rimg hud-img"[^>]*>)/, `<span class="hpor">$1<span class="lvlb" title="${L("Nivel", "Level")}">${G.nivel}</span></span>`);
    out = out.replace("<span>PV ", '<span class="m m-pv"><em>❤️</em>PV ').replace("<span>Maná ", '<span class="m m-mn"><em>💧</em>Maná ').replace("<span>Energía ", '<span class="m m-en"><em>⚡</em>Energía ').replace("<span>Estrés ", '<span class="m m-es"><em>😰</em>Estrés ').replace(/<span>☀ (\d+) Soles<\/span>/, '<span class="m m-so"><em>☀</em><b>$1</b> Soles</span>');
    return out;
  };

  // =====================================================================
  // BOLSA: muñeco con ranuras + bolsa en cuadrícula + detalle
  // =====================================================================
  const SLOTS_L = ["cabeza", "hombros", "pecho", "manos", "pies"], SLOTS_R = ["cuello", "capa", "anillo1", "anillo2", "amuleto"];
  const stype = (s) => (s.startsWith("anillo") ? "anillo" : s);
  const RARITY = () => ({ c: L("Común", "Common"), r: L("Raro", "Rare"), e: L("Épico", "Epic"), l: L("Legendario", "Legendary") });
  const MAT_IC = [[/Hierba|Flor|Pétalo|Rosa|Madera|Té/, "🌿"], [/Cristal|Perla|Coral|Polvo|Fragmento de tiempo|Arena/, "💎"], [/Mineral|Rubí|Carbón|Sal |Piedra|Obsidiana|Oro/, "🪨"], [/Carne/, "🍖"], [/Pescado/, "🐟"], [/Trigo|Grano/, "🌾"], [/Seda|Piel|Escama|maldito/, "🦴"], [/Esencia|Corazón de trol|Pluma|Trébol|Perfume|Pergamino del sabio|Cristal de potencial/, "💠"], [/Paquete/, "📦"], [/Cristal de Olvido/, "🔮"], [/Mapa/, "🗺️"]];
  function catOf(n) {
    const W = X().WEAR || {}; if (W[n]) return "equipo";
    const s = SHOP.find((x) => x.n === n);
    if (s) { if (s.kind === "food") return "comida"; if (s.kind === "oil") return "aceite"; if (["potion", "mana", "energy"].includes(s.kind)) return "pocion"; return "especial"; }
    if (ATTR_ITEMS[n]) return "especial"; if (/^Paquete/.test(n)) return "mision";
    return "material";
  }
  function iconOf(n) {
    const W = X().WEAR || {}; if (W[n]) return X().SLOT_IC?.[W[n].s] || "🛡️";
    const s = SHOP.find((x) => x.n === n);
    if (s) { if (s.ic) return s.ic; if (s.kind === "potion") return /mayor/.test(n) ? "❤️‍🔥" : "❤️"; if (s.kind === "mana") return "💧"; if (s.kind === "energy") return "⚡"; if (s.kind === "respec") return "📜"; }
    for (const [re, ic] of MAT_IC) if (re.test(n)) return ic;
    return "📦";
  }
  const CATS = () => [["todo", "🎒", L("Todo", "All")], ["armas", "🗡️", L("Armas", "Weapons")], ["equipo", "🛡️", L("Equipo", "Gear")], ["pocion", "🧪", L("Pociones", "Potions")], ["comida", "🍲", L("Comida", "Food")], ["aceite", "🛢️", L("Aceites", "Oils")], ["material", "🪨", L("Materiales", "Materials")], ["especial", "💠", L("Especiales", "Special")], ["mision", "📦", L("Misión", "Quest")]];
  const statLine = (w) => (X().wearDesc ? X().wearDesc(w) : "");
  const score = (w) => (w ? (w.def || 0) * 3 + (w.dmg || 0) * 3 + (w.pv || 0) / 5 + (w.init || 0) * 2 + (w.mana || 0) / 10 + (w.xp || 0) * 60 : 0);
  function heroStats() {
    const dmg = (G.g.arma?.poder || 0) + (typeof weaponBonus === "function" ? weaponBonus() : 0) + 2 * attr("fuerza");
    const def = attr("defensa") + (typeof defBonus === "function" ? defBonus() : 0);
    const ini = attr("agilidad") + (typeof initBonus === "function" ? initBonus() : 0);
    const xp = Math.round(((X().gsum?.("xp") || 0) + (G.g.food?.left > 0 ? G.g.food.fx?.xp || 0 : 0)) * 100);
    return { dmg, def, ini, xp };
  }
  function slotBtn(s) {
    const e = X().eq?.() || {}; const W = X().WEAR || {}; const n = e[s]; const w = W[n]; const sel = gsel.uiSel?.slot === s;
    const nm = X().SLOT_NM?.()[stype(s)] || s; const off = s === "escudo" && X().heavy?.();
    const fits = Object.keys(G.g.inv).some((k) => W[k] && W[k].s === stype(s) && score(W[k]) > score(w));
    return `<button type="button" class="uslot ${w ? "full r-" + w.r : ""} ${sel ? "sel" : ""} ${off ? "off" : ""}" data-uislot="${s}" title="${esc(n || nm)}"><span class="usi">${w ? X().SLOT_IC[stype(s)] : `<i class="ghost">${X().SLOT_IC?.[stype(s)] || "•"}</i>`}</span><small>${esc(nm)}</small>${fits ? '<b class="upd">▲</b>' : ""}</button>`;
  }
  function weaponSlot() {
    const a = G.g.arma || {}; const sel = gsel.uiSel?.slot === "arma"; const af = WEAPON_AFF[a.n]; const better = (G.g.armas || []).some((n) => (WEAPONS[n] || 0) > (a.poder || 0));
    return `<button type="button" class="uslot wide weapon full ${sel ? "sel" : ""}" data-uislot="arma" title="${esc(a.n || "")}"><span class="usi">${af ? "✨" : "🗡️"}</span><span class="uw"><b>${esc(a.n || "—")}</b><small>${L("Poder", "Power")} ${a.poder || 0}${af ? " · " + af : ""}</small></span>${better ? '<b class="upd">▲</b>' : ""}</button>`;
  }
  function doll() {
    const st = heroStats(); const pet = G.g.mascota && X().PETS?.[G.g.mascota]; const mnt = G.g.montura && X().MOUNTS?.[G.g.montura];
    return `<div class="doll">
      <div class="dcol">${SLOTS_L.map(slotBtn).join("")}</div>
      <div class="dmid"><div class="dpor">${typeof raceImg === "function" ? raceImg(G.raza, "rimg dimg") : ""}<i class="daura"></i><div class="dpet">${pet ? `<button type="button" class="uslot mini ${gsel.uiSel?.slot === "mascota" ? "sel" : ""}" data-uislot="mascota" title="${esc(G.g.mascota)}">${pet.i}</button>` : `<button type="button" class="uslot mini" data-uislot="mascota" title="${L("Mascota", "Pet")}"><i class="ghost">🐾</i></button>`}${mnt ? `<button type="button" class="uslot mini ${gsel.uiSel?.slot === "montura" ? "sel" : ""}" data-uislot="montura" title="${esc(G.g.montura)}">${mnt.i}</button>` : `<button type="button" class="uslot mini" data-uislot="montura" title="${L("Montura", "Mount")}"><i class="ghost">🐎</i></button>`}</div></div>
        <div class="dname"><b>${esc(G.nombre)}</b><small>${esc(G.raza)} · ${L("Nivel", "Level")} ${G.nivel}</small></div>
        <div class="dstats"><div><small>${L("DAÑO", "DAMAGE")}</small><b>${st.dmg}</b></div><div><small>${L("DEFENSA", "DEFENSE")}</small><b>${st.def}</b></div><div><small>${L("PV", "HP")}</small><b>${G.pvMax}</b></div><div><small>${L("INICIATIVA", "INIT")}</small><b>${st.ini >= 0 ? "+" : ""}${st.ini}</b></div>${st.xp ? `<div><small>XP</small><b>+${st.xp}%</b></div>` : ""}</div>
        <div class="dbot">${weaponSlot()}${slotBtn("escudo")}</div></div>
      <div class="dcol">${SLOTS_R.map(slotBtn).join("")}</div></div>`;
  }
  function bagGrid() {
    const cat = gsel.uiCat || "todo"; const W = X().WEAR || {};
    const items = Object.entries(G.g.inv).filter(([, q]) => q > 0).map(([n, q]) => ({ n, q, c: catOf(n) }));
    const arms = (G.g.armas || []).map((n, i) => ({ n, q: 1, c: "armas", idx: i }));
    const all = [...arms, ...items]; const order = ["armas", "equipo", "pocion", "comida", "aceite", "especial", "mision", "material"];
    all.sort((a, b) => order.indexOf(a.c) - order.indexOf(b.c) || a.n.localeCompare(b.n));
    const shown = cat === "todo" ? all : all.filter((x) => x.c === cat);
    const counts = {}; for (const x of all) counts[x.c] = (counts[x.c] || 0) + 1;
    const cells = shown.map((x) => { const w = W[x.n]; const sel = gsel.uiSel?.item === x.n && (x.idx == null || gsel.uiSel?.idx === x.idx);
      const better = x.c === "armas" ? (WEAPONS[x.n] || 0) > (G.g.arma?.poder || 0) : w ? (() => { const e = X().eq?.() || {}; const cur = w.s === "anillo" ? Math.min(score(W[e.anillo1]), score(W[e.anillo2])) : score(W[e[w.s]]); return score(w) > cur; })() : false;
      return `<button type="button" class="bcell ${w ? "r-" + w.r : ""} c-${x.c} ${sel ? "sel" : ""}" data-uiitem="${esc(x.n)}"${x.idx != null ? ` data-uiidx="${x.idx}"` : ""} title="${esc(x.n)}"><span>${x.c === "armas" ? (WEAPON_AFF[x.n] ? "✨" : "🗡️") : iconOf(x.n)}</span>${x.q > 1 ? `<b class="bq">${x.q}</b>` : ""}${better ? '<b class="upd">▲</b>' : ""}</button>`; }).join("");
    const empty = Math.max(0, 30 - shown.length);
    return `<div class="bagp"><div class="bagh"><b>🎒 ${L("Bolsa", "Bag")}</b><span class="pill">☀ ${G.dinero.soles}</span></div>
      <div class="bcats">${CATS().filter(([k]) => k === "todo" || counts[k]).map(([k, ic, lb]) => `<button type="button" class="chip ${cat === k ? "on" : ""}" data-uicat="${k}" title="${esc(lb)}">${ic}<span> ${esc(lb)}</span>${k !== "todo" ? ` <small>${counts[k]}</small>` : ""}</button>`).join("")}</div>
      <div class="bgrid">${cells}${"<i class='bempty'></i>".repeat(empty)}</div></div>`;
  }
  function detail() {
    const s = gsel.uiSel; const W = X().WEAR || {}; const e = X().eq?.() || {};
    if (!s) return `<div class="bdet hint"><b>👆 ${L("Toca una ranura o un objeto", "Tap a slot or an item")}</b><small>${L("Verás qué hace, qué mejora (▲) y podrás equiparlo o usarlo.", "See what it does and equip or use it.")}</small></div>`;
    const card = (n, head, acts, extra = "") => `<div class="bdet"><div class="bdh">${head}</div>${acts ? `<div class="row">${acts}</div>` : ""}${extra}</div>`;
    if (s.slot === "arma") {
      const a = G.g.arma; const list = (G.g.armas || []).map((n, i) => ({ n, i })).sort((x, y) => (WEAPONS[y.n] || 0) - (WEAPONS[x.n] || 0));
      return card(a.n, `<span class="bdi">🗡️</span><div><b>${esc(a.n)}</b><small>${L("Arma equipada", "Equipped weapon")} · ${L("Poder", "Power")} ${a.poder}${WEAPON_AFF[a.n] ? " · ✦ " + WEAPON_AFF[a.n] : ""}${(WEAPON_TRAITS[a.n] || []).length ? " · " + WEAPON_TRAITS[a.n].join(", ") : ""}</small></div>`, "",
        list.length ? `<small class="bdsub">${L("Cambiar por", "Swap for")}:</small><div class="bdlist">${list.map(({ n, i }) => { const d = (WEAPONS[n] || 0) - (a.poder || 0); return `<div class="bdrow"><span>🗡️ ${esc(n)} <small class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "▲ +" + d : d < 0 ? "▼ " + d : "="}</small></span><button type="button" class="btn small primary" data-equip="${i}">${L("Equipar", "Equip")}</button></div>`; }).join("")}</div>` : `<small class="muted">${L("No tienes otras armas. Cómpralas en las armerías o gánalas de los jefes.", "No other weapons.")}</small>`);
    }
    if (s.slot === "mascota" || s.slot === "montura") {
      const pet = s.slot === "mascota"; const T = pet ? X().PETS || {} : X().MOUNTS || {}; const own = pet ? G.g.mascotas || [] : G.g.monturas || []; const cur = pet ? G.g.mascota : G.g.montura;
      return card(cur, `<span class="bdi">${cur ? T[cur].i : pet ? "🐾" : "🐎"}</span><div><b>${cur ? esc(cur) : pet ? L("Sin mascota", "No pet") : L("A pie", "On foot")}</b><small>${cur ? (pet ? esc(T[cur].d) : L(`Viajes a pie ${Math.round((1 - T[cur].m) * 100)}% más rápidos`, "Faster travel")) : L("Consíguelas en los establos.", "Get them at stables.")}</small></div>`, "",
        own.length ? `<div class="chips">${[null, ...own].map((n) => `<button type="button" class="chip ${cur === n ? "on" : ""}" ${pet ? "data-xpet" : "data-xmount"}="${n ? esc(n) : ""}">${n ? `${T[n].i} ${esc(n)}` : L("ninguna", "none")}</button>`).join("")}</div>` : "");
    }
    if (s.slot) {
      const n = e[s.slot]; const w = W[n]; const t = stype(s.slot); const nm = X().SLOT_NM?.()[t];
      const cands = Object.keys(G.g.inv).filter((k) => W[k] && W[k].s === t && G.g.inv[k] > 0).sort((a, b) => score(W[b]) - score(W[a]));
      const head = w ? `<span class="bdi r-${w.r}">${X().SLOT_IC[t]}</span><div><b>${esc(n)}</b><small class="rar r-${w.r}">${RARITY()[w.r]} · ${esc(nm)}</small><small>${esc(statLine(n))}</small></div>` : `<span class="bdi">${X().SLOT_IC?.[t]}</span><div><b>${esc(nm)}</b><small>${L("Ranura vacía", "Empty slot")}</small></div>`;
      return card(n, head, w ? `<button type="button" class="btn small ghost" data-xunwear="${s.slot}">${L("Quitar", "Remove")}</button>` : "",
        (s.slot === "escudo" && X().heavy?.() ? `<small class="warn inline">${L("Con un arma pesada no puedes usar escudo (no cuenta).", "Heavy weapons disable shields.")}</small>` : "") +
        (cands.length ? `<small class="bdsub">${L("En tu bolsa", "In your bag")}:</small><div class="bdlist">${cands.map((k) => { const d = score(W[k]) - score(w); return `<div class="bdrow r-${W[k].r}"><span>${X().SLOT_IC[t]} ${esc(k)} <small class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "▲" : d < 0 ? "▼" : "="}</small><small>${esc(statLine(k))}</small></span><button type="button" class="btn small primary" data-xwear="${esc(k)}|${s.slot}">${L("Equipar", "Equip")}</button></div>`; }).join("")}</div>` : `<small class="muted">${L("No tienes nada para esta ranura. Mira las armerías, mazmorras y jefes.", "Nothing for this slot yet.")}</small>`));
    }
    const n = s.item;
    if (s.idx != null) { const i = s.idx; const d = (WEAPONS[n] || 0) - (G.g.arma?.poder || 0);
      return card(n, `<span class="bdi">🗡️</span><div><b>${esc(n)}</b><small>${L("Poder", "Power")} ${WEAPONS[n] || "?"} <span class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "▲ +" + d : d < 0 ? "▼ " + d : "="}</span>${WEAPON_AFF[n] ? " · ✦ " + WEAPON_AFF[n] : ""}${(WEAPON_TRAITS[n] || []).length ? " · " + WEAPON_TRAITS[n].join(", ") : ""}</small></div>`, `<button type="button" class="btn small primary" data-equip="${i}">${L("Equipar", "Equip")}</button>`); }
    if (!G.g.inv[n]) { gsel.uiSel = null; return detail(); }
    const q = G.g.inv[n]; const w = W[n]; const sh = SHOP.find((x) => x.n === n); const at = ATTR_ITEMS[n]; const c = catOf(n);
    let desc = "", acts = "";
    if (w) { desc = `<small class="rar r-${w.r}">${RARITY()[w.r]} · ${esc(X().SLOT_NM?.()[w.s] || "")}</small><small>${esc(statLine(n))}</small>`; acts = `<button type="button" class="btn small primary" data-xwear="${esc(n)}">${L("Equipar", "Equip")}</button>`; }
    else if (sh) { desc = `<small>${esc(sh.desc || "")}</small>`; acts = sh.kind === "weapon" ? "" : `<button type="button" class="btn small primary" data-use="${esc(n)}">${c === "comida" ? L("Comer", "Eat") : c === "aceite" ? L("Aplicar al arma", "Apply") : L("Usar", "Use")}</button>`; }
    else if (at) { desc = `<small>${at[0] === "elegir" ? L("+1 al atributo que elijas (una vez)", "+1 to any attribute (once)") : `+1 ${ATTR_NAME[at[0]]} ${L("permanente (una vez)", "permanent (once)")}`}</small>`; acts = at[0] === "elegir" ? `<select data-attrpick="${esc(n)}"><option value="">${L("Elegir atributo…", "Pick attribute…")}</option>${ATTRS.map(([k, nn]) => `<option value="${k}">${nn}</option>`).join("")}</select>` : `<button type="button" class="btn small primary" data-attritem="${esc(n)}">${L("Usar", "Use")}</button>`; }
    else if (c === "mision") desc = `<small>${L("Objeto de misión: llévalo a su destino.", "Quest item: deliver it.")}</small>`;
    else desc = `<small>${L("Material: úsalo en el Taller (alquimia, cocina, aceites) o en la Forja, o véndelo en la Tienda", "Material: use it in the Workshop or sell it")}${typeof sellPrice === "function" && sellPrice(n) ? ` (☀ ${sellPrice(n)})` : ""}.</small>`;
    return card(n, `<span class="bdi ${w ? "r-" + w.r : ""}">${iconOf(n)}</span><div><b>${esc(n)} ${q > 1 ? `<small>×${q}</small>` : ""}</b>${desc}</div>`, acts);
  }
  const _bv = bagView;
  bagView = function () {
    const out = _bv(); if (!G?.g) return out;
    const qi = out.indexOf('<h3 class="sub">Misiones aceptadas'); const quests = qi >= 0 ? out.slice(qi) : "";
    return `<div class="inv"><div class="invhead"><h2>🎒 ${esc(G.nombre)} — ${L("Nivel", "Level")} ${G.nivel}</h2></div>
      <div class="invgrid">${doll()}<div class="invright">${bagGrid()}${detail()}</div></div></div>${quests}`;
  };
  // equipar con animación
  let pre = null;
  document.addEventListener("pointerdown", () => { if (G?.g) pre = { eq: JSON.stringify(X().eq?.() || {}), arma: G.g.arma?.n, st: heroStats(), pv: G.pvMax }; }, true);
  document.addEventListener("click", (ev) => {
    if (view.name !== "game" || !G) return; const t = ev.target.closest("button"); if (!t) return; const d = t.dataset;
    if (d.uislot) { ev.stopPropagation(); gsel.uiSel = gsel.uiSel?.slot === d.uislot ? null : { slot: d.uislot }; sfx("click"); return render(); }
    if (d.uiitem) { ev.stopPropagation(); const idx = d.uiidx != null ? +d.uiidx : null; gsel.uiSel = gsel.uiSel?.item === d.uiitem && gsel.uiSel?.idx == idx ? null : { item: d.uiitem, idx }; sfx("click"); return render(); }
    if (d.uicat) { ev.stopPropagation(); gsel.uiCat = d.uicat; return render(); }
    if ((d.xwear || d.xunwear || d.equip != null) && pre) {
      const p0 = pre; const r0 = t.getBoundingClientRect(); const from = { x: r0.left + r0.width / 2, y: r0.top + r0.height / 2 };
      setTimeout(() => {
        try {
          const e1 = X().eq?.() || {}; const e0 = JSON.parse(p0.eq); const changed = Object.keys(e1).filter((k) => !/B$/.test(k) && e1[k] !== e0[k]);
          if (G.g.arma?.n !== p0.arma) changed.push("arma");
          if (!changed.length) return;
          if (d.equip != null && gsel.uiSel?.idx != null) gsel.uiSel = { slot: "arma" };
          if (d.xwear && gsel.uiSel?.item) gsel.uiSel = { slot: changed[0] };
          render();
          const st = heroStats(); const diffs = [["dmg", L("Daño", "Dmg")], ["def", L("Defensa", "Def")], ["ini", L("Iniciativa", "Init")]].map(([k, lb]) => [st[k] - p0.st[k], lb]).filter(([v]) => v).map(([v, lb]) => `${v > 0 ? "+" : ""}${v} ${lb}`);
          if (G.pvMax !== p0.pv) diffs.push(`${G.pvMax > p0.pv ? "+" : ""}${G.pvMax - p0.pv} PV`);
          for (const k of changed) equipFx(k, from, !!e1[k] || k === "arma", diffs);
        } catch (x) { console.warn("ui:", x); }
      }, 40);
    }
  }, true);
  function equipFx(slot, from, on, diffs) {
    sfx(on ? "shield" : "click"); if (RM()) return;
    const el = document.querySelector(`[data-uislot="${slot}"]`); if (!el) return; const r = el.getBoundingClientRect(); const to = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    if (on) {
      const f = document.createElement("div"); f.className = "xfly"; f.textContent = el.querySelector(".usi")?.textContent || "✦"; f.style.left = from.x + "px"; f.style.top = from.y + "px"; layer().appendChild(f);
      f.animate([{ transform: "translate(-50%,-50%) scale(.6)", opacity: 0 }, { transform: `translate(calc(-50% + ${(to.x - from.x) * 0.3}px), calc(-50% + ${(to.y - from.y) * 0.3 - 60}px)) scale(1.4)`, opacity: 1, offset: 0.35 }, { transform: `translate(calc(-50% + ${to.x - from.x}px), calc(-50% + ${to.y - from.y}px)) scale(1)`, opacity: 1 }], { duration: 600, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
      setTimeout(() => { f.remove(); el.classList.remove("justeq"); void el.offsetWidth; el.classList.add("justeq");
        const b = document.createElement("div"); b.className = "eqburst"; b.style.left = to.x + "px"; b.style.top = to.y + "px"; let h = '<i class="ring"></i>'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; h += `<i class="sp" style="--dx:${(Math.cos(a) * 46).toFixed(0)}px;--dy:${(Math.sin(a) * 46).toFixed(0)}px"></i>`; } b.innerHTML = h; layer().appendChild(b); setTimeout(() => b.remove(), 900);
        document.querySelector(".dpor")?.classList.remove("pulse"); void document.querySelector(".dpor")?.offsetWidth; document.querySelector(".dpor")?.classList.add("pulse");
        diffs.forEach((t, i) => { const s = document.createElement("div"); s.className = "xfloat " + (/^-/.test(t) ? "neg" : "pos"); s.textContent = t; s.style.left = to.x + "px"; s.style.top = to.y - 10 - i * 24 + "px"; s.style.animationDelay = i * 0.12 + "s"; layer().appendChild(s); setTimeout(() => s.remove(), 1500); });
        document.querySelectorAll(".dstats b").forEach((x) => { x.classList.remove("bump"); void x.offsetWidth; x.classList.add("bump"); });
      }, 600);
    } else { el.classList.remove("justoff"); void el.offsetWidth; el.classList.add("justoff"); }
  }

  // =====================================================================
  // PERSONAJE: resumen arriba
  // =====================================================================
  const _hv = heroView;
  heroView = function () {
    const out = _hv(); if (!G?.g) return out; const st = heroStats(); const r = G.rayos || {};
    const vals = ATTRS.map(([k, n]) => [n, attr(k)]); const mx = Math.max(5, ...vals.map(([, v]) => v));
    return `<div class="herosum"><div class="hs-por">${typeof raceImg === "function" ? raceImg(G.raza, "rimg hs-img") : ""}<div><h2>${esc(G.nombre)}</h2><small>${esc(G.raza)}${G.sub ? " · " + esc(G.sub) : ""} · ${L("Nivel", "Level")} ${G.nivel} · ${esc(G.peldano || "")}</small>${G.g.w?.title ? `<small class="ttl">«${esc(G.g.w.title)}»</small>` : ""}</div></div>
      <div class="hs-tiles"><div><em>⚔️</em><b>${st.dmg}</b><small>${L("Daño", "Damage")}</small></div><div><em>🛡️</em><b>${st.def}</b><small>${L("Defensa", "Defense")}</small></div><div><em>❤️</em><b>${G.pvMax}</b><small>PV</small></div><div><em>💧</em><b>${G.manaMax}</b><small>${L("Maná", "Mana")}</small></div><div><em>⚡</em><b>${G.energiaMax}</b><small>${L("Energía", "Energy")}</small></div><div><em>💨</em><b>${st.ini >= 0 ? "+" : ""}${st.ini}</b><small>${L("Iniciativa", "Initiative")}</small></div></div>
      <div class="hs-attrs">${vals.map(([n, v]) => `<div class="hsa"><span>${esc(n)}</span><i><b style="width:${Math.max(4, Math.min(100, ((v + 1) / (mx + 1)) * 100))}%"></b></i><em>${v >= 0 ? "+" : ""}${v}</em></div>`).join("")}</div>
      <div class="hs-rayos">${[["poder", "⚔️", L("Poder", "Power")], ["saber", "📚", L("Saber", "Wisdom")], ["corazon", "💛", L("Corazón", "Heart")], ["fama", "⭐", L("Fama", "Fame")]].map(([k, ic, lb]) => `<span>${ic} ${lb} <b>${r[k] || 0}</b></span>`).join("")}</div></div>${out}`;
  };

  // =====================================================================
  // LUGAR: ordenar en secciones (en el DOM, después de dibujar)
  // =====================================================================
  function sec(icon, title, cls) { const d = document.createElement("div"); d.className = "lsec " + cls; d.innerHTML = `<h3 class="lsech"><span>${icon}</span> ${title}</h3><div class="lbody"></div>`; return d; }
  function organizeLugar() {
    if (gtab !== "lugar" || G?.g?.combat) return; const panel = document.querySelector('section.panel[data-tab="lugar"]'); if (!panel || panel.dataset.org) return; panel.dataset.org = "1";
    const kids = [...panel.children]; const by = (sel) => kids.filter((k) => k.matches(sel));
    const now = by(".qhere, .raidbox, .herep, .wboss, .result"); const daily = by(".daily"); const svc = by(".wsbox, .forge, .armb, .wearshop, .stableb, .trq, .dun, .arenab"); const ppl = by(".ppl");
    const scene = kids.find((k) => k.matches(".scene")); const acts = kids.find((k) => k.matches(".acts"));
    if (now.length && scene) { const s = sec("🔔", L("Ahora mismo", "Right now"), "lnow"); now.forEach((n) => s.querySelector(".lbody").appendChild(n)); scene.after(s); }
    let anchor = acts; if (anchor) { let nx = anchor.nextElementSibling; while (nx && nx.matches("label.f, .shopc, .qboard, .card:not(.mini)")) { anchor = nx; nx = nx.nextElementSibling; } }
    if (!anchor) return;
    const blocks = [];
    if (daily.length) { const s = sec("📅", L("Misiones de hoy", "Today"), "ldaily"); daily.forEach((n) => s.querySelector(".lbody").appendChild(n)); blocks.push(s); }
    if (svc.length) { const s = sec("🏪", L("Servicios de este lugar", "Services here"), "lsvc"); svc.forEach((n) => s.querySelector(".lbody").appendChild(n)); blocks.push(s); }
    if (ppl.length) { const s = sec("🗣️", L("Gente", "People"), "lppl"); ppl.forEach((n) => s.querySelector(".lbody").appendChild(n)); blocks.push(s); }
    blocks.reverse().forEach((b) => anchor.after(b));
    if (acts && !acts.previousElementSibling?.classList?.contains("lsech")) { const h = document.createElement("h3"); h.className = "lsech"; h.innerHTML = `<span>🎯</span> ${L("Qué puedes hacer aquí", "What you can do here")}`; acts.before(h); }
  }
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    try { if (G && view.name === "game") organizeLugar(); } catch (e) { console.warn("ui:", e); }
    return r;
  };

  const css = `
/* ---------- tema general ---------- */
body{background:radial-gradient(1100px 600px at 8% -12%,#d9a4411a,transparent 60%),radial-gradient(900px 520px at 108% 8%,#4fb3ff12,transparent 60%),radial-gradient(700px 500px at 50% 110%,#9b5cff10,transparent 60%),var(--ground);background-attachment:fixed}
.panel{border-radius:12px;border-color:#d9a44133;background:linear-gradient(180deg,#152335 0%,#111c29 100%);box-shadow:0 12px 34px #0007,inset 0 1px 0 #ffffff08;position:relative}
.panel::before{content:"";position:absolute;inset:0;border-radius:12px;pointer-events:none;background:linear-gradient(135deg,#d9a44122,transparent 25%,transparent 75%,#d9a44114)}
.panel.tabin{animation:tabIn .35s cubic-bezier(.2,1,.3,1)}
@keyframes tabIn{from{opacity:0;transform:translateY(8px)}}
.panel h2{display:flex;align-items:center;gap:10px}
.panel > h2::after,.panel > .row > h2::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#d9a44166,transparent)}
h3.sub{display:flex;align-items:center;gap:8px;color:var(--gold);margin-top:22px}
h3.sub::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#d9a44144,transparent)}
.card{border-radius:10px;background:linear-gradient(180deg,#1b2b3f,#16233a);border-color:#2f4560;box-shadow:inset 0 1px 0 #ffffff08}
.card.mini{transition:border-color .2s,transform .2s}
.btn{border-radius:8px;transition:transform .12s,box-shadow .2s,background .2s,border-color .2s}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px #0006}
.btn:active:not(:disabled){transform:translateY(1px) scale(.98)}
.btn.primary{background:linear-gradient(180deg,#379277,#2a6b58);border-color:#4fb393;box-shadow:inset 0 1px 0 #ffffff22}
.btn.primary:hover:not(:disabled){background:linear-gradient(180deg,#3fa587,#2f7a64)}
.btn.danger{background:linear-gradient(180deg,#a8453a,#7d2f27);border-color:#d0584a}
.chip{border-radius:999px;transition:all .15s}
.pill{border-radius:999px}
/* ---------- HUD ---------- */
.hud{border-radius:14px;border-color:#d9a44133;background:linear-gradient(135deg,#1a2a3e,#111c2a 60%,#1a1a2e);box-shadow:0 10px 30px #0008,inset 0 1px 0 #ffffff0d;padding:14px 18px}
.hud .who{padding-left:78px;min-height:66px}
.hud .hpor{position:absolute;left:0;top:0;width:64px;height:64px}
.hud .hpor .hud-img{position:static;width:64px;height:64px;border-radius:50%;box-shadow:0 0 0 2px #d9a441,0 0 18px #d9a44155}
.lvlb{position:absolute;right:-6px;bottom:-4px;min-width:24px;height:24px;padding:0 5px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(180deg,#ffd98a,#b8862b);color:#1a1206;font-family:var(--display);font-weight:700;font-size:12.5px;box-shadow:0 2px 6px #000a}
.hud .who b{font-size:20px}
.meters{gap:8px 18px}
.meters .m{padding:6px 10px;border-radius:10px;background:#0b131c88;border:1px solid #ffffff0d;min-width:130px}
.meters .m em{font-style:normal;margin-right:4px}
.meters .m-so{justify-content:center;flex-direction:row !important;align-items:center;gap:4px;color:#ffd98a}.meters .m-so b{font-family:var(--display);font-size:18px}
.bar{height:9px;border-radius:6px;border-color:#00000066;background:#0a1119;box-shadow:inset 0 1px 2px #000a}
.bar i{border-radius:6px;position:relative;overflow:hidden}
.bar i::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,#ffffff40,transparent);transform:translateX(-100%);animation:barShine 3.5s ease-in-out infinite}
@keyframes barShine{60%,100%{transform:translateX(100%)}}
.bar.pv i{background:linear-gradient(90deg,#b8322a,#ef6b55)}.bar.mn i{background:linear-gradient(90deg,#2f63c7,#6aa8ff)}.bar.en i{background:linear-gradient(90deg,#3f9a6c,#8fe0b0)}.bar.xp i{background:linear-gradient(90deg,#b8862b,#ffd98a)}
.where{background:#0b131c66;border:1px solid #ffffff0d;border-radius:10px;padding:8px 12px}
/* ---------- pestañas ---------- */
.gtabs{position:sticky;top:0;z-index:20;gap:6px;padding:6px;margin:0 0 12px;border-radius:12px;background:#0b131ccc;backdrop-filter:blur(8px);border:1px solid #d9a44122;box-shadow:0 6px 20px #0006;scrollbar-width:thin}
.gtabs button{display:flex;align-items:center;gap:6px;border-radius:9px;padding:8px 12px;background:transparent;border-color:transparent;transition:all .18s;position:relative}
.gtabs button .tic{font-style:normal;font-size:16px;transition:transform .2s}
.gtabs button:hover{background:#ffffff08;color:var(--ink)}.gtabs button:hover .tic{transform:scale(1.2) rotate(-6deg)}
.gtabs button.on{background:linear-gradient(180deg,#d9a44133,#d9a44111);border-color:#d9a44188;color:#ffe9b8;box-shadow:0 0 14px #d9a44133}
.gtabs button.on::after{content:"";position:absolute;left:18%;right:18%;bottom:-1px;height:2px;border-radius:2px;background:#ffd98a;box-shadow:0 0 8px #ffd98a}
@media (max-width:640px){.gtabs button{padding:7px 9px;font-size:12px}}
/* ---------- lugar ---------- */
.lsech{display:flex;align-items:center;gap:8px;margin:20px 0 8px;color:var(--gold);font-size:13px}
.lsech span{font-size:16px}.lsech::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#d9a44144,transparent)}
.lsec .lbody{display:flex;flex-direction:column;gap:8px}.lsec .lbody > .card{margin-top:0}
.lsvc .lbody{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px;align-items:start}
.lsvc .lbody > .card.open,.lsvc .lbody > .wsbox.open,.lsvc .lbody > .trq{grid-column:1/-1}
.lsvc .lbody > .card:has(.wgrid),.lsvc .lbody > .card:has(.shop),.lsvc .lbody > .dun.on{grid-column:1/-1}
.lnow .lbody > .card{border-color:#ffd84a55;box-shadow:0 0 0 1px #ffd84a22,0 6px 18px #0005}
.acts{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.act{border-radius:10px;padding:12px 14px;background:linear-gradient(180deg,#1d2e44,#172538);border-color:#2f4560;transition:transform .15s,border-color .15s,box-shadow .15s}
.act:hover:not(:disabled){transform:translateY(-2px);border-color:#d9a44188;box-shadow:0 8px 18px #0006}
.act b{font-size:15px}
/* ---------- bolsa / equipo ---------- */
.inv{margin-bottom:8px}.invhead h2{margin-bottom:10px}
.invgrid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:14px;align-items:start}
@media (max-width:900px){.invgrid{grid-template-columns:1fr}}
.doll{display:grid;grid-template-columns:auto 1fr auto;gap:10px;padding:14px;border-radius:12px;border:1px solid #d9a44133;background:radial-gradient(60% 55% at 50% 40%,#1f5f7a55,transparent 70%),linear-gradient(180deg,#132236,#0d1622);box-shadow:inset 0 0 40px #0008}
.dcol{display:flex;flex-direction:column;gap:8px}
.uslot{position:relative;width:64px;height:64px;border-radius:10px;border:1px solid #3a5270;background:linear-gradient(180deg,#22344b,#141f2e);color:var(--ink);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:2px;box-shadow:inset 0 2px 6px #000a;transition:transform .15s,border-color .15s,box-shadow .15s}
.uslot:hover{transform:translateY(-2px);border-color:#d9a441}
.uslot .usi{font-size:26px;line-height:1}.uslot .ghost{font-style:normal;opacity:.22;filter:grayscale(1)}
.uslot small{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2);font-family:var(--display)}
.uslot.full{border-color:var(--rc,#8a96a8);box-shadow:inset 0 0 14px color-mix(in srgb,var(--rc,#8a96a8) 35%,transparent),0 0 8px color-mix(in srgb,var(--rc,#8a96a8) 30%,transparent)}
.uslot.sel{border-color:#ffd84a;box-shadow:0 0 0 2px #ffd84a88,inset 0 0 14px #ffd84a33}
.uslot.off{opacity:.45}
.uslot .upd{position:absolute;top:2px;right:4px;font-size:11px;color:#8be0a8;animation:updB 1.2s ease-in-out infinite}
@keyframes updB{50%{transform:translateY(-3px)}}
.uslot.justeq{animation:slotEq .7s cubic-bezier(.2,1.6,.4,1)}
@keyframes slotEq{0%{transform:scale(.7);filter:brightness(2.5)}50%{transform:scale(1.18)}100%{transform:scale(1);filter:none}}
.uslot.justoff{animation:slotOff .4s ease}
@keyframes slotOff{50%{transform:scale(.85);opacity:.5}}
.uslot.wide{width:auto;flex:1;flex-direction:row;justify-content:flex-start;gap:10px;padding:6px 12px;height:58px}
.uslot.wide .uw{display:flex;flex-direction:column;align-items:flex-start;min-width:0}.uslot.wide .uw b{font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}.uslot.wide .uw small{text-transform:none;letter-spacing:0;font-family:var(--body);font-size:11.5px}
.uslot.weapon{--rc:#ffd98a}
.uslot.mini{width:40px;height:40px;font-size:20px;border-radius:50%}
.dmid{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0}
.dpor{position:relative;width:min(190px,100%);aspect-ratio:1;border-radius:50%;display:grid;place-items:center}
.dpor .dimg{width:100%;height:100%;border-radius:50%;object-fit:cover;box-shadow:0 0 0 3px #d9a441,0 0 30px #d9a44155;position:relative;z-index:1}
.daura{position:absolute;inset:-12px;border-radius:50%;background:conic-gradient(from 0deg,#d9a44100,#d9a44166,#4fb3ff44,#d9a44100);filter:blur(8px);animation:aura 8s linear infinite}
@keyframes aura{to{transform:rotate(360deg)}}
.dpor.pulse .dimg{animation:porP .7s ease}
@keyframes porP{40%{box-shadow:0 0 0 4px #ffd84a,0 0 50px #ffd84a}}
.dpet{position:absolute;bottom:-6px;right:-10px;display:flex;gap:4px;z-index:2}
.dname{text-align:center}.dname b{display:block;font-family:var(--display);color:#ffe9b8;font-size:17px}.dname small{color:var(--ink-2)}
.dstats{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.dstats div{display:flex;flex-direction:column;align-items:center;min-width:64px;padding:4px 8px;border-radius:8px;background:#0b131caa;border:1px solid #ffffff10}
.dstats small{font-family:var(--display);font-size:9.5px;letter-spacing:.08em;color:var(--ink-2)}.dstats b{font-family:var(--display);font-size:20px;color:#ffd98a}
.dstats b.bump{animation:stBump .6s ease}
@keyframes stBump{40%{transform:scale(1.35);color:#8be0a8}}
.dbot{display:flex;gap:8px;width:100%;align-items:stretch}
@media (max-width:520px){.doll{grid-template-columns:1fr;}.dcol{flex-direction:row;flex-wrap:wrap;justify-content:center}.uslot{width:54px;height:54px}.uslot .usi{font-size:22px}}
.invright{display:flex;flex-direction:column;gap:10px}
.bagp{padding:12px;border-radius:12px;border:1px solid #6b4a2a88;background:linear-gradient(180deg,#2a1d12,#1d140c);box-shadow:inset 0 0 30px #000a}
.bagh{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.bagh b{font-family:var(--display);color:#ffd98a;font-size:16px}
.bcats{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}.bcats .chip{font-size:12px;padding:3px 9px}.bcats .chip small{opacity:.7}
@media (max-width:640px){.bcats .chip span{display:none}}
.bgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:5px}
.bcell,.bempty{aspect-ratio:1;border-radius:7px;border:1px solid #4a3522;background:linear-gradient(180deg,#1a120b,#120c07);box-shadow:inset 0 2px 5px #000c}
.bcell{position:relative;cursor:pointer;color:var(--ink);font-size:24px;display:grid;place-items:center;padding:0;transition:transform .12s,border-color .12s;animation:cellIn .25s ease both}
.bcell:hover{transform:scale(1.08);border-color:#d9a441;z-index:1}
.bcell.sel{border-color:#ffd84a;box-shadow:0 0 0 2px #ffd84a88,inset 0 0 10px #ffd84a44}
.bcell[class*=" r-"]{border-color:var(--rc);box-shadow:inset 0 0 10px color-mix(in srgb,var(--rc) 40%,transparent)}
.bcell .bq{position:absolute;right:3px;bottom:1px;font-size:11px;font-family:var(--display);color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000}
.bcell .upd{position:absolute;top:1px;right:3px;font-size:10px;color:#8be0a8}
.bcell.c-armas{border-color:#ffd98a66}
@keyframes cellIn{from{opacity:0;transform:scale(.8)}}
.bdet{padding:12px;border-radius:12px;border:1px solid #d9a44144;background:linear-gradient(180deg,#1b2b3f,#131f2f);display:flex;flex-direction:column;gap:8px;animation:tsIn .3s ease}
.bdet.hint{align-items:center;text-align:center;color:var(--ink-2);border-style:dashed}
.bdh{display:flex;gap:10px;align-items:flex-start}.bdh > div{display:flex;flex-direction:column;gap:2px;min-width:0}.bdh b{font-family:var(--display);color:#ffe9b8;font-size:15.5px}.bdh small{color:var(--ink-2);font-size:12.5px}
.bdi{font-size:30px;width:52px;height:52px;flex:none;display:grid;place-items:center;border-radius:10px;background:#0b131c;border:1px solid var(--rc,#3a5270);box-shadow:inset 0 0 12px color-mix(in srgb,var(--rc,#3a5270) 40%,transparent)}
.rar{font-family:var(--display);letter-spacing:.05em;color:var(--rc) !important}
.bdsub{color:var(--gold);font-family:var(--display);letter-spacing:.06em;font-size:11.5px}
.bdlist{display:flex;flex-direction:column;gap:6px;max-height:260px;overflow:auto}
.bdrow{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;background:#0b131c88;border-left:3px solid var(--rc,#3a5270)}
.bdrow > span{display:flex;flex-direction:column;min-width:0}.bdrow small{color:var(--ink-2);font-size:12px}
.up{color:#8be0a8 !important}.down{color:#e0584a !important}
.eqburst{position:fixed;width:0;height:0;pointer-events:none;z-index:77}.eqburst i{position:absolute;left:0;top:0;border-radius:50%}
.eqburst .ring{width:30px;height:30px;margin:-15px;border:3px solid #ffd84a;box-shadow:0 0 14px #ffd84a;animation:hbRing .7s ease-out forwards}
.eqburst .sp{width:6px;height:6px;margin:-3px;background:#ffd84a;box-shadow:0 0 8px #ffd84a;animation:hbSpark .7s ease-out forwards}
/* ---------- personaje ---------- */
.herosum{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:12px;margin-bottom:16px;padding:14px;border-radius:12px;border:1px solid #d9a44133;background:radial-gradient(60% 80% at 0% 0%,#d9a44118,transparent),linear-gradient(180deg,#1a2a3e,#121d2c)}
@media (max-width:820px){.herosum{grid-template-columns:1fr}}
.hs-por{display:flex;gap:14px;align-items:center}.hs-por h2{margin:0}.hs-por small{display:block;color:var(--ink-2)}
.hs-img{width:84px;height:84px;border-radius:50%;box-shadow:0 0 0 3px #d9a441,0 0 24px #d9a44155}
.hs-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.hs-tiles div{display:flex;flex-direction:column;align-items:center;padding:6px;border-radius:10px;background:#0b131c99;border:1px solid #ffffff10}
.hs-tiles em{font-style:normal;font-size:18px}.hs-tiles b{font-family:var(--display);font-size:19px;color:#ffd98a}.hs-tiles small{color:var(--ink-2);font-size:11.5px}
.hs-attrs{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px 14px}
.hsa{display:grid;grid-template-columns:110px 1fr 34px;gap:8px;align-items:center;font-size:13.5px}
.hsa i{height:8px;border-radius:5px;background:#0a1119;overflow:hidden}.hsa i b{display:block;height:100%;background:linear-gradient(90deg,#b8862b,#ffd98a);border-radius:5px}
.hsa em{font-style:normal;font-family:var(--display);color:#ffd98a;text-align:right}
.hs-rayos{display:flex;gap:8px;flex-wrap:wrap;grid-column:1/-1}.hs-rayos span{padding:4px 10px;border-radius:999px;background:#0b131c99;border:1px solid #d9a44133;font-size:13px}.hs-rayos b{color:#ffd98a}
/* ---------- grupo, vínculos, historia ---------- */
.si > .pill{flex:0 0 auto;width:auto}
.pc,.bcard,.gp{transition:transform .15s,border-color .15s}.pc:hover,.bcard:hover{transform:translateY(-2px);border-color:#d9a44166}
.qs{transition:background .2s}.qs.now{box-shadow:0 0 0 1px #d9a44144,0 6px 16px #0005}
.tt{border-radius:10px;overflow:hidden}
.clog > div{padding:4px 0;border-bottom:1px dashed #ffffff0d}
@media (prefers-reduced-motion:reduce){.daura,.bar i::after,.uslot .upd{animation:none!important}}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
