import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export type ProjectsView = 'catalog' | 'in-analysis'

/** Catalog vs. review-queue tab, kept in `?view=` so the queue stays linkable. */
export function useProjectsView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view: ProjectsView =
    searchParams.get('view') === 'in-analysis' ? 'in-analysis' : 'catalog'

  const setView = useCallback(
    (next: ProjectsView) => {
      setSearchParams((previous) => {
        const params = new URLSearchParams(previous)
        if (next === 'in-analysis') params.set('view', next)
        else params.delete('view')
        return params
      })
    },
    [setSearchParams],
  )

  return { view, setView }
}
