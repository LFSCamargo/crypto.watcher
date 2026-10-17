import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RouteSeo } from '../../lib/seo'
import { useSessionBootstrap } from '../../modules/auth/hooks/use-session'
import { cn } from '../../lib/utils'
import { AppFooter } from '../../components/layout/app-footer'
import { AppHeader } from '../../components/layout/app-header'
import { MobileNavigation } from '../../components/layout/mobile-navigation'
import { PageGridBackground } from '../../components/layout/page-grid-background'
import { useRouteFocus } from '../../components/layout/use-route-focus'
import { CommandPalette } from '../../components/search/command-palette'
import { useCommandPalette } from '../../components/search/use-command-palette'
import { MarketCacheWarmup } from '../../modules/market/components/market-cache-warmup'
import { curatedProjects } from '../../modules/projects/lib/curated-projects'

const marketSlugs = curatedProjects.map((project) => project.slug)

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1 },
}

export function AppLayout() {
  useSessionBootstrap()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus(mainRef)
  const { open, setOpen } = useCommandPalette()
  const isLanding = location.pathname === '/'
  const isDocsPage = location.pathname.startsWith('/docs')
  const isBlogPage = location.pathname.startsWith('/blog')
  const isFullWidthPage = isLanding || isDocsPage || isBlogPage

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <MarketCacheWarmup slugs={marketSlugs} />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <RouteSeo />
      <PageGridBackground />
      <CommandPalette open={open} onOpenChange={setOpen} />
      <AppHeader
        searchOpen={open}
        onOpenSearch={() => setOpen(true)}
        onCloseSearch={() => setOpen(false)}
      />

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 min-h-[calc(100dvh-4rem)] w-full min-w-0 flex-1 [overflow-wrap:anywhere] pb-[calc(7rem+env(safe-area-inset-bottom))] outline-none lg:pb-12',
          isFullWidthPage ? 'pt-0 lg:pb-0' : 'container-wide pt-8',
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
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        )}
      </main>

      <AppFooter />
      <MobileNavigation />
    </div>
  )
}
