import type { ReactNode } from 'react'

export function DocsSubheading({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-lg font-semibold text-foreground">{children}</h3>
}
