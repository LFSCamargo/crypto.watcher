import type { ChartGeometry, ChartPoint } from '../lib/chart-geometry'
import { pointsToPath } from '../lib/chart-geometry'
import { formatChartAxisDate } from '../lib/format-price'
import type { ChartRange } from '../lib/chart-range'
import { ChartGridLines } from './chart-grid-lines'

interface ChartPriceSvgProps {
  geometry: ChartGeometry
  height: number
  range: ChartRange
  stroke: string
  gradientId: string
  activePoint: ChartPoint | null
  variant: 'full' | 'compact'
  isPanelLayout: boolean
  onHover: (clientX: number) => void
  onHoverEnd: () => void
}

export function ChartPriceSvg({
  geometry,
  height,
  range,
  stroke,
  gradientId,
  activePoint,
  variant,
  isPanelLayout,
  onHover,
  onHoverEnd,
}: ChartPriceSvgProps) {
  const showGrid = variant === 'full' || isPanelLayout
  const strokeWidth = isPanelLayout ? 2.5 : variant === 'compact' ? 2 : 2.5
  const markerRadius = variant === 'compact' && !isPanelLayout ? 4 : 5
  const fillOpacity = isPanelLayout ? 0.22 : variant === 'compact' ? 0.18 : 0.28

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className="absolute inset-0 block h-full w-full"
      role="img"
      aria-label={`Price chart for ${range}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>

      {showGrid ? <ChartGridLines geometry={geometry} /> : null}

      <path
        d={`${pointsToPath(geometry.points)} L ${geometry.width - geometry.padding.right} ${geometry.height - geometry.padding.bottom} L ${geometry.padding.left} ${geometry.height - geometry.padding.bottom} Z`}
        fill={`url(#${gradientId})`}
      />

      {activePoint ? (
        <line
          x1={activePoint.x}
          x2={activePoint.x}
          y1={geometry.padding.top}
          y2={geometry.height - geometry.padding.bottom}
          stroke={stroke}
          strokeOpacity={0.35}
          strokeDasharray="3 4"
        />
      ) : null}

      <path
        d={pointsToPath(geometry.points)}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {activePoint ? (
        <>
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r={markerRadius}
            fill="hsl(var(--background))"
            stroke={stroke}
            strokeWidth={2}
          />
          <circle cx={activePoint.x} cy={activePoint.y} r={2} fill={stroke} />
        </>
      ) : null}

      {showGrid ? (
        <>
          <text
            x={geometry.padding.left}
            y={geometry.height - 8}
            fill="hsl(var(--muted-foreground))"
            fontSize="10"
          >
            {formatChartAxisDate(geometry.points[0]!.timestamp)}
          </text>
          <text
            x={geometry.width - geometry.padding.right}
            y={geometry.height - 8}
            fill="hsl(var(--muted-foreground))"
            fontSize="10"
            textAnchor="end"
          >
            {formatChartAxisDate(geometry.points.at(-1)!.timestamp)}
          </text>
        </>
      ) : null}

      <rect
        x={geometry.padding.left}
        y={geometry.padding.top}
        width={geometry.width - geometry.padding.left - geometry.padding.right}
        height={geometry.height - geometry.padding.top - geometry.padding.bottom}
        fill="transparent"
        className="cursor-crosshair"
        onMouseMove={(event) => onHover(event.clientX)}
        onTouchMove={(event) => {
          const touch = event.touches[0]
          if (touch) onHover(touch.clientX)
        }}
        onTouchEnd={onHoverEnd}
      />
    </svg>
  )
}
