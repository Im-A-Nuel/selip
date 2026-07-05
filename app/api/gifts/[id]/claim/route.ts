// POST /api/gifts/:id/claim - two-phase claim.
//
// Phase 1 (body.prepare === true): run every gate check (status, expiry, time
// lock, email/PIN protection) and, if they pass, reveal the gift's escrow
// address WITHOUT recording anything. The client then executes the real
// on-chain claim() against that escrow.
//
// Phase 2 (default): same gate checks, then record the claim with the real
// transaction hash. Recording only ever happens after the on-chain transfer
// succeeded, so the database can never say "claimed" while the escrow still
// holds the funds.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { notifyClaim } from "@/lib/email";
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

  const prepare = body?.prepare === true;
  const { recipient_addr, dest_chain, claim_tx } = body ?? {};
  if (!prepare && (!recipient_addr || !dest_chain || !claim_tx)) {
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

    if (prepare) {
      // Gate passed: hand the client what it needs for the on-chain leg.
      // Legacy/demo rows carry a placeholder address; only reveal a real one,
      // so the client knows to fall back to the record-only path.
      const addr = gift.smart_account_addr ?? "";
      const isRealEscrow =
        /^0x[0-9a-fA-F]{40}$/.test(addr) && !addr.startsWith("0xDEMO");
      return ok({ escrow_addr: isRealEscrow ? addr : null });
    }

    const updated = await repo.update(id, {
      status: "claimed",
      claim_tx,
      claimed_at: new Date().toISOString(),
    });
    if (!updated) return ERRORS.NOT_FOUND();

    // Notify the sender (best-effort; no-op without RESEND_API_KEY/sender email).
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    await notifyClaim(updated, `${base}/g/${updated.claim_slug}`);

    return ok({ status: "claimed" });
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
