"use client";

// Magic embedded wallet: recipient onboarding via Google/email login.
// The recipient's initial signer before EOA -> UA upgrade (EIP-7702) at claim.
// Browser-only; lazily imports the SDK so server bundles stay clean.
//
// Social login uses the OAuth 2.0 flow (@magic-ext/oauth2): the dashboard
// "Social Login" setup with your own Google client is the OAuth2 flow, so the
// deprecated v1 @magic-ext/oauth verify endpoint returns 401. Email OTP is core
// auth (magic.auth) and is independent of the OAuth extension.

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
  // @magic-ext/oauth2 exports its extension class as `OAuthExtension` (it
  // registers under the `magic.oauth2` namespace).
  const [{ Magic }, { OAuthExtension }] = await Promise.all([
    import("magic-sdk"),
    import("@magic-ext/oauth2"),
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
  await magic.oauth2.loginWithRedirect({
    provider: provider as any,
    redirectURI,
  });
}

// Start Google login redirect. Returns to redirectURI on success.
export async function loginWithGoogle(redirectURI: string): Promise<void> {
  return loginWithOAuth("google", redirectURI);
}

// Email magic-link / OTP login. Core auth (magic.auth), no OAuth extension
// needed, works with just the publishable key.
export async function loginWithEmail(email: string): Promise<void> {
  const magic = await getMagic();
  await magic.auth.loginWithEmailOTP({ email });
}

// Resolve the OAuth redirect; returns the user's metadata + signer info.
export async function resolveOAuthResult() {
  const magic = await getMagic();
  return magic.oauth2.getRedirectResult();
}

export async function getUserAddress(): Promise<string | null> {
  const magic = await getMagic();
  // Primary: user metadata. publicAddress can be null right after some logins.
  try {
    const info = await magic.user.getInfo();
    if (info?.publicAddress) return info.publicAddress;
  } catch {}
  // Fallback: ask the embedded wallet's EIP-1193 provider directly. This is
  // reliable once the user is signed in (email OTP or OAuth).
  try {
    const accounts = await magic.rpcProvider.request({ method: "eth_accounts" });
    if (Array.isArray(accounts) && accounts[0]) return accounts[0] as string;
  } catch {}
  return null;
}

// Verified email of the signed-in user (email OTP or the OAuth account email).
// Used to auto-pass an email-locked gift's gate without asking again.
export async function getUserEmail(): Promise<string | null> {
  const magic = await getMagic();
  const info = await magic.user.getInfo();
  return info?.email ?? null;
}

export async function logout(): Promise<void> {
  const magic = await getMagic();
  await magic.user.logout();
}
