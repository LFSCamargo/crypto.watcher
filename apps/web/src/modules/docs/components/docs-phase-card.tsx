import { CheckCircle } from '@phosphor-icons/react'
import { Card } from '../../../components/ui'
import { cn } from '../../../lib/utils'

export function DocsPhaseCard({
  phase,
  title,
  items,
  active = false,
}: {
  phase: string
  title: string
  items: string[]
  active?: boolean
}) {
  return (
    <Card className={cn('h-full p-5', active && 'border-primary/40 bg-primary/5')}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground',
          )}
        >
          {phase}
        </span>
        {active && <span className="text-xs font-medium text-primary">Current</span>}
      </div>
      <h3 className="mb-3 font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}
