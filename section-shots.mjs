import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "screenshots");
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
await page.evaluateHandle("document.fonts.ready");
await new Promise(r => setTimeout(r, 2000));

const sections = [
  [".hero",                 "sec-hero"],
  [".bio-section",          "sec-bio"],
  [".services-grid",        "sec-services"],
  [".work-alt-list",        "sec-works"],
  [".testimonials-section", "sec-testimonials"],
  [".cta-section",          "sec-cta"],
  [".footer",               "sec-footer"],
];

for (const [sel, name] of sections) {
  const el = await page.$(sel);
  if (el) {
    await el.screenshot({ path: join(outDir, `${name}.png`) });
    console.log(`Saved ${name}.png`);
  } else {
    console.log(`MISSING: ${sel}`);
  }
}

await browser.close();
console.log("Done");
