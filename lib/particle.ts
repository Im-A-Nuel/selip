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

  // @ts-expect-error Particle SDK exports map does not resolve its .d.ts under
  // bundler moduleResolution; the SDK is used dynamically and typed as any.
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

// Fund one gift: calls GiftEscrowFactory.createAndFund(deadline) through the
// Universal Account, so cross-chain routing + the deploy-and-lock happen in
// the one signature the sender's wallet makes. Flow (per Particle's UA
// reference): createUniversalTransaction -> sign the returned rootHash with
// the owner's wallet -> sendTransaction. See lib/wallet.ts for the signing
// side (plain EIP-1193 wallet, no extra connector library).
export interface FundGiftParams {
  ownerAddress: `0x${string}`;
  amountEth: string; // e.g. "50" (major units of ETH, demo uses ETH as the gift asset)
  deadlineUnix: number;
  signRootHash: (rootHash: `0x${string}`) => Promise<`0x${string}`>;
}

export interface FundGiftResult {
  transactionId: string;
  escrowAddress: string | null;
}

export async function fundGiftEscrow(
  params: FundGiftParams,
): Promise<FundGiftResult> {
  const { ownerAddress, amountEth, deadlineUnix, signRootHash } = params;
  const ua = await initUniversalAccount(ownerAddress);

  const [{ encodeFunctionData, parseEther, toHex }, uaSdk] =
    await Promise.all([
      import("viem"),
      // @ts-expect-error see initUniversalAccount above: package.json "exports"
      // hides the .d.ts from bundler moduleResolution.
      import("@particle-network/universal-account-sdk"),
    ]);
  const SUPPORTED_TOKEN_TYPE: any = (uaSdk as any).SUPPORTED_TOKEN_TYPE;
  const { GIFT_ESCROW_FACTORY } = await import("./constants");

  const factoryAbi = [
    {
      type: "function",
      name: "createAndFund",
      stateMutability: "payable",
      inputs: [{ name: "deadline", type: "uint256" }],
      outputs: [{ name: "escrow", type: "address" }],
    },
  ] as const;

  const value = parseEther(amountEth);
  const data = encodeFunctionData({
    abi: factoryAbi,
    functionName: "createAndFund",
    args: [BigInt(deadlineUnix)],
  });

  const transaction = await ua.createUniversalTransaction({
    chainId: GIFT_ESCROW_FACTORY.chainId,
    expectTokens: [{ type: SUPPORTED_TOKEN_TYPE.ETH, amount: amountEth }],
    transactions: [
      {
        to: GIFT_ESCROW_FACTORY.address,
        data,
        value: toHex(value),
      },
    ],
  });

  const signature = await signRootHash(transaction.rootHash as `0x${string}`);
  const result = await ua.sendTransaction(transaction, signature);

  const escrowAddress = await pollForEscrowAddress(
    ua,
    result?.transactionId,
    ownerAddress,
  );

  return { transactionId: result?.transactionId ?? "", escrowAddress };
}

// The escrow address isn't in sendTransaction's immediate response (that only
// confirms broadcast); it's emitted by GiftCreated once the execution leg
// lands on Arbitrum. Poll the UA transaction status, then read the event log
// directly from the destination chain.
async function pollForEscrowAddress(
  ua: any,
  transactionId: string | undefined,
  ownerAddress: `0x${string}`,
  attempts = 20,
  intervalMs = 3000,
): Promise<string | null> {
  if (!transactionId) return null;
  const { createPublicClient, http, parseAbiItem } = await import("viem");
  const { GIFT_ESCROW_FACTORY } = await import("./constants");

  for (let i = 0; i < attempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const tx = await ua.getTransaction(transactionId);
      const status = tx?.status ?? tx?.data?.status;
      // UA_TRANSACTION_STATUS.FINISHED === 7
      if (status === 7 || status === "FINISHED") {
        const client = createPublicClient({
          transport: http(
            process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ??
              "https://sepolia-rollup.arbitrum.io/rpc",
          ),
        });
        const smartAccount = await ua.getSmartAccountOptions();
        const senderAddr = smartAccount?.smartAccountAddress ?? ownerAddress;
        const logs = await client.getLogs({
          address: GIFT_ESCROW_FACTORY.address as `0x${string}`,
          event: parseAbiItem(
            "event GiftCreated(address indexed escrow, address indexed sender, uint256 deadline, uint256 amount)",
          ),
          args: { sender: senderAddr as `0x${string}` },
          fromBlock: "earliest",
          toBlock: "latest",
        });
        const last = logs.at(-1);
        if (last) return last.args.escrow ?? null;
        return null;
      }
      if (status === 6 || status === "EXECUTION_FAILED") {
        throw new Error("Funding transaction failed on-chain.");
      }
    } catch {
      // keep polling; a transient RPC/API hiccup shouldn't abort the whole flow
    }
  }
  return null;
}
