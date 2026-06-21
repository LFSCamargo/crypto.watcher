import { useId } from 'react'
import { cn } from '../../../lib/utils'
import { Skeleton } from '../../../components/ui'
import { usePriceChart } from '../hooks/use-price-chart'
import type { ChartRange } from '../lib/chart-range'
import type { PricePoint } from '../lib/market.types'
import { ChartHoverTooltip } from './chart-hover-tooltip'
import { ChartPriceSvg } from './chart-price-svg'
import { ChartRangeSelector } from './chart-range-selector'

interface PriceChartProps {
  history: PricePoint[]
  className?: string
  variant?: 'full' | 'compact'
  layout?: 'default' | 'panel'
  defaultRange?: ChartRange
  showRangeSelector?: boolean
}

export function PriceChart({
  history,
  className,
  variant = 'full',
  layout = 'default',
  defaultRange = '1y',
  showRangeSelector,
}: PriceChartProps) {
  const gradientId = useId()
  const chart = usePriceChart({
    history,
    variant,
    layout,
    defaultRange,
    showRangeSelector,
  })

  if (chart.isEmpty) {
    return variant === 'full' || chart.isPanelLayout ? (
      <div className={className}>
        <p className="p-6 text-sm text-muted-foreground">No chart data available.</p>
      </div>
    ) : null
  }

  return (
    <div
      className={cn(
        'relative w-full touch-none select-none',
        chart.isPanelLayout && 'border-t border-border/60 bg-muted/10',
        variant === 'full' && !chart.isPanelLayout && 'rounded-xl border border-border/60 bg-muted/20',
        className,
      )}
      onMouseLeave={chart.clearHover}
    >
      {chart.shouldShowRangeSelector ? (
        <ChartRangeSelector
          range={chart.range}
          onRangeChange={chart.setRange}
          variant={variant}
          isPanelLayout={chart.isPanelLayout}
        />
      ) : null}

      <div ref={chart.containerRef} className="relative w-full" style={{ height: chart.height }}>
        {!chart.isReady || !chart.geometry ? (
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        ) : (
          <>
            {chart.activePoint ? (
              <ChartHoverTooltip
                point={chart.activePoint}
                chartWidth={chart.geometry.width}
                top={chart.tooltipTop}
                variant={variant}
                isPanelLayout={chart.isPanelLayout}
              />
            ) : null}

            <ChartPriceSvg
              geometry={chart.geometry}
              height={chart.height}
              range={chart.range}
              stroke={chart.stroke}
              gradientId={gradientId}
              activePoint={chart.activePoint}
              variant={variant}
              isPanelLayout={chart.isPanelLayout}
              onHover={chart.updateHoverIndex}
              onHoverEnd={chart.clearHover}
            />
          </>
        )}
      </div>
    </div>
  )
}
