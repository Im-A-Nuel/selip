// Step progress indicator for the create wizard. Segments for already-reached
// steps are tappable to jump back.

export function Stepper({
  total,
  current,
  onStep,
}: {
  total: number;
  current: number;
  onStep?: (i: number) => void;
}) {
  return (
    <div
      className="flex w-full gap-1.5"
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const reached = i <= current;
        return (
          <button
            key={i}
            type="button"
            disabled={!reached || !onStep}
            onClick={() => onStep?.(i)}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < current
                ? "bg-coral-400"
                : i === current
                  ? "bg-ink"
                  : "bg-ink/10"
            } ${reached && onStep ? "cursor-pointer" : "cursor-default"}`}
          />
        );
      })}
    </div>
  );
}
