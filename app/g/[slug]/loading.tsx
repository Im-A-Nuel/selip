// Claim page skeleton while the slug resolves.

export default function ClaimLoading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="shimmer h-7 w-40 rounded-full" />
      <div className="shimmer aspect-[5/6] w-72 rounded-4xl" />
      <div className="shimmer h-7 w-56 rounded-full" />
      <div className="shimmer h-14 w-full rounded-full" />
    </main>
  );
}
