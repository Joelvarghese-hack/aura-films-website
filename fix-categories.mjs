import { readFile, writeFile } from 'fs/promises';

// ── Fix portfolio.html: remove Events & Fashion, remove subtitle labels
let port = await readFile('portfolio.html', 'utf8');

// Replace the entire category grid
const OLD_GRID = port.match(/<!-- CATEGORY GRID -->[\s\S]*?<\/div>\s*\n\s*<!-- FOOTER -->/)?.[0];
if (OLD_GRID) {
  const NEW_GRID = `<!-- CATEGORY GRID -->
<div class="cat-grid">

  <a href="cat-weddings.html" class="cat-tile">
    <img src="images/IMG_9115.jpg" alt="Weddings" style="object-position:center top;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <h2 class="cat-name">Weddings</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

  <a href="cat-engagements.html" class="cat-tile">
    <img src="images/_DSC7545.jpg" alt="Engagements" style="object-position:center 30%;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <h2 class="cat-name">Engagements</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

  <a href="cat-portraits.html" class="cat-tile">
    <img src="images/IMG_3431.JPG.jpeg" alt="Portraits" style="object-position:center 20%;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <h2 class="cat-name">Portraits</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

  <a href="cat-family.html" class="cat-tile">
    <img src="images/_DSC7883.jpeg" alt="Family &amp; Maternity" style="object-position:center 25%;">
    <div class="cat-overlay"></div>
    <div class="cat-info">
      <h2 class="cat-name">Family &amp; Maternity</h2>
      <span class="cat-arrow">View &rarr;</span>
    </div>
  </a>

</div>

<!-- FOOTER -->`;
  port = port.replace(OLD_GRID, NEW_GRID);
  // Also update cat-grid to 2-column when 4 tiles
  port = port.replace(
    '.cat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0; }',
    '.cat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0; }'
  );
  await writeFile('portfolio.html', port, 'utf8');
  console.log('✓ portfolio.html categories fixed');
} else {
  console.log('❌ cat grid not found in portfolio.html');
}

// ── Fix cat-weddings.html — ONLY wedding photos
let wed = await readFile('cat-weddings.html', 'utf8');
const WED_GALLERY = `
  <div class="cat-gallery-item wide"><img src="images/_DSC8637.jpg" alt="Wedding ceremony" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9548.JPG.jpeg" alt="Bride and groom" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9555.JPG.jpeg" alt="Wedding portrait" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9115.jpg" alt="Wedding couple" style="object-position:center top;"></div>
  <div class="cat-gallery-item wide"><img src="images/_DSC8307.jpg" alt="Intimate wedding moment" style="object-position:center top;"></div>`;
wed = wed.replace(/<div class="cat-gallery">[\s\S]*?<\/div>\s*\n\s*<div class="more-cats">/,
  `<div class="cat-gallery">\n${WED_GALLERY}\n</div>\n\n<div class="more-cats">`);
// Fix more-work links (remove events/fashion)
wed = wed.replace(/<a href="cat-events\.html"[^>]*>[\s\S]*?<\/a>/g, '');
await writeFile('cat-weddings.html', wed, 'utf8');
console.log('✓ cat-weddings.html');

// ── Fix cat-engagements.html — ONLY engagement photos (casual couple, no wedding attire)
let eng = await readFile('cat-engagements.html', 'utf8');
const ENG_GALLERY = `
  <div class="cat-gallery-item"><img src="images/_DSC7542.jpg" alt="Couple session" style="object-position:center 25%;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC7545.jpg" alt="Engagement portrait" style="object-position:center 20%;"></div>`;
eng = eng.replace(/<div class="cat-gallery">[\s\S]*?<\/div>\s*\n\s*<div class="more-cats">/,
  `<div class="cat-gallery">\n${ENG_GALLERY}\n</div>\n\n<div class="more-cats">`);
eng = eng.replace(/<a href="cat-events\.html"[^>]*>[\s\S]*?<\/a>/g, '');
await writeFile('cat-engagements.html', eng, 'utf8');
console.log('✓ cat-engagements.html');

// ── Fix cat-portraits.html — ONLY solo portrait photos
let por = await readFile('cat-portraits.html', 'utf8');
const POR_GALLERY = `
  <div class="cat-gallery-item"><img src="images/IMG_3431.JPG.jpeg" alt="Portrait session" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9906.JPG.jpeg" alt="Portrait outdoors" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC8015.jpg" alt="Formal portrait" style="object-position:center 10%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_3432.JPG.jpeg" alt="Portrait" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_3437.JPG.jpeg" alt="Portrait" style="object-position:center 20%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9907.JPG.jpeg" alt="Portrait" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC8049.jpg" alt="Formal portrait stairs" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_3438.JPG.jpeg" alt="Portrait" style="object-position:center 20%;"></div>`;
por = por.replace(/<div class="cat-gallery">[\s\S]*?<\/div>\s*\n\s*<div class="more-cats">/,
  `<div class="cat-gallery">\n${POR_GALLERY}\n</div>\n\n<div class="more-cats">`);
por = por.replace(/<a href="cat-events\.html"[^>]*>[\s\S]*?<\/a>/g, '');
await writeFile('cat-portraits.html', por, 'utf8');
console.log('✓ cat-portraits.html');

// ── Fix cat-family.html — ONLY family/maternity photos
let fam = await readFile('cat-family.html', 'utf8');
const FAM_GALLERY = `
  <div class="cat-gallery-item wide"><img src="images/_DSC7883.jpeg" alt="Maternity with child" style="object-position:center 30%;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC7860.jpeg" alt="Maternity couple" style="object-position:center 25%;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC7798.jpeg" alt="Maternity portrait" style="object-position:center top;"></div>
  <div class="cat-gallery-item"><img src="images/_DSC7794.jpeg" alt="Family announcement" style="object-position:center 30%;"></div>
  <div class="cat-gallery-item"><img src="images/IMG_9356.JPG.jpeg" alt="Maternity solo" style="object-position:center top;"></div>`;
fam = fam.replace(/<div class="cat-gallery">[\s\S]*?<\/div>\s*\n\s*<div class="more-cats">/,
  `<div class="cat-gallery">\n${FAM_GALLERY}\n</div>\n\n<div class="more-cats">`);
fam = fam.replace(/<a href="cat-events\.html"[^>]*>[\s\S]*?<\/a>/g, '');
// Fix cover image for family tile
fam = fam.replace(
  '<img src="images/_DSC7794.jpeg" alt="Family &amp; Maternity" style="object-position:center 30%;">',
  '<img src="images/_DSC7883.jpeg" alt="Family &amp; Maternity" style="object-position:center 25%;">'
);
await writeFile('cat-family.html', fam, 'utf8');
console.log('✓ cat-family.html');

console.log('\nAll categories fixed');
