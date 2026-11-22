# Base Prediction Market

A decentralized, non-custodial **Parimutuel Prediction Market** built on **Base Mainnet** using **USDC**. Users can predict real-world outcomes, share dynamic multipliers, and claim payouts or refunds directly on-chain.

## Live App & Contracts

- **Live App:** [base-prediction-market-kappa.vercel.app](https://vercel.app)
- **Network:** Base Mainnet (`Chain ID: 8453`)
- **Prediction Market Contract:** [`0x3009f6e4dB56BbF0BD7e86CbAfAa81505E96182D`](https://basescan.org)
- **Collateral Token (USDC):** [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org)

## Key Features

- **Parimutuel Betting Engine:** All YES and NO bets are pooled together in USDC. Dynamic multipliers (`1.00x`+) update automatically based on pool distribution.
- **On-Chain Transparency:** Real-time pool totals, user active bets, and contract resolution states fetched directly from Base Mainnet.
- **3-Day Refund Guarantee:** If a market is not resolved within 3 days after its deadline, bettors can claim a full 100% refund on-chain without protocol fees.
- **Category Filtering & Live Search:** Filter markets by *All*, *Open*, *Needs result*, *Settled*, or *My bets*, plus instant keyword search.
- **Social Sharing:** One-click sharing of market predictions and odds directly to X (Twitter).
- **Web3 Wallet Integration:** Seamless connection via RainbowKit, Wagmi, and Viem with automatic Base network switching.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide Icons, Sonner
- **Web3 & Blockchain:** Wagmi, Viem, RainbowKit, TanStack Query
- **Smart Contract:** Solidity (Parimutuel USDC Prediction Market on Base Mainnet)

## Getting Started

### Prerequisites

- Node.js `v18+` and `npm`
- A Web3 wallet (e.g., Coinbase Wallet, MetaMask, Rabby) connected to **Base Mainnet** with ETH (for gas) and USDC.

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

## Community & Contact

- **X (Twitter):** [@OO7BondJames007](https://x.com)
- **Discord:** `jamesbond.oo7`
- **GitHub:** [BondJamesOO7/base-prediction-market-](https://github.com)

## License

This project is open-source and available under the [MIT License](LICENSE).
