import type { ReactNode } from 'react'
import type { Icon } from '@phosphor-icons/react'
import { sectionId } from '../lib/section-id'

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
  const anchor = id ?? sectionId(title)

  return (
    <section aria-labelledby={anchor} className="mb-12">
      <div className="group mb-5 flex items-center gap-3">
        {SectionIcon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-strong">
            <SectionIcon size={20} weight="duotone" aria-hidden />
          </span>
        )}
        <h2
          id={anchor}
          data-label={title}
          className="scroll-mt-28 text-2xl font-bold tracking-tight"
        >
          {title}
        </h2>
        <a
          href={`#${anchor}`}
          aria-label={`Link to ${title}`}
          className="text-xl font-bold text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
        >
          <span aria-hidden>#</span>
        </a>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
