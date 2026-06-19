import Link from "next/link";
import Image from "next/image";
import { Badge, PillButton } from "@/components/ui";

const STEPS = [
  { art: "/art/how-create.webp", title: "Create", desc: "Pick an amount, add a personal message" },
  { art: "/art/how-share.webp", title: "Share", desc: "Send one link — via WhatsApp, chat, anything" },
  { art: "/art/how-open.webp", title: "Open", desc: "They sign in with Google. No wallet, no app" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-10">
      {/* Hero illustration, full-bleed warm panel */}
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-4xl shadow-xl shadow-coral-300/30 ring-1 ring-black/5">
        <Image
          src="/art/hero.webp"
          alt="Two hands passing a smiling gift"
          width={1200}
          height={800}
          priority
          sizes="(max-width: 480px) 90vw, 384px"
          className="h-auto w-full"
        />
      </div>

      {/* Hero copy */}
      <div className="rise-in mt-6 flex flex-col items-center text-center">
        <Badge>
          <span aria-hidden className="text-[10px] leading-none">✨</span> No wallet needed
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

      {/* How it works */}
      <div className="stagger mt-8 grid grid-cols-3 gap-3">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            style={{ "--i": i } as React.CSSProperties}
            className="soft overflow-hidden rounded-3xl pb-4 text-center"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-t-3xl">
              <Image
                src={s.art}
                alt=""
                fill
                sizes="130px"
                className="object-cover"
              />
            </div>
            <div className="mt-2 px-2">
              <span className="block text-sm font-extrabold text-ink">
                {s.title}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-ink/50">
                {s.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <Link href="/create" className="w-full">
          <PillButton className="w-full py-4 text-base">
            Create a gift <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <Link
          href="/gifts"
          className="text-sm font-semibold text-ink/60 hover:text-ink"
        >
          My gifts
        </Link>
        <p className="text-xs text-ink/40">No seed phrase. Nothing to install.</p>
      </div>

      {/* Footer */}
      <footer className="mt-10 flex flex-col items-center gap-1 border-t border-ink/5 pt-6 text-center">
        <p className="text-xs font-semibold text-ink/30">
          Built for UXmaxx Hackathon · 2025
        </p>
        <p className="text-[11px] text-ink/20">
          Powered by Particle Network · Magic · ZeroDev · Arbitrum
        </p>
      </footer>
    </main>
  );
}
