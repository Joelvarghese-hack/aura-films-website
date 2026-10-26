/* GLITCH · Reel 1080x1920 · 15 s · 30 fps
   Music: "Childs Play" by HoliznaCC0 (CC0), 160 BPM (one beat = 11.25 frames).
   glitch-beats.json holds the beat grid and the loudest hits of the excerpt (librosa, see README);
   type slams on beats, the RGB split and slice tear fire on hits. Hard cuts only. */
import { AbsoluteFill, Html5Audio, Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, F, Grain, Meta, img } from "./brand";
import grid from "./glitch-beats.json";

const BEATS: number[] = grid.beats;
const HITS: number[] = grid.hits;
const b = (i: number) => BEATS[Math.min(i, BEATS.length - 1)];

/* Effect strength on this frame: 1 on a hit, then 0.6, 0.3, then nothing (stepped, never a fade). */
const hitStrength = (frame: number) => {
  for (const h of HITS) {
    const d = frame - h;
    if (d >= 0 && d < 3) return [1, 0.6, 0.3][d];
  }
  return 0;
};

const Tints: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="tint-orange">
      <feColorMatrix type="matrix" values="0.91 0 0 0 0  0.65 0 0 0 0  0.28 0 0 0 0  0 0 0 1 0" />
    </filter>
    <filter id="tint-emerald">
      <feColorMatrix type="matrix" values="0.22 0 0 0 0  0.84 0 0 0 0  0.6 0 0 0 0  0 0 0 1 0" />
    </filter>
  </svg>
);

/* Wraps any layer in the Aura glitch: brand-colour channel split + horizontal slice tear. */
/* `photo` mode keeps mean luminance steady (opaque bands over a faint split) so photo scenes
   never flash; type-on-black scenes use the full additive split. */
const Tear: React.FC<{ children: React.ReactNode; boost?: number; photo?: boolean }> = ({ children, boost = 0, photo = false }) => {
  const frame = useCurrentFrame(); // absolute frame: scenes are mounted without a Sequence offset
  const k = Math.min(1, hitStrength(frame) + boost);
  if (k === 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const split = 26 * k;
  const bands = 7;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${split}px)`, filter: "url(#tint-orange)", mixBlendMode: "screen", opacity: photo ? 0.5 : 0.9 }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${-split}px)`, filter: "url(#tint-emerald)", mixBlendMode: "screen", opacity: photo ? 0.5 : 0.9 }}>{children}</AbsoluteFill>
      {Array.from({ length: bands }).map((_, i) => {
        const top = (i / bands) * 100;
        const shift = (random(`s${frame}-${i}`) - 0.5) * 220 * k;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${top}% 0 ${100 - top - 100 / bands}% 0)`, transform: `translateX(${shift}px)`, mixBlendMode: photo ? "normal" : "lighten" }}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* A word that slams in on its beat: 125% → 100% in three stepped frames, then holds. */
const Slam: React.FC<{ at: number; children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ at, children, size, color = C.white, style }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = [1.25, 1.1, 1.03][frame - at] ?? 1;
  return (
    <div style={{ fontFamily: F.cond, fontSize: size, lineHeight: 0.88, textTransform: "uppercase", color, transform: `scale(${s})`, transformOrigin: "left center", ...style }}>{children}</div>
  );
};

const Photo: React.FC<{ src: string; pos?: string }> = ({ src, pos = "50% 40%" }) => (
  <Img src={img(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
);

const PAD = 72;

/* 1 · "SAY CHEESE." torn into "SAY NOTHING." */
const SceneSay: React.FC = () => {
  const frame = useCurrentFrame();
  const torn = frame >= b(4);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Tear boost={frame >= b(2) && frame < b(4) ? 0.35 + 0.65 * (Math.floor((frame - b(2)) / 2) % 2) : 0}>
        <AbsoluteFill style={{ padding: `0 ${PAD}px`, justifyContent: "center" }}>
          <Slam at={b(0)} size={480}>Say</Slam>
          {torn ? (
            <Slam at={b(4)} size={320} color={C.orange}>Nothing.</Slam>
          ) : (
            <Slam at={b(1)} size={320}>Cheese.</Slam>
          )}
        </AbsoluteFill>
      </Tear>
    </AbsoluteFill>
  );
};

/* 2 · one frame, four instructions slammed over it */
const SceneDo: React.FC = () => {
  const lines = ["Laugh.", "Lean in.", "Cry.", "Forget us."];
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Tear>
        <Photo src="wed-4.jpg" pos="40% 35%" />
        <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 10%, rgba(0,0,0,0) 55%)" }} />
        <AbsoluteFill style={{ padding: `0 ${PAD}px`, justifyContent: "flex-end", paddingBottom: 470 }}>
          {lines.map((l, i) => (
            <Slam key={l} at={b(8 + i * 2)} size={215} color={i === 3 ? C.orange : C.white}>
              {l}
            </Slam>
          ))}
        </AbsoluteFill>
      </Tear>
    </AbsoluteFill>
  );
};

/* 3 · a new photograph on every beat, RAW / EMOTION tearing across it */
// ordered by linear luminance, darkest first, so beat cuts climb instead of flickering
const BURST: [string, string][] = [
  ["img_9548.jpg", "50% 40%"],
  ["_dsc1487.jpg", "50% 30%"],
  ["wed-10.jpg", "50% 40%"],
  ["por-7.jpg", "40% 50%"],
  ["wed-4.jpg", "40% 35%"],
  ["_dsc8307.jpg", "50% 30%"],
  ["wed-8.jpg", "50% 30%"],
  ["wed-12.jpg", "50% 50%"],
];
const SceneRaw: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.max(0, BEATS.slice(16, 24).filter((x) => x <= frame).length - 1);
  const [src, pos] = BURST[i];
  const word = i % 2 === 0 ? "Raw" : "Emotion";
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Tear photo>
        <Photo src={src} pos={pos} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontFamily: F.wide, fontWeight: 800, fontSize: word === "Raw" ? 270 : 118, textTransform: "uppercase", color: C.white, letterSpacing: "0.02em", textShadow: "0 0 40px rgba(0,0,0,0.55)" }}>{word}</div>
        </AbsoluteFill>
        <Meta style={{ position: "absolute", left: PAD, top: 300, color: C.white }}>{`File ${String(i + 1).padStart(2, "0")} / 08`}</Meta>
      </Tear>
    </AbsoluteFill>
  );
};

/* 4 · the promise, stacked line by line */
const SceneBetween: React.FC = () => {
  const lines = ["We photograph", "what happens", "between", "the poses."];
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Tear photo>
        <AbsoluteFill style={{ padding: `0 ${PAD}px`, justifyContent: "center" }}>
          {lines.map((l, i) => (
            <Slam key={l} at={b(24 + i * 2)} size={i === 2 ? 300 : 190} color={i === 3 ? C.orange : C.white} style={{ alignSelf: i % 2 ? "flex-end" : "flex-start", transformOrigin: i % 2 ? "right center" : "left center", textAlign: i % 2 ? "right" : "left" }}>
              {l}
            </Slam>
          ))}
        </AbsoluteFill>
      </Tear>
    </AbsoluteFill>
  );
};

/* 5 · end card: holds, twitches on hits */
const SceneEnd: React.FC = () => (
  <AbsoluteFill style={{ background: C.black }}>
    <Tear>
      <AbsoluteFill style={{ padding: `0 ${PAD}px` }}>
        <Img src={img("aura-mark-light.png")} style={{ position: "absolute", left: PAD, top: 520, height: 92 }} />
        <div style={{ position: "absolute", left: PAD, right: 150, top: 640, fontFamily: F.cond, fontSize: 160, lineHeight: 0.9, textTransform: "uppercase", color: C.white }}>
          Photographs that remember how it felt.
        </div>
        <Meta style={{ position: "absolute", left: PAD, top: 1262, color: C.white }}>Weddings / Portraits / Events · Kingston, Ontario</Meta>
        <div style={{ position: "absolute", left: PAD, top: 1320, background: C.orange, color: C.black, fontFamily: F.grot, fontWeight: 700, fontSize: 44, letterSpacing: "0.06em", padding: "22px 30px" }}>DM “DATE”</div>
        <Meta style={{ position: "absolute", left: PAD, top: 1440, color: C.grey }}>itsaurafilms.com</Meta>
      </AbsoluteFill>
    </Tear>
  </AbsoluteFill>
);

export const GLITCH_FRAMES = 450;

/* Scenes are authored on the absolute beat grid, so the cut list picks one per frame
   instead of wrapping each in a time-shifted Sequence. */
export const Glitch: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = [0, b(8), b(16), b(24), b(32)];
  const scenes = [SceneSay, SceneDo, SceneRaw, SceneBetween, SceneEnd];
  const S = scenes[cuts.filter((c) => c <= frame).length - 1];
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Tints />
      <Html5Audio src={staticFile("audio/glitch.wav")} />
      <S />
      <Grain opacity={0.2} />
    </AbsoluteFill>
  );
};
