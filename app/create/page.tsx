"use client";

import { useMemo, useState } from "react";
import { GiftCard } from "@/components/GiftCard";
import { Stepper } from "@/components/Stepper";
import { Confetti } from "@/components/Confetti";
import {
  CARD_THEMES,
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

const STEPS = ["Okasi", "Nominal", "Pesan", "Tema", "Aturan", "Kirim"];

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

  const amountDisplay = useMemo(
    () => (draft.amount ? `Rp ${draft.amount}` : "Rp 0"),
    [draft.amount],
  );

  function next() {
    setError(null);
    if (step === 1 && !draft.amount.trim()) {
      setError("Isi nominal dulu.");
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
        setError(data?.error?.message ?? "Gagal membuat kado.");
        return;
      }
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      setClaimUrl(`${base}/g/${data.claim_slug}`);
    } catch {
      setError("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (claimUrl) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <Confetti />
        <div className="reveal-pop">
          <GiftCard
            occasion={draft.occasion}
            amountDisplay={amountDisplay}
            message={draft.message}
            theme={draft.theme}
          />
        </div>
        <h2 className="text-2xl font-bold text-coral-600">Kado siap dibagikan</h2>
        <p className="text-sm text-coral-700/80">
          Bagikan link ini. Penerima cukup buka dan login dengan Google.
        </p>
        <div className="flex w-full items-center gap-2 rounded-xl bg-white/80 p-3 ring-1 ring-coral-100">
          <input
            readOnly
            value={claimUrl}
            className="w-full bg-transparent text-sm text-coral-700 outline-none"
          />
          <button
            onClick={() => navigator.clipboard?.writeText(claimUrl)}
            className="shrink-0 rounded-lg bg-coral-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-coral-600"
          >
            Salin
          </button>
        </div>
        <a href="/" className="text-sm text-coral-600 underline">
          Buat kado lain
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <Stepper total={STEPS.length} current={step} />

      <div className="flex justify-center">
        <GiftCard
          occasion={draft.occasion}
          amountDisplay={amountDisplay}
          message={draft.message}
          theme={draft.theme}
        />
      </div>

      <div className="flex-1">
        {step === 0 && (
          <Field label="Untuk acara apa?">
            <div className="grid grid-cols-2 gap-3">
              {OCCASIONS.map((o) => (
                <Choice
                  key={o.id}
                  active={draft.occasion === o.id}
                  onClick={() => setDraft({ ...draft, occasion: o.id })}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <span>{o.label}</span>
                </Choice>
              ))}
            </div>
          </Field>
        )}

        {step === 1 && (
          <Field label="Berapa nominalnya?">
            <input
              autoFocus
              inputMode="numeric"
              value={draft.amount}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  amount: e.target.value.replace(/[^0-9.]/g, ""),
                })
              }
              placeholder="250.000"
              className="w-full rounded-xl border border-coral-200 bg-white px-4 py-3 text-lg outline-none focus:border-coral-400"
            />
          </Field>
        )}

        {step === 2 && (
          <Field label="Tulis pesan (opsional)">
            <textarea
              maxLength={280}
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              placeholder="Selamat ya, semoga harimu menyenangkan."
              rows={4}
              className="w-full rounded-xl border border-coral-200 bg-white px-4 py-3 outline-none focus:border-coral-400"
            />
          </Field>
        )}

        {step === 3 && (
          <Field label="Pilih tema kartu">
            <div className="grid grid-cols-2 gap-3">
              {CARD_THEMES.map((t) => (
                <Choice
                  key={t.id}
                  active={draft.theme === t.id}
                  onClick={() => setDraft({ ...draft, theme: t.id })}
                >
                  <span
                    className="h-6 w-6 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                    }}
                  />
                  <span>{t.label}</span>
                </Choice>
              ))}
            </div>
          </Field>
        )}

        {step === 4 && (
          <Field label="Aturan kado">
            <div className="flex flex-col gap-3">
              {RULE_TYPES.map((r) => (
                <Choice
                  key={r.id}
                  active={draft.rule === r.id}
                  onClick={() => setDraft({ ...draft, rule: r.id })}
                  wide
                >
                  <span className="text-left text-sm">{r.label}</span>
                </Choice>
              ))}
            </div>
            <p className="mt-3 text-xs text-coral-700/70">
              Aturan dijamin oleh kode, bukan oleh kami. Kalau tidak dibuka,
              kado kembali sendiri ke kamu.
            </p>
          </Field>
        )}

        {step === 5 && (
          <Field label="Siap kirim?">
            <ul className="space-y-2 rounded-xl bg-white/70 p-4 text-sm text-coral-700 ring-1 ring-coral-100">
              <Row k="Acara" v={OCCASIONS.find((o) => o.id === draft.occasion)?.label ?? ""} />
              <Row k="Nominal" v={amountDisplay} />
              <Row k="Tema" v={CARD_THEMES.find((t) => t.id === draft.theme)?.label ?? ""} />
              <Row k="Aturan" v={RULE_TYPES.find((r) => r.id === draft.rule)?.label ?? ""} />
            </ul>
          </Field>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={back}
            className="rounded-full border border-coral-300 px-6 py-3 font-semibold text-coral-600"
          >
            Kembali
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 rounded-full bg-coral-500 px-6 py-3 font-semibold text-white hover:bg-coral-600"
          >
            Lanjut
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 rounded-full bg-coral-500 px-6 py-3 font-semibold text-white hover:bg-coral-600 disabled:opacity-60"
          >
            {submitting ? "Membuat..." : "Buat kado"}
          </button>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-coral-700">{label}</h2>
      {children}
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
  wide,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 font-medium transition ${
        wide ? "justify-start" : "flex-col justify-center"
      } ${
        active
          ? "border-coral-500 bg-coral-50 text-coral-700"
          : "border-coral-200 bg-white text-coral-600 hover:border-coral-300"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex justify-between">
      <span className="text-coral-500">{k}</span>
      <span className="font-semibold">{v}</span>
    </li>
  );
}
