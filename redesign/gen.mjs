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

/* ── head (Fraunces + Inter + Pinyon Script) ── */
const head=(title,desc)=>`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title><meta name="description" content="${desc}">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="icon" type="image/png" sizes="256x256" href="favicon.png">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="theme-color" content="#100E0C">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Petit+Formal+Script&display=swap" rel="stylesheet">
<link rel="stylesheet" href="redesign/aura.css">${CALENDLY?`<link rel="preconnect" href="https://assets.calendly.com"><link rel="preconnect" href="https://calendly.com" crossorigin><link rel="dns-prefetch" href="https://calendly.com"><link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet"><script src="https://assets.calendly.com/assets/external/widget.js"></script>`:''}${HCAPTCHA?`<script src="https://js.hcaptcha.com/1/api.js" async defer></script>`:''}<script>window.AURA_CALENDLY=${JSON.stringify(CALENDLY)};</script></head><body><a href="#main" class="skip-link">Skip to content</a><div class="grain"></div>`;

/* ── nav ── */
const nav=(active)=>{const L=[['index.html','Home'],['gallery.html','Gallery'],['about.html','About Us'],['investment.html','Investment']];
return `<nav class="nav" id="nav"><div class="nav-inner">
<a href="index.html" class="brand"><img class="logo-light" src="logo-black.png" alt="Aura Films"><img class="logo-dark" src="images/aura-logo-white.png" alt="Aura Films"></a>
<div class="nav-links">${L.map(([h,t])=>`<a href="${h}" class="nav-link${active===t?' active':''}">${t}</a>`).join('')}
<a href="about.html#contact" class="nav-cta">Book a Date</a></div>
<button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
</div></nav>
<div class="nav-drawer" id="drawer">${L.map(([h,t])=>`<a href="${h}">${t}</a>`).join('')}<a href="about.html#contact" class="nav-cta">Book a Date</a></div>`;};

/* ── circular badge (full circle text) ── */
const badge=`<div class="badge"><div class="badge-ring-wrap"><svg class="badge-ring" viewBox="0 0 160 160"><defs><path id="circ" d="M80,80 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0"/></defs>
<text><textPath href="#circ" startOffset="0">AURA FILMS&#160;&#160;&#160;PHOTOGRAPHY&#160;&#160;&#160;</textPath></text></svg></div>
<div class="badge-logo"><img src="images/aura-logo-white.png" alt="Aura Films"></div></div>`;

/* ── footer (deep-linked work, Kingston & Ontario) ── */
const footer=`<footer class="footer"><div class="container">
<div class="foot-top">
<div class="foot-brand"><div class="foot-badge">${badge}</div>
<p>Shooting moments. Preserving memories. A Kingston-based photography studio, available across Kingston and Ontario.</p>
<div class="foot-soc"><a href="https://www.instagram.com/aura.filmsca/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none"/></svg></a></div></div>
<div class="foot-col"><h4>Explore</h4><a href="index.html">Home</a><a href="gallery.html">Gallery</a><a href="about.html">About Us</a><a href="investment.html">Investment</a></div>
<div class="foot-col"><h4>Work</h4><a href="gallery.html#weddings">Weddings</a><a href="gallery.html#portraits">Portraits</a><a href="gallery.html#family">Family &amp; Maternity</a><a href="gallery.html#architecture">Architecture</a></div>
<div class="foot-col"><h4>Reach Us</h4><a href="mailto:itsaurafilms@gmail.com">itsaurafilms@gmail.com</a><a href="tel:+13439894546">343 989 4546</a><a href="about.html#contact">Kingston, ON</a></div>
</div>
<div class="foot-bot"><p>© 2026 Aura Films. All rights reserved. <a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms &amp; Conditions</a></p>
<p>Design &amp; SEO by <a href="https://joelvarghese-hack.github.io/Marketing-Portfolio/" target="_blank" rel="noopener">Joel Varghese</a></p></div>
</div></footer>`;

const lightbox=`<div class="lb" id="lb"><button class="lb-btn lb-close" id="lbClose" aria-label="Close">&times;</button>
<button class="lb-btn lb-prev" id="lbPrev" aria-label="Previous"><svg class="lb-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 6l-6 6 6 6"/></svg></button>
<img id="lbImg" src="" alt=""><button class="lb-btn lb-next" id="lbNext" aria-label="Next"><svg class="lb-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 6l6 6-6 6"/></svg></button></div>`;
const toTop=`<button class="totop" id="toTop" aria-label="Back to top"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>`;
const revealJS=`<script>
(function(){var R=document.querySelectorAll('.reveal');
if(!('IntersectionObserver'in window)){R.forEach(function(e){e.classList.add('in');});return;}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0,rootMargin:'0px 0px -8% 0px'});
R.forEach(function(e){io.observe(e);});
/* safety net: reveal anything already on/near screen, and never let a tall
   section stay hidden (re-checks on scroll for elements taller than viewport). */
function sweep(){document.querySelectorAll('.reveal:not(.in)').forEach(function(e){var r=e.getBoundingClientRect();if(r.top<innerHeight*0.92&&r.bottom>0){e.classList.add('in');io.unobserve(e);}});}
setTimeout(sweep,1400);addEventListener('scroll',sweep,{passive:true});})();
</script>`;
const foot=(extra='')=>footer+toTop+extra+revealJS+`<script src="redesign/aura.js"></script></body></html>`;
const arrow=`<svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>`;
const tick=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>`;
const star=`<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9.6l6.9-.7z"/></svg>`;

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
<div class="full"><label class="fl" for="cf-msg">Tell us about your day</label><textarea class="fi" id="cf-msg" name="message" required placeholder="Share your vision, the where, the when, the feeling."></textarea></div>
${HCAPTCHA?`<div class="full"><div class="h-captcha" data-sitekey="${HCAPTCHA}"></div></div>`:''}<div class="full"><button class="btn btn-dark" id="cf-btn" type="submit">Send Enquiry ${arrow}</button></div>
</form>
<div class="cform-thanks" id="cformThanks">
<div class="ct-ico"><svg viewBox="0 0 52 52" width="58" height="58" fill="none" stroke="currentColor" stroke-width="2"><circle cx="26" cy="26" r="24"/><path d="M16 27l7 7 13-14" stroke-width="2.4"/></svg></div>
<h3 class="serif">Thank you for reaching out!</h3>
<p>Your enquiry has been received. We will be in touch within <strong>24 to 48 hours</strong> to chat more about your session.</p>
</div></div>`;

/* ════════ HOME ════════ */
/* Interactive hero: hover "Aura"/"Films" to reveal a floating photo cluster.
   Uses CLEAN (no-watermark) c_ copies, spread evenly across the hero. */
const auraSet=['wed-1','wed-5','baby-1','por-8'];
const filmsSet=['arch-1','wed-4','baby-6','por-6'];
const heroCluster=(cls,arr)=>`<div class="ihero-cluster ${cls}">${arr.map((n,i)=>`<figure class="ihero-pic s${i}"><img src="${IMG}c_${n}.jpg" alt=""></figure>`).join('')}</div>`;
/* Infinite drag board: a base cell of clean, non-overlapping thumbnails tiled 3x3.
   Thumbnails are clean (c_); the click-to-open view uses the watermarked copy. */
const DCOLS=4,_cellW=440,_cellH=520;
const dragImgs=['wed-1','wed-3','wed-4','wed-5','wed-8','wed-9','wed-10','por-2','por-3','por-6','por-8','por-9','por-11','baby-1','baby-6','baby-8','baby-9','baby-10','baby-16','arch-1'];
/* Each frame (w,h) sits centred in its cell with a small clamped jitter that keeps
   >=45px inside every edge — so neighbours are always >=90px apart (never overlap). */
const _frames=[[300,400],[330,300],[300,375],[320,410],[290,360],[330,285],[310,400],[300,300]];
const _basePics=dragImgs.map((n,i)=>{const c=i%DCOLS,r=Math.floor(i/DCOLS);const[w,h]=_frames[i%_frames.length];const mx=(_cellW-w)/2-45,my=(_cellH-h)/2-45;const jx=Math.max(-mx,Math.min(mx,Math.round(Math.sin(i*2.7)*40))),jy=Math.max(-my,Math.min(my,Math.round(Math.cos(i*1.9)*40)));return{n,left:Math.round(c*_cellW+(_cellW-w)/2+jx),top:Math.round(r*_cellH+(_cellH-h)/2+jy),w,h};});
const DCW=DCOLS*_cellW,DCH=Math.ceil(dragImgs.length/DCOLS)*_cellH;
const dragTile=(ox,oy)=>_basePics.map(p=>`<figure class="drag-pic" style="left:${p.left+ox}px;top:${p.top+oy}px;width:${p.w}px;height:${p.h}px" data-full="${IMG}${p.n}.jpg"><img src="${IMG}c_${p.n}.jpg" alt="Aura Films photograph" loading="lazy" draggable="false"></figure>`).join('');
let dragBoard='';for(let ty=0;ty<3;ty++){for(let tx=0;tx<3;tx++){dragBoard+=dragTile(tx*DCW,ty*DCH);}}
const home=head('Aura Films, Wedding & Editorial Photography','Aura Films is a Kingston-based photography studio capturing weddings, portraits, maternity and architecture with a cinematic, editorial eye.')+nav('Home')+`
<header class="ihero" id="top">
<div class="ihero-clusters" aria-hidden="true">${heroCluster('c-aura',auraSet)}${heroCluster('c-films',filmsSet)}</div>
<div class="ihero-center"><h1 class="ihero-word"><span class="hw" data-set="aura">Aura</span> <span class="hw" data-set="films">Films</span></h1>
<p class="ihero-hint">Kingston, Ontario · Canada</p></div>
</header>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${Array(4).fill('<span class="marquee-item">Weddings</span><span class="marquee-item">Portraits</span><span class="marquee-item">Family &amp; Maternity</span><span class="marquee-item">Baby Showers</span><span class="marquee-item">Architecture</span><span class="marquee-item">Editorial</span>').join('')}</div></div>

<section class="section intro-sec"><div class="container"><div class="intro-grid">
<div class="reveal"><h2 class="serif intro-h">Photography that remembers the day the way it <em>felt</em>.</h2></div>
<div class="reveal d1 intro-copy"><p>We're Aura Films, a photography studio based in <b style="color:var(--text);font-weight:600">Kingston, Ontario, Canada</b>. Weddings, portraits, maternity and the occasional building we fall for, shot the way it actually happened and hand-edited frame by frame.</p><p>No stiff poses, no conveyor-belt presets. Just the real moments, handed back to you as a gallery worth opening again and again.</p><a href="about.html" class="btn btn-line">Our story ${arrow}</a></div>
</div></div></section>

<section class="section"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">What we <em>love</em> to capture.</h2></div>
<div class="cat-list">
${[['wed-1.jpg','Weddings','weddings','01','The full day, honestly told, from the quiet first look to the last dance.'],['por-8.jpg','Portraits','portraits','02','Editorial portraits that catch the real you in one quiet frame.'],['baby-1.jpg','Family &amp; Maternity','family','03','Tender, in-between moments kept close as your family grows.'],['arch-1.jpg','Architecture','architecture','04','Homes and spaces, shot with light, line and a sense of place.']].map(([f,c,cat,n,d],i)=>`<a href="gallery.html#${cat}" class="cat-row reveal${i%2?' alt':''}"><div class="cat-row-img"><img src="${IMG}${f}" alt="${c} by Aura Films" loading="lazy"></div><div class="cat-row-meta"><span class="cat-row-num">${n}</span><h3 class="serif">${c}</h3><p>${d}</p><span class="cat-row-link">View gallery ${arrow}</span></div></a>`).join('')}
</div></div></section>

<section class="dragsec" id="explore" aria-label="Drag to explore our work">
<div class="drag-stage" id="dragStage" data-cw="${DCW}" data-ch="${DCH}"><div class="drag-board" id="dragBoard">${dragBoard}</div><div class="drag-pill" id="dragPill">Drag to explore</div></div>
</section>
<div class="drag-lb" id="dragLb" aria-hidden="true"><button class="drag-lb-close" id="dragLbClose" aria-label="Close">&times;</button><img id="dragLbImg" src="" alt="Aura Films photograph"></div>

<section class="section"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">How it <em>works</em>.</h2></div>
<div class="steps">
${[['Reach out','Tell us your date, your place and the feeling you want to keep.'],['The shoot','A relaxed session with real direction and zero awkwardness.'],['Your gallery','Hand-graded images delivered in 10 to 21 days, ready to relive.']].map((s,i)=>`<div class="step reveal d${i+1}"><span class="step-num">0${i+1}</span><h4 class="serif">${s[0]}</h4><p>${s[1]}</p></div>`).join('')}
</div></div></section>

<section class="section testi"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">Trusted with the <em>biggest</em> days.</h2></div>
${carousel}
</div></section>

<section class="cta" id="craft"><div class="cta-bg" style="opacity:.6"><img src="${IMG}albin-new.jpg" alt="Albin, Aura Films" style="object-position:50% 24%"></div><div class="cta-mesh"></div>
<div class="cta-inner">
<h2 class="serif reveal d1" style="margin-top:18px">Crafting <span class="rot word">${[['Memories','#D8B888'],['Experiences','#C58F6A'],['Stories','#B7C4D8'],['Moments','#D8B888'],['Commitment','#C7A8C9'],['Elegance','#E0C98A'],['Promises','#A9C2A0']].map(([w,c],i)=>`<span class="w${i===0?' on':''}" style="color:${c}">${w}.</span>`).join('')}</span></h2>
<p class="reveal d2">Dates book months ahead. Send us the where and the when, and we'll craft a package around your story.</p>
<div class="reveal d3"><a href="#contact" class="btn btn-gold">Contact Us ${arrow}</a></div></div></section>

<section class="section testi" id="contact"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">Let's <em>connect</em>.</h2><p class="lead reveal d1">Tell us about your day and we'll be in touch within 24 to 48 hours, or email us directly at <a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold)">itsaurafilms@gmail.com</a>.</p></div>
<div class="reveal d1">${contactForm}</div>
</div></section>
`+foot(lightbox);

/* ════════ GALLERY (hardcoded, deduped) ════════ */
const GAL={
 weddings:['wed-1.jpg','wed-2.jpg','wed-3.jpg','wed-4.jpg','wed-5.jpg','wed-6.jpg','wed-7.jpg','wed-8.jpg','wed-9.jpg','wed-10.jpg','wed-11.jpg','wed-12.jpg','wed-13.jpg','_DSC8307.jpg','IMG_9548.JPG.jpeg','_DSC8637.jpg','_DSC8672.jpg','_DSC8231.jpg','_DSC8243.jpg','IMG_9356.JPG.jpeg','_DSC8034.jpg','_DSC8577.jpg','_DSC8016.jpg','_DSC8021.jpg','_DSC8238.jpg','_DSC8239.jpg','_DSC8241.jpg','IMG_9115.jpg','IMG_8926.JPG.jpeg','_DSC7542.jpg','_DSC7545.jpg'],
 portraits:['por-1.jpg','por-2.jpg','por-3.jpg','por-4.jpg','por-5.jpg','por-6.jpg','por-7.jpg','por-8.jpg','por-9.jpg','por-10.jpg','por-11.jpg','por-12.jpg','por-13.jpg','por-14.jpg','IMG_3431.JPG.jpeg','IMG_3432.JPG.jpeg','IMG_3437.JPG.jpeg','IMG_3438.JPG.jpeg','IMG_7777.JPG.jpeg','IMG_9906.JPG.jpeg','IMG_9907.JPG.jpeg','_DSC8015.jpg','_DSC8049.jpg','_DSC8215.jpg'],
 family:['baby-1.jpg','baby-2.jpg','baby-3.jpg','baby-4.jpg','baby-5.jpg','baby-6.jpg','baby-7.jpg','baby-8.jpg','baby-9.jpg','baby-10.jpg','baby-11.jpg','baby-12.jpg','baby-13.jpg','baby-14.jpg','baby-15.jpg','baby-16.jpg','baby-17.jpg','baby-18.jpg','baby-19.jpg','_DSC7794.jpeg','_DSC7798.jpeg','_DSC7883.jpeg','_DSC1248.jpg','_DSC1267.jpg','_DSC1347.jpg','_DSC1351.jpg','_DSC1352.jpg','_DSC1487.jpg','_DSC1500.jpg','_DSC1534.jpg','IMG_8816.JPG.jpeg','IMG_8829.JPG.jpeg'],
 architecture:['arch-1.jpg','arch-2.jpg','arch-3.jpg','arch-4.jpg','arch-5.jpg','arch-6.jpg','arch-7.jpg','arch-8.jpg','arch-9.jpg'],
};
const LABELS={weddings:'Weddings',portraits:'Portraits',family:'Family & Maternity',architecture:'Architecture'};
function buildGallery(){
  let tiles='',seen=new Set();
  for(const cat of Object.keys(GAL)) for(const f of GAL[cat]){ if(seen.has(f))continue; seen.add(f);
    tiles+=`<div class="gitem" data-cat="${cat}" data-full="${IMG}${f}"><img src="${IMG}${f}" alt="${LABELS[cat]} by Aura Films" loading="lazy"><span class="cat">${LABELS[cat]}</span></div>\n`; }
  return head('Gallery, Aura Films','Browse the full Aura Films gallery of weddings, portraits, maternity and architecture sessions.')+nav('Gallery')+`
<header class="phero"><div class="bg-fixed" style="background-image:url('${IMG}baby-10.jpg');background-position:50% 42%"></div><div class="phero-veil"></div>
<div class="phero-inner"><h1 class="serif">The <em>Gallery</em></h1><p>Real days, honestly told. Filter by what you're looking for, and tap any frame to view it large.</p></div></header>
<section class="section"><div class="container">
<div class="filters">${[['all','All'],['weddings','Weddings'],['portraits','Portraits'],['family','Family & Maternity'],['architecture','Architecture']].map(([c,l],i)=>`<button class="filter${i===0?' on':''}" data-cat="${c}">${l}</button>`).join('')}</div>
<div class="gal-grid">${tiles}</div></div></section>`+foot(lightbox);
}

/* ════════ ABOUT ════════ */
const faqItems=[
 ['How do we book a date?','Reach out through the contact form or email with your date and location. We hold dates with a signed agreement and a deposit, on a first-come basis.'],
 ['How much is the deposit?','A 30% non-refundable retainer secures your booking. The remaining balance is due on or before the day of the session.'],
 ['What is the turnaround time?','Sessions are delivered in 10 to 21 business days depending on the package. Weddings include a sneak-peek set within the first week.'],
 ['Do you travel?','Yes. Travel within 20km is included; beyond that a small travel fee applies. We shoot across Kingston and Ontario.'],
 ['Do we get the raw files?','Galleries are delivered as hand-graded, high-resolution images. Unedited raw files are available as a paid add-on on request.'],
 ['What if we need to reschedule?','Rescheduling is accommodated once with reasonable notice. Weather-related outdoor reschedules are always at no extra charge.'],
];
const faq=`<div class="faq">${faqItems.map(([q,a])=>`<div class="faq-item"><button class="faq-q">${q}<span class="pl"></span></button><div class="faq-a"><p>${a}</p></div></div>`).join('')}</div>`;

const about=head('About Us, Aura Films','Meet Albin, the photographer behind Aura Films, a Kingston photography studio.')+nav('About Us')+`
<header class="phero phero-albin"><div class="bg-fixed" style="background-image:url('${IMG}albin-new.jpg');background-position:50% 18%"></div><div class="phero-veil"></div>
<div class="phero-inner"><h1 class="serif">Behind the <em>Lens</em></h1><p>One photographer, one obsession: the honest, unrepeatable moments that make a day yours.</p></div></header>

<section class="section"><div class="container philo philo-center">
<div><h2 class="philo-statement serif reveal">We don't pose moments. We <em>wait</em> for them, then make them timeless.</h2>
<p class="philo-body reveal d1">I started Aura Films with a camera and a stubborn belief that honest craft makes memories you'll actually want to relive. From weddings to maternity, portraits to the odd building, I shoot and hand-grade every single frame myself, so your gallery feels like a keepsake, not a feed.</p></div>
</div></section>

<section class="section" style="padding-top:0"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">The person <em>behind</em> it.</h2></div>
<div class="founder-solo reveal">
<div class="founder-solo-img"><img src="${IMG}albin-new.jpg" alt="Albin, photographer at Aura Films" style="object-position:50% 20%"></div>
<div class="founder-solo-txt"><h3 class="serif nm">Albin</h3><div class="rl">Founder &amp; Photographer</div>
<p class="founder-bio">My name is Albin, and I'm the photographer behind Aura Films. I shoot with a quiet, observant eye, patient to a fault, waiting for the glance before the vow and the laugh between the poses, because that's where the real photo lives.</p>
<p class="founder-bio">My work is grounded, warm and unmistakably cinematic; the kind that makes people feel seen rather than posed. Every frame is shot and hand-graded by me, so nothing about your day is forgotten.</p></div>
</div>
</div></section>

<section class="section" style="padding-top:0"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">See the <em>work</em>.</h2><a href="gallery.html" class="btn btn-line reveal d1">View Full Gallery ${arrow}</a></div>
<div class="cat-cards cards-2">
<a href="gallery.html#weddings" class="ccard reveal" style="aspect-ratio:16/10"><img src="${IMG}wed-3.jpg" alt="Weddings"><div class="ccard-cap"><div class="c1">Most booked</div><div class="c2 serif">Weddings</div></div></a>
<a href="gallery.html#family" class="ccard reveal d1" style="aspect-ratio:16/10"><img src="${IMG}baby-2.jpg" alt="Family and Maternity"><div class="ccard-cap"><div class="c1">Most loved</div><div class="c2 serif">Family &amp; Maternity</div></div></a>
</div></div></section>

<section class="section"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">FAQs</h2></div>${faq}
</div></section>

<section class="section testi" id="contact"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">Let's <em>connect</em>.</h2><p class="lead reveal d1">Use this form to get in touch, or email us directly at <a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold)">itsaurafilms@gmail.com</a>. We reply within 24 to 48 hours.</p></div>
<div class="reveal d1">${CALENDLY?`<div class="calendly-inline-widget" data-url="${CALENDLY}" style="min-width:320px;height:660px;margin-bottom:28px"></div>`:''}${contactForm}</div>
</div></section>`+foot();

/* ════════ INVESTMENT ════════ */
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
 ['Mini','Quick Shoot',79,'30 min',['Up to 30 minutes','10 edited photos','One look','Online gallery'],false],
 ['Standard','Portrait Hour',149,'1 hour',['Up to 1 hour','22 edited photos','Two looks','Gallery + retouching'],true],
 ['Premium','Full Session',229,'session',['Up to 2 hours','45 edited photos','Multiple looks / locations','Editorial retouching'],false]],
};
const pkImgs={
 Weddings:['wed-1.jpg','wed-4.jpg','wed-5.jpg','wed-8.jpg'],
 Events:['wed-6.jpg','baby-6.jpg','por-9.jpg','por-10.jpg'],
 Family:['baby-1.jpg','baby-8.jpg','baby-9.jpg','baby-10.jpg'],
 Portraits:['por-2.jpg','por-3.jpg','por-6.jpg','por-8.jpg'],
};
const pkRow=([tag,name,price,add,feats,feat])=>`<div class="pk-row"><div><div class="pk-row-name">${name}${feat?'<span class="tag">Most Popular</span>':''}</div><div class="pk-row-desc">${feats.slice(0,2).join(' · ')}</div></div><div class="pk-row-price"><span>$</span>${price}</div></div>`;
const pkPanel=(k,arr,i)=>`<div class="pk-panel${i===0?' on':''}" data-panel="${k}"><div class="pk-editorial">
<div class="pk-list">${arr.map(pkRow).join('')}<div style="margin-top:28px"><a href="about.html#contact" class="btn btn-dark">Book ${k.toLowerCase()} ${arrow}</a></div></div>
<div class="pk-grid">${(pkImgs[k]||[]).map(f=>`<img src="${IMG}${f}" alt="${k} by Aura Films" loading="lazy">`).join('')}</div>
</div></div>`;
const addons=[['Second location / travel','$50-100'],['Printed photo set (20)','$60'],['Extra edited images (10)','$50'],['Raw / unedited files','$80'],['Album &amp; prints','Custom'],['Rush delivery','$120']];

const investment=head('Investment, Aura Films','Transparent photography packages from Aura Films. Weddings, events, family and portrait sessions.')+nav('Investment')+`
<header class="phero"><div class="bg-fixed" style="background-image:url('${IMG}invest-hero.jpg');background-position:50% 38%"></div><div class="phero-veil"></div>
<div class="phero-inner"><h1 class="serif">The <em>Investment</em></h1><p>Real value, real moments. Every package is crafted to deliver exceptional quality, from intimate portraits to full-day wedding coverage.</p></div></header>

<section class="section"><div class="container two-col">
<div class="reveal">
<ul class="chips">
<li class="chip">${tick}<span><b>An assistant on bigger shoots.</b> A second pair of hands for weddings and events, so no moment is missed.</span></li>
<li class="chip">${tick}<span><b>Hand-graded galleries.</b> Every frame is edited by us, never batch-filtered.</span></li>
<li class="chip">${tick}<span><b>Fast, reliable delivery.</b> Sneak peeks within a week, full galleries in 10 to 21 days.</span></li>
<li class="chip">${tick}<span><b>Honest, transparent pricing.</b> Prices in CAD, valid 30 days, 30% retainer to book.</span></li>
</ul></div>
<div class="reveal d1">
<p class="lead" style="max-width:none">Based in <b style="color:var(--ink)">Kingston, Ontario</b> and available across Kingston and Ontario. Travel within 20km is included in every package; beyond that a small travel fee applies.</p>
<div class="addons">${addons.map(([n,p])=>`<div class="addon"><span>${n}</span><b>${p}</b></div>`).join('')}</div></div>
</div></section>

<section class="section" style="padding-top:0"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">The <em>investment</em>.</h2></div>
<div class="pk-tabs reveal">${Object.keys(PKG).map((k,i)=>`<button class="pk-tab${i===0?' on':''}" data-tab="${k}">${k}</button>`).join('')}</div>
<div class="pk-stack reveal">${Object.entries(PKG).map(([k,arr],i)=>pkPanel(k,arr,i)).join('')}</div>
<p class="lead reveal" style="max-width:none;margin-top:34px;font-size:16px;line-height:1.7;color:var(--text)"><strong style="color:var(--ink)">Good to know:</strong> Prices are in Canadian dollars (CAD) and valid for 30 days from inquiry. A 30% non-refundable retainer confirms your booking. Travel within 20&nbsp;km is included; beyond that a small fee applies.</p>
</div></section>

<section class="section testi"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">The <em>experience</em>.</h2></div>
<div class="cat-cards">
${[['Consult','We learn your vision, vibe and must-have moments.'],['Plan','Locations, timeline and shot list, locked in together.'],['Shoot','A relaxed day, real direction, zero awkwardness.'],['Deliver','A hand-graded gallery, ready to relive.']].map(([t,d],i)=>`<div class="reveal d${i+1}" style="background:var(--card);border:1px solid var(--line);border-radius:8px;padding:30px 26px"><div class="serif" style="font-size:46px;font-weight:300;color:var(--gold);line-height:1">0${i+1}</div><div class="serif" style="font-size:22px;margin:10px 0 8px">${t}</div><p style="color:var(--muted);font-size:14px;line-height:1.7">${d}</p></div>`).join('')}
</div></div></section>

<section class="section"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">FAQs</h2></div>${faq}
</div></section>

<section class="section testi" id="contact"><div class="container">
<div class="sec-head"><h2 class="sec-title serif reveal">Let's <em>connect</em>.</h2><p class="lead reveal d1">Use this form to get in touch, or email us directly at <a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold)">itsaurafilms@gmail.com</a>. We reply within 24 to 48 hours.</p></div>
<div class="reveal d1">${CALENDLY?`<div class="calendly-inline-widget" data-url="${CALENDLY}" style="min-width:320px;height:660px;margin-bottom:28px"></div>`:''}${contactForm}</div></div></section>`+foot();

/* ════════ LEGAL ════════ */
const legalShell=(title,body)=>head(title+', Aura Films','Aura Films '+title.toLowerCase()+'.')+nav('')+`<main class="legal"><div class="container" style="max-width:860px"><h1 class="serif">${title}</h1><p class="updated">Last updated · September 2026</p>${body}</div></main>`+foot();
const privacy=legalShell('Privacy Policy',`
<p>Aura Films ("we", "us", "our") respects your privacy. This policy explains what personal information we collect, how we use it, and your rights under Canada's <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and applicable Ontario law. By using our website or booking our services, you consent to the practices described here.</p>
<h2>1. Information We Collect</h2><ul>
<li><strong>Contact details</strong> you provide: name, email, phone, event date and location.</li>
<li><strong>Booking information:</strong> package choice, preferences, and correspondence.</li>
<li><strong>Images</strong> captured during your session.</li>
<li><strong>Website data:</strong> basic analytics such as pages visited and device type.</li></ul>
<h2>2. How We Use Your Information</h2><p>To respond to enquiries, prepare quotes and contracts, deliver your session and gallery, process payments, and improve our services. We do not sell your personal information.</p>
<h2>3. Consent</h2><p>We collect and use your information with your consent, which you may withdraw at any time by contacting us (subject to existing contractual obligations).</p>
<h2>4. Disclosure to Third Parties</h2><p>We share information only with trusted service providers needed to deliver our work, such as our online gallery host, cloud storage and form provider. These providers are bound to protect your data and use it only for the agreed purpose. We may disclose information where required by law.</p>
<h2>5. Image &amp; Portfolio Use</h2><p>Unless you request otherwise in writing, Aura Films may use selected images from your session for portfolio, website and social media. You can opt out of portfolio use at any time by emailing us.</p>
<h2>6. Storage &amp; Retention</h2><p>Your gallery and files are stored securely and retained for a limited period after delivery (typically 12 months) unless a longer archive is agreed. We retain booking records as required for tax and legal purposes.</p>
<h2>7. Cookies &amp; Analytics</h2><p>Our site may use minimal cookies and privacy-respecting analytics to understand traffic. You can disable cookies in your browser.</p>
<h2>8. Your Rights</h2><p>You have the right to access the personal information we hold about you, request corrections, and ask that it be deleted where we are not legally required to keep it. Email <a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold)">itsaurafilms@gmail.com</a> to make a request.</p>
<h2>9. Children</h2><p>Sessions involving minors are booked and consented to by a parent or guardian.</p>
<h2>10. Changes</h2><p>We may update this policy from time to time. The "last updated" date reflects the current version.</p>
<h2>11. Contact</h2><p>Questions? Reach us at <a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold)">itsaurafilms@gmail.com</a> or 343 989 4546, Kingston, Ontario.</p>`);
const terms=legalShell('Terms & Conditions',`
<p>These Terms govern photography services provided by Aura Films in Ontario, Canada. By paying a retainer or signing a booking agreement, you ("the Client") agree to these Terms.</p>
<h2>1. Booking &amp; Retainer</h2><p>A <strong>30% non-refundable retainer</strong> and a signed agreement are required to reserve your date. Dates are held on a first-come basis and are not guaranteed until both are received.</p>
<h2>2. Payment</h2><p>The remaining balance is due on or before the day of the session unless otherwise agreed in writing. Prices are quoted in Canadian dollars (CAD) and are valid for 30 days from the date of quotation.</p>
<h2>3. Cancellation &amp; Rescheduling</h2><p>The retainer is non-refundable on cancellation. Rescheduling is permitted once with reasonable notice, subject to availability. Weather-related rescheduling for outdoor sessions is accommodated at no additional charge.</p>
<h2>4. Copyright &amp; Licence</h2><p>Aura Films retains <strong>copyright in all images</strong> under the Canadian <em>Copyright Act</em>. Upon final payment, the Client is granted a personal, non-exclusive licence to use delivered images for personal, non-commercial purposes (printing and sharing). Commercial use, resale, or licensing to third parties requires our written permission.</p>
<h2>5. Image Release</h2><p>Unless the Client opts out in writing, Aura Films may use selected images for portfolio, marketing and social media. Where minors appear, a parent or guardian consents on their behalf.</p>
<h2>6. Deliverables &amp; Turnaround</h2><p>Edited galleries are delivered within the timeframe stated for your package (typically 10 to 21 business days). Aura Films delivers hand-graded, high-resolution images; unedited raw files are not included unless purchased as an add-on. The number of edited images stated per package is what is delivered; selection is at our professional discretion.</p>
<h2>7. Client Conduct &amp; Safety</h2><p>The Client agrees to provide a safe working environment. We reserve the right to end a session where the safety of our team or equipment is at risk, without refund.</p>
<h2>8. Force Majeure</h2><p>Aura Films is not liable for failure to perform due to events beyond our reasonable control (illness, extreme weather, equipment failure, emergencies). In such cases we will make reasonable efforts to reschedule or arrange a suitable substitute.</p>
<h2>9. Limitation of Liability</h2><p>In the unlikely event of loss or inability to deliver due to circumstances beyond our control, our total liability is limited to a refund of fees paid for the affected service. We are not liable for indirect or consequential losses.</p>
<h2>10. Privacy</h2><p>Personal information is handled in accordance with our <a href="privacy.html" style="color:var(--gold)">Privacy Policy</a> and PIPEDA.</p>
<h2>11. Governing Law</h2><p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein.</p>
<h2>12. Contact</h2><p><a href="mailto:itsaurafilms@gmail.com" style="color:var(--gold)">itsaurafilms@gmail.com</a> · 343 989 4546 · Kingston, Ontario.</p>`);

await writeFile('../index.html',finalize(home));
await writeFile('../gallery.html',finalize(buildGallery()));
await writeFile('../about.html',finalize(about));
await writeFile('../investment.html',finalize(investment));
await writeFile('../privacy.html',finalize(privacy));
await writeFile('../terms.html',finalize(terms));
console.log('✓ generated 6 pages');
