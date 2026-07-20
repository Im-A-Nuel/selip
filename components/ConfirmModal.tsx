"use client";

// Branded confirm dialog, replacing the browser's native confirm() popup.
// Same shell pattern as QrModal: blurred backdrop, closes on Esc/backdrop
// click, reveal-pop entrance. Used for destructive actions (e.g. deleting a
// draft) where a plain click is too easy to hit by accident.

import { useEffect } from "react";
import { Spinner } from "@/components/ui";

export function ConfirmModal({
  title,
  body,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  busy = false,
  onConfirm,
  onClose,
}: {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
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
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-6 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="reveal-pop relative w-full max-w-xs rounded-4xl bg-white/95 p-6 text-center shadow-2xl ring-1 ring-black/5"
      >
        <div
          aria-hidden
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            danger ? "bg-red-500/10" : "bg-coral-50"
          }`}
        >
          {danger ? "🗑️" : "❓"}
        </div>
        <p id="confirm-modal-title" className="text-base font-extrabold text-ink">
          {title}
        </p>
        {body && <p className="mt-1.5 text-sm text-ink/55">{body}</p>}

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-ink/5 py-3 text-sm font-bold text-ink/70 transition-colors hover:bg-ink/10"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
            className={`relative flex-1 rounded-full py-3 text-sm font-semibold text-white shadow-lg transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.96] disabled:opacity-60 disabled:active:scale-100 ${
              danger
                ? "bg-red-500 shadow-red-400/30 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-xl"
                : "bg-ink shadow-ink/25 hover:-translate-y-0.5 hover:bg-black hover:shadow-xl"
            }`}
          >
            <span className={busy ? "invisible" : ""}>{confirmLabel}</span>
            {busy && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
