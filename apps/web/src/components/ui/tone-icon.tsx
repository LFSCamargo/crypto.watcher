import type { ComponentPropsWithoutRef, ComponentType } from 'react'
import { cn } from '../../lib/utils'

export type Tone = 'amber' | 'coral' | 'violet' | 'sky' | 'teal' | 'pink'

const toneClasses: Record<Tone, string> = {
  amber: 'from-tone-amber/25 to-tone-amber/5 ring-tone-amber/30 text-tone-amber-strong',
  coral: 'from-tone-coral/25 to-tone-coral/5 ring-tone-coral/30 text-tone-coral-strong',
  violet:
    'from-tone-violet/25 to-tone-violet/5 ring-tone-violet/30 text-tone-violet-strong',
  sky: 'from-tone-sky/25 to-tone-sky/5 ring-tone-sky/30 text-tone-sky-strong',
  teal: 'from-tone-teal/25 to-tone-teal/5 ring-tone-teal/30 text-tone-teal-strong',
  pink: 'from-tone-pink/25 to-tone-pink/5 ring-tone-pink/30 text-tone-pink-strong',
}

const sizeClasses = {
  md: 'h-9 w-9 rounded-xl [&>svg]:h-5 [&>svg]:w-5',
  lg: 'h-12 w-12 rounded-2xl [&>svg]:h-6 [&>svg]:w-6',
}

interface ToneIconProps extends ComponentPropsWithoutRef<'span'> {
  icon: ComponentType<{ className?: string }>
  tone: Tone
  size?: keyof typeof sizeClasses
}

export function ToneIcon({
  icon: Icon,
  tone,
  size = 'md',
  className,
  ...props
}: ToneIconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br ring-1 ring-inset',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <Icon />
    </span>
  )
}
