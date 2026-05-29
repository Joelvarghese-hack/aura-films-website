import { readFile, writeFile } from 'fs/promises';
const CAT_PAGES = ['cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','cat-events.html'];

const UNIFORM_CSS = `
    /* ── D-1: UNIFORM EDITORIAL GRID ── */
    .cat-gallery { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; background:transparent; }
    .cat-gallery-item { overflow:hidden; aspect-ratio:3/4; background:var(--surface); grid-column:auto !important; grid-row:auto !important; border-radius:10px; }
    .cat-gallery-item.wide, .cat-gallery-item.tall { grid-column:auto !important; grid-row:auto !important; aspect-ratio:3/4 !important; }
    .cat-gallery-item img { width:100%; height:100%; object-fit:cover; display:block; cursor:pointer; transition:transform 0.6s cubic-bezier(0.23,1,0.32,1); border-radius:10px; }
    .cat-gallery-item:hover img { transform:scale(1.04); }
    @media(max-width:768px){ .cat-gallery { grid-template-columns:repeat(2,1fr) !important; gap:8px !important; } .cat-gallery-item.wide,.cat-gallery-item.tall { aspect-ratio:3/4 !important; } }
    @media(max-width:480px){ .cat-gallery { grid-template-columns:1fr !important; } }
`;

const LIGHTBOX_HTML = `
<div id="lb" style="display:none;position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.94);align-items:center;justify-content:center;flex-direction:column;">
  <button id="lb-close" aria-label="Close" style="position:absolute;top:20px;right:24px;background:none;border:none;color:#fff;font-size:32px;cursor:pointer;z-index:10;">&#10005;</button>
  <button id="lb-prev" aria-label="Previous" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:40px;cursor:pointer;">&#8249;</button>
  <img id="lb-img" src="" alt="" style="max-height:88vh;max-width:90vw;object-fit:contain;border-radius:4px;">
  <button id="lb-next" aria-label="Next" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:40px;cursor:pointer;">&#8250;</button>
</div>
<script>
(function(){
  const lb=document.getElementById('lb'),lbImg=document.getElementById('lb-img');
  let imgs=[],idx=0;
  document.querySelectorAll('.cat-gallery img').forEach(img=>{
    img.style.cursor='pointer';
    img.addEventListener('click',function(){
      const container=this.closest('.cat-gallery')||document;
      imgs=Array.from(container.querySelectorAll('img'));
      idx=imgs.indexOf(this);open();
    });
  });
  function open(){lbImg.src=imgs[idx].src;lbImg.alt=imgs[idx].alt;lb.style.display='flex';document.body.style.overflow='hidden';}
  function close(){lb.style.display='none';document.body.style.overflow='';lbImg.src='';}
  document.getElementById('lb-close').addEventListener('click',close);
  document.getElementById('lb-prev').addEventListener('click',()=>{idx=(idx-1+imgs.length)%imgs.length;open();});
  document.getElementById('lb-next').addEventListener('click',()=>{idx=(idx+1)%imgs.length;open();});
  lb.addEventListener('click',e=>{if(e.target===lb)close();});
  document.addEventListener('keydown',e=>{
    if(lb.style.display!=='flex')return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft'){idx=(idx-1+imgs.length)%imgs.length;open();}
    if(e.key==='ArrowRight'){idx=(idx+1)%imgs.length;open();}
  });
})();
</script>`;

for (const f of CAT_PAGES) {
  let h = await readFile(f, 'utf8').catch(() => null);
  if (!h) { console.log('skip (missing):', f); continue; }
  if (h.includes('id="lb"')) { console.log('lightbox already in', f); }
  else {
    // Inject uniform grid CSS before </style> (last one)
    h = h.replace(/<\/style>/, UNIFORM_CSS + '\n  </style>');
    // Remove any <a href> wrappers / target=_blank around gallery imgs (none expected, but strip target)
    h = h.replace(/(<img[^>]*class="[^"]*cat-gallery[^"]*"[^>]*) target="_blank"/g, '$1');
    // Inject lightbox before </body>
    h = h.replace('</body>', LIGHTBOX_HTML + '\n</body>');
    await writeFile(f, h, 'utf8');
    console.log('✓', f);
  }
}
console.log('Sector D done');
