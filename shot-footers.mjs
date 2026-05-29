import puppeteer from "puppeteer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
for (const [url, name] of [
  ["http://localhost:3000", "footer-home"],
  ["http://localhost:3000/about.html", "footer-about"],
  ["http://localhost:3000/investment.html", "footer-invest"],
  ["http://localhost:3000/contact.html", "footer-contact"],
]) {
  const pg = await br.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 600));
  const el = await pg.$(".footer");
  if (el) await el.screenshot({ path: join(__dirname, "screenshots", name + ".png") });
  console.log("✓ " + name);
  await pg.close();
}
await br.close();
