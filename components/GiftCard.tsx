// Presentational gift card. No on-chain logic here (see /lib).

import { occasionById, themeById } from "@/lib/constants";

export interface GiftCardProps {
  occasion: string;
  amountDisplay: string;
  message?: string;
  theme?: string;
  revealed?: boolean;
}

export function GiftCard({
  occasion,
  amountDisplay,
  message,
  theme = "sunrise",
  revealed = true,
}: GiftCardProps) {
  const t = themeById(theme);
  const o = occasionById(occasion);
  return (
    <div
      className="w-full max-w-sm overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-coral-300/40"
      style={{
        background: `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl" role="img" aria-label={o.label}>
          {o.emoji}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
          {o.label}
        </span>
      </div>
      <p className="mt-6 text-sm text-white/80">Untukmu</p>
      <p className="mt-1 text-4xl font-bold tabular-nums">
        {revealed ? amountDisplay : "• • •"}
      </p>
      {message ? (
        <p className="mt-4 border-t border-white/25 pt-4 text-sm text-white/90">
          {message}
        </p>
      ) : null}
    </div>
  );
}
