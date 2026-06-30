import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { Art } from "../components/Img";
import { COLORS, FONT } from "../theme";
import { pop, riseIn } from "../components/anim";
import { Badge } from "../components/ui";

export const S3_Meet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sHero = pop(frame, fps, 0);
  const sBadge = pop(frame, fps, 10);
  const sTitle = pop(frame, fps, 20);
  const sSub = pop(frame, fps, 34);
  const bob = Math.sin(frame / 26) * 8;

  const words = ["wallet.", "app.", "crypto words."];

  return (
    <Scene>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Art
          name="hero"
          style={{
            width: 720,
            height: "auto",
            opacity: sHero,
            mixBlendMode: "multiply",
            transform: `translateY(${bob}px) scale(${interpolate(sHero, [0, 1], [0.9, 1])})`,
          }}
        />
        <div style={{ ...riseIn(sBadge, 16) }}>
          <Badge>✨ Meet Selip</Badge>
        </div>
        <div
          style={{
            ...riseIn(sTitle),
            fontFamily: FONT,
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: -2,
            textAlign: "center",
            color: COLORS.ink,
            lineHeight: 1,
          }}
        >
          Give a gift,
          <br />
          <span
            style={{
              background: `linear-gradient(90deg, ${COLORS.coral}, ${COLORS.amber})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            as easy as a text.
          </span>
        </div>
        <div
          style={{
            ...riseIn(sSub),
            display: "flex",
            gap: 18,
            fontFamily: FONT,
            fontSize: 34,
            fontWeight: 700,
            color: "rgba(28,20,16,0.55)",
          }}
        >
          <span>No</span>
          {words.map((w, i) => {
            const s = pop(frame, fps, 40 + i * 8);
            return (
              <span
                key={w}
                style={{
                  color: COLORS.coral,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};
