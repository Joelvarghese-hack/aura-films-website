import { readFile, writeFile } from 'fs/promises';
let html = await readFile('about.html', 'utf8');

// 1. Add about-specific CSS
const ABOUT_CSS = `
    /* ── ABOUT PAGE ADDITIONS ── */
    .about-hero { padding:80px 48px 60px; background:var(--bg); border-bottom:1px solid var(--border); }
    .about-eyebrow { font-family:'Satoshi',sans-serif; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--emerald); margin-bottom:16px; }
    .about-title { font-family:'Cabinet Grotesk',sans-serif; font-size:clamp(48px,8vw,100px); font-weight:800; letter-spacing:-0.03em; color:var(--text); line-height:0.9; margin-bottom:28px; }
    .about-intro { font-family:'Satoshi',sans-serif; font-size:clamp(16px,1.8vw,20px); color:var(--text-muted); max-width:600px; line-height:1.72; }
    /* SKILLS TICKER */
    .skills-ticker { overflow:hidden; background:var(--charcoal); padding:20px 0; border-top:1px solid rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.06); }
    .skills-ticker-inner { display:flex; gap:0; animation:ticker-scroll 28s linear infinite; white-space:nowrap; width:max-content; }
    .skills-ticker-inner:hover { animation-play-state:paused; }
    .skill-tag { font-family:'Satoshi',sans-serif; font-size:13px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.72); padding:0 36px; display:inline-flex; align-items:center; gap:14px; flex-shrink:0; }
    .skill-tag::after { content:'◆'; color:var(--emerald); font-size:8px; }
    @keyframes ticker-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    /* TEAM */
    .team-section { padding:80px 48px; }
    .team-title { font-family:'Cabinet Grotesk',sans-serif; font-size:clamp(32px,4vw,52px); font-weight:800; letter-spacing:-0.02em; color:var(--text); margin-bottom:48px; }
    .team-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; max-width:900px; }
    .team-card { background:var(--surface); border-radius:16px; overflow:hidden; border:1px solid var(--border); }
    .team-photo { width:100%; aspect-ratio:3/4; overflow:hidden; }
    .team-photo img { width:100%; height:100%; object-fit:cover; object-position:center top; transition:transform 0.6s; }
    .team-card:hover .team-photo img { transform:scale(1.04); }
    .team-info { padding:24px 26px 28px; }
    .team-name { font-family:'Cabinet Grotesk',sans-serif; font-size:clamp(22px,2.5vw,28px); font-weight:800; color:var(--text); letter-spacing:-0.01em; margin-bottom:4px; }
    .team-role { font-family:'Satoshi',sans-serif; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:var(--emerald); margin-bottom:12px; }
    .team-bio { font-family:'Satoshi',sans-serif; font-size:14px; color:var(--text-muted); line-height:1.7; }
    @media(max-width:768px){
      .about-hero { padding:48px 20px 40px !important; }
      .team-section { padding:48px 20px !important; }
      .team-grid { grid-template-columns:1fr !important; max-width:100% !important; }
    }
`;

html = html.replace('    /* GLOBAL-REVAMP-INJECTED */', `    /* GLOBAL-REVAMP-INJECTED */\n${ABOUT_CSS}`);

// 2. Replace hero + stats + bio with clean version
const OLD_HERO = `  <!-- HERO -->
  <header class="hero">
    <img class="hero-bg" src="images/_DSC8307.jpg" style="object-position:center 20%;" alt="Aura Films About">
    <div class="hero-overlay"></div>
    <div class="hero-inner">
      <h1 class="hero-title">ABOUT AURA FILMS</h1>
      <p class="hero-bio">Hello, I'm Aura Films, a portrait 📸 and lifestyle photographer 🍃 with a deep passion for capturing moments 🔥 that feel real, timeless 📷, and full of life.</p>
    </div>
  </header>

  <!-- STATS -->
  <section class="stats-bar">
    <div class="stat-box">
      <div class="stat-value">4+</div>
      <div class="stat-label">Years of Experience</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">9%</div>
      <div class="stat-label">Returning Clients</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">2k+</div>
      <div class="stat-label">Project Completed</div>
    </div>
  </section>

  <!-- BIO PARAGRAPH -->
  <div class="bio-wrap">
    <p>What sets my work apart is my attention to detail and the way I interact with people. I believe great photography happens when you're comfortable, confident, and fully yourself; and I work hard to make every session feel natural and enjoyable.</p>
  </div>`;

const NEW_HERO = `  <!-- ABOUT HERO (clean, no bg photo) -->
  <section class="about-hero af-reveal">
    <p class="about-eyebrow">About Aura Films</p>
    <h1 class="about-title">WE FIND<br>THE FRAME<br>THAT STAYS.</h1>
    <p class="about-intro">Aura Films is built on one belief: that great photography doesn't just show who you are — it makes people feel it. We are a two-person team obsessed with authentic moments, real emotions, and the quiet details that tell the biggest stories.</p>
  </section>

  <!-- SKILLS TICKER -->
  <div class="skills-ticker">
    <div class="skills-ticker-inner" id="ticker">
      <span class="skill-tag">Wedding Photography</span>
      <span class="skill-tag">Videography</span>
      <span class="skill-tag">Engagement Sessions</span>
      <span class="skill-tag">Portrait Photography</span>
      <span class="skill-tag">Family &amp; Maternity</span>
      <span class="skill-tag">Video Editing</span>
      <span class="skill-tag">Photo Retouching</span>
      <span class="skill-tag">Drone Footage</span>
      <span class="skill-tag">Event Coverage</span>
      <span class="skill-tag">Social Media Content</span>
      <span class="skill-tag">Wedding Photography</span>
      <span class="skill-tag">Videography</span>
      <span class="skill-tag">Engagement Sessions</span>
      <span class="skill-tag">Portrait Photography</span>
      <span class="skill-tag">Family &amp; Maternity</span>
      <span class="skill-tag">Video Editing</span>
      <span class="skill-tag">Photo Retouching</span>
      <span class="skill-tag">Drone Footage</span>
      <span class="skill-tag">Event Coverage</span>
      <span class="skill-tag">Social Media Content</span>
    </div>
  </div>

  <!-- TEAM -->
  <section class="team-section">
    <h2 class="team-title af-reveal">The People Behind the Lens</h2>
    <div class="team-grid stagger-children">
      <div class="team-card">
        <div class="team-photo">
          <img src="images/_DSC8015.jpg" alt="Albin — Photographer">
        </div>
        <div class="team-info">
          <h3 class="team-name">Albin</h3>
          <p class="team-role">Lead Photographer</p>
          <p class="team-bio">Albin has an eye for the moment just before the moment. His photography is grounded in patience, storytelling, and a genuine connection with every subject he shoots.</p>
        </div>
      </div>
      <div class="team-card">
        <div class="team-photo">
          <img src="images/IMG_9906.JPG.jpeg" alt="Afsal — Videographer">
        </div>
        <div class="team-info">
          <h3 class="team-name">Afsal</h3>
          <p class="team-role">Lead Videographer</p>
          <p class="team-bio">Afsal brings motion to memory. His films are cinematic, emotional, and deeply personal — every cut, colour grade, and audio choice is made with intention and care.</p>
        </div>
      </div>
    </div>
  </section>`;

html = html.replace(OLD_HERO, NEW_HERO);

// 3. Remove the dark CTA section
html = html.replace(/\s*<!-- CTA -->\s*<div class="cta-section">[\s\S]*?<\/div>\s*\n\s*<!-- FOOTER -->/,
  '\n\n  <!-- FOOTER -->');

// 4. Keep process and tools, but clean up btn-ghost text
html = html.replace('<a href="portfolio.html" class="btn-ghost"><span>✕</span> &nbsp;Explore More Work</a>',
  '<a href="portfolio.html" class="btn-ghost">Explore Our Work &rarr;</a>');

await writeFile('about.html', html, 'utf8');
console.log('✓ about.html updated');
