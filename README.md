# Base Prediction Market

A decentralized, non-custodial **Parimutuel Prediction Market** built on **Base Sepolia** using **USDC**. Users can predict real-world outcomes across Crypto, Sports, Macro, Tech, and Culture, share dynamic multipliers, and claim payouts or refunds directly on-chain.

## Live App & Contracts

- **Live App:** [base-prediction-market-kappa.vercel.app](https://vercel.app)
- **Network:** Base Sepolia Testnet (`Chain ID: 84532`)
- **Prediction Market Contract:** [`0x3664C64507a0d017B5dA163418389C851b68F62F`](https://basescan.org)
- **Collateral Token (USDC):** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Key Features

- **Parimutuel Betting Engine:** All YES and NO bets are pooled together in USDC. Dynamic multipliers (`1.00x`+) update automatically based on pool distribution.
- **On-Chain Transparency:** Real-time pool totals, user active bets, and contract resolution states fetched directly from Base Sepolia.
- **3-Day Refund Guarantee:** If a market is not resolved within 3 days after its deadline, bettors can claim a full 100% refund on-chain without protocol fees.
- **Category Filtering & Live Search:** Filter markets by *Crypto*, *Sports*, *Macro*, *Tech*, *Culture*, *Active*, *Resolved*, or *My Bets*, plus instant keyword search and sorting by volume, ending soon, or newest.
- **Social Sharing:** One-click sharing of market predictions and odds directly to X (Twitter).
- **Web3 Wallet Integration:** Seamless connection via RainbowKit, Wagmi, and Viem with automatic Base Sepolia network switching.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide Icons, Sonner
- **Web3 & Blockchain:** Wagmi, Viem, RainbowKit, TanStack Query
- **Smart Contract:** Solidity (Parimutuel USDC Prediction Market on Base Sepolia)

## Getting Started

### Prerequisites

- Node.js `v18+` and `npm`
- A Web3 wallet (e.g., Coinbase Wallet, MetaMask, Rabby) connected to **Base Sepolia** with testnet ETH (for gas) and testnet USDC.

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd base-prediction-market-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## How It Works

1. **Pick a Market:** Browse active questions and choose **YES** or **NO**.
2. **Place Your Bet:** Approve USDC and stake any amount before the betting deadline closes.
3. **Claim Winnings or Refund:**
   - **Winners** split the entire losing pool proportionally (minus a 5% protocol fee on net winnings).
   - **Unresolved Markets:** If an outcome is not finalized within 72 hours post-deadline, anyone can trigger a full refund.

## License

This project is open-source and available under the [MIT License](LICENSE).
