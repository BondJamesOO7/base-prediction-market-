/**
 * wagmi configuration
 * Base Prediction Market
 */

import { fallback, http, createConfig } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'

// Pre-register chain RPC URLs so trace events show correct chain names immediately
registerChain(base.id, base.rpcUrls.default.http)

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [injected()],
  batch: {
    multicall: false,
  },
  transports: {
    [base.id]: fallback([
      http('https://base.org', { batch: false, timeout: 8000 }),
      http('https://drpc.org', { batch: false, timeout: 8000 }),
      http('https://1rpc.io', { batch: false, timeout: 8000 }),
    ]),
    [mainnet.id]: http(),
  },
})
