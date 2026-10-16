import { Link, useParams } from 'react-router-dom'
import { CommentThread } from '../../comments/components/comment-thread'
import { ScorePanel } from '../../scoring/components/score-panel'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { Skeleton } from '../../../components/ui'
import { CouncilFindingsSection } from '../components/council-findings-section'
import { MarketContextSection } from '../components/market-context-section'
import { ProjectDetailBackButton } from '../components/project-detail-back-button'
import { ProjectLifecycleSteps } from '../components/project-lifecycle-steps'
import { ProjectNotFound } from '../components/project-not-found'
import { ProjectStatusBadge } from '../components/project-status-badge'
import { useProject } from '../hooks/use-projects'
import { getCuratedProject } from '../lib/curated-projects'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, isLoading, isError } = useProject(slug)
  const curated = slug ? getCuratedProject(slug) : undefined

  if (isLoading) {
    return (
      <div className="space-y-6" aria-label="Loading project">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <ProjectNotFound
        title="Project not found"
        body="This project isn't in the council's catalog. It may have been renamed or the link may be wrong."
      />
    )
  }

  return (
    <article className="space-y-8">
      <div>
        <ProjectDetailBackButton />
        <header className="flex items-start gap-4">
          {curated ? (
            <ProjectIcon
              symbol={curated.symbol}
              name={curated.name}
              slug={curated.slug}
              className="h-14 w-14 shrink-0"
            />
          ) : null}
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusBadge state={project.state} className="rounded-full" />
              <span className="text-xs font-medium text-muted-foreground">
                Council project
              </span>
            </div>
            <h1 className="heading-2">{project.name}</h1>
            <p className="body-large">{project.description ?? 'No description yet.'}</p>
          </div>
        </header>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <ScorePanel projectId={project.id} />
          <CouncilFindingsSection
            state={project.state}
            projectName={project.name}
            referenceSlug={curated?.slug}
          />
          <MarketContextSection slug={project.slug} />
          <section aria-label="Discussion">
            <CommentThread projectId={project.id} />
          </section>
        </div>

        <aside className="space-y-4">
          <section
            aria-labelledby="review-progress-title"
            className="glass-card-flat p-6"
          >
            <h2 id="review-progress-title" className="mb-4 text-base font-semibold">
              Review progress
            </h2>
            <ProjectLifecycleSteps state={project.state} />
          </section>
          <section aria-labelledby="onchain-record-title" className="glass-card-flat p-6">
            <h2 id="onchain-record-title" className="mb-2 text-base font-semibold">
              On-chain record
            </h2>
            <p className="break-all text-sm text-muted-foreground">
              {project.votingContractAddress ?? 'Not anchored on-chain yet'}
            </p>
          </section>
          <section className="glass-card-flat space-y-2 p-6 text-sm text-muted-foreground">
            <p>
              Have information the council should see? Share it in the discussion. Want
              another project reviewed?
            </p>
            <Link
              to="/app/analysis-request"
              className="font-semibold text-primary-strong underline-offset-4 hover:underline"
            >
              Request a review
            </Link>
          </section>
        </aside>
      </div>
    </article>
  )
}
