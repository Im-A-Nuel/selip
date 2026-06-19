"use client";

// Recipient claim flow:
//   closed -> (login) -> (gate: pin/email) -> opening -> revealed -> thanks
//
// Real on-chain claim (EOA->UA via 7702, cross-chain route) wired in week 3-4.
// Protection gates are enforced by the claim API; demo mode exercises every gate.

import { useState } from "react";
import Image from "next/image";
import { GiftCard } from "@/components/GiftCard";
import { Confetti } from "@/components/Confetti";
import { Badge, PillButton } from "@/components/ui";
import { BrandIcon } from "@/components/BrandIcon";
import { useToast } from "@/components/Toast";
import { DEST_CHAINS, LOGIN_METHODS } from "@/lib/constants";
import { isMagicConfigured, loginWithOAuth } from "@/lib/magic";

type Phase = "closed" | "gate" | "opening" | "revealed";

interface PublicView {
  occasion: string;
  occasion_label?: string;
  amount_display: string;
  message: string;
  card_theme: string;
  status: string;
  protection: "open" | "email" | "pin";
  unlock_at: string | null;
  locked: boolean;
  recipient_name?: string;
}

function formatUnlock(iso: string | null): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ClaimFlow({ giftId, view }: { giftId: string; view: PublicView }) {
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>("closed");
  const [dest, setDest] = useState<string>(DEST_CHAINS[0].id);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // gate inputs
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);

  // cash-out destination
  const [recipientAddr, setRecipientAddr] = useState("");

  // thank-you
  const [thanks, setThanks] = useState("");
  const [thanksSent, setThanksSent] = useState(false);

  const name = view.recipient_name?.trim() || "";

  async function chooseLogin(method: string) {
    setBusy(true);
    setNote(null);
    try {
      if (isMagicConfigured() && (method === "google" || method === "apple")) {
        const redirect = `${window.location.origin}${window.location.pathname}`;
        await loginWithOAuth(method, redirect);
        return;
      }
      if (!isMagicConfigured()) {
        setNote("Demo mode: sign-in is simulated because keys are not set.");
      }
      if (view.protection === "open") {
        await doClaim();
      } else {
        setPhase("gate");
      }
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitGate() {
    setGateError(null);
    if (view.protection === "pin" && pin.trim().length === 0) {
      setGateError("Enter the secret code.");
      return;
    }
    if (
      view.protection === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setGateError("Enter the email this gift was sent to.");
      return;
    }
    await doClaim();
  }

  async function doClaim() {
    setBusy(true);
    setGateError(null);
    try {
      const res = await fetch(`/api/gifts/${giftId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_addr: recipientAddr || "0xDEMORECIPIENT",
          dest_chain: dest,
          claim_tx: "0xDEMOCLAIMTX",
          pin: view.protection === "pin" ? pin.trim() : undefined,
          recipient_email: view.protection === "email" ? email.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message ?? "Could not open the gift.";
        if (phase === "gate") setGateError(msg);
        else setNote(msg);
        return;
      }
      setPhase("opening");
      setTimeout(() => setPhase("revealed"), 1000);
    } catch {
      const msg = "Network hiccup. Please try again.";
      if (phase === "gate") setGateError(msg);
      else setNote(msg);
    } finally {
      setBusy(false);
    }
  }

  async function sendThanks() {
    if (thanks.trim().length === 0) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/gifts/${giftId}/thanks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: thanks.trim() }),
      });
      if (res.ok) {
        setThanksSent(true);
        toast("Thank-you sent 💛");
      } else {
        toast("Could not send. Try again.");
      }
    } catch {
      toast("Network hiccup.");
    } finally {
      setBusy(false);
    }
  }

  // ---- Time-locked ----
  if (view.locked) {
    return (
      <Screen>
        <Image src="/art/state-expired.webp" alt="" width={200} height={200} priority className="rise-in h-40 w-40 object-contain" />
        <h1 className="text-2xl font-extrabold text-ink">Not yet</h1>
        <p className="max-w-sm text-sm text-ink/60">
          This gift unlocks on{" "}
          <span className="font-semibold text-ink">{formatUnlock(view.unlock_at)}</span>. Come back then.
        </p>
      </Screen>
    );
  }

  // ---- Opening: 3D flip animation ----
  if (phase === "opening") {
    return (
      <Screen>
        <div className="card-flip w-full max-w-[280px]">
          <GiftCard
            occasion={view.occasion}
            occasionLabel={view.occasion_label}
            amountDisplay={view.amount_display}
            message={view.message}
            theme={view.card_theme}
            revealed={false}
          />
        </div>
        <p className="text-sm font-semibold text-ink/50">
          Opening your gift<span className="animate-pulse">…</span>
        </p>
      </Screen>
    );
  }

  // ---- Revealed ----
  if (phase === "revealed") {
    return (
      <Screen>
        <Confetti />
        <Image src="/art/reveal.webp" alt="" width={160} height={160} priority className="reveal-pop -mb-2 h-28 w-28 object-contain" />
        <div className="reveal-pop w-full max-w-[280px]">
          <GiftCard
            occasion={view.occasion}
            occasionLabel={view.occasion_label}
            amountDisplay={view.amount_display}
            message={view.message}
            theme={view.card_theme}
          />
        </div>
        <h1 className="text-2xl font-extrabold text-ink">This gift is yours 💛</h1>

        <div className="glass w-full rounded-2xl p-4 text-left">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink/50">Where should it land?</label>
          <div className="grid grid-cols-2 gap-2">
            {DEST_CHAINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setDest(c.id)}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.96] ${
                  dest === c.id
                    ? "bg-ink text-white shadow-md shadow-ink/20"
                    : "bg-white/70 text-ink/70 ring-1 ring-ink/5 hover:-translate-y-0.5 hover:bg-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-ink/50">Your wallet address</label>
          <div className="mt-2 flex items-center rounded-xl bg-white/70 px-3 py-2.5 ring-1 ring-ink/5">
            <input
              value={recipientAddr}
              onChange={(e) => setRecipientAddr(e.target.value)}
              placeholder="0x… (auto-filled after sign-in)"
              spellCheck={false}
              className="w-full bg-transparent font-mono text-xs text-ink outline-none placeholder:text-ink/30"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-ink/40">
            After sign-in, your address is filled automatically. Paste manually if you prefer a specific wallet.
          </p>
        </div>

        <PillButton
          className="w-full py-4 text-base"
          onClick={() => toast("Cross-chain cash-out runs once the SDK is wired (week 4)")}
        >
          Claim to {DEST_CHAINS.find((c) => c.id === dest)?.label} →
        </PillButton>

        {thanksSent ? (
          <p className="text-sm font-semibold text-coral-600">Your thank-you is on its way 💌</p>
        ) : (
          <div className="glass w-full rounded-2xl p-4 text-left">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink/50">Say thanks to the sender</label>
            <textarea
              value={thanks}
              maxLength={280}
              rows={2}
              onChange={(e) => setThanks(e.target.value)}
              placeholder="Thank you so much! 🥹"
              className="w-full resize-none rounded-xl bg-white/70 px-3 py-2.5 text-sm text-ink outline-none ring-1 ring-ink/5 placeholder:text-ink/30"
            />
            <PillButton
              variant="light"
              loading={busy}
              disabled={thanks.trim().length === 0}
              onClick={sendThanks}
              className="mt-2 w-full py-2.5 text-sm"
            >
              Send thank-you
            </PillButton>
          </div>
        )}
      </Screen>
    );
  }

  // ---- Gate ----
  if (phase === "gate") {
    return (
      <Screen>
        <Image src="/art/mascot.webp" alt="" width={160} height={160} priority className="rise-in h-28 w-28 object-contain" />
        <h1 className="text-2xl font-extrabold text-ink">
          {view.protection === "pin" ? "Enter the secret code" : "Confirm it's you"}
        </h1>
        <p className="-mt-1 max-w-sm text-sm text-ink/60">
          {view.protection === "pin"
            ? "The sender shared a code with you. Enter it to open the gift."
            : "This gift is reserved for one email address. Enter it to continue."}
        </p>
        <div className="glass flex w-full items-center rounded-2xl px-4 py-3">
          {view.protection === "pin" ? (
            <input
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Secret code"
              className="w-full bg-transparent text-center text-lg font-bold tracking-wider text-ink outline-none placeholder:text-ink/30"
            />
          ) : (
            <input
              autoFocus
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink/30"
            />
          )}
        </div>
        {gateError && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{gateError}</p>
        )}
        <PillButton loading={busy} onClick={submitGate} className="w-full py-4 text-base">
          Open gift
        </PillButton>
      </Screen>
    );
  }

  // ---- Closed: login ----
  return (
    <Screen>
      <Badge>
        <span aria-hidden className="text-[10px]">🎁</span> A gift for you
      </Badge>
      <div className="float-slow [--rot:-2deg] w-full max-w-[280px]">
        <GiftCard
          occasion={view.occasion}
          occasionLabel={view.occasion_label}
          amountDisplay={view.amount_display}
          message={view.message}
          theme={view.card_theme}
          revealed={false}
        />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        {name ? (
          <>
            <h1 className="text-[1.9rem] font-extrabold leading-tight text-ink">
              Hey {name}! 🎉
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-ink/60">
              Someone slipped you a gift. Open it by signing in — no wallet, nothing to install.
            </p>
          </>
        ) : (
          <>
            <h1 className="max-w-xs text-[1.8rem] font-extrabold leading-tight text-ink">
              Someone slipped you a gift
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-ink/60">
              Open it by signing in. Nothing to install, no wallet, no technical stuff.
            </p>
          </>
        )}
      </div>

      <div className="flex w-full flex-col gap-2.5">
        {LOGIN_METHODS.map((m) => (
          <PillButton
            key={m.id}
            variant={m.id === "google" ? "dark" : "light"}
            loading={busy}
            onClick={() => chooseLogin(m.id)}
            className="w-full py-3.5 text-[15px]"
          >
            <BrandIcon id={m.id} />
            {m.label}
          </PillButton>
        ))}
      </div>
      {note && <p className="text-xs text-ink/50">{note}</p>}
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      {children}
    </main>
  );
}
