# 🪂 AIRDROP.HUNT — Realtime Airdrop Hunter

Dashboard realtime untuk mencari peluang airdrop. Menggabungkan data dari **CryptoRank** (drop hunting + funding rounds) dan **DeFiLlama** (no-token protocols).

## Features
- 🎯 **Active Hunts** — Daftar proyek early stage dikurasi manual + langkah interaksi
- 🪂 **CR Drop Hunting** — Live airdrop list dari CryptoRank (status: potential/confirmed/snapshot/dll)
- 💰 **CR Funding Rounds** — Proyek yang baru dapat VC funding (kandidat airdrop)
- 📊 **No-Token Protocols** — Data live dari DeFiLlama: protokol aktif tanpa token
- 📈 Ticker bar: harga live top currencies + global market cap (CryptoRank)
- 🔄 Auto-refresh 5 menit

## API
| Sumber | Digunakan untuk | Gratis? |
|---|---|---|
| [CryptoRank v2](https://cryptorank.io/public-api) | Drop hunting, funding rounds, currencies | ✅ Sandbox gratis (API key dibutuhkan) |
| [DeFiLlama](https://defillama.com/docs/api) | No-token protocols | ✅ Tidak butuh key |

## Setup API Key CryptoRank

1. Buka [cryptorank.io/public-api](https://cryptorank.io/public-api)
2. Klik **"Start for free"** (Sandbox plan — $0/bulan)
3. Daftar akun → generate API key
4. Copy API key kamu

**Lokal:**
```bash
cp .env.local.example .env.local
# Edit .env.local, isi CRYPTORANK_API_KEY=xxx
```

**Vercel:**
Dashboard → Project → Settings → Environment Variables
```
CRYPTORANK_API_KEY = [api key kamu]
```

## Deploy ke Vercel dari GitHub

```bash
git init
git add .
git commit -m "init: airdrop hunter"
git remote add origin https://github.com/USERNAME/airdrop-hunter.git
git push -u origin main
```

Buka [vercel.com](https://vercel.com) → Add New Project → Import → Deploy
Lalu tambahkan env var `CRYPTORANK_API_KEY` di Vercel settings.

## Jalankan Lokal

```bash
npm install
cp .env.local.example .env.local   # isi API key
npm run dev
```
Buka http://localhost:3000

## Keamanan API Key
API key CryptoRank **tidak pernah expose ke browser**. Semua request ke CryptoRank melalui `/api/cr.js` (Next.js API route server-side), sehingga key aman.
