# Base Prediction Market

Um mercado descentralizado de previsões YES/NO construído na **Base Mainnet** ([base-prediction-market-kappa.vercel.app](https://vercel.app)).

## Recursos principais
- **Apostas Parimutuel:** Aposte em USDC (valores personalizados ou pré-definidos).
- **Estimador de Payout:** Cálculo em tempo real de retornos e multiplicadores.
- **Filtros e Busca:** Navegue por status com contadores ao vivo.
- **Compartilhamento no X:** Publique odds e pools com um clique.
- **Reembolso Automático:** Resgate integral em mercados não resolvidos no prazo.

## Stack Tecnológica
- **Smart Contracts:** Solidity 0.8.28 (OpenZeppelin + Foundry)
- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Web3:** wagmi, viem, ConnectKit

## Desenvolvimento

```bash
bun install
bun run dev
bun run contracts:build
bun run contracts:test
```

### Variáveis de Ambiente
- `VITE_MARKET_ADDRESS`: Endereço do contrato na Base Mainnet.

## Documentação
- `docs/guia-deploy.md`: Guia de deploy em Português
- `docs/ArcPredictionMarket.abi.json`: ABI do contrato

---

Criado por **JamesBondOO7** • X: [@OO7BondJames007](https://x.com) • Discord: `jamesbond.oo7`
