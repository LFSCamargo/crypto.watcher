import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RiAddLine, RiLogoutBoxRLine, RiMenuLine, RiUserLine } from '@remixicon/react'
import { useLogout } from '../../modules/auth/hooks/use-session'
import { useSession } from '../../store/session'
import { cn } from '../../lib/utils'
import { ThemeToggle } from '../theme/theme-toggle'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'
import { primaryNavItems, resourceNavItems } from './navigation'

const barItemClass =
  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function MobileNavigation() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const user = useSession((state) => state.user)
  const logout = useLogout()
  const close = () => setOpen(false)

  const handleSignOut = async () => {
    await logout.mutateAsync()
    close()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <nav
      aria-label="Mobile"
      className="glass-nav fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-1">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(barItemClass, isActive ? 'text-foreground' : 'text-muted-foreground')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className={cn(barItemClass, 'text-muted-foreground')}
            >
              <span className="flex h-7 w-12 items-center justify-center rounded-full">
                <RiMenuLine className="h-5 w-5" aria-hidden />
              </span>
              Menu
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" aria-describedby="mobile-menu-description">
            <div className="pr-10">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription id="mobile-menu-description">
                Resources, account and display settings.
              </SheetDescription>
            </div>

            <section aria-labelledby="mobile-menu-resources">
              <h2
                id="mobile-menu-resources"
                className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Resources
              </h2>
              <ul className="grid grid-cols-2 gap-2">
                {resourceNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={close}
                      className="flex min-h-12 items-center gap-2.5 rounded-2xl bg-foreground/5 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="mobile-menu-account" className="space-y-2">
              <h2
                id="mobile-menu-account"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Account
              </h2>
              {user ? (
                <div className="grid gap-2">
                  <Button asChild variant="outline" className="justify-start">
                    <Link to="/app/profile" onClick={close}>
                      <RiUserLine aria-hidden />
                      Profile
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start">
                    <Link to="/app/analysis-request" onClick={close}>
                      <RiAddLine aria-hidden />
                      Request analysis
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="justify-start text-destructive-strong"
                    disabled={logout.isPending}
                    onClick={() => void handleSignOut()}
                  >
                    <RiLogoutBoxRLine aria-hidden />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline">
                    <Link to="/auth/signin" onClick={close}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth/signup" onClick={close}>
                      Get started
                    </Link>
                  </Button>
                </div>
              )}
            </section>

            <div className="flex items-center justify-between rounded-2xl bg-foreground/5 px-4 py-2">
              <span className="text-sm font-semibold">Appearance</span>
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
