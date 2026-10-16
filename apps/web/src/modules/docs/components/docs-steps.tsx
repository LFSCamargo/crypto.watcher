import type { ReactNode } from 'react'
import { Card } from '../../../components/ui'

export function DocsSteps({
  steps,
}: {
  steps: { title: string; description: ReactNode }[]
}) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={index}>
          <Card className="flex gap-4 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary-strong">
              {index + 1}
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{step.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </Card>
        </li>
      ))}
    </ol>
  )
}
