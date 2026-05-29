import puppeteer from "puppeteer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

// Close-up mobile sections
const shots = [
  { url: "http://localhost:3000", sel: ".site-nav",        name: "m-nav-home",    w: 390 },
  { url: "http://localhost:3000", sel: ".hero",            name: "m-hero",        w: 390 },
  { url: "http://localhost:3000", sel: ".services-grid",   name: "m-services",    w: 390 },
  { url: "http://localhost:3000", sel: ".work-alt-item:first-child", name: "m-work1", w: 390 },
  { url: "http://localhost:3000", sel: ".footer",          name: "m-footer-home", w: 390 },
  { url: "http://localhost:3000/investment.html", sel: ".inv-hero", name: "m-inv-hero", w: 390 },
  { url: "http://localhost:3000/about.html", sel: ".stats-bar",    name: "m-about-stats", w: 390 },
  { url: "http://localhost:3000/about.html", sel: ".process-grid", name: "m-about-process", w: 390 },
  { url: "http://localhost:3000/contact.html", sel: ".section",    name: "m-contact-form",  w: 390 },
];

for (const { url, sel, name, w } of shots) {
  const pg = await br.newPage();
  await pg.setViewport({ width: w, height: 844 });
  await pg.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 600));
  const el = await pg.$(sel);
  if (el) {
    await el.screenshot({ path: join(__dirname, "screenshots", name + ".png") });
    console.log("✓ " + name);
  } else console.log("✗ NOT FOUND: " + sel + " on " + url);
  await pg.close();
}
await br.close();
