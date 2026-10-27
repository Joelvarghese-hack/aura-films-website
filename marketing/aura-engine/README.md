# aura-engine

Remotion project that renders the Aura Standard posters and Reels.

| Composition | File | Output |
|---|---|---|
| `FallMinisReel` | `src/FallMinisReel.tsx` | 18 s Reel, calm crossfades on an 80 BPM bar grid |
| `FeltReel` | `src/FeltReel.tsx` | 18 s Reel, same calm engine (`src/calm.tsx`) |
| `P1-FallHero` … `P5-Felt` | `src/Posters.tsx` | 1080x1920 Story posters |

Shared tokens, fonts, grain and the fit-to-box text live in `src/brand.tsx`.

```bash
npm install
npm run dev                      # Remotion Studio
npx remotion render FallMinisReel out/FallMinisReel.mp4
npx remotion render FeltReel out/FeltReel.mp4
npx remotion still P1-FallHero out/P1-FallHero.png
python3 scripts/flashcheck.py out/FeltReel.mp4   # approximate WCAG 2.3.1 flash test
```

In the cloud container Chromium is not downloaded; add
`--browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`.

- `scripts/grade_color.py warm|fall <photos…>` builds the colour grades into `public/img/c-*.jpg` (fall eases greens toward autumn gold).
- `public/audio/*.wav` are 18 s excerpts of CC0 tracks by HoliznaCC0 at 80 BPM, loudness-normalised to -14 LUFS.
- Remotion licence: free for individuals and companies with up to 3 employees; check remotion.dev/license.
