/* protect-images.mjs — make public photos theft-resistant without ruining them.
 * - preserves full-res masters in _originals/ (git-ignored, your safety copy)
 * - serves web-resolution copies (long edge 2048, q82) so print-res never leaks
 * - adds a subtle bottom-corner logo watermark (white, ~34% opacity, soft shadow)
 * Only .jpg/.jpeg (client photos) are processed; PNG logos/graphics are left alone.
 * Idempotent: always re-derives from the master, so re-running never double-marks.
 * Run:  node protect-images.mjs
 */
import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { join } from "path";

const SRC = "images", ORIG = "_originals";
const LOGO = "images/aura-logo-white.png";
const LONG_EDGE = 2048, LOGO_W_PCT = 0.16, MARGIN_PCT = 0.035, OPACITY = 0.34, SHADOW_OPACITY = 0.3;
mkdirSync(ORIG, { recursive: true });

async function fade(width, opacity, black) {
  let img = sharp(LOGO).resize({ width });
  if (black) img = img.modulate({ brightness: 0 });
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * opacity);
  let out = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  if (black) out = out.blur(3);
  return { buf: await out.png().toBuffer(), w: info.width, h: info.height };
}

const photos = readdirSync(SRC).filter((f) => /\.(jpe?g)$/i.test(f));
let n = 0;
for (const f of photos) {
  const live = join(SRC, f), master = join(ORIG, f);
  if (!existsSync(master)) copyFileSync(live, master); // preserve original once
  const base = await sharp(master).resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true }).toBuffer();
  const m = await sharp(base).metadata();
  const lw = Math.round(m.width * LOGO_W_PCT);
  const logo = await fade(lw, OPACITY, false);
  const shadow = await fade(lw, SHADOW_OPACITY, true);
  const margin = Math.round(m.width * MARGIN_PCT);
  const left = m.width - logo.w - margin, top = m.height - logo.h - margin;
  await sharp(base)
    .composite([{ input: shadow.buf, left: left + 2, top: top + 2 }, { input: logo.buf, left, top }])
    .jpeg({ quality: 82 })
    .toFile(live);
  n++; process.stdout.write(".");
}
console.log(`\nProtected ${n} photos (web-res + watermark). Masters preserved in ${ORIG}/`);
