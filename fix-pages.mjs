/**
 * fix-pages.mjs
 * - Fixes sticky nav (position: sticky) on all non-index pages
 * - Adds Investment link to nav
 * - Adds nav search button + CSS + JS
 * - Adds Instagram/Facebook brand colors
 * - Updates footer social icons with brand classes
 * - Adds footer social brand color CSS
 */
import { readFile, writeFile } from 'fs/promises';

const ROOT = 'C:/Users/joelk/.claude/sessions/.claude/worktrees/priceless-wilson';
const PAGES = ['about.html', 'portfolio.html', 'contact.html', 'portfolio-denim.html'];

const PAGE_ACTIVE = {
  'about.html': 'about.html',
  'portfolio.html': 'portfolio.html',
  'contact.html': 'contact.html',
  'portfolio-denim.html': 'portfolio.html',
};

// CSS to inject before </style>
const EXTRA_CSS = `
    /* ═══ STICKY NAV FIX ═══ */
    .site-nav { position: sticky !important; top: 0 !important; z-index: 200 !important; }

    /* ═══ ACTIVE NAV STYLE ═══ */
    .nav-links a.active { color: var(--text) !important; font-weight: 700 !important; border-bottom: 2px solid #ff4d00 !important; padding-bottom: 1px !important; }

    /* ═══ NAV SEARCH ═══ */
    .nav-search-btn { background: none; border: none; cursor: pointer; padding: 4px 6px; color: var(--text-muted); display: flex; align-items: center; border-radius: 6px; transition: color 0.2s, background 0.2s; flex-shrink: 0; }
    .nav-search-btn:hover { color: var(--text); background: var(--surface, #f4f4f4); }
    .nav-search-wrap { position: relative; display: flex; align-items: center; width: 0; overflow: hidden; transition: width 0.4s cubic-bezier(0.23,1,0.32,1); }
    .nav-search-wrap.open { width: 220px; overflow: visible; }
    .nav-search-input { width: 220px; padding: 7px 14px; background: var(--surface, #f4f4f4); border: 1px solid var(--border, rgba(0,0,0,0.09)); border-radius: 100px; outline: none; font-size: 12px; color: var(--text); font-family: 'DM Sans', sans-serif; opacity: 0; transform: scaleX(0.7); transform-origin: right; transition: opacity 0.3s cubic-bezier(0.23,1,0.32,1), transform 0.35s cubic-bezier(0.23,1,0.32,1), border-color 0.2s; }
    .nav-search-wrap.open .nav-search-input { opacity: 1; transform: scaleX(1); }
    .nav-search-input:focus { border-color: #ff4d00; }
    .nav-search-input::placeholder { color: var(--text-faint, #999); }
    .nav-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 260px; background: var(--surface, #f7f7f7); border: 1px solid var(--border, rgba(0,0,0,0.09)); border-radius: 10px; overflow: hidden; z-index: 300; max-height: 0; opacity: 0; pointer-events: none; transition: max-height 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.25s; box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
    .nav-dropdown.open { max-height: 320px; opacity: 1; pointer-events: auto; }
    .nav-drop-item { display: flex; flex-direction: column; gap: 2px; padding: 10px 14px; cursor: pointer; text-decoration: none; border-bottom: 1px solid var(--border, rgba(0,0,0,0.09)); transition: background 0.15s; }
    .nav-drop-item:last-child { border-bottom: none; }
    .nav-drop-item:hover { background: rgba(255,77,0,0.06); }
    .nav-drop-title { font-size: 13px; font-weight: 500; color: var(--text); }
    .nav-drop-page  { font-size: 11px; color: var(--text-faint, #999); }

    /* ═══ BRAND SOCIAL COLORS ═══ */
    .footer-social-ig { color: #E1306C !important; }
    .footer-social-ig:hover { color: #C13584 !important; }
    .footer-social-fb { color: #1877F2 !important; }
    .footer-social-fb:hover { color: #166FE5 !important; }
`;

// Nav HTML to replace (the nav-right div)
function buildNavRight(active) {
  return `  <div class="nav-right">
    <ul class="nav-links">
      <li><a href="index.html"${active==='index.html'?' class="active"':''}>Home</a></li>
      <li><a href="portfolio.html"${active==='portfolio.html'?' class="active"':''}>Portfolio</a></li>
      <li><a href="about.html"${active==='about.html'?' class="active"':''}>About Us</a></li>
      <li><a href="investment.html"${active==='investment.html'?' class="active"':''}>Investment</a></li>
      <li><a href="contact.html"${active==='contact.html'?' class="active"':''}>Contact Us</a></li>
    </ul>
    <div class="nav-search-wrap" id="nav-search-wrap">
      <input type="text" class="nav-search-input" id="nav-search-input" placeholder="Search anything…" autocomplete="off">
      <div class="nav-dropdown" id="nav-dropdown"></div>
    </div>
    <button class="nav-search-btn" id="nav-search-btn" aria-label="Search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </button>
    <button class="theme-switch" id="theme-btn" onclick="toggleTheme()" aria-label="Toggle dark/light mode">
      <span class="switch-thumb">
        <svg class="th-icon th-moon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="th-icon th-sun"  viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </span>
    </button>
  </div>`;
}

// Updated footer HTML
const NEW_FOOTER_HTML = `  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-body">
      <div class="footer-brand">
        <div>
          <img src="logo-black.png" class="footer-logo footer-logo-light" alt="Aura Films">
          <img src="logo-white.png" class="footer-logo footer-logo-dark"  alt="Aura Films">
        </div>
        <p class="footer-tagline">Shooting moments.<br>Preserving memories.</p>
        <div class="footer-socials">
          <a href="#" class="footer-social-icon footer-social-ig" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="#" class="footer-social-icon footer-social-fb" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
        </div>
        <div class="footer-contact-info">
          <div class="footer-contact-item">31 Bayswater Pl, Kingston, ON K7M 2B8</div>
          <div class="footer-contact-item"><a href="mailto:hello@aurafilms.ca">hello@aurafilms.ca</a></div>
          <div class="footer-contact-item"><a href="tel:+16135551234">+1 (613) 555-1234</a></div>
        </div>
      </div>
      <div class="footer-col">
        <p class="footer-col-head">About</p>
        <ul class="footer-col-links">
          <li><a href="about.html">About Us</a></li>
          <li><a href="about.html">Our Team</a></li>
          <li><a href="contact.html">FAQ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <p class="footer-col-head">Our Work</p>
        <ul class="footer-col-links">
          <li><a href="portfolio.html">Weddings &amp; Events</a></li>
          <li><a href="portfolio.html">Maternity &amp; Children</a></li>
          <li><a href="portfolio.html">Portraits</a></li>
          <li><a href="portfolio.html">Engagements</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <p class="footer-col-head">Services</p>
        <ul class="footer-col-links">
          <li><a href="investment.html">Wedding Photography</a></li>
          <li><a href="investment.html">Maternity Photos</a></li>
          <li><a href="investment.html">Portrait Sessions</a></li>
          <li><a href="investment.html">Event Coverage</a></li>
        </ul>
        <div class="footer-search-wrap">
          <div class="footer-search-box">
            <svg class="footer-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="footer-search-input" placeholder="Search anything…" id="footer-search" autocomplete="off">
            <div class="footer-search-dropdown" id="search-dropdown"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-bottom-left">&#169; Copyright &ndash; 2026 Aura Films. Web Design &amp; SEO by <a href="#">Joel Varghese</a></p>
      <div class="footer-bottom-right">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
      </div>
    </div>
  </footer>`;

// Footer CSS for pages that don't have the new footer CSS yet
const FOOTER_CSS = `
    /* ═══ NEW FOOTER LAYOUT ═══ */
    .footer { background: var(--footer-bg, #f4f4f4) !important; border-top: 1px solid var(--nav-br, rgba(0,0,0,0.1)) !important; padding: 68px 48px 0 !important; }
    .footer-body { display: grid !important; grid-template-columns: 1.4fr repeat(3,1fr) !important; gap: 48px !important; padding-bottom: 52px !important; border-bottom: 1px solid var(--nav-br, rgba(0,0,0,0.1)) !important; }
    .footer-brand { display: flex !important; flex-direction: column !important; gap: 20px !important; }
    .footer-tagline { font-family: 'Cormorant Garamond', Georgia, serif !important; font-style: italic !important; font-size: 15px !important; color: var(--text-muted) !important; line-height: 1.6 !important; max-width: 200px !important; }
    .footer-socials { display: flex !important; gap: 10px !important; margin-top: 4px !important; }
    .footer-social-icon { width: 34px !important; height: 34px !important; border-radius: 50% !important; border: 1px solid var(--nav-br, rgba(0,0,0,0.1)) !important; display: flex !important; align-items: center !important; justify-content: center !important; transition: border-color 0.2s, background 0.2s !important; }
    .footer-contact-info { display: flex !important; flex-direction: column !important; gap: 5px !important; }
    .footer-contact-item { font-size: 12px !important; color: var(--text-muted) !important; line-height: 1.6 !important; }
    .footer-col { display: flex !important; flex-direction: column !important; }
    .footer-col-head { font-size: 11px !important; font-weight: 700 !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; color: var(--text) !important; margin-bottom: 22px !important; }
    .footer-col-links { list-style: none !important; display: flex !important; flex-direction: column !important; gap: 13px !important; }
    .footer-col-links a { font-size: 14px !important; color: var(--text-muted) !important; transition: color 0.2s !important; }
    .footer-col-links a:hover { color: var(--text) !important; }
    .footer-search-wrap { margin-top: 28px !important; }
    .footer-search-box { position: relative !important; }
    .footer-search-input { width: 100% !important; padding: 10px 14px 10px 36px !important; background: rgba(0,0,0,0.07) !important; border: 1.5px solid rgba(0,0,0,0.18) !important; border-radius: 10px !important; outline: none !important; font-size: 13px !important; color: var(--text) !important; font-family: 'DM Sans', sans-serif !important; }
    [data-theme="dark"] .footer-search-input { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.2) !important; }
    .footer-search-input::placeholder { color: var(--text-muted) !important; }
    .footer-search-input:focus { border-color: #ff4d00 !important; }
    .footer-search-icon { position: absolute !important; left: 10px !important; top: 50% !important; transform: translateY(-50%) !important; color: var(--text-muted) !important; pointer-events: none !important; }
    .footer-search-dropdown { position: absolute !important; top: calc(100% + 6px) !important; left: 0 !important; right: 0 !important; background: var(--surface, #f7f7f7) !important; border: 1px solid var(--border, rgba(0,0,0,0.09)) !important; border-radius: 8px !important; overflow: hidden !important; max-height: 0 !important; opacity: 0 !important; transition: max-height 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.25s !important; z-index: 60 !important; box-shadow: 0 10px 36px rgba(0,0,0,0.1) !important; }
    .footer-search-dropdown.open { max-height: 300px !important; opacity: 1 !important; }
    .search-result-item { display: flex !important; flex-direction: column !important; gap: 2px !important; padding: 10px 14px !important; cursor: pointer !important; text-decoration: none !important; border-bottom: 1px solid var(--border, rgba(0,0,0,0.09)) !important; transition: background 0.15s !important; }
    .search-result-item:hover { background: rgba(255,77,0,0.06) !important; }
    .search-result-title { font-size: 13px !important; font-weight: 500 !important; color: var(--text) !important; }
    .search-result-snippet { font-size: 11px !important; color: var(--text-faint, #999) !important; }
    .footer-bottom { padding: 18px 0 22px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 16px !important; }
    .footer-bottom-left { font-size: 12px !important; color: var(--text-faint, #999) !important; }
    .footer-bottom-left a { color: var(--text-faint, #999) !important; text-decoration: underline !important; text-underline-offset: 2px !important; }
    .footer-bottom-right { display: flex !important; gap: 20px !important; }
    .footer-bottom-right a { font-size: 12px !important; color: var(--text-muted) !important; transition: color 0.2s !important; }
    .footer-bottom-right a:hover { color: var(--text) !important; }
    /* Scroll top btn */
    .af-top { position: fixed !important; bottom: 28px !important; right: 28px !important; width: 44px !important; height: 44px !important; border-radius: 50% !important; border: 1px solid rgba(255,255,255,0.5) !important; background: rgba(255,255,255,0.45) !important; backdrop-filter: blur(16px) saturate(160%) !important; -webkit-backdrop-filter: blur(16px) saturate(160%) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.8) !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; color: var(--text) !important; opacity: 0 !important; pointer-events: none !important; transform: translateY(12px) !important; transition: opacity 0.35s cubic-bezier(0.23,1,0.32,1), transform 0.35s cubic-bezier(0.23,1,0.32,1) !important; z-index: 500 !important; }
    .af-top.af-top-visible { opacity: 1 !important; pointer-events: auto !important; transform: translateY(0) !important; }
    [data-theme="dark"] .af-top { background: rgba(40,40,40,0.7) !important; border-color: rgba(255,255,255,0.1) !important; }
`;

// Search + nav search JS to append before </script>
const NAV_SEARCH_JS = `
/* ── Shared search index ── */
var AF_IDX = [
  {title:'Home',page:'Home',url:'index.html',tags:'photography cinematographer aura films portraits home'},
  {title:'About Us',page:'About',url:'about.html',tags:'about team photographers experience process story history'},
  {title:'Portfolio',page:'Portfolio',url:'portfolio.html',tags:'gallery work portfolio photos images collection browse'},
  {title:'Contact Us',page:'Contact',url:'contact.html',tags:'contact book session email phone reach inquire hire'},
  {title:'Investment & Pricing',page:'Investment',url:'investment.html',tags:'price pricing packages rates investment cost budget wedding portrait event'},
  {title:'Wedding Packages',page:'Investment',url:'investment.html',tags:'wedding photography package basic standard premium price cad'},
  {title:'Portrait Sessions',page:'Investment',url:'investment.html',tags:'portrait session solo headshot price package'},
  {title:'Event Coverage',page:'Investment',url:'investment.html',tags:'event corporate general coverage package hourly'},
  {title:'Family Sessions',page:'Investment',url:'investment.html',tags:'family session children group portrait package'},
  {title:'Add-On Services',page:'Investment',url:'investment.html',tags:'drone footage rush delivery extra photos reel add on'},
  {title:'Weddings & Events',page:'Home Works',url:'index.html',tags:'wedding event ceremony reception couple bride groom'},
  {title:'Maternity & Children',page:'Home Works',url:'index.html',tags:'maternity pregnancy baby newborn children family expecting'},
];
function afSearch(q){
  if(!q||q.length<2) return [];
  var terms=q.toLowerCase().split(/\\s+/).filter(Boolean);
  var res=AF_IDX.filter(function(item){
    var hay=(item.title+' '+item.page+' '+item.tags).toLowerCase();
    return terms.every(function(t){ return hay.indexOf(t)!==-1; });
  });
  return res.slice(0,6);
}

/* ── Nav search ── */
(function(){
  var btn=document.getElementById('nav-search-btn');
  var wrap=document.getElementById('nav-search-wrap');
  var inp=document.getElementById('nav-search-input');
  var dd=document.getElementById('nav-dropdown');
  if(!btn||!wrap||!inp||!dd) return;
  btn.addEventListener('click',function(){ wrap.classList.toggle('open'); if(wrap.classList.contains('open')){ setTimeout(function(){ inp.focus(); },80); } else { dd.classList.remove('open'); inp.value=''; } });
  inp.addEventListener('input',function(){
    var q=this.value.trim(); var res=afSearch(q);
    if(!q){ dd.classList.remove('open'); dd.innerHTML=''; return; }
    dd.innerHTML=res.length?res.map(function(r){ return '<a href="'+r.url+'" class="nav-drop-item"><span class="nav-drop-title">'+r.title+'</span><span class="nav-drop-page">'+r.page+'</span></a>'; }).join(''):'<div class="nav-drop-item"><span class="nav-drop-title" style="color:var(--text-faint)">No results found</span></div>';
    dd.classList.add('open');
  });
  inp.addEventListener('blur',function(){ setTimeout(function(){ dd.classList.remove('open'); },180); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ wrap.classList.remove('open'); dd.classList.remove('open'); inp.value=''; } });
})();

/* ── Footer search ── */
(function(){
  var inp=document.getElementById('footer-search');
  var dd=document.getElementById('search-dropdown');
  if(!inp||!dd) return;
  inp.addEventListener('input',function(){
    var q=this.value.trim(); var res=afSearch(q);
    if(!q){ dd.classList.remove('open'); dd.innerHTML=''; return; }
    dd.innerHTML=res.length?res.map(function(r){ return '<a href="'+r.url+'" class="search-result-item"><span class="search-result-title">'+r.title+'</span><span class="search-result-snippet">'+r.page+'</span></a>'; }).join(''):'<div style="padding:14px;font-size:13px;color:var(--text-faint);text-align:center">No results found</div>';
    dd.classList.add('open');
  });
  inp.addEventListener('blur',function(){ setTimeout(function(){ dd.classList.remove('open'); },180); });
  inp.addEventListener('focus',function(){ if(this.value.trim()) dd.classList.add('open'); });
})();

/* ── Scroll to top ── */
(function(){
  var btn=document.getElementById('af-top');
  if(!btn) return;
  window.addEventListener('scroll',function(){ btn.classList.toggle('af-top-visible',window.scrollY>380); },{passive:true});
  btn.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
})();
`;

const SCROLL_TOP_BTN = `<button class="af-top" id="af-top" aria-label="Scroll to top">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
</button>`;

for (const page of PAGES) {
  const path = `${ROOT}/${page}`;
  let html = await readFile(path, 'utf8');
  const active = PAGE_ACTIVE[page];

  // 1. Inject extra CSS before </style>
  html = html.replace('</style>', EXTRA_CSS + FOOTER_CSS + '\n  </style>');

  // 2. Replace nav-right block
  const navRightMatch = html.match(/<div class="nav-right">[\s\S]*?<\/div>\s*<\/nav>/);
  if (navRightMatch) {
    html = html.replace(navRightMatch[0], buildNavRight(active) + '\n</nav>');
  }

  // 3. Replace footer
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/);
  if (footerMatch) {
    html = html.replace(footerMatch[0], NEW_FOOTER_HTML);
  }

  // 4. Add scroll-to-top button + nav search JS before </body>
  if (!html.includes('af-top')) {
    html = html.replace('</body>', SCROLL_TOP_BTN + '\n</body>');
  }
  if (!html.includes('afSearch')) {
    html = html.replace('</script>', NAV_SEARCH_JS + '\n</script>');
  }

  // 5. Fix toggleTheme (ensure it doesn't set textContent)
  html = html.replace(/if\s*\(b\)\s*b\.textContent\s*=.+/g, '');

  await writeFile(path, html, 'utf8');
  console.log(`✓ Updated ${page}`);
}

console.log('All done!');
