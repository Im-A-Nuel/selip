"use client";

// Global error boundary.

import { PillButton } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">😵‍💫</span>
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
