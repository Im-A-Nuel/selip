import { Composition, AbsoluteFill, Audio, staticFile, Easing } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AuroraBackground } from "./components/AuroraBackground";
import { FPS } from "./theme";
import { S1_Intro } from "./scenes/S1_Intro";
import { S2_Problem } from "./scenes/S2_Problem";
import { S3_Meet } from "./scenes/S3_Meet";
import { S4_Create } from "./scenes/S4_Create";
import { S5_Card } from "./scenes/S5_Card";
import { S6_Share } from "./scenes/S6_Share";
import { S7_Claim } from "./scenes/S7_Claim";
import { S8_Tech } from "./scenes/S8_Tech";
import { S9_Outro } from "./scenes/S9_Outro";

// Drop a track at video/public/music.mp3 and set this to "music.mp3" to add audio.
const MUSIC_SRC: string | null = null;

const TRANS = 22; // transition overlap (frames)

// Each scene's standalone length. Transitions overlap neighbours, so the final
// duration is sum - (#transitions * TRANS). Lengths are padded so the result
// lands on ~120s.
const SCENES: React.FC[] = [
  S1_Intro,
  S2_Problem,
  S3_Meet,
  S4_Create,
  S5_Card,
  S6_Share,
  S7_Claim,
  S8_Tech,
  S9_Outro,
];
const DUR = [176, 316, 256, 616, 336, 376, 736, 496, 436];

// Transition between scene i and i+1 (8 of them). Slides drive the step flow
// forward; fades bracket the conceptual scenes.
const ease = linearTiming({
  durationInFrames: TRANS,
  easing: Easing.inOut(Easing.cubic),
});
const spring = springTiming({ config: { damping: 200 }, durationInFrames: TRANS });

const TRANSITIONS = [
  { p: fade(), t: ease }, // 1->2
  { p: slide({ direction: "from-bottom" }), t: spring }, // 2->3
  { p: slide({ direction: "from-right" }), t: spring }, // 3->4
  { p: slide({ direction: "from-right" }), t: spring }, // 4->5
  { p: slide({ direction: "from-right" }), t: spring }, // 5->6
  { p: slide({ direction: "from-right" }), t: spring }, // 6->7
  { p: fade(), t: ease }, // 7->8
  { p: fade(), t: ease }, // 8->9
];

const TOTAL = DUR.reduce((a, b) => a + b, 0) - TRANSITIONS.length * TRANS;

const SelipDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <AuroraBackground />
      {MUSIC_SRC ? <Audio src={staticFile(MUSIC_SRC)} volume={0.6} /> : null}
      <TransitionSeries>
        {SCENES.flatMap((C, i) => {
          const seq = (
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={DUR[i]}>
              <C />
            </TransitionSeries.Sequence>
          );
          if (i >= TRANSITIONS.length) return [seq];
          return [
            seq,
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={TRANSITIONS[i].p}
              timing={TRANSITIONS[i].t}
            />,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SelipDemo"
      component={SelipDemo}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
