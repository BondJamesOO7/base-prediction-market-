import { useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import type { Address } from 'viem'
import { market, MARKET_ADDRESS, type MarketView } from '@/lib/market'

const MAX_MARKETS = 50
const REFRESH_MS = 8000

interface RawMarket {
  question: string
  creator: Address
  closeTime: bigint | number
  totalYes: bigint
  totalNo: bigint
  resolved: boolean
  yesWins: boolean
}

export function useMarkets() {
  const { address } = useAccount()

  const count = useReadContract({
    ...market,
    address: MARKET_ADDRESS,
    functionName: 'marketCount',
    query: { enabled: !!MARKET_ADDRESS, refetchInterval: REFRESH_MS },
  })

  const owner = useReadContract({
    ...market,
    address: MARKET_ADDRESS,
    functionName: 'owner',
    query: { enabled: !!MARKET_ADDRESS },
  })

  const total = Number(count.data ?? 0n)
  const ids = useMemo(
    () => Array.from({ length: Math.min(total, MAX_MARKETS) }, (_, i) => total - 1 - i),
    [total],
  )
  const stride = address ? 4 : 2

  const contracts = useMemo(
    () =>
      ids.flatMap((id) => {
        const base = { ...market, address: MARKET_ADDRESS } as const
        const calls: { functionName: string; args: readonly unknown[]; address?: Address }[] = [
          { ...base, functionName: 'getMarket', args: [BigInt(id)] },
          { ...base, functionName: 'isRefundable', args: [BigInt(id)] },
        ]
        if (address) {
          calls.push(
            { ...base, functionName: 'getUserPosition', args: [BigInt(id), address] },
            { ...base, functionName: 'previewPayout', args: [BigInt(id), address] },
          )
        }
        return calls
      }),
    [ids, address],
  )

  const reads = useReadContracts({
    // Call list is built dynamically, so wagmi cannot narrow it against the ABI.
    contracts: contracts as never,
    query: { enabled: !!MARKET_ADDRESS && ids.length > 0, refetchInterval: REFRESH_MS },
  })

  const markets = useMemo<MarketView[]>(() => {
    const data = reads.data as { status: string; result?: unknown }[] | undefined
    if (!data) return []
    const out: MarketView[] = []
    ids.forEach((id, i) => {
      const at = i * stride
      const m = data[at]
      if (!m || m.status !== 'success') return
      const raw = m.result as RawMarket
      const refundable = data[at + 1]?.result === true
      const position = address ? (data[at + 2]?.result as readonly [bigint, bigint, boolean] | undefined) : undefined
      const payout = address ? ((data[at + 3]?.result as bigint | undefined) ?? 0n) : 0n
      out.push({
        id,
        question: raw.question,
        creator: raw.creator,
        closeTime: Number(raw.closeTime),
        totalYes: raw.totalYes,
        totalNo: raw.totalNo,
        resolved: raw.resolved,
        yesWins: raw.yesWins,
        refundable,
        yesStake: position?.[0] ?? 0n,
        noStake: position?.[1] ?? 0n,
        claimed: position?.[2] ?? false,
        payout,
      })
    })
    return out
  }, [reads.data, ids, stride, address])

  const refetchAll = () => {
    void count.refetch()
    void reads.refetch()
  }

  return {
    markets,
    total,
    owner: owner.data,
    isLoading: !!MARKET_ADDRESS && (count.isLoading || (ids.length > 0 && reads.isLoading)),
    isError: count.isError || reads.isError,
    refetchAll,
  }
}
