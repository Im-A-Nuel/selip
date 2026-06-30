import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { PhoneFrame } from "../components/PhoneFrame";
import { Caption } from "../components/Caption";
import { Art } from "../components/Img";
import { Glass } from "../components/ui";
import { COLORS, FONT } from "../theme";

const PALETTE = ["#1c1410", "#f9603d", "#ff9a76", "#f59e0b", "#2bb673", "#3b82f6"];

export const S5_Card: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Heart drawn with a stroke reveal, then a real photo card crossfades in.
  const draw = interpolate(frame, [40, 165], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const photo = interpolate(frame, [195, 245], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const LEN = 1200;

  return (
    <Scene>
      <div style={{ display: "flex", alignItems: "center", gap: 110 }}>
        <Caption
          kicker="Step 2 · Personalize"
          title={<>Draw the card, or drop in a photo.</>}
          subtitle={
            <>
              A real canvas with brushes, colors and full{" "}
              <b style={{ color: COLORS.ink }}>undo / redo</b>. The art becomes the
              card the recipient opens.
            </>
          }
          width={560}
        />

        <PhoneFrame scale={0.86}>
          <div style={{ padding: "84px 30px 30px", fontFamily: FONT }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: COLORS.ink,
                marginBottom: 18,
              }}
            >
              Make the card
            </div>

            <div
              style={{
                aspectRatio: "3 / 4",
                borderRadius: 24,
                background: COLORS.white,
                boxShadow: "inset 0 0 0 1px rgba(28,20,16,0.1)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <svg
                width="300"
                height="300"
                viewBox="0 0 100 100"
                style={{ opacity: 1 - photo }}
              >
                <path
                  d="M50 78 C 18 54, 16 26, 38 26 C 48 26, 50 36, 50 40 C 50 36, 52 26, 62 26 C 84 26, 82 54, 50 78 Z"
                  fill="none"
                  stroke={COLORS.coral}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={LEN}
                  strokeDasharray={LEN}
                  strokeDashoffset={LEN * (1 - draw)}
                />
              </svg>
              <Art
                name="card-birthday"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: photo,
                  transform: `scale(${interpolate(photo, [0, 1], [1.08, 1])})`,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                margin: "22px 0",
                justifyContent: "center",
              }}
            >
              {PALETTE.map((c, i) => (
                <div
                  key={c}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: c,
                    boxShadow:
                      i === 1
                        ? `0 0 0 4px ${COLORS.ink}`
                        : "0 0 0 2px rgba(0,0,0,0.1)",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              <Glass
                style={{
                  flex: 1,
                  padding: "16px 0",
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "rgba(28,20,16,0.7)",
                }}
              >
                ↶ Undo
              </Glass>
              <Glass
                style={{
                  flex: 1,
                  padding: "16px 0",
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "rgba(28,20,16,0.7)",
                }}
              >
                ↷ Redo
              </Glass>
              <Glass
                style={{
                  flex: 1.4,
                  padding: "16px 0",
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "rgba(28,20,16,0.7)",
                }}
              >
                Upload photo
              </Glass>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </Scene>
  );
};
