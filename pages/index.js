import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// ─── Curated Airdrop Hunts ──────────────────────────────────────────────────
const CURATED_HUNTS = [
  {
    id: 'monad',
    name: 'Monad Testnet',
    type: 'Testnet', category: 'L1', status: 'hot',
    desc: 'High-performance EVM L1 dengan 10,000 TPS. Testnet aktif, belum ada token.',
    steps: ['Daftar di monad.xyz', 'Minta faucet testnet', 'Deploy kontrak / lakukan swap di testnet DEX', 'Join Discord & selesaikan quest'],
    link: 'https://monad.xyz', difficulty: 'Medium', est_reward: 'High', chains: ['Monad'], hot: true,
  },
  {
    id: 'megaeth',
    name: 'MegaETH Testnet',
    type: 'Testnet', category: 'L2', status: 'hot',
    desc: 'Real-time blockchain L2 dengan 100,000 TPS. Backed Vitalik. Testnet baru.',
    steps: ['Join waitlist di megaeth.com', 'Aktif di Discord/testnet', 'Lakukan on-chain activity', 'Selesaikan misi di Galxe jika ada'],
    link: 'https://megaeth.com', difficulty: 'Easy', est_reward: 'Very High', chains: ['Ethereum'], hot: true,
  },
  {
    id: 'berachain',
    name: 'Berachain Ecosystem',
    type: 'Mainnet', category: 'L1', status: 'active',
    desc: 'EVM L1 dengan Proof of Liquidity. Ecosystem masih early, banyak proyek airdrop.',
    steps: ['Gunakan Berachain mainnet', 'Provide liquidity di BEX', 'Mint BGT / stake', 'Ikuti protokol baru di ecosystem Bera'],
    link: 'https://berachain.com', difficulty: 'Medium', est_reward: 'Medium-High', chains: ['Berachain'], hot: false,
  },
  {
    id: 'movement',
    name: 'Movement Labs',
    type: 'Testnet/Mainnet', category: 'L2', status: 'active',
    desc: 'Move-based L2 untuk Ethereum. Testnet aktif, mainnet sedang launch bertahap.',
    steps: ['Buat Move wallet', 'Bridge ke Movement testnet', 'Swap di Movement DEX', 'Ikuti misi di Galxe'],
    link: 'https://movementlabs.xyz', difficulty: 'Medium', est_reward: 'High', chains: ['Ethereum', 'Movement'], hot: false,
  },
  {
    id: 'initia',
    name: 'Initia',
    type: 'Testnet', category: 'L1', status: 'active',
    desc: 'Multi-VM L1 berbasis Cosmos. Raised $14M. Testnet Candy (points) berjalan.',
    steps: ['Daftar di app.testnet.initia.xyz', 'Selesaikan daily check-in', 'Lakukan aktivitas on-chain', 'Kumpulkan poin sebanyak mungkin'],
    link: 'https://initia.xyz', difficulty: 'Easy', est_reward: 'High', chains: ['Cosmos'], hot: false,
  },
  {
    id: 'aztec',
    name: 'Aztec Network',
    type: 'Testnet', category: 'L2', status: 'active',
    desc: 'Privacy-first ZK rollup di Ethereum. Developer testnet aktif, belum ada token.',
    steps: ['Install Aztec Sandbox', 'Deploy private kontrak', 'Ikuti developer docs', 'Join Discord developer'],
    link: 'https://aztec.network', difficulty: 'Hard', est_reward: 'High', chains: ['Ethereum'], hot: false,
  },
  {
    id: 'abstract',
    name: 'Abstract Chain',
    type: 'Mainnet', category: 'L2', status: 'active',
    desc: 'Consumer ZK L2 dari tim Pudgy Penguins. Baru mainnet, banyak NFT early.',
    steps: ['Setup Abstract global wallet', 'Mint NFT gratis', 'Gunakan dApp di ecosystem', 'Ikuti Abstract Global Wallet quests'],
    link: 'https://abs.xyz', difficulty: 'Easy', est_reward: 'Medium', chains: ['Abstract (ZK)'], hot: false,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTVL(val) {
  if (!val || val === 0) return '$0';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}
function formatDate(ts) {
  if (!ts) return '?';
  const d = new Date(typeof ts === 'number' && ts < 1e12 ? ts * 1000 : ts);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
function timeSince(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  return `${Math.floor(diff / 3600)}h lalu`;
}

// ─── Difficulty & Reward ──────────────────────────────────────────────────────
function DifficultyBar({ level }) {
  const n = { Easy: 1, Medium: 2, Hard: 3 }[level] || 1;
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', marginRight: 4 }}>DIFFICULTY</span>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: 1,
          background: i <= n ? (n === 1 ? 'var(--green)' : n === 2 ? 'var(--yellow)' : 'var(--red)') : 'var(--border)'
        }} />
      ))}
      <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4 }}>{level}</span>
    </div>
  );
}
function RewardTag({ level }) {
  const c = { High: 'var(--green)', 'Very High': 'var(--orange)', 'Medium-High': 'var(--cyan)', Medium: 'var(--yellow)', Low: 'var(--text-dim)' };
  return <span style={{ fontSize: 10, color: c[level] || 'var(--text-dim)' }}>EST: {level}</span>;
}

// ─── Status badge helper ──────────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    potential: { label: 'POTENTIAL', cls: 'badge-early' },
    confirmed: { label: 'CONFIRMED', cls: 'badge-active' },
    snapshot: { label: 'SNAPSHOT', cls: 'badge-l2' },
    verification: { label: 'VERIFY', cls: 'badge-defi' },
    'reward available': { label: 'CLAIM NOW', cls: 'badge-hot' },
    distributed: { label: 'DONE', cls: 'badge-nft' },
  };
  const s = status?.toLowerCase();
  const info = map[s] || { label: (status || 'ACTIVE').toUpperCase(), cls: 'badge-active' };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
}

// ─── CryptoRank Drop Hunt Card ────────────────────────────────────────────────
function CRDropCard({ drop, idx }) {
  return (
    <div className={`card${drop.twitterScore > 100000 ? ' hot' : ''}`}
         style={{ animationDelay: `${idx * 30}ms` }}>
      <div className="card-header">
        <div className="card-name">{drop.name}</div>
        <div className="card-badges">
          {statusBadge(drop.status)}
          {drop.rewardType && <span className="badge badge-defi">{drop.rewardType}</span>}
        </div>
      </div>

      {drop.description && (
        <div className="card-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {drop.description}
        </div>
      )}

      <div className="card-meta">
        {drop.fundsRaised > 0 && (
          <div className="meta-item">Raised: <span style={{ color: 'var(--yellow)' }}>{formatTVL(drop.fundsRaised)}</span></div>
        )}
        {drop.twitterScore > 0 && (
          <div className="meta-item">Twitter Score: <span>{(drop.twitterScore / 1000).toFixed(1)}K</span></div>
        )}
        {drop.startDate && (
          <div className="meta-item">Mulai: <span>{formatDate(drop.startDate)}</span></div>
        )}
      </div>

      <div className="card-footer">
        <div className="chain-pills">
          {drop.chains?.slice(0, 3).map(c => <span key={c} className="chain-pill">{c}</span>)}
        </div>
        {drop.link && (
          <a href={drop.link} target="_blank" rel="noopener noreferrer" className="action-link">
            BUKA →
          </a>
        )}
      </div>
    </div>
  );
}

// ─── CryptoRank Funding Card ──────────────────────────────────────────────────
function CRFundingCard({ round, idx }) {
  return (
    <div className="card" style={{ animationDelay: `${idx * 30}ms` }}>
      <div className="card-header">
        <div className="card-name">{round.projectName || round.name}</div>
        <div className="card-badges">
          <span className="badge badge-new">NEW RAISE</span>
          {round.roundType && <span className="badge badge-defi">{round.roundType}</span>}
        </div>
      </div>

      <div className="card-meta">
        {round.date && <div className="meta-item">Tanggal: <span>{formatDate(round.date)}</span></div>}
        {round.category && <div className="meta-item">Kategori: <span>{round.category}</span></div>}
        {round.blockchain && <div className="meta-item">Chain: <span>{round.blockchain}</span></div>}
      </div>

      {round.amount > 0 && (
        <div style={{ margin: '8px 0' }}>
          <div className="raise-amount">{formatTVL(round.amount)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>RAISED</div>
        </div>
      )}

      {round.investors?.length > 0 && (
        <div className="raise-investors">
          Investors: {round.investors.slice(0, 3).map(i => i.name || i).join(', ')}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)' }}>
        Proyek baru dapat funding → potensi airdrop untuk early users
      </div>

      <div className="card-footer">
        <span />
        {round.website && (
          <a href={round.website} target="_blank" rel="noopener noreferrer" className="action-link">SITUS →</a>
        )}
      </div>
    </div>
  );
}

// ─── DeFiLlama Protocol Card (no-token) ──────────────────────────────────────
function ProtocolCard({ protocol, idx }) {
  const chains = protocol.chains?.slice(0, 3) || [];
  const remaining = (protocol.chains?.length || 0) - 3;
  return (
    <div className={`card${protocol.tvl > 50e6 ? ' hot' : ''}`}
         style={{ animationDelay: `${idx * 30}ms` }}>
      <div className="card-header">
        <div className="card-name">{protocol.name}</div>
        <div className="card-badges">
          {protocol.tvl > 50e6 && <span className="badge badge-hot">🔥 HOT</span>}
          <span className="badge badge-early">NO TOKEN</span>
          <span className="badge badge-defi">{protocol.category || 'DeFi'}</span>
        </div>
      </div>
      <div className="card-meta">
        <div className="meta-item">TVL: <span className="tvl-value">{formatTVL(protocol.tvl)}</span></div>
        {protocol.change_1d != null && (
          <div className="meta-item">24h:{' '}
            <span style={{ color: protocol.change_1d >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {protocol.change_1d >= 0 ? '+' : ''}{protocol.change_1d?.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="card-desc">
        Protokol aktif dengan TVL signifikan namun belum menerbitkan token. Potensi airdrop retroaktif bagi pengguna early.
      </div>
      <div className="card-footer">
        <div className="chain-pills">
          {chains.map(c => <span key={c} className="chain-pill">{c}</span>)}
          {remaining > 0 && <span className="chain-pill">+{remaining}</span>}
        </div>
        <a href={`https://defillama.com/protocol/${protocol.slug}`} target="_blank" rel="noopener noreferrer" className="action-link">
          LIHAT →
        </a>
      </div>
    </div>
  );
}

// ─── Curated Hunt Card ────────────────────────────────────────────────────────
function HuntCard({ hunt, idx }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`card${hunt.hot ? ' hot' : ''}`} style={{ animationDelay: `${idx * 40}ms` }}>
      <div className="card-header">
        <div className="card-name">{hunt.name}</div>
        <div className="card-badges">
          {hunt.hot && <span className="badge badge-hot">🔥 HOT</span>}
          <span className="badge badge-early">{hunt.type}</span>
          <span className={`badge badge-${hunt.category === 'L2' ? 'l2' : 'defi'}`}>{hunt.category}</span>
        </div>
      </div>
      <div className="card-desc">{hunt.desc}</div>
      <div className="card-meta">
        <DifficultyBar level={hunt.difficulty} />
        <RewardTag level={hunt.est_reward} />
      </div>
      {expanded && (
        <div className="hunt-steps">
          {hunt.steps.map((s, i) => <div key={i} className="hunt-step">{s}</div>)}
        </div>
      )}
      <div className="card-footer">
        <div className="chain-pills">
          {hunt.chains.map(c => <span key={c} className="chain-pill">{c}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setExpanded(!expanded)} className="action-link"
            style={{ cursor: 'pointer', background: 'none', border: '1px solid var(--border-bright)' }}>
            {expanded ? 'TUTUP' : 'CARA'}
          </button>
          <a href={hunt.link} target="_blank" rel="noopener noreferrer" className="action-link">BUKA →</a>
        </div>
      </div>
    </div>
  );
}

// ─── Ticker Bar ───────────────────────────────────────────────────────────────
function TickerBar({ currencies, globalData }) {
  if (!currencies.length && !globalData) return null;
  return (
    <div className="ticker-bar">
      {globalData && (
        <>
          <span className="ticker-item">
            <span>MCAP:</span>
            <span className="ticker-up">{formatTVL(globalData.totalMarketCap)}</span>
          </span>
          <span className="ticker-item">
            <span>BTC DOM:</span>
            <span style={{ color: 'var(--cyan)' }}>{globalData.btcDominance?.toFixed(1)}%</span>
          </span>
        </>
      )}
      {currencies.slice(0, 6).map((c, i) => (
        <span key={i} className="ticker-item">
          <span style={{ color: 'var(--text)' }}>{c.symbol}</span>
          <span style={{ color: 'var(--text-dim)' }}>${c.price?.toFixed(c.price > 1 ? 2 : 6)}</span>
          {c.priceChange24h != null && (
            <span className={c.priceChange24h >= 0 ? 'ticker-up' : 'ticker-down'}>
              {c.priceChange24h >= 0 ? '+' : ''}{c.priceChange24h?.toFixed(1)}%
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

// ─── No API Key Banner ────────────────────────────────────────────────────────
function NoKeyBanner() {
  return (
    <div style={{
      margin: '16px 20px', padding: '14px 18px',
      background: '#1a1200', border: '1px solid #ffd70044',
      display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap'
    }}>
      <span style={{ fontSize: 20 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: 'var(--yellow)', fontWeight: 'bold', marginBottom: 4 }}>
          CRYPTORANK_API_KEY belum dikonfigurasi
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.7 }}>
          Tab <b style={{ color: 'var(--text)' }}>CR Drop Hunting</b> dan <b style={{ color: 'var(--text)' }}>CR Funding Rounds</b> butuh API key CryptoRank.{' '}
          Daftar gratis (Sandbox plan) di{' '}
          <a href="https://cryptorank.io/public-api" target="_blank" rel="noopener noreferrer"
             style={{ color: 'var(--cyan)' }}>cryptorank.io/public-api</a>
          , lalu tambahkan <code style={{ color: 'var(--green)', background: 'var(--bg3)', padding: '1px 5px' }}>CRYPTORANK_API_KEY=xxx</code>{' '}
          di Vercel → Settings → Environment Variables.
          <br />Lokal: buat file <code style={{ color: 'var(--green)', background: 'var(--bg3)', padding: '1px 5px' }}>.env.local</code> dari .env.local.example.
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState('hunts');
  const [protocols, setProtocols] = useState([]);
  const [crDrops, setCrDrops] = useState([]);
  const [crFunding, setCrFunding] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noKey, setNoKey] = useState(false);
  const [search, setSearch] = useState('');
  const [chainFilter, setChainFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // ── 1. DeFiLlama no-token protocols ──
    try {
      const pRes = await fetch('https://api.llama.fi/protocols');
      if (pRes.ok) {
        const pData = await pRes.json();
        const filtered = pData
          .filter(p => (!p.symbol || p.symbol === '-' || p.symbol === '') && p.tvl > 500000 && p.category !== 'CEX')
          .sort((a, b) => (b.tvl || 0) - (a.tvl || 0))
          .slice(0, 120);
        setProtocols(filtered);
      }
    } catch (e) { console.warn('DeFiLlama fetch failed:', e); }

    // ── 2. CryptoRank global ──
    try {
      const gRes = await fetch('/api/cr?endpoint=global');
      if (gRes.ok) {
        const gData = await gRes.json();
        // v2 global response shape may vary
        const d = gData.data || gData;
        setGlobalData({
          totalMarketCap: d.totalMarketCap || d.marketCap,
          btcDominance: d.btcDominance || d.bitcoinDominance,
        });
      } else if (gRes.status === 500) setNoKey(true);
    } catch (e) { console.warn('CryptoRank global failed:', e); }

    // ── 3. CryptoRank top currencies (for ticker) ──
    try {
      const cRes = await fetch('/api/cr?endpoint=currencies&limit=20&sort=rank');
      if (cRes.ok) {
        const cData = await cRes.json();
        const list = cData.data || cData.currencies || cData || [];
        const mapped = (Array.isArray(list) ? list : []).map(c => ({
          symbol: c.symbol || c.code,
          price: c.price || c.values?.USD?.price,
          priceChange24h: c.priceChange24h || c.values?.USD?.priceChange24h,
        })).filter(c => c.symbol);
        setCurrencies(mapped);
      }
    } catch (e) { console.warn('CryptoRank currencies failed:', e); }

    // ── 4. CryptoRank Drop Hunting ──
    try {
      const dRes = await fetch('/api/cr?endpoint=drop-hunting&limit=50');
      if (dRes.ok) {
        const dData = await dRes.json();
        const list = dData.data || dData.drops || dData || [];
        setCrDrops(Array.isArray(list) ? list : []);
      }
    } catch (e) { console.warn('CryptoRank drops failed:', e); }

    // ── 5. CryptoRank Funding Rounds ──
    try {
      const fRes = await fetch('/api/cr?endpoint=funding-rounds&limit=60');
      if (fRes.ok) {
        const fData = await fRes.json();
        const list = fData.data || fData.rounds || fData || [];
        setCrFunding(Array.isArray(list) ? list : []);
      }
    } catch (e) { console.warn('CryptoRank funding failed:', e); }

    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [fetchData]);

  // Filters
  const allChains = [...new Set(protocols.flatMap(p => p.chains || []))].sort();
  const allCats = [...new Set(protocols.map(p => p.category).filter(Boolean))].sort();

  const filteredProtocols = protocols.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const mc = chainFilter === 'all' || p.chains?.includes(chainFilter);
    const mcat = categoryFilter === 'all' || p.category === categoryFilter;
    return ms && mc && mcat;
  });

  const filteredDrops = crDrops.filter(d =>
    !search || (d.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredFunding = crFunding.filter(r =>
    !search || (r.projectName || r.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredHunts = CURATED_HUNTS.filter(h =>
    !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.desc.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'hunts',     label: '🎯 ACTIVE HUNTS',     count: filteredHunts.length },
    { id: 'crdrops',   label: '🪂 CR DROP HUNTING',   count: filteredDrops.length },
    { id: 'crfunding', label: '💰 CR FUNDING ROUNDS', count: filteredFunding.length },
    { id: 'protocols', label: '📊 NO TOKEN PROTOCOLS', count: filteredProtocols.length },
  ];

  return (
    <>
      <Head>
        <title>AIRDROP HUNTER | Realtime Alpha</title>
        <meta name="description" content="Realtime airdrop hunter: CryptoRank drop hunting, funding rounds, DeFiLlama no-token protocols." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🪂</text></svg>" />
      </Head>

      {/* Header */}
      <div className="header">
        <div className="logo"><span className="logo-icon">🪂</span>AIRDROP.HUNT</div>
        <div className="header-right">
          <span className="status-dot" /> LIVE
          {lastUpdate && <span style={{ color: 'var(--text-dim)' }}>Updated {timeSince(lastUpdate)}</span>}
          <button className="refresh-btn" onClick={fetchData} disabled={loading}>
            {loading ? '...' : '⟳ REFRESH'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item"><div className="stat-label">Active Hunts</div><div className="stat-value">{CURATED_HUNTS.length}</div></div>
        <div className="stat-item"><div className="stat-label">CR Drops</div><div className="stat-value">{crDrops.length || '–'}</div></div>
        <div className="stat-item"><div className="stat-label">CR Funding</div><div className="stat-value">{crFunding.length || '–'}</div></div>
        <div className="stat-item"><div className="stat-label">No-Token Protocols</div><div className="stat-value">{protocols.length}</div></div>
        <div className="stat-item"><div className="stat-label">Data Sources</div><div className="stat-value" style={{ fontSize: 11, color: 'var(--cyan)' }}>CryptoRank + DeFiLlama</div></div>
      </div>

      {/* Ticker */}
      <TickerBar currencies={currencies} globalData={globalData} />

      {/* No key warning */}
      {noKey && <NoKeyBanner />}

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            <span className="tab-badge">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="search-input"
          placeholder={`> SEARCH...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {tab === 'protocols' && (
          <>
            <select className="filter-select" value={chainFilter} onChange={e => setChainFilter(e.target.value)}>
              <option value="all">ALL CHAINS</option>
              {allChains.slice(0, 30).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">ALL CATEGORIES</option>
              {allCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </>
        )}
        {error && <span style={{ color: 'var(--red)', fontSize: 12 }}>⚠ {error}</span>}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <div className="loading-text">FETCHING ALPHA DATA...</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>CryptoRank · DeFiLlama · ...</div>
        </div>
      ) : (
        <>
          {/* ACTIVE HUNTS */}
          {tab === 'hunts' && (
            <>
              <div className="section-header">CURATED ALPHA — Proyek early stage dengan potensi airdrop tinggi</div>
              <div className="cards-grid">
                {filteredHunts.length === 0
                  ? <div className="empty-state"><div className="empty-icon">🔍</div><div>Tidak ada hasil</div></div>
                  : filteredHunts.map((h, i) => <HuntCard key={h.id} hunt={h} idx={i} />)
                }
              </div>
            </>
          )}

          {/* CRYPTORANK DROP HUNTING */}
          {tab === 'crdrops' && (
            <>
              <div className="section-header">CRYPTORANK — Live drop hunting list</div>
              {filteredDrops.length === 0
                ? <div className="empty-state"><div className="empty-icon">🪂</div>
                    <div>{noKey ? 'Tambahkan CRYPTORANK_API_KEY untuk melihat data ini.' : 'Tidak ada data airdrop.'}</div>
                  </div>
                : <div className="cards-grid">
                    {filteredDrops.map((d, i) => <CRDropCard key={d.id || i} drop={d} idx={i} />)}
                  </div>
              }
            </>
          )}

          {/* CRYPTORANK FUNDING ROUNDS */}
          {tab === 'crfunding' && (
            <>
              <div className="section-header">CRYPTORANK — Recent funding rounds → early airdrop candidates</div>
              {filteredFunding.length === 0
                ? <div className="empty-state"><div className="empty-icon">💰</div>
                    <div>{noKey ? 'Tambahkan CRYPTORANK_API_KEY untuk melihat data ini.' : 'Tidak ada data funding.'}</div>
                  </div>
                : <div className="cards-grid">
                    {filteredFunding.map((r, i) => <CRFundingCard key={r.id || i} round={r} idx={i} />)}
                  </div>
              }
            </>
          )}

          {/* DEFILAMA NO-TOKEN PROTOCOLS */}
          {tab === 'protocols' && (
            <>
              <div className="section-header">DEFILLAMA — Protokol aktif TVL &gt; $500K namun BELUM punya token</div>
              {filteredProtocols.length === 0
                ? <div className="empty-state"><div className="empty-icon">📡</div><div>Tidak ada data</div></div>
                : <div className="cards-grid">
                    {filteredProtocols.map((p, i) => <ProtocolCard key={p.slug || p.name} protocol={p} idx={i} />)}
                  </div>
              }
            </>
          )}
        </>
      )}

      {/* Footer */}
      <div className="footer">
        <div style={{ marginBottom: 6 }}>⚠ DISCLAIMER: Ini bukan financial advice. DYOR sebelum berinteraksi dengan protokol apapun.</div>
        <div>
          Data dari{' '}
          <a href="https://cryptorank.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>CryptoRank</a>
          {' · '}
          <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>DeFiLlama</a>
          {' · Auto-refresh 5 menit · '}
          <span style={{ color: 'var(--green-dim)' }}>AIRDROP.HUNT</span>
        </div>
      </div>
    </>
  );
}
