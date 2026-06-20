// GET /api/og/:slug — dynamic Open Graph image per gift.
// Uses next/og ImageResponse. Text-only layout so no image fetching needed.

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { occasionById } from "@/lib/constants";

// Node runtime so the OG image uses the same Supabase DB path as every other
// route (edge + the dynamic supabase import is an unverified combo).
export const runtime = "nodejs";

const OCCASION_EMOJI: Record<string, string> = {
  birthday: "🎂",
  thr: "🌙",
  graduation: "🎓",
  wedding: "💍",
  custom: "🎁",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let amount = "A gift";
  let label = "for you";
  let emoji = "🎁";

  try {
    const gift = await getRepo().getBySlug(slug);
    if (gift) {
      amount = gift.amount_display;
      const occ = occasionById(gift.occasion);
      label =
        gift.occasion === "custom" && gift.occasion_label
          ? gift.occasion_label
          : occ.label;
      emoji = OCCASION_EMOJI[gift.occasion] ?? "🎁";
    }
  } catch {
    // Render fallback OG on any error.
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #fff5f0 0%, #fde8d0 50%, #fdf4e0 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Card shape */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.85)",
            borderRadius: 40,
            padding: "60px 80px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.10)",
            gap: 16,
            minWidth: 600,
          }}
        >
          <div style={{ fontSize: 72, lineHeight: 1 }}>{emoji}</div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: "#1a1108",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            {amount}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#7a6040",
              fontWeight: 600,
            }}
          >
            {label} gift
          </div>
        </div>

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 56,
            fontSize: 22,
            fontWeight: 700,
            color: "#e05a30",
            letterSpacing: "-0.5px",
          }}
        >
          Selip
        </div>

        {/* Tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            left: 56,
            fontSize: 20,
            color: "#b08060",
            fontWeight: 500,
          }}
        >
          No wallet needed.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
