"use client";

// Magic embedded wallet: recipient onboarding via Google/email login.
// The recipient's initial signer before EOA -> UA upgrade (EIP-7702) at claim.
// Browser-only; lazily imports the SDK so server bundles stay clean.

import type { OAuthProvider } from "@magic-ext/oauth";

let magicInstance: any = null;

function getKey(): string {
  const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY belum diset.");
  }
  return key;
}

export function isMagicConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
}

async function getMagic() {
  if (typeof window === "undefined") {
    throw new Error("Magic hanya tersedia di browser.");
  }
  if (magicInstance) return magicInstance;
  const [{ Magic }, { OAuthExtension }] = await Promise.all([
    import("magic-sdk"),
    import("@magic-ext/oauth"),
  ]);
  magicInstance = new Magic(getKey(), {
    extensions: [new OAuthExtension()],
  });
  return magicInstance;
}

// Start an OAuth login redirect (google, apple, ...). Returns to redirectURI.
export async function loginWithOAuth(
  provider: string,
  redirectURI: string,
): Promise<void> {
  const magic = await getMagic();
  await magic.oauth.loginWithRedirect({
    provider: provider as OAuthProvider,
    redirectURI,
  });
}

// Start Google login redirect. Returns to redirectURI on success.
export async function loginWithGoogle(redirectURI: string): Promise<void> {
  return loginWithOAuth("google", redirectURI);
}

// Email magic-link login (fallback when Google is unavailable).
export async function loginWithEmail(email: string): Promise<void> {
  const magic = await getMagic();
  await magic.auth.loginWithEmailOTP({ email });
}

// Resolve the OAuth redirect; returns the user's metadata + signer info.
export async function resolveOAuthResult() {
  const magic = await getMagic();
  return magic.oauth.getRedirectResult();
}

export async function getUserAddress(): Promise<string | null> {
  const magic = await getMagic();
  const info = await magic.user.getInfo();
  return info?.publicAddress ?? null;
}

export async function logout(): Promise<void> {
  const magic = await getMagic();
  await magic.user.logout();
}
