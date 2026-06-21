import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RiAddLine, RiShieldCheckLine, RiThumbDownLine, RiThumbUpLine } from '@remixicon/react'
import { motion } from 'framer-motion'
import { useSession } from '../../store/session'
import { useProjects } from '../projects/hooks/use-projects'
import { formatProjectState } from '../projects/lib/format'
import { analysisRequestsApi } from './api/analysis-requests.api'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Textarea,
} from '../../components/ui'

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
          Authority review queue
        </Badge>
        <h1 className="heading-2 mb-2">In Analysis</h1>
        <p className="body-large max-w-3xl">
          Projects currently under review by our POA authority panel. Governors decide
          whether each project is safe or unsafe before scores are published.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Community review requests</h2>
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

export function AnalysisRequestPage() {
  const user = useSession((state) => state.user)
  const [projectName, setProjectName] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [description, setDescription] = useState('')

  const createRequest = useMutation({
    mutationFn: analysisRequestsApi.create,
    onSuccess: () => {
      toast.success('Review request submitted!')
      setProjectName('')
      setProjectUrl('')
      setDescription('')
    },
    onError: () => toast.error('Could not submit request'),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    createRequest.mutate({ projectName, projectUrl, description })
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-lg rounded-2xl p-8 text-center">
        <RiShieldCheckLine className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="heading-3 mb-2">Request a project review</h1>
        <p className="mb-6 text-muted-foreground">
          Sign in to pay protocol fees and deploy a voting contract for your project.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/auth/signin">Sign in to continue</Link>
        </Button>
      </Card>
    )
  }

  return (
    <motion.section
      className="mx-auto max-w-2xl space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <Badge variant="secondary" className="mb-3">
          Paid review
        </Badge>
        <h1 className="heading-2 mb-2">Request Analysis</h1>
        <p className="body-large">
          Ask our protocol to review a DApp or crypto project. After submission, pay
          the deployment fee to activate on-chain voting by our POA authority panel.
        </p>
      </div>

      <Card className="rounded-2xl border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-6">
          <RiAddLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold">How it works</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
              <li>Submit your project details below</li>
              <li>Pay the protocol fee to deploy the voting contract</li>
              <li>Authority governors review and vote safe or unsafe</li>
              <li>Published safety score appears in the Safe Projects catalog</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectUrl">Project URL</Label>
              <Input
                id="projectUrl"
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://..."
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">What should we review?</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={10}
                required
                className="min-h-[120px] rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={createRequest.isPending}
            >
              {createRequest.isPending ? 'Submitting...' : 'Submit review request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.section>
  )
}
