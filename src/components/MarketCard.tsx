import { toast } from 'sonner'
import { Clock, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { formatUsdc } from '@/onchain-money'
import { useTx } from '@/hooks/useTx'
import {
  MARKET_ADDRESS,
  RESOLUTION_WINDOW_SECONDS,
  formatCountdown,
  getStatus,
  market,
  shortAddress,
  yesPercent,
  type MarketStatus,
  type MarketView,
} from '@/lib/market'

interface MarketCardProps {
  data: MarketView
  now: number
  owner?: string
  onBet: (m: MarketView, isYes: boolean) => void
  onChanged: () => void
}

const STATUS_STYLE: Record<MarketStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'var(--success)' },
  awaiting: { label: 'Waiting for result', color: 'var(--accent)' },
  resolved: { label: 'Settled', color: 'var(--subtle)' },
  refund: { label: 'Refund available', color: 'var(--accent)' },
}

export function MarketCard({ data, now, owner, onBet, onChanged }: MarketCardProps) {
  const { address } = useAccount()
  const status = getStatus(data, now)
  const pct = yesPercent(data)
  const yes = pct ?? 50
  const pool = data.totalYes + data.totalNo
  const deadline = data.closeTime + RESOLUTION_WINDOW_SECONDS

  const me = address?.toLowerCase()
  const canResolve =
    status === 'awaiting' && !!me && (me === data.creator.toLowerCase() || me === owner?.toLowerCase())

  const resolveTx = useTx(() => {
    toast.success('Result saved')
    onChanged()
  })
  const claimTx = useTx(() => {
    toast.success('USDC sent to your wallet')
    onChanged()
  })

  const resolve = (yesWins: boolean) => {
    if (!MARKET_ADDRESS) return
    void resolveTx.send({
      address: MARKET_ADDRESS,
      ...market,
      functionName: 'resolve',
      args: [BigInt(data.id), yesWins],
    })
  }
  const claim = () => {
    if (!MARKET_ADDRESS) return
    void claimTx.send({
      address: MARKET_ADDRESS,
      ...market,
      functionName: 'claim',
      args: [BigInt(data.id)],
    })
  }

  const hasPosition = data.yesStake > 0n || data.noStake > 0n
  const resolveBusy = resolveTx.isPending || resolveTx.isConfirming
  const claimBusy = claimTx.isPending || claimTx.isConfirming
  const canClaim = data.payout > 0n && !data.claimed

  let timing = ''
  if (status === 'open') timing = `Closes in ${formatCountdown(data.closeTime - now)}`
  else if (status === 'awaiting') timing = `Refund in ${formatCountdown(deadline - now)} if no result`
  else if (status === 'resolved') timing = data.yesWins ? 'Result: YES' : 'Result: NO'
  else timing = 'Refunds open'

  return (
    <article className="glass rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
          style={{ background: 'var(--surface-strong)', color: STATUS_STYLE[status].color }}
        >
          {STATUS_STYLE[status].label}
        </span>
        <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>
          <Clock className="size-3" /> {timing}
        </span>
      </div>

      <h3 className="display text-balance text-xl font-semibold leading-snug" style={{ color: 'var(--ink)' }}>
        {data.question}
      </h3>
      <p className="mt-1 text-xs" style={{ color: 'var(--subtle)' }}>
        Market #{data.id + 1} by <span className="mono">{shortAddress(data.creator)}</span>
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-sm font-semibold tabular-nums">
          <span style={{ color: 'var(--success)' }}>YES {pct === null ? '-' : `${Math.round(yes)}%`}</span>
          <span style={{ color: 'var(--danger)' }}>NO {pct === null ? '-' : `${Math.round(100 - yes)}%`}</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-strong)' }}>
          {pct !== null && (
            <>
              <div style={{ width: `${yes}%`, background: 'var(--success)' }} />
              <div style={{ width: `${100 - yes}%`, background: 'var(--danger)' }} />
            </>
          )}
        </div>
        <div className="mt-1.5 flex justify-between text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>
          <span>{formatUsdc(data.totalYes)} USDC</span>
          <span>Pool {formatUsdc(pool)} USDC</span>
          <span>{formatUsdc(data.totalNo)} USDC</span>
        </div>
      </div>

      {hasPosition && (
        <div className="glass-inner mt-4 rounded-2xl px-4 py-3 text-sm tabular-nums">
          <span style={{ color: 'var(--subtle)' }}>Your bets: </span>
          {data.yesStake > 0n && (
            <span className="font-semibold" style={{ color: 'var(--success)' }}>
              {formatUsdc(data.yesStake)} on YES
            </span>
          )}
          {data.yesStake > 0n && data.noStake > 0n && <span style={{ color: 'var(--subtle)' }}> · </span>}
          {data.noStake > 0n && (
            <span className="font-semibold" style={{ color: 'var(--danger)' }}>
              {formatUsdc(data.noStake)} on NO
            </span>
          )}
          {data.claimed && <span style={{ color: 'var(--subtle)' }}> · claimed</span>}
          {status === 'resolved' && !data.claimed && data.payout === 0n && (
            <span style={{ color: 'var(--subtle)' }}> · nothing to claim</span>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2">
        {status === 'open' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onBet(data, true)}
              className="min-h-12 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'rgba(141,216,159,0.16)', color: 'var(--success)', border: '1px solid rgba(141,216,159,0.35)' }}
            >
              Bet YES
            </button>
            <button
              onClick={() => onBet(data, false)}
              className="min-h-12 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'rgba(232,109,122,0.16)', color: 'var(--danger)', border: '1px solid rgba(232,109,122,0.35)' }}
            >
              Bet NO
            </button>
          </div>
        )}

        {canResolve && (
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={resolveBusy}
              onClick={() => resolve(true)}
              className="btn-primary flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold disabled:opacity-40"
            >
              {resolveBusy && <Loader2 className="size-4 animate-spin" />}
              {resolveTx.isPending ? 'Confirm in wallet...' : 'YES happened'}
            </button>
            <button
              disabled={resolveBusy}
              onClick={() => resolve(false)}
              className="min-h-12 rounded-2xl text-sm font-semibold transition-colors hover:bg-white/15 disabled:opacity-40"
              style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}
            >
              NO happened
            </button>
          </div>
        )}

        {status === 'awaiting' && !canResolve && (
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            The market creator has to set the result. If they do not, everyone can take a refund after 3 days.
          </p>
        )}

        {canClaim && (
          <button
            disabled={claimBusy}
            onClick={claim}
            className="btn-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.99] disabled:opacity-40"
          >
            {claimBusy && <Loader2 className="size-4 animate-spin" />}
            {claimTx.isPending
              ? 'Confirm in wallet...'
              : claimTx.isConfirming
                ? 'Confirming...'
                : `${data.refundable ? 'Take refund' : 'Claim'} ${formatUsdc(data.payout)} USDC`}
          </button>
        )}
      </div>
    </article>
  )
}
