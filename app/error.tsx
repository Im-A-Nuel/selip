"use client";

// Global error boundary.

import Image from "next/image";
import { PillButton } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Image
        src="/art/state-error.webp"
        alt=""
        width={200}
        height={200}
        priority
        className="rise-in h-40 w-40 object-contain"
      />
      <h1 className="text-2xl font-extrabold text-ink">Something hiccupped</h1>
      <p className="text-sm text-ink/60">
        Sorry, an error occurred. Please try again.
      </p>
      <PillButton onClick={reset} className="mt-2">
        Try again
      </PillButton>
    </main>
  );
}
