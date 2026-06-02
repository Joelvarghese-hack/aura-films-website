import { readFile, writeFile } from 'fs/promises';
const ALL = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html','cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','cat-events.html'];

// ════════ V5: restore SCRIPT font to all true numbers (keep word-badges sans) ════════
const V5 = `
    /* ════════ OVERRIDE V5 (numbers → script again) ════════ */
    .work-num, .p-num, .pkg-price-num, .pkg-price-cur, .stat-num, .cat-count {
      font-family:'Pinyon Script',cursive !important; font-style:normal !important;
    }
    /* keep sizes legible for script numerals */
    .work-num { font-size:clamp(72px,7vw,128px) !important; }
    .p-num { font-size:clamp(60px,5.5vw,92px) !important; }
    .pkg-price-num { font-size:clamp(40px,4vw,60px) !important; font-weight:400 !important; }
    .pkg-price-cur { font-size:clamp(22px,2vw,30px) !important; }
    /* T&C numbers stay script + bright orange (unchanged) */
    .term-num { font-family:'Pinyon Script',cursive !important; color:#FF9E1B !important; }
    /* discount word-badges (FREE REEL etc) stay clean sans */
    .disc-amount { font-family:'Cabinet Grotesk',sans-serif !important; font-weight:800 !important; }
`;
for (const f of ALL) {
  let h = await readFile(f,'utf8').catch(()=>null); if(!h) continue;
  if(!h.includes('OVERRIDE V5')){
    const i=h.lastIndexOf('</style>'); h=h.slice(0,i)+V5+'\n  '+h.slice(i);
    await writeFile(f,h,'utf8');
  }
}
console.log('✓ V5 applied: script restored to numbers');

// ════════ HOME: show full work image on mobile (no crop) ════════
let idx = await readFile('index.html','utf8');
if(!idx.includes('WORK-IMG-MOBILE-FIX')){
  const IMGFIX = `
    /* WORK-IMG-MOBILE-FIX: show entire photo, no crop, on phones/tablets */
    @media (max-width: 768px) {
      .work-alt-img { aspect-ratio: auto !important; height: auto !important; background: var(--surface) !important; }
      .work-alt-img img { aspect-ratio: auto !important; height: auto !important; width: 100% !important; object-fit: contain !important; }
    }
  `;
  const i=idx.lastIndexOf('</style>'); idx=idx.slice(0,i)+IMGFIX+'\n  '+idx.slice(i);
  await writeFile('index.html', idx, 'utf8');
  console.log('✓ home work images: full image on mobile');
}
