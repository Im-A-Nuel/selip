# MVP Roadmap

## MVP Definition

MVP Selip adalah satu alur penuh yang berfungsi mulus dan ter-deploy ke mainnet: pengirim membuat + mendanai kado dari satu aset, mengaktifkan satu aturan terprogram, lalu penerima tanpa wallet mengklaim via login Google dan mencairkan ke chain berbeda. Tiga fitur ini wajib jalan sempurna; semua yang lain adalah roadmap.

Prinsip pemandu: satu alur sempurna mengalahkan lima fitur setengah jadi. Referensi pemenang hackathon serupa semuanya deploy ke mainnet dengan bukti on-chain yang dapat diklik juri; itu garis dasar, bukan nilai tambah.

## Timeline Overview

| Minggu | Fokus | Output kunci |
|---|---|---|
| 1 | Setup + spike SDK | satu transaksi cross-chain tembus |
| 2 | Sisi pengirim | kado bisa dibuat & didanai |
| 3 | Alur klaim | penerima baru bisa klaim end-to-end |
| 4 | Cross-chain + aturan + mainnet | syarat wajib UA & ZeroDev terpenuhi, deploy mainnet |
| 5 | UI "wah" | demo terasa seperti produk konsumen jadi |
| 6 | Demo + pitch | submission rapi, demo lancar, video backup |

---

## Phase 1: Foundation (Minggu 1)
**Goal**: Semua SDK terpasang dan satu transaksi cross-chain berhasil

### Tasks
- [ ] Setup repo, Next.js + TypeScript + Tailwind, struktur folder
- [ ] Buat akun Particle Dashboard, Magic, ZeroDev; isi env
- [ ] Pastikan pakai Universal Accounts SDK versi terbaru (V2) sejak awal
- [ ] Spike: jalankan quickstart UA dari script Node sampai satu transaksi cross-chain berhasil
- [ ] Validasi mode 7702 aktif dan berfungsi
- [ ] Deploy contract escrow kosong ke Arbitrum testnet

---

## Phase 2: Core Features (Minggu 2-4)
**Goal**: Tiga fitur inti berfungsi end-to-end di mainnet

### Minggu 2 - Sisi pengirim
- [ ] UI buat kado: okasi, nominal, pesan, tema (sudah ada gambaran desain)
- [ ] Integrasi UA untuk pendanaan dari satu aset
- [ ] Generate link klaim, simpan metadata ke Postgres
- [ ] Endpoint POST /api/gifts dan /fund

### Minggu 3 - Alur klaim (jantung proyek, beri waktu lebih)
- [ ] Halaman buka kado resolve dari slug
- [ ] Login Magic (Google/email)
- [ ] Upgrade EOA penerima ke UA via 7702 saat klaim pertama
- [ ] Transfer dana escrow ke akun penerima
- [ ] Endpoint claim, kunci status setelah diklaim

### Minggu 4 - Cross-chain, aturan, mainnet
- [ ] Klaim lintas chain: penerima pilih chain/aset tujuan, UA route
- [ ] Aturan refund otomatis (ZeroDev permission): refund ke pengirim jika tidak diklaim dalam N hari
- [ ] Deploy ke Arbitrum mainnet (JANGAN tunda ke minggu 6)
- [ ] Verifikasi bukti on-chain (tx hash, contract address) dapat diklik

---

## Phase 3: Polish & Demo-Ready (Minggu 5-6)
**Goal**: Produk siap di-demo dengan UI yang menang dan pitch yang tajam

### Minggu 5 - UI "wah" (menentukan menang/kalah)
- [ ] Animasi unwrapping kado di momen reveal
- [ ] Micro-interactions tiap langkah, confetti saat saldo muncul
- [ ] Palet hangat (coral/peach), bukan biru crypto klise
- [ ] Mobile-first, uji di HP bersih
- [ ] Empty states, loading states, error states

### Minggu 6 - Demo + pitch
- [ ] Rekam video demo (backup wajib untuk antisipasi gagal jaringan)
- [ ] Tulis submission: sertakan tx hash + contract address yang dapat diklik
- [ ] Siapkan slide pitch dengan roadmap (pooling, kirim massal, loop sosial)
- [ ] Latihan demo live, termasuk skenario kirim kado ke email juri
- [ ] Pertajam jawaban "kenapa harus blockchain": sandar ke pooling lintas chain + aturan trustless

---

## Parking Lot (Post-MVP, untuk slide roadmap)
- Kado patungan (banyak pengirim ke satu kado, pooling lintas chain)
- Kirim massal THR ke banyak penerima via satu link
- Loop sosial: reaksi penerima, balasan thank-you
- Multi-aset pengirim simultan
- Aturan tambahan: buka pada tanggal tertentu, cair bertahap
- Aplikasi mobile native

---

## Definition of Done
- Alur berjalan end-to-end di Arbitrum mainnet
- Bukti on-chain dapat diklik dari submission
- Tidak ada critical bug pada alur klaim (alur paling kritis untuk demo)
- Berfungsi di browser mobile
- Video demo backup terekam

---

## Risiko & Mitigasi
- UA migrasi V2 di tengah jalan: kunci versi terbaru sejak Minggu 1
- Alur klaim untuk user tanpa wallet adalah titik paling rapuh: uji berulang dengan email/device bersih
- Demo live gagal jaringan: video backup terekam sebagai fallback
- Scope creep ke fitur roadmap: tahan; tiga fitur inti dulu, sisanya slide
