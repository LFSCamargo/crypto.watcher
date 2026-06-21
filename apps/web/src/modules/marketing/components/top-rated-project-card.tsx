import type { CuratedProject } from '../../projects/lib/curated-projects'
import { CuratedProjectCard } from '../../projects/components/curated-project-card'

export function TopRatedProjectCard({ project }: { project: CuratedProject }) {
  // Landing shows only a few → safe to use richer chart.
  return <CuratedProjectCard index={0} project={project} richChart />
}
