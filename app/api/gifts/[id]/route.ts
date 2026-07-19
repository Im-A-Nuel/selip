// DELETE /api/gifts/:id - remove a gift that was created but never funded.
// Only drafts can be deleted (a funded/claimed/refunded gift moved real value
// and its record must stay), and only by the sender who created it.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { ERRORS, ok, fail } from "@/lib/http";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty/invalid body -> sender_id stays undefined and the ownership check
    // below rejects the request.
  }
  const senderId =
    typeof body?.sender_id === "string" ? body.sender_id.trim() : "";

  try {
    const repo = getRepo();
    const gift = await repo.getById(id);
    if (!gift) return ERRORS.NOT_FOUND();

    if (!gift.sender_id || !senderId || senderId !== gift.sender_id) {
      return ERRORS.FORBIDDEN("Only the sender can delete this gift.");
    }
    if (gift.status !== "draft") {
      return fail(
        "CANNOT_DELETE",
        "Only an unfunded draft can be deleted.",
        409,
      );
    }

    await repo.delete(id);
    return ok({ deleted: true });
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
