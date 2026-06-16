# Requirements

## Problem Statement

Mengirim nilai (uang) ke orang yang belum punya crypto wallet itu mustahil mulus hari ini. Penerima harus membuat wallet, mengamankan seed phrase, memahami chain dan gas, lalu bridging jika asetnya beda chain. Setiap langkah itu menggugurkan orang awam. Akibatnya crypto tetap niche: hanya berputar di antara orang yang sudah paham crypto.

Selip menyerang penghalang adopsi paling fundamental ini dengan membungkus pengiriman nilai sebagai pemberian kado. Yang membedakan Selip dari aplikasi pembayaran Web2 (yang sudah mulus untuk transfer biasa): Selip menggabungkan aset lintas chain dalam satu kado dan menegakkan aturan kado lewat smart account, dua hal yang tidak bisa dilakukan rail pembayaran tradisional.

## Goals & Non-Goals

### Goals (In Scope untuk MVP)
- Pengirim dapat membuat kado dan mendanainya dari minimal satu aset di satu chain
- Penerima tanpa wallet dapat mengklaim kado hanya dengan login Google/email
- Saat klaim pertama, EOA penerima di-upgrade menjadi Universal Account via EIP-7702
- Minimal satu operasi lintas chain terjadi (penerima cairkan ke chain berbeda dari sumber dana)
- Minimal satu aturan terprogram aktif dan dapat didemonstrasikan (refund otomatis jika tidak diklaim dalam periode tertentu)
- Aplikasi ter-deploy ke Arbitrum mainnet dengan bukti on-chain yang dapat diklik (tx hash, contract address)

### Non-Goals (Out of Scope MVP, masuk roadmap)
- Kado patungan (multiple sender ke satu kado)
- Kirim massal ke banyak penerima dalam satu link
- Loop sosial (reaksi, balasan thank-you)
- Multi-aset pengirim simultan
- Aplikasi mobile native (MVP web responsive saja)
- Marketplace tema kartu

## Functional Requirements

### FR-01: Buat Kado
- Deskripsi: pengirim memilih okasi, nominal, menulis pesan, memilih tema kartu
- Input: okasi (enum), nominal (angka), pesan (teks), tema (enum)
- Output: objek kado tersimpan dengan status "draft"
- Priority: High

### FR-02: Danai Kado dari Aset Lintas Chain
- Deskripsi: pengirim membayar nilai kado dari aset yang dipilih; Universal Accounts me-route konversi
- Input: aset sumber + chain sumber, nominal
- Output: kado berstatus "funded", dana terkunci di smart account, link klaim ter-generate
- Priority: High

### FR-03: Aturan Terprogram
- Deskripsi: pengirim mengaktifkan satu aturan; di MVP aturan default adalah refund otomatis ke pengirim jika tidak diklaim dalam N hari
- Input: jenis aturan + parameter (periode)
- Output: aturan tertanam pada smart account kado
- Priority: High (pembeda teknis, mengunci subtrack ZeroDev)

### FR-04: Klaim Walletless
- Deskripsi: penerima membuka link, login Google/email via Magic, EOA di-upgrade ke UA via 7702, dana ditransfer
- Input: link klaim, kredensial Google/email
- Output: saldo kado masuk ke akun penerima
- Priority: High (jantung produk, mengunci bonus Magic)

### FR-05: Klaim Lintas Chain
- Deskripsi: penerima memilih chain/aset tujuan untuk mencairkan; UA me-route
- Input: pilihan chain/aset tujuan
- Output: nilai diterima di chain/aset pilihan penerima
- Priority: High (memenuhi syarat wajib UA, mengunci bonus Arbitrum sebagai settlement)

## Non-Functional Requirements

- Performance: alur klaim (dari klik link sampai saldo muncul) selesai dalam < 15 detik di kondisi jaringan normal
- UX: penerima tidak pernah melihat istilah "wallet", "seed phrase", "gas", atau "chain" kecuali dalam konteks menjanjikan ketiadaannya
- Security: dana kado tidak dapat diklaim oleh pihak selain pemegang link yang berhasil login; aturan refund dijamin di level smart account
- Reliability: alur klaim wajib punya video demo backup terekam, mengingat risiko jaringan saat demo live
- Compatibility: berfungsi di browser mobile (penerima kemungkinan besar membuka link dari HP)

## Constraints
- Solo builder, 6 minggu
- Universal Accounts SDK sedang migrasi ke V2; wajib pakai versi terbaru sejak awal untuk hindari breaking change
- Demo live berisiko (RPC, jaringan); butuh fallback

## Assumptions
- Pengirim sudah memiliki aset crypto dan familiar dengan crypto secukupnya
- Penerima memiliki akun Google/email dan akses browser mobile
- Particle, Magic, dan ZeroDev menyediakan akses gratis/cukup untuk skala hackathon
