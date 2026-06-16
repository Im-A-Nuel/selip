"use client";

// Lightweight CSS confetti burst. No dependency. Renders ~40 pieces that fall
// and fade once; remove from the tree to reset.

const COLORS = ["#ff7a5c", "#ffb020", "#f9603d", "#ffbe8a", "#f59e0b"];
const PIECES = Array.from({ length: 40 }, (_, i) => i);

export function Confetti() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {PIECES.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i % 10) * 0.08;
        const duration = 2.2 + ((i % 5) * 0.3);
        const color = COLORS[i % COLORS.length];
        const size = 6 + (i % 4) * 2;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.6,
              background: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
