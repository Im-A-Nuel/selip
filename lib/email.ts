// Server-only claim notifications via Resend. No-op (and never throws) when
// RESEND_API_KEY or the sender email is missing, so the claim never depends on
// email succeeding. Uses a plain fetch, no SDK.

import type { Gift } from "./gifts";
import { occasionById } from "./constants";

export async function notifyClaim(gift: Gift, claimUrl: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = gift.sender_email;
  if (!key || !to) return;

  const from = process.env.RESEND_FROM || "Selip <onboarding@resend.dev>";
  const label =
    gift.occasion === "custom"
      ? gift.occasion_label?.trim() || "gift"
      : occasionById(gift.occasion).label;
  const who = gift.recipient_name?.trim() ? ` by ${gift.recipient_name.trim()}` : "";

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `🎁 Your ${gift.amount_display} gift was just opened`,
        html: `
          <div style="font-family:system-ui,sans-serif;color:#1c1410">
            <h2>It was opened${who} 💛</h2>
            <p>The ${label} gift you sent (<strong>${gift.amount_display}</strong>) was just claimed.</p>
            <p><a href="${claimUrl}" style="color:#f9603d">View the gift</a></p>
            <p style="color:#9a8c80;font-size:12px">Sent by Selip. Slip someone a gift, no wallet needed.</p>
          </div>`,
      }),
    });
  } catch {
    // best-effort; never block the claim on email delivery
  }
}
