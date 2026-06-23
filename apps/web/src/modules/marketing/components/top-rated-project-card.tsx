import type { CuratedProject } from '../../projects/lib/curated-projects'
import { CuratedProjectCard } from '../../projects/components/curated-project-card'

type TopRatedProjectCardProps = {
  project: CuratedProject
  index?: number
}

export function TopRatedProjectCard({ project, index = 0 }: TopRatedProjectCardProps) {
  return (
    <CuratedProjectCard
      index={index}
      project={project}
      richChart
      fetchImmediately
    />
  )
}
