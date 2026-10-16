import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../components/ui/hover-card'
import { getCuratedProject } from '../../projects/lib/curated-projects'
import { RadarAssetPreview } from './radar-asset-preview'

const SWEEP_SECONDS = 6
const SWEEP_LEAD_DEG = 60
const RADAR_FRAME =
  'pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[38rem] -translate-x-1/2 -translate-y-1/2 sm:w-[44rem]'

/** Angle is clockwise from the top; radius is a percentage of the radar size. */
const assets = [
  { slug: 'bitcoin', angle: 48, radius: 46 },
  { slug: 'solana', angle: 135, radius: 45 },
  { slug: 'uniswap', angle: 200, radius: 47 },
  { slug: 'chainlink', angle: 240, radius: 46 },
  { slug: 'aave', angle: 275, radius: 45 },
  { slug: 'ethereum', angle: 312, radius: 47 },
]

function assetStyle(angle: number, radius: number): CSSProperties {
  const radians = (angle * Math.PI) / 180
  const sweepReachesAt = (((angle - SWEEP_LEAD_DEG + 360) % 360) / 360) * SWEEP_SECONDS
  const cycleOffset = sweepReachesAt - SWEEP_SECONDS
  return {
    left: `${50 + radius * Math.sin(radians)}%`,
    top: `${50 - radius * Math.cos(radians)}%`,
    animationDelay: `${cycleOffset}s`,
    animationDuration: `${SWEEP_SECONDS}s`,
  }
}

export function HeroRadar() {
  return (
    <>
      <div aria-hidden className={RADAR_FRAME}>
        {[100, 74, 48].map((size) => (
          <div
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/10"
            style={{ width: `${size}%`, height: `${size}%` }}
          />
        ))}
        <div
          className="absolute inset-0 animate-radar-sweep rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,hsl(var(--primary)/0.38)_60deg,transparent_60.5deg)] [mask-image:radial-gradient(closest-side,black_55%,transparent)] motion-reduce:animate-none"
          style={{ animationDuration: `${SWEEP_SECONDS}s` }}
        />
      </div>
      <ul aria-label="Featured reference assessments" className={`${RADAR_FRAME} z-20`}>
        {assets.map((asset) => {
          const name = getCuratedProject(asset.slug)?.name ?? asset.slug
          const { left, top, ...ping } = assetStyle(asset.angle, asset.radius)
          return (
            <li
              key={asset.slug}
              className="absolute hidden -translate-x-1/2 -translate-y-1/2 md:block"
              style={{ left, top }}
            >
              <HoverCard openDelay={120} closeDelay={120}>
                <HoverCardTrigger asChild>
                  <Link
                    to={`/app/reference/${asset.slug}`}
                    className="group pointer-events-auto relative block rounded-full transition-transform duration-300 ease-glass hover:scale-125 focus-visible:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    <span
                      data-orbit-asset
                      className="flex h-11 w-11 animate-radar-ping items-center justify-center rounded-full border border-foreground/10 bg-background shadow-sm transition-shadow group-hover:shadow-[0_0_0_6px_hsl(var(--primary)/0.3)] motion-reduce:animate-none"
                      style={ping}
                    >
                      <img
                        src={`/icons/${asset.slug}.png`}
                        alt=""
                        width={28}
                        height={28}
                        decoding="async"
                        className="h-7 w-7 rounded-full"
                      />
                    </span>
                    <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      {name}
                      <span className="sr-only"> reference assessment</span>
                    </span>
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent side="bottom" className="w-[22rem]">
                  <RadarAssetPreview slug={asset.slug} />
                </HoverCardContent>
              </HoverCard>
            </li>
          )
        })}
      </ul>
    </>
  )
}
