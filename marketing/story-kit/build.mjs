/* Aura Films story kit: 5 Instagram Story ads (1080x1920).
   Each design renders as a still poster (its final frame) and an 8-second motion video.
   Run from the repo root:  node marketing/story-kit/build.mjs [posters|videos|all]
   Fonts: Satoshi (from the requested list) + free Fontshare display faces in the same spirit
   (Tanker ~ Druk, Boska ~ Canela/Ogg, Zodiak ~ GT Super, General Sans ~ Neue Montreal).
   With licensed files for the originals, swap the @font-face src lines and re-run. */
import puppeteer from 'puppeteer';
import { readdirSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';

const ROOT = process.cwd(), KIT = ROOT + '/marketing/story-kit', OUT = KIT + '/out';
const u = p => pathToFileURL(ROOT + '/' + p).href;
const img = f => u('images/' + f);
const FPS = 30, DUR = 8;
const fonts = readdirSync(KIT + '/fonts').map(f => {
  const [fam, w, st] = f.replace('.woff2', '').split(/-(?=\d)|-(?=normal|italic)/);
  return `@font-face{font-family:"${fam}";src:url("${u('marketing/story-kit/fonts/' + f)}") format("woff2");font-weight:${w};font-style:${st}}`;
}).join('\n');

const base = `${fonts}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden}
body{position:relative;-webkit-font-smoothing:antialiased}
.abs{position:absolute}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.12;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.logo{position:absolute;top:150px;left:50%;transform:translateX(-50%);height:64px}
@keyframes up{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes zoom{from{transform:scale(1.18)}to{transform:scale(1)}}
@keyframes pop{0%{opacity:0;transform:scale(.6)}70%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes slam{0%{opacity:0;transform:scale(1.6)}60%{opacity:1;transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
@keyframes draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes wipe{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes left{from{opacity:0;transform:translateX(-120px)}to{opacity:1;transform:none}}
.a{animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.8,.2,1)}
`;
const A = (name, d, delay) => `animation:${name} ${d}s cubic-bezier(.2,.8,.2,1) ${delay}s both`;

const DESIGNS = [
/* 1 — Fall Minis: Tanker (Druk feel) + Satoshi, burnt orange, loud */
{ id: '1-fall-minis', css: `
body{background:#E2531E;color:#FFF3E2;font-family:satoshi}
.k{top:270px;left:0;right:0;text-align:center;font:700 30px/1 satoshi;letter-spacing:.42em;text-transform:uppercase;${A('fade', .8, .2)}}
.big{top:330px;left:0;right:0;text-align:center;font:400 560px/.8 tanker;letter-spacing:-.01em;color:#FFF3E2}
.big span{display:inline-block}
.photo{left:150px;top:830px;width:780px;height:620px;border-radius:28px;overflow:hidden;transform:rotate(-3deg);box-shadow:0 40px 80px -30px rgba(60,15,0,.6);${A('pop', .9, 1.0)}}
.photo img{width:100%;height:100%;object-fit:cover;object-position:50% 45%;${A('zoom', 7, 1.0)}}
.ms{top:1500px;left:0;right:0;text-align:center;font:900 92px/.95 satoshi;letter-spacing:-.02em;text-transform:uppercase;${A('up', .8, 1.8)}}
.who{top:1712px;left:0;right:0;text-align:center;font:500 34px/1 satoshi;opacity:.92;${A('fade', .8, 2.4)}}`,
  html: `<img class="logo" src="${img('aura-mark-light.png')}" alt="">
<div class="abs k">Aura Films presents</div>
<div class="abs big">${'FALL'.split('').map((c, i) => `<span style="${A('up', .7, .3 + i * .12)}">${c}</span>`).join('')}</div>
<div class="abs photo"><img src="${img('IMG_3432.JPG.jpeg')}" alt=""></div>
<div class="abs ms">Mini Sessions</div>
<div class="abs who">Families · Couples · Portraits · DM “FALL” to book</div>` },

/* 2 — Weddings: Boska (Canela/Ogg feel), emerald + champagne, editorial */
{ id: '2-weddings', css: `
body{background:#0D3A2C;color:#F3E3C3;font-family:satoshi}
.ph{left:0;top:0;width:1080px;height:1180px;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;object-position:50% 100%;transform-origin:50% 100%;${A('zoomw', 8, 0)}}
@keyframes zoomw{from{transform:scale(1.32)}to{transform:scale(1.16)}}
.ph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,58,44,.55) 0%,rgba(13,58,44,0) 30%,rgba(13,58,44,0) 60%,#0D3A2C 100%)}
.h{left:90px;right:90px;top:1060px;font:500 150px/.92 boska;letter-spacing:-.02em}
.h em{font-style:italic;color:#E9C98D}
.l1{${A('up', 1, .6)}} .l2{${A('up', 1, .9)}}
.rule{left:94px;top:1400px;width:300px;height:2px;background:#E9C98D;transform-origin:left;${A('draw', .9, 1.5)}}
.t{left:94px;top:1440px;font:700 30px/1.3 satoshi;letter-spacing:.3em;text-transform:uppercase;${A('fade', .8, 1.8)}}
.p{left:94px;top:1500px;font:500 40px/1.35 satoshi;color:#F3E3C3;opacity:.9;${A('up', .8, 2.2)}}
.cta{left:94px;top:1660px;font:500 34px/1 satoshi;padding:24px 34px;border:1.5px solid #E9C98D;border-radius:999px;color:#E9C98D;${A('fade', .8, 2.8)}}`,
  html: `<div class="abs ph"><img src="${img('_DSC8637.jpg')}" alt=""></div>
<img class="logo" src="${img('aura-mark-light.png')}" alt="">
<div class="abs h"><div class="l1">The wedding,</div><div class="l2"><em>as it felt.</em></div></div>
<div class="abs rule"></div>
<div class="abs t">Kingston wedding photography</div>
<div class="abs p">From $1,195 · two photographers<br>on the larger packages</div>
<div class="abs cta">Book a date · itsaurafilms.com</div>` },

/* 3 — Portraits: Satoshi Black, cobalt + acid lime, graphic */
{ id: '3-portraits', css: `
body{background:#2234FF;color:#fff;font-family:satoshi}
.k{left:80px;top:290px;font:700 34px/1 satoshi;letter-spacing:.32em;text-transform:uppercase;color:#D8FF3C;${A('left', .7, .2)}}
.num{left:60px;top:340px;font:900 560px/.86 satoshi;letter-spacing:-.06em;color:#D8FF3C;${A('slam', .8, .5)}}
.num sup{font-size:.36em;vertical-align:.9em;letter-spacing:0}
.disc{right:-170px;top:1170px;width:720px;height:720px;border-radius:50%;overflow:hidden;border:10px solid #D8FF3C;${A('pop', .9, 1.2)}}
.disc img{width:100%;height:100%;object-fit:cover;object-position:52% 40%;${A('zoom', 6, 1.2)}}
.h{left:80px;top:900px;font:900 100px/.95 satoshi;letter-spacing:-.03em;text-transform:uppercase;${A('up', .8, 1.0)}}
.chips{left:80px;top:1170px;display:flex;flex-direction:column;gap:22px}
.chips div{display:inline-block;width:max-content;font:700 40px/1 satoshi;padding:20px 30px;border-radius:999px;background:#fff;color:#2234FF}
.cta{left:80px;top:1560px;font:700 38px/1.25 satoshi;color:#D8FF3C;${A('fade', .7, 2.8)}}`,
  html: `<img class="logo" src="${img('aura-mark-light.png')}" alt="" style="left:80px;transform:none">
<div class="abs k">Portraits from</div>
<div class="abs num"><sup>$</sup>85</div>
<div class="abs disc"><img src="${img('por-2.jpg')}" alt=""></div>
<div class="abs h">Portraits<br>in Kingston</div>
<div class="abs chips">${['30 minutes', '15 edited photos', 'One look'].map((c, i) => `<div style="${A('pop', .6, 1.7 + i * .25)}">${c}</div>`).join('')}</div>
<div class="abs cta">+$15 per extra 30 min<br>itsaurafilms.com</div>` },

/* 4 — Family: Zodiak (GT Super feel), blush + cocoa, soft */
{ id: '4-family', css: `
body{background:#F4D6CC;color:#4A2A20;font-family:"general-sans"}
.arch{left:140px;top:300px;width:800px;height:900px;border-radius:400px 400px 30px 30px;overflow:hidden;${A('wipe', 1.2, .2)}}
.arch img{width:100%;height:100%;object-fit:cover;object-position:46% 50%;${A('zoom', 8, .2)}}
.h{left:0;right:0;top:1250px;text-align:center;font:400 128px/.95 zodiak;letter-spacing:-.03em}
.h em{font-style:italic;color:#B5532F}
.l1{${A('up', .9, 1.0)}} .l2{${A('up', .9, 1.3)}}
.p{left:0;right:0;top:1560px;text-align:center;font:600 38px/1.35 "general-sans";${A('fade', .8, 2.0)}}
.cta{left:50%;top:1690px;transform:translateX(-50%);font:600 34px/1 "general-sans";background:#4A2A20;color:#F4D6CC;padding:24px 40px;border-radius:999px;white-space:nowrap;${A('fade', .8, 2.6)}}`,
  html: `<img class="logo" src="${img('aura-mark-dark.png')}" alt="" style="top:170px">
<div class="abs arch"><img src="${img('baby-16.jpg')}" alt=""></div>
<div class="abs h"><div class="l1">Little ones</div><div class="l2">grow <em>fast.</em></div></div>
<div class="abs p">Family &amp; maternity sessions<br>in Kingston, from $179</div>
<div class="abs cta">Book at itsaurafilms.com</div>` },

/* 5 — Events: Tanker + General Sans, black + signal red, marquee */
{ id: '5-events', css: `
body{background:#0F0F0F;color:#fff;font-family:"general-sans"}
.ph{left:60px;right:60px;top:300px;height:640px;border-radius:24px;overflow:hidden;${A('fade', .8, .1)}}
.ph img{width:100%;height:100%;object-fit:cover;${A('zoom', 8, .1)}}
.band{left:-40px;right:-40px;top:990px;height:120px;background:#FF3B2E;transform:rotate(-3deg);overflow:hidden;display:flex;align-items:center}
.band div{white-space:nowrap;font:400 84px/1 tanker;letter-spacing:.02em;color:#0F0F0F;animation:mq 8s linear 0s both}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-1400px)}}
.h{left:60px;top:1170px;font:400 250px/.84 tanker;text-transform:uppercase}
.h b{color:#FF3B2E;font-weight:400}
.l1{${A('slam', .7, .9)}} .l2{${A('slam', .7, 1.3)}}
.p{left:64px;top:1610px;font:500 38px/1.35 "general-sans";opacity:.92;${A('up', .7, 2.0)}}
.cta{left:64px;top:1735px;font:600 36px/1 "general-sans";color:#FF3B2E;${A('fade', .7, 2.6)}}`,
  html: `<img class="logo" src="${img('aura-mark-light.png')}" alt="" style="top:160px">
<div class="abs ph"><img src="${img('_DSC1267.jpg')}" alt=""></div>
<div class="abs band"><div>${'SHOWERS · BIRTHDAYS · ANNIVERSARIES · CORPORATE · '.repeat(4)}</div></div>
<div class="abs h"><div class="l1">Events</div><div class="l2">from <b>$399</b></div></div>
<div class="abs p">Up to 6 hours · a second photographer<br>on the Elite package</div>
<div class="abs cta">Book at itsaurafilms.com</div>` },
];

const mode = process.argv[2] || 'all';
const C = readdirSync('/opt/pw-browsers').filter(d => /^chromium-\d/.test(d)).map(d => {
  const dir = readdirSync('/opt/pw-browsers/' + d).find(x => x.startsWith('chrome-linux'));
  return `/opt/pw-browsers/${d}/${dir}/chrome`; })[0];
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: C, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
for (const d of DESIGNS.filter(x => !process.argv[3] || x.id.startsWith(process.argv[3]))) {
  const file = `${KIT}/${d.id}.html`;
  writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8"><style>${base}${d.css}</style></head><body>${d.html}<div class="grain"></div></body></html>`);
  await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const seek = t => page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), t);
  if (mode !== 'videos') {
    await seek(DUR * 1000);
    await page.screenshot({ path: `${OUT}/${d.id}-story.jpg`, type: 'jpeg', quality: 93 });
    console.log('poster', d.id);
  }
  if (mode !== 'posters') {
    const fr = `${OUT}/frames-${d.id}`; rmSync(fr, { recursive: true, force: true }); mkdirSync(fr);
    for (let i = 0; i < FPS * DUR; i++) {
      await seek(i * 1000 / FPS);
      await page.screenshot({ path: `${fr}/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 });
    }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${fr}/%04d.jpg`,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', `${OUT}/${d.id}-story.mp4`]);
    rmSync(fr, { recursive: true, force: true });
    console.log('video', d.id);
  }
}
await browser.close();
