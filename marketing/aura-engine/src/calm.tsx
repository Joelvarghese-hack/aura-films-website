/* Calm reel engine: 3 s scenes (one bar at 80 BPM), slow push-in, one-beat crossfades,
   copy that rises softly into place. Nothing cuts hard, flashes or shakes. */
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, Grain, img } from "./brand";

export const SCENE = 90; // frames per scene: one bar at 80 BPM, 30 fps
export const XFADE = 22; // crossfade: one beat (0.75 s)
const M = 72;
const ease = Easing.bezier(0.22, 1, 0.36, 1); // soft spring-like ease-out

export type Shot = { src: string; pos?: string; kicker?: string; line: string; accent?: string };

const Rise: React.FC<{ at: number; out: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, out, children, style }) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [at, at + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const leave = interpolate(f, [out, out + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: enter * leave, transform: `translateY(${(1 - enter) * 34}px)`, ...style }}>{children}</div>;
};

const PhotoScene: React.FC<{ shot: Shot; index: number; last: boolean }> = ({ shot, index, last }) => {
  const f = useCurrentFrame();
  const len = SCENE + XFADE;
  const fadeIn = index === 0 ? 1 : interpolate(f, [0, XFADE], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const scale = interpolate(f, [0, len], [1.04, 1.11]);
  const drift = interpolate(f, [0, len], [0, index % 2 ? -18 : 18]);
  const textOut = last ? SCENE + XFADE : SCENE - 12;
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Img src={img(shot.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: shot.pos ?? "50% 40%", transform: `scale(${scale}) translateX(${drift}px)` }} />
      <AbsoluteFill style={{ background: C.orange, mixBlendMode: "multiply", opacity: 0.08 }} />
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(27,18,11,0.82) 0%, rgba(27,18,11,0.55) 26%, rgba(27,18,11,0) 52%)" }} />
      <div style={{ position: "absolute", left: M, right: 170, bottom: 470 }}>
        {shot.kicker && (
          <Rise at={10} out={textOut}>
            <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 28, letterSpacing: "0.2em", textTransform: "uppercase", color: C.cream, marginBottom: 18 }}>{shot.kicker}</div>
          </Rise>
        )}
        <Rise at={16} out={textOut}>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: shot.line.length > 34 ? 82 : 104, lineHeight: 1.04, letterSpacing: "-0.02em", wordSpacing: "0.14em", color: C.cream }}>{shot.line}</div>
        </Rise>
        {shot.accent && (
          <Rise at={28} out={textOut}>
            <div style={{ fontFamily: F.serif, fontStyle: "italic", fontWeight: 500, fontSize: 58, lineHeight: 1.2, color: C.cream, marginTop: 16 }}>{shot.accent}</div>
          </Rise>
        )}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ title: string; cta: string }> = ({ title, cta }) => {
  const f = useCurrentFrame();
  const fadeIn = interpolate(f, [0, XFADE], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: C.cream, opacity: fadeIn }}>
      <div style={{ position: "absolute", left: M, right: 170, top: 560 }}>
        <Rise at={14} out={9999}>
          <Img src={img("aura-mark-dark.png")} style={{ height: 96 }} />
        </Rise>
        <Rise at={22} out={9999}>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 96, lineHeight: 1.04, letterSpacing: "-0.02em", wordSpacing: "0.14em", color: C.ink, marginTop: 44 }}>{title}</div>
        </Rise>
        <Rise at={34} out={9999}>
          <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 44, color: C.ink, marginTop: 40 }}>{cta}</div>
        </Rise>
        <Rise at={42} out={9999}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 32, color: C.muted, marginTop: 18 }}>@aura.filmsca · itsaurafilms.com</div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const calmFrames = (shots: Shot[]) => (shots.length + 1) * SCENE;

export const CalmReel: React.FC<{ shots: Shot[]; audio: string; endTitle: string; endCta: string }> = ({ shots, audio, endTitle, endCta }) => (
  <AbsoluteFill style={{ background: C.ink }}>
    <Html5Audio src={staticFile(audio)} />
    {shots.map((s, i) => (
      <Sequence key={s.src + i} from={i * SCENE} durationInFrames={SCENE + XFADE}>
        <PhotoScene shot={s} index={i} last={false} />
      </Sequence>
    ))}
    <Sequence from={shots.length * SCENE}>
      <EndCard title={endTitle} cta={endCta} />
    </Sequence>
    <Grain />
  </AbsoluteFill>
);
