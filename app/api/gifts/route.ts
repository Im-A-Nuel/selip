// POST /api/gifts - create a draft gift.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { generateSlug, validateCreateInput } from "@/lib/gifts";
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
    return ERRORS.INVALID_INPUT("Body bukan JSON valid.");
  }

  const check = validateCreateInput(body);
  if (!check.ok) return ERRORS.INVALID_INPUT(check.error);

  try {
    const repo = getRepo();
    // Retry slug a few times to dodge the rare collision.
    let gift = null;
    for (let attempt = 0; attempt < 5 && !gift; attempt++) {
      const slug = generateSlug(randomInt);
      const existing = await repo.getBySlug(slug);
      if (!existing) {
        gift = await repo.create(
          {
            occasion: body.occasion,
            occasion_label: body.occasion_label,
            amount_display: body.amount_display,
            message: body.message,
            card_theme: body.card_theme,
            rule_type: body.rule_type,
            rule_param: body.rule_param,
          },
          slug,
        );
      }
    }
    if (!gift) return ERRORS.SERVER("Gagal membuat slug unik.");
    return ok(
      { id: gift.id, claim_slug: gift.claim_slug, status: gift.status },
      201,
    );
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
