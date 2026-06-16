// Generated favicon: gift emoji on a warm gradient.

import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          background: "linear-gradient(140deg, #ff7a5c 0%, #ffb020 100%)",
          borderRadius: 14,
        }}
      >
        🎁
      </div>
    ),
    { ...size },
  );
}
