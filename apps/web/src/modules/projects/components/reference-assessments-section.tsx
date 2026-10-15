import { useState, type ReactNode } from 'react'
import { Button } from '../../../components/ui'
import type { CuratedProject } from '../lib/curated-projects'
import { CuratedProjectCard } from './curated-project-card'

const PAGE_SIZE = 24

export function ReferenceAssessmentsSection({
  projects,
  filterKey,
  filters,
  onClearFilters,
}: {
  projects: CuratedProject[]
  /** Changes whenever filters change, so paging restarts without remounting the filters. */
  filterKey: string
  filters: ReactNode
  onClearFilters: () => void
}) {
  const [paging, setPaging] = useState({ filterKey, count: PAGE_SIZE })
  const visibleCount = paging.filterKey === filterKey ? paging.count : PAGE_SIZE
  const visible = projects.slice(0, visibleCount)
  const remaining = projects.length - visible.length

  return (
    <section aria-labelledby="reference-assessments-title" className="space-y-4">
      <div>
        <h2 id="reference-assessments-title" className="text-xl font-semibold">
          Reference assessments
        </h2>
        <p className="text-sm text-muted-foreground">
          Compiled by Crypto Watcher from public audits, history and market data to help
          you compare. They are not governor council reports.
        </p>
      </div>
      {filters}
      <p className="text-sm font-medium" aria-live="polite">
        {projects.length} reference assessments
      </p>

      {projects.length === 0 ? (
        <div className="glass-card-flat flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
          <p>No reference assessments match your filters.</p>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((project, index) => (
              <li key={project.slug}>
                <CuratedProjectCard index={index % PAGE_SIZE} project={project} />
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-center gap-3 pt-2 text-sm text-muted-foreground">
            <p>
              Showing {visible.length} of {projects.length}
            </p>
            {remaining > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setPaging({ filterKey, count: visibleCount + PAGE_SIZE })}
              >
                Show more
              </Button>
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}
