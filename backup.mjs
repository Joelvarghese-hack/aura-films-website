/**
 * backup.mjs — one-command, off-account backup of the Aura Films website.
 *
 * Run:  node backup.mjs
 *
 * Produces two files in ./backups/ (this folder is git-ignored, never pushed):
 *   1. aura-films-site-<date>.zip   — every current file (site, images, logo,
 *      fonts). Browsable in any unzip tool, no git needed. This is the copy you
 *      drag into Google Drive / an external hard drive.
 *   2. aura-films-full-<date>.bundle — the ENTIRE git repo with full history in
 *      a single file. Restore any past version with:  git clone <file>.bundle
 *
 * Keep at least one copy somewhere that is NOT your GitHub account
 * (Drive, Dropbox, a USB drive). That is what makes you truly safe.
 */
import { execSync } from "child_process";
import { mkdirSync, statSync, readdirSync, rmSync } from "fs";
import { join } from "path";

const OUT = "backups";
const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
mkdirSync(OUT, { recursive: true });

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1) + " MB";
const run = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] });

// Assets that matter for the live site + the client's work.
const tracked = run("git ls-files").toString().split(/\r?\n/).filter(Boolean);
const rootAssets = tracked.filter((f) => /^[^/]+\.(png|ico|pdf)$/i.test(f));
const paths = ["redesign", "images", "Logo", "Fonts", "netlify.toml", ...rootAssets]
  .map((p) => `"${p}"`)
  .join(" ");

const zip = join(OUT, `aura-films-site-${date}.zip`);
const bundle = join(OUT, `aura-films-full-${date}.bundle`);

console.log("Creating browsable ZIP snapshot (site + images + logo + fonts)...");
run(`git archive --format=zip -o "${zip}" HEAD -- ${paths}`);

console.log("Creating full-history git bundle (whole repo, every version)...");
run(`git bundle create "${bundle}" --all`);

// keep only the 5 most recent of each type so the folder doesn't grow forever
for (const kind of ["site", "full"]) {
  const ext = kind === "site" ? ".zip" : ".bundle";
  const files = readdirSync(OUT)
    .filter((f) => f.startsWith(`aura-films-${kind}-`) && f.endsWith(ext))
    .sort()
    .reverse();
  files.slice(5).forEach((f) => rmSync(join(OUT, f)));
}

console.log("\n  Backup complete:");
console.log(`   ${zip}      (${mb(zip)})  <- copy this to Google Drive / USB`);
console.log(`   ${bundle}   (${mb(bundle)})`);
console.log("\n  Restore the whole project from the bundle anytime with:");
console.log(`   git clone "${bundle}" aura-films-restored\n`);
