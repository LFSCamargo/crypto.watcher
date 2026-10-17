import type { ComponentType, ReactNode } from 'react'
import { ToneIcon, type Tone } from '../ui'
import { cn } from '../../lib/utils'

interface PageHeroStat {
  label: string
  value: ReactNode
}

interface PageHeroProps {
  icon: ComponentType<{ className?: string }>
  title: string
  tone?: Tone
  accentTone?: Tone
  eyebrow?: string
  description?: ReactNode
  status?: ReactNode
  actions?: ReactNode
  stats?: PageHeroStat[]
  className?: string
}

const orbitDotClasses: Record<Tone, string> = {
  amber: 'bg-tone-amber',
  coral: 'bg-tone-coral',
  violet: 'bg-tone-violet',
  sky: 'bg-tone-sky',
  teal: 'bg-tone-teal',
  pink: 'bg-tone-pink',
}

const eyebrowClasses: Record<Tone, string> = {
  amber: 'bg-tone-amber/15 text-tone-amber-strong',
  coral: 'bg-tone-coral/15 text-tone-coral-strong',
  violet: 'bg-tone-violet/15 text-tone-violet-strong',
  sky: 'bg-tone-sky/15 text-tone-sky-strong',
  teal: 'bg-tone-teal/15 text-tone-teal-strong',
  pink: 'bg-tone-pink/15 text-tone-pink-strong',
}

const iconTextClasses: Record<Tone, string> = {
  amber: 'text-tone-amber-strong',
  coral: 'text-tone-coral-strong',
  violet: 'text-tone-violet-strong',
  sky: 'text-tone-sky-strong',
  teal: 'text-tone-teal-strong',
  pink: 'text-tone-pink-strong',
}

export function PageHero({
  icon,
  title,
  tone = 'amber',
  accentTone = 'violet',
  eyebrow,
  description,
  status,
  actions,
  stats,
  className,
}: PageHeroProps) {
  const Icon = icon
  const backgroundImage = [
    `radial-gradient(36rem 22rem at 0% 0%, hsl(var(--tone-${tone}) / 0.2), transparent 70%)`,
    `radial-gradient(30rem 20rem at 100% 100%, hsl(var(--tone-${accentTone}) / 0.18), transparent 70%)`,
  ].join(', ')

  return (
    <section
      className={cn(
        'glass-card-flat relative isolate overflow-hidden rounded-[2rem] px-6 py-8 md:px-10 md:py-10',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/2 -z-10 hidden h-72 w-72 -translate-y-1/2 md:block"
      >
        <span className="absolute inset-0 rounded-full border border-border/70" />
        <span className="absolute inset-10 rounded-full border border-dashed border-border" />
        <span className="absolute inset-[6.5rem] flex items-center justify-center rounded-full bg-background/70 ring-1 ring-border">
          <Icon className={cn('h-8 w-8', iconTextClasses[tone])} />
        </span>
        <span className="absolute inset-0 animate-[spin_24s_linear_infinite] motion-reduce:animate-none">
          <span
            className={cn(
              'absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_12px_currentColor]',
              orbitDotClasses[tone],
            )}
          />
        </span>
        <span className="absolute inset-10 animate-[spin_16s_linear_infinite_reverse] motion-reduce:animate-none">
          <span
            className={cn(
              'absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full',
              orbitDotClasses[accentTone],
            )}
          />
        </span>
      </div>

      <div className="relative max-w-3xl space-y-5 md:pr-48">
        <div className="flex flex-wrap items-center gap-3">
          <ToneIcon icon={icon} tone={tone} size="lg" />
          {eyebrow && (
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider',
                eyebrowClasses[tone],
              )}
            >
              {eyebrow}
            </span>
          )}
          {status && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
              <span
                aria-hidden
                className={cn(
                  'h-2 w-2 animate-pulse rounded-full motion-reduce:animate-none',
                  orbitDotClasses[accentTone],
                )}
              />
              {status}
            </span>
          )}
        </div>
        <div className="space-y-3">
          <h1 className="break-words text-balance text-3xl font-bold tracking-tight md:text-5xl">
            {title}
          </h1>
          {description && (
            <div className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
        )}
        {stats && stats.length > 0 && (
          <ul aria-label={`${title} at a glance`} className="flex flex-wrap gap-3 pt-1">
            {stats.map((stat) => (
              <li
                key={stat.label}
                className="rounded-2xl border border-border/70 bg-background/60 px-4 py-2.5"
              >
                <span className="block text-xl font-semibold tabular-nums">
                  {stat.value}
                </span>
                <span className="block text-xs text-muted-foreground">{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
