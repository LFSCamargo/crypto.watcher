import type { PricePoint } from './market.types'

export interface ChartPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartPoint extends PricePoint {
  x: number
  y: number
}

export interface ChartGeometry {
  width: number
  height: number
  padding: ChartPadding
  points: ChartPoint[]
  minPrice: number
  maxPrice: number
}

export function getDefaultPadding(variant: 'full' | 'compact', layout: 'default' | 'panel' = 'default'): ChartPadding {
  if (layout === 'panel') {
    return { top: 8, right: 0, bottom: 22, left: 0 }
  }

  return variant === 'compact'
    ? { top: 6, right: 0, bottom: 2, left: 0 }
    : { top: 12, right: 0, bottom: 28, left: 0 }
}

export function buildChartGeometry(
  history: PricePoint[],
  width: number,
  height: number,
  padding: ChartPadding,
): ChartGeometry | null {
  if (history.length === 0 || width <= 0 || height <= 0) return null

  const prices = history.map((point) => point.price)
  const rawMin = Math.min(...prices)
  const rawMax = Math.max(...prices)
  const minVisualRange = Math.max(rawMax * 0.015, 0.0001)
  const rawRange = Math.max(rawMax - rawMin, minVisualRange)
  const pricePadding = rawRange * 0.08
  const minPrice = rawMin - pricePadding
  const maxPrice = rawMax + pricePadding
  const range = maxPrice - minPrice

  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const points: ChartPoint[] = history.map((point, index) => ({
    ...point,
    x: padding.left + (index / Math.max(history.length - 1, 1)) * chartWidth,
    y: padding.top + chartHeight - ((point.price - minPrice) / range) * chartHeight,
  }))

  return { width, height, padding, points, minPrice, maxPrice }
}

export function pointsToPath(points: ChartPoint[]): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
}

export function findNearestPointIndex(points: ChartPoint[], x: number): number {
  if (points.length === 0) return 0

  let nearestIndex = 0
  let nearestDistance = Math.abs(points[0]!.x - x)

  for (let index = 1; index < points.length; index += 1) {
    const distance = Math.abs(points[index]!.x - x)
    if (distance < nearestDistance) {
      nearestIndex = index
      nearestDistance = distance
    }
  }

  return nearestIndex
}

export function getGridLineYs(geometry: ChartGeometry, lines = 3): number[] {
  const chartHeight = geometry.height - geometry.padding.top - geometry.padding.bottom
  return Array.from({ length: lines }, (_, index) => {
    const ratio = (index + 1) / (lines + 1)
    return geometry.padding.top + chartHeight * ratio
  })
}
