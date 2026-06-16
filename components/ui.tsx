// Shared UI primitives for the soft-glass theme: pill buttons, chips, badges.

import type { ButtonHTMLAttributes, ReactNode } from "react";

type PillVariant = "dark" | "light" | "ghost";

const pillBase =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100";

const pillVariants: Record<PillVariant, string> = {
  dark: "bg-ink text-white shadow-lg shadow-ink/25 hover:bg-black",
  light: "bg-white text-ink shadow-md shadow-ink/10 hover:bg-white/90",
  ghost: "bg-transparent text-ink/70 hover:text-ink",
};

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

export function PillButton({
  variant = "dark",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PillVariant;
  loading?: boolean;
}) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${pillBase} px-6 py-3.5 ${pillVariants[variant]} ${className}`}
      {...props}
    >
      <span
        className={`inline-flex items-center gap-2 ${loading ? "invisible" : ""}`}
      >
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </button>
  );
}

// Small pill, used for filter chips and selectable options.
export function Chip({
  active = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.97] ${
        active
          ? "bg-ink text-white shadow-md shadow-ink/20"
          : "bg-white/70 text-ink/70 ring-1 ring-ink/5 hover:bg-white"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Icon + label badge, like the "Smart Suggestions" pill in the reference.
export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-coral-600 ring-1 ring-coral-100 backdrop-blur ${className}`}
    >
      {children}
    </span>
  );
}
