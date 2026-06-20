"use client";

// Static OAuth return page. Magic's oauth2 flow passes this URL to Google as the
// redirect_uri, so it must be a single stable path (not the dynamic /g/[slug]).
// Here we finalize the Magic login, then forward back to the gift page the user
// started from (stored in sessionStorage before the redirect).

import { useEffect } from "react";
import Image from "next/image";
import { resolveOAuthResult } from "@/lib/magic";

export default function OAuthCallback() {
  useEffect(() => {
    (async () => {
      let back = "/";
      try {
        back = sessionStorage.getItem("selip.returnPath") || "/";
      } catch {}
      try {
        await resolveOAuthResult();
        try {
          sessionStorage.setItem("selip.justLoggedIn", "1");
          sessionStorage.removeItem("selip.returnPath");
        } catch {}
        window.location.replace(back);
      } catch {
        try {
          sessionStorage.removeItem("selip.returnPath");
        } catch {}
        window.location.replace(`${back}?login=failed`);
      }
    })();
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <Image
        src="/art/mascot.webp"
        alt=""
        width={140}
        height={140}
        priority
        className="float-slow h-28 w-28 object-contain"
      />
      <p className="text-sm font-semibold text-ink/50">
        Signing you in<span className="animate-pulse">…</span>
      </p>
    </main>
  );
}
