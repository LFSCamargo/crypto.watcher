import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiSearchLine } from '@remixicon/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useProjects } from '../../modules/projects/hooks/use-projects'
import { buildProjectSearchResults } from '../../modules/projects/lib/search-projects'
import { ProjectSearchResults } from '../../modules/projects/components/project-search-results'
import { useDebouncedValue } from '../../lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { data: liveProjects } = useProjects()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [activeIndex, setActiveIndex] = useState(-1)
  const requestIdRef = useRef(0)
  const [resolvedQuery, setResolvedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(-1)
      requestIdRef.current += 1
      setResolvedQuery('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

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

  const goTo = (to: string) => {
    onOpenChange(false)
    setQuery('')
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
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      submitSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search projects</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b border-border px-4 transition-colors focus-within:border-primary/30">
          <RiSearchLine className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            aria-label="Search crypto projects"
            autoComplete="off"
            className="h-14 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects by name or symbol..."
            value={query}
          />
          <kbd className="hidden rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>
        <ProjectSearchResults
          results={results}
          query={resolvedQuery}
          activeIndex={activeIndex}
          onSelect={goTo}
          onHover={setActiveIndex}
        />
      </DialogContent>
    </Dialog>
  )
}
