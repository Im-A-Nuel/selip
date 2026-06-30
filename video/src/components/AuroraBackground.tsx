import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { AURORA, COLORS } from "../theme";

// Full-bleed warm background with a slow breathing drift, so static scenes still
// feel alive.
export const AuroraBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame % 600, [0, 300, 600], [0, 1, 0]);
  const scale = 1.05 + drift * 0.05;
  const shift = interpolate(drift, [0, 1], [-1.5, 1.5]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.page }}>
      <AbsoluteFill
        style={{
          background: AURORA,
          transform: `scale(${scale}) translate(${shift}%, ${shift}%)`,
          filter: "saturate(1.06)",
        }}
      />
      {/* Soft grain/vignette to keep edges from feeling flat. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(28,20,16,0.06) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
