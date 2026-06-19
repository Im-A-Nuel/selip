// API response helpers. Error shape matches SCHEMA.md.

import { NextResponse } from "next/server";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// User-facing error copy, in English, no crypto jargon.
export const ERRORS = {
  INVALID_INPUT: (m = "Invalid input.") => fail("INVALID_INPUT", m, 400),
  UNAUTHORIZED: () => fail("UNAUTHORIZED", "Please sign in first.", 401),
  NOT_FOUND: () => fail("GIFT_NOT_FOUND", "Gift not found.", 404),
  ALREADY_FUNDED: () =>
    fail("GIFT_ALREADY_FUNDED", "This gift is already funded.", 409),
  ALREADY_CLAIMED: () =>
    fail("GIFT_ALREADY_CLAIMED", "This gift is already opened.", 409),
  GONE: () =>
    fail("GIFT_GONE", "This gift is already opened or expired.", 410),
  FORBIDDEN: (m = "You can't open this gift.") =>
    fail("FORBIDDEN", m, 403),
  LOCKED: (m = "This gift is not unlocked yet.") => fail("LOCKED", m, 423),
  TOO_MANY: (m = "Too many attempts. Try again later.") =>
    fail("TOO_MANY_ATTEMPTS", m, 429),
  SERVER: (m = "Something went wrong.") => fail("SERVER_ERROR", m, 500),
} as const;
