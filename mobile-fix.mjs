/**
 * mobile-fix.mjs — Comprehensive mobile optimisation for all pages
 */
import { readFile, writeFile } from 'fs/promises';

const ROOT = 'C:/Users/joelk/.claude/sessions/.claude/worktrees/priceless-wilson';
const ALL = ['index.html','about.html','portfolio.html','contact.html','investment.html','portfolio-denim.html'];

/* ─── SHARED NAV + FOOTER MOBILE CSS (injected into every page) ─── */
const SHARED_MOBILE = `
    /* ═══════════════════════════════════════
       SHARED MOBILE — injected all pages
    ═══════════════════════════════════════ */

    /* Prevent horizontal scroll on every page */
    html, body { overflow-x: hidden; max-width: 100%; }
    * { box-sizing: border-box; }

    /* ── STICKY NAV (all pages) ── */
    .site-nav {
      position: sticky !important; top: 0 !important; z-index: 200 !important;
    }

    /* ── HAMBURGER base ── */
    .hamburger {
      display: none; background: none; border: none; cursor: pointer;
      padding: 6px; color: var(--text, #1B120B); flex-shrink: 0;
    }
    .hamburger svg { display: block; }

    /* ── MOBILE NAV DRAWER ── */
    @media (max-width: 768px) {
      .site-nav { padding: 10px 18px !important; }
      .nav-logo { height: 38px !important; }
      .hamburger { display: flex !important; align-items: center; justify-content: center; }
      .nav-right .nav-links { display: none !important; }
      .nav-search-wrap, .nav-search-btn { display: none !important; }
      .nav-links.mobile-open {
        display: flex !important; flex-direction: column;
        position: absolute; top: 100%; left: 0; right: 0;
        background: var(--nav-bg, rgba(249,240,225,0.97));
        border-bottom: 1px solid var(--border, rgba(33,41,34,0.12));
        padding: 16px 20px 20px; gap: 0;
        backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
        z-index: 9999;
      }
      .nav-links.mobile-open li { border-bottom: 1px solid var(--border, rgba(33,41,34,0.12)); }
      .nav-links.mobile-open li:last-child { border-bottom: none; }
      .nav-links.mobile-open a {
        display: block; font-size: 15px !important; padding: 14px 4px !important;
        letter-spacing: 0.08em;
      }
      .nav-right { gap: 14px !important; }
    }

    /* ── FOOTER MOBILE ── */
    @media (max-width: 768px) {
      .footer { padding: 40px 20px 20px !important; }
      .footer-body {
        display: flex !important; flex-direction: column !important;
        gap: 32px !important;
      }
      .footer-brand { max-width: 100% !important; }
      .footer-logo { height: 120px !important; }
      .footer-tagline { font-size: 14px !important; }
      .footer-col-head { font-size: 11px !important; margin-bottom: 14px !important; }
      .footer-col-links a { font-size: 15px !important; }
      .footer-col-links { gap: 14px !important; }
      .footer-bottom {
        flex-direction: column !important; gap: 10px !important;
        align-items: flex-start !important; padding-top: 18px !important;
      }
      .footer-bottom-left { font-size: 11px !important; }
      .footer-bottom-right { display: flex; gap: 16px; font-size: 11px !important; }
      .footer-search-input { font-size: 14px !important; }
    }

    /* ── SCROLL-TO-TOP BTN ── */
    @media (max-width: 768px) {
      .scroll-top-btn { bottom: 16px !important; right: 16px !important; width: 40px !important; height: 40px !important; }
    }
`;

/* ─── PAGE-SPECIFIC MOBILE CSS ─── */
const PAGE_MOBILE = {

  'index.html': `
    @media (max-width: 768px) {
      /* Hero */
      .hero { min-height: 90vh; }
      .hero-title { font-size: clamp(58px,16vw,88px) !important; text-align: center !important; }
      .hero-tagline { font-size: clamp(14px,4vw,20px) !important; text-align: center !important; margin-top: 4px !important; }
      .hero-inner { padding: 0 20px 48px !important; align-items: center !important; display: flex !important; flex-direction: column !important; justify-content: flex-end !important; }
      .hero-cta-row { justify-content: center !important; }

      /* Bio */
      .bio-section { padding: 48px 20px !important; }
      .bio-copy { font-size: clamp(17px,4.5vw,22px) !important; text-align: center !important; }
      .bio-sub { text-align: center !important; font-size: 13px !important; }

      /* Services */
      .section { padding: 48px 20px !important; }
      .section-title { font-size: clamp(28px,8vw,42px) !important; text-align: center !important; }
      .section-head { text-align: center !important; }
      .services-grid { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
      .service-card { padding: 20px 14px !important; }
      .service-icon svg { width: 32px !important; height: 32px !important; }
      .service-label { font-size: 12px !important; }
    }
    @media (max-width: 480px) {
      .services-grid { grid-template-columns: 1fr !important; }
      .service-card { flex-direction: row !important; align-items: center !important; gap: 14px !important; text-align: left !important; padding: 16px 18px !important; }
      .service-icon { margin: 0 !important; }

      /* Works */
      .works-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; padding: 32px 20px 20px !important; }
      .works-section-title { font-size: clamp(36px,10vw,52px) !important; }
      .work-alt-item { grid-template-columns: 1fr !important; }
      .work-alt-img { aspect-ratio: 4/3 !important; }
      .work-alt-text { padding: 24px 20px 32px !important; }
      .work-num { font-size: clamp(52px,14vw,80px) !important; }
      .work-category { font-size: clamp(22px,6vw,32px) !important; }
      .work-desc { font-size: 14px !important; }

      /* CTA */
      .cta-section { padding: 56px 20px 48px !important; }
      .cta-title { font-size: clamp(28px,8vw,44px) !important; text-align: center !important; }
      .cta-btn-row { justify-content: center !important; }
    }

    /* Works — always single column on mobile */
    @media (max-width: 768px) {
      .work-alt-item { grid-template-columns: 1fr !important; }
      .work-alt-item:nth-child(even) .work-alt-img { order: 0 !important; }
      .work-alt-item:nth-child(even) .work-alt-text { order: 1 !important; }
      .work-alt-text { padding: 28px 20px 36px !important; }
      .work-num { font-size: clamp(48px,12vw,72px) !important; }
      .works-header { padding: 40px 20px 20px !important; }

      /* Testimonials */
      .testimonials-section { padding: 48px 0 !important; }
      .testimonials-header { padding: 0 20px !important; }
      .section-title { text-align: center !important; }
      .t-card { min-width: 280px !important; padding: 24px !important; }
    }
  `,

  'about.html': `
    @media (max-width: 768px) {
      .hero-inner { padding: 0 20px 48px !important; }
      .hero-title { font-size: clamp(40px,10vw,64px) !important; }
      .hero-bio { font-size: 13px !important; }
      .stats-bar { flex-direction: column !important; }
      .stat-box { border-right: none !important; border-bottom: 1px solid var(--border, #1c1c1c) !important; padding: 20px 24px !important; }
      .stat-box:last-child { border-bottom: none !important; }
      .bio-wrap { padding: 36px 20px !important; }
      .bio-wrap p { font-size: 15px !important; }
      .section { padding: 40px 20px !important; }
      .section-name { font-size: 22px !important; }
      .process-grid { grid-template-columns: 1fr !important; gap: 3px !important; }
      .p-card { min-height: 200px !important; }
      .process-footer { padding: 0 20px !important; }
      .btn-ghost { width: 100% !important; justify-content: center !important; }
    }
  `,

  'portfolio.html': `
    @media (max-width: 768px) {
      .hero-inner { padding: 0 20px 48px !important; }
      .hero-title { font-size: clamp(40px,10vw,64px) !important; }
      .section { padding: 40px 20px !important; }
      .portfolio-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
      .portfolio-item { aspect-ratio: 4/3 !important; }
    }
    @media (max-width: 480px) {
      .portfolio-grid { grid-template-columns: 1fr !important; }
    }
  `,

  'contact.html': `
    @media (max-width: 768px) {
      .hero-inner { padding: 0 20px 48px !important; }
      .hero-title { font-size: clamp(40px,10vw,64px) !important; }
      .section { padding: 40px 20px !important; }
      .contact-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
      .form-input, .form-textarea, .form-select { font-size: 16px !important; } /* prevent iOS zoom */
      .contact-info-card { padding: 24px 20px !important; }
      .cta-section { padding: 48px 20px !important; }
    }
  `,

  'investment.html': `
    @media (max-width: 768px) {
      .inv-hero { padding: 80px 20px 48px !important; }
      .inv-hero-title {
        font-size: clamp(48px,12vw,80px) !important;
        word-break: break-word !important; overflow-wrap: break-word !important;
        overflow: visible !important; white-space: normal !important;
      }
      .inv-hero-sub { font-size: 14px !important; }
      .inv-section { padding: 40px 20px !important; }
      .inv-section-title { font-size: clamp(24px,7vw,36px) !important; }
      .packages-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
      .package-card { padding: 24px 20px !important; }
      .package-price { font-size: clamp(32px,8vw,48px) !important; }
      .addons-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
    }
    @media (max-width: 480px) {
      .inv-hero-title { font-size: clamp(40px,11vw,64px) !important; }
    }
  `,

  'portfolio-denim.html': `
    @media (max-width: 768px) {
      .hero-inner { padding: 0 20px 48px !important; }
      .hero-title { font-size: clamp(40px,10vw,64px) !important; }
      .section { padding: 40px 20px !important; }
      .denim-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
    }
  `,
};

for (const page of ALL) {
  const path = `${ROOT}/${page}`;
  let html;
  try { html = await readFile(path, 'utf8'); } catch { console.warn(`⚠ ${page} not found`); continue; }

  // 1. Inject shared + page-specific mobile CSS before </style>
  const pageCSS = PAGE_MOBILE[page] || '';
  const inject = SHARED_MOBILE + '\n' + pageCSS;

  // Replace only the FIRST </style> to avoid duplicates
  if (html.includes('/* MOBILE-INJECTED */')) {
    console.log(`⏭ ${page} already patched`);
  } else {
    html = html.replace('</style>', `  /* MOBILE-INJECTED */\n${inject}\n  </style>`);
  }

  // 2. Fix investment page title overflow (hardcode style fix)
  if (page === 'investment.html') {
    html = html.replace(
      /class="inv-hero-title"([^>]*)>/g,
      'class="inv-hero-title" style="word-break:break-word;overflow-wrap:break-word;overflow:visible;white-space:normal;">'
    );
    // Fix the font-size to be responsive via clamp
    html = html.replace(
      /\.inv-hero-title\s*\{([^}]*)font-size:\s*[^;]+;/,
      (m) => m.replace(/font-size:[^;]+;/, 'font-size: clamp(48px, 10vw, 110px);')
    );
  }

  // 3. Ensure all pages have the hamburger button in nav
  if (!html.includes('class="hamburger"')) {
    html = html.replace(
      '</nav>',
      `  <button class="hamburger" aria-label="Menu" onclick="this.closest('nav').querySelector('.nav-links').classList.toggle('mobile-open')">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="3" y1="6" x2="19" y2="6"/><line x1="3" y1="11" x2="19" y2="11"/><line x1="3" y1="16" x2="19" y2="16"/>
    </svg>
  </button>
</nav>`
    );
  }

  // 4. Add viewport meta if missing
  if (!html.includes('viewport')) {
    html = html.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
  }

  // 5. Fix any fixed-width containers causing overflow
  html = html.replace(/min-width:\s*[6-9]\d\d px/g, ''); // remove large min-widths

  await writeFile(path, html, 'utf8');
  console.log(`✓ ${page}`);
}

console.log('\nAll pages mobile-optimised!');
