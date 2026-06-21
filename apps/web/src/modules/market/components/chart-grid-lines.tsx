import type { ChartGeometry } from '../lib/chart-geometry'
import { getGridLineYs } from '../lib/chart-geometry'

export function ChartGridLines({ geometry }: { geometry: ChartGeometry }) {
  return getGridLineYs(geometry).map((y) => (
    <line
      key={y}
      x1={geometry.padding.left}
      x2={geometry.width - geometry.padding.right}
      y1={y}
      y2={y}
      stroke="hsl(var(--border))"
      strokeOpacity={0.55}
      strokeDasharray="4 6"
    />
  ))
}
