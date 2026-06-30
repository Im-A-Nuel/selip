import { useCurrentFrame, useVideoConfig, interpolate, random } from "remotion";
import { COLORS } from "../theme";

const PIECES = 70;
const PALETTE = [COLORS.coral, COLORS.amber, COLORS.coralSoft, COLORS.green, "#ff8fb0"];

// Confetti burst that starts at `start` frame and falls across the frame.
export const Confetti: React.FC<{ start: number; width?: number; height?: number }> = ({
  start,
  width = 1920,
  height = 1080,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - start;
  if (local < 0) return null;

  return (
    <>
      {new Array(PIECES).fill(0).map((_, i) => {
        const x = random(`x-${i}`) * width;
        const delay = random(`d-${i}`) * 30;
        const dur = 90 + random(`u-${i}`) * 60;
        const t = interpolate(local - delay, [0, dur], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(t, [0, 1], [-60, height + 60]);
        const rot = interpolate(t, [0, 1], [0, 540 + random(`r-${i}`) * 360]);
        const size = 10 + random(`s-${i}`) * 16;
        const opacity = interpolate(t, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size * 0.6,
              borderRadius: 2,
              background: PALETTE[i % PALETTE.length],
              opacity,
              transform: `rotate(${rot}deg)`,
            }}
          />
        );
      })}
    </>
  );
};
