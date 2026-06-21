import { Link } from 'react-router-dom'
import {
  RiAddLine,
  RiArrowRightLine,
  RiShieldCheckLine,
} from '@remixicon/react'
import { Button } from '../ui/button'
import { Logo } from '../brand/logo'
import { cn } from '../../lib/utils'

const productLinks = [
  { to: '/app', label: 'Safe Projects' },
  { to: '/app/in-analysis', label: 'In Analysis' },
  { to: '/app/analysis-request', label: 'Request a Review' },
]

const resourceLinks = [
  { to: '/docs', label: 'Documentation' },
  { to: '/docs/whitepaper', label: 'Whitepaper' },
  { to: '/docs/governance', label: 'Governance' },
  { to: '/docs/faq', label: 'FAQ' },
]

const accountLinks = [
  { to: '/auth/signin', label: 'Sign in' },
  { to: '/auth/signup', label: 'Create account' },
]

function FooterLinkGroup({
  title,
  links,
}: {
  title: string
  links: { to: string; label: string }[]
}) {
  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <span className="h-px w-4 bg-primary" aria-hidden />
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <RiArrowRightLine className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 mt-auto border-t border-border bg-card/60 pb-24 lg:pb-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container-wide pt-14 md:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div className="space-y-5 lg:max-w-sm">
            <Link to="/" className="inline-block transition-opacity hover:opacity-80">
              <Logo size="sm" wordmarkClassName="text-xl" />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Blockchain risk review company. Decide whether a crypto project is safe
              to invest in — backed by authority reviews and community signals.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-success" />
              Reviews updated continuously
            </div>
          </div>

          <FooterLinkGroup title="Product" links={productLinks} />
          <FooterLinkGroup title="Resources" links={resourceLinks} />
          <FooterLinkGroup title="Account" links={accountLinks} />
        </div>

        <div className="mt-12 md:mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-foreground p-6 text-background md:p-8">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <RiShieldCheckLine className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-bold">Need a project reviewed?</p>
                  <p className="mt-1 max-w-lg text-sm text-background/70">
                    Deploy a voting contract and pay protocol fees to request an
                    official risk analysis from our authority panel.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className={cn(
                  'shrink-0 gap-2 rounded-full',
                  'bg-background text-foreground hover:bg-background/90',
                )}
              >
                <Link to="/app/analysis-request">
                  <RiAddLine className="h-5 w-5" />
                  Create a Project
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} Crypto Watcher. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="text-muted-foreground/60">Privacy Policy (coming soon)</span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span className="text-muted-foreground/60">Terms of Service (coming soon)</span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span>Not financial advice.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
