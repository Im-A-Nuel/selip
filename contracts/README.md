# Contracts

Per-gift `GiftEscrow` smart account with embedded rules, deployed to Arbitrum.

Value and rules live on-chain; the database holds metadata only.

## GiftEscrow interface

- `fund()` payable: lock gift value into escrow
- `claim(address recipient)`: transfer value to recipient; only valid while
  unclaimed and not expired
- `refund()`: return to sender; only valid after the period lapses with no claim

### Events

- `Funded(address sender, uint256 amount)`
- `Claimed(address recipient, uint256 amount)`
- `Refunded(address sender, uint256 amount)`

Rule execution uses ZeroDev permission / session keys so refund runs
automatically without a manual sender signature. Cross-chain routing for
funding and cash-out is handled by the Particle Universal Accounts SDK, not
this contract.

## Build & test

Foundry toolchain (run inside WSL on Windows).

```bash
cd contracts
cp .env.example .env          # fill PRIVATE_KEY, RPC, ARBISCAN_API_KEY
forge install foundry-rs/forge-std   # only if lib/forge-std is missing
forge test                    # 7 passing
```

## Deploy to Arbitrum Sepolia (testnet)

Prereqs: a deployer wallet with Arbitrum Sepolia ETH (faucet:
https://www.alchemy.com/faucets/arbitrum-sepolia), and an Arbiscan API key.

```bash
# bytecode only
forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia --broadcast --verify

# OR full lifecycle (deploy + fund + claim) for clickable event proof
forge script script/Demo.s.sol --rpc-url arbitrum_sepolia --broadcast
```

Record the deployed address + tx hashes; they are the on-chain proof. Mainnet
deploy uses `--rpc-url arbitrum` once the demo is validated on testnet.
