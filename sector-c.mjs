import { readFile, writeFile } from 'fs/promises';

const NEW_INTRO = "Every frame holds a feeling. Explore our collection of definitive moments across weddings, timeless portraits, and intimate family stories.";

// ── portfolio.html
let p = await readFile('portfolio.html', 'utf8');
p = p.replace(/\s*<p class="port-hero-eyebrow">Our Work<\/p>/g, '');  // C-1 remove eyebrow
p = p.replace(/<p class="port-hero-sub">[^<]*<\/p>/g, `<p class="port-hero-sub">${NEW_INTRO}</p>`); // C-2
// remove "Recent Work" hero button if present
p = p.replace(/<div class="hero-recent-btn">[\s\S]*?<\/div>/g, '');
await writeFile('portfolio.html', p, 'utf8');
console.log('✓ portfolio.html');

// ── about.html
let a = await readFile('about.html', 'utf8');
a = a.replace(/\s*<p class="about-eyebrow">About Aura Films<\/p>/g, '');  // C-1 remove eyebrow
// Replace about-intro copy with the C-2 text
a = a.replace(/<p class="about-intro">[\s\S]*?<\/p>/, `<p class="about-intro">${NEW_INTRO}</p>`);
await writeFile('about.html', a, 'utf8');
console.log('✓ about.html');

// ── investment.html
let inv = await readFile('investment.html', 'utf8');
inv = inv.replace(/<p style="[^"]*">Transparent Pricing<\/p>/g, '');  // C-1 remove eyebrow
inv = inv.replace(/\s*<p class="intro-copy">"We believe great photography[^<]*<\/p>/g, '');  // C-1 remove quote
await writeFile('investment.html', inv, 'utf8');
console.log('✓ investment.html');

// ── contact.html — remove "Aura Films" teal eyebrow above GET IN TOUCH
let c = await readFile('contact.html', 'utf8');
c = c.replace(/<span style="font-family:'Satoshi',sans-serif;font-size:11px;letter-spacing:0\.22em;text-transform:uppercase;color:var\(--emerald\);display:block;margin-bottom:14px;">Aura Films<\/span>/g, '');
await writeFile('contact.html', c, 'utf8');
console.log('✓ contact.html');

// ── C-3: index.html services-grid gap 16→24, work-alt-list row-gap:0
let idx = await readFile('index.html', 'utf8');
idx = idx.replace(/(\.services-grid \{\s*display: grid;\s*grid-template-columns: repeat\(5, 1fr\);\s*)gap: 16px;/, '$1gap: 24px;');
// work-alt-list row-gap:0 — add if list exists
if (idx.includes('.work-alt-list')) {
  idx = idx.replace(/(\.work-alt-list \{[^}]*)\}/, '$1 row-gap: 0;}');
}
await writeFile('index.html', idx, 'utf8');
console.log('✓ index.html C-3');

console.log('Sector C done');
