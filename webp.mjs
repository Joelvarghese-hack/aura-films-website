/**
 * webp.mjs — convert every photo in images/ to a .webp sibling and record each
 * image's pixel dimensions. Re-runnable. Run:  node webp.mjs
 *
 * Output:
 *   images/<name>.webp        — WebP copy (originals kept as <picture> fallback)
 *   redesign/image-dims.json  — { "<name>": [width, height] } used by gen.mjs to
 *                               set width/height on <img> (stops layout shift)
 */
import sharp from "sharp";
import { readdirSync, writeFileSync, statSync } from "fs";
import { join } from "path";

const SRC = "images";
const isPhoto = (f) => /\.(jpe?g|png)$/i.test(f) && !/\.webp$/i.test(f);
const files = readdirSync(SRC).filter(isPhoto);

const dims = {};
let savedBytes = 0;
for (const f of files) {
  const src = join(SRC, f);
  const out = src + ".webp"; // e.g. _DSC8637.jpg.webp
  const meta = await sharp(src).metadata();
  dims[f] = [meta.width, meta.height];
  await sharp(src).webp({ quality: 80 }).toFile(out);
  savedBytes += statSync(src).size - statSync(out).size;
  process.stdout.write(".");
}

writeFileSync("redesign/image-dims.json", JSON.stringify(dims));
console.log(
  `\nConverted ${files.length} images to WebP. Saved ~${(savedBytes / 1024 / 1024).toFixed(1)} MB. Dimensions written to redesign/image-dims.json`
);
