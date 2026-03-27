# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed at `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Chrome cache is at `C:/Users/nateh/.cache/puppeteer/`
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

## Brand Fonts
Fonts live in `/fonts/` and are loaded via `@font-face` (NOT Google Fonts):
- **Clash Display** (`/fonts/Clash Display/ClashDisplay-Variable.woff2`) — headings, titles, large display text. Use `font-weight: 700` or `800`.
- **Cabinet Grotesk** (`/fonts/Cabinet Grotesk/CabinetGrotesk-Variable.woff2`) — body copy, UI text, nav, buttons. Default body font.
- **Britney** (`/fonts/Britney/Britney-Variable.woff2`) — accent/editorial use only (index.html `.bio-copy` and `.t-quote`). Bold italic.

Never use: Bebas Neue, DM Sans, Cormorant Garamond, Archivo, or any Google Fonts on this project.

## Brand Color Palette
```css
:root {
  --orange: #e8a748;       /* primary CTA, buttons, highlights */
  --bg: #F9F0E1;           /* page background (light) */
  --charcoal: #212922;     /* footer background, dark surfaces */
  --tea-green: #C5EBC3;    /* testimonial tints, focus borders, work-num */
  --emerald: #39D599;      /* nav hover/active, CTA borders, dot accents, footer link hover */
  --text: #1B120B;         /* primary text */
  --accent: #e8a748;       /* alias for --orange */
  --text-muted: #5a3e2b;
  --text-faint: #8a6a52;
  --surface: #EFE5D2;
  --card: #E8DCC8;
  --border: rgba(33,41,34,0.12);
  --nav-bg: rgba(249,240,225,0.96);
  --footer-bg: #212922;    /* always charcoal */
  --cta-bg: #1B120B;
}
[data-theme="dark"] {
  --orange: #e8a748;
  --bg: #1B120B;
  --tea-green: #7BC99A;
  --emerald: #39D599;
  --text: #F9F0E1;
  --text-muted: #b89a82;
  --text-faint: #6a5040;
  --surface: #24180F;
  --card: #2E1F14;
  --border: rgba(249,240,225,0.09);
  --nav-bg: rgba(27,18,11,0.93);
}
```

Color usage rules:
- Emerald (`#39D599`): nav link hover/active states, CTA button borders, dot accents, footer link hover
- Tea Green (`#C5EBC3`): testimonial section background tint, `.work-num` color, search/input focus border
- Orange (`#e8a748`): primary buttons, `.btn-send`, highlights, footer-big-email hover
- Charcoal (`#212922`): footer background (always), dark card backgrounds in dark mode
- Never use hardcoded `#ff4d00` anywhere — that was the old accent color, fully replaced
