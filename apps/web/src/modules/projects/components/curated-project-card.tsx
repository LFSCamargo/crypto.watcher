import { Link } from 'react-router-dom'
import { RiArrowRightUpLine, RiShieldCheckLine } from '@remixicon/react'
import { motion } from 'framer-motion'
import type { CuratedProject } from '../lib/curated-projects'
import { projectCategories } from '../lib/curated-projects'
import { Badge, Card } from '../../../components/ui'
import { ProjectIcon } from '../../../components/brand/project-icon'

function scoreTone(score: number) {
  if (score >= 85) return 'success' as const
  if (score >= 70) return 'warning' as const
  return 'destructive' as const
}

export function CuratedProjectCard({
  index,
  project,
}: {
  index: number
  project: CuratedProject
}) {
  const tone = scoreTone(project.score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.25) }}
    >
      <Link className="group block h-full" to={`/app/reference/${project.slug}`}>
        <Card className="card-hover flex h-full flex-col p-5">
          <div className="flex items-start gap-3">
            <ProjectIcon
              symbol={project.symbol}
              name={project.name}
              slug={project.slug}
              className="h-12 w-12 shrink-0"
              textClassName="text-xs"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold leading-tight">{project.name}</p>
              <p className="truncate text-xs font-medium text-muted-foreground">
                {project.symbol} · {projectCategories[project.category]}
              </p>
            </div>
            <Badge
              variant={tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'destructive'}
              className="shrink-0"
            >
              {project.score}%
            </Badge>
          </div>

          <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {project.description}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <RiShieldCheckLine className="h-4 w-4 text-primary" />
              {project.network}
            </span>
            <span className="flex items-center gap-1 font-semibold text-foreground/70 transition-colors group-hover:text-foreground">
              Details
              <RiArrowRightUpLine className="h-4 w-4" />
            </span>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
