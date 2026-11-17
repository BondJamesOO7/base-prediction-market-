import { useState } from 'react'
import { toast } from 'sonner'
import { Calendar, Loader2 } from 'lucide-react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useSwitchChain } from 'wagmi'
import { Sheet } from './Sheet'
import { useTx } from '@/hooks/useTx'
import { ARC_CHAIN_ID, MARKET_ADDRESS, market } from '@/lib/market'

interface CreateSheetProps {
  open: boolean
  onClose: () => void
  onDone: () => void
}

const QUICK_PRESETS = [
  { label: '10 min', seconds: 10 * 60 },
  { label: '1 hour', seconds: 60 * 60 },
  { label: '1 day', seconds: 24 * 60 * 60 },
  { label: '7 days', seconds: 7 * 24 * 60 * 60 },
  { label: '15 days', seconds: 15 * 24 * 60 * 60 },
  { label: '30 days', seconds: 30 * 24 * 60 * 60 },
  { label: '45 days', seconds: 45 * 24 * 60 * 60 },
  { label: '60 days', seconds: 60 * 24 * 60 * 60 },
]

function toLocalDatetimeInput(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function CreateSheet({ open, onClose, onDone }: CreateSheetProps) {
  return (
    <Sheet open={open} title="Create a market" onClose={onClose}>
      {open && <CreateForm onClose={onClose} onDone={onDone} />}
    </Sheet>
  )
}

function CreateForm({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const [question, setQuestion] = useState('')
  const [dateValue, setDateValue] = useState(() =>
    toLocalDatetimeInput(Math.floor(Date.now() / 1000) + 24 * 60 * 60),
  )

  const tx = useTx(() => {
    toast.success('Market created')
    onDone()
    onClose()
  })

  const parsedMs = Date.parse(dateValue)
  const closeUnix = Number.isFinite(parsedMs) ? Math.floor(parsedMs / 1000) : 0
  const nowUnix = Math.floor(Date.now() / 1000)
  const isFutureDate = closeUnix > nowUnix + 60

  const trimmed = question.trim()
  const valid = trimmed.length >= 5 && trimmed.length <= 200 && isFutureDate
  const wrongChain = isConnected && chainId !== ARC_CHAIN_ID
  const busy = tx.isPending || tx.isConfirming

  const applyPreset = (seconds: number) => {
    setDateValue(toLocalDatetimeInput(Math.floor(Date.now() / 1000) + seconds))
  }

  const submit = () => {
    if (!MARKET_ADDRESS || !valid) return
    void tx.send({
      address: MARKET_ADDRESS,
      ...market,
      functionName: 'createMarket',
      args: [trimmed, BigInt(closeUnix)],
    })
  }

  let label = 'Create market'
  if (wrongChain) label = 'Switch to Base'
  else if (trimmed.length < 5) label = 'Write a yes/no question'
  else if (!isFutureDate) label = 'Choose a future date & time'
  else if (tx.isPending) label = 'Confirm in wallet...'
  else if (tx.isConfirming) label = 'Creating market...'

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--subtle)' }}>
          Question
        </span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={200}
          rows={3}
          placeholder="Will BTC close above $100,000 by Christmas?"
          className="glass-inner w-full resize-none rounded-2xl p-3 text-sm outline-none placeholder:text-slate-500 focus:border-[var(--accent)]"
          style={{ color: 'var(--ink)' }}
        />
      </label>

      <div className="space-y-2.5">
        <span className="block text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--subtle)' }}>
          Betting closes at (Date & Time)
        </span>

        <div className="relative">
          <input
            type="datetime-local"
            value={dateValue}
            min={toLocalDatetimeInput(nowUnix + 120)}
            onChange={(event) => setDateValue(event.target.value)}
            className="glass-inner min-h-11 w-full rounded-xl px-3.5 text-sm font-medium outline-none focus:border-[var(--accent)]"
            style={{ color: 'var(--ink)', colorScheme: 'dark' }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.seconds}
              type="button"
              onClick={() => applyPreset(p.seconds)}
              className="min-h-9 rounded-xl text-xs font-semibold transition-colors hover:bg-white/15"
              style={{
                background: 'var(--surface-strong)',
                color: 'var(--ink-2)',
              }}
            >
              +{p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--subtle)' }}>
        <Calendar className="mr-1 inline size-3.5 align-text-bottom" />
        You will be the one who sets the result after betting closes. If no result is set within 3 days, everyone gets
        their bet back.
      </p>

      {!isConnected ? (
        <ConnectKitButton.Custom>
          {({ show }) => (
            <button
              onClick={show}
              className="btn-primary min-h-12 w-full rounded-2xl text-sm font-semibold transition-all active:scale-[0.99]"
            >
              Connect wallet
            </button>
          )}
        </ConnectKitButton.Custom>
      ) : (
        <button
          disabled={!wrongChain && (!valid || busy)}
          onClick={wrongChain ? () => switchChain({ chainId: ARC_CHAIN_ID }) : submit}
          className="btn-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {label}
        </button>
      )}
    </div>
  )
}
