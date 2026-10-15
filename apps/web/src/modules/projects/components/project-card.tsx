import { Link } from 'react-router-dom'
import { RiArrowRightUpLine, RiShieldStarLine } from '@remixicon/react'
import type { Project } from '../../../lib/api/types'
import { ProjectStatusBadge } from './project-status-badge'

export function ProjectCard({ project }: { project: Project }) {
  const hasScore = project.score !== undefined
  const score = hasScore ? Math.min(100, Math.max(0, project.score ?? 0)) : 0

  return (
    <Link
      to={`/app/projects/${project.slug}`}
      className="glass-card-flat group card-hover flex h-full flex-col gap-4 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <RiShieldStarLine aria-hidden className="h-3.5 w-3.5 text-primary-strong" />
            Council project
          </p>
          <h3 className="truncate text-lg font-semibold">{project.name}</h3>
        </div>
        <ProjectStatusBadge state={project.state} className="shrink-0 rounded-full" />
      </div>
      {project.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between text-sm">
        {hasScore ? (
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <span className="block h-full bg-success" style={{ width: `${score}%` }} />
            </span>
            <span className="font-semibold tabular-nums">{project.score}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">
            {project.state === 'analyzed' ? 'Score on the report' : 'No score yet'}
          </span>
        )}
        <span className="flex items-center gap-1 font-semibold text-foreground/70 transition-colors group-hover:text-foreground">
          View report
          <RiArrowRightUpLine aria-hidden className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
