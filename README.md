# Selip

Slip someone a gift. No wallet needed.

## Overview

Selip adalah aplikasi pengiriman hadiah uang lintas chain untuk orang yang tidak mengerti crypto. Pengirim membuat kado, mendanainya dari aset apa pun di chain mana pun, dan membagikan satu link. Penerima membuka link, login dengan Google, dan hadiahnya langsung ada. Mereka tidak pernah melihat seed phrase, tidak menginstal apa pun, dan tidak perlu tahu ada blockchain di baliknya.

Masalah yang diselesaikan: mengirim nilai ke orang yang belum punya wallet itu mustahil mulus di Web3 hari ini. Selip menyembunyikan seluruh kompleksitas (wallet, gas, chain, bridging) di balik metafora yang sudah dipahami semua orang: memberi kado. Yang membuat Selip tidak bisa ditiru aplikasi Web2 biasa adalah dua hal: penggabungan aset lintas chain dalam satu kado (pooling) dan aturan kado yang dijamin kode (trustless conditions), bukan sekadar transfer.

Target user: pengirim adalah orang yang punya aset crypto dan ingin memberi hadiah; penerima adalah siapa pun, termasuk yang sama sekali belum pernah menyentuh crypto. Konteks: dibangun untuk UXmaxx Hackathon (6 minggu, solo builder), menargetkan General Track plus bonus Magic, Arbitrum, dan subtrack ZeroDev.

## Tech Stack

| Layer | Pilihan |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind |
| Onboarding / wallet | Magic embedded wallet (login Google/email) |
| Chain abstraction | Particle Network Universal Accounts SDK (EIP-7702 mode) |
| Programmable rules | ZeroDev (session keys / permissions) |
| Settlement chain | Arbitrum |
| Backend | Next.js API routes + lightweight DB (Postgres via Supabase) |
| Hosting | Vercel |

## Quick Start

```bash
git clone <repo-url> selip
cd selip
pnpm install
cp .env.example .env.local   # isi kunci Particle, Magic, ZeroDev, RPC Arbitrum
pnpm dev
```

## Project Structure

```
selip/
  app/              # Next.js routes (sender flow, claim flow, api)
  components/       # UI components (gift card, steppers, reveal animation)
  lib/              # integrasi SDK: particle.ts, magic.ts, zerodev.ts, db.ts
  contracts/        # smart account rule logic + deploy scripts
  docs/             # dokumen proyek ini
```

## Features (MVP)

- Buat kado: pilih okasi, nominal, pesan, tema kartu
- Danai kado dari aset apa pun lintas chain (Universal Accounts)
- Satu aturan terprogram aktif (refund otomatis jika tidak diklaim)
- Klaim walletless: login Google, EOA di-upgrade jadi UA via 7702 saat klaim
- Klaim lintas chain: penerima cairkan ke chain/aset pilihannya

## License

MIT. Pembuat memegang penuh hak IP (sesuai aturan hackathon).
