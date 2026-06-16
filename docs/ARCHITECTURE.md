# System Architecture

## Overview

Selip adalah aplikasi Next.js full-stack (frontend + API routes) yang mengorkestrasi tiga SDK Web3 (Particle Universal Accounts, Magic, ZeroDev) di atas Arbitrum sebagai chain settlement. Tidak ada backend terpisah; state ringan (metadata kado, status, link) disimpan di Postgres. Seluruh logika nilai dan aturan hidup di smart account, bukan di database.

## System Diagram

```
   PENGIRIM                                    PENERIMA
      |                                            |
      v                                            v
 [ Next.js UI ] <------- link klaim --------> [ Next.js UI ]
      |                                            |
      | danai                                      | login Google
      v                                            v
 [ Universal Accounts SDK (7702) ]          [ Magic embedded wallet ]
      |                                            |
      | route lintas chain                         | upgrade EOA -> UA (7702)
      v                                            v
 [ Smart account kado + aturan (ZeroDev) ] <--- klaim ---
      |                                            |
      v                                            v
            [ Arbitrum (settlement) ]
                     ^
                     |
            [ Postgres: metadata kado, status, link ]  (off-chain, non-kustodial)
```

## Tech Stack

### Frontend
- Framework: Next.js App Router + TypeScript
- Styling: Tailwind CSS
- State: React state + server components; tidak perlu Redux/Zustand untuk scope ini
- Animasi: CSS/Framer Motion untuk momen unwrapping kado

### Backend
- Runtime: Next.js API routes (Node.js)
- Fungsi: generate link klaim, simpan metadata kado, webhook status; TIDAK menyimpan kunci atau dana

### Database
- Postgres via Supabase: tabel kado (metadata, status, referensi on-chain). Alasan: cukup ringan, gratis untuk skala hackathon, cepat di-setup

### Blockchain
- Network: Arbitrum (settlement utama, mengunci bonus Arbitrum)
- Chain abstraction: Particle Universal Accounts SDK dalam mode EIP-7702
- Programmable rules: ZeroDev session keys/permissions untuk aturan refund
- Onboarding: Magic embedded wallet sebagai signer awal penerima

### Infrastructure
- Hosting: Vercel
- CI/CD: deploy otomatis dari GitHub via Vercel

## Key Design Decisions

- Keputusan: submit ke General Track, bukan Universal Accounts Track
  - Alasan: kriteria General (UX 30%, Creativity 30%) menguntungkan kekuatan proyek; UA Track memberi bobot 30% pada kedalaman teknis 7702 yang sulit dimenangkan solo melawan spesialis chain abstraction
  - Alternatif ditolak: UA Track (kompetisi terlalu dalam secara teknis untuk solo)

- Keputusan: aturan kado disimpan di smart account, bukan database
  - Alasan: refund yang dijamin kode adalah pembeda dari Web2; jika hanya di DB maka sama saja dengan transfer biasa dan menggugurkan argumen "kenapa harus blockchain"
  - Alternatif ditolak: logika refund di backend (tidak trustless, melemahkan pitch)

- Keputusan: upgrade EOA ke UA dilakukan on-the-fly saat klaim pertama
  - Alasan: penerima tidak perlu deploy smart account di muka; ini pemakaian 7702 yang elegan dan bisa dipamerkan ke juri Particle
  - Alternatif ditolak: smart account deploy di muka (menambah friksi dan biaya)

## Security Considerations
- Dana hanya dapat diklaim oleh sesi yang berhasil login melalui Magic dan memegang link valid
- Aturan refund ditegakkan di level kontrak, tidak dapat di-bypass oleh backend
- Backend bersifat non-kustodial: tidak menyimpan private key maupun dana
- Validasi: link klaim sekali pakai; setelah diklaim, status terkunci

## Scalability Plan
- Skala hackathon tidak butuh scaling khusus
- Post-MVP: pooling dan kirim massal akan menambah tabel relasi (contributor, recipient batch) dan kemungkinan indexing event on-chain
