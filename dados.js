// ===================== TIRADAS ÉPICAS =====================
// SA_DICE.show({ sides, value, label, result, tier }) -> Promise que se resuelve al cerrar.
// El dado gira y se frena de forma exponencial, los números pasan cada vez más lentos,
// y al caer: sacudida, destello, ondas y chispas. tier=true activa "legendaria" (top 10%) y "maldita" (bottom 10%).
// Tocar durante el giro lo adelanta; tocar después lo cierra. Con movimiento reducido se muestra al momento.
(function () {
  const Lx = (es, en) => (typeof L === "function" ? L(es, en) : es);
  const RM = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sfx = (k) => { try { window.SA_SFX?.[k]?.(); } catch (e) {} };
  const css = `
#sa-dice{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:radial-gradient(circle at 50% 45%,#1a1440ee,#05040cf5 70%);animation:dzIn .35s ease;cursor:pointer;overflow:hidden;font-family:var(--display,serif)}
#sa-dice.out{animation:dzOut .3s ease forwards}
@keyframes dzIn{from{opacity:0}}@keyframes dzOut{to{opacity:0;transform:scale(1.04)}}
.dz-stage{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px;max-width:100%;text-align:center}
.dz-stage.shake{animation:dzShake .5s cubic-bezier(.36,.07,.19,.97)}
@keyframes dzShake{10%,90%{transform:translate(-3px,2px)}20%,80%{transform:translate(6px,-4px)}30%,50%,70%{transform:translate(-10px,6px) rotate(-1deg)}40%,60%{transform:translate(10px,-6px) rotate(1deg)}}
.dz-label{color:#e6c47a;letter-spacing:.18em;text-transform:uppercase;font-size:clamp(13px,3.6vw,17px);opacity:.9}
.dz-arena{position:relative;width:min(300px,78vw);aspect-ratio:1;display:grid;place-items:center}
.dz-rays{position:absolute;inset:-60%;background:repeating-conic-gradient(from 0deg,#ffd98a33 0 6deg,transparent 6deg 18deg);border-radius:50%;mask:radial-gradient(circle,#000 20%,transparent 62%);-webkit-mask:radial-gradient(circle,#000 20%,transparent 62%);opacity:var(--ray,0);animation:dzRot 9s linear infinite;transition:opacity .4s}
.dz-runes{position:absolute;inset:2%;animation:dzRot 14s linear infinite reverse;opacity:.55}
.dz-runes circle{fill:none;stroke:#e6c47a;stroke-width:1.2}
@keyframes dzRot{to{transform:rotate(360deg)}}
.dz-die{position:relative;width:62%;aspect-ratio:1;filter:drop-shadow(0 0 var(--glow,12px) #ffcf6aaa) drop-shadow(0 14px 18px #000c)}
.dz-die.land{animation:dzSlam .55s cubic-bezier(.2,1.8,.4,1)}
@keyframes dzSlam{0%{transform:scale(1.7)}45%{transform:scale(.86)}100%{transform:scale(1)}}
.dz-spin{width:100%;height:100%;will-change:transform}
.dz-spin svg{width:100%;height:100%;display:block}
.dz-f0{fill:url(#dzg);stroke:#f3d690;stroke-width:4;stroke-linejoin:round}
.dz-f1{fill:#2a2060;stroke:#e6c47a;stroke-width:2.5;stroke-linejoin:round;opacity:.9}
.dz-ln{stroke:#e6c47a88;stroke-width:2}
.dz-num{position:absolute;inset:0;display:grid;place-items:center;color:#fff6dc;font-weight:700;font-size:var(--fs,64px);text-shadow:0 0 12px #ffcf6a,0 2px 0 #3a2a10;pointer-events:none;font-variant-numeric:tabular-nums}
.dz-die.land .dz-num{animation:dzNum .7s ease}
@keyframes dzNum{0%{color:#fff;text-shadow:0 0 40px #fff,0 0 80px #ffcf6a}100%{}}
.dz-ring{position:absolute;left:50%;top:50%;width:40%;aspect-ratio:1;margin:-20%;border:3px solid #ffd98a;border-radius:50%;opacity:0;animation:dzRing .9s ease-out forwards}
@keyframes dzRing{0%{transform:scale(.3);opacity:1}100%{transform:scale(3.4);opacity:0;border-width:1px}}
.dz-p{position:absolute;left:50%;top:50%;width:var(--s,6px);height:var(--s,6px);margin:calc(var(--s,6px)/-2);border-radius:50%;background:var(--c,#ffd98a);box-shadow:0 0 10px var(--c,#ffd98a);animation:dzP var(--t,1s) cubic-bezier(.1,.7,.3,1) forwards}
@keyframes dzP{from{transform:rotate(var(--a)) translateX(0) scale(1.4);opacity:1}to{transform:rotate(var(--a)) translateX(var(--r)) scale(.2);opacity:0}}
.dz-flash{position:fixed;inset:0;background:#fff;pointer-events:none;animation:dzFlash .45s ease-out forwards}
@keyframes dzFlash{from{opacity:.85}to{opacity:0}}
.dz-banner{font-size:clamp(22px,7vw,40px);font-weight:700;letter-spacing:.08em;color:#ffe9a8;text-shadow:0 0 18px #ffb84a,0 3px 0 #5a3a10;animation:dzBan .6s cubic-bezier(.2,1.8,.4,1)}
.dz-banner.bad{color:#ff9a9a;text-shadow:0 0 18px #e02030,0 3px 0 #3a0808}
@keyframes dzBan{from{transform:scale(2.6) rotate(-6deg);opacity:0}}
.dz-res{color:#fff;font-family:var(--body,serif);font-size:clamp(18px,5vw,26px);max-width:520px;min-height:1.4em;opacity:0;transform:translateY(12px);transition:all .45s ease .15s}
.dz-res.on{opacity:1;transform:none}
.dz-hint{color:#e6c47a99;font-size:13px;letter-spacing:.12em;opacity:0;transition:opacity .4s ease .9s}.dz-hint.on{opacity:1}
#sa-dice.legend{background:radial-gradient(circle at 50% 45%,#5a3a10ee,#0a0604f5 72%)}
#sa-dice.curse{background:radial-gradient(circle at 50% 45%,#4a0a14ee,#060205f5 72%)}
#sa-dice.curse .dz-f0{stroke:#ff6a6a}#sa-dice.curse .dz-ring{border-color:#ff5a5a}
`;
  const st = document.createElement("style"); st.id = "sa-dice-css"; st.textContent = css; document.head.appendChild(st);

  const DIE = `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="dzg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a3aa0"/><stop offset="1" stop-color="#140e38"/></linearGradient></defs>
    <polygon class="dz-f0" points="100,6 182,53 182,147 100,194 18,147 18,53"/>
    <polygon class="dz-f1" points="100,42 160,146 40,146"/>
    <path class="dz-ln" d="M100 6L100 42M182 53L160 146M182 147L160 146M100 194L100 146M18 147L40 146M18 53L40 146M100 42L182 53M100 42L18 53M160 146L100 194M40 146L100 194"/></svg>`;
  const RUNES = `<svg class="dz-runes" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" stroke-dasharray="2 3"/><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="36" stroke-dasharray="10 4 1 4"/></svg>`;

  function burst(arena, n, colors, maxR) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i"); p.className = "dz-p";
      p.style.cssText = `--a:${Math.random() * 360}deg;--r:${maxR * (0.35 + Math.random() * 0.65)}px;--s:${3 + Math.random() * 7}px;--t:${0.7 + Math.random() * 0.9}s;--c:${colors[i % colors.length]}`;
      arena.appendChild(p); setTimeout(() => p.remove(), 1700);
    }
  }
  function rings(arena, k) { for (let i = 0; i < k; i++) { const r = document.createElement("i"); r.className = "dz-ring"; r.style.animationDelay = i * 0.12 + "s"; arena.appendChild(r); setTimeout(() => r.remove(), 1400); } }

  function show({ sides, value, label, result = "", tier = false }) {
    return new Promise((done) => {
      const ov = document.createElement("div"); ov.id = "sa-dice"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", label);
      ov.innerHTML = `<div class="dz-stage"><div class="dz-label">${label}</div>
        <div class="dz-arena"><div class="dz-rays"></div>${RUNES}<div class="dz-die"><div class="dz-spin">${DIE}</div><div class="dz-num">?</div></div></div>
        <div class="dz-banner-slot"></div><div class="dz-res" aria-live="assertive"></div><div class="dz-hint">${Lx("Toca para continuar", "Tap to continue")}</div></div>`;
      document.body.appendChild(ov);
      const tr = () => { if (typeof translateDOM === "function") translateDOM(ov); };
      tr();
      const $ = (s) => ov.querySelector(s); const stage = $(".dz-stage"), arena = $(".dz-arena"), die = $(".dz-die"), spin = $(".dz-spin"), num = $(".dz-num");
      const fs = (v) => num.style.setProperty("--fs", `${String(v).length > 3 ? 46 : String(v).length > 2 ? 56 : 68}px`);
      const frac = sides > 1 ? (value - 1) / (sides - 1) : 1;
      const kind = !tier ? "" : frac >= 0.9 ? "legend" : frac <= 0.1 ? "curse" : "";
      let landed = false, closed = false, raf = 0, tickT = 0, autoT = 0;

      const close = () => {
        if (closed) return; closed = true; clearTimeout(autoT); removeEventListener("keydown", onKey, true);
        ov.classList.add("out"); setTimeout(() => { ov.remove(); done(); }, 300);
      };
      const land = () => {
        if (landed) return; landed = true; cancelAnimationFrame(raf); clearTimeout(tickT);
        num.textContent = value; fs(value);
        const rest = Math.ceil(rot / 360) * 360; spin.style.transition = "transform .3s cubic-bezier(.2,1.4,.4,1)"; spin.style.transform = `rotate(${rest}deg)`;
        ov.querySelector(".dz-res").textContent = result; ov.querySelector(".dz-res").classList.add("on"); ov.querySelector(".dz-hint").classList.add("on");
        setTimeout(tr, 0);
        if (!RM()) {
          die.classList.add("land"); stage.classList.add("shake");
          const fl = document.createElement("div"); fl.className = "dz-flash"; ov.appendChild(fl); setTimeout(() => fl.remove(), 500);
          const R = arena.clientWidth;
          if (kind === "legend") { burst(arena, 110, ["#ffd98a", "#fff2c8", "#ffb84a", "#ffffff"], R * 1.1); rings(arena, 5); arena.style.setProperty("--ray", 1); die.style.setProperty("--glow", "40px"); }
          else if (kind === "curse") { burst(arena, 60, ["#ff5a5a", "#a01020", "#2a0a0a"], R * 0.8); rings(arena, 3); arena.style.setProperty("--ray", 0); }
          else { burst(arena, 55, ["#ffd98a", "#fff2c8", "#9ab0ff"], R * 0.85); rings(arena, 3); arena.style.setProperty("--ray", 0.55); die.style.setProperty("--glow", "26px"); }
        }
        if (kind) { ov.classList.add(kind); $(".dz-banner-slot").innerHTML = `<div class="dz-banner ${kind === "curse" ? "bad" : ""}">${kind === "legend" ? Lx("¡TIRADA LEGENDARIA!", "LEGENDARY ROLL!") : Lx("Tirada maldita…", "Cursed roll…")}</div>`; }
        sfx(kind === "legend" ? "crit" : kind === "curse" ? "ehit" : "hit");
        if (kind === "legend") setTimeout(() => sfx("level"), 250);
        autoT = setTimeout(close, kind ? 6000 : 4500);
      };
      const onKey = (e) => { if (["Escape", "Enter", " "].includes(e.key)) { e.preventDefault(); e.stopPropagation(); landed ? close() : land(); } };
      addEventListener("keydown", onKey, true);
      ov.addEventListener("click", () => (landed ? close() : land()));

      // Giro: la velocidad cae de forma exponencial; los números cambian cada vez más despacio (×1.12 por paso).
      let rot = 0, w = 1500, last = performance.now(); const t0 = last;
      if (RM()) { land(); return; }
      sfx("charge");
      const frame = (now) => {
        const dt = (now - last) / 1000; last = now; w *= Math.exp(-dt / 0.95); rot += w * dt;
        const k = w / 1500, t = (now - t0) / 1000;
        spin.style.transform = `translateY(${-Math.abs(Math.sin(t * 9)) * 26 * k}px) rotate(${rot}deg) scale(${1 + 0.08 * Math.sin(t * 13) * k})`;
        arena.style.setProperty("--ray", Math.min(0.45, t * 0.25));
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      let delay = 32, pitch = 0;
      const tick = () => {
        const v = 1 + Math.floor(Math.random() * sides); num.textContent = v; fs(v);
        try { window.SA_SFX && pitch++ % 2 === 0 && window.SA_SFX.click(); } catch (e) {}
        delay *= 1.12;
        if (delay > 330) tickT = setTimeout(land, 380); else tickT = setTimeout(tick, delay);
      };
      tick();
    });
  }
  // Varias tiradas seguidas (p. ej. dos afinidades)
  async function seq(list) { for (const r of list) await show(r); }
  window.SA_DICE = { show, seq };
})();
