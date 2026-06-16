// Generated Apple touch icon.

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          background: "linear-gradient(140deg, #ff7a5c 0%, #ffb020 100%)",
        }}
      >
        🎁
      </div>
    ),
    { ...size },
  );
}
