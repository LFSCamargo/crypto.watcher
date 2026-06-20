import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { baseSepolia, mainnet, sepolia } from 'wagmi/chains'

// Fall back to a dev placeholder when the env var is unset OR empty (Docker
// passes it through as an empty string). A non-empty id keeps RainbowKit from
// throwing at startup; injected wallets work, and WalletConnect needs a real id.
const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || 'crypto-watcher-dev'

export const wagmiConfig = getDefaultConfig({
  appName: 'Crypto Watcher',
  projectId: walletConnectProjectId,
  chains: [baseSepolia, mainnet, sepolia],
  ssr: false,
})
