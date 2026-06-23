import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CommentThread } from '../../comments/components/comment-thread'
import { ScorePanel } from '../../scoring/components/score-panel'
import { AuthorityVotePanel } from '../../voting/components/authority-vote-panel'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { ProjectDetailBackButton } from '../components/project-detail-back-button'
import { ProjectReviewDetail } from '../components/project-review-detail'
import { ProjectPricePanel } from '../../market/components/project-price-panel'
import { ProtocolMetricsPanel } from '../../protocol-metrics/components/protocol-metrics-panel'
import { useProject } from '../hooks/use-projects'
import { formatProjectState } from '../lib/format'
import { getCuratedProject } from '../lib/curated-projects'
import { getProjectReviewProfile, getVerdictLabel } from '../lib/curated-project-reviews'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '../../../components/ui'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, isLoading, isError } = useProject(slug)
  const curated = slug ? getCuratedProject(slug) : undefined
  const review = curated ? getProjectReviewProfile(curated) : null

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app">Back to projects</Link>
        </Button>
      </Card>
    )
  }

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <section className="space-y-6">
        <ProjectDetailBackButton />
        <div className="flex items-start gap-4">
          {curated ? (
            <ProjectIcon
              symbol={curated.symbol}
              name={curated.name}
              slug={curated.slug}
              className="h-14 w-14 shrink-0"
            />
          ) : null}
          <div>
            <Badge variant="secondary" className="mb-3">
              {formatProjectState(project.state)}
            </Badge>
            <h1 className="heading-2 mb-2">{project.name}</h1>
            <p className="body-large">
              {project.description ?? curated?.description ?? 'No description yet.'}
            </p>
          </div>
        </div>
        <ProjectPricePanel slug={project.slug} />
        <ProtocolMetricsPanel slug={project.slug} />
        {review ? (
          <ProjectReviewDetail profile={review} />
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Governor review in progress. Structured reports and external audit coverage will
              appear here once the council publishes findings.{' '}
              <Link to="/app/analysis-request" className="font-semibold text-primary hover:underline">
                Submit evidence
              </Link>{' '}
              to help investigators.
            </CardContent>
          </Card>
        )}
        <AuthorityVotePanel projectSlug={project.slug} projectState={project.state} />
        <CommentThread projectId={project.id} />
      </section>
      <aside className="space-y-4">
        <ScorePanel projectId={project.id} />
        {review ? (
          <Card className="rounded-2xl border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Council verdict</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {curated?.score ?? '—'}%
              </p>
              <p className="mt-1 text-sm font-medium">{getVerdictLabel(review.verdict)}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {review.externalReviews.length} specific security/finance report
                {review.externalReviews.length === 1 ? '' : 's'} indexed.
              </p>
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">On-chain registry</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-all text-sm text-muted-foreground">
              {project.votingContractAddress ?? 'Not deployed yet'}
            </p>
          </CardContent>
        </Card>
      </aside>
    </motion.div>
  )
}
