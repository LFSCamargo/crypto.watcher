import { useState } from 'react'
import { cn } from '../../../lib/utils'
import { iconBackdropClass } from '../../projects/lib/project-icon-url'
import { chainIconUrl } from '../lib/chain-icon-url'

const CHART_HEIGHT_WIDE = 200
const CHART_HEIGHT_COMPACT = 128
const ICON_ROW_HEIGHT = 28

export interface BreakdownBarItem {
  key: string
  label: string
  value: number
  share: number
}

interface BreakdownBarChartProps {
  title: string
  items: BreakdownBarItem[]
  formatValue: (value: number) => string
  /** Chain logos vs token symbol initials under each bar. */
  iconVariant?: 'chain' | 'token'
  /** Expand chart to full panel width with a side legend when no sibling breakdown. */
  wide?: boolean
}

function BreakdownIcon({
  label,
  variant,
  size = 'md',
}: {
  label: string
  variant: 'chain' | 'token'
  size?: 'sm' | 'md'
}) {
  const [errored, setErrored] = useState(false)
  const initials = label.slice(0, variant === 'token' ? 4 : 2).toUpperCase()
  const sizeClass = size === 'sm' ? 'h-5 w-5 text-[8px]' : 'h-7 w-7 text-[9px]'

  if (variant === 'chain' && !errored) {
    return (
      <img
        src={chainIconUrl(label)}
        alt=""
        loading="lazy"
        draggable={false}
        onError={() => setErrored(true)}
        className={cn(
          'shrink-0 rounded-full object-cover',
          iconBackdropClass(chainIconUrl(label)),
          sizeClass,
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold uppercase text-foreground',
        sizeClass,
      )}
      aria-hidden
    >
      {initials}
    </span>
  )
}

export function BreakdownBarChart({
  title,
  items,
  formatValue,
  iconVariant = 'chain',
  wide = false,
}: BreakdownBarChartProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="mb-2 text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">No breakdown data available.</p>
      </div>
    )
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1)
  const chartHeight = wide ? CHART_HEIGHT_WIDE : CHART_HEIGHT_COMPACT
  const barAreaHeight = chartHeight - ICON_ROW_HEIGHT

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <p className="mb-4 text-sm font-medium">{title}</p>

      <div className={cn(wide && 'lg:flex lg:items-stretch lg:gap-8')}>
        <div className={cn('min-w-0', wide && 'flex-1')}>
          <div
            className="flex items-end justify-between gap-1 sm:gap-2"
            style={{ height: chartHeight }}
          >
            {items.map((item) => {
              const barHeight = Math.max(
                Math.round((item.value / maxValue) * barAreaHeight),
                4,
              )

              return (
                <div
                  key={item.key}
                  className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  title={`${item.label}: ${formatValue(item.value)} (${item.share.toFixed(1)}%)`}
                >
                  <div
                    data-testid="breakdown-bar"
                    className={cn(
                      'w-full rounded-t-md bg-primary transition-opacity group-hover:opacity-90',
                      wide ? 'max-w-14' : 'max-w-10',
                    )}
                    style={{ height: barHeight }}
                  />
                  <BreakdownIcon label={item.label} variant={iconVariant} />
                </div>
              )
            })}
          </div>
        </div>

        <ul
          className={cn(
            'space-y-1.5 text-xs',
            wide
              ? 'mt-4 border-t border-border/60 pt-3 lg:mt-0 lg:w-72 lg:shrink-0 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6'
              : 'mt-4 border-t border-border/60 pt-3',
          )}
        >
          {items.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <BreakdownIcon label={item.label} variant={iconVariant} size="sm" />
                <span className="truncate text-muted-foreground">{item.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {item.share.toFixed(1)}% · {formatValue(item.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
