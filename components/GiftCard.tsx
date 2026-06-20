// Presentational gift card. For the fixed occasions the background is the
// per-occasion illustration; for a custom occasion it falls back to a warm
// gradient. No on-chain logic here (see /lib).

import Image from "next/image";
import { occasionById } from "@/lib/constants";

export interface GiftCardProps {
  occasion: string;
  occasionLabel?: string;
  amountDisplay: string;
  message?: string;
  /** kept for API compatibility; visual is driven by occasion now */
  theme?: string;
  revealed?: boolean;
}

export function GiftCard({
  occasion,
  occasionLabel,
  amountDisplay,
  message,
  revealed = true,
}: GiftCardProps) {
  const o = occasionById(occasion);
  const label =
    occasion === "custom" ? occasionLabel?.trim() || "Custom" : o.label;
  const illustrated = Boolean(o.art);

  // text colors differ between illustration (light top -> dark ink) and the
  // custom gradient (white text).
  const labelCls = illustrated ? "text-ink/55" : "text-white/85";
  const forYouCls = illustrated ? "text-ink/45" : "text-white/75";
  const amountCls = illustrated ? "text-ink" : "text-white";

  return (
    <div
      className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-4xl shadow-xl shadow-coral-300/40 ring-1 ring-black/5"
      style={
        illustrated
          ? undefined
          : { background: "linear-gradient(140deg, #ff7a5c 0%, #ffb020 100%)" }
      }
    >
      {illustrated && o.art ? (
        <>
          <Image
            src={o.art}
            alt=""
            fill
            priority
            sizes="(max-width: 480px) 90vw, 360px"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/75 via-white/35 to-transparent" />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/20 blur-2xl"
        />
      )}

      <div className="relative flex h-full flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-[11px] font-bold uppercase tracking-[0.18em] ${labelCls}`}
          >
            {label}
          </span>
          <Image
            src={o.icon}
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 shrink-0 object-contain drop-shadow"
          />
        </div>
        <p className={`mt-4 text-sm font-medium ${forYouCls}`}>For you</p>
        <p
          className={`mt-0.5 text-[2.6rem] font-extrabold leading-none ${amountCls}`}
        >
          {revealed ? amountDisplay : "• • •"}
        </p>
        {message ? (
          <div className="mt-auto">
            <p
              className={`line-clamp-4 break-words rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur ${
                illustrated
                  ? "bg-white/75 text-ink/85 shadow-sm ring-1 ring-black/5"
                  : "bg-white/20 text-white ring-1 ring-white/25"
              }`}
            >
              {message}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
