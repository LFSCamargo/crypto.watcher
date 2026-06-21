import { useMemo } from 'react'
import type { PricePoint } from '../lib/market.types'

interface MiniSparklineProps {
  history: PricePoint[]
  className?: string
  height?: number
  /** Max number of points to render (downsample for perf) */
  maxPoints?: number
}

function downsample(points: PricePoint[], maxPoints: number): PricePoint[] {
  if (points.length <= maxPoints) return points
  const result: PricePoint[] = []
  const step = (points.length - 1) / (maxPoints - 1)
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.min(Math.round(i * step), points.length - 1)
    result.push(points[idx]!)
  }
  return result
}

export function MiniSparkline({
  history,
  className,
  height = 40,
  maxPoints = 48,
}: MiniSparklineProps) {
  const points = useMemo(() => {
    if (!history || history.length === 0) return []
    // Use recent points for a nicer "recent trend" look on cards
    const recent = history.slice(-Math.max(60, maxPoints * 2))
    return downsample(recent, maxPoints)
  }, [history, maxPoints])

  if (points.length < 2) {
    return (
      <div className={className} style={{ height }}>
        <div className="h-full w-full rounded bg-muted/40" />
      </div>
    )
  }

  const prices = points.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = Math.max(max - min, 0.0001)

  const w = 100
  const h = height
  const padding = 2

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w
    const y = padding + (h - padding * 2) * (1 - (p.price - min) / range)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const path = `M ${coords[0]} L ${coords.slice(1).join(' L ')}`

  const first = points[0]!.price
  const last = points.at(-1)!.price
  const up = last >= first
  const color = up ? 'hsl(var(--success))' : 'hsl(var(--destructive))'

  return (
    <div className={className} style={{ height }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
