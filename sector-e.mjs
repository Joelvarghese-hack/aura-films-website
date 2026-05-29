import { readFile, writeFile } from 'fs/promises';
const ALL = ['index.html','portfolio.html','contact.html','about.html','investment.html','portfolio-denim.html','cat-weddings.html','cat-engagements.html','cat-portraits.html','cat-family.html','cat-events.html'];

// ── E-1: footer link fixes across ALL files
for (const f of ALL) {
  let h = await readFile(f, 'utf8').catch(() => null);
  if (!h) continue;
  // Joel → github.io
  h = h.replace(/href="https:\/\/joelvarghese\.dev"[^>]*>(Joel Va?rghese)<\/a>/g,
    'href="https://joelvarghese-hack.github.io" target="_blank" rel="noopener noreferrer">$1</a>');
  // privacy/terms anchors
  h = h.replace(/href="investment\.html#terms">Privacy Policy<\/a>/g, 'href="#privacy">Privacy Policy</a>');
  h = h.replace(/href="investment\.html#terms">Terms of Use<\/a>/g, 'href="#terms">Terms of Use</a>');
  h = h.replace(/href="#">Privacy Policy<\/a>/g, 'href="#privacy">Privacy Policy</a>');
  h = h.replace(/href="#">Terms of Use<\/a>/g, 'href="#terms">Terms of Use</a>');
  await writeFile(f, h, 'utf8');
}
console.log('✓ E-1 footer links fixed across all files');

// ── E-2: contact form input styling + real button
let c = await readFile('contact.html', 'utf8');
// Inject focused input styling
const FORM_CSS = `
    /* ── E-2: CONTACT FORM INPUTS ── */
    .contact-form-col .form-input, .contact-form-col input, .contact-form-col textarea {
      border: 1.5px solid rgba(33,41,34,0.25) !important;
      border-radius: 10px !important;
      padding: 14px 16px !important;
      width: 100% !important;
      font-size: 15px !important;
      background: #fff !important;
      outline: none !important;
      font-family: 'Cabinet Grotesk', sans-serif !important;
      transition: border-color 0.2s !important;
    }
    .contact-form-col .form-input:focus, .contact-form-col input:focus, .contact-form-col textarea:focus {
      border-color: #39D599 !important;
    }
`;
if (!c.includes('E-2: CONTACT FORM INPUTS')) {
  c = c.replace(/<\/style>/, FORM_CSS + '\n  </style>');
}
await writeFile('contact.html', c, 'utf8');
console.log('✓ E-2 contact form styled');
