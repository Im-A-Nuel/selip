"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GiftCard } from "@/components/GiftCard";
import { Stepper } from "@/components/Stepper";
import { Confetti } from "@/components/Confetti";
import { Badge, PillButton } from "@/components/ui";
import { ShareButton } from "@/components/ShareButton";
import {
  CARD_THEMES,
  CURRENCY,
  OCCASIONS,
  RULE_TYPES,
  type CardThemeId,
  type OccasionId,
  type RuleTypeId,
} from "@/lib/constants";

interface Draft {
  occasion: OccasionId;
  amount: string;
  message: string;
  theme: CardThemeId;
  rule: RuleTypeId;
}

const STEPS = ["Occasion", "Amount", "Message", "Theme", "Rule", "Send"];

export default function CreatePage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    occasion: "birthday",
    amount: "",
    message: "",
    theme: "sunrise",
    rule: "refund_if_unclaimed",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // draft.amount holds raw digits; format with thousands separators for display.
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
    if (step === 1 && !draft.amount.trim()) {
      setError("Enter an amount first.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: draft.occasion,
          amount_display: amountDisplay,
          message: draft.message || undefined,
          card_theme: draft.theme,
          rule_type: draft.rule,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not create the gift.");
        return;
      }
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      setClaimUrl(`${base}/g/${data.claim_slug}`);
    } catch {
      setError("Network hiccup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function copy() {
    if (!claimUrl) return;
    navigator.clipboard?.writeText(claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  if (claimUrl) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <Confetti />
        <Badge>
          <span>🎉</span> Ready to share
        </Badge>
        <div className="reveal-pop">
          <GiftCard
            occasion={draft.occasion}
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
        </div>
        <Link href="/" className="text-sm font-semibold text-coral-600">
          Create another gift
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="soft flex h-9 w-9 items-center justify-center rounded-full text-ink/60"
          aria-label="Back to home"
        >
          ←
        </Link>
        <Stepper total={STEPS.length} current={step} />
      </div>

      <div className="mb-6 flex justify-center">
        <div className="w-72">
          <GiftCard
            occasion={draft.occasion}
            amountDisplay={amountDisplay}
            message={draft.message}
            theme={draft.theme}
          />
        </div>
      </div>

      <div key={step} className="rise-in flex-1">
        {step === 0 && (
          <Field label="What's the occasion?">
            <div className="grid grid-cols-2 gap-3">
              {OCCASIONS.map((o) => (
                <Tile
                  key={o.id}
                  active={draft.occasion === o.id}
                  onClick={() => setDraft({ ...draft, occasion: o.id })}
                >
                  <span className="text-3xl">{o.emoji}</span>
                  <span className="text-sm font-semibold">{o.label}</span>
                </Tile>
              ))}
            </div>
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
          </Field>
        )}

        {step === 2 && (
          <Field label="Add a message (optional)">
            <textarea
              maxLength={280}
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              placeholder="Happy birthday! Hope your day is wonderful."
              rows={4}
              className="glass w-full resize-none rounded-2xl px-5 py-4 text-ink outline-none placeholder:text-ink/30"
            />
            <p className="mt-2 text-right text-xs text-ink/40">
              {draft.message.length}/280
            </p>
          </Field>
        )}

        {step === 3 && (
          <Field label="Pick a card theme">
            <div className="grid grid-cols-2 gap-3">
              {CARD_THEMES.map((t) => (
                <Tile
                  key={t.id}
                  active={draft.theme === t.id}
                  onClick={() => setDraft({ ...draft, theme: t.id })}
                >
                  <span
                    className="h-9 w-9 rounded-full ring-2 ring-white"
                    style={{
                      background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                    }}
                  />
                  <span className="text-sm font-semibold">{t.label}</span>
                </Tile>
              ))}
            </div>
          </Field>
        )}

        {step === 4 && (
          <Field label="Gift rule">
            <div className="flex flex-col gap-2.5">
              {RULE_TYPES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setDraft({ ...draft, rule: r.id })}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-semibold transition active:scale-[0.99] ${
                    draft.rule === r.id
                      ? "bg-ink text-white shadow-lg shadow-ink/20"
                      : "glass text-ink/80"
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
            <p className="mt-3 text-xs leading-relaxed text-ink/50">
              The rule is enforced by code, not by us. If it is never opened, the
              gift returns to you on its own.
            </p>
          </Field>
        )}

        {step === 5 && (
          <Field label="Ready to send?">
            <div className="glass flex flex-col gap-3 rounded-2xl p-5 text-sm">
              <Row k="Occasion" v={OCCASIONS.find((o) => o.id === draft.occasion)?.label ?? ""} />
              <Row k="Amount" v={amountDisplay} />
              <Row k="Theme" v={CARD_THEMES.find((t) => t.id === draft.theme)?.label ?? ""} />
              <Row k="Rule" v={RULE_TYPES.find((r) => r.id === draft.rule)?.label ?? ""} />
            </div>
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
        {step < STEPS.length - 1 ? (
          <PillButton onClick={next} className="flex-1">
            Next <span aria-hidden>→</span>
          </PillButton>
        ) : (
          <PillButton onClick={submit} disabled={submitting} className="flex-1">
            {submitting ? "Creating..." : "Create gift 🎁"}
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
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl px-4 py-5 transition active:scale-[0.98] ${
        active
          ? "bg-ink text-white shadow-lg shadow-ink/20"
          : "glass text-ink/80"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink/50">{k}</span>
      <span className="font-bold text-ink">{v}</span>
    </div>
  );
}
