"use client";

// Share a claim link via the native share sheet when available, falling back
// to clipboard copy. Used on the create-success screen.

import { PillButton } from "@/components/ui";
import { useToast } from "@/components/Toast";

export function ShareButton({ url }: { url: string }) {
  const toast = useToast();

  async function share() {
    const data = {
      title: "A gift for you",
      text: "I slipped you a gift. Open it here:",
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
    toast("Link copied");
  }

  return (
    <PillButton onClick={share} className="w-full py-4 text-base">
      Share gift <span aria-hidden>↗</span>
    </PillButton>
  );
}
