/* Five Instagram Story posters (1080x1920) for the Aura Standard.
   Story safe area: copy lives between y=250 and y=1620 so the progress bar and reply bar never cover it. */
import { AbsoluteFill, Img } from "remotion";
import { C, F, FitText, Grain, Meta, PencilLoop, img } from "./brand";

const M = 72; // outer margin
const Hook: React.FC<{ text: string; x: number; y: number; w: number; h: number; max: number; color?: string; align?: "left" | "center" }> = ({ text, x, y, w, h, max, color = C.white, align = "left" }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 10 }}>
    <FitText max={max} width={w} height={h} style={{ fontFamily: F.wide, fontWeight: 800, textTransform: "uppercase", lineHeight: 1.02, letterSpacing: "0.01em", wordSpacing: "0.12em", color, textAlign: align }}>
      {text}
    </FitText>
  </div>
);
const Story: React.FC<{ text: string; x: number; y: number; w: number; size?: number }> = ({ text, x, y, w, size = 38 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: F.serif, fontStyle: "italic", fontSize: size, lineHeight: 1.36, color: C.white, zIndex: 10 }}>{text}</div>
);
const Command: React.FC<{ line: string; kw: string; x: number; y: number }> = ({ line, kw, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 22, zIndex: 10 }}>
    <span style={{ fontFamily: F.grot, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", textTransform: "uppercase", color: C.white }}>{line}</span>
    <span style={{ fontFamily: F.grot, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", background: C.orange, color: C.black, padding: "12px 18px" }}>DM “{kw}”</span>
  </div>
);
const Cover: React.FC<{ src: string; pos?: string; style: React.CSSProperties }> = ({ src, pos = "50% 50%", style }) => (
  <div style={{ position: "absolute", overflow: "hidden", ...style }}>
    <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, display: "block" }} />
  </div>
);
const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.black }}>
    {children}
    <Grain still opacity={0.18} />
  </AbsoluteFill>
);

/* 01 · THE PARTY · contact sheet with a grease-pencil select */
export const PosterParty: React.FC = () => {
  const cells = ["_dsc1487.jpg", "wed-8.jpg", "_dsc1500.jpg", "wed-6.jpg", "_dsc1534.jpg", "wed-11.jpg"];
  const cw = 300, ch = 340, gap = 18, top = 300;
  return (
    <Base>
      <Meta style={{ position: "absolute", left: M, top: 250 }}>Aura Films / File 01</Meta>
      <Meta style={{ position: "absolute", right: M, top: 250 }}>The Party</Meta>
      {cells.map((c, i) => {
        const x = M + (i % 3) * (cw + gap), y = top + Math.floor(i / 3) * (ch + 52);
        return (
          <div key={c}>
            <Cover src={c} pos="50% 35%" style={{ left: x, top: y, width: cw, height: ch }} />
            <Meta style={{ position: "absolute", left: x, top: y + ch + 10, fontSize: 18, color: i === 1 ? C.orange : C.grey }}>{`${String(i + 11).padStart(2, "0")} ▸ ${i + 11}A`}</Meta>
          </div>
        );
      })}
      <PencilLoop x={M + cw + gap - 34} y={top - 30} w={cw + 68} h={ch + 64} />
      <Hook text="The photographer left at nine." x={M} y={1100} w={936} h={230} max={104} />
      <Story text="The cake went sideways at ten. Your uncle found the dance floor at eleven. Nobody has a photo of either." x={M} y={1365} w={900} />
      <Command line="Keep us till the lights come on." kw="PARTY" x={M} y={1565} />
    </Base>
  );
};

/* 02 · THE PARTY · flash frame, hook straddling the photo edge */
export const PosterSpeech: React.FC = () => (
  <Base>
    <Cover src="_dsc1487.jpg" pos="50% 28%" style={{ left: 0, top: 0, width: 1080, height: 1200 }} />
    <div style={{ position: "absolute", left: 0, top: 760, width: 1080, height: 440, background: "linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0))" }} />
    <Meta style={{ position: "absolute", left: M, top: 250, color: C.white }}>File 02 / The Party</Meta>
    <Meta style={{ position: "absolute", right: 36, top: 520, color: C.orange, writingMode: "vertical-rl", fontSize: 20 }}>02 ▸ 02A ▸ 03</Meta>
    <Hook text="“Two minutes,” he said." x={M} y={1000} w={936} h={330} max={128} />
    <Story text="Every speech runs long. Every room laughs anyway. We photograph the room." x={M} y={1370} w={880} />
    <Command line="Bring us to the next one." kw="PARTY" x={M} y={1540} />
  </Base>
);

/* 03 · THE ESCAPE · narrow window, outlined word running off the edge */
export const PosterEscape: React.FC = () => (
  <Base>
    <div style={{ position: "absolute", left: -128, top: 1640, transform: "rotate(-90deg)", transformOrigin: "0 0", fontFamily: F.wide, fontWeight: 800, fontSize: 300, lineHeight: 1, color: "transparent", WebkitTextStroke: `3px ${C.white}`, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
      ESCAPE
    </div>
    <Meta style={{ position: "absolute", right: M, top: 250 }}>File 03 / The Escape</Meta>
    <Cover src="wed-12.jpg" pos="50% 50%" style={{ left: 300, top: 300, width: 708, height: 800 }} />
    <Meta style={{ position: "absolute", left: 300, top: 1112, fontSize: 18, color: C.orange }}>Ontario ▸ Engagements</Meta>
    <Hook text="Leave the guest list at home." x={300} y={1150} w={708} h={220} max={84} />
    <Story text="Two people, one field and the hour before the light goes. Engagement sessions anywhere in Ontario." x={300} y={1390} w={708} size={32} />
    <Command line="Pick the field." kw="ESCAPE" x={300} y={1572} />
  </Base>
);

/* 04 · THE RAW EMOTION · macro, hard horizon, caption block */
export const PosterFelt: React.FC = () => (
  <Base>
    <Cover src="por-7.jpg" pos="40% 50%" style={{ left: 0, top: 0, width: 1080, height: 1080 }} />
    <div style={{ position: "absolute", left: 0, top: 1080, width: 1080, height: 6, background: C.orange }} />
    <Meta style={{ position: "absolute", left: M, top: 250, color: C.white }}>File 04 / The Raw Emotion</Meta>
    <Hook text="Your face does things you have never seen." x={M} y={1120} w={936} h={230} max={92} />
    <Story text="The breath before the vows. The jaw before the speech. We photograph what happens between the poses." x={M} y={1375} w={900} />
    <Command line="Photographs that remember how it felt." kw="FELT" x={M} y={1572} />
  </Base>
);

/* 05 · THE RAW EMOTION · full bleed, stacked type, paper slug */
export const PosterHands: React.FC = () => (
  <Base>
    <Cover src="wed-13.jpg" pos="30% 50%" style={{ left: 0, top: 0, width: 1080, height: 1920 }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.94) 18%, rgba(0,0,0,0.25) 62%, rgba(0,0,0,0.55) 100%)" }} />
    <Meta style={{ position: "absolute", left: M, top: 250, color: C.white }}>File 05 / The Raw Emotion</Meta>
    <div style={{ position: "absolute", right: M, top: 236, background: C.paper, color: C.black, padding: "16px 20px", transform: "rotate(2deg)", fontFamily: F.grot, fontWeight: 700, fontSize: 20, lineHeight: 1.5, letterSpacing: "0.14em", textTransform: "uppercase", zIndex: 10 }}>
      Weddings<br />Kingston + Ontario
    </div>
    <Hook text="Hands shake. Let them." x={M} y={930} w={936} h={420} max={190} />
    <Story text="The ring sticks at the knuckle. Someone laughs. The room breathes out. That is the frame you keep." x={M} y={1370} w={880} />
    <Command line="Tell us the date." kw="DATE" x={M} y={1572} />
  </Base>
);
