/**
 * update-pages.mjs — Updates nav/footer CSS+HTML on all non-index pages
 */
import { readFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';

const ROOT = 'C:/Users/joelk/.claude/sessions/.claude/worktrees/priceless-wilson';
const PAGES = ['about.html', 'portfolio.html', 'contact.html', 'portfolio-denim.html'];

// ── New nav + footer CSS block to inject before </style> ──
const NAV_FOOTER_CSS = `
    /* ═══ UPDATED NAV ═══ */
    .site-nav {
      position: relative !important; width: 100% !important;
      background: var(--nav-bg) !important;
      backdrop-filter: blur(18px) !important; -webkit-backdrop-filter: blur(18px) !important;
      border-bottom: 1px solid var(--nav-br, rgba(0,0,0,0.1)) !important;
      display: flex !important; align-items: center !important;
      justify-content: space-between !important;
      padding: 10px 44px !important; gap: 24px !important;
      grid-template-columns: unset !important; align-items: center !important;
    }
    .nav-logo-link { display: flex !important; align-items: center !important; flex-shrink: 0 !important; }
    .nav-logo { height: 46px !important; width: auto !important; object-fit: contain !important; display: block !important; filter: none !important; mix-blend-mode: normal !important; }
    .nav-logo-dark  { display: none !important; }
    .nav-logo-light { display: block !important; }
    [data-theme="dark"] .nav-logo-light { display: none !important; }
    [data-theme="dark"] .nav-logo-dark  { display: block !important; }
    .nav-right { display: flex !important; align-items: center !important; gap: 36px !important; }
    .nav-links { list-style: none !important; display: flex !important; align-items: center !important; gap: 30px !important; }
    .nav-links a { font-size: 11px !important; font-weight: 500 !important; letter-spacing: 0.11em !important; text-transform: uppercase !important; color: var(--text-muted) !important; transition: color 0.2s !important; }
    .nav-links a:hover, .nav-links a.active { color: var(--text) !important; }
    .nav-contact, .nav-logo-area, .nav-menu, .nav-location, .nav-links-list { display: none !important; }

    /* Theme switch */
    .theme-switch {
      position: relative !important; width: 50px !important; height: 27px !important;
      border-radius: 100px !important; background: var(--surface, #f4f4f4) !important;
      border: 1px solid var(--nav-br, rgba(0,0,0,0.1)) !important;
      cursor: pointer !important; outline: none !important; flex-shrink: 0 !important;
      transition: background 0.3s, border-color 0.3s !important;
    }
    .theme-switch:focus-visible { box-shadow: 0 0 0 3px rgba(255,77,0,0.3) !important; }
    .switch-thumb {
      position: absolute !important; top: 3px !important; left: 3px !important;
      width: 19px !important; height: 19px !important; border-radius: 50% !important;
      background: var(--text, #0a0a0a) !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      transition: transform 0.38s cubic-bezier(0.23,1,0.32,1), background 0.3s !important;
    }
    [data-theme="dark"] .switch-thumb { transform: translateX(23px) !important; }
    .th-icon { width: 10px !important; height: 10px !important; position: absolute !important; transition: opacity 0.2s !important; }
    .th-moon { stroke: #fff !important; opacity: 1 !important; }
    .th-sun  { stroke: #0a0a0a !important; opacity: 0 !important; }
    [data-theme="dark"] .th-moon { opacity: 0 !important; }
    [data-theme="dark"] .th-sun  { opacity: 1 !important; }

    /* ═══ UPDATED FOOTER ═══ */
    .footer {
      background: var(--footer-bg, #f4f4f4) !important;
      border-top: 1px solid var(--nav-br, rgba(0,0,0,0.1)) !important;
      padding: 68px 48px 26px !important;
    }
    .footer-main {
      display: grid !important; grid-template-columns: 1fr auto !important;
      gap: 80px !important; padding-bottom: 52px !important;
      border-bottom: 1px solid var(--nav-br, rgba(0,0,0,0.1)) !important;
      align-items: start !important;
    }
    .footer-left { display: flex !important; flex-direction: column !important; gap: 32px !important; }
    .footer-logo { height: 150px !important; width: auto !important; display: block !important; }
    .footer-logo-dark  { display: none !important; }
    .footer-logo-light { display: block !important; }
    [data-theme="dark"] .footer-logo-light { display: none !important; }
    [data-theme="dark"] .footer-logo-dark  { display: block !important; }
    .footer-email-label {
      font-size: 12px !important; color: var(--text-muted) !important;
      letter-spacing: 0.06em !important; text-transform: uppercase !important;
      margin-bottom: 7px !important; font-weight: 500 !important;
    }
    .footer-big-email {
      font-family: 'Bebas Neue', sans-serif !important;
      font-size: clamp(22px, 2.2vw, 34px) !important;
      color: var(--text) !important; letter-spacing: 0.01em !important; line-height: 1 !important;
      transition: color 0.22s !important;
    }
    .footer-big-email:hover { color: #ff4d00 !important; }
    .footer-nav-cols { display: flex !important; gap: 80px !important; }
    .footer-col-head {
      font-size: 11px !important; font-weight: 600 !important;
      letter-spacing: 0.12em !important; text-transform: uppercase !important;
      color: var(--text) !important; margin-bottom: 22px !important;
    }
    .footer-col-links { list-style: none !important; display: flex !important; flex-direction: column !important; gap: 18px !important; }
    .footer-col-links a { font-size: 17px !important; color: var(--text-muted) !important; transition: color 0.2s !important; font-weight: 400 !important; }
    .footer-col-links a:hover { color: var(--text) !important; }
    .footer-bottom { padding-top: 20px !important; display: flex !important; justify-content: flex-end !important; }
    .footer-privacy { font-size: 11px !important; color: var(--text-faint) !important; }
    .footer-privacy a { color: var(--text-muted) !important; transition: color 0.2s !important; }
    .footer-privacy a:hover { color: var(--text) !important; }
    .footer-you-can, .footer-quote, .footer-quote-auth { display: none !important; }
`;

// ── New footer HTML ──
const NEW_FOOTER_HTML = `  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-main">
      <div class="footer-left">
        <div>
          <img src="logo-black.png" class="footer-logo footer-logo-light" alt="Aura Films">
          <img src="logo-white.png" class="footer-logo footer-logo-dark"  alt="Aura Films">
        </div>
        <div>
          <p class="footer-email-label">Reach us at</p>
          <a href="mailto:hello@aurafilms.ca" class="footer-big-email">hello@aurafilms.ca</a>
        </div>
      </div>
      <div class="footer-nav-cols">
        <div>
          <p class="footer-col-head">Links</p>
          <ul class="footer-col-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="portfolio.html">Portfolio</a></li>
            <li><a href="about.html">About Us</a></li>
            <li><a href="contact.html">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-col-head">Others</p>
          <ul class="footer-col-links">
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Facebook</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-privacy"><a href="#">Privacy Policy</a> &copy; Aura Films 2026</p>
    </div>
  </footer>`;

// ── Fixed toggleTheme (no emoji, no textContent) ──
const NEW_TOGGLE_FN = `function toggleTheme() {
  var h = document.documentElement;
  var t = h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  h.setAttribute('data-theme', t);
  localStorage.setItem('af-theme', t);
}`;

for (const page of PAGES) {
  const path = `${ROOT}/${page}`;
  let html = await readFile(path, 'utf8');

  // 1. Inject nav+footer CSS before </style>
  html = html.replace('</style>', NAV_FOOTER_CSS + '\n  </style>');

  // 2. Replace entire <footer ...>...</footer> block
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/);
  if (footerMatch) {
    html = html.replace(footerMatch[0], NEW_FOOTER_HTML);
  }

  // 3. Fix toggleTheme function (replace old version that sets textContent)
  html = html.replace(
    /function toggleTheme\(\)\s*\{[\s\S]*?localStorage\.setItem\([^)]+\);[\s\S]*?\}/,
    NEW_TOGGLE_FN
  );

  // 4. Remove DOMContentLoaded block that sets b.textContent to emoji
  html = html.replace(/document\.addEventListener\('DOMContentLoaded',function\(\)\s*\{[\s\S]*?var b=document\.getElementById\('theme-btn'\);[\s\S]*?b\.textContent[\s\S]*?\}\);/g,
    `document.addEventListener('DOMContentLoaded', function() {
  var els = document.querySelectorAll('.af-reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.style.opacity='1'; el.style.transform='none'; });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('af-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.04 });
  els.forEach(function(el) { obs.observe(el); });
});`
  );

  await writeFile(path, html, 'utf8');
  console.log(`✓ Updated ${page}`);
}

// 5. Delete my-shots.html
const myShots = `${ROOT}/my-shots.html`;
if (existsSync(myShots)) {
  await unlink(myShots);
  console.log('✓ Deleted my-shots.html');
}

console.log('All done!');
