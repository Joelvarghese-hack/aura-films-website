/* STROBE · Reel 1080x1920 · 15 s · 30 fps
   Music: "Phonk ish" by HoliznaCC0 (CC0), 150.0 BPM. One eighth note = 0.2 s = 6 frames,
   so every cut in this file lands on the grid. Hard cuts only: nothing fades.
   Flash safety: text cuts keep the frame near black, photo bursts are graded to the same
   mean luminance, and black/photo swaps happen only at section changes (see scripts/flashcheck.py). */
import { AbsoluteFill, Html5Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, F, FitText, Grain, Meta, img } from "./brand";

const CUT = 6; // frames per cut (0.2 s)
const BEAT = 12; // frames per beat at 150 BPM

type Shot = { kind: "word"; text: string; accent?: boolean } | { kind: "photo"; src: string; pos?: string };

const words = (...w: string[]): Shot[] => w.map((t) => ({ kind: "word", text: t }));
const photos = (...p: [string, string?][]): Shot[] => p.map(([src, pos]) => ({ kind: "photo", src, pos }));

/* Problem → photos → agitation → photos → solution → brand line. Each word holds a full beat
   (two cuts) so it reads; the second cut restages it, which keeps the 0.2 s strobe. */
const SCRIPT: Shot[] = [
  ...words("The", "night", "ends.", "The", "photos", "don’t."),
  ...photos(["_dsc1487.jpg", "50% 30%"], ["_dsc1500.jpg", "50% 35%"], ["wed-6.jpg", "50% 35%"], ["wed-8.jpg", "50% 30%"]), // ordered by luminance: no flicker
  ...words("Vows.", "Speech.", "Cake.", "Floor.", "Tears.", "Taxi."),
  ...photos(["img_9548.jpg", "50% 40%"], ["por-7.jpg", "40% 50%"], ["wed-4.jpg", "45% 40%"], ["_dsc8307.jpg", "50% 30%"]),
  ...words("Keep us", "till the", "lights", "come on."),
  ...words("Photographs", "that remember", "how it", "felt."),
];
// the last word of the brand line is the one accent
(SCRIPT[SCRIPT.length - 1] as { accent?: boolean }).accent = true;

const WordCut: React.FC<{ text: string; half: 0 | 1; index: number; accent?: boolean }> = ({ text, half, index, accent }) => {
  // cut A: full-width slam, centred. cut B: same word restaged small, top-left, with a frame count.
  const big = half === 0;
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: big ? 0 : 520, bottom: big ? 0 : undefined, display: "flex", alignItems: "center", justifyContent: big ? "center" : "flex-start" }}>
        <FitText
          max={big ? 230 : 96}
          min={40}
          width={952}
          height={big ? 760 : 110}
          style={{ fontFamily: F.wide, fontWeight: 800, textTransform: "uppercase", lineHeight: 1, wordSpacing: "0.1em", color: accent ? C.orange : C.white, textAlign: big ? "center" : "left" }}
        >
          {text}
        </FitText>
      </div>
      {!big && <Meta style={{ position: "absolute", left: 64, top: 640, color: C.orange }}>{`${String(index + 1).padStart(2, "0")} / Aura Films`}</Meta>}
    </AbsoluteFill>
  );
};

const PhotoCut: React.FC<{ src: string; pos?: string; index: number }> = ({ src, pos = "50% 50%", index }) => {
  const f = useCurrentFrame(); // local to the cut: 0..5
  const push = 1.06 - f * 0.01; // snap-zoom inside the cut, no fade
  return (
    <AbsoluteFill style={{ background: C.black, overflow: "hidden" }}>
      <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${push})` }} />
      <Meta style={{ position: "absolute", right: 120, top: 300, color: C.white, fontSize: 22 }}>{`${String(index + 1).padStart(2, "0")}A`}</Meta>
    </AbsoluteFill>
  );
};

const END = SCRIPT.reduce((n, s) => n + (s.kind === "word" ? BEAT : CUT * 2), 0);

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const beat = Math.floor(f / BEAT) % 2; // DM block jumps sides on the beat: a hard cut, low luminance change
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Img src={img("aura-mark-light.png")} style={{ position: "absolute", left: 64, top: 560, height: 92 }} />
      <div style={{ position: "absolute", left: 64, right: 140, top: 720, fontFamily: F.wide, fontWeight: 800, fontSize: 64, lineHeight: 1.05, textTransform: "uppercase", color: C.white }}>
        Weddings. Parties. Portraits.
      </div>
      <Meta style={{ position: "absolute", left: 64, top: 960, color: C.white }}>Kingston, Ontario / itsaurafilms.com</Meta>
      <div style={{ position: "absolute", top: 1060, left: beat ? undefined : 64, right: beat ? 140 : undefined, background: C.orange, color: C.black, fontFamily: F.grot, fontWeight: 700, fontSize: 44, letterSpacing: "0.06em", padding: "22px 30px" }}>
        DM “DATE”
      </div>
    </AbsoluteFill>
  );
};

export const STROBE_FRAMES = 450;

export const Strobe: React.FC = () => {
  let t = 0;
  const seqs: React.ReactNode[] = [];
  SCRIPT.forEach((s, i) => {
    if (s.kind === "word") {
      ([0, 1] as const).forEach((h) => {
        seqs.push(
          <Sequence key={`${i}-${h}`} from={t + h * CUT} durationInFrames={CUT}>
            <WordCut text={s.text} half={h} index={i} accent={s.accent} />
          </Sequence>,
        );
      });
      t += BEAT;
    } else {
      // photos run two cuts each: the second cut pushes in from a tighter crop
      ([0, 1] as const).forEach((h) => {
        seqs.push(
          <Sequence key={`${i}-${h}`} from={t + h * CUT} durationInFrames={CUT}>
            <div style={{ position: "absolute", inset: 0, transform: h ? "scale(1.18)" : undefined }}>
              <PhotoCut src={s.src} pos={s.pos} index={i} />
            </div>
          </Sequence>,
        );
      });
      t += CUT * 2;
    }
  });
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Html5Audio src={staticFile("audio/strobe.wav")} />
      {seqs}
      <Sequence from={END} durationInFrames={STROBE_FRAMES - END}>
        <EndCard />
      </Sequence>
      <Grain opacity={0.2} />
    </AbsoluteFill>
  );
};
