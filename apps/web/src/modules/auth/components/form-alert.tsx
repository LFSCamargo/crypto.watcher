import type { ReactNode } from 'react'
import { RiCheckboxCircleLine, RiErrorWarningLine } from '@remixicon/react'
import { cn } from '../../../lib/utils'

interface FormAlertProps {
  tone?: 'error' | 'success'
  children: ReactNode
  className?: string
}

export function FormAlert({ tone = 'error', children, className }: FormAlertProps) {
  const Icon = tone === 'error' ? RiErrorWarningLine : RiCheckboxCircleLine
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-2.5 rounded-2xl border p-3.5 text-sm',
        tone === 'error'
          ? 'border-destructive/30 bg-destructive/10 text-destructive-strong'
          : 'border-success/30 bg-success/10 text-success-strong',
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="space-y-1">{children}</div>
    </div>
  )
}
