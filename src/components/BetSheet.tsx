import { useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, Loader2 } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { useAccount, useReadContract, useSwitchChain } from 'wagmi'
import { erc20Abi } from 'viem'
import { buildTxExplorerUrl } from '@/onchain-facts'
import { formatUsdc, parseUsdc } from '@/onchain-money'
import { ConnectKitButton } from 'connectkit'
import { Sheet } from './Sheet'
import { useTx } from '@/hooks/useTx'
import { useLocale } from '@/lib/LocaleContext'
import {
  ARC_CHAIN_ID,
  MARKET_ADDRESS,
  USDC_ADDRESS,
  estimatePayout,
  market as marketConfig,
  type MarketView,
} from '@/lib/market'

interface BetSheetProps {
  target?: { market: MarketView; isYes: boolean } | null
  market?: MarketView | null
  isYes?: boolean
  onClose: () => void
  onDone?: () => void
  onPlaced?: () => void
}

const QUICK_AMOUNTS = ['1', '5', '10', '25', '50', '100']

function toRaw(value: string): bigint {
  try {
    return value ? parseUsdc(value) : 0n
  } catch {
    return 0n
  }
}

export function BetSheet({ target, market, isYes, onClose, onDone, onPlaced }: BetSheetProps) {
  const { t } = useLocale()
  const activeMarket = target ? target.market : (market ?? null)
  const activeIsYes = target ? target.isYes : (isYes ?? true)
  const handleDone = onPlaced ?? onDone ?? (() => {})

  return (
    <Sheet open={!!activeMarket} title={activeIsYes ? t('betYes') : t('betNo')} onClose={onClose}>
      {activeMarket && (
        <BetForm
          key={`${activeMarket.id}-${activeIsYes}`}
          market={activeMarket}
          isYes={activeIsYes}
          onDone={handleDone}
        />
      )}
    </Sheet>
  )
}

function BetForm({
  market: m,
  isYes,
  onDone,
}: {
  market: MarketView
  isYes: boolean
  onDone: () => void
}) {
  const { t } = useLocale()
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const [amount, setAmount] = useState('')
  const raw = toRaw(amount)

  const balance = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_CHAIN_ID,
    query: { enabled: !!address },
  })
  const allowance = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && MARKET_ADDRESS ? [address, MARKET_ADDRESS] : undefined,
    chainId: ARC_CHAIN_ID,
    query: { enabled: !!address && !!MARKET_ADDRESS },
  })

  const approveTx = useTx(() => {
    void allowance.refetch()
  })
  const betTx = useTx(() => {
    toast.success(t('betPlacedToast'))
    void balance.refetch()
    void allowance.refetch()
    onDone()
  })

  const balanceRaw = balance.data ?? 0n
  const allowanceRaw = allowance.data ?? 0n
  const needsApproval = raw > 0n && allowanceRaw < raw
  const insufficient = raw > balanceRaw
  const wrongChain = isConnected && chainId !== ARC_CHAIN_ID
  const hasZeroBalance = isConnected && !wrongChain && !balance.isLoading && balanceRaw === 0n
  const estimate = raw > 0n ? estimatePayout(m, isYes, raw) : 0n
  const netProfit = estimate > raw ? estimate - raw : 0n
  const multiplier = raw > 0n ? (Number(estimate) / Number(raw)).toFixed(2) : null
  const busy = approveTx.isPending || approveTx.isConfirming || betTx.isPending || betTx.isConfirming
  const sideColor = isYes ? 'var(--success)' : 'var(--danger)'
  const quarterBalanceRaw = balanceRaw / 4n
  const halfBalanceRaw = balanceRaw / 2n
  const threeQuartersBalanceRaw = (balanceRaw * 3n) / 4n
  const isQuarterSelected = balanceRaw > 0n && raw === quarterBalanceRaw
  const isHalfSelected = balanceRaw > 0n && raw === halfBalanceRaw
  const isThreeQuartersSelected = balanceRaw > 0n && raw === threeQuartersBalanceRaw
  const isMaxSelected = balanceRaw > 0n && raw === balanceRaw

  const submit = () => {
    if (!MARKET_ADDRESS || raw === 0n) return
    if (needsApproval) {
      void approveTx.send({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [MARKET_ADDRESS, raw],
        chainId: ARC_CHAIN_ID,
      })
      return
    }
    void betTx.send({
      address: MARKET_ADDRESS,
      ...marketConfig,
      functionName: 'bet',
      args: [BigInt(m.id), isYes, raw],
    })
  }

  let label: string
  if (wrongChain) label = t('switchToBase')
  else if (raw === 0n) label = t('enterAmount')
  else if (insufficient) label = t('insufficientUsdc')
  else if (approveTx.isPending || betTx.isPending) label = t('confirmInWallet')
  else if (approveTx.isConfirming) label = t('confirmingAllowance')
  else if (betTx.isConfirming) label = t('confirmingBet')
  else if (needsApproval) label = t('allowUsdcStep')
  else label = isYes ? t('betYes') : t('betNo')
  return (
    <div className="space-y-4">
      <p className="text-pretty text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        {m.question}
      </p>

      <div className="glass-inner rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2">
          <input
            inputMode="decimal"
            value={amount}
            autoFocus
            aria-label={t('customAmount')}
            onChange={(event) => {
              const value = event.target.value.replace(/[^0-9.]/g, '')
              if (/^\d*\.?\d{0,6}$/.test(value)) setAmount(value)
            }}
            placeholder={t('customAmount')}
            className="display w-full bg-transparent text-3xl font-bold tabular-nums outline-none placeholder:text-slate-500"
            style={{ color: 'var(--ink)' }}
          />
          <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--subtle)' }}>
            <TokenUSDC variant="branded" size={20} /> USDC
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className="min-h-8 rounded-full px-3 text-xs font-semibold tabular-nums transition-colors hover:bg-white/15"
              style={{
                background: amount === q ? 'var(--accent)' : 'var(--surface-strong)',
                color: amount === q ? 'var(--accent-ink)' : 'var(--ink-2)',
              }}
            >
              ${q}
            </button>
          ))}
          <button
            type="button"
            disabled={!address || balanceRaw === 0n}
            onClick={() => setAmount(formatUsdc(quarterBalanceRaw))}
            className="min-h-8 rounded-full px-3 text-xs font-semibold tabular-nums transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: isQuarterSelected ? 'var(--accent)' : 'var(--surface-strong)',
              color: isQuarterSelected ? 'var(--accent-ink)' : 'var(--ink-2)',
            }}
          >
            25%
          </button>
          <button
            type="button"
            disabled={!address || balanceRaw === 0n}
            onClick={() => setAmount(formatUsdc(halfBalanceRaw))}
            className="min-h-8 rounded-full px-3 text-xs font-semibold tabular-nums transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: isHalfSelected ? 'var(--accent)' : 'var(--surface-strong)',
              color: isHalfSelected ? 'var(--accent-ink)' : 'var(--ink-2)',
            }}
          >
            50%
          </button>
          <button
            type="button"
            disabled={!address || balanceRaw === 0n}
            onClick={() => setAmount(formatUsdc(threeQuartersBalanceRaw))}
            className="min-h-8 rounded-full px-3 text-xs font-semibold tabular-nums transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: isThreeQuartersSelected ? 'var(--accent)' : 'var(--surface-strong)',
              color: isThreeQuartersSelected ? 'var(--accent-ink)' : 'var(--ink-2)',
            }}
          >
            75%
          </button>
          <button
            type="button"
            disabled={!address || balanceRaw === 0n}
            onClick={() => setAmount(formatUsdc(balanceRaw))}
            className="min-h-8 rounded-full px-3 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: isMaxSelected ? 'var(--accent)' : 'var(--surface-strong)',
              color: isMaxSelected ? 'var(--accent-ink)' : 'var(--ink-2)',
            }}
          >
            MAX
          </button>
          {amount !== '' && (
            <button
              type="button"
              onClick={() => setAmount('')}
              className="min-h-8 rounded-full px-3 text-xs font-semibold transition-colors hover:bg-white/15"
              style={{
                background: 'var(--surface-strong)',
                color: 'var(--subtle)',
              }}
            >
              {t('clear')}
            </button>
          )}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={!address || balanceRaw === 0n}
            onClick={() => setAmount(formatUsdc(balanceRaw))}
            className="text-xs font-semibold tabular-nums disabled:opacity-40"
            style={{ color: 'var(--accent)' }}
          >
            {address ? `${t('balance')}: ${formatUsdc(balanceRaw)} USDC` : t('connectToSeeBalance')}
          </button>
        </div>

        {hasZeroBalance && (
          <p className="mt-2 text-xs font-medium" style={{ color: 'var(--danger)' }}>
            {t('needUsdcWarning')}
          </p>
        )}
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt style={{ color: 'var(--subtle)' }}>{t('yourSide')}</dt>
          <dd className="font-semibold" style={{ color: sideColor }}>
            {isYes ? t('yes') : t('no')}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: 'var(--subtle)' }}>{t('estimatedPayout')}</dt>
          <dd className="flex items-center gap-1.5 font-semibold tabular-nums">
            {raw > 0n ? (
              <>
                <span>{formatUsdc(estimate)} USDC</span>
                {multiplier && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: 'rgba(141,216,159,0.16)', color: 'var(--success)' }}
                  >
                    {multiplier}x
                  </span>
                )}
              </>
            ) : (
              '-'
            )}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: 'var(--subtle)' }}>{t('potentialNetProfit')}</dt>
          <dd className="font-semibold tabular-nums" style={{ color: netProfit > 0n ? 'var(--success)' : 'var(--subtle)' }}>
            {raw > 0n ? `+${formatUsdc(netProfit)} USDC` : '-'}
          </dd>
        </div>
        <p className="text-xs" style={{ color: 'var(--subtle)' }}>
          {t('estimateDisclaimer')}
        </p>
      </dl>

      {!isConnected ? (
        <ConnectKitButton.Custom>
          {({ show }) => (
            <button
              onClick={show}
              className="btn-primary min-h-12 w-full rounded-2xl text-sm font-semibold transition-all active:scale-[0.99]"
            >
              {t('connectWallet')}
            </button>
          )}
        </ConnectKitButton.Custom>
      ) : (
        <button
          disabled={!wrongChain && (raw === 0n || insufficient || busy)}
          onClick={wrongChain ? () => switchChain({ chainId: ARC_CHAIN_ID }) : submit}
          className="btn-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {label}
        </button>
      )}

      {betTx.isSuccess && betTx.hash && (
        <a
          href={buildTxExplorerUrl(ARC_CHAIN_ID, betTx.hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--accent)' }}
        >
          {t('viewOnExplorer')} <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  )
}
