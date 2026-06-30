import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { Logo } from "../components/Logo";
import { COLORS, FONT } from "../theme";
import { pop, riseIn } from "../components/anim";

export const S1_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sLogo = pop(frame, fps, 4);
  const sTag = pop(frame, fps, 22);
  const sSub = pop(frame, fps, 34);
  const glow = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <Scene>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(sLogo, [0, 1], [0.7, 1])})`,
            opacity: sLogo,
            filter: `drop-shadow(0 30px 60px rgba(249,96,61,${0.3 * glow}))`,
          }}
        >
          <Logo size={150} />
        </div>
        <div
          style={{
            ...riseIn(sTag),
            fontFamily: FONT,
            fontSize: 46,
            fontWeight: 700,
            color: "rgba(28,20,16,0.78)",
            textAlign: "center",
          }}
        >
          Slip someone a gift.
        </div>
        <div
          style={{
            ...riseIn(sSub),
            fontFamily: FONT,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.coral,
            letterSpacing: 1,
          }}
        >
          No wallet needed — on either side.
        </div>
      </div>
    </Scene>
  );
};
