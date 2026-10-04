// =====================================================================
// bestias.js — Animaciones de enemigos por tipo + retratos de monstruos nuevos
//   Tipos: vuela, flota, repta, bestia, coloso, salta, lanzador, dragón
//   Cada tipo: animación en reposo, ataque, golpe recibido y muerte propias.
//   Retratos: iconos/mon/*.png (Halloween, Invierno, Festival del Alba, jefes de gremio)
// Se carga después de gremio.js.
// =====================================================================
(function () {
  if (typeof monIcon !== "function") return;
  const TYPES = [
    ["dragon", /drag|draco|wyrm|hidra|leviat|serpiente marina|kraken|titán|reina araña/i],
    ["fly", /gaviota|murci|grifo|f[eé]nix|colibr|b[uú]ho|cuervo|águila|halc|harp|polilla|abeja|avispa|p[aá]jaro|ave |aves|nidos/i],
    ["float", /fantasma|espectro|esp[ií]ritu|eco|bruma|nixie|alma|sombra|wisp|velo|aparici/i],
    ["crawl", /ara[ñn]a|escarabajo|cangrejo|serpiente|gusano|rata|anguila|salamandra|escorpi|lagart|ciempi|sapo/i],
    ["golem", /g[oó]lem|roca|piedra|mu[ñn]eco de nieve|espantap|estatua|armadura|coloso|trol/i],
    ["hop", /calabaza|flor|florecilla|seta|hongo|slime|limo|baba|planta|musgo/i],
    ["caster", /bruja|mago|duende|brujo|hechicer|contrabandista|ladr|marinero|pirata|bandido|cultista|caballero|guerrero|luchador|darius|seraphina|thorne|garrok|relojero/i],
    ["beast", /lobo|oso|jabal|tigre|yeti|ciervo|minotauro|bestia|perro|felino|le[oó]n|toro|gato|zorro/i],
  ];
  const typeOf = (n) => { for (const [t, re] of TYPES) if (re.test(n || "")) return t; return "beast"; };

  // retratos nuevos
  const MON = {
    "Calabaza maldita": ["calabaza-maldita", "🎃"], "Espantapájaros vivo": ["espantapajaros-vivo", "🧟"], "Fantasma travieso": ["fantasma-travieso", "👻"], "Murciélago vampiro": ["murcielago-vampiro", "🦇"], "Bruja del caldero": ["bruja-del-caldero", "🧙"],
    "Muñeco de nieve furioso": ["muneco-de-nieve-furioso", "⛄"], "Duende travieso": ["duende-travieso", "🧝"], "Oso polar hambriento": ["oso-polar-hambriento", "🐻‍❄️"], "Espíritu del frío": ["espiritu-del-frio", "🌬️"],
    "Espíritu del amanecer": ["espiritu-del-amanecer", "✨"], "Colibrí de fuego": ["colibri-de-fuego", "🐦"], "Florecilla traviesa": ["florecilla-traviesa", "🌺"],
    "Gólem del Abismo": ["golem-del-abismo", "🗿"], "Hidra de Ceniza": ["hidra-de-ceniza", "🐉"], "Reina Araña de Cristal": ["reina-arana-de-cristal", "🕷️"], "Titán de Escarcha": ["titan-de-escarcha", "🧊"], "Fénix Corrupto": ["fenix-corrupto", "🔥"], "Leviatán de la Tormenta": ["leviatan-de-la-tormenta", "🐋"],
  };
  const RARE_SUF = / (de Medianoche|de la Tormenta|Espectral|Dorado)$/;
  const baseName = (n) => String(n || "").replace(/^✦\s*/, "").replace(RARE_SUF, "");
  const _mi = monIcon;
  monIcon = function (e) {
    if (!e) return _mi.apply(this, arguments);
    const m = MON[e.n];
    if (m) return `<img class="mimg" src="iconos/mon/${m[0]}.png?v=2" alt="${m[1]}" data-fb="${m[1]}">`;
    if (/^✦/.test(e.n || "")) { const b = baseName(e.n); if (b !== e.n) return monIcon({ ...e, n: b }); }
    return _mi.apply(this, arguments);
  };
  window.SA_BESTIAS = { typeOf, MON };

  // marcar tipo en cada enemigo
  let lastPv = null;
  function post() {
    const c = G?.g?.combat; if (!c) { lastPv = null; return; }
    document.querySelectorAll(".foes2 .foe2").forEach((f, i) => {
      const e = c.enemies[i]; if (!e) return; const t = typeOf(baseName(e.n));
      if (!f.classList.contains("an-" + t)) { f.classList.add("an", "an-" + t); f.style.setProperty("--and", `${-(i * 0.7 + Math.random()).toFixed(2)}s`); }
      if (e.boss || e.gb || MON[e.n] && /Gólem del|Hidra|Reina|Titán|Fénix Corr|Leviat/.test(e.n)) f.classList.add("an-big");
    });
    // el jugador perdió vida → los enemigos vivos atacan con su animación
    if (lastPv != null && G.pv < lastPv) document.querySelectorAll(".foes2 .foe2.an:not(.dead)").forEach((f) => { f.classList.remove("an-atk"); void f.offsetWidth; f.classList.add("an-atk"); setTimeout(() => f.classList.remove("an-atk"), 750); });
    lastPv = G.pv;
  }
  const _r = render;
  render = function () { const o = _r.apply(this, arguments); try { post(); } catch (e) { console.warn("bestias:", e); } return o; };

  const css = document.createElement("style"); css.id = "sa-bestias";
  css.textContent = `
.foe2.an .sprite>span{display:inline-block;transform-origin:50% 85%;animation-delay:var(--and,0s)!important;will-change:transform}
/* ---- reposo ---- */
.foe2.an-beast .sprite>span{animation:anBreath 2.6s ease-in-out infinite}
.foe2.an-fly .sprite>span{animation:anFly 2.2s ease-in-out infinite}
.foe2.an-float .sprite>span{animation:anFloat 3.6s ease-in-out infinite}
.foe2.an-crawl .sprite>span{animation:anCrawl 1.6s ease-in-out infinite}
.foe2.an-golem .sprite>span{animation:anGolem 3.2s ease-in-out infinite}
.foe2.an-hop .sprite>span{animation:anHop 1.4s cubic-bezier(.3,0,.4,1) infinite}
.foe2.an-caster .sprite>span{animation:anCaster 3s ease-in-out infinite}
.foe2.an-dragon .sprite>span{animation:anDragon 3.4s ease-in-out infinite}
@keyframes anBreath{0%,100%{transform:scale(1,1)}50%{transform:scale(1.03,.97) translateY(1px)}}
@keyframes anFly{0%,100%{transform:translateY(0) rotate(-2deg)}25%{transform:translateY(-9px) rotate(2deg)}50%{transform:translateY(-3px) rotate(-1deg)}75%{transform:translateY(-11px) rotate(3deg)}}
@keyframes anFloat{0%,100%{transform:translate(0,0);opacity:.92}33%{transform:translate(4px,-8px);opacity:1}66%{transform:translate(-4px,-4px);opacity:.8}}
@keyframes anCrawl{0%,100%{transform:translateX(0) skewX(0)}25%{transform:translateX(-4px) skewX(-4deg)}75%{transform:translateX(4px) skewX(4deg)}}
@keyframes anGolem{0%,100%{transform:rotate(0) translateY(0)}25%{transform:rotate(-2deg) translateY(1px)}50%{transform:rotate(0) translateY(-2px)}75%{transform:rotate(2deg) translateY(1px)}}
@keyframes anHop{0%,100%{transform:translateY(0) scale(1,1)}10%{transform:translateY(0) scale(1.08,.9)}40%{transform:translateY(-12px) scale(.95,1.06)}70%{transform:translateY(0) scale(1.06,.94)}}
@keyframes anCaster{0%,100%{transform:translateY(0);filter:drop-shadow(0 0 0 transparent)}50%{transform:translateY(-3px);filter:drop-shadow(0 0 10px #b56cffaa)}}
@keyframes anDragon{0%,100%{transform:scale(1) rotate(0)}40%{transform:scale(1.05) rotate(-1.5deg)}60%{transform:scale(1.04) rotate(1deg)}}
/* ---- ataque (cuando te golpean) ---- */
.foe2.an.an-atk .sprite>span{animation-duration:.65s!important;animation-iteration-count:1!important;animation-delay:0s!important}
.foe2.an-beast.an-atk .sprite>span{animation-name:anPounce!important}
.foe2.an-fly.an-atk .sprite>span{animation-name:anSwoop!important}
.foe2.an-float.an-atk .sprite>span{animation-name:anPhase!important}
.foe2.an-crawl.an-atk .sprite>span{animation-name:anDash!important}
.foe2.an-golem.an-atk .sprite>span{animation-name:anSlam!important}
.foe2.an-hop.an-atk .sprite>span{animation-name:anBounceAtk!important}
.foe2.an-caster.an-atk .sprite>span{animation-name:anCast!important}
.foe2.an-dragon.an-atk .sprite>span{animation-name:anRoar!important}
@keyframes anPounce{0%{transform:none}30%{transform:translate(8px,4px) scale(1.05,.92)}55%{transform:translate(-38px,14px) scale(1.12) rotate(-8deg)}100%{transform:none}}
@keyframes anSwoop{0%{transform:none}35%{transform:translate(10px,-22px) rotate(10deg)}60%{transform:translate(-40px,26px) rotate(-18deg) scale(1.1)}100%{transform:none}}
@keyframes anPhase{0%{transform:none;opacity:1}30%{opacity:.15;transform:translate(-10px,0) scale(.9)}55%{opacity:1;transform:translate(-34px,10px) scale(1.15)}100%{transform:none;opacity:1}}
@keyframes anDash{0%{transform:none}25%{transform:translateX(10px) skewX(10deg)}50%{transform:translateX(-42px) skewX(-14deg)}100%{transform:none}}
@keyframes anSlam{0%{transform:none}35%{transform:translateY(-16px) rotate(4deg) scale(1.05)}55%{transform:translate(-20px,8px) scale(1.12,.86)}100%{transform:none}}
@keyframes anBounceAtk{0%{transform:none}30%{transform:translateY(-26px) scale(.9,1.1)}60%{transform:translate(-30px,6px) scale(1.15,.85)}100%{transform:none}}
@keyframes anCast{0%{transform:none;filter:none}40%{transform:translateY(-6px) scale(1.06);filter:drop-shadow(0 0 18px #ff8ad0) brightness(1.4)}100%{transform:none;filter:none}}
@keyframes anRoar{0%{transform:none}30%{transform:scale(1.18) rotate(-3deg);filter:drop-shadow(0 0 16px #ff5a4a)}50%{transform:translate(-20px,6px) scale(1.15)}100%{transform:none;filter:none}}
/* ---- golpe recibido ---- */
.foe2.an.hit .sprite>span{animation:anHurt .45s ease 1!important}
.foe2.an-float.hit .sprite>span{animation:anHurtF .45s ease 1!important}
.foe2.an-golem.hit .sprite>span,.foe2.an-dragon.hit .sprite>span{animation:anHurtH .45s ease 1!important}
@keyframes anHurt{0%{transform:none;filter:none}20%{transform:translateX(12px) rotate(6deg);filter:brightness(2.2) saturate(.3)}60%{transform:translateX(-4px) rotate(-2deg)}100%{transform:none;filter:none}}
@keyframes anHurtF{0%{opacity:1}20%{opacity:.2;transform:translateX(8px)}40%{opacity:1}60%{opacity:.4}100%{opacity:1;transform:none}}
@keyframes anHurtH{0%{transform:none;filter:none}20%{transform:translateX(5px);filter:brightness(2)}40%{transform:translateX(-4px)}100%{transform:none;filter:none}}
/* ---- muerte ---- */
.foe2.an.dead .sprite>span{animation:anDie .9s ease forwards!important}
.foe2.an-float.dead .sprite>span{animation:anDieF 1.1s ease forwards!important}
.foe2.an-fly.dead .sprite>span{animation:anDieFly 1s ease-in forwards!important}
.foe2.an-golem.dead .sprite>span{animation:anDieG 1.1s ease forwards!important}
.foe2.an-hop.dead .sprite>span{animation:anDieHop .8s ease forwards!important}
@keyframes anDie{0%{transform:none;filter:none}30%{transform:rotate(-8deg);filter:brightness(2)}100%{transform:translateY(14px) rotate(80deg) scale(.8);filter:grayscale(1) brightness(.5);opacity:.3}}
@keyframes anDieF{0%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-50px) scale(1.3);filter:blur(4px)}}
@keyframes anDieFly{0%{transform:none}30%{transform:translateY(-10px) rotate(20deg)}100%{transform:translateY(60px) rotate(160deg);opacity:0}}
@keyframes anDieG{0%{transform:none}25%{transform:rotate(3deg)}60%{transform:translateY(8px) scale(1.05,.8);filter:grayscale(.6)}100%{transform:translateY(16px) scale(1.1,.5);filter:grayscale(1) brightness(.4);opacity:.35}}
@keyframes anDieHop{0%{transform:none}40%{transform:scale(1.3,.6)}100%{transform:scale(1.6,.1);opacity:0}}
/* jefes y grandes */
.foe2.an-big .sprite>span{filter:drop-shadow(0 0 14px #e0584a66)}
/* sombra en el suelo que acompaña */
.foe2.an-fly .sprite .pad,.foe2.an-float .sprite .pad{animation:anShadow 2.2s ease-in-out infinite;animation-delay:var(--and,0s)}
@keyframes anShadow{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(.8);opacity:.4}}
/* tu personaje respira */
.me2 .sprite.portrait>img{animation:anBreath 3s ease-in-out infinite;transform-origin:50% 90%}
@media (prefers-reduced-motion:reduce){.foe2.an .sprite>span,.me2 .sprite.portrait>img{animation:none!important}}
`;
  document.head.appendChild(css);
})();
