/**
 * deploy.mjs — GitHub Pages deploy helper
 * Color Palette Studio © 2026 Joel Varghese. All rights reserved.
 *
 * Copies dist/ contents to the root for GitHub Pages compatibility.
 * GitHub Pages serves from the repo root (or /docs) on the gh-pages branch.
 *
 * Usage:
 *   npm run deploy
 *
 * This script assumes you've already run `npm run build`.
 * It copies everything from dist/ to the project root, then you
 * commit and push to the gh-pages branch.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const ROOT = __dirname;

if (!fs.existsSync(DIST)) {
  console.error('❌ dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(entry => {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Copy dist contents to root
copyDir(DIST, ROOT);
console.log('✅ dist/ copied to project root. Now:');
console.log('   git add .');
console.log('   git commit -m "Deploy to GitHub Pages"');
console.log('   git push origin HEAD:gh-pages');
