import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '../../../store/session'
import { useProjects } from '../../projects/hooks/use-projects'
import { ProjectCard } from '../../projects/components/project-card'
import { analysisRequestsApi } from '../api/analysis-requests.api'
import { RequestStatusLegend } from '../components/request-status-legend'
import { ReviewRequestCard } from '../components/review-request-card'
import { Button, Skeleton } from '../../../components/ui'

export function InAnalysisPage() {
  const user = useSession((state) => state.user)
  const canTriage = user?.role === 'admin' || user?.role === 'team'
  const { data: projects, isLoading: projectsLoading } = useProjects({
    state: 'in_analysis',
  })
  const requests = useQuery({
    queryKey: ['analysis-requests'],
    queryFn: () => analysisRequestsApi.list(),
    retry: false,
  })

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">
            Review queue
          </p>
          <h1 className="heading-2">In analysis</h1>
          <p className="body-large">
            Follow review requests from the community and council projects that are being
            analysed.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 rounded-full">
          <Link to="/app/analysis-request">Request a review</Link>
        </Button>
      </header>

      <RequestStatusLegend />

      <section aria-labelledby="review-requests-title" className="space-y-4">
        <h2 id="review-requests-title" className="text-xl font-semibold">
          Review requests
        </h2>
        {requests.isLoading ? (
          <div className="space-y-4" aria-label="Loading review requests">
            <Skeleton className="h-36 w-full rounded-3xl" />
            <Skeleton className="h-36 w-full rounded-3xl" />
          </div>
        ) : requests.isError ? (
          <div
            role="alert"
            className="glass-card-flat flex flex-col items-start gap-3 p-5 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <p>
              <span className="font-semibold">
                Review requests couldn&apos;t be loaded.
              </span>{' '}
              <span className="text-muted-foreground">
                Check your connection and try again.
              </span>
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={requests.isFetching}
              onClick={() => void requests.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : requests.data?.items.length ? (
          <ul className="space-y-4">
            {requests.data.items.map((request) => (
              <li key={request.id}>
                <ReviewRequestCard request={request} canTriage={canTriage} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass-card-flat p-8 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No review requests yet.</p>
            <p className="mt-1">
              Know a project the council should look at? Requests are free.
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="council-in-analysis-title" className="space-y-4">
        <div>
          <h2 id="council-in-analysis-title" className="text-xl font-semibold">
            Council projects in analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Projects the council has taken on. They have no official score until a report
            is published.
          </p>
        </div>
        {projectsLoading ? (
          <Skeleton className="h-40 w-full rounded-3xl" />
        ) : projects?.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass-card-flat p-8 text-center text-sm text-muted-foreground">
            No council projects are in analysis right now.
          </div>
        )}
      </section>
    </div>
  )
}
