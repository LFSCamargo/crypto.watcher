import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthControls } from '../../modules/auth/components/auth-controls'
import { useSessionBootstrap } from '../../modules/auth/hooks/use-session'
import { cn } from '../../lib/utils'
import { Logo } from '../../components/brand/logo'
import { ProjectSearch } from '../../modules/projects/components/project-search'
import { BlueprintGrid } from '../../components/ui/blueprint-grid'

const navItems = [
  { href: '/', label: 'Home', end: true },
  { href: '/app', label: 'Safety Index', end: true },
  { href: '/app/governance', label: 'Governance', end: false },
]

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
}

export function AppLayout() {
  useSessionBootstrap()
  const location = useLocation()
  const isDocsPage = location.pathname.startsWith('/docs')
  const isFullWidthPage =
    location.pathname === '/' || isDocsPage

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <BlueprintGrid className="fixed inset-0 z-0 bg-grid-fade" variant="default" />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container-wide flex h-16 items-center gap-3">
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Logo size="md" wordmarkClassName="hidden sm:inline lg:hidden xl:inline" />
          </Link>

          <nav className="hidden shrink-0 items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="app-nav-active"
                        className="absolute inset-x-2 -bottom-[1px] h-0.5 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden flex-1 justify-center md:flex">
            <ProjectSearch
              className="max-w-md"
              placeholder="Search projects..."
              size="compact"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <Link
              to="/docs"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground xl:flex"
            >
              Docs
            </Link>
            <AuthControls />
          </div>
        </div>

        <div className="container-wide border-t border-border/60 py-2 md:hidden">
          <ProjectSearch
            className="w-full"
            placeholder="Search projects..."
            size="compact"
          />
        </div>
      </header>

      <main
        className={cn(
          'relative z-10 w-full flex-1',
          isFullWidthPage ? 'pb-0 pt-0' : 'container-wide pb-24 pt-6 md:pb-10',
        )}
      >
        {isDocsPage ? (
          <Outlet />
        ) : (
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="enter"
            variants={pageVariants}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="app-tab-active"
                      className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
