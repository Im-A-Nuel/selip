import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { PhoneFrame } from "../components/PhoneFrame";
import { Caption } from "../components/Caption";
import { GiftCardMock } from "../components/GiftCardMock";
import { Confetti } from "../components/Confetti";
import { Art } from "../components/Img";
import { COLORS, FONT } from "../theme";
import { pop } from "../components/anim";

export const S7_Claim: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tap on the Google button around f90, flip 160..240, count 240..330.
  const tap = pop(frame, fps, 88);
  const tapScale = interpolate(
    Math.min(tap, 1),
    [0, 0.5, 1],
    [1, 0.93, 1],
  );
  const signingIn = frame > 110 && frame < 165;

  const flip = interpolate(frame, [165, 245], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const revealed = flip < 90;

  const amount = Math.round(
    interpolate(frame, [250, 340], [0, 25], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  // Light burst behind the card right as it flips open.
  const burst = interpolate(frame, [165, 210, 320, 380], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burstScale = interpolate(frame, [165, 320], [0.7, 1.25]);

  return (
    <Scene>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <Confetti start={250} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Art
          name="reveal"
          style={{
            position: "absolute",
            left: "70%",
            top: "44%",
            width: 760,
            transform: `translate(-50%, -50%) scale(${burstScale})`,
            opacity: burst * 0.85,
            filter: "blur(1px)",
          }}
        />
      </AbsoluteFill>

      <div style={{ display: "flex", alignItems: "center", gap: 110 }}>
        <Caption
          kicker="The recipient · One tap"
          title={<>They open the link and the gift is already theirs.</>}
          subtitle={
            <>
              Sign in with Google, and an embedded wallet is created for them
              behind the scenes. They never see a seed phrase, a chain, or gas.
            </>
          }
          width={560}
        />

        <PhoneFrame scale={0.86}>
          <div
            style={{
              padding: "84px 30px 30px",
              fontFamily: FONT,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 26,
            }}
          >
            {/* Flip container */}
            <div style={{ perspective: 1400 }}>
              <div
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${flip}deg)`,
                  position: "relative",
                  width: 360,
                  height: 470,
                }}
              >
                {/* Front (revealed card) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <GiftCardMock
                    width={360}
                    occasion="Thanks!"
                    emoji="☕"
                    amount={`$${amount}.00`}
                    recipient="for Maya"
                    message="Coffee's on me this week."
                  />
                </div>
                {/* Back (sealed) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    borderRadius: 36,
                    background: `linear-gradient(150deg, ${COLORS.coral}, ${COLORS.amber})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 40px 80px -28px rgba(214,110,70,0.5)",
                  }}
                >
                  <span style={{ fontSize: 150 }}>🎁</span>
                </div>
              </div>
            </div>

            {!revealed ? (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: COLORS.ink,
                    textAlign: "center",
                  }}
                >
                  You've got a gift 🎁
                </div>
                <div
                  style={{
                    transform: `scale(${tapScale})`,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    padding: "18px 0",
                    borderRadius: 999,
                    background: COLORS.white,
                    boxShadow: "0 12px 30px -14px rgba(28,20,16,0.3)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.ink,
                  }}
                >
                  {signingIn ? "Signing you in…" : "🇬 Continue with Google"}
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "18px 0",
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${COLORS.coral}, ${COLORS.amber})`,
                  color: COLORS.white,
                  fontSize: 24,
                  fontWeight: 800,
                  boxShadow: "0 16px 30px -12px rgba(249,96,61,0.6)",
                }}
              >
                Cash out instantly →
              </div>
            )}
          </div>
        </PhoneFrame>
      </div>
    </Scene>
  );
};
