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

> TODO(week1): scaffold the deploy toolchain (Foundry/Hardhat) once chosen.
