import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "screenshots");
await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });

async function shotFooter(url, name, dark) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  if (dark) await page.evaluateOnNewDocument(() => localStorage.setItem('af-theme', 'dark'));
  else      await page.evaluateOnNewDocument(() => localStorage.setItem('af-theme', 'light'));
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 800));
  const el = await page.$('.footer');
  if (el) await el.screenshot({ path: join(out, name + '.png') });
  await page.close();
}

await shotFooter("http://localhost:3000/index.html",   "footer-home-light", false);
await shotFooter("http://localhost:3000/index.html",   "footer-home-dark",  true);
await shotFooter("http://localhost:3000/about.html",   "footer-about-dark", true);
await browser.close();
console.log("Done");
