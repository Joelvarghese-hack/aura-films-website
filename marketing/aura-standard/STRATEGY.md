# The Aura Standard: 5 Story posters + 2 Reels

Built 26 Oct 2026 for Aura Films (Kingston, Ontario). Brief: brutalist, high-fashion, "ugly-pretty"; Balenciaga art direction crossed with 1990s Magnum contact sheets; PAS copy with the adjectives stripped out; hard cuts only; 10% darker and grittier than the market.

Every number below comes from the scrape in `research/` (Apify, 26 Oct 2026). Where something is my judgement and not data, it says so.

---

## 1. What the market is doing (55 accounts, last 60 days)

**Who:** 42 Ontario photographers (Toronto, Kingston, Ottawa, Prince Edward County, Muskoka) and 13 global editorial/documentary accounts, found through 18 Google searches plus Instagram account search. Full list with followers and engagement: `research/competitor-index.csv`.

**What was pulled:** up to 15 posts per account published since 27 Aug 2026. 49 accounts had posts in the window, and six had none. From those, each account's 10 best posts by engagement were kept: **326 posts**.

| Finding | Number | What we did with it |
|---|---|---|
| Carousels dominate the best posts | 79% of top posts. In the top quarter by engagement rate, 72 of 81 are carousels | Posters are built as a numbered series (File 01 to 05) so they also post as one carousel |
| Single images under-perform | 0.63x the account's own median engagement | No single-image feed posts in this set |
| Shorter captions win | Top quarter median 307 characters vs 416 in the bottom quarter | Micro-stories are 15 to 25 words |
| Selling in the caption costs engagement | "Booking / dates open" language in 14% of bottom-quarter posts vs 6% of the top quarter | The ask lives on the Story as a one-word DM keyword, never in a feed caption |
| Almost nobody asks for the DM | 1% of top posts say DM, 1% say inquire | A single-word DM keyword is a gap we can own |
| The market's voice is soft | 40% of captions use sweet / dreamy / beautiful / perfect / love / capture / timeless; 33% use a heart emoji | Aura's copy uses none of them. Plain nouns and verbs are the differentiator |
| The market's photos | Median brightness 0.47, contrast 0.24, 21% black and white | Aura photos are graded to brightness 0.42 (exactly 10% darker) with contrast 0.28 to 0.37 (grittier) |
| Does darker / B&W perform better? | **No measurable difference** (1.0x vs 1.0x relative engagement) | Going dark is a brand-distinctiveness choice. It is not an algorithm hack, and we should not pretend it is |

**Limits of this data:** engagement uses public likes and comments, because reach and saves are private. Some accounts hide likes. One collab post had an engagement rate of 4,296% (an outlier), so medians are used throughout. Competitors' **Stories** can't be scraped after they expire, so the Story patterns are inferred from their feed. All of this is correlation, not proof.

---

## 2. The five Story posters (1080 x 1920)

Fonts: **Panchang** 800 (hooks), **Sentient** italic (micro-stories, the Magnum caption voice), **Switzer** 700 (labels and commands). All are Fontshare fonts; none are on the banned list.
Colour: black `#000000`, white `#FFFFFF`, label grey `#A3A3A3`, brand orange `#E8A748` used once per poster (grease pencil, DM block), brand paper `#F9F0E1` for the slug on poster 05.
All copy sits between y=250 and y=1620 so Instagram's progress bar and reply bar never cover it.

### 01 · The Party · "Contact sheet"
- **Visual:** [Eye level, 6-frame contact sheet] [Available indoor light, graded to hard black and white, crushed blacks] [Guests laughing, a couple feeding each other cake; frame 12 circled in orange grease pencil]
- **Copy:** THE PHOTOGRAPHER LEFT AT NINE. + *The cake went sideways at ten. Your uncle found the dance floor at eleven. Nobody has a photo of either.* + KEEP US TILL THE LIGHTS COME ON. **DM "PARTY"**

### 02 · The Party · "Two minutes"
- **Visual:** [Eye level, full bleed, hook straddling the photo edge] [Party lighting, black and white, bottom gradient to black] [A man mid-speech with a mic, the guest of honour laughing beside him]
- **Copy:** "TWO MINUTES," HE SAID. + *Every speech runs long. Every room laughs anyway. We photograph the room.* + BRING US TO THE NEXT ONE. **DM "PARTY"**

### 03 · The Escape · "Window"
- **Visual:** [Wide shot cropped to a narrow vertical window] [Late daylight, black and white] [A couple kissing inside a white frame in a sunflower field; "ESCAPE" as outlined type running off the left edge]
- **Copy:** LEAVE THE GUEST LIST AT HOME. + *Two people, one field and the hour before the light goes. Engagement sessions anywhere in Ontario.* + PICK THE FIELD. **DM "ESCAPE"**

### 04 · The Raw Emotion · "Face"
- **Visual:** [Extreme macro, eye and brow] [Soft side light, black and white, water droplets on the skin] [An unposed look; hard orange horizon line under the photo]
- **Copy:** YOUR FACE DOES THINGS YOU HAVE NEVER SEEN. + *The breath before the vows. The jaw before the speech. We photograph what happens between the poses.* + PHOTOGRAPHS THAT REMEMBER HOW IT FELT. **DM "FELT"**

### 05 · The Raw Emotion · "Hands"
- **Visual:** [Close, over the shoulder at a ceremony] [Open shade, black and white, heavy bottom gradient] [Hands mid ring exchange; a paper slug taped top right]
- **Copy:** HANDS SHAKE. LET THEM. + *The ring sticks at the knuckle. Someone laughs. The room breathes out. That is the frame you keep.* + TELL US THE DATE. **DM "DATE"**

---

## 3. The two Reels (1080 x 1920, 15 s, 30 fps, -14 LUFS)

Code: `marketing/aura-engine/src/Strobe.tsx` and `marketing/aura-engine/src/Glitch.tsx` (Remotion 4.0.539). Render with `npm run render:strobe` / `npm run render:glitch`.

### Reel 1 · STROBE
- **Concept:** The night ends. The photos don't.
- **Audio:** "Phonk ish" by HoliznaCC0 (CC0), measured at **150.0 BPM**, which puts one eighth note at exactly 0.2 s = 6 frames. Every cut lands on the grid. Dark phonk drum bed, excerpt taken from the loudest 15 s of the track.
- **Sequence** (every cut is a hard cut; each word holds one beat as two 0.2 s cuts: a centred slam, then a small restage with an orange frame count):

| Frames | Content | Colour |
|---|---|---|
| 0-71 | THE / NIGHT / ENDS. / THE / PHOTOS / DON'T. | `#FFFFFF` on `#000000`, counts `#E8A748` |
| 72-119 | Party burst: 4 photographs, 2 cuts each, snap push-in | B&W, labels `#FFFFFF` |
| 120-191 | VOWS. / SPEECH. / CAKE. / FLOOR. / TEARS. / TAXI. | `#FFFFFF` on `#000000` |
| 192-239 | Raw-emotion burst: 4 photographs | B&W |
| 240-287 | KEEP US / TILL THE / LIGHTS / COME ON. | `#FFFFFF` on `#000000` |
| 288-335 | PHOTOGRAPHS / THAT REMEMBER / HOW IT / FELT. | last word `#E8A748` |
| 336-449 | End card: logo, WEDDINGS. PARTIES. PORTRAITS., Kingston, Ontario, DM "DATE" block jumping sides on the beat | `#FFFFFF`, block `#E8A748` with `#000000` text |

### Reel 2 · GLITCH
- **Concept:** Say cheese. Say nothing.
- **Audio:** "Childs Play" by HoliznaCC0 (CC0), **160 BPM** trap (one beat = 11.25 frames). The beat grid and the 48 loudest hits of the excerpt were measured and saved to `glitch-beats.json`. Type slams on beats, and the tear fires on hits.
- **Sequence** (glitch = brand-orange `#E8A748` and emerald `#39D599` channel split plus a 7-band slice tear, stepped over 3 frames on each hit):

| Frames | Content |
|---|---|
| 0-89 | SAY (f1) / CHEESE. (f12), tearing from f23, hard cut to SAY / NOTHING. (f45, `#E8A748`) |
| 90-179 | Laughing bride, full bleed: LAUGH. (f90) / LEAN IN. (f113) / CRY. (f135) / FORGET US. (f158, `#E8A748`) |
| 180-269 | A new photograph on every beat (8), RAW and EMOTION alternating in `#FFFFFF` |
| 270-359 | WE PHOTOGRAPH / WHAT HAPPENS / BETWEEN / THE POSES. (f338, `#E8A748`), alternating left/right |
| 360-449 | End card: PHOTOGRAPHS THAT REMEMBER HOW IT FELT., Weddings / Portraits / Events, DM "DATE", itsaurafilms.com |

### Flash safety
0.2 s cuts can trigger photosensitive seizures if large areas swing between dark and bright. Both reels were checked with `scripts/flashcheck.py`, an approximation of the WCAG 2.3.1 three-flashes rule (not a certified Harding/PEAT test):
- **Strobe:** worst 1-second window has 1 flash. PASS.
- **Glitch:** worst 1-second window has 1 flash. PASS.

The glitch originally failed (6 flashes in one second) because the colour split brightened whole photos. Photo scenes now use a luminance-neutral tear, and each photo burst is ordered from darkest to brightest.

---

## 4. Why this should beat the feed (marketing-psychology)

How Instagram ranks content changes often, and I can't verify the 2026 ranking rules from here. So these are the behavioural reasons the work should earn attention and DMs, not algorithm promises. [Medium confidence: test before you scale.]

1. **Contrast effect / pattern interrupt.** The measured feed is soft, warm and pretty (40% sweet vocabulary, 33% hearts, brightness 0.47). Five black, brutalist frames in that scroll are the thing that looks different, and different stops the thumb. This is the main bet.
2. **Zeigarnik effect (open loops).** Every hook opens a question ("The photographer left at nine.", "Two minutes, he said.") and the micro-story closes it two lines later. File 01 to 05 numbering opens a second loop: people want the set.
3. **Loss aversion.** PAS frames the problem as a loss ("The night ends. The photos don't."; "Nobody has a photo of either."). Losing the night is felt more strongly than gaining nice photos.
4. **Availability heuristic.** Cake sideways, uncle on the dance floor, the ring stuck at the knuckle. Specific scenes are easy to picture, so the outcome feels real and likely.
5. **Hick's Law + activation energy.** One action per asset: DM one word. Typing "DATE" is easier than filling in an inquiry form, and the data says almost no competitor asks this simply (1%).
6. **Pratfall effect.** The copy celebrates the flaws (speeches that run long, shaking hands, a ring that sticks). Imperfection reads as honest and documentary, which is Aura's actual philosophy.
7. **Peak-end rule (Reels).** Both reels peak at the fastest burst, then end on a held card with one ask. People judge a clip by its peak and its end.

**How to post them (from the data):**
- Post the reels as Reels.
- Post the 5 posters as Stories, using a question or DM sticker with the matching keyword.
- Also post the same five as one feed carousel. That's the format competitors win with, but 9:16 will need a 4:5 crop: ask me and I'll export it.
- Keep feed captions under about 300 characters, with no "now booking" line.

**Measure:** DMs per keyword (PARTY / ESCAPE / FELT / DATE), Story replies and Reel shares. Two weeks is enough for a first read.

---

## 5. Credits and licences
- Photography: Aura Films' own library. No client names or invented details.
- Music: HoliznaCC0 on the Free Music Archive, CC0 1.0 (licence checked live on both album pages, 26 Oct 2026). "Phonk ish" from *PHONK - AURA FARMING* (https://freemusicarchive.org/music/holiznacc0/phonk-aura-farming/), "Childs Play" from *After Dark* (https://freemusicarchive.org/music/holiznacc0/after-dark/). If Instagram ever mutes a Reel, dispute it with these links or swap in a track from its own library.
- Fonts: Fontshare (ITF Free Font Licence).
- Remotion: free for individuals and for-profit companies with up to 3 employees. Larger teams need a company licence. [Medium confidence: verify at remotion.dev/license]
- Research: Apify (Google Search Results Scraper, Instagram Scraper), total spend $1.51.
