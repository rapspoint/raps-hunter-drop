/**
 * /pages/api/cr.js
 * Server-side proxy untuk CryptoRank API v2.
 * API key disimpan di env var CRYPTORANK_API_KEY — tidak pernah expose ke browser.
 *
 * Usage: GET /api/cr?endpoint=currencies&limit=50
 * Supported endpoints: currencies, funding-rounds, global, drop-hunting
 */

const BASE = 'https://api.cryptorank.io/v2';

// Daftar endpoint yang diizinkan (whitelist)
const ALLOWED = [
  'currencies',
  'funding-rounds',
  'global',
  'drop-hunting',
  'currencies/map',
];

export default async function handler(req, res) {
  const apiKey = process.env.CRYPTORANK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'CRYPTORANK_API_KEY not set',
      hint: 'Tambahkan CRYPTORANK_API_KEY di Vercel → Settings → Environment Variables',
    });
  }

  const { endpoint, ...params } = req.query;

  if (!endpoint || !ALLOWED.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint', allowed: ALLOWED });
  }

  // Build query string (forward semua params + tambah api_key)
  const qs = new URLSearchParams({ ...params, api_key: apiKey }).toString();
  const url = `${BASE}/${endpoint}?${qs}`;

  try {
    const upstream = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    const data = await upstream.json();

    // Cache 3 menit di Vercel Edge
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=60');
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('CryptoRank proxy error:', err);
    res.status(502).json({ error: 'Upstream fetch failed', detail: err.message });
  }
}
