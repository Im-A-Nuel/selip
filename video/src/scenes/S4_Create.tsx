import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { PhoneFrame } from "../components/PhoneFrame";
import { Caption } from "../components/Caption";
import { Chip, PillButton, Glass } from "../components/ui";
import { Art } from "../components/Img";
import { COLORS, FONT } from "../theme";

const OCCASIONS: { art: string; label: string }[] = [
  { art: "occ-birthday", label: "Birthday" },
  { art: "occ-custom", label: "Thanks" },
  { art: "occ-graduation", label: "Congrats" },
  { art: "occ-holiday", label: "Just because" },
];

export const S4_Create: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timeline (frames within this 600-frame scene).
  const amount = Math.round(
    interpolate(frame, [120, 200], [0, 25], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const selected = frame > 90 ? 1 : -1; // "Thanks" chip lights up
  const ruleOn = frame > 250;
  const cardArtOpacity = interpolate(frame, [60, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
                marginBottom: 18,
              }}
            >
              Create a gift
            </div>

            {/* Compact live preview strip */}
            <Glass
              style={{
                opacity: cardArtOpacity,
                marginBottom: 22,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 18,
                  background: `linear-gradient(150deg, ${COLORS.coralSoft}, ${COLORS.amber})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <Art
                  name="occ-custom"
                  style={{ width: 52, height: 52, objectFit: "contain" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 18,
                    color: "rgba(28,20,16,0.5)",
                    fontWeight: 600,
                  }}
                >
                  Thanks · for Maya
                </div>
                <div
                  style={{ fontSize: 36, fontWeight: 800, color: COLORS.ink }}
                >
                  ${amount}.00
                </div>
              </div>
            </Glass>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 22,
              }}
            >
              {OCCASIONS.map((o, i) => (
                <Chip key={o.label} active={i === selected}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Art
                      name={o.art}
                      style={{ width: 26, height: 26, objectFit: "contain" }}
                    />
                    {o.label}
                  </span>
                </Chip>
              ))}
            </div>

            <Glass style={{ padding: "18px 22px", marginBottom: 16 }}>
              <div style={{ fontSize: 18, color: "rgba(28,20,16,0.5)" }}>
                Amount
              </div>
              <div
                style={{ fontSize: 46, fontWeight: 800, color: COLORS.ink }}
              >
                ${amount}.00
              </div>
            </Glass>

            <Glass
              style={{
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.ink }}>
                Refund if unclaimed
              </div>
              <div
                style={{
                  width: 60,
                  height: 34,
                  borderRadius: 999,
                  background: ruleOn ? COLORS.green : "rgba(28,20,16,0.15)",
                  position: "relative",
                  transition: "background 0.3s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    left: ruleOn ? 30 : 4,
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    background: COLORS.white,
                  }}
                />
              </div>
            </Glass>

            <div style={{ marginTop: 22 }}>
              <PillButton>Fund the gift →</PillButton>
            </div>
          </div>
        </PhoneFrame>

        <Caption
          kicker="Step 1 · Create"
          title={<>Build the gift in under two minutes.</>}
          subtitle={
            <>
              Pick an occasion, set any amount, add a rule like{" "}
              <b style={{ color: COLORS.ink }}>refund if unclaimed</b> or{" "}
              <b style={{ color: COLORS.ink }}>lock until a date</b>.
            </>
          }
          width={560}
        />
      </div>
    </Scene>
  );
};
