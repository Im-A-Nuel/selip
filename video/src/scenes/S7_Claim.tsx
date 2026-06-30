import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Scene } from "../components/Scene";
import { PhoneFrame } from "../components/PhoneFrame";
import { Caption } from "../components/Caption";
import { GiftCardMock } from "../components/GiftCardMock";
import { Confetti } from "../components/Confetti";
import { Art } from "../components/Img";
import { COLORS, FONT } from "../theme";
import { pop } from "../components/anim";

const GoogleG: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

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
                    iconArt="occ-custom"
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
                  <Art name="mascot" style={{ width: 230, height: "auto" }} />
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
                  You've got a gift
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
                  {signingIn ? (
                    "Signing you in…"
                  ) : (
                    <>
                      <GoogleG />
                      Continue with Google
                    </>
                  )}
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
