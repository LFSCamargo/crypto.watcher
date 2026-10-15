import { useEffect } from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import type { Address } from 'viem'
import { governanceChain, governorAbi } from '../../../lib/web3/governor'
import { isUserRejection, voteFailureMessage } from '../lib/vote-error'

export type VoteSupport = 0 | 1 | 2

export type VoteStatus =
  | 'disconnected'
  | 'wrong-network'
  | 'checking'
  | 'read-failed'
  | 'ineligible'
  | 'voted'
  | 'ready'
  | 'awaiting-signature'
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'failed'

interface UseProposalVoteInput {
  governor: Address
  proposalId: bigint
}

export function useProposalVote({ governor, proposalId }: UseProposalVoteInput) {
  const { address, isConnected, chainId } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const onTargetChain = chainId === governanceChain.id
  const canRead = Boolean(address && onTargetChain)
  const contract = {
    address: governor,
    abi: governorAbi,
    chainId: governanceChain.id,
  } as const

  const snapshot = useReadContract({
    ...contract,
    functionName: 'proposalSnapshot',
    args: [proposalId],
    query: { enabled: canRead },
  })
  const votingPower = useReadContract({
    ...contract,
    functionName: 'getVotes',
    args: address && snapshot.data !== undefined ? [address, snapshot.data] : undefined,
    query: { enabled: canRead && snapshot.data !== undefined },
  })
  const hasVoted = useReadContract({
    ...contract,
    functionName: 'hasVoted',
    args: address ? [proposalId, address] : undefined,
    query: { enabled: canRead },
  })

  const write = useWriteContract()
  const receipt = useWaitForTransactionReceipt({
    hash: write.data,
    chainId: governanceChain.id,
  })
  const refetchHasVoted = hasVoted.refetch

  useEffect(() => {
    if (receipt.isSuccess) void refetchHasVoted()
  }, [receipt.isSuccess, refetchHasVoted])

  const status = ((): VoteStatus => {
    if (!isConnected || !address) return 'disconnected'
    if (!onTargetChain) return 'wrong-network'
    if (write.isPending) return 'awaiting-signature'
    if (write.error) return isUserRejection(write.error) ? 'rejected' : 'failed'
    if (write.data) {
      if (receipt.isError) return 'failed'
      if (receipt.isSuccess)
        return receipt.data.status === 'success' ? 'confirmed' : 'failed'
      return 'pending'
    }
    if (snapshot.isError || votingPower.isError || hasVoted.isError) return 'read-failed'
    if (hasVoted.data === undefined || votingPower.data === undefined) return 'checking'
    if (hasVoted.data) return 'voted'
    if (votingPower.data === 0n) return 'ineligible'
    return 'ready'
  })()

  const failure =
    status === 'failed' ? voteFailureMessage(write.error ?? receipt.error) : undefined

  return {
    status,
    failure,
    votingPower: votingPower.data,
    txHash: write.data,
    isSwitching,
    connect: () => openConnectModal?.(),
    switchNetwork: () => switchChain({ chainId: governanceChain.id }),
    retryReads: () => {
      void snapshot.refetch()
      void votingPower.refetch()
      void hasVoted.refetch()
    },
    castVote: (support: VoteSupport) =>
      write.writeContract({
        ...contract,
        functionName: 'castVote',
        args: [proposalId, support],
      }),
    reset: () => write.reset(),
  }
}
