/* clean-images.mjs — web-res copies with NO watermark, for the hero + drag
 * thumbnails (which must be un-watermarked). Named images/c_<name>.jpg.
 * The watermarked images/<name>.jpg stays for the gallery + drag "opened" view.
 * Run:  node clean-images.mjs
 */
import sharp from "sharp";
import { existsSync } from "fs";
const LONG = 1800;
const list = ['wed-1','wed-3','wed-4','wed-5','wed-8','wed-9','wed-10','por-2','por-3','por-6','por-8','por-9','por-11','baby-1','baby-6','baby-8','baby-9','baby-10','baby-16','arch-1'];
let n = 0;
for (const name of list) {
  const src = '_originals/' + name + '.jpg';
  if (!existsSync(src)) { console.log('  (no master)', name); continue; }
  await sharp(src).resize({ width: LONG, height: LONG, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toFile('images/c_' + name + '.jpg');
  n++; process.stdout.write('.');
}
console.log('\nGenerated ' + n + ' clean (no-watermark) copies.');
