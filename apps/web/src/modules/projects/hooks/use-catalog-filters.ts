import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from '../../../lib/utils'
import { projectCategories, type CuratedProject } from '../lib/curated-projects'

type Category = CuratedProject['category']

const isCategory = (value: string | null): value is Category =>
  value !== null && Object.hasOwn(projectCategories, value)

/** Catalog search + category, kept in the URL so filtered views are shareable and restorable. */
export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const rawCategory = searchParams.get('category')
  const category = isCategory(rawCategory) ? rawCategory : undefined

  const [draft, setDraft] = useState(search)
  const debouncedDraft = useDebouncedValue(draft, 300)
  const lastWritten = useRef(search)
  const lastDebounced = useRef(debouncedDraft)

  useEffect(() => {
    if (search === lastWritten.current) return
    lastWritten.current = search
    setDraft(search)
  }, [search])

  useEffect(() => {
    if (debouncedDraft === lastDebounced.current) return
    lastDebounced.current = debouncedDraft
    const next = debouncedDraft.trim()
    if (next === lastWritten.current) return
    lastWritten.current = next
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous)
        if (next) params.set('search', next)
        else params.delete('search')
        return params
      },
      { replace: true },
    )
  }, [debouncedDraft, setSearchParams])

  const setCategory = useCallback(
    (next: Category | undefined) => {
      setSearchParams((previous) => {
        const params = new URLSearchParams(previous)
        if (next) params.set('category', next)
        else params.delete('category')
        return params
      })
    },
    [setSearchParams],
  )

  const clearFilters = useCallback(() => {
    lastWritten.current = ''
    setDraft('')
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous)
      params.delete('search')
      params.delete('category')
      return params
    })
  }, [setSearchParams])

  return { draft, setDraft, search, category, setCategory, clearFilters }
}
