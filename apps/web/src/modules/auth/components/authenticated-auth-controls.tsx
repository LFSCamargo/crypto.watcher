import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  RiCompass3Line,
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiUserLine,
  RiWallet3Line,
} from '@remixicon/react'
import type { SessionUser } from '../../../store/session'
import { useLogout } from '../hooks/use-session'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui'

const WalletMenuItem = lazy(() => import('./wallet-menu-item'))

export function AuthenticatedAuthControls({ user }: { user: SessionUser }) {
  const navigate = useNavigate()
  const logout = useLogout()

  const displayName =
    user.nickname ?? user.displayName ?? user.email?.split('@')[0] ?? 'Account'
  const walletLinked = Boolean(user.publicKey ?? user.walletAddress)

  const handleLogout = async () => {
    await logout.mutateAsync()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-1.5 transition-colors hover:bg-secondary sm:pr-3"
        >
          <Avatar className="h-8 w-8">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:inline">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold">{displayName}</p>
          {user.email ? (
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          ) : null}
          {user.role !== 'user' ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
              <RiShieldCheckLine className="h-3 w-3" />
              {user.role} authority
            </span>
          ) : null}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => navigate('/app/profile')}>
          <RiUserLine className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/app/in-analysis')}>
          <RiCompass3Line className="h-4 w-4" />
          In Analysis
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <Suspense
          fallback={
            <DropdownMenuItem disabled>
              <RiWallet3Line className="h-4 w-4" />
              Loading wallet...
            </DropdownMenuItem>
          }
        >
          <WalletMenuItem walletLinked={walletLinked} />
        </Suspense>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            void handleLogout()
          }}
          className="text-destructive focus:bg-destructive/10"
        >
          <RiLogoutBoxRLine className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
