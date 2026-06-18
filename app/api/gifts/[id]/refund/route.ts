// POST /api/gifts/:id/refund
// Marks a funded gift as refunded. Real on-chain refund tx is wired in week 4.
// Only funded gifts with rule_type "refund_if_unclaimed" are eligible.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { fail, ERRORS, ok } from "@/lib/http";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const repo = getRepo();
  const gift = await repo.getById(id);
  if (!gift) return ERRORS.NOT_FOUND();
  if (gift.status !== "funded") {
    return fail("CANNOT_REFUND", "Only funded gifts can be refunded.", 409);
  }
  if (gift.rule_type !== "refund_if_unclaimed") {
    return fail("CANNOT_REFUND", "This gift does not support refunds.", 409);
  }
  const updated = await repo.update(id, { status: "refunded" });
  return ok({ status: updated?.status ?? "refunded" });
}
