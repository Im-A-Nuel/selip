"use client";

// Recipient-facing claim flow: closed gift -> login (Google) -> reveal + cash
// out. The actual on-chain claim (EOA->UA upgrade via 7702, cross-chain route)
// is wired in /lib during weeks 3-4; here the UI states and copy are complete
// and jargon-free, with a graceful path when SDK keys are not yet configured.

import { useState } from "react";
import { GiftCard } from "@/components/GiftCard";
import { Confetti } from "@/components/Confetti";
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
  const [dest, setDest] = useState(DEST_CHAINS[0].id);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setNote(null);
    try {
      if (isMagicConfigured()) {
        // Real path: Google login, then return here to finish the claim.
        const redirect = `${window.location.origin}${window.location.pathname}`;
        await loginWithGoogle(redirect);
        return; // browser redirects away
      }
      // Demo path (no keys yet): play the reveal so the flow is testable.
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
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <Confetti />
        <div className="reveal-pop">
          <GiftCard
            occasion={view.occasion}
            amountDisplay={view.amount_display}
            message={view.message}
            theme={view.card_theme}
          />
        </div>
        <h1 className="text-2xl font-bold text-coral-600">Hadiahnya buat kamu</h1>
        <div className="w-full">
          <label className="mb-2 block text-sm text-coral-700/80">
            Mau diterima ke mana?
          </label>
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="w-full rounded-xl border border-coral-200 bg-white px-4 py-3 outline-none focus:border-coral-400"
          >
            {DEST_CHAINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="w-full rounded-full bg-coral-500 px-6 py-3 font-semibold text-white hover:bg-coral-600"
          onClick={() =>
            setNote(
              "Pencairan lintas chain dijalankan saat SDK dihubungkan (minggu 4).",
            )
          }
        >
          Terima hadiah
        </button>
        {note && <p className="text-xs text-coral-700/70">{note}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className={phase === "opening" ? "animate-pulse" : ""}>
        <GiftCard
          occasion={view.occasion}
          amountDisplay={view.amount_display}
          message={view.message}
          theme={view.card_theme}
          revealed={false}
        />
      </div>
      <h1 className="text-2xl font-bold text-coral-600">Ada kado untukmu</h1>
      <p className="max-w-sm text-sm text-coral-700/80">
        Buka dengan akun Google kamu. Tidak perlu apa pun yang lain, tidak perlu
        aplikasi, tidak perlu tahu soal teknisnya.
      </p>
      <button
        disabled={busy || phase === "opening"}
        onClick={open}
        className="w-full rounded-full bg-coral-500 px-6 py-3 font-semibold text-white hover:bg-coral-600 disabled:opacity-60"
      >
        {phase === "opening"
          ? "Membuka..."
          : busy
            ? "Menghubungkan..."
            : "Buka kado dengan Google"}
      </button>
      {note && <p className="text-xs text-coral-700/70">{note}</p>}
      {/* giftId reserved for the claim POST once on-chain transfer lands */}
      <span className="hidden" data-gift-id={giftId} />
    </main>
  );
}
