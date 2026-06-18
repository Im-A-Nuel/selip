import Link from "next/link";
import Image from "next/image";
import { Badge, PillButton } from "@/components/ui";

const STEPS = [
  { art: "/art/how-create.webp", title: "Create", desc: "Pick an amount and a card" },
  { art: "/art/how-share.webp", title: "Share", desc: "Send one simple link" },
  { art: "/art/how-open.webp", title: "Open", desc: "They sign in with Google" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-10">
      {/* Hero illustration */}
      <div className="relative mx-auto w-full max-w-sm">
        <div className="float-slow">
          <Image
            src="/art/hero.webp"
            alt="Two hands passing a smiling gift"
            width={1200}
            height={500}
            priority
            sizes="(max-width: 480px) 90vw, 384px"
            className="h-auto w-full"
          />
        </div>
      </div>

      {/* Hero copy */}
      <div className="rise-in -mt-2 flex flex-col items-center text-center">
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

      {/* How it works */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {STEPS.map((s) => (
          <div
            key={s.title}
            className="soft flex flex-col items-center gap-1 rounded-3xl px-2 py-4 text-center"
          >
            <Image src={s.art} alt="" width={64} height={64} className="h-14 w-14 object-contain" />
            <span className="mt-1 text-sm font-bold text-ink">{s.title}</span>
            <span className="text-[11px] leading-tight text-ink/50">{s.desc}</span>
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
        <p className="text-xs text-ink/40">No seed phrase. Nothing to install.</p>
      </div>
    </main>
  );
}
