import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { SignIn, SignOut } from '@phosphor-icons/react'
import { useSession } from '../../../store/session'
import { useLogout, useWalletLogin } from '../hooks/use-session'
import { Button, Avatar, AvatarFallback } from '../../../components/ui'

export function AuthControls() {
  const { isConnected } = useAccount()
  const user = useSession((state) => state.user)
  const login = useWalletLogin()
  const logout = useLogout()

  const handleLogin = async () => {
    try {
      await login.mutateAsync()
      toast.success('Signed in')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in')
    }
  }

  const handleLogout = async () => {
    await logout.mutateAsync()
    toast.success('Signed out')
  }

  return (
    <div className="flex items-center gap-3">
      {user && (
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {user.displayName?.charAt(0).toUpperCase() ??
                user.walletAddress.charAt(2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[120px] truncate text-sm text-muted-foreground">
            {user.displayName ?? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
          </span>
        </div>
      )}
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, openChainModal, openAccountModal, mounted }) => {
          const connected = mounted && account && chain

          return (
            <div
              {...(!mounted && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button onClick={openConnectModal} size="sm">
                      Connect Wallet
                    </Button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="destructive" size="sm">
                      Wrong network
                    </Button>
                  )
                }

                return (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <img
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          className="h-4 w-4"
                        />
                      )}
                      {chain.name}
                    </Button>

                    <Button onClick={openAccountModal} variant="secondary" size="sm">
                      {account.displayName}
                    </Button>
                  </div>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
      {isConnected && !user && (
        <Button variant="outline" size="sm" onClick={handleLogin} className="gap-2">
          <SignIn size={16} />
          <span className="hidden sm:inline">Sign in</span>
        </Button>
      )}
      {user && (
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <SignOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      )}
    </div>
  )
}
