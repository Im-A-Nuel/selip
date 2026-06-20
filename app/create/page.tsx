"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { GiftCard } from "@/components/GiftCard";
import { Stepper } from "@/components/Stepper";
import { Confetti } from "@/components/Confetti";
import { Chip, PillButton } from "@/components/ui";
import { ShareButton } from "@/components/ShareButton";
import { QrModal } from "@/components/QrModal";
import { AssetIcon } from "@/components/AssetIcon";
import { useToast } from "@/components/Toast";
import {
  CURRENCY,
  OCCASIONS,
  PROTECTION_OPTIONS,
  RULE_TYPES,
  SOURCE_ASSETS,
  type CardThemeId,
  type OccasionId,
  type ProtectionId,
  type RuleTypeId,
  type SourceAssetId,
} from "@/lib/constants";
import { getSenderId, rememberGiftId } from "@/lib/myGifts";

interface Draft {
  occasion: OccasionId;
  customLabel: string;
  recipientName: string;
  amount: string;
  message: string;
  theme: CardThemeId;
  rule: RuleTypeId;
  protection: ProtectionId;
  recipientEmail: string;
  pin: string;
  unlockAt: string;
}

const STEPS = ["Occasion", "Amount", "Message", "Rule", "Protect", "Fund"];
const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function CreatePage() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    occasion: "birthday",
    customLabel: "",
    recipientName: "",
    amount: "",
    message: "",
    theme: "sunrise",
    rule: "refund_if_unclaimed",
    protection: "open",
    recipientEmail: "",
    pin: "",
    unlockAt: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [claimSlug, setClaimSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);

  // Funding (demo) state
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [source, setSource] = useState<SourceAssetId | null>(null);
  const [funding, setFunding] = useState(false);

  const amountFormatted = useMemo(
    () =>
      draft.amount ? Number(draft.amount).toLocaleString(CURRENCY.locale) : "",
    [draft.amount],
  );
  const amountDisplay = useMemo(
    () =>
      draft.amount
        ? `${CURRENCY.symbol}${amountFormatted}`
        : `${CURRENCY.symbol}0`,
    [draft.amount, amountFormatted],
  );

  function next() {
    setError(null);
    if (step === 0 && draft.occasion === "custom" && !draft.customLabel.trim()) {
      setError("Name your custom occasion.");
      return;
    }
    if (step === 1) {
      const amt = Number(draft.amount);
      if (!draft.amount.trim() || !Number.isFinite(amt) || amt <= 0) {
        setError("Enter an amount greater than zero.");
        return;
      }
      if (amt > 1_000_000) {
        setError("That amount is too large.");
        return;
      }
    }
    if (step === 4) {
      if (
        draft.protection === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.recipientEmail.trim())
      ) {
        setError("Enter a valid recipient email.");
        return;
      }
      if (draft.protection === "pin" && draft.pin.trim().length < 4) {
        setError("Use a code of at least 4 characters.");
        return;
      }
    }
    setDir(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setError(null);
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }
  function goto(target: number) {
    // Only allow jumping to a step already reached.
    if (target <= step) {
      setError(null);
      setDir(target > step ? 1 : -1);
      setStep(target);
    }
  }

  function connect() {
    setConnecting(true);
    // Demo: simulate connecting the sender's account. Real path uses the
    // Universal Accounts / wallet SDK.
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      toast("Account connected");
    }, 800);
  }

  async function fund() {
    if (!source) {
      setError("Pick an asset to fund from.");
      return;
    }
    setFunding(true);
    setError(null);
    try {
      const createRes = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: draft.occasion,
          occasion_label:
            draft.occasion === "custom" ? draft.customLabel.trim() : undefined,
          amount_display: amountDisplay,
          amount_value: Number(draft.amount) || undefined,
          message: draft.message || undefined,
          card_theme: draft.theme,
          rule_type: draft.rule,
          protection: draft.protection,
          recipient_email:
            draft.protection === "email"
              ? draft.recipientEmail.trim()
              : undefined,
          pin: draft.protection === "pin" ? draft.pin.trim() : undefined,
          unlock_at: draft.unlockAt
            ? new Date(draft.unlockAt).toISOString()
            : undefined,
          sender_id: getSenderId(),
          recipient_name: draft.recipientName.trim() || undefined,
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok) {
        setError(created?.error?.message ?? "Could not create the gift.");
        return;
      }
      // Track locally so the sender's "My gifts" page can show it.
      rememberGiftId(created.id);

      const asset = SOURCE_ASSETS.find((a) => a.id === source);
      const fundRes = await fetch(`/api/gifts/${created.id}/fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_chain: asset?.chain ?? "Base",
          // Demo placeholders; real values come from the on-chain funding tx.
          smart_account_addr: "0xDEMO000000000000000000000000000000000000",
          funding_tx: "0xDEMOFUNDINGTX",
        }),
      });
      const funded = await fundRes.json();
      if (!fundRes.ok) {
        setError(funded?.error?.message ?? "Funding failed.");
        return;
      }

      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      setClaimSlug(created.claim_slug);
      setClaimUrl(`${base}/g/${created.claim_slug}`);
      toast("Gift funded 🎁");
    } catch {
      setError("Network hiccup. Please try again.");
    } finally {
      setFunding(false);
    }
  }

  function copy() {
    if (!claimUrl) return;
    navigator.clipboard?.writeText(claimUrl);
    setCopied(true);
    toast("Link copied");
    setTimeout(() => setCopied(false), 1600);
  }

  if (claimUrl) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <Confetti />
        <Image
          src="/art/success.webp"
          alt=""
          width={150}
          height={150}
          priority
          className="reveal-pop -mb-2 h-24 w-24 object-contain"
        />
        <div className="reveal-pop">
          <GiftCard
            occasion={draft.occasion}
            occasionLabel={draft.customLabel}
            amountDisplay={amountDisplay}
            message={draft.message}
            theme={draft.theme}
          />
        </div>
        <h2 className="text-2xl font-extrabold text-ink">Your gift is ready</h2>
        <p className="-mt-3 text-sm text-ink/60">
          Share this link. The recipient just opens it and signs in with Google.
        </p>
        <div className="flex w-full flex-col gap-3">
          <ShareButton url={claimUrl} />
          {/* WhatsApp deep link */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              draft.recipientName.trim()
                ? `Hey ${draft.recipientName.trim()}! 🎁 I slipped you a ${amountDisplay} gift. Open it here (no wallet needed): ${claimUrl}`
                : `🎁 I slipped you a gift! Open it here. No wallet, no app needed: ${claimUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-[15px] font-semibold text-white shadow-md shadow-green-400/25 transition-[transform,opacity] hover:-translate-y-0.5 hover:opacity-90 active:scale-[0.97]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.101 1.523 5.824L0 24l6.327-1.501A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.368l-.359-.213-3.722.883.935-3.613-.234-.372A9.764 9.764 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/></svg>
            Share on WhatsApp
          </a>
          <div className="glass flex w-full items-center gap-2 rounded-2xl p-2 pl-4">
            <input
              readOnly
              value={claimUrl}
              className="w-full bg-transparent text-sm text-ink/70 outline-none"
            />
            <PillButton
              variant="light"
              onClick={copy}
              className="shrink-0 px-4 py-2.5 text-sm"
            >
              {copied ? "Copied ✓" : "Copy"}
            </PillButton>
          </div>
          <button
            onClick={() => setShowQr(true)}
            className="text-sm font-semibold text-coral-600 hover:text-coral-700"
          >
            Show QR code
          </button>
        </div>

        {showQr && (
          <QrModal value={claimUrl} onClose={() => setShowQr(false)} />
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold">
          {claimSlug && (
            <button
              onClick={() => window.open(`/g/${claimSlug}`, "_blank")}
              className="text-coral-600"
            >
              Preview as recipient →
            </button>
          )}
          <a href="/create" className="text-ink/60">Create another</a>
          <Link href="/gifts" className="text-ink/60">My gifts</Link>
        </div>
      </main>
    );
  }

  const onFundStep = step === STEPS.length - 1;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-10">
      <div className="mb-6 flex items-center gap-3">
        {step === 0 ? (
          <Link
            href="/"
            className="soft flex h-9 w-9 items-center justify-center rounded-full text-ink/60"
            aria-label="Back to home"
          >
            ←
          </Link>
        ) : (
          <button
            onClick={back}
            className="soft flex h-9 w-9 items-center justify-center rounded-full text-ink/60"
            aria-label="Back"
          >
            ←
          </button>
        )}
        <Stepper total={STEPS.length} current={step} onStep={goto} />
      </div>

      <div className="mb-6 flex justify-center">
        <div className="w-72">
          <GiftCard
            occasion={draft.occasion}
            occasionLabel={draft.customLabel}
            amountDisplay={amountDisplay}
            message={draft.message}
            theme={draft.theme}
          />
        </div>
      </div>

      <div key={step} className={`flex-1 ${dir === 1 ? "step-fwd" : "step-back"}`}>
        {step === 0 && (
          <Field label="What's the occasion?">
            <div className="stagger grid grid-cols-2 gap-3">
              {OCCASIONS.map((o, i) => (
                <Tile
                  key={o.id}
                  index={i}
                  active={draft.occasion === o.id}
                  onClick={() => setDraft({ ...draft, occasion: o.id })}
                  className={o.id === "custom" ? "col-span-2 flex-row" : ""}
                >
                  <Image
                    src={o.icon}
                    alt=""
                    width={48}
                    height={48}
                    className="h-11 w-11 object-contain"
                  />
                  <span className="text-sm font-semibold">{o.label}</span>
                </Tile>
              ))}
            </div>
            {draft.occasion === "custom" && (
              <div className="glass rise-in flex items-center rounded-2xl px-4 py-3">
                <input
                  autoFocus
                  maxLength={40}
                  value={draft.customLabel}
                  onChange={(e) =>
                    setDraft({ ...draft, customLabel: e.target.value })
                  }
                  placeholder="e.g. Anniversary, New job, Just because"
                  className="w-full bg-transparent text-ink outline-none placeholder:text-ink/30"
                />
              </div>
            )}
          </Field>
        )}

        {step === 1 && (
          <Field label="How much?">
            <div className="glass flex items-center rounded-2xl px-5 py-4">
              <span className="text-2xl font-extrabold text-ink/40">
                {CURRENCY.symbol}
              </span>
              <input
                autoFocus
                inputMode="numeric"
                value={amountFormatted}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    amount: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="50"
                className="w-full bg-transparent px-3 text-2xl font-extrabold text-ink outline-none placeholder:text-ink/25"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <Chip
                  key={a}
                  active={draft.amount === String(a)}
                  onClick={() => setDraft({ ...draft, amount: String(a) })}
                >
                  {CURRENCY.symbol}
                  {a}
                </Chip>
              ))}
            </div>
          </Field>
        )}

        {step === 2 && (
          <Field label="Personal touch">
            <div className="glass flex items-center gap-2 rounded-2xl px-4 py-3">
              <span className="shrink-0 text-sm font-semibold text-ink/40">To:</span>
              <input
                autoFocus
                maxLength={40}
                value={draft.recipientName}
                onChange={(e) => setDraft({ ...draft, recipientName: e.target.value })}
                placeholder="Recipient's name (optional)"
                className="w-full bg-transparent text-ink outline-none placeholder:text-ink/30"
              />
            </div>
            <textarea
              maxLength={280}
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              placeholder="Happy birthday! Hope your day is wonderful."
              rows={3}
              className="glass w-full resize-none rounded-2xl px-5 py-4 text-ink outline-none placeholder:text-ink/30"
            />
            <p className="-mt-1 text-right text-xs text-ink/40">
              {draft.message.length}/280
            </p>
          </Field>
        )}

        {step === 3 && (
          <Field label="Gift rule">
            <div className="flex flex-col gap-2.5">
              {RULE_TYPES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setDraft({ ...draft, rule: r.id })}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-semibold transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.98] ${
                    draft.rule === r.id
                      ? "bg-ink text-white shadow-lg shadow-ink/20"
                      : "glass text-ink/80 hover:-translate-y-0.5"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      draft.rule === r.id
                        ? "bg-white text-ink"
                        : "ring-2 ring-ink/15"
                    }`}
                  >
                    {draft.rule === r.id ? "✓" : ""}
                  </span>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/55 p-3 ring-1 ring-black/5">
              <Image
                src="/art/trust.webp"
                alt=""
                width={44}
                height={44}
                className="shrink-0"
              />
              <p className="text-xs leading-relaxed text-ink/60">
                Enforced by code, not by us. If it is never opened, the gift
                returns to you on its own.
              </p>
            </div>
          </Field>
        )}

        {step === 4 && (
          <Field label="Who can open it?">
            <div className="flex flex-col gap-2.5">
              {PROTECTION_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDraft({ ...draft, protection: p.id })}
                  className={`flex items-center gap-3 overflow-visible rounded-2xl px-4 py-3 text-left transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.98] ${
                    draft.protection === p.id
                      ? "bg-ink text-white shadow-lg shadow-ink/20"
                      : "glass text-ink/80 hover:-translate-y-0.5"
                  }`}
                >
                  <Image
                    src={p.icon}
                    alt=""
                    width={88}
                    height={88}
                    className="-my-5 h-20 w-20 shrink-0 object-contain drop-shadow-sm"
                  />
                  <span>
                    <span className="block text-sm font-bold">{p.label}</span>
                    <span
                      className={`block text-xs leading-snug ${
                        draft.protection === p.id ? "text-white/70" : "text-ink/50"
                      }`}
                    >
                      {p.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {draft.protection === "email" && (
              <div className="glass rise-in flex items-center rounded-2xl px-4 py-3">
                <input
                  type="email"
                  inputMode="email"
                  value={draft.recipientEmail}
                  onChange={(e) =>
                    setDraft({ ...draft, recipientEmail: e.target.value })
                  }
                  placeholder="recipient@email.com"
                  className="w-full bg-transparent text-ink outline-none placeholder:text-ink/30"
                />
              </div>
            )}
            {draft.protection === "pin" && (
              <div className="glass rise-in flex items-center rounded-2xl px-4 py-3">
                <input
                  value={draft.pin}
                  maxLength={20}
                  onChange={(e) => setDraft({ ...draft, pin: e.target.value })}
                  placeholder="Secret code (share it separately)"
                  className="w-full bg-transparent text-ink outline-none placeholder:text-ink/30"
                />
              </div>
            )}

            <label className="mt-1 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-ink/45">
                Unlock date (optional)
              </span>
              <div className="glass flex items-center rounded-2xl px-4 py-3">
                <input
                  type="datetime-local"
                  value={draft.unlockAt}
                  onChange={(e) =>
                    setDraft({ ...draft, unlockAt: e.target.value })
                  }
                  className="w-full bg-transparent text-ink outline-none"
                />
              </div>
              {draft.unlockAt && (
                <button
                  onClick={() => setDraft({ ...draft, unlockAt: "" })}
                  className="self-start text-xs font-semibold text-coral-600"
                >
                  Clear date
                </button>
              )}
            </label>
          </Field>
        )}

        {onFundStep && (
          <Field label="Fund the gift">
            <div className="glass flex items-center justify-between rounded-2xl p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Gift total
                </p>
                <p className="text-2xl font-extrabold text-ink">
                  {amountDisplay}
                </p>
              </div>
              <Image
                src={
                  OCCASIONS.find((o) => o.id === draft.occasion)?.icon ??
                  "/art/occ-custom.webp"
                }
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
            </div>

            {!connected ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm leading-relaxed text-ink/60">
                  Fund from your crypto on any chain. We route and convert it for
                  you, so the recipient never sees the complexity.
                </p>
                <PillButton onClick={connect} loading={connecting}>
                  Connect account
                </PillButton>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Fund from
                </p>
                <div className="flex flex-col gap-2">
                  {SOURCE_ASSETS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSource(a.id)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.98] ${
                        source === a.id
                          ? "bg-ink text-white shadow-lg shadow-ink/20"
                          : "glass text-ink/80 hover:-translate-y-0.5"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <AssetIcon token={a.token} chain={a.chain} />
                        <span className="text-sm font-bold">
                          {a.token}
                          <span
                            className={`ml-2 font-medium ${
                              source === a.id ? "text-white/70" : "text-ink/45"
                            }`}
                          >
                            on {a.chain}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          source === a.id ? "text-white/80" : "text-ink/50"
                        }`}
                      >
                        {a.balance} {a.token}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Field>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <PillButton variant="light" onClick={back} className="px-6">
            Back
          </PillButton>
        )}
        {!onFundStep ? (
          <PillButton onClick={next} className="flex-1">
            Next <span aria-hidden>→</span>
          </PillButton>
        ) : (
          <PillButton
            onClick={fund}
            loading={funding}
            disabled={!connected || !source}
            className="flex-1"
          >
            Fund &amp; create
          </PillButton>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold tracking-tight text-ink">{label}</h2>
      {children}
    </div>
  );
}

function Tile({
  active,
  onClick,
  index = 0,
  className = "",
  children,
}: {
  active: boolean;
  onClick: () => void;
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{ "--i": index } as React.CSSProperties}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl px-4 py-5 transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.96] ${
        active
          ? "bg-ink text-white shadow-lg shadow-ink/20"
          : "glass text-ink/80 hover:-translate-y-0.5"
      } ${className}`}
    >
      {children}
    </button>
  );
}
