import { Link } from 'react-router-dom'
import { ArrowRight, ChartLineUp } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Project } from '../../../lib/api/types'
import { formatProjectState } from '../lib/format'
import { Card, CardContent, CardHeader, Badge } from '../../../components/ui'
import { cn } from '../../../lib/utils'

function getStateBadgeVariant(state: string) {
  switch (state) {
    case 'voting':
      return 'success'
    case 'ready':
      return 'info'
    case 'closed':
      return 'warning'
    case 'analyzed':
      return 'default'
    default:
      return 'secondary'
  }
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/app/projects/${project.slug}`}>
        <Card className="group card-hover cursor-pointer overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold group-hover:text-primary">
                  {project.name}
                </h3>
                <Badge variant={getStateBadgeVariant(project.state)} className="mt-2">
                  {formatProjectState(project.state)}
                </Badge>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                  project.score !== undefined ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                <ChartLineUp size={20} weight="duotone" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {project.description && (
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              {project.score !== undefined ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-yellow-400 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, project.score))}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-primary">{project.score}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No score yet</span>
              )}
              <span className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary">
                View
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
