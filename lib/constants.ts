// Shared enums and display metadata. Keep recipient-facing copy free of the
// words wallet / seed phrase / gas / chain (CLAUDE.md convention).
// Copy is English; ids stay stable so the DB enum constraints do not change.

export const OCCASIONS = [
  { id: "birthday", label: "Birthday", icon: "/art/occ-birthday.webp", art: "/art/card-birthday.webp" },
  { id: "thr", label: "Holiday", icon: "/art/occ-holiday.webp", art: "/art/card-festive.webp" },
  { id: "graduation", label: "Graduation", icon: "/art/occ-graduation.webp", art: "/art/card-graduation.webp" },
  { id: "wedding", label: "Wedding", icon: "/art/occ-wedding.webp", art: "/art/card-wedding.webp" },
  { id: "custom", label: "Custom", icon: "/art/occ-custom.webp", art: null },
] as const;

export type OccasionId = (typeof OCCASIONS)[number]["id"];

// Display currency. USD for the international audience; swap here later if a
// locale switch is added.
export const CURRENCY = { symbol: "$", code: "USD", locale: "en-US" } as const;

export const CARD_THEMES = [
  { id: "sunrise", label: "Sunrise", from: "#ff7a5c", to: "#ffb020" },
  { id: "peach", label: "Peach", from: "#ffbe8a", to: "#ff7a5c" },
  { id: "amber", label: "Amber", from: "#f59e0b", to: "#ff7a5c" },
  { id: "coral", label: "Coral", from: "#f9603d", to: "#ffd9b8" },
] as const;

export type CardThemeId = (typeof CARD_THEMES)[number]["id"];

export const RULE_TYPES = [
  { id: "refund_if_unclaimed", label: "Auto-return if unopened" },
  { id: "unlock_on_date", label: "Unlock on a date" },
  { id: "vested", label: "Release gradually" },
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

// Source assets the sender can fund from. The Universal Accounts SDK routes and
// converts any of these into the gift escrow on Arbitrum. Balances here are
// placeholders for the demo flow; real balances come from the SDK once wired.
export const SOURCE_ASSETS = [
  { id: "usdc-base", token: "USDC", chain: "Base", balance: 320.5 },
  { id: "eth-arb", token: "ETH", chain: "Arbitrum", balance: 0.18 },
  { id: "usdc-op", token: "USDC", chain: "Optimism", balance: 75.0 },
  { id: "usdc-poly", token: "USDC", chain: "Polygon", balance: 210.0 },
] as const;

export type SourceAssetId = (typeof SOURCE_ASSETS)[number]["id"];

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
