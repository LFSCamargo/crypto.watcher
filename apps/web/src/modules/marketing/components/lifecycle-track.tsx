import { useReducedMotion } from 'framer-motion'
import { lifecycleSteps, lifecycleToneColor } from '../lib/lifecycle-steps'

type Point = { x: number; y: number }

type Cubic = { p0: Point; p1: Point; p2: Point; p3: Point }

/** Stations sit on a shallow wave and leave the lower band for the step titles. */
const STATIONS: Point[] = [
  { x: 100, y: 78 },
  { x: 300, y: 42 },
  { x: 500, y: 78 },
  { x: 700, y: 42 },
  { x: 900, y: 78 },
]

function route(stations: Point[]): Cubic[] {
  const cubics: Cubic[] = []
  for (let index = 0; index < stations.length - 1; index += 1) {
    const from = stations[index]!
    const to = stations[index + 1]!
    const mid = (from.x + to.x) / 2
    cubics.push({
      p0: from,
      p1: { x: mid, y: from.y },
      p2: { x: mid, y: to.y },
      p3: to,
    })
  }
  return cubics
}

function cubicPoint(cubic: Cubic, t: number): Point {
  const rest = 1 - t
  return {
    x:
      rest ** 3 * cubic.p0.x +
      3 * rest ** 2 * t * cubic.p1.x +
      3 * rest * t ** 2 * cubic.p2.x +
      t ** 3 * cubic.p3.x,
    y:
      rest ** 3 * cubic.p0.y +
      3 * rest ** 2 * t * cubic.p1.y +
      3 * rest * t ** 2 * cubic.p2.y +
      t ** 3 * cubic.p3.y,
  }
}

function cubicTangent(cubic: Cubic, t: number): Point {
  const rest = 1 - t
  return {
    x:
      3 * rest ** 2 * (cubic.p1.x - cubic.p0.x) +
      6 * rest * t * (cubic.p2.x - cubic.p1.x) +
      3 * t ** 2 * (cubic.p3.x - cubic.p2.x),
    y:
      3 * rest ** 2 * (cubic.p1.y - cubic.p0.y) +
      6 * rest * t * (cubic.p2.y - cubic.p1.y) +
      3 * t ** 2 * (cubic.p3.y - cubic.p2.y),
  }
}

function cubicLength(cubic: Cubic): number {
  const samples = 24
  let length = 0
  let previous = cubic.p0
  for (let step = 1; step <= samples; step += 1) {
    const point = cubicPoint(cubic, step / samples)
    length += Math.hypot(point.x - previous.x, point.y - previous.y)
    previous = point
  }
  return length
}

function pathData(cubics: Cubic[]): string {
  return cubics
    .map((cubic, index) => {
      const curve = `C ${cubic.p1.x} ${cubic.p1.y}, ${cubic.p2.x} ${cubic.p2.y}, ${cubic.p3.x} ${cubic.p3.y}`
      return index === 0 ? `M ${cubic.p0.x} ${cubic.p0.y} ${curve}` : curve
    })
    .join(' ')
}

const cubics = route(STATIONS)
const routeLength = Number(
  cubics.reduce((sum, cubic) => sum + cubicLength(cubic), 0).toFixed(2),
)
const routePath = pathData(cubics)

export function LifecycleTrack({ active }: { active: number }) {
  const reducedMotion = useReducedMotion()
  const last = STATIONS.length - 1
  const fraction = active / last
  const offset = Number((routeLength * (1 - fraction)).toFixed(2))
  const ease = reducedMotion
    ? undefined
    : 'stroke-dashoffset 700ms cubic-bezier(0.2, 0.8, 0.2, 1)'

  return (
    <svg
      data-lifecycle-track="horizontal"
      viewBox="0 0 1000 150"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 hidden aspect-[20/3] w-full md:block"
    >
      <defs>
        <linearGradient
          id="lifecycle-route"
          x1="0"
          y1="0"
          x2="1000"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="hsl(var(--tone-amber))" />
          <stop offset="28%" stopColor="hsl(var(--tone-coral))" />
          <stop offset="52%" stopColor="hsl(var(--tone-violet))" />
          <stop offset="76%" stopColor="hsl(var(--tone-sky))" />
          <stop offset="100%" stopColor="hsl(var(--tone-teal))" />
        </linearGradient>
      </defs>
      <path
        d={routePath}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1.5 9"
      />
      <path
        data-track-progress
        d={routePath}
        fill="none"
        stroke="url(#lifecycle-route)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={routeLength}
        strokeDashoffset={offset}
        style={{ transition: ease }}
      />
      {cubics.map((cubic, index) => {
        const point = cubicPoint(cubic, 0.55)
        const tangent = cubicTangent(cubic, 0.55)
        const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI
        const reached = index < active
        return (
          <path
            key={lifecycleSteps[index]?.title ?? index}
            d="M-7 -5 L2 0 L-7 5"
            transform={`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`}
            fill="none"
            stroke={reached ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={reached ? 0.85 : 0.4}
          />
        )
      })}
      {STATIONS.map((station, index) => {
        const reached = index <= active
        const current = index === active
        const tone = lifecycleSteps[index]?.tone ?? 'amber'
        const fill = lifecycleToneColor(tone)
        return (
          <g
            key={lifecycleSteps[index]?.title ?? index}
            data-station={index}
            data-reached={reached ? 'true' : 'false'}
          >
            {current ? (
              <circle
                data-track-marker
                data-x={station.x}
                data-y={station.y}
                cx={station.x}
                cy={station.y}
                r="26"
                fill={fill}
                opacity="0.22"
              />
            ) : null}
            <circle
              cx={station.x}
              cy={station.y}
              r={current ? 18 : 15}
              fill={reached ? fill : 'hsl(var(--background))'}
              stroke={reached ? fill : 'hsl(var(--border))'}
              strokeWidth="3"
            />
            <text
              x={station.x}
              y={station.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={
                !reached
                  ? 'hsl(var(--muted-foreground))'
                  : tone === 'amber'
                    ? 'hsl(var(--primary-foreground))'
                    : 'white'
              }
              fontSize="14"
              fontWeight="700"
            >
              {index + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
