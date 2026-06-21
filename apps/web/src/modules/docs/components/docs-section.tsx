import type { ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'

export function DocsSection({
  id,
  icon: SectionIcon,
  title,
  children,
}: {
  id?: string
  icon?: Icon
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <div className="mb-5 flex items-center gap-3">
        {SectionIcon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SectionIcon size={20} weight="duotone" />
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
