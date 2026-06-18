// Presentational gift card. The background is the per-occasion illustration;
// text overlays the clean top area. No on-chain logic here (see /lib).

import Image from "next/image";
import { occasionById } from "@/lib/constants";

export interface GiftCardProps {
  occasion: string;
  amountDisplay: string;
  message?: string;
  /** kept for API compatibility; visual is driven by occasion art now */
  theme?: string;
  revealed?: boolean;
}

export function GiftCard({
  occasion,
  amountDisplay,
  message,
  revealed = true,
}: GiftCardProps) {
  const o = occasionById(occasion);
  return (
    <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-4xl shadow-xl shadow-coral-300/40 ring-1 ring-black/5">
      <Image
        src={o.art}
        alt=""
        fill
        priority
        sizes="(max-width: 480px) 90vw, 360px"
        className="object-cover"
      />
      {/* top scrim keeps text crisp over the illustration */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/75 via-white/35 to-transparent" />

      <div className="relative flex h-full flex-col p-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
            {o.label}
          </span>
          <span className="text-xl drop-shadow-sm" aria-hidden>
            {o.emoji}
          </span>
        </div>
        <p className="mt-4 text-sm font-medium text-ink/45">For you</p>
        <p className="mt-0.5 text-[2.6rem] font-extrabold leading-none text-ink">
          {revealed ? amountDisplay : "• • •"}
        </p>
        {message ? (
          <div className="mt-auto">
            <p className="rounded-2xl bg-white/75 px-4 py-3 text-sm leading-relaxed text-ink/85 shadow-sm ring-1 ring-black/5 backdrop-blur">
              {message}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
