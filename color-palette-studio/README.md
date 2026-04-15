# Color Palette Studio

**Build, analyze, fix, and export professional color palettes.**

A premium web tool for designers, marketers, and small business owners who need to create, validate, and export color systems. Freemium model — core tools are free, advanced exports and analysis are Pro.

---

## Features

- **Palette Builder** — Up to 8 colors with roles, hex/RGB/HSL editing, native color picker
- **Image Extraction** — Drop an image; extract its top 6 dominant colors
- **Shade Generator** — 9-step (50–900) shade scale per color, Tailwind-style
- **Color Harmony Engine** — 7 harmony types with one-click add to palette
- **WCAG 2.1 Contrast Checker** — All pair combinations, sorted worst-first
- **Issues & Fix Engine** — 11 checks with plain-English fixes and apply buttons
- **Color Blindness Simulator** — Deuteranopia, Protanopia, Tritanopia
- **Palette Metrics** — Temperature, mood, luminance spread, hue range
- **Live UI Preview** — Mock landing page rendered with your palette roles
- **Export** — CSS vars, SCSS, JSON tokens, Tailwind config, PNG swatch sheet, Adobe ASE
- **History** — Last 10 palettes auto-saved to localStorage
- **Random Generator** — 7 palette types (warm, cool, pastel, earthy, etc.)

---

## Running Locally

No build step required for development. Open directly in a browser:

```bash
# Option 1: Open index.html directly
open color-palette-studio/index.html

# Option 2: Serve locally (recommended — avoids any CORS issues)
cd color-palette-studio
node serve.mjs
# → http://localhost:3000
```

---

## Production Build

Requires Node.js 18+ and npm.

```bash
cd color-palette-studio

# Install Terser (one-time)
npm install

# Build — minifies JS to dist/
npm run build

# Output: dist/ (ready to deploy)
```

The `dist/` folder contains:
- Minified + mangled JS files
- Copied HTML, CSS, assets
- `.nojekyll` for GitHub Pages

---

## Deploying to GitHub Pages

```bash
# After building:
npm run deploy

# Then commit and push to gh-pages:
git add .
git commit -m "Deploy"
git push origin HEAD:gh-pages
```

Your site will be live at `https://yourusername.github.io/color-palette-studio/`.

---

## File Structure

```
color-palette-studio/
├── index.html        ← Main HTML (all panels, modals, markup)
├── styles.css        ← Design system, layout, all component styles
├── colorUtils.js     ← All color math (zero dependencies)
├── export.js         ← ASE binary export engine
├── security.js       ← Client-side deterrence measures
├── app.js            ← Main app logic, state, all UI rendering
├── build.mjs         ← Production build script (Terser)
├── deploy.mjs        ← GitHub Pages deploy helper
├── serve.mjs         ← Local dev server
├── package.json
└── assets/
    └── favicon.svg
```

---

## Tech Stack

- Vanilla HTML, CSS, JavaScript — zero runtime dependencies
- Google Fonts (DM Sans) — loaded via CDN
- Terser — dev dependency for production minification only

---

## License

Copyright © 2026 Joel Varghese. All rights reserved.  
Unauthorized copying, reproduction, or distribution is prohibited.
