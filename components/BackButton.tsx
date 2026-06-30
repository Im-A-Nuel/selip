"use client";

// Liquid-glass round back button with a clean stroked arrow. Renders a Link when
// given an href, otherwise a button. Clearly tappable: glass surface, ring,
// shadow, press feedback.

import Link from "next/link";

const cls =
  "glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/80 transition active:scale-90 hover:text-ink";

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function BackButton({
  href,
  onClick,
  label = "Back",
}: {
  href?: string;
  onClick?: () => void;
  label?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={cls} aria-label={label}>
        <Arrow />
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>
      <Arrow />
    </button>
  );
}
