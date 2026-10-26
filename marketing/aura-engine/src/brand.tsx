/* The Aura Standard: shared tokens, fonts and texture for every composition. */
import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame, random } from "remotion";

export const C = {
  black: "#000000",
  white: "#FFFFFF",
  paper: "#F9F0E1", // brand --bg
  orange: "#E8A748", // brand --orange: grease pencil, one accent per frame
  emerald: "#39D599", // brand --emerald: glitch channel only
  grey: "#A3A3A3", // meta labels on black (8.5:1)
};

export const F = {
  wide: "Panchang", // hooks: extended, uppercase
  cond: "Tanker", // glitch slams
  grot: "Switzer", // labels, commands
  serif: "Sentient", // micro-stories, Magnum caption voice
};

const FACES: [string, string, string, string][] = [
  [F.wide, "fonts/panchang-800-normal.woff2", "800", "normal"],
  [F.wide, "fonts/panchang-600-normal.woff2", "600", "normal"],
  [F.cond, "fonts/tanker-400-normal.woff2", "400", "normal"],
  [F.grot, "fonts/switzer-500-normal.woff2", "500", "normal"],
  [F.grot, "fonts/switzer-700-normal.woff2", "700", "normal"],
  [F.serif, "fonts/sentient-400-normal.woff2", "400", "normal"],
  [F.serif, "fonts/sentient-400-italic.woff2", "400", "italic"],
];

const handle = delayRender("Loading Aura fonts");
export const fontsReady = Promise.all(
  FACES.map(([family, file, weight, style]) =>
    new FontFace(family, `url('${staticFile(file)}') format('woff2')`, { weight, style }).load().then((f) => document.fonts.add(f)),
  ),
).then(() => continueRender(handle));

export const img = (name: string) => staticFile(`img/${name}`);

/* Film grain: four pre-baked plates, a new plate and offset every frame. */
export const Grain: React.FC<{ opacity?: number; still?: boolean }> = ({ opacity = 0.16, still = false }) => {
  const current = useCurrentFrame();
  const frame = still ? 0 : current;
  const plate = frame % 4;
  const dx = Math.floor(random(`gx${frame}`) * 40) - 20;
  const dy = Math.floor(random(`gy${frame}`) * 40) - 20;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity, zIndex: 90 }}>
      <Img src={img(`grain-${plate}.png`)} style={{ position: "absolute", left: -20 + dx, top: -20 + dy, width: 1120, height: 1960 }} />
    </AbsoluteFill>
  );
};

/* Hand-drawn grease-pencil loop, the Magnum contact-sheet "this one" mark. */
export const PencilLoop: React.FC<{ x: number; y: number; w: number; h: number; color?: string; stroke?: number }> = ({ x, y, w, h, color = C.orange, stroke = 9 }) => (
  <svg style={{ position: "absolute", left: x, top: y, overflow: "visible", zIndex: 20 }} width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none">
    <path
      d="M58 4 C 86 3, 99 22, 97 50 C 95 80, 74 97, 46 96 C 18 95, 2 78, 3 50 C 4 24, 22 6, 52 5 C 66 5, 80 10, 88 17"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

/* Monospaced-feel meta label used for file numbers, places, frame counts. */
export const Meta: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: F.grot, fontWeight: 700, fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: C.grey, ...style }}>{children}</div>
);

/* Text that shrinks from `max` until it fits `width` x `height`, measured after the brand fonts load. */
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
