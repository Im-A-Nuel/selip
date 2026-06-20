"use client";

// Full-screen QR popup. Blurred backdrop; closes on X, backdrop click, or Esc.
// The QR (with its Download button) lives inside.

import { useEffect } from "react";
import { QrCode } from "@/components/QrCode";

export function QrModal({
  value,
  onClose,
}: {
  value: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-6 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="reveal-pop relative w-full max-w-xs rounded-4xl bg-white/95 p-6 shadow-2xl ring-1 ring-black/5"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-lg text-ink/60 transition-colors hover:bg-ink/10 hover:text-ink"
        >
          ✕
        </button>
        <div className="flex flex-col items-center gap-1 pt-2 text-center">
          <p className="text-base font-extrabold text-ink">Scan to open</p>
          <p className="mb-2 text-xs text-ink/50">
            Point a phone camera at the code.
          </p>
          <QrCode value={value} size={224} />
        </div>
      </div>
    </div>
  );
}
