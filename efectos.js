// ===================== EFECTOS VISUALES DE SUNRISE ACADEMY =====================
// Carga al final (después de i18n.js). No cambia las reglas del juego: solo escucha lo que pasa
// (mensajes del combate y cambios de pantalla) y dibuja animaciones encima.
// Si el jugador tiene "reducir movimiento" activado en su sistema, casi todo se desactiva.
(function () {
  if (typeof render !== "function" || typeof clog !== "function") return;
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EN = () => typeof I18N !== "undefined" && I18N.lang === "en";
  const L = (es, en) => (EN() ? en : es);
  const $q = (s, r = document) => r.querySelector(s);
  const rnd = (a, b) => a + Math.random() * (b - a);

  // Colores por afinidad / elemento
  const COL = { Fuego: "#ff7a2e", Agua: "#4fb3ff", Tierra: "#c79a55", Aire: "#c8f3ff", Rayo: "#ffe14d", Luz: "#fff2a8", Sombra: "#9b5cff", Tiempo: "#8fe0cf", Espacio: "#a98bff", Gravedad: "#7d6bd6", Realidad: "#e07ad6", "Creación": "#9be07a", Destino: "#e8c878", Alma: "#cfd9ff" };
  const ST_COL = { Quemado: "#ff7a2e", Aturdido: "#ffe14d", Cegado: "#cfcfcf", Asustado: "#b98cf0" };
  const col = (aff) => COL[aff] || "#d9c2f7";

  // ---------- estilos ----------
  const css = `
#fx-root{position:absolute;left:0;top:0;width:0;height:0;z-index:50;pointer-events:none}
.fx-layer{position:absolute;pointer-events:none}
.fx-layer.clip{overflow:hidden;border-radius:8px}
.stage{isolation:isolate}
.hp{position:relative}
.hp .fx-lag{position:absolute;top:0;left:0;height:100%;background:#fff6;z-index:0;transition:width .5s ease .35s}
.hp .fx-lag.heal{background:#8be0a888;transition:none}
.hp i{position:relative;z-index:1}
/* textos flotantes */
.fx-pop{position:absolute;left:50%;top:-14px;transform:translateX(-50%);font-family:var(--display);font-weight:700;white-space:nowrap;font-size:15px;letter-spacing:.04em;color:var(--c,#fff);text-shadow:0 2px 0 #000,0 0 10px var(--c,#fff8);animation:fxPop 1.1s ease-out forwards;z-index:5;pointer-events:none}
.fx-pop.big{font-size:22px}
@keyframes fxPop{0%{opacity:0;transform:translate(-50%,6px) scale(.6)}15%{opacity:1;transform:translate(-50%,0) scale(1.15)}30%{transform:translate(-50%,-4px) scale(1)}100%{opacity:0;transform:translate(-50%,-30px) scale(1)}}
/* tajo */
.fx-slash{position:absolute;left:50%;top:50%;width:120%;height:4px;margin-left:-60%;border-radius:4px;background:linear-gradient(90deg,transparent,var(--c,#fff),transparent);box-shadow:0 0 12px var(--c,#fff);transform:rotate(-35deg) scaleX(0);animation:fxSlash .32s ease-out forwards;z-index:4}
.fx-slash.b{transform:rotate(35deg) scaleX(0);animation-delay:.08s}
.fx-slash.crit{height:7px;--c:#ffd84a}
@keyframes fxSlash{0%{transform:rotate(var(--r,-35deg)) scaleX(0);opacity:1}60%{transform:rotate(var(--r,-35deg)) scaleX(1);opacity:1}100%{transform:rotate(var(--r,-35deg)) scaleX(1.05);opacity:0}}
/* garras */
.fx-claw{position:absolute;top:18%;width:4px;height:64%;border-radius:3px;background:linear-gradient(180deg,transparent,#ff5a4a,transparent);box-shadow:0 0 8px #ff5a4a;transform:rotate(22deg) scaleY(0);transform-origin:top;animation:fxClaw .35s ease-out forwards;z-index:4}
@keyframes fxClaw{0%{transform:rotate(22deg) scaleY(0);opacity:1}55%{transform:rotate(22deg) scaleY(1);opacity:1}100%{transform:rotate(22deg) scaleY(1);opacity:0}}
/* explosión / anillos */
.fx-ring{position:absolute;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;border:3px solid var(--c,#fff);box-shadow:0 0 14px var(--c,#fff),inset 0 0 10px var(--c,#fff);animation:fxRing .55s ease-out forwards;z-index:4}
@keyframes fxRing{0%{transform:scale(.3);opacity:1}100%{transform:scale(4);opacity:0}}
.fx-core{position:absolute;left:50%;top:50%;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;background:radial-gradient(circle,#fff 0,var(--c,#fff) 35%,transparent 70%);animation:fxCore .45s ease-out forwards;z-index:4;mix-blend-mode:screen}
@keyframes fxCore{0%{transform:scale(.2);opacity:1}100%{transform:scale(2.2);opacity:0}}
.fx-spark{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px;border-radius:50%;background:var(--c,#fff);box-shadow:0 0 8px var(--c,#fff);animation:fxSpark .6s ease-out forwards;z-index:4}
@keyframes fxSpark{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(.3);opacity:0}}
/* proyectil */
.fx-orb{position:absolute;width:22px;height:22px;margin:-11px;border-radius:50%;background:radial-gradient(circle,#fff 0,var(--c) 45%,transparent 72%);box-shadow:0 0 18px var(--c),0 0 36px var(--c);z-index:4;pointer-events:none}
/* rayo */
.fx-bolt{position:absolute;width:26px;margin-left:-13px;top:0;background:var(--c,#ffe14d);box-shadow:0 0 18px var(--c,#ffe14d);clip-path:polygon(40% 0,70% 0,52% 38%,78% 38%,30% 100%,44% 52%,20% 52%);animation:fxBolt .45s steps(1) forwards;z-index:4}
@keyframes fxBolt{0%{opacity:1}25%{opacity:.2}40%{opacity:1}100%{opacity:0}}
/* rayo de luz */
.fx-beam{position:absolute;width:46px;margin-left:-23px;top:0;border-radius:0 0 30px 30px;background:linear-gradient(180deg,transparent,var(--c,#fff2a8) 60%,#fff);box-shadow:0 0 30px var(--c,#fff2a8);transform-origin:top;animation:fxBeam .6s ease-out forwards;z-index:4;mix-blend-mode:screen}
@keyframes fxBeam{0%{transform:scaleY(0);opacity:1}40%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1) scaleX(.2);opacity:0}}
/* rocas */
.fx-rock{position:absolute;width:12px;height:10px;border-radius:3px;background:#8a6a40;box-shadow:inset -2px -2px 0 #5a4428;top:-20px;animation:fxRock .5s cubic-bezier(.5,0,1,1) forwards;z-index:4}
@keyframes fxRock{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(var(--fall)) rotate(200deg);opacity:0}}
/* humo sombrío */
.fx-smoke{position:absolute;left:50%;top:55%;width:40px;height:40px;margin:-20px;border-radius:50%;background:radial-gradient(circle,var(--c,#9b5cff) 0,#1a0d33aa 50%,transparent 70%);animation:fxSmoke .8s ease-out forwards;z-index:4}
@keyframes fxSmoke{0%{transform:translate(0,0) scale(.4);opacity:.9}100%{transform:translate(var(--dx),var(--dy)) scale(2.4);opacity:0}}
/* remolino */
.fx-swirl{position:absolute;left:50%;top:50%;width:80px;height:80px;margin:-40px;border-radius:50%;border:3px solid transparent;border-top-color:var(--c,#c8f3ff);border-left-color:var(--c,#c8f3ff);animation:fxSwirl .7s ease-out forwards;z-index:4}
@keyframes fxSwirl{0%{transform:rotate(0) scale(.4);opacity:1}100%{transform:rotate(540deg) scale(1.5);opacity:0}}
/* partículas que suben (curación, llamas, burbujas) */
.fx-rise{position:absolute;bottom:20%;font-style:normal;font-size:14px;font-weight:700;color:var(--c,#8be0a8);text-shadow:0 0 8px var(--c,#8be0a8);animation:fxRise 1s ease-out forwards;z-index:4}
.fx-rise.dot{width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c)}
@keyframes fxRise{0%{transform:translateY(0) scale(.6);opacity:0}20%{opacity:1}100%{transform:translateY(-70px) scale(1);opacity:0}}
/* burbuja escudo */
.fx-bubble{position:absolute;left:50%;top:50%;width:120%;height:120%;transform:translate(-50%,-50%) scale(.3);border-radius:50%;border:2px solid var(--c,#7fc8ff);background:radial-gradient(circle,transparent 55%,color-mix(in srgb,var(--c,#7fc8ff) 35%,transparent));box-shadow:0 0 18px var(--c,#7fc8ff);animation:fxBubble .6s ease-out forwards;z-index:4}
@keyframes fxBubble{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}60%{transform:translate(-50%,-50%) scale(1.05);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:.0}}
.fx-shard{position:absolute;left:50%;top:50%;width:8px;height:14px;background:#9fd6ff;clip-path:polygon(50% 0,100% 100%,0 100%);animation:fxSpark .6s ease-out forwards;z-index:4}
/* estrellas de aturdido */
.fx-stars{position:absolute;left:50%;top:-4px;width:70px;height:20px;margin-left:-35px;animation:fxOrbit 1.2s linear infinite;z-index:4;pointer-events:none}
.fx-stars i{position:absolute;top:0;font-style:normal;font-size:13px}
.fx-stars i:nth-child(1){left:0}.fx-stars i:nth-child(2){left:28px;top:-6px}.fx-stars i:nth-child(3){left:56px}
@keyframes fxOrbit{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
/* dados */
.fx-dice{position:absolute;left:12px;top:10px;display:flex;gap:6px;z-index:6;pointer-events:none;animation:fxDiceOut 1.5s ease forwards}
.fx-dice b{width:30px;height:30px;border-radius:7px;background:#f4ead2;color:#1a1410;display:grid;place-items:center;font-family:var(--display);font-size:17px;box-shadow:0 3px 0 #b8a67a,0 6px 12px #0008;animation:fxDie .5s cubic-bezier(.3,1.6,.6,1) both}
.fx-dice b:nth-child(2){animation-delay:.07s}.fx-dice b:nth-child(3){animation-delay:.14s}
.fx-dice b.six{background:#ffe07a}
@keyframes fxDie{0%{transform:translateY(-30px) rotate(-200deg) scale(.5);opacity:0}100%{transform:none;opacity:1}}
@keyframes fxDiceOut{0%,75%{opacity:1}100%{opacity:0}}
/* escenario: sacudidas, destellos, entrada */
.fx-shake{animation:fxShake .35s ease}
.fx-shake-hard{animation:fxShakeH .5s ease}
@keyframes fxShake{0%,100%{transform:none}25%{transform:translate(-4px,2px)}50%{transform:translate(4px,-2px)}75%{transform:translate(-2px,1px)}}
@keyframes fxShakeH{0%,100%{transform:none}15%{transform:translate(-9px,4px)}30%{transform:translate(8px,-5px)}45%{transform:translate(-6px,3px)}60%{transform:translate(5px,-2px)}80%{transform:translate(-2px,1px)}}
.fx-flash{position:absolute;inset:0;background:var(--c,#fff);mix-blend-mode:screen;animation:fxFlash .35s ease-out forwards;z-index:5;pointer-events:none}
@keyframes fxFlash{0%{opacity:.75}100%{opacity:0}}
.fx-banner{position:absolute;left:0;right:0;top:40%;text-align:center;font-family:var(--display);font-size:30px;letter-spacing:.2em;color:#fff3d6;text-shadow:0 0 18px var(--c,#d9a441),0 3px 0 #000;background:linear-gradient(90deg,transparent,#0b131ccc 20%,#0b131ccc 80%,transparent);padding:8px 0;animation:fxBanner 1.2s ease forwards;z-index:6;pointer-events:none}
@keyframes fxBanner{0%{transform:translateX(-100%);opacity:0}25%{transform:none;opacity:1}75%{transform:none;opacity:1}100%{transform:translateX(100%);opacity:0}}
.fx-enter-r{animation:fxEnterR .6s cubic-bezier(.2,.9,.3,1.2) both}
.fx-enter-l{animation:fxEnterL .6s cubic-bezier(.2,.9,.3,1.2) .15s both}
@keyframes fxEnterR{0%{transform:translateX(120px);opacity:0}100%{transform:none;opacity:1}}
@keyframes fxEnterL{0%{transform:translateX(-120px);opacity:0}100%{transform:none;opacity:1}}
.fx-lunge-foe{animation:fxLungeF .4s ease}
@keyframes fxLungeF{0%,100%{transform:none}40%{transform:translate(-36px,22px) scale(1.08)}}
.fx-lunge-me{animation:fxLungeM .35s ease}
@keyframes fxLungeM{0%,100%{transform:none}40%{transform:translate(26px,-14px)}}
.fx-dodge{animation:fxDodge .45s ease}
@keyframes fxDodge{0%,100%{transform:none;opacity:1}40%{transform:translateX(-34px);opacity:.5}}
.fx-stumble{animation:fxStumble .5s ease}
@keyframes fxStumble{0%,100%{transform:none}30%{transform:translateX(-30px)}60%{transform:translateX(-24px) rotate(-6deg)}}
.fx-dying{animation:fxDie2 .9s ease forwards}
@keyframes fxDie2{0%{filter:brightness(3);transform:none}30%{filter:brightness(3);transform:scale(1.1)}100%{filter:grayscale(1) brightness(.6);transform:translateY(10px) scale(.85);opacity:.35}}
/* estados que se quedan mientras duran */
.fx-st-quemado>span,.fx-st-quemado>img{filter:drop-shadow(0 0 8px #ff7a2e) drop-shadow(0 6px 6px #0008);animation:fxBurnGlow .5s ease-in-out infinite alternate,bob 2.6s ease-in-out infinite}
@keyframes fxBurnGlow{from{filter:drop-shadow(0 0 4px #ff7a2e)}to{filter:drop-shadow(0 0 14px #ff4a1e)}}
.foes2 .foe2 .sprite.fx-st-cegado::after,.me2 .sprite.fx-st-cegado::after{content:"";position:absolute;inset:auto;left:12%;right:12%;top:30%;height:14%;border:0;background:#000c;border-radius:6px;animation:none;z-index:3;pointer-events:none}
.fx-st-asustado>span,.fx-st-asustado>img{animation:fxTremble .18s linear infinite}
@keyframes fxTremble{0%,100%{translate:0}50%{translate:2px 0}}
.fx-guarded::before{content:"";position:absolute;inset:-6%;border-radius:50%;border:2px solid #7fc8ffaa;box-shadow:0 0 16px #7fc8ff66,inset 0 0 18px #7fc8ff44;animation:fxShieldPulse 1.8s ease-in-out infinite;z-index:2;pointer-events:none}
@keyframes fxShieldPulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
.fx-buffed::after{content:"";position:absolute;left:10%;right:10%;bottom:6%;height:70%;border-radius:50%;background:radial-gradient(ellipse at bottom,#ffd84a55,transparent 70%);animation:fxAura 1.4s ease-in-out infinite;z-index:0;pointer-events:none}
@keyframes fxAura{0%,100%{opacity:.4;transform:scaleY(.9)}50%{opacity:1;transform:scaleY(1.1)}}
/* jefe y objetivo */
.sprite.boss::before{content:"";position:absolute;inset:-10%;border-radius:50%;background:radial-gradient(circle,#e0584a44,transparent 65%);animation:fxAura 2.2s ease-in-out infinite;z-index:0;pointer-events:none}
.foe2.tgt:not(.dead) .sprite::after{content:"";position:absolute;inset:4%;border-radius:50%;border:2px dashed #e0735caa;animation:fxSpin 6s linear infinite;z-index:0;pointer-events:none}
@keyframes fxSpin{to{transform:rotate(360deg)}}
/* peligro: poca vida */
.fx-danger .stage::before{content:"";position:absolute;inset:0;box-shadow:inset 0 0 60px #e0584a99;animation:fxDanger 1.1s ease-in-out infinite;z-index:2;pointer-events:none}
@keyframes fxDanger{0%,100%{opacity:.35}50%{opacity:1}}
/* ambiente: partículas del lugar y del clima */
.fx-amb{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.scene .fx-amb{z-index:0}
.fx-amb i{position:absolute;display:block;border-radius:50%;animation-iteration-count:infinite;animation-timing-function:linear}
.fx-amb .up{bottom:-10px;animation-name:fxAmbUp}
.fx-amb .down{top:-12px;animation-name:fxAmbDown}
.fx-amb .rain{top:-30px;width:1.5px!important;height:18px!important;border-radius:1px;background:#bfe3ffaa!important;box-shadow:none!important;animation-name:fxRain}
.fx-amb .leaf{border-radius:0 70% 0 70%!important;animation-name:fxLeaf}
.fx-amb .drift{animation-name:fxDrift}
.fx-amb .star{animation-name:fxTwinkle;animation-timing-function:ease-in-out}
@keyframes fxAmbUp{0%{transform:translate(0,0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate(var(--sx,20px),calc(-1 * var(--h,380px)));opacity:0}}
@keyframes fxAmbDown{0%{transform:translate(0,0);opacity:0}10%{opacity:1}100%{transform:translate(var(--sx,20px),var(--h,380px));opacity:.2}}
@keyframes fxRain{0%{transform:translate(0,0) rotate(12deg)}100%{transform:translate(-80px,var(--h,380px)) rotate(12deg)}}
@keyframes fxLeaf{0%{transform:translate(0,0) rotate(0);opacity:0}10%{opacity:1}100%{transform:translate(var(--sx,60px),var(--h,380px)) rotate(540deg);opacity:.3}}
@keyframes fxDrift{0%{transform:translateX(-40px);opacity:0}15%{opacity:.8}85%{opacity:.8}100%{transform:translateX(var(--w,600px));opacity:0}}
@keyframes fxTwinkle{0%,100%{opacity:.1;transform:scale(.6)}50%{opacity:1;transform:scale(1.2)}}
.fx-amb .fog{position:absolute;inset:auto -20% 0 -20%;height:60%;border-radius:0;background:radial-gradient(ellipse at 30% 80%,#dfe8f055,transparent 60%),radial-gradient(ellipse at 75% 90%,#dfe8f044,transparent 55%);animation:fxFog 14s ease-in-out infinite alternate}
@keyframes fxFog{from{transform:translateX(-6%)}to{transform:translateX(6%)}}
.fx-amb .heat{position:absolute;inset:0;border-radius:0;background:linear-gradient(0deg,#ff7a2e22,transparent 60%);animation:fxAura 3s ease-in-out infinite}
.fx-amb .lightning{position:absolute;inset:0;border-radius:0;background:#e8f4ff;opacity:0;animation:fxLightning 7s linear infinite;mix-blend-mode:screen}
@keyframes fxLightning{0%,91%,95%,100%{opacity:0}92%{opacity:.55}93%{opacity:.1}94%{opacity:.4}}
/* victoria, derrota, nivel */
.fx-confetti{position:fixed;top:-12px;width:8px;height:12px;z-index:60;pointer-events:none;animation:fxConf var(--d,1.8s) cubic-bezier(.3,.6,.6,1) forwards}
@keyframes fxConf{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--sx),105vh) rotate(var(--rot));opacity:.8}}
.bresult.fx-win .bres-title{animation:fxTitle .7s cubic-bezier(.2,1.6,.4,1) both}
@keyframes fxTitle{0%{transform:scale(.3);opacity:0;letter-spacing:.6em}100%{transform:none;opacity:1}}
.bresult.fx-win .bres-foes span,.bresult.fx-win .bres-lines div{animation:msgin .5s ease both}
.bresult.fx-lose{animation:fxLose .8s ease}
@keyframes fxLose{0%{filter:grayscale(1) brightness(.5);transform:translateY(8px)}100%{filter:none;transform:none}}
.lvlup.fx-lvl{position:relative;animation:fxLvl 1s cubic-bezier(.2,1.6,.4,1) both;text-shadow:0 0 14px #8be0a8}
@keyframes fxLvl{0%{transform:scale(.4);opacity:0}100%{transform:none;opacity:1}}
.fx-bigmsg{position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:70;pointer-events:none;text-align:center;font-family:var(--display);color:#fff3d6;animation:fxBig 2.2s ease forwards}
.fx-bigmsg b{display:block;font-size:34px;letter-spacing:.14em;text-shadow:0 0 22px var(--c,#d9a441),0 3px 0 #000}
.fx-bigmsg span{display:block;font-size:15px;color:#e8dcc0;text-shadow:0 2px 4px #000;margin-top:4px}
.fx-bigmsg::before{content:"";position:absolute;left:50%;top:50%;width:420px;height:420px;margin:-210px;border-radius:50%;background:repeating-conic-gradient(from 0deg,var(--c,#d9a441)22 0 6deg,transparent 6deg 18deg);-webkit-mask:radial-gradient(circle,#000 20%,transparent 70%);mask:radial-gradient(circle,#000 20%,transparent 70%);animation:fxSpin 8s linear infinite;z-index:-1}
@keyframes fxBig{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}25%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%) scale(1)}}
/* interfaz general */
.fx-view{animation:fxView .35s ease both}
@keyframes fxView{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:none}}
#toast.fx-toast{animation:fxToast .35s cubic-bezier(.2,1.4,.4,1) both}
@keyframes fxToast{0%{opacity:0;transform:translate(-50%,16px) scale(.9)}100%{opacity:1}}
.btn,.cbtn,.act,.pl{transition:transform .12s ease,filter .12s ease,box-shadow .15s ease}
.btn:not(:disabled):active,.cbtn:not(:disabled):active,.act:active,.pl:active{transform:scale(.96)}
.cbtn:not(:disabled):hover,.act:hover{filter:brightness(1.12)}
.cbtn.atk:not(:disabled):hover{box-shadow:0 0 0 1px #e0735c88,0 0 14px #e0735c44}
.cbtn.mag:not(:disabled):hover,.cbtn.spell:not(:disabled):hover{box-shadow:0 0 0 1px #9b5cff88,0 0 14px #9b5cff44}
/* retratos de monstruos */
.sprite span .mimg{display:block;width:104px;height:104px;border-radius:50%;filter:drop-shadow(0 6px 8px #000a)}
.sprite.boss span .mimg{width:144px;height:144px;margin:-12px;border-radius:0}
.bres-foes .mimg{width:30px;height:30px;border-radius:50%;vertical-align:middle;margin-right:2px}
@media (max-width:640px){.sprite span .mimg{width:76px;height:76px}.sprite.boss span .mimg{width:104px;height:104px;margin:-8px}}

/* ===== v2: inmersión ===== */
.fx-cam{animation:fxCam .45s cubic-bezier(.2,1.4,.4,1)}
@keyframes fxCam{0%{transform:scale(1)}30%{transform:scale(1.045)}100%{transform:scale(1)}}
.fx-cam-in{animation:fxCamIn 1s cubic-bezier(.2,.9,.3,1)}
@keyframes fxCamIn{0%{transform:scale(1.15);filter:brightness(.3) blur(2px)}100%{transform:none;filter:none}}
.fx-hitflash>span,.fx-hitflash>img,.fx-hitflash span img{filter:brightness(3.2) saturate(0) !important}
.fx-windup>span,.fx-windup>img{filter:drop-shadow(0 0 10px #ff3b2e) drop-shadow(0 0 22px #ff3b2e) !important}
.fx-lbox{position:absolute;left:0;right:0;height:0;background:#000;z-index:7;animation:fxLbox var(--d,1.6s) ease forwards}
.fx-lbox.t{top:0}.fx-lbox.b{bottom:0}
@keyframes fxLbox{0%{height:0}18%{height:14%}82%{height:14%}100%{height:0}}
.fx-title{position:absolute;left:0;right:0;top:34%;text-align:center;z-index:8;pointer-events:none;animation:fxTitleCard 1.6s ease forwards}
.fx-title b{display:block;font-family:var(--display);font-size:34px;letter-spacing:.16em;color:#fff3d6;text-shadow:0 0 24px var(--c,#e0584a),0 0 6px var(--c,#e0584a),0 3px 0 #000}
.fx-title span{display:block;font-family:var(--display);font-size:13px;letter-spacing:.5em;color:var(--c,#e0584a);margin-top:4px;text-shadow:0 2px 3px #000}
.fx-title::before{content:"";position:absolute;left:10%;right:10%;top:50%;height:1px;background:linear-gradient(90deg,transparent,var(--c,#e0584a),transparent);transform:translateY(-26px)}
@keyframes fxTitleCard{0%{opacity:0;letter-spacing:.6em;transform:scale(1.2)}20%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0;transform:scale(.95)}}
.fx-darken{position:absolute;inset:0;background:radial-gradient(circle at 70% 40%,transparent 10%,#000c 70%);z-index:6;animation:fxDarken 1.6s ease forwards;pointer-events:none}
@keyframes fxDarken{0%{opacity:0}20%{opacity:1}75%{opacity:1}100%{opacity:0}}
.fx-silhouette>span,.fx-silhouette>img,.fx-silhouette span img{animation:fxSil 1.4s ease forwards !important}
@keyframes fxSil{0%{filter:brightness(.12) drop-shadow(0 0 12px #e0584a);transform:scale(.8)}60%{filter:brightness(.12) drop-shadow(0 0 18px #e0584a);transform:scale(1.05)}100%{filter:none;transform:none}}
.fx-circle{position:absolute;left:50%;bottom:-2%;width:150%;height:46%;margin-left:-75%;z-index:0;pointer-events:none;animation:fxCircleIn .9s ease forwards}
.fx-circle svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 6px var(--c))}
.fx-circle g{transform-origin:50% 50%;animation:fxSpin 1.8s linear infinite}
@keyframes fxCircleIn{0%{opacity:0;transform:scale(.3)}25%{opacity:1;transform:scale(1)}75%{opacity:1}100%{opacity:0;transform:scale(1.1)}}
.fx-trail{position:absolute;width:10px;height:10px;margin:-5px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);animation:fxTrail .45s ease-out forwards;pointer-events:none}
@keyframes fxTrail{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(.2) translateY(6px)}}
.fx-shock{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 6px color-mix(in srgb,var(--c,#fff) 40%,transparent),0 0 30px var(--c,#fff);animation:fxShock .6s cubic-bezier(.1,.8,.3,1) forwards;z-index:4}
@keyframes fxShock{0%{transform:scale(.2);opacity:1}100%{transform:scale(5.5);opacity:0}}
.fx-edge{position:fixed;inset:0;pointer-events:none;z-index:40;box-shadow:inset 0 0 90px var(--c,#e0584a);animation:fxEdge .5s ease-out forwards}
@keyframes fxEdge{0%{opacity:1}100%{opacity:0}}
.float{font-size:26px !important;-webkit-text-stroke:1px #000;animation:fxNum 1.3s cubic-bezier(.2,1.2,.4,1) forwards !important}
@keyframes fxNum{0%{opacity:0;transform:translate(-50%,10px) scale(.4)}12%{opacity:1;transform:translate(-50%,-6px) scale(1.45)}28%{transform:translate(-50%,-10px) scale(1)}100%{opacity:0;transform:translate(calc(-50% + 14px),-48px) scale(.95)}}
.fx-ghost{position:fixed;z-index:45;pointer-events:none;display:grid;place-items:center}
.fx-ghost>*{animation:none !important}
.fx-ghost.die{animation:fxDisint 1.1s ease-in forwards}
@keyframes fxDisint{0%{filter:brightness(3) saturate(0);transform:scale(1.08)}25%{filter:brightness(2);transform:scale(1.05)}100%{filter:brightness(1.5) blur(6px);opacity:0;transform:scale(.9) translateY(-14px)}}
.fx-ghost.fall{animation:fxFall 1.3s ease-in forwards}
@keyframes fxFall{0%{transform:none;filter:none}30%{transform:rotate(-8deg) translateY(4px);filter:grayscale(.6)}100%{transform:rotate(-80deg) translate(-30px,40px);filter:grayscale(1) brightness(.4);opacity:0}}
.fx-ghost.flee{animation:fxFleeOut .7s ease-in forwards}
@keyframes fxFleeOut{0%{transform:none}100%{transform:translateX(-160px);opacity:0}}
.fx-dust{position:fixed;width:5px;height:5px;border-radius:1px;z-index:46;pointer-events:none;background:var(--c);box-shadow:0 0 6px var(--c);animation:fxDust var(--d,1.2s) ease-out forwards}
@keyframes fxDust{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(200deg)}}
.fx-fade{position:fixed;inset:0;z-index:44;pointer-events:none;display:grid;place-items:center;background:radial-gradient(circle,#3a0b0b99,#000e 75%);animation:fxFadeDef 2.4s ease forwards}
.fx-fade b{font-family:var(--display);font-size:30px;letter-spacing:.3em;color:#f1b2a4;text-shadow:0 0 18px #e0584a,0 3px 0 #000}
@keyframes fxFadeDef{0%{opacity:0}20%{opacity:1}70%{opacity:1}100%{opacity:0}}
.fx-goldflash{position:fixed;inset:0;z-index:44;pointer-events:none;background:radial-gradient(circle at 50% 40%,#ffe9a066,transparent 60%);animation:fxEdge 1s ease-out forwards}
.stage.fx-pan{animation:fxPan 60s ease-in-out infinite alternate}
@keyframes fxPan{0%{background-position:0 0,40% 38%,0 0}100%{background-position:0 0,60% 44%,0 0}}
.fx-amb .rays{position:absolute;inset:-20% -10% 0 -10%;border-radius:0;background:repeating-linear-gradient(105deg,transparent 0 60px,var(--rc,#fff4c455) 60px 90px,transparent 90px 170px);-webkit-mask:linear-gradient(180deg,#000,transparent 85%);mask:linear-gradient(180deg,#000,transparent 85%);animation:fxRays 9s ease-in-out infinite alternate;mix-blend-mode:screen}
@keyframes fxRays{0%{opacity:.25;transform:translateX(-3%)}100%{opacity:.6;transform:translateX(3%)}}
.fx-amb .flicker{position:absolute;inset:0;border-radius:0;background:radial-gradient(ellipse at 50% 110%,#ff7a2e44,transparent 60%);animation:fxFlicker 2.2s steps(1) infinite}
@keyframes fxFlicker{0%{opacity:.6}20%{opacity:.9}35%{opacity:.5}55%{opacity:1}70%{opacity:.7}85%{opacity:.95}}
.fx-amb .vig{position:absolute;inset:0;border-radius:0;box-shadow:inset 0 0 80px #000a}
.fx-amb .mist{position:absolute;left:-30%;right:-30%;bottom:-10%;height:45%;border-radius:0;background:radial-gradient(ellipse at 20% 80%,#ffffff18,transparent 55%),radial-gradient(ellipse at 70% 90%,#ffffff14,transparent 50%);animation:fxFog 18s ease-in-out infinite alternate}
.fx-roundtag{position:absolute;right:14px;bottom:12px;z-index:6;font-family:var(--display);font-size:13px;letter-spacing:.2em;color:#ffe9a0;text-shadow:0 0 10px #d9a441,0 2px 0 #000;animation:fxRound 1.2s ease forwards;pointer-events:none}
@keyframes fxRound{0%{opacity:0;transform:translateY(8px)}20%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0}}
.cmd.fx-cmdin .cbtn{animation:fxCmdIn .4s cubic-bezier(.2,1.3,.4,1) both}
.cmd.fx-cmdin .cbtn:nth-child(2){animation-delay:.05s}.cmd.fx-cmdin .cbtn:nth-child(3){animation-delay:.1s}.cmd.fx-cmdin .cbtn:nth-child(4){animation-delay:.15s}.cmd.fx-cmdin .cbtn:nth-child(5){animation-delay:.2s}.cmd.fx-cmdin .cbtn:nth-child(6){animation-delay:.25s}.cmd.fx-cmdin .cbtn:nth-child(7){animation-delay:.3s}
@keyframes fxCmdIn{0%{opacity:0;transform:translateY(10px) scale(.96)}100%{opacity:1;transform:none}}
.bhead .turn.fx-turn{animation:fxTurnGlow 1.2s ease}
@keyframes fxTurnGlow{0%,100%{text-shadow:none}30%{text-shadow:0 0 12px #ffd84a,0 0 2px #ffd84a}}
.fx-ripple{position:absolute;width:14px;height:14px;margin:-7px;border-radius:50%;background:#ffe9a055;animation:fxRipple .45s ease-out forwards;pointer-events:none}
@keyframes fxRipple{0%{transform:scale(.4);opacity:1}100%{transform:scale(7);opacity:0}}
#sndbtn{margin-right:6px}

@media (prefers-reduced-motion:reduce){.fx-amb,.fx-layer,.fx-stars,.fx-dice,.fx-confetti,.fx-bigmsg{display:none!important}[class*="fx-"]{animation:none!important}}
`;
  const st = document.createElement("style"); st.id = "fx-css"; st.textContent = css; document.head.appendChild(st);


  // ---------- iconos de monstruos más precisos (se revisan antes que los originales) ----------
  if (typeof MON_ICON !== "undefined") MON_ICON.unshift(
    [/elemental(es)? de hielo|kóbold|yeti|lobos? blanco/i, "❄️"], [/elemental(es)? de tormenta|anguila/i, "⚡"], [/medusa/i, "🦑"],
    [/wyrm|draco|pyrax|dragón/i, "🐉"], [/salamandra/i, "🦎"], [/gusano/i, "🐛"], [/escarabajo/i, "🐞"], [/espantapájaro/i, "🎃"],
    [/cuervo/i, "🐦"], [/bruja/i, "🧙"], [/bailar|súcubo|íncubo/i, "💃"], [/libro/i, "📖"], [/contrabandista|ladr/i, "🥷"],
    [/marinero|ahogad/i, "🧟"], [/gato/i, "🐈"], [/relojero|reloj/i, "⏳"], [/abstracto|sin forma/i, "🌀"], [/duerme debajo|subsuelo/i, "🐙"],
    [/gaviota/i, "🐦"], [/rey trol|troles? de lava/i, "🧌"], [/avatar corrupto|eclipse/i, "🌑"], [/eco del campeón|guardián de la cumbre|deseos/i, "☀️"], [/nixie/i, "🧜"]
  );


  // ---------- retratos de monstruos (carpeta monstruos/) ----------
  const MON_IMG = {"Gaviotas de fuego": "gaviotas-de-fuego", "Cangrejos de roca": "cangrejos-de-roca", "Espectros menores": "espectros-menores", "Nixies": "nixies", "Sapos gigantes": "sapos-gigantes", "Murciélagos de cuarzo": "murcielagos-de-cuarzo", "Espíritus del agua": "espiritus-del-agua", "Gólems de musgo": "golems-de-musgo", "Arañas tejedoras": "aranas-tejedoras", "Escarabajos gigantes": "escarabajos-gigantes", "Espantapájaros vivientes": "espantapajaros-vivientes", "Ratas gigantes": "ratas-gigantes", "Contrabandistas": "contrabandistas", "Lobos del bosque": "lobos-del-bosque", "Grifos salvajes": "grifos-salvajes", "Anguilas de trueno": "anguilas-de-trueno", "Medusas de rayo": "medusas-de-rayo", "Bestias del laberinto": "bestias-del-laberinto", "Kóbolds de hielo": "kobolds-de-hielo", "Marineros ahogados": "marineros-ahogados", "Lobos blancos": "lobos-blancos", "Elementales de hielo": "elementales-de-hielo", "Salamandras": "salamandras", "Libros vivientes": "libros-vivientes", "Elementales de tormenta": "elementales-de-tormenta", "Cuervos de hielo": "cuervos-de-hielo", "Gusanos de arena": "gusanos-de-arena", "Yetis salvajes": "yetis-salvajes", "Troles de lava": "troles-de-lava", "Espectros": "espectros", "Brujas menores": "brujas-menores", "Dracos menores": "dracos-menores", "Bailarines sombríos": "bailarines-sombrios", "Criaturas del subsuelo": "criaturas-del-subsuelo", "Guardianes de bruma": "guardianes-de-bruma", "Ecos del pasado": "ecos-del-pasado", "Criaturas sin forma": "criaturas-sin-forma", "Espectro de la Torre": "espectro-de-la-torre", "Gólem de Basalto": "golem-de-basalto", "Reina Araña Tejesombra": "reina-arana-tejesombra", "Rey de las Ratas": "rey-de-las-ratas", "Lobo de Sombra": "lobo-de-sombra", "Minotauro": "minotauro", "Capitana Ahogada": "capitana-ahogada", "Serpiente de Trueno": "serpiente-de-trueno", "Wyrm de Escarcha": "wyrm-de-escarcha", "La Esfinge": "la-esfinge", "Búho Anciano": "buho-anciano", "Rey Trol": "rey-trol", "Pyrax, Dragón de Lava": "pyrax-dragon-de-lava", "Súcubo o Íncubo del Salón": "sucubo-o-incubo-del-salon", "El Que Duerme Debajo": "el-que-duerme-debajo", "El Relojero": "el-relojero", "Gato de las Mil Vidas": "gato-de-las-mil-vidas", "El Primer Abstracto": "el-primer-abstracto", "Cultista del Crepúsculo": "cultista-del-crepusculo", "Capitán del Crepúsculo": "capitan-del-crepusculo", "Sacerdotisa del Crepúsculo": "sacerdotisa-del-crepusculo", "El Eclipse (Ilvara Nocturna)": "el-eclipse-ilvara-nocturna", "Avatar corrupto de Nyssa": "avatar-corrupto-de-nyssa", "Avatar corrupto de Orvath": "avatar-corrupto-de-orvath", "Avatar corrupto de Ignar": "avatar-corrupto-de-ignar", "Avatar corrupto de Mirael": "avatar-corrupto-de-mirael", "Heraldo de Vaelmor": "heraldo-de-vaelmor", "Vaelmor, medio despierto": "vaelmor-medio-despierto", "Eco del Campeón": "eco-del-campeon", "Guardián del Umbral": "guardian-del-umbral", "Guardián de la Cumbre": "guardian-de-la-cumbre", "El eco de todos los deseos": "el-eco-de-todos-los-deseos", "Avatar de Grudhal": "avatar-de-grudhal", "Avatar de Tharon": "avatar-de-tharon"};
  if (typeof monIcon === "function") {
    const _monIcon = monIcon;
    monIcon = function (e) { const k = e && MON_IMG[e.n]; return k ? `<img class="mimg" src="monstruos/${k}.png" alt="${esc(e.n)}">` : _monIcon(e); };
  }

  // ---------- cola de eventos del turno ----------
  const Q = [];
  let curT = 0, curSpell = null;
  const foeIdx = (name) => { const es = G?.g?.combat?.enemies || []; const i = es.findIndex((e) => e.n === name && e.pv > 0); return i >= 0 ? i : Math.max(0, es.findIndex((e) => e.n === name)); };
  const dice = (t) => { const m = t.match(/:\s*(\d)\+(\d)(?:\+(\d))?/); return m ? m.slice(1).filter(Boolean).map(Number) : null; };
  function classify(t) {
    const c = G?.g?.combat; if (!c) return;
    let m;
    if (/aparecen?\. Iniciativa/.test(t)) Q.push({ k: "intro", boss: c.enemies.some((e) => e.boss) });
    else if (/^Atacas con .*Fallas\./.test(t)) Q.push({ k: "miss", i: curT, dice: dice(t) });
    else if (/^Atacas con/.test(t)) Q.push({ k: "slash", i: curT, crit: /¡Crítico!/.test(t), dice: dice(t) });
    else if (/^Segundo golpe/.test(t)) Q.push({ k: "slash", i: curT, second: true });
    else if (/^Sobrecarga/.test(t)) Q.push({ k: "overload" });
    else if (curSpell && t.startsWith(curSpell.n + ":")) {
      if (/Falla y rebota/.test(t)) Q.push({ k: "backfire", aff: curSpell.aff, dice: dice(t) });
      else Q.push({ k: "spell", n: curSpell.n, circ: curSpell.c, kind: curSpell.kind, aff: curSpell.aff, st: curSpell.st, i: curT, dice: dice(t), eff: /súper eficaz/.test(t) ? "super" : /poco eficaz/.test(t) ? "weak" : null });
    }
    else if (/^Te pones en guardia/.test(t)) Q.push({ k: "guard" });
    else if ((m = t.match(/^Usas (.+)\.$/))) Q.push({ k: "potion", item: m[1] });
    else if (/^Intentas huir/.test(t)) Q.push({ k: "fleefail" });
    else if ((m = t.match(/^(.+) te golpea: (\d+)/))) Q.push({ k: "enemyhit", i: foeIdx(m[1]), dmg: +m[2], crit: /\(crítico\)/.test(t), absorbed: /escudo absorbe/.test(t) });
    else if ((m = t.match(/^(.+) ataca y falla\./))) Q.push({ k: "dodge", i: foeIdx(m[1]) });
    else if (/^Aster abre un umbral/.test(t)) Q.push({ k: "portal", i: foeIdx((t.match(/ataque de (.+?) pasa/) || [])[1] || "") });
    else if (/^Una ráfaga de Zefira/.test(t)) Q.push({ k: "wind" });
    else if ((m = t.match(/^(.+) se quema: −5 PV/))) Q.push({ k: "burn", who: "foe", i: foeIdx(m[1]) });
    else if (/^Te quemas/.test(t)) Q.push({ k: "burn", who: "me" });
    else if ((m = t.match(/^(.+) está aturdido y pierde el turno/))) Q.push({ k: "stun", who: "foe", i: foeIdx(m[1]) });
    else if (/^Estás aturdido/.test(t)) Q.push({ k: "stun", who: "me" });
    else if ((m = t.match(/^Quedas (quemado|aturdido|cegado|asustado)\./))) Q.push({ k: "status", who: "me", st: m[1] });
    else if ((m = t.match(/^(.+) queda (quemado|aturdido|cegado|asustado)\./))) Q.push({ k: "status", who: "foe", i: foeIdx(m[1]), st: m[2] });
    else if (/^Resistes el estado|^Tu dios te protege/.test(t)) Q.push({ k: "resist", who: "me" });
    else if ((m = t.match(/^(.+) resiste el estado/))) Q.push({ k: "resist", who: "foe", i: foeIdx(m[1]) });
    else if (/^El hilo de Norna/.test(t)) Q.push({ k: "norna" });
    else if (/^Bendición de/.test(t)) Q.push({ k: "bless" });
    else if (/^¡Milagro!/.test(t)) Q.push({ k: "miracle" });
  }
  const _clog = clog;
  clog = function (t) { _clog(t); if (!RM) { try { classify(String(t)); } catch (e) {} } };
  const _pAttack = pAttack;
  pAttack = function (ti, spell) { curT = ti; curSpell = spell || null; try { return _pAttack.apply(this, arguments); } finally { curSpell = null; } };

  // ---------- utilidades de dibujo ----------
  // Los efectos se dibujan en una capa aparte (#fx-root) para que no se borren
  // cuando el juego vuelve a dibujar la pantalla (por ejemplo, al sincronizar con Supabase).
  const root = document.createElement("div"); root.id = "fx-root"; document.body.appendChild(root);
  const stageEl = () => $q(".battle .stage");
  const foeSprite = (i) => $q(`.foes2 .foe2:nth-child(${(i || 0) + 1}) .sprite`);
  const foeBtn = (i) => $q(`.foes2 .foe2:nth-child(${(i || 0) + 1})`);
  const meSprite = () => $q(".me2 .sprite");
  const who = (ev) => (ev.who === "me" ? meSprite() : foeSprite(ev.i));
  function box(host, clip) {
    // posición real sin contar zooms/sacudidas en curso (offset ignora transform)
    let x = 0, y = 0, e = host; while (e) { x += e.offsetLeft || 0; y += e.offsetTop || 0; e = e.offsetParent; }
    const r = { left: x - scrollX, top: y - scrollY, width: host.offsetWidth, height: host.offsetHeight }; const d = document.createElement("div");
    d.className = "fx-layer" + (clip ? " clip" : "");
    d.style.cssText = `left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;height:${r.height}px`;
    root.appendChild(d); return d;
  }
  function add(host, html, ms = 1200, extra = "") {
    if (!host) return null; const d = box(host, host.classList.contains("stage"));
    if (extra) d.classList.add(...extra.split(" ")); d.innerHTML = html; setTimeout(() => d.remove(), ms); return d;
  }
  const pop = (host, text, c, big) => add(host, `<em class="fx-pop ${big ? "big" : ""}" style="--c:${c}">${text}</em>`, 1300);
  function sparks(c, n = 10, dist = 60) { let h = ""; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + rnd(-0.2, 0.2); const r = rnd(dist * 0.6, dist); h += `<i class="fx-spark" style="--c:${c};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r}px"></i>`; } return h; }
  function burst(host, c, n = 10) { add(host, `<i class="fx-core" style="--c:${c}"></i><i class="fx-ring" style="--c:${c}"></i>${sparks(c, n)}`, 900); }
  // Animaciones de clase que sobreviven a un redibujado: se vuelven a aplicar con el tiempo ya transcurrido.
  const running = [];
  function klass(find, cls, ms) {
    const el = find(); if (!el) return; const it = { find, cls, ms, start: performance.now() };
    running.push(it); el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(() => { const e = find(); if (e) { e.classList.remove(cls); e.style.animationDelay = ""; } const k = running.indexOf(it); if (k >= 0) running.splice(k, 1); }, ms);
  }
  function resumeRunning() {
    const now = performance.now();
    for (const it of running) { const el = it.find(); const t = now - it.start; if (el && t < it.ms && !el.classList.contains(it.cls)) { el.style.animationDelay = `-${Math.round(t)}ms`; el.classList.add(it.cls); } }
  }
  const shake = (hard) => klass(stageEl, hard ? "fx-shake-hard" : "fx-shake", hard ? 520 : 380);
  const flash = (c = "#fff") => add(stageEl(), `<i class="fx-flash" style="--c:${c}"></i>`, 400);
  function center(el, host) { const a = el.getBoundingClientRect(), b = host.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 }; }
  function projectile(from, to, c, ms = 380) {
    const s = stageEl(); if (!s || !from || !to) return;
    const layer = add(s, "", ms + 50); const p = center(from, s), q = center(to, s);
    const o = document.createElement("i"); o.className = "fx-orb"; o.style.cssText = `--c:${c};left:${p.x}px;top:${p.y}px`; layer.appendChild(o);
    const mid = { x: (p.x + q.x) / 2, y: Math.min(p.y, q.y) - 40 };
    if (o.animate) o.animate([{ transform: "translate(0,0) scale(.6)" }, { transform: `translate(${mid.x - p.x}px,${mid.y - p.y}px) scale(1.1)`, offset: 0.5 }, { transform: `translate(${q.x - p.x}px,${q.y - p.y}px) scale(.9)` }], { duration: ms, easing: "ease-in", fill: "forwards" });
  }
  function diceShow(ds) { if (!ds || !ds.length) return; add(stageEl(), `<div class="fx-dice">${ds.map((n) => `<b class="${n === 6 ? "six" : ""}">${n}</b>`).join("")}</div>`, 1600); }
  function rise(host, c, chars, n = 6, dots) { let h = ""; for (let k = 0; k < n; k++) h += `<em class="fx-rise ${dots ? "dot" : ""}" style="--c:${c};left:${rnd(15, 80)}%;animation-delay:${k * 0.09}s">${dots ? "" : chars[k % chars.length]}</em>`; add(host, h, 1600); }

  // ---------- efectos por evento ----------
  function impactByAff(target, aff, crit) {
    const c = col(aff); const s = stageEl();
    if (aff === "Rayo" && s && target) { const x = center(target, s).x; add(s, `<i class="fx-bolt" style="--c:${c};left:${x}px;height:${center(target, s).y + 20}px"></i>`, 600); flash("#fff7c2"); }
    if (aff === "Luz" && s && target) { const x = center(target, s).x; add(s, `<i class="fx-beam" style="--c:${c};left:${x}px;height:${center(target, s).y + 30}px"></i>`, 700); }
    if (aff === "Tierra" && target) { let h = ""; for (let k = 0; k < 6; k++) h += `<i class="fx-rock" style="left:${rnd(15, 80)}%;--fall:${rnd(70, 100)}px;animation-delay:${k * 0.05}s"></i>`; add(target, h, 900); }
    if (aff === "Sombra" && target) { let h = ""; for (let k = 0; k < 5; k++) h += `<i class="fx-smoke" style="--c:${c};--dx:${rnd(-40, 40)}px;--dy:${rnd(-40, 10)}px;animation-delay:${k * 0.06}s"></i>`; add(target, h, 1100); }
    if (aff === "Aire" && target) add(target, `<i class="fx-swirl" style="--c:${c}"></i><i class="fx-swirl" style="--c:${c};animation-delay:.1s"></i>`, 900);
    if (aff === "Fuego" && target) rise(target, c, [], 8, true);
    if (aff === "Agua" && target) add(target, `<i class="fx-ring" style="--c:${c}"></i><i class="fx-ring" style="--c:${c};animation-delay:.12s"></i><i class="fx-ring" style="--c:${c};animation-delay:.24s"></i>`, 900);
    burst(target, c, crit ? 16 : 10);
  }
  const RUN = {
    intro(ev) {
      document.querySelectorAll(".foes2 .foe2").forEach((f, i) => klass(() => foeBtn(i), "fx-enter-r", 700)); klass(() => $q(".me2"), "fx-enter-l", 800);
      add(stageEl(), `<div class="fx-banner" style="--c:${ev.boss ? "#e0584a" : "#d9a441"}">${ev.boss ? L("¡JEFE!", "BOSS!") : L("¡COMBATE!", "FIGHT!")}</div>`, 1300);
      if (ev.boss) setTimeout(() => shake(true), 250);
      return 900;
    },
    slash(ev) {
      const t = foeSprite(ev.i); if (!ev.second) { diceShow(ev.dice); klass(meSprite, "fx-lunge-me", 380); }
      add(t, `<i class="fx-slash ${ev.crit ? "crit" : ""}" style="--r:-35deg"></i>${ev.crit || ev.second ? `<i class="fx-slash b ${ev.crit ? "crit" : ""}" style="--r:35deg"></i>` : ""}`, 600);
      if (ev.crit) { setTimeout(() => { const t = foeSprite(ev.i); flash("#ffe9a0"); shake(true); pop(t, L("¡CRÍTICO!", "CRITICAL!"), "#ffd84a", true); burst(t, "#ffd84a", 14); }, 120); }
      else setTimeout(() => add(foeSprite(ev.i), sparks("#fff", 6, 40), 700), 120);
      return ev.second ? 300 : 420;
    },
    miss(ev) { diceShow(ev.dice); klass(meSprite, "fx-lunge-me", 380); const t = foeSprite(ev.i); klass(() => foeSprite(ev.i), "fx-dodge", 480); pop(t, L("¡Fallo!", "Miss!"), "#c9c9c9"); return 450; },
    spell(ev) {
      diceShow(ev.dice); const c = col(ev.aff); const me = meSprite(); const t = foeSprite(ev.i);
      if (ev.kind === "heal") { burst(me, "#8be0a8", 8); rise(me, "#8be0a8", ["+", "✚", "+"], 8); return 600; }
      if (ev.kind === "shield") { add(me, `<i class="fx-bubble" style="--c:${c}"></i>${sparks(c, 8, 50)}`, 900); return 600; }
      if (ev.kind === "buff") { rise(me, "#ffd84a", ["⬆", "✦", "⬆"], 7); burst(me, "#ffd84a", 6); return 600; }
      add(me, `<i class="fx-core" style="--c:${c}"></i>`, 500); // carga
      const direct = ev.aff === "Rayo" || ev.aff === "Luz";
      if (!direct) projectile(me, t, c, 380);
      setTimeout(() => {
        const t = foeSprite(ev.i); impactByAff(t, ev.aff);
        if (ev.eff === "super") { pop(t, L("¡Súper eficaz!", "Super effective!"), "#ff9a3c", true); shake(false); }
        else if (ev.eff === "weak") pop(t, L("Poco eficaz", "Not very effective"), "#9aa4b2");
      }, direct ? 120 : 380);
      return 750;
    },
    backfire(ev) { diceShow(ev.dice); add(meSprite(), `<i class="fx-core" style="--c:${col(ev.aff)}"></i>`, 400); setTimeout(() => { const me = meSprite(); burst(me, "#e0584a", 10); shake(false); pop(me, L("¡Rebota!", "Backfire!"), "#ff8b7a"); }, 250); return 600; },
    overload() { const me = meSprite(); add(me, `<i class="fx-ring" style="--c:#e0584a"></i>${sparks("#ffb03a", 8, 45)}`, 800); pop(me, L("Sobrecarga", "Overload"), "#ffb03a"); return 350; },
    guard() { const me = meSprite(); add(me, `<i class="fx-bubble" style="--c:#7fc8ff"></i>`, 800); pop(me, "🛡️", "#7fc8ff", true); return 400; },
    potion(ev) {
      const kind = (typeof SHOP !== "undefined" && SHOP.find((s) => s.n === ev.item)?.kind) || "potion";
      const c = { potion: "#8be0a8", mana: "#5a8ee0", energy: "#ffd84a" }[kind] || "#8be0a8";
      rise(meSprite(), c, [], 9, true); burst(meSprite(), c, 6); return 500;
    },
    fleefail() { klass(meSprite, "fx-stumble", 520); pop(meSprite(), L("¡No escapas!", "Can't escape!"), "#ff8b7a"); return 500; },
    enemyhit(ev) {
      klass(() => foeSprite(ev.i), "fx-lunge-foe", 420);
      setTimeout(() => {
        const me = meSprite();
        add(me, [0, 1, 2].map((k) => `<i class="fx-claw" style="left:${32 + k * 14}%;animation-delay:${k * 0.05}s"></i>`).join(""), 700);
        if (ev.absorbed) { let h = ""; for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.28; h += `<i class="fx-shard" style="--dx:${Math.cos(a) * 55}px;--dy:${Math.sin(a) * 55}px;transform:rotate(${k * 45}deg)"></i>`; } add(me, h, 800); }
        shake(ev.crit); if (ev.crit) { flash("#ff5a4a"); pop(me, L("¡Crítico!", "Critical!"), "#ff5a4a", true); }
      }, 170);
      return 600;
    },
    dodge(ev) { klass(() => foeSprite(ev.i), "fx-lunge-foe", 420); setTimeout(() => { klass(meSprite, "fx-dodge", 480); pop(meSprite(), L("¡Esquivado!", "Dodged!"), "#c8f3ff"); }, 150); return 550; },
    portal(ev) { klass(() => foeSprite(ev.i), "fx-lunge-foe", 420); add(meSprite(), `<i class="fx-swirl" style="--c:#a98bff"></i><i class="fx-ring" style="--c:#a98bff"></i>`, 900); pop(meSprite(), L("¡Umbral!", "Rift!"), "#a98bff"); return 550; },
    wind() { add(meSprite(), `<i class="fx-swirl" style="--c:#c8f3ff"></i><i class="fx-swirl" style="--c:#c8f3ff;animation-delay:.12s"></i>`, 900); pop(meSprite(), L("¡Desviado!", "Deflected!"), "#c8f3ff"); return 500; },
    burn(ev) { const h = who(ev); rise(h, "#ff7a2e", [], 7, true); pop(h, "🔥 −5", "#ff7a2e"); return 400; },
    stun(ev) { const h = who(ev); pop(h, "💫", "#ffe14d", true); return 400; },
    status(ev) { const h = who(ev); const cap = ev.st[0].toUpperCase() + ev.st.slice(1); const c = ST_COL[cap] || "#b98cf0"; add(h, `<i class="fx-ring" style="--c:${c}"></i>`, 700); pop(h, { Quemado: "🔥", Aturdido: "💫", Cegado: "🙈", Asustado: "😱" }[cap] + " " + L(cap, { Quemado: "Burned", Aturdido: "Stunned", Cegado: "Blinded", Asustado: "Scared" }[cap]), c); return 450; },
    resist(ev) { pop(who(ev), L("¡Resiste!", "Resisted!"), "#e8dcc0"); return 350; },
    norna() { const me = meSprite(); add(me, `<i class="fx-core" style="--c:#e8c878"></i><i class="fx-ring" style="--c:#e8c878"></i>`, 900); pop(me, L("¡Sigues en pie!", "Still standing!"), "#e8c878", true); return 500; },
    bless() { const me = meSprite(); const s = stageEl(); if (s && me) add(s, `<i class="fx-beam" style="--c:#ffe9a0;left:${center(me, s).x}px;height:${center(me, s).y + 30}px"></i>`, 800); rise(me, "#ffe9a0", ["✦", "✧"], 8); return 650; },
    miracle() { flash("#fff6d0"); shake(true); document.querySelectorAll(".foes2 .foe2 .sprite").forEach((f) => impactByAff(f, "Luz", true)); rise(meSprite(), "#8be0a8", ["+", "✚"], 10); add(stageEl(), `<div class="fx-banner" style="--c:#ffe9a0">${L("¡MILAGRO!", "MIRACLE!")}</div>`, 1300); return 1000; },
  };
  // =====================================================================
  // ---------- v2: sonido (sintetizado, sin archivos) ----------
  const SND = { on: (() => { try { return localStorage.getItem("sa-sound") !== "off"; } catch (e) { return true; } })(), ctx: null, master: null,
    vol: (() => { try { const v = parseFloat(localStorage.getItem("sa-vol")); return isNaN(v) ? 1 : v; } catch (e) { return 1; } })() };
  function ac() {
    if (!SND.on) return null;
    try {
      if (!SND.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; SND.ctx = new A(); const comp = SND.ctx.createDynamicsCompressor(); SND.master = SND.ctx.createGain(); SND.master.gain.value = 0.32 * SND.vol; SND.master.connect(comp); comp.connect(SND.ctx.destination); }
      if (SND.ctx.state === "suspended") SND.ctx.resume();
      return SND.ctx;
    } catch (e) { return null; }
  }
  function tone(f, dur, o = {}) {
    const c = ac(); if (!c) return; const t = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator(), g = c.createGain(); osc.type = o.type || "sine"; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur);
    if (o.detune) osc.detune.value = o.detune;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol ?? 0.4, t + (o.attack || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(SND.master); osc.start(t); osc.stop(t + dur + 0.05);
  }
  let NB = null;
  function noise(dur, o = {}) {
    const c = ac(); if (!c) return; const t = c.currentTime + (o.delay || 0);
    if (!NB) { NB = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const src = c.createBufferSource(); src.buffer = NB; const fl = c.createBiquadFilter(); fl.type = o.filter || "lowpass"; fl.frequency.setValueAtTime(o.f || 1200, t); fl.Q.value = o.q || 1;
    if (o.fTo) fl.frequency.exponentialRampToValueAtTime(Math.max(30, o.fTo), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol ?? 0.4, t + (o.attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(fl); fl.connect(g); g.connect(SND.master); src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }
  const arp = (notes, step, o = {}) => notes.forEach((n, i) => tone(n, o.len || 0.25, { ...o, delay: (o.delay || 0) + i * step }));
  const SFX = {
    click() { tone(720, 0.05, { type: "triangle", vol: 0.05 }); },
    slash() { noise(0.2, { filter: "bandpass", f: 3200, fTo: 700, q: 1.4, vol: 0.45 }); },
    hit() { tone(140, 0.16, { to: 50, vol: 0.7 }); noise(0.09, { f: 900, vol: 0.35 }); },
    crit() { SFX.hit(); tone(1320, 0.4, { type: "triangle", vol: 0.2, delay: 0.03 }); tone(1980, 0.45, { type: "triangle", vol: 0.14, delay: 0.08 }); noise(0.3, { filter: "highpass", f: 5000, vol: 0.12, delay: 0.03 }); },
    miss() { noise(0.24, { filter: "bandpass", f: 4500, fTo: 1600, q: 2.5, vol: 0.28 }); },
    charge() { tone(220, 0.4, { type: "sawtooth", to: 660, vol: 0.07 }); tone(330, 0.4, { to: 990, vol: 0.12 }); noise(0.4, { filter: "bandpass", f: 800, fTo: 3000, q: 4, vol: 0.08 }); },
    cast() { noise(0.3, { filter: "bandpass", f: 1200, fTo: 400, q: 1.5, vol: 0.25 }); },
    impact(aff) {
      const A = {
        Fuego() { noise(0.55, { f: 3500, fTo: 250, vol: 0.6 }); tone(90, 0.35, { to: 40, vol: 0.5 }); },
        Agua() { tone(700, 0.25, { to: 180, vol: 0.3 }); tone(1000, 0.2, { to: 300, vol: 0.2, delay: 0.06 }); noise(0.3, { filter: "bandpass", f: 1400, q: 2, vol: 0.2 }); },
        Tierra() { tone(75, 0.45, { to: 32, vol: 0.9 }); noise(0.35, { f: 420, vol: 0.5 }); },
        Aire() { noise(0.55, { filter: "bandpass", f: 700, fTo: 3200, q: 3, vol: 0.4 }); },
        Rayo() { noise(0.12, { filter: "highpass", f: 2500, vol: 0.7 }); noise(0.7, { f: 6000, fTo: 150, vol: 0.55, delay: 0.04 }); tone(55, 0.8, { to: 30, vol: 0.5, delay: 0.05 }); },
        Luz() { [880, 1109, 1319, 1760].forEach((f, i) => tone(f, 0.7, { type: "triangle", vol: 0.1, delay: i * 0.02 })); },
        Sombra() { tone(220, 0.7, { type: "sawtooth", to: 55, vol: 0.12 }); tone(226, 0.7, { type: "sawtooth", to: 57, vol: 0.1 }); noise(0.5, { f: 500, fTo: 80, vol: 0.3 }); },
      };
      (A[aff] || (() => { tone(440, 0.3, { type: "square", to: 880, vol: 0.06 }); noise(0.2, { f: 2000, vol: 0.2 }); }))();
    },
    heal() { arp([523, 659, 784, 1046], 0.07, { type: "sine", vol: 0.16, len: 0.4 }); },
    shield() { tone(1200, 0.6, { type: "triangle", vol: 0.12 }); tone(1800, 0.5, { type: "sine", vol: 0.08, delay: 0.04 }); },
    buff() { arp([392, 494, 587, 784], 0.06, { type: "triangle", vol: 0.12, len: 0.3 }); },
    windup() { tone(110, 0.22, { type: "sawtooth", to: 90, vol: 0.06 }); },
    ehit(heavy) { tone(95, 0.28, { to: 42, vol: heavy ? 1 : 0.8 }); noise(0.18, { f: 700, vol: 0.55 }); if (heavy) noise(0.4, { f: 300, vol: 0.4, delay: 0.05 }); },
    dodge() { noise(0.22, { filter: "bandpass", f: 3000, fTo: 5500, q: 2, vol: 0.22 }); },
    potion() { for (let i = 0; i < 5; i++) tone(rnd(400, 950), 0.07, { vol: 0.12, delay: i * 0.06, to: rnd(900, 1400) }); },
    stun() { arp([1500, 1900, 1600], 0.07, { type: "sine", vol: 0.08, len: 0.1 }); },
    burn() { noise(0.4, { filter: "highpass", f: 3000, vol: 0.12 }); },
    status() { tone(300, 0.4, { type: "triangle", to: 180, vol: 0.12 }); },
    death() { noise(0.7, { f: 2500, fTo: 90, vol: 0.4 }); tone(320, 0.6, { to: 60, type: "triangle", vol: 0.2 }); },
    victory() { arp([523, 659, 784], 0.11, { type: "triangle", vol: 0.2, len: 0.22 }); tone(1046, 0.9, { type: "triangle", vol: 0.22, delay: 0.33 }); tone(784, 0.9, { type: "sine", vol: 0.12, delay: 0.33 }); tone(659, 0.9, { type: "sine", vol: 0.1, delay: 0.33 }); },
    defeat() { arp([392, 330, 262], 0.28, { type: "sawtooth", vol: 0.07, len: 0.45 }); tone(65, 1.4, { to: 40, vol: 0.4, delay: 0.3 }); },
    level() { arp([523, 587, 659, 784, 880, 1046, 1175, 1568], 0.05, { type: "triangle", vol: 0.12, len: 0.3 }); },
    chapter() { [660, 990, 1320].forEach((f, i) => tone(f, 2, { type: "sine", vol: 0.12 / (i + 1), attack: 0.01 })); tone(330, 2.2, { vol: 0.08 }); },
    boss() { tone(55, 1.4, { to: 28, vol: 1 }); noise(1.1, { f: 220, vol: 0.6 }); tone(110, 1.6, { type: "sawtooth", vol: 0.05, delay: 0.2 }); tone(116, 1.6, { type: "sawtooth", vol: 0.05, delay: 0.2 }); },
    fight() { tone(120, 0.2, { to: 60, vol: 0.6 }); tone(120, 0.2, { to: 60, vol: 0.6, delay: 0.16 }); noise(0.25, { filter: "bandpass", f: 2500, vol: 0.2, delay: 0.3 }); },
    heart() { tone(60, 0.12, { vol: 0.6 }); tone(55, 0.14, { vol: 0.5, delay: 0.18 }); },
    flee() { noise(0.35, { filter: "bandpass", f: 1500, fTo: 4000, q: 2, vol: 0.25 }); },
  };
  window.SA_SFX = SFX;
  function soundButton() {
    let b = document.getElementById("sndbtn"); const lang = document.getElementById("langbtn");
    if (!b && lang && lang.parentNode) { b = document.createElement("button"); b.id = "sndbtn"; b.type = "button"; b.className = "btn small ghost"; lang.parentNode.insertBefore(b, lang); b.addEventListener("click", () => { SND.on = !SND.on; try { localStorage.setItem("sa-sound", SND.on ? "on" : "off"); } catch (e) {} if (SND.on) SFX.click(); soundButton(); }); }
    if (b) { b.textContent = SND.on ? "🔊" : "🔇"; b.title = SND.on ? L("Silenciar efectos", "Mute effects") : L("Activar sonido", "Turn sound on"); }
    let r = document.getElementById("sndvol");
    if (!r && b) {
      r = document.createElement("input"); r.id = "sndvol"; r.type = "range"; r.min = "0"; r.max = "1.5"; r.step = "0.05"; r.value = String(SND.vol);
      r.setAttribute("aria-label", L("Volumen de efectos", "Effects volume")); b.after(r);
      r.addEventListener("input", () => { SND.vol = +r.value; try { localStorage.setItem("sa-vol", r.value); } catch (e) {} if (SND.master) SND.master.gain.value = 0.32 * SND.vol; });
      r.addEventListener("change", () => SFX.click());
    }
    if (r) r.hidden = !SND.on;
  }
  // clic: sonido suave + onda
  document.addEventListener("pointerdown", (ev) => {
    const b = ev.target.closest && ev.target.closest(".btn,.cbtn,.act,.pl,.foe2"); if (!b || b.disabled) return;
    if (!b.classList.contains("cbtn") || !b.matches(".atk,.spell,[data-bcast]")) SFX.click();
    if (!RM) { const d = document.createElement("i"); d.className = "fx-ripple"; d.style.cssText = `position:absolute;left:${ev.pageX}px;top:${ev.pageY}px`; root.appendChild(d); setTimeout(() => d.remove(), 500); }
  }, true);

  // ---------- v2: más efectos sobre los de antes ----------
  const hitflash = (find) => klass(find, "fx-hitflash", 110);
  const camPunch = () => klass(stageEl, "fx-cam", 460);
  const edge = (c) => { if (RM) return; const e = document.createElement("div"); e.className = "fx-edge"; e.style.setProperty("--c", c); document.body.appendChild(e); setTimeout(() => e.remove(), 550); };
  function magicCircle(host, c, ms = 900) {
    const spokes = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="${50 + Math.cos(a) * 34}" y1="${50 + Math.sin(a) * 34}" x2="${50 + Math.cos(a) * 44}" y2="${50 + Math.sin(a) * 44}"/>`; }).join("");
    const tri = (r, rot) => { const p = [0, 1, 2].map((k) => { const a = rot + (k / 3) * Math.PI * 2; return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`; }).join(" "); return `<polygon points="${p}"/>`; };
    add(host, `<div class="fx-circle" style="--c:${c}"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="none" stroke="${c}" stroke-width="1.2"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="33" stroke-dasharray="3 2"/>${spokes}${tri(33, -Math.PI / 2)}${tri(33, Math.PI / 2)}</g></svg></div>`, ms);
  }
  function trailOrb(c) {
    const orb = [...root.querySelectorAll(".fx-orb")].pop(); if (!orb) return; const layer = orb.parentElement; const t0 = performance.now();
    const step = () => { if (!orb.isConnected || performance.now() - t0 > 420) return; const r = orb.getBoundingClientRect(), L0 = layer.getBoundingClientRect(); const d = document.createElement("i"); d.className = "fx-trail"; d.style.cssText = `--c:${c};left:${r.left - L0.left + r.width / 2 + rnd(-3, 3)}px;top:${r.top - L0.top + r.height / 2 + rnd(-3, 3)}px`; layer.appendChild(d); setTimeout(() => d.remove(), 460); requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const base = { ...RUN };
  RUN.intro = (ev) => {
    if (!ev.boss) { SFX.fight(); klass(stageEl, "fx-cam-in", 1000); return base.intro(ev); }
    const c = G?.g?.combat; const e = c?.enemies.find((x) => x.boss) || c?.enemies[0]; const s = stageEl();
    SFX.boss(); klass(stageEl, "fx-cam-in", 1000); document.querySelectorAll(".foes2 .foe2").forEach((f, i) => klass(() => foeSprite(i), "fx-silhouette", 1450)); klass(() => $q(".me2"), "fx-enter-l", 800);
    add(s, `<i class="fx-lbox t"></i><i class="fx-lbox b"></i><i class="fx-darken"></i><div class="fx-title" style="--c:#e0584a"><b>${esc(e?.n || L("Jefe", "Boss"))}</b><span>${L("JEFE", "BOSS")} · ${L("NIVEL", "LEVEL")} ${e?.lvl ?? "?"}</span></div>`, 1700);
    setTimeout(() => shake(true), 200); setTimeout(() => shake(false), 700);
    return 1700;
  };
  RUN.slash = (ev) => { const r = base.slash(ev); setTimeout(() => { hitflash(() => foeSprite(ev.i)); if (ev.crit) { SFX.crit(); camPunch(); add(foeSprite(ev.i), `<i class="fx-shock" style="--c:#ffd84a"></i>`, 700); } else SFX.hit(); }, ev.second ? 60 : 110); if (!ev.second) SFX.slash(); return r; };
  RUN.miss = (ev) => { SFX.miss(); return base.miss(ev); };
  RUN.spell = (ev) => {
    const c = col(ev.aff);
    if (ev.kind === "heal") { SFX.heal(); magicCircle(meSprite(), "#8be0a8", 900); return base.spell(ev); }
    if (ev.kind === "shield") { SFX.shield(); magicCircle(meSprite(), c, 900); return base.spell(ev); }
    if (ev.kind === "buff") { SFX.buff(); magicCircle(meSprite(), "#ffd84a", 900); return base.spell(ev); }
    diceShow(ev.dice); SFX.charge(); magicCircle(meSprite(), c, 1100); add(meSprite(), `<i class="fx-core" style="--c:${c}"></i>`, 500);
    setTimeout(() => {
      SFX.cast(); base.spell({ ...ev, dice: null });
      if (ev.aff !== "Rayo" && ev.aff !== "Luz") trailOrb(c);
      const direct = ev.aff === "Rayo" || ev.aff === "Luz";
      setTimeout(() => { SFX.impact(ev.aff); hitflash(() => foeSprite(ev.i)); add(foeSprite(ev.i), `<i class="fx-shock" style="--c:${c}"></i>`, 700); camPunch(); if (ev.eff === "super") edge(c); }, direct ? 120 : 380);
    }, 300);
    return 1050;
  };
  RUN.backfire = (ev) => { setTimeout(() => { SFX.ehit(false); edge("#e0584a"); }, 250); return base.backfire(ev); };
  RUN.overload = (ev) => { noise(0.3, { filter: "highpass", f: 3000, vol: 0.2 }); return base.overload(ev); };
  RUN.guard = (ev) => { SFX.shield(); return base.guard(ev); };
  RUN.potion = (ev) => { SFX.potion(); return base.potion(ev); };
  RUN.fleefail = (ev) => { SFX.miss(); return base.fleefail(ev); };
  RUN.enemyhit = (ev) => {
    const heavy = ev.crit || (G?.pvMax && ev.dmg / G.pvMax >= 0.15);
    klass(() => foeSprite(ev.i), "fx-windup", 260); SFX.windup();
    setTimeout(() => {
      base.enemyhit({ ...ev, crit: ev.crit });
      setTimeout(() => { SFX.ehit(heavy); hitflash(meSprite); edge(ev.crit ? "#ff3b2e" : "#e0584a88"); if (heavy && !ev.crit) shake(true); if (heavy) camPunch(); }, 170);
    }, 220);
    return 820;
  };
  RUN.dodge = (ev) => { klass(() => foeSprite(ev.i), "fx-windup", 260); SFX.windup(); setTimeout(() => { base.dodge(ev); setTimeout(SFX.dodge, 150); }, 220); return 780; };
  RUN.portal = (ev) => { SFX.dodge(); return base.portal(ev); };
  RUN.wind = (ev) => { SFX.dodge(); return base.wind(ev); };
  RUN.burn = (ev) => { SFX.burn(); return base.burn(ev); };
  RUN.stun = (ev) => { SFX.stun(); return base.stun(ev); };
  RUN.status = (ev) => { SFX.status(); return base.status(ev); };
  RUN.resist = (ev) => { SFX.shield(); return base.resist(ev); };
  RUN.norna = (ev) => { SFX.heal(); return base.norna(ev); };
  RUN.bless = (ev) => { SFX.impact("Luz"); SFX.heal(); return base.bless(ev); };
  RUN.miracle = (ev) => { SFX.impact("Luz"); SFX.impact("Rayo"); SFX.heal(); return base.miracle(ev); };
  const DUR = { intro: (e) => (e.boss ? 1750 : 950), slash: (e) => (e.second ? 280 : e.crit ? 560 : 440), miss: 460, spell: (e) => (["heal", "shield", "buff"].includes(e.kind) ? 650 : 1080), backfire: 620, enemyhit: 840, dodge: 800, portal: 560, wind: 520 };
  RUN.ally = (ev) => {
    const t = foeSprite(ev.i || 0); if (!t) return 300;
    if (ev.heal) { rise(meSprite(), "#8be0a8", ["+", "✚"], 6); pop(meSprite(), `${ev.who} +${ev.heal}`, "#8be0a8"); SFX.heal(); return 450; }
    add(t, `<i class="fx-slash" style="--r:-20deg;--c:${ev.c || "#9ad0ff"}"></i>`, 500); hitflash(() => foeSprite(ev.i || 0));
    setTimeout(() => { pop(foeSprite(ev.i || 0), `${ev.who} −${ev.dmg}`, ev.c || "#9ad0ff"); SFX.hit(); }, 90);
    return 450;
  };
  DUR.ally = 460;
  window.SA_FXQ = (ev) => { if (!RM) Q.push(ev); };
  // ---------- fin v2 ----------

  // ---------- v3: golpe según el arma, afinidades que faltaban, nombre del hechizo ----------
  const W_AFF = [[/fuego|llama|brasa/i, "Fuego"], [/rayo|trueno/i, "Rayo"], [/luz|solar/i, "Luz"], [/sombra|noche/i, "Sombra"], [/escarcha|hielo|agua/i, "Agua"], [/roca|piedra|tierra/i, "Tierra"], [/vendaval|viento|aire/i, "Aire"]];
  function weaponStyle() {
    const n = G?.g?.arma?.n || "Puños";
    const base = typeof ARMAS_INFO !== "undefined" ? Object.keys(ARMAS_INFO).filter((k) => n.startsWith(k)).sort((a, b) => b.length - a.length)[0] : null;
    const tags = (base && ARMAS_INFO[base][1]) || [];
    const aff = (W_AFF.find(([re]) => re.test(n)) || [])[1] || null;
    const st = /arco|ballesta|honda/i.test(n) ? "arrow" : /kunai|shuriken|bumer/i.test(n) ? "star"
      : /bast[oó]n|b[aá]culo|varita|cetro/i.test(n) ? "orb" : /pu[ñn]os|guantelete|nunchaku/i.test(n) ? "fist"
      : /lanza|alabarda|estoque|tridente/i.test(n) ? "thrust" : /l[aá]tigo/i.test(n) ? "whip"
      : tags.includes("pesada") || /martillo|mandoble|hacha|guada[ñn]a|maza/i.test(n) ? "heavy"
      : /daga|katana|cimitarra/i.test(n) || tags.includes("critica") ? "quick" : "sword";
    return { st, aff, c: aff ? col(aff) : "#fff" };
  }
  function shot(from, to, cls, c, ms) {
    const s = stageEl(); if (!s || !from || !to) return; const layer = add(s, "", ms + 60); const p = center(from, s), q = center(to, s);
    const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    const o = document.createElement("i"); o.className = cls; o.style.cssText = `--c:${c};left:${p.x}px;top:${p.y}px;--a:${ang}deg`; layer.appendChild(o);
    o.animate?.([{ translate: "0 0" }, { translate: `${q.x - p.x}px ${q.y - p.y}px` }], { duration: ms, easing: "cubic-bezier(.3,0,.9,.6)", fill: "forwards" });
  }
  const v2slash = RUN.slash;
  RUN.slash = (ev) => {
    const w = weaponStyle(); const me = meSprite(); const t = foeSprite(ev.i);
    if (w.st === "sword") { const r = v2slash(ev); if (w.aff) setTimeout(() => impactByAff(foeSprite(ev.i), w.aff, ev.crit), 130); return r; }
    const crit = ev.crit, c = crit ? "#ffd84a" : w.c;
    let hitAt = 110;
    if (!ev.second) diceShow(ev.dice);
    if (w.st === "arrow" || w.st === "star" || w.st === "orb") {
      klass(meSprite, "fx-recoil", 300); SFX.miss();
      shot(me, t, w.st === "arrow" ? "fx-arrow" : w.st === "star" ? "fx-star" : "fx-orb", w.aff ? w.c : w.st === "orb" ? "#cfe6ff" : "#fff", 300); hitAt = 300;
    } else { klass(meSprite, w.st === "heavy" ? "fx-lunge-heavy" : "fx-lunge-me", w.st === "heavy" ? 520 : 380); if (!ev.second) SFX.slash(); if (w.st === "heavy") hitAt = 260; }
    setTimeout(() => {
      const t = foeSprite(ev.i); if (!t) return;
      const fx = {
        heavy: `<i class="fx-smash" style="--c:${c}"></i><i class="fx-cut" style="--c:${c}"></i><i class="fx-shock" style="--c:${c}"></i>`,
        quick: [-50, 20, -10].map((r, k) => `<i class="fx-slash thin" style="--r:${r}deg;--c:${c};animation-delay:${k * 0.06}s"></i>`).join(""),
        thrust: `<i class="fx-thrust" style="--c:${c}"></i>`,
        whip: `<i class="fx-whip" style="--c:${c}"></i>`,
        fist: `<i class="fx-ring" style="--c:${c}"></i><i class="fx-ring" style="--c:${c};animation-delay:.08s"></i>`,
      }[w.st] || "";
      add(t, fx + sparks(c, crit ? 14 : 7, 50), w.st === "heavy" ? 1300 : 800); hitflash(() => foeSprite(ev.i));
      if (w.aff) impactByAff(t, w.aff, crit);
      if (w.st === "heavy") { shake(true); camPunch(); tone(60, 0.4, { to: 30, vol: 0.9 }); }
      if (crit) { SFX.crit(); flash("#ffe9a0"); camPunch(); pop(t, L("¡CRÍTICO!", "CRITICAL!"), "#ffd84a", true); } else SFX.hit();
    }, hitAt);
    return ev.second ? 300 : hitAt + 320;
  };
  DUR.slash = (e) => { const s = weaponStyle().st; return e.second ? 300 : s === "heavy" ? 620 : s === "arrow" || s === "star" || s === "orb" ? 640 : e.crit ? 560 : 440; };

  // Afinidades sin efecto propio: Tiempo, Espacio, Gravedad, Realidad, Creación, Destino, Alma
  const clockSvg = (c) => `<svg viewBox="0 0 100 100"><g fill="none" stroke="${c}" stroke-width="2"><circle cx="50" cy="50" r="44"/>${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="${50 + Math.cos(a) * 36}" y1="${50 + Math.sin(a) * 36}" x2="${50 + Math.cos(a) * 42}" y2="${50 + Math.sin(a) * 42}"/>`; }).join("")}<line class="h" x1="50" y1="50" x2="50" y2="14" stroke-width="3"/></g></svg>`;
  const AFF_FX = {
    Tiempo(t, c) { add(t, `<i class="fx-clock">${clockSvg(c)}</i><i class="fx-ring" style="--c:${c}"></i><i class="fx-ring" style="--c:${c};animation-delay:.15s"></i>`, 1000); klass(() => t, "fx-echo", 600); },
    Espacio(t, c) { add(t, `<i class="fx-rift" style="--c:${c}"></i>${sparks("#fff", 10, 55)}`, 1000); },
    Gravedad(t, c) { add(t, `<i class="fx-implode" style="--c:${c}"></i><i class="fx-implode" style="--c:${c};animation-delay:.1s"></i>`, 900); klass(() => t, "fx-crush", 600); },
    Realidad(t, c) { let h = ""; for (let k = 0; k < 7; k++) h += `<i class="fx-shard" style="background:${k % 2 ? c : "#7ff"};--dx:${rnd(-60, 60)}px;--dy:${rnd(-60, 40)}px;transform:rotate(${rnd(0, 180)}deg)"></i>`; add(t, h, 800); klass(() => t, "fx-glitch", 520); },
    "Creación"(t, c) { rise(t, c, ["🌿", "🍃", "🌱", "✿"], 9); add(t, `<i class="fx-ring" style="--c:${c}"></i>`, 700); },
    Destino(t, c) { rise(t, c, ["🎲", "✦", "🂡", "✧"], 7); add(t, `<i class="fx-thread" style="--c:${c}"></i>`, 900); },
    Alma(t, c) { rise(t, c, ["✧", "◌", "✧"], 8); add(t, `<i class="fx-bubble" style="--c:${c}"></i>`, 900); },
  };
  const _iba = impactByAff;
  impactByAff = function (target, aff, crit) { try { if (target && AFF_FX[aff]) AFF_FX[aff](target, col(aff)); } catch (e) {} return _iba(target, aff, crit); };
  const AFF_SFX = {
    Tiempo() { [1760, 1320, 1046, 880].forEach((f, i) => tone(f, 0.12, { type: "triangle", vol: 0.12, delay: i * 0.08 })); noise(0.5, { filter: "bandpass", f: 2400, fTo: 600, q: 6, vol: 0.12 }); },
    Espacio() { tone(180, 0.8, { type: "sine", to: 1400, vol: 0.18 }); noise(0.6, { filter: "bandpass", f: 400, fTo: 4000, q: 3, vol: 0.2 }); },
    Gravedad() { tone(160, 0.6, { type: "sawtooth", to: 30, vol: 0.18 }); tone(45, 0.7, { vol: 0.9, delay: 0.1 }); },
    Realidad() { for (let i = 0; i < 6; i++) tone(rnd(300, 2400), 0.05, { type: "square", vol: 0.06, delay: i * 0.04 }); noise(0.25, { filter: "highpass", f: 4000, vol: 0.2 }); },
    "Creación"() { arp([392, 523, 659, 880], 0.06, { type: "sine", vol: 0.12, len: 0.35 }); noise(0.4, { filter: "bandpass", f: 900, q: 2, vol: 0.12 }); },
    Destino() { [1046, 1318, 1568].forEach((f, i) => tone(f, 0.9, { type: "triangle", vol: 0.1, delay: i * 0.03 })); tone(98, 0.6, { vol: 0.4 }); },
    Alma() { tone(660, 1, { type: "sine", to: 990, vol: 0.12 }); tone(664, 1, { type: "sine", to: 996, vol: 0.1 }); noise(0.8, { filter: "bandpass", f: 1800, q: 8, vol: 0.06 }); },
  };
  const _impSfx = SFX.impact;
  SFX.impact = (aff) => (AFF_SFX[aff] ? AFF_SFX[aff]() : _impSfx(aff));

  // Nombre del hechizo (cartel JRPG)
  const v2spell = RUN.spell;
  RUN.spell = (ev) => {
    const c = col(ev.aff), ult = ev.circ >= 3 && !["heal", "shield", "buff"].includes(ev.kind);
    if (ev.n) add(stageEl(), `<div class="fx-skill ${ult ? "ult" : ""}" style="--c:${c}"><b>${esc(ev.n)}</b></div>`, ult ? 1800 : 1300);
    if (!ult) return v2spell(ev);
    // Hechizo mayor: oscurece, círculo gigante bajo el objetivo y golpe con cámara
    const s = stageEl(); add(s, `<i class="fx-darken"></i>`, 1500); klass(stageEl, "fx-cam-in", 1000);
    const t = foeSprite(ev.i); if (t) add(t, `<i class="fx-bigcircle" style="--c:${c}">${clockSvg(c).replace('class="h"', "")}</i>`, 1500);
    SFX.charge(); setTimeout(() => SFX.charge(), 180);
    setTimeout(() => v2spell(ev), 420);
    setTimeout(() => { const t = foeSprite(ev.i); flash(c); shake(true); camPunch(); edge(c); if (t) { add(t, `<i class="fx-pillar" style="--c:${c}"></i>${sparks(c, 18, 90)}`, 1000); impactByAff(t, ev.aff, true); } }, 420 + 420);
    return 1500;
  };
  DUR.spell = (e) => (["heal", "shield", "buff"].includes(e.kind) ? 650 : e.circ >= 3 ? 1550 : 1080);

  // Victoria: rótulo con rayos de amanecer + recompensas que cuentan
  function victoryBurst() {
    if (RM) return; const v = document.createElement("div"); v.className = "fx-victory";
    v.innerHTML = `<i class="rays"></i><b>${L("¡VICTORIA!", "VICTORY!")}</b>`; document.body.appendChild(v); setTimeout(() => v.remove(), 2200);
  }
  function countUp(el) {
    if (RM || !el) return;
    el.querySelectorAll(".bres-lines div").forEach((d, k) => {
      const w = document.createTreeWalker(d, NodeFilter.SHOW_TEXT); const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
      nodes.forEach((n) => { const parts = n.textContent.split(/(\d+)/); if (parts.length < 2) return;
        const span = document.createElement("span"); span.innerHTML = parts.map((p, i) => (i % 2 ? `<b class="fx-cnt" data-to="${p}">0</b>` : esc(p))).join(""); n.replaceWith(span); });
      d.style.animationDelay = `${0.5 + k * 0.12}s`; d.classList.add("fx-resline");
      d.querySelectorAll(".fx-cnt").forEach((b) => { const to = +b.dataset.to, t0 = performance.now() + 500 + k * 120; const step = (now) => { const p = Math.min(1, Math.max(0, (now - t0) / 700)); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
    });
  }
  // Subida de nivel: rayos de amanecer + lo que ganas (lo anota tactica.js en window.SA_LVL)
  function levelUpFx(n) {
    SFX.level(); if (RM) return bigMsg(L("¡NIVEL ", "LEVEL ") + n + "!", G?.nombre || "", "#8be0a8");
    const g = window.SA_LVL && window.SA_LVL.to === n ? window.SA_LVL : null;
    const gains = g ? [g.pv && `❤️ +${g.pv} ${L("PV máx.", "max HP")}`, g.mana && `💧 +${g.mana} ${L("maná máx.", "max mana")}`, g.pa && `✦ +${g.pa} ${L("punto de afinidad", "affinity point")}${g.pa > 1 ? "s" : ""}`, g.pat && `⬆ +${g.pat} ${L("punto de atributo", "attribute point")}${g.pat > 1 ? "s" : ""}`].filter(Boolean) : [];
    const v = document.createElement("div"); v.className = "fx-victory fx-levelup";
    v.innerHTML = `<i class="rays"></i><div class="lu"><small>${L("¡SUBES DE NIVEL!", "LEVEL UP!")}</small><b>${n}</b>${gains.length ? `<ul>${gains.map((x, i) => `<li style="animation-delay:${0.5 + i * 0.15}s">${esc(x)}</li>`).join("")}</ul>` : ""}</div>`;
    document.body.appendChild(v); setTimeout(() => v.remove(), 3400);
  }
  window.SA_FX3 = { victoryBurst, countUp, levelUpFx };

  // Eventos de tactica.js: guardia, maleficio, golpe brutal, racha y Amanecer
  RUN.foeguard = (ev) => { const t = foeSprite(ev.i); add(t, `<i class="fx-bubble" style="--c:#7fc8ff"></i>`, 900); pop(t, "🛡️", "#7fc8ff", true); SFX.shield(); return 450; };
  RUN.hex = (ev) => {
    const t = foeSprite(ev.i); add(t, `<i class="fx-swirl" style="--c:#c58cff"></i>`, 800); SFX.status();
    if (t && meSprite()) projectile(t, meSprite(), "#c58cff", 380);
    setTimeout(() => { add(meSprite(), `<i class="fx-swirl" style="--c:#c58cff"></i><i class="fx-ring" style="--c:#c58cff"></i>`, 800); }, 380); return 650;
  };
  RUN.heavy = (ev) => { klass(() => foeSprite(ev.i), "fx-windup", 420); add(foeSprite(ev.i), `<i class="fx-core" style="--c:#ff5a4a"></i>`, 500); pop(foeSprite(ev.i), "💥", "#ff5a4a", true); tone(80, 0.5, { type: "sawtooth", to: 160, vol: 0.12 }); return 380; };
  RUN.combo = (ev) => { pop(foeSprite(ev.i), `${L("Racha", "Streak")} ×${(1 + Math.min(ev.n - 1, 5) * 0.1).toFixed(1)}`, "#ffb35a", ev.n >= 4); tone(600 + ev.n * 80, 0.12, { type: "triangle", vol: 0.12 }); return 300; };
  RUN.alba = () => {
    const s = stageEl(); if (!s) return 300;
    add(s, `<div class="fx-alba"><i class="sky"></i><i class="sun"></i><i class="rays"></i></div><div class="fx-skill ult" style="--c:#ffcf6a"><b>${L("AMANECER", "DAWNBREAK")}</b></div>`, 2300);
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 1.4, { type: "triangle", vol: 0.12, delay: 0.25 + i * 0.09 })); tone(55, 1.6, { vol: 0.8, delay: 0.9 });
    setTimeout(() => {
      flash("#fff3cf"); shake(true); camPunch(); edge("#ffcf6a"); noise(0.9, { f: 4000, fTo: 200, vol: 0.5 });
      document.querySelectorAll(".foes2 .foe2:not(.dead) .sprite").forEach((t, i) => setTimeout(() => { add(t, `<i class="fx-pillar" style="--c:#ffcf6a"></i>${sparks("#ffe9a0", 16, 90)}`, 1000); hitflash(() => t); }, i * 120));
    }, 950);
    return 2100;
  };
  Object.assign(DUR, { foeguard: 460, hex: 680, heavy: 400, combo: 320, alba: 2150 });
  const v3css = document.createElement("style"); v3css.id = "fx-v3"; v3css.textContent = `
.fx-skill{position:absolute;left:50%;top:10px;translate:-50% 0;z-index:8;padding:6px 26px;font-family:var(--display);font-size:15px;letter-spacing:.08em;color:#fff;white-space:nowrap;
  background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c) 45%,#120a24) 18%,color-mix(in srgb,var(--c) 45%,#120a24) 82%,transparent);border-block:1px solid color-mix(in srgb,var(--c) 70%,#fff);text-shadow:0 0 10px var(--c),0 1px 2px #000;animation:fxSkill 1.25s cubic-bezier(.2,.9,.2,1) forwards}
.fx-skill b::before,.fx-skill b::after{content:"✦";margin:0 10px;color:var(--c)}
@keyframes fxSkill{0%{opacity:0;clip-path:inset(0 50%)}15%{opacity:1;clip-path:inset(0 0)}80%{opacity:1}100%{opacity:0;translate:-50% -8px}}
.fx-skill.ult{top:22%;font-size:24px;padding:10px 46px;letter-spacing:.14em;border-block-width:2px;animation-duration:1.75s}
.fx-skill.ult::before{content:"";position:absolute;inset:-30px 20%;background:radial-gradient(ellipse,color-mix(in srgb,var(--c) 40%,transparent),transparent 70%);z-index:-1}
.fx-bigcircle{position:absolute;left:50%;top:50%;width:260px;height:260px;margin:-130px;z-index:3;filter:drop-shadow(0 0 10px var(--c)) drop-shadow(0 0 26px var(--c));animation:fxBigCircle 1.5s cubic-bezier(.2,.9,.2,1) forwards}
.fx-bigcircle svg{width:100%;height:100%}
@keyframes fxBigCircle{0%{scale:0;rotate:-90deg;opacity:0}25%{scale:1;opacity:1}75%{rotate:60deg;opacity:1}100%{rotate:90deg;scale:1.3;opacity:0}}
.fx-pillar{position:absolute;left:50%;bottom:-20%;width:90px;height:600px;margin-left:-45px;z-index:6;mix-blend-mode:screen;
  background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c) 70%,transparent) 30%,#fff 50%,color-mix(in srgb,var(--c) 70%,transparent) 70%,transparent);animation:fxPillar .9s ease-out forwards}
@keyframes fxPillar{0%{scale:.1 0;transform-origin:bottom;opacity:1}25%{scale:1.2 1}100%{scale:2.2 1;opacity:0}}
.fx-victory{position:fixed;inset:0;z-index:90;display:grid;place-items:center;pointer-events:none;animation:fxVicOut 2.2s ease forwards}
.fx-victory .rays{position:absolute;left:50%;top:50%;width:150vmax;height:150vmax;margin:-75vmax;
  background:repeating-conic-gradient(from 0deg,#ffd38a33 0deg 6deg,transparent 6deg 18deg);-webkit-mask-image:radial-gradient(circle,#000 0,transparent 55%);mask-image:radial-gradient(circle,#000 0,transparent 55%);animation:fxSpin 12s linear infinite}
.fx-victory b{position:relative;font-family:"Cinzel Decorative",var(--display);font-size:clamp(42px,9vw,96px);letter-spacing:.06em;
  background:linear-gradient(180deg,#fff8e0,#ffcf6a 50%,#e8843f);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 #3a1a3a) drop-shadow(0 0 30px #ffb85a);animation:fxVicIn .6s cubic-bezier(.2,1.6,.4,1) both}
@keyframes fxVicIn{from{scale:2.4;opacity:0;letter-spacing:.5em}to{scale:1;opacity:1}}
@keyframes fxVicOut{0%,75%{opacity:1}100%{opacity:0}}
.fx-alba{position:absolute;inset:0;overflow:hidden;z-index:2;pointer-events:none}
.fx-alba .sky{position:absolute;inset:0;background:linear-gradient(0deg,#ffcf6a 0%,#e8843f 25%,#7a3a5a 60%,transparent 100%);mix-blend-mode:screen;animation:fxAlbaSky 2.2s ease forwards}
.fx-alba .sun{position:absolute;left:50%;bottom:-30%;width:46%;aspect-ratio:1;translate:-50% 0;border-radius:50%;background:radial-gradient(circle,#fffbe8 0 30%,#ffd77e 45%,#ff9a5a00 70%);animation:fxAlbaSun 2.2s cubic-bezier(.2,.8,.2,1) forwards}
.fx-alba .rays{position:absolute;left:50%;top:60%;width:220%;aspect-ratio:1;translate:-50% -50%;background:repeating-conic-gradient(#fff3cf55 0 5deg,transparent 5deg 15deg);-webkit-mask-image:radial-gradient(circle,#000,transparent 60%);mask-image:radial-gradient(circle,#000,transparent 60%);animation:fxAlbaRays 2.2s ease forwards}
@keyframes fxAlbaSky{0%{opacity:0}35%{opacity:.85}80%{opacity:.6}100%{opacity:0}}
@keyframes fxAlbaSun{0%{translate:-50% 40%;opacity:0}45%{translate:-50% -35%;opacity:1}85%{opacity:1}100%{translate:-50% -40%;opacity:0}}
@keyframes fxAlbaRays{0%{opacity:0;rotate:0deg}40%{opacity:1}100%{opacity:0;rotate:40deg}}
#sndvol{width:84px;min-width:0;padding:0;margin:0 4px;accent-color:#ffcf6a;background:transparent;border:0;vertical-align:middle}
@media (max-width:560px){#sndvol{width:60px}}
.fx-levelup{animation-duration:3.4s}
.fx-levelup::before,.fx-victory::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 50% 45% at 50% 50%,#0a0614d9 0,#0a061499 45%,transparent 75%)}
.fx-levelup .rays{background:repeating-conic-gradient(from 0deg,#b6f5c855 0deg 6deg,transparent 6deg 18deg)}
.fx-levelup .lu{position:relative;text-align:center;animation:fxVicIn .6s cubic-bezier(.2,1.6,.4,1) both}
.fx-levelup small{display:block;font-family:var(--display);letter-spacing:.3em;font-size:clamp(14px,2.4vw,20px);color:#d8ffe4;text-shadow:0 0 12px #8be0a8,0 2px 2px #000}
.fx-levelup b{display:block;font-family:"Cinzel Decorative",var(--display);font-size:clamp(70px,14vw,150px);line-height:1;background:linear-gradient(180deg,#fff,#b6f5c8 45%,#3fae6a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 #0b3a22) drop-shadow(0 0 30px #8be0a8)}
.fx-levelup ul{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:4px}
.fx-levelup li{font-family:var(--display);font-size:clamp(14px,2vw,18px);color:#fff;text-shadow:0 0 10px #8be0a8,0 2px 2px #000;animation:fxResLine .45s cubic-bezier(.2,.9,.3,1) both}
.float{background:linear-gradient(180deg,#fff 20%,#ff8b7a 80%);-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-stroke:0!important;filter:drop-shadow(0 2px 0 #000) drop-shadow(0 0 2px #000)}
.float.heal{background-image:linear-gradient(180deg,#fff 20%,#8be0a8 80%)}
.float.crit{font-size:40px!important;background-image:linear-gradient(180deg,#fffbe0 10%,#ffd84a 55%,#ff8a2a)}
.float.eff{font-size:32px!important;background-image:linear-gradient(180deg,#fff 10%,#ffb35a 70%)}
.fx-resline{animation:fxResLine .45s cubic-bezier(.2,.9,.3,1) both}@keyframes fxResLine{from{opacity:0;translate:-24px 0}}
.fx-cnt{color:#ffd38a;font-family:var(--display)}
.fx-slash.thin{height:5px;background:linear-gradient(90deg,transparent,var(--c) 30%,#fff 50%,var(--c) 70%,transparent);box-shadow:0 0 10px var(--c),0 0 24px var(--c);transform:rotate(var(--r)) scaleX(0)}
.fx-arrow{width:70px!important;height:5px!important;margin:-2px 0 0 -35px!important;background:linear-gradient(90deg,transparent,var(--c) 60%,#fff)!important;filter:drop-shadow(0 0 6px var(--c)) drop-shadow(0 0 14px var(--c))!important}
.fx-arrow::after{right:-8px!important;top:-6px!important;border-width:8px 0 8px 14px!important;border-style:solid!important;border-color:transparent transparent transparent #fff!important}
.fx-star{width:30px!important;height:30px!important;margin:-15px!important;filter:drop-shadow(0 0 8px var(--c)) drop-shadow(0 0 18px var(--c)) brightness(1.3)!important}
.fx-thrust{height:10px!important;margin-top:-5px!important;filter:drop-shadow(0 0 10px var(--c)) brightness(1.3)!important}
.fx-whip{border-width:7px!important;filter:drop-shadow(0 0 10px var(--c)) drop-shadow(0 0 22px var(--c)) brightness(1.3)!important}
.fx-smash{position:absolute;left:50%;top:-30%;width:190%;height:160%;margin-left:-95%;border-radius:50%;border-top:16px solid var(--c);z-index:6;
  -webkit-mask-image:linear-gradient(90deg,transparent 4%,#000 30%,#000 70%,transparent 96%);mask-image:linear-gradient(90deg,transparent 4%,#000 30%,#000 70%,transparent 96%);
  filter:drop-shadow(0 0 8px var(--c)) drop-shadow(0 0 22px var(--c)) brightness(1.25);animation:fxSmash .75s cubic-bezier(.15,.9,.25,1) forwards}
.fx-smash::before{content:"";position:absolute;inset:3px 6%;border-radius:50%;border-top:5px solid #fff}
.fx-smash::after{content:"";position:absolute;inset:-6px;border-radius:50%;border-top:10px solid var(--c);opacity:.45;rotate:-14deg}
@keyframes fxSmash{0%{rotate:-95deg;opacity:0}12%{opacity:1}45%{rotate:18deg;opacity:1}100%{rotate:24deg;opacity:0}}
.fx-cut{position:absolute;left:8%;right:8%;top:46%;height:16px;border-radius:50%;rotate:-28deg;z-index:6;
  background:radial-gradient(ellipse at center,#fff 0 18%,var(--c) 40%,transparent 72%);box-shadow:0 0 18px var(--c),0 0 40px var(--c);animation:fxCut .9s .3s ease-out both}
@keyframes fxCut{0%{scale:0 .3;opacity:0}20%{scale:1.1 1;opacity:1}60%{opacity:.85}100%{scale:1 .2;opacity:0}}
.fx-thrust{position:absolute;left:-30%;top:50%;width:160%;height:5px;margin-top:-2px;background:linear-gradient(90deg,transparent,var(--c) 70%,#fff);clip-path:polygon(0 30%,92% 0,100% 50%,92% 100%,0 70%);box-shadow:0 0 14px var(--c);animation:fxThrust .3s ease-out forwards;z-index:5}
@keyframes fxThrust{from{transform:scaleX(0);transform-origin:left}60%{transform:scaleX(1)}to{transform:scaleX(1);opacity:0}}
.fx-whip{position:absolute;inset:10% -10%;border-radius:50%;border:3px solid transparent;border-bottom-color:var(--c);filter:drop-shadow(0 0 8px var(--c));animation:fxWhip .4s ease-out forwards;z-index:5}
@keyframes fxWhip{from{rotate:-120deg;opacity:0;scale:.6}40%{opacity:1}to{rotate:40deg;opacity:0;scale:1.1}}
.fx-arrow{position:absolute;width:44px;height:3px;margin:-1px 0 0 -22px;rotate:var(--a);background:linear-gradient(90deg,transparent,var(--c));z-index:5}
.fx-arrow::after{content:"";position:absolute;right:-4px;top:-4px;border:5px solid transparent;border-left:9px solid var(--c)}
.fx-star{position:absolute;width:18px;height:18px;margin:-9px;background:var(--c);clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);filter:drop-shadow(0 0 6px var(--c));animation:fxSpin .2s linear infinite;z-index:5}
.fx-recoil{animation:fxRecoil .3s ease-out}@keyframes fxRecoil{40%{translate:-10px 0}}
.fx-lunge-heavy{animation:fxLungeHeavy .52s cubic-bezier(.5,0,.3,1)}@keyframes fxLungeHeavy{30%{translate:-14px 4px;rotate:-6deg}60%{translate:34px -6px;rotate:4deg}}
.fx-clock{position:absolute;left:50%;top:50%;width:110px;height:110px;margin:-55px;opacity:.9;filter:drop-shadow(0 0 8px #8fe0cf);animation:fxFade 1s ease-out forwards;z-index:5}
.fx-clock svg{width:100%;height:100%}.fx-clock .h{transform-origin:50px 50px;animation:fxRewind .9s cubic-bezier(.3,0,.2,1) forwards}
@keyframes fxRewind{to{rotate:-540deg}}@keyframes fxFade{0%{opacity:0;scale:.6}20%{opacity:.9;scale:1}100%{opacity:0;scale:1.1}}
.fx-echo{animation:fxEcho .6s steps(3)}@keyframes fxEcho{0%,100%{filter:none}33%{filter:drop-shadow(-12px 0 0 #8fe0cf88) drop-shadow(12px 0 0 #8fe0cf55)}66%{filter:drop-shadow(-6px 0 0 #8fe0cf88)}}
.fx-rift{position:absolute;left:50%;top:50%;width:120px;height:30px;margin:-15px 0 0 -60px;border-radius:50%;background:radial-gradient(ellipse,#05001a 30%,var(--c) 60%,transparent 72%);box-shadow:0 0 24px var(--c);animation:fxRift .95s cubic-bezier(.2,.9,.3,1) forwards;z-index:5}
@keyframes fxRift{0%{scale:0 .2}30%{scale:1 2.6}70%{scale:1 2.4;opacity:1}100%{scale:0 .1;opacity:0}}
.fx-implode{position:absolute;left:50%;top:50%;width:180px;height:180px;margin:-90px;border-radius:50%;border:4px solid var(--c);box-shadow:inset 0 0 30px var(--c),0 0 20px var(--c);animation:fxImplode .55s ease-in forwards;z-index:5}
@keyframes fxImplode{from{scale:1;opacity:0}30%{opacity:1}to{scale:.05;opacity:0}}
.fx-crush{animation:fxCrush .6s cubic-bezier(.3,1.6,.5,1)}@keyframes fxCrush{25%{scale:1.15 .7;translate:0 10px}}
.fx-glitch{animation:fxGlitch .52s steps(2)}@keyframes fxGlitch{0%,100%{filter:none;clip-path:none}20%{filter:drop-shadow(-5px 0 #f0f) drop-shadow(5px 0 #0ff);clip-path:inset(10% 0 40% 0);translate:6px 0}40%{clip-path:inset(50% 0 5% 0);translate:-8px 0}60%{filter:drop-shadow(4px 0 #f0f) drop-shadow(-4px 0 #0ff);clip-path:inset(0 0 70% 0);translate:3px 0}}
.fx-thread{position:absolute;left:-40%;right:-40%;top:50%;height:2px;background:linear-gradient(90deg,transparent,var(--c),#fff,var(--c),transparent);box-shadow:0 0 10px var(--c);animation:fxThread .9s ease-out forwards;z-index:5}
@keyframes fxThread{0%{scale:0 1;rotate:-12deg}40%{scale:1 1}80%{opacity:1}100%{opacity:0;scale:1.1 6}}
@media (prefers-reduced-motion:reduce){.fx-skill,.fx-smash,.fx-thrust,.fx-whip,.fx-clock,.fx-rift,.fx-implode,.fx-thread{animation-duration:.01s}}`;
  document.head.appendChild(v3css);
  // ---------- fin v3 ----------

  // ---------- v4: animación y sonido por categoría (curar, escudo, mejora, estados, armas) y afinidad ----------
  const TIMBRE = { Fuego: ["sawtooth", 220], Agua: ["sine", 392], Tierra: ["triangle", 110], Aire: ["sine", 523], Rayo: ["square", 330], Luz: ["triangle", 659], Sombra: ["sawtooth", 147], Tiempo: ["triangle", 440], Espacio: ["sine", 262], Gravedad: ["sawtooth", 82], Realidad: ["square", 494], "Creación": ["sine", 349], Destino: ["triangle", 587], Alma: ["sine", 415] };
  const tb = (aff) => TIMBRE[aff] || ["triangle", 392];
  const CAT_SFX = {
    heal(aff) { const [ty, f] = tb(aff); [1, 1.25, 1.5, 2].forEach((m, i) => tone(f * m, 0.45, { type: ty, vol: ty === "sine" ? 0.16 : 0.08, delay: i * 0.08 })); tone(f * 4, 0.8, { type: "sine", vol: 0.05, delay: 0.3 }); },
    shield(aff) { const [ty, f] = tb(aff); tone(f * 2, 0.8, { type: ty, vol: 0.08 }); tone(f * 3, 0.7, { type: "sine", vol: 0.08, delay: 0.03 }); noise(0.15, { filter: "bandpass", f: f * 6, q: 12, vol: 0.25 }); },
    buff(aff) { const [ty, f] = tb(aff); tone(f, 0.5, { type: ty, to: f * 4, vol: 0.08 }); [2, 2.5, 3].forEach((m, i) => tone(f * m, 0.2, { type: "sine", vol: 0.1, delay: 0.25 + i * 0.05 })); },
    status(aff) { const [ty, f] = tb(aff); tone(f, 0.6, { type: ty, vol: 0.08 }); tone(f * 1.06, 0.6, { type: ty, vol: 0.08 }); tone(f / 2, 0.6, { type: "sine", to: f / 3, vol: 0.15 }); },
  };
  const ST_SFX = {
    Cegado() { tone(2400, 0.5, { type: "sine", to: 3200, vol: 0.1 }); noise(0.35, { filter: "highpass", f: 6000, vol: 0.35 }); },
    Quemado() { for (let i = 0; i < 7; i++) noise(0.05, { filter: "highpass", f: rnd(2500, 6000), vol: rnd(0.15, 0.35), delay: i * rnd(0.04, 0.09) }); noise(0.6, { f: 900, fTo: 300, vol: 0.15 }); },
    Aturdido() { tone(500, 0.35, { type: "triangle", to: 180, vol: 0.18 }); arp([1800, 2200, 1900, 2400], 0.08, { type: "sine", vol: 0.06, len: 0.08, delay: 0.25 }); },
    Asustado() { tone(110, 1, { type: "sawtooth", vol: 0.07 }); tone(156, 1, { type: "sawtooth", vol: 0.07 }); noise(0.9, { filter: "bandpass", f: 1200, fTo: 600, q: 6, vol: 0.1 }); },
  };
  const ST_FX = {
    Cegado(h) { add(h, `<i class="fx-core" style="--c:#ffffff"></i><i class="fx-ring" style="--c:#fff8d0"></i>${sparks("#ffffff", 10, 60)}`, 800); klass(() => h, "fx-blinded", 900); },
    Quemado(h) { rise(h, "#ff7a2e", ["🔥", "🔥", "✦"], 8); klass(() => h, "fx-burning", 1000); },
    Aturdido(h) { add(h, `<div class="fx-orbit">${["⭐", "💫", "⭐"].map((s, i) => `<i style="--k:${i}">${s}</i>`).join("")}</div>`, 1200); klass(() => h, "fx-dizzy", 900); },
    Asustado(h) { add(h, `<i class="fx-smoke" style="--c:#4a1a6a;--dx:-30px;--dy:-10px"></i><i class="fx-smoke" style="--c:#4a1a6a;--dx:30px;--dy:-20px"></i><em class="fx-pop big" style="--c:#c58cff">👁️</em>`, 1100); klass(() => h, "fx-scared", 1000); },
  };
  RUN.status = (ev) => {
    const h = who(ev); const cap = ev.st[0].toUpperCase() + ev.st.slice(1);
    (ST_FX[cap] || (() => {}))(h); (ST_SFX[cap] || SFX.status)();
    pop(h, L(cap, { Quemado: "Burned", Aturdido: "Stunned", Cegado: "Blinded", Asustado: "Scared" }[cap] || cap), ST_COL[cap] || "#b98cf0");
    return 700;
  };
  DUR.status = 720;
  RUN.burn = (ev) => { const h = who(ev); rise(h, "#ff7a2e", ["🔥"], 5); klass(() => h, "fx-burning", 600); pop(h, "🔥 −5", "#ff7a2e"); ST_SFX.Quemado(); return 450; };
  RUN.stun = (ev) => { const h = who(ev); ST_FX.Aturdido(h); ST_SFX.Aturdido(); return 600; };
  DUR.burn = 460; DUR.stun = 620;

  // Curar / escudo / mejora según afinidad
  const HEAL_CH = { Agua: ["💧", "✚"], Luz: ["✦", "✚"], "Creación": ["🌿", "✿", "✚"], Realidad: ["▣", "✚"], Destino: ["🍀", "✦"], Alma: ["✧", "✚"] };
  const BUFF_CH = { Aire: ["🍃", "➶"], Rayo: ["⚡", "✦"], Tiempo: ["⏳", "»"], Destino: ["🎲", "✦"], Alma: ["✧", "◌"] };
  const v3spell = RUN.spell;
  RUN.spell = (ev) => {
    if (!["heal", "shield", "buff"].includes(ev.kind)) return v3spell(ev);
    const c = col(ev.aff); const me = meSprite(); const s = stageEl();
    if (ev.n) add(s, `<div class="fx-skill" style="--c:${c}"><b>${esc(ev.n)}</b></div>`, 1300);
    diceShow(ev.dice); magicCircle(me, c, 1000); CAT_SFX[ev.kind](ev.aff);
    if (ev.kind === "heal") {
      rise(me, ev.aff === "Agua" ? "#7fd0ff" : "#8be0a8", HEAL_CH[ev.aff] || ["+", "✚"], 9);
      if (ev.aff === "Luz" && s && me) add(s, `<i class="fx-beam" style="--c:#fff2a8;left:${center(me, s).x}px;height:${center(me, s).y + 30}px"></i>`, 800);
      if (ev.aff === "Agua") add(me, [0, 0.12, 0.24].map((d) => `<i class="fx-ring" style="--c:#7fd0ff;animation-delay:${d}s"></i>`).join(""), 900);
      if (ev.aff === "Realidad") klass(meSprite, "fx-glitch", 520);
      if (ev.aff === "Tiempo") add(me, `<i class="fx-clock">${clockSvg("#8fe0cf")}</i>`, 1000);
      klass(meSprite, "fx-healglow", 900);
    } else if (ev.kind === "shield") {
      const shape = { Tierra: "hex", Fuego: "flame", Sombra: "veil", Espacio: "blink", "Creación": "leaf" }[ev.aff] || "bubble";
      if (shape === "hex") add(me, `<i class="fx-hexwall" style="--c:#c79a55"></i>`, 1100);
      else if (shape === "flame") { add(me, `<i class="fx-bubble" style="--c:#ff7a2e"></i>`, 1000); rise(me, "#ff7a2e", ["🔥"], 8, true); }
      else if (shape === "veil") add(me, `<i class="fx-veil"></i>`, 1100);
      else if (shape === "blink") { klass(meSprite, "fx-blink", 700); add(me, `<i class="fx-swirl" style="--c:${c}"></i>`, 800); }
      else if (shape === "leaf") { add(me, `<i class="fx-bubble" style="--c:#9be07a"></i>`, 1000); rise(me, "#9be07a", ["🍃", "🌿"], 7); }
      else add(me, `<i class="fx-bubble" style="--c:${c}"></i>${sparks(c, 8, 50)}`, 1000);
    } else {
      klass(meSprite, "fx-aura", 1000); me?.style.setProperty("--c", c);
      rise(me, c, BUFF_CH[ev.aff] || ["⬆", "✦"], 8);
      if (["Aire", "Rayo", "Tiempo"].includes(ev.aff)) add(me, `<i class="fx-speed" style="--c:${c}"></i>`, 800);
    }
    return 750;
  };
  const v3dur = DUR.spell; DUR.spell = (e) => (["heal", "shield", "buff"].includes(e.kind) ? 780 : v3dur(e));

  // Sonido propio por tipo de arma (se suma al golpe de v3)
  const WSFX = {
    arrow() { tone(190, 0.18, { type: "triangle", to: 90, vol: 0.3 }); noise(0.25, { filter: "bandpass", f: 2200, fTo: 4000, q: 3, vol: 0.2, delay: 0.05 }); },
    star() { for (let i = 0; i < 5; i++) tone(900 + i * 60, 0.05, { type: "square", vol: 0.04, delay: i * 0.05 }); },
    orb() { tone(300, 0.35, { type: "sine", to: 620, vol: 0.18 }); tone(303, 0.35, { type: "sine", to: 625, vol: 0.12 }); },
    heavy() { noise(0.5, { f: 600, fTo: 120, vol: 0.5 }); },
    quick() { [0, 0.07, 0.14].forEach((d) => noise(0.08, { filter: "bandpass", f: 4200, q: 2, vol: 0.3, delay: d })); },
    thrust() { noise(0.1, { filter: "highpass", f: 3000, vol: 0.35 }); tone(400, 0.15, { to: 120, vol: 0.2 }); },
    whip() { noise(0.04, { filter: "highpass", f: 5000, vol: 0.7, delay: 0.12 }); tone(2000, 0.12, { to: 300, type: "triangle", vol: 0.1, delay: 0.12 }); },
    fist() { tone(90, 0.12, { vol: 0.7 }); tone(80, 0.12, { vol: 0.6, delay: 0.1 }); },
    sword() {},
  };
  const v3slash = RUN.slash;
  RUN.slash = (ev) => { try { if (!ev.second) WSFX[weaponStyle().st]?.(); } catch (e) {} return v3slash(ev); };

  // Golpes enemigos teñidos por su afinidad
  const v3ehit = RUN.enemyhit;
  RUN.enemyhit = (ev) => {
    const r = v3ehit(ev); const aff = G?.g?.combat?.enemies?.[ev.i]?.aff;
    if (aff) setTimeout(() => { const me = meSprite(); if (!me) return; add(me, sparks(col(aff), 8, 45) + `<i class="fx-ring" style="--c:${col(aff)}"></i>`, 700); try { const v = SND.master?.gain; if (v) { const g0 = v.value; v.value = g0 * 0.5; SFX.impact(aff); setTimeout(() => (v.value = g0), 50); } } catch (e) {} }, 400);
    return r;
  };

  // Pociones: sonido según tipo
  RUN.potion = (ev) => {
    const kind = (typeof SHOP !== "undefined" && SHOP.find((s) => s.n === ev.item)?.kind) || "potion";
    const r = base.potion(ev);
    if (kind === "mana") arp([1046, 1318, 1568, 2093], 0.05, { type: "sine", vol: 0.1, len: 0.3 });
    else if (kind === "energy") { tone(200, 0.3, { type: "square", to: 1200, vol: 0.06 }); noise(0.12, { filter: "highpass", f: 4000, vol: 0.2, delay: 0.25 }); }
    else { for (let i = 0; i < 6; i++) tone(rnd(220, 480), 0.09, { vol: 0.14, delay: i * 0.07, to: rnd(500, 800) }); }
    return r;
  };
  // Ataques enemigos según el tipo de criatura (bestias.js)
  const foeType = (i) => { try { const e = G.g.combat.enemies[i]; return window.SA_BESTIAS?.typeOf(String(e.n).replace(/^✦\s*/, "")) || "beast"; } catch (e) { return "beast"; } };
  const TYPE_SFX = {
    beast() { tone(90, 0.4, { type: "sawtooth", to: 70, vol: 0.12 }); tone(93, 0.4, { type: "sawtooth", to: 72, vol: 0.1 }); },
    fly() { tone(2200, 0.25, { type: "square", to: 900, vol: 0.05 }); noise(0.3, { filter: "bandpass", f: 1800, fTo: 600, q: 3, vol: 0.25 }); },
    float() { tone(520, 0.9, { type: "sine", to: 300, vol: 0.12 }); tone(530, 0.9, { type: "sine", to: 306, vol: 0.1 }); },
    golem() { tone(45, 0.6, { vol: 1 }); noise(0.5, { f: 260, vol: 0.6 }); },
    hop() { tone(300, 0.2, { type: "triangle", to: 90, vol: 0.25 }); tone(140, 0.25, { type: "sine", to: 400, vol: 0.12, delay: 0.12 }); },
    crawl() { noise(0.45, { filter: "bandpass", f: 5200, q: 4, vol: 0.2 }); tone(160, 0.1, { vol: 0.4, delay: 0.3 }); },
    caster() { tone(400, 0.4, { type: "triangle", to: 900, vol: 0.1 }); noise(0.3, { filter: "bandpass", f: 1500, fTo: 500, q: 2, vol: 0.2, delay: 0.25 }); },
    dragon() { noise(0.9, { f: 1800, fTo: 200, vol: 0.55 }); tone(70, 0.9, { type: "sawtooth", to: 45, vol: 0.18 }); },
  };
  const TYPE_FX = {
    fly(me, c) { add(me, `<i class="fx-whip" style="--c:#dff6ff"></i><i class="fx-whip" style="--c:${c};animation-delay:.08s"></i>`, 700); },
    float(me) { add(me, [0, 1, 2].map((k) => `<i class="fx-smoke" style="--c:#8a7ac8;--dx:${rnd(-35, 35)}px;--dy:${rnd(-30, 5)}px;animation-delay:${k * 0.06}s"></i>`).join(""), 1000); },
    golem(me) { add(me, `<i class="fx-shock" style="--c:#c79a55"></i>${Array.from({ length: 6 }, (_, k) => `<i class="fx-rock" style="left:${rnd(15, 80)}%;--fall:${rnd(70, 100)}px;animation-delay:${k * 0.05}s"></i>`).join("")}`, 900); shake(true); },
    hop(me) { add(me, `<i class="fx-ring" style="--c:#8be07a"></i>`, 700); klass(meSprite, "fx-crush", 600); },
    crawl(me) { add(me, `<i class="fx-slash thin" style="--r:60deg;--c:#fff"></i><i class="fx-slash thin" style="--r:120deg;--c:#fff;animation-delay:.06s"></i>`, 600); },
    caster(me, c) { add(me, `<i class="fx-core" style="--c:${c}"></i><i class="fx-ring" style="--c:${c}"></i>`, 700); },
    dragon(me) { add(me, `<i class="fx-breath"></i>`, 900); rise(me, "#ff7a2e", [], 10, true); },
  };
  const v4ehit = RUN.enemyhit;
  RUN.enemyhit = (ev) => {
    const t = foeType(ev.i); const aff = G?.g?.combat?.enemies?.[ev.i]?.aff; const c = aff ? col(aff) : "#c58cff";
    if (t === "caster" || t === "dragon") setTimeout(() => { const f = foeSprite(ev.i), me = meSprite(); if (f && me) projectile(f, me, t === "dragon" ? "#ff7a2e" : c, 260); }, 200);
    setTimeout(() => TYPE_SFX[t]?.(), 120);
    setTimeout(() => { const me = meSprite(); if (me) TYPE_FX[t]?.(me, c); }, 400);
    return v4ehit(ev);
  };

  // Presentación de combate (no jefes): barrido de luz + fichas de enemigos
  const v4intro = RUN.intro;
  RUN.intro = (ev) => {
    if (ev.boss) return v4intro(ev);
    const es = (G?.g?.combat?.enemies || []).filter((e) => e.pv > 0);
    const TI = { beast: "🐾", fly: "🪶", float: "👻", golem: "🗿", hop: "🐸", crawl: "🕷️", caster: "🔮", dragon: "🐉" };
    add(stageEl(), `<div class="fx-encounter"><i class="bar a"></i><i class="bar b"></i><div class="cards">${es.map((e, i) => `<div class="card" style="animation-delay:${0.25 + i * 0.12}s;--c:${e.aff ? col(e.aff) : "#e6c47a"}"><span>${TI[foeType(G.g.combat.enemies.indexOf(e))] || "⚔️"}</span><b>${esc(e.n)}</b><small>${L("Nv", "Lv")} ${e.lvl}${e.aff ? " · " + esc(e.aff) : ""}</small></div>`).join("")}</div></div>`, 1700);
    noise(0.4, { filter: "bandpass", f: 600, fTo: 3000, q: 2, vol: 0.3 }); [196, 247, 294].forEach((f, i) => tone(f, 0.6, { type: "sawtooth", vol: 0.05, delay: 0.2 + i * 0.02 }));
    return v4intro(ev);
  };
  const v3introDur = DUR.intro; DUR.intro = (e) => (e.boss ? (typeof v3introDur === "function" ? v3introDur(e) : 1750) : 1300);

  const v4css = document.createElement("style"); v4css.id = "fx-v4"; v4css.textContent = `
.fx-blinded{animation:fxBlinded .9s ease-out}@keyframes fxBlinded{0%{filter:brightness(3.5) blur(3px)}100%{filter:none}}
.fx-burning{animation:fxBurning .2s steps(2) 4}@keyframes fxBurning{50%{filter:drop-shadow(0 0 10px #ff7a2e) sepia(.6) saturate(3) hue-rotate(-20deg)}}
.fx-dizzy{animation:fxDizzy .9s ease-in-out}@keyframes fxDizzy{20%{rotate:-8deg}40%{rotate:7deg}60%{rotate:-5deg}80%{rotate:3deg}}
.fx-scared{animation:fxScared .1s linear 10;filter:grayscale(.6) brightness(.8)}@keyframes fxScared{50%{translate:2px 0}}
.fx-orbit{position:absolute;left:50%;top:6%;width:80px;height:24px;margin-left:-40px;z-index:6}
.fx-orbit i{position:absolute;left:50%;top:50%;font-style:normal;font-size:16px;animation:fxOrbitStar 1.2s linear infinite;animation-delay:calc(var(--k) * -.4s)}
@keyframes fxOrbitStar{from{transform:rotate(0) translateX(34px) rotate(0) scaleY(2.2)}to{transform:rotate(360deg) translateX(34px) rotate(-360deg) scaleY(2.2)}}
.fx-orbit{transform:scaleY(.45)}
.fx-healglow{animation:fxHealGlow .9s ease-out}@keyframes fxHealGlow{30%{filter:drop-shadow(0 0 14px #8be0a8) brightness(1.3)}}
.fx-aura{animation:fxAuraBuff 1s ease-out}@keyframes fxAuraBuff{30%{filter:drop-shadow(0 0 6px var(--c,#ffd84a)) drop-shadow(0 0 18px var(--c,#ffd84a)) brightness(1.25)}}
.fx-hexwall{position:absolute;left:50%;top:50%;width:150px;height:150px;margin:-75px;z-index:5;background:var(--c);opacity:.0;
  clip-path:polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%,25% 3%,30% 10%,6% 50%,30% 90%,70% 90%,94% 50%,70% 10%,30% 10%);filter:drop-shadow(0 0 10px var(--c));animation:fxHex 1.1s ease-out forwards}
@keyframes fxHex{0%{scale:.3;opacity:0;rotate:-30deg}30%{scale:1;opacity:.95;rotate:0deg}75%{opacity:.8}100%{opacity:0;scale:1.08}}
.fx-veil{position:absolute;inset:-10% -15%;z-index:5;background:linear-gradient(180deg,#1a0a2acc,#4a1a6a88 60%,transparent);border-radius:40% 40% 10% 10%;animation:fxVeil 1.1s ease-out forwards}
@keyframes fxVeil{0%{clip-path:inset(0 0 100% 0);opacity:1}35%{clip-path:inset(0 0 0 0)}100%{opacity:0}}
.fx-blink{animation:fxBlink .7s steps(1)}@keyframes fxBlink{20%,60%{opacity:.15;translate:-10px 0}40%,80%{opacity:1;translate:6px 0}}
.fx-speed{position:absolute;inset:0;z-index:5;background:repeating-linear-gradient(90deg,transparent 0 14px,color-mix(in srgb,var(--c) 70%,transparent) 14px 16px);-webkit-mask-image:linear-gradient(90deg,transparent,#000 40%,transparent);mask-image:linear-gradient(90deg,transparent,#000 40%,transparent);animation:fxSpeed .8s linear forwards}
@keyframes fxSpeed{from{background-position:0 0;opacity:1}to{background-position:-120px 0;opacity:0}}
.fx-breath{position:absolute;left:-40%;top:20%;width:180%;height:60%;z-index:5;background:radial-gradient(ellipse at 100% 50%,#fff3c0 0,#ffb03a 25%,#ff5a2a 50%,transparent 72%);mix-blend-mode:screen;animation:fxBreath .9s ease-out forwards;transform-origin:100% 50%}
@keyframes fxBreath{0%{scale:0 .3;opacity:0}25%{scale:1 1;opacity:1}100%{scale:1.1 1.2;opacity:0}}
.fx-encounter{position:absolute;inset:0;z-index:7;overflow:hidden;pointer-events:none}
.fx-encounter .bar{position:absolute;left:-60%;width:220%;height:22%;rotate:-14deg;background:linear-gradient(90deg,transparent,#fff8e0cc 45%,#ffcf6a 50%,#fff8e0cc 55%,transparent);mix-blend-mode:screen;animation:fxEncBar .6s cubic-bezier(.5,0,.3,1) forwards}
.fx-encounter .bar.a{top:24%}.fx-encounter .bar.b{top:58%;animation-delay:.1s;animation-direction:reverse}
@keyframes fxEncBar{from{translate:-100% 0;opacity:1}to{translate:100% 0;opacity:.2}}
.fx-encounter .cards{position:absolute;right:4%;top:50%;translate:0 -50%;display:grid;gap:8px}
.fx-encounter .card{display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:center;min-width:200px;padding:8px 16px 8px 12px;background:linear-gradient(90deg,#120a24ee,#2a1840dd);border:1px solid var(--c);border-left:4px solid var(--c);box-shadow:0 0 18px color-mix(in srgb,var(--c) 45%,transparent);clip-path:polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%);animation:fxEncCard 1.6s cubic-bezier(.2,.9,.3,1) both}
.fx-encounter .card span{grid-row:1/span 2;font-size:24px}
.fx-encounter .card b{font-family:var(--display);color:#fff;letter-spacing:.05em;font-size:15px}
.fx-encounter .card small{color:var(--c);font-size:12px;letter-spacing:.08em}
@keyframes fxEncCard{0%{translate:120% 0;opacity:0}22%{translate:0 0;opacity:1}78%{translate:0 0;opacity:1}100%{translate:-20% 0;opacity:0}}
@media (max-width:640px){.fx-encounter .card{min-width:150px}.fx-encounter .cards{right:2%}}
@media (prefers-reduced-motion:reduce){.fx-encounter,.fx-breath{display:none}}
@media (prefers-reduced-motion:reduce){.fx-blinded,.fx-burning,.fx-dizzy,.fx-scared,.fx-hexwall,.fx-veil,.fx-blink,.fx-speed,.fx-orbit i{animation-duration:.01s}}`;
  document.head.appendChild(v4css);
  // ---------- fin v4 ----------
  // =====================================================================
  function runQueue() {
    let t = 0; const evs = Q.splice(0);
    for (const ev of evs) { const fn = RUN[ev.k]; if (!fn) continue; setTimeout(() => { try { fn(ev); } catch (e) { console.warn("efectos:", e); } }, t); const d = DUR[ev.k]; t += typeof d === "function" ? d(ev) : d || 400; }
    return t;
  }

  // ---------- estados que se quedan, peligro y muertes ----------
  let lastCombat = null, prevFoePv = [];
  function persistentLooks() {
    const c = G?.g?.combat; const b = $q(".battle"); if (!c || !b) { lastCombat = null; return; }
    b.classList.toggle("fx-danger", G.pv > 0 && G.pv / Math.max(1, G.pvMax) < 0.25);
    c.enemies.forEach((e, i) => {
      const s = foeSprite(i); if (!s) return;
      for (const k of ["Quemado", "Cegado", "Asustado"]) s.classList.toggle("fx-st-" + k.toLowerCase(), !!e.st?.[k] && e.pv > 0);
      if (e.st?.Aturdido && e.pv > 0 && !s.querySelector(".fx-stars")) s.insertAdjacentHTML("beforeend", `<div class="fx-stars"><i>⭐</i><i>💫</i><i>⭐</i></div>`);
      if (lastCombat === c && prevFoePv[i] > 0 && e.pv <= 0) { klass(() => foeBtn(i), "fx-dying", 950); burst(s, "#ffffff", 12); SFX.death(); dust(s.getBoundingClientRect(), [col(e.aff), "#fff"], 24); }
    });
    const ms = meSprite(); const ps = c.pst || {};
    if (ms) {
      for (const k of ["Quemado", "Cegado", "Asustado"]) ms.classList.toggle("fx-st-" + k.toLowerCase(), !!ps.st?.[k]);
      ms.classList.toggle("fx-guarded", !!(ps.defend || ps.shield > 0 || ps.barrier > 0));
      ms.classList.toggle("fx-buffed", !!(ps.buff > 0 || ps.grito > 0 || ps.forge > 0));
    }
    prevFoePv = c.enemies.map((e) => e.pv); lastCombat = c;
  }

  // ---------- barras de vida que bajan suavemente ----------
  function snapBars() {
    const out = {}; if (!G?.g?.combat) return out;
    const vis = (bar) => { const w = bar.parentElement.getBoundingClientRect().width; return w ? (bar.getBoundingClientRect().width / w) * 100 : parseFloat(bar.style.width); };
    document.querySelectorAll(".foes2 .foe2").forEach((f, i) => { const bar = f.querySelector(".hp i"); if (bar) out["f" + i] = vis(bar); });
    document.querySelectorAll(".me2 .hp i").forEach((bar, j) => (out["m" + j] = vis(bar)));
    out.combat = G.g.combat; return out;
  }
  function animateBars(old) {
    if (!old.combat || old.combat !== G?.g?.combat) return;
    const apply = (bar, before) => {
      if (!bar || before == null || isNaN(before)) return; const after = parseFloat(bar.style.width); if (isNaN(after) || Math.abs(after - before) < 0.1) return;
      const hp = bar.parentElement; const lag = document.createElement("b"); lag.className = "fx-lag" + (after > before ? " heal" : ""); lag.style.width = (after > before ? after : before) + "%"; hp.insertBefore(lag, bar);
      bar.style.transition = "none"; bar.style.width = before + "%"; void bar.offsetWidth; bar.style.transition = ""; bar.style.width = after + "%";
      requestAnimationFrame(() => { if (after < before) lag.style.width = after + "%"; else setTimeout(() => (lag.style.opacity = 0), 400); });
      setTimeout(() => lag.remove(), 1300);
    };
    document.querySelectorAll(".foes2 .foe2").forEach((f, i) => apply(f.querySelector(".hp i"), old["f" + i]));
    document.querySelectorAll(".me2 .hp i").forEach((bar, j) => apply(bar, old["m" + j]));
  }

  // ---------- ambiente: partículas del lugar y del clima ----------
  const REG_FX = {
    alba: { cls: "up", n: 14, c: ["#ffe9a0", "#ffd27a"], s: [2, 4], d: [7, 12] },
    verde: { cls: "leaf", n: 10, c: ["#7fc26a", "#b5d66a", "#5e9c4a"], s: [6, 9], d: [8, 13] },
    llan: { cls: "drift", n: 10, c: ["#f0d98a88", "#e8c86a88"], s: [2, 4], d: [9, 14] },
    costa: { cls: "up", n: 10, c: ["#bfe3ff99", "#e0f2ff88"], s: [3, 7], d: [8, 12] },
    esc: { cls: "down", n: 18, c: ["#ffffff", "#e6f2ff"], s: [2, 5], d: [7, 12] },
    quem: { cls: "up", n: 16, c: ["#ff9a3c", "#ff5a1e", "#ffd27a"], s: [2, 4], d: [4, 8] },
    viol: { cls: "up", n: 12, c: ["#b98cf0aa", "#9b5cffaa"], s: [4, 9], d: [9, 14] },
    cap: { cls: "drift", n: 8, c: ["#e8dcc055"], s: [2, 3], d: [12, 18] },
    lost: { cls: "star", n: 22, c: ["#ffffff", "#cfd9ff", "#ffe9a0"], s: [2, 3], d: [2, 5] },
  };
  const seeded = (k) => { const x = Math.sin(k * 999.7) * 43758.5453; return x - Math.floor(x); };
  function ambient(host, region, weather, small) {
    if (!host || host.querySelector(":scope > .fx-amb")) return;
    let cfg = REG_FX[region] || REG_FX.cap; let extra = "";
    if (weather === "Lluvia" || weather === "Tormenta") cfg = { cls: "rain", n: 30, c: ["#bfe3ff"], s: [2, 2], d: [0.7, 1.1] };
    if (weather === "Nieve o granizo") cfg = REG_FX.esc;
    if (weather === "Tormenta") extra += `<i class="lightning"></i>`;
    if (weather === "Niebla") extra += `<i class="fog"></i>`;
    if (weather === "Ola de calor") { extra += `<i class="heat"></i>`; cfg = REG_FX.quem; }
    const now = performance.now() / 1000; const H = host.clientHeight || 340, W = host.clientWidth || 600;
    const n = Math.round(cfg.n * (small ? 0.6 : 1)); let h = extra;
    for (let k = 0; k < n; k++) {
      const r1 = seeded(k + 1), r2 = seeded(k + 17), r3 = seeded(k + 33), r4 = seeded(k + 51);
      const dur = cfg.d[0] + r2 * (cfg.d[1] - cfg.d[0]); const size = cfg.s[0] + r3 * (cfg.s[1] - cfg.s[0]);
      const delay = -((now + r4 * dur) % dur); const c = cfg.c[k % cfg.c.length];
      const pos = cfg.cls === "drift" ? `top:${r1 * 90}%;left:0` : cfg.cls === "star" ? `top:${r3 * 95}%;left:${r1 * 100}%` : `left:${r1 * 100}%`;
      h += `<i class="${cfg.cls}" style="${pos};width:${size}px;height:${size}px;background:${c};box-shadow:0 0 ${size * 2}px ${c};--h:${H + 30}px;--w:${W + 60}px;--sx:${(r3 - 0.5) * 80}px;animation-duration:${dur}s;animation-delay:${delay}s"></i>`;
    }
    const d = document.createElement("div"); d.className = "fx-amb"; d.innerHTML = h; host.prepend(d);
  }
  function ambients() {
    const s = stageEl(); if (s && G?.g?.loc) ambient(s, G.g.loc.r, typeof weatherFor === "function" ? weatherFor(G.g.loc.r, G.g.day) : null, false);
    document.querySelectorAll(".scene").forEach((sc) => {
      const m = (sc.getAttribute("style") || "").match(/bg\/([a-z]+)\.jpg/); if (!m) return;
      const here = G?.g?.loc?.r === m[1]; ambient(sc, m[1], here && typeof weatherFor === "function" ? weatherFor(m[1], G.g.day) : null, true);
    });
  }

  // ---------- victoria, derrota, subir de nivel, capítulo nuevo ----------
  const seenBattle = new WeakSet(); let lastLvl = null, lastCap = null, lastViewKey = "";
  function confetti() { const cs = ["#d9a441", "#ffe9a0", "#8be0a8", "#5a8ee0", "#e0735c", "#b98cf0"]; for (let k = 0; k < 40; k++) { const e = document.createElement("i"); e.className = "fx-confetti"; e.style.cssText = `left:${rnd(5, 95)}vw;background:${cs[k % cs.length]};--sx:${rnd(-80, 80)}px;--rot:${rnd(-720, 720)}deg;--d:${rnd(1.4, 2.4)}s;animation-delay:${rnd(0, 0.3)}s;border-radius:${k % 3 ? 2 : 50}%`; document.body.appendChild(e); setTimeout(() => e.remove(), 3000); } }
  function bigMsg(title, sub, c) { const e = document.createElement("div"); e.className = "fx-bigmsg"; e.style.setProperty("--c", c); e.innerHTML = `<b>${title}</b>${sub ? `<span>${sub}</span>` : ""}`; document.body.appendChild(e); setTimeout(() => e.remove(), 2300); }
  function results() {
    const b = G?.g?.lastBattle; const el = $q(".bresult");
    if (b && el && !seenBattle.has(b)) {
      seenBattle.add(b);
      if (b.won) { el.classList.add("fx-win"); confetti(); countUp(el); const lv = el.querySelector(".lvlup"); if (lv) lv.classList.add("fx-lvl"); }
      else el.classList.add("fx-lose");
    }
    if (G) {
      if (lastLvl && lastLvl.id === G.id && G.nivel > lastLvl.n) { const n = G.nivel; setTimeout(() => levelUpFx(n), $q(".bresult") ? 2600 : 300); }
      lastLvl = { id: G.id, n: G.nivel };
    }
    const cap = Store?.world?.cap;
    if (cap != null && view?.name === "game") {
      if (lastCap != null && cap > lastCap) { SFX.chapter(); const ch = typeof chapter === "function" ? chapter() : null; bigMsg(L("CAPÍTULO ", "CHAPTER ") + cap, ch?.t ? esc(ch.t) : L("La historia avanza", "The story moves on"), "#d9a441"); }
      lastCap = cap;
    }
  }
  function viewAnim() {
    const key = [view?.name, typeof gtab !== "undefined" ? gtab : "", G?.g?.loc ? G.g.loc.r + ":" + G.g.loc.p : "", G?.g?.combat ? "c" : ""].join("|");
    if (key !== lastViewKey) { const m = $q("#main"); const first = m && m.firstElementChild; if (first && !G?.g?.combat) { first.classList.remove("fx-view"); void first.offsetWidth; first.classList.add("fx-view"); } lastViewKey = key; }
  }


  // ---------- v2: final del combate, rondas, peligro, ambiente extra ----------
  function dust(rect, colors, n = 36) {
    for (let k = 0; k < n; k++) { const d = document.createElement("i"); d.className = "fx-dust"; const a = rnd(-Math.PI, 0); const r = rnd(30, 110);
      d.style.cssText = `left:${rect.left + rect.width * rnd(0.2, 0.8)}px;top:${rect.top + rect.height * rnd(0.2, 0.8)}px;--c:${colors[k % colors.length]};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r - 30}px;--d:${rnd(0.8, 1.5)}s;animation-delay:${rnd(0, 0.35)}s`;
      document.body.appendChild(d); setTimeout(() => d.remove(), 2000); }
  }
  function ghost(snap, cls, ms) { const g = document.createElement("div"); g.className = "fx-ghost " + cls; g.style.cssText = `left:${snap.r.left}px;top:${snap.r.top}px;width:${snap.r.width}px;height:${snap.r.height}px`; g.innerHTML = snap.html; document.body.appendChild(g); setTimeout(() => g.remove(), ms); return g; }
  let lastCombatSeen = null;
  function snapEnd() {
    const c = G?.g?.combat || lastCombatSeen; if (!c || !$q(".foes2")) return null;
    const foes = [...document.querySelectorAll(".foes2 .foe2")].map((f, i) => { const sp = f.querySelector(".sprite"); return sp && !f.classList.contains("dead") ? { r: sp.getBoundingClientRect(), html: sp.innerHTML.replace(/<em[^>]*>.*?<\/em>/g, ""), aff: c.enemies[i]?.aff } : null; }).filter(Boolean);
    const ms = meSprite(); return { c, foes, me: ms ? { r: ms.getBoundingClientRect(), html: ms.innerHTML.replace(/<em[^>]*>.*?<\/em>/g, "") } : null };
  }
  function endCinematic(pre) {
    if (!pre || G?.g?.combat === pre.c) return; if (G?.g?.combat) return; // empezó otro combate
    const b = G?.g?.lastBattle;
    if (b && b.won) {
      SFX.death(); setTimeout(() => { SFX.victory(); victoryBurst(); }, 350);
      if (!RM) { pre.foes.forEach((f) => { ghost(f, "die", 1200); dust(f.r, [col(f.aff), "#ffffff", "#ffe9a0"]); }); const g = document.createElement("div"); g.className = "fx-goldflash"; document.body.appendChild(g); setTimeout(() => g.remove(), 1100); }
    } else if (b && !b.won) {
      SFX.defeat();
      if (!RM) { if (pre.me) ghost(pre.me, "fall", 1400); const f = document.createElement("div"); f.className = "fx-fade"; f.innerHTML = `<b>${L("HAS CAÍDO", "YOU FELL")}</b>`; document.body.appendChild(f); setTimeout(() => f.remove(), 2500); }
    } else { SFX.flee(); if (!RM && pre.me) ghost(pre.me, "flee", 750); }
  }
  let lastRoundKey = "", wasDanger = false;
  function roundAndDanger() {
    const c = G?.g?.combat; if (!c) { wasDanger = false; lastRoundKey = ""; return; }
    const key = c.log?.[0] + "|" + c.round;
    if (key !== lastRoundKey) {
      const newCombat = !lastRoundKey || lastRoundKey.split("|")[0] !== String(c.log?.[0]);
      const cmd = $q(".battle .cmd"); if (cmd && !RM) { cmd.classList.remove("fx-cmdin"); void cmd.offsetWidth; cmd.classList.add("fx-cmdin"); }
      const tr = $q(".bhead .turn"); if (tr && !RM) { tr.classList.remove("fx-turn"); void tr.offsetWidth; tr.classList.add("fx-turn"); }
      if (!newCombat && c.round > 1 && !RM) setTimeout(() => add(stageEl(), `<div class="fx-roundtag">${L("RONDA", "ROUND")} ${c.round}</div>`, 1300), 900);
      lastRoundKey = key;
    }
    const danger = G.pv > 0 && G.pv / Math.max(1, G.pvMax) < 0.25;
    if (danger && !wasDanger) setTimeout(() => SFX.heart(), 900);
    wasDanger = danger;
  }
  function ambientExtra() {
    const s = stageEl(); if (!s || RM) return;
    const amb = s.querySelector(":scope > .fx-amb"); if (!amb || amb.dataset.v2) return; amb.dataset.v2 = "1";
    const r = G?.g?.loc?.r; let h = `<i class="vig"></i><i class="mist"></i>`;
    if (["alba", "verde", "lost", "llan"].includes(r)) h += `<i class="rays" style="--rc:${{ alba: "#fff0b055", verde: "#d8ffb033", lost: "#c9c2ff33", llan: "#ffe7a044" }[r]}"></i>`;
    if (r === "quem") h += `<i class="flicker"></i>`;
    amb.insertAdjacentHTML("beforeend", h);
  }

  // ---------- enganche con render y toast ----------
  const _render = render;
  // Remate: si un golpe termina el combate, la escena se mantiene hasta que acaban sus efectos.
  let holdUntil = 0, holdTimer = null;
  render = function () {
    const now = performance.now();
    if (now < holdUntil) { clearTimeout(holdTimer); holdTimer = setTimeout(() => render(), holdUntil - now + 20); return; }
    if (!RM && !G?.g?.combat && lastCombatSeen && Q.length && stageEl()) {
      const ms = runQueue(); holdUntil = now + ms + 300; holdTimer = setTimeout(() => render(), ms + 320); return;
    }
    if (G?.g?.combat) lastCombatSeen = G.g.combat;
    const old = RM ? {} : snapBars(); let pre = null; try { pre = snapEnd(); } catch (e) {}
    if (!G?.g?.combat) lastCombatSeen = null;
    const r = _render.apply(this, arguments);
    try { soundButton(); } catch (e) {}
    if (!RM) { try { animateBars(old); ambients(); ambientExtra(); persistentLooks(); resumeRunning(); runQueue(); results(); viewAnim(); } catch (e) { console.warn("efectos:", e); } }
    else { try { runQueue(); results(); } catch (e) {} }
    try { roundAndDanger(); endCinematic(pre); } catch (e) { console.warn("efectos:", e); }
    Q.length = 0;
    return r;
  };
  if (typeof toast === "function") { const _toast = toast; toast = function () { const r = _toast.apply(this, arguments); const t = $q("#toast"); if (t && !RM) { t.classList.remove("fx-toast"); void t.offsetWidth; t.classList.add("fx-toast"); } return r; }; }
})();
