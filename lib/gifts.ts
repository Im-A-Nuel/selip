// Gift domain types and pure helpers. No SDK or DB access here.

import { isCardTheme, isOccasion, isRuleType } from "./constants";

export type GiftStatus =
  | "draft"
  | "funded"
  | "claimed"
  | "refunded"
  | "expired";

export interface Gift {
  id: string;
  claim_slug: string;
  occasion: string;
  amount_display: string;
  message?: string;
  card_theme: string;
  rule_type: string;
  rule_param?: Record<string, unknown>;
  status: GiftStatus;
  source_chain?: string;
  smart_account_addr?: string;
  funding_tx?: string;
  claim_tx?: string;
  created_at?: string;
  claimed_at?: string;
}

export interface CreateGiftInput {
  occasion: string;
  amount_display: string;
  message?: string;
  card_theme: string;
  rule_type: string;
  rule_param?: Record<string, unknown>;
}

const SLUG_WORDS = [
  "rizki",
  "kira",
  "abil",
  "nala",
  "bima",
  "sena",
  "ayu",
  "dimas",
  "tari",
  "galih",
];

const HEX = "0123456789abcdef";

// Slug like "a8f3-rizki". Random part keeps links unguessable; word part keeps
// them friendly. randomInt injected so callers can seed deterministically.
export function generateSlug(randomInt: (max: number) => number): string {
  let hex = "";
  for (let i = 0; i < 4; i++) hex += HEX[randomInt(16)];
  const word = SLUG_WORDS[randomInt(SLUG_WORDS.length)];
  return `${hex}-${word}`;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateCreateInput(
  input: Partial<CreateGiftInput>,
): ValidationResult {
  if (!input.occasion || !isOccasion(input.occasion)) {
    return { ok: false, error: "Okasi tidak valid." };
  }
  if (!input.amount_display || input.amount_display.trim().length === 0) {
    return { ok: false, error: "Nominal wajib diisi." };
  }
  if (!input.card_theme || !isCardTheme(input.card_theme)) {
    return { ok: false, error: "Tema kartu tidak valid." };
  }
  if (!input.rule_type || !isRuleType(input.rule_type)) {
    return { ok: false, error: "Jenis aturan tidak valid." };
  }
  if (input.message && input.message.length > 280) {
    return { ok: false, error: "Pesan terlalu panjang (maks 280 karakter)." };
  }
  return { ok: true };
}

// Public view: only what the recipient page needs. Never leak sender or
// on-chain internals to an unauthenticated resolve.
export function toPublicView(gift: Gift) {
  return {
    occasion: gift.occasion,
    amount_display: gift.amount_display,
    message: gift.message ?? "",
    card_theme: gift.card_theme,
    status: gift.status,
  };
}
