// Claim page skeleton while the gift slug resolves server-side.

export default function ClaimLoading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="shimmer h-7 w-36 rounded-full" />
      <div className="shimmer aspect-[3/4] w-full max-w-[280px] rounded-4xl" />
      <div className="flex flex-col items-center gap-2.5 w-full">
        <div className="shimmer h-9 w-64 rounded-2xl" />
        <div className="shimmer h-4 w-72 rounded-full" />
        <div className="shimmer h-4 w-52 rounded-full" />
      </div>
      <div className="flex w-full flex-col gap-2.5 pt-2">
        <div className="shimmer h-14 w-full rounded-full" />
        <div className="shimmer h-14 w-full rounded-full" />
        <div className="shimmer h-14 w-full rounded-full" />
      </div>
    </main>
  );
}
