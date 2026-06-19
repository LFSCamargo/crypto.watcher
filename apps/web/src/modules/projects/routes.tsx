import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CommentThread } from '../comments/components/comment-thread'
import { ScorePanel } from '../scoring/components/score-panel'
import type { ProjectState } from '../../lib/api/types'
import { useSession } from '../../store/session'
import { projectsApi } from './api/projects.api'
import { ProjectCard } from './components/project-card'
import { useProject, useProjects } from './hooks/use-projects'
import { formatProjectState } from './lib/format'

export function ProjectsPage() {
  const { data, isLoading, isError } = useProjects()

  if (isLoading) return <p>Loading projects…</p>
  if (isError) return <p>Failed to load projects.</p>

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Reputation-weighted risk analysis for crypto projects.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}

export function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, isLoading, isError } = useProject(slug)

  if (isLoading) return <p>Loading project…</p>
  if (isError || !project) return <p>Project not found.</p>

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{formatProjectState(project.state)}</p>
          <h1 className="text-3xl font-semibold">{project.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {project.description ?? 'No description yet.'}
          </p>
        </div>
        <Link
          className="inline-flex rounded-md border px-3 py-2 text-sm"
          to={`/projects/${project.slug}/vote`}
        >
          Open voting
        </Link>
        <CommentThread projectId={project.id} />
      </section>
      <aside className="space-y-4">
        <ScorePanel projectId={project.id} />
        <section className="rounded-lg border p-4 text-sm">
          <h2 className="font-medium">Contract</h2>
          <p className="mt-2 break-all text-muted-foreground">
            {project.votingContractAddress ?? 'Not deployed yet'}
          </p>
        </section>
      </aside>
    </div>
  )
}

export function AdminProjectsPage() {
  const user = useSession((state) => state.user)
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [chainId, setChainId] = useState(1)
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
    return <p>Team or admin access required.</p>
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
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="space-y-3 rounded-lg border p-4" onSubmit={handleCreate}>
        <h1 className="text-xl font-semibold">Create Project</h1>
        <input
          className="w-full rounded-md border p-2"
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          value={name}
        />
        <input
          className="w-full rounded-md border p-2"
          onChange={(event) => setChainId(Number(event.target.value))}
          placeholder="Chain ID"
          type="number"
          value={chainId}
        />
        <textarea
          className="min-h-24 w-full rounded-md border p-2"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          value={description}
        />
        <button className="rounded-md border px-3 py-2 text-sm" type="submit">
          Create
        </button>
      </form>

      <form className="space-y-3 rounded-lg border p-4" onSubmit={handleTransition}>
        <h2 className="text-xl font-semibold">Transition Project</h2>
        <input
          className="w-full rounded-md border p-2"
          onChange={(event) => setTransitionId(event.target.value)}
          placeholder="Project UUID"
          value={transitionId}
        />
        <select
          className="w-full rounded-md border p-2"
          onChange={(event) => setState(event.target.value as ProjectState)}
          value={state}
        >
          <option value="ready">Ready</option>
          <option value="voting">Voting</option>
          <option value="closed">Closed</option>
          <option value="analyzed">Analyzed</option>
        </select>
        <button className="rounded-md border px-3 py-2 text-sm" type="submit">
          Transition
        </button>
      </form>
    </div>
  )
}
