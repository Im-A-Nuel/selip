# Database & API Design

## Database Schema

State on-chain memegang nilai dan aturan; database hanya memegang metadata agar UI cepat dan link bisa di-resolve. Database tidak pernah memegang dana atau kunci.

### gifts
| Field | Type | Constraint | Description |
|---|---|---|---|
| id | UUID | PRIMARY KEY | id internal kado |
| claim_slug | TEXT | UNIQUE, NOT NULL | bagian dari URL klaim (mis. a8f3-rizki) |
| occasion | TEXT | NOT NULL | enum: birthday, thr, graduation, wedding |
| amount_display | TEXT | NOT NULL | nominal untuk ditampilkan (mis. "250.000 IDR") |
| message | TEXT | | pesan dari pengirim |
| card_theme | TEXT | NOT NULL | enum tema kartu |
| rule_type | TEXT | NOT NULL | enum: refund_if_unclaimed, unlock_on_date, vested |
| rule_param | JSONB | | parameter aturan (mis. {"days": 30}) |
| status | TEXT | NOT NULL | draft, funded, claimed, refunded, expired |
| source_chain | TEXT | | chain sumber dana |
| smart_account_addr | TEXT | | alamat smart account kado |
| funding_tx | TEXT | | tx hash pendanaan (bukti on-chain) |
| claim_tx | TEXT | | tx hash klaim (bukti on-chain) |
| created_at | TIMESTAMP | DEFAULT now() | |
| claimed_at | TIMESTAMP | | |

### Relationships
MVP cukup satu tabel. Post-MVP: tabel `contributors` (banyak pengirim ke satu gift, untuk pooling) dan `recipients` (batch penerima, untuk kirim massal) berelasi many-to-one ke `gifts`.

---

## API Design

### Base URL
`/api` (Next.js API routes, satu origin dengan frontend)

### Authentication
Sesi penerima diautentikasi via Magic (token dari SDK). Endpoint pembuatan kado memerlukan sesi pengirim yang terhubung.

### Endpoints

#### Gifts

**POST /api/gifts**
- Description: buat kado baru berstatus draft
- Auth required: Yes (sesi pengirim)
- Request body: `{ occasion, amount_display, message, card_theme, rule_type, rule_param }`
- Response: `{ id, claim_slug, status: "draft" }`
- Error codes: 400 (input invalid), 401 (belum login)

**POST /api/gifts/:id/fund**
- Description: tandai kado funded setelah transaksi pendanaan on-chain dikonfirmasi
- Auth required: Yes
- Request body: `{ source_chain, smart_account_addr, funding_tx }`
- Response: `{ status: "funded", claim_url }`
- Error codes: 400, 401, 404, 409 (sudah funded)

**GET /api/gifts/by-slug/:slug**
- Description: resolve link klaim ke metadata kado (untuk render halaman buka kado)
- Auth required: No
- Response: `{ occasion, amount_display, message, card_theme, status }`
- Error codes: 404 (slug tidak ada), 410 (sudah diklaim/expired)

**POST /api/gifts/:id/claim**
- Description: catat klaim setelah transfer on-chain ke akun penerima berhasil
- Auth required: Yes (sesi penerima via Magic)
- Request body: `{ recipient_addr, dest_chain, claim_tx }`
- Response: `{ status: "claimed" }`
- Error codes: 401, 404, 409 (sudah diklaim), 410 (expired)

### Error Response Format
```json
{ "error": { "code": "GIFT_ALREADY_CLAIMED", "message": "Kado ini sudah dibuka." } }
```

---

## Smart Contract Interface

### GiftEscrow (per-kado, smart account dengan aturan)
- Address: di-deploy per kado di Arbitrum (mainnet untuk submission)
- Functions:
  - `fund()` payable: kunci nilai kado ke escrow
  - `claim(address recipient)`: transfer nilai ke penerima; hanya valid jika belum diklaim dan belum expired
  - `refund()`: kembalikan ke pengirim; hanya valid setelah periode lewat tanpa klaim
- Events:
  - `Funded(address sender, uint256 amount)` -- saat kado didanai
  - `Claimed(address recipient, uint256 amount)` -- saat kado diklaim
  - `Refunded(address sender, uint256 amount)` -- saat refund otomatis

Catatan: implementasi aturan memanfaatkan permission/session key ZeroDev sehingga refund dapat dieksekusi otomatis tanpa tanda tangan manual pengirim. Routing lintas chain untuk pendanaan dan pencairan ditangani Universal Accounts SDK, bukan kontrak ini.
