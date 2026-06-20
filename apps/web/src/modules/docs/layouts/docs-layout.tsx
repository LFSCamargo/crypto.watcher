import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  List,
  X,
  BookOpen,
  Coins,
  Scales,
  Question,
  Rocket,
} from '@phosphor-icons/react'
import { cn } from '../../../lib/utils'

const sidebarLinks = [
  { href: '/docs', label: 'Introduction', icon: BookOpen },
  { href: '/docs/whitepaper', label: 'Whitepaper', icon: Rocket },
  { href: '/docs/tokenomics', label: 'Tokenomics', icon: Coins },
  { href: '/docs/governance', label: 'Governance', icon: Scales },
  { href: '/docs/faq', label: 'FAQ', icon: Question },
]

export function DocsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="relative min-h-screen bg-background">
      <button
        className="mb-4 flex items-center justify-center rounded-lg p-2 hover:bg-secondary lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <List size={20} />}
      </button>

      <div className="container-wide relative z-10 lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border/50 bg-background/95 pt-28 backdrop-blur-xl transition-transform duration-200 lg:static lg:block lg:w-auto lg:translate-x-0 lg:border-0 lg:bg-transparent lg:pt-8',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="sticky top-24 space-y-1 px-4 lg:px-0">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <link.icon size={18} weight={isActive ? 'fill' : 'regular'} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-h-[calc(100vh-4rem)] pb-8 pt-4 lg:pb-12 lg:pt-8">
          <div className="mx-auto max-w-3xl">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
