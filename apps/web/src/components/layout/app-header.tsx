import { Link, NavLink } from 'react-router-dom'
import { RiAddLine, RiSearchLine } from '@remixicon/react'
import { AuthControls } from '../../modules/auth/components/auth-controls'
import { useSession } from '../../store/session'
import { cn } from '../../lib/utils'
import { Logo } from '../brand/logo'
import { ThemeToggle } from '../theme/theme-toggle'
import { Button } from '../ui/button'
import { primaryNavItems } from './navigation'
import { ResourcesMenu } from './resources-menu'

interface AppHeaderProps {
  onOpenSearch: () => void
}

export function AppHeader({ onOpenSearch }: AppHeaderProps) {
  const isSignedIn = useSession((state) => Boolean(state.user))

  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="container-wide flex h-16 items-center gap-3">
        <Link
          to="/"
          className="shrink-0 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo size="sm" wordmarkClassName="hidden sm:inline" />
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 lg:flex">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <ResourcesMenu />
        </nav>

        <div className="ml-auto hidden flex-1 justify-end md:flex md:max-w-xs xl:max-w-sm">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search projects"
            className="flex h-10 w-full items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-4 pr-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RiSearchLine className="h-4 w-4" aria-hidden />
            <span className="flex-1 text-left">Search projects…</span>
            <kbd className="inline-flex items-center gap-0.5 rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenSearch}
            aria-label="Search projects"
          >
            <RiSearchLine className="h-5 w-5" />
          </Button>
          {isSignedIn ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-1 xl:inline-flex"
            >
              <Link to="/app/analysis-request">
                <RiAddLine aria-hidden />
                Request analysis
              </Link>
            </Button>
          ) : null}
          <ThemeToggle className="hidden sm:inline-flex" />
          <AuthControls />
        </div>
      </div>
    </header>
  )
}
