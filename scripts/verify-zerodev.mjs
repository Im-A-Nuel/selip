// One-shot verification of the ZeroDev refund-permission flow end to end,
// without waiting for a real 30-day deadline:
//   1. Fund a fresh GiftEscrow via the factory with a deadline already in the
//      past (fund() doesn't check the deadline, only claim()/refund() do).
//   2. Install a refund-only session key permission on the sender's EIP-7702
//      kernel account (mirrors lib/zerodev.ts createRefundPermission).
//   3. Execute the refund using ONLY the session key (mirrors
//      lib/zerodev.ts executeAutomatedRefund) -- no further owner signature.
//   4. Confirm the escrow's balance actually left and the sender got it back.
//
// Run: node --env-file=.env.local --env-file=contracts/.env scripts/verify-zerodev.mjs

import {
  createPublicClient,
  createWalletClient,
  http,
  encodeFunctionData,
  parseAbiItem,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { KERNEL_V3_3, getEntryPoint } from "@zerodev/sdk/constants";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { toPermissionValidator, serializePermissionAccount, deserializePermissionAccount } from "@zerodev/permissions";
import { toCallPolicy, toTimestampPolicy, CallPolicyVersion } from "@zerodev/permissions/policies";
import { generatePrivateKey } from "viem/accounts";

const RPC = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc";
const CHAIN_ID = 421614;
const FACTORY = "0x3B559aB2B76b0475Bb9c0369e5725202d3D231F7";
const ZERODEV_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
const PK = process.env.PRIVATE_KEY;

if (!ZERODEV_PROJECT_ID) { console.error("NEXT_PUBLIC_ZERODEV_PROJECT_ID missing"); process.exit(1); }
if (!PK) { console.error("PRIVATE_KEY missing"); process.exit(1); }

const owner = privateKeyToAccount(PK);
const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(RPC) });
const walletClient = createWalletClient({ account: owner, chain: arbitrumSepolia, transport: http(RPC) });

const FACTORY_ABI = [
  { type: "function", name: "createAndFund", stateMutability: "payable", inputs: [{ name: "deadline", type: "uint256" }], outputs: [{ name: "escrow", type: "address" }] },
];
const GIFT_CREATED_EVENT = parseAbiItem("event GiftCreated(address indexed escrow, address indexed sender, uint256 deadline, uint256 amount)");
const REFUND_ABI = [{ type: "function", name: "refund", stateMutability: "nonpayable", inputs: [], outputs: [] }];

console.log("Owner (sender):", owner.address);
const balBefore = await publicClient.getBalance({ address: owner.address });
console.log("Owner balance before:", formatEther(balBefore), "ETH");

// 1. Fund a fresh escrow with an already-past deadline.
const pastDeadline = Math.floor(Date.now() / 1000) - 60;
const fundData = encodeFunctionData({ abi: FACTORY_ABI, functionName: "createAndFund", args: [BigInt(pastDeadline)] });
console.log("\nStep 1: funding a new escrow with an already-past deadline...");
const fundTxHash = await walletClient.sendTransaction({ to: FACTORY, data: fundData, value: parseEther("0.0001") });
const fundReceipt = await publicClient.waitForTransactionReceipt({ hash: fundTxHash });
let escrowAddress = null;
for (const log of fundReceipt.logs) {
  if (log.address.toLowerCase() !== FACTORY.toLowerCase()) continue;
  try {
    const { decodeEventLog } = await import("viem");
    const parsed = decodeEventLog({ abi: [GIFT_CREATED_EVENT], data: log.data, topics: log.topics });
    escrowAddress = parsed.args.escrow;
  } catch {}
}
if (!escrowAddress) { console.error("Could not find GiftCreated event"); process.exit(1); }
console.log("Escrow deployed+funded:", escrowAddress, "tx:", fundTxHash);

// 2. Install a refund-only session key permission (Kernel v3.3, EntryPoint v0.7, EIP-7702).
console.log("\nStep 2: installing ZeroDev refund-only session key permission...");
const entryPoint = getEntryPoint("0.7");
const sessionPrivateKey = generatePrivateKey();
const sessionKeySigner = await toECDSASigner({ signer: privateKeyToAccount(sessionPrivateKey) });

const refundOnlyPolicy = toCallPolicy({
  policyVersion: CallPolicyVersion.V0_0_4,
  permissions: [{ target: escrowAddress, valueLimit: 0n, abi: REFUND_ABI, functionName: "refund" }],
});
const afterDeadlinePolicy = toTimestampPolicy({ validAfter: pastDeadline });

const permissionPlugin = await toPermissionValidator(publicClient, {
  entryPoint,
  kernelVersion: KERNEL_V3_3,
  signer: sessionKeySigner,
  policies: [refundOnlyPolicy, afterDeadlinePolicy],
});

const kernelAccount = await createKernelAccount(publicClient, {
  entryPoint,
  kernelVersion: KERNEL_V3_3,
  eip7702Account: owner,
  plugins: { regular: permissionPlugin },
});
console.log("Kernel (EIP-7702) account address:", kernelAccount.address, "(should equal owner address)");

const serializedAccount = await serializePermissionAccount(kernelAccount, sessionPrivateKey);
console.log("Serialized permission length:", serializedAccount.length, "chars");

// 3. Execute the refund using ONLY the session key -- owner does not sign again.
console.log("\nStep 3: executing refund via session key only (no further owner signature)...");
const sessionKeyAccount = await deserializePermissionAccount(publicClient, entryPoint, KERNEL_V3_3, serializedAccount);

const bundlerUrl = `https://rpc.zerodev.app/api/v3/${ZERODEV_PROJECT_ID}/chain/${CHAIN_ID}`;
const paymasterClient = createZeroDevPaymasterClient({ transport: http(bundlerUrl) });
const kernelClient = createKernelAccountClient({
  account: sessionKeyAccount,
  chain: arbitrumSepolia,
  bundlerTransport: http(bundlerUrl),
  paymaster: paymasterClient,
  client: publicClient,
});

const refundCallData = encodeFunctionData({ abi: REFUND_ABI, functionName: "refund" });
let userOpHash;
try {
  userOpHash = await kernelClient.sendUserOperation({
    callData: await sessionKeyAccount.encodeCalls([{ to: escrowAddress, value: 0n, data: refundCallData }]),
  });
} catch (e) {
  console.error("\nRAW ERROR DETAILS:");
  console.error("details:", e?.details);
  console.error("shortMessage:", e?.shortMessage);
  console.error("cause:", e?.cause);
  console.error("metaMessages:", e?.metaMessages);
  throw e;
}
console.log("UserOp hash:", userOpHash);
const receipt = await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
console.log("UserOp receipt tx hash:", receipt.receipt.transactionHash);

// 4. Confirm the escrow paid out and the sender got the funds back.
const escrowBalance = await publicClient.getBalance({ address: escrowAddress });
const balAfter = await publicClient.getBalance({ address: owner.address });
console.log("\nStep 4: verifying result...");
console.log("Escrow balance after refund:", formatEther(escrowBalance), "ETH (should be 0)");
console.log("Owner balance after:", formatEther(balAfter), "ETH (should be ~0.0001 higher minus gas)");
console.log(escrowBalance === 0n ? "\nPASS: refund executed on-chain via ZeroDev session key, no owner signature at refund time." : "\nFAIL: escrow still holds balance.");
