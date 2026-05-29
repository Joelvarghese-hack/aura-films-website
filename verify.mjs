import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "screenshots");
await mkdir(out, { recursive: true });

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });

async function shot(url, name, dark = false) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  if (dark) {
    await page.evaluateOnNewDocument(() => localStorage.setItem('af-theme', 'dark'));
  }
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 900));
  const el = await page.$(name === 'footer' ? '.footer' : '.site-nav');
  if (el) await el.screenshot({ path: join(out, `verify-${name}.png`) });
  await page.close();
}

// Index footer light
await shot("http://localhost:3000/index.html",   "index-footer-light");
// Index footer dark
await shot("http://localhost:3000/index.html",   "index-footer-dark",  true);
// About footer dark (dark mode persistence test)
await shot("http://localhost:3000/about.html",   "about-footer-dark",  true);
// About nav dark
await shot("http://localhost:3000/about.html",   "about-nav-dark",     true);
// Portfolio nav light (active link)
await shot("http://localhost:3000/portfolio.html", "portfolio-nav-light");

await browser.close();
console.log("Done");
