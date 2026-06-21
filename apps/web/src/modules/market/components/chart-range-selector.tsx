import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui'
import { CHART_RANGE_OPTIONS, type ChartRange } from '../lib/chart-range'

interface ChartRangeSelectorProps {
  range: ChartRange
  onRangeChange: (range: ChartRange) => void
  variant: 'full' | 'compact'
  isPanelLayout: boolean
}

export function ChartRangeSelector({
  range,
  onRangeChange,
  variant,
  isPanelLayout,
}: ChartRangeSelectorProps) {
  return (
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
            onRangeChange(option.id)
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
