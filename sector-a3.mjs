import { readFile, writeFile } from 'fs/promises';
const FILES = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html'];

for (const f of FILES) {
  let h = await readFile(f, 'utf8');

  // Remove duplicate sticky patch blocks (the !important ones)
  h = h.replace(/\/\* ── STICKY NAV \(all pages\) ── \*\/\s*\.site-nav \{\s*position: sticky !important; top: 0 !important; z-index: 200 !important;\s*\}/g, '');
  h = h.replace(/\.site-nav \{ position: sticky !important; top: 0 !important; z-index: 200 !important; \}/g, '');

  // Consolidate: main .site-nav block — ensure sticky
  // Case 1: multiline with position: relative;
  h = h.replace(/(\.site-nav \{\s*)position: relative;/g, '$1position: sticky;\n      top: 0;\n      z-index: 200;');
  // Case 2: inline (investment) position:sticky; top:0; z-index:200; already fine

  // nav-logo height 46px → 64px
  h = h.replace(/\.nav-logo \{ height: 46px;/g, '.nav-logo { height: 64px;');
  h = h.replace(/\.nav-logo\{height:46px;/g, '.nav-logo{height:64px;');

  // mobile nav-logo: 38px → max-height 52px
  h = h.replace(/\.nav-logo \{ height: 38px !important; \}/g, '.nav-logo { max-height: 52px !important; height: auto !important; width: auto !important; }');

  await writeFile(f, h, 'utf8');
  console.log(`✓ ${f}`);
}
console.log('Sector A-3 done');
