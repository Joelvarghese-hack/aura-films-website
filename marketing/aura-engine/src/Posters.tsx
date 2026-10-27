/* Five Instagram Story posters (1080x1920). Copy sits between y=250 and y=1640 so the
   Story progress bar and reply bar never cover it. No boxed text, no labels, nothing cropped. */
import { AbsoluteFill, Img } from "remotion";
import { C, F, FitText, Grain, SHADOW, img } from "./brand";

const M = 72;
const W = 1080 - M * 2;

const Kicker: React.FC<{ children: React.ReactNode; color?: string; top: number }> = ({ children, color = C.cream, top }) => (
  <div style={{ position: "absolute", left: M, top, fontFamily: F.body, fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", color, zIndex: 10 }}>{children}</div>
);
const Headline: React.FC<{ text: string; top: number; h: number; max: number; color?: string }> = ({ text, top, h, max, color = C.cream }) => (
  <div style={{ position: "absolute", left: M, top, zIndex: 10 }}>
    <FitText max={max} width={W} height={h} style={{ fontFamily: F.display, fontWeight: 600, lineHeight: 1.02, letterSpacing: "-0.02em", wordSpacing: "0.14em", color }}>
      {text}
    </FitText>
  </div>
);
const Accent: React.FC<{ text: string; top: number; color?: string; size?: number }> = ({ text, top, color = C.orange, size = 54 }) => (
  <div style={{ position: "absolute", left: M, top, width: W, fontFamily: F.serif, fontStyle: "italic", fontWeight: 500, fontSize: size, lineHeight: 1.15, color, zIndex: 10 }}>{text}</div>
);
const Body: React.FC<{ text: string; top: number; color?: string }> = ({ text, top, color = C.cream }) => (
  <div style={{ position: "absolute", left: M, top, width: W - 40, fontFamily: F.body, fontWeight: 500, fontSize: 34, lineHeight: 1.5, color, zIndex: 10 }}>{text}</div>
);
const Cta: React.FC<{ text: string; top: number; color?: string }> = ({ text, top, color = C.orange }) => (
  <div style={{ position: "absolute", left: M, top, fontFamily: F.body, fontWeight: 700, fontSize: 34, letterSpacing: "0.01em", color, zIndex: 10 }}>{text}</div>
);

/* Full-bleed photo with the brand treatment: warm multiply layer + gradient toward the copy. */
const Bleed: React.FC<{ src: string; pos?: string; fade: "top" | "bottom"; strength?: number }> = ({ src, pos = "50% 40%", fade, strength = 0.82 }) => (
  <>
    <Img src={img(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
    <AbsoluteFill style={{ background: C.orange, mixBlendMode: "multiply", opacity: 0.08 }} />
    <AbsoluteFill
      style={{
        background:
          fade === "bottom"
            ? `linear-gradient(to top, rgba(27,18,11,${strength}) 0%, rgba(27,18,11,${strength * 0.75}) 30%, rgba(27,18,11,0) 58%)`
            : `linear-gradient(to bottom, rgba(27,18,11,${strength}) 0%, rgba(27,18,11,${strength * 0.8}) 40%, rgba(27,18,11,0) 62%)`,
      }}
    />
  </>
);
const Card: React.FC<{ src: string; pos?: string; top: number; h: number }> = ({ src, pos = "50% 40%", top, h }) => (
  <div style={{ position: "absolute", left: M, top, width: W, height: h, borderRadius: 34, overflow: "hidden", boxShadow: SHADOW }}>
    <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
  </div>
);
const Base: React.FC<{ bg?: string; children: React.ReactNode }> = ({ bg = C.ink, children }) => (
  <AbsoluteFill style={{ background: bg }}>
    {children}
    <Grain />
  </AbsoluteFill>
);

/* 01 · Fall Mini Sessions, hero */
export const PosterFallHero: React.FC = () => (
  <Base>
    <Bleed src="c-img_7777.jpg" pos="45% 30%" fade="bottom" />
    <Kicker top={960}>Kingston · Autumn 2026</Kicker>
    <Headline text="Fall Mini Sessions" top={1004} h={330} max={176} />
    <Accent text="before the leaves let go." top={1352} />
    <Body text="Short outdoor sessions in the last of the autumn light, for families, couples and portraits." top={1438} />
    <Cta text="Limited dates · DM “FALL” to hold yours" top={1596} />
  </Base>
);

/* 02 · Fall Mini Sessions, the holiday card */
export const PosterFallCard: React.FC = () => (
  <Base>
    <Bleed src="c-por-4.jpg" pos="50% 62%" fade="top" strength={0.9} />
    <Kicker top={260}>Fall Mini Sessions · Kingston</Kicker>
    <Headline text="Your holiday card is hiding in this light." top={312} h={330} max={112} />
    <Body text="One short session gives you the card, a gift for the grandparents and a new photo for your profile." top={668} />
    <Cta text="Limited dates · DM “FALL” →" top={836} color={C.cream} />
  </Base>
);

/* 03 · The Party */
export const PosterParty: React.FC = () => (
  <Base>
    <Bleed src="c-wed-8.jpg" pos="50% 25%" fade="bottom" />
    <Kicker top={1000}>Birthdays · Showers · Anniversaries</Kicker>
    <Headline text="Somebody always ends up wearing the cake." top={1046} h={330} max={118} />
    <Body text="Enjoy your party. We’ll keep the moments you were too busy laughing to see." top={1420} />
    <Cta text="DM “PARTY” with your date →" top={1580} />
  </Base>
);

/* 04 · The Escape (landscape frame shown whole, nothing cropped mid-word) */
export const PosterEscape: React.FC = () => (
  <Base bg={C.charcoal}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1180, overflow: "hidden" }}>
      <Img src={img("c-wed-12.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%" }} />
      <AbsoluteFill style={{ background: C.orange, mixBlendMode: "multiply", opacity: 0.08 }} />
      <AbsoluteFill style={{ background: `linear-gradient(to top, ${C.charcoal} 0%, rgba(33,41,34,0.6) 16%, rgba(33,41,34,0) 40%)` }} />
    </div>
    <Kicker top={1150} color={C.tea}>Engagement sessions · Ontario</Kicker>
    <Headline text="Run away for an afternoon." top={1196} h={240} max={124} />
    <Body text="Just the two of you, a field somewhere in Ontario and the hour before sunset." top={1450} />
    <Cta text="DM “ESCAPE” and pick the field →" top={1596} />
  </Base>
);

/* 05 · The Raw Emotion */
export const PosterFelt: React.FC = () => (
  <Base bg={C.cream}>
    <Card src="c-wed-4.jpg" pos="45% 52%" top={150} h={900} />
    <Kicker top={1100} color={C.muted}>Weddings · Kingston and across Ontario</Kicker>
    <Headline text="The laugh you hide in photos is the one they fell for." top={1146} h={300} max={96} color={C.ink} />
    <Body text="We photograph your wedding the way it actually feels: the laughing, the crying and everything in between." top={1462} color={C.muted} />
    <Cta text="DM “DATE” to check your wedding date →" top={1622} color={C.ink} />
  </Base>
);
