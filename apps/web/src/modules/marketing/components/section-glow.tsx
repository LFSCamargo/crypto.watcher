import type { Tone } from '../../../components/ui'
import { cn } from '../../../lib/utils'

interface GlowSpot {
  tone: Tone
  /** CSS position for the radial gradient centre, e.g. `15% 20%`. */
  at: string
  size?: string
  strength?: number
}

interface SectionGlowProps {
  spots: GlowSpot[]
  className?: string
}

export function SectionGlow({ spots, className }: SectionGlowProps) {
  const backgroundImage = spots
    .map(
      ({ tone, at, size = '34rem 24rem', strength = 0.22 }) =>
        `radial-gradient(${size} at ${at}, hsl(var(--tone-${tone}) / ${strength}), transparent 70%)`,
    )
    .join(', ')

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{ backgroundImage }}
    />
  )
}
