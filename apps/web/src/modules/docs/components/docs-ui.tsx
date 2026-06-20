import type { ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'
import { CheckCircle, Info, Warning } from '@phosphor-icons/react'
import { Card } from '../../../components/ui'
import { cn } from '../../../lib/utils'

export function DocsHero({
  icon: HeroIcon,
  eyebrow,
  title,
  description,
}: {
  icon: Icon
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-12 border-b border-border/50 pb-8">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <HeroIcon size={14} weight="fill" />
        {eyebrow}
      </div>
      <h1 className="heading-2 mb-4">{title}</h1>
      <p className="body-large max-w-2xl">{description}</p>
    </div>
  )
}

export function DocsSection({
  id,
  icon: SectionIcon,
  title,
  children,
}: {
  id?: string
  icon?: Icon
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <div className="mb-5 flex items-center gap-3">
        {SectionIcon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SectionIcon size={20} weight="duotone" />
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function DocsSubheading({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-lg font-semibold text-foreground">{children}</h3>
}

export function DocsP({ children }: { children: ReactNode }) {
  return <p className="leading-relaxed text-muted-foreground">{children}</p>
}

export function DocsList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-muted-foreground">
          <CheckCircle
            size={18}
            weight="fill"
            className="mt-0.5 shrink-0 text-primary"
          />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function DocsSteps({
  steps,
}: {
  steps: { title: string; description: ReactNode }[]
}) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={index}>
          <Card className="flex gap-4 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              {index + 1}
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{step.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </Card>
        </li>
      ))}
    </ol>
  )
}

export function DocsCardGrid({
  children,
  columns = 2,
}: {
  children: ReactNode
  columns?: 2 | 3
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {children}
    </div>
  )
}

export function DocsFeatureCard({
  icon: CardIcon,
  title,
  children,
}: {
  icon: Icon
  title: string
  children: ReactNode
}) {
  return (
    <Card className="card-hover h-full p-5">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <CardIcon size={22} weight="duotone" />
      </span>
      <h3 className="mb-1.5 font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </Card>
  )
}

export function DocsParams({
  params,
}: {
  params: { label: string; value: ReactNode }[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {params.map((param) => (
        <Card key={param.label} className="flex items-center justify-between gap-4 p-4">
          <span className="text-sm text-muted-foreground">{param.label}</span>
          <span className="text-right text-sm font-semibold text-foreground">
            {param.value}
          </span>
        </Card>
      ))}
    </div>
  )
}

export function DocsCallout({
  variant = 'info',
  title,
  children,
}: {
  variant?: 'info' | 'warning'
  title?: string
  children: ReactNode
}) {
  const CalloutIcon = variant === 'warning' ? Warning : Info
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4',
        variant === 'warning'
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-primary/30 bg-primary/5',
      )}
    >
      <CalloutIcon
        size={20}
        weight="fill"
        className={cn(
          'mt-0.5 shrink-0',
          variant === 'warning' ? 'text-destructive' : 'text-primary',
        )}
      />
      <div className="space-y-1 text-sm leading-relaxed text-muted-foreground">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        {children}
      </div>
    </div>
  )
}

export function DocsTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left">
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold text-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border/50 last:border-0 hover:bg-secondary/20"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      'px-4 py-3',
                      cellIndex === 0
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function DocsFaqItem({
  question,
  children,
}: {
  question: string
  children: ReactNode
}) {
  return (
    <Card className="p-5">
      <h3 className="mb-2 font-semibold text-foreground">{question}</h3>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </Card>
  )
}

export function DocsPhaseCard({
  phase,
  title,
  items,
  active = false,
}: {
  phase: string
  title: string
  items: string[]
  active?: boolean
}) {
  return (
    <Card className={cn('h-full p-5', active && 'border-primary/40 bg-primary/5')}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground',
          )}
        >
          {phase}
        </span>
        {active && <span className="text-xs font-medium text-primary">Current</span>}
      </div>
      <h3 className="mb-3 font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}
