import { useId, useState, type ReactNode } from 'react'
import { RiArrowDownSLine } from '@remixicon/react'
import { cn } from '../../lib/utils'

interface DisclosureProps {
  title: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  headingLevel?: 2 | 3 | 4
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function Disclosure({
  title,
  children,
  defaultOpen = false,
  headingLevel,
  className,
  triggerClassName,
  contentClassName,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel`

  const trigger = (
    <button
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={() => setOpen((value) => !value)}
      className={cn(
        'group flex w-full items-center justify-between gap-4 rounded-2xl text-left font-semibold text-foreground transition-colors hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        triggerClassName,
      )}
    >
      <span>{title}</span>
      <span
        aria-hidden
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/70 text-muted-foreground transition-[transform,background-color,color] duration-300 ease-glass group-hover:bg-primary/15 group-hover:text-primary-strong',
          open && 'rotate-180 bg-primary/15 text-primary-strong',
        )}
      >
        <RiArrowDownSLine className="h-4 w-4" />
      </span>
    </button>
  )

  const Heading = headingLevel ? (`h${headingLevel}` as const) : null

  return (
    <div className={className}>
      {Heading ? <Heading className="text-base">{trigger}</Heading> : trigger}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        data-state={open ? 'open' : 'closed'}
        {...(open ? {} : { inert: '' })}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-glass motion-reduce:transition-none',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'pt-3 transition-transform duration-300 ease-glass motion-reduce:transition-none',
              open ? 'translate-y-0' : '-translate-y-1',
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
