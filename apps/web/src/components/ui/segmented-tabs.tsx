import { useRef, type ComponentType, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface SegmentedTabItem<T extends string> {
  value: T
  label: string
  icon?: ComponentType<{ className?: string }>
  count?: number
}

interface SegmentedTabsProps<T extends string> {
  label: string
  idPrefix: string
  items: readonly SegmentedTabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
}

export function tabIds(idPrefix: string, value: string) {
  const tabId = `${idPrefix}-tab-${value}`
  const panelId = `${idPrefix}-panel-${value}`
  return {
    tab: { id: tabId, 'aria-controls': panelId },
    panel: { id: panelId, 'aria-labelledby': tabId },
  }
}

export function SegmentedTabs<T extends string>({
  label,
  idPrefix,
  items,
  value,
  onValueChange,
  className,
}: SegmentedTabsProps<T>) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function focusTab(index: number) {
    const next = (index + items.length) % items.length
    const item = items[next]
    if (!item) return
    onValueChange(item.value)
    tabRefs.current[next]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: items.length - 1,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    focusTab(target)
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'glass-card-flat inline-flex max-w-full gap-1 rounded-full p-1',
        className,
      )}
    >
      {items.map((item, index) => {
        const selected = item.value === value
        const Icon = item.icon
        return (
          <button
            key={item.value}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            type="button"
            role="tab"
            {...tabIds(idPrefix, item.value).tab}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'relative flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {selected && (
              <motion.span
                layoutId={`${idPrefix}-indicator`}
                aria-hidden
                className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            {Icon && <Icon className="relative h-4 w-4" />}
            <span className="relative">{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'relative min-w-6 rounded-full px-1.5 text-center text-xs tabular-nums',
                  selected
                    ? 'bg-primary/15 text-primary-strong'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
