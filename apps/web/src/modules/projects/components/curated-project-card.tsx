import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightUpLine, RiShieldCheckLine } from '@remixicon/react'
import { motion } from 'framer-motion'
import type { CuratedProject } from '../lib/curated-projects'
import { projectCategories } from '../lib/curated-projects'
import { Badge, Skeleton } from '../../../components/ui'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { useMarketPrice } from '../../market/hooks/use-market-price'
import { changeTone, formatPercentChange, formatUsd } from '../../market/lib/format-price'
import { MiniSparkline } from '../../market/components/mini-sparkline'
import { PriceChart } from '../../market/components/price-chart'

function scoreTone(score: number) {
  if (score >= 85) return 'success' as const
  if (score >= 70) return 'warning' as const
  return 'destructive' as const
}

function statusLabel(status: CuratedProject['status']) {
  switch (status) {
    case 'safe':
      return 'Reviewed safe'
    case 'reference':
      return 'Reference'
    case 'watch':
      return 'Under watch'
  }
}

function statusVariant(status: CuratedProject['status']) {
  switch (status) {
    case 'safe':
      return 'success' as const
    case 'reference':
      return 'secondary' as const
    case 'watch':
      return 'warning' as const
  }
}

function MarketChangeChip({
  label,
  value,
}: {
  label: string
  value: number | null | undefined
}) {
  const tone = changeTone(value ?? null)

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 px-2.5 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 text-xs font-bold tabular-nums ${
          tone === 'positive'
            ? 'text-success'
            : tone === 'negative'
              ? 'text-destructive'
              : 'text-muted-foreground'
        }`}
      >
        {formatPercentChange(value ?? null)}
      </p>
    </div>
  )
}

export function CuratedProjectCard({
  index,
  project,
  richChart = false,
  /** Start fetching market data immediately (above-the-fold cards on the landing page). */
  fetchImmediately = false,
}: {
  index: number
  project: CuratedProject
  /** Use the full interactive PriceChart (good for landing hero with few cards). Default is cheap mini sparkline for dense grids. */
  richChart?: boolean
  fetchImmediately?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(fetchImmediately)

  // Only fetch market data (and thus render any chart) when the card is near the viewport.
  // This prevents firing 50-100 simultaneous CoinGecko calls when loading /app.
  useEffect(() => {
    if (fetchImmediately) return

    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchImmediately])

  const { data, isLoading } = useMarketPrice(isVisible ? project.slug : undefined)
  const marketPending = !isVisible || isLoading
  const tone = scoreTone(project.score)

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.25) }}
    >
      <Link
        to={`/app/reference/${project.slug}`}
        className="group card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
        aria-busy={marketPending}
      >
        <div className="flex flex-1 flex-col gap-3 p-4 pb-3">
          <div className="flex items-start gap-3">
            <ProjectIcon
              symbol={project.symbol}
              name={project.name}
              slug={project.slug}
              className="h-11 w-11 shrink-0"
              textClassName="text-[10px]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold leading-tight">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.symbol} · Rank #{project.rank}
                  </p>
                </div>
                <Badge
                  variant={tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'destructive'}
                  className="shrink-0 rounded-full"
                >
                  {project.score}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {projectCategories[project.category]}
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">
              {project.network}
            </Badge>
            <Badge variant={statusVariant(project.status)} className="rounded-full text-[10px]">
              {statusLabel(project.status)}
            </Badge>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
            {marketPending ? (
              <div className="space-y-2" aria-label="Loading market data">
                <Skeleton className="h-3 w-10 rounded" />
                <Skeleton className="h-7 w-28 rounded-md" />
                <div className="grid grid-cols-4 gap-2">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              </div>
            ) : data ? (
              <>
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Price
                  </p>
                  <p className="text-lg font-bold tabular-nums">{formatUsd(data.price)}</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <MarketChangeChip label="24h" value={data.change24h} />
                  <MarketChangeChip label="7d" value={data.change7d} />
                  <MarketChangeChip label="1m" value={data.change1m} />
                  <MarketChangeChip label="1y" value={data.change1y} />
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Live price data unavailable (may be rate limited or not indexed)
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <RiShieldCheckLine className="h-3.5 w-3.5 text-primary" />
              Expert safety review
            </span>
            <span className="flex items-center gap-1 font-semibold text-foreground/70 transition-colors group-hover:text-foreground">
              View review
              <RiArrowRightUpLine className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {marketPending ? (
          <Skeleton
            className={`w-full rounded-none ${richChart ? 'h-20' : 'h-10'}`}
            aria-hidden
          />
        ) : data ? (
          richChart ? (
            <PriceChart
              history={data.history}
              variant="compact"
              className="border-t border-border/60"
              defaultRange="1y"
              showRangeSelector={false}
            />
          ) : (
            <div className="border-t border-border/60 bg-muted/5 px-3 py-1.5">
              <MiniSparkline history={data.history} maxPoints={40} />
            </div>
          )
        ) : null}
      </Link>
    </motion.div>
  )
}
