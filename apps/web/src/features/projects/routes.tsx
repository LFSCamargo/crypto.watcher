import { ProjectCard } from './components/project-card'
import { useProjects } from './hooks/use-projects'

export function ProjectsPage() {
  const { data, isLoading, isError } = useProjects()

  if (isLoading) return <p>Loading projects…</p>
  if (isError) return <p>Failed to load projects.</p>

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
