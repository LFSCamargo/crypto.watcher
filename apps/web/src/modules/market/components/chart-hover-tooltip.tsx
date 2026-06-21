import { cn } from '../../../lib/utils'
import type { ChartPoint } from '../lib/chart-geometry'
import { formatChartDate, formatUsd } from '../lib/format-price'

interface ChartHoverTooltipProps {
  point: ChartPoint
  chartWidth: number
  top: number
  variant: 'full' | 'compact'
  isPanelLayout: boolean
}

export function ChartHoverTooltip({
  point,
  chartWidth,
  top,
  variant,
  isPanelLayout,
}: ChartHoverTooltipProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute z-20 min-w-[7rem] rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg',
        variant === 'compact' && !isPanelLayout && 'min-w-[6.5rem] px-2.5 py-1.5',
      )}
      style={{
        left: `${Math.min(Math.max((point.x / chartWidth) * 100, 8), 92)}%`,
        top,
        transform:
          variant === 'compact' && !isPanelLayout
            ? 'translate(-50%, 0)'
            : 'translate(-50%, -100%)',
      }}
    >
      <p className="font-semibold tabular-nums text-foreground">{formatUsd(point.price)}</p>
      <p className="text-muted-foreground">{formatChartDate(point.timestamp)}</p>
    </div>
  )
}
