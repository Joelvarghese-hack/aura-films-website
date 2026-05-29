import { readFile, writeFile } from 'fs/promises';
const ALL = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html','cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','cat-events.html'];

// ════════ OVERRIDE V4: revert script → elegant; keep ONLY T&C numbers script+orange ════════
const V4 = `
    /* ════════ OVERRIDE V4 (script revert) ════════ */
    /* Revert all former-script texts to elegant display/sans */
    .section-fancy { font-family:'Cabinet Grotesk',sans-serif !important; font-style:italic !important; font-weight:800 !important; }
    .cta-script, .cta-headline { font-family:'Cabinet Grotesk',sans-serif !important; font-style:normal !important; font-weight:800 !important; line-height:1.05 !important; }
    .work-num { font-family:'Cabinet Grotesk',sans-serif !important; font-style:normal !important; font-weight:800 !important; color:var(--orange) !important; font-size:clamp(56px,5vw,92px) !important; }
    .p-num, .pkg-price-num, .pkg-price-cur, .stat-num, .disc-amount, .cat-count,
    .signature, .cursive, .sig-name { font-family:'Cabinet Grotesk',sans-serif !important; font-style:normal !important; }
    .pkg-price-num { font-weight:800 !important; }
    .disc-amount { font-weight:800 !important; }
    /* KEEP script ONLY on Terms & Conditions numbers — bright orange */
    .term-num { font-family:'Pinyon Script',cursive !important; color:#FF9E1B !important; font-size:clamp(40px,3.4vw,56px) !important; opacity:1 !important; }
`;
for (const f of ALL) {
  let h = await readFile(f,'utf8').catch(()=>null); if(!h) continue;
  if(!h.includes('OVERRIDE V4')){
    const i=h.lastIndexOf('</style>'); h=h.slice(0,i)+V4+'\n  '+h.slice(i);
    await writeFile(f,h,'utf8');
  }
}
console.log('✓ V4 script revert applied to all pages');

// ════════ CONTACT: make service tags selectable (toggle on click) ════════
let c = await readFile('contact.html','utf8');
if(!c.includes('PILL-TOGGLE-JS')){
  const JS = `
<script id="pill-toggle">
/* PILL-TOGGLE-JS */
(function(){
  document.querySelectorAll('.service-pill').forEach(function(b){
    b.setAttribute('type','button');
    b.addEventListener('click',function(){ this.classList.toggle('selected'); });
  });
})();
</script>`;
  c = c.replace('</body>', JS + '\n</body>');
  // strengthen selected style so it's clearly visible
  const PILLCSS = `
    /* selectable pill states */
    .service-pill{cursor:pointer;transition:background .2s,border-color .2s,color .2s;}
    .service-pill.selected{background:var(--orange) !important;border-color:var(--orange) !important;color:#fff !important;}
    .service-pill.selected:hover{background:var(--orange) !important;color:#fff !important;}
`;
  const i=c.lastIndexOf('</style>'); c=c.slice(0,i)+PILLCSS+'\n  '+c.slice(i);
  await writeFile('contact.html', c, 'utf8');
  console.log('✓ contact: service tags now selectable');
} else { console.log('pill toggle already present'); }
