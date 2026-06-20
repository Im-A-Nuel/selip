"use client";

// Recipient claim flow:
//   closed -> (login) -> (gate: pin/email) -> opening -> revealed -> thanks
//
// Real on-chain claim (EOA->UA via 7702, cross-chain route) wired in week 3-4.
// Protection gates are enforced by the claim API; demo mode exercises every gate.

import { useEffect, useState } from "react";
import Image from "next/image";
import { GiftCard } from "@/components/GiftCard";
import { Confetti } from "@/components/Confetti";
import { Badge, PillButton } from "@/components/ui";
import { BrandIcon } from "@/components/BrandIcon";
import { useToast } from "@/components/Toast";
import { DEST_CHAINS, LOGIN_METHODS } from "@/lib/constants";
import {
  getUserAddress,
  getUserEmail,
  isMagicConfigured,
  loginWithEmail,
  loginWithOAuth,
} from "@/lib/magic";

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
  expired?: boolean;
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

  // cash-out completion
  const [cashedOut, setCashedOut] = useState(false);

  // thank-you
  const [thanks, setThanks] = useState("");
  const [thanksSent, setThanksSent] = useState(false);

  // true while we resolve a returning Magic OAuth redirect on mount
  const [resolving, setResolving] = useState(false);

  // inline email-OTP login (real Magic login that needs only the publishable key)
  const [emailLoginOpen, setEmailLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");

  const name = view.recipient_name?.trim() || "";

  // After a Google/Apple OAuth round-trip, the static /auth/callback page
  // finalizes the Magic login and forwards back here with a sessionStorage flag.
  // We only continue the claim when that flag is set (not on a plain visit).
  useEffect(() => {
    if (!isMagicConfigured()) return;
    let flag: string | null = null;
    try {
      flag = sessionStorage.getItem("selip.justLoggedIn");
      if (flag) sessionStorage.removeItem("selip.justLoggedIn");
    } catch {}
    if (!flag) return;
    let cancelled = false;
    (async () => {
      setResolving(true);
      try {
        const [addr, mail] = await Promise.all([
          getUserAddress().catch(() => null),
          getUserEmail().catch(() => null),
        ]);
        if (cancelled) return;
        if (addr) setRecipientAddr(addr);
        await afterLogin(addr ?? undefined, mail ?? undefined);
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shared post-login branch.
  //  - open:  claim immediately.
  //  - email: auto-pass the gate with the verified login email; only fall back
  //           to the manual gate if that email isn't the one the gift is locked
  //           to. No second email entry in the common case.
  //  - pin:   always show the gate (the secret can't be auto-known).
  async function afterLogin(addr?: string, loginEmail?: string) {
    if (view.protection === "open") {
      const r = await doClaim(addr);
      if (!r.ok) setNote(r.error ?? "Could not open the gift.");
      return;
    }
    if (view.protection === "email" && loginEmail) {
      setEmail(loginEmail);
      const r = await doClaim(addr, loginEmail);
      if (!r.ok) setPhase("gate"); // email didn't match -> let them confirm
      return;
    }
    setPhase("gate");
  }

  async function chooseLogin(method: string) {
    setBusy(true);
    setNote(null);
    try {
      // Real email-OTP login: only needs the publishable key, no OAuth provider
      // setup. Open the inline email form; Magic shows its own code modal.
      if (isMagicConfigured() && method === "email") {
        setEmailLoginOpen(true);
        return;
      }
      if (isMagicConfigured() && (method === "google" || method === "apple")) {
        // Remember where to return; redirect to the STATIC callback path so the
        // OAuth redirect_uri is stable (registerable in Google + Magic).
        try {
          sessionStorage.setItem("selip.returnPath", window.location.pathname);
        } catch {}
        const redirect = `${window.location.origin}/auth/callback`;
        await loginWithOAuth(method, redirect);
        return;
      }
      if (!isMagicConfigured()) {
        setNote("Demo mode: sign-in is simulated because keys are not set.");
      }
      await afterLogin();
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitEmailLogin() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      setNote("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      // Magic renders its own OTP entry modal and resolves once verified.
      await loginWithEmail(loginEmail.trim());
      const addr = await getUserAddress().catch(() => null);
      if (addr) setRecipientAddr(addr);
      setEmailLoginOpen(false);
      // The verified login email auto-passes an email-locked gate.
      await afterLogin(addr ?? undefined, loginEmail.trim());
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
    const r = await doClaim();
    if (!r.ok) setGateError(r.error ?? "Could not open the gift.");
  }

  // Records the claim. Returns {ok,error}; the caller decides how to surface a
  // failure (gate error, auto-fallback to the gate, or a top-level note).
  async function doClaim(
    addrOverride?: string,
    emailOverride?: string,
  ): Promise<{ ok: boolean; error?: string }> {
    setBusy(true);
    try {
      const res = await fetch(`/api/gifts/${giftId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_addr: addrOverride || recipientAddr || "0xDEMORECIPIENT",
          dest_chain: dest,
          claim_tx: "0xDEMOCLAIMTX",
          pin: view.protection === "pin" ? pin.trim() : undefined,
          recipient_email:
            view.protection === "email"
              ? emailOverride || email.trim()
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data?.error?.message ?? "Could not open the gift." };
      }
      setPhase("opening");
      setTimeout(() => setPhase("revealed"), 1000);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network hiccup. Please try again." };
    } finally {
      setBusy(false);
    }
  }

  // Finalize the cash-out to the chosen chain. The claim itself is already
  // recorded (doClaim ran before this screen); here the recipient confirms the
  // landing chain + wallet. Live cross-chain settlement is routed by the
  // Particle Universal Accounts SDK; in demo mode this completes the flow.
  function cashOut() {
    if (!recipientAddr) {
      toast("Sign in first so we have your wallet address.");
      return;
    }
    setCashedOut(true);
    toast("On its way to your wallet 🎉");
  }

  // Safety net: if the embedded wallet address didn't land during login, fetch
  // it once we reach the reveal screen so the field is never empty.
  useEffect(() => {
    if (phase !== "revealed" || recipientAddr || !isMagicConfigured()) return;
    let cancelled = false;
    getUserAddress()
      .then((a) => {
        if (!cancelled && a) setRecipientAddr(a);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [phase, recipientAddr]);

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

  // ---- Resolving a returning OAuth redirect ----
  if (resolving && phase === "closed") {
    return (
      <Screen>
        <Image src="/art/mascot.webp" alt="" width={140} height={140} priority className="float-slow h-28 w-28 object-contain" />
        <p className="text-sm font-semibold text-ink/50">
          Signing you in<span className="animate-pulse">…</span>
        </p>
      </Screen>
    );
  }

  // ---- Expired (past refund deadline, unclaimed) ----
  if (view.expired) {
    return (
      <Screen>
        <Image src="/art/state-expired.webp" alt="" width={200} height={200} priority className="rise-in h-40 w-40 object-contain" />
        <h1 className="text-2xl font-extrabold text-ink">This gift expired</h1>
        <p className="max-w-sm text-sm text-ink/60">
          It was not opened in time, so it is on its way back to the sender.
        </p>
      </Screen>
    );
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

        {cashedOut ? (
          <div className="glass w-full rounded-2xl p-5 text-center">
            <p className="text-3xl" aria-hidden>🎉</p>
            <p className="mt-1 text-base font-extrabold text-ink">
              {view.amount_display} is on its way
            </p>
            <p className="mt-0.5 text-sm text-ink/60">
              Landing in your Selip wallet on{" "}
              {DEST_CHAINS.find((c) => c.id === dest)?.label}.
            </p>
            {recipientAddr && (
              <p className="mt-2 break-all rounded-xl bg-white/70 px-3 py-2 font-mono text-[11px] text-ink/60 ring-1 ring-ink/5">
                {recipientAddr}
              </p>
            )}
            <p className="mt-2 text-[11px] text-ink/40">
              Cross-chain routing handled for you by Particle Universal Accounts.
            </p>
          </div>
        ) : (
          <>
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
              <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-ink/50">Your Selip wallet</label>
              <div className="mt-2 flex items-center rounded-xl bg-white/70 px-3 py-2.5 ring-1 ring-ink/5">
                <input
                  value={recipientAddr}
                  onChange={(e) => setRecipientAddr(e.target.value)}
                  placeholder="0x… (created for you at sign-in)"
                  spellCheck={false}
                  className="w-full bg-transparent font-mono text-xs text-ink outline-none placeholder:text-ink/30"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-ink/40">
                {recipientAddr
                  ? "This wallet was created for you automatically. Or paste another address to receive it there."
                  : "Your wallet fills in automatically after sign-in. You can also paste one."}
              </p>
            </div>

            <PillButton
              className="w-full py-4 text-base"
              loading={busy}
              onClick={cashOut}
            >
              Claim to {DEST_CHAINS.find((c) => c.id === dest)?.label} →
            </PillButton>
          </>
        )}

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
              Someone slipped you a gift. Open it by signing in. No wallet, nothing to install.
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

      {emailLoginOpen ? (
        <div className="flex w-full flex-col gap-2.5">
          <div className="glass flex w-full items-center rounded-2xl px-4 py-3">
            <input
              autoFocus
              type="email"
              inputMode="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitEmailLogin();
              }}
              placeholder="your@email.com"
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink/30"
            />
          </div>
          <PillButton
            loading={busy}
            onClick={submitEmailLogin}
            className="w-full py-3.5 text-[15px]"
          >
            Email me a code
          </PillButton>
          <button
            onClick={() => {
              setEmailLoginOpen(false);
              setNote(null);
            }}
            className="text-xs font-semibold text-ink/50 hover:text-ink"
          >
            ← Other ways to sign in
          </button>
        </div>
      ) : (
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
      )}
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
