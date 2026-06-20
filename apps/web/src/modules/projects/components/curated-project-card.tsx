import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { CuratedProject } from '../lib/curated-projects'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'

/**
 * Card used for curated/reference assets in the safety index.
 */
export function CuratedProjectCard({
  index,
  project,
}: {
  index: number
  project: CuratedProject
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link className="group block" to={`/app/reference/${project.slug}`}>
        <Card className="card-hover h-full overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={project.status === 'reference' ? 'success' : 'warning'}>
                    Rank #{project.rank}
                  </Badge>
                  <Badge variant="secondary">{project.network}</Badge>
                </div>
                <CardTitle className="mt-3 flex items-center gap-2 text-lg">
                  {project.name}
                  <span className="text-sm font-medium text-muted-foreground">
                    {project.symbol}
                  </span>
                </CardTitle>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck size={20} weight="duotone" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
              {project.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-yellow-400 transition-all"
                    style={{ width: `${project.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">{project.score}</span>
              </div>
              <span className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary">
                View details
                <ArrowRight size={14} />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
