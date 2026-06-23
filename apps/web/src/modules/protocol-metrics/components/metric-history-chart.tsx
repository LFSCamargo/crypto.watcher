import { useMemo, useState } from 'react'
import { cn } from '../../../lib/utils'
import { Badge } from '../../../components/ui'
import { PriceChart } from '../../market/components/price-chart'
import type { TimeSeriesPoint, TvlPoint } from '../lib/protocol-metrics.types'
import {
  computeMetricPeriodChange,
  filterMetricHistory,
  METRIC_CHART_RANGE_OPTIONS,
  toChartPoints,
  type ChartRange,
} from '../lib/metric-chart-range'

type RangeOption = (typeof METRIC_CHART_RANGE_OPTIONS)[number]
import { changeTone, formatCompactUsd, formatPercentChange } from '../lib/format-metrics'

interface MetricHistoryChartProps {
  title: string
  history: TimeSeriesPoint[] | TvlPoint[]
  valueKey?: 'value' | 'tvl'
  defaultRange?: ChartRange
  rangeOptions?: ReadonlyArray<RangeOption>
}

function normalizeHistory(
  history: TimeSeriesPoint[] | TvlPoint[],
  valueKey: 'value' | 'tvl',
): TimeSeriesPoint[] {
  if (valueKey === 'value') return history as TimeSeriesPoint[]
  return (history as TvlPoint[]).map((point) => ({
    timestamp: point.timestamp,
    value: point.tvl,
  }))
}

export function MetricHistoryChart({
  title,
  history,
  valueKey = 'value',
  defaultRange = '3m',
  rangeOptions = METRIC_CHART_RANGE_OPTIONS,
}: MetricHistoryChartProps) {
  const [range, setRange] = useState<ChartRange>(defaultRange)
  const normalized = useMemo(
    () => normalizeHistory(history, valueKey),
    [history, valueKey],
  )
  const filtered = useMemo(
    () => filterMetricHistory(normalized, range),
    [normalized, range],
  )
  const periodChange = useMemo(() => computeMetricPeriodChange(filtered), [filtered])
  const chartHistory = useMemo(() => toChartPoints(filtered), [filtered])

  if (normalized.length < 2) return null

  const tone = changeTone(periodChange)
  const variant =
    tone === 'positive' ? 'success' : tone === 'negative' ? 'destructive' : 'secondary'

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          {periodChange != null ? (
            <Badge variant={variant} className="rounded-full px-2 py-0.5 text-xs">
              {formatPercentChange(periodChange)}
            </Badge>
          ) : null}
        </div>
        <div className="flex gap-1">
          {rangeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                range === option.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <PriceChart
        history={chartHistory}
        layout="panel"
        defaultRange="1y"
        showRangeSelector={false}
      />
      <p className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
        Latest: {formatCompactUsd(filtered.at(-1)?.value ?? null)}
      </p>
    </div>
  )
}
