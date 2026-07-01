# Selip Devpost submission copy

Paste each section into the matching Devpost field. English, no em dashes.

---

## Tagline (one line)

Slip someone a money gift, with no wallet, no seed phrase, and no crypto words on either side.

---

## Inspiration

Every crypto person has tried to send money to a friend or a parent who is not
in crypto, and watched it fall apart. The moment you say "make a wallet, save
this seed phrase, get some gas, and make sure you are on the right chain," the
other person is gone. The gift never lands.

We wanted the opposite feeling: sending money should be as warm and as simple as
sending a birthday text. The recipient should never have to learn a single
crypto word to receive real money. That idea became Selip.

## What it does

Selip lets anyone send a money gift to a person who has never touched crypto.

- The sender picks an occasion, sets any amount, and can draw a custom card or
  drop in a photo.
- They can attach a rule, like refund if unclaimed or lock until a date.
- Selip creates one link and a QR code to share over WhatsApp, email, or any
  chat.
- The recipient opens the link, signs in with Google, and the gift is already
  theirs, claimed in one tap.

Behind the scenes an embedded wallet is created for them and upgraded to a smart
account on first claim, but they never see a wallet, a seed phrase, a chain, or
gas. The words only appear to promise their absence.

## How we built it

- Frontend: Next.js (App Router), TypeScript, and Tailwind, built as a PWA and
  hosted on Vercel. The UI is intentionally warm (coral, peach, amber) to feel
  like a gifting app, not a crypto dashboard.
- Onboarding: Magic embedded wallet, so a plain Google or email login creates a
  wallet with no seed phrase.
- Chain abstraction: Particle Universal Accounts (EIP-7702 mode) to upgrade the
  recipient account on the fly and let gifts be funded from any chain or asset.
- Programmable rules: ZeroDev session keys and permissions, so rules like refund
  if unclaimed are enforced at the account level.
- Settlement: a GiftEscrow smart contract written in Solidity with Foundry,
  deployed and source verified on Arbitrum.
- Data: Supabase Postgres holds only gift metadata. It never holds keys or funds.

The design rule we held to: the value and the rules live in the smart account and
the contract, not in the database. The database is disposable.

## Challenges we ran into

- Truly walletless onboarding. Making an account appear out of a Google login,
  then upgrading it to a smart account with EIP-7702 the first time someone
  claims, without ever exposing a seed phrase, took real care.
- Keeping it non-custodial. It would have been easy to sign transactions from a
  backend and cut corners. We refused, because that would put keys and funds on a
  server. Rules had to be enforced on-chain instead.
- Language discipline. Hiding every crypto word from the recipient flow, while
  still doing real on-chain work underneath, forced a clear split between the UI
  and the on-chain logic.
- Cross-chain funding. Letting a sender fund a gift from whatever asset they hold,
  on whatever chain, is a hard routing problem that Universal Accounts made
  possible.

## Accomplishments that we are proud of

- A live, verified GiftEscrow contract on Arbitrum. The on-chain proof is
  clickable, not a slide.
- A claim flow where the recipient truly never sees a wallet, a chain, or gas.
- A polished, warm product: custom card drawing with undo and redo, QR sharing,
  email notifications, refund and lock rules, and a real dashboard.
- Non-custodial by construction. No private keys or funds ever sit on the
  backend.

## What we learned

- The hardest part of crypto UX is not the smart contract, it is everything
  around it: the words, the onboarding, and the defaults.
- EIP-7702 and account abstraction are finally good enough to hide chains
  entirely from a normal user.
- Enforcing rules on-chain instead of in a backend is more work up front, but it
  is the whole point. It is what makes this different from a Web2 gift app.

## What's next for Selip

- Group gifts and pooling, so several people can chip in on one gift.
- Send to many recipients at once for events and teams.
- More funding sources and fiat on-ramps for senders.
- A social layer of thank-you notes and reveals.

We kept the scope tight on purpose for the hackathon: three core flows (create,
share, claim) done well, on real infrastructure, before any of the extras.

## Built with

next.js, typescript, tailwindcss, solidity, foundry, arbitrum, magic, particle-network, zerodev, eip-7702, supabase, vercel, remotion

## Links

- Live app: https://selip.vercel.app
- Pitch deck: https://selip.vercel.app/deck.html
- Contract (Arbitrum Sepolia, verified): https://sepolia.arbiscan.io/address/0x2548dc9aAEf1be2530966D8FCD26261C11a684bd
