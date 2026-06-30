import { COLORS, FONT } from "../theme";

// The gift card surface as the recipient sees it. Optional custom art fills the
// top; otherwise a warm gradient with the occasion glyph.
export const GiftCardMock: React.FC<{
  occasion?: string;
  emoji?: string;
  amount?: string;
  recipient?: string;
  message?: string;
  art?: string; // background image url for the custom card
  width?: number;
}> = ({
  occasion = "A little something",
  emoji = "🎁",
  amount = "$25.00",
  recipient = "for Maya",
  message = "Coffee's on me this week. Love you!",
  art,
  width = 360,
}) => {
  return (
    <div
      style={{
        fontFamily: FONT,
        width,
        borderRadius: 36,
        overflow: "hidden",
        background: COLORS.white,
        boxShadow:
          "0 40px 80px -28px rgba(214,110,70,0.5), 0 1px 2px rgba(28,20,16,0.06)",
      }}
    >
      <div
        style={{
          height: width * 0.78,
          position: "relative",
          background: art
            ? `center/cover no-repeat url(${art})`
            : `linear-gradient(150deg, ${COLORS.coralSoft}, ${COLORS.amber})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!art ? (
          <span style={{ fontSize: 120 }}>{emoji}</span>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 26,
            bottom: 22,
            color: COLORS.white,
            fontWeight: 800,
            fontSize: 26,
            textShadow: "0 2px 12px rgba(0,0,0,0.45)",
          }}
        >
          {occasion}
        </div>
      </div>
      <div style={{ padding: "26px 28px 30px" }}>
        <div
          style={{ fontSize: 20, fontWeight: 700, color: "rgba(28,20,16,0.45)" }}
        >
          {recipient}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -1,
            color: COLORS.ink,
            margin: "4px 0 14px",
          }}
        >
          {amount}
        </div>
        <div
          style={{
            fontSize: 23,
            lineHeight: 1.45,
            color: "rgba(28,20,16,0.7)",
          }}
        >
          “{message}”
        </div>
      </div>
    </div>
  );
};
