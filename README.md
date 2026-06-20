# Selip

**Slip someone a gift. No wallet needed.**

Selip lets anyone send a crypto gift to someone who has never touched crypto. The sender picks an amount and a card, funds it from any asset on any chain, and shares one link. The recipient opens the link, signs in with Google, and the gift is there. No seed phrase. No app to install. No wallet jargon.

Built solo for **UXmaxx Hackathon, General Track** (6 weeks).

## On-chain proof

`GiftEscrow` is deployed and **verified** on Arbitrum Sepolia. The demo deploy ran
a full **fund → claim** lifecycle, so the address page shows real `Funded` and
`Claimed` events — not just deployed bytecode.

- Contract: [`0x2548dc9aAEf1be2530966D8FCD26261C11a684bd`](https://sepolia.arbiscan.io/address/0x2548dc9aAEf1be2530966D8FCD26261C11a684bd) (verified)
- Deploy tx: `0x8a4794061a8393c16cbe7ff9ca3fa19b98c7a414d0936c65e56d1fd168ecfed7`
- Fund tx: `0x8850507ee56ba94385bdd97e5b7f1149809c5e1cb295d2899db0eb4cb369954c`
- Claim tx: `0x3380fc69a2c06ec2d5f06fce717b5ca175ad2e012002ca3ad9f7bc82761bd75e`

---

## The problem

Sending value to someone without a wallet is hard in Web3 today. Selip hides the entire complexity -- wallets, gas, chains, bridging -- behind a gift metaphor everyone already understands.

What separates Selip from a Web2 transfer app:
- **Cross-chain pooling** -- fund a gift from any asset on any chain in one step (Particle Universal Accounts)
- **Trustless rules** -- refund conditions are enforced by smart contract, not a backend promise
- **Walletless claim** -- recipient's EOA is upgraded to a Universal Account on-the-fly via EIP-7702 at first claim

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind |
| Embedded wallet / onboarding | Magic (Google, Apple, email OTP) |
| Chain abstraction | Particle Network Universal Accounts SDK (EIP-7702, V2) |
| Programmable gift rules | ZeroDev (session keys / permissions) |
| Settlement chain | Arbitrum |
| Database | Supabase (Postgres) -- gift metadata only, non-custodial |
| Contracts | Solidity + Foundry (GiftEscrow.sol) |
| Hosting | Vercel |

---

## Quick start

```bash
git clone https://github.com/Im-A-Nuel/selip.git
cd selip
pnpm install
cp .env.example .env.local   # fill Particle, Magic, ZeroDev, Supabase keys
pnpm dev
```

The app runs fully in **demo mode without any keys** -- the API falls back to an in-memory store and the claim flow simulates every step end-to-end. Perfect for local UI review.

### Environment variables

```env
# Particle Network
NEXT_PUBLIC_PARTICLE_PROJECT_ID=
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=
NEXT_PUBLIC_PARTICLE_APP_ID=

# Magic
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=

# ZeroDev
NEXT_PUBLIC_ZERODEV_PROJECT_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Arbitrum RPC (public fallback works for read-only)
NEXT_PUBLIC_ARB_RPC=https://arb1.arbitrum.io/rpc
```

### Supabase migrations

```bash
supabase db push   # runs supabase/migrations/* in order
```

### Smart contracts (Foundry, via WSL)

```bash
cd contracts
forge install foundry-rs/forge-std
forge test                    # 7/7 passing
forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia --broadcast
```

---

## Project structure

```
app/
  create/         gift creation wizard (6 steps)
  g/[slug]/       recipient claim page
  gifts/          sender dashboard (per-device history)
  api/gifts/      REST: create, status, claim, refund, thanks
  api/og/[slug]/  dynamic OpenGraph image per gift

components/
  ClaimFlow.tsx   walletless open flow (login -> gate -> reveal)
  GiftCard.tsx    animated gift card with occasion art
  Confetti.tsx    confetti burst on reveal

lib/
  particle.ts     Universal Accounts SDK wrapper
  magic.ts        embedded wallet login wrapper
  zerodev.ts      session key + permission wrapper
  db.ts           Supabase repo + in-memory fallback

contracts/
  GiftEscrow.sol  escrow + refund rules (Foundry)
```

---

## Core user flows

**Sender**
1. Pick occasion, amount, personal message, card theme
2. Set a programmable rule (refund if unclaimed by date)
3. Optionally protect with a PIN or recipient email
4. Fund from any asset (USDC on Base, ETH on Arbitrum, etc.)
5. Share the link via WhatsApp or any channel

**Recipient**
1. Open link, see a floating gift card with personalized greeting
2. Sign in with Google (one tap, Magic embedded wallet)
3. If protected: enter PIN or confirm email
4. Card flips open with 3D animation + confetti
5. Choose destination chain and cash out

---

## Architecture notes

- Gift value and rules live in the **smart account**, not the database. Database stores metadata only.
- Refund rules are enforced at **contract level** (ZeroDev permissions), not the backend. This is the key Web3 differentiator.
- Recipient EOA is upgraded to a Universal Account **on-the-fly at first claim** via EIP-7702, not pre-deployed.
- Cross-chain routing (funding and withdrawal) is handled by **Particle Universal Accounts SDK**, not the GiftEscrow contract.

---

## License

MIT. Builder retains full IP rights (per hackathon rules).
