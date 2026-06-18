"use client";

// PWA install nudge. Listens for the browser's beforeinstallprompt event and
// shows a bottom sheet once. Dismissed state is kept in sessionStorage so it
// doesn't re-appear in the same session.

import { useEffect, useState } from "react";
import { PillButton } from "@/components/ui";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("pwa-dismiss")) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem("pwa-dismiss", "1");
    setEvt(null);
  }

  async function install() {
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === "dismissed") sessionStorage.setItem("pwa-dismiss", "1");
    setEvt(null);
  }

  if (!evt) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-safe">
      <div className="glass mb-4 flex w-full max-w-md items-center gap-3 rounded-3xl p-4 shadow-xl shadow-black/10 ring-1 ring-black/5">
        <span className="text-2xl" aria-hidden>
          📲
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-ink">Add Selip to your home screen</p>
          <p className="text-xs text-ink/50">Open gifts instantly, no browser needed.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={dismiss}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink/50 hover:text-ink"
          >
            Not now
          </button>
          <PillButton onClick={install} className="px-4 py-2 text-xs">
            Add
          </PillButton>
        </div>
      </div>
    </div>
  );
}
