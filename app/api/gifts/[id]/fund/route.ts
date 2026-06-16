// POST /api/gifts/:id/fund - mark a gift funded after on-chain confirmation.

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

  const { source_chain, smart_account_addr, funding_tx } = body ?? {};
  if (!source_chain || !smart_account_addr || !funding_tx) {
    return ERRORS.INVALID_INPUT(
      "source_chain, smart_account_addr, funding_tx wajib.",
    );
  }

  try {
    const repo = getRepo();
    const gift = await repo.getById(id);
    if (!gift) return ERRORS.NOT_FOUND();
    if (gift.status === "funded" || gift.status === "claimed") {
      return ERRORS.ALREADY_FUNDED();
    }

    const updated = await repo.update(id, {
      status: "funded",
      source_chain,
      smart_account_addr,
      funding_tx,
    });
    if (!updated) return ERRORS.NOT_FOUND();

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    return ok({
      status: "funded",
      claim_url: `${base}/g/${updated.claim_slug}`,
    });
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
