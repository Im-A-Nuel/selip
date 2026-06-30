import { spring, interpolate } from "remotion";

// A snappy-but-soft spring used everywhere for entrances.
export function pop(frame: number, fps: number, delay = 0) {
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });
}

// Map a 0..1 spring value to a translate + fade in.
export function riseIn(s: number, distance = 28) {
  return {
    opacity: interpolate(s, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
  } as const;
}

// Typewriter: reveal `text` proportional to progress 0..1.
export function typed(text: string, progress: number) {
  const n = Math.round(interpolate(progress, [0, 1], [0, text.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  return text.slice(0, n);
}
