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
  /** free-text label when occasion === "custom" */
  occasion_label?: string;
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
  occasion_label?: string;
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
    return { ok: false, error: "Invalid occasion." };
  }
  if (input.occasion === "custom") {
    const label = input.occasion_label?.trim() ?? "";
    if (label.length === 0) {
      return { ok: false, error: "Name your custom occasion." };
    }
    if (label.length > 40) {
      return { ok: false, error: "Occasion name too long (max 40)." };
    }
  }
  if (!input.amount_display || input.amount_display.trim().length === 0) {
    return { ok: false, error: "Amount is required." };
  }
  if (!input.card_theme || !isCardTheme(input.card_theme)) {
    return { ok: false, error: "Invalid card theme." };
  }
  if (!input.rule_type || !isRuleType(input.rule_type)) {
    return { ok: false, error: "Invalid rule type." };
  }
  if (input.message && input.message.length > 280) {
    return { ok: false, error: "Message too long (max 280 characters)." };
  }
  return { ok: true };
}

// Public view: only what the recipient page needs. Never leak sender or
// on-chain internals to an unauthenticated resolve.
export function toPublicView(gift: Gift) {
  return {
    occasion: gift.occasion,
    occasion_label: gift.occasion_label ?? "",
    amount_display: gift.amount_display,
    message: gift.message ?? "",
    card_theme: gift.card_theme,
    status: gift.status,
  };
}
