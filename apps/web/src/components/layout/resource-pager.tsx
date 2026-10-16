import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import type { ResourceLink } from './resource-nav-links'

interface ResourcePagerProps {
  label: string
  links: ResourceLink[]
  activeIndex: number
}

export function ResourcePager({ label, links, activeIndex }: ResourcePagerProps) {
  if (activeIndex < 0) return null
  const previous = links[activeIndex - 1]
  const next = links[activeIndex + 1]
  if (!previous && !next) return null

  return (
    <nav
      aria-label={`${label} pages`}
      className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
    >
      {previous && (
        <Link
          to={previous.href}
          className="glass-card-flat flex min-h-11 flex-col rounded-2xl p-4 transition-colors hover:border-foreground/30"
        >
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft size={14} aria-hidden />
            Previous
          </span>
          <span className="mt-1 font-semibold">{previous.label}</span>
        </Link>
      )}
      {next && (
        <Link
          to={next.href}
          className="glass-card-flat flex min-h-11 flex-col rounded-2xl p-4 text-right transition-colors hover:border-foreground/30 sm:col-start-2"
        >
          <span className="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground">
            Next
            <ArrowRight size={14} aria-hidden />
          </span>
          <span className="mt-1 font-semibold">{next.label}</span>
        </Link>
      )}
    </nav>
  )
}
