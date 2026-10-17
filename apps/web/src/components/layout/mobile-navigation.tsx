import { useState, type MouseEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RiAddLine, RiLogoutBoxRLine, RiMenuLine, RiUserLine } from '@remixicon/react'
import { useLogout } from '../../modules/auth/hooks/use-session'
import { useAuthLinks } from '../../modules/auth/hooks/use-auth-links'
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
import { useCompactHeader } from './use-compact-header'

const pillMotion = 'duration-500 ease-glass motion-reduce:transition-none'

const barItemClass =
  'flex h-full shrink-0 flex-row items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function MobileNavigation() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const user = useSession((state) => state.user)
  const { signInHref, signUpHref } = useAuthLinks()
  const logout = useLogout()
  const { compact, expand, onPointerEnter, onPointerLeave } = useCompactHeader()
  const close = () => setOpen(false)

  function expandBeforeAction(event: MouseEvent<HTMLElement>) {
    if (!compact) return
    event.preventDefault()
    event.stopPropagation()
    expand()
  }

  const handleSignOut = async () => {
    await logout.mutateAsync()
    close()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <nav
      aria-label="Mobile"
      data-size={compact ? 'compact' : 'expanded'}
      onClickCapture={expandBeforeAction}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={cn(
        'glass-nav glass-pill fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center justify-center overflow-hidden rounded-full transition-[width,height,padding]',
        pillMotion,
        'lg:hidden',
        compact
          ? 'h-12 w-fit max-w-[calc(100%-2rem)] gap-0.5 p-1'
          : 'h-16 w-fit max-w-[calc(100%-2rem)] gap-1 p-1.5',
      )}
    >
      <div className="flex h-full items-center justify-center gap-1">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                barItemClass,
                compact ? 'gap-0 px-3' : 'gap-1.5 px-3.5',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-[max-width,opacity]',
                pillMotion,
                compact ? 'max-w-0 opacity-0' : 'max-w-36 opacity-100',
              )}
            >
              {item.label}
            </span>
          </NavLink>
        ))}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className={cn(
                barItemClass,
                compact ? 'gap-0 px-3' : 'gap-1.5 px-3.5',
                'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
              )}
            >
              <RiMenuLine className="h-5 w-5 shrink-0" aria-hidden />
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap transition-[max-width,opacity]',
                  pillMotion,
                  compact ? 'max-w-0 opacity-0' : 'max-w-36 opacity-100',
                )}
              >
                Menu
              </span>
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
                      Request a review
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
                    <Link to={signInHref} onClick={close}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to={signUpHref} onClick={close}>
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
