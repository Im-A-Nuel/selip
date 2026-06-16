"use client";

// Share a claim link via the native share sheet when available, falling back
// to clipboard copy. Used on the create-success screen.

import { useState } from "react";
import { PillButton } from "@/components/ui";

export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = {
      title: "Ada kado untukmu",
      text: "Aku menyelipkan hadiah buat kamu. Buka di sini:",
      url,
    };
    // navigator.share is mobile-first; guard for desktop/unsupported.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user cancelled or share failed; fall through to copy
      }
    }
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <PillButton onClick={share} className="w-full py-4 text-base">
      {copied ? "Link tersalin ✓" : "Bagikan kado"}
      <span aria-hidden>↗</span>
    </PillButton>
  );
}
