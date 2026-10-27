/* Photographs that remember how it felt · Reel 1080x1920 · 18 s
   Music: "One Good Day" by HoliznaCC0 (CC0), 80 BPM. One scene per bar, one-beat crossfades. */
import { CalmReel, Shot, calmFrames } from "./calm";

const SHOTS: Shot[] = [
  { src: "c-wed-4.jpg", pos: "45% 50%", kicker: "Weddings", line: "The laugh you hide in photos is the one they fell for." },
  { src: "c-wed-8.jpg", pos: "50% 25%", kicker: "Parties", line: "Somebody always ends up wearing the cake." },
  { src: "c-wed-12.jpg", pos: "50% 50%", kicker: "Engagements", line: "Run away for an afternoon." },
  { src: "c-_dsc8307.jpg", pos: "50% 30%", kicker: "Weddings", line: "The quiet second before the vows." },
  { src: "c-wed-6.jpg", pos: "50% 35%", kicker: "Celebrations", line: "Everyone you love, in one frame." },
];

export const FELT_FRAMES = calmFrames(SHOTS);

export const FeltReel: React.FC = () => <CalmReel shots={SHOTS} audio="audio/felt.wav" endTitle="Photographs that remember how it felt." endCta="DM “DATE” to check your date" />;
