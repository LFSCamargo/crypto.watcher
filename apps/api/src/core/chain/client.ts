import { createPublicClient, http } from 'viem'
import { baseSepolia, mainnet } from 'viem/chains'
import { config } from '../config'

export const publicClient = createPublicClient({
  chain: config.env === 'production' ? mainnet : baseSepolia,
  transport: http(config.rpcUrl),
})
