"use client";

// "My gifts" dashboard. Resolves the ids this device created (localStorage) to
// their current status. No sender auth yet; this is a local convenience view.

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
  protection: string;
  locked: boolean;
  thanks_message: string;
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

export default function MyGiftsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null);

  const load = useCallback(async () => {
    const senderId = getSenderId();
    // Fallback: legacy ids stored before sender_id system existed.
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
            <div key={i} className="shimmer h-20 rounded-3xl" />
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
            Gifts you create on this device show up here so you can track them.
          </p>
          <Link href="/create">
            <PillButton>Create a gift</PillButton>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((g) => {
            const o = occasionById(g.occasion);
            const label =
              g.occasion === "custom"
                ? g.occasion_label || "Custom"
                : o.label;
            return (
              <div key={g.id} className="glass rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={o.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-ink">
                        {label}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          STATUS_STYLE[g.status] ?? "bg-ink/10 text-ink/60"
                        }`}
                      >
                        {g.locked && g.status === "funded"
                          ? "Locked"
                          : (STATUS_LABEL[g.status] ?? g.status)}
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-ink">
                      {g.amount_display}
                    </span>
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
                    💌 “{g.thanks_message}”
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
