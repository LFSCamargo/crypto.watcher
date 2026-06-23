import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { RouteSeo } from '../../lib/seo'
import { RiCompass3Line, RiSearchLine, RiStackLine } from '@remixicon/react'
import { motion } from 'framer-motion'
import { AuthControls } from '../../modules/auth/components/auth-controls'
import { useSessionBootstrap } from '../../modules/auth/hooks/use-session'
import { cn } from '../../lib/utils'
import { Logo } from '../../components/brand/logo'
import { ThemeToggle } from '../../components/theme/theme-toggle'
import { AppFooter } from '../../components/layout/app-footer'
import { PageGridBackground } from '../../components/layout/page-grid-background'
import { ResourcesMenu } from '../../components/layout/resources-menu'
import { CommandPalette } from '../../components/search/command-palette'
import { useCommandPalette } from '../../components/search/use-command-palette'
import { Button } from '../../components/ui'

const navItems = [
  { href: '/app', label: 'Projects', icon: RiStackLine, end: true },
  { href: '/app/in-analysis', label: 'In Analysis', icon: RiCompass3Line, end: false },
]

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
}

export function AppLayout() {
  useSessionBootstrap()
  const location = useLocation()
  const { open, setOpen } = useCommandPalette()
  const isLanding = location.pathname === '/'
  const isDocsPage = location.pathname.startsWith('/docs')
  const isBlogPage = location.pathname.startsWith('/blog')
  const isFullWidthPage = isLanding || isDocsPage || isBlogPage

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <RouteSeo />
      <PageGridBackground />
      <CommandPalette open={open} onOpenChange={setOpen} />

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container-wide flex h-16 items-center gap-3">
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Logo size="sm" wordmarkClassName="hidden sm:inline" />
          </Link>

          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <ResourcesMenu />
          </nav>

          <div className="ml-auto hidden flex-1 justify-end md:flex md:max-w-sm">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-full items-center gap-2 rounded-full border border-border bg-card px-4 pr-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30"
            >
              <RiSearchLine className="h-4 w-4" />
              <span className="flex-1 text-left">Search projects…</span>
              <kbd className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold">
                <span>⌘</span>
                <span className="text-muted-foreground/70">+</span>
                <span>K</span>
              </kbd>
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Search projects"
            >
              <RiSearchLine className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <AuthControls />
          </div>
        </div>
      </header>

      <main
        className={cn(
          'relative z-10 w-full flex-1',
          isFullWidthPage ? 'pb-0 pt-0' : 'container-wide pb-24 pt-8 lg:pb-12',
        )}
      >
        {isDocsPage || isBlogPage ? (
          <Outlet />
        ) : (
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="enter"
            variants={pageVariants}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        )}
      </main>

      <AppFooter />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
