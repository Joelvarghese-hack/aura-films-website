import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = __dirname;

// ─── SHARED THEME CSS ───────────────────────────────────────────────────────
const THEME_CSS = `
    /* ====== THEME VARIABLES ====== */
    :root {
      --bg: #ffffff;
      --text: #0a0a0a;
      --text-muted: #595959;
      --text-faint: #999;
      --surface: #f4f4f4;
      --card-th: #ebebeb;
      --nav-bg: rgba(255,255,255,0.95);
      --nav-br: rgba(0,0,0,0.09);
      --footer-bg: #f4f4f4;
      --cta-bg: #efefef;
      --btn-bg: #0a0a0a;
      --btn-fg: #ffffff;
    }
    [data-theme="dark"] {
      --bg: #000;
      --text: #fff;
      --text-muted: #aaa;
      --text-faint: #606060;
      --surface: #050505;
      --card-th: #0f0f0f;
      --nav-bg: rgba(0,0,0,0.92);
      --nav-br: #1c1c1c;
      --footer-bg: #050505;
      --cta-bg: #050505;
      --btn-bg: #fff;
      --btn-fg: #000;
    }

    /* ====== THEME ELEMENT OVERRIDES ====== */
    body { background: var(--bg) !important; color: var(--text); transition: background 0.3s, color 0.3s; }
    .site-nav { background: var(--nav-bg) !important; border-bottom: 1px solid var(--nav-br) !important; }
    .nav-contact a, .nav-contact span { color: var(--text-muted) !important; }
    .nav-contact a:hover { color: var(--text) !important; }
    .nav-location { color: var(--text-muted) !important; }
    .nav-links-list a { color: var(--text-muted) !important; }
    .nav-links-list a:hover, .nav-links-list a.active { color: var(--text) !important; }
    .nav-logo-img { filter: none !important; mix-blend-mode: normal !important; }
    [data-theme="dark"] .nav-logo-img { filter: invert(1) !important; mix-blend-mode: screen !important; }

    .section { border-top-color: var(--nav-br) !important; }
    .section-name { color: var(--text) !important; }
    .bio-section p, .bio-wrap p { color: var(--text-muted) !important; }
    .service-item { border-bottom-color: var(--nav-br) !important; }
    .service-item:first-child { border-top-color: var(--nav-br) !important; }
    .service-name { color: var(--text-muted) !important; }
    .service-item.highlight .service-name { color: var(--text) !important; }
    .service-item:hover .service-name { color: var(--text) !important; }
    .collab-logo { color: rgba(0,0,0,0.22) !important; }
    [data-theme="dark"] .collab-logo { color: rgba(255,255,255,0.28) !important; }
    .collab-logo:hover { color: rgba(0,0,0,0.7) !important; }
    [data-theme="dark"] .collab-logo:hover { color: rgba(255,255,255,0.65) !important; }
    .work-card { background: var(--card-th) !important; }
    .capture-text-col { background: var(--surface) !important; }
    .capture-article-title { color: var(--text) !important; }
    .capture-article-desc, .capture-collab-row { color: var(--text-muted) !important; }
    .capture-photo-col { background: var(--card-th) !important; }
    .stats-bar { border-color: var(--nav-br) !important; }
    .stat-box { border-right-color: var(--nav-br) !important; }
    .stat-value { color: var(--text) !important; }
    .stat-label { color: var(--text-muted) !important; }
    .p-card { background: var(--surface) !important; }
    [data-theme="dark"] .p-card { background: #0f0f0f !important; }
    .p-num { color: var(--text) !important; }
    .p-desc { color: var(--text-muted) !important; }
    .tool-row { border-color: var(--nav-br) !important; }
    .tool-name-text { color: var(--text) !important; }
    .tool-cat { color: var(--text-muted) !important; }
    .trust-stat-val { color: var(--text) !important; }
    .trust-stat-label { color: var(--text-muted) !important; }
    .trust-profile-card { background: rgba(0,0,0,0.04) !important; border-color: var(--nav-br) !important; }
    [data-theme="dark"] .trust-profile-card { background: rgba(255,255,255,0.04) !important; }
    .trust-name { color: var(--text) !important; }
    .trust-role-sm { color: var(--text-muted) !important; }
    .trust-quote { color: var(--text-muted) !important; }
    .trust-testimonial { background: var(--surface) !important; border-color: var(--nav-br) !important; }
    [data-theme="dark"] .trust-testimonial { background: #0f0f0f !important; }
    .testimonial-text { color: var(--text-muted) !important; }
    .testimonial-name { color: var(--text) !important; }
    .testimonial-title { color: var(--text-faint) !important; }
    .lens-img-wrap { background: var(--card-th) !important; }
    .gallery-item { background: var(--card-th) !important; }
    .btn-ghost { border-color: rgba(0,0,0,0.18) !important; color: var(--text) !important; }
    [data-theme="dark"] .btn-ghost { border-color: rgba(255,255,255,0.22) !important; color: #fff !important; }
    .btn-ghost:hover { border-color: var(--accent) !important; color: var(--accent) !important; }
    .btn-ghost:active { transform: scale(0.97); }
    .btn-pill { background: var(--btn-bg) !important; color: var(--btn-fg) !important; }
    .pill-icon { background: var(--bg) !important; color: var(--text) !important; }
    [data-theme="dark"] .pill-icon { background: #000 !important; color: #fff !important; }
    .btn-pill:hover { background: var(--accent) !important; color: #fff !important; }
    .btn-pill:hover .pill-icon { background: rgba(255,255,255,0.2) !important; }
    .btn-pill:active { transform: scale(0.97); }
    .cta-section { background: var(--cta-bg) !important; border-top-color: var(--nav-br) !important; }
    .cta-headline { color: var(--text) !important; }
    .cta-sub { color: var(--text-muted) !important; }
    .cta-right-card { background: rgba(0,0,0,0.04) !important; border-color: rgba(0,0,0,0.08) !important; }
    [data-theme="dark"] .cta-right-card { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.08) !important; }
    .cta-card-name { color: var(--text) !important; }
    .cta-card-role { color: var(--text-muted) !important; }
    .badge-sm { background: rgba(0,0,0,0.06) !important; color: var(--text-muted) !important; }
    [data-theme="dark"] .badge-sm { background: rgba(255,255,255,0.1) !important; }
    .footer { background: var(--footer-bg) !important; border-top-color: var(--nav-br) !important; }
    .footer-main { border-bottom-color: var(--nav-br) !important; }
    .footer-you-can { color: var(--text-muted) !important; }
    .footer-big-email { color: var(--text) !important; }
    .footer-quote { color: var(--text-muted) !important; }
    .footer-quote-auth { color: var(--text-faint) !important; }
    .footer-col-head { color: var(--text) !important; }
    .footer-col-links a { color: var(--text-muted) !important; }
    .footer-col-links a:hover { color: var(--text) !important; }
    .footer-privacy { color: var(--text-faint) !important; }
    .footer-privacy a { color: var(--text-muted) !important; }
    .footer-privacy a:hover { color: var(--text) !important; }
    .page-header { border-bottom-color: var(--nav-br) !important; }
    .page-title { color: var(--text) !important; }
    .portfolio-list { border-top-color: var(--nav-br) !important; }
    .portfolio-item { border-bottom-color: var(--nav-br) !important; }
    .portfolio-title { color: var(--text) !important; }
    .portfolio-desc { color: var(--text-muted) !important; }
    .meta-label { color: var(--text-faint) !important; }
    .meta-value { color: var(--text-muted) !important; }
    .date-badge { background: rgba(0,0,0,0.07) !important; color: var(--text-muted) !important; }
    [data-theme="dark"] .date-badge { background: rgba(255,255,255,0.08) !important; color: rgba(255,255,255,0.5) !important; }
    .form-input { background: var(--surface) !important; color: var(--text) !important; border-color: var(--nav-br) !important; }
    [data-theme="dark"] .form-input { background: #111 !important; border-color: #1c1c1c !important; }
    .form-label { color: var(--text-muted) !important; }
    .services-label { color: var(--text-muted) !important; }
    .service-pill { background: var(--surface) !important; color: var(--text-muted) !important; border-color: var(--nav-br) !important; }
    [data-theme="dark"] .service-pill { background: #111 !important; border-color: #333 !important; }
    .service-pill.selected { background: var(--btn-bg) !important; color: var(--btn-fg) !important; border-color: var(--btn-bg) !important; }
    .btn-send { background: var(--btn-bg) !important; color: var(--btn-fg) !important; }
    .contact-blurb { color: var(--text-muted) !important; }
    .contact-profile-card { background: rgba(0,0,0,0.04) !important; border-color: var(--nav-br) !important; }
    [data-theme="dark"] .contact-profile-card { background: rgba(255,255,255,0.04) !important; border-color: #1c1c1c !important; }
    .contact-card-name { color: var(--text) !important; }
    .contact-card-role { color: var(--text-muted) !important; }
    .contact-phone { color: var(--text) !important; }
    .contact-big-email { color: var(--text) !important; }
    .studios-section { border-color: var(--nav-br) !important; }
    .studios-label { color: var(--text-muted) !important; border-right-color: var(--nav-br) !important; }
    .studio-entry { border-right-color: var(--nav-br) !important; }
    .studio-name { color: var(--text) !important; }
    .studio-addr { color: var(--text-muted) !important; }
    .project-meta-grid { background: var(--surface) !important; border-color: var(--nav-br) !important; }
    [data-theme="dark"] .project-meta-grid { background: #0a0a0a !important; }
    .meta-item-label { color: var(--text-faint) !important; }
    .meta-item-val { color: var(--text) !important; }
    .gear-card { background: var(--surface) !important; border-color: var(--nav-br) !important; }
    [data-theme="dark"] .gear-card { background: #111 !important; border-color: #1c1c1c !important; }
    .gear-name { color: var(--text) !important; }
    .gear-detail { color: var(--text-muted) !important; }
    .back-link { color: var(--text-muted) !important; }
    .project-title-lg { color: var(--text) !important; }
    .project-desc { color: var(--text-muted) !important; }
    .more-works { border-top-color: var(--nav-br) !important; }

    /* ====== SMOOTH IMAGE HOVER ====== */
    .work-card-img { transition: transform 0.55s cubic-bezier(0.23,1,0.32,1) !important; }
    .gallery-item img { transition: transform 0.55s cubic-bezier(0.23,1,0.32,1) !important; }
    .lens-img-wrap img { transition: transform 0.55s cubic-bezier(0.23,1,0.32,1) !important; }

    /* ====== HERO ENTRY ANIMATIONS ====== */
    @keyframes af-up {
      from { opacity: 0; transform: translateY(22px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes af-in { from { opacity: 0; } to { opacity: 1; } }
    .hero-tag   { opacity:0; animation: af-up 0.5s cubic-bezier(0.23,1,0.32,1) 0.08s forwards; }
    .hero-title { opacity:0; animation: af-up 0.65s cubic-bezier(0.23,1,0.32,1) 0.18s forwards; }
    .hero-profile-row { opacity:0; animation: af-up 0.5s cubic-bezier(0.23,1,0.32,1) 0.33s forwards; }
    .hero-bio   { opacity:0; animation: af-up 0.5s cubic-bezier(0.23,1,0.32,1) 0.28s forwards; }
    .nav-links-list li { opacity:0; animation: af-up 0.38s cubic-bezier(0.23,1,0.32,1) forwards; }
    .nav-links-list li:nth-child(1) { animation-delay: 0.12s; }
    .nav-links-list li:nth-child(2) { animation-delay: 0.17s; }
    .nav-links-list li:nth-child(3) { animation-delay: 0.22s; }
    .nav-links-list li:nth-child(4) { animation-delay: 0.27s; }

    /* ====== SCROLL REVEAL ====== */
    .af-reveal { opacity: 0; transform: translateY(18px); }
    .af-reveal.af-visible { animation: af-up 0.55s cubic-bezier(0.23,1,0.32,1) forwards; }

    /* ====== THEME TOGGLE BUTTON ====== */
    .theme-toggle {
      display:inline-flex; align-items:center; justify-content:center;
      width:28px; height:28px; border-radius:50%;
      border:1px solid var(--nav-br); background:transparent; cursor:pointer;
      font-size:14px; line-height:1;
      transition: border-color 0.2s, transform 0.15s cubic-bezier(0.23,1,0.32,1), background 0.2s;
      color:var(--text); margin-top:5px; flex-shrink:0;
    }
    .theme-toggle:hover { border-color:var(--accent); background:rgba(255,77,0,0.06); }
    .theme-toggle:active { transform: scale(0.88); }

    @media (prefers-reduced-motion: reduce) {
      .af-reveal, .af-reveal.af-visible,
      .hero-tag, .hero-title, .hero-profile-row, .hero-bio,
      .nav-links-list li { animation: none !important; opacity: 1 !important; transform: none !important; }
    }
`;

const THEME_INIT = '<script>(function(){var t=localStorage.getItem(\'af-theme\')||\'light\';document.documentElement.setAttribute(\'data-theme\',t);})();<\/script>';

const TOGGLE_BTN = '<button class="theme-toggle" id="theme-btn" onclick="toggleTheme()" aria-label="Toggle theme" title="Toggle dark/light mode">\uD83C\uDF19<\/button>';

const THEME_JS = `<script>
function toggleTheme(){
  var h=document.documentElement;
  var t=h.getAttribute('data-theme')==='dark'?'light':'dark';
  h.setAttribute('data-theme',t);
  localStorage.setItem('af-theme',t);
  var b=document.getElementById('theme-btn');
  if(b)b.textContent=t==='dark'?'\u2600\uFE0F':'\uD83C\uDF19';
}
document.addEventListener('DOMContentLoaded',function(){
  var b=document.getElementById('theme-btn');
  if(b)b.textContent=(localStorage.getItem('af-theme')||'light')==='dark'?'\u2600\uFE0F':'\uD83C\uDF19';
  var els=document.querySelectorAll('.af-reveal');
  if(!els.length||!('IntersectionObserver' in window)){
    els.forEach(function(el){el.style.opacity='1';el.style.transform='none';});return;
  }
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var d=parseInt(e.target.dataset.delay||0);
        setTimeout(function(){e.target.classList.add('af-visible');},d);
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.07,rootMargin:'0px 0px -28px 0px'});
  els.forEach(function(el){obs.observe(el);});
});
<\/script>`;

const files = ['index.html','about.html','portfolio.html','my-shots.html','contact.html','portfolio-denim.html'];

files.forEach(filename => {
  const fp = path.join(BASE, filename);
  let h = fs.readFileSync(fp, 'utf8');

  // 1. theme init in head
  h = h.replace('</head>', THEME_INIT + '\n</head>');
  // 2. inject theme CSS before </style>
  h = h.replace('</style>', THEME_CSS + '\n  </style>');
  // 3. toggle button in nav
  h = h.replace('</ul>\n    </div>\n  </nav>', '</ul>\n      ' + TOGGLE_BTN + '\n    </div>\n  </nav>');
  h = h.replace('</ul>\n      </div>\n  </nav>', '</ul>\n        ' + TOGGLE_BTN + '\n      </div>\n  </nav>');
  // 4. JS before </body>
  h = h.replace('</body>', THEME_JS + '\n</body>');

  // ─── FILE-SPECIFIC IMAGE REPLACEMENTS ──────────────────────────────────

  if (filename === 'index.html') {
    h = h.replace('src="https://placehold.co/1440x900/1a0800/2d1200?text=."',
      'src="images/_DSC8015.jpg" style="object-position:center 18%;"');
    h = h.replace(/src="https:\/\/placehold\.co\/80x80\/333\/555\?text=TJ"/g,
      'src="images/_DSC8049.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x525/0d0d1a/1a1a2a?text=."',
      'src="images/_DSC8049.jpg" style="object-position:top center;"');
    h = h.replace('src="https://placehold.co/700x525/120e08/1e1610?text=."',
      'src="images/_DSC7794.jpeg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x525/0a100a/141e14?text=."',
      'src="images/_DSC7545.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x525/1a0a00/2a1400?text=."',
      'src="images/_DSC7798.jpeg" style="object-position:center 25%;"');
    h = h.replace('src="https://placehold.co/700x480/0d0d0d/1a1a1a?text=."',
      'src="images/_DSC8307.jpg" style="object-position:top;"');
    h = h.replace(/src="https:\/\/placehold\.co\/60x60\/444\/666\?text=\."/g,
      'src="images/IMG_9115.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/460x615/111a0d/1a2a14?text=."',
      'src="images/_DSC8215.jpg"');
    h = h.replace('src="https://placehold.co/460x345/0d1a1a/142626?text=."',
      'src="images/_DSC8577.jpg" style="object-position:center 25%;"');
    h = h.replace('src="https://placehold.co/460x615/1a0d0d/2a1414?text=."',
      'src="images/_DSC7542.jpg"');
    h = h.replace('src="https://placehold.co/460x345/0d0d1a/141426?text=."',
      'src="images/_DSC7860.jpeg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/460x307/1a1a0d/262614?text=."',
      'src="images/_DSC8637.jpg" style="object-position:center 20%;"');
    h = h.replace('src="https://placehold.co/460x615/0d1a0d/142614?text=."',
      'src="images/_DSC8672.jpg"');
    h = h.replace('src="https://placehold.co/700x600/050505/0a0a0a?text=."',
      'src="images/_DSC8015.jpg" style="object-position:right center;"');
    // Add scroll reveal attrs
    h = h.replace('class="bio-section section"', 'class="bio-section section af-reveal"');
  }

  if (filename === 'about.html') {
    h = h.replace('src="https://placehold.co/1440x900/0d0800/1a1000?text=."',
      'src="images/_DSC8307.jpg" style="object-position:center 20%;"');
    h = h.replace('src="https://placehold.co/700x480/1a0800/2d1400?text=."',
      'src="images/_DSC7860.jpeg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x480/000d1a/001428?text=."',
      'src="images/_DSC7883.jpeg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x480/0a0a0a/141414?text=."',
      'src="images/_DSC7542.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x480/100500/1a0a00?text=."',
      'src="images/_DSC8672.jpg" style="object-position:top;"');
    h = h.replace(/src="https:\/\/placehold\.co\/80x80\/333\/555\?text=TJ"/g,
      'src="images/_DSC8049.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x600/050505/0a0a0a?text=."',
      'src="images/_DSC8015.jpg" style="object-position:right center;"');
  }

  if (filename === 'portfolio.html') {
    h = h.replace('src="https://placehold.co/600x450/0d0d1a/1a1a2e?text=."',
      'src="images/_DSC8015.jpg" style="object-position:center top;"');
    h = h.replace('src="https://placehold.co/600x450/12100a/1e1a10?text=."',
      'src="images/_DSC7794.jpeg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/600x450/0a100a/121a12?text=."',
      'src="images/_DSC7545.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/600x450/1a0a00/2a1200?text=."',
      'src="images/_DSC7798.jpeg" style="object-position:center 20%;"');
    h = h.replace('src="https://placehold.co/600x450/0e0e0a/181810?text=."',
      'src="images/IMG_9115.jpg" style="object-position:top center;"');
    h = h.replace('src="https://placehold.co/600x450/0f0f10/181820?text=."',
      'src="images/_DSC8307.jpg" style="object-position:top;"');
    h = h.replace(/src="https:\/\/placehold\.co\/80x80\/333\/555\?text=TJ"/g,
      'src="images/_DSC8049.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x600/050505/0a0a0a?text=."',
      'src="images/_DSC8015.jpg" style="object-position:right center;"');
  }

  if (filename === 'my-shots.html') {
    h = h.replace('src="https://placehold.co/700x940/111a0d/1a2a14?text=."',
      'src="images/_DSC8015.jpg" style="object-position:center top;"');
    h = h.replace('src="https://placehold.co/700x480/0d1a1a/142626?text=."',
      'src="images/IMG_9115.jpg" style="object-position:center 18%;"');
    h = h.replace('src="https://placehold.co/700x480/0a100a/141e14?text=."',
      'src="images/_DSC7542.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x940/1a0d0d/2a1414?text=."',
      'src="images/_DSC7798.jpeg" style="object-position:center 15%;"');
    h = h.replace('src="https://placehold.co/700x480/0e0a06/1a1208?text=."',
      'src="images/_DSC8307.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x480/0d0d1a/141426?text=."',
      'src="images/_DSC8215.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x940/100808/1e1010?text=."',
      'src="images/_DSC8049.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x480/160d08/221410?text=."',
      'src="images/_DSC7860.jpeg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x480/181a0a/242c10?text=."',
      'src="images/_DSC7794.jpeg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x480/0a0a0e/14141e?text=."',
      'src="images/_DSC7545.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x480/1a0e00/2a1800?text=."',
      'src="images/_DSC8577.jpg" style="object-position:center 20%;"');
    h = h.replace('src="https://placehold.co/700x940/0e0e12/18181e?text=."',
      'src="images/_DSC8672.jpg" style="object-position:top;"');
    // remaining
    h = h.replace(/src="https:\/\/placehold\.co\/[^"]+\?text=\."/g,
      'src="images/_DSC8637.jpg" style="object-position:center 20%;"');
    h = h.replace(/src="https:\/\/placehold\.co\/80x80\/333\/555\?text=TJ"/g,
      'src="images/_DSC8049.jpg" style="object-position:top;"');
  }

  if (filename === 'contact.html') {
    h = h.replace('src="https://placehold.co/1440x700/0d0505/1a0808?text=."',
      'src="images/_DSC8577.jpg" style="object-position:center 25%;"');
    h = h.replace('src="https://placehold.co/80x80/333/555?text=TJ"',
      'src="images/_DSC8049.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/1440x280/1a0800/2d1200?text=."',
      'src="images/IMG_9115.jpg" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;"');
    h = h.replace(/src="https:\/\/placehold\.co\/80x80\/333\/555\?text=TJ"/g,
      'src="images/_DSC8049.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x600/050505/0a0a0a?text=."',
      'src="images/_DSC8015.jpg" style="object-position:right center;"');
  }

  if (filename === 'portfolio-denim.html') {
    h = h.replace('src="https://placehold.co/1440x810/0a0d1a/12162a?text=."',
      'src="images/_DSC8015.jpg" style="object-position:center top;"');
    h = h.replace('src="https://placehold.co/700x525/0d1020/141828?text=."',
      'src="images/_DSC8049.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x525/101420/181e30?text=."',
      'src="images/_DSC7542.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x525/0c1018/121620?text=."',
      'src="images/_DSC7545.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x525/0e1222/141a30?text=."',
      'src="images/_DSC8307.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/1440x810/080c18/0e1220?text=."',
      'src="images/IMG_9115.jpg" style="object-position:center 20%;"');
    h = h.replace('src="https://placehold.co/700x525/0b0f1e/121626?text=."',
      'src="images/_DSC8215.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x525/0d1124/141a2e?text=."',
      'src="images/_DSC8577.jpg" style="object-position:center 20%;"');
    h = h.replace('src="https://placehold.co/700x525/12100a/1e1a10?text=."',
      'src="images/_DSC7794.jpeg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x525/0a100a/121a12?text=."',
      'src="images/_DSC7798.jpeg" style="object-position:center 15%;"');
    h = h.replace(/src="https:\/\/placehold\.co\/80x80\/333\/555\?text=TJ"/g,
      'src="images/_DSC8049.jpg" style="object-position:top;"');
    h = h.replace('src="https://placehold.co/700x600/050505/0a0a0a?text=."',
      'src="images/_DSC8015.jpg" style="object-position:right center;"');
  }

  fs.writeFileSync(fp, h, 'utf8');
  console.log('OK', filename);
});

console.log('\nAll files transformed.');
