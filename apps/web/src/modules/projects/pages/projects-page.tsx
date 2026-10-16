import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiAddLine, RiCompass3Line, RiStackLine } from '@remixicon/react'
import { Button, SegmentedTabs, tabIds } from '../../../components/ui'
import { PageHero } from '../../../components/layout/page-hero'
import { InAnalysisPanel } from '../../analysis/components/in-analysis-panel'
import { useInAnalysisCount } from '../../analysis/hooks/use-in-analysis-count'
import { CatalogSearchField } from '../components/catalog-search-field'
import { CategoryFilter } from '../components/category-filter'
import { CouncilProjectsSection } from '../components/council-projects-section'
import { ReferenceAssessmentsSection } from '../components/reference-assessments-section'
import { useCatalogFilters } from '../hooks/use-catalog-filters'
import { useProjects } from '../hooks/use-projects'
import { useProjectsView, type ProjectsView } from '../hooks/use-projects-view'
import { curatedProjects, filterCuratedProjects } from '../lib/curated-projects'

const TABS_ID = 'projects-view'

export function ProjectsPage() {
  const { draft, setDraft, search, category, setCategory, clearFilters } =
    useCatalogFilters()
  const { view, setView } = useProjectsView()
  const { data: councilProjects } = useProjects()
  const inAnalysisCount = useInAnalysisCount()
  const references = useMemo(
    () => filterCuratedProjects(search, undefined, category),
    [search, category],
  )

  const tabs = useMemo(
    () => [
      { value: 'catalog' as ProjectsView, label: 'Catalog', icon: RiStackLine },
      {
        value: 'in-analysis' as ProjectsView,
        label: 'In analysis',
        icon: RiCompass3Line,
        count: inAnalysisCount,
      },
    ],
    [inAnalysisCount],
  )

  return (
    <div className="space-y-8">
      <PageHero
        icon={RiStackLine}
        tone="sky"
        accentTone="amber"
        eyebrow="Project catalog"
        title="Projects"
        description="Council projects carry an official score published by the governor council. Reference assessments help you compare everything else, and the review queue shows what the council is looking at next. No wallet needed to browse."
        actions={
          <Button asChild className="gap-1 rounded-full">
            <Link to="/app/analysis-request">
              <RiAddLine aria-hidden className="h-4 w-4" />
              Request a review
            </Link>
          </Button>
        }
        stats={[
          { label: 'Council projects', value: councilProjects?.length ?? '—' },
          { label: 'Reference assessments', value: curatedProjects.length },
          { label: 'In analysis', value: inAnalysisCount ?? '—' },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedTabs
          label="Project views"
          idPrefix={TABS_ID}
          items={tabs}
          value={view}
          onValueChange={setView}
        />
        {view === 'catalog' && (
          <CatalogSearchField
            value={draft}
            onChange={setDraft}
            className="w-full lg:max-w-md"
          />
        )}
      </div>

      <motion.div
        key={view}
        role="tabpanel"
        tabIndex={-1}
        {...tabIds(TABS_ID, view).panel}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-10 focus-visible:outline-none"
      >
        {view === 'catalog' ? (
          <>
            <CouncilProjectsSection search={search} />
            <ReferenceAssessmentsSection
              filterKey={`${search}|${category ?? 'all'}`}
              projects={references}
              filters={<CategoryFilter value={category} onChange={setCategory} />}
              onClearFilters={clearFilters}
            />
          </>
        ) : (
          <InAnalysisPanel />
        )}
      </motion.div>
    </div>
  )
}
