/* Aura Films business documents → branded, fillable PDFs.
   Run from the repo root:  node documents/src/build.mjs
   Each document is laid out as HTML (brand fonts + logo), printed to PDF by Chromium,
   then pdf-lib places real form fields exactly over the boxes drawn in the HTML. */
import puppeteer from 'puppeteer';
import { PDFDocument, StandardFonts, rgb, PDFName, PDFBool, PDFString } from 'pdf-lib';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { pathToFileURL } from 'url';
import { DOCS } from './content.mjs';

const ROOT = process.cwd();
const OUT = ROOT + '/documents';
const CHROME = process.env.CHROME_PATH || undefined;
const u = p => pathToFileURL(ROOT + '/' + p).href;

const css = `
@font-face{font-family:Clash;src:url("${u('Fonts/Clash Display/ClashDisplay-Semibold.woff2')}") format("woff2");font-weight:600}
@font-face{font-family:Clash;src:url("${u('Fonts/Clash Display/ClashDisplay-Medium.woff2')}") format("woff2");font-weight:500}
@font-face{font-family:Cabinet;src:url("${u('Fonts/Cabinet Grotesk/CabinetGrotesk-Regular.woff2')}") format("woff2");font-weight:400}
@font-face{font-family:Cabinet;src:url("${u('Fonts/Cabinet Grotesk/CabinetGrotesk-Medium.woff2')}") format("woff2");font-weight:500}
@font-face{font-family:Cabinet;src:url("${u('Fonts/Cabinet Grotesk/CabinetGrotesk-Bold.woff2')}") format("woff2");font-weight:700}
@page{size:8.5in 11in;margin:0}
:root{--ink:#1B120B;--muted:#5a3e2b;--faint:#8a6a52;--acc:#e8a748;--line:#dccbb0;--fill:#FBF6EC;--ivory:#F9F0E1;--em:#39D599}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:Cabinet,sans-serif;color:var(--ink);font-size:11.5px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:816px;height:1056px;overflow:hidden;padding:0 60px;page-break-after:always;break-after:page}
.page:last-child{page-break-after:auto;break-after:auto}
.band{margin:0 -60px 22px;padding:26px 60px 18px;background:var(--ivory);display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1.5px solid var(--acc)}
.logo{width:118px;height:52px;overflow:hidden;position:relative}
.logo img{position:absolute;width:152px;left:-18px;top:-60px;mix-blend-mode:multiply}
.band .t{text-align:right}
.band h1{font-family:Clash;font-weight:600;font-size:25px;letter-spacing:-.03em;line-height:1.05}
.band .sub{font-size:10.5px;color:var(--muted);margin-top:4px;letter-spacing:.02em}
.cont{font-size:10px;color:var(--faint);text-transform:uppercase;letter-spacing:.14em;margin:-8px 0 12px}
h2{font-family:Clash;font-weight:500;font-size:13.5px;letter-spacing:-.01em;margin:14px 0 7px;display:flex;align-items:center;gap:8px}
h2::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--acc);flex:none}
p{margin:0 0 6px}
.lede{color:var(--muted);font-size:11.5px;margin-bottom:8px}
.grid{display:grid;gap:7px 16px}
.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}.g4{grid-template-columns:repeat(4,1fr)}
.fl{display:flex;flex-direction:column;gap:2px;min-width:0}
.fl label{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--faint);font-weight:500}
.f{display:block;height:22px;background:var(--fill);border-bottom:1px solid var(--line);border-radius:3px 3px 0 0}
.f.m{height:auto}
.f.sig{height:34px;background:#fff;border-bottom:1.2px solid var(--ink);border-radius:0}
.checks{display:flex;flex-wrap:wrap;gap:6px 16px;margin:2px 0 10px}
.ck{display:inline-flex;align-items:center;gap:6px;font-size:11px}
.fc{display:inline-block;width:12px;height:12px;border:1px solid var(--muted);border-radius:2px;background:#fff;flex:none}
.clause{display:grid;grid-template-columns:1fr 62px;gap:10px;align-items:start;margin:0 0 7px}
.clause b{font-weight:700}
.clause .n{font-family:Clash;font-weight:500;color:var(--acc);margin-right:4px}
.ini{display:flex;flex-direction:column;align-items:center;gap:2px}
.ini .f{width:56px;height:22px}
.ini small{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.box{border:1px solid var(--line);border-radius:6px;padding:12px 14px;background:#fffdf9}
.note{font-size:10px;color:var(--muted)}
table{width:100%;border-collapse:collapse;font-size:11px}
th{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--faint);font-weight:500;text-align:left;padding:0 6px 5px;border-bottom:1.5px solid var(--acc)}
td{padding:4px 6px;border-bottom:1px solid #efe4d2}
td .f{height:20px}
.tot{margin-left:auto;width:300px;margin-top:10px}
.tot .r{display:grid;grid-template-columns:1fr 120px;align-items:center;gap:10px;padding:3px 0}
.tot .r span{text-align:right;color:var(--muted)}
.tot .big span{font-family:Clash;font-weight:600;color:var(--ink);font-size:14px}
.stamp{position:absolute;right:66px;top:118px;transform:rotate(-8deg);border:2.5px solid var(--em);color:#1f9e6c;font-family:Clash;font-weight:600;font-size:26px;letter-spacing:.14em;padding:4px 18px;border-radius:8px;opacity:.85}
.foot{position:absolute;left:60px;right:60px;bottom:22px;display:flex;justify-content:space-between;font-size:9px;color:var(--faint);border-top:1px solid #efe4d2;padding-top:8px;letter-spacing:.03em}
ul.plain{margin:0 0 6px 16px}ul.plain li{margin-bottom:3px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}
`;

const logo = `<div class="logo"><img src="${u('logo-black.png')}" alt=""></div>`;

function wrap(doc) {
  const n = doc.pages.length;
  const pages = doc.pages.map((body, i) => `<section class="page">
<div class="band">${logo}<div class="t"><h1>${doc.title}</h1><div class="sub">${doc.sub}</div></div></div>
${i ? `<div class="cont">${doc.title} · continued</div>` : ''}${body}
<div class="foot"><span>Aura Films · Albin, sole proprietor · Kingston, Ontario · itsaurafilms@gmail.com · 343 989 4546 · itsaurafilms.com</span><span>${doc.code} · Page ${i + 1} of ${n}</span></div></section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${pages}</body></html>`;
}

const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
mkdirSync(OUT + '/src/html', { recursive: true });
for (const doc of DOCS) {
  const htmlPath = `${OUT}/src/html/${doc.file}.html`;
  writeFileSync(htmlPath, wrap(doc));
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 1056 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => {
    const f = p.querySelector('.foot').getBoundingClientRect().top;
    const last = [...p.children].filter(c => !c.classList.contains('foot') && !c.classList.contains('stamp')).pop();
    return last && last.getBoundingClientRect().bottom > f - 6 ? i + 1 : 0;
  }).filter(Boolean));
  if (overflow.length) console.warn(`!! ${doc.file}: content runs into the footer on page(s) ${overflow}`);
  const fields = await page.evaluate(() => [...document.querySelectorAll('[data-n]')].map(el => {
    const r = el.getBoundingClientRect(), top = r.top + scrollY;
    return { n: el.dataset.n, t: el.dataset.t || 'text', pg: Math.floor(top / 1056), x: r.left, y: top % 1056, w: r.width, h: r.height, tip: el.dataset.tip || '' };
  }));
  const raw = await page.pdf({ width: '8.5in', height: '11in', printBackground: true, preferCSSPageSize: true });
  await page.close();

  const pdf = await PDFDocument.load(raw);
  pdf.setTitle(`${doc.title.replace("&amp;","&")} | Aura Films`); pdf.setAuthor('Aura Films'); pdf.setCreator('Aura Films'); pdf.setProducer('Aura Films');
  pdf.setSubject(doc.sub);
  const form = pdf.getForm();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const script = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const pages = pdf.getPages();
  const seen = new Set();
  for (const f of fields) {
    if (seen.has(f.n)) throw new Error(`${doc.file}: duplicate field ${f.n}`); seen.add(f.n);
    const pg = pages[f.pg], k = 0.75;
    const box = { x: f.x * k, y: 792 - (f.y + f.h) * k, width: f.w * k, height: f.h * k, borderWidth: 0 };
    if (f.t === 'check') {
      const c = form.createCheckBox(f.n);
      c.addToPage(pg, { ...box, textColor: rgb(0.106, 0.071, 0.043) });
    } else {
      const tf = form.createTextField(f.n);
      if (f.t === 'multi') tf.enableMultiline();
      tf.addToPage(pg, { ...box, font: f.t === 'sig' ? script : helv, textColor: rgb(0.106, 0.071, 0.043) });
      tf.setFontSize(f.t === 'sig' ? 16 : f.t === 'multi' ? 9.5 : 10);
    }
    if (f.tip) form.getField(f.n).acroField.dict.set(PDFName.of('TU'), PDFString.of(f.tip));
  }
  /* no painted background or border: the HTML already draws the box, so fields stay see-through */
  for (const fld of form.getFields()) for (const w of fld.acroField.getWidgets()) {
    const mk = w.getAppearanceCharacteristics(); if (mk) { mk.dict.delete(PDFName.of('BG')); mk.dict.delete(PDFName.of('BC')); }
  }
  form.updateFieldAppearances(helv);
  for (const f of fields) if (f.t === 'sig') form.getTextField(f.n).updateAppearances(script);
  form.acroForm.dict.set(PDFName.of('NeedAppearances'), PDFBool.True);
  writeFileSync(`${OUT}/${doc.file}.pdf`, await pdf.save());
  console.log(`✓ ${doc.file}.pdf  ${pages.length} page(s), ${fields.length} fields`);
}
await browser.close();
