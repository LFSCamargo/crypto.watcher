import type { ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'
import { Card } from '../../../components/ui'

export function DocsFeatureCard({
  icon: CardIcon,
  title,
  children,
}: {
  icon: Icon
  title: string
  children: ReactNode
}) {
  return (
    <Card className="card-hover h-full p-5">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary-strong">
        <CardIcon size={22} weight="duotone" />
      </span>
      <h3 className="mb-1.5 font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </Card>
  )
}
