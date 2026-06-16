// Shared enums and display metadata. Keep recipient-facing copy free of the
// words wallet / seed phrase / gas / chain (CLAUDE.md convention).

export const OCCASIONS = [
  { id: "birthday", label: "Ulang tahun", emoji: "🎂" },
  { id: "thr", label: "THR", emoji: "🧧" },
  { id: "graduation", label: "Kelulusan", emoji: "🎓" },
  { id: "wedding", label: "Pernikahan", emoji: "💍" },
] as const;

export type OccasionId = (typeof OCCASIONS)[number]["id"];

export const CARD_THEMES = [
  { id: "sunrise", label: "Sunrise", from: "#ff7a5c", to: "#ffb020" },
  { id: "peach", label: "Peach", from: "#ffbe8a", to: "#ff7a5c" },
  { id: "amber", label: "Amber", from: "#f59e0b", to: "#ff7a5c" },
  { id: "coral", label: "Coral", from: "#f9603d", to: "#ffd9b8" },
] as const;

export type CardThemeId = (typeof CARD_THEMES)[number]["id"];

export const RULE_TYPES = [
  { id: "refund_if_unclaimed", label: "Kembali otomatis jika tidak dibuka" },
  { id: "unlock_on_date", label: "Buka pada tanggal tertentu" },
  { id: "vested", label: "Cair bertahap" },
] as const;

export type RuleTypeId = (typeof RULE_TYPES)[number]["id"];

// Destinations the recipient can cash out to. Cross-chain routing handled by
// the Universal Accounts SDK; Arbitrum is the settlement chain.
export const DEST_CHAINS = [
  { id: "arbitrum", label: "Arbitrum", chainId: 42161 },
  { id: "base", label: "Base", chainId: 8453 },
  { id: "optimism", label: "Optimism", chainId: 10 },
  { id: "polygon", label: "Polygon", chainId: 137 },
] as const;

export function isOccasion(v: string): v is OccasionId {
  return OCCASIONS.some((o) => o.id === v);
}

export function isCardTheme(v: string): v is CardThemeId {
  return CARD_THEMES.some((t) => t.id === v);
}

export function isRuleType(v: string): v is RuleTypeId {
  return RULE_TYPES.some((r) => r.id === v);
}

export function themeById(id: string) {
  return CARD_THEMES.find((t) => t.id === id) ?? CARD_THEMES[0];
}

export function occasionById(id: string) {
  return OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[0];
}
