const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 173 58% 45%))',
  'hsl(38 92% 50%)',
  'hsl(280 65% 60%)',
  'hsl(199 89% 48%)',
  'hsl(142 71% 45%)',
  'hsl(0 72% 51%)',
  'hsl(215 16% 47%)',
]

export interface DistributionSlice {
  label: string
  value: number
  share: number
}

interface DistributionDonutProps {
  title: string
  slices: DistributionSlice[]
  formatValue: (value: number) => string
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  }
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export function DistributionDonut({ title, slices, formatValue }: DistributionDonutProps) {
  if (slices.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="mb-2 text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">No breakdown data available.</p>
      </div>
    )
  }

  const size = 120
  const cx = size / 2
  const cy = size / 2
  const radius = 46
  let cursor = 0

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <p className="mb-3 text-sm font-medium">{title}</p>
      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          {slices.map((slice, index) => {
            const angle = (slice.share / 100) * 360
            const startAngle = cursor
            const endAngle = cursor + angle
            cursor = endAngle

            if (slice.share >= 99.9) {
              return (
                <circle
                  key={slice.label}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={14}
                />
              )
            }

            return (
              <path
                key={slice.label}
                d={describeArc(cx, cy, radius, startAngle, endAngle)}
                fill="none"
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={14}
                strokeLinecap="butt"
              />
            )
          })}
          <circle cx={cx} cy={cy} r={28} className="fill-background" />
        </svg>

        <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
          {slices.map((slice, index) => (
            <li key={slice.label} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="truncate text-muted-foreground">{slice.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {slice.share.toFixed(1)}% · {formatValue(slice.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
