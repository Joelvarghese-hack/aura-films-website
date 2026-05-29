/**
 * batch-fix.mjs — Comprehensive fixes pass
 * Fixes: footer contrast, Instagram links, remove Facebook, no dashes,
 * scroll-top btn, rounded corners, font enforcement, hero logo bigger
 */
import { readFile, writeFile } from 'fs/promises';

const IG_URL = 'https://www.instagram.com/aura.filmsca/';
const JOEL_URL = 'https://joelvarghese.dev';

const ALL = ['index.html','about.html','portfolio.html','contact.html','investment.html',
  'cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','portfolio-denim.html'];

// ── GLOBAL CSS ADDITIONS (injected once per file)
const GLOBAL_ADD = `
    /* ── BATCH-FIX CSS ── */
    /* Font enforcement — Satoshi body, Cabinet Grotesk headings */
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&f[]=cabinet-grotesk@500,700,800,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
    body { font-family: 'Satoshi', sans-serif !important; }
    h1,h2,h3,h4,.hero-title,.section-title,.section-name,.port-hero-title,.about-title,
    .cat-name,.cat-page-title,.team-name,.pkg-section-title,.pkg-name,.cta-headline,
    .cta-band-title,.works-section-title,.work-category,.disc-amount,.footer-tagline,
    .inv-hero-title { font-family: 'Cabinet Grotesk', sans-serif !important; }

    /* ── FOOTER CONTRAST FIX ── */
    .footer { background: #1a1a1a !important; }
    .footer * { color: rgba(255,255,255,0.82) !important; }
    .footer a { color: rgba(255,255,255,0.72) !important; transition: color 0.2s; }
    .footer a:hover { color: #fff !important; }
    .footer-col-head { color: #fff !important; font-size: 11px !important; letter-spacing: 0.18em !important; text-transform: uppercase !important; font-weight: 600 !important; opacity: 1 !important; }
    .footer-col-links a { color: rgba(255,255,255,0.65) !important; font-size: 14px !important; }
    .footer-col-links a:hover { color: var(--orange) !important; }
    .footer-tagline { color: rgba(255,255,255,0.72) !important; font-size: 13px !important; }
    .footer-contact-item, .footer-contact-item a { color: rgba(255,255,255,0.60) !important; font-size: 13px !important; }
    .footer-bottom-left, .footer-bottom-right a { color: rgba(255,255,255,0.45) !important; font-size: 11px !important; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1) !important; }
    .footer-search-input { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.15) !important; color: #fff !important; }
    .footer-search-input::placeholder { color: rgba(255,255,255,0.35) !important; }

    /* ── ROUNDED CORNERS everywhere ── */
    .service-card, .pkg-card, .team-card, .disc-card, .p-card, .t-card,
    .addon-card, .term-item, .contact-profile-card, .nav-dropdown,
    .footer-search-box, .cat-tile, .more-cat-link, .cat-gallery-item,
    input, textarea, select, .form-input, .form-textarea, .service-pill,
    .stat-box, .bio-section, .nav-search-input { border-radius: 10px !important; }
    .btn-ghost, .btn-send, .btn-inv, .btn-glass, .pkg-cta, .work-link,
    .cat-page-back, .cat-arrow { border-radius: 100px !important; }
    .portfolio-item, .tool-row { border-radius: 8px !important; }
    img { border-radius: 0 !important; } /* images: no rounding on photos */
    .cat-tile img, .cat-gallery-item img, .team-photo img, .hero-bg,
    .more-cat-link img { border-radius: 0 !important; }

    /* ── SCROLL TO TOP BUTTON ── */
    .scroll-top {
      position: fixed; bottom: 24px; right: 24px; z-index: 500;
      width: 44px; height: 44px; border-radius: 50% !important;
      background: var(--orange, #e8a748); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(232,167,72,0.35);
      opacity: 0; transform: translateY(12px);
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
    }
    .scroll-top.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
    .scroll-top svg { stroke: #fff; }
    @media(max-width:480px){ .scroll-top { bottom: 16px; right: 16px; width: 40px; height: 40px; } }

    /* ── HERO LOGO SIZE ── */
    .hero-logo-img {
      height: clamp(120px, 22vw, 220px) !important;
      width: auto !important;
      opacity: 0.92 !important;
    }
    .hero-tagline {
      font-family: 'Satoshi', sans-serif !important;
      font-size: clamp(11px, 1.6vw, 16px) !important;
      letter-spacing: 0.28em !important;
      text-transform: uppercase !important;
      color: rgba(255,255,255,0.80) !important;
      font-weight: 400 !important;
      margin-top: 14px !important;
    }
    @media(max-width:768px){
      .hero-logo-img { height: clamp(90px, 28vw, 150px) !important; }
      .hero-tagline { font-size: clamp(10px, 3vw, 13px) !important; letter-spacing: 0.22em !important; }
    }
`;

// ── SCROLL TO TOP HTML (injected before </body>)
const SCROLL_TOP_HTML = `
<button class="scroll-top" id="scroll-top-btn" aria-label="Scroll to top">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
</button>
<script>
(function(){
  var btn = document.getElementById('scroll-top-btn');
  if(!btn) return;
  window.addEventListener('scroll', function(){ btn.classList.toggle('visible', window.scrollY > 300); }, {passive:true});
  btn.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
})();
</script>`;

// ── IG ICON SVG (for replacement)
const IG_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`;

for (const f of ALL) {
  let html = await readFile(f, 'utf8').catch(() => null);
  if (!html) { console.log('SKIP (not found):', f); continue; }

  if (html.includes('BATCH-FIX CSS')) { console.log('already done:', f); continue; }

  // 1. Inject global CSS
  html = html.replace('  </style>', `${GLOBAL_ADD}\n  </style>`);

  // 2. Inject scroll-top before </body>
  html = html.replace('</body>', `${SCROLL_TOP_HTML}\n</body>`);

  // 3. Fix Instagram links — add href to all IG social icons
  html = html.replace(/class="footer-social-icon footer-social-ig"[^>]*aria-label="Instagram">/g,
    `class="footer-social-icon footer-social-ig" href="${IG_URL}" target="_blank" rel="noopener" aria-label="Instagram">`);
  // Also fix any <a href="#" class="footer-social-icon footer-social-ig"
  html = html.replace(/href="#"\s+class="footer-social-icon footer-social-ig"/g,
    `href="${IG_URL}" target="_blank" rel="noopener" class="footer-social-icon footer-social-ig"`);
  html = html.replace(/class="footer-social-icon footer-social-ig"\s+href="#"/g,
    `class="footer-social-icon footer-social-ig" href="${IG_URL}" target="_blank" rel="noopener"`);

  // 4. Remove Facebook social icon entirely from footer
  html = html.replace(/<a[^>]*footer-social-fb[^>]*>[\s\S]*?<\/a>/g, '');

  // 5. Fix Joel Varghese link
  html = html.replace(/<a href="#">Joel Varghese<\/a>/g, `<a href="${JOEL_URL}" target="_blank" rel="noopener">Joel Varghese</a>`);

  // 6. Remove content dashes (ndash, mdash in visible text, but NOT in class/id/CSS)
  html = html.replace(/&ndash;/g, '');
  html = html.replace(/&mdash;/g, ' ');
  html = html.replace(/\s+—\s+/g, ' ');
  html = html.replace(/\s+–\s+/g, ' ');

  // 7. Footer: change logo from light/dark to just white
  html = html.replace(
    /<img src="logo-black\.png" class="footer-logo footer-logo-light"[^>]*>/g,
    `<img src="images/aura-logo-white.png" class="footer-logo" alt="Aura Films" style="height:70px;width:auto;opacity:0.95;">`
  );
  html = html.replace(
    /<img src="logo-white\.png" class="footer-logo footer-logo-dark"[^>]*>/g, ''
  );

  // 8. Privacy/Terms links — add proper anchors (they link to investment.html#privacy etc.)
  html = html.replace(/href="#privacy"/g, 'href="investment.html#terms"');
  html = html.replace(/href="#terms"/g, 'href="investment.html#terms"');
  html = html.replace(/href="#">Privacy Policy<\/a>/g, `href="investment.html#terms">Privacy Policy</a>`);
  html = html.replace(/href="#">Terms of Use<\/a>/g, `href="investment.html#terms">Terms of Use</a>`);

  // 9. Remove "Aura Films Photographer" profile cards with IG/X badges
  html = html.replace(/<div class="contact-profile-card">[\s\S]*?<\/div>\s*<\/div>/g, (m) => {
    if (m.includes('badge-sm') || m.includes('contact-card')) return '';
    return m;
  });
  html = html.replace(/<div class="cta-right-card">[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*<\/div>/g, '');

  await writeFile(f, html, 'utf8');
  console.log('✓', f);
}
console.log('\nBatch fix done');
