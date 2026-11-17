import { erc20Abi, type Address } from 'viem'
import { getUsdc, requireChain } from '@/onchain-facts'
import { marketAbi } from './marketAbi'

export const ARC_CHAIN_ID = 8453 as const
export const ARC_CHAIN = requireChain(ARC_CHAIN_ID)
export const USDC_ADDRESS = (getUsdc(ARC_CHAIN_ID)?.address ?? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') as Address

const envAddress = import.meta.env.VITE_MARKET_ADDRESS as string | undefined
export const MARKET_ADDRESS = (
  envAddress && /^0x[0-9a-fA-F]{40}$/.test(envAddress)
    ? envAddress
    : '0x3009f6e4dB56BbF0BD7e86CbAfAa81505E96182D'
) as Address

export const market = { abi: marketAbi, chainId: ARC_CHAIN_ID } as const
export const usdcContract = { address: USDC_ADDRESS, abi: erc20Abi, chainId: ARC_CHAIN_ID } as const

/** Resolution window after closing, matches RESOLUTION_TIMEOUT in the contract (3 days). */
export const RESOLUTION_WINDOW_SECONDS = 3 * 24 * 60 * 60

export interface MarketView {
  id: number
  question: string
  creator: Address
  closeTime: number
  totalYes: bigint
  totalNo: bigint
  resolved: boolean
  yesWins: boolean
  refundable: boolean
  yesStake: bigint
  noStake: bigint
  claimed: boolean
  payout: bigint
}

export type MarketStatus = 'open' | 'awaiting' | 'resolved' | 'refund'

export function getStatus(m: MarketView, now: number): MarketStatus {
  if (m.refundable) return 'refund'
  if (m.resolved) return 'resolved'
  if (now < m.closeTime) return 'open'
  return 'awaiting'
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0s'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/** Share of the pool on YES, as a whole percent. Null when nobody has bet. */
export function yesPercent(m: Pick<MarketView, 'totalYes' | 'totalNo'>): number | null {
  const total = m.totalYes + m.totalNo
  if (total === 0n) return null
  return Number((m.totalYes * 10000n) / total) / 100
}

/** Estimated payout for a new bet, given the current pools (changes as others bet). */
export function estimatePayout(
  m: Pick<MarketView, 'totalYes' | 'totalNo'>,
  isYes: boolean,
  amount: bigint,
): bigint {
  if (amount === 0n) return 0n
  const winPool = (isYes ? m.totalYes : m.totalNo) + amount
  const total = m.totalYes + m.totalNo + amount
  return (amount * total) / winPool
}

const KNOWN_ERRORS: Record<string, string> = {
  BettingClosed: 'Betting is closed for this market.',
  MarketStillOpen: 'This market has not closed yet.',
  UnauthorizedResolver: 'Only the market creator can set the result.',
  AlreadyResolved: 'This market already has a result.',
  ResolutionDeadlinePassed: 'The result window ended. Everyone can now take a refund.',
  AlreadyClaimed: 'You already claimed from this market.',
  NothingToClaim: 'You have nothing to claim in this market.',
  MarketNotSettled: 'This market is not settled yet.',
  InvalidCloseTime: 'The closing time must be in the future.',
  ZeroAmount: 'Enter an amount greater than zero.',
}

export function parseTxError(error: unknown): string | null {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  const lower = message.toLowerCase()
  if (lower.includes('user rejected') || lower.includes('user denied')) return null
  for (const [name, text] of Object.entries(KNOWN_ERRORS)) {
    if (message.includes(name)) return text
  }
  if (lower.includes('insufficient funds') || lower.includes('exceeds balance')) {
    return 'Insufficient USDC balance on Base.'
  }
  if (lower.includes('network') || lower.includes('timeout')) {
    return 'Network issue. Check your connection and try again.'
  }
  return 'The transaction failed. Please try again.'
}
