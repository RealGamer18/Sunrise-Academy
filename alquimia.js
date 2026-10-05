// ===================== ALQUIMIA OSCURA (tema visual) =====================
// Va después de tema.js / menus.js / pulido.js y se pone encima:
// líneas doradas finas sobre azul noche con estrellas, círculos de transmutación,
// esquinas con filigrana, separadores de runas y botones con puntas.
// El color de la nebulosa del fondo cambia según la región (cobre en Tierras Quemadas,
// violeta en el Páramo, etc.).
(function () {
  if (typeof render !== "function") return;
  const enc = (s) => `url("data:image/svg+xml,${encodeURIComponent(s.replace(/\s+/g, " "))}")`;
  const G1 = "#e6c47a"; // oro de línea

  // ---------- Círculo de transmutación ----------
  function circle(col, w) {
    const c = 100; const pt = (r, a) => [c + r * Math.cos((a * Math.PI) / 180), c + r * Math.sin((a * Math.PI) / 180)].map((v) => v.toFixed(2)).join(" ");
    let ticks = ""; for (let i = 0; i < 72; i++) { const a = i * 5; ticks += `M${pt(94, a)}L${pt(i % 6 ? 96 : 98.5, a)}`; }
    const tri = (o) => `M${pt(78, o)}L${pt(78, o + 120)}L${pt(78, o + 240)}Z`;
    const sq = `M${pt(56, 0)}L${pt(56, 90)}L${pt(56, 180)}L${pt(56, 270)}Z`;
    let nodes = ""; for (let i = 0; i < 6; i++) { const [x, y] = pt(78, -90 + i * 60).split(" "); nodes += `<circle cx="${x}" cy="${y}" r="5.5"/>`; }
    let runes = ""; for (let i = 0; i < 12; i++) { const a = i * 30 + 15; const [x, y] = pt(87, a).split(" "); runes += `<g transform="translate(${x} ${y}) rotate(${a + 90})"><path d="M-2.6 -2.4V2.4M-2.6 0H1.8M1.8 -2.4L1.8 2.4M-2.6 -2.4L1.8 2.4"/></g>`; }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="none" stroke="${col}" stroke-width="${w}">
      <circle cx="100" cy="100" r="98.5"/><circle cx="100" cy="100" r="94"/><circle cx="100" cy="100" r="80"/><circle cx="100" cy="100" r="40"/><circle cx="100" cy="100" r="35" stroke-opacity=".6"/>
      <path d="${ticks}" stroke-opacity=".7"/><path d="${tri(-90)}${tri(90)}"/><path d="${sq}" stroke-opacity=".55"/>${nodes}${runes}
      <circle cx="100" cy="100" r="9"/><path d="M100 60V140M60 100H140" stroke-opacity=".35"/></g></svg>`;
  }
  const CIRC = enc(circle(G1, 1.1));
  const CIRC_BIG = enc(circle("#e6c47a", 0.6));

  // ---------- Marco de panel (border-image) ----------
  const corner = `<path d="M1.5 34V1.5H34" stroke-width="1.5"/><path d="M6 26V6H26" stroke-opacity=".55"/>
    <path d="M13 7.5l5.5 5.5-5.5 5.5-5.5-5.5z"/><circle cx="13" cy="13" r="1.4" fill="${G1}"/>
    <path d="M6 34c5 0 8.5-3 8.5-9M34 6c0 5-3 8.5-9 8.5" stroke-opacity=".8"/><path d="M1.5 40v4M40 1.5h4" stroke-opacity=".6"/>`;
  const FR = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="none" stroke="${G1}" stroke-width="1">
    <g>${corner}</g><g transform="rotate(90 50 50)">${corner}</g><g transform="rotate(180 50 50)">${corner}</g><g transform="rotate(270 50 50)">${corner}</g>
    <path d="M34 1.5H66M34 98.5H66M1.5 34V66M98.5 34V66" stroke-opacity=".75"/><path d="M26 6H74M26 94H74M6 26V74M94 26V74" stroke-opacity=".22"/></g></svg>`);

  // ---------- Esquinas pequeñas para tarjetas ----------
  const cn = (rot) => enc(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g transform="rotate(${rot} 9 9)" fill="none" stroke="${G1}"><path d="M1 12V1H12" stroke-width="1.2"/><path d="M5 5l2.5 2.5L5 10 2.5 7.5z" fill="${G1}" fill-opacity=".8" stroke="none"/></g></svg>`);
  const C_TL = cn(0), C_TR = cn(90), C_BR = cn(180), C_BL = cn(270);

  // ---------- Sello central de los paneles ----------
  const SIGIL = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="22" viewBox="0 0 120 22"><g fill="none" stroke="${G1}">
    <path d="M2 11H40M80 11H118" stroke-opacity=".7"/><path d="M40 11l6-4 6 4-6 4z"/><path d="M68 11l6-4 6 4-6 4z"/>
    <circle cx="60" cy="11" r="8.5"/><path d="M60 3.5l6.5 11.3H53.5z" stroke-opacity=".9"/><circle cx="60" cy="11" r="2" fill="${G1}"/></g></svg>`);
  // ---------- Divisor de runas ----------
  const DIV = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="14" viewBox="0 0 64 14"><g fill="none" stroke="${G1}"><path d="M0 7H22M42 7H64" stroke-opacity=".5"/><path d="M32 1.5l5.5 5.5-5.5 5.5-5.5-5.5z"/><path d="M22 7l3-3 3 3-3 3z" fill="${G1}" stroke="none"/><path d="M36 7l3-3 3 3-3 3z" fill="${G1}" stroke="none"/></g></svg>`);

  // ---------- Botones con puntas ----------
  const btn = (fill1, fill2, line, glow) => enc(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="28" viewBox="0 0 60 28"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fill1}"/><stop offset="1" stop-color="${fill2}"/></linearGradient></defs>
    <path d="M10 .75H50L59.25 14 50 27.25H10L.75 14z" fill="url(#g)" stroke="${line}" stroke-width="1"/>
    <path d="M11.5 3.5H48.5L56 14 48.5 24.5H11.5L4 14z" fill="none" stroke="${line}" stroke-opacity="${glow}" stroke-width=".7"/></svg>`);
  // día (Hora dorada)
  const B_N = btn("#5a3560", "#33203f", "#e8b46a", ".4");
  const B_H = btn("#6e4272", "#3d2548", "#ffd38a", ".65");
  const B_P = btn("#ffc766", "#e0773e", "#fff0c4", ".8");
  const B_PH = btn("#ffd47e", "#ec874a", "#ffffff", ".9");
  // noche (combate)
  const B_N0 = btn("#1a2150", "#0b0f2a", "#c9a865", ".35");
  const B_H0 = btn("#232c66", "#10153a", "#f0d48e", ".6");
  const B_P0 = btn("#5b4420", "#2a1d0c", "#f3d690", ".7");
  const B_PH0 = btn("#6e5326", "#33230e", "#ffe3a3", ".9");
  const B_D = btn("#3a1424", "#1a0812", "#e0806a", ".4");

  // ---------- Estrellas ----------
  const STARS = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><g fill="#fff">${Array.from({ length: 46 }, (_, i) => { const x = (i * 97.3) % 320, y = (i * 61.7 + (i % 5) * 37) % 320, r = i % 9 === 0 ? 1.3 : i % 3 === 0 ? 0.8 : 0.5, o = (0.25 + ((i * 13) % 7) / 10).toFixed(2); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill-opacity="${o}"/>`; }).join("")}</g>
    <g fill="#ffe7b0"><path d="M60 40l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill-opacity=".7"/><path d="M250 210l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8z" fill-opacity=".6"/></g></svg>`);

  // ---------- Colores por región (mezcla azul noche + cobre/púrpura) ----------
  const RG = {
    alba: ["#2a2d6a", "#6a2f45", "#e8b98a"], verde: ["#123d4a", "#2a1f5a", "#a8d8a0"], llan: ["#3b3418", "#1d2a62", "#f0d48e"],
    costa: ["#0e2f6a", "#2a1a5c", "#9cc8ff"], esc: ["#1a3c6a", "#2c3a78", "#c8e4ff"], quem: ["#5e2214", "#3c1434", "#f0a070"],
    viol: ["#3a1660", "#62184a", "#e0a0f0"], cap: ["#24286e", "#5a3a18", "#f3d690"], lost: ["#0f3c44", "#3a1a62", "#a0f0e0"],
  };
  function setRegion() {
    try {
      const r = (G?.g?.combat ? G.g.loc.r : (typeof gtab !== "undefined" && gtab === "mapa" ? (gsel.region || G.g.loc.r) : G?.g?.loc?.r)) || "alba";
      const c = RG[r] || RG.alba; const b = document.body;
      b.classList.toggle("sa-night", !!G?.g?.combat || !!document.querySelector(".battle .stage"));
      if (b.dataset.rg === r) return; b.dataset.rg = r;
      b.style.setProperty("--nA", c[0]); b.style.setProperty("--nB", c[1]); b.style.setProperty("--acc", c[2]);
    } catch (e) {}
  }
  // ---------- Horizonte: silueta de la academia (torres, observatorio, faro) ----------
  const win = (x, y, d) => `<rect x="${x}" y="${y}" width="5" height="8" rx="2.5" style="animation-delay:${d}s"/>`;
  const SKYLINE = `<svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <path fill="#5a2e52" fill-opacity=".55" d="M0 220V150L90 118L170 140L260 96L360 138L450 112L520 132L640 100L760 136L850 104L960 140L1060 110L1130 132L1200 120V220Z"/>
    <path fill="#1b0f26" d="M0 220V182Q160 160 320 174T620 170T930 172T1200 178V220Z
      M240 176V134H252V122A28 28 0 0 1 308 122V134H320V176Z M276 94L280 86L284 94Z
      M430 176V128H436V120H444V128H452V120H460V128H468V120H476V128H500V176Z
      M500 176V78L515 40L530 78V176Z M540 176V96H580V48L600 2L620 48V96H660V176Z
      M670 176V78L685 40L700 78V176Z M700 176V128H724V120H732V128H740V120H748V128H756V120H764V128H770V176Z
      M958 176L964 70H982L988 176Z M958 70L973 50L988 70Z
      M120 178L134 146L148 178Z M150 178L160 156L170 178Z M820 176L836 140L852 176Z M856 176L866 152L876 176Z M1080 180L1094 150L1108 180Z"/>
    <circle cx="973" cy="62" r="5" fill="#ffd77e" class="sa-lamp"/>
    <g fill="#ffc766" class="sa-win">${win(511, 96, 0)}${win(511, 128, 1.7)}${win(681, 96, 2.4)}${win(681, 128, .8)}${win(597, 62, 1.1)}${win(556, 112, 3)}${win(636, 112, .4)}${win(597, 120, 2)}${win(270, 142, 1.4)}${win(470, 140, 2.8)}${win(740, 140, .6)}</g>
  </svg>`;
  function sky() {
    if (document.getElementById("sa-sky")) return;
    const d = document.createElement("div"); d.id = "sa-sky"; d.setAttribute("aria-hidden", "true");
    d.innerHTML = `<i class="neb"></i><i class="day"></i><i class="st1"></i><i class="st2"></i><i class="tc"></i><i class="sun"></i><i class="motes"></i><i class="skl">${SKYLINE}</i>`;
    document.body.prepend(d);
  }
  function post() {
    const b = document.body; if (!b) return;
    b.classList.add("sa-alq"); sky(); setRegion();
    // Pestañas que se deslizan (móvil): la activa siempre a la vista
    const tabs = document.querySelector(".gtabs"), on = tabs?.querySelector("button.on");
    if (tabs && on && tabs.scrollWidth > tabs.clientWidth) tabs.scrollLeft = on.offsetLeft - (tabs.clientWidth - on.offsetWidth) / 2;
    if (!b.dataset.intro) { b.dataset.intro = "1"; setTimeout(() => b.classList.add("sa-introd"), 1600); }
    // Panel: sello arriba en el centro
    document.querySelectorAll("section.panel, .hud").forEach((p) => { if (!p.querySelector(":scope > .sa-sig")) { const s = document.createElement("i"); s.className = "sa-sig"; s.setAttribute("aria-hidden", "true"); p.prepend(s); } });
  }
  const _r = render;
  render = function () { const o = _r.apply(this, arguments); try { post(); } catch (e) { console.warn("alquimia:", e); } return o; };
  if (document.body) post(); else document.addEventListener("DOMContentLoaded", post);

  const css = document.createElement("style"); css.id = "sa-alquimia";
  css.textContent = `
/* ================= ALQUIMIA OSCURA ================= */
/* Día = "Hora dorada" (ciruela cálida + ámbar). Noche (combate) = alquimia azul original. */
body.sa-alq{--nA:#2a2d6a;--nB:#6a2f45;--acc:#e8b98a;
  --a0:#22142f;--a1:#33203f;--a2:#4a2c52;--aL:#8a5a6e;
  --ground:var(--a0);--panel:var(--a1);--panel-2:var(--a1);--line:var(--aL);--gold:#f5c06a;--gold-soft:#f5c06a1c;--ink:#fff4e0;--ink-2:#efd5bd;--muted:#cfa9b4;
  --rune:#e6c47a;--steel1:var(--a1);--steel2:var(--a0);
  --body:"Alegreya Sans","Segoe UI",system-ui,sans-serif;
  background:var(--a0)!important;transition:background-color 1.2s}
body.sa-alq.sa-night{--a0:#060818;--a1:#0b0f2a;--a2:#121a4a;--aL:#2c3466;--gold:#e6c47a;--gold-soft:#e6c47a1c;--ink:#efe6d2;--ink-2:#c3b9a4;--muted:#8f93b4}
html:has(body.sa-alq){background:var(--a0)}
body.sa-alq header.top h1{font-family:"Cinzel Decorative",var(--display);color:#ffd08a;text-shadow:0 0 18px #f5a54188,0 2px 0 #5a2f55}
body.sa-alq.ingame::before{opacity:.07;filter:blur(4px) saturate(.6);z-index:-2}
#sa-sky{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
#sa-sky i{position:absolute;inset:0;display:block}
#sa-sky .day{transition:opacity 1.2s;background:
  radial-gradient(40vmax 20vmax at 50% 106%,#fff4cc 0%,#ffc56e 28%,transparent 70%),
  radial-gradient(80vmax 34vmax at 50% 100%,color-mix(in srgb,var(--acc) 50%,transparent),transparent 70%),
  linear-gradient(180deg,#170e2c 0%,color-mix(in srgb,var(--nA) 75%,#1a1030) 26%,color-mix(in srgb,var(--nB) 80%,#7a3a5a) 56%,#c45a5e 79%,#ef965a 92%,#ffc77a 100%)}
#sa-sky .st1,#sa-sky .st2{-webkit-mask-image:linear-gradient(180deg,#000 0,#0000 55%);mask-image:linear-gradient(180deg,#000 0,#0000 55%)}
#sa-sky .sun{inset:auto;left:50%;bottom:4vh;width:min(46vmin,420px);aspect-ratio:1;translate:-50% 30%;border-radius:50%;
  background:radial-gradient(circle,#fffbe8 0%,#ffe39a 34%,#ffb85a 52%,#ff9a5a00 70%);filter:blur(2px);animation:saRise 3.5s cubic-bezier(.2,.8,.2,1) both;transition:opacity 1.2s}
@keyframes saRise{from{translate:-50% 75%;opacity:.3}to{translate:-50% 30%;opacity:1}}
#sa-sky .motes{background-image:radial-gradient(2px 2px at 20px 30px,#ffd99a 50%,#0000 51%),radial-gradient(1.5px 1.5px at 140px 210px,#fff1c8 50%,#0000 51%),radial-gradient(2.5px 2.5px at 260px 90px,#ffc36e 50%,#0000 51%),radial-gradient(1.5px 1.5px at 330px 300px,#ffe7b0 50%,#0000 51%);
  background-size:380px 380px;opacity:.7;animation:saMotes 26s linear infinite;-webkit-mask-image:linear-gradient(0deg,#000 0,#0000 70%);mask-image:linear-gradient(0deg,#000 0,#0000 70%);transition:opacity 1.2s}
@keyframes saMotes{to{background-position:40px -380px}}
#sa-sky .skl{inset:auto 0 0 0;height:min(30vh,260px);transition:opacity 1.2s}
#sa-sky .skl svg{width:100%;height:100%;display:block}
.sa-win rect{animation:saWin 4s ease-in-out infinite alternate}
@keyframes saWin{0%,60%{opacity:1}100%{opacity:.35}}
.sa-lamp{filter:drop-shadow(0 0 6px #ffd77e)}
body.ingame #sa-sky .skl,body.ingame #sa-sky .sun{opacity:.55}
.sa-night #sa-sky .day,.sa-night #sa-sky .sun,.sa-night #sa-sky .motes,.sa-night #sa-sky .skl{opacity:0}

/* ---- Pantalla de título ---- */
body.sa-auth header.top h1{visibility:hidden}
.sa-hero{text-align:center;margin:4vh auto 22px;animation:saUp .9s .2s cubic-bezier(.2,.8,.2,1) both}
.sa-hcrest{position:relative;display:block;width:120px;height:120px;margin:0 auto 6px;border-radius:50%;
  background:radial-gradient(circle,#fff3cf 0 9%,#ffc766 10% 15%,#ffc76633 17%,transparent 40%)}
.sa-hcrest::before{content:"";position:absolute;inset:0;background:${CIRC} center/contain no-repeat;animation:saRot 60s linear infinite}
.sa-hero-t{margin:0;font-family:"Cinzel Decorative",var(--display);font-weight:700;font-size:clamp(34px,7vw,64px);line-height:1.05;letter-spacing:.04em;
  background:linear-gradient(180deg,#fff6dc 10%,#ffcf7a 55%,#e8894a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 #3a1a3a) drop-shadow(0 0 22px #ffb85a66)}
.sa-hero-s{margin:8px 0 0;font-family:var(--display);letter-spacing:.32em;text-transform:uppercase;font-size:clamp(11px,1.6vw,14px);color:#ffe2b0;text-shadow:0 1px 3px #000a}
.sa-hero-s::before,.sa-hero-s::after{content:"";display:inline-block;width:40px;height:1px;margin:0 12px;vertical-align:middle;background:linear-gradient(90deg,#0000,#ffd38a)}
.sa-hero-s::after{background:linear-gradient(270deg,#0000,#ffd38a)}
@media (max-width:560px){.sa-hero-s{letter-spacing:.18em}.sa-hero-s::before,.sa-hero-s::after{width:16px;margin:0 6px}.sa-hcrest{width:96px;height:96px}}
body.sa-auth .authbox{max-width:560px;margin-inline:auto;animation:saUp .9s .5s cubic-bezier(.2,.8,.2,1) both}
body.sa-introd .sa-hero,body.sa-introd.sa-auth .authbox{animation:none}
@keyframes saUp{from{opacity:0;translate:0 24px}to{opacity:1;translate:0 0}}
.sa-night #sa-sky .st1,.sa-night #sa-sky .st2{-webkit-mask-image:none;mask-image:none}
#sa-sky .neb{background:radial-gradient(60vmax 40vmax at 12% 8%,color-mix(in srgb,var(--nA) 70%,transparent),transparent 70%),radial-gradient(55vmax 45vmax at 92% 88%,color-mix(in srgb,var(--nB) 65%,transparent),transparent 70%),radial-gradient(40vmax 30vmax at 70% 20%,color-mix(in srgb,var(--nB) 25%,transparent),transparent 70%),linear-gradient(180deg,var(--a0),var(--a0));transition:background 1.2s}
#sa-sky .st1{background:${STARS} 0 0/320px 320px;opacity:.85}
#sa-sky .st2{background:${STARS} 160px 90px/520px 520px;opacity:.45;animation:saTw 6s ease-in-out infinite alternate}
@keyframes saTw{to{opacity:.15}}
#sa-sky .tc{inset:auto;width:min(130vmin,1100px);aspect-ratio:1;left:50%;top:52%;translate:-50% -50%;background:${CIRC_BIG} center/contain no-repeat;opacity:.07;animation:saRot 240s linear infinite}
@keyframes saRot{to{rotate:360deg}}

/* ---- Paneles grandes: marco con filigrana + sello ---- */
body.sa-alq .hud,body.sa-alq section.panel,body.sa-alq .sa-dash>div{position:relative;border:22px solid transparent!important;border-image:${FR} 34 / 30px / 0 stretch!important;border-radius:0!important;
  background:radial-gradient(120% 70% at 50% 0%,color-mix(in srgb,var(--a2) 80%,transparent),transparent 70%),linear-gradient(180deg,color-mix(in srgb,var(--a1) 93%,transparent),color-mix(in srgb,var(--a0) 95%,transparent))!important;background-clip:padding-box!important;
  box-shadow:0 18px 40px #000c,0 0 60px color-mix(in srgb,var(--nA) 35%,transparent)!important}
body.sa-alq section.panel{padding:8px 4px!important}
body.sa-alq .hud{padding:2px 4px!important}
body.sa-alq .sa-dash>div{padding:4px!important;border-width:18px!important}
.sa-sig{position:absolute;top:-30px;left:50%;translate:-50% 0;width:120px;height:22px;background:${SIGIL} center/contain no-repeat;pointer-events:none;z-index:2;filter:drop-shadow(0 0 6px #e6c47a66)}

/* ---- Tarjetas: línea fina + esquinas ---- */
body.sa-alq .sa-st,body.sa-alq .dqi{border:1px solid #e6c47a30!important}
body.sa-alq .card,body.sa-alq .rec,body.sa-alq .sa-evit,body.sa-alq .sa-br,body.sa-alq .sa-cls,body.sa-alq .sh-grid section,body.sa-alq .cc,body.sa-alq .rc,body.sa-alq .attr,body.sa-alq .sa-more,body.sa-alq .sa-hunt,body.sa-alq .sa-clsbox,body.sa-alq .sa-mem{
  border:1px solid #e6c47a38!important;border-radius:1px!important;background:${C_TL} 2px 2px/14px no-repeat,${C_TR} calc(100% - 2px) 2px/14px no-repeat,${C_BR} calc(100% - 2px) calc(100% - 2px)/14px no-repeat,${C_BL} 2px calc(100% - 2px)/14px no-repeat,
    linear-gradient(180deg,color-mix(in srgb,var(--a2) 80%,transparent),color-mix(in srgb,var(--a1) 85%,transparent))!important;box-shadow:inset 0 0 0 3px var(--a0),inset 0 0 0 4px #e6c47a14,0 6px 16px #0008!important}
body.sa-alq .card:hover,body.sa-alq .cc:hover,body.sa-alq .rc:hover{border-color:#e6c47a77!important}
body.sa-alq .rc.sel,body.sa-alq .rec.can{border-color:#e6c47aaa!important;box-shadow:inset 0 0 0 3px var(--a0),inset 0 0 24px #e6c47a1f,0 0 16px #e6c47a22!important}
body.sa-alq .sa-evcard{border:1px solid color-mix(in srgb,var(--acc) 50%,transparent)!important;border-radius:1px!important;background:radial-gradient(100% 80% at 0% 0%,#ff8a3a22,transparent 60%),linear-gradient(180deg,#1a1036,var(--a1))!important;box-shadow:0 0 30px #ff7a3a1a,inset 0 0 0 3px var(--a0),inset 0 0 0 4px #e6c47a22!important}

/* ---- Títulos y separadores ---- */
body.sa-alq h2{font-family:var(--display);letter-spacing:.08em;background:linear-gradient(180deg,#fff2c8,#e6c47a 55%,#b88a3c);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none}
body.sa-alq h2 .sai{filter:drop-shadow(0 1px 2px #000)}
body.sa-alq section.panel>h2:first-of-type,body.sa-alq section.panel>.row:first-child>h2{padding-bottom:16px;background-image:linear-gradient(180deg,#fff2c8,#e6c47a 55%,#b88a3c),${DIV};background-repeat:no-repeat;background-position:0 0,left bottom;background-size:100% calc(100% - 16px),64px 14px}
body.sa-alq h3{color:#e6c47a;letter-spacing:.14em}
body.sa-alq .card h3::before,body.sa-alq .sa-status h3::before,body.sa-alq .sa-sets h3::before{content:"";display:inline-block;width:7px;height:7px;margin-right:8px;rotate:45deg;border:1px solid #e6c47a;vertical-align:2px}
body.sa-alq .lsech{color:#e6c47a;font-family:var(--display);letter-spacing:.14em;text-transform:uppercase}
body.sa-alq .lsech::after{height:14px!important;background:${DIV} right center/64px 14px no-repeat,linear-gradient(90deg,#e6c47a66,#e6c47a22) left center/calc(100% - 70px) 1px no-repeat!important}
body.sa-alq .lsech[data-salsec]{border-left:0!important;background:linear-gradient(90deg,#e6c47a12,transparent 60%)!important;clip-path:polygon(8px 0,100% 0,100% 100%,8px 100%,0 50%)}
body.sa-alq hr{border:0;height:14px;background:${DIV} center/64px 14px no-repeat,linear-gradient(90deg,transparent,#e6c47a55,transparent) center/100% 1px no-repeat}

/* ---- Botones con puntas ---- */
body.sa-alq .btn{border:9px solid transparent!important;border-image:${B_N} 13 14 fill / 13px 14px stretch!important;border-radius:0!important;background:none!important;padding:3px 8px!important;color:#f3e7cb!important;text-shadow:0 1px 2px #000;box-shadow:none!important;letter-spacing:.08em;transition:filter .15s}
body.sa-alq .btn.small{border-width:7px 10px!important;border-image-width:10px 11px!important;padding:1px 4px!important;font-size:12px}
body.sa-alq .btn:hover:not(:disabled){border-image-source:${B_H}!important;filter:drop-shadow(0 0 6px #e6c47a55)}
body.sa-alq .btn.primary{border-image-source:${B_P}!important;color:#3a1606!important;text-shadow:0 1px 0 #fff3d488}
body.sa-alq .btn.primary:hover:not(:disabled){border-image-source:${B_PH}!important;filter:drop-shadow(0 0 10px #ffb85a99)}
body.sa-alq.sa-night .btn{border-image-source:${B_N0}!important}
body.sa-alq.sa-night .btn:hover:not(:disabled){border-image-source:${B_H0}!important}
body.sa-alq.sa-night .btn.primary{border-image-source:${B_P0}!important;color:#fff4d6!important;text-shadow:0 1px 2px #000}
body.sa-alq.sa-night .btn.primary:hover:not(:disabled){border-image-source:${B_PH0}!important}
body.sa-alq .btn.danger{border-image-source:${B_D}!important;color:#ffb8a4!important}
body.sa-alq .btn.ghost{opacity:.9}
body.sa-alq .btn:disabled{filter:grayscale(.7) brightness(.8)}
body.sa-alq .link{color:#f0d48e}
/* los botones del diario/mapa pierden el estilo de pergamino */
body.sa-alq .qtrack .btn,body.sa-alq .sa-mqa .btn,body.sa-alq .sa-nf .btn{background:none!important;border:9px solid transparent!important;border-image:${B_N} 13 14 fill / 13px 14px stretch!important;color:#f3e7cb!important}
body.sa-alq .sa-mqa .btn.primary{border-image-source:${B_P}!important}
body.sa-alq .sa-mqa .btn{border-width:7px 10px!important;white-space:normal!important;max-width:150px;line-height:1.2;text-align:center}
@media (max-width:560px){body.sa-alq .sa-mqa .btn{max-width:96px;font-size:11px!important}}

/* ---- Chips y píldoras: rombos en las puntas ---- */
body.sa-alq .chip,body.sa-alq .pill{border-radius:1px!important;border:1px solid #e6c47a40!important;background:linear-gradient(180deg,var(--a2),var(--a1))!important;color:var(--ink-2)!important;clip-path:polygon(7px 0,calc(100% - 7px) 0,100% 50%,calc(100% - 7px) 100%,7px 100%,0 50%);padding-left:13px!important;padding-right:13px!important}
body.sa-alq .chip.on{border-color:#e6c47a!important;color:#fff0c4!important;background:linear-gradient(180deg,#4a3818,#20170a)!important;box-shadow:inset 0 0 10px #e6c47a44}
body.sa-alq .pill.ok{color:var(--good)!important}

/* ---- Pestañas ---- */
body.sa-alq .gtabs{border:0!important;border-radius:0!important;background:linear-gradient(180deg,color-mix(in srgb,var(--a1) 95%,transparent),color-mix(in srgb,var(--a0) 95%,transparent))!important;box-shadow:0 1px 0 #e6c47a55,0 -1px 0 #e6c47a33,0 8px 20px #000a!important}
body.sa-alq .gtabs button{color:#c9bfa6}
body.sa-alq .gtabs{scrollbar-width:none}body.sa-alq .gtabs::-webkit-scrollbar{display:none}
@media (min-width:900px){body.sa-alq .gtabs{flex-wrap:wrap!important;justify-content:center;overflow:visible!important;row-gap:2px}}
@media (max-width:899px){body.sa-alq .gtabs{-webkit-mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent);mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent);scroll-behavior:smooth}}
body.sa-alq .gtabs button+button::before{background:#e6c47a66!important}
body.sa-alq .gtabs button.on{color:#fff0c4!important;background:radial-gradient(60% 120% at 50% 100%,#e6c47a33,transparent 70%)!important;box-shadow:inset 0 -2px 0 #e6c47a}

/* ---- HUD: orbes dentro de un círculo de transmutación ---- */
body.sa-alq .orb{position:relative}
body.sa-alq .orb .orb-glass{box-shadow:0 0 0 1px #e6c47a,0 0 0 4px var(--a0),0 0 0 5px #e6c47a66,0 0 26px var(--og),inset 0 -8px 18px #000c!important}
body.sa-alq .orb::before{content:"";position:absolute;top:-17px;left:50%;width:120px;height:120px;margin-left:-60px;background:${CIRC} center/contain no-repeat;opacity:.8;animation:saRot 50s linear infinite;pointer-events:none}
body.sa-alq .orb-mn::before{animation-direction:reverse}
body.sa-alq .orb .orb-lb{margin-top:14px;color:#e6c47a}
body.sa-alq .hud .m-en,body.sa-alq .hud .m-es,body.sa-alq .hud .m-so{border:1px solid #e6c47a2e!important;border-left:2px solid #e6c47a99!important;background:linear-gradient(90deg,color-mix(in srgb,var(--a2) 80%,transparent),color-mix(in srgb,var(--a1) 20%,transparent))!important;clip-path:polygon(0 0,100% 0,calc(100% - 8px) 100%,0 100%)}
body.sa-alq .bar,body.sa-alq .qt-bar{background:var(--a0)!important;box-shadow:inset 0 0 0 1px #e6c47a33}
body.sa-alq .hud .hpor img,body.sa-alq .hud .who img{box-shadow:0 0 0 2px #e6c47a,0 0 0 5px var(--a0),0 0 0 6px #e6c47a55!important}

/* ---- Diario de misiones: placa oscura con sello ---- */
body.sa-alq .qtrack{color:var(--ink)!important;clip-path:none!important;border:1px solid #e6c47a55!important;
  background:${C_TL} 3px 3px/14px no-repeat,${C_TR} calc(100% - 3px) 3px/14px no-repeat,${C_BR} calc(100% - 3px) calc(100% - 3px)/14px no-repeat,${C_BL} 3px calc(100% - 3px)/14px no-repeat,radial-gradient(90% 120% at 0% 50%,color-mix(in srgb,var(--nB) 40%,transparent),transparent 60%),linear-gradient(180deg,color-mix(in srgb,var(--a2) 95%,transparent),color-mix(in srgb,var(--a1) 96%,transparent))!important;
  box-shadow:inset 0 0 0 3px var(--a0),inset 0 0 0 4px #e6c47a1c,0 8px 24px #000b!important}
body.sa-alq .qtrack::before{content:""!important;width:30px!important;height:30px!important;background:${CIRC} center/contain no-repeat!important;box-shadow:0 0 12px #e6c47a55!important;animation:saRot 30s linear infinite}
body.sa-alq .qt-l small{color:#e6c47a!important}
body.sa-alq .qt-l b{color:#fff0d0!important}
body.sa-alq .qtrack .note,body.sa-alq .qtrack .mate small{color:var(--ink-2)!important}
body.sa-alq .qtrack .mate{background:#ffffff08!important;border-color:#e6c47a33!important;color:var(--ink)!important}
body.sa-alq .qtrack .qt-bar i{background:linear-gradient(90deg,#b88a3c,#f3d690)!important}

/* ---- Mapa: misiones, notas, marco ---- */
body.sa-alq .sa-mqp-box,body.sa-alq .sa-notes{color:var(--ink)!important;border:1px solid #e6c47a44;background:linear-gradient(180deg,color-mix(in srgb,var(--a2) 94%,transparent),color-mix(in srgb,var(--a1) 96%,transparent))!important;box-shadow:inset 0 0 0 3px var(--a0),inset 0 0 0 4px #e6c47a1c,0 8px 20px #000a!important}
body.sa-alq .sa-mqp-box>summary span,body.sa-alq .sa-nh b{color:#f0d48e!important}
body.sa-alq .sa-mqp-box>summary small,body.sa-alq .sa-nh small,body.sa-alq .sa-mqp-box>p{color:var(--muted)!important}
body.sa-alq .sa-mqp-box>summary::after{color:#e6c47a!important}
body.sa-alq .sa-mqp-box>summary .sa-cnt{background:#e6c47a22!important;border-color:#e6c47a66!important;color:#f0d48e!important}
body.sa-alq .sa-mq{background:#ffffff06!important;border:1px solid #e6c47a26!important;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
body.sa-alq .sa-mq:hover{background:#e6c47a12!important}
body.sa-alq .sa-mq.focus{border-color:#f3d690!important;background:#e6c47a1c!important;box-shadow:inset 0 0 16px #e6c47a22!important}
body.sa-alq .sa-mq.story{border-left:2px solid #e07a8a!important}body.sa-alq .sa-mq.ready{border-left:2px solid #79c29a!important}
body.sa-alq .sa-mqt small{color:#e6c47a!important}body.sa-alq .sa-mqt b{color:var(--ink)!important}body.sa-alq .sa-mqw{color:var(--ink-2)!important}
body.sa-alq .sa-mqb{background:var(--a0)!important}body.sa-alq .sa-mqb i{background:linear-gradient(90deg,#b88a3c,#f3d690)!important}
body.sa-alq .sa-mqmore{background:#ffffff06!important;border-color:#e6c47a44!important;color:#e6c47a!important}
body.sa-alq .sa-here{color:#79c29a!important}
body.sa-alq .sa-nf select,body.sa-alq .sa-nf input{background:var(--a0)!important;color:var(--ink)!important;border-color:#e6c47a44!important}
body.sa-alq .sa-nl li{border-color:#e6c47a33!important}body.sa-alq .sa-nl li b,body.sa-alq .sa-nl li span,body.sa-alq .sa-ngoal{color:var(--ink)!important}
body.sa-alq .minimap{box-shadow:0 0 0 1px #e6c47a,0 0 0 6px var(--a0),0 0 0 7px #e6c47a66,0 0 40px color-mix(in srgb,var(--nA) 60%,transparent),0 16px 34px #000b!important}
body.sa-alq .minimap::after{background:radial-gradient(ellipse at center,transparent 55%,color-mix(in srgb,var(--a0) 80%,transparent) 100%)!important}

/* ---- Campos ---- */
body.sa-alq input,body.sa-alq textarea,body.sa-alq select{background:var(--a0);border:1px solid var(--aL);border-bottom-color:#e6c47a77;border-radius:1px}
body.sa-alq input:focus,body.sa-alq textarea:focus,body.sa-alq select:focus{border-color:#e6c47a;box-shadow:0 0 0 3px #e6c47a1c}

/* ---- Bolsa ---- */
body.sa-alq .bcell{border-radius:1px!important}
body.sa-alq .bcell[data-rar="c"]{background:linear-gradient(180deg,var(--a2),var(--a0))!important;border-color:var(--aL)!important}
body.sa-alq .bcell[data-rar]:not([data-rar="c"]){background:radial-gradient(90% 70% at 50% 110%,color-mix(in srgb,var(--rk) 32%,transparent),transparent 70%),linear-gradient(180deg,var(--a2),var(--a0))!important}
body.sa-alq .bagp{outline-color:#e6c47a33!important}
body.sa-alq .uslot,body.sa-alq .ds{border-radius:1px!important}

/* ---- Combate ---- */
body.sa-alq .cbtn{background:linear-gradient(180deg,var(--a2),var(--a1))!important;border:1px solid #e6c47a44!important}
body.sa-alq .cbtn:hover:not(:disabled){border-color:#e6c47a!important;box-shadow:0 0 12px #e6c47a33}
body.sa-alq .cbtn.atk{background:linear-gradient(180deg,#3e1424,#160812)!important;border-color:#f08a6a88!important}
body.sa-alq .cbtn.mag{background:linear-gradient(180deg,#14265e,var(--a0))!important;border-color:#7ab8ff88!important}
@media (max-width:640px){
  body.sa-alq .sa-wheel::before{border:0!important;width:250px!important;height:250px!important;margin:-125px 0 0 -125px!important;background:${CIRC} center/contain no-repeat;opacity:.55;box-shadow:none!important}
  body.sa-alq .sa-wheel .cbtn{background:radial-gradient(circle at 50% 35%,var(--a2),var(--a0) 75%)!important;border:1px solid #e6c47a!important;box-shadow:0 0 0 3px var(--a0),0 0 0 4px #e6c47a55,0 4px 12px #000a!important}
  body.sa-alq .sa-wheel .cbtn.atk[style*="--i:0;"]{background:radial-gradient(circle at 50% 35%,#6a1e30,#1e0810 75%)!important;border-color:#f3a07a!important;box-shadow:0 0 0 4px var(--a0),0 0 0 5px #f3a07a88,0 0 24px #ff6a4a55!important}
}

/* ---- Barra de abajo, mini-HUD, hoja ---- */
body.sa-alq #sa-mini{background:linear-gradient(180deg,color-mix(in srgb,var(--a1) 96%,transparent),color-mix(in srgb,var(--a0) 96%,transparent))!important;border-bottom:1px solid #e6c47a66!important}
body.sa-alq #sa-mini img{box-shadow:0 0 0 1px #e6c47a,0 0 0 3px var(--a0),0 0 0 4px #e6c47a66!important}
@media (max-width:760px){
  body.sa-alq.sa-bnav-on #sa-bnav:not([hidden]){background:linear-gradient(180deg,color-mix(in srgb,var(--a1) 97%,transparent),color-mix(in srgb,var(--a0) 99%,transparent))!important;border-top:1px solid #e6c47a77!important}
  body.sa-alq #sa-bnav::before{content:"";position:absolute;top:-11px;left:50%;translate:-50% 0;width:120px;height:22px;background:${SIGIL} center/contain no-repeat}
  body.sa-alq #sa-bnav button.on::before{background:#f3d690!important;box-shadow:0 0 10px #f3d690!important}
  body.sa-alq .sa-sh-in{background:linear-gradient(180deg,var(--a2),var(--a0))!important;border-top:1px solid #e6c47a88!important;border-radius:0!important;clip-path:polygon(0 14px,14px 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)}
  body.sa-alq #sa-sheet .sa-sh-g button{border:1px solid #e6c47a2a!important;border-radius:1px!important;background:#ffffff06!important}
  body.sa-alq #sa-sheet .sa-sh-g button.on{border-color:#e6c47a!important;background:#e6c47a1a!important}
}

/* ---- Otros ---- */
body.sa-alq .toast{background:linear-gradient(180deg,var(--a2),var(--a1))!important;border:1px solid #e6c47a!important;border-radius:1px!important;box-shadow:0 0 0 3px var(--a0),0 0 0 4px #e6c47a55,0 10px 30px #000c}
body.sa-alq .result,body.sa-alq .bres{border:1px solid #e6c47a55!important;border-radius:1px!important;background:linear-gradient(180deg,color-mix(in srgb,var(--a2) 94%,transparent),color-mix(in srgb,var(--a1) 96%,transparent))!important}
body.sa-alq ::-webkit-scrollbar{width:10px;height:10px}
body.sa-alq ::-webkit-scrollbar-track{background:var(--a0)}
body.sa-alq ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#b88a3c,#6a4e1e);border:2px solid var(--a0);border-radius:0}
@media (prefers-reduced-motion:reduce){#sa-sky .sun,#sa-sky .motes,.sa-win rect,.sa-hcrest::before,.sa-hero,body.sa-auth .authbox,#sa-sky .tc,#sa-sky .st2,body.sa-alq .orb::before,body.sa-alq .qtrack::before{animation:none!important}}
@media (max-width:560px){
  body.sa-alq section.panel,body.sa-alq .hud{border-width:16px!important;border-image-width:22px!important}
  body.sa-alq section.panel{padding:6px 0!important}
  .sa-sig{top:-24px;width:96px;height:18px}
  body.sa-alq .orb::before{width:112px;height:112px;margin-left:-56px}
}
`;
  document.head.appendChild(css);
})();
