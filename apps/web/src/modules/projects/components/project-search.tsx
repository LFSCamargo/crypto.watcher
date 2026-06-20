import { ArrowUpRight, MagnifyingGlass, ShieldCheck } from '@phosphor-icons/react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '../../../components/ui'
import { cn, useDebouncedValue } from '../../../lib/utils'
import { useProjects } from '../hooks/use-projects'
import { filterCuratedProjects } from '../lib/curated-projects'
import { formatProjectState } from '../lib/format'

interface ProjectSearchProps {
  className?: string
  inputClassName?: string
  placeholder?: string
  size?: 'default' | 'compact'
}

interface SearchResult {
  key: string
  title: string
  subtitle: string
  kind: 'reference' | 'project'
  to: string
}

export function ProjectSearch({
  className,
  inputClassName,
  placeholder = 'Search BTC, Ethereum, Solana...',
  size = 'default',
}: ProjectSearchProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: liveProjects } = useProjects()
  const [query, setQuery] = useState(searchParams.get('search') ?? '')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(searchParams.get('search') ?? '')
  }, [searchParams])

  const results = useMemo<SearchResult[]>(() => {
    const trimmedQuery = debouncedQuery.trim()
    if (!trimmedQuery) {
      return []
    }

    const normalizedQuery = trimmedQuery.toLowerCase()

    const referenceResults: SearchResult[] = filterCuratedProjects(trimmedQuery).map(
      (project) => ({
        key: `reference-${project.slug}`,
        title: project.name,
        subtitle: `${project.symbol} · Reference asset`,
        kind: 'reference',
        to: `/app/reference/${project.slug}`,
      }),
    )

    const projectResults: SearchResult[] = (liveProjects ?? [])
      .filter((project) =>
        [project.name, project.slug, project.description ?? ''].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ),
      )
      .map((project) => ({
        key: `project-${project.id}`,
        title: project.name,
        subtitle: formatProjectState(project.state),
        kind: 'project',
        to: `/app/projects/${project.slug}`,
      }))

    return [...referenceResults, ...projectResults].slice(0, 8)
  }, [debouncedQuery, liveProjects])

  useEffect(() => {
    setActiveIndex(-1)
  }, [results])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const goTo = (to: string) => {
    setOpen(false)
    setActiveIndex(-1)
    navigate(to)
  }

  const submitSearch = () => {
    const trimmedQuery = query.trim()
    if (activeIndex >= 0 && results[activeIndex]) {
      goTo(results[activeIndex].to)
      return
    }
    goTo(trimmedQuery ? `/app?search=${encodeURIComponent(trimmedQuery)}` : '/app')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      submitSearch()
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} role="search">
      <div className="relative">
        <MagnifyingGlass
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          aria-label="Search crypto projects"
          autoComplete="off"
          className={cn('pl-10', size === 'compact' && 'h-9', inputClassName)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={query}
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          {results.map((result, index) => (
            <li key={result.key}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                  index === activeIndex ? 'bg-secondary' : 'hover:bg-secondary/60',
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goTo(result.to)}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    result.kind === 'reference'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-muted-foreground',
                  )}
                >
                  <ShieldCheck size={16} weight="duotone" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {result.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {result.subtitle}
                  </span>
                </span>
                <ArrowUpRight size={14} className="shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
