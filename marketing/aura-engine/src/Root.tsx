import { Composition, Still } from "remotion";
import { PosterEscape, PosterFelt, PosterHands, PosterParty, PosterSpeech } from "./Posters";
import { GLITCH_FRAMES, Glitch } from "./Glitch";
import { STROBE_FRAMES, Strobe } from "./Strobe";

const S = { width: 1080, height: 1920 };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Glitch" component={Glitch} durationInFrames={GLITCH_FRAMES} fps={30} {...S} />
    <Composition id="Strobe" component={Strobe} durationInFrames={STROBE_FRAMES} fps={30} {...S} />
    <Still id="P1-Party" component={PosterParty} {...S} />
    <Still id="P2-Speech" component={PosterSpeech} {...S} />
    <Still id="P3-Escape" component={PosterEscape} {...S} />
    <Still id="P4-Felt" component={PosterFelt} {...S} />
    <Still id="P5-Hands" component={PosterHands} {...S} />
  </>
);
