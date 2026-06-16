// Recipient claim page. Server-resolves the slug to public metadata, then hands
// off to the client ClaimFlow for login + reveal. Copy avoids crypto jargon.

import type { Metadata } from "next";
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
  const occasion = occasionById(gift.occasion);
  const title = `A ${occasion.label} gift for you ${occasion.emoji}`;
  const description = "Open it with Google. No wallet needed. - Selip";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
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
        <span className="text-4xl">🤔</span>
        <h1 className="text-2xl font-extrabold text-ink">Gift not found</h1>
        <p className="text-sm text-ink/60">
          The link may be mistyped or no longer valid.
        </p>
      </Centered>
    );
  }

  if (gift.status === "claimed") {
    return (
      <Centered>
        <span className="text-4xl">🎉</span>
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
        <span className="text-4xl">⌛</span>
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

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      {children}
    </main>
  );
}
