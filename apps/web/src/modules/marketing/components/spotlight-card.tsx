import type { ComponentPropsWithoutRef, PointerEvent } from 'react'
import type { Tone } from '../../../components/ui'
import { cn } from '../../../lib/utils'

interface SpotlightCardProps extends ComponentPropsWithoutRef<'article'> {
  tone?: Tone
}

function trackPointer(event: PointerEvent<HTMLElement>) {
  if (
    event.pointerType === 'touch' ||
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
    return
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
}

/** Card with a soft toned glow that follows the pointer. */
export function SpotlightCard({
  tone = 'amber',
  className,
  children,
  style,
  ...props
}: SpotlightCardProps) {
  return (
    <article
      onPointerMove={trackPointer}
      style={{ ...style, ['--spot-tone' as string]: `var(--tone-${tone})` }}
      className={cn(
        'group/spot relative isolate overflow-hidden rounded-3xl border border-border bg-card p-6 transition-[transform,border-color,box-shadow] duration-[240ms] ease-glass ease-glass hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-[240ms] ease-glass group-hover/spot:opacity-100 motion-reduce:hidden"
        style={{
          backgroundImage:
            'radial-gradient(22rem circle at var(--spot-x, 50%) var(--spot-y, 0%), hsl(var(--spot-tone) / 0.16), transparent 65%)',
        }}
      />
      {children}
    </article>
  )
}
