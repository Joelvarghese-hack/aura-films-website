import { readFile, writeFile } from 'fs/promises';
const ALL = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html','cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','cat-events.html'];

// ════════ GLOBAL (all pages) ════════
for (const f of ALL) {
  let h = await readFile(f,'utf8').catch(()=>null); if(!h) continue;

  // 1. FIX STICKY NAV: overflow-x:hidden breaks sticky → use clip
  h = h.replace(/overflow-x:\s*hidden/g, 'overflow-x: clip');

  // 2. Footer logo → link to home (wrap once)
  h = h.replace(/<img src="images\/aura-logo-white\.png" class="footer-logo"([^>]*)>/g,
    '<a href="index.html" aria-label="Aura Films home"><img src="images/aura-logo-white.png" class="footer-logo"$1></a>');
  h = h.replace(/<img src="logo-black\.png" class="footer-logo footer-logo-light"([^>]*)>/g,
    '<a href="index.html" aria-label="Aura Films home"><img src="logo-black.png" class="footer-logo footer-logo-light"$1></a>');

  // 3. Append final FOOTER + GLOBAL polish override (wins over everything)
  if (!h.includes('FOOTER-POLISH-V2')) {
    const POLISH = `
    /* ════════ FOOTER-POLISH-V2 + GLOBAL ════════ */
    :root { --bg:#FAFAF7 !important; --surface:#F1EEE7 !important; --card:#EBE6DC !important; }
    body { background:#FAFAF7; }
    /* Footer: bigger, better fonts, no italic */
    .footer { background:var(--navy) !important; padding-top:64px !important; }
    .footer-col-head { font-family:'Cabinet Grotesk',sans-serif !important; font-style:normal !important;
      font-size:15px !important; font-weight:700 !important; letter-spacing:0.04em !important;
      text-transform:none !important; color:#fff !important; margin-bottom:18px !important; }
    .footer-col-links a { font-family:'Satoshi',sans-serif !important; font-style:normal !important;
      font-size:15px !important; color:rgba(255,255,255,0.72) !important; }
    .footer-col-links a:hover { color:var(--orange) !important; }
    .footer-tagline { font-family:'Satoshi',sans-serif !important; font-style:normal !important; font-size:14px !important; color:rgba(255,255,255,0.7) !important; }
    .footer-contact-item, .footer-contact-item a { font-family:'Satoshi',sans-serif !important; font-size:14px !important; color:rgba(255,255,255,0.62) !important; }
    .footer-bottom-left, .footer-bottom-right a { font-family:'Satoshi',sans-serif !important; font-style:normal !important; font-size:12px !important; color:rgba(255,255,255,0.5) !important; }
    .footer-bottom-left a { color:var(--orange-soft) !important; }
    .footer-search-input { font-family:'Satoshi',sans-serif !important; font-size:14px !important; }
    /* Bigger Instagram icon everywhere */
    .footer-social-icon { width:42px !important; height:42px !important; }
    .footer-social-icon svg { width:22px !important; height:22px !important; }
    .contact-ig-link svg { width:26px !important; height:26px !important; }
    /* Sticky nav guaranteed */
    html { overflow-x: clip; }
    body { overflow-x: clip; }
    .site-nav { position: sticky !important; top: 0 !important; z-index: 500 !important; }
`;
    const i = h.lastIndexOf('</style>');
    h = h.slice(0,i) + POLISH + '\n  ' + h.slice(i);
  }
  await writeFile(f,h,'utf8');
}
console.log('✓ global: sticky-fix, footer logo link, footer polish, bg color, IG icon');

// ════════ INDEX ════════
let idx = await readFile('index.html','utf8');
idx = idx.replace('<h2 class="section-title">Services I Offer</h2>', '<h2 class="section-title section-fancy">Our Services</h2>');
idx = idx.replace('<h2 class="works-section-title">My Works</h2>', '<h2 class="works-section-title section-fancy">Our Works</h2>');
idx = idx.replace('<h2 class="section-title">Don’t Trust Me, Trust Them</h2>', '<h2 class="section-title section-fancy">Our Testimonials</h2>');
idx = idx.replace("<h2 class=\"section-title\">Don't Trust Me, Trust Them</h2>", '<h2 class="section-title section-fancy">Our Testimonials</h2>');
// Hero logo +200px, tagline close + visible
idx = idx.replace(
  /<img src="images\/aura-logo-white\.png" class="hero-logo-img"[^>]*>/,
  '<img src="images/aura-logo-white.png" class="hero-logo-img" alt="Aura Films" style="display:block;margin:0 auto 6px;filter:drop-shadow(0 4px 24px rgba(0,0,0,0.4));">'
);
idx = idx.replace(
  /<p class="hero-tagline"[^>]*>Shooting moments\. Preserving memories\.<\/p>/,
  '<p class="hero-tagline">Shooting moments. Preserving memories.</p>'
);
// Append index-specific override
const IDX_CSS = `
    /* ════════ HOME FIXES V2 ════════ */
    .section-fancy { font-family:'Cabinet Grotesk',sans-serif !important; font-style:italic !important; font-weight:800 !important; }
    /* Hero logo bigger (+200px) + tagline tight */
    .hero-logo-img { height:clamp(360px,60vw,900px) !important; width:auto !important; max-width:94% !important; opacity:0.85 !important; }
    .hero-inner { position:absolute !important; inset:0 !important; display:flex !important; flex-direction:column !important;
      align-items:center !important; justify-content:center !important; gap:2px !important; padding:0 16px !important; overflow:visible !important; }
    .hero-tagline { display:block !important; font-family:'Geist Mono',monospace !important; font-size:clamp(12px,1.5vw,17px) !important;
      letter-spacing:0.26em !important; text-transform:uppercase !important; color:rgba(255,255,255,0.88) !important;
      margin:0 !important; text-align:center !important; }
    /* Category numbers → script, bigger */
    .work-num { font-family:'Pinyon Script',cursive !important; font-size:clamp(80px,8vw,140px) !important; color:var(--orange) !important; font-weight:400 !important; }
    /* Category description bigger */
    .work-desc { font-size:18px !important; line-height:1.7 !important; max-width:440px !important; }
    /* View Portfolio button bigger */
    .work-link { padding:16px 34px !important; font-size:15px !important; }
    /* Testimonials readable (Pinyon needs size) */
    .t-quote { font-size:clamp(26px,2.4vw,36px) !important; line-height:1.4 !important; color:var(--text) !important; }
    @media(max-width:768px){
      .hero-logo-img { height:clamp(240px,70vw,460px) !important; }
      .hero-tagline { font-size:clamp(10px,2.8vw,13px) !important; letter-spacing:0.2em !important; }
      .hero { min-height:78vh !important; }
      .hero-bg { object-fit:cover !important; object-position:60% 28% !important; }
      .work-desc { font-size:16px !important; }
      .t-quote { font-size:24px !important; }
    }
    @media(min-width:769px) and (max-width:1024px){ .hero-bg { object-position:55% 24% !important; } }
`;
let i = idx.lastIndexOf('</style>'); idx = idx.slice(0,i)+IDX_CSS+'\n  '+idx.slice(i);
await writeFile('index.html', idx, 'utf8');
console.log('✓ index: texts, hero logo+tagline, work nums/desc/btn, testimonials');

// ════════ CONTACT: remove brownish box bg ════════
let c = await readFile('contact.html','utf8');
c = c.replace(/<div class="contact-info-col" style="padding:48px 40px;display:flex;flex-direction:column;gap:24px;background:var\(--surface\);min-width:0;">/,
  '<div class="contact-info-col" style="padding:48px 40px;display:flex;flex-direction:column;gap:24px;background:transparent;min-width:0;">');
c = c.replace(/(\.contact-info-col\s*\{[^}]*?)background:\s*var\(--surface\)[^;]*;/g, '$1background:transparent;');
await writeFile('contact.html', c, 'utf8');
console.log('✓ contact: brownish box removed');

// ════════ ABOUT: remove hover blob entirely ════════
let a = await readFile('about.html','utf8');
a = a.replace(/<div class="p-card-blob"><\/div>/g, '');
a = a.replace(/<div class="p-card-blob">\s*<\/div>/g, '');
// remove blob JS
a = a.replace(/<script>\s*\(function\(\)\{\s*document\.querySelectorAll\('\.p-card'\)[\s\S]*?\}\)\(\);\s*<\/script>/g, '');
// neutralize blob CSS
a = a.replace(/\.p-card-blob\s*\{[^}]*\}/g, '');
a = a.replace(/\.p-card:hover \.p-card-blob\s*\{[^}]*\}/g, '');
await writeFile('about.html', a, 'utf8');
console.log('✓ about: hover blob removed, plain process cards');

// ════════ INVESTMENT: fix moments clip, disclaimer, remove stats ════════
let inv = await readFile('investment.html','utf8');
// remove hero stats block
inv = inv.replace(/<div class="inv-hero-stats">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, '</div>\n</section>');
inv = inv.replace(/<div class="inv-hero-stats">[\s\S]*?<\/div>\s*(?=<\/div>)/, '');
// fix accent clipping: inline-block + padding
inv = inv.replace(/\.inv-hero-accent\{[^}]*\}/,
  '.inv-hero-accent{display:inline-block;padding:0 0.12em 0.12em 0;background:linear-gradient(100deg,#F58A07,#F9AB55);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-style:italic;line-height:1.08;}');
inv = inv.replace(/\.inv-hero-title\{([^}]*)\}/, (m,g)=>`.inv-hero-title{${g.replace(/line-height:[^;]+;/,'line-height:1.02;')};overflow:visible;padding-bottom:0.08em;}`);
// add Disclaimer: title before intro-note
inv = inv.replace(/(<p class="intro-note">)/, '<p class="disclaimer-label" style="font-family:\'Cabinet Grotesk\',sans-serif;font-weight:800;font-size:14px;letter-spacing:0.04em;color:var(--text);margin-bottom:8px;">Disclaimer:</p>$1');
await writeFile('investment.html', inv, 'utf8');
console.log('✓ investment: stats removed, moments fixed, disclaimer added');
