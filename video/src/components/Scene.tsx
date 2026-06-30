import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

// Centers a scene's content and adds a tiny entrance lift. Cross-scene fades and
// slides are handled by TransitionSeries in Root, so this no longer fades at the
// edges (which would double-dim during a transition).
export const Scene: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame, [0, 14], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${lift}px)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
