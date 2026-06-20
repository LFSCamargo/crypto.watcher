import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { Toaster } from 'sonner'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../lib/web3/config'
import { TooltipProvider } from '../components/ui'

const rainbowKitTheme = darkTheme({
  accentColor: '#f5b800',
  accentColorForeground: '#0a0a0b',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
})

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme} modalSize="compact">
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster
              theme="dark"
              position="top-right"
              toastOptions={{
                style: {
                  background: 'hsl(0 0% 7%)',
                  border: '1px solid hsl(0 0% 15%)',
                  color: 'hsl(0 0% 98%)',
                },
              }}
            />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
