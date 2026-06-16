// Claim page skeleton while the slug resolves.

export default function ClaimLoading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="h-7 w-40 animate-pulse rounded-full bg-white/60" />
      <div className="aspect-[5/6] w-72 animate-pulse rounded-4xl bg-white/55" />
      <div className="h-7 w-56 animate-pulse rounded-full bg-white/60" />
      <div className="h-14 w-full animate-pulse rounded-full bg-white/60" />
    </main>
  );
}
