export const en = {
  betYes: 'Bet YES',
  betNo: 'Bet NO',
  customAmount: 'Custom amount',
  clear: 'Clear',
  balance: 'Balance',
  connectToSeeBalance: 'Connect to see balance',
  needUsdcWarning: 'You need USDC on Base to place a bet.',
  yourSide: 'Your side',
  yes: 'YES',
  no: 'NO',
  estimatedPayout: 'Estimated payout if you win',
  potentialNetProfit: 'Potential net profit',
  estimateDisclaimer:
    "The estimate changes as other people bet. Winners share the losing side's pool.",
  connectWallet: 'Connect wallet',
  switchToBase: 'Switch to Base',
  enterAmount: 'Enter an amount',
  insufficientUsdc: 'Insufficient USDC',
  confirmInWallet: 'Confirm in wallet...',
  confirmingAllowance: 'Confirming allowance...',
  confirmingBet: 'Confirming bet...',
  allowUsdcStep: 'Step 1 of 2: Allow USDC',
  betPlacedToast: 'Bet placed',
  viewOnExplorer: 'View transaction on explorer',
} as const

export type TranslationDictionary = Record<keyof typeof en, string>
export type TranslationKey = keyof typeof en
