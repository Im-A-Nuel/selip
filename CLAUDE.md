# CLAUDE.md

## Project
Selip -- slip someone a gift, no wallet needed. Aplikasi kirim hadiah uang lintas chain untuk orang non-crypto. Dibangun untuk UXmaxx Hackathon, General Track, solo, 6 minggu.

## Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind
- Onboarding: Magic embedded wallet (login Google/email)
- Chain abstraction: Particle Universal Accounts SDK (EIP-7702 mode, versi V2 terbaru)
- Programmable rules: ZeroDev (session keys / permissions)
- Settlement: Arbitrum
- DB: Postgres via Supabase (metadata kado saja, non-kustodial)
- Hosting: Vercel

## Commands
```bash
pnpm install          # install deps
pnpm dev              # dev server
pnpm test             # tests
pnpm build            # production build
```

## Project Structure
```
app/          # routes: sender flow, claim flow, api
components/    # gift card, steppers, reveal animation
lib/          # particle.ts, magic.ts, zerodev.ts, db.ts
contracts/    # GiftEscrow + deploy scripts
docs/         # dokumen proyek
```

## Key Conventions
- Semua integrasi SDK melalui /lib, jangan panggil SDK langsung dari komponen
- Komponen UI presentational; logika on-chain di /lib dan hooks
- Copy untuk penerima: TIDAK PERNAH munculkan kata "wallet", "seed phrase", "gas", "chain" kecuali untuk menjanjikan ketiadaannya
- Palet warna hangat (coral/peach/amber), hindari biru/ungu crypto klise

## Architecture Notes
- Nilai dan aturan kado hidup di smart account, BUKAN di database. Database hanya metadata.
- Aturan refund ditegakkan di level kontrak (ZeroDev permission), bukan di backend. Ini pembeda dari Web2; jangan pindahkan ke backend.
- Upgrade EOA penerima ke UA dilakukan on-the-fly saat klaim pertama via 7702, bukan deploy di muka.
- Routing lintas chain (pendanaan & pencairan) ditangani Universal Accounts SDK, bukan kontrak GiftEscrow.
- Deploy ke Arbitrum mainnet di Minggu 4, bukan akhir. Bukti on-chain harus dapat diklik.

## Do NOT
- Jangan submit ke Universal Accounts Track; submit ke General Track (keputusan strategi, lihat ARCHITECTURE.md)
- Jangan bangun fitur parking lot (pooling, kirim massal, loop sosial) sebelum tiga fitur inti jalan sempurna
- Jangan pakai em dash di teks apa pun yang dihasilkan
- Jangan simpan private key atau dana di backend/database
- Jangan install library baru tanpa konfirmasi

## Current Focus
Minggu 1: setup SDK dan spike satu transaksi cross-chain berhasil.
