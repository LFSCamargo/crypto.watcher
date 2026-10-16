import type { ReactNode } from 'react'
import type { Tone } from '../../../components/ui'
import { cn } from '../../../lib/utils'

interface SectionHeadingProps {
  id: string
  eyebrow?: string
  title: string
  description?: ReactNode
  align?: 'center' | 'start'
  tone?: Tone
}

const eyebrowTone: Record<Tone, string> = {
  amber: 'border-tone-amber/30 bg-tone-amber/10 text-tone-amber-strong',
  coral: 'border-tone-coral/30 bg-tone-coral/10 text-tone-coral-strong',
  violet: 'border-tone-violet/30 bg-tone-violet/10 text-tone-violet-strong',
  sky: 'border-tone-sky/30 bg-tone-sky/10 text-tone-sky-strong',
  teal: 'border-tone-teal/30 bg-tone-teal/10 text-tone-teal-strong',
  pink: 'border-tone-pink/30 bg-tone-pink/10 text-tone-pink-strong',
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'amber',
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-10 max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && (
        <p
          className={cn(
            'mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[3px]',
            eyebrowTone[tone],
          )}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="heading-2 mb-3 text-balance">
        {title}
      </h2>
      {description && <p className="body-large text-balance">{description}</p>}
    </div>
  )
}
