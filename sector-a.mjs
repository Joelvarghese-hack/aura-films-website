import { readFile, writeFile } from 'fs/promises';
const FILES = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html'];

for (const f of FILES) {
  let h = await readFile(f, 'utf8');
  const before = h.length;

  // ── A-1: Fix font paths /fonts/ → ./Fonts/
  h = h.replace(/url\('\/fonts\//g, "url('./Fonts/");
  h = h.replace(/url\("\/fonts\//g, 'url("./Fonts/');
  h = h.replace(/url\(\/fonts\//g, 'url(./Fonts/');

  // ── A-2: Remove dark mode
  // Remove localStorage theme script in head
  h = h.replace(/<script>\s*\(function\(\)\{[^<]*localStorage\.getItem\('af-theme'\)[^<]*\}\)\(\);?\s*<\/script>/g, '');
  h = h.replace(/<script>\(function\(\)\{var t=localStorage\.getItem\('af-theme'\)[^<]*\)\(\);<\/script>/g, '');
  // Remove all [data-theme="dark"] CSS rules (single-level, no nested braces)
  h = h.replace(/\[data-theme="dark"\][^{]*\{[^}]*\}/g, '');
  // Remove theme-switch button (multiline)
  h = h.replace(/<button class="theme-switch"[\s\S]*?<\/button>/g, '');
  // Remove toggleTheme JS function
  h = h.replace(/function toggleTheme\(\)\s*\{[\s\S]*?\}\s*\n/g, '');
  // Remove dark logo variants
  h = h.replace(/<img src="logo-white\.png" class="nav-logo nav-logo-dark"[^>]*>/g, '');
  h = h.replace(/<img[^>]*class="[^"]*footer-logo-dark[^"]*"[^>]*>/g, '');
  // Remove leftover dark-mode-only CSS classes (th-icon, th-moon, th-sun, switch-thumb) - rules
  h = h.replace(/\.th-icon\s*\{[^}]*\}/g, '');
  h = h.replace(/\.th-moon\s*\{[^}]*\}/g, '');
  h = h.replace(/\.th-sun\s*\{[^}]*\}/g, '');
  h = h.replace(/\.switch-thumb\s*\{[^}]*\}/g, '');
  h = h.replace(/\.theme-switch\s*\{[^}]*\}/g, '');
  // Clean nav-logo-dark/light display rules that are now orphaned
  h = h.replace(/\.nav-logo-dark\s*\{[^}]*\}/g, '');
  h = h.replace(/\.footer-logo-dark\s*\{[^}]*\}/g, '');

  await writeFile(f, h, 'utf8');
  console.log(`✓ ${f}  (${before} → ${h.length} chars)`);
}
console.log('Sector A-1, A-2 done');
