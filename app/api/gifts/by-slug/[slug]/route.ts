// GET /api/gifts/by-slug/:slug - resolve a claim link to public metadata.

import type { NextRequest } from "next/server";
import { getRepo } from "@/lib/db";
import { toPublicView } from "@/lib/gifts";
import { ERRORS, ok } from "@/lib/http";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  try {
    const repo = getRepo();
    const gift = await repo.getBySlug(slug);
    if (!gift) return ERRORS.NOT_FOUND();
    if (gift.status === "claimed" || gift.status === "expired") {
      return ERRORS.GONE();
    }
    return ok(toPublicView(gift));
  } catch (e) {
    return ERRORS.SERVER((e as Error).message);
  }
}
