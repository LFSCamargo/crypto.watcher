import { isAddress, type Address } from 'viem'
import { baseSepolia, mainnet, sepolia } from 'wagmi/chains'

/** Subset of `CryptoWatcherGovernor` (OpenZeppelin Governor) used for in-app voting. */
export const governorAbi = [
  {
    type: 'function',
    name: 'castVote',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'uint8' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'hasVoted',
    stateMutability: 'view',
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'proposalSnapshot',
    stateMutability: 'view',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getVotes',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'timepoint', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

const configuredGovernor = String(import.meta.env.VITE_GOVERNOR_ADDRESS ?? '').trim()

export const governorAddress: Address | undefined = isAddress(configuredGovernor)
  ? configuredGovernor
  : undefined

const supportedChains = [baseSepolia, mainnet, sepolia]
const configuredChainId = Number(import.meta.env.VITE_DEFAULT_CHAIN_ID ?? baseSepolia.id)

export const governanceChain =
  supportedChains.find((chain) => chain.id === configuredChainId) ?? baseSepolia
