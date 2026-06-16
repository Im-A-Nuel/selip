// Dynamic link-preview image for a gift. Rendered when a claim link is shared
// (WhatsApp, Telegram, etc.) so the gift card shows up instead of a blank card.

import { ImageResponse } from "next/og";
import { getRepo } from "@/lib/db";
import { occasionById, themeById } from "@/lib/constants";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ada kado untukmu di Selip";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gift = await getRepo().getBySlug(slug);

  const theme = themeById(gift?.card_theme ?? "sunrise");
  const occasion = occasionById(gift?.occasion ?? "birthday");
  const claimable = gift && gift.status !== "claimed" && gift.status !== "expired";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(140deg, ${theme.from} 0%, ${theme.to} 100%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 8 }}>{occasion.emoji}</div>
        <div
          style={{
            fontSize: 40,
            opacity: 0.9,
            textTransform: "uppercase",
            letterSpacing: 4,
            fontWeight: 700,
          }}
        >
          {occasion.label}
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 12 }}>
          {claimable ? "Ada kado untukmu" : "Selip"}
        </div>
        <div style={{ fontSize: 34, opacity: 0.9, marginTop: 12 }}>
          Buka dengan Google. No wallet needed.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            fontSize: 30,
            fontWeight: 800,
            opacity: 0.85,
          }}
        >
          🎁 Selip
        </div>
      </div>
    ),
    { ...size },
  );
}
