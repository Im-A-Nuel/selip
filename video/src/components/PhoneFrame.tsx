import { COLORS } from "../theme";

// A clean device mock. Children render inside the screen, clipped to the
// rounded display. Defaults to a portrait phone at a 9:19.5-ish ratio.
export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  width?: number;
  scale?: number;
}> = ({ children, width = 430, scale = 1 }) => {
  const height = width * 2.03;
  return (
    <div
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        borderRadius: 64,
        padding: 14,
        background: "linear-gradient(150deg, #2a211c, #0e0a08)",
        boxShadow:
          "0 60px 120px -30px rgba(214,110,70,0.45), 0 30px 60px -20px rgba(28,20,16,0.4), inset 0 1px 2px rgba(255,255,255,0.18)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 52,
          overflow: "hidden",
          background: COLORS.page,
          position: "relative",
        }}
      >
        {children}
        {/* Dynamic-island style pill */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 118,
            height: 34,
            borderRadius: 20,
            background: "#0e0a08",
            zIndex: 50,
          }}
        />
      </div>
    </div>
  );
};
