import type { ReactNode } from 'react'
import { Disclosure } from '../../../components/ui'

export function DocsFaqItem({
  question,
  children,
}: {
  question: string
  children: ReactNode
}) {
  return (
    <Disclosure
      title={question}
      headingLevel={3}
      className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary/30"
      contentClassName="space-y-3 text-sm leading-relaxed text-muted-foreground"
    >
      {children}
    </Disclosure>
  )
}
