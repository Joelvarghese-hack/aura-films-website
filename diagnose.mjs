import puppeteer from "puppeteer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

const pages = [
  ["http://localhost:3000", "home"],
  ["http://localhost:3000/about.html", "about"],
  ["http://localhost:3000/portfolio.html", "portfolio"],
  ["http://localhost:3000/contact.html", "contact"],
  ["http://localhost:3000/investment.html", "investment"],
];

// Mobile viewport
for (const [url, name] of pages) {
  const pg = await br.newPage();
  await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); // iPhone 14
  await pg.goto(url, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 800));
  await pg.screenshot({ path: join(__dirname, "screenshots", `mobile-${name}.png`), fullPage: true });

  // Collect broken images
  const broken = await pg.evaluate(() => {
    return Array.from(document.images)
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src);
  });
  if (broken.length) console.log(`BROKEN on ${name}:`, broken);
  else console.log(`${name}: no broken images`);
  await pg.close();
}

await br.close();
console.log("done");
