export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-5xl" role="img" aria-label="gift">
        🎁
      </span>
      <h1 className="text-4xl font-bold text-coral-600">Selip</h1>
      <p className="text-lg text-coral-700">
        Slip someone a gift. No wallet needed.
      </p>
      <p className="max-w-md text-sm text-coral-700/80">
        Buat kado, danai dari aset apa pun, bagikan satu link. Penerima cukup
        login dengan Google dan hadiahnya langsung ada.
      </p>
      <a
        href="/create"
        className="rounded-full bg-coral-500 px-8 py-3 font-semibold text-white shadow-lg shadow-coral-300/50 transition hover:bg-coral-600"
      >
        Buat kado
      </a>
    </main>
  );
}
