import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";
import { pop, riseIn } from "./anim";

// Side caption block: a small coral kicker, a big ink title, optional subtitle.
// Used in scenes where a phone mock sits beside explanatory copy.
export const Caption: React.FC<{
  kicker?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  delay?: number;
  width?: number;
}> = ({ kicker, title, subtitle, align = "left", delay = 0, width = 620 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sK = pop(frame, fps, delay);
  const sT = pop(frame, fps, delay + 6);
  const sS = pop(frame, fps, delay + 14);

  return (
    <div
      style={{
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        gap: 22,
        width,
      }}
    >
      {kicker ? (
        <div
          style={{
            ...riseIn(sK, 16),
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: COLORS.coral,
          }}
        >
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          ...riseIn(sT),
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.04,
          letterSpacing: -1.5,
          color: COLORS.ink,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            ...riseIn(sS),
            fontSize: 30,
            fontWeight: 500,
            lineHeight: 1.4,
            color: "rgba(28,20,16,0.6)",
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
