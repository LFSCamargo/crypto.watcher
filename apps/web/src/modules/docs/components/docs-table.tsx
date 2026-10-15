import type { ReactNode } from 'react'
import { Card } from '../../../components/ui'
import { cn } from '../../../lib/utils'

export function DocsTable({
  label,
  headers,
  rows,
}: {
  label: string
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <Card className="overflow-hidden">
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left">
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold text-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border/50 last:border-0 hover:bg-secondary/20"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      'px-4 py-3',
                      cellIndex === 0
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
