"use client";

// Recipient-facing claim flow: closed gift -> login (Google) -> reveal + cash
// out. The actual on-chain claim (EOA->UA upgrade via 7702, cross-chain route)
// is wired in /lib during weeks 3-4; here the UI states and copy are complete
// and jargon-free, with a graceful path when SDK keys are not yet configured.

import { useState } from "react";
import { GiftCard } from "@/components/GiftCard";
import { Confetti } from "@/components/Confetti";
import { Badge, PillButton } from "@/components/ui";
import { DEST_CHAINS } from "@/lib/constants";
import { isMagicConfigured, loginWithGoogle } from "@/lib/magic";

type Phase = "closed" | "opening" | "revealed";

interface PublicView {
  occasion: string;
  amount_display: string;
  message: string;
  card_theme: string;
  status: string;
}

export function ClaimFlow({
  giftId,
  view,
}: {
  giftId: string;
  view: PublicView;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [dest, setDest] = useState<string>(DEST_CHAINS[0].id);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setNote(null);
    try {
      if (isMagicConfigured()) {
        const redirect = `${window.location.origin}${window.location.pathname}`;
        await loginWithGoogle(redirect);
        return; // browser redirects away
      }
      setPhase("opening");
      setTimeout(() => setPhase("revealed"), 1100);
      setNote("Demo mode: sign-in skipped because keys are not set yet.");
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (phase === "revealed") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <Confetti />
        <Badge>
          <span>🎉</span> Gift opened
        </Badge>
        <div className="reveal-pop">
          <GiftCard
            occasion={view.occasion}
            amountDisplay={view.amount_display}
            message={view.message}
            theme={view.card_theme}
          />
        </div>
        <h1 className="text-2xl font-extrabold text-ink">
          This gift is yours 💛
        </h1>
        <div className="glass w-full rounded-2xl p-4 text-left">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink/50">
            Where should it land?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DEST_CHAINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setDest(c.id)}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                  dest === c.id
                    ? "bg-ink text-white"
                    : "bg-white/70 text-ink/70 ring-1 ring-ink/5"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <PillButton
          className="w-full py-4 text-base"
          onClick={() =>
            setNote(
              "Cross-chain cash-out runs once the SDK is wired (week 4).",
            )
          }
        >
          Claim gift →
        </PillButton>
        {note && <p className="text-xs text-ink/50">{note}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <Badge>
        <span>🎁</span> A gift for you
      </Badge>
      <div
        className={`relative ${phase === "closed" ? "float-slow [--rot:-2deg]" : ""}`}
      >
        <div className={phase === "opening" ? "shake-anticipate" : ""}>
          <GiftCard
            occasion={view.occasion}
            amountDisplay={view.amount_display}
            message={view.message}
            theme={view.card_theme}
            revealed={false}
          />
        </div>

        {/* Wrap + ribbon overlay; lifts away when opening. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 overflow-hidden rounded-4xl ${
            phase === "opening" ? "unwrap-lift" : ""
          }`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
          {/* vertical ribbon */}
          <div
            className={`absolute inset-y-0 left-1/2 w-7 -translate-x-1/2 bg-white/40 ${
              phase === "opening" ? "ribbon-left" : ""
            }`}
          />
          {/* horizontal ribbon */}
          <div
            className={`absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 bg-white/40 ${
              phase === "opening" ? "ribbon-right" : ""
            }`}
          />
          {/* bow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
            🎀
          </div>
        </div>
      </div>
      <h1 className="max-w-xs text-[1.8rem] font-extrabold leading-tight text-ink">
        Someone slipped you a gift
      </h1>
      <p className="-mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
        Open it with your Google account. Nothing else needed, no app to
        install, no technical stuff to learn.
      </p>
      <PillButton
        disabled={busy || phase === "opening"}
        onClick={open}
        className="w-full py-4 text-base"
      >
        {phase === "opening"
          ? "Opening..."
          : busy
            ? "Connecting..."
            : "Open gift with Google"}
      </PillButton>
      {note && <p className="text-xs text-ink/50">{note}</p>}
      <span className="hidden" data-gift-id={giftId} />
    </main>
  );
}
