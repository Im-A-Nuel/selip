"use client";

// QR code for a gift claim link. Sender shows it on their phone; the recipient
// scans to open the gift. Rendered to a canvas so it can be downloaded as PNG.

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export function QrCode({ value, size = 196 }: { value: string; size?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function download() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "selip-gift-qr.png";
    a.click();
  }

  return (
    <div className="rise-in flex flex-col items-center gap-3">
      <div
        ref={wrapRef}
        className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/10"
      >
        <QRCodeCanvas
          value={value}
          size={size}
          marginSize={2}
          level="M"
          fgColor="#1c1410"
          bgColor="#ffffff"
        />
      </div>
      <button
        onClick={download}
        className="text-xs font-semibold text-coral-600 hover:text-coral-700"
      >
        Download QR
      </button>
    </div>
  );
}
