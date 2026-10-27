/* Aura Films brand layer: palette, fonts, texture and fit-to-box text for every composition. */
import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";

/* Brand palette (CLAUDE.md). */
export const C = {
  cream: "#F9F0E1", // --bg
  ink: "#1B120B", // --text
  charcoal: "#212922", // --charcoal
  orange: "#E8A748", // --orange
  tea: "#C5EBC3", // --tea-green
  surface: "#EFE5D2", // --surface
  muted: "#5A3E2B", // --text-muted
};

export const F = {
  display: "Clash Display", // brand headings
  serif: "Gambetta", // italic accents
  body: "Satoshi", // body, CTAs
};

const FACES: [string, string, string, string][] = [
  [F.display, "fonts/clash-display-500-normal.woff2", "500", "normal"],
  [F.display, "fonts/clash-display-600-normal.woff2", "600", "normal"],
  [F.serif, "fonts/gambetta-400-italic.woff2", "400", "italic"],
  [F.serif, "fonts/gambetta-500-italic.woff2", "500", "italic"],
  [F.body, "fonts/satoshi-500-normal.woff2", "500", "normal"],
  [F.body, "fonts/satoshi-700-normal.woff2", "700", "normal"],
];

const handle = delayRender("Loading Aura fonts");
export const fontsReady = Promise.all(
  FACES.map(([family, file, weight, style]) =>
    new FontFace(family, `url('${staticFile(file)}') format('woff2')`, { weight, style }).load().then((f) => document.fonts.add(f)),
  ),
).then(() => continueRender(handle));

export const img = (name: string) => staticFile(`img/${name}`);

/* A very light, static film grain: texture without shimmer. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity, zIndex: 90 }}>
    <Img src={img("grain-0.png")} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);

/* Layered, warm-tinted shadow for photo cards (base → elevated). */
export const SHADOW = "0 2px 6px rgba(27,18,11,0.10), 0 18px 40px -12px rgba(90,62,43,0.28), 0 50px 90px -40px rgba(27,18,11,0.35)";

/* Text that shrinks from `max` until it fits `width` x `height`, measured after the fonts load. */
export const FitText: React.FC<{ max: number; min?: number; width: number; height: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ max, min = 24, width, height, style, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(max);
  const [handle] = useState(() => delayRender("FitText"));
  useLayoutEffect(() => {
    let live = true;
    fontsReady.then(() => {
      const el = ref.current;
      if (!el || !live) return;
      let s = max;
      el.style.fontSize = `${s}px`;
      while (s > min && (el.scrollWidth > width + 1 || el.scrollHeight > height + 1)) {
        s -= 2;
        el.style.fontSize = `${s}px`;
      }
      setSize(s);
      continueRender(handle);
    });
    return () => {
      live = false;
    };
  }, [max, min, width, height, handle]);
  return (
    <div ref={ref} style={{ width, maxHeight: height, fontSize: size, overflowWrap: "normal", wordBreak: "keep-all", ...style }}>
      {children}
    </div>
  );
};
