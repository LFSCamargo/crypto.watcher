import { Link, useParams } from 'react-router-dom'
import { RiBookOpenLine, RiExternalLinkLine } from '@remixicon/react'
import { Badge } from '../../../components/ui'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { MarketContextSection } from '../components/market-context-section'
import { ProjectDetailBackButton } from '../components/project-detail-back-button'
import { ProjectNotFound } from '../components/project-not-found'
import { ProjectReviewDetail } from '../components/project-review-detail'
import { getProjectReviewProfile, getVerdictLabel } from '../lib/curated-project-reviews'
import { getCuratedProject, projectCategories } from '../lib/curated-projects'

const externalLinkClass =
  'inline-flex items-center gap-1 font-semibold text-primary-strong underline-offset-4 hover:underline'

export function ReferenceProjectDetailPage() {
  const { slug } = useParams()
  const project = slug ? getCuratedProject(slug) : undefined

  if (!project) {
    return (
      <ProjectNotFound
        title="Reference assessment not found"
        body="There is no reference assessment at this address. Browse the catalog to find a project."
      />
    )
  }

  const review = getProjectReviewProfile(project)

  return (
    <article className="space-y-8">
      <div>
        <ProjectDetailBackButton />
        <header className="flex items-start gap-4">
          <ProjectIcon
            symbol={project.symbol}
            name={project.name}
            slug={project.slug}
            className="h-16 w-16 shrink-0"
            textClassName="text-lg"
          />
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                Reference assessment
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {projectCategories[project.category]}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {project.network}
              </Badge>
            </div>
            <h1 className="heading-2">{project.name}</h1>
            <p className="body-large">{project.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className={externalLinkClass}
              >
                Official site
                <RiExternalLinkLine aria-hidden className="h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className={externalLinkClass}
              >
                CoinMarketCap
                <RiExternalLinkLine aria-hidden className="h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </header>
      </div>

      <div
        role="note"
        aria-labelledby="reference-notice-title"
        className="glass-card-flat flex items-start gap-3 p-5 text-sm"
      >
        <RiBookOpenLine
          aria-hidden
          className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
        />
        <div className="space-y-1">
          <p id="reference-notice-title" className="font-semibold">
            Reference assessment
          </p>
          <p className="text-muted-foreground">
            Crypto Watcher compiled this from public audits, operating history and market
            data so you can compare projects. It is not a governor council report and
            carries no official score.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <ProjectReviewDetail profile={review} />
          <MarketContextSection slug={project.slug} />
        </div>

        <aside className="space-y-4">
          <section
            aria-labelledby="reference-index-title"
            className="glass-card-flat space-y-3 p-6"
          >
            <h2 id="reference-index-title" className="text-base font-semibold">
              Reference index
            </h2>
            <p className="text-4xl font-bold tabular-nums">
              {project.score}
              <span className="ml-1 text-base font-medium text-muted-foreground">
                / 100
              </span>
            </p>
            <p className="text-sm font-medium">{getVerdictLabel(review.verdict)}</p>
            <div aria-hidden className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${project.score}%` }}
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Higher is safer. Combines audit coverage, operating history, liquidity and
              category-specific risks. Not financial advice.
            </p>
          </section>

          <section
            aria-labelledby="audit-coverage-title"
            className="glass-card-flat space-y-2 p-6 text-sm"
          >
            <h2 id="audit-coverage-title" className="text-base font-semibold">
              Audit coverage
            </h2>
            <p className="text-muted-foreground">
              {review.externalReviews.length
                ? `${review.externalReviews.length} security or finance report${review.externalReviews.length === 1 ? '' : 's'} indexed.`
                : 'No public audit or attestation report indexed yet.'}
            </p>
            {review.externalReviews.length > 0 && (
              <ul className="space-y-1 text-muted-foreground">
                {review.externalReviews.slice(0, 3).map((item) => (
                  <li key={item.title} className="truncate">
                    {item.provider} — {item.completedAt}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass-card-flat space-y-2 p-6 text-sm text-muted-foreground">
            <p>
              Want an official score? The governor council reviews projects on request.
            </p>
            <Link
              to="/app/analysis-request"
              className="font-semibold text-primary-strong underline-offset-4 hover:underline"
            >
              Request a council review
            </Link>
          </section>
        </aside>
      </div>
    </article>
  )
}
