// POST /api/gifts/:id/refund
// Marks a funded gift as refunded. Real on-chain refund tx is wired in week 4.
// Only funded gifts with rule_type "refund_if_unclaimed" are eligible, and only
// the original sender (matched by sender_id) may trigger the refund.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { fail, ERRORS, ok } from "@/lib/http";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty/invalid body -> sender_id stays undefined and the ownership check
    // below rejects the request.
  }
  const senderId =
    typeof body?.sender_id === "string" ? body.sender_id.trim() : "";

  const repo = getRepo();
  const gift = await repo.getById(id);
  if (!gift) return ERRORS.NOT_FOUND();

  // Ownership: only the sender who created the gift can refund it. Reject when
  // the gift has no recorded sender_id (legacy) to avoid an open refund hole.
  if (!gift.sender_id || !senderId || senderId !== gift.sender_id) {
    return ERRORS.FORBIDDEN("Only the sender can refund this gift.");
  }

  if (gift.status !== "funded") {
    return fail("CANNOT_REFUND", "Only funded gifts can be refunded.", 409);
  }
  if (gift.rule_type !== "refund_if_unclaimed") {
    return fail("CANNOT_REFUND", "This gift does not support refunds.", 409);
  }
  const updated = await repo.update(id, { status: "refunded" });
  return ok({ status: updated?.status ?? "refunded" });
}
