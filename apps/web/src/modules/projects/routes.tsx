import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { RiAddLine, RiArrowRightLine, RiRefreshLine, RiSearchLine } from '@remixicon/react'
import { CommentThread } from '../comments/components/comment-thread'
import { ScorePanel } from '../scoring/components/score-panel'
import { AuthorityVotePanel } from '../voting/components/authority-vote-panel'
import type { ProjectState } from '../../lib/api/types'
import { useSession } from '../../store/session'
import { projectsApi } from './api/projects.api'
import { CuratedProjectCard } from './components/curated-project-card'
import { ProjectCard } from './components/project-card'
import { useProject, useProjects } from './hooks/use-projects'
import { formatProjectState } from './lib/format'
import {
  curatedProjects,
  filterCuratedProjects,
  projectCategories,
  type CuratedProject,
} from './lib/curated-projects'
import { ReferenceProjectDetailPage } from './pages/reference-project-detail-page'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
  Skeleton,
} from '../../components/ui'

export { ReferenceProjectDetailPage }

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
          App Store-style catalog of 100 curated market projects plus community-reviewed
          DApps. Filter by category or search by name — no wallet required to browse.
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredCuratedProjects.length} safe projects
          </h2>
          <Button asChild variant="ghost" size="sm" className="rounded-full gap-1">
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
          <h2 className="mb-4 text-lg font-semibold">Community-reviewed (on-chain)</h2>
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

export function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, isLoading, isError } = useProject(slug)

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app">Back to projects</Link>
        </Button>
      </Card>
    )
  }

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <section className="space-y-6">
        <div>
          <Badge variant="secondary" className="mb-3">
            {formatProjectState(project.state)}
          </Badge>
          <h1 className="heading-2 mb-2">{project.name}</h1>
          <p className="body-large">
            {project.description ?? 'No description yet.'}
          </p>
        </div>
        <Button asChild className="gap-2 rounded-full">
          <Link to={`/app/projects/${project.slug}/vote`}>
            Open voting
            <RiArrowRightLine className="h-4 w-4" />
          </Link>
        </Button>
        <AuthorityVotePanel projectSlug={project.slug} projectState={project.state} />
        <CommentThread projectId={project.id} />
      </section>
      <aside className="space-y-4">
        <ScorePanel projectId={project.id} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-all text-sm text-muted-foreground">
              {project.votingContractAddress ?? 'Not deployed yet'}
            </p>
          </CardContent>
        </Card>
      </aside>
    </motion.div>
  )
}

export function AdminProjectsPage() {
  const user = useSession((state) => state.user)
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [chainId, setChainId] = useState(84532)
  const [description, setDescription] = useState('')
  const [transitionId, setTransitionId] = useState('')
  const [state, setState] = useState<ProjectState>('ready')

  const createProject = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
  const transitionProject = useMutation({
    mutationFn: () => projectsApi.transition(transitionId, { state }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  if (user?.role !== 'team' && user?.role !== 'admin') {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Team or admin access required.</p>
      </Card>
    )
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    await createProject.mutateAsync({ name, chainId, description })
    setName('')
    setDescription('')
    toast.success('Project created')
  }

  const handleTransition = async (event: FormEvent) => {
    event.preventDefault()
    await transitionProject.mutateAsync()
    setTransitionId('')
    toast.success('Project transitioned')
  }

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiAddLine className="h-5 w-5" />
            Create Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter project name"
                value={name}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chain ID</label>
              <Input
                onChange={(event) => setChainId(Number(event.target.value))}
                placeholder="Chain ID"
                type="number"
                value={chainId}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Project description"
                value={description}
              />
            </div>
            <Button type="submit" className="w-full gap-2 rounded-full">
              <RiAddLine className="h-4 w-4" />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiRefreshLine className="h-5 w-5" />
            Transition Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleTransition}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project UUID</label>
              <Input
                onChange={(event) => setTransitionId(event.target.value)}
                placeholder="Enter project UUID"
                value={transitionId}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New State</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onChange={(event) => setState(event.target.value as ProjectState)}
                value={state}
              >
                <option value="ready">Ready</option>
                <option value="voting">Voting</option>
                <option value="closed">Closed</option>
                <option value="analyzed">Analyzed</option>
              </select>
            </div>
            <Button type="submit" className="w-full gap-2 rounded-full" variant="secondary">
              <RiRefreshLine className="h-4 w-4" />
              Transition
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
