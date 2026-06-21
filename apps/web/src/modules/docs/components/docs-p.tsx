import type { ReactNode } from 'react'

export function DocsP({ children }: { children: ReactNode }) {
  return <p className="leading-relaxed text-muted-foreground">{children}</p>
}
