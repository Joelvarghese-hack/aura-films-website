import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "screenshots");
await mkdir(outDir, { recursive: true });
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const pages = [
  ["http://localhost:3000/about.html",          "about"],
  ["http://localhost:3000/portfolio.html",       "portfolio"],
  ["http://localhost:3000/contact.html",         "contact"],
  ["http://localhost:3000/portfolio-denim.html", "denim"],
];
for (const [url, name] of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1000));
  // Nav
  const nav = await page.$(".site-nav");
  if (nav) { await nav.screenshot({ path: join(outDir, `${name}-nav.png`) }); console.log(`${name} nav ✓`); }
  // Footer
  const footer = await page.$(".footer");
  if (footer) { await footer.screenshot({ path: join(outDir, `${name}-footer.png`) }); console.log(`${name} footer ✓`); }
  await page.close();
}
await browser.close();
console.log("Done");
