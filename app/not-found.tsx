// Global 404.

import Link from "next/link";
import Image from "next/image";
import { PillButton } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Image
        src="/art/mascot.webp"
        alt=""
        width={200}
        height={200}
        priority
        className="rise-in h-40 w-40 object-contain"
      />
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
