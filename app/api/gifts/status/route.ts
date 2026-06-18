// POST /api/gifts/status - resolve a list of gift ids to their sender-facing
// status. Used by the "My gifts" dashboard, which tracks created ids locally
// (no sender auth yet). Returns safe fields only; never secrets.

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

  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 100)
    : [];

  try {
    const gifts = await getRepo().listByIds(ids);
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
