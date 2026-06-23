import { Link, useParams } from 'react-router-dom'
import { RiExternalLinkLine, RiShieldCheckLine } from '@remixicon/react'
import { motion } from 'framer-motion'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { ProjectPricePanel } from '../../market/components/project-price-panel'
import { ProtocolMetricsPanel } from '../../protocol-metrics/components/protocol-metrics-panel'
import { ProjectDetailBackButton } from '../components/project-detail-back-button'
import { ProjectReviewDetail } from '../components/project-review-detail'
import { getProjectReviewProfile, getVerdictLabel } from '../lib/curated-project-reviews'
import { getCuratedProject, projectCategories } from '../lib/curated-projects'

const partnerLinks = [
  { name: 'Uniswap', url: 'https://app.uniswap.org' },
  { name: 'Coinbase', url: 'https://www.coinbase.com' },
]

export function ReferenceProjectDetailPage() {
  const { slug } = useParams()
  const project = slug ? getCuratedProject(slug) : undefined

  if (!project) {
    return (
      <Card className="rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/app">Back to Safe Projects</Link>
        </Button>
      </Card>
    )
  }

  const review = getProjectReviewProfile(project)
  const isSafe = project.status === 'safe' || project.status === 'reference'

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-[1fr_340px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <section className="space-y-6">
        <ProjectDetailBackButton label="Back to Safe Projects" />

        <div className="flex items-start gap-4">
          <ProjectIcon
            symbol={project.symbol}
            name={project.name}
            slug={project.slug}
            className="h-16 w-16 shrink-0"
            textClassName="text-lg"
          />
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={isSafe ? 'success' : 'warning'}>
                {isSafe ? 'Reviewed safe' : 'Under watch'}
              </Badge>
              <Badge variant="secondary">{projectCategories[project.category]}</Badge>
              <Badge variant="outline">{project.network}</Badge>
            </div>
            <h1 className="heading-2">{project.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                Official site
                <RiExternalLinkLine className="h-4 w-4" />
              </a>
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                CoinMarketCap
                <RiExternalLinkLine className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <ProjectPricePanel slug={project.slug} />
        <ProtocolMetricsPanel slug={project.slug} />
        <ProjectReviewDetail profile={review} />

        <Card className="rounded-2xl">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Disagree with our assessment or have new evidence?{' '}
            <Link to="/app/analysis-request" className="font-semibold text-primary hover:underline">
              Submit evidence
            </Link>{' '}
            or discuss on expert-reviewed on-chain project pages.
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RiShieldCheckLine className="h-4 w-4 text-primary" />
              Safety index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-1 text-4xl font-bold text-primary">{project.score}%</div>
            <p className="mb-4 text-sm font-medium text-foreground">
              {getVerdictLabel(review.verdict)}
            </p>
            <div className="mb-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500"
                style={{ width: `${project.score}%` }}
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Expert council score synthesizing audit coverage, operational history, liquidity
              and category-specific risks. Not financial advice.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Audit coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              {review.externalReviews.length
                ? `${review.externalReviews.length} specific security or finance report indexed.`
                : 'No specific public audit or attestation report indexed yet.'}
            </p>
            {review.externalReviews.length > 0 && (
              <ul className="space-y-1">
                {review.externalReviews.slice(0, 3).map((item) => (
                  <li key={item.title} className="truncate">
                    · {item.provider} — {item.completedAt}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {isSafe && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Recommended to trade on</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {partnerLinks.map((partner) => (
                <Button
                  key={partner.name}
                  asChild
                  variant="outline"
                  className="w-full justify-start rounded-full"
                >
                  <a href={partner.url} target="_blank" rel="noreferrer">
                    {partner.name}
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </aside>
    </motion.div>
  )
}
