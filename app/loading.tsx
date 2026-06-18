// Global route loading fallback.

import Image from "next/image";

export default function Loading() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Image
        src="/art/loading.webp"
        alt=""
        width={140}
        height={140}
        priority
        className="float-slow h-28 w-28 object-contain"
      />
      <p className="text-sm font-medium text-ink/50">One moment...</p>
    </main>
  );
}
