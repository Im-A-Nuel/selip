// POST /api/gifts/:id/thanks - recipient leaves a thank-you note after claiming.

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
    return ERRORS.INVALID_INPUT("Invalid JSON body.");
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return ERRORS.INVALID_INPUT("Write a short message.");
  if (message.length > 280) {
    return ERRORS.INVALID_INPUT("Message too long (max 280).");
  }

  try {
    const repo = getRepo();
    const gift = await repo.getById(id);
    if (!gift) return ERRORS.NOT_FOUND();
    // Only after the gift is opened can the recipient say thanks.
    if (gift.status !== "claimed") {
      return ERRORS.FORBIDDEN("Open the gift first.");
    }
    const updated = await repo.update(id, { thanks_message: message });
    if (!updated) return ERRORS.NOT_FOUND();
    return ok({ ok: true });
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
