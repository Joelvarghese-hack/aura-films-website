import { readFile, writeFile } from 'fs/promises';

let html = await readFile('portfolio.html', 'utf8');

// Add category CSS
const CAT_CSS = `
    /* ── CATEGORY GRID ── */
    .cat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0; }
    .cat-tile { position:relative; overflow:hidden; cursor:pointer; aspect-ratio:4/5; display:block; text-decoration:none; }
    .cat-tile img { width:100%; height:100%; object-fit:cover; transition:transform 0.7s cubic-bezier(0.23,1,0.32,1); }
    .cat-tile:hover img { transform:scale(1.06); }
    .cat-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%); }
    .cat-info { position:absolute; bottom:0; left:0; right:0; padding:28px 24px; }
    .cat-count { font-family:'Satoshi',sans-serif; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.65); margin-bottom:6px; }
    .cat-name { font-family:'Cabinet Grotesk',sans-serif; font-size:clamp(20px,2.8vw,30px); font-weight:800; color:#fff; letter-spacing:-0.01em; line-height:1; }
    .cat-arrow { display:inline-flex; align-items:center; gap:6px; margin-top:10px; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.75); font-family:'Satoshi',sans-serif; transition:gap 0.2s; }
    .cat-tile:hover .cat-arrow { gap:10px; }
    .port-hero { padding:80px 48px 60px; background:var(--bg); border-bottom:1px solid var(--border); }
    .port-hero-eyebrow { font-family:'Satoshi',sans-serif; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--emerald); margin-bottom:16px; }
    .port-hero-title { font-family:'Cabinet Grotesk',sans-serif; font-size:clamp(48px,8vw,100px); font-weight:800; letter-spacing:-0.03em; color:var(--text); line-height:0.92; }
    .port-hero-sub { margin-top:20px; font-size:16px; color:var(--text-muted); max-width:480px; line-height:1.65; }
    @media(max-width:768px){
      .cat-grid { grid-template-columns:1fr 1fr !important; }
      .port-hero { padding:48px 20px 36px !important; }
      .port-hero-title { font-size:clamp(40px,10vw,64px) !important; }
      .cat-info { padding:18px 16px !important; }
    }
    @media(max-width:480px){
      .cat-grid { grid-template-columns:1fr !important; }
      .cat-tile { aspect-ratio:3/2 !important; }
    }
`;

html = html.replace('    /* GLOBAL-REVAMP-INJECTED */', `    /* GLOBAL-REVAMP-INJECTED */\n${CAT_CSS}`);

// Extract nav and footer from current file
const navMatch = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/);
const footerMatch = html.match(/<footer class="footer"[\s\S]*?<\/footer>/);
const scriptMatch = html.match(/<script>\s*function toggleTheme[\s\S]*?<\/script>/);
const globalJsMatch = html.match(/<script id="af-global-js"[\s\S]*?<\/script>/);

const NAV = navMatch ? navMatch[0] : '';
const FOOTER = footerMatch ? footerMatch[0] : '';
const TOGGLE_JS = scriptMatch ? scriptMatch[0] : '';
const GLOBAL_JS = globalJsMatch ? globalJsMatch[0] : '';

// Build new body
const NEW_BODY = `
${NAV}

<!-- PORTFOLIO HERO -->
<section class="port-hero af-reveal">
  <p class="port-hero-eyebrow">Our Work</p>
  <h1 class="port-hero-title">THE<br>PORTFOLIO</h1>
  <p class="port-hero-sub">Every frame is a feeling. Explore our work across weddings, portraits, family moments, and more.</p>
</section>

<!-- CATEGORY GRID -->
<div class="cat-grid stagger-children">

  <a href="cat-weddings.html" class="cat-tile">
    <img src="images/IMG_9115.jpg" alt="Weddings" style="object-position:center top;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <p class="cat-count">Wedding Sessions</p>
      <h2 class="cat-name">Weddings</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

  <a href="cat-engagements.html" class="cat-tile">
    <img src="images/_DSC7542.jpg" alt="Engagements" style="object-position:center 30%;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <p class="cat-count">Couples &amp; Love</p>
      <h2 class="cat-name">Engagements</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

  <a href="cat-portraits.html" class="cat-tile">
    <img src="images/IMG_3431.JPG.jpeg" alt="Portraits" style="object-position:center 20%;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <p class="cat-count">Individual &amp; Groups</p>
      <h2 class="cat-name">Portraits</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

  <a href="cat-family.html" class="cat-tile">
    <img src="images/_DSC7794.jpeg" alt="Family &amp; Maternity" style="object-position:center 30%;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <p class="cat-count">Family Stories</p>
      <h2 class="cat-name">Family &amp; Maternity</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

  <a href="cat-events.html" class="cat-tile">
    <img src="images/_DSC8215.jpg" alt="Events" style="object-position:center 40%;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <p class="cat-count">Birthdays &amp; Corporate</p>
      <h2 class="cat-name">Events</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

  <a href="portfolio-denim.html" class="cat-tile">
    <img src="images/_DSC8015.jpg" alt="Fashion &amp; Editorial" style="object-position:center 15%;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <p class="cat-count">Style &amp; Editorial</p>
      <h2 class="cat-name">Fashion</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

</div>

<!-- FOOTER -->
${FOOTER}

${TOGGLE_JS}
${GLOBAL_JS}
</body>
</html>`;

// Replace from <body> onwards
html = html.replace(/<body>[\s\S]*$/, `<body>${NEW_BODY}`);
await writeFile('portfolio.html', html, 'utf8');
console.log('✓ portfolio.html rewritten with categories');
