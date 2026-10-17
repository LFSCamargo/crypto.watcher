import { Link } from 'react-router-dom'
import { RiAddLine, RiShieldCheckLine } from '@remixicon/react'
import { Button } from '../ui/button'
import { Logo } from '../brand/logo'
import { FooterLinkGroup } from './footer-link-group'
import { footerLinkGroups } from './navigation'

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 mt-auto border-t border-border bg-card/60 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="container-wide pt-14 md:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div className="space-y-5 lg:max-w-sm">
            <Link
              to="/"
              className="inline-block rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Logo size="sm" wordmarkClassName="text-xl" />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Expert-governed crypto risk research. Official scores are published only by
              a vetted governor council — never by token-weighted voting.
            </p>
          </div>

          {footerLinkGroups.map((group) => (
            <FooterLinkGroup key={group.title} {...group} />
          ))}
        </div>

        <div className="glass-card-flat mt-12 p-6 md:mt-14 md:p-8">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <RiShieldCheckLine className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-lg font-bold">Need a project reviewed?</p>
                <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                  Submit it to the governor council queue. Requests are free during
                  launch; any future fee schedule is set through CWT protocol governance.
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link to="/app/analysis-request">
                <RiAddLine className="h-5 w-5" aria-hidden />
                Submit a project
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} Crypto Watcher. All rights reserved.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>Privacy Policy (coming soon)</span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span>Terms of Service (coming soon)</span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span>Not financial advice.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
