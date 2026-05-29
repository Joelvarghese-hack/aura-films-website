import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "screenshots");
await mkdir(outDir, { recursive: true });
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 1200));

// First work item text section
const workText = await page.$(".work-alt-item:first-child .work-alt-text");
if (workText) { await workText.screenshot({ path: join(outDir, "work-text-detail.png") }); }

// Works header (view all button)
const worksHdr = await page.$(".works-header");
if (worksHdr) { await worksHdr.screenshot({ path: join(outDir, "works-header-detail.png") }); }

await browser.close();
console.log("Done");
