// Presentational gift card. No on-chain logic here (see /lib).

export interface GiftCardProps {
  occasion: string;
  amountDisplay: string;
  message?: string;
  theme?: string;
}

export function GiftCard({ occasion, amountDisplay, message }: GiftCardProps) {
  return (
    <div className="w-full max-w-sm rounded-3xl bg-white/80 p-6 shadow-xl shadow-coral-200/40 ring-1 ring-coral-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
        {occasion}
      </p>
      <p className="mt-2 text-3xl font-bold text-coral-600">{amountDisplay}</p>
      {message ? (
        <p className="mt-4 text-sm text-coral-700/80">{message}</p>
      ) : null}
    </div>
  );
}
