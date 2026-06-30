import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// Wraps a scene's content with a gentle fade + lift on enter and fade on exit,
// so cuts between Series sequences read as smooth crossfades.
export const Scene: React.FC<{
  children: React.ReactNode;
  fade?: number;
}> = ({ children, fade = 14 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const lift = interpolate(frame, [0, fade], [18, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${lift}px)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
