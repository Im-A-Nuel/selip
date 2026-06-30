import { useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../components/Scene";
import { Art } from "../components/Img";
import { Glass } from "../components/ui";
import { COLORS, FONT } from "../theme";
import { pop, riseIn } from "../components/anim";

const ROWS = [
  { art: "prot-email", t: "Magic embedded wallet", d: "A wallet is created from a plain Google login. No seed phrase, ever." },
  { art: "mascot", t: "Particle Universal Accounts", d: "EIP-7702 upgrades the wallet on first claim. Fund from any chain, any asset." },
  { art: "prot-pin", t: "ZeroDev programmable rules", d: "Refund-if-unclaimed and time-locks are enforced on-chain, not by a backend." },
  { art: "prot-open", t: "GiftEscrow on Arbitrum", d: "The value and rules live in the contract. Live and verified on-chain." },
  { art: "trust", t: "Non-custodial by design", d: "No private keys, no funds ever sit on our servers. Only gift metadata." },
];

export const S8_Tech: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sTitle = pop(frame, fps, 4);

  return (
    <Scene>
      <div style={{ display: "flex", flexDirection: "column", gap: 36, width: 1180 }}>
        <div
          style={{
            ...riseIn(sTitle),
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            color: COLORS.ink,
            textAlign: "center",
          }}
        >
          Invisible by design.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {ROWS.map((r, i) => {
            const s = pop(frame, fps, 20 + i * 14);
            return (
              <Glass
                key={r.t}
                style={{
                  ...riseIn(s, 24),
                  padding: "22px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.7)",
                    boxShadow: "inset 0 0 0 1px rgba(28,20,16,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <Art
                    name={r.art}
                    style={{ width: 58, height: 58, objectFit: "contain" }}
                  />
                </div>
                <div>
                  <div
                    style={{ fontSize: 30, fontWeight: 800, color: COLORS.ink }}
                  >
                    {r.t}
                  </div>
                  <div
                    style={{
                      fontSize: 23,
                      color: "rgba(28,20,16,0.6)",
                      marginTop: 2,
                    }}
                  >
                    {r.d}
                  </div>
                </div>
              </Glass>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};
