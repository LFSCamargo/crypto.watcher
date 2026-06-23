import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../lib/web3/config'
import { ThemeProvider } from '../lib/theme/theme-provider'
import { TooltipProvider } from '../components/ui'

const rainbowKitTheme = lightTheme({
  accentColor: '#FFC043',
  accentColorForeground: '#111111',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
})

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <HelmetProvider>
      <ThemeProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={rainbowKitTheme} modalSize="compact">
              <TooltipProvider delayDuration={0}>
                {children}
                <Toaster position="top-right" richColors closeButton />
              </TooltipProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}
