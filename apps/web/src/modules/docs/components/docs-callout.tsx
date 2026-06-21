import type { ReactNode } from 'react'
import { Info, Warning } from '@phosphor-icons/react'
import { cn } from '../../../lib/utils'

export function DocsCallout({
  variant = 'info',
  title,
  children,
}: {
  variant?: 'info' | 'warning'
  title?: string
  children: ReactNode
}) {
  const CalloutIcon = variant === 'warning' ? Warning : Info
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4',
        variant === 'warning'
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-primary/30 bg-primary/5',
      )}
    >
      <CalloutIcon
        size={20}
        weight="fill"
        className={cn(
          'mt-0.5 shrink-0',
          variant === 'warning' ? 'text-destructive' : 'text-primary',
        )}
      />
      <div className="space-y-1 text-sm leading-relaxed text-muted-foreground">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        {children}
      </div>
    </div>
  )
}
