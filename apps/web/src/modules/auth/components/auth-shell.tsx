import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiCheckLine } from '@remixicon/react'
import { ShieldLogo } from '../../../components/brand/shield-logo'

const perks = [
  'Browse 100+ authority-reviewed projects',
  'Comment and discuss with the community',
  'Request reviews and participate in protocol governance',
]

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-5xl items-center gap-10 py-10 lg:grid-cols-2">
      {/* Brand panel */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden flex-col justify-between rounded-3xl bg-foreground p-10 text-background lg:flex lg:min-h-[480px]"
      >
        <Link to="/" className="inline-flex">
          <ShieldLogo size="md" className="[&_span:last-child]:text-background" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">
            Know if a crypto project is safe — before you invest.
          </h2>
          <ul className="mt-6 space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-background/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <RiCheckLine className="h-4 w-4" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-background/50">
          Reviews are community-driven and not financial advice.
        </p>
      </motion.aside>

      {/* Form panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="mb-6 lg:hidden">
          <Link to="/" className="inline-flex">
            <ShieldLogo size="md" />
          </Link>
        </div>
        <h1 className="heading-3 mb-1">{title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{subtitle}</p>
        {children}
        {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
      </motion.div>
    </div>
  )
}
