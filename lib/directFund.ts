"use client";

// Fallback funding path: the sender's wallet calls GiftEscrowFactory directly
// on Arbitrum Sepolia, no cross-chain routing. Used while Particle's
// createUniversalTransaction (custom contract call) is unavailable for this
// project -- see fundGiftEscrow in lib/particle.ts for the intended UA path.
// Same factory, same on-chain result (a funded, verified GiftEscrow); the
// only difference is the sender must already hold testnet ETH on Arbitrum
// Sepolia instead of Universal Accounts sourcing it from any chain/asset.

import { createWalletClient, createPublicClient, custom, http, encodeFunctionData, parseAbiItem, parseEther } from "viem";
import { GIFT_ESCROW_FACTORY } from "./constants";

const FACTORY_ABI = [
  {
    type: "function",
    name: "createAndFund",
    stateMutability: "payable",
    inputs: [{ name: "deadline", type: "uint256" }],
    outputs: [{ name: "escrow", type: "address" }],
  },
] as const;

const GIFT_CREATED_EVENT = parseAbiItem(
  "event GiftCreated(address indexed escrow, address indexed sender, uint256 deadline, uint256 amount)",
);

const SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ??
  "https://sepolia-rollup.arbitrum.io/rpc";

export interface DirectFundResult {
  txHash: string;
  escrowAddress: string | null;
}

export async function fundGiftDirect(
  ownerAddress: `0x${string}`,
  amountEth: string,
  deadlineUnix: number,
): Promise<DirectFundResult> {
  const provider = (window as any).ethereum;
  if (!provider) throw new Error("No crypto wallet found in this browser.");

  const wallet = createWalletClient({ account: ownerAddress, transport: custom(provider) });
  const publicClient = createPublicClient({ transport: http(SEPOLIA_RPC) });

  const currentChainId = await wallet.getChainId();
  if (currentChainId !== GIFT_ESCROW_FACTORY.chainId) {
    await wallet.switchChain({ id: GIFT_ESCROW_FACTORY.chainId }).catch(async () => {
      // Wallet doesn't have the chain yet; ask it to add Arbitrum Sepolia.
      await (provider as any).request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${GIFT_ESCROW_FACTORY.chainId.toString(16)}`,
            chainName: "Arbitrum Sepolia",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [SEPOLIA_RPC],
            blockExplorerUrls: [GIFT_ESCROW_FACTORY.explorerBase],
          },
        ],
      });
    });
  }

  const data = encodeFunctionData({
    abi: FACTORY_ABI,
    functionName: "createAndFund",
    args: [BigInt(deadlineUnix)],
  });

  // Arbitrum Sepolia's base fee can tick up between when the wallet last
  // cached a gas estimate and when the user actually confirms, which makes a
  // stale maxFeePerGas get rejected ("less than block base fee"). Fetch a
  // fresh estimate and pad it so the tx clears even a few blocks of drift.
  const fees = await publicClient.estimateFeesPerGas();
  const maxFeePerGas = (fees.maxFeePerGas * 150n) / 100n;
  const maxPriorityFeePerGas = (fees.maxPriorityFeePerGas * 150n) / 100n;

  const txHash = await wallet.sendTransaction({
    to: GIFT_ESCROW_FACTORY.address as `0x${string}`,
    data,
    value: parseEther(amountEth),
    maxFeePerGas,
    maxPriorityFeePerGas,
    chain: null,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  let escrowAddress: string | null = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== GIFT_ESCROW_FACTORY.address.toLowerCase()) continue;
    try {
      const parsed = (await import("viem")).decodeEventLog({
        abi: [GIFT_CREATED_EVENT],
        data: log.data,
        topics: log.topics,
      });
      escrowAddress = (parsed.args as any).escrow ?? null;
      break;
    } catch {
      // not the event we're looking for
    }
  }

  return { txHash, escrowAddress };
}
