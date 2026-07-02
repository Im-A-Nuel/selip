"use client";

// ZeroDev session keys / permissions: programmable gift rules, enforced at the
// smart-account level, not the backend. Concretely: when a gift is funded, the
// sender's EIP-7702 kernel account grants a session key permission scoped to
// ONLY calling refund() on that one gift's escrow, and only after its deadline
// (CallPolicy + TimestampPolicy). That permission is what lets the refund fire
// without the sender reconnecting their wallet and signing again -- the
// session key is authorized once, up front, for exactly one action.
//
// Non-custodial boundary: the session key can never move funds anywhere but
// back to the original sender (that's hardcoded in GiftEscrow.refund()), and
// valueLimit is 0 so it can't spend value either. The backend never stores it;
// it lives in the sender's own browser (localStorage), keyed by gift id.

export interface ZeroDevConfig {
  projectId: string;
}

export function getZeroDevConfig(): ZeroDevConfig | null {
  const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
  return projectId ? { projectId } : null;
}

export function isZeroDevConfigured(): boolean {
  return getZeroDevConfig() !== null;
}

export interface RefundRule {
  type: "refund_if_unclaimed";
  days: number;
}

// Compute the unix deadline a refund permission should encode.
export function refundDeadline(createdAtMs: number, days: number): number {
  return Math.floor(createdAtMs / 1000) + days * 24 * 60 * 60;
}

// Default MVP rule: refund to sender if unclaimed within 30 days.
export function defaultRefundRule(): RefundRule {
  return { type: "refund_if_unclaimed", days: 30 };
}

function zerodevBundlerUrl(chainId: number): string {
  const cfg = getZeroDevConfig();
  if (!cfg) throw new Error("ZeroDev project not configured.");
  return `https://rpc.zerodev.app/api/v3/${cfg.projectId}/chain/${chainId}`;
}

const GIFT_ESCROW_REFUND_ABI = [
  {
    type: "function",
    name: "refund",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

export interface RefundPermission {
  sessionPrivateKey: `0x${string}`;
  sessionKeyAddress: `0x${string}`;
  serializedAccount: string;
}

// Called once, right after a gift is funded. Builds the sender's kernel
// account (EIP-7702, owned by their connected wallet) and installs a
// refund-only session key permission on it. Returns the session key (kept
// client-side only) and the serialized account approval (safe to persist as
// gift metadata -- it carries no spending power on its own).
export async function createRefundPermission(
  escrowAddress: `0x${string}`,
  deadlineUnix: number,
  rpcUrl: string,
): Promise<RefundPermission> {
  const [
    { createPublicClient, http },
    { createKernelAccount },
    { KERNEL_V3_3, getEntryPoint },
    { generatePrivateKey, privateKeyToAccount },
    { toECDSASigner },
    { toPermissionValidator },
    { toCallPolicy, toTimestampPolicy, CallPolicyVersion },
  ] = await Promise.all([
    import("viem"),
    import("@zerodev/sdk"),
    import("@zerodev/sdk/constants"),
    import("viem/accounts"),
    import("@zerodev/permissions/signers"),
    import("@zerodev/permissions"),
    import("@zerodev/permissions/policies"),
  ]);

  const publicClient = createPublicClient({ transport: http(rpcUrl) });
  const entryPoint = getEntryPoint("0.7");

  // The sender's own connected wallet acts as the EIP-7702 signer (owner /
  // sudo authority). It only signs once, right now, to install the
  // permission -- not again later at refund time. ZeroDev's `Signer` type
  // accepts a raw EIP-1193 provider directly, so window.ethereum itself
  // (already connected to ownerAddress) is enough -- no need to hand-roll an
  // Account object.
  const provider = (window as any).ethereum;
  if (!provider) throw new Error("No crypto wallet found in this browser.");

  const sessionPrivateKey = generatePrivateKey();
  const sessionKeySigner = await toECDSASigner({
    signer: privateKeyToAccount(sessionPrivateKey),
  });

  const refundOnlyPolicy = toCallPolicy({
    policyVersion: CallPolicyVersion.V0_0_4,
    permissions: [
      {
        target: escrowAddress,
        valueLimit: 0n,
        abi: GIFT_ESCROW_REFUND_ABI,
        functionName: "refund",
      },
    ],
  });
  const afterDeadlinePolicy = toTimestampPolicy({ validAfter: deadlineUnix });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion: KERNEL_V3_3,
    signer: sessionKeySigner,
    policies: [refundOnlyPolicy, afterDeadlinePolicy],
  });

  const kernelAccount = await createKernelAccount(publicClient, {
    entryPoint,
    kernelVersion: KERNEL_V3_3,
    eip7702Account: provider,
    plugins: { regular: permissionPlugin },
  });

  const { serializePermissionAccount } = await import("@zerodev/permissions");
  const serializedAccount = await serializePermissionAccount(
    kernelAccount,
    sessionPrivateKey,
  );

  return {
    sessionPrivateKey,
    sessionKeyAddress: sessionKeySigner.account.address,
    serializedAccount,
  };
}

// Called later (after the deadline), using only the session key -- no wallet
// popup, no owner signature. This is the "automated, no manual signature"
// refund ZeroDev makes possible.
export async function executeAutomatedRefund(
  serializedAccount: string,
  escrowAddress: `0x${string}`,
  chainId: number,
  rpcUrl: string,
): Promise<string> {
  const [
    { createPublicClient, http, encodeFunctionData },
    { createKernelAccountClient, createZeroDevPaymasterClient },
    { getEntryPoint, KERNEL_V3_3 },
    { deserializePermissionAccount },
  ] = await Promise.all([
    import("viem"),
    import("@zerodev/sdk"),
    import("@zerodev/sdk/constants"),
    import("@zerodev/permissions"),
  ]);

  const publicClient = createPublicClient({ transport: http(rpcUrl) });
  const entryPoint = getEntryPoint("0.7");

  const sessionKeyAccount = await deserializePermissionAccount(
    publicClient,
    entryPoint,
    KERNEL_V3_3,
    serializedAccount,
  );

  const bundlerUrl = zerodevBundlerUrl(chainId);
  const paymasterClient = createZeroDevPaymasterClient({
    transport: http(bundlerUrl),
  });
  const kernelClient = createKernelAccountClient({
    account: sessionKeyAccount,
    bundlerTransport: http(bundlerUrl),
    paymaster: paymasterClient,
    client: publicClient,
  });

  const refundCallData = encodeFunctionData({
    abi: GIFT_ESCROW_REFUND_ABI,
    functionName: "refund",
  });

  const userOpHash = await kernelClient.sendUserOperation({
    callData: await sessionKeyAccount.encodeCalls([
      {
        to: escrowAddress,
        value: 0n,
        data: refundCallData,
      },
    ]),
  });
  await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
  return userOpHash;
}
