// Brand link-preview image for the landing page.

import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Selip - Slip someone a gift. No wallet needed.";

export default function Image() {
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
          background: "linear-gradient(140deg, #ff7a5c 0%, #ffb020 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 140 }}>🎁</div>
        <div style={{ fontSize: 96, fontWeight: 800, marginTop: 8 }}>Selip</div>
        <div style={{ fontSize: 40, opacity: 0.92, marginTop: 8 }}>
          Kasih hadiah, semudah chat.
        </div>
        <div style={{ fontSize: 30, opacity: 0.85, marginTop: 24 }}>
          No wallet needed.
        </div>
      </div>
    ),
    { ...size },
  );
}
