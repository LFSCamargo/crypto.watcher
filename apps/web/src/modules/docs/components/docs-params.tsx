import type { ReactNode } from 'react'
import { Card } from '../../../components/ui'

export function DocsParams({
  params,
}: {
  params: { label: string; value: ReactNode }[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {params.map((param) => (
        <Card key={param.label} className="flex items-center justify-between gap-4 p-4">
          <span className="text-sm text-muted-foreground">{param.label}</span>
          <span className="text-right text-sm font-semibold text-foreground">
            {param.value}
          </span>
        </Card>
      ))}
    </div>
  )
}
