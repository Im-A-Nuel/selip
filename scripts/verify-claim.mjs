// End-to-end verification of the gasless recipient claim (mirrors
// lib/zerodev.ts claimGiftGasless):
//   1. Fund a fresh GiftEscrow via the factory (deadline in the future).
//   2. Create a brand-new, zero-balance "recipient" key -- the same situation
//      as a freshly created Magic embedded wallet.
//   3. Claim the gift through the recipient's counterfactual ZeroDev kernel
//      account, gas sponsored by the paymaster (the recipient pays nothing).
//   4. Confirm the escrow emptied and the recipient's address holds the funds.
//
// Run: node --env-file=.env.local --env-file=contracts/.env scripts/verify-claim.mjs

import {
  createPublicClient,
  createWalletClient,
  http,
  encodeFunctionData,
  parseAbiItem,
  parseEther,
  formatEther,
  decodeEventLog,
} from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { KERNEL_V3_3, getEntryPoint } from "@zerodev/sdk/constants";
import { toPermissionValidator } from "@zerodev/permissions";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { toSudoPolicy } from "@zerodev/permissions/policies";

const RPC = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc";
const CHAIN_ID = 421614;
const FACTORY = "0x3B559aB2B76b0475Bb9c0369e5725202d3D231F7";
const ZERODEV_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
const PK = process.env.PRIVATE_KEY;
if (!ZERODEV_PROJECT_ID || !PK) { console.error("env missing"); process.exit(1); }

const sender = privateKeyToAccount(PK);
const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(RPC) });
const walletClient = createWalletClient({ account: sender, chain: arbitrumSepolia, transport: http(RPC) });

const FACTORY_ABI = [{ type: "function", name: "createAndFund", stateMutability: "payable", inputs: [{ name: "deadline", type: "uint256" }], outputs: [{ name: "escrow", type: "address" }] }];
const GIFT_CREATED_EVENT = parseAbiItem("event GiftCreated(address indexed escrow, address indexed sender, uint256 deadline, uint256 amount)");
const CLAIM_ABI = [{ type: "function", name: "claim", stateMutability: "nonpayable", inputs: [{ name: "recipient", type: "address" }], outputs: [] }];

// 1. Fund a fresh escrow, deadline 30 days out (a normal, claimable gift).
console.log("Step 1: funding a fresh escrow...");
const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
const fundTx = await walletClient.sendTransaction({
  to: FACTORY,
  data: encodeFunctionData({ abi: FACTORY_ABI, functionName: "createAndFund", args: [BigInt(deadline)] }),
  value: parseEther("0.0001"),
});
const fundReceipt = await publicClient.waitForTransactionReceipt({ hash: fundTx });
let escrow = null;
for (const log of fundReceipt.logs) {
  if (log.address.toLowerCase() !== FACTORY.toLowerCase()) continue;
  try {
    const parsed = decodeEventLog({ abi: [GIFT_CREATED_EVENT], data: log.data, topics: log.topics });
    escrow = parsed.args.escrow;
  } catch {}
}
if (!escrow) { console.error("no GiftCreated event"); process.exit(1); }
console.log("Escrow funded:", escrow);

// 2. Brand-new zero-balance recipient (same as a fresh Magic wallet).
const recipient = privateKeyToAccount(generatePrivateKey());
console.log("\nStep 2: fresh recipient:", recipient.address);
console.log("Recipient balance:", formatEther(await publicClient.getBalance({ address: recipient.address })), "ETH (must be 0)");

// 3. Gasless claim via the recipient's counterfactual kernel account.
console.log("\nStep 3: claiming gaslessly through the recipient's kernel account...");
const entryPoint = getEntryPoint("0.7");
const ecdsaSigner = await toECDSASigner({ signer: recipient });
const sudoValidator = await toPermissionValidator(publicClient, {
  entryPoint,
  kernelVersion: KERNEL_V3_3,
  signer: ecdsaSigner,
  policies: [toSudoPolicy({})],
});
const kernelAccount = await createKernelAccount(publicClient, {
  entryPoint,
  kernelVersion: KERNEL_V3_3,
  plugins: { sudo: sudoValidator },
});
console.log("Kernel account (counterfactual):", kernelAccount.address);

const bundlerUrl = `https://rpc.zerodev.app/api/v3/${ZERODEV_PROJECT_ID}/chain/${CHAIN_ID}`;
const paymasterClient = createZeroDevPaymasterClient({ transport: http(bundlerUrl) });
const kernelClient = createKernelAccountClient({
  account: kernelAccount,
  chain: arbitrumSepolia,
  bundlerTransport: http(bundlerUrl),
  paymaster: paymasterClient,
  client: publicClient,
});

const userOpHash = await kernelClient.sendUserOperation({
  callData: await kernelAccount.encodeCalls([
    { to: escrow, value: 0n, data: encodeFunctionData({ abi: CLAIM_ABI, functionName: "claim", args: [recipient.address] }) },
  ]),
});
const receipt = await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
console.log("Claim tx:", receipt.receipt.transactionHash);

// 4. Verify.
const escrowBal = await publicClient.getBalance({ address: escrow });
const recvBal = await publicClient.getBalance({ address: recipient.address });
console.log("\nStep 4: escrow balance:", formatEther(escrowBal), "ETH (should be 0)");
console.log("Recipient balance:", formatEther(recvBal), "ETH (should be 0.0001)");
console.log(
  escrowBal === 0n && recvBal === parseEther("0.0001")
    ? "\nPASS: gasless claim moved the gift to a zero-balance recipient. No gas paid by anyone but the paymaster."
    : "\nFAIL: balances did not move as expected.",
);
