import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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

const DURATIONS = [
  { label: '10 min', seconds: 10 * 60 },
  { label: '1 hour', seconds: 60 * 60 },
  { label: '1 day', seconds: 24 * 60 * 60 },
  { label: '7 days', seconds: 7 * 24 * 60 * 60 },
]

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
  const [duration, setDuration] = useState(DURATIONS[1].seconds)

  const tx = useTx(() => {
    toast.success('Market created')
    onDone()
    onClose()
  })

  const trimmed = question.trim()
  const valid = trimmed.length >= 5 && trimmed.length <= 200
  const wrongChain = isConnected && chainId !== ARC_CHAIN_ID
  const busy = tx.isPending || tx.isConfirming

  const submit = () => {
    if (!MARKET_ADDRESS || !valid) return
    const closeTime = BigInt(Math.floor(Date.now() / 1000) + duration)
    void tx.send({
      address: MARKET_ADDRESS,
      ...market,
      functionName: 'createMarket',
      args: [trimmed, closeTime],
    })
  }

  let label = 'Create market'
  if (wrongChain) label = 'Switch to Arc Testnet'
  else if (!valid) label = 'Write a yes/no question'
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
          placeholder="Will BTC close above $100,000 on Friday?"
          className="glass-inner w-full resize-none rounded-2xl p-3 text-sm outline-none placeholder:text-slate-500 focus:border-[var(--accent)]"
          style={{ color: 'var(--ink)' }}
        />
      </label>

      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--subtle)' }}>
          Betting closes in
        </span>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => setDuration(d.seconds)}
              aria-pressed={duration === d.seconds}
              className="min-h-11 rounded-xl text-xs font-semibold transition-colors"
              style={{
                background: duration === d.seconds ? 'var(--accent)' : 'var(--surface-strong)',
                color: duration === d.seconds ? 'var(--accent-ink)' : 'var(--ink-2)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--subtle)' }}>
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
