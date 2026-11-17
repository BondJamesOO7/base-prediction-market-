# Arc Prediction Market

A YES/NO prediction market contract for Arc Testnet. Anyone can create a market, bet USDC on YES or NO, and winners share the losing side's pool. Unresolved markets refund everyone.

Built with [Arc Studio](https://studio.arc.io)

## Tech stack

- Solidity 0.8.28 with OpenZeppelin, built and tested with Foundry
- React, Vite, TypeScript, Tailwind CSS
- wagmi, viem, ConnectKit

## Development

Prerequisites: Bun and Foundry.

Install: `bun install`

Environment variables:

- `VITE_MARKET_ADDRESS`: address of the deployed ArcPredictionMarket contract on Arc Testnet (public value).

What the app does: connect a wallet, create markets, bet USDC on YES or NO, set the result as the market creator, and claim winnings or refunds.

Run the app: `bun run dev`

Build the contracts: `bun run contracts:build`

Test the contracts: `bun run contracts:test`

## Docs

- `docs/guia-deploy.md`: step-by-step guide in Portuguese (how it works, network details, faucet, checklist)
- `docs/ArcPredictionMarket.abi.json`: contract ABI for the frontend
