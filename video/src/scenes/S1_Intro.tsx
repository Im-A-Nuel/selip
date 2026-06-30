import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { Logo } from "../components/Logo";
import { Art } from "../components/Img";
import { COLORS, FONT } from "../theme";
import { pop, riseIn } from "../components/anim";

export const S1_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sMascot = pop(frame, fps, 0);
  const sLogo = pop(frame, fps, 14);
  const sTag = pop(frame, fps, 30);
  const sSub = pop(frame, fps, 42);
  const glow = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });
  const bob = Math.sin(frame / 22) * 12;

  return (
    <Scene>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <Art
          name="mascot"
          style={{
            width: 280,
            height: "auto",
            opacity: sMascot,
            transform: `translateY(${bob - interpolate(sMascot, [0, 1], [40, 0])}px) scale(${interpolate(
              sMascot,
              [0, 1],
              [0.6, 1],
            )})`,
            filter: "drop-shadow(0 40px 60px rgba(214,110,70,0.35))",
          }}
        />
        <div
          style={{
            transform: `scale(${interpolate(sLogo, [0, 1], [0.7, 1])})`,
            opacity: sLogo,
            filter: `drop-shadow(0 30px 60px rgba(249,96,61,${0.3 * glow}))`,
          }}
        >
          <Logo size={132} />
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
          No wallet needed, on either side.
        </div>
      </div>
    </Scene>
  );
};
