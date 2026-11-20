import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { Check, Copy, Loader2, TriangleAlert } from 'lucide-react'
import { BetSheet } from './components/BetSheet'
import { CreateSheet } from './components/CreateSheet'
import { MarketCard } from './components/MarketCard'
import { WalletPanel } from './components/WalletPanel'
import { useMarkets } from './hooks/useMarkets'
import { useNow } from './hooks/useNow'
import { MARKET_ADDRESS, getStatus, type MarketView } from './lib/market'

type Filter = 'all' | 'open' | 'pending' | 'settled' | 'mine'

const X_HANDLE = 'OO7BondJames007'
const DISCORD_HANDLE = 'jamesbond.oo7'

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
      <path
        d="M54.921 91C74.294 91 90 75.33 90 56C90 36.67 74.294 21 54.921 21C36.609 21 21.584 35.03 20 52.893H66.085V59.107H20C21.584 76.97 36.609 91 54.921 91Z"
        fill="white"
      />
    </svg>
  )
}

export default function App() {
  const now = useNow()
  const { markets, total, owner, isLoading, isError, refetchAll } = useMarkets()
  const [filter, setFilter] = useState<Filter>('all')
  const [creating, setCreating] = useState(false)
  const [bet, setBet] = useState<{ market: MarketView; isYes: boolean } | null>(null)
  const [copiedDiscord, setCopiedDiscord] = useState(false)

  const visible = markets.filter((m) => {
    const status = getStatus(m, now)
    if (filter === 'open') return status === 'open'
    if (filter === 'pending') return status === 'awaiting'
    if (filter === 'settled') return status === 'resolved' || status === 'refund'
    if (filter === 'mine') return m.yesStake > 0n || m.noStake > 0n
    return true
  })

  function copyDiscord() {
    navigator.clipboard.writeText(DISCORD_HANDLE)
    setCopiedDiscord(true)
    setTimeout(() => setCopiedDiscord(false), 2000)
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

      <footer
        className="mt-16 border-t pt-6 text-sm"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
      >
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-medium">Made by JamesBondOO7</p>

          <div className="flex items-center gap-3">
            <a
              href={`https://x.com{X_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
              style={{
                background: 'var(--surface)',
                color: 'var(--ink-2)',
                border: '1px solid var(--border)',
              }}
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>@{X_HANDLE}</span>
            </a>

            <button
              type="button"
              onClick={copyDiscord}
              title="Click to copy Discord username"
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
              style={{
                background: 'var(--surface)',
                color: 'var(--ink-2)',
                border: '1px solid var(--border)',
              }}
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>{copiedDiscord ? 'Copied!' : DISCORD_HANDLE}</span>
              {copiedDiscord ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3 opacity-60" />}
            </button>
          </div>
        </div>
      </footer>

      <CreateSheet open={creating} onClose={() => setCreating(false)} onDone={refetchAll} />
      <BetSheet target={bet} onClose={() => setBet(null)} onDone={refetchAll} />
    </div>
  )
}
