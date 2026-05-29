# Graph Report - .  (2026-04-11)

## Corpus Check
- Large corpus: 163 files · ~7,605,693 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 50 nodes · 64 edges · 8 communities detected
- Extraction: 75% EXTRACTED · 23% INFERRED · 2% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Frontend Website Rules (CLAUDE.md)` - 13 edges
2. `Brand Color Palette (CSS Variables)` - 8 edges
3. `Aura Films Website Project` - 5 edges
4. `Aura Films Logo (Black)` - 4 edges
5. `Aura Films Logo - Black on White` - 4 edges
6. `Aura Films Logo - Light Variant` - 4 edges
7. `Aura Films Logo - Orange Background` - 4 edges
8. `Aura Films Logo - White on Transparent` - 4 edges
9. `Bride and Groom Intimate Indoor Portrait` - 4 edges
10. `screenshot.mjs Screenshot Tool` - 3 edges

## Surprising Connections (you probably didn't know these)
- `AF-Quotation PDF (Aura Films Quotation Document)` --conceptually_related_to--> `Aura Films Website Project`  [INFERRED]
  Logo/AF-Quotation.pdf → CLAUDE.md
- `brand_assets/ Folder` --references--> `Aura Films Logo (Black)`  [INFERRED]
  CLAUDE.md → Logo/Aura Films Logo Black.png
- `brand_assets/ Folder` --references--> `Aura Films Logo (White)`  [INFERRED]
  CLAUDE.md → Logo/Aura Films Logo White.png
- `Aura Films Website Project` --references--> `Aura Films Logo (Black)`  [INFERRED]
  CLAUDE.md → Logo/Aura Films Logo Black.png
- `Aura Films Website Project` --references--> `Aura Films Logo (White)`  [INFERRED]
  CLAUDE.md → Logo/Aura Films Logo White.png

## Hyperedges (group relationships)
- **Maternity Family Session - Red Dress Mother** —  [EXTRACTED 1.00]
- **Engagement Session - Indoor Sofa Shoot** —  [EXTRACTED 1.00]
- **Wedding Day Set - Dark Teal Suit Groom** —  [INFERRED 0.90]
- **Single Wedding Event – South Asian Christian Wedding** —  [EXTRACTED 1.00]
- **Aura Films Brand Asset Collection** —  [EXTRACTED 1.00]

## Communities

### Community 0 - "Design Rules & Typography"
Cohesion: 0.27
Nodes (10): Anti-Generic Design Guardrails, Britney Font (Britney-Variable.woff2), Cabinet Grotesk Font (CabinetGrotesk-Variable.woff2), Clash Display Font (ClashDisplay-Variable.woff2), /fonts/ Directory (Local Font Files), frontend-design Skill, Frontend Website Rules (CLAUDE.md), Hard Rules for Frontend Development (+2 more)

### Community 1 - "Brand Assets & Project Identity"
Cohesion: 0.32
Nodes (8): Aura Films Website Project, brand_assets/ Folder, Hero Image – Two Photographers with Camera, AF-Quotation PDF (Aura Films Quotation Document), Aura Films Logo (Black), Aura Films Logo (White), Home Page Design Change Annotations, Footer Design Inspiration – Mango Studios

### Community 2 - "Color System"
Cohesion: 0.29
Nodes (7): Brand Color: Background (#F9F0E1), Brand Color: Charcoal (#212922), Brand Color: Emerald (#39D599), Brand Color: Orange (#e8a748), Brand Color Palette (CSS Variables), Brand Color: Tea Green (#C5EBC3), Dark Theme CSS Variables ([data-theme=dark])

### Community 3 - "Logo Variants & Hero Imagery"
Cohesion: 0.73
Nodes (6): Aura Films Brand Identity, Aura Films Hero Photo - Two Filmmakers, Aura Films Logo - Black on White, Aura Films Logo - Light Variant, Aura Films Logo - Orange Background, Aura Films Logo - White on Transparent

### Community 4 - "Wedding Event Photography"
Cohesion: 0.47
Nodes (6): Groom Portrait – Green Tuxedo on Stairs, Bride Portrait – White Lace Gown with Bouquet, Bride and Groom Intimate Indoor Portrait, Wedding Ceremony Ring Exchange, Wedding Vows Moment with Lyric Screen, Bride Gown and Veil – Back Detail Shot

### Community 5 - "Dev Tooling & Screenshots"
Cohesion: 0.4
Nodes (5): Localhost Serving Requirement, Puppeteer Browser Automation, screenshot.mjs Screenshot Tool, Screenshot Comparison Workflow, serve.mjs Dev Server

### Community 6 - "Couples & Engagement Portraits"
Cohesion: 0.5
Nodes (4): Wedding Couple Portrait - Bride and Groom Embrace, Engagement Couple - Playful Indoor Color Shot, Engagement Couple - Black and White Indoor Portrait, Groom Solo Portrait - Outdoor Venue

### Community 7 - "Maternity Family Session"
Cohesion: 0.83
Nodes (4): Maternity Family Portrait - Child Holds Ultrasound, Maternity Solo Portrait - Window Light, Maternity Couple - Black and White Ultrasound Reveal, Maternity - Child Listens to Baby with Stethoscope

## Ambiguous Edges - Review These
- `Wedding Couple Portrait - Bride and Groom Embrace` → `Engagement Couple - Playful Indoor Color Shot`  [AMBIGUOUS]
  images/IMG_9115.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **15 isolated node(s):** `frontend-design Skill`, `Puppeteer Browser Automation`, `Tailwind CSS via CDN`, `Brand Color: Orange (#e8a748)`, `Brand Color: Background (#F9F0E1)` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Wedding Couple Portrait - Bride and Groom Embrace` and `Engagement Couple - Playful Indoor Color Shot`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Frontend Website Rules (CLAUDE.md)` connect `Design Rules & Typography` to `Brand Assets & Project Identity`, `Color System`, `Dev Tooling & Screenshots`?**
  _High betweenness centrality (0.322) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Aura Films Website Project` (e.g. with `Frontend Website Rules (CLAUDE.md)` and `AF-Quotation PDF (Aura Films Quotation Document)`) actually correct?**
  _`Aura Films Website Project` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Aura Films Logo (Black)` (e.g. with `Aura Films Website Project` and `brand_assets/ Folder`) actually correct?**
  _`Aura Films Logo (Black)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `frontend-design Skill`, `Puppeteer Browser Automation`, `Tailwind CSS via CDN` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._