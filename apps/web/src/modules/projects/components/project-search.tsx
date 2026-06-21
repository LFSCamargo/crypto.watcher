import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RiSearchLine } from '@remixicon/react'
import { Input } from '../../../components/ui'
import { cn, useDebouncedValue } from '../../../lib/utils'
import { useProjects } from '../hooks/use-projects'
import { buildProjectSearchResults } from '../lib/search-projects'
import { ProjectSearchResults } from './project-search-results'

interface ProjectSearchProps {
  className?: string
  inputClassName?: string
  placeholder?: string
  size?: 'default' | 'compact'
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function ProjectSearch({
  className,
  inputClassName,
  placeholder = 'Search BTC, Ethereum, Solana…',
  size = 'default',
  inputRef: externalRef,
}: ProjectSearchProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: liveProjects } = useProjects()
  const internalRef = useRef<HTMLInputElement>(null)
  const inputRef = externalRef ?? internalRef
  const [query, setQuery] = useState(searchParams.get('search') ?? '')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)
  const [resolvedQuery, setResolvedQuery] = useState(debouncedQuery)

  useEffect(() => {
    setQuery(searchParams.get('search') ?? '')
  }, [searchParams])

  useEffect(() => {
    const currentRequest = ++requestIdRef.current
    const trimmed = debouncedQuery.trim()

    if (!trimmed) {
      setResolvedQuery('')
      return
    }

    const timer = window.setTimeout(() => {
      if (currentRequest === requestIdRef.current) {
        setResolvedQuery(trimmed)
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [debouncedQuery])

  const results = useMemo(
    () => buildProjectSearchResults(resolvedQuery, liveProjects),
    [resolvedQuery, liveProjects],
  )

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
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} role="search">
      <div className="relative">
        <RiSearchLine
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          aria-label="Search crypto projects"
          autoComplete="off"
          className={cn('pl-11 pr-16', size === 'compact' && 'h-10', inputClassName)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={query}
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <span>⌘</span>
          <span className="text-muted-foreground/70">+</span>
          <span>K</span>
        </kbd>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          <ProjectSearchResults
            results={results}
            query={resolvedQuery}
            activeIndex={activeIndex}
            onSelect={goTo}
            onHover={setActiveIndex}
          />
        </div>
      )}
    </div>
  )
}
