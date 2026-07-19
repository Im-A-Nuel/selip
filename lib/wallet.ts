"use client";

// Sender's own crypto wallet (MetaMask or any EIP-1193 injected provider).
// This is the sender's existing wallet, not the recipient's Magic embedded
// wallet. Universal Accounts routes whatever this wallet holds into the gift.
// Uses viem (already a dependency) against window.ethereum directly, so no
// extra wallet-connector library is needed.

import { createWalletClient, custom, type Hex } from "viem";

function getInjectedProvider(): any {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum ?? null;
}

export function isWalletAvailable(): boolean {
  return getInjectedProvider() !== null;
}

// Prompts the browser wallet's connect UI and returns the chosen address.
export async function connectWallet(): Promise<`0x${string}`> {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error(
      "No crypto wallet found in this browser. Install MetaMask or another wallet extension.",
    );
  }
  const client = createWalletClient({ transport: custom(provider) });
  const [address] = await client.requestAddresses();
  if (!address) throw new Error("Wallet did not return an address.");
  return address;
}

// Signs a 32-byte hash as raw message bytes (personal_sign over the hash),
// which is what Universal Accounts expects for a transaction's rootHash.
export async function signRootHash(
  address: `0x${string}`,
  rootHash: Hex,
): Promise<Hex> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error("No crypto wallet found in this browser.");
  const client = createWalletClient({ transport: custom(provider) });
  return client.signMessage({ account: address, message: { raw: rootHash } });
}

// Wallet/viem errors (MetaMask EIP-1193 errors, viem's BaseError) come as huge
// multi-line dumps -- request args, docs links, SDK version -- that are noise
// to a normal user. Collapse them into one short, human sentence. A rejected
// signature/transaction (EIP-1193 code 4001) is not a failure, just a "no", so
// it gets its own calmer wording.
export function friendlyWalletError(e: unknown): string {
  const err = e as any;
  const text = String(err?.shortMessage ?? err?.message ?? err ?? "");
  if (err?.code === 4001 || /user rejected/i.test(text)) {
    return "You cancelled the request. Nothing was sent.";
  }
  if (typeof err?.shortMessage === "string" && err.shortMessage) {
    return err.shortMessage;
  }
  const firstLine = text.split("\n")[0]?.trim();
  return firstLine || "Something went wrong. Please try again.";
}
