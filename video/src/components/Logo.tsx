import { Img, staticFile } from "remotion";
import { COLORS, FONT } from "../theme";

// Selip wordmark using the real app icon. size scales everything.
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
    <Img
      src={staticFile("logo.png")}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        boxShadow: "0 20px 40px -16px rgba(249,96,61,0.55)",
      }}
    />
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
