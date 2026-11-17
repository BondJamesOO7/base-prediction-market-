import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { ARC_CHAIN_ID, parseTxError } from '@/lib/market'

type WriteArgs = Parameters<ReturnType<typeof useWriteContract>['writeContractAsync']>[0]

// Base Builder Code (ERC-8021) for bc_o4z9nuor
const BASE_BUILDER_DATA_SUFFIX = '0x62635f6f347a396e756f720b0080218021802180218021802180218021' as const

/**
 * One contract write with real wallet + receipt states.
 * Switches the wallet to Base Mainnet first when it is on another chain.
 */
export function useTx(onConfirmed?: () => void) {
  const { chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash, chainId: ARC_CHAIN_ID })
  const callback = useRef(onConfirmed)
  useEffect(() => {
    callback.current = onConfirmed
  })

  useEffect(() => {
    if (receipt.isSuccess) callback.current?.()
  }, [receipt.isSuccess])

  useEffect(() => {
    if (receipt.isError) toast.error('The transaction could not be confirmed. Please try again.')
  }, [receipt.isError])

  const send = async (args: WriteArgs) => {
    try {
      if (chainId !== ARC_CHAIN_ID) await switchChainAsync({ chainId: ARC_CHAIN_ID })
      await writeContractAsync({
        ...args,
        dataSuffix: BASE_BUILDER_DATA_SUFFIX,
      } as WriteArgs)
    } catch (error) {
      const text = parseTxError(error)
      if (text) toast.error(text)
    }
  }

  return {
    send,
    reset,
    hash,
    isPending,
    isConfirming: !!hash && receipt.isLoading,
    isSuccess: receipt.isSuccess,
  }
}
