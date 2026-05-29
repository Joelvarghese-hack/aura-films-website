import { readFile, writeFile } from 'fs/promises';
const ALL = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html','cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','cat-events.html'];

// 1. Joel link → Marketing-Portfolio everywhere
for (const f of ALL) {
  let h = await readFile(f,'utf8').catch(()=>null); if(!h) continue;
  h = h.replace(/href="https:\/\/joelvarghese-hack\.github\.io\/?"/g, 'href="https://joelvarghese-hack.github.io/Marketing-Portfolio/"');
  await writeFile(f,h,'utf8');
}
console.log('✓ Joel link updated everywhere');

// 2. About — My Process: remove embedded images + glow, add glass blob hover
let a = await readFile('about.html','utf8');
// Remove p-card-bg images and p-card-glow divs
a = a.replace(/<img class="p-card-bg"[^>]*>/g, '');
a = a.replace(/<div class="p-card-glow"><\/div>/g, '<div class="p-card-blob"></div>');
// also handle glow without explicit empty
a = a.replace(/<div class="p-card-glow">\s*<\/div>/g, '<div class="p-card-blob"></div>');
// If glow elements have different markup
a = a.replace(/<div class="p-card-glow"[^>]*>(\s*)<\/div>/g, '<div class="p-card-blob"></div>');

// Inject glass styling + blob CSS before last </style>
const PROC_CSS = `
    /* ── MY PROCESS: plain glass cards + cursor blob ── */
    .p-card { background: var(--surface) !important; border: 1px solid var(--border) !important; border-radius: 16px !important; position: relative; overflow: hidden; }
    .p-card-bg { display: none !important; }
    .p-card-blob { position: absolute; width: 200px; height: 200px; border-radius: 50%;
      background: radial-gradient(circle, rgba(63,136,197,0.55) 0%, rgba(245,138,7,0.30) 55%, transparent 72%);
      filter: blur(34px); pointer-events: none; opacity: 0; transition: opacity 0.35s ease;
      transform: translate(-50%,-50%); left: 50%; top: 50%; z-index: 0; }
    .p-card:hover .p-card-blob { opacity: 1; }
    .p-card-inner { position: relative; z-index: 2; }
    .p-num { color: var(--orange) !important; }
    .p-title { color: var(--text) !important; }
    .p-desc { color: var(--text-muted) !important; }
    .process-grid { gap: 16px !important; }
`;
const i = a.lastIndexOf('</style>');
a = a.slice(0,i) + PROC_CSS + '\n  ' + a.slice(i);

// Add blob-follow JS before </body>
const BLOB_JS = `
<script>
(function(){
  document.querySelectorAll('.p-card').forEach(function(card){
    var blob = card.querySelector('.p-card-blob');
    if(!blob) return;
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      blob.style.left = (e.clientX - r.left) + 'px';
      blob.style.top  = (e.clientY - r.top) + 'px';
    });
  });
})();
</script>`;
a = a.replace('</body>', BLOB_JS + '\n</body>');
await writeFile('about.html', a, 'utf8');
console.log('✓ about.html process cards: blob count =', (a.match(/p-card-blob/g)||[]).length);
