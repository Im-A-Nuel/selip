// POST /api/gifts/:id/claim - record a claim after on-chain transfer succeeds.
// Enforces the gift's protection gate (time lock, recipient email, secret PIN)
// before the claim is recorded.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { isExpired, isTimeLocked, normalizeEmail } from "@/lib/gifts";
import { safeEqual, sha256Hex } from "@/lib/hash";
import {
  checkPinAttempts,
  clearPinAttempts,
  recordPinFailure,
} from "@/lib/rateLimit";
import { ERRORS, ok } from "@/lib/http";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return ERRORS.INVALID_INPUT("Invalid JSON body.");
  }

  const { recipient_addr, dest_chain, claim_tx } = body ?? {};
  if (!recipient_addr || !dest_chain || !claim_tx) {
    return ERRORS.INVALID_INPUT(
      "recipient_addr, dest_chain, claim_tx are required.",
    );
  }

  try {
    const repo = getRepo();
    const gift = await repo.getById(id);
    if (!gift) return ERRORS.NOT_FOUND();
    if (gift.status === "claimed") return ERRORS.ALREADY_CLAIMED();
    if (gift.status === "expired" || gift.status === "refunded") {
      return ERRORS.GONE();
    }
    // Lazily-computed expiry: a funded gift past its refund deadline can no
    // longer be claimed (it is on its way back to the sender).
    if (isExpired(gift)) {
      return ERRORS.GONE();
    }

    // Time lock
    if (isTimeLocked(gift)) {
      return ERRORS.LOCKED("This gift unlocks later. Come back then.");
    }

    // Protection gate
    const protection = gift.protection ?? "open";
    if (protection === "email") {
      const claimer = body.recipient_email
        ? normalizeEmail(body.recipient_email)
        : "";
      if (!claimer || claimer !== gift.recipient_email) {
        return ERRORS.FORBIDDEN(
          "This gift is reserved for a specific email address.",
        );
      }
    } else if (protection === "pin") {
      // Throttle brute-force attempts on the secret code.
      const limit = checkPinAttempts(id);
      if (!limit.ok) {
        return ERRORS.TOO_MANY(
          `Too many wrong codes. Try again in ${Math.ceil((limit.retryAfter ?? 0) / 60)} min.`,
        );
      }
      const pin = typeof body.pin === "string" ? body.pin : "";
      const hash = pin ? await sha256Hex(pin) : "";
      if (!gift.pin_hash || !safeEqual(hash, gift.pin_hash)) {
        recordPinFailure(id);
        return ERRORS.FORBIDDEN("Wrong secret code.");
      }
      clearPinAttempts(id);
    }

    const updated = await repo.update(id, {
      status: "claimed",
      claim_tx,
      claimed_at: new Date().toISOString(),
    });
    if (!updated) return ERRORS.NOT_FOUND();
    return ok({ status: "claimed" });
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
