/**
 * build.mjs — Production build script
 * Color Palette Studio © 2026 Joel Varghese. All rights reserved.
 *
 * What this does:
 *  1. Creates dist/ directory
 *  2. Minifies & mangles JS files using Terser
 *  3. Copies HTML, CSS, and assets to dist/
 *  4. Writes a .nojekyll file for GitHub Pages
 */

import { minify } from 'terser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = __dirname;
const DIST = path.join(__dirname, 'dist');

// Ensure dist/ exists
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
if (!fs.existsSync(path.join(DIST, 'assets'))) fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });

const BANNER = `/* Color Palette Studio © 2026 Joel Varghese. All rights reserved. Unauthorized copying or distribution is prohibited. */`;

// JS files to minify (order matters — colorUtils first)
const JS_FILES = ['colorUtils.js', 'export.js', 'security.js', 'app.js'];

console.log('🔨 Building Color Palette Studio...\n');

// Minify JS
for (const file of JS_FILES) {
  const src = path.join(SRC, file);
  const dest = path.join(DIST, file);
  const code = fs.readFileSync(src, 'utf8');

  const result = await minify(code, {
    compress: {
      drop_console: false, // keep console.log in security.js
      passes: 2,
    },
    mangle: {
      toplevel: false, // don't mangle top-level names (ColorUtils etc. are needed)
    },
    format: {
      preamble: BANNER,
      comments: false,
    },
  });

  fs.writeFileSync(dest, result.code, 'utf8');
  const srcSize = (fs.statSync(src).size / 1024).toFixed(1);
  const distSize = (fs.statSync(dest).size / 1024).toFixed(1);
  console.log(`  ✓ ${file}: ${srcSize}kb → ${distSize}kb`);
}

// Copy HTML (update script paths are already correct)
const htmlSrc = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
// Remove robots noindex for production (comment this line to keep it during dev)
// const htmlProd = htmlSrc.replace('<meta name="robots" content="noindex, nofollow">', '<!-- robots meta removed for production -->');
fs.writeFileSync(path.join(DIST, 'index.html'), htmlSrc, 'utf8');
console.log('  ✓ index.html copied');

// Copy CSS
fs.copyFileSync(path.join(SRC, 'styles.css'), path.join(DIST, 'styles.css'));
console.log('  ✓ styles.css copied');

// Copy assets
const assetsDir = path.join(SRC, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.readdirSync(assetsDir).forEach(file => {
    fs.copyFileSync(path.join(assetsDir, file), path.join(DIST, 'assets', file));
  });
  console.log('  ✓ assets/ copied');
}

// .nojekyll for GitHub Pages (prevents Jekyll processing)
fs.writeFileSync(path.join(DIST, '.nojekyll'), '', 'utf8');
console.log('  ✓ .nojekyll created');

console.log(`\n✅ Build complete → dist/`);
