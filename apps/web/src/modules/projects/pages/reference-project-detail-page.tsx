import { Link, useParams } from 'react-router-dom'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import { curatedProjects } from '../lib/curated-projects'
import { ReferenceProjectVotingCTA } from '../components/reference-project-voting-cta'

/**
 * Detail page for curated/reference assets used in the safety index.
 */
export function ReferenceProjectDetailPage() {
  const { slug } = useParams()
  const referenceProject = curatedProjects.find((project) => project.slug === slug)

  if (!referenceProject) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Reference project not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app">Back to safety index</Link>
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
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={referenceProject.status === 'reference' ? 'success' : 'warning'}>
              Rank #{referenceProject.rank}
            </Badge>
            <Badge variant="secondary">{referenceProject.network}</Badge>
          </div>
          <h1 className="heading-2 mb-2">
            {referenceProject.name}{' '}
            <span className="text-muted-foreground">{referenceProject.symbol}</span>
          </h1>
          <p className="body-large">{referenceProject.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Why this appears in the safety index</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              This asset is included as a recognizable market reference so security
              auditors and users can benchmark project risk decisions against widely
              tracked assets.
            </p>
            <p>
              External source data:
              <a
                href={referenceProject.sourceUrl}
                className="ml-1 inline-flex items-center gap-1 text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                CoinMarketCap
                <ArrowSquareOut size={14} />
              </a>
            </p>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reference safety score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-2 w-36 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-yellow-400 transition-all"
                  style={{ width: `${referenceProject.score}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-primary">
                {referenceProject.score}/100
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Reference score is informational and does not replace your own due diligence.
            </p>
          </CardContent>
        </Card>

        <ReferenceProjectVotingCTA slug={referenceProject.slug} />
      </aside>
    </motion.div>
  )
}
