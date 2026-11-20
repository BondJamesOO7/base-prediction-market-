import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { Loader2, Search, TriangleAlert, X } from 'lucide-react'
import { BetSheet } from './components/BetSheet'
import { CreateSheet } from './components/CreateSheet'
import { Footer } from './components/Footer'
import { MarketCard } from './components/MarketCard'
import { WalletPanel } from './components/WalletPanel'
import { useMarkets } from './hooks/useMarkets'
import { useNow } from './hooks/useNow'
import { MARKET_ADDRESS, getStatus, type MarketView } from './lib/market'

type Filter = 'all' | 'open' | 'pending' | 'settled' | 'mine'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'pending', label: 'Needs result' },
  { id: 'settled', label: 'Settled' },
  { id: 'mine', label: 'My bets' },
]

function BaseLogo({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 111 111" fill="none" xmlns="http://w3.org" className={className} aria-hidden="true">
      <rect width="111" height="111" rx="26" fill="#0052FF" />
      <path d="M54.921 91C74.294 91 90 75.33 90 56C90 36.67 74.294 21 54.921 21C36.609 21 21.584 35.03 20 52.893H66.085V59.107H20C21.584 76.97 36.609 91 54.921 91Z" fill="white" />
    </svg>
  )
}

function getMarketText(market: MarketView): string {
  const record = market as unknown as Record<string, unknown>
  for (const key of ['question', 'title', 'prompt', 'description', 'name']) {
    if (typeof record[key] === 'string') return record[key]
  }
  return ''
}

export default function App() {
  const now = useNow()
  const { markets, total, owner, isLoading, isError, refetchAll } = useMarkets()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [bet, setBet] = useState<{ market: MarketView; isYes: boolean } | null>(null)

  function matchesFilter(m: MarketView, targetFilter: Filter) {
    const status = getStatus(m, now)
    if (targetFilter === 'open') return status === 'open'
    if (targetFilter === 'pending') return status === 'awaiting'
    if (targetFilter === 'settled') return status === 'resolved' || status === 'refund'
    if (targetFilter === 'mine') return m.yesStake > 0n || m.noStake > 0n
    return true
  }

  const query = search.trim().toLowerCase()
  const searchedMarkets = query ? markets.filter((m) => getMarketText(m).toLowerCase().includes(query)) : markets
  const visible = searchedMarkets.filter((m) => matchesFilter(m, filter))

  const counts: Record<Filter, number> = {
    all: searchedMarkets.length,
    open: searchedMarkets.filter((m) => matchesFilter(m, 'open')).length,
    pending: searchedMarkets.filter((m) => matchesFilter(m, 'pending')).length,
    settled: searchedMarkets.filter((m) => matchesFilter(m, 'settled')).length,
    mine: searchedMarkets.filter((m) => matchesFilter(m, 'mine')).length,
  }

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 pb-12 pt-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <BaseLogo className="size-10 shrink-0 shadow-lg shadow-blue-600/20" />
          <div>
            <h1 className="display text-balance text-3xl font-bold sm:text-4xl">Base Prediction Market</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              Bet USDC on YES or NO. Winners share the losing side's pool.
            </p>
          </div>
        </div>
        <ConnectKitButton />
      </header>

      {!MARKET_ADDRESS && (
        <div className="glass mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm" style={{ borderColor: 'var(--danger)' }}>
          <TriangleAlert className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--danger)' }} />
          <span>Contract address missing. Set VITE_MARKET_ADDRESS in .env and restart the dev server.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <WalletPanel markets={markets} total={total} onCreate={() => setCreating(true)} />

        <main>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search markets..."
              aria-label="Search markets"
              className="h-10 w-full rounded-full pl-10 pr-9 text-sm outline-none transition-colors"
              style={{ background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--border)' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-opacity hover:opacity-75"
                style={{ color: 'var(--muted)' }}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter markets">
            {FILTERS.map((f) => {
              const isSelected = filter === f.id
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setFilter(f.id)}
                  className="flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors"
                  style={{
                    background: isSelected ? 'var(--accent)' : 'var(--surface)',
                    color: isSelected ? 'var(--accent-ink)' : 'var(--ink-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span>{f.label}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-xs tabular-nums"
                    style={{ background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(128, 128, 128, 0.15)' }}
                  >
                    {counts[f.id]}
                  </span>
                </button>
              )
            })}
          </div>

          {isLoading && (
            <div className="glass flex items-center justify-center gap-2 rounded-3xl p-10 text-sm" style={{ color: 'var(--muted)' }}>
              <Loader2 className="size-4 animate-spin" /> Loading markets from Base Mainnet...
            </div>
          )}

          {isError && !isLoading && (
            <div className="glass rounded-3xl p-6 text-sm" style={{ color: 'var(--muted)' }}>
              Could not load markets. Check your connection and{' '}
              <button onClick={refetchAll} className="font-semibold underline" style={{ color: 'var(--accent)' }}>
                try again
              </button>
              .
            </div>
          )}

          {!isLoading && !isError && visible.length === 0 && (
            <div className="glass rounded-3xl p-10 text-center">
              <p className="display text-xl font-semibold">{total === 0 ? 'No markets yet' : 'Nothing here'}</p>
              <p className="mx-auto mt-1 max-w-xs text-sm" style={{ color: 'var(--muted)' }}>
                {total === 0
                  ? 'Create the first market and let people bet on the answer.'
                  : query
                    ? `No markets found matching "${search}".`
                    : 'No markets match this filter right now.'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {visible.map((m) => (
              <MarketCard
                key={m.id}
                data={m}
                now={now}
                owner={owner}
                onBet={(market, isYes) => setBet({ market, isYes })}
                onChanged={refetchAll}
              />
            ))}
          </div>
        </main>
      </div>

      <Footer />
      <CreateSheet open={creating} onClose={() => setCreating(false)} onDone={refetchAll} />
      <BetSheet target={bet} onClose={() => setBet(null)} onDone={refetchAll} />
    </div>
  )
}
