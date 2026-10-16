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
import { useCompactHeader } from './use-compact-header'

const pillMotion = 'duration-500 ease-glass motion-reduce:transition-none'

interface AppHeaderProps {
  onOpenSearch: () => void
}

export function AppHeader({ onOpenSearch }: AppHeaderProps) {
  const isSignedIn = useSession((state) => Boolean(state.user))
  const { compact, expand, onPointerEnter, onPointerLeave } = useCompactHeader()

  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div
        data-size={compact ? 'compact' : 'expanded'}
        onClick={compact ? expand : undefined}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className={cn(
          'glass-nav glass-pill pointer-events-auto mx-auto flex items-center rounded-full transition-[max-width,height,padding,gap]',
          pillMotion,
          compact ? 'h-12 max-w-4xl gap-2 px-2' : 'h-16 max-w-7xl gap-3 px-3 sm:px-5',
        )}
      >
        <Link
          to="/"
          className="shrink-0 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo
            size="sm"
            wordmarkClassName={cn(
              'hidden overflow-hidden whitespace-nowrap transition-[max-width,opacity] sm:inline-block',
              pillMotion,
              compact ? 'max-w-0 opacity-0' : 'max-w-[14rem] opacity-100',
            )}
          />
        </Link>

        <nav
          aria-label="Primary"
          className={cn('hidden items-center gap-1 lg:flex', !compact && 'ml-2')}
        >
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

        <div
          className={cn(
            'ml-auto hidden flex-1 justify-end transition-[max-width] md:flex',
            pillMotion,
            compact ? 'md:max-w-10' : 'md:max-w-xs xl:max-w-sm',
          )}
        >
          <button
            type="button"
            onClick={onOpenSearch}
            aria-keyshortcuts="Meta+K Control+K"
            className={cn(
              'flex h-10 w-full items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-foreground/10 bg-background/60 text-sm text-muted-foreground transition-[padding,border-color] hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              pillMotion,
              compact ? 'px-3' : 'px-4 pr-2.5',
            )}
          >
            <RiSearchLine className="h-4 w-4 shrink-0" aria-hidden />
            <span
              className={cn(
                'flex-1 text-left transition-opacity',
                pillMotion,
                compact && 'opacity-0',
              )}
            >
              Search projects…
            </span>
            <kbd
              aria-hidden
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold transition-opacity',
                pillMotion,
                compact && 'opacity-0',
              )}
            >
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
              className={cn('hidden gap-1', !compact && 'xl:inline-flex')}
            >
              <Link to="/app/analysis-request">
                <RiAddLine aria-hidden />
                Request a review
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
