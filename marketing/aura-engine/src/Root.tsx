import { Composition, Still } from "remotion";
import { FALL_FRAMES, FallMinisReel } from "./FallMinisReel";
import { FELT_FRAMES, FeltReel } from "./FeltReel";
import { PosterEscape, PosterFallCard, PosterFallHero, PosterFelt, PosterParty } from "./Posters";

const S = { width: 1080, height: 1920 };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FallMinisReel" component={FallMinisReel} durationInFrames={FALL_FRAMES} fps={30} {...S} />
    <Composition id="FeltReel" component={FeltReel} durationInFrames={FELT_FRAMES} fps={30} {...S} />
    <Still id="P1-FallHero" component={PosterFallHero} {...S} />
    <Still id="P2-FallCard" component={PosterFallCard} {...S} />
    <Still id="P3-Party" component={PosterParty} {...S} />
    <Still id="P4-Escape" component={PosterEscape} {...S} />
    <Still id="P5-Felt" component={PosterFelt} {...S} />
  </>
);
