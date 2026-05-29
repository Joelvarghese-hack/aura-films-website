import { readFile, writeFile } from 'fs/promises';
let html = await readFile('contact.html', 'utf8');

// 1. Remove studio addresses section
html = html.replace(/\s*<!-- STUDIO ADDRESSES -->[\s\S]*?<\/div>\s*\n\s*<!-- IMAGE STRIP -->/,
  '\n\n  <!-- IMAGE STRIP -->');

// Also try alternate pattern
html = html.replace(/\s*<div class="studios-section">[\s\S]*?<\/div>\s*\n\s*<!-- IMAGE STRIP -->/,
  '\n\n  <!-- IMAGE STRIP -->');
html = html.replace(/\s*<div class="studios-section">[\s\S]*?<\/div>\s*\n/g, '\n');

// 2. Remove image strip (wedding couple photo)
html = html.replace(/\s*<!-- IMAGE STRIP -->[\s\S]*?<\/div>\s*\n\s*<!-- CTA -->/,
  '\n\n  <!-- CTA REMOVED -->');
html = html.replace(/\s*<div class="contact-img-strip">[\s\S]*?<\/div>\s*\n/g, '\n');

// 3. Remove dark CTA section
html = html.replace(/\s*<!-- CTA -->[\s\S]*?<div class="cta-section">[\s\S]*?<\/div>\s*\n\s*<!-- FOOTER -->/g,
  '\n\n  <!-- FOOTER -->');
html = html.replace(/\s*<!-- CTA REMOVED -->[\s\S]*?<div class="cta-section">[\s\S]*?<\/div>\s*\n/g, '\n');

// Clean up any remaining cta-section
html = html.replace(/\n\s*<div class="cta-section">[\s\S]*?<\/div>\s*\n/g, '\n');

// 4. Replace contact blurb and profile card with cleaner version
html = html.replace(
  `      <p class="contact-blurb">Whether it's a portrait, event, or brand shoot, your vision deserves the best. Send me a message today and I'll get back to you <strong>within 48 hours.</strong></p>
      <div class="contact-profile-card">
        <div class="contact-av">
          <img src="images/_DSC8049.jpg" style="object-position:top;" alt="Aura Films">
        </div>
        <div>
          <div class="contact-card-name">Aura Films</div>
          <div class="contact-card-role">Photographer</div>
        </div>
      </div>
      <div class="contact-phone">343-989-4546</div>
      <div>
        <div class="contact-big-email">hello@aurafilms.ca</div>
      </div>`,
  `      <p class="contact-blurb">Whether it's a wedding, portrait, or event — your vision deserves exceptional photography. Send us a message and we'll get back to you <strong>within 24–48 hours.</strong></p>
      <div style="margin-top:32px;display:flex;flex-direction:column;gap:20px;">
        <a href="mailto:hello@aurafilms.ca" class="contact-big-email" style="text-decoration:none;">hello@aurafilms.ca</a>
        <a href="tel:+13439894546" class="contact-phone" style="text-decoration:none;">343-989-4546</a>
      </div>
      <div style="margin-top:28px;padding:20px 22px;background:var(--surface);border-radius:12px;border:1px solid var(--border);">
        <p style="font-family:'Satoshi',sans-serif;font-size:13px;color:var(--text-muted);line-height:1.65;">Based in Kingston, ON. Available for travel across Canada and internationally. Response time: within 48 hours.</p>
      </div>`
);

// 5. Add better hero
html = html.replace(
  `  <header class="hero">
    <img class="hero-bg" src="images/_DSC8577.jpg" style="object-position:center 25%;" alt="Contact Hero">
    <div class="hero-overlay"></div>
    <div class="hero-inner">
      <h1 class="hero-title">GET IN <span>TOUCH</span></h1>
    </div>
  </header>`,
  `  <header class="hero">
    <img class="hero-bg" src="images/_DSC8577.jpg" style="object-position:center 25%;" alt="Contact Hero">
    <div class="hero-overlay"></div>
    <div class="hero-inner" style="align-items:flex-start;">
      <p style="font-family:'Satoshi',sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:14px;">Let's Create Something</p>
      <h1 class="hero-title">GET IN <span>TOUCH</span></h1>
    </div>
  </header>`
);

await writeFile('contact.html', html, 'utf8');
console.log('✓ contact.html updated');
