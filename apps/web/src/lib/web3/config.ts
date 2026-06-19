import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { baseSepolia, mainnet, sepolia } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'Crypto Watcher',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'crypto-watcher-dev',
  chains: [baseSepolia, mainnet, sepolia],
  ssr: false,
})
