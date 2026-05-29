import { readFile, writeFile } from 'fs/promises';

// Read nav + footer template from portfolio.html
const base = await readFile('portfolio.html', 'utf8');
const navMatch = base.match(/<nav class="site-nav"[\s\S]*?<\/nav>/);
const footerMatch = base.match(/<footer class="footer"[\s\S]*?<\/footer>/);
const toggleJs = base.match(/<script>\s*function toggleTheme[\s\S]*?<\/script>/);
const NAV = navMatch?.[0] || '';
const FOOTER = footerMatch?.[0] || '';
const TOGGLE = toggleJs?.[0] || '';

// Read global CSS from index.html (has Satoshi import)
const idxHtml = await readFile('index.html','utf8');
const styleMatch = idxHtml.match(/<style>([\s\S]*?)<\/style>/);
const GLOBAL_STYLE = styleMatch?.[1] || '';

// Shared cat page CSS additions
const CAT_PAGE_CSS = `
    .cat-page-hero { padding:80px 48px 48px; background:var(--bg); border-bottom:1px solid var(--border); }
    .cat-page-back { display:inline-flex; align-items:center; gap:8px; font-family:'Satoshi',sans-serif; font-size:12px; letter-spacing:0.15em; text-transform:uppercase; color:var(--emerald); text-decoration:none; margin-bottom:24px; transition:gap 0.2s; }
    .cat-page-back:hover { gap:12px; }
    .cat-page-eyebrow { font-family:'Satoshi',sans-serif; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--text-faint); margin-bottom:12px; }
    .cat-page-title { font-family:'Cabinet Grotesk',sans-serif; font-size:clamp(44px,7vw,90px); font-weight:800; letter-spacing:-0.03em; color:var(--text); line-height:0.9; margin-bottom:20px; }
    .cat-page-note { font-family:'Satoshi',sans-serif; font-size:16px; color:var(--text-muted); max-width:560px; line-height:1.7; }
    .cat-gallery { display:grid; grid-template-columns:repeat(3,1fr); gap:3px; background:var(--border); }
    .cat-gallery-item { overflow:hidden; aspect-ratio:1; background:var(--surface); }
    .cat-gallery-item.wide { grid-column:span 2; aspect-ratio:2/1; }
    .cat-gallery-item.tall { grid-row:span 2; aspect-ratio:1/2; }
    .cat-gallery-item img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s cubic-bezier(0.23,1,0.32,1); display:block; }
    .cat-gallery-item:hover img { transform:scale(1.04); }
    .more-cats { padding:64px 48px; }
    .more-cats-title { font-family:'Cabinet Grotesk',sans-serif; font-size:clamp(24px,3vw,36px); font-weight:700; color:var(--text); margin-bottom:32px; }
    .more-cats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
    .more-cat-link { position:relative; overflow:hidden; aspect-ratio:3/4; border-radius:8px; display:block; text-decoration:none; }
    .more-cat-link img { width:100%;height:100%;object-fit:cover;transition:transform 0.5s; }
    .more-cat-link:hover img { transform:scale(1.05); }
    .more-cat-link-overlay { position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.65),transparent 60%); }
    .more-cat-link-name { position:absolute;bottom:14px;left:14px;font-family:'Cabinet Grotesk',sans-serif;font-size:16px;font-weight:700;color:#fff; }
    @media(max-width:768px){
      .cat-page-hero { padding:48px 20px 36px !important; }
      .cat-gallery { grid-template-columns:1fr 1fr !important; gap:2px !important; }
      .cat-gallery-item.wide { grid-column:span 2 !important; aspect-ratio:16/9 !important; }
      .cat-gallery-item.tall { grid-row:span 1 !important; aspect-ratio:1 !important; }
      .more-cats { padding:40px 20px !important; }
      .more-cats-grid { grid-template-columns:1fr 1fr !important; }
    }
    @media(max-width:480px){
      .cat-gallery { grid-template-columns:1fr !important; }
      .cat-gallery-item.wide { grid-column:span 1 !important; aspect-ratio:4/3 !important; }
    }
`;

function makePage(title, eyebrow, note, images, moreLinks) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Aura Films</title>
  <script>(function(){var t=localStorage.getItem('af-theme')||'light';document.documentElement.setAttribute('data-theme',t);})()<\/script>
  <style>
${GLOBAL_STYLE}
${CAT_PAGE_CSS}
  </style>
</head>
<body>
${NAV}

<section class="cat-page-hero">
  <a href="portfolio.html" class="cat-page-back">&larr; Back to Portfolio</a>
  <p class="cat-page-eyebrow">Aura Films</p>
  <h1 class="cat-page-title">${title.toUpperCase()}</h1>
  <p class="cat-page-note">${note}</p>
</section>

<div class="cat-gallery">
${images}
</div>

<div class="more-cats">
  <h2 class="more-cats-title">More Work</h2>
  <div class="more-cats-grid">
${moreLinks}
  </div>
</div>

${FOOTER}

${TOGGLE}
<script id="af-global-js-cat">
(function(){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  },{threshold:0.1});
  document.querySelectorAll('.af-reveal,.stagger-children').forEach(function(el){ io.observe(el); });
})();
<\/script>
</body>
</html>`;
}

// ── WEDDINGS
const weddingsImgs = `
  <div class="cat-gallery-item wide"><img src="images/_DSC8637.jpg" alt="Wedding ceremony" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9548.JPG.jpeg" alt="Bride and groom" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9115.jpg" alt="Wedding portrait" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC8307.jpg" alt="Couple forehead" style="object-position:center top;"></div>
  <div class="cat-gallery-item wide"><img src="images/_DSC7860.jpeg" alt="Wedding moment" style="object-position:center 30%;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC7883.jpeg" alt="Wedding detail" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC8049.jpg" alt="Wedding reception" style="object-position:center 30%;"></div>`;

const weddingsMore = `
  <a href="cat-engagements.html" class="more-cat-link"><img src="images/_DSC7542.jpg" alt="Engagements"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Engagements</span></a>
  <a href="cat-portraits.html" class="more-cat-link"><img src="images/IMG_3431.JPG.jpeg" alt="Portraits"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Portraits</span></a>
  <a href="cat-family.html" class="more-cat-link"><img src="images/_DSC7794.jpeg" alt="Family"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Family &amp; Maternity</span></a>
  <a href="cat-events.html" class="more-cat-link"><img src="images/_DSC8215.jpg" alt="Events"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Events</span></a>`;

// ── ENGAGEMENTS
const engImgs = `
  <div class="cat-gallery-item tall"><img src="images/_DSC7542.jpg" alt="Couple intimate" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC7545.jpg" alt="Engagement session" style="object-position:center 30%;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC7798.jpeg" alt="Couple portrait" style="object-position:center top;"></div>`;

const engMore = `
  <a href="cat-weddings.html" class="more-cat-link"><img src="images/IMG_9115.jpg" alt="Weddings"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Weddings</span></a>
  <a href="cat-portraits.html" class="more-cat-link"><img src="images/IMG_3431.JPG.jpeg" alt="Portraits"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Portraits</span></a>
  <a href="cat-family.html" class="more-cat-link"><img src="images/_DSC7794.jpeg" alt="Family"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Family &amp; Maternity</span></a>
  <a href="cat-events.html" class="more-cat-link"><img src="images/_DSC8215.jpg" alt="Events"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Events</span></a>`;

// ── PORTRAITS
const portImgs = `
  <div class="cat-gallery-item"><img src="images/IMG_3431.JPG.jpeg" alt="Woman portrait" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9906.JPG.jpeg" alt="Man portrait" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC8015.jpg" alt="Formal portrait" style="object-position:center 10%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_3432.JPG.jpeg" alt="Outdoor portrait" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_3437.JPG.jpeg" alt="Portrait session" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_3438.JPG.jpeg" alt="Creative portrait" style="object-position:center 20%;"></div>`;

const portMore = `
  <a href="cat-weddings.html" class="more-cat-link"><img src="images/IMG_9115.jpg" alt="Weddings"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Weddings</span></a>
  <a href="cat-engagements.html" class="more-cat-link"><img src="images/_DSC7542.jpg" alt="Engagements"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Engagements</span></a>
  <a href="cat-family.html" class="more-cat-link"><img src="images/_DSC7794.jpeg" alt="Family"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Family &amp; Maternity</span></a>
  <a href="cat-events.html" class="more-cat-link"><img src="images/_DSC8215.jpg" alt="Events"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Events</span></a>`;

// ── FAMILY & MATERNITY
const famImgs = `
  <div class="cat-gallery-item wide"><img src="images/_DSC7794.jpeg" alt="Maternity announcement" style="object-position:center 30%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9356.JPG.jpeg" alt="Family session" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9555.JPG.jpeg" alt="Family moment" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9907.JPG.jpeg" alt="Maternity shoot" style="object-position:center top;"></div>`;

const famMore = `
  <a href="cat-weddings.html" class="more-cat-link"><img src="images/IMG_9115.jpg" alt="Weddings"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Weddings</span></a>
  <a href="cat-engagements.html" class="more-cat-link"><img src="images/_DSC7542.jpg" alt="Engagements"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Engagements</span></a>
  <a href="cat-portraits.html" class="more-cat-link"><img src="images/IMG_3431.JPG.jpeg" alt="Portraits"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Portraits</span></a>
  <a href="cat-events.html" class="more-cat-link"><img src="images/_DSC8215.jpg" alt="Events"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Events</span></a>`;

// ── EVENTS
const eventsImgs = `
  <div class="cat-gallery-item wide"><img src="images/_DSC8215.jpg" alt="Event coverage" style="object-position:center 40%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_7777.JPG.jpeg" alt="Event moment" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_8816.JPG.jpeg" alt="Birthday celebration" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_8829.JPG.jpeg" alt="Event photography" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_8926.JPG.jpeg" alt="Corporate event" style="object-position:center top;"></div>`;

const eventsMore = `
  <a href="cat-weddings.html" class="more-cat-link"><img src="images/IMG_9115.jpg" alt="Weddings"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Weddings</span></a>
  <a href="cat-engagements.html" class="more-cat-link"><img src="images/_DSC7542.jpg" alt="Engagements"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Engagements</span></a>
  <a href="cat-portraits.html" class="more-cat-link"><img src="images/IMG_3431.JPG.jpeg" alt="Portraits"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Portraits</span></a>
  <a href="cat-family.html" class="more-cat-link"><img src="images/_DSC7794.jpeg" alt="Family"><div class="more-cat-link-overlay"></div><span class="more-cat-link-name">Family &amp; Maternity</span></a>`;

const pages = [
  { file:'cat-weddings.html', title:'Weddings', eyebrow:'Wedding Photography', note:'Every wedding is a universe of its own — the nervous glances, stolen laughs, happy tears, and quiet moments between the chaos. We tell your story exactly as it happened, beautifully and honestly.', imgs: weddingsImgs, more: weddingsMore },
  { file:'cat-engagements.html', title:'Engagements', eyebrow:'Couples & Love', note:'Before the big day, there is this — just the two of you, your story, and the love that started it all. Engagement sessions are our favorite because the joy is entirely, purely yours.', imgs: engImgs, more: engMore },
  { file:'cat-portraits.html', title:'Portraits', eyebrow:'Individual & Groups', note:'A great portrait is not about perfection — it is about presence. We create the conditions for you to simply be yourself, and then we wait for that moment when the real you shows up.', imgs: portImgs, more: portMore },
  { file:'cat-family.html', title:'Family & Maternity', eyebrow:'Family Stories', note:'Families are loud, messy, beautiful, and fleeting. Whether you are expecting or celebrating who you already are, these sessions capture the season you are in with warmth and authenticity.', imgs: famImgs, more: famMore },
  { file:'cat-events.html', title:'Events', eyebrow:'Birthdays & Corporate', note:"Life's milestones deserve to be remembered. From birthday celebrations to corporate gatherings, we capture the energy, the details, and the moments that make each event uniquely yours.", imgs: eventsImgs, more: eventsMore },
];

for (const p of pages) {
  const content = makePage(p.title, p.eyebrow, p.note, p.imgs, p.more);
  await writeFile(p.file, content, 'utf8');
  console.log('✓ ' + p.file);
}
console.log('All category pages created');
