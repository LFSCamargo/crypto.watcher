import { RiAlertLine, RiCheckboxCircleLine, RiShieldCheckLine } from '@remixicon/react'
import { Badge, Skeleton } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { getCuratedProject, projectCategories } from '../../projects/lib/curated-projects'
import {
  getProjectReviewProfile,
  getVerdictLabel,
} from '../../projects/lib/curated-project-reviews'
import { useProtocolMetrics } from '../../protocol-metrics/hooks/use-protocol-metrics'
import {
  formatCompactUsd,
  formatPercentChange,
} from '../../protocol-metrics/lib/format-metrics'
import type {
  CompositeComponent,
  ProtocolMetricsSnapshot,
} from '../../protocol-metrics/lib/protocol-metrics.types'

const componentLabels: Record<CompositeComponent, string> = {
  fundamentals: 'Fundamentals (revenue capture, growth)',
  security: 'Security (exploit history)',
  governance: 'Governance (chain spread)',
  value: 'Value (revenue vs TVL)',
  feeSustainability: 'Fee sustainability',
}

function LiveMetrics({ metrics }: { metrics: ProtocolMetricsSnapshot }) {
  const facts = [
    {
      label: 'Total value locked',
      value: metrics.tvl,
      change: metrics.tvlChange7d,
    },
    { label: 'Fees (30d)', value: metrics.fees30d },
    { label: 'DEX volume (30d)', value: metrics.dexVolume30d },
    { label: 'Revenue (30d)', value: metrics.revenue30d },
  ].filter((fact) => fact.value != null)

  return (
    <div role="group" aria-label="Live protocol data" className="space-y-3">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-[11px] text-muted-foreground">{fact.label}</dt>
            <dd className="text-sm font-bold tabular-nums">
              {formatCompactUsd(fact.value)}
              {'change' in fact && fact.change != null ? (
                <span className="ml-1 text-[11px] font-semibold text-muted-foreground">
                  {formatPercentChange(fact.change)} 7d
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
      <p
        className={cn(
          'flex items-center gap-1.5 text-xs font-semibold',
          metrics.exploitCount > 0 ? 'text-warning-strong' : 'text-success-strong',
        )}
      >
        {metrics.exploitCount > 0 ? (
          <>
            <RiAlertLine className="h-3.5 w-3.5" aria-hidden />
            {metrics.exploitCount} recorded exploit{metrics.exploitCount === 1 ? '' : 's'}
            {metrics.totalExploitLossUsd != null
              ? ` · ${formatCompactUsd(metrics.totalExploitLossUsd)} lost`
              : null}
          </>
        ) : (
          <>
            <RiShieldCheckLine className="h-3.5 w-3.5" aria-hidden />
            No recorded exploits
          </>
        )}
      </p>
    </div>
  )
}

function CompositeBreakdown({ metrics }: { metrics: ProtocolMetricsSnapshot }) {
  const valuation = metrics.valuation
  if (!valuation || valuation.compositeBreakdown.length === 0) return null

  return (
    <div className="space-y-2 border-t border-foreground/10 pt-3">
      <p className="text-xs font-bold">How the fundamentals compound</p>
      <ul aria-label="Composite breakdown" className="space-y-1.5">
        {valuation.compositeBreakdown.map((entry) => (
          <li key={entry.component} className="text-[11px]">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                {componentLabels[entry.component]}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">
                {entry.score == null ? (
                  'No data'
                ) : (
                  <>
                    {Math.round(entry.score)} × {Math.round(entry.share * 100)}%
                  </>
                )}
              </span>
            </div>
            <div aria-hidden className="mt-0.5 h-1 rounded-full bg-foreground/10">
              <div
                className="h-full origin-left animate-bar-fill rounded-full bg-chart-2 motion-reduce:animate-none"
                style={{ width: `${entry.score ?? 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {valuation.compositeScore != null ? (
        <p className="text-xs font-bold tabular-nums">
          Composite {Math.round(valuation.compositeScore)}/100
        </p>
      ) : null}
      <p className="text-[10px] leading-snug text-muted-foreground">
        {valuation.methodologyVersion} market fundamentals from live DefiLlama data —
        separate from the reference index above.
      </p>
    </div>
  )
}

export function RadarAssetPreview({ slug }: { slug: string }) {
  const project = getCuratedProject(slug)
  const metrics = useProtocolMetrics(slug)
  if (!project) return null
  const profile = getProjectReviewProfile(project)

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-start gap-3">
        <img
          src={`/icons/${project.slug}.png`}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold leading-tight">{project.name}</h3>
          <p className="text-xs text-muted-foreground">
            {project.symbol} · {projectCategories[project.category]} · {project.network}
          </p>
        </div>
        <Badge variant="outline">{profile.creditRating.sp}</Badge>
      </div>

      <div
        role="group"
        aria-label="Reference index"
        className="flex items-center gap-2 rounded-2xl bg-foreground/5 px-3 py-2"
      >
        <span className="text-2xl font-bold tabular-nums">{project.score}</span>
        <span className="text-xs text-muted-foreground">/ 100 reference index</span>
        <Badge variant="success" className="ml-auto">
          {getVerdictLabel(profile.verdict)}
        </Badge>
      </div>

      {metrics.isPending ? (
        <div className="space-y-2" aria-label="Loading live protocol data">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : metrics.isError ? (
        <p className="text-xs text-muted-foreground">
          Live protocol data is unavailable right now.
        </p>
      ) : (
        <>
          <LiveMetrics metrics={metrics.data} />
          <CompositeBreakdown metrics={metrics.data} />
        </>
      )}

      <ul className="space-y-1.5 border-t border-foreground/10 pt-3 text-[11px]">
        <li className="flex gap-1.5">
          <RiCheckboxCircleLine
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-strong"
            aria-hidden
          />
          <span className="line-clamp-2">{profile.strengths[0]}</span>
        </li>
        <li className="flex gap-1.5">
          <RiAlertLine
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-strong"
            aria-hidden
          />
          <span className="line-clamp-2">{profile.risks[0]}</span>
        </li>
      </ul>
      <p className="text-[11px] font-semibold text-tone-sky-strong">
        Click the coin to open the full assessment
      </p>
    </div>
  )
}
