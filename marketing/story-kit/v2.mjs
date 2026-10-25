/* Aura Films story kit v2: 5 story posters + 5 multi-scene story videos (all 1080x1920, no prices).
   node marketing/story-kit/v2.mjs [posters|videos|all] [id-prefix] */
import puppeteer from 'puppeteer';
import { readdirSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';

const ROOT = process.cwd(), KIT = ROOT + '/marketing/story-kit', OUT = KIT + '/out-v2';
const u = p => pathToFileURL(ROOT + '/' + p).href, img = f => u('images/' + f);
const fonts = readdirSync(KIT + '/fonts').map(f => {
  const [fam, w, st] = f.replace('.woff2', '').split(/-(?=\d)|-(?=normal|italic)/);
  return `@font-face{font-family:"${fam}";src:url("${u('marketing/story-kit/fonts/' + f)}");font-weight:${w};font-style:${st}}`;
}).join('');
const base = `${fonts}*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}
body{position:relative;-webkit-font-smoothing:antialiased}.x{position:absolute}img.c{width:100%;height:100%;object-fit:cover;display:block}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.13;mix-blend-mode:overlay;z-index:50;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
@keyframes up{from{opacity:0;transform:translateY(70px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes out{to{opacity:0;transform:translateY(-40px)}}
@keyframes fadeout{to{opacity:0}}
@keyframes slam{0%{opacity:0;transform:scale(1.7)}60%{opacity:1;transform:scale(.96)}100%{opacity:1;transform:scale(1)}}
@keyframes pop{0%{opacity:0;transform:scale(.5) rotate(var(--r,0deg))}70%{opacity:1;transform:scale(1.05) rotate(var(--r,0deg))}100%{opacity:1;transform:scale(1) rotate(var(--r,0deg))}}
@keyframes drop{0%{opacity:0;transform:translateY(-500px) rotate(calc(var(--r,0deg) - 14deg))}70%{opacity:1;transform:translateY(20px) rotate(var(--r,0deg))}100%{opacity:1;transform:rotate(var(--r,0deg))}}
@keyframes kb{from{transform:scale(1.18) translate(2%,1%)}to{transform:scale(1.02) translate(-1%,0)}}
@keyframes left{from{opacity:0;transform:translateX(-140px)}to{opacity:1;transform:none}}
@keyframes wipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes rise{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes tick{from{stroke-dashoffset:60}to{stroke-dashoffset:0}}`;
/* an element visible from t0 to t1 (seconds), entering with `inA`, leaving with a fade */
const S = (t0, t1, inA = 'up', d = .7) => `animation:${inA} ${d}s cubic-bezier(.2,.8,.2,1) ${t0}s both${t1 ? `,fadeout .45s ease ${t1}s forwards` : ''}`;
const KB = (t0, len) => `animation:kb ${len}s linear ${t0}s both`;

/* ───────────────────────── POSTERS ───────────────────────── */
const POSTERS = [
{ id: 'P1-fall-minis', css: `body{background:#F2B33D;color:#1E120A;font-family:satoshi}
.k{left:80px;top:250px;font:700 30px/1 satoshi;letter-spacing:.34em;text-transform:uppercase}
.h{left:72px;top:300px;font:400 228px/.84 tanker;text-transform:uppercase}
.s{left:80px;top:720px;width:640px;font:500 44px/1.3 satoshi}
.ph{left:0;right:0;top:1120px;bottom:0;clip-path:polygon(0 14%,100% 0,100% 100%,0 100%)}
.tag{right:70px;top:1010px;width:250px;height:250px;border-radius:50%;background:#1E120A;color:#F2B33D;display:grid;place-items:center;text-align:center;font:400 54px/.95 tanker;text-transform:uppercase;transform:rotate(-10deg);z-index:3}
.cta{left:70px;right:70px;bottom:150px;background:#FFF6E6;border-radius:999px;padding:30px 44px;display:flex;justify-content:space-between;font:900 40px/1 satoshi;z-index:3}
.cta span{font-weight:500}`,
  html: `<div class="x k">Fall Mini Sessions · Kingston</div>
<div class="x h">The leaves<br>won't wait.</div>
<div class="x s">Neither will this year's version of your family. Short outdoor sessions in the last of the golden light.</div>
<div class="x tag">Limited<br>dates</div>
<div class="x ph"><img class="c" src="${img('IMG_3432.JPG.jpeg')}" style="object-position:50% 60%"></div>
<div class="x cta">DM “FALL” <span>@aura.filmsca</span></div>` },

{ id: 'P2-weddings', css: `body{background:#000;color:#fff;font-family:satoshi}
.ph{inset:0}.ph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 48%,rgba(0,0,0,.85) 100%)}
.mast{left:0;right:0;top:190px;text-align:center;font:500 250px/.8 boska;letter-spacing:-.04em}
.issue{left:0;right:0;top:420px;text-align:center;font:700 26px/1 satoshi;letter-spacing:.5em;text-transform:uppercase}
.line{left:80px;width:420px;text-shadow:0 2px 14px rgba(0,0,0,.75);font:700 30px/1.25 satoshi;text-transform:uppercase;letter-spacing:.04em}
.line b{display:block;font:italic 500 50px/1 boska;text-transform:none;letter-spacing:0;color:#F1D29A;margin-bottom:8px}
.h{left:80px;right:80px;top:1280px;font:italic 500 92px/.96 boska;letter-spacing:-.02em}
.cta{left:80px;top:1660px;font:700 32px/1 satoshi;letter-spacing:.14em;text-transform:uppercase;border-bottom:2px solid #F1D29A;padding-bottom:12px}`,
  html: `<div class="x ph"><img class="c" src="${img('IMG_9548.JPG.jpeg')}" style="object-position:50% 30%"></div>
<div class="x mast">aura</div><div class="x issue">The wedding issue · Kingston</div>
<div class="x line" style="top:560px"><b>One take only.</b>No retakes on the first look</div>
<div class="x line" style="top:760px"><b>Within a week.</b>Your sneak peek arrives</div>
<div class="x h">You'll only see it once. We'll make sure you see it forever.</div>
<div class="x cta">Is your date open? DM “DATE”</div>` },

{ id: 'P3-family', css: `body{background:#DCE3D1;color:#2F3A2A;font-family:"general-sans"}
.h{left:80px;right:80px;top:230px;font:400 86px/1 zodiak;letter-spacing:-.03em}.h em{color:#B4552F}
.pol{background:#FFFDF8;padding:22px 22px 80px;box-shadow:0 30px 50px -24px rgba(30,40,20,.5)}
.pol span{position:absolute;left:0;right:0;bottom:22px;text-align:center;font:italic 400 36px/1 zodiak;color:#5B4A3A}
.s{left:80px;right:80px;top:1570px;font:500 40px/1.35 "general-sans"}
.cta{left:80px;top:1690px;font:600 38px/1 "general-sans";background:#2F3A2A;color:#DCE3D1;padding:26px 40px;border-radius:999px}`,
  html: `<div class="x h">Someday they won't fit in your arms. <em>Photograph them while they still do.</em></div>
<div class="x pol" style="left:90px;top:780px;width:470px;height:520px;transform:rotate(-6deg)"><img class="c" src="${img('baby-10.jpg')}" style="height:418px"><span>the giggles</span></div>
<div class="x pol" style="left:540px;top:740px;width:440px;height:560px;transform:rotate(5deg)"><img class="c" src="${img('IMG_8816.JPG.jpeg')}" style="height:458px"><span>the bump</span></div>
<div class="x pol" style="left:300px;top:1100px;width:470px;height:420px;transform:rotate(-2deg)"><img class="c" src="${img('baby-7.jpg')}" style="height:318px"><span>sunday mornings</span></div>
<div class="x s">Family, maternity and newborn sessions, at home or outdoors.</div>
<div class="x cta">DM “FAMILY” to start</div>` },

{ id: 'P4-portraits', css: `body{background:#0B0B0B;color:#fff;font-family:"general-sans"}
.ph{left:0;right:0;top:0;height:1400px}.ph img{filter:grayscale(1) contrast(1.1)}
.ph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,11,0) 55%,#0B0B0B 100%)}
.you{left:50px;top:1020px;font:400 520px/.8 tanker;color:#FF4FA3;mix-blend-mode:screen}
.s{left:70px;right:70px;top:1480px;font:600 52px/1.15 "general-sans";letter-spacing:-.01em}
.t{left:70px;top:1660px;font:500 32px/1.4 "general-sans";color:#bbb}
.cta{right:70px;top:1700px;font:600 34px/1 "general-sans";color:#0B0B0B;background:#FF4FA3;padding:24px 34px;border-radius:999px}`,
  html: `<div class="x ph"><img class="c" src="${img('IMG_3438.JPG.jpeg')}" style="object-position:50% 25%"></div>
<div class="x you">YOU.</div>
<div class="x s">At your best. Without the awkward posing.</div>
<div class="x t">Headshots · Graduation<br>Birthdays · Just because</div>
<div class="x cta">DM “PORTRAIT”</div>` },

{ id: 'P5-events', css: `body{background:#FF3B2E;color:#fff;font-family:satoshi}
.tk{left:70px;right:70px;top:230px;bottom:230px;background:#fff;color:#1A1A1A;border-radius:36px;overflow:hidden}
.tk:before,.tk:after{content:"";position:absolute;top:955px;width:90px;height:90px;border-radius:50%;background:#FF3B2E}
.tk:before{left:-45px}.tk:after{right:-45px}
.ph{left:0;right:0;top:0;height:620px}
.inv{left:60px;top:680px;font:700 28px/1 satoshi;letter-spacing:.4em;text-transform:uppercase;color:#FF3B2E}
.h{left:56px;top:730px;font:900 128px/.9 satoshi;letter-spacing:-.04em}
.perf{left:60px;right:60px;top:1000px;border-top:4px dashed #ddd}
.s{left:60px;right:60px;top:1040px;font:500 38px/1.35 satoshi;color:#333}
.list{left:60px;right:60px;top:1210px;font:900 30px/1.5 satoshi;letter-spacing:.06em;text-transform:uppercase}
.cta{left:60px;right:60px;bottom:56px;background:#1A1A1A;color:#fff;border-radius:999px;padding:26px 36px;font:900 36px/1 satoshi;text-align:center}`,
  html: `<div class="x tk"><div class="x ph"><img class="c" src="${img('baby-12.jpg')}" style="object-position:50% 30%"></div>
<div class="x inv">You're invited</div><div class="x h">to enjoy your own party.</div><div class="x perf"></div>
<div class="x s">You host. We catch every hug, toast and candle, so you can actually be in the moment.</div>
<div class="x list">Baby showers · Birthdays<br>Anniversaries · Corporate events</div>
<div class="x cta">DM “EVENT” to check your date</div></div>` },
];

/* ───────────────────────── VIDEOS (multi-scene, 17–20 s) ───────────────────────── */
const VIDEOS = [
/* V1 kinetic type — Fall Minis, 18 s */
{ id: 'V1-fall-kinetic', dur: 18, css: `body{background:#F6EADB;color:#2A170C;font-family:satoshi}
.t{left:70px;right:70px;font:400 210px/.86 tanker;text-transform:uppercase}.o{color:#E2531E}
.m{left:80px;right:80px;font:500 52px/1.25 satoshi}
.ph{border-radius:26px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(80,30,0,.6)}
.b{left:80px;font:900 56px/1.1 satoshi;display:flex;gap:22px;align-items:center}.b i{width:22px;height:22px;border-radius:50%;background:#E2531E;display:block}
.cta{left:70px;right:70px;top:1380px;background:#2A170C;color:#F6EADB;border-radius:999px;padding:34px;text-align:center;font:900 60px/1 satoshi}`,
  html: `
<div class="x t" style="top:500px;font-size:180px;${S(.2, 3.4, 'slam', .6)}">Your camera roll</div>
<div class="x t" style="top:840px;font-size:180px;${S(1.0, 3.4, 'left')}">is full.</div>
<div class="x t o" style="top:560px;${S(3.8, 6.8, 'slam', .6)}">You're in</div>
<div class="x t o" style="top:950px;${S(4.5, 6.8, 'left')}">none of it.</div>
<div class="x ph" style="left:90px;top:300px;width:600px;height:760px;${S(7.1, 11.6, 'pop')};--r:-4deg"><img class="c" src="${img('IMG_3432.JPG.jpeg')}"></div>
<div class="x ph" style="left:420px;top:900px;width:560px;height:700px;${S(7.6, 11.6, 'pop')};--r:5deg"><img class="c" src="${img('por-6.jpg')}"></div>
<div class="x t" style="top:250px;left:auto;right:70px;text-align:right;font-size:150px;${S(8.2, 11.6, 'up')}">Fall<br>Minis</div>
<div class="x m" style="top:330px;${S(12, 17.6, 'up')}">Short outdoor sessions, in the last golden light of the year.</div>
<div class="x b" style="top:700px;${S(12.8, 17.6, 'left')}"><i></i>Families</div>
<div class="x b" style="top:800px;${S(13.2, 17.6, 'left')}"><i></i>Couples</div>
<div class="x b" style="top:900px;${S(13.6, 17.6, 'left')}"><i></i>Portraits</div>
<div class="x m" style="top:1060px;font-weight:700;${S(14.2, 17.6, 'up')}">We guide every pose. Limited dates.</div>
<div class="x cta" style="${S(15, 0, 'slam', .6)}">DM “FALL”</div>
<div class="x m" style="top:1560px;text-align:center;font-size:40px;${S(15.6, 0, 'fade')}">@aura.filmsca · Kingston</div>` },

/* V2 cinematic — Weddings, 20 s */
{ id: 'V2-weddings-cinematic', dur: 20, css: `body{background:#000;color:#F4EAD8;font-family:satoshi}
.f{left:0;right:0;top:330px;height:1260px;overflow:hidden}
.bar{left:0;right:0;height:330px;background:#000;z-index:5}
.cap{left:80px;right:80px;top:1630px;font:italic 500 66px/1.1 boska;z-index:6}
.big{left:80px;right:80px;font:500 120px/.95 boska;letter-spacing:-.02em;z-index:6}.big em{color:#E5C485}
.sm{left:80px;right:80px;font:700 30px/1.4 satoshi;letter-spacing:.3em;text-transform:uppercase;z-index:6}
.cta{left:80px;right:80px;top:1360px;border:2px solid #E5C485;color:#E5C485;border-radius:999px;padding:32px;text-align:center;font:700 44px/1 satoshi;z-index:6}`,
  html: `
<div class="x bar" style="top:0"></div><div class="x bar" style="bottom:0"></div>
${[['_DSC8637.jpg', 0, 4.6, '50% 40%'], ['wed-10.jpg', 4.2, 8.8, '50% 40%'], ['wed-12.jpg', 8.4, 12.8, '50% 30%']].map(([f, a, b, p]) => `<div class="x f" style="${S(a, b, 'fade', .8)}"><img class="c" src="${img(f)}" style="object-position:${p};${KB(a, 5)}"></div>`).join('')}
<div class="x sm" style="top:250px;z-index:6;${S(.3, 12.6, 'fade')}">Kingston weddings</div>
<div class="x cap" style="${S(.8, 4.2, 'up')}">The vows you'll forget you said.</div>
<div class="x cap" style="${S(5, 8.4, 'up')}">The forehead kiss nobody else saw.</div>
<div class="x cap" style="${S(9.2, 12.6, 'up')}">The moment it finally felt real.</div>
<div class="x big" style="top:560px;${S(13.2, 0, 'up', .9)}">You'll live it once.<br><em>We'll keep it forever.</em></div>
<div class="x sm" style="top:1000px;${S(14.4, 0, 'fade')}">Kingston &amp; across Ontario</div>
<div class="x sm" style="top:1070px;${S(15, 0, 'fade')}">Sneak peek within a week</div>
<div class="x sm" style="top:1140px;${S(15.6, 0, 'fade')}">Two photographers on our larger days</div>
<div class="x cta" style="${S(16.6, 0, 'up')}">Is your date open? DM “DATE”</div>` },

/* V3 checklist UI — Portraits, 17 s */
{ id: 'V3-portraits-checklist', dur: 17, css: `body{background:#F2F2EE;color:#111;font-family:"general-sans"}
.card{left:70px;right:70px;top:300px;height:1240px;background:#fff;border-radius:44px;box-shadow:0 40px 80px -40px rgba(0,0,0,.35)}
.ttl{left:120px;top:380px;font:600 30px/1 "general-sans";color:#999;letter-spacing:.1em;text-transform:uppercase}
.q{left:120px;right:120px;top:450px;font:900 84px/1 satoshi;letter-spacing:-.03em}
.row{left:120px;display:flex;align-items:center;gap:30px;font:600 56px/1 "general-sans"}
.box{width:64px;height:64px;border:5px solid #111;border-radius:16px;position:relative;flex:none}
.box svg{position:absolute;inset:-6px;width:76px;height:76px}
.box path{fill:none;stroke:#2F5BFF;stroke-width:10;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:60}
.grid{left:70px;right:70px;top:300px;height:1240px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid div{border-radius:30px;overflow:hidden}
.big{left:80px;right:80px;font:900 120px/.92 satoshi;letter-spacing:-.04em}.big em{font-style:normal;color:#2F5BFF}
.cta{left:70px;right:70px;top:1380px;background:#2F5BFF;color:#fff;border-radius:999px;padding:34px;text-align:center;font:900 56px/1 satoshi}`,
  html: `
<div class="x card" style="${S(.1, 8.2, 'pop')}"></div>
<div class="x ttl" style="${S(.4, 8.2, 'fade')}">Notes · To do</div>
<div class="x q" style="${S(.6, 8.2, 'up')}">New photos for…</div>
${['LinkedIn', 'Graduation', 'Your birthday', 'Dating profile', 'Just because'].map((t, i) => {
    const a = 1.4 + i * 1.1; return `<div class="x row" style="top:${660 + i * 150}px;${S(a, 8.2, 'left')}"><div class="box"><svg viewBox="0 0 76 76"><path d="M18 40 L32 54 L58 24" style="animation:tick .35s ease ${a + .5}s both"/></svg></div>${t}</div>`; }).join('')}
<div class="x grid" style="${S(8.6, 12.6, 'fade', .5)}">${['por-2.jpg', 'por-5.jpg', 'IMG_3431.JPG.jpeg', 'por-3.jpg'].map((f, i) => `<div style="${S(8.6 + i * .25, 0, 'pop')}"><img class="c" src="${img(f)}"></div>`).join('')}</div>
<div class="x big" style="top:420px;${S(13, 0, 'up')}">Never know what to do with your hands?</div>
<div class="x big" style="top:900px;${S(13.8, 0, 'up')}"><em>We'll guide every pose.</em></div>
<div class="x cta" style="${S(14.8, 0, 'slam', .6)}">DM “PORTRAIT”</div>` },

/* V4 scrapbook — Family, 18 s */
{ id: 'V4-family-scrapbook', dur: 18, css: `body{background:#E8D9C1;color:#3D2A1E;font-family:"general-sans"}
.pol{background:#FFFDF7;padding:20px 20px 86px;box-shadow:0 30px 50px -22px rgba(60,40,20,.55)}
.pol img{height:calc(100% - 0px)}
.pol span{position:absolute;left:0;right:0;bottom:22px;text-align:center;font:italic 400 44px/1 zodiak}
.tape{position:absolute;top:-24px;left:50%;width:150px;height:46px;margin-left:-75px;background:rgba(255,240,200,.7);transform:rotate(-4deg)}
.big{left:80px;right:80px;font:400 118px/1 zodiak;letter-spacing:-.03em}.big em{color:#B4552F}
.m{left:80px;right:80px;font:500 50px/1.3 "general-sans"}
.cta{left:70px;right:70px;top:1400px;background:#3D2A1E;color:#F3E7D3;border-radius:999px;padding:34px;text-align:center;font:600 56px/1 "general-sans"}`,
  html: `
${[['IMG_8816.JPG.jpeg', 'the bump', 120, 260, 520, 640, -7, .3], ['baby-1.jpg', 'brand new', 500, 420, 480, 620, 6, 1.6], ['baby-10.jpg', 'the giggles', 160, 900, 520, 560, 4, 2.9], ['baby-16.jpg', 'that laugh', 470, 1080, 520, 560, -5, 4.2]].map(([f, t, l, tp, w, h, r, a]) => `<div class="x pol" style="left:${l}px;top:${tp}px;width:${w}px;height:${h}px;--r:${r}deg;${S(a, 8.6, 'drop', .9)}"><div class="tape"></div><img class="c" src="${img(f)}" style="height:${h - 106}px"><span>${t}</span></div>`).join('')}
<div class="x big" style="top:520px;${S(9, 13.4, 'up')}">They grow up in the blink of an eye.</div>
<div class="x big" style="top:900px;${S(10.2, 13.4, 'up')}"><em>Blink with us.</em></div>
<div class="x m" style="top:420px;${S(13.8, 0, 'up')}">Family, maternity and newborn sessions in Kingston.</div>
<div class="x m" style="top:680px;${S(14.6, 0, 'left')}">At home, where life actually happens. Or outdoors in the golden hour.</div>
<div class="x m" style="top:980px;font-weight:600;${S(15.4, 0, 'left')}">Print release with every gallery.</div>
<div class="x cta" style="${S(16.1, 0, 'slam', .6)}">DM “FAMILY”</div>` },

/* V5 countdown — Events, 17 s */
{ id: 'V5-events-countdown', dur: 17, css: `body{background:#0E0E0E;color:#fff;font-family:"general-sans"}
.n{left:0;right:0;text-align:center;font:400 470px/.85 tanker;color:#FF3B2E}
.l{left:0;right:0;text-align:center;font:600 64px/1.15 "general-sans"}
.split{left:0;right:0;overflow:hidden}
.big{left:70px;right:70px;font:400 200px/.86 tanker;text-transform:uppercase}.big b{color:#FF3B2E;font-weight:400}
.mq{left:-40px;right:-40px;top:1240px;height:130px;background:#FF3B2E;transform:rotate(-3deg);overflow:hidden;display:flex;align-items:center}
.mq div{white-space:nowrap;font:400 92px/1 tanker;color:#0E0E0E;animation:mq 7s linear 9.5s both}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-1600px)}}
.m{left:80px;right:80px;font:500 46px/1.35 "general-sans"}
.cta{left:70px;right:70px;top:1500px;background:#fff;color:#0E0E0E;border-radius:999px;padding:34px;text-align:center;font:600 54px/1 "general-sans"}`,
  html: `
<div class="x n" style="top:420px;${S(.2, 2.6, 'slam', .5)}">3</div><div class="x l" style="top:860px;${S(.5, 2.6, 'fade')}">months of planning.</div>
<div class="x n" style="top:420px;${S(2.9, 5.3, 'slam', .5)}">80</div><div class="x l" style="top:860px;${S(3.2, 5.3, 'fade')}">guests to hug.</div>
<div class="x n" style="top:420px;${S(5.6, 8, 'slam', .5)}">0</div><div class="x l" style="top:860px;${S(5.9, 8, 'fade')}">photos with you in them.</div>
<div class="x split" style="top:260px;height:900px;${S(8.3, 0, 'rise', .8)}"><img class="c" src="${img('_DSC1267.jpg')}" style="${KB(8.3, 9)}"></div>
<div class="x big" style="top:1460px;${S(8.8, 12.4, 'up')}">You host.<br><b>We shoot.</b></div>
<div class="x mq" style="${S(9.4, 0, 'fade')}"><div>${'BABY SHOWERS · BIRTHDAYS · ANNIVERSARIES · CORPORATE · '.repeat(4)}</div></div>
<div class="x m" style="top:1420px;${S(12.8, 0, 'up')}">Every hug, toast and candle, caught, so you can be in the moment.</div>
<div class="x cta" style="top:1640px;${S(14.4, 0, 'slam', .6)}">DM “EVENT”</div>` },
];

const mode = process.argv[2] || 'all', only = process.argv[3];
const C = readdirSync('/opt/pw-browsers').filter(d => /^chromium-\d/.test(d)).map(d =>
  `/opt/pw-browsers/${d}/${readdirSync('/opt/pw-browsers/' + d).find(x => x.startsWith('chrome-linux'))}/chrome`)[0];
mkdirSync(OUT, { recursive: true });
const b = await puppeteer.launch({ executablePath: C, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await b.newPage(); await page.setViewport({ width: 1080, height: 1920 });
const logo = dark => `<img class="x" src="${img(dark ? 'aura-mark-dark.png' : 'aura-mark-light.png')}" style="top:120px;left:50%;height:58px;transform:translateX(-50%);z-index:20">`;
const DARK = { 'P1-fall-minis': 1, 'P3-family': 1, 'V1-fall-kinetic': 1, 'V3-portraits-checklist': 1, 'V4-family-scrapbook': 1 };
const load = async d => {
  const f = `${KIT}/v2-${d.id}.html`;
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${base}${d.css}</style></head><body>${d.id === 'P2-weddings' || d.id === 'P5-events' ? '' : logo(DARK[d.id])}${d.html}<div class="grain"></div></body></html>`);
  await page.goto(pathToFileURL(f).href, { waitUntil: 'networkidle0' }); await page.evaluate(() => document.fonts.ready);
};
const seek = t => page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), t);
if (mode !== 'videos') for (const d of POSTERS.filter(x => !only || x.id.startsWith(only))) {
  await load(d); await page.screenshot({ path: `${OUT}/${d.id}.jpg`, type: 'jpeg', quality: 93 }); console.log('poster', d.id);
}
if (mode !== 'posters') for (const d of VIDEOS.filter(x => !only || x.id.startsWith(only))) {
  await load(d); const fr = `${OUT}/fr-${d.id}`; rmSync(fr, { recursive: true, force: true }); mkdirSync(fr);
  const n = d.dur * 30;
  for (let i = 0; i < n; i++) { await seek(i * 1000 / 30); await page.screenshot({ path: `${fr}/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 88 }); }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', `${fr}/%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', `${OUT}/${d.id}.mp4`]);
  rmSync(fr, { recursive: true, force: true }); console.log('video', d.id, d.dur + 's');
}
await b.close();
