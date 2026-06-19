// POST /api/gifts - create a draft gift.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import {
  generateSlug,
  normalizeEmail,
  validateCreateInput,
  type CreateGiftInput,
} from "@/lib/gifts";
import { sha256Hex } from "@/lib/hash";
import { ERRORS, ok } from "@/lib/http";

function randomInt(max: number): number {
  // Cryptographically random index, server-side.
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return ERRORS.INVALID_INPUT("Invalid JSON body.");
  }

  const protection = body.protection ?? "open";
  // Hash the secret before it touches storage; validate the hashed shape.
  const pin_hash =
    protection === "pin" && typeof body.pin === "string" && body.pin.length > 0
      ? await sha256Hex(body.pin)
      : undefined;

  const senderId =
    typeof body.sender_id === "string" && body.sender_id.length > 0
      ? body.sender_id.slice(0, 64)
      : undefined;

  const recipientName =
    typeof body.recipient_name === "string" && body.recipient_name.trim().length > 0
      ? body.recipient_name.trim().slice(0, 40)
      : undefined;

  const amountValue =
    typeof body.amount_value === "number" && Number.isFinite(body.amount_value)
      ? body.amount_value
      : undefined;

  const candidate: Partial<CreateGiftInput> = {
    occasion: body.occasion,
    occasion_label: body.occasion_label,
    amount_display: body.amount_display,
    amount_value: amountValue,
    message: body.message,
    card_theme: body.card_theme,
    rule_type: body.rule_type,
    rule_param: body.rule_param,
    protection,
    recipient_email:
      protection === "email" && body.recipient_email
        ? normalizeEmail(body.recipient_email)
        : undefined,
    pin_hash,
    unlock_at: body.unlock_at || undefined,
    sender_id: senderId,
    recipient_name: recipientName,
  };

  const check = validateCreateInput(candidate);
  if (!check.ok) return ERRORS.INVALID_INPUT(check.error);

  try {
    const repo = getRepo();
    // Retry slug a few times to dodge the rare collision.
    let gift = null;
    for (let attempt = 0; attempt < 5 && !gift; attempt++) {
      const slug = generateSlug(randomInt);
      const existing = await repo.getBySlug(slug);
      if (!existing) {
        gift = await repo.create(candidate as CreateGiftInput, slug);
      }
    }
    if (!gift) return ERRORS.SERVER("Could not generate a unique slug.");
    return ok(
      { id: gift.id, claim_slug: gift.claim_slug, status: gift.status },
      201,
    );
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
