// Supabase Postgres client. Holds gift metadata only (non-custodial).
// Never store private keys or funds here. See SCHEMA.md `gifts` table.
//
// TODO(week2): wire @supabase/supabase-js once dependency is confirmed.

export type GiftStatus =
  | "draft"
  | "funded"
  | "claimed"
  | "refunded"
  | "expired";

export type Occasion = "birthday" | "thr" | "graduation" | "wedding";

export type RuleType = "refund_if_unclaimed" | "unlock_on_date" | "vested";

export interface Gift {
  id: string;
  claim_slug: string;
  occasion: Occasion;
  amount_display: string;
  message?: string;
  card_theme: string;
  rule_type: RuleType;
  rule_param?: Record<string, unknown>;
  status: GiftStatus;
  source_chain?: string;
  smart_account_addr?: string;
  funding_tx?: string;
  claim_tx?: string;
  created_at?: string;
  claimed_at?: string;
}
