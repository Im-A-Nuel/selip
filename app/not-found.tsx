// Global 404.

import Link from "next/link";
import { PillButton } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">🧭</span>
      <h1 className="text-2xl font-extrabold text-ink">Page not found</h1>
      <p className="text-sm text-ink/60">
        The link may be mistyped or the page has moved.
      </p>
      <Link href="/" className="mt-2">
        <PillButton>Go home</PillButton>
      </Link>
    </main>
  );
}
