// POST /api/gifts/status - resolve sender's gifts to their current status.
//
// Accepts either:
//   { sender_id: string }            → query all gifts with this sender_id (preferred)
//   { ids: string[] }                → query by explicit ids (legacy / fallback)
//   { sender_id, ids }               → sender_id wins; ids used only if sender_id empty
//
// Returns safe fields only; never secrets.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { isTimeLocked } from "@/lib/gifts";
import { ERRORS, ok } from "@/lib/http";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return ERRORS.INVALID_INPUT("Invalid JSON body.");
  }

  const senderId =
    typeof body?.sender_id === "string" && body.sender_id.trim().length > 0
      ? body.sender_id.trim().slice(0, 64)
      : null;

  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 100)
    : [];

  if (!senderId && ids.length === 0) {
    return ok({ items: [] });
  }

  try {
    const repo = getRepo();
    const gifts = senderId
      ? await repo.listBySenderId(senderId)
      : await repo.listByIds(ids);

    const items = gifts.map((g) => ({
      id: g.id,
      claim_slug: g.claim_slug,
      occasion: g.occasion,
      occasion_label: g.occasion_label ?? "",
      amount_display: g.amount_display,
      card_theme: g.card_theme,
      status: g.status,
      protection: g.protection ?? "open",
      unlock_at: g.unlock_at ?? null,
      locked: isTimeLocked(g),
      thanks_message: g.thanks_message ?? "",
      created_at: g.created_at ?? null,
    }));
    return ok({ items });
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
