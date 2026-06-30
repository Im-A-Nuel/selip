import { COLORS, FONT } from "../theme";

// Selip wordmark with a small gift glyph. size scales everything.
export const Logo: React.FC<{ size?: number; mono?: boolean }> = ({
  size = 120,
  mono,
}) => (
  <div
    style={{
      fontFamily: FONT,
      display: "flex",
      alignItems: "center",
      gap: size * 0.22,
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: `linear-gradient(135deg, ${COLORS.coral}, ${COLORS.amber})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.56,
        boxShadow: "0 20px 40px -16px rgba(249,96,61,0.6)",
      }}
    >
      🎁
    </div>
    <span
      style={{
        fontSize: size * 0.82,
        fontWeight: 800,
        letterSpacing: -2,
        color: mono ? COLORS.white : COLORS.ink,
      }}
    >
      Selip
    </span>
  </div>
);
