import { Link } from 'react-router-dom'
import { RiArrowRightUpLine } from '@remixicon/react'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { resolveCreditRatingFromSafetyScore } from '../../../lib/ratings/credit-rating'
import {
  projectCategories,
  type CuratedProject,
} from '../../projects/lib/curated-projects'

interface ReferenceAssessmentLinkProps {
  project: CuratedProject
}

export function ReferenceAssessmentLink({ project }: ReferenceAssessmentLinkProps) {
  const rating = resolveCreditRatingFromSafetyScore(project.score)

  return (
    <Link
      to={`/app/reference/${project.slug}`}
      className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ProjectIcon
        symbol={project.symbol}
        name={project.name}
        slug={project.slug}
        className="h-11 w-11"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{project.name}</span>
        <span className="block text-xs text-muted-foreground">
          {project.symbol} · {projectCategories[project.category]} · Reference assessment
        </span>
      </span>
      <span className="rounded-full border border-border px-2.5 py-0.5 text-sm font-bold">
        {rating.sp}
      </span>
      <RiArrowRightUpLine
        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  )
}
