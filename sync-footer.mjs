/**
 * sync-footer.mjs
 * Copies the exact footer HTML from about.html to all other pages,
 * and increases footer logo height to 180px everywhere.
 */
import { readFile, writeFile } from 'fs/promises';

const ROOT = 'C:/Users/joelk/.claude/sessions/.claude/worktrees/priceless-wilson';
const ALL_PAGES = ['index.html', 'portfolio.html', 'contact.html', 'portfolio-denim.html', 'investment.html'];

// The exact footer HTML from about.html (copied verbatim)
const CANONICAL_FOOTER = `  <!-- FOOTER -->
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

for (const page of ALL_PAGES) {
  const path = `${ROOT}/${page}`;
  let html = await readFile(path, 'utf8');

  // Replace footer HTML
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/);
  if (footerMatch) {
    html = html.replace(footerMatch[0], CANONICAL_FOOTER);
  } else {
    console.warn(`⚠ No <footer> found in ${page}`);
    continue;
  }

  // Increase logo height to 180px everywhere in CSS
  html = html.replace(/\.footer-logo\s*\{[^}]*height:\s*\d+px/g, (m) =>
    m.replace(/height:\s*\d+px/, 'height: 180px')
  );
  // Also handle !important variants
  html = html.replace(/height:\s*150px\s*!important/g, 'height: 180px !important');
  html = html.replace(/height:\s*120px/g, 'height: 180px');

  await writeFile(path, html, 'utf8');
  console.log(`✓ ${page}`);
}

// Also update about.html logo size
const aboutPath = `${ROOT}/about.html`;
let about = await readFile(aboutPath, 'utf8');
about = about.replace(/height:\s*150px\s*!important/g, 'height: 180px !important');
about = about.replace(/\.footer-logo\s*\{[^}]*height:\s*\d+px/g, (m) =>
  m.replace(/height:\s*\d+px/, 'height: 180px')
);
await writeFile(aboutPath, about, 'utf8');
console.log('✓ about.html (logo size only)');

console.log('\nAll done!');
