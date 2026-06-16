import Link from "next/link";
import { Badge, PillButton } from "@/components/ui";
import { GiftCard } from "@/components/GiftCard";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-14">
      {/* Floating preview cluster */}
      <div className="relative mb-2 h-64">
        <div className="absolute left-1/2 top-2 w-72 -translate-x-1/2">
          <div className="float-slow [--rot:-5deg]">
            <GiftCard
              occasion="birthday"
              amountDisplay="$50"
              message="Happy birthday! Hope your day is wonderful."
              theme="sunrise"
            />
          </div>
        </div>
        <div className="absolute right-2 top-0 soft float-slow flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-coral-600 [--rot:4deg]">
          <span>🎉</span> Gift received
        </div>
        <div className="absolute left-1 top-44 soft float-slow flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-ink/70 [--rot:-3deg]">
          <span className="text-base">🔗</span> Just one link
        </div>
      </div>

      {/* Hero copy */}
      <div className="rise-in mt-4 flex flex-col items-center text-center">
        <Badge>
          <span>✨</span> No wallet needed
        </Badge>
        <h1 className="mt-5 text-[2.7rem] font-extrabold leading-[1.05] tracking-tight text-ink">
          Give a gift,
          <br />
          <span className="bg-gradient-to-r from-coral-500 to-amber-500 bg-clip-text text-transparent">
            as easy as a text.
          </span>
        </h1>
        <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink/60">
          Create a gift, fund it from any asset, and share one link. The
          recipient just signs in with Google and the gift is there.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-auto flex flex-col items-center gap-3 pt-10">
        <Link href="/create" className="w-full">
          <PillButton className="w-full py-4 text-base">
            Create a gift <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <p className="text-xs text-ink/40">
          No seed phrase. Nothing to install.
        </p>
      </div>
    </main>
  );
}
