import type { ReactNode } from 'react'
import { Card } from '../../../components/ui'

export function DocsFaqItem({
  question,
  children,
}: {
  question: string
  children: ReactNode
}) {
  return (
    <Card className="p-5">
      <h3 className="mb-2 font-semibold text-foreground">{question}</h3>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </Card>
  )
}
