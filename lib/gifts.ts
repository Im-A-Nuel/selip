// Gift domain types and pure helpers. No SDK or DB access here.

import { isCardTheme, isOccasion, isRuleType } from "./constants";

export type GiftStatus =
  | "draft"
  | "funded"
  | "claimed"
  | "refunded"
  | "expired";

// How a gift is gated at claim time.
//  - open:  anyone with the link can claim (bearer)
//  - email: only the recipient email the sender set can claim
//  - pin:   a secret code, shared out of band, is required
export type Protection = "open" | "email" | "pin";

export function isProtection(v: string): v is Protection {
  return v === "open" || v === "email" || v === "pin";
}

export interface Gift {
  id: string;
  claim_slug: string;
  occasion: string;
  /** free-text label when occasion === "custom" */
  occasion_label?: string;
  amount_display: string;
  /** numeric value of the gift (major units, e.g. 50 for $50) */
  amount_value?: number;
  message?: string;
  card_theme: string;
  rule_type: string;
  rule_param?: Record<string, unknown>;
  status: GiftStatus;
  protection?: Protection;
  /** lowercased recipient email when protection === "email" */
  recipient_email?: string;
  /** sha-256 hex of the secret when protection === "pin" */
  pin_hash?: string;
  /** ISO date; gift cannot be opened before this when set */
  unlock_at?: string;
  /** thank-you note left by the recipient after claiming */
  thanks_message?: string;
  /** client-generated UUID identifying the sender's session/browser */
  sender_id?: string;
  /** display name of the recipient (personalises the claim page) */
  recipient_name?: string;
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
  amount_value?: number;
  message?: string;
  card_theme: string;
  rule_type: string;
  rule_param?: Record<string, unknown>;
  protection?: Protection;
  recipient_email?: string;
  pin_hash?: string;
  unlock_at?: string;
  sender_id?: string;
  recipient_name?: string;
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

// Upper bound on a single gift's numeric value (major units). Guards against
// fat-finger / overflow inputs; the demo deals in small amounts.
export const MAX_AMOUNT = 1_000_000;

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
  // When a numeric value is supplied it must be a sane, positive amount.
  if (input.amount_value !== undefined) {
    const v = input.amount_value;
    if (!Number.isFinite(v) || v <= 0) {
      return { ok: false, error: "Enter an amount greater than zero." };
    }
    if (v > MAX_AMOUNT) {
      return { ok: false, error: `Amount too large (max ${MAX_AMOUNT}).` };
    }
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
  const protection = input.protection ?? "open";
  if (!isProtection(protection)) {
    return { ok: false, error: "Invalid protection." };
  }
  if (protection === "email") {
    if (!input.recipient_email || !isValidEmail(input.recipient_email)) {
      return { ok: false, error: "Enter a valid recipient email." };
    }
  }
  if (protection === "pin" && !input.pin_hash) {
    return { ok: false, error: "Set a secret code." };
  }
  if (input.unlock_at) {
    const t = Date.parse(input.unlock_at);
    if (Number.isNaN(t)) return { ok: false, error: "Invalid unlock date." };
  }
  return { ok: true };
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
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
    // claim UI needs to know which gate to present, never the secret itself
    protection: gift.protection ?? "open",
    unlock_at: gift.unlock_at ?? null,
    locked: isTimeLocked(gift),
    expired: isExpired(gift),
    recipient_name: gift.recipient_name ?? "",
  };
}

// True when an unlock date is set and still in the future.
export function isTimeLocked(gift: Gift, now = Date.now()): boolean {
  if (!gift.unlock_at) return false;
  const t = Date.parse(gift.unlock_at);
  return !Number.isNaN(t) && now < t;
}

// Days after which an unclaimed funded gift is considered expired (refundable).
// Mirrors the default ZeroDev refund rule. The contract enforces the real
// deadline on-chain; this is the off-chain mirror so the UI can reflect it.
export const EXPIRY_DAYS = 30;

// True when a still-funded gift has passed its refund deadline without a claim.
// Computed lazily from created_at so no cron/write is needed to "expire" gifts.
export function isExpired(gift: Gift, now = Date.now()): boolean {
  if (gift.status !== "funded") return false;
  if (!gift.created_at) return false;
  const created = Date.parse(gift.created_at);
  if (Number.isNaN(created)) return false;
  return now >= created + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}
