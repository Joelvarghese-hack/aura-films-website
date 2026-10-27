/* Fall Mini Sessions · Reel 1080x1920 · 18 s
   Music: "Roof Tops" by HoliznaCC0 (CC0), 80 BPM. One scene per bar, one-beat crossfades. */
import { CalmReel, Shot, calmFrames } from "./calm";

const SHOTS: Shot[] = [
  { src: "c-img_7777.jpg", pos: "45% 30%", kicker: "Kingston · Autumn 2026", line: "Fall Mini Sessions" },
  { src: "c-img_3431.jpg", pos: "60% 35%", line: "Short sessions in the last of the autumn light." },
  { src: "c-wed-5.jpg", pos: "50% 30%", line: "For families, couples and portraits." },
  { src: "c-por-4.jpg", pos: "50% 55%", line: "Your holiday card is hiding in this light." },
  { src: "c-c_por-3.jpg", pos: "45% 40%", line: "Limited dates this autumn.", accent: "Grab one before the leaves let go." },
];

export const FALL_FRAMES = calmFrames(SHOTS);

export const FallMinisReel: React.FC = () => <CalmReel shots={SHOTS} audio="audio/fall.wav" endTitle="Fall Mini Sessions" endCta="DM “FALL” to hold your spot" />;
