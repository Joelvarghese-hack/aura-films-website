/**
 * screenshot.mjs
 * Usage: node screenshot.mjs <url> <label>
 * Example: node screenshot.mjs http://localhost:3000 hero
 *
 * Saves screenshots to ./screenshots/<label>-<timestamp>.png
 */

import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const [, , url = "http://localhost:3000", label = "screenshot"] = process.argv;

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function shoot() {
  const outDir = join(__dirname, "screenshots");
  await mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });

    console.log(`Navigating to ${url} at ${vp.width}x${vp.height}...`);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for GSAP animations to settle
    await new Promise((r) => setTimeout(r, 1500));

    const timestamp = Date.now();
    const filename = `${label}-${vp.name}-${timestamp}.png`;
    const filepath = join(outDir, filename);

    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`Saved: screenshots/${filename}`);

    await page.close();
  }

  await browser.close();
  console.log("Done.");
}

shoot().catch((err) => {
  console.error("Screenshot failed:", err.message);
  process.exit(1);
});
