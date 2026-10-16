import type { CSSProperties } from 'react'

const SWEEP_SECONDS = 6
const SWEEP_LEAD_DEG = 60

/** Angle is clockwise from the top; radius is a percentage of the radar size. */
const assets = [
  { slug: 'bitcoin', angle: 22, radius: 46 },
  { slug: 'solana', angle: 152, radius: 45 },
  { slug: 'uniswap', angle: 206, radius: 47 },
  { slug: 'chainlink', angle: 252, radius: 46 },
  { slug: 'aave', angle: 298, radius: 45 },
  { slug: 'ethereum', angle: 338, radius: 47 },
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
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[38rem] -translate-x-1/2 -translate-y-1/2 sm:w-[44rem]"
    >
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
      {assets.map((asset) => (
        <span
          key={asset.slug}
          data-orbit-asset
          className="absolute hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 animate-radar-ping items-center justify-center rounded-full border border-foreground/10 bg-background shadow-sm motion-reduce:animate-none md:flex"
          style={assetStyle(asset.angle, asset.radius)}
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
      ))}
    </div>
  )
}
