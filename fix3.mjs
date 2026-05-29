import { readFile, writeFile } from 'fs/promises';
const ALL = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html','cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','cat-events.html'];

// ════════ GLOBAL OVERRIDE V3 (all pages) ════════
const V3 = `
    /* ════════ OVERRIDE V3 ════════ */
    /* Nav: pleasing font (not mono), bold */
    .nav-links a { font-family:'Satoshi',sans-serif !important; font-weight:700 !important; text-transform:none !important; letter-spacing:0.01em !important; font-size:15px !important; }
    /* Numbers everywhere → Pinyon script */
    .work-num,.p-num,.pkg-price-num,.pkg-price-cur,.stat-num,.term-num,.disc-amount,.cat-count { font-family:'Pinyon Script',cursive !important; }
    .p-num{font-size:clamp(56px,5vw,84px) !important;}
    .term-num{font-size:clamp(34px,3vw,46px) !important;}
    /* Footer bold: tagline, address, links */
    .footer-tagline{font-weight:700 !important;}
    .footer-contact-item,.footer-contact-item a{font-weight:700 !important;}
    .footer-col-links a{font-weight:700 !important;}
    .footer-col-head{font-weight:800 !important;}
    /* Subtitles bold (all pages) */
    .section-sub,.pkg-section-sub,.port-hero-sub,.about-intro,.hero-sub,.inv-hero-sub,
    .cat-page-note,.bio-sub,.hero-eyebrow,.about-eyebrow,.port-hero-eyebrow,.cat-page-eyebrow,
    .pkg-tier,.inv-hero-eyebrow,.cta-band-sub,.cta-sub{font-weight:700 !important;}
`;
for (const f of ALL) {
  let h = await readFile(f,'utf8').catch(()=>null); if(!h) continue;
  if(!h.includes('OVERRIDE V3')){
    const i=h.lastIndexOf('</style>'); h=h.slice(0,i)+V3+'\n  '+h.slice(i);
  }
  await writeFile(f,h,'utf8');
}
console.log('✓ global V3: nav font, numbers script, footer bold, subtitles bold');

// ════════ INDEX ════════
let idx = await readFile('index.html','utf8');
// section-fancy → Pinyon script (Our Services/Works/Testimonials)
idx = idx.replace(/\.section-fancy \{[^}]*\}/, ".section-fancy { font-family:'Pinyon Script',cursive !important; font-style:normal !important; font-weight:400 !important; letter-spacing:0.01em !important; }");
// CTA headline → script
idx = idx.replace('<h2 class="cta-headline">Every Frame Tells a Story;<br>Let Us Tell Yours.</h2>',
  '<h2 class="cta-headline cta-script">Every Frame tells a story;<br>Let us say yours.</h2>');
// testimonial quotes OFF script → Satoshi sans
idx = idx.replace(/\.signature,\.cursive,\.t-quote,\.sig-name \{ font-family: 'Pinyon Script', cursive; \}/,
  ".signature,.cursive,.sig-name { font-family: 'Pinyon Script', cursive; }");
// hero tagline + services label → Satoshi (pleasing, not mono)
const IDX3 = `
    /* ════════ INDEX V3 ════════ */
    .cta-script{font-family:'Pinyon Script',cursive !important;font-weight:400 !important;font-style:normal !important;line-height:1.25 !important;}
    .section-fancy{font-size:clamp(46px,5vw,84px) !important;}
    /* testimonial quotes: clean sans, readable */
    .t-quote{font-family:'Satoshi',sans-serif !important;font-style:italic !important;font-weight:500 !important;font-size:clamp(18px,1.5vw,22px) !important;line-height:1.6 !important;color:var(--text) !important;}
    /* hero tagline pleasing */
    .hero-tagline{font-family:'Satoshi',sans-serif !important;font-weight:700 !important;letter-spacing:0.18em !important;}
    /* services label pleasing */
    .service-label{font-family:'Satoshi',sans-serif !important;font-weight:700 !important;text-transform:none !important;letter-spacing:0 !important;}
    /* HERO LOGO +400px bigger, tagline close all screens */
    .hero-logo-img{height:min(80vh, clamp(460px,72vw,1280px)) !important;max-width:96% !important;margin:0 auto 4px !important;}
    .hero{min-height:100vh !important;}
    .hero-inner{gap:0 !important;justify-content:center !important;}
    @media(max-width:768px){
      .hero-logo-img{height:min(62vh, clamp(300px,82vw,620px)) !important;}
      .hero{min-height:90vh !important;}
      .section-fancy{font-size:clamp(40px,11vw,60px) !important;}
    }
`;
let i=idx.lastIndexOf('</style>'); idx=idx.slice(0,i)+IDX3+'\n  '+idx.slice(i);
await writeFile('index.html', idx, 'utf8');
console.log('✓ index: scripts, testimonial sans, hero logo+400, tagline/nav/services font');

// ════════ ABOUT ════════
let a = await readFile('about.html','utf8');
// Frame → orange in about title
a = a.replace('<h1 class="about-title">WE FIND<br>THE FRAME<br>THAT STAYS.</h1>',
  '<h1 class="about-title">WE FIND<br>THE <span style="color:var(--orange);">FRAME</span><br>THAT STAYS.</h1>');
// Afsal: remove image, show AS initials box
a = a.replace('<div class="team-photo"><img src="images/IMG_9906.JPG.jpeg" alt="Afsal Lead Videographer"></div>',
  '<div class="team-photo team-initials"><span>AS</span></div>');
const AB3 = `
    /* ════════ ABOUT V3 ════════ */
    .team-initials{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#140F2D,#3F88C5);}
    .team-initials span{font-family:'Cabinet Grotesk',sans-serif;font-weight:800;font-size:clamp(60px,7vw,110px);color:#fff;letter-spacing:0.04em;}
`;
i=a.lastIndexOf('</style>'); a=a.slice(0,i)+AB3+'\n  '+a.slice(i);
await writeFile('about.html', a, 'utf8');
console.log('✓ about: Frame orange, Afsal AS initials');

// ════════ INVESTMENT ════════
let inv = await readFile('investment.html','utf8');
// Moments capital M
inv = inv.replace('<span class="inv-hero-accent">moments</span>', '<span class="inv-hero-accent">Moments</span>');
// Terms heading bold (already 700 → 800)
inv = inv.replace(/(<h2 style="font-family:'Cabinet Grotesk',sans-serif;font-weight:)700(;[^"]*">Terms &amp; Conditions<\/h2>)/, '$1800$2');
// CTA band: remove subtitle, keep title + button
inv = inv.replace(/<p class="cta-band-sub">[^<]*<\/p>\s*/, '');
await writeFile('investment.html', inv, 'utf8');
console.log('✓ investment: Moments cap, Terms bold, CTA subtitle removed');

// ════════ CONTACT ════════
let c = await readFile('contact.html','utf8');
// Remove the entire aura films info column
c = c.replace(/<div class="contact-info-col"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*(?=\n\s*<footer)/, '</div>\n');
// Fallback: remove info-col block ending before footer
c = c.replace(/<!-- CONTACT INFO -->[\s\S]*?<\/div>\s*<\/div>/, '</div>');
// Make form single column full width
c = c.replace('<div class="contact-body" style="display:grid;grid-template-columns:3fr 2fr;min-height:60vh;">',
  '<div class="contact-body" style="display:block;min-height:auto;">');
const C3=`
    /* ════════ CONTACT V3 ════════ */
    .contact-body{display:block !important;}
    .contact-form-col{border-right:none !important;max-width:760px;margin:0 auto;padding:56px 36px 64px !important;width:100%;}
    .contact-form-col form{width:100%;}
    .form-input{width:100% !important;padding:16px 18px !important;font-size:16px !important;}
    @media(max-width:768px){.contact-form-col{padding:36px 20px 48px !important;}}
`;
i=c.lastIndexOf('</style>'); c=c.slice(0,i)+C3+'\n  '+c.slice(i);
await writeFile('contact.html', c, 'utf8');
console.log('✓ contact: aura box removed, form widened/centered');
