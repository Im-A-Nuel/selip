import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { COLORS, FONT } from "../theme";
import { pop, riseIn } from "../components/anim";

const SCARY = ["seed phrase", "gas fees", "private key", "wrong chain", "0x84f…"];

export const S2_Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sTitle = pop(frame, fps, 4);

  return (
    <Scene>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
          width: 1300,
        }}
      >
        <div
          style={{
            ...riseIn(sTitle),
            fontFamily: FONT,
            fontSize: 70,
            fontWeight: 800,
            textAlign: "center",
            letterSpacing: -1.5,
            color: COLORS.ink,
            lineHeight: 1.1,
          }}
        >
          Sending money on-chain still scares
          <br /> the people you actually want to pay.
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {SCARY.map((w, i) => {
            const appear = pop(frame, fps, 28 + i * 12);
            const strike = interpolate(
              frame,
              [120 + i * 10, 150 + i * 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <div
                key={w}
                style={{
                  ...riseIn(appear, 20),
                  position: "relative",
                  fontFamily: FONT,
                  fontSize: 38,
                  fontWeight: 800,
                  color: `rgba(28,20,16,${interpolate(strike, [0, 1], [0.85, 0.32])})`,
                  padding: "16px 28px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.75)",
                  boxShadow: "0 10px 26px -14px rgba(28,20,16,0.3)",
                }}
              >
                {w}
                <div
                  style={{
                    position: "absolute",
                    left: 18,
                    right: 18,
                    top: "52%",
                    height: 5,
                    borderRadius: 3,
                    background: COLORS.coral,
                    transform: `scaleX(${strike})`,
                    transformOrigin: "left",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};
