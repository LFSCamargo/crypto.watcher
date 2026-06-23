import { useState } from 'react'
import { cn } from '../../../lib/utils'
import type { ChainTvlBreakdown } from '../lib/protocol-metrics.types'
import { chainIconUrl } from '../lib/chain-icon-url'

const CHART_HEIGHT_WIDE = 200
const CHART_HEIGHT_COMPACT = 128
const ICON_ROW_HEIGHT = 28

interface ChainTvlBarChartProps {
  title: string
  items: ChainTvlBreakdown[]
  formatValue: (value: number) => string
  /** Expand chart to full panel width with a side legend when no sibling breakdown. */
  wide?: boolean
}

function ChainBarIcon({ chain, size = 'md' }: { chain: string; size?: 'sm' | 'md' }) {
  const [errored, setErrored] = useState(false)
  const initials = chain.slice(0, 2).toUpperCase()
  const sizeClass = size === 'sm' ? 'h-5 w-5 text-[8px]' : 'h-7 w-7 text-[9px]'

  if (errored) {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold uppercase text-muted-foreground',
          sizeClass,
        )}
        aria-hidden
      >
        {initials}
      </span>
    )
  }

  return (
    <img
      src={chainIconUrl(chain)}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setErrored(true)}
      className={cn('shrink-0 rounded-full object-cover', sizeClass)}
    />
  )
}

export function ChainTvlBarChart({ title, items, formatValue, wide = false }: ChainTvlBarChartProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="mb-2 text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">No breakdown data available.</p>
      </div>
    )
  }

  const maxTvl = Math.max(...items.map((item) => item.tvl), 1)
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
              const barHeight = Math.max(Math.round((item.tvl / maxTvl) * barAreaHeight), 4)

              return (
                <div
                  key={item.chain}
                  className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  title={`${item.chain}: ${formatValue(item.tvl)} (${item.share.toFixed(1)}%)`}
                >
                  <div
                    data-testid="chain-bar"
                    className={cn(
                      'w-full rounded-t-md bg-primary transition-opacity group-hover:opacity-90',
                      wide ? 'max-w-14' : 'max-w-10',
                    )}
                    style={{ height: barHeight }}
                  />
                  <ChainBarIcon chain={item.chain} />
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
            <li key={item.chain} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <ChainBarIcon chain={item.chain} size="sm" />
                <span className="truncate text-muted-foreground">{item.chain}</span>
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {item.share.toFixed(1)}% · {formatValue(item.tvl)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
