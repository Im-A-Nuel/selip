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
      className="relative w-full max-w-sm overflow-hidden rounded-4xl p-7 text-white transition-[box-shadow] duration-500"
      style={{
        background: `linear-gradient(140deg, ${t.from} 0%, ${t.to} 100%)`,
        boxShadow: `0 24px 60px -20px ${t.from}aa, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }}
    >
      {/* glossy sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"
      />
      {/* occasion watermark pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-6 -left-3 select-none text-[7rem] leading-none opacity-10"
      >
        {o.emoji}
      </div>
      {/* dotted texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      {/* stamp corner */}
      <div className="absolute right-5 top-5 flex h-12 w-12 rotate-6 items-center justify-center rounded-2xl bg-white/20 text-2xl ring-1 ring-white/40 backdrop-blur">
        {o.emoji}
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-white/85">
        {o.label}
      </span>
      <p className="mt-10 text-sm font-medium text-white/80">For you</p>
      <p className="mt-1 text-[2.6rem] font-extrabold leading-none tabular-nums drop-shadow-sm">
        {revealed ? amountDisplay : "• • •"}
      </p>
      {message ? (
        <p className="mt-5 border-t border-white/25 pt-4 text-sm leading-relaxed text-white/90">
          {message}
        </p>
      ) : (
        <div className="mt-5 border-t border-white/25 pt-4 text-sm text-white/70">
          Selip
        </div>
      )}
    </div>
  );
}
