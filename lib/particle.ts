"use client";

// Particle Network Universal Accounts SDK (EIP-7702 mode).
// Cross-chain routing for funding (sender) and cash-out (recipient), plus the
// on-the-fly EOA -> UA upgrade at first claim. Cross-chain routing is the SDK's
// job, not the GiftEscrow contract.
//
// Browser-only, lazily imported. The exact V2 call surface is wired in week 1
// during the cross-chain spike; this wrapper centralizes config + init so UI
// never touches the SDK directly (CLAUDE.md convention).

export interface UAConfig {
  projectId: string;
  clientKey: string;
  appId: string;
}

export function getUAConfig(): UAConfig | null {
  const projectId = process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID;
  const clientKey = process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY;
  const appId = process.env.NEXT_PUBLIC_PARTICLE_APP_ID;
  if (projectId && clientKey && appId) return { projectId, clientKey, appId };
  return null;
}

export function isUAConfigured(): boolean {
  return getUAConfig() !== null;
}

let uaInstance: any = null;

// Initialize a Universal Account bound to an owner address (the recipient's
// Magic signer, or the sender's connected account).
export async function initUniversalAccount(ownerAddress: string) {
  if (typeof window === "undefined") {
    throw new Error("Universal Account hanya tersedia di browser.");
  }
  const cfg = getUAConfig();
  if (!cfg) throw new Error("Konfigurasi Particle belum lengkap.");

  const mod: any = await import("@particle-network/universal-account-sdk");
  const UniversalAccount = mod.UniversalAccount ?? mod.default;
  uaInstance = new UniversalAccount({
    projectId: cfg.projectId,
    projectClientKey: cfg.clientKey,
    projectAppUuid: cfg.appId,
    ownerAddress,
  });
  return uaInstance;
}

export function getUniversalAccount() {
  return uaInstance;
}
