// API response helpers. Error shape matches SCHEMA.md.

import { NextResponse } from "next/server";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// Recipient-facing error copy, in Indonesian, no crypto jargon.
export const ERRORS = {
  INVALID_INPUT: (m = "Input tidak valid.") =>
    fail("INVALID_INPUT", m, 400),
  UNAUTHORIZED: () => fail("UNAUTHORIZED", "Silakan login dulu.", 401),
  NOT_FOUND: () => fail("GIFT_NOT_FOUND", "Kado tidak ditemukan.", 404),
  ALREADY_FUNDED: () =>
    fail("GIFT_ALREADY_FUNDED", "Kado ini sudah didanai.", 409),
  ALREADY_CLAIMED: () =>
    fail("GIFT_ALREADY_CLAIMED", "Kado ini sudah dibuka.", 409),
  GONE: () =>
    fail("GIFT_GONE", "Kado ini sudah dibuka atau kedaluwarsa.", 410),
  SERVER: (m = "Terjadi kesalahan.") => fail("SERVER_ERROR", m, 500),
} as const;
