# Aura Films · 5 Story posters + 2 Reels (v2, 27 Oct 2026)

Version 2 replaces the black-and-white "brutalist" set after Joel's review. What changed:

- **Colour.** Real colour photography with a light warm film grade. The Fall Mini Sessions frames get an autumn grade that warms summer greens toward gold.
- **Brand look.** Brand palette and the brand headline font (Clash Display), with Gambetta italic accents and Satoshi body text.
- **No labels or boxes.** "File 01"-style labels and every boxed text block are gone. The ask is a plain line of text.
- **Nothing cut off.** No word is cropped by the frame edge.
- **Calm reels.** The reels are slow and smooth: 3-second scenes, soft crossfades, a gentle push-in. There are zero flash transitions, and the biggest brightness change in any single frame is 5%.
- **Fall Mini Sessions** gets two posters and its own reel.
- **New copy.** Persuasive and warm, with no prices.

## Posters (1080 x 1920)

All copy sits between y=250 and y=1640, clear of the Story progress bar and reply bar.

| # | Theme | Photo | Headline | Supporting line | Ask |
|---|---|---|---|---|---|
| 01 | Fall Mini Sessions | Woman in a red coat | Fall Mini Sessions · *before the leaves let go.* | Short outdoor sessions in the last of the autumn light, for families, couples and portraits. | Limited dates · DM "FALL" to hold yours |
| 02 | Fall Mini Sessions | Reading on a park bench, golden light | Your holiday card is hiding in this light. | One short session gives you the card, a gift for the grandparents and a new photo for your profile. | Limited dates · DM "FALL" |
| 03 | The Party | Cake-feeding at a celebration | Somebody always ends up wearing the cake. | Enjoy your party. We'll keep the moments you were too busy laughing to see. | DM "PARTY" with your date |
| 04 | The Escape | Couple in a frame in a sunflower field | Run away for an afternoon. | Just the two of you, a field somewhere in Ontario and the hour before sunset. | DM "ESCAPE" and pick the field |
| 05 | The Raw Emotion | Bride laughing as a flower goes in her hair | The laugh you hide in photos is the one they fell for. | We photograph your wedding the way it actually feels: the laughing, the crying and everything in between. | DM "DATE" to check your wedding date |

Fall Mini Sessions facts used are only the ones already published: Kingston, autumn 2026, short outdoor sessions, families / couples / portraits, limited dates, DM "FALL". **Add dates when Albin confirms them.**

## Reels (1080 x 1920, 18 s, -14 LUFS)

Both are built on `src/calm.tsx`. Each scene is one bar of music (3 s at 80 BPM), with a one-beat crossfade (0.75 s), a slow push-in and type that rises softly.

**Fall Mini Sessions** (`src/FallMinisReel.tsx`, music "Roof Tops", HoliznaCC0, CC0)
1. Fall Mini Sessions (Kingston · Autumn 2026)
2. Short sessions in the last of the autumn light.
3. For families, couples and portraits.
4. Your holiday card is hiding in this light.
5. Limited dates this autumn. *Grab one before the leaves let go.*
6. End card: Fall Mini Sessions · DM "FALL" to hold your spot · @aura.filmsca · itsaurafilms.com

**How it felt** (`src/FeltReel.tsx`, music "One Good Day", HoliznaCC0, CC0)
1. Weddings: The laugh you hide in photos is the one they fell for.
2. Parties: Somebody always ends up wearing the cake.
3. Engagements: Run away for an afternoon.
4. Weddings: The quiet second before the vows.
5. Celebrations: Everyone you love, in one frame.
6. End card: Photographs that remember how it felt. · DM "DATE" to check your date

## Why these should work

The research is in `research/competitor-index.csv`: 55 accounts, 326 top posts.

- **Warm, specific scenes beat generic praise.** The cake, the bench, the laugh are easy to picture (the availability heuristic), and no competitor can claim these exact moments.
- **One ask per piece, one word to send.** Only 1% of competitor posts ask for a DM. A single keyword is the lowest-effort way to start a conversation.
- **Honest scarcity.** "Limited dates" for Fall Minis is true and specific. There is no countdown or fake urgency.
- **Smooth motion keeps people watching.** Gentle movement is easy on the eyes, and the end card holds long enough to read the ask.
- **Post the posters as Stories with a DM sticker.** The same five also work as one feed carousel, the strongest competitor format (79% of their top posts). That needs a 4:5 crop, which can be exported on request.

## Credits
- Photography: Aura Films' own library.
- Music: HoliznaCC0, CC0 1.0 (licences checked live 27 Oct 2026):
  - https://freemusicarchive.org/music/holiznacc0/summer-air-lo-fi/ (Roof Tops)
  - https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/ (One Good Day)
- Fonts: Fontshare (Clash Display, Gambetta, Satoshi), ITF Free Font Licence.
- Remotion: free for companies with up to 3 employees (verify at remotion.dev/license).
