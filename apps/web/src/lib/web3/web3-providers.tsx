import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import { useEffect, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './config'

const rainbowKitTheme = lightTheme({
  accentColor: '#FFC043',
  accentColorForeground: '#111111',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
})

export function Web3Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void import('@rainbow-me/rainbowkit/styles.css')
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider theme={rainbowKitTheme} modalSize="compact">
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  )
}
