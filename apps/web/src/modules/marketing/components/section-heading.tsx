import type { ReactNode } from 'react'
import { cn } from '../../../lib/utils'

interface SectionHeadingProps {
  id: string
  eyebrow?: string
  title: string
  description?: ReactNode
  align?: 'center' | 'start'
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-10 max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-[3px] text-muted-foreground">
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
