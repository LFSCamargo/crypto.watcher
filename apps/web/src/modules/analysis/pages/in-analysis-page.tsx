import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { RiThumbDownLine, RiThumbUpLine } from '@remixicon/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '../../../store/session'
import { useProjects } from '../../projects/hooks/use-projects'
import { formatProjectState } from '../../projects/lib/format'
import { analysisRequestsApi } from '../api/analysis-requests.api'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '../../../components/ui'

export function InAnalysisPage() {
  const user = useSession((state) => state.user)
  const isAuthority = user?.role === 'admin' || user?.role === 'team'
  const { data: projects, isLoading: projectsLoading } = useProjects({ state: 'in_analysis' })
  const { data: requests, isLoading: requestsLoading, isError: requestsError } = useQuery({
    queryKey: ['analysis-requests'],
    queryFn: () => analysisRequestsApi.list(),
    retry: false,
  })
  const queryClient = useQueryClient()

  const updateRequest = useMutation({
    mutationFn: analysisRequestsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-requests'] })
      toast.success('Review updated')
    },
  })

  return (
    <section className="space-y-10">
      <div>
        <Badge variant="secondary" className="mb-3">
          Governor review queue
        </Badge>
        <h1 className="heading-2 mb-2">In Analysis</h1>
        <p className="body-large max-w-3xl">
          Projects currently under review by our expert governor council. Governors
          investigate each project and publish structured reports with official scores.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Review requests</h2>
        {requestsLoading ? (
          <Skeleton className="h-32 w-full rounded-2xl" />
        ) : requestsError ? (
          <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5 p-6 text-sm text-muted-foreground">
            Review requests could not be loaded. Make sure the API is running, then refresh.
          </Card>
        ) : requests?.items.length === 0 ? (
          <Card className="rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">No pending review requests yet.</p>
            <Button asChild className="mt-4 rounded-full">
              <Link to="/app/analysis-request">Request a review</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests?.items.map((request) => (
              <Card key={request.id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{request.projectName}</CardTitle>
                    <a
                      href={request.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {request.projectUrl}
                    </a>
                  </div>
                  <Badge variant="warning">{request.status.replace('_', ' ')}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                  {request.reviewNotes && (
                    <p className="rounded-xl bg-muted p-3 text-sm">
                      <span className="font-semibold">Authority notes: </span>
                      {request.reviewNotes}
                    </p>
                  )}
                  {isAuthority && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="rounded-full gap-1"
                        onClick={() =>
                          updateRequest.mutate({
                            id: request.id,
                            status: 'approved',
                            reviewNotes: 'Marked safe by authority review.',
                          })
                        }
                      >
                        <RiThumbUpLine className="h-4 w-4" />
                        Mark safe
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full gap-1"
                        onClick={() =>
                          updateRequest.mutate({
                            id: request.id,
                            status: 'rejected',
                            reviewNotes: 'Flagged as unsafe by authority review.',
                          })
                        }
                      >
                        <RiThumbDownLine className="h-4 w-4" />
                        Mark unsafe
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">On-chain projects in analysis</h2>
        {projectsLoading ? (
          <Skeleton className="h-32 w-full rounded-2xl" />
        ) : projects?.length === 0 ? (
          <Card className="rounded-2xl p-8 text-center text-muted-foreground">
            No deployed projects are currently in analysis.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects?.map((project) => (
              <Card key={project.id} className="rounded-2xl card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge>{formatProjectState(project.state)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to={`/app/projects/${project.slug}`}>Review project</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
