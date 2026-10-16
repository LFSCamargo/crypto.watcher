import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RiCheckLine } from '@remixicon/react'
import { ShieldLogo } from '../../../components/brand/shield-logo'

const perks = [
  'Read expert-reviewed safety scores and reports',
  'Join the discussion on any project',
  'Request reviews and follow protocol governance',
]

interface AuthShellProps {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative mx-auto grid min-h-[calc(100dvh-12rem)] max-w-5xl items-center gap-10 py-6 md:py-10 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(28rem_22rem_at_70%_45%,hsl(var(--primary)/0.22),transparent_70%)]"
      />
      <aside className="hidden flex-col gap-8 lg:flex">
        <Link to="/" className="inline-flex">
          <ShieldLogo size="md" />
          <span className="sr-only"> home</span>
        </Link>
        <div>
          <p className="heading-3 max-w-sm text-balance">
            Know whether a crypto project is safe — before you invest.
          </p>
          <ul className="mt-6 space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <RiCheckLine className="h-4 w-4" aria-hidden />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Scores are published by a vetted governor council. Nothing on Crypto Watcher is
          financial advice.
        </p>
      </aside>

      <section className="glass-panel w-full rounded-3xl p-6 sm:p-8">
        <h1 className="heading-3 mb-1">{title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{subtitle}</p>
        {children}
        {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
        <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
          Scores are published by a vetted governor council. Not financial advice.
        </p>
      </section>
    </div>
  )
}
