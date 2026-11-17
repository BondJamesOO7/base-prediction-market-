import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { Loader2, TriangleAlert } from 'lucide-react'
import { BetSheet } from './components/BetSheet'
import { CreateSheet } from './components/CreateSheet'
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

export default function App() {
  const now = useNow()
  const { markets, total, owner, isLoading, isError, refetchAll } = useMarkets()
  const [filter, setFilter] = useState<Filter>('all')
  const [creating, setCreating] = useState(false)
  const [bet, setBet] = useState<{ market: MarketView; isYes: boolean } | null>(null)

  const visible = markets.filter((m) => {
    const status = getStatus(m, now)
    if (filter === 'open') return status === 'open'
    if (filter === 'pending') return status === 'awaiting'
    if (filter === 'settled') return status === 'resolved' || status === 'refund'
    if (filter === 'mine') return m.yesStake > 0n || m.noStake > 0n
    return true
  })

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 pb-24 pt-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="display text-balance text-3xl font-bold sm:text-4xl">Base Prediction Market</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Bet USDC on YES or NO. Winners share the losing side's pool.
          </p>
        </div>
        <ConnectKitButton />
      </header>

      {!MARKET_ADDRESS && (
        <div
          className="glass mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm"
          style={{ borderColor: 'var(--danger)' }}
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--danger)' }} />
          <span>Contract address missing. Set VITE_MARKET_ADDRESS in .env and restart the dev server.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <WalletPanel markets={markets} total={total} onCreate={() => setCreating(true)} />

        <main>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter markets">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className="min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors"
                style={{
                  background: filter === f.id ? 'var(--accent)' : 'var(--surface)',
                  color: filter === f.id ? 'var(--accent-ink)' : 'var(--ink-2)',
                  border: '1px solid var(--border)',
                }}
              >
                {f.label}
              </button>
            ))}
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
              <p className="display text-xl font-semibold">
                {total === 0 ? 'No markets yet' : 'Nothing here'}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm" style={{ color: 'var(--muted)' }}>
                {total === 0
                  ? 'Create the first market and let people bet on the answer.'
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

      <CreateSheet open={creating} onClose={() => setCreating(false)} onDone={refetchAll} />
      <BetSheet target={bet} onClose={() => setBet(null)} onDone={refetchAll} />
    </div>
  )
}
