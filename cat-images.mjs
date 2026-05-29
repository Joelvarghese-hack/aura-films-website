import { readFile, writeFile } from 'fs/promises';

// Folder → category page, with exact filenames (no cross-adding)
const CATS = {
  'cat-weddings.html': {
    alt: 'Wedding',
    imgs: ['IMG_9115.jpg','IMG_9356.JPG.jpeg','IMG_9548.JPG.jpeg','_DSC8016.jpg','_DSC8021.jpg','_DSC8034.jpg','_DSC8231.jpg','_DSC8238.jpg','_DSC8239.jpg','_DSC8241.jpg','_DSC8243.jpg','_DSC8307.jpg','_DSC8577.jpg','_DSC8637.jpg','_DSC8672.jpg'],
  },
  'cat-engagements.html': {
    alt: 'Engagement',
    imgs: ['_DSC7542.jpg','_DSC7545.jpg','IMG_8926.JPG.jpeg'],
  },
  'cat-portraits.html': {
    alt: 'Portrait',
    imgs: ['IMG_3431.JPG.jpeg','IMG_3432.JPG.jpeg','IMG_3437.JPG.jpeg','IMG_3438.JPG.jpeg','IMG_7777.JPG.jpeg','IMG_9906.JPG.jpeg','IMG_9907.JPG.jpeg','_DSC8015.jpg','_DSC8049.jpg','_DSC8215.jpg'],
  },
  'cat-family.html': {
    alt: 'Family & Maternity',
    imgs: ['_DSC7794.jpeg','_DSC7798.jpeg','_DSC7883.jpeg','IMG_8816.JPG.jpeg','IMG_8829.JPG.jpeg','_DSC1248.jpg','_DSC1253.jpg','_DSC1267.jpg','_DSC1347.jpg','_DSC1351.jpg','_DSC1352.jpg','_DSC1487.jpg','_DSC1500.jpg','_DSC1534.jpg'],
  },
};

for (const [file, { alt, imgs }] of Object.entries(CATS)) {
  let h = await readFile(file, 'utf8');
  const items = imgs.map(n => `  <div class="cat-gallery-item"><img src="images/${n}" alt="${alt}" loading="lazy"></div>`).join('\n');
  const gallery = `<div class="cat-gallery">\n${items}\n</div>`;
  // Replace existing .cat-gallery block
  h = h.replace(/<div class="cat-gallery">[\s\S]*?<\/div>\s*(?=\n\s*<(div class="more-cats"|section|footer|!--))/, gallery + '\n');
  // Fallback if pattern not matched
  if (!h.includes('loading="lazy"')) {
    h = h.replace(/<div class="cat-gallery">[\s\S]*?<\/div>/, gallery);
  }
  await writeFile(file, h, 'utf8');
  console.log(`✓ ${file} — ${imgs.length} images`);
}

// Fix portfolio.html category COVER tiles to folder-correct images
let p = await readFile('portfolio.html', 'utf8');
const covers = [
  [/(<a href="cat-weddings\.html"[\s\S]*?<img src=")[^"]*(")/, '$1images/_DSC8577.jpg$2'],
  [/(<a href="cat-engagements\.html"[\s\S]*?<img src=")[^"]*(")/, '$1images/_DSC7542.jpg$2'],
  [/(<a href="cat-portraits\.html"[\s\S]*?<img src=")[^"]*(")/, '$1images/IMG_3431.JPG.jpeg$2'],
  [/(<a href="cat-family\.html"[\s\S]*?<img src=")[^"]*(")/, '$1images/_DSC7883.jpeg$2'],
];
for (const [re, rep] of covers) p = p.replace(re, rep);
await writeFile('portfolio.html', p, 'utf8');
console.log('✓ portfolio.html cover tiles fixed');
