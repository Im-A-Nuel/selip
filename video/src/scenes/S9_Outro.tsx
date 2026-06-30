import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { Logo } from "../components/Logo";
import { Art } from "../components/Img";
import { COLORS, FONT } from "../theme";
import { pop, riseIn } from "../components/anim";

export const S9_Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sMascot = pop(frame, fps, 0);
  const sLogo = pop(frame, fps, 14);
  const sUrl = pop(frame, fps, 28);
  const sFoot = pop(frame, fps, 40);
  const scale = interpolate(sLogo, [0, 1], [0.8, 1]);
  const bob = Math.sin(frame / 24) * 10;

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
          name="success"
          style={{
            width: 300,
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
        <div style={{ transform: `scale(${scale})`, opacity: sLogo }}>
          <Logo size={132} />
        </div>
        <div
          style={{
            ...riseIn(sUrl),
            fontFamily: FONT,
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: -1,
            background: `linear-gradient(90deg, ${COLORS.coral}, ${COLORS.amber})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          selip.vercel.app
        </div>
        <div
          style={{
            ...riseIn(sFoot),
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 600,
            color: "rgba(28,20,16,0.55)",
            textAlign: "center",
          }}
        >
          Slip someone a gift, no wallet needed.
          <br />
          Live escrow on Arbitrum · non-custodial.
        </div>
      </div>
    </Scene>
  );
};
