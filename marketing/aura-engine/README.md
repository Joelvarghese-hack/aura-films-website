# aura-engine

Remotion project that renders the Aura Standard posters and Reels.

| Composition | File | Output |
|---|---|---|
| `Strobe` | `src/Strobe.tsx` | 15 s Reel, hard cuts on a 150 BPM grid |
| `Glitch` | `src/Glitch.tsx` | 15 s Reel, kinetic type + brand-colour glitch on a 160 BPM grid |
| `P1-Party` … `P5-Hands` | `src/Posters.tsx` | 1080x1920 Story posters |

Shared tokens, fonts, grain and the fit-to-box text live in `src/brand.tsx`.

```bash
npm install
npm run dev                      # Remotion Studio
npm run render:strobe            # out/strobe-reel.mp4
npm run render:glitch            # out/glitch-reel.mp4
npx remotion still P1-Party out/P1-Party.png
python3 scripts/flashcheck.py out/strobe-reel.mp4   # approximate WCAG 2.3.1 flash test
```

In the cloud container Chromium is not downloaded; add
`--browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`.

- `scripts/grade.py <luma> <photos…>` builds the black-and-white grade into `public/img/` with the mean brightness pinned (0.42 = 10% under the measured market median of 0.47).
- `public/audio/*.wav` are 15 s excerpts of CC0 tracks by HoliznaCC0, loudness-normalised to -14 LUFS.
- `src/glitch-beats.json` is the measured beat grid and hit list for `glitch.wav`.
- Remotion licence: free for individuals and companies with up to 3 employees; check remotion.dev/license.
