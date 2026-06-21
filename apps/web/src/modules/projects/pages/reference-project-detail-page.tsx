import { Link, useParams } from 'react-router-dom'
import { RiExternalLinkLine, RiNewspaperLine, RiShieldCheckLine } from '@remixicon/react'
import { motion } from 'framer-motion'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { ProjectPricePanel } from '../../market/components/project-price-panel'
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

  const isSafe = project.status === 'safe' || project.status === 'reference'

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-[1fr_340px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <section className="space-y-6">
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
          </div>
        </div>

        <ProjectPricePanel slug={project.slug} />

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Review thesis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Crypto Watcher authorities reviewed {project.name} based on smart-contract
              audits, team transparency, liquidity depth, and historical incident record.
              Safety index reflects our POA panel consensus — not financial advice.
            </p>
            <p>
              Reviewed by: <span className="font-semibold text-foreground">Crypto Watcher POA Panel</span>
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Official site
                <RiExternalLinkLine className="h-4 w-4" />
              </a>
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                CoinMarketCap
                <RiExternalLinkLine className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RiNewspaperLine className="h-4 w-4 text-primary" />
              News & updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Latest market coverage for {project.name} is aggregated from public sources.
              Check CoinMarketCap and official channels for real-time updates.
            </p>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <a href={project.sourceUrl} target="_blank" rel="noreferrer">
                View on CoinMarketCap
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Want to discuss {project.name}? Comments with a small anti-spam fee are available
            on community-reviewed projects with deployed voting contracts.{' '}
            <Link to="/app" className="font-semibold text-primary hover:underline">
              Browse on-chain projects
            </Link>
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
            <div className="mb-2 text-4xl font-bold text-primary">{project.score}%</div>
            <div className="mb-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                style={{ width: `${project.score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage indicating how safe our authority panel considers this project.
            </p>
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
