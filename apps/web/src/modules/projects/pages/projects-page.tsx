import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { RiAddLine } from '@remixicon/react'
import { Button } from '../../../components/ui'
import { CatalogSearchField } from '../components/catalog-search-field'
import { CategoryFilter } from '../components/category-filter'
import { CouncilProjectsSection } from '../components/council-projects-section'
import { ReferenceAssessmentsSection } from '../components/reference-assessments-section'
import { useCatalogFilters } from '../hooks/use-catalog-filters'
import { filterCuratedProjects } from '../lib/curated-projects'

export function ProjectsPage() {
  const { draft, setDraft, search, category, setCategory, clearFilters } =
    useCatalogFilters()
  const references = useMemo(
    () => filterCuratedProjects(search, undefined, category),
    [search, category],
  )

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">
            Project catalog
          </p>
          <h1 className="heading-2">Browse projects</h1>
          <p className="body-large">
            Council projects carry an official score published by the governor council.
            Reference assessments help you compare everything else. No wallet needed to
            browse.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 gap-1 rounded-full">
          <Link to="/app/analysis-request">
            <RiAddLine aria-hidden className="h-4 w-4" />
            Request a review
          </Link>
        </Button>
      </header>

      <CatalogSearchField value={draft} onChange={setDraft} />

      <CouncilProjectsSection search={search} />

      <ReferenceAssessmentsSection
        filterKey={`${search}|${category ?? 'all'}`}
        projects={references}
        filters={<CategoryFilter value={category} onChange={setCategory} />}
        onClearFilters={clearFilters}
      />
    </div>
  )
}
