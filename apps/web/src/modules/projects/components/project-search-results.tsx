import { RiArrowRightUpLine, RiShieldCheckLine } from '@remixicon/react'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { cn } from '../../../lib/utils'
import type { ProjectSearchResult } from '../lib/search-projects'

interface ProjectSearchResultsProps {
  results: ProjectSearchResult[]
  query: string
  activeIndex: number
  onSelect: (to: string) => void
  onHover: (index: number) => void
  className?: string
  emptyQueryMessage?: string
}

export function ProjectSearchResults({
  results,
  query,
  activeIndex,
  onSelect,
  onHover,
  className,
  emptyQueryMessage = 'Search council-reviewed projects and reference assessments',
}: ProjectSearchResultsProps) {
  const trimmedQuery = query.trim()

  return (
    <ul className={cn('max-h-80 overflow-auto p-2', className)}>
      {results.length === 0 && trimmedQuery && (
        <li className="px-3 py-8 text-center text-sm text-muted-foreground">
          No projects found for &ldquo;{trimmedQuery}&rdquo;
        </li>
      )}
      {results.map((result, index) => (
        <li key={result.key}>
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
              index === activeIndex ? 'bg-secondary' : 'hover:bg-secondary/60',
            )}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(result.to)}
          >
            {result.symbol ? (
              <ProjectIcon
                symbol={result.symbol}
                name={result.title}
                slug={result.slug}
                className="h-9 w-9 shrink-0"
                textClassName="text-[9px]"
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <RiShieldCheckLine className="h-4 w-4" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{result.title}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {result.subtitle}
              </span>
            </span>
            <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {result.kind === 'project' ? 'Council' : 'Reference'}
            </span>
            <RiArrowRightUpLine
              aria-hidden
              className="h-4 w-4 shrink-0 text-muted-foreground"
            />
          </button>
        </li>
      ))}
      {!trimmedQuery && (
        <li className="px-3 py-8 text-center text-sm text-muted-foreground">
          {emptyQueryMessage}
        </li>
      )}
    </ul>
  )
}
