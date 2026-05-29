/**
 * overhaul.mjs — Complete site-wide overhaul
 * Fixes: dark mode, sticky nav, active links, scroll-to-top,
 *        new footer (reference match), search, tagline move
 */
import { readFile, writeFile } from 'fs/promises';

const ROOT = 'C:/Users/joelk/.claude/sessions/.claude/worktrees/priceless-wilson';
const ALL  = ['index.html', 'about.html', 'portfolio.html', 'contact.html', 'portfolio-denim.html'];

// ─────────────────────────────────────────────────────────
// NEW FOOTER CSS (injected into every page's <style> block)
// ─────────────────────────────────────────────────────────
const FOOTER_CSS = `
    /* ═══ UNIVERSAL FOOTER ═══ */
    .footer {
      background: var(--footer-bg) !important;
      border-top: 1px solid var(--border) !important;
      padding: 64px 56px 0 !important;
      font-family: 'DM Sans', sans-serif !important;
    }
    /* hide any old footer inner structure */
    .footer-main, .footer-left, .footer-email-label,
    .footer-big-email, .footer-nav-cols, .footer-privacy { display: none !important; }

    .footer-body {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 52px;
      padding-bottom: 56px;
      border-bottom: 1px solid var(--border);
      align-items: start;
    }
    .footer-brand { display: flex; flex-direction: column; gap: 18px; }
    .footer-logo  { height: 150px; width: auto; display: block; }
    .footer-logo-dark  { display: none; }
    .footer-logo-light { display: block; }
    [data-theme="dark"] .footer-logo-light { display: none; }
    [data-theme="dark"] .footer-logo-dark  { display: block; }
    .footer-tagline {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--text-muted); line-height: 1.6;
    }
    .footer-socials { display: flex; gap: 10px; }
    .footer-social-icon {
      width: 34px; height: 34px; border-radius: 50%;
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      transition: border-color 0.22s cubic-bezier(0.23,1,0.32,1),
                  color 0.22s, transform 0.3s cubic-bezier(0.23,1,0.32,1);
    }
    .footer-social-icon:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
    .footer-contact-info { display: flex; flex-direction: column; gap: 6px; }
    .footer-contact-item { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
    .footer-contact-item a { color: var(--text-muted); transition: color 0.2s; }
    .footer-contact-item a:hover { color: var(--accent); }
    .footer-col { display: flex; flex-direction: column; }
    .footer-col-head {
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic; font-size: 17px;
      color: var(--text); margin-bottom: 20px; font-weight: 400;
    }
    .footer-col-links { list-style: none; display: flex; flex-direction: column; gap: 13px; }
    .footer-col-links a { font-size: 14px; color: var(--text-muted); transition: color 0.2s; font-weight: 400; }
    .footer-col-links a:hover { color: var(--text); }
    /* Search */
    .footer-search-wrap { margin-top: 28px; }
    .footer-search-box  { position: relative; }
    .footer-search-input {
      width: 100%; padding: 9px 14px 9px 34px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; outline: none;
      font-size: 13px; color: var(--text); font-family: 'DM Sans', sans-serif;
      transition: border-color 0.22s, box-shadow 0.22s;
    }
    .footer-search-input::placeholder { color: var(--text-faint); }
    .footer-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(255,77,0,0.1); }
    .footer-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-faint); pointer-events: none; }
    .footer-search-dropdown {
      position: absolute; top: calc(100% + 6px); left: 0; right: 0;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; overflow: hidden;
      max-height: 0; opacity: 0;
      transition: max-height 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.25s;
      z-index: 60; box-shadow: 0 10px 36px rgba(0,0,0,0.1);
    }
    .footer-search-dropdown.open { max-height: 300px; opacity: 1; }
    .search-result-item {
      display: flex; flex-direction: column; gap: 2px;
      padding: 10px 14px; cursor: pointer; text-decoration: none;
      border-bottom: 1px solid var(--border); transition: background 0.15s;
    }
    .search-result-item:last-child { border-bottom: none; }
    .search-result-item:hover { background: rgba(255,77,0,0.06); }
    .search-result-title { font-size: 13px; font-weight: 500; color: var(--text); }
    .search-result-snippet { font-size: 11px; color: var(--text-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .search-no-results { padding: 14px; font-size: 13px; color: var(--text-faint); text-align: center; }
    /* Bottom bar */
    .footer-bottom {
      padding: 18px 0 22px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .footer-bottom-left { font-size: 12px; color: var(--text-faint); }
    .footer-bottom-left a { color: var(--text-faint); transition: color 0.2s; text-decoration: underline; text-underline-offset: 2px; }
    .footer-bottom-left a:hover { color: var(--text-muted); }
    .footer-bottom-right { display: flex; gap: 20px; }
    .footer-bottom-right a { font-size: 12px; color: var(--text-muted); transition: color 0.2s; }
    .footer-bottom-right a:hover { color: var(--text); }

    /* ═══ STICKY NAV ═══ */
    .site-nav { position: sticky !important; top: 0 !important; z-index: 200 !important; }

    /* ═══ ACTIVE NAV LINK ═══ */
    .nav-links a.active {
      color: var(--text) !important;
      font-weight: 700 !important;
      text-decoration: underline;
      text-decoration-color: var(--accent);
      text-underline-offset: 4px;
    }

    /* ═══ SCROLL TO TOP ═══ */
    .af-top {
      position: fixed; bottom: 28px; right: 28px; z-index: 999;
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(255,255,255,0.72);
      backdrop-filter: blur(16px) saturate(160%);
      -webkit-backdrop-filter: blur(16px) saturate(160%);
      border: 1px solid rgba(255,255,255,0.65);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--text); opacity: 0;
      transform: translateY(12px) scale(0.9);
      transition: opacity 0.3s cubic-bezier(0.23,1,0.32,1),
                  transform 0.3s cubic-bezier(0.23,1,0.32,1),
                  background 0.25s, border-color 0.25s;
      pointer-events: none;
    }
    [data-theme="dark"] .af-top {
      background: rgba(25,25,25,0.75);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 4px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .af-top.af-top-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    .af-top:hover { background: rgba(255,77,0,0.12); border-color: rgba(255,77,0,0.35); }
    .af-top:active { transform: scale(0.92); }
`;

// ─────────────────────────────────────────────────────────
// FOOTER HTML BUILDER  (logo paths relative to root)
// ─────────────────────────────────────────────────────────
function buildFooterHTML(active) {
  return `
  <!-- ── FOOTER ── -->
  <footer class="footer">
    <div class="footer-body">
      <!-- Brand -->
      <div class="footer-brand">
        <div>
          <img src="logo-black.png" class="footer-logo footer-logo-light" alt="Aura Films">
          <img src="logo-white.png" class="footer-logo footer-logo-dark"  alt="Aura Films">
        </div>
        <p class="footer-tagline">Shooting moments.<br>Preserving memories.</p>
        <div class="footer-socials">
          <a href="#" class="footer-social-icon" aria-label="Instagram">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="#" class="footer-social-icon" aria-label="Facebook">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
        </div>
        <div class="footer-contact-info">
          <div class="footer-contact-item">31 Bayswater Pl, Kingston, ON K7M 2B8</div>
          <div class="footer-contact-item"><a href="mailto:hello@aurafilms.ca">hello@aurafilms.ca</a></div>
          <div class="footer-contact-item"><a href="tel:+16135551234">+1 (613) 555-1234</a></div>
        </div>
      </div>
      <!-- About -->
      <div class="footer-col">
        <p class="footer-col-head">About</p>
        <ul class="footer-col-links">
          <li><a href="about.html">About Us</a></li>
          <li><a href="about.html">Our Team</a></li>
          <li><a href="contact.html">FAQ</a></li>
        </ul>
      </div>
      <!-- Our Work -->
      <div class="footer-col">
        <p class="footer-col-head">Our Work</p>
        <ul class="footer-col-links">
          <li><a href="portfolio.html">Weddings &amp; Events</a></li>
          <li><a href="portfolio.html">Maternity &amp; Children</a></li>
          <li><a href="portfolio.html">Portraits</a></li>
          <li><a href="portfolio.html">Engagements</a></li>
        </ul>
      </div>
      <!-- Services + Search -->
      <div class="footer-col">
        <p class="footer-col-head">Services</p>
        <ul class="footer-col-links">
          <li><a href="contact.html">Wedding Photography</a></li>
          <li><a href="contact.html">Maternity Photos</a></li>
          <li><a href="contact.html">Portrait Sessions</a></li>
          <li><a href="contact.html">Event Coverage</a></li>
        </ul>
        <div class="footer-search-wrap">
          <div class="footer-search-box">
            <svg class="footer-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="footer-search-input" placeholder="Search ..." id="footer-search" autocomplete="off" aria-label="Search site">
            <div class="footer-search-dropdown" id="search-dropdown"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Bottom bar -->
    <div class="footer-bottom">
      <p class="footer-bottom-left">&#169; Copyright &ndash; 2026 Aura Films. Web Design &amp; SEO by <a href="#">Joel Varghese</a></p>
      <div class="footer-bottom-right">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
      </div>
    </div>
  </footer>`;
}

// ─────────────────────────────────────────────────────────
// SHARED JS (appended to every page's <script> block)
// ─────────────────────────────────────────────────────────
const SHARED_JS = `
/* ── Active nav link ── */
(function(){
  var links = document.querySelectorAll('.nav-links a');
  var path  = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(function(a){
    a.classList.remove('active');
    var href = a.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

/* ── Scroll to top ── */
(function(){
  var btn = document.getElementById('af-top');
  if (!btn) return;
  window.addEventListener('scroll', function(){ btn.classList.toggle('af-top-visible', window.scrollY > 380); }, {passive:true});
  btn.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
})();

/* ── Footer search ── */
(function(){
  var IDX = [
    {title:'Home',                  page:'Home Page',    url:'index.html',     tags:'photography cinematographer aura films portraits home'},
    {title:'Weddings & Events',     page:'Home · Works', url:'index.html',     tags:'wedding event ceremony reception couple'},
    {title:'Maternity & Children',  page:'Home · Works', url:'index.html',     tags:'maternity pregnancy baby newborn children family'},
    {title:'Portraits',             page:'Home · Works', url:'index.html',     tags:'portrait headshot individual professional'},
    {title:'Engagements & Proposals',page:'Home · Works',url:'index.html',     tags:'engagement proposal romantic couple love'},
    {title:'About Us',              page:'About',        url:'about.html',     tags:'about team photographers experience process story'},
    {title:'Our Process',           page:'About',        url:'about.html',     tags:'consultation preparation photoshoot editing delivery'},
    {title:'Portfolio Gallery',     page:'Portfolio',    url:'portfolio.html', tags:'gallery work portfolio photos images collection'},
    {title:'Contact Us',            page:'Contact',      url:'contact.html',   tags:'contact book session email phone reach inquire'},
    {title:'Wedding Photography',   page:'Services',     url:'contact.html',   tags:'wedding photography coverage ceremony'},
    {title:'Maternity Photography', page:'Services',     url:'contact.html',   tags:'maternity pregnancy session expecting'},
    {title:'Portrait Sessions',     page:'Services',     url:'contact.html',   tags:'portrait individual headshot professional'},
    {title:'Event Coverage',        page:'Services',     url:'contact.html',   tags:'event photography birthday corporate outdoor'},
    {title:'Brand Photography',     page:'Services',     url:'contact.html',   tags:'brand commercial business marketing product'},
    {title:'Kingston Photography',  page:'Info',         url:'about.html',     tags:'kingston ontario canada location based worldwide'},
  ];
  function search(q){
    if(!q||q.length<2) return [];
    var terms = q.toLowerCase().split(/\\s+/).filter(Boolean);
    var res = IDX.filter(function(item){
      var hay = (item.title+' '+item.page+' '+item.tags).toLowerCase();
      return terms.every(function(t){ return hay.indexOf(t)!==-1; });
    });
    res.sort(function(a,b){
      var aT = a.title.toLowerCase().indexOf(terms[0])!==-1 ? 1 : 0;
      var bT = b.title.toLowerCase().indexOf(terms[0])!==-1 ? 1 : 0;
      return bT - aT;
    });
    return res.slice(0,6);
  }
  var inp = document.getElementById('footer-search');
  var dd  = document.getElementById('search-dropdown');
  if(!inp||!dd) return;
  inp.addEventListener('input', function(){
    var q = this.value.trim();
    var res = search(q);
    if(!q){ dd.classList.remove('open'); dd.innerHTML=''; return; }
    dd.innerHTML = res.length
      ? res.map(function(r){
          return '<a href="'+r.url+'" class="search-result-item"><span class="search-result-title">'+r.title+'</span><span class="search-result-snippet">'+r.page+'</span></a>';
        }).join('')
      : '<div class="search-no-results">No results for "'+q.replace(/[<>]/g,'')+'". Try another search.</div>';
    dd.classList.add('open');
  });
  inp.addEventListener('blur',  function(){ setTimeout(function(){ dd.classList.remove('open'); }, 180); });
  inp.addEventListener('focus', function(){ if(this.value.trim()) dd.classList.add('open'); });
})();
`;

// ─────────────────────────────────────────────────────────
// SCROLL-TO-TOP BUTTON HTML (inserted just before </body>)
// ─────────────────────────────────────────────────────────
const TOP_BTN = `<button class="af-top" id="af-top" aria-label="Scroll to top">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
</button>`;

// ─────────────────────────────────────────────────────────
// PROCESS EACH PAGE
// ─────────────────────────────────────────────────────────
for (const file of ALL) {
  const path = `${ROOT}/${file}`;
  let html = await readFile(path, 'utf8');

  // 1. Add Cormorant Garamond font if not present (for column heads)
  if (!html.includes('Cormorant+Garamond') && html.includes('<link href="https://fonts.googleapis.com')) {
    html = html.replace(
      /(<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)(&display=swap")/,
      '$1&family=Cormorant+Garamond:ital,wght@1,400;1,500$2'
    );
  }

  // 2. Inject FOOTER_CSS before </style>
  if (!html.includes('═══ UNIVERSAL FOOTER ═══')) {
    html = html.replace('</style>', FOOTER_CSS + '\n  </style>');
  }

  // 3. Replace entire <footer>...</footer>
  html = html.replace(/<footer[\s\S]*?<\/footer>/g, buildFooterHTML(file));

  // 4. Add scroll-to-top button before </body>
  if (!html.includes('id="af-top"')) {
    html = html.replace('</body>', TOP_BTN + '\n</body>');
  }

  // 5. Fix broken JS: remove duplicate/orphaned DOMContentLoaded blocks
  // Strip everything after the first clean `});` that closes the first DOMContentLoaded
  html = html.replace(
    /(<script>[\s\S]*?function toggleTheme[\s\S]*?localStorage\.setItem[^\n]+\n\})\s*[\s\S]*?(<\/script>)/,
    (match, before, after) => {
      return before + '\n' + SHARED_JS + '\n' + after;
    }
  );

  // If the above didn't match (index.html has a different structure), add SHARED_JS before </script>
  if (!html.includes('Active nav link')) {
    html = html.replace(/<\/script>\s*<\/body>/, `\n${SHARED_JS}\n</script>\n</body>`);
  }

  await writeFile(path, html, 'utf8');
  console.log(`✓ ${file}`);
}

// ─────────────────────────────────────────────────────────
// INDEX.HTML SPECIFIC: remove bio-tagline
// ─────────────────────────────────────────────────────────
let idx = await readFile(`${ROOT}/index.html`, 'utf8');

// Remove bio-tagline line from HTML
idx = idx.replace(/\s*<p class="bio-tagline">[^<]*<\/p>\s*/g, '\n');

// Remove bio-tagline CSS
idx = idx.replace(/\s*\.bio-tagline\s*\{[^}]+\}\s*/g, '\n');

await writeFile(`${ROOT}/index.html`, idx, 'utf8');
console.log('✓ Removed bio-tagline from index.html');
console.log('\nAll done! ✓');
