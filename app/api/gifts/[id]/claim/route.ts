// POST /api/gifts/:id/claim - record a claim after on-chain transfer succeeds.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
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
    return ERRORS.INVALID_INPUT("Body bukan JSON valid.");
  }

  const { recipient_addr, dest_chain, claim_tx } = body ?? {};
  if (!recipient_addr || !dest_chain || !claim_tx) {
    return ERRORS.INVALID_INPUT(
      "recipient_addr, dest_chain, claim_tx wajib.",
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
