import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { useSession } from '../../../store/session'
import { useLogout, useWalletLogin } from '../hooks/use-session'

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
        <span className="text-sm text-muted-foreground">
          {user.displayName ?? user.walletAddress.slice(0, 10)}
        </span>
      )}
      <ConnectButton />
      {isConnected && !user && (
        <button className="rounded-md border px-3 py-2 text-sm" onClick={handleLogin}>
          Sign in
        </button>
      )}
      {user && (
        <button className="rounded-md border px-3 py-2 text-sm" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  )
}
