import { readFile, writeFile } from 'fs/promises';
let html = await readFile('contact.html', 'utf8');

// 1. Add contact-specific CSS
const CONTACT_CSS = `
    /* ── CONTACT PAGE REVAMP ── */
    .contact-page-hero {
      padding: 80px 48px 60px;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
    }
    .contact-page-eyebrow {
      font-family: 'Satoshi', sans-serif;
      font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
      color: var(--emerald); margin-bottom: 14px; display: block;
    }
    .contact-page-title {
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: clamp(44px, 7vw, 88px);
      font-weight: 800; letter-spacing: -0.03em;
      color: var(--text); line-height: 0.9; margin-bottom: 16px;
    }
    .contact-page-sub {
      font-family: 'Satoshi', sans-serif;
      font-size: 16px; color: var(--text-muted); line-height: 1.65;
      max-width: 440px;
    }
    /* Form redesign */
    .contact-body { display: grid; grid-template-columns: 3fr 2fr; gap: 0; min-height: 60vh; }
    .contact-form-col { padding: 56px 48px; border-right: 1px solid var(--border); }
    .contact-info-col { padding: 56px 40px; display: flex; flex-direction: column; gap: 28px; }
    .form-group { margin-bottom: 24px; }
    .form-label {
      font-family: 'Satoshi', sans-serif;
      font-size: 11px; font-weight: 600; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--text-muted); display: block;
      margin-bottom: 8px;
    }
    .form-label span { color: var(--orange); }
    .form-input {
      width: 100%; padding: 14px 16px;
      border: 1.5px solid var(--border);
      border-radius: 10px !important;
      background: var(--surface);
      font-family: 'Satoshi', sans-serif;
      font-size: 15px; color: var(--text);
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
      appearance: none;
    }
    .form-input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(232,167,72,0.12); }
    .form-input::placeholder { color: var(--text-faint); }
    textarea.form-input { resize: vertical; min-height: 120px; }
    .services-label {
      font-family: 'Satoshi', sans-serif;
      font-size: 11px; font-weight: 600; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--text-muted);
      display: block; margin-bottom: 12px;
    }
    .services-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
    .service-pill {
      padding: 8px 18px; border-radius: 100px !important;
      border: 1.5px solid var(--border);
      background: transparent; cursor: pointer;
      font-family: 'Satoshi', sans-serif;
      font-size: 13px; color: var(--text-muted);
      transition: all 0.2s;
    }
    .service-pill:hover, .service-pill.selected {
      border-color: var(--orange); color: var(--text);
      background: rgba(232,167,72,0.08);
    }
    .btn-send {
      width: 100%; padding: 16px 32px;
      background: var(--orange); color: #fff;
      border: none; border-radius: 100px !important;
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 15px; font-weight: 700;
      letter-spacing: 0.04em; cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-send:hover { background: #d4943a; transform: translateY(-1px); }
    .btn-send:active { transform: translateY(0); }
    /* Contact info side */
    .contact-logo-img { height: 80px; width: auto; display: block; margin-bottom: 20px; }
    .contact-blurb {
      font-family: 'Satoshi', sans-serif;
      font-size: 15px; color: var(--text-muted); line-height: 1.72;
    }
    .contact-detail-group { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
    .contact-detail-link {
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: clamp(16px, 2vw, 20px); font-weight: 700;
      color: var(--text); text-decoration: none;
      transition: color 0.2s;
    }
    .contact-detail-link:hover { color: var(--orange); }
    .contact-ig-link {
      display: inline-flex; align-items: center; gap: 10px;
      font-family: 'Satoshi', sans-serif;
      font-size: 13px; color: var(--text-muted);
      text-decoration: none; margin-top: 8px;
      transition: color 0.2s;
    }
    .contact-ig-link:hover { color: var(--text); }
    .contact-ig-link svg { width: 20px; height: 20px; }
    /* Minimal footer for contact page */
    .contact-mini-footer {
      padding: 28px 48px;
      border-top: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 16px;
    }
    .contact-back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: 'Satoshi', sans-serif;
      font-size: 13px; font-weight: 500;
      color: var(--text-muted); text-decoration: none;
      border: 1px solid var(--border); border-radius: 100px !important;
      padding: 8px 20px; transition: all 0.2s;
    }
    .contact-back-btn:hover { color: var(--text); border-color: var(--text); }
    .contact-mini-copy {
      font-family: 'Satoshi', sans-serif;
      font-size: 11px; color: var(--text-faint);
      display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
    }
    .contact-mini-copy a { color: var(--text-faint); transition: color 0.2s; text-decoration: none; }
    .contact-mini-copy a:hover { color: var(--text-muted); }
    @media(max-width:768px){
      .contact-page-hero { padding: 48px 20px 40px !important; }
      .contact-body { grid-template-columns: 1fr !important; }
      .contact-form-col { padding: 36px 20px !important; border-right: none !important; border-bottom: 1px solid var(--border) !important; }
      .contact-info-col { padding: 32px 20px !important; }
      .contact-mini-footer { padding: 20px !important; flex-direction: column; align-items: flex-start; }
    }
`;

html = html.replace('    /* BATCH-FIX CSS */', `    /* BATCH-FIX CSS */\n${CONTACT_CSS}`);

// 2. Replace hero with background image → clean text hero
html = html.replace(
  /  <!-- HERO -->[\s\S]*?<\/header>/,
  `  <!-- CONTACT HERO (no background image) -->
  <section class="contact-page-hero">
    <span class="contact-page-eyebrow">Aura Films</span>
    <h1 class="contact-page-title">GET IN<br>TOUCH</h1>
    <p class="contact-page-sub">Whether it's a wedding, portrait, or a milestone worth remembering — we'd love to hear from you.</p>
  </section>`
);

// 3. Replace contact info col content
html = html.replace(
  /    <!-- CONTACT INFO -->[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*<!-- /,
  `    <!-- CONTACT INFO -->
    <div class="contact-info-col">
      <img src="images/aura-logo-white.png" class="contact-logo-img" alt="Aura Films" style="filter:invert(1) sepia(0.2) saturate(0.8);">
      <p class="contact-blurb">Your memories deserve more than a photo. They deserve a story told beautifully. Reach out and we'll get back to you within 24 to 48 hours.</p>
      <div class="contact-detail-group">
        <a href="mailto:hello@aurafilms.ca" class="contact-detail-link">hello@aurafilms.ca</a>
        <a href="tel:+13439894546" class="contact-detail-link">343 989 4546</a>
      </div>
      <a href="https://www.instagram.com/aura.filmsca/" target="_blank" rel="noopener" class="contact-ig-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
        @aura.filmsca
      </a>
    </div>
  </div>

  <!-- `
);

// 4. Remove the full footer from contact, replace with minimal footer
// Find and remove everything from the big footer onwards
const footerStart = html.indexOf('<footer class="footer">');
const bodyEnd = html.lastIndexOf('</body>');
if (footerStart !== -1 && bodyEnd !== -1) {
  const beforeFooter = html.substring(0, footerStart);
  const afterBody = html.substring(bodyEnd); // </body> onwards

  const MINI_FOOTER = `  <!-- MINIMAL FOOTER: contact page only -->
  <div class="contact-mini-footer">
    <a href="index.html" class="contact-back-btn">&larr; Back to Home</a>
    <div class="contact-mini-copy">
      <span>&copy; 2026 Aura Films</span>
      <a href="investment.html#terms">Privacy Policy</a>
      <a href="investment.html#terms">Terms of Use</a>
    </div>
  </div>

`;
  html = beforeFooter + MINI_FOOTER + afterBody;
}

// 5. Fix the form — replace old form group content with better copywriting
html = html.replace(
  '<div class="form-group">\n          <label class="form-label">Name<span>*</span></label>\n          <input type="text" class="form-input" placeholder="John Doe">',
  '<div class="form-group">\n          <label class="form-label">Your Name<span>*</span></label>\n          <input type="text" class="form-input" placeholder="What should we call you?">'
);
html = html.replace(
  '<div class="form-group">\n          <label class="form-label">Email address<span>*</span></label>\n          <input type="email" class="form-input" placeholder="johndoe@gmail.com">',
  '<div class="form-group">\n          <label class="form-label">Email Address<span>*</span></label>\n          <input type="email" class="form-input" placeholder="Your email address">'
);
html = html.replace(
  '<div class="form-group">\n          <label class="form-label">Your message<span>*</span></label>\n          <textarea class="form-input" placeholder="Please, drop a message*" rows="4"></textarea>',
  '<div class="form-group">\n          <label class="form-label">Tell Us About Your Moment<span>*</span></label>\n          <textarea class="form-input" placeholder="Share your vision with us. What are you celebrating?" rows="5"></textarea>'
);
html = html.replace(
  '<span class="services-label">Services (you can select multiple)</span>',
  '<span class="services-label">What Are You Looking For?</span>'
);
// Fix service pills copywriting
html = html.replace(
  `          <button type="button" class="service-pill">Portraits</button>
          <button type="button" class="service-pill selected">Brand &amp; Commercials</button>
          <button type="button" class="service-pill">Events</button>
          <button type="button" class="service-pill">Family Sessions</button>
          <button type="button" class="service-pill">Retouching &amp; Editing</button>`,
  `          <button type="button" class="service-pill">Wedding Coverage</button>
          <button type="button" class="service-pill">Engagement Session</button>
          <button type="button" class="service-pill">Portraits</button>
          <button type="button" class="service-pill">Family &amp; Maternity</button>
          <button type="button" class="service-pill">Videography</button>`
);
// Fix send button
html = html.replace(
  '<button type="submit" class="btn-send">↗ Send Message</button>',
  '<button type="submit" class="btn-send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message</button>'
);

await writeFile('contact.html', html, 'utf8');
console.log('✓ contact.html completely revamped');
