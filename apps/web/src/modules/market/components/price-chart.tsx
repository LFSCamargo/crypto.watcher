import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '../../../lib/utils'
import { Button, Skeleton } from '../../../components/ui'
import {
  buildChartGeometry,
  findNearestPointIndex,
  getDefaultPadding,
  getGridLineYs,
  pointsToPath,
} from '../lib/chart-geometry'
import {
  CHART_RANGE_OPTIONS,
  computePeriodChange,
  filterChartHistory,
  type ChartRange,
} from '../lib/chart-range'
import { formatChartAxisDate, formatChartDate, formatUsd } from '../lib/format-price'
import type { PricePoint } from '../lib/market.types'

interface PriceChartProps {
  history: PricePoint[]
  className?: string
  variant?: 'full' | 'compact'
  layout?: 'default' | 'panel'
  defaultRange?: ChartRange
  showRangeSelector?: boolean
}

const VARIANT_HEIGHT = {
  full: 160,
  compact: 64,
  panel: 240,
} as const

export function PriceChart({
  history,
  className,
  variant = 'full',
  layout = 'default',
  defaultRange = '1y',
  showRangeSelector,
}: PriceChartProps) {
  const gradientId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [range, setRange] = useState<ChartRange>(defaultRange)

  const isPanelLayout = layout === 'panel'
  const shouldShowRangeSelector = showRangeSelector ?? (variant === 'full' || isPanelLayout)
  const filteredHistory = useMemo(
    () => filterChartHistory(history, range),
    [history, range],
  )
  const periodChange = useMemo(() => computePeriodChange(filteredHistory), [filteredHistory])

  const height = isPanelLayout ? VARIANT_HEIGHT.panel : VARIANT_HEIGHT[variant]
  const padding = getDefaultPadding(isPanelLayout ? 'full' : variant, layout)
  const geometry = useMemo(
    () => (width > 0 ? buildChartGeometry(filteredHistory, width, height, padding) : null),
    [filteredHistory, width, height, padding],
  )

  const stroke =
    periodChange === null || periodChange >= 0
      ? 'hsl(var(--success))'
      : 'hsl(var(--destructive))'
  const activePoint = hoverIndex !== null ? geometry?.points[hoverIndex] : null
  const isReady = Boolean(geometry && geometry.points.length > 0)

  useEffect(() => {
    setRange(defaultRange)
  }, [defaultRange, history])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateWidth = () => {
      const nextWidth = node.getBoundingClientRect().width
      setWidth((current) => (current === nextWidth ? current : nextWidth))
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)
    window.addEventListener('resize', updateWidth)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [filteredHistory.length, variant, layout])

  useEffect(() => {
    setHoverIndex(null)
  }, [range])

  if (history.length === 0) {
    return variant === 'full' || isPanelLayout ? (
      <div className={className}>
        <p className="p-6 text-sm text-muted-foreground">No chart data available.</p>
      </div>
    ) : null
  }

  const updateHoverIndex = (clientX: number) => {
    if (!geometry) return
    const bounds = containerRef.current?.getBoundingClientRect()
    if (!bounds?.width) return

    const relativeX = ((clientX - bounds.left) / bounds.width) * geometry.width
    setHoverIndex(findNearestPointIndex(geometry.points, relativeX))
  }

  const selectorOffset = isPanelLayout ? 44 : variant === 'compact' ? 36 : 52
  const tooltipTop = isPanelLayout ? 10 : shouldShowRangeSelector ? selectorOffset : 10

  return (
    <div
      className={cn(
        'relative w-full touch-none select-none',
        isPanelLayout && 'border-t border-border/60 bg-muted/10',
        variant === 'full' && !isPanelLayout && 'rounded-xl border border-border/60 bg-muted/20',
        className,
      )}
      onMouseLeave={() => setHoverIndex(null)}
    >
      {shouldShowRangeSelector ? (
        <div
          className={cn(
            'flex flex-wrap gap-1 border-b border-border/60',
            isPanelLayout ? 'px-4 py-2.5' : variant === 'compact' ? 'p-2' : 'p-3',
          )}
        >
          {CHART_RANGE_OPTIONS.map((option) => (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={range === option.id ? 'default' : 'ghost'}
              className={cn(
                'h-7 rounded-full px-3 text-xs font-semibold',
                variant === 'compact' && !isPanelLayout && 'h-6 px-2.5',
              )}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setRange(option.id)
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      ) : null}

      <div ref={containerRef} className="relative w-full" style={{ height }}>
        {!isReady ? (
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        ) : (
          <>
            {activePoint ? (
              <div
                className={cn(
                  'pointer-events-none absolute z-20 min-w-[7rem] rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg',
                  variant === 'compact' && !isPanelLayout && 'min-w-[6.5rem] px-2.5 py-1.5',
                )}
                style={{
                  left: `${Math.min(Math.max((activePoint.x / geometry!.width) * 100, 8), 92)}%`,
                  top: tooltipTop,
                  transform:
                    variant === 'compact' && !isPanelLayout
                      ? 'translate(-50%, 0)'
                      : 'translate(-50%, -100%)',
                }}
              >
                <p className="font-semibold tabular-nums text-foreground">
                  {formatUsd(activePoint.price)}
                </p>
                <p className="text-muted-foreground">{formatChartDate(activePoint.timestamp)}</p>
              </div>
            ) : null}

            <svg
              width="100%"
              height={height}
              viewBox={`0 0 ${geometry!.width} ${geometry!.height}`}
              className="absolute inset-0 block h-full w-full"
              role="img"
              aria-label={`Price chart for ${range}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={stroke}
                    stopOpacity={isPanelLayout ? 0.22 : variant === 'compact' ? 0.18 : 0.28}
                  />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>

              {(variant === 'full' || isPanelLayout)
                ? getGridLineYs(geometry!).map((y) => (
                    <line
                      key={y}
                      x1={geometry!.padding.left}
                      x2={geometry!.width - geometry!.padding.right}
                      y1={y}
                      y2={y}
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.55}
                      strokeDasharray="4 6"
                    />
                  ))
                : null}

              <path
                d={`${pointsToPath(geometry!.points)} L ${geometry!.width - geometry!.padding.right} ${geometry!.height - geometry!.padding.bottom} L ${geometry!.padding.left} ${geometry!.height - geometry!.padding.bottom} Z`}
                fill={`url(#${gradientId})`}
              />

              {activePoint ? (
                <line
                  x1={activePoint.x}
                  x2={activePoint.x}
                  y1={geometry!.padding.top}
                  y2={geometry!.height - geometry!.padding.bottom}
                  stroke={stroke}
                  strokeOpacity={0.35}
                  strokeDasharray="3 4"
                />
              ) : null}

              <path
                d={pointsToPath(geometry!.points)}
                fill="none"
                stroke={stroke}
                strokeWidth={isPanelLayout ? 2.5 : variant === 'compact' ? 2 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />

              {activePoint ? (
                <>
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r={variant === 'compact' && !isPanelLayout ? 4 : 5}
                    fill="hsl(var(--background))"
                    stroke={stroke}
                    strokeWidth={2}
                  />
                  <circle cx={activePoint.x} cy={activePoint.y} r={2} fill={stroke} />
                </>
              ) : null}

              {(variant === 'full' || isPanelLayout) ? (
                <>
                  <text
                    x={geometry!.padding.left}
                    y={geometry!.height - 8}
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                  >
                    {formatChartAxisDate(geometry!.points[0]!.timestamp)}
                  </text>
                  <text
                    x={geometry!.width - geometry!.padding.right}
                    y={geometry!.height - 8}
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {formatChartAxisDate(geometry!.points.at(-1)!.timestamp)}
                  </text>
                </>
              ) : null}

              <rect
                x={geometry!.padding.left}
                y={geometry!.padding.top}
                width={geometry!.width - geometry!.padding.left - geometry!.padding.right}
                height={geometry!.height - geometry!.padding.top - geometry!.padding.bottom}
                fill="transparent"
                className="cursor-crosshair"
                onMouseMove={(event) => updateHoverIndex(event.clientX)}
                onTouchMove={(event) => {
                  const touch = event.touches[0]
                  if (touch) updateHoverIndex(touch.clientX)
                }}
                onTouchEnd={() => setHoverIndex(null)}
              />
            </svg>
          </>
        )}
      </div>
    </div>
  )
}
