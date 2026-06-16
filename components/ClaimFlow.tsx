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
      setTimeout(() => setPhase("revealed"), 900);
      setNote("Mode demo: login dilewati karena kunci belum diatur.");
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
          <span>🎉</span> Hadiah terbuka
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
          Hadiahnya buat kamu 💛
        </h1>
        <div className="glass w-full rounded-2xl p-4 text-left">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink/50">
            Mau diterima ke mana?
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
              "Pencairan lintas chain dijalankan saat SDK dihubungkan (minggu 4).",
            )
          }
        >
          Terima hadiah →
        </PillButton>
        {note && <p className="text-xs text-ink/50">{note}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <Badge>
        <span>🎁</span> Ada kado untukmu
      </Badge>
      <div
        className={phase === "opening" ? "animate-pulse" : "float-slow [--rot:-2deg]"}
      >
        <GiftCard
          occasion={view.occasion}
          amountDisplay={view.amount_display}
          message={view.message}
          theme={view.card_theme}
          revealed={false}
        />
      </div>
      <h1 className="max-w-xs text-[1.8rem] font-extrabold leading-tight text-ink">
        Seseorang menyelipkan hadiah
      </h1>
      <p className="-mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
        Buka dengan akun Google kamu. Tidak perlu apa pun yang lain, tidak perlu
        aplikasi, tidak perlu tahu soal teknisnya.
      </p>
      <PillButton
        disabled={busy || phase === "opening"}
        onClick={open}
        className="w-full py-4 text-base"
      >
        {phase === "opening"
          ? "Membuka..."
          : busy
            ? "Menghubungkan..."
            : "Buka kado dengan Google"}
      </PillButton>
      {note && <p className="text-xs text-ink/50">{note}</p>}
      <span className="hidden" data-gift-id={giftId} />
    </main>
  );
}
