// Global route loading fallback.

export default function Loading() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-coral-200 border-t-coral-500" />
      <p className="text-sm font-medium text-ink/50">Sebentar ya...</p>
    </main>
  );
}
