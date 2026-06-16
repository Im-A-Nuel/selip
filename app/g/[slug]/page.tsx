// Recipient claim page. Server-resolves the slug to public metadata, then hands
// off to the client ClaimFlow for login + reveal. Copy avoids crypto jargon.

import { getRepo } from "@/lib/db";
import { toPublicView } from "@/lib/gifts";
import { ClaimFlow } from "@/components/ClaimFlow";

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
        <h1 className="text-2xl font-extrabold text-ink">
          Kado tidak ditemukan
        </h1>
        <p className="text-sm text-ink/60">
          Link mungkin salah ketik atau sudah tidak berlaku.
        </p>
      </Centered>
    );
  }

  if (gift.status === "claimed") {
    return (
      <Centered>
        <span className="text-4xl">🎉</span>
        <h1 className="text-2xl font-extrabold text-ink">
          Kado ini sudah dibuka
        </h1>
        <p className="text-sm text-ink/60">Sampai jumpa di kado berikutnya.</p>
      </Centered>
    );
  }

  if (gift.status === "expired" || gift.status === "refunded") {
    return (
      <Centered>
        <span className="text-4xl">⌛</span>
        <h1 className="text-2xl font-extrabold text-ink">
          Kado ini sudah kedaluwarsa
        </h1>
        <p className="text-sm text-ink/60">
          Kado kembali ke pengirim karena tidak dibuka tepat waktu.
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
