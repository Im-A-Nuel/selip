// Recipient claim page. Server-resolves the slug to public metadata, then hands
// off to the client ClaimFlow for login + reveal. Copy avoids crypto jargon.

import type { Metadata } from "next";
import Image from "next/image";
import { getRepo } from "@/lib/db";
import { toPublicView } from "@/lib/gifts";
import { occasionById } from "@/lib/constants";
import { ClaimFlow } from "@/components/ClaimFlow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gift = await getRepo().getBySlug(slug);
  if (!gift) return { title: "Gift not found - Selip" };
  const label =
    gift.occasion === "custom"
      ? gift.occasion_label?.trim() || "special"
      : occasionById(gift.occasion).label;
  const title = `A ${label} gift for you`;
  const description = `${gift.amount_display}. Open it with Google. No wallet needed.`;
  const ogImage = `/api/og/${slug}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [ogImage] },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gift = await getRepo().getBySlug(slug);

  if (!gift) {
    return (
      <Centered>
        <StateArt src="/art/state-notfound.webp" />
        <h1 className="text-2xl font-extrabold text-ink">Gift not found</h1>
        <p className="text-sm text-ink/60">
          The link may be mistyped or no longer valid.
        </p>
      </Centered>
    );
  }

  if (gift.status === "draft") {
    return (
      <Centered>
        <StateArt src="/art/loading.webp" />
        <h1 className="text-2xl font-extrabold text-ink">Almost ready</h1>
        <p className="text-sm text-ink/60">
          This gift is being prepared by the sender. Check back in a moment once they've funded it.
        </p>
      </Centered>
    );
  }

  if (gift.status === "claimed") {
    return (
      <Centered>
        <StateArt src="/art/state-opened.webp" />
        <h1 className="text-2xl font-extrabold text-ink">
          This gift is already opened
        </h1>
        <p className="text-sm text-ink/60">See you at the next one.</p>
      </Centered>
    );
  }

  if (gift.status === "expired" || gift.status === "refunded") {
    return (
      <Centered>
        <StateArt src="/art/state-expired.webp" />
        <h1 className="text-2xl font-extrabold text-ink">
          This gift has expired
        </h1>
        <p className="text-sm text-ink/60">
          It returned to the sender because it was not opened in time.
        </p>
      </Centered>
    );
  }

  return <ClaimFlow giftId={gift.id} view={toPublicView(gift)} />;
}

function StateArt({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={200}
      height={200}
      priority
      className="rise-in h-40 w-40 object-contain"
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      {children}
    </main>
  );
}
