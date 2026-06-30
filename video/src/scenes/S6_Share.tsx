import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { PhoneFrame } from "../components/PhoneFrame";
import { Caption } from "../components/Caption";
import { Glass } from "../components/ui";
import { COLORS, FONT } from "../theme";

// Deterministic faux-QR so it renders identically every frame.
const N = 13;
function isOn(x: number, y: number) {
  // Solid finder squares in three corners, like a real QR.
  const corner = (cx: number, cy: number) =>
    x >= cx && x < cx + 3 && y >= cy && y < cy + 3;
  if (corner(0, 0) || corner(N - 3, 0) || corner(0, N - 3)) return true;
  // Pseudo-random but deterministic data modules.
  return (x * 928371 + y * 1299721) % 7 < 3;
}

export const S6_Share: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [50, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cells: React.ReactNode[] = [];
  let idx = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const on = isOn(x, y);
      const t = idx / (N * N);
      const show = reveal > t;
      cells.push(
        <div
          key={`${x}-${y}`}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 3,
            background: on && show ? COLORS.ink : "transparent",
            transform: show ? "scale(1)" : "scale(0.2)",
          }}
        />,
      );
      idx++;
    }
  }

  return (
    <Scene>
      <div style={{ display: "flex", alignItems: "center", gap: 110 }}>
        <PhoneFrame scale={0.86}>
          <div style={{ padding: "84px 30px 30px", fontFamily: FONT }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: COLORS.ink,
                marginBottom: 20,
              }}
            >
              Your gift is ready 🎉
            </div>

            <Glass
              style={{
                padding: "18px 22px",
                marginBottom: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 19,
                  color: "rgba(28,20,16,0.7)",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                selip.vercel.app/g/maya
              </div>
              <div
                style={{
                  flexShrink: 0,
                  marginLeft: 14,
                  fontSize: 18,
                  fontWeight: 800,
                  color: COLORS.coral,
                }}
              >
                Copy
              </div>
            </Glass>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  padding: 20,
                  borderRadius: 28,
                  background: COLORS.white,
                  boxShadow: "0 24px 50px -20px rgba(28,20,16,0.35)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${N}, 16px)`,
                    gridTemplateRows: `repeat(${N}, 16px)`,
                    gap: 2,
                  }}
                >
                  {cells}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "18px 0",
                borderRadius: 999,
                background: "#25D366",
                color: COLORS.white,
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              Share on WhatsApp
            </div>
          </div>
        </PhoneFrame>

        <Caption
          kicker="Step 3 · Share"
          title={<>One link. Or a QR code. That's it.</>}
          subtitle={
            <>
              Send it over WhatsApp, email, anywhere. No app for them to install,
              nothing to set up first.
            </>
          }
          width={560}
        />
      </div>
    </Scene>
  );
};
