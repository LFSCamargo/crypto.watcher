import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowsClockwise, Plus } from '@phosphor-icons/react'
import { CommentThread } from '../comments/components/comment-thread'
import { ScorePanel } from '../scoring/components/score-panel'
import type { ProjectState } from '../../lib/api/types'
import { useSession } from '../../store/session'
import { projectsApi } from './api/projects.api'
import { CuratedProjectCard } from './components/curated-project-card'
import { ProjectCard } from './components/project-card'
import { ProjectSearch } from './components/project-search'
import { useProject, useProjects } from './hooks/use-projects'
import { formatProjectState } from './lib/format'
import { curatedProjects, filterCuratedProjects } from './lib/curated-projects'
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
  const { data, isLoading, isError } = useProjects()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') ?? ''

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!data || !normalizedQuery) {
      return data ?? []
    }

    return data.filter((project) =>
      [project.name, project.slug, project.description ?? '', project.tokenAddress ?? ''].some(
        (value) => value.toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [data, searchQuery])

  const filteredCuratedProjects = useMemo(
    () =>
      searchQuery.trim()
        ? filterCuratedProjects(searchQuery)
        : curatedProjects.slice(0, 3),
    [searchQuery],
  )

  const hasResults = filteredProjects.length > 0 || filteredCuratedProjects.length > 0

  if (isLoading) {
    return (
      <section>
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-5 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-4 h-10 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Failed to load projects.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </Card>
    )
  }

  return (
    <section>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Badge variant="secondary" className="mb-3">
          Public safety index
        </Badge>
        <h1 className="heading-2 mb-2">
          {searchQuery ? `Safety results for "${searchQuery}"` : 'Crypto Safety Index'}
        </h1>
        <p className="body-large max-w-3xl">
          Search recognized market assets and community-reviewed crypto projects without
          connecting a wallet. Wallet access is only required for voting, posting, and
          reputation actions.
        </p>
      </motion.div>

      <Card className="mb-8 border-primary/20 bg-card/60 p-4">
        <ProjectSearch />
      </Card>

      {filteredCuratedProjects.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Market reference assets</h2>
              <p className="text-sm text-muted-foreground">
                Inspired by top CoinMarketCap listings; use as research context, not a
                guarantee.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCuratedProjects.map((project, index) => (
              <CuratedProjectCard key={project.slug} index={index} project={project} />
            ))}
          </div>
        </div>
      )}

      {filteredProjects.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Community-reviewed projects</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
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

      {!hasResults && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No safety results matched your search yet.
          </p>
        </Card>
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
        <Button asChild className="gap-2">
          <Link to={`/app/projects/${project.slug}/vote`}>
            Open voting
            <ArrowRight size={16} />
          </Link>
        </Button>
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
            <Plus size={20} />
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
            <Button type="submit" className="w-full gap-2">
              <Plus size={16} />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowsClockwise size={20} />
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
            <Button type="submit" className="w-full gap-2" variant="secondary">
              <ArrowsClockwise size={16} />
              Transition
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
