// Step progress indicator for the create wizard.

export function Stepper({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex w-full gap-2" aria-label={`Langkah ${current + 1} dari ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= current ? "bg-coral-500" : "bg-coral-100"
          }`}
        />
      ))}
    </div>
  );
}
