import { Link } from 'react-router-dom'
import type { Project } from '../../../lib/api/types'
import { formatProjectState } from '../lib/format'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-lg border p-4">
      <h2 className="font-medium">
        <Link to={`/projects/${project.slug}`}>{project.name}</Link>
      </h2>
      <p className="text-sm text-muted-foreground">{formatProjectState(project.state)}</p>
      {project.score !== undefined && (
        <p className="mt-2 text-sm">Score: {project.score}</p>
      )}
    </article>
  )
}
