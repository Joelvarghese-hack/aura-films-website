import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "screenshots");
await mkdir(out, { recursive: true });
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

async function shot(url, name, selector) {
  const page = await br.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 800));
  const el = await page.$(selector);
  if (el) { await el.screenshot({ path: join(out, name + ".png") }); console.log("✓ " + name); }
  else { await page.screenshot({ path: join(out, name + ".png"), fullPage: false }); console.log("✓ " + name + " (full)"); }
  await page.close();
}

await shot("http://localhost:3000", "home-nav", ".site-nav");
await shot("http://localhost:3000", "home-footer", ".footer");
await shot("http://localhost:3000/investment.html", "invest-hero", ".hero");
await shot("http://localhost:3000/investment.html", "invest-pkg", ".pkg-section");
await shot("http://localhost:3000/about.html", "about-nav", ".site-nav");
await shot("http://localhost:3000/about.html", "about-footer", ".footer");
await br.close();
console.log("Done");
