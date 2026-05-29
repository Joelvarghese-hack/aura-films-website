import { readFile, writeFile } from 'fs/promises';
const ALL = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html',
  'cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','cat-events.html'];

const CDN = `  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,600,700,800,900&f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet">`;

const OVERRIDE = `
    /* ════════ FINAL SYSTEM OVERRIDE ════════ */
    /* Fonts: Cabinet Grotesk (display) · Satoshi (body) · Geist Mono (labels) · Pinyon Script (signature) */
    body, p, li, span, a, label, input, textarea, select, button, blockquote, div, td, th { font-family: 'Satoshi', sans-serif; }
    h1,h2,h3,h4,h5,.hero-title,.section-title,.section-name,.works-section-title,.work-category,
    .port-hero-title,.about-title,.cat-name,.cat-page-title,.team-name,.pkg-section-title,.pkg-name,
    .cta-headline,.cta-band-title,.cta-title,.disc-amount,.inv-hero-title,.bio-copy,.stat-num,
    .package-price,.pkg-price-num,.team-title,.more-cats-title { font-family: 'Cabinet Grotesk', sans-serif; }
    .hero-eyebrow,.about-eyebrow,.port-hero-eyebrow,.cat-page-eyebrow,.pkg-tier,.service-label,
    .services-label,.form-label,.footer-col-head,.date-badge,.nav-links a,.cat-count,.meta-label,
    .work-num,.tool-cat,.cat-arrow,.footer-bottom-left,.footer-bottom-right,.contact-ig-link { font-family: 'Geist Mono', monospace; }
    .signature,.cursive,.t-quote,.sig-name { font-family: 'Pinyon Script', cursive; }

    /* ════════ COLOR SYSTEM (new palette) ════════ */
    :root {
      --red: #D72638; --blue: #3F88C5; --orange: #F58A07; --orange-soft: #F9AB55; --navy: #140F2D;
      --accent: #F58A07; --emerald: #3F88C5; --tea-green: #F9AB55;
      --charcoal: #140F2D; --footer-bg: #140F2D; --cta-bg: #140F2D;
      --bg: #F7F1E6; --surface: #EFE7D8; --card: #EAE0CD; --text: #1A1622;
      --text-muted: #5b5560; --text-faint: #8a838f; --border: rgba(20,15,45,0.12);
      --nav-bg: rgba(247,241,230,0.88); --nav-br: rgba(20,15,45,0.10);
    }

    /* ════════ THINNER STICKY NAV ════════ */
    .site-nav { padding: 7px 36px !important; position: sticky !important; top: 0 !important; z-index: 200 !important;
      background: var(--nav-bg) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .nav-logo { height: 42px !important; width: auto !important; }
    .nav-links a:hover, .nav-links a.active { color: var(--blue) !important; }
    .nav-links a.active { border-bottom: 2px solid var(--blue) !important; }
    @media (max-width: 768px) {
      .site-nav { padding: 6px 16px !important; }
      .nav-logo { max-height: 36px !important; height: auto !important; }
    }

    /* Footer dark navy + readable */
    .footer { background: var(--navy) !important; }
    .footer-col-links a:hover, .footer-big-email:hover { color: var(--orange) !important; }
`;

for (const f of ALL) {
  let h = await readFile(f, 'utf8').catch(() => null);
  if (!h) continue;

  // 1. Replace disallowed fonts
  h = h.replace(/'Clash Display'/g, "'Cabinet Grotesk'");
  h = h.replace(/"Clash Display"/g, "'Cabinet Grotesk'");
  h = h.replace(/'Britney'/g, "'Cabinet Grotesk'");
  h = h.replace(/"Britney"/g, "'Cabinet Grotesk'");
  h = h.replace(/font-family:\s*Georgia,\s*'Times New Roman',\s*serif/g, "font-family: 'Satoshi', sans-serif");
  h = h.replace(/Bebas Neue/g, 'Cabinet Grotesk');

  // 2. Color hex remap (old → new palette)
  const colorMap = {
    '#e8a748':'#F58A07','#E8A748':'#F58A07',
    '#39D599':'#3F88C5','#39d599':'#3F88C5',
    '#C5EBC3':'#F9AB55','#c5ebc3':'#F9AB55','#7BC99A':'#F9AB55','#7bc99a':'#F9AB55',
    '#212922':'#140F2D','#1B120B':'#140F2D','#1b120b':'#140F2D',
    '#1a1a1a':'#140F2D','#050505':'#140F2D',
    '#ff4d00':'#F58A07','#FF4D00':'#F58A07',
  };
  for (const [o,n] of Object.entries(colorMap)) h = h.split(o).join(n);

  // 3. Dark mode cleanup (cat pages still have it)
  h = h.replace(/<script>\(function\(\)\{var t=localStorage\.getItem\('af-theme'\)[^<]*\)\(\);<\/script>/g, '');
  h = h.replace(/\(function\(\)\{var t=localStorage\.getItem\('af-theme'\)\|\|'light';document\.documentElement\.setAttribute\('data-theme',t\);\}\)\(\);\s*\n?/g, '');
  h = h.replace(/\[data-theme="dark"\][^{]*\{[^}]*\}/g, '');
  h = h.replace(/<button class="theme-switch"[\s\S]*?<\/button>/g, '');
  h = h.replace(/function toggleTheme\(\)\s*\{[\s\S]*?\}\s*\n/g, '');
  h = h.replace(/<img src="logo-white\.png" class="nav-logo nav-logo-dark"[^>]*>/g, '');
  h = h.replace(/\.th-icon\s*\{[^}]*\}/g,'').replace(/\.th-moon\s*\{[^}]*\}/g,'').replace(/\.th-sun\s*\{[^}]*\}/g,'').replace(/\.switch-thumb\s*\{[^}]*\}/g,'').replace(/\.theme-switch[^{]*\{[^}]*\}/g,'');
  h = h.replace(/onclick="toggleTheme\(\)"/g,'');

  // 4. Inject CDN links once (after charset)
  if (!h.includes('Geist+Mono')) {
    h = h.replace(/(<meta charset="[^"]*">)/i, `$1\n${CDN}`);
  }

  // 5. Append final override before last </style>
  if (!h.includes('FINAL SYSTEM OVERRIDE')) {
    const i = h.lastIndexOf('</style>');
    if (i !== -1) h = h.slice(0,i) + OVERRIDE + '\n  ' + h.slice(i);
  }

  await writeFile(f, h, 'utf8');
  console.log('✓', f);
}
console.log('Global done');
