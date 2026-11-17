import { ExternalLink, Plus } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { ConnectKitButton } from 'connectkit'
import { erc20Abi } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { buildAddressExplorerUrl } from '@/onchain-facts'
import { formatUsdc } from '@/onchain-money'
import { ARC_CHAIN, ARC_CHAIN_ID, MARKET_ADDRESS, USDC_ADDRESS, shortAddress, type MarketView } from '@/lib/market'

interface WalletPanelProps {
  markets: MarketView[]
  total: number
  onCreate: () => void
}

export function WalletPanel({ markets, total, onCreate }: WalletPanelProps) {
  const { address, isConnected, chainId } = useAccount()
  const balance = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 10000 },
  })

  const pooled = markets.reduce((sum, m) => sum + m.totalYes + m.totalNo, 0n)
  const wrongChain = isConnected && chainId !== ARC_CHAIN_ID

  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <section className="glass rounded-3xl p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--subtle)' }}>
          <TokenUSDC variant="branded" size={16} /> Your USDC balance
        </div>
        {isConnected ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="display text-4xl font-bold tabular-nums">
                {balance.isLoading ? '...' : balance.data !== undefined ? formatUsdc(balance.data) : '-'}
              </span>
              <span className="text-lg font-medium" style={{ color: 'var(--subtle)' }}>
                USDC
              </span>
            </div>
            <p className="mt-1.5 text-xs" style={{ color: wrongChain ? 'var(--danger)' : 'var(--muted)' }}>
              {wrongChain ? 'Wrong network. Switch to Base to bet.' : `${ARC_CHAIN.name} · ${shortAddress(address ?? '')}`}
            </p>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
              Connect your wallet to see your balance and place bets on {ARC_CHAIN.name}.
            </p>
            <ConnectKitButton.Custom>
              {({ show }) => (
                <button
                  onClick={show}
                  className="glass-inner min-h-11 w-full rounded-2xl text-sm font-semibold transition-colors hover:bg-white/10"
                >
                  Connect wallet
                </button>
              )}
            </ConnectKitButton.Custom>
          </>
        )}
      </section>

      <section className="glass rounded-3xl p-5">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs" style={{ color: 'var(--subtle)' }}>
              Markets
            </dt>
            <dd className="display mt-0.5 text-2xl font-semibold tabular-nums">{total}</dd>
          </div>
          <div>
            <dt className="text-xs" style={{ color: 'var(--subtle)' }}>
              Total bet (USDC)
            </dt>
            <dd className="display mt-0.5 text-2xl font-semibold tabular-nums">{formatUsdc(pooled)}</dd>
          </div>
        </dl>
        <button
          onClick={onCreate}
          className="btn-primary mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.99]"
        >
          <Plus className="size-4" /> Create market
        </button>
      </section>

      {MARKET_ADDRESS && (
        <a
          href={buildAddressExplorerUrl(ARC_CHAIN_ID, MARKET_ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs transition-colors hover:bg-white/5"
          style={{ color: 'var(--subtle)', border: '1px solid var(--border)' }}
        >
          <span>
            Contract <span className="mono">{shortAddress(MARKET_ADDRESS)}</span>
          </span>
          <ExternalLink className="size-3" />
        </a>
      )}
    </aside>
  )
}
