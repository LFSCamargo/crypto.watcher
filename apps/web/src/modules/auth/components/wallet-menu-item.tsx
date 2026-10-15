import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAccount, useSignMessage } from 'wagmi'
import { RiWallet3Line } from '@remixicon/react'
import { authApi } from '../api/auth.api'
import { walletErrorMessage } from '../lib/wallet-error-message'
import { useSession } from '../../../store/session'
import { Web3Providers } from '../../../lib/web3/web3-providers'
import { DropdownMenuItem } from '../../../components/ui'

function WalletMenuItemInner({ walletLinked }: { walletLinked: boolean }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const setUser = useSession((state) => state.setUser)
  const queryClient = useQueryClient()

  const login = useMutation({
    mutationFn: () => {
      if (!address) throw new Error('Connect a wallet first')
      return authApi.walletLogin(address, (message) => signMessageAsync({ message }))
    },
    onSuccess: (user) => {
      setUser(user)
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, openAccountModal, account, mounted }) => {
        const connected = mounted && account
        const onSelect = (event: Event) => {
          event.preventDefault()
          if (walletLinked && connected) {
            openAccountModal()
          } else if (connected) {
            const pending = toast.loading(
              'Confirm the signature in your wallet. Signing is free and sends no transaction.',
            )
            login.mutate(undefined, {
              onSuccess: () => toast.success('Wallet linked', { id: pending }),
              onError: (error) => toast.error(walletErrorMessage(error), { id: pending }),
            })
          } else {
            openConnectModal()
          }
        }

        return (
          <DropdownMenuItem onSelect={onSelect}>
            <RiWallet3Line className="h-4 w-4" />
            {walletLinked
              ? 'Wallet linked'
              : isConnected
                ? 'Link this wallet'
                : 'Connect wallet'}
            {walletLinked ? (
              <span className="ml-auto h-2 w-2 rounded-full bg-success" />
            ) : null}
          </DropdownMenuItem>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default function WalletMenuItem({ walletLinked }: { walletLinked: boolean }) {
  return (
    <Web3Providers>
      <WalletMenuItemInner walletLinked={walletLinked} />
    </Web3Providers>
  )
}
