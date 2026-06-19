"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PillButton } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { getSenderId, getGiftIds } from "@/lib/myGifts";
import { occasionById } from "@/lib/constants";

interface Item {
  id: string;
  claim_slug: string;
  occasion: string;
  occasion_label: string;
  amount_display: string;
  status: string;
  rule_type: string;
  protection: string;
  locked: boolean;
  thanks_message: string;
  created_at: string | null;
}

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-ink/10 text-ink/60",
  funded: "bg-amber-400/20 text-amber-600",
  claimed: "bg-green-500/15 text-green-600",
  refunded: "bg-ink/10 text-ink/60",
  expired: "bg-red-500/10 text-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  funded: "Waiting",
  claimed: "Opened",
  refunded: "Returned",
  expired: "Expired",
};

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - Date.parse(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function MyGiftsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);

  const load = useCallback(async () => {
    const senderId = getSenderId();
    const legacyIds = getGiftIds();
    if (!senderId && legacyIds.length === 0) {
      setItems([]);
      return;
    }
    try {
      const res = await fetch("/api/gifts/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: senderId || undefined,
          ids: senderId ? [] : legacyIds,
        }),
      });
      const data = await res.json();
      setItems(res.ok ? (data.items ?? []) : []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function copyLink(slug: string) {
    const url = `${window.location.origin}/g/${slug}`;
    navigator.clipboard?.writeText(url);
    toast("Link copied");
  }

  async function requestRefund(id: string) {
    setRefunding(id);
    try {
      const res = await fetch(`/api/gifts/${id}/refund`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast("Refund requested — funds return to your wallet");
        await load();
      } else {
        toast(data?.error?.message ?? "Refund failed.");
      }
    } catch {
      toast("Network hiccup.");
    } finally {
      setRefunding(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="soft flex h-9 w-9 items-center justify-center rounded-full text-ink/60"
          aria-label="Back to home"
        >
          ←
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-ink">
          My gifts
        </h1>
      </div>

      {items === null ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="shimmer h-24 rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <Image
            src="/art/mascot.webp"
            alt=""
            width={160}
            height={160}
            className="h-32 w-32 object-contain"
          />
          <h2 className="text-lg font-extrabold text-ink">No gifts yet</h2>
          <p className="max-w-xs text-sm text-ink/60">
            Create your first gift — takes about 2 minutes. You'll see all your gifts and their status here.
          </p>
          <Link href="/create" className="w-full max-w-xs">
            <PillButton className="w-full py-4">Send someone a gift →</PillButton>
          </Link>
          <p className="text-xs text-ink/35">No wallet needed on either side.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((g) => {
            const o = occasionById(g.occasion);
            const label =
              g.occasion === "custom"
                ? g.occasion_label || "Custom"
                : o.label;
            const statusLabel =
              g.locked && g.status === "funded"
                ? "Locked"
                : (STATUS_LABEL[g.status] ?? g.status);
            const canRefund =
              g.status === "funded" && g.rule_type === "refund_if_unclaimed";

            return (
              <div key={g.id} className="glass rounded-3xl p-4">
                <div className="flex items-start gap-3">
                  <Image
                    src={o.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="mt-0.5 h-10 w-10 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-ink">
                        {label}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          STATUS_STYLE[g.status] ?? "bg-ink/10 text-ink/60"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-ink">
                      {g.amount_display}
                    </span>
                    {g.created_at && g.status === "funded" && (
                      <p className="mt-0.5 text-[11px] text-ink/40">
                        Created {timeAgo(g.created_at)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => copyLink(g.claim_slug)}
                    className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm ring-1 ring-ink/5"
                  >
                    Copy link
                  </button>
                </div>

                {g.thanks_message && (
                  <p className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-sm text-ink/80 ring-1 ring-black/5">
                    💌 &ldquo;{g.thanks_message}&rdquo;
                  </p>
                )}

                {canRefund && (
                  <button
                    disabled={refunding === g.id}
                    onClick={() => requestRefund(g.id)}
                    className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {refunding === g.id ? "Requesting refund…" : "Refund — I changed my mind"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
