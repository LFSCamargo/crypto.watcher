import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiAddLine, RiSearchLine } from '@remixicon/react'
import { CuratedProjectCard } from '../components/curated-project-card'
import { ProjectCard } from '../components/project-card'
import { useProjects } from '../hooks/use-projects'
import {
  curatedProjects,
  filterCuratedProjects,
  projectCategories,
  type CuratedProject,
} from '../lib/curated-projects'
import { Badge, Button, Card, Input, Skeleton } from '../../../components/ui'

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') ?? ''
  const categoryParam = searchParams.get('category') ?? 'all'
  const [titleSearch, setTitleSearch] = useState(searchQuery)
  const { data: liveProjects, isLoading, isError: liveProjectsError } = useProjects()

  const activeCategory =
    categoryParam === 'all'
      ? undefined
      : (categoryParam as CuratedProject['category'])

  const filteredCuratedProjects = useMemo(() => {
    const query = titleSearch.trim() || searchQuery.trim()
    return filterCuratedProjects(query, curatedProjects, activeCategory)
  }, [titleSearch, searchQuery, activeCategory])

  const filteredLiveProjects = useMemo(() => {
    const query = (titleSearch.trim() || searchQuery.trim()).toLowerCase()
    if (!liveProjects || !query) return liveProjects ?? []
    return liveProjects.filter((project) =>
      [project.name, project.slug, project.description ?? ''].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [liveProjects, titleSearch, searchQuery])

  const setCategory = (category: string) => {
    const next = new URLSearchParams(searchParams)
    if (category === 'all') next.delete('category')
    else next.set('category', category)
    setSearchParams(next)
  }

  const handleTitleSearch = () => {
    const next = new URLSearchParams(searchParams)
    if (titleSearch.trim()) next.set('search', titleSearch.trim())
    else next.delete('search')
    setSearchParams(next)
  }

  return (
    <section className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Badge variant="secondary" className="mb-3">
          Safe Projects
        </Badge>
        <h1 className="heading-2 mb-2">Browse reviewed crypto projects</h1>
        <p className="body-large max-w-3xl">
          App Store-style catalog of 100 curated market projects plus expert-reviewed
          on-chain projects. Filter by category or search by name — no wallet required to browse.
        </p>
      </motion.div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="rounded-full pl-10"
            placeholder="Search by title..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSearch()}
          />
        </div>
        <Button className="rounded-full" onClick={handleTitleSearch}>
          Search
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={categoryParam === 'all' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => setCategory('all')}
        >
          All
        </Button>
        {Object.entries(projectCategories).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={categoryParam === id ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setCategory(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {filteredCuratedProjects.length} safe projects
            </h2>
            <p className="text-sm text-muted-foreground">Sorted by credit rating (best first)</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full gap-1 shrink-0">
            <Link to="/app/analysis-request">
              <RiAddLine className="h-4 w-4" />
              Request review
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCuratedProjects.map((project, index) => (
            <CuratedProjectCard key={project.slug} index={index} project={project} />
          ))}
        </div>
        {filteredCuratedProjects.length === 0 && (
          <Card className="rounded-2xl p-12 text-center text-muted-foreground">
            No projects match your filters.
          </Card>
        )}
      </div>

      {liveProjectsError && (
        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
          Community projects are temporarily unavailable. Curated safe projects below
          still work offline.
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && filteredLiveProjects.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Expert-reviewed (on-chain)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLiveProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
