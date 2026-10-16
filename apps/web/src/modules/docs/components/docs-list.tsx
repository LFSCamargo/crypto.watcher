import type { ReactNode } from 'react'
import { CheckCircle } from '@phosphor-icons/react'

export function DocsList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-muted-foreground">
          <CheckCircle
            size={18}
            weight="fill"
            className="mt-0.5 shrink-0 text-primary-strong"
          />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}
