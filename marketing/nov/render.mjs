/* Aura Films · November 2026 renderer.
   node marketing/nov/render.mjs [posters|videos|audio|all] [day,day,...]
   Posters: 1080x1920 JPG. Videos: 1080x1920, 15 s, 30 fps, H.264 + AAC (CC0 music by HoliznaCC0). */
import puppeteer from 'puppeteer';
import { readdirSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';
import { DAYS } from './content.mjs';

const ROOT = process.cwd(), NOV = ROOT + '/marketing/nov', OUT = NOV + '/out';
const u = p => pathToFileURL(ROOT + '/' + p).href, img = f => u('images/' + f);
const DUR = 15, FPS = 30;
const FONTS = readdirSync(NOV + '/fonts').map(f => {
  const [fam, w, st] = f.replace('.woff2', '').split(/-(?=\d)|-(?=normal|italic)/);
  return `@font-face{font-family:"${fam}";src:url("${u('marketing/nov/fonts/' + f)}");font-weight:${w};font-style:${st}}`;
}).join('');

/* palettes: bg, fg (text), acc (accent), mute (secondary text), ink (text on accent) */
const PAL = {
  cream:  { bg: '#F3ECE2', fg: '#1C1714', acc: '#B9461F', mute: '#5C4A3F', ink: '#FFF7EE' },
  night:  { bg: '#0F1722', fg: '#F4ECDF', acc: '#E8B25F', mute: '#B9B2A6', ink: '#1A1206' },
  forest: { bg: '#173428', fg: '#F6EFDA', acc: '#F2C14E', mute: '#C5CDB8', ink: '#1E1A08' },
  plum:   { bg: '#341A27', fg: '#FBEAE4', acc: '#F49A87', mute: '#D5B9B5', ink: '#2A0F18' },
  cobalt: { bg: '#1B35C9', fg: '#FFFFFF', acc: '#FFE066', mute: '#D6DCFF', ink: '#14205F' },
  clay:   { bg: '#8C3B20', fg: '#FFF6EC', acc: '#1F140E', mute: '#FBE0CC', ink: '#FFF6EC' },
  blush:  { bg: '#F6DDD4', fg: '#3A1F17', acc: '#A8432A', mute: '#6E4A3E', ink: '#FFF3EE' },
  ink:    { bg: '#111111', fg: '#FAFAFA', acc: '#FF5A3C', mute: '#BDBDBD', ink: '#111111' },
};
/* font pairs: display, display weight/style, body */
const FP = {
  tanker:    { d: 'tanker', dw: 400, ds: 'normal', tt: 'uppercase', ls: '0', b: 'switzer' },
  panchang:  { d: 'panchang', dw: 800, ds: 'normal', tt: 'uppercase', ls: '-.02em', b: 'satoshi' },
  melodrama: { d: 'melodrama', dw: 500, ds: 'normal', tt: 'none', ls: '-.02em', b: 'switzer' },
  gambetta:  { d: 'gambetta', dw: 500, ds: 'italic', tt: 'none', ls: '-.02em', b: 'satoshi' },
  stardom:   { d: 'stardom', dw: 400, ds: 'normal', tt: 'none', ls: '-.01em', b: 'ranade' },
  bonny:     { d: 'bonny', dw: 700, ds: 'normal', tt: 'none', ls: '-.03em', b: 'switzer' },
  supreme:   { d: 'supreme', dw: 800, ds: 'normal', tt: 'uppercase', ls: '-.03em', b: 'switzer' },
  nippo:     { d: 'nippo', dw: 700, ds: 'normal', tt: 'uppercase', ls: '-.01em', b: 'satoshi' },
  chillax:   { d: 'chillax', dw: 600, ds: 'normal', tt: 'none', ls: '-.03em', b: 'satoshi' },
  boska:     { d: 'boska', dw: 500, ds: 'italic', tt: 'none', ls: '-.02em', b: 'switzer' },
};

/* luminance contrast check (WCAG) — refuse to render a palette whose text would be dim */
const lum = h => { const c = h.match(/\w\w/g).map(x => parseInt(x, 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
for (const [k, p] of Object.entries(PAL)) {
  const r = [cr(p.fg, p.bg), cr(p.mute, p.bg), cr(p.ink, p.acc)];
  if (r[0] < 7 || r[1] < 4.5 || r[2] < 4.5) throw new Error(`palette ${k} contrast too low: ${r.map(x => x.toFixed(1))}`);
}

/* per-day plan: video template, poster template, palettes, fonts, track */
const VT = ['kinetic', 'cinema', 'grid', 'editorial', 'checklist', 'film'];
const PT = ['photo', 'cover', 'split', 'quote', 'collage', 'type'];
const VPAL = ['cobalt', 'night', 'cream', 'forest', 'blush', 'ink', 'plum', 'clay'];
const PPAL = ['cream', 'forest', 'ink', 'plum', 'night', 'clay', 'blush', 'cobalt'];
const VFONT = { kinetic: ['tanker', 'nippo', 'supreme', 'nippo', 'tanker'], cinema: ['melodrama', 'gambetta', 'boska', 'melodrama', 'gambetta'], grid: ['supreme', 'chillax', 'nippo', 'nippo', 'chillax'],
  editorial: ['stardom', 'melodrama', 'bonny', 'gambetta', 'stardom'], checklist: ['chillax', 'nippo', 'bonny', 'supreme', 'chillax'], film: ['bonny', 'boska', 'melodrama', 'stardom', 'bonny'], poll: ['nippo', 'chillax', 'supreme'] };
const PFONT = { photo: ['melodrama', 'tanker', 'gambetta', 'nippo', 'boska'], cover: ['melodrama', 'boska', 'stardom', 'gambetta', 'melodrama'], split: ['nippo', 'supreme', 'nippo', 'tanker', 'chillax'],
  quote: ['gambetta', 'melodrama', 'boska', 'stardom', 'bonny'], collage: ['bonny', 'chillax', 'stardom', 'supreme', 'gambetta'], type: ['tanker', 'supreme', 'nippo', 'nippo', 'tanker'], poll: ['nippo', 'chillax', 'supreme'] };
const TRACKS = ['Bubbles', 'Extra_Life_I_Never_Used', 'Skill_Test', 'Spring_In_Sight', 'Toy_Box', 'Feeling_Human_Again'];
const plan = DAYS.map((x, i) => {
  const vt = x.poll ? 'poll' : VT[i % 6], pt = x.poll ? 'poll' : (/^Quote/.test(x.theme) ? 'quote' : PT[(i + 2) % 6]);
  const k = Math.floor(i / 6);
  return { ...x, vt, pt, vpal: PAL[VPAL[(i * 3) % 8]], ppal: PAL[PPAL[(i * 5 + 1) % 8]], vf: FP[VFONT[vt][(k + i) % VFONT[vt].length]], pf: FP[PFONT[pt][(k + i) % PFONT[pt].length]], track: TRACKS[i % 6], win: Math.floor(i / 6) };
});

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
/* split text into masked words for GSAP reveals */
const W = (s, cls = '') => esc(s).split(' ').map(w => `<span class="m"><span class="w ${cls}">${w}</span></span>`).join(' ');
const logoF = p => (lum(p.bg) > .4 ? 'aura-mark-dark.png' : 'aura-mark-light.png');

const baseCSS = (p, f) => `${FONTS}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}
body{position:relative;background:${p.bg};color:${p.fg};font-family:${f.b};-webkit-font-smoothing:antialiased}
.x{position:absolute}.c{width:100%;height:100%;object-fit:cover;display:block}
.D{font-family:${f.d};font-weight:${f.dw};font-style:${f.ds};text-transform:${f.tt};letter-spacing:${f.ls};line-height:.95}
.m{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .02em .08em;margin-bottom:-.08em}.w{display:inline-block}
.acc{color:${p.acc}}.mute{color:${p.mute}}
.logo{position:absolute;top:150px;left:50%;height:56px;transform:translateX(-50%);z-index:40}
.pill{display:inline-flex;align-items:center;gap:18px;background:${p.acc};color:${p.ink};border-radius:999px;padding:30px 46px;font:800 46px/1 satoshi;letter-spacing:-.01em;white-space:nowrap}
.grain{position:absolute;inset:0;pointer-events:none;z-index:60;opacity:.10;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.vig{position:absolute;inset:0;pointer-events:none;z-index:55;background:radial-gradient(ellipse 85% 70% at 50% 45%,transparent 60%,rgba(0,0,0,.28) 100%)}`;

/* in-page helper: shrink an element's font until it fits its box */
const fitJS = `function th(e){const r=document.createRange();r.selectNodeContents(e);const b=r.getBoundingClientRect();return [b.width,b.height];}
function fit(sel,max,min,h){document.querySelectorAll(sel).forEach(e=>{let s=max;e.style.fontSize=s+'px';const W=e.clientWidth;while(s>min){const [w,hh]=th(e);if(w<=W+2&&e.scrollWidth<=W+2&&(!h||hh<=h))break;s-=4;e.style.fontSize=s+'px';}});}`;
const endCard = (p, f, x, t0) => ({
  html: `<div class="x end" style="inset:0;background:${p.bg};z-index:30;opacity:0">
 <img class="x" src="${img(logoF(p))}" style="top:620px;left:50%;height:96px;transform:translateX(-50%)">
 <div class="x D endh" style="left:90px;right:90px;top:800px;text-align:center;font-size:110px;color:${p.fg}">${W(x.cta)}</div>
 ${x.kw ? `<div class="x endp" style="left:0;right:0;top:1130px;text-align:center"><span class="pill">DM “${x.kw}”</span></div>` : ''}
 <div class="x endi" style="left:0;right:0;top:1300px;text-align:center;font:600 38px/1.5 ${f.b};color:${p.mute}">@aura.filmsca · itsaurafilms.com<br>Kingston, Ontario</div></div>`,
  js: `tl.to('.logo',{opacity:0,duration:.3,ease:'power2.out'},${t0}).to('.end',{opacity:1,duration:.5,ease:'power2.out'},${t0})
.from('.end img',{y:-40,opacity:0,duration:.7,ease:'expo.out'},${t0 + .2})
.from('.endh .w',{yPercent:110,duration:.8,stagger:.06,ease:'expo.out'},${t0 + .35})
.from('.endp',{scale:.6,opacity:0,duration:.7,ease:'back.out(2)'},${t0 + .9})
.from('.endi',{y:30,opacity:0,duration:.6,ease:'power3.out'},${t0 + 1.2});`,
});

/* ───────── VIDEO TEMPLATES (15 s) ───────── */
const V = {
kinetic: (x, p, f) => { const e = endCard(p, f, x, 11.9); const L = x.lines; return { html: `
<div class="x s1" style="inset:0;background:${p.bg};z-index:2"><div class="x D h1" style="left:80px;right:80px;top:560px;font-size:230px;line-height:.9">${W(x.hook[0])}</div>
${x.hook[1] ? `<div class="x D h2 acc" style="left:80px;right:80px;top:1040px;font-size:230px;line-height:.9">${W(x.hook[1])}</div>` : ''}</div>
<div class="x s2" style="inset:0;z-index:3;clip-path:circle(0% at 50% 50%)"><img class="c k2" src="${img(x.photos[0])}"><div class="x" style="inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.7))"></div>
<div class="x l1" style="left:80px;right:80px;top:1380px;font:800 74px/1.1 ${f.b};color:#fff">${W(L[0])}</div></div>
<div class="x s3" style="inset:0;z-index:4;background:${p.acc};clip-path:inset(0 0 100% 0)">
 <div class="x pa" style="left:60px;top:300px;width:470px;height:780px;border-radius:28px;overflow:hidden"><img class="c" src="${img(x.photos[1] || x.photos[0])}"></div>
 <div class="x pb" style="left:550px;top:420px;width:470px;height:780px;border-radius:28px;overflow:hidden"><img class="c" src="${img(x.photos[2] || x.photos[0])}"></div>
 <div class="x l2" style="left:80px;right:80px;top:1300px;font:800 76px/1.08 ${f.b};color:${p.ink}">${W(L[1] || '')}</div>
 ${L[2] ? `<div class="x l3" style="left:80px;right:80px;top:1640px;font:600 46px/1.25 ${f.b};color:${p.ink}">${W(L[2])}</div>` : ''}</div>
${e.html}`, js: `
fit('.h1',230,120,440);fit('.h2',230,120,440);
tl.from('.h1 .w',{yPercent:115,duration:.9,stagger:.07,ease:'expo.out'},.15)
.from('.h2 .w',{yPercent:115,duration:.9,stagger:.07,ease:'expo.out'},.6)
.to('.s1',{scale:1.06,duration:2.6,ease:'none'},.2)
.to('.s1 .D',{x:-1200,filter:'blur(14px)',duration:.55,ease:'power4.in',stagger:.05},2.75)
.to('.s2',{clipPath:'circle(150% at 50% 50%)',duration:.9,ease:'power4.inOut'},2.9)
.fromTo('.k2',{scale:1.35},{scale:1.05,duration:4.6,ease:'power2.out'},2.9)
.from('.l1 .w',{yPercent:115,duration:.8,stagger:.05,ease:'expo.out'},3.6)
.to('.s3',{clipPath:'inset(0 0 0% 0)',duration:.8,ease:'power4.inOut'},6.6).to('.logo',{opacity:0,duration:.3},6.7)
.from('.pa',{y:500,rotate:-8,duration:1,ease:'expo.out'},6.9).from('.pb',{y:700,rotate:8,duration:1,ease:'expo.out'},7.05)
.to('.pa',{y:-40,duration:4,ease:'none'},7.9).to('.pb',{y:40,duration:4,ease:'none'},7.9)
.from('.l2 .w',{yPercent:115,duration:.8,stagger:.05,ease:'expo.out'},7.6)
.from('.l3 .w',{yPercent:115,duration:.8,stagger:.04,ease:'expo.out'},9.2)
${e.js}` }; },

cinema: (x, p, f) => { const e = endCard(p, f, x, 11.9); const ph = [0, 1, 2].map(i => x.photos[i] || x.photos[0]); const cap = [x.hook.join(' '), x.lines[0], x.lines[1] || x.lines[0]]; return { html: `
<div class="x" style="inset:0;background:#000"></div>
${ph.map((f2, i) => `<div class="x ph ph${i}" style="inset:0;opacity:0"><img class="c" src="${img(f2)}"></div>`).join('')}
<div class="x leak" style="inset:-20%;z-index:8;opacity:0;mix-blend-mode:screen;background:radial-gradient(ellipse 40% 60% at 30% 50%,rgba(255,170,90,.85),transparent 70%)"></div>
<div class="x" style="inset:0;z-index:9;background:linear-gradient(180deg,rgba(0,0,0,.25),transparent 30%,transparent 55%,rgba(0,0,0,.75))"></div>
<div class="x bar bt" style="left:0;right:0;top:0;height:250px;background:#000;z-index:10;transform:translateY(-100%)"></div>
<div class="x bar bb" style="left:0;right:0;bottom:0;height:300px;background:#000;z-index:10;transform:translateY(100%)"></div>
<div class="x kick" style="left:0;right:0;top:300px;text-align:center;z-index:12;font:700 26px/1 ${f.b};letter-spacing:.5em;text-transform:uppercase;color:#fff;opacity:.9">${esc(x.theme.split(' · ')[0])}</div>
${cap.map((c, i) => `<div class="x D cap cap${i}" style="left:90px;right:90px;top:1180px;font-size:${i ? 92 : 116}px;line-height:1;color:#fff;z-index:12;text-shadow:0 4px 30px rgba(0,0,0,.5)">${W(c)}</div>`).join('')}
${e.html}`, js: `
fit('.cap',116,64,360);
tl.to('.bt',{y:0,duration:.9,ease:'expo.out'},0).to('.bb',{y:0,duration:.9,ease:'expo.out'},0)
.from('.kick',{opacity:0,letterSpacing:'1em',duration:1.2,ease:'power3.out'},.3)
${[0, 1, 2].map(i => { const t = i * 3.8; return `.to('.ph${i}',{opacity:1,duration:.9,ease:'power2.inOut'},${t})
.fromTo('.ph${i} img',{scale:1.22,xPercent:${i % 2 ? 3 : -3}},{scale:1.04,xPercent:0,duration:5,ease:'none'},${t})
.from('.cap${i} .w',{yPercent:115,opacity:0,duration:.9,stagger:.06,ease:'expo.out'},${t + .6})
.to('.cap${i}',{opacity:0,y:-30,duration:.5,ease:'power2.in'},${t + 3.2})
.fromTo('.leak',{opacity:0,xPercent:-30},{opacity:.9,xPercent:30,duration:.7,ease:'sine.inOut',yoyo:true,repeat:1},${t + 3.1})`; }).join('')}
${e.js}` }; },

grid: (x, p, f) => { const e = endCard(p, f, x, 11.9); const ph = [0, 1, 2, 3].map(i => x.photos[i % x.photos.length]); return { html: `
<div class="x D h" style="left:70px;right:70px;top:290px;font-size:150px;line-height:.92">${W(x.hook[0])}${x.hook[1] ? `<br><span class="acc">${W(x.hook[1])}</span>` : ''}</div>
<div class="x grid" style="left:70px;right:70px;top:720px;height:960px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:18px">${ph.map((f2, i) => `<div class="g g${i}" style="border-radius:26px;overflow:hidden;clip-path:inset(100% 0 0 0)"><img class="c" src="${img(f2)}"></div>`).join('')}</div>
<div class="x hero" style="inset:0;z-index:5;clip-path:inset(40% 10% 40% 10% round 30px)"><img class="c hi" src="${img(ph[0])}"><div class="x" style="inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.75))"></div></div>
<div class="x chips" style="left:70px;right:70px;top:1180px;z-index:6;display:flex;flex-direction:column;gap:22px;align-items:flex-start">
${x.lines.map(l => `<div class="chip" style="background:${p.bg};color:${p.fg};padding:22px 30px;border-radius:20px;font:700 50px/1.15 ${f.b};max-width:940px">${esc(l)}</div>`).join('')}</div>
${e.html}`, js: `
fit('.h',150,84,400);
tl.from('.h .w',{yPercent:115,duration:.9,stagger:.06,ease:'expo.out'},.15)
${[0, 1, 2, 3].map(i => `.to('.g${i}',{clipPath:'inset(0% 0 0 0)',duration:.9,ease:'power4.out'},${.9 + i * .22}).fromTo('.g${i} img',{scale:1.3},{scale:1,duration:2.4,ease:'power2.out'},${.9 + i * .22})`).join('')}
.to('.h',{opacity:0,duration:.4,ease:'power2.out'},5.2).set('.hero',{zIndex:5},5).fromTo('.hero',{clipPath:'inset(40% 10% 40% 10% round 30px)',opacity:0},{opacity:1,duration:.01},5)
.to('.hero',{clipPath:'inset(0% 0% 0% 0% round 0px)',duration:1,ease:'power4.inOut'},5)
.fromTo('.hi',{scale:1.25},{scale:1.04,duration:7,ease:'none'},5)
.from('.chip',{x:-1100,duration:.9,stagger:.55,ease:'expo.out'},6.1)
${e.js}` }; },

editorial: (x, p, f) => { const e = endCard(p, f, x, 11.9); return { html: `
<div class="x kick" style="left:90px;top:300px;font:700 26px/1 ${f.b};letter-spacing:.4em;text-transform:uppercase;color:${p.acc}">Aura Films · ${esc(x.theme.split(' · ')[0])}</div>
<div class="x D h" style="left:90px;right:90px;top:360px;font-size:140px;line-height:.95">${W(x.hook[0])}${x.hook[1] ? ` <span class="acc">${W(x.hook[1])}</span>` : ''}</div>
<div class="x arch" style="left:240px;top:920px;width:600px;height:760px;border-radius:300px 300px 24px 24px;overflow:hidden"><img class="c ai" src="${img(x.photos[0])}"></div>
<div class="x panel" style="inset:0;z-index:4;background:${p.bg};clip-path:inset(100% 0 0 0)">
${x.lines.map((l, i) => `<div class="x row r${i}" style="left:90px;right:90px;top:${430 + i * 330}px"><div class="rule" style="height:2px;background:${p.fg};opacity:.35;transform-origin:left"></div><div style="display:flex;gap:34px;margin-top:30px"><div class="D acc" style="font-size:84px;line-height:1">0${i + 1}</div><div style="font:600 56px/1.2 ${f.b}">${esc(l)}</div></div></div>`).join('')}</div>
${e.html}`, js: `
fit('.h',140,80,520);
tl.from('.kick',{opacity:0,x:-40,duration:.8,ease:'power3.out'},.1)
.from('.h .w',{yPercent:115,duration:1,stagger:.07,ease:'expo.out'},.3)
.from('.arch',{clipPath:'inset(100% 0 0 0 round 300px 300px 24px 24px)',duration:1.2,ease:'power4.out'},1.2)
.fromTo('.ai',{scale:1.3},{scale:1.05,duration:4,ease:'power2.out'},1.2)
.to('.arch',{left:0,top:0,width:1080,height:1920,borderRadius:0,duration:1.1,ease:'power4.inOut'},4.2)
.to('.h,.kick',{opacity:0,duration:.4},4.2)
.to('.panel',{clipPath:'inset(0% 0 0 0)',duration:.9,ease:'power4.inOut'},6.4)
${x.lines.map((_, i) => `.from('.r${i} .rule',{scaleX:0,duration:.8,ease:'power3.out'},${7.1 + i * .9}).from('.r${i} > div:last-child',{y:60,opacity:0,duration:.8,ease:'expo.out'},${7.2 + i * .9})`).join('')}
${e.js}` }; },

checklist: (x, p, f) => { const e = endCard(p, f, x, 11.9); return { html: `
<div class="x card" style="left:70px;right:70px;top:300px;height:1300px;background:${p.fg};color:${p.bg};border-radius:46px;box-shadow:0 50px 90px -40px rgba(0,0,0,.45)">
 <div class="x" style="left:60px;top:60px;font:700 28px/1 ${f.b};letter-spacing:.3em;text-transform:uppercase;opacity:.6">Aura Films · Notes</div>
 <div class="x D q" style="left:60px;right:60px;top:120px;font-size:110px;line-height:.95">${W(x.hook.join(' '))}</div>
 ${x.lines.map((l, i) => `<div class="x li li${i}" style="left:60px;right:60px;top:${560 + i * 220}px;display:flex;gap:30px;align-items:flex-start"><svg width="70" height="70" viewBox="0 0 70 70" style="flex:none"><rect x="4" y="4" width="62" height="62" rx="16" fill="none" stroke="${p.bg}" stroke-width="5"/><path class="tk" d="M18 37 L30 49 L53 22" fill="none" stroke="${p.acc}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="60" stroke-dashoffset="60"/></svg><div style="font:600 52px/1.2 ${f.b}">${esc(l)}</div></div>`).join('')}</div>
<div class="x photo" style="inset:0;z-index:5;clip-path:inset(0 0 0 100%)"><img class="c pi" src="${img(x.photos[0])}"><div class="x" style="inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,.65))"></div>
<div class="x D pc" style="left:80px;right:80px;top:1400px;font-size:96px;color:#fff">${W(x.lines[x.lines.length - 1])}</div></div>
${e.html}`, js: `
fit('.q',110,64,400);
tl.from('.card',{y:400,opacity:0,rotate:-3,duration:1.1,ease:'expo.out'},.1)
.from('.q .w',{yPercent:115,duration:.9,stagger:.05,ease:'expo.out'},.6)
${x.lines.map((_, i) => `.from('.li${i}',{x:-80,opacity:0,duration:.7,ease:'expo.out'},${2 + i * 1.1}).to('.li${i} .tk',{strokeDashoffset:0,duration:.4,ease:'power2.out'},${2.5 + i * 1.1})`).join('')}
.to('.photo',{clipPath:'inset(0 0 0 0%)',duration:1,ease:'power4.inOut'},7.6)
.fromTo('.pi',{scale:1.25},{scale:1.04,duration:4.5,ease:'none'},7.6)
.from('.pc .w',{yPercent:115,duration:.9,stagger:.05,ease:'expo.out'},8.5)
${e.js}` }; },

film: (x, p, f) => { const e = endCard(p, f, x, 11.9); const ph = [...x.photos, ...x.photos].slice(0, 5);
  const sp = Array.from({ length: 30 }, (_, i) => `<i style="top:${i * 120 + 20}px"></i>`).join(''); return { html: `
<div class="x strip" style="left:170px;width:740px;top:0;height:${ph.length * 980 + 400}px;background:#141210;border-radius:8px">
 <div class="x sp" style="left:18px;top:0;bottom:0;width:40px">${sp}</div><div class="x sp" style="right:18px;top:0;bottom:0;width:40px">${sp}</div>
 ${ph.map((f2, i) => `<div class="x" style="left:80px;right:80px;top:${200 + i * 980}px;height:900px;overflow:hidden;border-radius:6px"><img class="c" src="${img(f2)}"></div><div class="x" style="left:84px;top:${1110 + i * 980}px;font:700 24px/1 supreme;color:#E8B25F;letter-spacing:.2em">AURA ${String(i + 1).padStart(2, '0')}A ▸</div>`).join('')}
</div>
<style>.sp i{position:absolute;left:0;width:40px;height:60px;border-radius:8px;background:${p.bg}}</style>
<div class="x tag" style="left:80px;right:80px;top:300px;z-index:6"><span class="D" style="display:inline-block;background:${p.acc};color:${p.ink};padding:18px 30px;border-radius:14px;font-size:84px">${W(x.hook[0])}</span></div>
<div class="x tag2" style="left:80px;right:80px;top:470px;z-index:6">${x.hook[1] ? `<span class="D" style="display:inline-block;background:${p.fg};color:${p.bg};padding:18px 30px;border-radius:14px;font-size:84px">${W(x.hook[1])}</span>` : ''}</div>
<div class="x type" style="left:80px;right:80px;top:1460px;z-index:6;background:${p.bg};color:${p.fg};padding:34px 40px;border-radius:24px;font:600 50px/1.25 ${f.b};box-shadow:0 30px 60px -30px rgba(0,0,0,.6)"><span class="tt"></span><span class="cur" style="color:${p.acc}">|</span></div>
${e.html}`, js: `
tl.fromTo('.strip',{y:200},{y:-${ph.length * 980 - 1500},duration:11.6,ease:'none'},0)
.from('.tag',{x:-900,duration:.9,ease:'expo.out'},.3).from('.tag2',{x:900,duration:.9,ease:'expo.out'},.55)
.from('.type',{y:200,opacity:0,duration:.8,ease:'expo.out'},1.4)
${(() => { const all = x.lines.join('   '); return `.to({},{duration:8,ease:'none',onUpdate(){const n=Math.round(this.progress()*${all.length});document.querySelector('.tt').textContent=${JSON.stringify(all)}.slice(0,n);}},2.2)`; })()}
.to('.cur',{opacity:0,duration:.01,repeat:30,yoyo:true,repeatDelay:.25},1.4)
${e.js}` }; },

poll: (x, p, f) => { const e = endCard(p, f, x, 11.9); const bw = x.photos[0] === x.photos[1]; return { html: `
<div class="x top" style="left:0;right:0;top:0;height:960px;overflow:hidden;clip-path:inset(0 100% 0 0)"><img class="c" src="${img(x.photos[0])}"></div>
<div class="x bot" style="left:0;right:0;top:960px;height:960px;overflow:hidden;clip-path:inset(0 0 0 100%)"><img class="c" src="${img(x.photos[1])}" style="${bw ? 'filter:grayscale(1) contrast(1.08)' : ''}"></div>
<div class="x lab la" style="left:60px;top:250px;z-index:4"><span class="D" style="display:inline-block;background:${p.bg};color:${p.fg};padding:16px 28px;border-radius:14px;font-size:64px">${esc(x.poll[0])}</span></div>
<div class="x lab lb" style="right:60px;bottom:200px;z-index:4"><span class="D" style="display:inline-block;background:${p.bg};color:${p.fg};padding:16px 28px;border-radius:14px;font-size:64px">${esc(x.poll[1])}</span></div>
<div class="x vs" style="left:50%;top:960px;width:180px;height:180px;margin:-90px 0 0 -90px;border-radius:50%;background:${p.acc};color:${p.ink};display:grid;place-items:center;z-index:5;font:800 64px/1 satoshi">OR</div>
<div class="x ask" style="inset:0;z-index:6;background:${p.bg};clip-path:circle(0% at 50% 50%)">
 <div class="x D q" style="left:80px;right:80px;top:470px;text-align:center;font-size:150px">${W(x.hook.join(' '))}</div>
 <div class="x sticker" style="left:150px;right:150px;top:980px;background:#fff;border-radius:40px;padding:56px 48px;box-shadow:0 40px 80px -30px rgba(0,0,0,.4)">
  <div style="font:800 42px/1.2 satoshi;color:#111;text-align:center;margin-bottom:28px">${esc(x.lines[x.lines.length - 1])}</div>
  ${x.poll.map(o => `<div class="opt" style="border:3px solid #e5e5e5;border-radius:24px;padding:26px;margin-top:18px;text-align:center;font:800 46px/1 satoshi;color:#111">${esc(o)}</div>`).join('')}</div></div>
${e.html}`, js: `
fit('.q',150,80,440);
tl.to('.top',{clipPath:'inset(0 0% 0 0)',duration:1,ease:'power4.inOut'},.1).to('.bot',{clipPath:'inset(0 0 0 0%)',duration:1,ease:'power4.inOut'},.35)
.fromTo('.top img',{scale:1.25},{scale:1.04,duration:6,ease:'none'},.1).fromTo('.bot img',{scale:1.25},{scale:1.04,duration:6,ease:'none'},.35)
.from('.la',{x:-500,duration:.8,ease:'expo.out'},1.2).from('.lb',{x:500,duration:.8,ease:'expo.out'},1.4)
.from('.vs',{scale:0,rotate:-90,duration:.8,ease:'back.out(2.2)'},1.9)
.to('.vs',{scale:1.12,duration:.4,yoyo:true,repeat:5,ease:'sine.inOut'},2.8)
.to('.ask',{clipPath:'circle(150% at 50% 50%)',duration:1,ease:'power4.inOut'},5.6)
.from('.q .w',{yPercent:115,duration:.9,stagger:.06,ease:'expo.out'},6.2)
.from('.sticker',{y:300,opacity:0,duration:.9,ease:'expo.out'},7.2)
.from('.opt',{scale:.8,opacity:0,duration:.6,stagger:.18,ease:'back.out(2)'},7.8)
.to(document.querySelector('.opt'),{backgroundColor:'${p.acc}',color:'${p.ink}',borderColor:'${p.acc}',duration:.3},9.6)
${e.js}` }; },
};

/* ───────── POSTER TEMPLATES ───────── */
const P = {
photo: (x, p, f) => `<div class="x" style="inset:0"><img class="c" src="${img(x.photos[0])}"></div>
<div class="x" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,transparent 25%,transparent 45%,rgba(0,0,0,.85) 100%)"></div>
<div class="x D h" style="left:80px;right:80px;top:1060px;height:380px;display:flex;flex-direction:column;justify-content:flex-end;color:#fff;font-size:150px">${esc(x.poster.h)}</div>
${x.poster.h2 ? `<div class="x D" style="left:80px;right:80px;top:1460px;color:rgba(255,255,255,.86);font-size:70px">${esc(x.poster.h2)}</div>` : `<div class="x" style="left:84px;right:84px;top:1470px;font:500 42px/1.35 ${f.b};color:rgba(255,255,255,.92)">${esc(x.poster.s || '')}</div>`}
${x.kw ? `<div class="x" style="left:80px;top:1620px"><span class="pill">DM “${x.kw}”</span></div>` : ''}`,

cover: (x, p, f) => `<div class="x" style="inset:0"><img class="c" src="${img(x.photos[0])}" style="object-position:50% 30%"></div>
<div class="x" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,transparent 28%,transparent 50%,rgba(0,0,0,.88) 100%)"></div>
<div class="x" style="left:0;right:0;top:210px;text-align:center;font:500 230px/.8 melodrama;color:#fff;letter-spacing:-.04em">aura</div>
<div class="x" style="left:0;right:0;top:430px;text-align:center;font:700 24px/1 ${f.b};letter-spacing:.55em;text-transform:uppercase;color:#fff">${esc(x.theme.split(' · ')[0])} · Kingston</div>
<div class="x D h" style="left:80px;right:80px;top:1120px;height:360px;display:flex;flex-direction:column;justify-content:flex-end;color:#fff;font-size:120px">${esc(x.poster.h)}</div>
<div class="x" style="left:84px;right:84px;top:1500px;font:500 40px/1.35 ${f.b};color:rgba(255,255,255,.9)">${esc(x.poster.s || '')}</div>
${x.kw ? `<div class="x" style="left:84px;top:1650px;font:800 34px/1 ${f.b};letter-spacing:.14em;text-transform:uppercase;color:#fff;border-bottom:3px solid currentColor;padding-bottom:12px">DM “${x.kw}”</div>` : ''}`,

split: (x, p, f) => `<div class="x D h" style="left:80px;right:80px;top:260px;height:560px;display:flex;flex-direction:column;justify-content:flex-end;font-size:170px">${esc(x.poster.h)}</div>
<div class="x" style="left:84px;right:84px;top:850px;font:500 42px/1.35 ${f.b};color:${p.mute}">${esc(x.poster.s || '')}</div>
<div class="x" style="left:60px;right:60px;top:1040px;height:640px;border-radius:36px;overflow:hidden"><img class="c" src="${img(x.photos[0])}"></div>
${x.kw ? `<div class="x" style="right:70px;top:960px;width:230px;height:230px;border-radius:50%;background:${p.acc};color:${p.ink};display:grid;place-items:center;text-align:center;font:800 34px/1.1 satoshi;transform:rotate(-10deg);z-index:3">DM<br>“${x.kw}”</div>` : ''}`,

quote: (x, p, f) => `<div class="x" style="left:50%;top:330px;width:330px;height:330px;margin-left:-165px;border-radius:50%;overflow:hidden;border:8px solid ${p.acc}"><img class="c" src="${img(x.photos[0])}"></div>
<div class="x D acc" style="left:0;right:0;top:700px;text-align:center;font-size:240px;line-height:.6">“</div>
<div class="x D h" style="left:90px;right:90px;top:820px;height:560px;text-align:center;font-size:130px">${esc(x.poster.h)}</div>
<div class="x" style="left:90px;right:90px;top:1420px;text-align:center;font:600 42px/1.4 ${f.b};color:${p.mute}">${esc(x.poster.s || x.poster.by || '')}</div>
${x.kw ? `<div class="x" style="left:0;right:0;top:1570px;text-align:center"><span class="pill">DM “${x.kw}”</span></div>` : `<div class="x" style="left:0;right:0;top:1570px;text-align:center;font:700 40px/1 ${f.b}">itsaurafilms.com</div>`}`,

collage: (x, p, f) => { const ph = [0, 1, 2].map(i => x.photos[i % x.photos.length]); return `
<div class="x" style="left:70px;top:300px;width:560px;height:720px;border-radius:30px;overflow:hidden;transform:rotate(-3deg)"><img class="c" src="${img(ph[0])}"></div>
<div class="x" style="left:560px;top:380px;width:450px;height:520px;border-radius:30px;overflow:hidden;transform:rotate(4deg);border:10px solid ${p.bg}"><img class="c" src="${img(ph[1])}"></div>
<div class="x" style="left:520px;top:850px;width:440px;height:330px;border-radius:30px;overflow:hidden;transform:rotate(-2deg);border:10px solid ${p.bg}"><img class="c" src="${img(ph[2])}"></div>
<div class="x D h" style="left:80px;right:80px;top:1200px;height:300px;display:flex;flex-direction:column;justify-content:flex-end;font-size:120px">${esc(x.poster.h)}</div>
${x.poster.list ? `<div class="x" style="left:84px;right:84px;top:1520px;font:700 38px/1.5 ${f.b}">${x.poster.list.map((l, i) => `<span class="acc">0${i + 1}</span> ${esc(l)}`).join('<br>')}</div>` : `<div class="x" style="left:84px;right:84px;top:1530px;font:500 42px/1.35 ${f.b};color:${p.mute}">${esc(x.poster.s || '')}</div>`}
${x.kw && !x.poster.list ? `<div class="x" style="left:80px;top:1680px"><span class="pill" style="padding:24px 38px;font-size:40px">DM “${x.kw}”</span></div>` : ''}`; },

type: (x, p, f) => `<div class="x" style="left:0;right:0;top:0;height:900px;overflow:hidden"><img class="c" src="${img(x.photos[0])}"></div>
<div class="x" style="left:0;right:0;top:880px;bottom:0;background:${p.bg}"></div>
<div class="x" style="left:80px;top:960px;font:700 26px/1 ${f.b};letter-spacing:.42em;text-transform:uppercase;color:${p.acc}">${esc(x.theme.split(' · ')[0])}</div>
<div class="x D h" style="left:76px;right:76px;top:1010px;height:440px;font-size:170px">${esc(x.poster.h)}</div>
${x.poster.list ? `<div class="x" style="left:84px;right:84px;top:1460px;font:700 40px/1.5 ${f.b}">${x.poster.list.map((l, i) => `<span class="acc">0${i + 1}</span> ${esc(l)}`).join('<br>')}</div>` : `<div class="x" style="left:84px;right:84px;top:1470px;font:500 42px/1.35 ${f.b};color:${p.mute}">${esc(x.poster.s || '')}</div>`}
${x.kw ? `<div class="x" style="left:80px;top:1640px"><span class="pill">DM “${x.kw}”</span></div>` : ''}`,

poll: (x, p, f) => `<div class="x" style="left:0;right:0;top:0;height:960px;overflow:hidden"><img class="c" src="${img(x.photos[0])}"></div>
<div class="x" style="left:0;right:0;top:960px;height:960px;overflow:hidden"><img class="c" src="${img(x.photos[1])}" style="${x.photos[0] === x.photos[1] ? 'filter:grayscale(1) contrast(1.08)' : ''}"></div>
<div class="x" style="left:60px;top:150px"><span class="D" style="display:inline-block;background:${p.bg};color:${p.fg};padding:16px 28px;border-radius:14px;font-size:64px">${esc(x.poll[0])}</span></div>
<div class="x" style="right:60px;bottom:150px"><span class="D" style="display:inline-block;background:${p.bg};color:${p.fg};padding:16px 28px;border-radius:14px;font-size:64px">${esc(x.poll[1])}</span></div>
<div class="x" style="left:90px;right:90px;top:960px;transform:translateY(-50%);background:${p.acc};color:${p.ink};border-radius:40px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:56px 48px;box-shadow:0 40px 80px -30px rgba(0,0,0,.5)">
 <div class="D h" style="font-size:110px;width:100%">${esc(x.poster.h)}</div><div style="margin-top:20px;font:700 38px/1.3 ${f.b}">${esc(x.poster.s || '')}</div></div>`,
};

/* ───────── RENDER ───────── */
const mode = process.argv[2] || 'all', only = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
const days = plan.filter(x => !only || only.includes(x.d));
mkdirSync(OUT + '/posters', { recursive: true }); mkdirSync(OUT + '/videos', { recursive: true }); mkdirSync(NOV + '/tmp', { recursive: true });
const C = readdirSync('/opt/pw-browsers').filter(d => /^chromium-\d/.test(d)).map(d => `/opt/pw-browsers/${d}/${readdirSync('/opt/pw-browsers/' + d).find(x => x.startsWith('chrome-linux'))}/chrome`)[0];
const tag = d => `nov-${String(d).padStart(2, '0')}`;

/* audio: the most energetic 15 s windows of each track, a different window each time a track repeats */
if (mode === 'audio' || mode === 'all' || mode === 'videos') {
  for (const x of days) {
    const f = `${NOV}/tmp/${tag(x.d)}.m4a`; if (existsSync(f)) continue;
    const src = `${NOV}/music-src/${x.track}.mp3`;
    const starts = JSON.parse(execFileSync('python3.13', ['-c', `
import librosa,numpy as np,json
y,sr=librosa.load(${JSON.stringify(src)},sr=22050,mono=True)
e=librosa.feature.rms(y=y,hop_length=512)[0];fps=sr/512;w=int(15*fps)
s=np.convolve(e,np.ones(w),'valid');idx=[]
for i in np.argsort(-s):
  t=i/fps
  if t<8 or t>len(y)/sr-16: continue
  if all(abs(t-j)>16 for j in idx): idx.append(t)
  if len(idx)==5: break
print(json.dumps([round(float(v),2) for v in idx]))`], { stdio: ['ignore', 'pipe', 'ignore'] }).toString());
    const st = starts[x.win % starts.length];
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(st), '-t', String(DUR), '-i', src, '-vn', '-af', `afade=t=in:d=0.25,afade=t=out:st=${(DUR - 1.4).toFixed(2)}:d=1.4,loudnorm=I=-14:TP=-1.5:LRA=11`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', f]);
    console.log('audio', tag(x.d), x.track, st);
  }
}
if (mode === 'audio') process.exit(0);

const launch = () => puppeteer.launch({ executablePath: C, protocolTimeout: 600000, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const gsap = u('redesign/vendor/gsap.min.js');
const browsers = [];
const page = async () => { const br = await launch(); browsers.push(br); const pg = await br.newPage(); await pg.setViewport({ width: 1080, height: 1920 }); return pg; };
const doc = (css, body, js) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style><script src="${gsap}"></script></head><body>${body}<div class="vig"></div><div class="grain"></div>
<script>${fitJS}window.tl=gsap.timeline({paused:true});${js};window.ready=true;</script></body></html>`;

async function poster(pg, x) {
  const f = x.pf, p = x.ppal, body = P[x.pt](x, p, f) + `<img class="logo" src="${img(['photo', 'cover', 'poll'].includes(x.pt) ? 'aura-mark-light.png' : logoF(p))}" style="${x.pt === 'cover' || x.pt === 'poll' ? 'display:none' : ''}">`;
  const file = `${NOV}/tmp/${tag(x.d)}-poster.html`;
  writeFileSync(file, doc(baseCSS(p, f), body, `fit('.h',${x.pt === 'split' || x.pt === 'type' ? 170 : x.pt === 'photo' ? 150 : 130},60,${x.pt === 'split' ? 560 : x.pt === 'type' ? 440 : x.pt === 'quote' ? 560 : 380});`));
  await pg.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0' }); await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => fit('.h', parseFloat(getComputedStyle(document.querySelector('.h')).fontSize), 60, document.querySelector('.h').clientHeight || 0));
  await pg.screenshot({ path: `${OUT}/posters/${tag(x.d)}-poster.jpg`, type: 'jpeg', quality: 94 });
}
async function video(pg, x) {
  const f = x.vf, p = x.vpal, t = V[x.vt](x, p, f);
  const logo = `<img class="logo" style="z-index:45" src="${img(['cinema', 'poll'].includes(x.vt) ? 'aura-mark-light.png' : logoF(p))}">`;
  const file = `${NOV}/tmp/${tag(x.d)}-video.html`;
  writeFileSync(file, doc(baseCSS(p, f), t.html + logo, t.js));
  await pg.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0' }); await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => { document.querySelectorAll('img').forEach(i => i.decode && i.decode()); });
  const fr = `${NOV}/tmp/fr-${tag(x.d)}`; rmSync(fr, { recursive: true, force: true }); mkdirSync(fr);
  for (let i = 0; i < DUR * FPS; i++) {
    await pg.evaluate(t => { window.tl.seek(t, false); }, i / FPS);
    await pg.screenshot({ path: `${fr}/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 });
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${fr}/%04d.jpg`, '-i', `${NOV}/tmp/${tag(x.d)}.m4a`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', `${OUT}/videos/${tag(x.d)}-story.mp4`]);
  rmSync(fr, { recursive: true, force: true });
}

const queue = [...days]; const workers = [];
const N = Math.min(3, days.length);
for (let w = 0; w < N; w++) workers.push((async () => {
  const pg = await page();
  while (queue.length) {
    const x = queue.shift();
    if (mode !== 'videos') { await poster(pg, x); console.log('poster', tag(x.d), x.pt); }
    if (mode !== 'posters') { await video(pg, x); console.log('video', tag(x.d), x.vt, x.track); }
  }
})());
await Promise.all(workers);
await Promise.all(browsers.map(b => b.close()));
writeFileSync(`${NOV}/plan.json`, JSON.stringify(plan.map(x => ({ day: x.d, theme: x.theme, video: x.vt, poster: x.pt, track: x.track })), null, 1));
