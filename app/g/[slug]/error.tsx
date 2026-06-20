"use client";

// Error boundary for the gift claim page. Catches runtime errors (DB timeout,
// bad JSON, etc.) and shows a friendly recovery screen instead of a blank page.

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PillButton } from "@/components/ui";

export default function GiftError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[gift-error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <Image
        src="/art/state-error.webp"
        alt=""
        width={200}
        height={200}
        priority
        className="rise-in h-36 w-36 object-contain"
      />
      <h1 className="text-2xl font-extrabold text-ink">Something went wrong</h1>
      <p className="max-w-xs text-sm text-ink/60">
        We couldn't load this gift right now. The link is still valid. Try again in a moment.
      </p>
      <div className="flex gap-3">
        <PillButton onClick={reset} className="px-6 py-3">
          Try again
        </PillButton>
        <Link href="/">
          <PillButton variant="light" className="px-6 py-3">
            Home
          </PillButton>
        </Link>
      </div>
    </main>
  );
}
