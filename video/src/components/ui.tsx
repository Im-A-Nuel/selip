import { COLORS, FONT } from "../theme";

export const PillButton: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: FONT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "18px 26px",
      borderRadius: 999,
      fontSize: 24,
      fontWeight: 800,
      color: COLORS.white,
      background: `linear-gradient(135deg, ${COLORS.coral}, ${COLORS.amber})`,
      boxShadow: "0 16px 30px -12px rgba(249,96,61,0.6)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  active?: boolean;
}> = ({ children, active }) => (
  <div
    style={{
      fontFamily: FONT,
      padding: "12px 18px",
      borderRadius: 999,
      fontSize: 20,
      fontWeight: 700,
      color: active ? COLORS.white : "rgba(28,20,16,0.6)",
      background: active ? COLORS.ink : "rgba(255,255,255,0.8)",
      boxShadow: active
        ? "0 10px 24px -10px rgba(28,20,16,0.5)"
        : "0 1px 2px rgba(28,20,16,0.06)",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: FONT,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 18px",
      borderRadius: 999,
      fontSize: 20,
      fontWeight: 800,
      color: COLORS.coral,
      background: "rgba(249,96,61,0.1)",
    }}
  >
    {children}
  </div>
);

export const StatusPill: React.FC<{
  label: string;
  tone?: "wait" | "done";
}> = ({ label, tone = "wait" }) => {
  const map = {
    wait: { bg: "rgba(245,158,11,0.18)", fg: "#b45309" },
    done: { bg: "rgba(43,182,115,0.18)", fg: "#15803d" },
  }[tone];
  return (
    <div
      style={{
        fontFamily: FONT,
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 16,
        fontWeight: 800,
        color: map.fg,
        background: map.bg,
      }}
    >
      {label}
    </div>
  );
};

// Frosted card used across the app surfaces.
export const Glass: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: FONT,
      background: "rgba(255,255,255,0.66)",
      backdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.7)",
      boxShadow: "0 18px 40px -16px rgba(214,110,70,0.28)",
      borderRadius: 28,
      ...style,
    }}
  >
    {children}
  </div>
);
