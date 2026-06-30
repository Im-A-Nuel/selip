import { Composition, Series, AbsoluteFill, Audio, staticFile } from "remotion";
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

const SCENES: { c: React.FC; d: number }[] = [
  { c: S1_Intro, d: 160 },
  { c: S2_Problem, d: 300 },
  { c: S3_Meet, d: 240 },
  { c: S4_Create, d: 600 },
  { c: S5_Card, d: 320 },
  { c: S6_Share, d: 360 },
  { c: S7_Claim, d: 720 },
  { c: S8_Tech, d: 480 },
  { c: S9_Outro, d: 420 },
];

const TOTAL = SCENES.reduce((a, s) => a + s.d, 0); // 3600 = 120s @ 30fps

const SelipDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <AuroraBackground />
      {MUSIC_SRC ? <Audio src={staticFile(MUSIC_SRC)} volume={0.6} /> : null}
      <Series>
        {SCENES.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={s.d}>
            <s.c />
          </Series.Sequence>
        ))}
      </Series>
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
