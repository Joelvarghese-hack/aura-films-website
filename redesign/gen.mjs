let sharp=null; try{ sharp=(await import('sharp')).default; }catch(e){ console.warn('sharp unavailable, using cached tones'); }
import { readdirSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
/* asset version tags: a changed file always gets a new URL, so no browser keeps a stale copy */
const V=f=>createHash('md5').update(readFileSync(f)).digest('hex').slice(0,8);
import { writeFile, readFile } from 'fs/promises';
const IMG='images/';
const DIMS=JSON.parse(await readFile(new URL('./image-dims.json',import.meta.url)));
/* Live booking: paste your Calendly link here (e.g. https://calendly.com/aurafilms/consultation).
   Leave '' and the "Book a Date" buttons keep going to the contact form. */
const CALENDLY='https://calendly.com/itsaurafilms/30min';
/* Spam protection = honeypot field + Web3Forms' built-in server-side filter
   (both free, both active). hCaptcha is OFF: the free-plan shared key cannot be
   verified from a custom domain, which silently rejected real submissions.
   Only set a key here with a paid Web3Forms plan that supports your own key. */
const HCAPTCHA='';

/* Wrap photo <img>s in <picture> with a WebP source + real width/height (cuts
   bandwidth and stops layout shift). Logos are left untouched. */
function pictureize(html){
  return html.replace(/<img\b([^>]*?)\ssrc="images\/([^"]+)"([^>]*)>/g,(m,pre,name,post)=>{
    if(/logo/i.test(name)) return m;
    const d=DIMS[name];
    const attrs=pre+post;
    const wh=(d&&!/\bwidth=/.test(attrs))?` width="${d[0]}" height="${d[1]}"`:'';
    return `<picture><source type="image/webp" srcset="images/${name}.webp"><img${pre} src="images/${name}"${post}${wh}></picture>`;
  });
}
/* Add a #main landmark + skip-link target, then apply pictureize. */
function finalize(html){
  html=html.replace('<main class="legal">','<main id="main" class="legal">');
  if(!/id="main"/.test(html)){
    html=html.replace('<header class="','<main id="main"><header class="');
    html=html.replace('<footer class="footer">','</main>\n<footer class="footer">');
  }
  return pictureize(html);
}

/* ── colour: every photograph lends the page its tone ──
   The hue that covers the most of the frame wins (a hint of red never beats a sky
   of blue). Mostly-bright frames give an ivory page with dark text; everything else
   gives a deep jewel tone (emerald, sapphire, garnet, plum, cognac) that keeps light
   text readable. Tones are cached so the site still builds without sharp. */
const TONES_FILE=new URL('./tones.json',import.meta.url);
const TONE_V=3;
let TONES={};
try{ const c=JSON.parse(await readFile(TONES_FILE,'utf8')); if(c._v===TONE_V) TONES=c; }catch(e){}
async function pixelsOf(file){
  const {data}=await sharp('../images/'+file).resize(48,48,{fit:'inside'}).removeAlpha().raw().toBuffer({resolveWithObject:true});
  return data;
}
function hsl2rgb(h,s,l){
  const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;
  const f=t=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
  return [f(h+1/3),f(h),f(h-1/3)].map(x=>Math.round(x*255)).join(',');
}
/* hue families, each deepened toward its most luxurious reading (degrees) */
function jewel(deg){
  if(deg<15||deg>=325) return 345;        /* reds, pinks  -> garnet  */
  if(deg<45) return 22;                    /* oranges, skin-> cognac  */
  if(deg<75) return 34;                    /* yellows, gold-> amber   */
  if(deg<165) return 152;                  /* greens       -> emerald */
  if(deg<200) return 184;                  /* teals        -> deep teal */
  if(deg<262) return 222;                  /* blues        -> sapphire */
  return 282;                              /* violets      -> plum    */
}
function toneFrom(buffers){
  const bins=new Float64Array(24),hx=new Float64Array(24),hy=new Float64Array(24);
  let n=0,bright=0,chroma=0;
  for(const data of buffers) for(let i=0;i<data.length;i+=3){
    const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255;n++;
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,v=mx,s=mx?d/mx:0,l=(mx+mn)/2;
    if(l>.8&&s<.22) bright++;
    if(s<.18||v<.16) continue;
    let h=d===0?0:mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4; h*=60;
    const k=Math.floor(h/15)%24;
    let w=s*(.35+.65*v);                   /* area first, with a mild pull toward vivid pixels */
    if(h>=70&&h<165) w*=.7;                /* grass and leaves count, but less than the subject */
    bins[k]+=w;hx[k]+=w*Math.cos(h*Math.PI/180);hy[k]+=w*Math.sin(h*Math.PI/180);chroma+=w;
  }
  let best=0,bs=-1;
  for(let k=0;k<24;k++){const sc=bins[(k+23)%24]*.5+bins[k]+bins[(k+1)%24]*.5;if(sc>bs){bs=sc;best=k;}}
  let X=0,Y=0;for(const j of [(best+23)%24,best,(best+1)%24]){X+=hx[j];Y+=hy[j];}
  const hue=((Math.atan2(Y,X)*180/Math.PI)+360)%360,share=chroma/n;
  if(bright/n>.36) return hsl2rgb((share>.06?hue:38)/360,share>.06?.26:.2,.935);   /* ivory, champagne, blush */
  if(share<.09) return hsl2rgb((share>.03?jewel(hue):30)/360,.1,.115);              /* soft charcoal */
  const j=jewel(hue),sat=Math.min(.56,Math.max(.34,share*1.6));
  return hsl2rgb(j/360,sat,j>=200&&j<300?.15:.135);
}
if(sharp){
  TONES={_v:TONE_V};
  for(const f of readdirSync('../images').filter(f=>/.jpe?g$/i.test(f)&&!/^c_/.test(f))){
    try{TONES[f]=toneFrom([await pixelsOf(f)]);}catch(e){TONES[f]='22,18,16';}
  }
}
/* a gallery section takes the tone its photographs share, read across all of them */
async function catTone(key,files){
  if(sharp&&!TONES['cat:'+key]){
    const bufs=[];for(const f of files){try{bufs.push(await pixelsOf(f));}catch(e){}}
    TONES['cat:'+key]=bufs.length?toneFrom(bufs):'22,18,16';
  }
  return TONES['cat:'+key]||'22,18,16';
}
const T=f=>TONES[f]||'22,18,16';


/* ── icons ── */
const arrow=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const tick=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>`;
const star=`<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9.6l6.9-.7z"/></svg>`;
const chevL=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>`;
const chevR=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`;

/* ── head: Clash Display (self-hosted) + Playfair Display ── */
const SITE='https://itsaurafilms.com/';
const head=(title,desc,path='')=>`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>${title}</title><meta name="description" content="${desc}">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="256x256" href="/favicon.png">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#16120F">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Aura Films">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE}${path}"><meta property="og:image" content="${SITE}images/wed-3.jpg">
<meta property="og:locale" content="en_CA">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${SITE}images/wed-3.jpg">
<link rel="preload" href="/redesign/fonts/clash-display-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/redesign/fonts/playfair-display-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/redesign/aura.css?v=${V('aura.css')}">${CALENDLY?`<link rel="preconnect" href="https://assets.calendly.com"><link rel="dns-prefetch" href="https://calendly.com">`:''}${HCAPTCHA?`<script src="https://js.hcaptcha.com/1/api.js" async defer></script>`:''}<script>window.AURA_CALENDLY=${JSON.stringify(CALENDLY)};</script></head><body><a href="#main" class="skip-link">Skip to content</a><div class="progress" id="progress" aria-hidden="true"></div><div class="pt" id="pt" aria-hidden="true"></div>`;

/* ── nav ── */
const nav=(active)=>{const L=[['/','Home'],['/gallery','Gallery'],['/about','About'],['/investment','Investment']];
return `<nav class="nav" id="nav" aria-label="Primary"><div class="nav-inner">
<a href="/" class="brand" aria-label="Aura Films, home"><img src="/images/aura-logo-mark.png" alt="Aura Films" width="102" height="44"></a>
<div class="nav-links">${L.map(([h,t])=>`<a href="${h}" class="nav-link${active===t?' active':''}"${active===t?' aria-current="page"':''}>${t}</a>`).join('')}</div>
<a href="/about#contact" class="nav-cta">Book a date</a>
<button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span></button>
</div></nav>
<div class="drawer" id="drawer">${L.map(([h,t])=>`<a href="${h}" class="drawer-link">${t}</a>`).join('')}<a href="/about#contact" class="btn btn-solid drawer-cta">Book a date ${arrow}</a>
<p class="drawer-meta"><a href="mailto:itsaurafilms@gmail.com">itsaurafilms@gmail.com</a><a href="tel:+13439894546">343 989 4546</a></p></div>`;};

/* ── footer ── */
const footer=`<footer class="footer"><div class="container">
<div class="foot-cta"><h2 class="h-xl">Got a date in mind? <em>Let’s talk.</em></h2><a class="btn btn-solid" href="/about#contact">Book a date ${arrow}</a></div>
<div class="foot-grid">
<div class="foot-brand"><img src="/images/aura-logo-mark.png" alt="Aura Films" width="102" height="44" loading="lazy">
<p>A photography studio in Kingston, Ontario. We shoot weddings, portraits, families and the occasional building, anywhere in the province.</p></div>
<div class="foot-col"><h3>Explore</h3><a href="/">Home</a><a href="/gallery">Gallery</a><a href="/about">About</a><a href="/investment">Investment</a></div>
<div class="foot-col"><h3>Work</h3><a href="/gallery#weddings">Weddings</a><a href="/gallery#portraits">Portraits</a><a href="/gallery#family">Family &amp; Maternity</a><a href="/gallery#architecture">Architecture</a></div>
<div class="foot-col"><h3>Reach us</h3><a href="mailto:itsaurafilms@gmail.com">itsaurafilms@gmail.com</a><a href="tel:+13439894546">343 989 4546</a><a href="https://www.instagram.com/aura.filmsca/" target="_blank" rel="noopener">Instagram, @aura.filmsca</a><a href="https://www.google.com/maps/search/?api=1&amp;query=Kingston%2C+Ontario%2C+Canada" target="_blank" rel="noopener">Kingston, Ontario</a></div>
</div>
<div class="foot-bot"><p>© 2026 Aura Films. All rights reserved. <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms &amp; Conditions</a> · <a href="/cookie">Cookie Policy</a> · <a href="/refund">Refund Policy</a> · <a href="/accessibility">Accessibility</a></p>
<p class="foot-legal-id">Aura Films is a sole proprietorship operated by Albin, based in Kingston, Ontario, Canada. Contact <a href="mailto:itsaurafilms@gmail.com">itsaurafilms@gmail.com</a> · <a href="tel:+13439894546">343&nbsp;989&nbsp;4546</a>.</p>
<p>Design &amp; SEO by <a href="https://joelvarghese-hack.github.io/Marketing-Portfolio/" target="_blank" rel="noopener">Joel Varghese</a></p></div>
</div></footer>`;

const lightbox=`<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Photograph viewer"><button class="lb-btn lb-close" id="lbClose" type="button" aria-label="Close">&times;</button>
<button class="lb-btn lb-prev" id="lbPrev" type="button" aria-label="Previous photograph">${chevL}</button>
<img id="lbImg" src="" alt=""><button class="lb-btn lb-next" id="lbNext" type="button" aria-label="Next photograph">${chevR}</button></div>`;
const toTop=`<button class="totop" id="toTop" type="button" aria-label="Back to top"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>`;
const cookieNotice=`<div class="cookie-notice" id="cookieNotice" role="region" aria-label="Cookie notice" hidden>
<div class="cookie-inner"><p>We use only essential, functional cookies &mdash; no advertising or tracking. Google Fonts and the optional booking calendar load as described in our <a href="/cookie">Cookie Policy</a>.</p>
<div class="cookie-btns"><button type="button" class="btn btn-gold ck-accept" id="ckAccept">Got it</button><button type="button" class="btn btn-line ck-min" id="ckMin">Only essential</button></div></div></div>
<script>(function(){try{var K='aura_cookie_choice',n=document.getElementById('cookieNotice');if(!n)return;var stored=null;try{stored=localStorage.getItem(K);}catch(e){}if(!stored){n.hidden=false;}
function set(v){try{localStorage.setItem(K,v);}catch(e){}n.hidden=true;}
var a=document.getElementById('ckAccept'),m=document.getElementById('ckMin');
if(a)a.addEventListener('click',function(){set('accepted');});
if(m)m.addEventListener('click',function(){window.__AURA_ESSENTIAL_ONLY=true;set('essential');});
}catch(e){}})();</script>`;

const mcta=`<nav class="mcta" aria-label="Quick contact"><a href="tel:+13439894546">Call</a><a class="p" href="/about#contact">Book a date</a></nav>`;
const foot=(extra='')=>footer+toTop+mcta+extra+(MARKETING?offer:'')+cookieNotice+`<script src="/redesign/vendor/gsap.min.js?v=3.12.5" defer></script><script src="/redesign/vendor/ScrollTrigger.min.js?v=3.12.5" defer></script><script src="/redesign/vendor/lenis.min.js?v=1.1.20" defer></script><script src="/redesign/aura.js?v=${V('aura.js')}" defer></script></body></html>`;

/* ── testimonials carousel ── */
const testimonials=[
 {img:'IMG_9548.JPG.jpeg',pos:'50% 28%',nm:'Jenita & Stephin',role:'Wedding · Kingston',quote:'Aura Films captured our wedding beautifully. Every photo tells a story and the emotions feel so real. We could not be happier with the results.'},
 {img:'_DSC7798.jpeg',pos:'50% 22%',nm:'Shyvy & Eldoh',role:'Maternity · Kingston',quote:'Our maternity session was pure magic. They captured such tender, intimate moments, the kind we will treasure forever as our family grows.'},
 {img:'IMG_3431.JPG.jpeg',pos:'59% 43%',nm:'Sara',role:'Portrait Session · Kingston',quote:'Aura Films made my portrait session effortless. They have a gift for catching the real you in one quiet frame. I have never felt more myself in photos.'},
];
const carousel=`<div class="tcar reveal" id="tcar">
<div class="tcar-stage"><div class="tslide-track" id="tslideTrack">${testimonials.map((t,i)=>`<div class="tslide${i===0?' on':''}"><div class="tslide-img"><img src="${IMG}${t.img}" alt="${t.nm}" style="object-position:${t.pos}" loading="lazy"></div><div class="tslide-card"><div class="tnm">${t.nm.toUpperCase()}</div><div class="tstars">${star.repeat(5)}</div><p>${t.quote}</p><div class="trole">${t.role}</div></div></div>`).join('')}</div></div>
<div class="tcar-ctrl"><div class="tdots">${testimonials.map((_,i)=>`<button class="tdot${i===0?' on':''}" data-i="${i}" aria-label="Go to slide ${i+1}"></button>`).join('')}</div>
<div class="tarrows"><button class="tnav tprev" aria-label="Previous testimonial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" width="26" height="26"><path d="M19 12H5M11 18l-6-6 6-6"/></svg></button><button class="tnav tnext" aria-label="Next testimonial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" width="26" height="26"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div></div>
</div>`;

/* ── contact form (Web3Forms + date picker + on-page thanks) ── */
const ACCESS_KEY='21c2f497-6482-4b89-899b-4653e72aefc1';
/* CASL: every request for email consent, and every marketing email, must name a postal address.
   Email sign-ups (the optional contact-form box and the first-session offer) stay switched off
   until MAIL_ADDR is set, e.g. 'PO Box 123, Kingston, ON K7L 0A0'. */
const MAIL_ADDR='';
const MARKETING=!!MAIL_ADDR;
const CASL_ID='Aura Films (Albin), '+(MAIL_ADDR||'Kingston, Ontario')+', itsaurafilms@gmail.com';
/* ── first-session offer: email + explicit CASL consent, sent through Web3Forms ── */
const offer=`<div class="offer" id="offer" role="dialog" aria-modal="true" aria-labelledby="offerTitle" aria-describedby="offerLede" hidden>
<div class="offer-scrim" data-offer-close></div>
<div class="offer-card">
<button class="offer-x" type="button" aria-label="Close" data-offer-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
<figure class="offer-pic"><img src="/images/albin-new.jpg" alt="Albin, the photographer behind Aura Films, holding his camera in a sunflower field" width="1638" height="2048" loading="lazy"></figure>
<div class="offer-body">
<h2 class="offer-title" id="offerTitle">10% off your <em>first session.</em></h2>
<p class="offer-lede" id="offerLede">Join the Aura Films list and we’ll take 10% off your first booking. We write now and then, with new work and open dates.</p>
<form class="offer-form" id="offerForm" novalidate>
<input type="hidden" name="access_key" value="${ACCESS_KEY}">
<input type="hidden" name="subject" value="New subscriber: 10% first-session offer">
<input type="hidden" name="from_name" value="Aura Films Website">
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off">
<label class="fl" for="of-email">Email</label>
<input class="fi" id="of-email" type="email" name="email" required maxlength="254" autocomplete="email" inputmode="email" placeholder="you@email.com">
<label class="consent" for="of-consent"><input type="checkbox" id="of-consent" name="marketing_consent" value="Yes, subscribed via the 10% offer" required> <span>Yes, email me offers and news from ${CASL_ID}. I can unsubscribe at any time. <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a></span></label>
<p class="offer-err" id="offerErr" role="alert" hidden></p>
<button class="btn btn-solid offer-btn" id="offerBtn" type="submit">Claim 10% off ${arrow}</button>
<p class="offer-fine">For new clients on regular-priced sessions. One per client, not combinable with other offers.</p>
</form>
<div class="offer-done" id="offerDone" hidden tabindex="-1"><h3 class="offer-title">You’re on <em>the list.</em></h3><p>Mention code <b class="offer-code">AURA10</b> when you book and we’ll take 10% off your first session.</p><button class="btn btn-ghost" type="button" data-offer-close>Back to the site</button></div>
</div>
</div>
</div>`;
const contactForm=`<div class="cform-wrap">
<form class="cform" id="cform" action="https://api.web3forms.com/submit" method="POST">
<input type="hidden" name="access_key" value="${ACCESS_KEY}">
<input type="hidden" name="subject" value="New enquiry from the Aura Films website">
<input type="hidden" name="from_name" value="Aura Films Website">
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off">
<div><label class="fl" for="cf-name">Your Name</label><input class="fi" id="cf-name" name="name" required placeholder="What should we call you?"></div>
<div><label class="fl" for="cf-email">Email</label><input class="fi" id="cf-email" type="email" name="email" required placeholder="you@email.com"></div>
<div><label class="fl" for="cf-date">Event Date</label><input class="fi" id="cf-date" type="date" name="event_date"></div>
<div><label class="fl" for="cf-svc">Service</label><input class="fi" id="cf-svc" name="service" placeholder="Wedding, portrait, maternity"></div>
<div class="full"><label class="fl" for="cf-msg">Tell us about your day</label><textarea class="fi" id="cf-msg" name="message" required placeholder="The date, the place, rough plans, anything you’re still unsure about."></textarea></div>
${HCAPTCHA?`<div class="full"><div class="h-captcha" data-sitekey="${HCAPTCHA}"></div></div>`:''}<div class="full consent-row"><label class="consent" for="cf-consent"><input type="checkbox" id="cf-consent" name="privacy_consent" value="I agree" required> <span>I've read the <a href="privacy" target="_blank" rel="noopener">Privacy Policy</a> and consent to Aura Films storing the details I've entered so they can respond to my enquiry. <span aria-hidden="true">*</span></span></label></div>
${MARKETING?`<div class="full consent-row"><label class="consent" for="cf-marketing"><input type="checkbox" id="cf-marketing" name="marketing_optin" value="Yes, subscribe"> <span>Optional: email me occasional updates and offers from ${CASL_ID}. I can unsubscribe at any time.</span></label></div>`:''}
<div class="full"><button class="btn btn-dark" id="cf-btn" type="submit">Send Enquiry ${arrow}</button></div>
</form>
<div class="cform-thanks" id="cformThanks">
<div class="ct-ico"><svg viewBox="0 0 52 52" width="58" height="58" fill="none" stroke="currentColor" stroke-width="2"><circle cx="26" cy="26" r="24"/><path d="M16 27l7 7 13-14" stroke-width="2.4"/></svg></div>
<h3 class="serif">Thanks, we’ve got it.</h3>
<p>We’ll get back to you within 24 to 48 hours to talk about your session.</p>
</div></div>`;

/* ════════ CONTENT KEPT FROM THE LIVE SITE ════════ */
const GAL={
 weddings:['wed-1.jpg','wed-2.jpg','wed-3.jpg','wed-4.jpg','wed-5.jpg','wed-6.jpg','wed-7.jpg','wed-8.jpg','wed-9.jpg','wed-10.jpg','wed-11.jpg','wed-12.jpg','wed-13.jpg','_DSC8307.jpg','IMG_9548.JPG.jpeg','_DSC8637.jpg','_DSC8672.jpg','_DSC8231.jpg','_DSC8243.jpg','IMG_9356.JPG.jpeg','_DSC8034.jpg','_DSC8577.jpg','_DSC8016.jpg','_DSC8021.jpg','_DSC8238.jpg','_DSC8239.jpg','_DSC8241.jpg','IMG_9115.jpg','IMG_8926.JPG.jpeg','_DSC7542.jpg','_DSC7545.jpg'],
 portraits:['por-1.jpg','por-2.jpg','por-3.jpg','por-4.jpg','por-5.jpg','por-6.jpg','por-7.jpg','por-8.jpg','por-9.jpg','por-10.jpg','por-11.jpg','por-12.jpg','por-13.jpg','por-14.jpg','IMG_3431.JPG.jpeg','IMG_3432.JPG.jpeg','IMG_3437.JPG.jpeg','IMG_3438.JPG.jpeg','IMG_7777.JPG.jpeg','IMG_9906.JPG.jpeg','IMG_9907.JPG.jpeg','_DSC8015.jpg','_DSC8049.jpg','_DSC8215.jpg'],
 family:['baby-1.jpg','baby-2.jpg','baby-3.jpg','baby-4.jpg','baby-5.jpg','baby-6.jpg','baby-7.jpg','baby-8.jpg','baby-9.jpg','baby-10.jpg','baby-11.jpg','baby-12.jpg','baby-13.jpg','baby-14.jpg','baby-15.jpg','baby-16.jpg','baby-17.jpg','baby-18.jpg','baby-19.jpg','_DSC7794.jpeg','_DSC7798.jpeg','_DSC7883.jpeg','_DSC1248.jpg','_DSC1267.jpg','_DSC1347.jpg','_DSC1351.jpg','_DSC1352.jpg','_DSC1487.jpg','_DSC1500.jpg','_DSC1534.jpg','IMG_8816.JPG.jpeg','IMG_8829.JPG.jpeg'],
 architecture:['arch-1.jpg','arch-2.jpg','arch-3.jpg','arch-4.jpg','arch-5.jpg','arch-6.jpg','arch-7.jpg','arch-8.jpg','arch-9.jpg'],
};
const LABELS={weddings:'Weddings',portraits:'Portraits',family:'Family & Maternity',architecture:'Architecture'};
const CAT_T={};for(const k of Object.keys(GAL)) CAT_T[k]=await catTone(k,GAL[k]);

const faqItems=[
 ['How do we book a date?','Send us your date and location through the form or by email. A signed agreement and a deposit hold the date, first come, first served.'],
 ['How much is the deposit?','A 30% non-refundable retainer secures your booking. The remaining balance is due on or before the day of the session.'],
 ['What is the turnaround time?','10 to 21 business days, depending on the package. Weddings also get a sneak peek within the first week.'],
 ['Do you travel?','Yes. Travel within 20 km is included, and a small fee applies past that. We shoot all over Kingston and Ontario.'],
 ['Do we get the raw files?','Galleries come as edited, high-resolution images. If you want the unedited raw files too, they’re a paid add-on.'],
 ['What if we need to reschedule?','You can reschedule once with reasonable notice. If weather rules out an outdoor shoot, moving it costs nothing.'],
];

const PKG={
Weddings:[
 ['Standard','Ceremony',399,'+$95/hr extra',['Up to 3 hours coverage','75 edited photos','Online gallery + sneak peek','10 to 14 day delivery'],false],
 ['Most Popular','Full Ceremony',749,'sneak peek in 48h',['Up to 6 hours coverage','180 edited photos','Two looks / locations','Social-ready edit set','7 to 10 day delivery'],true],
 ['Premium','Full Day',1049,'full documentary day',['Full-day documentary coverage','320 hand-graded photos','Second shooter included','Fine-art album (optional)','Priority delivery'],false]],
Events:[
 ['Basic','Essentials',249,'+$65/hr extra',['Up to 2 hours · 2 photographers','35 edited photos','Online gallery download','14 to 21 day turnaround'],false],
 ['Standard','Signature',399,'+$75/hr extra',['Up to 4 hours · 2 photographers','70 edited photos','Gallery + social media kit','Sneak-peek gallery','10 to 14 day turnaround'],true],
 ['Premium','Elite',599,'+$85/hr extra',['Up to 6 hours · 2 photographers','150 edited photos','12 social-ready edits','Event highlights gallery','Priority 7-day delivery'],false]],
Family:[
 ['Mini','Quick Session',129,'30 min',['Up to 30 minutes','18 edited photos','Online gallery','7 to 10 day delivery'],false],
 ['Standard','Family Story',219,'1 hour',['Up to 1 hour','35 edited photos','One location','Gallery + print release'],false],
 ['Most Loved','The Experience',299,'session',['Up to 2 hours','55 edited photos','Two looks / locations','Maternity friendly','Priority delivery'],true]],
Portraits:[
 ['Mini','Quick Shoot',85,'30 min',['Up to 30 minutes','10 edited photos','One look','Online gallery'],false],
 ['Standard','Portrait Hour',149,'1 hour',['Up to 1 hour','22 edited photos','Two looks','Gallery + retouching'],true],
 ['Premium','Full Session',229,'session',['Up to 2 hours','45 edited photos','Multiple looks / locations','Editorial retouching'],false]],
};

const addons=[['Second location / travel','$50-100'],['Printed photo set (20)','$60'],['Extra edited images (10)','$50'],['Raw / unedited files','$80'],['Album &amp; prints','Custom'],['Rush delivery','$120']];



/* ════════ SHARED BLOCKS ════════ */
const esc=s=>String(s).replace(/&(?!amp;)/g,'&amp;');
const words=s=>s.split(' ').map(x=>x.startsWith('*')?`<em><span class="w">${x.replace(/\*/g,'')}</span></em>`:`<span class="w">${x}</span>`).join(' ');
const ratio=f=>DIMS[f]?DIMS[f][0]/DIMS[f][1]:0.67;
const pairStyle=(a,b)=>{const x=ratio(a),y=ratio(b);return ` style="--pc:${x.toFixed(3)}fr ${y.toFixed(3)}fr;--ps:${(x+y).toFixed(3)}"`;};
const plate=(f,alt,cap='',cls='')=>`<figure class="plate${cls?' '+cls:''}" data-c="${T(f)}"><div class="frame"><img src="images/${f}" alt="${alt}" loading="lazy"></div>${cap?`<figcaption>${cap}</figcaption>`:''}</figure>`;
const calBox=CALENDLY?`<div class="cal-embed" data-cal-embed="${CALENDLY}"><p class="cal-note">Prefer to pick a time now? Loading the calendar connects to Calendly, which may set its own cookies.</p><button type="button" class="btn btn-ghost cal-load">Open booking calendar ${arrow}</button></div>`:'';
const faqBlock=()=>`<section class="sec" id="faq" data-c="22,18,16"><div class="container narrow">
<h2 class="h-xl reveal">Common <em>questions.</em></h2>
<div class="faq">${faqItems.map(([q,a],i)=>`<div class="faq-item reveal"><button class="faq-q" id="fq${i}" type="button" aria-expanded="false" aria-controls="fa${i}">${q}<span class="pl" aria-hidden="true"></span></button><div class="faq-a" id="fa${i}" role="region" aria-labelledby="fq${i}"><p>${a}</p></div></div>`).join('')}</div>
</div></section>`;
const contactBlock=()=>`<section class="sec contact" id="contact" data-c="22,18,16"><div class="container"><div class="contact-grid">
<div class="contact-copy">
<h2 class="h-xl reveal">Tell us about <em>your day.</em></h2>
<p class="lede reveal">Send the date, the place and anything you already have in mind. We usually reply within 24 to 48 hours. If you’d rather talk, call or message us.</p>
<ul class="contact-list reveal">
<li><span>Email</span><a href="mailto:itsaurafilms@gmail.com">itsaurafilms@gmail.com</a></li>
<li><span>Phone</span><a href="tel:+13439894546">343 989 4546</a></li>
<li><span>Instagram</span><a href="https://www.instagram.com/aura.filmsca/" target="_blank" rel="noopener">@aura.filmsca</a></li>
<li><span>Based in</span><a href="https://www.google.com/maps/search/?api=1&amp;query=Kingston%2C+Ontario%2C+Canada" target="_blank" rel="noopener">Kingston, Ontario</a></li>
</ul>
<div class="reveal">${calBox}</div>
</div>
<div class="contact-panel reveal">${contactForm}</div>
</div></div></section>`;

/* ════════ HOME ════════ */
const DECK=[
 ['wed-4.jpg','Wedding · Kingston','A groom tucks a yellow flower behind his bride’s ear while she laughs'],
 ['por-8.jpg','Portrait · Kingston','A woman in a white embroidered saree and red bangles, smiling softly'],
 ['baby-1.jpg','Newborn · Kingston','A mother laughs down at her newborn while the father cradles the baby'],
 ['por-6.jpg','Portrait · Kingston','A woman in a mustard dupatta smiles among autumn trees'],
 ['arch-1.jpg','Architecture · Ontario','A two-storey home with a stone facade and white trim'],
 ['wed-8.jpg','Reception · Kingston','A couple feed each other cake in front of a red floral wall'],
 ['baby-6.jpg','Newborn · Kingston','A sleeping newborn wrapped in a turquoise blanket'],
];
const CHAPTERS=[
 {id:'weddings',title:'All of it, <em>start to finish.</em>',
  body:'From the first look to the last dance, plus everything in between that nobody planned. You’ll see a sneak peek within the first week and the full gallery in 10 to 21 days.',
  price:'From $399',link:'/gallery#weddings',cta:'See the weddings',
  lead:['wed-3.jpg','A couple exchange vows under a flower-covered arbour beside the lake'],
  pair:[['wed-1.jpg','A bride in a deep red saree leans on her groom under spring blossom'],['wed-11.jpg','A bride in white surrounded by her bridesmaids and flower girls']],
  more:[['wed-5.jpg','A couple hold hands and laugh together in a sunlit park'],['wed-6.jpg','A bride laughs with her bridesmaids in a garden']]},
 {id:'portraits',title:'Photos that look <em>like you.</em>',
  body:'Half an hour or a couple of hours, one outfit or a few. Mostly we walk and talk, and at some point you stop noticing the camera. That’s usually when the good ones happen.',
  price:'From $85',link:'/gallery#portraits',cta:'See the portraits',
  lead:['por-2.jpg','A woman in a black off-shoulder dress in front of summer greenery'],
  pair:[['por-3.jpg','A woman in a yellow floral dress sits among potted plants'],['por-5.jpg','A woman in a wide-brimmed hat stands in a field of sunflowers']],
  more:[['IMG_7777.JPG.jpeg','A woman in red stands among soft pink blossoms'],['por-10.jpg','A woman in a white cardigan and yellow dress beside a garden']]},
 {id:'family',title:'Bumps, babies and <em>busy toddlers.</em>',
  body:'Newborns sleep, toddlers run off, and we’re fine with both. We shoot plenty of the messy bits, because years from now the photo your kids ask about probably won’t be the tidy one.',
  price:'From $129',link:'/gallery#family',cta:'See family sessions',
  lead:['baby-16.jpg','Parents lean in close to their toddler, who wears red bows in her hair'],
  pair:[['baby-8.jpg','A toddler with a bow in her hair grins at the camera, in black and white'],['baby-9.jpg','An expecting couple smile together beside blue balloons']],
  more:[['baby-5.jpg','A newborn asleep in a soft white wrap, in black and white'],['baby-3.jpg','A newborn’s tiny hand wrapped around a parent’s fingers']]},
 {id:'architecture',title:'Homes, shot in <em>good light.</em>',
  body:'We photograph homes and spaces for how they feel at seven in the evening as well as how they measure. Verticals stay straight and colours stay accurate, and if the light isn’t right yet, we wait for it.',
  price:'Quoted per project',link:'/gallery#architecture',cta:'See the architecture',
  lead:['arch-4.jpg','A home photographed straight on in soft, even light'],
  pair:[['arch-3.jpg','A bright kitchen with pendant lights and glass-front cabinets'],['arch-6.jpg','An exterior photographed straight on in soft daylight']],
  more:[['arch-2.jpg','An interior photographed by Aura Films'],['arch-7.jpg','A home photographed by Aura Films']]},
];
const rowStyle=fs=>` style="--pc:${fs.map(f=>ratio(f).toFixed(3)+'fr').join(' ')}"`;
const bento=(c,flip)=>{const r1=flip?[c.pair[0],c.lead]:[c.lead,c.pair[0]],r2=[c.pair[1],...(c.more||[])];
  return `<div class="bento">${[r1,r2].map(r=>`<div class="bento-row"${rowStyle(r.map(x=>x[0]))}>${r.map(x=>`<a class="plate-link" href="/gallery?photo=${encodeURIComponent(x[0])}#${c.id}">${plate(x[0],x[1])}</a>`).join('')}</div>`).join('')}</div>`;};
const chapter=(c,i)=>`<section class="ch${i%2?' ch--flip':''}" id="${c.id}" data-c="${T(c.lead[0])}"><div class="container">
<div class="ch-head">
<h2 class="h-xl reveal">${c.title}</h2>
<div class="ch-body reveal"><p>${c.body}</p><div class="ch-meta"><span class="price-pill">${c.price}</span><a class="txt-link" href="${c.link}">${c.cta} ${arrow}</a></div></div>
</div>
${bento(c,i%2===1)}
</div></section>`;
const STEPS=[['Reach out','Tell us the date, where it is and what you most want to remember.'],['The shoot','A relaxed session. We tell you where to stand and when to move, so you never have to wonder what to do with your hands.'],['Your gallery','Every photo edited by hand and delivered in 10 to 21 days.']];
const TEASE=[['Portraits','Thirty minutes or a full session, in one outfit or several.',85,'pk-portraits'],['Family &amp; Maternity','Newborns, bumps and growing families.',129,'pk-family'],['Events &amp; Showers','Two photographers on every package.',249,'pk-events'],['Weddings','From a three-hour ceremony to a full documentary day.',399,'pk-weddings']];

const home=head('Aura Films, Wedding and Portrait Photography in Kingston','Aura Films is a Kingston photography studio for weddings, portraits, family and architecture. Every frame shot and hand-graded by Albin.','')+nav('Home')+`
<header class="hero" id="top" data-c="${T(DECK[0][0])}">
<div class="container hero-grid">
<div class="hero-copy">
<h1 class="h-display"><span class="ln"><span>Photographs</span></span> <span class="ln"><span>that remember</span></span> <span class="ln"><span>how it <em>felt.</em></span></span></h1>
<p class="hero-sub reveal">Albin photographs weddings, portraits and families around Kingston, then edits every frame by hand. You get the day as it actually went, in a gallery you’ll keep going back to.</p>
<div class="hero-cta reveal"><a class="btn btn-solid" href="#contact">Book a date ${arrow}</a><a class="btn btn-ghost" href="/gallery">See the work</a></div>
</div>
<div class="deck-wrap reveal">
<div class="deck" id="deck" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Recent photographs. Use the arrow keys to browse.">
<div class="deck-3d">${DECK.map(([f,cap,alt],i)=>{const d=DIMS['c_'+f]||DIMS[f]||[2,3];return `<figure class="card" data-c="${T(f)}" data-cap="${cap}"><span class="card-media" style="--ar:${(d[0]/d[1]).toFixed(4)}"><img src="images/c_${f}" alt="${alt}"${i<2?'':' loading="lazy"'}></span></figure>`;}).join('')}</div>
</div>
</div>
</div>
</header>

<section class="mani" data-c="22,18,16"><div class="container">
<p class="mani-text">${words('Aura Films started with a habit more than a plan: look at the light before lifting the camera. That attention carries through the whole shoot, into the small details that make a moment belong to someone, and into the edit, where every frame is finished by hand until it looks the way the moment *felt.*')}</p>
</div></section>

${CHAPTERS.map(chapter).join('')}

<section class="sec" data-c="22,30,48"><div class="container">
<h2 class="h-xl reveal">How it <em>works.</em></h2>
<ol class="steps">${STEPS.map(([t,d],i)=>`<li class="step reveal"><span class="step-n">0${i+1}</span><h3 class="h-md">${t}</h3><p>${d}</p></li>`).join('')}</ol>
</div></section>

<section class="sec" data-c="${T(testimonials[0].img)}"><div class="container">
<h2 class="h-xl reveal">What our clients <em>said.</em></h2>
<div class="quotes">${testimonials.map(t=>`<figure class="quote reveal"><div class="quote-pic"><img src="images/${t.img}" alt="${t.nm}" loading="lazy"></div><blockquote><p>${t.quote}</p><footer><cite>${t.nm}</cite><span>${t.role}</span></footer></blockquote></figure>`).join('')}</div>
</div></section>

<section class="sec" data-c="48,32,24"><div class="container">
<div class="sec-head"><h2 class="h-xl reveal">The <em>investment.</em></h2><p class="lede reveal">Prices in Canadian dollars.</p></div>
<div class="tease">${TEASE.map(([n,d,p,id])=>`<a class="tease-row reveal" href="/investment#${id}"><h3 class="h-md">${n}</h3><p>${d}</p><span class="tease-price"><small>from</small>$${p}</span><span class="tease-go" aria-hidden="true">${arrow}</span></a>`).join('')}</div>
</div></section>

${contactBlock()}
`+foot();

/* ════════ GALLERY ════════ */
function buildGallery(){
  const seen=new Set();
  const secs=Object.keys(GAL).map(cat=>{
    const files=GAL[cat].filter(f=>!seen.has(f)&&seen.add(f));
    return `<section class="gsec" id="${cat}" data-c="${CAT_T[cat]}"><div class="container">
<div class="ghead"><h2 class="h-xl reveal">${esc(LABELS[cat])}</h2></div>
<div class="gal-grid">${files.map(f=>`<figure class="gitem" data-full="images/${f}" tabindex="0" role="button" aria-label="Open ${esc(LABELS[cat])} photograph"><img src="images/${f}" alt="${esc(LABELS[cat])} by Aura Films" loading="lazy"></figure>`).join('')}</div>
</div></section>`;
  }).join('');
  return head('Gallery, Aura Films','Browse Aura Films weddings, portraits, family and architecture photography from Kingston and across Ontario.','gallery')+nav('Gallery')+`
<header class="phero" data-c="${T('wed-3.jpg')}"><div class="container">
<h1 class="h-display">The <em>gallery.</em></h1>
<p class="phero-sub reveal">Tap any photo to see it full size.</p>
</div></header>
<div class="jump-bar"><div class="container"><nav class="jump" aria-label="Gallery sections">${Object.keys(GAL).map(c=>`<a href="#${c}">${esc(LABELS[c])}</a>`).join('')}</nav></div></div>
${secs}`+foot(lightbox);
}

/* ════════ ABOUT ════════ */
const FACTS=[
 ['Based in','Kingston, Ontario'],
 ['What I shoot','Weddings, events, maternity, family, portraits and architecture'],
 ['Editing','Every frame, by hand, by me'],
 ['Turnaround','10 to 21 days. Wedding sneak peeks arrive in the first week.'],
 ['Travel','Included within 20 km of Kingston'],
 ['Sessions from','$85'],
];
const STRIP=[
 ['wed-2.jpg','Ceremony','weddings','A couple exchange vows beneath a lakeside gazebo'],
 ['por-9.jpg','Portrait','portraits','A woman in a deep green gown stands in a summer garden'],
 ['baby-13.jpg','Newborn','family','A newborn asleep in a soft knit, in black and white'],
 ['wed-13.jpg','Ceremony','weddings','Hands meeting during the ring exchange'],
 ['IMG_9356.JPG.jpeg','Groom','weddings','A groom in a black suit on a bridge, in black and white'],
 ['wed-10.jpg','Wedding','weddings','A couple rest forehead to forehead in a spring park'],
 ['baby-15.jpg','Newborn','family','A newborn asleep on white bedding, in black and white'],
 ['arch-8.jpg','Architecture','architecture','A bathroom with a dark stone vanity and warm lighting'],
];
const about=head('About Albin, Aura Films','Meet Albin, the Kingston photographer behind Aura Films, who shoots weddings, portraits and family sessions and edits every photo by hand.','about')+nav('About')+`
<header class="ab-hero" data-c="${T('albin-new.jpg')}"><div class="container ab-hero-grid">
<div class="ab-hero-copy">
<h1 class="h-display"><span class="ln"><span>Nice to</span></span> <span class="ln"><span><em>meet you.</em></span></span></h1>
<p class="phero-sub reveal">I’m Albin, the photographer behind Aura Films in Kingston. If you book with us, I’m the one behind the camera on the day and the one editing every photo afterwards.</p>
<div class="hero-cta reveal"><a class="btn btn-solid" href="#contact">Book a date ${arrow}</a><a class="btn btn-ghost" href="/gallery">See the work</a></div>
</div>
<figure class="ab-portrait"><div class="ab-mask"><img src="images/albin-new.jpg" alt="Albin, founder of Aura Films, holding a camera in a sunflower field"></div><figcaption>Albin, founder and photographer</figcaption></figure>
</div></header>

<section class="sec ab-story" data-c="${T('wed-5.jpg')}"><div class="container ab-story-grid">
<div class="ab-bio">
<h2 class="h-xl reveal">Why I <em>do this.</em></h2>
<div class="prose reveal">
<p>Aura Films began with a single camera and a conviction I still work by: a photograph should carry the feeling of a moment as faithfully as its details.</p>
<p>I photograph weddings, maternity, families and portraits, and I take on architectural commissions when a space asks to be seen properly. On every shoot I read the light first. My direction stays gentle, enough to put you at ease, so what the camera keeps is genuinely yours.</p>
<p>Every image is finished by my own hand. I grade toward warmth and a restrained, cinematic depth, and I stop well before a photograph begins to look like anyone other than you.</p>
</div>
</div>
<aside class="ab-facts reveal" aria-label="The short version"><h3 class="h-md">The short version</h3>
<dl>${FACTS.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
</aside>
</div></section>

<section class="strip" id="work" data-c="${T('wed-1.jpg')}">
<div class="container strip-head"><h2 class="h-xl reveal">Recent <em>work.</em></h2><p class="lede reveal">A few favourites. Tap any photo to see the full set.</p></div>
<div class="strip-view" tabindex="0" aria-label="Recent photographs, scroll sideways"><div class="strip-track">${STRIP.map(([f,l,cat,alt])=>`<a class="strip-card" href="/gallery?photo=${encodeURIComponent(f)}#${cat}"><img src="images/${f}" alt="${alt}"><span class="strip-tag">${l}</span></a>`).join('')}</div></div>
</section>

${faqBlock()}
${contactBlock()}
`+foot();

/* ════════ INVESTMENT ════════ */
const PKINFO={
 Weddings:['pk-weddings','wed-9.jpg','A groom kisses his bride beneath a leafy tree','From a three-hour ceremony to a full documentary day with a second shooter.','wed-12.jpg','wed-10.jpg'],
 Events:['pk-events','baby-12.jpg','An expecting mother at her baby shower among blue balloons','Two photographers on every package.','wed-6.jpg','_DSC8672.jpg'],
 Family:['pk-family','baby-2.jpg','Parents hold their newborn close','Newborns, bumps and growing families, with a maternity-friendly option.','baby-13.jpg','baby-15.jpg'],
 Portraits:['pk-portraits','por-11.jpg','A woman in a lavender top stands beneath autumn trees','From thirty minutes to a full session with editorial retouching.','por-12.jpg','por-7.jpg'],
};
const pkStack=k=>{const [,f,alt,,b1,b2]=PKINFO[k];return `<div class="pk-stack"><span class="pk-back pk-back--2" aria-hidden="true"><img src="images/${b2}" alt="" loading="lazy"></span><span class="pk-back pk-back--1" aria-hidden="true"><img src="images/${b1}" alt="" loading="lazy"></span>${plate(f,alt,'','plate--pk')}</div>`;};
const tier=([tag,name,price,add,feats,feat])=>`<article class="tier${feat?' tier--rec':''} reveal">${feat?'<span class="tier-tag">Recommended</span>':''}<h3 class="tier-name">${name}</h3><p class="tier-price"><span>$</span>${price}</p><p class="tier-note">${add}</p><ul class="tier-list">${feats.map(x=>`<li>${tick}<span>${x}</span></li>`).join('')}</ul><a class="btn btn-ghost tier-btn" href="#contact">Enquire about ${name}</a></article>`;
const CHIPS=[['An assistant on bigger shoots','Weddings and events get a second pair of hands.'],['Edited by hand','We edit each photo on its own. No batch filters.'],['Quick turnaround','Sneak peeks within a week, full galleries in 10 to 21 days.'],['Clear pricing','Prices in CAD and valid for 30 days. A 30% retainer books your date.']];
const EXP=[['Consult','We talk through what you want and which moments matter most to you.'],['Plan','We sort out locations, timing and a shot list together.'],['Shoot','A relaxed day with clear direction.'],['Deliver','You get a gallery edited by hand.']];

const investment=head('Investment, Aura Films','Photography packages and prices from Aura Films in Kingston: weddings, events, family and portrait sessions, in CAD.','investment')+nav('Investment')+`
<header class="phero" data-c="${T('wed-1.jpg')}"><div class="container">
<h1 class="h-display">The <em>investment.</em></h1>
<p class="phero-sub reveal">Every package and price is listed here, from a thirty-minute portrait to a full wedding day.</p>
<div class="chips">${CHIPS.map(([b,t])=>`<div class="chip reveal">${tick}<p><b>${b}.</b> ${t}</p></div>`).join('')}</div>
</div></header>
<div class="jump-bar"><div class="container"><nav class="jump" aria-label="Package categories">${Object.keys(PKG).map(k=>`<a href="#${PKINFO[k][0]}">${k}</a>`).join('')}</nav></div></div>
${Object.entries(PKG).map(([k,arr],i)=>`<section class="pk${i%2?' pk--flip':''}" id="${PKINFO[k][0]}" data-c="${T(PKINFO[k][1])}"><div class="container">
<div class="pk-head"><div class="pk-copy"><h2 class="h-xl reveal">${k}</h2><p class="lede reveal">${PKINFO[k][3]}</p></div>${pkStack(k)}</div>
<div class="tiers">${arr.map(tier).join('')}</div>
</div></section>`).join('')}

<section class="sec" data-c="48,32,24"><div class="container split">
<div><h2 class="h-xl reveal">Add-ons and <em>the fine print.</em></h2>
<p class="lede reveal">Prices are in Canadian dollars and hold for 30 days from your enquiry. A 30% non-refundable retainer confirms the booking. Travel within 20 km of Kingston is included, and a small fee applies beyond that.</p></div>
<ul class="addons reveal">${addons.map(([n,p])=>`<li><span>${n}</span><b>${p}</b></li>`).join('')}</ul>
</div></section>

<section class="sec" data-c="22,30,48"><div class="container">
<h2 class="h-xl reveal">What to <em>expect.</em></h2>
<ol class="steps steps--4">${EXP.map(([t,d],i)=>`<li class="step reveal"><span class="step-n">0${i+1}</span><h3 class="h-md">${t}</h3><p>${d}</p></li>`).join('')}</ol>
</div></section>

${faqBlock()}
${contactBlock()}
`+foot();

/* ════════ LEGAL ════════ */
const legalShell=(title,body)=>head(title+', Aura Films','Aura Films '+title.toLowerCase()+'.',title.split(/[ &]/)[0].toLowerCase())+nav('')+`<main class="legal"><div class="container" style="max-width:860px"><h1 class="serif">${title}</h1><p class="updated">Last updated · September 2026</p>${body}</div></main>`+foot();
const privacy=legalShell('Privacy Policy',`
<p><strong>Aura Films</strong> is a sole proprietorship operated by Albin, based in Kingston, Ontario, Canada ("we", "us", "our"), and is the party responsible for the personal information we hold about you. This policy explains what we collect, how we use it, and your rights under Canada's <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and applicable Ontario law. It should be read together with our <a href="cookie" style="color:var(--gold-ink);text-decoration:underline">Cookie Policy</a> and <a href="refund" style="color:var(--gold-ink);text-decoration:underline">Refund Policy</a>. By using our website or booking our services, you consent to the practices described here.</p>
<h2>1. Information We Collect</h2><ul>
<li><strong>Contact details</strong> you provide: name, email, phone, event date and location.</li>
<li><strong>Booking information:</strong> package choice, preferences, and correspondence.</li>
<li><strong>Images</strong> captured during your session.</li>
<li><strong>Technical data:</strong> like any website, our host (Cloudflare) processes standard technical information such as IP address and browser type to deliver the site and protect it from abuse. We do not use analytics, session recording or tracking tools.</li></ul>
<h2>2. How We Use Your Information</h2><p>To respond to enquiries, prepare quotes and contracts, deliver your session and gallery, process payments, and improve our services. We do not sell your personal information.</p>
<h2>3. Consent</h2><p>We collect and use your information with your consent, which you may withdraw at any time by contacting us (subject to existing contractual obligations).</p><p>We only send marketing or promotional emails if you have <strong>expressly opted in</strong> (for example, by ticking an optional sign-up box on our website), in line with Canada's Anti-Spam Legislation (CASL). Enquiries you send us are not added to any marketing list. Every promotional email includes an unsubscribe link, and you can opt out at any time.</p>
<h2>4. Service Providers &amp; Disclosure</h2><p>We share information only with trusted service providers ("processors") needed to run our business and website, and only for that purpose. These currently include:</p>
<ul>
<li><strong>Web3Forms</strong> &mdash; delivers our contact-form and offer sign-up submissions to our inbox.</li>
<li><strong>Cloudflare</strong> &mdash; hosts the website and protects it from attacks; processes technical data such as IP addresses to do so.</li>
<li><strong>Calendly</strong> &mdash; powers optional online booking, and is loaded only if you choose to open the booking calendar.</li>

<li>Our email, cloud storage and online gallery providers, used to prepare and deliver your session.</li>
</ul>
<p>Some providers are located outside Canada (including in the United States), so your information may be processed abroad under that country's laws. We share only what is necessary, require providers to protect your data, and <strong>never sell</strong> your personal information. We may also disclose information where required by law.</p>
<h2>5. Image &amp; Portfolio Use</h2><p>We use images in which you can be identified for our portfolio, website or social media only with the permission you give in your booking agreement. Images of children are used only with a parent or guardian’s express written consent. You can withdraw permission at any time by emailing us, and we will stop any further use and remove the images from our website.</p>
<h2>6. Storage &amp; Retention</h2><p>Your gallery and files are stored securely and retained for a limited period after delivery (typically 12 months) unless a longer archive is agreed. We retain booking records as required for tax and legal purposes.</p>
<h2>7. Cookies &amp; Tracking</h2><p>We do <strong>not</strong> use advertising, marketing or analytics cookies, and we do not track you across other websites. The site uses only functional technologies: your cookie-notice choice is stored locally on your device, our fonts are hosted on our own website, and if you close our first-session offer we store a small reminder so it does not reappear, and the optional Calendly booking tool may set its own cookies <em>only</em> if you choose to open it. Full details, and how to control cookies, are in our <a href="cookie" style="color:var(--gold-ink);text-decoration:underline">Cookie Policy</a>.</p>
<h2>8. Your Rights</h2><p>You have the right to access the personal information we hold about you, request corrections, and ask that it be deleted where we are not legally required to keep it. Email <a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold-ink);text-decoration:underline">itsaurafilms@gmail.com</a> to make a request.</p>
<p>If you are located in the <strong>EU or UK</strong>, you also have rights under the GDPR, including access, rectification, erasure, restriction, portability and objection. Our lawful bases for processing are your consent and the performance of our contract with you. You may lodge a complaint with your local data-protection authority. Canadian visitors may contact the Office of the Privacy Commissioner of Canada.</p>
<h2>9. Children</h2><p>Sessions involving minors are booked and consented to by a parent or guardian. Our website and its forms are intended for adults; we do not knowingly collect personal information online from children. If you believe a child has sent us information, contact us and we will delete it.</p>
<h2>10. Changes</h2><p>We may update this policy from time to time. The "last updated" date reflects the current version.</p>
<h2>11. Contact</h2><p>Questions? Reach us at <a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold-ink);text-decoration:underline">itsaurafilms@gmail.com</a> or 343 989 4546, Kingston, Ontario.</p>`);
const terms=legalShell('Terms & Conditions',`
<p>These Terms govern photography services provided by Aura Films in Ontario, Canada. By paying a retainer or signing a booking agreement, you ("the Client") agree to these Terms.</p>
<h2>1. Booking &amp; Retainer</h2><p>A <strong>30% non-refundable retainer</strong> and a signed agreement are required to reserve your date. Dates are held on a first-come basis and are not guaranteed until both are received.</p>
<h2>2. Payment</h2><p>The remaining balance is due on or before the day of the session unless otherwise agreed in writing. Prices are quoted in Canadian dollars (CAD) and are valid for 30 days from the date of quotation.</p>
<h2>3. Cancellation &amp; Rescheduling</h2><p>The retainer is non-refundable on cancellation. Rescheduling is permitted once with reasonable notice, subject to availability. Weather-related rescheduling for outdoor sessions is accommodated at no additional charge. Full details, including what happens if we ever have to cancel, are set out in our <a href="refund" style="color:var(--gold-ink);text-decoration:underline">Refund &amp; Cancellation Policy</a>.</p>
<h2>4. Copyright &amp; Licence</h2><p>Aura Films retains <strong>copyright in all images</strong> under the Canadian <em>Copyright Act</em>. Upon final payment, the Client is granted a personal, non-exclusive licence to use delivered images for personal, non-commercial purposes (printing and sharing). Commercial use, resale, or licensing to third parties requires our written permission.</p>
<h2>5. Image Release</h2><p>Aura Films may use selected images for portfolio, marketing and social media only with the permission the Client gives in the booking agreement. Images of minors are used only with a parent or guardian’s express written consent. The Client may withdraw permission for future use at any time by written notice.</p>
<h2>6. Deliverables &amp; Turnaround</h2><p>Edited galleries are delivered within the timeframe stated for your package (typically 10 to 21 business days). Aura Films delivers hand-graded, high-resolution images; unedited raw files are not included unless purchased as an add-on. The number of edited images stated per package is what is delivered; selection is at our professional discretion.</p>
<h2>7. Client Conduct &amp; Safety</h2><p>The Client agrees to provide a safe working environment. We reserve the right to end a session where the safety of our team or equipment is at risk, without refund.</p>
<h2>8. Force Majeure</h2><p>Aura Films is not liable for failure to perform due to events beyond our reasonable control (illness, extreme weather, equipment failure, emergencies). In such cases we will make reasonable efforts to reschedule or arrange a suitable substitute.</p>
<h2>9. Limitation of Liability</h2><p>In the unlikely event of loss or inability to deliver due to circumstances beyond our control, our total liability is limited to a refund of fees paid for the affected service. We are not liable for indirect or consequential losses.</p>
<h2>10. Privacy</h2><p>Personal information is handled in accordance with our <a href="privacy" style="color:var(--gold-ink);text-decoration:underline">Privacy Policy</a> and PIPEDA.</p>
<h2>11. Governing Law</h2><p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein.</p>
<h2>12. Contact</h2><p><a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold-ink);text-decoration:underline">itsaurafilms@gmail.com</a> · 343 989 4546 · Kingston, Ontario.</p>`);

const GI=`style="color:var(--gold-ink);text-decoration:underline"`;
const cookie=legalShell('Cookie Policy',`
<p>This Cookie Policy explains the cookies and similar technologies used on the Aura Films website, operated by Albin (a sole proprietorship in Kingston, Ontario, Canada). It supplements our <a href="privacy" ${GI}>Privacy Policy</a>.</p>
<h2>1. What are cookies?</h2><p>Cookies are small text files a website can store on your device. "Similar technologies" include browser local storage, which works in a comparable way. They can be set by us ("first-party") or by an outside service ("third-party").</p>
<h2>2. Our approach</h2><p>We keep this to the minimum. <strong>We do not use any advertising, marketing or analytics cookies, and we do not track you across other websites or build a profile of you.</strong></p>
<h2>3. What we actually use</h2>
<ul>
<li><strong>Your cookie-notice choice (local storage, first-party, essential).</strong> When you respond to our cookie notice, we store that choice in your browser so we don't ask again. It stays on your device and is not sent to us.</li>
<li><strong>Offer reminder (local storage, first-party, functional).</strong> If you close or complete our first-session offer, we store a small note in your browser so it does not appear again for a while. It contains no personal information and is not sent to us.</li>
<li><strong>Fonts (first-party).</strong> Our typefaces are hosted on our own website, so loading them does not contact any third party.</li>
<li><strong>Calendly (third-party, functional, on request only).</strong> Our optional booking calendar is <strong>not</strong> loaded when you open the site. It loads only if you click "Book a Date" or "Open booking calendar", at which point Calendly may set its own cookies to run the scheduling tool. See Calendly's own privacy and cookie notices for details.</li>
</ul>
<h2>4. What we do NOT use</h2><p>No Google Analytics or other analytics, no Meta/Facebook pixel, and no advertising or re-targeting cookies. Our Instagram and other links are ordinary links; following them takes you to those sites, which have their own policies.</p>
<h2>5. Contact-form submissions</h2><p>Our contact form is delivered by Web3Forms and does not set cookies simply by your browsing the site. Information you submit is handled as described in our <a href="privacy" ${GI}>Privacy Policy</a>.</p>
<h2>6. Managing cookies</h2><p>You can delete or block cookies, and clear local storage, through your browser settings. Blocking functional items may affect booking or the site's appearance. Your browser's help pages explain how.</p>
<h2>7. Visitors from the EU/UK</h2><p>Because we occasionally have visitors from the EU and UK, we aim for the higher standard: no non-essential cookies are set without a clear action by you, and no third party is contacted automatically when you browse. Our host, Cloudflare, delivers the site and processes technical data such as IP addresses to keep it secure.</p>
<h2>8. Changes &amp; contact</h2><p>We may update this policy; the "last updated" date shows the current version. Questions? <a href="mailto:itsaurafilms@gmail.com" ${GI}>itsaurafilms@gmail.com</a> &middot; 343 989 4546, Kingston, Ontario.</p>`);
const refund=legalShell('Refund & Cancellation Policy',`
<p>This Refund &amp; Cancellation Policy applies to photography services provided by Aura Films, a sole proprietorship operated by Albin in Kingston, Ontario, Canada. It forms part of, and should be read with, our <a href="terms" ${GI}>Terms &amp; Conditions</a>. All amounts are in Canadian dollars (CAD).</p>
<h2>1. Booking retainer</h2><p>A <strong>30% non-refundable retainer</strong> is required to reserve your date and time. Because we turn away other work to hold your date, the retainer is not refundable if you cancel, except where required by law or as set out below.</p>
<h2>2. Balance payments</h2><p>The remaining balance is due on or before the day of the session unless otherwise agreed in writing. Prices are valid for 30 days from the date of quotation.</p>
<h2>3. If you cancel</h2><p>You may cancel at any time by written notice (email is fine). The retainer is forfeited. Any amount you have paid <em>above</em> the retainer is refunded to you. If you cancel within 7 days of the session, the full quoted fee may remain payable, as the date can rarely be rebooked at short notice.</p>
<h2>4. Rescheduling</h2><p>We're glad to reschedule once with reasonable notice, subject to availability, and your retainer carries over to the new date. Further reschedules may incur a small administration fee. Rescheduling of outdoor sessions due to unsafe weather is always free of charge.</p>
<h2>5. If we cancel</h2><p>If Aura Films must cancel and cannot arrange a mutually acceptable alternative date (or, with your agreement, a suitable replacement photographer), you will receive a <strong>full refund of all monies paid, including the retainer</strong>. Our liability is limited to the amount you have paid, as set out in our Terms.</p>
<h2>6. Delivery &amp; the finished work</h2><p>We deliver hand-graded images in our editing style, within the timeframe stated for your package. Because photography and editing are creative and subjective, refunds are not given for differences in personal taste. If there is a genuine technical fault with delivered images, we will re-edit or, where reasonably possible, reshoot the affected work.</p>
<h2>7. Late arrival or no-show</h2><p>Session time missed due to late arrival is not refunded or added on. A no-show without notice is treated as a cancellation under section 3.</p>
<h2>8. How refunds are issued</h2><p>Approved refunds are made by the original payment method (or e-transfer) within <strong>14 days</strong>. Please contact us first rather than raising a chargeback, so we can resolve matters quickly.</p>
<h2>9. Your statutory rights</h2><p>Nothing in this policy removes rights you may have under Ontario or Canadian consumer-protection law.</p>
<h2>10. Contact</h2><p><a href="mailto:itsaurafilms@gmail.com" ${GI}>itsaurafilms@gmail.com</a> &middot; 343 989 4546 &middot; Kingston, Ontario.</p>`);

/* Home keeps the additive motion layer (home page only). */
const homeHTML=finalize(home);

const schema=`<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","additionalType":"https://schema.org/PhotographStore","name":"Aura Films","url":"${SITE}","image":"${SITE}images/wed-3.jpg","description":"Photography studio in Kingston, Ontario. Weddings, portraits, family and architecture, shot and hand graded by Albin.","email":"itsaurafilms@gmail.com","telephone":"+1-343-989-4546","priceRange":"$85 - $1049","address":{"@type":"PostalAddress","addressLocality":"Kingston","addressRegion":"ON","addressCountry":"CA"},"areaServed":{"@type":"State","name":"Ontario"},"founder":{"@type":"Person","name":"Albin"},"sameAs":["https://www.instagram.com/aura.filmsca/"]}</script>`;
const withSchema=h=>h.replace('</head>',schema+'</head>');

const PAGES=[['',1.0],['gallery',0.9],['about',0.8],['investment',0.9],['privacy',0.3],['terms',0.3],['cookie',0.3],['refund',0.3],['accessibility',0.3]];
const today=new Date().toISOString().slice(0,10);
const NL=String.fromCharCode(10);
if(sharp) await writeFile(TONES_FILE,JSON.stringify(TONES));
await writeFile('../sitemap.xml',
  ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    .concat(PAGES.map(([p,pr])=>'  <url><loc>'+SITE+p+'</loc><lastmod>'+today+'</lastmod><priority>'+pr.toFixed(1)+'</priority></url>'))
    .concat(['</urlset>','']).join(NL));
await writeFile('../robots.txt',
  ['User-agent: *','Allow: /','Disallow: /_originals/','','Sitemap: '+SITE+'sitemap.xml',''].join(NL));
await writeFile('../404.html',finalize(head('Page not found, Aura Films','That page does not exist. Browse the Aura Films gallery, packages or get in touch.','404')+nav('')+
`<main class="legal"><div class="container" style="max-width:860px">
<p class="updated">Error 404</p>
<h1 class="serif">That page has <em>wandered off.</em></h1>
<p>The link may be old, or the page may have moved. Everything is still here:</p>
<p style="margin-top:26px"><a class="btn btn-gold" href="/">Back to home</a> <a class="btn btn-line" href="/gallery" style="margin-left:8px">See the gallery</a></p>
<h2>Or jump straight to</h2>
<ul><li><a href="/gallery">The full gallery</a></li><li><a href="/investment">Packages and pricing</a></li><li><a href="/about">About Albin</a></li><li><a href="/about#contact">Get in touch</a></li></ul>
</div></main>`+foot()));

await writeFile('../index.html',withSchema(homeHTML));
await writeFile('../gallery.html',withSchema(finalize(buildGallery())));
await writeFile('../about.html',withSchema(finalize(about)));
await writeFile('../investment.html',withSchema(finalize(investment)));
await writeFile('../privacy.html',finalize(privacy));
await writeFile('../terms.html',finalize(terms));
await writeFile('../cookie.html',finalize(cookie));
await writeFile('../refund.html',finalize(refund));
/* ── only the public site is reachable: everything else in the repo (notes, scripts, fonts
   under licence, screenshots, tooling) is redirected home. Regenerated on every build, so
   anything added later is covered automatically. */
{
  const ROOT_OK=/^(.*.html|sitemap.xml|robots.txt|favicon.ico|favicon(-32)?.png|apple-touch-icon.png|_headers|_redirects)$/;
  const DIR_OK=new Set(['images','redesign']),RD_OK=new Set(['aura.css','aura.js','fonts','vendor']);
  const enc=p=>p.split('/').map(encodeURIComponent).join('/');
  const rules=[];
  for(const d of readdirSync('..',{withFileTypes:true})){
    if(d.name==='.git') continue;
    if(d.isDirectory()){ if(!DIR_OK.has(d.name)) rules.push('/'+enc(d.name)+'/* / 301'); }
    else if(!ROOT_OK.test(d.name)) rules.push('/'+enc(d.name)+' / 301');
  }
  for(const d of readdirSync('.',{withFileTypes:true})) if(!RD_OK.has(d.name)) rules.push('/redesign/'+enc(d.name)+(d.isDirectory()?'/*':'')+' / 301');
  await writeFile('../_redirects',rules.join(NL)+NL);
}
const accessibility=legalShell('Accessibility',`
<p>Aura Films wants everyone to be able to browse our work, read our prices and get in touch, whatever device or assistive technology they use.</p>
<h2>1. Our standard</h2><p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. We test the site with automated accessibility tools and by keyboard, and we fix what we find.</p>
<h2>2. What the site does</h2><ul><li>Text alternatives that describe each photograph.</li><li>Full keyboard access, a skip link, visible focus and labelled form fields.</li><li>Text and background colours that meet WCAG contrast ratios.</li><li>Animation that switches off when your device’s “reduce motion” setting is on.</li><li>Layouts that adapt from small phones to large screens.</li></ul>
<h2>3. Known limitations</h2><p>Our optional booking calendar is provided by Calendly, and we do not control its accessibility. If it does not work for you, email or call us and we will book you directly.</p>
<h2>4. Feedback and other formats</h2><p>If anything on this site is hard to use, or you would like information in another format, contact us at <a href="mailto:itsaurafilms@gmail.com">itsaurafilms@gmail.com</a> or <a href="tel:+13439894546">343 989 4546</a>. We reply within 24 to 48 hours.</p>`);
await writeFile('../accessibility.html',finalize(accessibility));
console.log('✓ generated 8 pages + 404, sitemap.xml, robots.txt');
