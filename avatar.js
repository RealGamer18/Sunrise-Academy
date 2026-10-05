// ===================== AVATARES PERSONALIZADOS =====================
// Cada personaje puede:
//  · usar un retrato de raza (cualquiera de las 16) y encuadrarlo/colorearlo,
//  · crear su cara por piezas (creador por capas, dibujado en SVG),
//  · o subir su propia imagen.
// Encima: fondo, marco, aura, emblema, título y color de nombre — muchos se desbloquean jugando.
// Todo se guarda en G.g.av (lo ven los demás). La imagen final se compone en un <canvas>
// y se guarda en memoria, así que todos los sitios que muestran el retrato siguen funcionando.
(function () {
  if (typeof raceImg !== "function" || typeof RAZAS === "undefined") return;
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const escx = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const RID = (r) => (RAZAS.find((x) => x.id === r || x.n === r) || {}).id || "humano";
  const save = () => { if (typeof persist === "function") persist(); else if (typeof window.save === "function") window.save(); };
  const W = () => { const g = G.g; g.w = g.w || {}; g.w.ach = g.w.ach || {}; g.w.regs = g.w.regs || {}; return g.w; };
  const has = (n) => (G.g.inv?.[n] || 0) > 0;
  const lvl = () => G?.nivel || 1;

  // =================================================================
  // 1. Colores
  // =================================================================
  const hx = (h) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const toHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  const lt = (c, t) => mix(c, "#ffffff", t), dk = (c, t) => mix(c, "#000000", t);

  const SKIN = ["#f6dcc8", "#f0c8a8", "#e0b48a", "#c98e64", "#a06a44", "#6e4428", "#4a2c1a", "#8ad0d8", "#5a9a7a", "#6a8a3a", "#a8c080", "#6a6a8a", "#b03a2a", "#8a96a0", "#e8dcd8", "#b8a0e0"];
  const HAIR = ["#1a1410", "#3a2618", "#6a4224", "#a8442a", "#d08a3a", "#e8d8a0", "#f4f0e8", "#8a8a90", "#2a6a90", "#c06ab0", "#4a7a30", "#b02a3a", "#5a3aa0", "#40c0c0"];
  const EYE = ["#3a2a1a", "#6a4a2a", "#3aa060", "#3a7ac0", "#8ab0d0", "#a0a0a8", "#c02030", "#ffcc30", "#9a4aff", "#40c0ff", "#e0e040", "#f080c0"];
  const CLOTH = ["#2a3a6a", "#6a1e24", "#2a5a3a", "#4a2a6a", "#5a4028", "#1e2230", "#8a8a96", "#b08a3a", "#e8e0d0", "#2a6a7a", "#a04a1a", "#3a1a2a"];
  const MARK = ["#ffb050", "#40c0ff", "#3a90b0", "#2a6a4a", "#e04040", "#ffd060", "#b070ff", "#ffffff"];

  // =================================================================
  // 2. Creador por piezas (SVG original)
  // =================================================================
  const PRESET = {
    humano: { sk: "#e0b48a", ea: "h", ha: 1, hc: "#3a2618", ec: "#6a4a2a" },
    elfo: { sk: "#f0d0b0", ea: "e", ha: 3, hc: "#e8d8a0", ec: "#3aa060", fc: 2 },
    enano: { sk: "#d8a07a", ea: "h", ha: 1, hc: "#a8442a", bd: 3, fc: 1, ec: "#3a7ac0" },
    bestial: { sk: "#9a8070", ea: "b", ha: 5, hc: "#5a4a40", ec: "#ffcc30", ey: 2 },
    draconido: { sk: "#b03a2a", ea: "n", ha: 0, ho: 2, hoc: "#3a2a20", mk: 5, mc: "#ffb050", ec: "#ffcc30", ey: 2 },
    sirenido: { sk: "#8ad0d8", ea: "f", ha: 3, hc: "#2a6a90", mk: 5, mc: "#3a90b0", ec: "#8ab0d0" },
    feerico: { sk: "#f6dcd0", ea: "f", ha: 9, hc: "#c06ab0", ac: 4, ec: "#f080c0", gl: 1 },
    umbrio: { sk: "#6a6a8a", ea: "e", ha: 3, hc: "#1a1410", ho: 2, hoc: "#1a1018", ec: "#ffcc30", gl: 1 },
    orco: { sk: "#6a8a3a", ea: "e", ha: 8, hc: "#1a1410", tu: 1, ec: "#c02030", fc: 1, br: 2 },
    celestial: { sk: "#f8e8d0", ea: "h", ha: 9, hc: "#e8d8a0", ac: 1, ec: "#ffcc30", gl: 1 },
    vampiro: { sk: "#e8dcd8", ea: "e", ha: 2, hc: "#1a1410", ec: "#c02030", mo: 2, cl: 1, c1: "#3a1a2a", c2: "#b02a3a" },
    semigigante: { sk: "#a89080", ea: "h", ha: 0, bd: 2, hc: "#6a4224", fc: 1, no: 1 },
    gnomo: { sk: "#f0c0a0", ea: "g", ha: 5, hc: "#d08a3a", ac: 5, ec: "#3a7ac0", ey: 1 },
    forjado: { sk: "#8a96a0", ea: "n", ha: 0, mk: 3, mc: "#40c0ff", ec: "#40c0ff", gl: 1, cl: 1 },
    silvano: { sk: "#a8c080", ea: "e", ha: 9, hc: "#4a7a30", ho: 3, hoc: "#6a4a2a", ac: 4, ec: "#3aa060" },
    naga: { sk: "#5a9a7a", ea: "n", ha: 0, mk: 5, mc: "#2a6a4a", ec: "#e0e040", ey: 2 },
  };
  const BDEF = { sk: "#e0b48a", fc: 0, ea: "h", ey: 0, ec: "#6a4a2a", gl: 0, br: 0, no: 0, mo: 1, ha: 1, hc: "#3a2618", bd: 0, ho: 0, hoc: "#e8dcc0", tu: 0, mk: 0, mc: "#ffb050", cl: 0, c1: "#2a3a6a", c2: "#d9a441", ac: 0 };
  const bOf = (raza) => ({ ...BDEF, ...(PRESET[RID(raza)] || {}) });

  const MIR = 'transform="matrix(-1 0 0 1 256 0)"';
  function svgOf(b0) {
    const b = { ...BDEF, ...(b0 || {}) };
    const sk = b.sk, skD = dk(sk, 0.28), skL = lt(sk, 0.2), hc = b.hc, hcD = dk(hc, 0.35), hcL = lt(hc, 0.25);
    const c1 = b.c1, c2 = b.c2, lip = mix(sk, "#a83a4a", 0.38);
    const D = `<defs>
      <radialGradient id="gs" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="${skL}"/><stop offset=".62" stop-color="${sk}"/><stop offset="1" stop-color="${skD}"/></radialGradient>
      <linearGradient id="gh" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${hcL}"/><stop offset=".5" stop-color="${hc}"/><stop offset="1" stop-color="${hcD}"/></linearGradient>
      <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt(c1, 0.15)}"/><stop offset="1" stop-color="${dk(c1, 0.45)}"/></linearGradient>
      <linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lt(c1, 0.55)}"/><stop offset=".45" stop-color="${c1}"/><stop offset=".55" stop-color="${dk(c1, 0.2)}"/><stop offset="1" stop-color="${lt(c1, 0.25)}"/></linearGradient>
      <linearGradient id="gk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dk(sk, 0.4)}"/><stop offset="1" stop-color="${skD}"/></linearGradient>
      <linearGradient id="gho" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lt(b.hoc, 0.3)}"/><stop offset="1" stop-color="${dk(b.hoc, 0.4)}"/></linearGradient>
      <radialGradient id="gi"><stop offset="0" stop-color="${lt(b.ec, 0.35)}"/><stop offset=".7" stop-color="${b.ec}"/><stop offset="1" stop-color="${dk(b.ec, 0.5)}"/></radialGradient>
      <filter id="fb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
      <filter id="fs" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
    </defs>`;
    const HEAD = [
      "M128 50 C164 50 180 80 180 112 C180 146 160 176 128 180 C96 176 76 146 76 112 C76 80 92 50 128 50Z",
      "M128 52 C168 52 186 82 186 114 C186 152 168 178 128 184 C88 178 70 152 70 114 C70 82 88 52 128 52Z",
      "M128 50 C164 50 178 80 178 110 C178 140 154 174 128 186 C102 174 78 140 78 110 C78 80 92 50 128 50Z",
    ][b.fc] || "";
    let s = "";
    // --- capucha (detrás) ---
    if (b.cl === 2) s += `<path d="M54 150 C44 72 88 22 128 22 C168 22 212 72 202 150 C204 190 188 214 172 222 L84 222 C68 214 52 190 54 150Z" fill="url(#gc)"/><path d="M70 150 C64 84 96 46 128 46 C160 46 192 84 186 150 C186 170 178 190 168 200 L88 200 C78 190 70 170 70 150Z" fill="${dk(c1, 0.65)}"/>`;
    // --- pelo de atrás ---
    const HB = {
      3: "M70 110 C66 60 96 36 128 36 C160 36 190 60 186 110 L194 232 C172 244 150 238 140 214 L116 214 C106 238 84 244 62 232 Z",
      5: "M60 132 C40 104 52 54 92 40 C112 22 150 22 170 40 C206 52 220 104 198 134 C214 158 200 190 182 192 C170 214 86 214 74 192 C56 190 42 158 60 132Z",
      9: "M66 112 C62 60 96 36 128 36 C160 36 194 60 190 112 L188 182 C176 192 160 188 156 172 L100 172 C96 188 80 192 68 182Z",
      7: "M72 110 C68 62 98 40 128 40 C158 40 188 62 184 110 L182 150 L74 150Z",
    };
    if (HB[b.ha] && b.cl !== 2) s += `<path d="${HB[b.ha]}" fill="url(#gh)"/><path d="${HB[b.ha]}" fill="none" stroke="${hcD}" stroke-opacity=".5" stroke-width="2"/>`;
    if (b.ha === 4 && b.cl !== 2) s += `<path d="M168 76 C204 86 212 140 200 196 C194 214 176 210 180 188 C190 142 182 106 162 90Z" fill="url(#gh)" stroke="${hcD}" stroke-opacity=".5"/>`;
    // --- cuello ---
    s += `<path d="M106 148 L106 198 Q128 210 150 198 L150 148 Z" fill="url(#gk)"/><ellipse cx="128" cy="170" rx="24" ry="8" fill="${dk(sk, 0.5)}" opacity=".35" filter="url(#fs)"/>`;
    // --- ropa ---
    const BODY = "M26 256 C30 216 68 196 104 190 L152 190 C188 196 226 216 230 256Z";
    if (b.cl === 0) s += `<path d="${BODY}" fill="url(#gc)"/><path d="M104 190 L128 232 L152 190 L144 188 L128 214 L112 188Z" fill="${c2}"/><path d="M104 190 L128 232 L152 190" fill="none" stroke="${dk(c2, 0.4)}" stroke-width="1.5"/><path d="M60 232 C80 222 92 220 104 222" stroke="${lt(c1, 0.25)}" stroke-opacity=".4" fill="none" stroke-width="2"/>`;
    else if (b.cl === 1) s += `<path d="${BODY}" fill="url(#gm)"/><path d="M100 184 Q128 198 156 184 L160 204 Q128 220 96 204Z" fill="${c2}" stroke="${dk(c2, 0.45)}"/><ellipse cx="56" cy="222" rx="42" ry="26" fill="url(#gm)" stroke="${dk(c1, 0.5)}" stroke-width="2"/><ellipse cx="200" cy="222" rx="42" ry="26" fill="url(#gm)" stroke="${dk(c1, 0.5)}" stroke-width="2"/><path d="M28 226 Q56 210 86 222 M170 222 Q200 210 228 226" stroke="${lt(c1, 0.6)}" stroke-opacity=".6" fill="none" stroke-width="2"/><circle cx="40" cy="226" r="3" fill="${c2}"/><circle cx="216" cy="226" r="3" fill="${c2}"/><path d="M128 214 L128 256" stroke="${dk(c1, 0.45)}" stroke-width="2"/>`;
    else if (b.cl === 2) s += `<path d="${BODY}" fill="url(#gc)"/><path d="M112 196 L128 256 L144 196Z" fill="${dk(c1, 0.6)}"/><circle cx="128" cy="204" r="7" fill="${c2}" stroke="${dk(c2, 0.5)}" stroke-width="2"/><circle cx="126" cy="202" r="2" fill="#fff" opacity=".7"/>`;
    else if (b.cl === 3) s += `<path d="${BODY}" fill="url(#gc)"/><path d="M96 200 C86 180 88 160 96 150 L116 194Z M160 200 C170 180 168 160 160 150 L140 194Z" fill="${c2}" stroke="${dk(c2, 0.45)}"/><path d="M128 196 L128 256" stroke="${c2}" stroke-width="3"/>${[[70, 232], [186, 236], [92, 248], [168, 250], [56, 250]].map(([x, y]) => `<path d="M${x} ${y - 4}l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z" fill="${c2}"/>`).join("")}`;
    else if (b.cl === 4) s += `<path d="${BODY}" fill="url(#gc)"/><path d="M108 190 L128 240 L148 190Z" fill="${c2}"/><path d="M70 214 L196 256" stroke="${dk(c1, 0.55)}" stroke-width="9"/><circle cx="104" cy="226" r="4" fill="#c0a060"/>`;
    // --- orejas ---
    const EAR = {
      h: `<ellipse cx="78" cy="120" rx="9" ry="15" fill="url(#gs)"/><path d="M76 112 Q80 120 76 128" stroke="${skD}" fill="none" stroke-width="2"/>`,
      e: `<path d="M82 106 L40 78 L56 118 Q64 136 84 134 Z" fill="url(#gs)"/><path d="M78 112 L54 92 L64 120" stroke="${skD}" fill="none" stroke-width="1.6"/>`,
      f: `<path d="M80 110 L58 96 L66 124 Q72 134 84 132 Z" fill="url(#gs)"/><circle cx="62" cy="104" r="1.6" fill="#fff" opacity=".8"/>`,
      g: `<ellipse cx="72" cy="118" rx="14" ry="20" transform="rotate(-18 72 118)" fill="url(#gs)"/><path d="M70 106 Q76 118 70 130" stroke="${skD}" fill="none" stroke-width="2"/>`,
      n: `<circle cx="80" cy="120" r="7" fill="${dk(sk, 0.35)}"/><circle cx="80" cy="120" r="3" fill="${lt(sk, 0.3)}"/>`,
      b: "",
    };
    s += `<g>${EAR[b.ea] || ""}</g><g ${MIR}>${EAR[b.ea] || ""}</g>`;
    // --- cabeza ---
    s += `<path d="${HEAD}" fill="url(#gs)"/><path d="${HEAD}" fill="none" stroke="${dk(sk, 0.45)}" stroke-opacity=".5" stroke-width="1.5"/>`;
    s += `<ellipse cx="104" cy="140" rx="12" ry="7" fill="#e06060" opacity=".14" filter="url(#fb)"/><ellipse cx="152" cy="140" rx="12" ry="7" fill="#e06060" opacity=".14" filter="url(#fb)"/>`;
    // --- marcas ---
    const MK = {
      1: [[100, 138], [106, 142], [95, 143], [112, 138], [150, 138], [156, 142], [161, 137], [145, 142]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${dk(sk, 0.35)}" opacity=".7"/>`).join(""),
      2: `<path d="M96 100 L118 138" stroke="${mix(sk, "#a04040", 0.45)}" stroke-width="3" stroke-linecap="round"/><path d="M100 108 L106 104 M106 118 L112 114 M110 128 L116 124" stroke="${mix(sk, "#a04040", 0.4)}" stroke-width="1.5"/>`,
      3: `<g stroke="${b.mc}" stroke-width="2" fill="none" filter="url(#fs)" opacity=".95"><path d="M128 62 L128 84 M120 70 L136 70 M122 78 L134 78"/><path d="M92 136 L102 146 L96 154 M164 136 L154 146 L160 154"/></g><g stroke="${lt(b.mc, 0.5)}" stroke-width="1" fill="none"><path d="M128 62 L128 84 M120 70 L136 70"/><path d="M92 136 L102 146 L96 154 M164 136 L154 146 L160 154"/></g>`,
      4: `<path d="M94 132 L118 140 M96 142 L118 146 M162 132 L138 140 M160 142 L138 146" stroke="${b.mc}" stroke-width="4" stroke-linecap="round" opacity=".85"/>`,
      5: [[84, 96], [90, 106], [84, 116], [172, 96], [166, 106], [172, 116], [96, 88], [160, 88], [100, 150], [156, 150]].map(([x, y]) => `<path d="M${x - 5} ${y} Q${x} ${y - 7} ${x + 5} ${y} Q${x} ${y - 2} ${x - 5} ${y}Z" fill="${b.mc}" opacity=".65"/>`).join(""),
    };
    s += MK[b.mk] || "";
    // --- ojos ---
    const EYES = [
      "M95 119 Q108 107 121 118 Q108 127 95 119Z",
      "M96 118 Q108 106 120 118 Q108 130 96 118Z",
      "M95 121 Q108 109 122 115 Q111 125 95 121Z",
      "M96 116 Q108 111 121 118 Q108 127 96 116Z",
    ];
    const LID = ["M94 119 Q108 106 122 117", "M95 118 Q108 105 121 117", "M94 121 Q108 108 123 114", "M95 116 Q108 110 122 117"];
    const ep = EYES[b.ey] || EYES[0];
    const eye = `<clipPath id="ce"><path d="${ep}"/></clipPath><path d="${ep}" fill="#f6f2ea"/>
      <g clip-path="url(#ce)">${b.gl ? `<circle cx="108" cy="118" r="9" fill="${b.ec}" filter="url(#fb)"/>` : ""}<circle cx="108" cy="118" r="6.5" fill="url(#gi)"/><circle cx="108" cy="118" r="3" fill="#0a0806"/><path d="M95 112 Q108 104 122 113 L122 108 L95 108Z" fill="${dk(sk, 0.4)}" opacity=".25"/></g>
      <circle cx="110.5" cy="115.5" r="1.8" fill="#fff"/>
      <path d="${LID[b.ey] || LID[0]}" fill="none" stroke="${dk(hc, 0.5)}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<g>${eye}</g><g ${MIR}>${eye.replace('id="ce"', 'id="ce2"').replace("url(#ce)", "url(#ce2)")}</g>`;
    if (b.gl) s += `<circle cx="108" cy="118" r="10" fill="${b.ec}" opacity=".35" filter="url(#fb)"/><circle cx="148" cy="118" r="10" fill="${b.ec}" opacity=".35" filter="url(#fb)"/>`;
    // cejas
    const BR = ["M95 104 Q108 97 121 102", "M94 107 Q105 92 121 101", "M95 99 Q110 101 122 108"][b.br] || "";
    const brow = `<path d="${BR}" stroke="${dk(hc, 0.2)}" stroke-width="4.2" stroke-linecap="round" fill="none"/>`;
    s += `<g>${brow}</g><g ${MIR}>${brow}</g>`;
    // nariz
    s += [
      `<path d="M126 122 Q121 140 127 145 Q133 146 137 141" stroke="${dk(sk, 0.35)}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"/><ellipse cx="131" cy="140" rx="6" ry="3" fill="${dk(sk, 0.3)}" opacity=".2"/>`,
      `<path d="M124 120 Q118 142 124 147 Q131 150 138 147 Q142 142 134 122" stroke="${dk(sk, 0.35)}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>`,
      `<path d="M127 128 Q124 139 129 141 Q133 141 134 138" stroke="${dk(sk, 0.35)}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/>`,
    ][b.no] || "";
    // boca
    s += [
      `<path d="M115 157 Q128 161 141 157" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
      `<path d="M113 154 Q128 167 143 154" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M118 162 Q128 165 138 162" stroke="${dk(lip, 0.2)}" stroke-width="1" fill="none" opacity=".5"/>`,
      `<path d="M115 158 Q130 161 143 151" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
      `<path d="M112 153 Q128 172 144 153 Q128 158 112 153Z" fill="${dk(lip, 0.55)}"/><path d="M116 155 Q128 159 140 155 L139 158 Q128 161 117 158Z" fill="#f4f0e8"/>`,
    ][b.mo] || "";
    if (b.tu) s += `<path d="M112 160 Q108 146 114 138 Q114 150 118 158Z" fill="#f4ecd8" stroke="#a89878"/><path d="M144 160 Q148 146 142 138 Q142 150 138 158Z" fill="#f4ecd8" stroke="#a89878"/>`;
    // barba
    s += [
      "",
      `<path d="M84 128 C86 168 108 186 128 188 C148 186 170 168 172 128 C168 160 150 174 128 174 C106 174 88 160 84 128Z" fill="${hc}" opacity=".35"/>`,
      `<path d="M82 126 C86 172 108 194 128 196 C148 194 170 172 174 126 C166 156 152 166 140 164 Q128 172 116 164 C104 166 90 156 82 126Z" fill="url(#gh)"/><path d="M108 152 Q128 144 148 152 Q140 158 128 156 Q116 158 108 152Z" fill="url(#gh)"/>`,
      `<path d="M80 124 C82 172 100 214 128 240 C156 214 174 172 176 124 C168 156 152 166 140 164 Q128 172 116 164 C104 166 88 156 80 124Z" fill="url(#gh)"/><path d="M108 152 Q128 142 148 152 Q140 158 128 156 Q116 158 108 152Z" fill="url(#gh)"/><path d="M128 200 L128 236 M118 196 Q122 214 118 230 M138 196 Q134 214 138 230" stroke="${hcD}" stroke-width="2" fill="none" opacity=".6"/><circle cx="128" cy="238" r="5" fill="#c0a040"/>`,
      `<path d="M114 168 Q128 196 142 168 Q128 176 114 168Z" fill="url(#gh)"/><path d="M110 152 Q128 146 146 152 Q138 156 128 155 Q118 156 110 152Z" fill="url(#gh)"/>`,
    ][b.bd] || "";
    // pelo delante
    const HF = {
      1: "M76 114 C70 64 100 42 128 42 C158 42 188 64 180 114 C176 92 166 76 150 70 C138 80 112 82 96 74 C86 84 80 98 76 114Z",
      2: "M74 118 C66 62 98 38 128 38 C160 38 192 62 182 118 C178 98 172 86 164 80 C160 98 146 102 140 90 C134 104 116 106 112 92 C104 104 90 102 88 86 C82 96 78 106 74 118Z",
      3: "M76 120 C70 68 100 42 128 42 C158 42 188 68 180 120 C174 90 158 68 132 64 C120 80 104 82 92 84 C84 94 78 106 76 120Z",
      4: "M76 114 C70 62 100 40 128 40 C158 40 188 62 180 114 C178 96 172 84 166 76 C150 66 112 64 96 76 C86 86 80 98 76 114Z",
      6: "M76 114 C70 64 100 44 128 44 C158 44 188 64 180 114 C176 94 166 78 152 72 C138 66 118 66 104 72 C90 78 80 94 76 114Z",
      7: "M76 116 C70 64 100 42 128 42 C158 42 188 64 180 116 C176 92 164 72 130 66 L128 76 L126 66 C92 72 80 92 76 116Z",
      9: "M74 120 C66 62 98 38 130 38 C164 38 194 66 182 124 C180 96 168 78 150 70 C130 90 98 92 86 80 C80 92 76 104 74 120Z",
    };
    if (b.cl === 2) { if (b.ha && b.ha !== 8) s += `<path d="M90 76 C104 60 152 60 166 76 C152 72 140 82 128 80 C114 84 102 72 90 76Z" fill="url(#gh)"/>`; }
    else {
      if (HF[b.ha]) s += `<path d="${HF[b.ha]}" fill="url(#gh)"/><path d="${HF[b.ha]}" fill="none" stroke="${hcD}" stroke-opacity=".45" stroke-width="1.5"/><path d="M104 54 Q128 46 152 56" stroke="${hcL}" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`;
      if (b.ha === 5) { let cl = ""; for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.05 + i * 0.09); cl += `<circle cx="${(128 + 56 * Math.cos(a)).toFixed(1)}" cy="${(108 + 58 * Math.sin(a)).toFixed(1)}" r="${16 + (i % 3) * 3}" fill="url(#gh)"/>`; } s += cl + `<path d="M84 96 Q100 72 128 74 Q156 72 172 96" fill="none" stroke="${hcD}" stroke-opacity=".4" stroke-width="2"/>`; }
      if (b.ha === 6) s += `<circle cx="128" cy="34" r="20" fill="url(#gh)" stroke="${hcD}" stroke-opacity=".5"/><path d="M114 40 Q128 46 142 40" stroke="${c2}" stroke-width="3" fill="none"/>`;
      if (b.ha === 7) { const br = (x) => Array.from({ length: 7 }, (_, i) => `<ellipse cx="${x}" cy="${130 + i * 15}" rx="8" ry="9" fill="url(#gh)" stroke="${hcD}" stroke-opacity=".5"/>`).join(""); s += br(80) + br(176); }
      if (b.ha === 8) s += `<path d="M78 112 C74 70 100 46 128 46 C156 46 182 70 178 112 C170 90 150 78 128 78 C106 78 86 90 78 112Z" fill="${hc}" opacity=".28"/><path d="M114 76 C110 42 118 22 128 14 C138 22 146 42 142 76 C136 68 120 68 114 76Z" fill="url(#gh)" stroke="${hcD}" stroke-opacity=".5"/>`;
    }
    // orejas bestiales (arriba)
    if (b.ea === "b") s += `<g><path d="M84 80 L90 26 L118 62 Z" fill="url(#gh)"/><path d="M92 70 L94 40 L110 62Z" fill="${lt(sk, 0.1)}" opacity=".8"/></g><g ${MIR}><path d="M84 80 L90 26 L118 62 Z" fill="url(#gh)"/><path d="M92 70 L94 40 L110 62Z" fill="${lt(sk, 0.1)}" opacity=".8"/></g>`;
    // cuernos
    const HO = {
      1: `<path d="M88 76 C60 58 40 80 46 106 C50 122 68 124 74 110 C64 104 60 92 68 84 C76 78 86 84 92 88Z" fill="url(#gho)" stroke="${dk(b.hoc, 0.5)}"/><path d="M60 82 Q56 96 64 104 M70 76 Q64 90 72 98" stroke="${dk(b.hoc, 0.5)}" fill="none" opacity=".6"/>`,
      2: `<path d="M94 68 C86 44 88 22 102 4 C100 28 106 48 114 62Z" fill="url(#gho)" stroke="${dk(b.hoc, 0.5)}"/>`,
      3: `<g stroke="${b.hoc}" stroke-width="6" stroke-linecap="round" fill="none"><path d="M96 62 C88 40 76 26 70 8"/><path d="M84 32 L62 24 M78 20 L86 4 M90 48 L70 46"/></g><g stroke="${lt(b.hoc, 0.35)}" stroke-width="2" stroke-linecap="round" fill="none"><path d="M96 62 C88 40 76 26 70 8"/></g>`,
      4: `<path d="M98 62 C96 50 100 42 108 38 C106 46 108 54 112 60Z" fill="url(#gho)" stroke="${dk(b.hoc, 0.5)}"/>`,
    };
    if (HO[b.ho]) s += `<g>${HO[b.ho]}</g><g ${MIR}>${HO[b.ho]}</g>`;
    // accesorios
    s += [
      "",
      `<path d="M80 86 Q128 62 176 86" stroke="#d9b24a" stroke-width="4" fill="none"/><path d="M128 66 l7 9 -7 9 -7 -9z" fill="${c2 === "#d9a441" ? "#5ab0ff" : c2}" stroke="#d9b24a" stroke-width="2"/>`,
      `<circle cx="78" cy="140" r="5" fill="none" stroke="#e0c050" stroke-width="2.5"/><circle cx="178" cy="140" r="5" fill="none" stroke="#e0c050" stroke-width="2.5"/>`,
      `<path d="M140 108 Q148 104 160 108 Q162 122 150 128 Q138 124 140 108Z" fill="#14100c"/><path d="M84 88 L182 118" stroke="#14100c" stroke-width="3"/>`,
      [[92, 70, "#ff8ab0"], [110, 56, "#ffe06a"], [128, 52, "#ffffff"], [146, 56, "#ff8ab0"], [164, 70, "#9ad0ff"]].map(([x, y, c]) => `<g>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + 5 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(y + 5 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="4" fill="${c}"/>`).join("")}<circle cx="${x}" cy="${y}" r="2.6" fill="#ffd040"/></g>`).join("") + `<path d="M88 74 Q128 48 168 74" stroke="#4a8a3a" stroke-width="3" fill="none"/>`,
      `<g fill="#1a2a3a" stroke="#c09040" stroke-width="3"><circle cx="106" cy="76" r="13"/><circle cx="150" cy="76" r="13"/></g><circle cx="106" cy="76" r="8" fill="#5ab0ff" opacity=".6"/><circle cx="150" cy="76" r="8" fill="#5ab0ff" opacity=".6"/><path d="M119 76 L137 76 M80 78 L93 76 M163 76 L178 78" stroke="#6a4a2a" stroke-width="4"/>`,
      `<path d="M96 66 L98 40 L112 54 L128 34 L144 54 L158 40 L160 66 Q128 58 96 66Z" fill="#e0b84a" stroke="#8a6a1a" stroke-width="2"/><circle cx="128" cy="54" r="4" fill="#d02a3a"/><circle cx="108" cy="58" r="2.5" fill="#3a8ad0"/><circle cx="148" cy="58" r="2.5" fill="#3a8ad0"/>`,
    ][b.ac] || "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">${D}${s}</svg>`;
  }
  const svgURL = (b) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgOf(b));

  // Apariencia del asistente (textos de LOOK/ACCESORIOS) -> piezas del creador. Lo no elegido usa el preset de la raza.
  const LK = {
    ha: { Calvo: 0, Rapado: 0, Corto: 1, "Flequillo largo": 2, Largo: 3, Liso: 3, Ondulado: 3, Coleta: 4, Rizado: 5, Moño: 6, Trenzado: 7, Rastas: 7, Cresta: 8, "Melena salvaje": 9 },
    hc: { Negro: "#1a1410", Castaño: "#6a4224", Rubio: "#e8d8a0", Pelirrojo: "#a8442a", Blanco: "#f4f0e8", Plateado: "#c8ccd8", Gris: "#8a8a90", Azul: "#2a6a90", Verde: "#4a7a30", Violeta: "#5a3aa0", Rosa: "#c06ab0", Dorado: "#d08a3a", Bicolor: "#b02a3a" },
    ec: { Marrones: "#6a4a2a", Negros: "#3a2a1a", Azules: "#3a7ac0", Verdes: "#3aa060", Grises: "#a0a0a8", Ámbar: "#d08a20", Dorados: "#ffcc30", Violetas: "#9a4aff", Rojos: "#c02030", Plateados: "#8ab0d0", "Uno de cada color": "#40c0ff", "Brillan en la oscuridad": "#40c0ff" },
    sk: { Pálida: "#f6dcc8", Clara: "#f0c8a8", Trigueña: "#e0b48a", Morena: "#c98e64", Bronceada: "#a06a44", Oscura: "#6e4428", Verdosa: "#6a8a3a", Azulada: "#8ad0d8", Grisácea: "#8a96a0", "De corteza": "#8a6a44", Metálica: "#8a96a0" },
    cl: { "Armadura pesada": 1, "Capa de viajero": 2, "Estilo ninja": 2, "Ropa de explorador": 2, "Túnica de mago": 3, "Estilo gótico": 3, "Armadura ligera": 4, "Estilo pirata": 4, "Ropa de cazador": 4 },
    col: { Negro: "#1e2230", Blanco: "#e8e0d0", Rojo: "#8a1e24", Carmesí: "#6a1e24", Azul: "#2a3a6a", Verde: "#2a5a3a", Dorado: "#b08a3a", Plateado: "#8a8a96", Morado: "#4a2a6a", Marrón: "#5a4028", Gris: "#6a6a72" },
    rasgo: { "Cicatriz en la cara": { mk: 2 }, "Quemadura antigua": { mk: 2 }, Tatuajes: { mk: 4 }, Pecas: { mk: 1 }, "Runas en la piel": { mk: 3 }, Colmillos: { tu: 1 }, "Cuernos pequeños": { ho: 4 }, "Ojo cubierto": { ac: 3 } },
    ac: { Diadema: 1, Pendientes: 2, "Parche en el ojo": 3, "Flor en el pelo": 4, Gafas: 5 },
  };
  function bFromLook(raza, L = {}, acc = []) {
    const b = bOf(raza);
    if (L.pelo_tipo in LK.ha) b.ha = LK.ha[L.pelo_tipo];
    if (LK.hc[L.pelo_color]) b.hc = LK.hc[L.pelo_color];
    if (LK.ec[L.ojos]) { b.ec = LK.ec[L.ojos]; if (L.ojos === "Brillan en la oscuridad") b.gl = 1; }
    if (LK.sk[L.piel]) b.sk = LK.sk[L.piel];
    if (L.piel === "Con escamas") b.mk = 5;
    if (L.ropa) b.cl = LK.cl[L.ropa] || 0;
    if (L.ropa_color) { const [a, c] = L.ropa_color.split(" y ").map((s) => s[0].toUpperCase() + s.slice(1)); if (LK.col[a]) b.c1 = LK.col[a]; if (LK.col[c]) b.c2 = LK.col[c]; }
    Object.assign(b, LK.rasgo[L.rasgo] || {});
    const a = acc.find((x) => x in LK.ac); if (a) b.ac = LK.ac[a];
    return b;
  }

  // =================================================================
  // 3. Desbloqueos
  // =================================================================
  const AFF = (n) => (G.afinidades || []).some((a) => a.n === n);
  const cls = () => G.g?.clase || "";
  const guild = () => { try { return window.SA_GREMIO?.myGuild?.() || null; } catch (e) { return null; } };
  const evOwn = (k) => ({ halloween: has("Caramelo embrujado") || (G.g.mascotas || []).includes("Gato de calabaza"), invierno: has("Copo de nieve") || (G.g.mascotas || []).includes("Renito de escarcha"), alba: has("Pétalo del Alba") || (G.g.mascotas || []).includes("Pollito solar") })[k];
  const forged = () => { const all = [G.g.arma?.n, ...(G.g.armas || [])].filter(Boolean).map(String); return all.some((n) => /★/.test(n) || /\+(10|[6-9])$/.test(n)); };
  const kills = () => Object.values(G.g.kills || {}).reduce((a, b) => a + b, 0);
  const REG = { alba: "Valle del Alba", verde: "Bosque de Verdemar", llan: "Llanuras Doradas", costa: "Costa Tormenta", esc: "Picos Escarcha", quem: "Tierras Quemadas", viol: "Páramo Violeta", cap: "Capital de Solvaria", lost: "Islas Perdidas" };
  const visited = (r) => !!W().regs[r] || G.g.loc?.r === r;
  const CLN = { guerrero: "Guerrero", mago: "Mago", picaro: "Pícaro", sanador: "Sanador" };

  const BGS = [
    { id: "none", n: () => Lx("Sin fondo", "None"), ok: () => true },
    { id: "noche", n: () => Lx("Cielo estrellado", "Starry sky"), ok: () => true },
    { id: "circulo", n: () => Lx("Círculo alquímico", "Alchemy circle"), ok: () => true },
    { id: "c:#1a2160,#6a2f45", n: () => Lx("Alba púrpura", "Dusk"), ok: () => true },
    { id: "c:#0e2f6a,#0a1a30", n: () => Lx("Azul profundo", "Deep blue"), ok: () => true },
    { id: "c:#5e2214,#1a0a10", n: () => Lx("Brasas", "Embers"), ok: () => true },
    { id: "c:#123d4a,#0a1a20", n: () => Lx("Bosque", "Forest"), ok: () => true },
    ...Object.keys(REG).map((r) => ({ id: "r:" + r, n: () => REG[r], ok: () => visited(r), why: () => Lx(`Visita ${REG[r]}`, `Visit ${REG[r]}`) })),
    { id: "ev:halloween", n: () => Lx("Noche de Brujas", "Halloween"), ok: () => evOwn("halloween"), why: () => Lx("Consigue algo del evento de Halloween", "Get a Halloween event item") },
    { id: "ev:invierno", n: () => Lx("Invierno Estelar", "Winter"), ok: () => evOwn("invierno"), why: () => Lx("Consigue algo del Invierno Estelar", "Get a winter event item") },
    { id: "ev:alba", n: () => Lx("Festival del Alba", "Dawn festival"), ok: () => evOwn("alba"), why: () => Lx("Consigue algo del Festival del Alba", "Get a dawn festival item") },
  ];
  const FRS = [
    { id: "none", n: () => Lx("Sin marco", "None"), ok: () => true },
    { id: "oro", n: () => Lx("Oro sencillo", "Gold"), ok: () => true },
    { id: "plata", n: () => Lx("Plata", "Silver"), ok: () => lvl() >= 5, why: () => Lx("Nivel 5", "Level 5") },
    { id: "runico", n: () => Lx("Rúnico", "Runic"), ok: () => lvl() >= 10, why: () => Lx("Nivel 10", "Level 10") },
    { id: "estelar", n: () => Lx("Estelar", "Stellar"), ok: () => lvl() >= 20, why: () => Lx("Nivel 20", "Level 20") },
    { id: "dragon", n: () => Lx("Dracónico", "Draconic"), ok: () => lvl() >= 30, why: () => Lx("Nivel 30", "Level 30") },
    { id: "leyenda", n: () => Lx("Leyenda", "Legend"), ok: () => lvl() >= 40, why: () => Lx("Nivel 40", "Level 40") },
    ...Object.keys(CLN).map((k) => ({ id: "cl:" + k, n: () => CLN[k], ok: () => cls() === k, why: () => Lx(`Clase ${CLN[k]}`, `${CLN[k]} class`) })),
    { id: "cazador", n: () => Lx("Cazador", "Hunter"), ok: () => kills() >= 50, why: () => Lx("Vence 50 monstruos", "Defeat 50 monsters") },
    { id: "forja", n: () => Lx("Maestro forjador", "Master smith"), ok: forged, why: () => Lx("Arma a +6 o evolucionada", "Weapon +6 or evolved") },
    { id: "gremio", n: () => Lx("Gremio", "Guild"), ok: () => !!guild(), why: () => Lx("Únete a un gremio", "Join a guild") },
    { id: "calabaza", n: () => Lx("Calabaza", "Pumpkin"), ok: () => evOwn("halloween"), why: () => Lx("Evento de Halloween", "Halloween event") },
    { id: "escarcha", n: () => Lx("Escarcha", "Frost"), ok: () => evOwn("invierno"), why: () => Lx("Invierno Estelar", "Winter event") },
    { id: "petalos", n: () => Lx("Pétalos", "Petals"), ok: () => evOwn("alba"), why: () => Lx("Festival del Alba", "Dawn festival") },
  ];
  const AUC = { fuego: "#ff7a2a", agua: "#4ab0ff", tierra: "#c09a4a", aire: "#a8f0e0", rayo: "#ffe24a", luz: "#fff0a0", sombra: "#a060ff", gravedad: "#7a6aff", tiempo: "#6ae0ff", espacio: "#b07aff", creacion: "#ffa0e0", realidad: "#e8e8f0", destino: "#ffd06a", alma: "#6affc0", guerrero: "#ff5a3a", mago: "#7a9aff", picaro: "#6aff9a", sanador: "#b0ffb0", leyenda: "#ffd98a", calabaza: "#ff8a2a", escarcha: "#bfe8ff", petalos: "#ffa8d0", noche: "#8a7aff" };
  const AFFN = { fuego: "Fuego", agua: "Agua", tierra: "Tierra", aire: "Aire", rayo: "Rayo", luz: "Luz", sombra: "Sombra", gravedad: "Gravedad", tiempo: "Tiempo", espacio: "Espacio", creacion: "Creación", realidad: "Realidad", destino: "Destino", alma: "Alma" };
  const AUS = [
    { id: "none", n: () => Lx("Sin aura", "None"), ok: () => true },
    { id: "noche", n: () => Lx("Brillo nocturno", "Night glow"), ok: () => has("Polvo de luna"), why: () => Lx("Consigue Polvo de luna (de noche)", "Get Moon dust at night") },
    ...Object.entries(AFFN).map(([k, n]) => ({ id: k, n: () => n, ok: () => AFF(n), why: () => Lx(`Afinidad de ${n}`, `${n} affinity`) })),
    ...Object.keys(CLN).map((k) => ({ id: k, n: () => CLN[k], ok: () => cls() === k, why: () => Lx(`Clase ${CLN[k]}`, `${CLN[k]} class`) })),
    { id: "calabaza", n: () => Lx("Calabaza", "Pumpkin"), ok: () => evOwn("halloween"), why: () => Lx("Evento de Halloween", "Halloween event") },
    { id: "escarcha", n: () => Lx("Escarcha", "Frost"), ok: () => evOwn("invierno"), why: () => Lx("Invierno Estelar", "Winter event") },
    { id: "petalos", n: () => Lx("Pétalos", "Petals"), ok: () => evOwn("alba"), why: () => Lx("Festival del Alba", "Dawn festival") },
    { id: "leyenda", n: () => Lx("Leyenda dorada", "Golden legend"), ok: () => lvl() >= 35, why: () => Lx("Nivel 35", "Level 35") },
  ];
  // títulos: logros del juego + títulos nuevos
  const ACHN = { sangre: "Primera sangre", cazador: "Cazador", leyenda_caza: "Leyenda de la caza", n10: "Promesa", n25: "Veterano", n50: "Héroe de Solvaria", a1: "Primer año", a2: "Cazador del Eclipse", a3: "Lo que hay debajo", a4: "La verdad de la Cumbre", viajero: "Viajero", amigo: "Amigo de verdad", corazon: "Corazón del grupo", juntos: "Juntos somos más", rico: "Bolsillos llenos", devoto: "Devoto", pistas: "Detective", charlas: "Conocido en todas partes" };
  const CLT = { guerrero: "Filo indomable", mago: "Tejedor de arcanos", picaro: "Sombra sin nombre", sanador: "Mano de la aurora" };
  const TIS = [
    { id: "", n: () => Lx("Sin título", "No title"), ok: () => true },
    { id: "x:novato", n: () => Lx("Aprendiz de la Academia", "Academy apprentice"), ok: () => true },
    ...Object.entries(ACHN).map(([k, n]) => ({ id: k, n: () => n, ok: () => !!W().ach[k], why: () => Lx("Logro: " + n, "Achievement: " + n) })),
    ...Object.entries(CLT).map(([k, n]) => ({ id: "x:" + k, n: () => n, ok: () => cls() === k, why: () => Lx(`Clase ${CLN[k]}`, `${CLN[k]} class`) })),
    { id: "x:forja", n: () => Lx("Maestro forjador", "Master smith"), ok: forged, why: () => Lx("Arma a +6 o evolucionada", "Weapon +6 or evolved") },
    { id: "x:pesca", n: () => Lx("Pescador de leyenda", "Legendary angler"), ok: () => has("Pez dorado"), why: () => Lx("Pesca un Pez dorado", "Catch a Golden fish") },
    { id: "x:mina", n: () => Lx("Corazón de piedra", "Heart of stone"), ok: () => has("Obsidiana"), why: () => Lx("Mina Obsidiana", "Mine Obsidian") },
    { id: "x:noche", n: () => Lx("Alma nocturna", "Night soul"), ok: () => has("Polvo de luna"), why: () => Lx("Gana de noche", "Win at night") },
    { id: "x:nucleo", n: () => Lx("Cazador de lo raro", "Rare hunter"), ok: () => has("Núcleo de evolución") || forged(), why: () => Lx("Vence a un monstruo raro ✦", "Defeat a rare ✦ monster") },
    { id: "x:gremio", n: () => { const g = guild(); return g ? Lx(`Estandarte de ${g.n || g.name || "su gremio"}`, `Banner of ${g.n || g.name || "the guild"}`) : Lx("Estandarte del gremio", "Guild banner"); }, ok: () => !!guild(), why: () => Lx("Únete a un gremio", "Join a guild") },
    { id: "x:halloween", n: () => Lx("Guardián de la Noche de Brujas", "Halloween guardian"), ok: () => evOwn("halloween"), why: () => Lx("Evento de Halloween", "Halloween event") },
    { id: "x:invierno", n: () => Lx("Hijo del Invierno Estelar", "Child of winter"), ok: () => evOwn("invierno"), why: () => Lx("Invierno Estelar", "Winter event") },
    { id: "x:alba", n: () => Lx("Heraldo del Alba", "Dawn herald"), ok: () => evOwn("alba"), why: () => Lx("Festival del Alba", "Dawn festival") },
  ];
  const titleName = (id) => { const t = TIS.find((x) => x.id === id); return t ? t.n() : ""; };
  // emblemas: iconos que el jugador tiene
  function emblems() {
    const out = [{ id: "", n: Lx("Sin emblema", "None") }, { id: "stat/xp", n: Lx("Estrella", "Star") }, { id: "tab/dioses", n: Lx("Sol", "Sun") }, { id: "tab/magia", n: Lx("Runa", "Rune") }];
    if (cls()) out.push({ id: "cls/" + cls(), n: CLN[cls()] });
    for (const a of G.afinidades || []) { const k = Object.keys(AFFN).find((x) => AFFN[x] === a.n); if (k) out.push({ id: "af/" + k, n: a.n }); }
    if (guild()) out.push({ id: "gr/gremio", n: Lx("Gremio", "Guild") });
    const pets = G.g.mascotas || []; for (const p of pets.slice(0, 8)) { const pa = window.SAI?.path?.(p); if (pa) out.push({ id: pa, n: p }); }
    const w = G.g.arma?.n; const wp = w && window.SAI?.path?.(w); if (wp) out.push({ id: wp, n: String(w).replace(/ \+\d+$/, "") });
    for (const it of ["Núcleo de evolución", "Caramelo embrujado", "Copo de nieve", "Pétalo del Alba", "Pez dorado", "Polvo de luna"]) if (has(it)) { const pa = window.SAI?.path?.(it); if (pa) out.push({ id: pa, n: it }); }
    const seen = new Set(); return out.filter((e) => (seen.has(e.id) ? false : seen.add(e.id)));
  }
  const NCS = [
    { id: "", c: "", n: () => Lx("Normal", "Default"), ok: () => true },
    { id: "#f4efe4", c: "#f4efe4", n: () => Lx("Marfil", "Ivory"), ok: () => true },
    { id: "#8ac8ff", c: "#8ac8ff", n: () => Lx("Cielo", "Sky"), ok: () => lvl() >= 10, why: () => Lx("Nivel 10", "Level 10") },
    { id: "#8ae0a0", c: "#8ae0a0", n: () => Lx("Jade", "Jade"), ok: () => lvl() >= 10, why: () => Lx("Nivel 10", "Level 10") },
    { id: "#ff8a7a", c: "#ff8a7a", n: () => Lx("Carmesí", "Crimson"), ok: () => lvl() >= 20, why: () => Lx("Nivel 20", "Level 20") },
    { id: "#c8a0ff", c: "#c8a0ff", n: () => Lx("Amatista", "Amethyst"), ok: () => lvl() >= 20, why: () => Lx("Nivel 20", "Level 20") },
    { id: "#ffa04a", c: "#ffa04a", n: () => Lx("Calabaza", "Pumpkin"), ok: () => evOwn("halloween"), why: () => Lx("Evento de Halloween", "Halloween event") },
    { id: "rainbow", c: "linear-gradient(90deg,#ff8a7a,#ffd98a,#8ae0a0,#8ac8ff,#c8a0ff)", n: () => Lx("Prisma", "Prism"), ok: () => lvl() >= 40, why: () => Lx("Nivel 40", "Level 40") },
  ];

  // =================================================================
  // 4. Composición en canvas
  // =================================================================
  const imgCache = new Map();
  function load(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise((res, rej) => { const im = new Image(); im.decoding = "async"; im.onload = () => res(im); im.onerror = rej; im.src = src; });
    imgCache.set(src, p); p.catch(() => imgCache.delete(src)); return p;
  }
  let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function bgDraw(x, bg, S) {
    const g0 = x.createRadialGradient(S / 2, S * 0.4, S * 0.1, S / 2, S / 2, S * 0.7); g0.addColorStop(0, "#1a2050"); g0.addColorStop(1, "#060818"); x.fillStyle = g0; x.fillRect(0, 0, S, S);
    if (!bg || bg === "none") return Promise.resolve();
    if (bg.startsWith("c:")) { const [a, b] = bg.slice(2).split(","); const g = x.createLinearGradient(0, 0, S * 0.3, S); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, S, S); return Promise.resolve(); }
    if (bg === "noche" || bg.startsWith("ev:")) {
      const ev = bg.slice(3); const pal = { halloween: ["#3a1450", "#120818", "#ff8a2a"], invierno: ["#1a3c6a", "#0a1430", "#ffffff"], alba: ["#6a2f45", "#2a2d6a", "#ffd0e0"] }[ev] || ["#1a2160", "#05061a", "#ffffff"];
      const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]); x.fillStyle = g; x.fillRect(0, 0, S, S);
      seed = 7; for (let i = 0; i < 70; i++) { x.globalAlpha = 0.3 + rnd() * 0.7; x.fillStyle = pal[2]; const r = rnd() < 0.1 ? 1.6 : 0.8; x.beginPath(); x.arc(rnd() * S, rnd() * S, r * S / 256, 0, 7); x.fill(); }
      x.globalAlpha = 1;
      if (ev === "halloween") { x.fillStyle = "#ffe0a0"; x.shadowColor = "#ffb060"; x.shadowBlur = S * 0.08; x.beginPath(); x.arc(S * 0.78, S * 0.22, S * 0.1, 0, 7); x.fill(); x.shadowBlur = 0; }
      else if (ev === "invierno") { x.fillStyle = "#ffffff"; for (let i = 0; i < 40; i++) { x.globalAlpha = 0.4 + rnd() * 0.5; x.beginPath(); x.arc(rnd() * S, rnd() * S, (1 + rnd() * 2.5) * S / 256, 0, 7); x.fill(); } x.globalAlpha = 1; }
      else if (ev === "alba") { for (let i = 0; i < 22; i++) { x.globalAlpha = 0.5; x.fillStyle = rnd() < 0.5 ? "#ffa8d0" : "#ffd0e0"; x.beginPath(); x.ellipse(rnd() * S, rnd() * S, 5 * S / 256, 3 * S / 256, rnd() * 3, 0, 7); x.fill(); } x.globalAlpha = 1; }
      else { x.fillStyle = "#fff4d0"; x.beginPath(); x.arc(S * 0.76, S * 0.2, S * 0.07, 0, 7); x.fill(); x.fillStyle = pal[0]; x.beginPath(); x.arc(S * 0.79, S * 0.18, S * 0.06, 0, 7); x.fill(); }
      return Promise.resolve();
    }
    if (bg === "circulo") {
      const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.7); g.addColorStop(0, "#232c66"); g.addColorStop(1, "#070a20"); x.fillStyle = g; x.fillRect(0, 0, S, S);
      x.strokeStyle = "rgba(230,196,122,.45)"; x.lineWidth = S / 256; const c = S / 2;
      for (const r of [0.46, 0.42, 0.34, 0.17]) { x.beginPath(); x.arc(c, c, S * r, 0, 7); x.stroke(); }
      const tri = (o) => { x.beginPath(); for (let i = 0; i <= 3; i++) { const a = (o + i * 120) * Math.PI / 180; const px = c + S * 0.34 * Math.cos(a), py = c + S * 0.34 * Math.sin(a); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); };
      tri(-90); tri(90);
      for (let i = 0; i < 48; i++) { const a = i * 7.5 * Math.PI / 180; x.beginPath(); x.moveTo(c + S * 0.42 * Math.cos(a), c + S * 0.42 * Math.sin(a)); x.lineTo(c + S * (i % 4 ? 0.44 : 0.46) * Math.cos(a), c + S * (i % 4 ? 0.44 : 0.46) * Math.sin(a)); x.stroke(); }
      return Promise.resolve();
    }
    if (bg.startsWith("r:")) return load(`bg/${bg.slice(2)}.jpg`).then((im) => { const sc = Math.max(S / im.width, S / im.height) * 1.1; const w = im.width * sc, h = im.height * sc; x.drawImage(im, (S - w) / 2, (S - h) / 2, w, h); const g = x.createRadialGradient(S / 2, S / 2, S * 0.2, S / 2, S / 2, S * 0.75); g.addColorStop(0, "rgba(5,6,26,.05)"); g.addColorStop(1, "rgba(5,6,26,.55)"); x.fillStyle = g; x.fillRect(0, 0, S, S); }).catch(() => {});
    return Promise.resolve();
  }
  function ring(x, S, w, stops, glow) {
    const r = S / 2 - w / 2 - S * 0.004; const g = x.createLinearGradient(0, 0, S, S); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    if (glow) { x.shadowColor = glow; x.shadowBlur = S * 0.04; }
    x.strokeStyle = g; x.lineWidth = w; x.beginPath(); x.arc(S / 2, S / 2, r, 0, 7); x.stroke(); x.shadowBlur = 0; return r;
  }
  const gem = (x, cx, cy, r, c) => { x.save(); x.translate(cx, cy); x.rotate(Math.PI / 4); const g = x.createLinearGradient(-r, -r, r, r); g.addColorStop(0, lt(c, 0.6)); g.addColorStop(0.5, c); g.addColorStop(1, dk(c, 0.5)); x.fillStyle = g; x.strokeStyle = "#f3d690"; x.lineWidth = r * 0.25; x.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4); x.strokeRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4); x.restore(); };
  const around = (n, off, f) => { for (let i = 0; i < n; i++) f((off + i * 360 / n) * Math.PI / 180, i); };
  function frameDraw(x, fr, S) {
    if (!fr || fr === "none") return;
    const c = S / 2, u = S / 256;
    const P = (r, a) => [c + r * Math.cos(a), c + r * Math.sin(a)];
    if (fr === "oro") ring(x, S, 7 * u, ["#fff2c8", "#e6c47a", "#8a6a2a", "#e6c47a"]);
    else if (fr === "plata") ring(x, S, 7 * u, ["#ffffff", "#c8d0dc", "#6a7280", "#c8d0dc"]);
    else if (fr === "runico") { const r = ring(x, S, 9 * u, ["#fff2c8", "#e6c47a", "#7a5a20", "#e6c47a"]); x.strokeStyle = "#3a2a10"; x.lineWidth = 1.4 * u; around(24, 0, (a) => { const [x1, y1] = P(r - 3 * u, a), [x2, y2] = P(r + 3 * u, a); x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); }); x.strokeStyle = "rgba(230,196,122,.6)"; x.lineWidth = 1.2 * u; x.beginPath(); x.arc(c, c, r - 9 * u, 0, 7); x.stroke(); around(4, 45, (a) => { const [px, py] = P(r, a); gem(x, px, py, 7 * u, "#4a8aff"); }); }
    else if (fr === "estelar") { const r = ring(x, S, 8 * u, ["#ffffff", "#9ac8ff", "#3a4a9a", "#d8e8ff"], "#8ac8ff"); x.fillStyle = "#ffffff"; around(8, 0, (a) => { const [px, py] = P(r, a); x.save(); x.translate(px, py); x.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? 2.2 * u : 8 * u; const aa = i * Math.PI / 4; i ? x.lineTo(rr * Math.cos(aa), rr * Math.sin(aa)) : x.moveTo(rr, 0); } x.closePath(); x.shadowColor = "#bfe0ff"; x.shadowBlur = 8 * u; x.fill(); x.restore(); }); }
    else if (fr === "dragon") { const r = ring(x, S, 13 * u, ["#ffcf6a", "#b8451f", "#4a0e0a", "#d8762a"], "#ff6a2a"); x.strokeStyle = "rgba(40,6,4,.65)"; x.lineWidth = 1.3 * u; around(28, 0, (a) => { const [px, py] = P(r, a); x.beginPath(); x.arc(px, py, 5 * u, a + 0.6, a + Math.PI - 0.6); x.stroke(); }); around(4, 0, (a) => { const [px, py] = P(r, a); gem(x, px, py, 9 * u, "#e02030"); }); }
    else if (fr === "leyenda") { ring(x, S, 6 * u, ["#fff2c8", "#e6c47a", "#8a6a2a", "#e6c47a"], "#ffd98a"); x.strokeStyle = "#e6c47a"; x.lineWidth = 2 * u; x.beginPath(); x.arc(c, c, S / 2 - 12 * u, 0, 7); x.stroke(); around(8, 22.5, (a, i) => { const [px, py] = P(S / 2 - 6 * u, a); gem(x, px, py, 6 * u, ["#e02030", "#3a8ad0", "#3ab060", "#a050e0"][i % 4]); }); }
    else if (fr.startsWith("cl:")) {
      const k = fr.slice(3); const col = { guerrero: ["#ffb08a", "#a02a1a", "#3a0a06", "#d0502a"], mago: ["#d0c8ff", "#5a4ad0", "#1a1250", "#8a7aff"], picaro: ["#b0ffc8", "#2a8a4a", "#06200e", "#3ab060"], sanador: ["#ffffff", "#bfe8a0", "#4a8a3a", "#f0fff0"] }[k];
      const r = ring(x, S, 9 * u, col, col[1]);
      if (k === "guerrero") around(4, 45, (a) => { const [px, py] = P(r, a); x.save(); x.translate(px, py); x.rotate(a); x.strokeStyle = "#ffe0c0"; x.lineWidth = 2.4 * u; x.beginPath(); x.moveTo(-6 * u, -6 * u); x.lineTo(6 * u, 6 * u); x.moveTo(6 * u, -6 * u); x.lineTo(-6 * u, 6 * u); x.stroke(); x.restore(); });
      if (k === "mago") around(6, 0, (a) => { const [px, py] = P(r, a); x.fillStyle = "#c8c0ff"; x.shadowColor = "#8a7aff"; x.shadowBlur = 8 * u; x.beginPath(); x.arc(px, py, 4 * u, 0, 7); x.fill(); x.shadowBlur = 0; });
      if (k === "picaro") around(2, 135, (a) => { const [px, py] = P(r, a); x.save(); x.translate(px, py); x.rotate(a + Math.PI / 2); x.fillStyle = "#dff"; x.beginPath(); x.moveTo(0, -12 * u); x.lineTo(3 * u, 4 * u); x.lineTo(-3 * u, 4 * u); x.closePath(); x.fill(); x.fillStyle = "#2a1a10"; x.fillRect(-4 * u, 4 * u, 8 * u, 3 * u); x.restore(); });
      if (k === "sanador") around(10, 0, (a) => { const [px, py] = P(r, a); x.save(); x.translate(px, py); x.rotate(a); x.fillStyle = "#7ac860"; x.beginPath(); x.ellipse(0, 0, 6 * u, 2.8 * u, 0.6, 0, 7); x.fill(); x.restore(); });
    }
    else if (fr === "cazador") { const r = ring(x, S, 9 * u, ["#e8c090", "#8a5a2a", "#3a2010", "#b07a40"]); x.strokeStyle = "#ffe8c0"; x.lineWidth = 2 * u; around(3, -60, (a) => { for (let j = -1; j <= 1; j++) { const [x1, y1] = P(r - 6 * u, a + j * 0.05), [x2, y2] = P(r + 6 * u, a + j * 0.05 + 0.04); x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); } }); }
    else if (fr === "forja") { const r = ring(x, S, 9 * u, ["#ffe08a", "#ff6a1a", "#5a1004", "#ff9a3a"], "#ff6a1a"); seed = 3; x.fillStyle = "#ffd070"; for (let i = 0; i < 26; i++) { const a = rnd() * 7, rr = r + (rnd() - 0.5) * 16 * u; const [px, py] = P(rr, a); x.globalAlpha = 0.5 + rnd() * 0.5; x.beginPath(); x.arc(px, py, (0.8 + rnd() * 1.6) * u, 0, 7); x.fill(); } x.globalAlpha = 1; }
    else if (fr === "gremio") { const r = ring(x, S, 9 * u, ["#e6c47a", "#5a3aa0", "#1a1040", "#e6c47a"]); const [px, py] = P(r, Math.PI / 2); x.save(); x.translate(px, py); x.fillStyle = "#5a3aa0"; x.strokeStyle = "#e6c47a"; x.lineWidth = 2 * u; x.beginPath(); x.moveTo(-11 * u, -12 * u); x.lineTo(11 * u, -12 * u); x.lineTo(11 * u, 2 * u); x.quadraticCurveTo(0, 14 * u, 0, 14 * u); x.quadraticCurveTo(0, 14 * u, -11 * u, 2 * u); x.closePath(); x.fill(); x.stroke(); x.restore(); }
    else if (fr === "calabaza") { const r = ring(x, S, 9 * u, ["#ffb050", "#e05a10", "#3a1404", "#ff8a2a"], "#ff8a2a"); x.strokeStyle = "#3a8a2a"; x.lineWidth = 2.4 * u; around(10, 0, (a) => { const [x1, y1] = P(r, a), [x2, y2] = P(r + 6 * u, a + 0.25); x.beginPath(); x.moveTo(x1, y1); x.quadraticCurveTo(x2, y2, ...P(r - 2 * u, a + 0.32)); x.stroke(); }); around(3, 30, (a) => { const [px, py] = P(r, a); x.fillStyle = "#ff8a1a"; x.beginPath(); x.ellipse(px, py, 8 * u, 6.5 * u, 0, 0, 7); x.fill(); x.fillStyle = "#3a1404"; x.fillRect(px - 1.5 * u, py - 9 * u, 3 * u, 3 * u); }); }
    else if (fr === "escarcha") { const r = ring(x, S, 8 * u, ["#ffffff", "#bfe8ff", "#4a8ac0", "#e8f6ff"], "#bfe8ff"); x.fillStyle = "rgba(230,248,255,.9)"; around(16, 0, (a, i) => { const L2 = (i % 2 ? 7 : 12) * u; const [bx, by] = P(r, a), [tx, ty] = P(r - L2, a); const [l1, l2] = P(r, a - 0.05), [r1, r2] = P(r, a + 0.05); x.beginPath(); x.moveTo(l1, l2); x.lineTo(tx, ty); x.lineTo(r1, r2); x.closePath(); x.fill(); void bx; void by; }); }
    else if (fr === "petalos") { const r = ring(x, S, 7 * u, ["#ffe0ec", "#ff8ab0", "#8a2a50", "#ffc0d8"]); around(12, 0, (a, i) => { const [px, py] = P(r, a); x.save(); x.translate(px, py); x.rotate(a * 2); x.fillStyle = i % 2 ? "#ffa8d0" : "#fff0f6"; x.beginPath(); x.ellipse(0, 0, 6 * u, 3.2 * u, 0, 0, 7); x.fill(); x.restore(); }); }
  }
  async function emblemDraw(x, em, S) {
    if (!em) return; const u = S / 256; const cx = S * 0.83, cy = S * 0.17, r = 25 * u;
    x.fillStyle = "#0b0f2a"; x.strokeStyle = "#e6c47a"; x.lineWidth = 3 * u; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.stroke();
    try { const im = await load(window.SAI?.src ? window.SAI.src(em) : `iconos/${em}.png`); const s = r * 1.7; x.drawImage(im, cx - s / 2, cy - s / 2, s, s); } catch (e) {}
  }
  function srcOf(av, raza) { if (av.m === "img" && av.img) return av.img; if (av.m === "build") return svgURL(av.b || bOf(raza)); return `razas/${av.base || RID(raza)}.png`; }
  async function compose(av, raza, S, cv) {
    cv = cv || document.createElement("canvas"); cv.width = cv.height = S; const x = cv.getContext("2d"); x.clearRect(0, 0, S, S);
    x.save(); x.beginPath(); x.arc(S / 2, S / 2, S / 2, 0, 7); x.clip();
    await bgDraw(x, av.bg, S);
    let im = null; try { im = await load(srcOf(av, raza)); } catch (e) { try { im = await load(`razas/${RID(raza)}.png`); } catch (e2) {} }
    if (im) {
      const off = document.createElement("canvas"); off.width = off.height = S; const o = off.getContext("2d");
      const z = av.z || 1; const sc = Math.max(S / (im.width || S), S / (im.height || S)) * z; const w = (im.width || S) * sc, h = (im.height || S) * sc;
      const f = `hue-rotate(${av.hue || 0}deg) saturate(${av.sat ?? 100}%) brightness(${av.bri ?? 100}%) contrast(${av.con ?? 100}%)`;
      if ("filter" in o && f !== "hue-rotate(0deg) saturate(100%) brightness(100%) contrast(100%)") o.filter = f;
      o.drawImage(im, (S - w) / 2 + (av.x || 0) / 100 * S, (S - h) / 2 + (av.y || 0) / 100 * S, w, h); o.filter = "none";
      if (av.fb > 0) { o.globalCompositeOperation = "destination-in"; const k = av.fb / 100; const g = o.createRadialGradient(S / 2, S * 0.46, S * (0.46 - 0.3 * k), S / 2, S * 0.5, S * 0.52); g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(0,0,0,0)"); o.fillStyle = g; o.fillRect(0, 0, S, S); o.globalCompositeOperation = "source-over"; }
      if (av.vg > 0) { const g = o.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.55); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${av.vg / 100})`); o.fillStyle = g; o.fillRect(0, 0, S, S); }
      x.drawImage(off, 0, 0);
    }
    x.restore();
    frameDraw(x, av.fr, S);
    await emblemDraw(x, av.em, S);
    let url = ""; try { url = cv.toDataURL("image/webp", 0.92); if (!url.startsWith("data:image/webp")) url = cv.toDataURL("image/png"); } catch (e) { url = ""; }
    return url;
  }

  // =================================================================
  // 5. Retratos en todo el juego
  // =================================================================
  const done = new Map(); // clave -> url
  const pending = new Set();
  const AVK = ["m", "base", "b", "z", "x", "y", "hue", "sat", "bri", "con", "fb", "vg", "bg", "fr", "em"];
  function keyOf(av, raza) { let h = 0; const s = JSON.stringify([raza, AVK.map((k) => av[k]), av.img ? av.img.length + av.img.slice(-40) : 0]); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return "a" + (h >>> 0).toString(36); }
  const charOf = (c) => (G && c && (c.id === G.id) ? G : c);
  // g.av = retrato editado en el juego; c.av = cara diseñada en el asistente de creación.
  const avOf = (c) => { const cc = charOf(c); const av = cc?.g?.av || cc?.av; return av && typeof av === "object" ? av : null; };
  function urlFor(c) {
    const cc = charOf(c); const av = avOf(cc); if (!av) return null;
    const k = keyOf(av, cc.raza); if (done.has(k)) return { k, url: done.get(k) };
    if (!pending.has(k)) {
      pending.add(k);
      compose(av, cc.raza, 256).then((url) => { pending.delete(k); if (!url) return; done.set(k, url); document.querySelectorAll(`img[data-avk="${k}"]`).forEach((i) => { i.src = url; }); document.querySelectorAll(`image[data-avk="${k}"]`).forEach((i) => i.setAttribute("href", url)); }).catch(() => pending.delete(k));
    }
    return { k, url: null };
  }
  const auOf = (c) => { const av = avOf(c); return av && av.au && av.au !== "none" ? av.au : ""; };
  function face(c, cls = "rimg") {
    if (!c) return "";
    const u = urlFor(c); if (!u) return "";
    const au = auOf(c);
    return `<img class="${cls}" ${au ? `data-au="1" style="--au:${AUC[au] || "#ffd98a"}"` : ""} src="${u.url || `razas/${RID(charOf(c).raza)}.png`}" alt="" loading="lazy" draggable="false" data-avk="${u.k}">`;
  }
  const _ri = raceImg;
  const SELF = /\b(hud-img|dimg|hs-img|bt-img)\b|^rimg$/;
  raceImg = function (n, cls = "rimg") {
    try { if (G && G.g && G.g.av && RID(n) === RID(G.raza) && SELF.test(cls)) { const h = face(G, cls); if (h) return h; } } catch (e) {}
    return _ri.apply(this, arguments);
  };
  window.SA_AV = {
    face, url: (c) => { const u = urlFor(c); return u ? { k: u.k, url: u.url || `razas/${RID(charOf(c).raza)}.png` } : null; },
    faceById: (id, cls) => { const c = (Store.all || []).find((x) => x.id === id); return c ? face(c, cls) : ""; },
    titleOf: (c) => { const av = avOf(c); return av?.ti ? titleName(av.ti) : ""; },
    nameColor: (c) => avOf(c)?.nc || "",
    svgOf, compose, open: () => openEditor(),
    freeBgs: BGS.slice(0, 7).map((b) => [b.id, b.n()]),
    lookAv: (raza, look, acc) => ({ m: "build", b: bFromLook(raza, look, acc), z: 1 }),
  };

  // =================================================================
  // 6. Editor
  // =================================================================
  let D = null, tab = "ret", sub = "pelo";
  const dflt = () => ({ m: "race", base: RID(G.raza), z: 1.32, x: 0, y: 0, hue: 0, sat: 100, bri: 100, con: 100, fb: 0, vg: 0, bg: "none", fr: "none", au: "none", ti: "", em: "", nc: "" });
  function openEditor() {
    if (!G?.g) return;
    D = JSON.parse(JSON.stringify(G.g.av || { ...dflt(), ...(G.av || {}) })); if (!D.b) D.b = bOf(G.raza);
    tab = "ret"; draw(); refresh();
  }
  function close() { document.getElementById("sa-ave")?.remove(); D = null; }
  const lock = (it) => (it.ok() ? "" : "lock");
  const chips = (list, cur, attr, extra) => `<div class="ave-g">${list.map((it) => `<button type="button" class="ave-o ${it.id === cur ? "on" : ""} ${lock(it)}" ${it.ok() ? `data-${attr}="${escx(it.id)}"` : "disabled"} title="${escx(it.ok() ? it.n() : (it.why ? it.why() : ""))}">${extra ? extra(it) : ""}<b>${escx(it.n())}</b>${it.ok() ? "" : `<small>🔒 ${escx(it.why ? it.why() : "")}</small>`}</button>`).join("")}</div>`;
  const sw = (list, cur, key) => `<div class="ave-sw">${list.map((c) => `<button type="button" class="${c === cur ? "on" : ""}" style="--c:${c}" data-avb="${key}|${c}" aria-label="${c}"></button>`).join("")}<label class="ave-pick" title="${Lx("Otro color", "Custom")}"><input type="color" value="${/^#[0-9a-f]{6}$/i.test(cur) ? cur : "#888888"}" data-avbc="${key}"></label></div>`;
  const opt = (key, labels) => `<div class="ave-g sm">${labels.map((lb, i) => { const v = typeof lb === "object" ? lb[0] : i; const t = typeof lb === "object" ? lb[1] : lb; return `<button type="button" class="ave-o ${D.b[key] === v ? "on" : ""}" data-avb="${key}|${v}"><b>${escx(t)}</b></button>`; }).join("")}</div>`;
  const rng = (k, min, max, lb, step = 1) => `<label class="ave-r"><span>${lb} <em>${Math.round((D[k] ?? 0) * (k === "z" ? 100 : 1))}${k === "z" ? "%" : ""}</em></span><input type="range" min="${min}" max="${max}" step="${step}" value="${D[k] ?? 0}" data-avr="${k}"></label>`;
  function builder() {
    const S2 = {
      cara: () => `<h4>${Lx("Piel", "Skin")}</h4>${sw(SKIN, D.b.sk, "sk")}<h4>${Lx("Forma", "Shape")}</h4>${opt("fc", [Lx("Ovalada", "Oval"), Lx("Ancha", "Broad"), Lx("Afilada", "Sharp")])}<h4>${Lx("Orejas", "Ears")}</h4>${opt("ea", [["h", Lx("Humanas", "Human")], ["e", Lx("Élficas", "Elven")], ["f", Lx("Feéricas", "Fey")], ["g", Lx("Grandes", "Big")], ["b", Lx("Bestiales", "Beast")], ["n", Lx("Ninguna", "None")]])}<h4>${Lx("Nariz", "Nose")}</h4>${opt("no", [Lx("Recta", "Straight"), Lx("Ancha", "Broad"), Lx("Pequeña", "Small")])}<h4>${Lx("Boca", "Mouth")}</h4>${opt("mo", [Lx("Seria", "Neutral"), Lx("Sonrisa", "Smile"), Lx("Pícara", "Smirk"), Lx("Risa", "Grin")])}<h4>${Lx("Colmillos", "Tusks")}</h4>${opt("tu", [Lx("No", "No"), Lx("Sí", "Yes")])}`,
      ojos: () => `<h4>${Lx("Forma", "Shape")}</h4>${opt("ey", [Lx("Almendrados", "Almond"), Lx("Redondos", "Round"), Lx("Fieros", "Fierce"), Lx("Dulces", "Soft")])}<h4>${Lx("Color", "Color")}</h4>${sw(EYE, D.b.ec, "ec")}<h4>${Lx("Brillo mágico", "Glow")}</h4>${opt("gl", [Lx("No", "No"), Lx("Sí", "Yes")])}<h4>${Lx("Cejas", "Brows")}</h4>${opt("br", [Lx("Rectas", "Straight"), Lx("Arqueadas", "Arched"), Lx("Fruncidas", "Frown")])}`,
      pelo: () => `<h4>${Lx("Peinado", "Hair")}</h4>${opt("ha", [Lx("Calvo", "Bald"), Lx("Corto", "Short"), Lx("Flequillo", "Bangs"), Lx("Largo", "Long"), Lx("Coleta", "Ponytail"), Lx("Salvaje", "Wild"), Lx("Moño", "Bun"), Lx("Trenzas", "Braids"), Lx("Cresta", "Mohawk"), Lx("Melena", "Mane")])}<h4>${Lx("Color", "Color")}</h4>${sw(HAIR, D.b.hc, "hc")}<h4>${Lx("Barba", "Beard")}</h4>${opt("bd", [Lx("Ninguna", "None"), Lx("Sombra", "Stubble"), Lx("Corta", "Short"), Lx("Enana", "Dwarven"), Lx("Perilla", "Goatee")])}`,
      rasgos: () => `<h4>${Lx("Cuernos", "Horns")}</h4>${opt("ho", [Lx("No", "None"), Lx("Curvos", "Curled"), Lx("Rectos", "Straight"), Lx("Astas", "Antlers"), Lx("Pequeños", "Small")])}${sw(["#e8dcc0", "#3a2a20", "#1a1018", "#6a4a2a", "#c0c0d0", "#b03a2a"], D.b.hoc, "hoc")}<h4>${Lx("Marcas", "Marks")}</h4>${opt("mk", [Lx("Ninguna", "None"), Lx("Pecas", "Freckles"), Lx("Cicatriz", "Scar"), Lx("Runas", "Runes"), Lx("Pintura de guerra", "War paint"), Lx("Escamas", "Scales")])}${sw(MARK, D.b.mc, "mc")}<h4>${Lx("Accesorio", "Accessory")}</h4>${opt("ac", [Lx("Nada", "None"), Lx("Diadema", "Circlet"), Lx("Aros", "Earrings"), Lx("Parche", "Eyepatch"), Lx("Flores", "Flowers"), Lx("Gafas", "Goggles"), Lx("Corona", "Crown")])}`,
      ropa: () => `<h4>${Lx("Prenda", "Outfit")}</h4>${opt("cl", [Lx("Túnica", "Tunic"), Lx("Armadura", "Armor"), Lx("Capa con capucha", "Hooded cloak"), Lx("Toga arcana", "Arcane robe"), Lx("Cuero", "Leather")])}<h4>${Lx("Color principal", "Main color")}</h4>${sw(CLOTH, D.b.c1, "c1")}<h4>${Lx("Detalles", "Trim")}</h4>${sw(["#d9a441", "#c0c8d8", "#e02030", "#3a8ad0", "#3ab060", "#a050e0", "#f4f0e8", "#1a1410"], D.b.c2, "c2")}`,
    };
    return `<div class="ave-pre"><span>${Lx("Rasgos de raza:", "Race traits:")}</span>${RAZAS.map((r) => `<button type="button" class="chip" data-avpre="${r.id}">${escx(r.n)}</button>`).join("")}<button type="button" class="chip on" data-avrand="1">🎲 ${Lx("Aleatorio", "Random")}</button></div>
      <div class="ave-sub">${[["cara", Lx("Cara", "Face")], ["ojos", Lx("Ojos", "Eyes")], ["pelo", Lx("Pelo", "Hair")], ["rasgos", Lx("Rasgos", "Traits")], ["ropa", Lx("Ropa", "Outfit")]].map(([k, n]) => `<button type="button" class="chip ${sub === k ? "on" : ""}" data-avsub="${k}">${n}</button>`).join("")}</div>${S2[sub]()}`;
  }
  function body() {
    if (tab === "ret") return `<div class="ave-sub">${[["race", Lx("Retrato pintado", "Painted portrait")], ["build", Lx("Creador por piezas", "Builder")], ["img", Lx("Mi imagen", "My image")]].map(([k, n]) => `<button type="button" class="chip ${D.m === k ? "on" : ""}" data-avm="${k}">${n}</button>`).join("")}</div>
      ${D.m === "race" ? `<p class="note">${Lx("Elige cualquier retrato como base y ajústalo en «Encuadre y color».", "Pick any portrait as a base.")}</p><div class="ave-races">${RAZAS.map((r) => `<button type="button" class="${D.base === r.id ? "on" : ""}" data-avbase="${r.id}" title="${escx(r.n)}"><img src="razas/${r.id}.png" alt=""><small>${escx(r.n)}</small></button>`).join("")}</div>` : ""}
      ${D.m === "build" ? builder() : ""}
      ${D.m === "img" ? `<p class="note">${Lx("Sube una foto o un dibujo (PNG, JPG, WEBP). Se reduce y se guarda en tu personaje; tus amigos la verán.", "Upload a photo or drawing. It is resized and saved with your character.")}</p>
        <label class="btn primary ave-up">📁 ${Lx("Elegir imagen", "Choose image")}<input type="file" accept="image/*" data-avup="1" hidden></label>
        ${D.img ? `<button type="button" class="btn small danger" data-avdelimg="1">${Lx("Quitar imagen", "Remove image")}</button><p class="note">${Lx("Ajusta el zoom y la posición en «Encuadre y color», o arrastra el retrato.", "Adjust zoom and position in the next tab, or drag the portrait.")}</p>` : `<p class="muted">${Lx("Todavía no has subido ninguna.", "No image yet.")}</p>`}` : ""}`;
    if (tab === "enc") return `<p class="note">${Lx("Arrastra el retrato para moverlo; rueda del ratón o pellizco para el zoom.", "Drag to move; scroll to zoom.")}</p>
      ${rng("z", 0.6, 3, Lx("Zoom", "Zoom"), 0.01)}${rng("x", -50, 50, Lx("Izquierda / derecha", "Left / right"))}${rng("y", -50, 50, Lx("Arriba / abajo", "Up / down"))}
      ${rng("hue", -180, 180, Lx("Tono", "Hue"))}${rng("sat", 0, 200, Lx("Saturación", "Saturation"))}${rng("bri", 50, 150, Lx("Brillo", "Brightness"))}${rng("con", 50, 150, Lx("Contraste", "Contrast"))}
      ${rng("fb", 0, 100, Lx("Fundir con el fondo", "Blend into background"))}${rng("vg", 0, 80, Lx("Viñeta", "Vignette"))}
      <div class="row"><button type="button" class="btn small" data-avreset="enc">${Lx("Restablecer encuadre", "Reset framing")}</button></div>`;
    if (tab === "fon") return `<p class="note">${Lx("Los fondos de región se desbloquean al visitarla. Usa «Fundir con el fondo» para que se vea alrededor del retrato.", "Region backgrounds unlock when you visit them.")}</p>${chips(BGS, D.bg, "avbg")}`;
    if (tab === "mar") return chips(FRS, D.fr, "avfr");
    if (tab === "aur") return `<p class="note">${Lx("El aura brilla alrededor de tu retrato en todo el juego.", "The aura glows around your portrait everywhere.")}</p>${chips(AUS, D.au, "avau", (it) => `<i class="ave-dot" style="--c:${AUC[it.id] || "transparent"}"></i>`)}`;
    if (tab === "tit") return `<h4>${Lx("Título", "Title")}</h4>${chips(TIS, D.ti, "avti")}<h4>${Lx("Emblema", "Emblem")}</h4><div class="ave-g em">${emblems().map((e) => `<button type="button" class="ave-o ${D.em === e.id ? "on" : ""}" data-avem="${escx(e.id)}" title="${escx(e.n)}">${e.id ? (window.SAI ? window.SAI.img(e.id, "◆") : "◆") : "∅"}<b>${escx(e.n)}</b></button>`).join("")}</div>
      <h4>${Lx("Color del nombre", "Name color")}</h4><div class="ave-g sm">${NCS.map((n) => `<button type="button" class="ave-o ${D.nc === n.id ? "on" : ""} ${lock(n)}" ${n.ok() ? `data-avnc="${n.id}"` : "disabled"} title="${escx(n.ok() ? n.n() : n.why())}"><i class="ave-dot" style="background:${n.c || "#e6c47a"}"></i><b>${escx(n.n())}</b>${n.ok() ? "" : `<small>🔒 ${escx(n.why())}</small>`}</button>`).join("")}</div>`;
    if (tab === "con") { const sv = G.g.avSaved || []; return `<p class="note">${Lx("Guarda hasta 3 conjuntos para cambiar de aspecto rápido.", "Save up to 3 looks.")}</p><div class="ave-g">${[0, 1, 2].map((i) => `<div class="ave-o slot"><b>${Lx("Conjunto", "Look")} ${i + 1}</b><small>${sv[i] ? escx(sv[i].n || "") : Lx("Vacío", "Empty")}</small><div class="row"><button type="button" class="btn small" data-avsv="${i}">${Lx("Guardar aquí", "Save here")}</button>${sv[i] ? `<button type="button" class="btn small primary" data-avld="${i}">${Lx("Usar", "Use")}</button>` : ""}</div></div>`).join("")}</div>`; }
    return "";
  }
  function draw() {
    let m = document.getElementById("sa-ave");
    if (!m) { m = document.createElement("div"); m.id = "sa-ave"; document.body.appendChild(m); }
    const nc = D.nc === "rainbow" ? "" : D.nc;
    m.innerHTML = `<div class="ave-in" role="dialog" aria-label="${Lx("Personalizar avatar", "Customize avatar")}">
      <div class="ave-h"><b>✦ ${Lx("Personalizar avatar", "Customize avatar")}</b><button type="button" class="link" data-avx="1" aria-label="${Lx("Cerrar", "Close")}">✕</button></div>
      <div class="ave-b"><div class="ave-l"><div class="ave-big ${D.au && D.au !== "none" ? "sa-au" : ""}" style="--au:${AUC[D.au] || "#ffd98a"}"><canvas id="ave-cv" width="512" height="512"></canvas></div>
        <div class="ave-name"><b class="${D.nc === "rainbow" ? "sa-nc-rb" : ""}" style="${nc ? `color:${nc}` : ""}">${escx(G.nombre)}</b>${D.ti ? `<em>«${escx(titleName(D.ti))}»</em>` : ""}</div>
        <div class="ave-minis"><img id="ave-m1" alt=""><img id="ave-m2" alt=""><small>${Lx("Así se verá en el juego", "In-game sizes")}</small></div></div>
      <div class="ave-r1"><div class="ave-tabs">${[["ret", Lx("Retrato", "Portrait")], ["enc", Lx("Encuadre y color", "Framing")], ["fon", Lx("Fondo", "Background")], ["mar", Lx("Marco", "Frame")], ["aur", Lx("Aura", "Aura")], ["tit", Lx("Título y emblema", "Title & emblem")], ["con", Lx("Conjuntos", "Looks")]].map(([k, n]) => `<button type="button" class="chip ${tab === k ? "on" : ""}" data-avtab="${k}">${n}</button>`).join("")}</div>
        <div class="ave-body">${body()}</div></div></div>
      <div class="ave-f"><button type="button" class="btn danger small" data-avclear="1">${Lx("Volver al retrato original", "Reset to default")}</button><span></span><button type="button" class="btn" data-avx="1">${Lx("Cancelar", "Cancel")}</button><button type="button" class="btn primary" data-avsave="1">${Lx("Guardar", "Save")}</button></div></div>`;
    hookDrag();
  }
  let rq = 0;
  function refresh() {
    const my = ++rq; const cv = document.getElementById("ave-cv"); if (!cv || !D) return;
    const tmp = document.createElement("canvas");
    compose(D, G.raza, 512, tmp).then((url) => { if (my !== rq) return; const x = cv.getContext("2d"); x.clearRect(0, 0, 512, 512); x.drawImage(tmp, 0, 0); for (const id of ["ave-m1", "ave-m2"]) { const i = document.getElementById(id); if (i && url) i.src = url; } });
  }
  function rebody() { const b = document.querySelector("#sa-ave .ave-body"); if (b) b.innerHTML = body(); document.querySelectorAll("#sa-ave .ave-tabs .chip").forEach((c) => c.classList.toggle("on", c.dataset.avtab === tab)); const nm = document.querySelector("#sa-ave .ave-name"); if (nm) { const nc = D.nc === "rainbow" ? "" : D.nc; nm.innerHTML = `<b class="${D.nc === "rainbow" ? "sa-nc-rb" : ""}" style="${nc ? `color:${nc}` : ""}">${escx(G.nombre)}</b>${D.ti ? `<em>«${escx(titleName(D.ti))}»</em>` : ""}`; } const big = document.querySelector("#sa-ave .ave-big"); if (big) { big.classList.toggle("sa-au", !!(D.au && D.au !== "none")); big.style.setProperty("--au", AUC[D.au] || "#ffd98a"); } }
  const upd = (fn, body2 = true) => { fn(); if (body2) rebody(); refresh(); };
  function hookDrag() {
    const big = document.querySelector("#sa-ave .ave-big"); if (!big) return;
    let st = null; const pts = new Map();
    big.addEventListener("pointerdown", (e) => { big.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); st = { x: D.x || 0, y: D.y || 0, cx: e.clientX, cy: e.clientY, z: D.z || 1, d: pts.size === 2 ? dist() : 0 }; });
    const dist = () => { const p = [...pts.values()]; return Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); };
    big.addEventListener("pointermove", (e) => {
      if (!st || !pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]); const w = big.clientWidth || 200;
      if (pts.size === 2) { if (!st.d) { st.d = dist(); st.z = D.z || 1; return; } D.z = Math.max(0.6, Math.min(3, st.z * dist() / st.d)); }
      else { D.x = Math.max(-50, Math.min(50, st.x + (e.clientX - st.cx) / w * 100)); D.y = Math.max(-50, Math.min(50, st.y + (e.clientY - st.cy) / w * 100)); }
      refresh();
    });
    const end = (e) => { pts.delete(e.pointerId); if (!pts.size) { st = null; if (tab === "enc") rebody(); } else st = { x: D.x || 0, y: D.y || 0, cx: [...pts.values()][0][0], cy: [...pts.values()][0][1], z: D.z || 1, d: 0 }; };
    big.addEventListener("pointerup", end); big.addEventListener("pointercancel", end);
    big.addEventListener("wheel", (e) => { e.preventDefault(); D.z = Math.max(0.6, Math.min(3, (D.z || 1) * (e.deltaY < 0 ? 1.06 : 0.94))); refresh(); if (tab === "enc") rebody(); }, { passive: false });
  }
  async function upload(file) {
    if (!file || !/^image\//.test(file.type)) return toast(Lx("Eso no parece una imagen.", "Not an image."));
    const url = URL.createObjectURL(file);
    try {
      const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const M = 320; const sc = Math.min(1, M / Math.max(im.width, im.height)); const w = Math.round(im.width * sc), h = Math.round(im.height * sc);
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(im, 0, 0, w, h);
      let q = 0.85, out = cv.toDataURL("image/webp", q); if (!out.startsWith("data:image/webp")) out = cv.toDataURL("image/jpeg", 0.85);
      while (out.length > 60000 && q > 0.4) { q -= 0.12; out = cv.toDataURL(out.startsWith("data:image/webp") ? "image/webp" : "image/jpeg", q); }
      D.img = out; D.m = "img"; D.z = 1; D.x = 0; D.y = 0; rebody(); refresh();
    } catch (e) { toast(Lx("No se pudo leer la imagen.", "Couldn't read the image.")); }
    finally { URL.revokeObjectURL(url); }
  }
  function randB() {
    const p = (a) => a[Math.floor(Math.random() * a.length)]; const r = RAZAS[Math.floor(Math.random() * RAZAS.length)].id;
    D.b = { ...bOf(r), sk: Math.random() < 0.6 ? bOf(r).sk : p(SKIN), ey: p([0, 1, 2, 3]), ec: p(EYE), br: p([0, 1, 2]), no: p([0, 1, 2]), mo: p([0, 1, 2, 3]), ha: p([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), hc: p(HAIR), cl: p([0, 1, 2, 3, 4]), c1: p(CLOTH), c2: p(["#d9a441", "#c0c8d8", "#e02030", "#3a8ad0", "#3ab060", "#a050e0"]) };
  }
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest?.("[data-avopen]"); if (t) { ev.preventDefault(); openEditor(); return; }
    if (!D || !ev.target.closest?.("#sa-ave")) return;
    const q = (a) => ev.target.closest(`[data-${a}]`);
    let e;
    if (ev.target.id === "sa-ave" || q("avx")) return close();
    if ((e = q("avtab"))) { tab = e.dataset.avtab; return rebody(); }
    if ((e = q("avsub"))) { sub = e.dataset.avsub; return rebody(); }
    if ((e = q("avm"))) return upd(() => { D.m = e.dataset.avm; if (D.m === "race" && (D.z || 1) < 1.25) D.z = 1.32; if (D.m === "build") { D.z = 1.15; D.y = 6; } if (D.m === "img") { D.z = 1; D.y = 0; } });
    if ((e = q("avbase"))) return upd(() => { D.base = e.dataset.avbase; D.m = "race"; });
    if ((e = q("avpre"))) return upd(() => { D.b = { ...D.b, ...BDEF, cl: D.b.cl, c1: D.b.c1, c2: D.b.c2, ...(PRESET[e.dataset.avpre] || {}) }; });
    if (q("avrand")) return upd(randB);
    if ((e = q("avb"))) return upd(() => { const [k, v] = e.dataset.avb.split("|"); D.b[k] = /^-?\d+$/.test(v) ? +v : v; });
    if ((e = q("avbg"))) return upd(() => { D.bg = e.dataset.avbg; if (D.bg !== "none" && D.m === "race" && !D.fb) D.fb = 35; });
    if ((e = q("avfr"))) return upd(() => { D.fr = e.dataset.avfr; });
    if ((e = q("avau"))) return upd(() => { D.au = e.dataset.avau; });
    if ((e = q("avti"))) return upd(() => { D.ti = e.dataset.avti; }, true);
    if ((e = q("avem"))) return upd(() => { D.em = e.dataset.avem; });
    if ((e = q("avnc"))) return upd(() => { D.nc = e.dataset.avnc; });
    if ((e = q("avreset"))) return upd(() => Object.assign(D, { z: D.m === "race" ? 1.32 : D.m === "build" ? 1.15 : 1, x: 0, y: D.m === "build" ? 6 : 0, hue: 0, sat: 100, bri: 100, con: 100, fb: 0, vg: 0 }));
    if (q("avdelimg")) return upd(() => { delete D.img; D.m = "race"; });
    if ((e = q("avsv"))) { const i = +e.dataset.avsv; G.g.avSaved = G.g.avSaved || []; const c = JSON.parse(JSON.stringify(D)); delete c.img; c.n = `${{ race: Lx("Retrato", "Portrait"), build: Lx("Creador", "Builder"), img: Lx("Mi imagen", "Image") }[D.m]} · ${titleName(D.ti) || Lx("sin título", "no title")}`; G.g.avSaved[i] = c; save(); toast(Lx("Conjunto guardado.", "Look saved.")); return rebody(); }
    if ((e = q("avld"))) { const c = (G.g.avSaved || [])[+e.dataset.avld]; if (c) return upd(() => { const img = D.img; D = { ...JSON.parse(JSON.stringify(c)), img }; if (D.m === "img" && !img) D.m = "race"; delete D.n; }); return; }
    if (q("avclear")) { delete G.g.av; save(); close(); render(); toast(Lx("Retrato original restaurado.", "Default portrait restored.")); return; }
    if (q("avsave")) {
      const out = { ...D }; if (out.m !== "img") delete out.img;
      if (out.m !== "build") delete out.b;
      G.g.av = out;
      const w = W(); if (out.ti && ACHN[out.ti]) w.title = out.ti; else w.title = null;
      save(); close(); render(); toast(Lx("¡Avatar guardado!", "Avatar saved!"));
    }
  });
  document.addEventListener("input", (ev) => {
    if (!D) return; const r = ev.target.closest?.("[data-avr]"); if (r) { D[r.dataset.avr] = +r.value; const em = r.parentElement.querySelector("em"); if (em) em.textContent = Math.round(+r.value * (r.dataset.avr === "z" ? 100 : 1)) + (r.dataset.avr === "z" ? "%" : ""); refresh(); return; }
    const c = ev.target.closest?.("[data-avbc]"); if (c) { D.b[c.dataset.avbc] = c.value; refresh(); }
  });
  document.addEventListener("change", (ev) => { if (!D) return; const u = ev.target.closest?.("[data-avup]"); if (u && u.files?.[0]) upload(u.files[0]); const c = ev.target.closest?.("[data-avbc]"); if (c) rebody(); });
  document.addEventListener("keydown", (ev) => { if (D && ev.key === "Escape") close(); });

  // =================================================================
  // 7. Después de pintar: botón, aura grande, título y color del nombre
  // =================================================================
  function post() {
    if (!G?.g) return; const av = G.g.av;
    // botón en Personaje (y clic en el retrato grande)
    const cap = document.querySelector(".sa-dash .sa-dl .sa-cap");
    if (cap && !cap.querySelector("[data-avopen]")) cap.insertAdjacentHTML("beforeend", `<button type="button" class="btn small primary sa-avbtn" data-avopen="1">🎨 ${Lx("Personalizar avatar", "Customize avatar")}</button>`);
    const hs = document.querySelector(".herosum .hs-por > div");
    if (hs && !document.querySelector(".sa-dash") && !hs.querySelector("[data-avopen]")) hs.insertAdjacentHTML("beforeend", `<button type="button" class="btn small primary sa-avbtn" data-avopen="1">🎨 ${Lx("Personalizar avatar", "Customize avatar")}</button>`);
    document.querySelectorAll(".dpor .dimg").forEach((i) => { i.setAttribute("data-avopen", "1"); i.style.cursor = "pointer"; i.title = Lx("Personalizar avatar", "Customize avatar"); });
    // aura grande
    document.querySelectorAll(".dpor .daura").forEach((a) => { const au = av?.au && av.au !== "none" ? av.au : ""; a.classList.toggle("sa-au-big", !!au); if (au) a.style.setProperty("--au", AUC[au]); else a.style.removeProperty("--au"); });
    // título y color del nombre en el HUD
    const who = document.querySelector(".hud .who"); if (who && av) {
      const nb = who.querySelector(":scope > b"); if (nb) { nb.classList.toggle("sa-nc-rb", av.nc === "rainbow"); nb.style.color = av.nc && av.nc !== "rainbow" ? av.nc : ""; }
      const t = av.ti && !ACHN[av.ti] ? titleName(av.ti) : ""; let em = who.querySelector("em.ttl");
      if (t) { if (!em) { em = document.createElement("em"); em.className = "ttl"; nb?.after(em); } em.textContent = `«${t}»`; }
      else if (em && av.ti === "") em.remove();
    }
    // título bajo el nombre en el panel de personaje
    const h2 = document.querySelector(".sa-dash .herosum h2, .herosum .hs-por h2");
    if (h2 && av) { h2.classList.toggle("sa-nc-rb", av.nc === "rainbow"); h2.style.color = av.nc && av.nc !== "rainbow" ? av.nc : ""; let em = h2.parentElement.querySelector("em.sa-avti"); const t = av.ti ? titleName(av.ti) : ""; if (t) { if (!em) { em = document.createElement("em"); em.className = "sa-avti"; h2.after(em); } em.textContent = `«${t}»`; } else em?.remove(); }
  }
  const _r = render;
  render = function () { const o = _r.apply(this, arguments); try { post(); } catch (e) { console.warn("avatar:", e); } return o; };

  // =================================================================
  // 8. Estilos
  // =================================================================
  const css = document.createElement("style"); css.id = "sa-avatar";
  css.textContent = `
img[data-avk]{object-fit:cover}
img[data-au]{animation:saAu 2.8s ease-in-out infinite}
@keyframes saAu{0%,100%{filter:drop-shadow(0 0 2px var(--au)) drop-shadow(0 0 7px var(--au))}50%{filter:drop-shadow(0 0 5px var(--au)) drop-shadow(0 0 16px var(--au))}}
.dpor .daura.sa-au-big{inset:-16px;background:conic-gradient(from 0deg,transparent,var(--au) 12%,transparent 30%,var(--au) 46%,transparent 62%,var(--au) 80%,transparent);filter:blur(7px);opacity:.85;animation:aura 6s linear infinite}
.dpor .daura.sa-au-big::after{content:"";position:absolute;inset:-6px;border-radius:50%;background:radial-gradient(circle at 20% 30%,var(--au) 0 2px,transparent 3px),radial-gradient(circle at 78% 22%,#fff 0 1.5px,transparent 2.5px),radial-gradient(circle at 85% 70%,var(--au) 0 2px,transparent 3px),radial-gradient(circle at 30% 85%,#fff 0 1.5px,transparent 2.5px),radial-gradient(circle at 55% 8%,var(--au) 0 2px,transparent 3px);animation:aura 9s linear infinite reverse;filter:none}
.sa-nc-rb{background:linear-gradient(90deg,#ff8a7a,#ffd98a,#8ae0a0,#8ac8ff,#c8a0ff,#ff8a7a);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:saRb 4s linear infinite}
@keyframes saRb{to{background-position:200% 0}}
.sa-avti{display:block;font-family:var(--display);font-size:12.5px;letter-spacing:.06em;color:#e6c47a;font-style:normal;margin-top:2px}
.sa-avbtn{margin-left:auto}
.sa-dash .sa-dl .sa-cap{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

#sa-ave{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:12px;background:#02030cd0;backdrop-filter:blur(4px);animation:saFade .2s both}
.ave-in{width:min(980px,100%);max-height:calc(100vh - 24px);display:flex;flex-direction:column;border:1px solid #e6c47a77;background:radial-gradient(120% 60% at 50% 0%,#1a2160,transparent 70%),linear-gradient(180deg,#0c1132,#070a22);box-shadow:0 0 0 4px #060818,0 0 0 5px #e6c47a33,0 30px 80px #000d;color:var(--ink)}
.ave-h{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #e6c47a33}
.ave-h b{font-family:var(--display);letter-spacing:.1em;color:#f0d48e;font-size:16px}
.ave-h .link{font-size:20px;text-decoration:none}
.ave-b{flex:1;display:grid;grid-template-columns:300px minmax(0,1fr);align-content:start;gap:18px;padding:16px;overflow:auto;min-height:0}
.ave-l{display:flex;flex-direction:column;align-items:center;gap:10px;position:sticky;top:0}
.ave-big{width:260px;height:260px;border-radius:50%;touch-action:none;cursor:grab;position:relative}
.ave-big:active{cursor:grabbing}
.ave-big canvas{width:100%;height:100%;border-radius:50%;display:block;box-shadow:0 10px 30px #000b}
.ave-big.sa-au canvas{animation:saAu 2.8s ease-in-out infinite}
.ave-name{text-align:center}.ave-name b{display:block;font-family:var(--display);font-size:20px;color:#f0d48e;letter-spacing:.05em}.ave-name em{font-family:var(--display);font-size:13px;color:#e6c47a;font-style:normal;letter-spacing:.05em}
.ave-minis{display:flex;align-items:center;gap:10px}.ave-minis img{border-radius:50%;box-shadow:0 0 0 2px #e6c47a}#ave-m1{width:56px;height:56px}#ave-m2{width:26px;height:26px}.ave-minis small{color:var(--muted);font-size:12px}
.ave-r1{min-width:0;display:flex;flex-direction:column;gap:12px}
.ave-tabs,.ave-sub{display:flex;flex-wrap:wrap;gap:6px}
.ave-sub{margin-bottom:8px}
.ave-body h4{margin:12px 0 6px;font-family:var(--display);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#e6c47a;font-weight:500}
.ave-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(132px,100%),1fr));gap:6px}
.ave-g.sm{grid-template-columns:repeat(auto-fill,minmax(min(96px,100%),1fr))}
.ave-g.em{grid-template-columns:repeat(auto-fill,minmax(min(92px,100%),1fr))}
.ave-o{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:40px;padding:7px 8px;border:1px solid #e6c47a33;background:#ffffff07;color:var(--ink);font-family:var(--body);cursor:pointer;text-align:center}
.ave-o b{font-size:13px;font-weight:600}.ave-o small{font-size:11px;color:var(--muted)}
.ave-o:hover:not(:disabled){border-color:#e6c47aaa;background:#e6c47a12}
.ave-o.on{border:1px solid #f3d690;background:linear-gradient(180deg,#5b4420,#2a1d0c);box-shadow:inset 0 0 14px #e6c47a55,0 0 0 1px #f3d690,0 0 12px #e6c47a55;color:#fff4d6}
.ave-o.lock{opacity:.5;cursor:not-allowed}
.ave-o .sai{width:30px;height:30px}
.ave-o.slot{align-items:stretch;text-align:left}
.ave-dot{display:inline-block;width:16px;height:16px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c),inset 0 0 0 1px #ffffff55}
.ave-sw{display:flex;flex-wrap:wrap;gap:6px}
.ave-sw button,.ave-pick{width:28px;height:28px;border-radius:50%;border:2px solid #0008;background:var(--c);cursor:pointer;box-shadow:0 0 0 1px #e6c47a44;padding:0}
.ave-sw button.on{box-shadow:0 0 0 2px #f3d690,0 0 10px #f3d69088}
.ave-pick{position:relative;overflow:hidden;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)}
.ave-pick input{position:absolute;inset:-4px;opacity:0;cursor:pointer;width:40px;height:40px}
.ave-pre{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:10px}.ave-pre span{font-size:12.5px;color:var(--muted);margin-right:4px}.ave-pre .chip{font-size:12px;padding:3px 10px}
.ave-races{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(74px,100%),1fr));gap:8px}
.ave-races button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;border:1px solid transparent;background:none;color:var(--ink-2);cursor:pointer}
.ave-races img{width:62px;height:62px;border-radius:50%}
.ave-races button.on{border-color:#f3d690;background:#e6c47a14}.ave-races small{font-size:11px}
.ave-r{display:block;margin:8px 0}.ave-r span{display:flex;justify-content:space-between;font-size:13.5px;color:var(--ink-2)}.ave-r em{font-style:normal;color:#f0d48e}
.ave-r input{width:100%;accent-color:#e6c47a;padding:0;background:none;border:0}
.ave-up{display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.ave-f{display:flex;align-items:center;gap:8px;padding:12px 16px;border-top:1px solid #e6c47a33}.ave-f span{flex:1}
@media (max-width:760px){
  #sa-ave{padding:0;place-items:stretch}
  .ave-in{max-height:100vh;height:100%}
  .ave-b{grid-template-columns:1fr;padding:12px;gap:12px}
  .ave-l{position:static;flex-direction:row;flex-wrap:wrap;justify-content:center}
  .ave-big{width:180px;height:180px}
  .ave-minis{display:none}
  .ave-g{grid-template-columns:repeat(auto-fill,minmax(min(108px,100%),1fr))}
  .ave-f{flex-wrap:wrap}.ave-f span{display:none}.ave-f .btn{flex:1}
}
@media (prefers-reduced-motion:reduce){img[data-au],.ave-big.sa-au canvas,.dpor .daura.sa-au-big,.sa-nc-rb{animation:none!important}}
`;
  document.head.appendChild(css);
})();
