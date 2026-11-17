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
  chains: [base, mainnet], // mainnet needed for ENS resolution
  connectors: [injected()],
  transports: {
    [base.id]: fallback([
      http('https://base.org'),
      http('https://1rpc.io'),
      http('https://meowrpc.com'),
    ]),
    [mainnet.id]: http(), // ENS resolution uses mainnet
  },
})
