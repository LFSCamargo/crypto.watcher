import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildChartGeometry,
  findNearestPointIndex,
  getDefaultPadding,
  type ChartGeometry,
  type ChartPoint,
} from '../lib/chart-geometry'
import {
  computePeriodChange,
  filterChartHistory,
  type ChartRange,
} from '../lib/chart-range'
import type { PricePoint } from '../lib/market.types'

const VARIANT_HEIGHT = {
  full: 160,
  compact: 64,
  panel: 240,
} as const

interface UsePriceChartOptions {
  history: PricePoint[]
  variant: 'full' | 'compact'
  layout: 'default' | 'panel'
  defaultRange: ChartRange
  showRangeSelector?: boolean
}

export function usePriceChart({
  history,
  variant,
  layout,
  defaultRange,
  showRangeSelector,
}: UsePriceChartOptions) {
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
  const activePoint: ChartPoint | null =
    hoverIndex !== null && geometry ? (geometry.points[hoverIndex] ?? null) : null
  const isReady = Boolean(geometry && geometry.points.length > 0)
  const isEmpty = history.length === 0

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

  const updateHoverIndex = (clientX: number) => {
    if (!geometry) return
    const bounds = containerRef.current?.getBoundingClientRect()
    if (!bounds?.width) return

    const relativeX = ((clientX - bounds.left) / bounds.width) * geometry.width
    setHoverIndex(findNearestPointIndex(geometry.points, relativeX))
  }

  const selectorOffset = isPanelLayout ? 44 : variant === 'compact' ? 36 : 52
  const tooltipTop = isPanelLayout ? 10 : shouldShowRangeSelector ? selectorOffset : 10

  return {
    containerRef,
    range,
    setRange,
    geometry: geometry as ChartGeometry | null,
    stroke,
    activePoint,
    isReady,
    isEmpty,
    height,
    variant,
    isPanelLayout,
    shouldShowRangeSelector,
    tooltipTop,
    updateHoverIndex,
    clearHover: () => setHoverIndex(null),
  }
}
