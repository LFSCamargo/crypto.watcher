import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getCuratedProject } from '../../projects/lib/curated-projects'
import { AssetPreviewHover } from './asset-preview-hover'

const SWEEP_SECONDS = 6
const SWEEP_LEAD_DEG = 16
const RADAR_FRAME = 'pointer-events-none absolute inset-0 h-full w-full'

const RINGS = [100, 84, 68, 52, 36, 22]

/**
 * Angle is clockwise from the top. Lower-rated assets sit closer to the
 * scope; the highest grades stay on the outer rings.
 */
const assets = [
  { slug: 'bitcoin', angle: 42, radius: 46 },
  { slug: 'ethereum', angle: 318, radius: 44 },
  { slug: 'uniswap', angle: 198, radius: 46 },
  { slug: 'aave', angle: 258, radius: 44 },
  { slug: 'chainlink', angle: 148, radius: 42 },
  { slug: 'solana', angle: 98, radius: 44 },
  { slug: 'avalanche', angle: 18, radius: 32 },
  { slug: 'stellar', angle: 168, radius: 30 },
  { slug: 'arbitrum', angle: 228, radius: 34 },
  { slug: 'cardano', angle: 78, radius: 32 },
  { slug: 'polygon-ecosystem-token', angle: 128, radius: 20 },
  { slug: 'optimism', angle: 292, radius: 18 },
  { slug: 'curve-dao-token', angle: 348, radius: 22 },
  { slug: 'lido-dao', angle: 242, radius: 20 },
]

const blips = [
  { angle: 8, radius: 46 },
  { angle: 62, radius: 34 },
  { angle: 118, radius: 22 },
  { angle: 188, radius: 42 },
  { angle: 214, radius: 30 },
  { angle: 278, radius: 46 },
  { angle: 332, radius: 34 },
]

function polarStyle(angle: number, radius: number): CSSProperties {
  const radians = (angle * Math.PI) / 180
  return {
    left: `${50 + radius * Math.sin(radians)}%`,
    top: `${50 - radius * Math.cos(radians)}%`,
  }
}

function pingStyle(angle: number): CSSProperties {
  const sweepReachesAt = (((angle - SWEEP_LEAD_DEG + 360) % 360) / 360) * SWEEP_SECONDS
  return {
    animationDelay: `${sweepReachesAt - SWEEP_SECONDS}s`,
    animationDuration: `${SWEEP_SECONDS}s`,
  }
}

function RadarAsset({
  asset,
  index,
}: {
  asset: (typeof assets)[number]
  index: number
}) {
  const [over, setOver] = useState(false)
  const [open, setOpen] = useState(false)
  const held = over || open
  const pause = held ? '[animation-play-state:paused]' : ''
  const name = getCuratedProject(asset.slug)?.name ?? asset.slug
  const driftDelay = `${index * -0.9}s`

  return (
    <li
      data-radius={asset.radius}
      data-paused={held ? 'true' : 'false'}
      className="absolute inset-0 hidden md:block"
      style={{ transform: `rotate(${asset.angle}deg)` }}
    >
      <div
        className={`animate-radar-drift absolute inset-0 motion-reduce:animate-none ${pause}`}
        style={{ animationDelay: driftDelay }}
      >
        <div
          className="absolute left-1/2"
          style={{ top: `${50 - asset.radius}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div data-keep-upright style={{ transform: `rotate(${-asset.angle}deg)` }}>
            <div
              className={`animate-radar-upright motion-reduce:animate-none ${pause}`}
              style={{ animationDelay: driftDelay }}
            >
              <AssetPreviewHover slug={asset.slug} onOpenChange={setOpen}>
                <Link
                  to={`/app/reference/${asset.slug}`}
                  onPointerEnter={() => setOver(true)}
                  onPointerLeave={() => setOver(false)}
                  className="group pointer-events-auto relative block rounded-full transition-transform duration-[240ms] ease-glass hover:scale-125 focus-visible:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <span
                    data-orbit-asset
                    aria-hidden
                    className={`flex h-10 w-10 animate-radar-ping items-center justify-center rounded-full border border-tone-amber-strong/40 bg-background shadow-sm transition-shadow group-hover:shadow-[0_0_0_6px_hsl(var(--primary)/0.35)] motion-reduce:animate-none dark:border-primary/50 ${pause}`}
                    style={pingStyle(asset.angle)}
                  >
                    <img
                      src={`/icons/${asset.slug}.png`}
                      alt=""
                      width={26}
                      height={26}
                      decoding="async"
                      className="h-6 w-6 rounded-full"
                    />
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {name}
                    <span className="sr-only"> reference assessment</span>
                  </span>
                </Link>
              </AssetPreviewHover>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export function HeroRadar() {
  return (
    <>
      <div aria-hidden className={RADAR_FRAME}>
        <div className="radar-glow absolute inset-0 rounded-full" />
        {RINGS.map((size) => (
          <div
            key={size}
            data-radar-ring
            className="radar-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              opacity: 0.18 + ((100 - size) / 100) * 0.82,
            }}
          />
        ))}
        <div className="radar-hair-y absolute left-1/2 top-0 h-full -translate-x-1/2" />
        <div className="radar-hair-x absolute left-0 top-1/2 w-full -translate-y-1/2" />
        {blips.map((blip) => (
          <span
            key={`${blip.angle}-${blip.radius}`}
            className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tone-amber-strong shadow-[0_0_8px_2px_hsl(var(--tone-amber-strong)/0.45)] dark:bg-primary dark:shadow-[0_0_8px_2px_hsl(var(--primary)/0.65)]"
            style={polarStyle(blip.angle, blip.radius)}
          />
        ))}
        <div
          className="radar-beam absolute inset-0 animate-radar-sweep rounded-full motion-reduce:animate-none"
          style={{ animationDuration: `${SWEEP_SECONDS}s` }}
        />
        <div
          data-radar-core
          className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="radar-ring absolute inset-0 animate-sonar-bloom rounded-full motion-reduce:animate-none" />
          <span className="radar-ring absolute inset-0 animate-sonar-bloom rounded-full [animation-delay:-3s] motion-reduce:animate-none" />
          <span className="absolute inset-3 animate-reticle motion-reduce:animate-none">
            <span className="radar-ring absolute inset-0 rounded-full" />
          </span>
          <img
            src="/logo.png"
            alt=""
            width={120}
            height={120}
            draggable={false}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_0_12px_hsl(var(--primary)/0.65)]"
          />
        </div>
      </div>
      <ul aria-label="Featured reference assessments" className={`${RADAR_FRAME} z-20`}>
        {assets.map((asset, index) => (
          <RadarAsset key={asset.slug} asset={asset} index={index} />
        ))}
      </ul>
    </>
  )
}
