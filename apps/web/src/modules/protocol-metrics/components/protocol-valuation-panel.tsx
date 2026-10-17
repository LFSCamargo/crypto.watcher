import { RiFundsLine } from '@remixicon/react'
import { Badge } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { BITCOIN_RESERVE_METHODOLOGY } from '../lib/bitcoin-reserve-valuation'
import type { CompositeComponent, ProtocolValuation } from '../lib/protocol-metrics.types'
import { formatCompactUsd, formatPercentChange } from '../lib/format-metrics'

const RESERVE_SCORE_LABELS: Partial<Record<CompositeComponent, string>> = {
  securityBudget: 'Security budget',
  dilution: 'Dilution',
  settlement: 'Settlement',
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  if (score == null) return null

  const tone =
    score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-destructive'

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{Math.round(score)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

function formatRatio(value: number | null, suffix = 'x'): string {
  if (value == null || !Number.isFinite(value)) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M${suffix}`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K${suffix}`
  return `${value.toFixed(1)}${suffix}`
}

function formatPercent(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(1)}%`
}

export function ProtocolValuationPanel({
  valuation,
  entityType = 'protocol',
}: {
  valuation: ProtocolValuation
  entityType?: 'protocol' | 'chain' | 'stablecoin'
}) {
  const isReserve = valuation.methodologyVersion === BITCOIN_RESERVE_METHODOLOGY
  const isChain = entityType === 'chain'
  const title = isReserve
    ? 'Reserve valuation'
    : isChain
      ? 'Network fee valuation'
      : 'On-chain valuation model'
  const hasScores =
    valuation.compositeScore != null ||
    valuation.feeSustainabilityScore != null ||
    valuation.governanceQualityScore != null ||
    valuation.securityScore != null ||
    valuation.compositeBreakdown.some((entry) => entry.score != null)

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RiFundsLine className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">{title}</p>
        </div>
        {valuation.compositeScore != null ? (
          <Badge variant="secondary" className="rounded-full tabular-nums">
            Composite {Math.round(valuation.compositeScore)}/100
          </Badge>
        ) : null}
      </div>

      {isReserve ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Bitcoin is scored as a reserve from the security budget (fees over market
          cap), dilution (new coins over supply), and settlement (market cap over
          on-chain transfer volume). Fee / TVL, revenue / TVL, and P/S stay on screen
          and are not part of the reserve score.
        </p>
      ) : isChain ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Network-wide fees paid on this chain
          {valuation.revenueAnnualizedUsd != null
            ? " and the share captured as revenue (validators / the protocol). This is not a single dapp's P&L."
            : " — not a single protocol's revenue."}{' '}
          Price-to-sales uses the network token’s market cap. Governance
          diversification is a protocol measure and is not part of the network score.
        </p>
      ) : null}

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <MetricRow
          label={isChain ? 'Network fees (annualized)' : 'Fees (annualized)'}
          value={formatCompactUsd(valuation.feesAnnualizedUsd)}
        />
        {valuation.revenueAnnualizedUsd != null ? (
          <>
            <MetricRow
              label={isChain ? 'Network revenue (annualized)' : 'Revenue (annualized)'}
              value={formatCompactUsd(valuation.revenueAnnualizedUsd)}
            />
            <MetricRow
              label={isChain ? 'Network revenue capture' : 'Revenue capture'}
              value={formatPercent(valuation.revenueCaptureRate)}
            />
            <MetricRow
              label={isChain ? 'Network revenue growth (30d)' : 'Revenue growth (30d)'}
              value={formatPercentChange(valuation.revenueGrowth30d)}
            />
            <MetricRow
              label={isChain ? 'Network revenue growth (1y)' : 'Revenue growth (1y)'}
              value={formatPercentChange(valuation.revenueGrowth1y)}
            />
            <MetricRow
              label="Revenue / TVL"
              value={formatPercent(valuation.revenueToTvlRatio)}
            />
          </>
        ) : null}
        <MetricRow label="P/S ratio" value={formatRatio(valuation.priceToSalesRatio)} />
        <MetricRow label="Fee / TVL" value={formatPercent(valuation.feeToTvlRatio)} />
      </div>

      {hasScores ? (
        <div className="space-y-3 border-t border-border/60 pt-3">
          {isReserve
            ? valuation.compositeBreakdown.map((entry) => (
                <ScoreBar
                  key={entry.component}
                  label={RESERVE_SCORE_LABELS[entry.component] ?? entry.component}
                  score={entry.score}
                />
              ))
            : (
                <>
                  <ScoreBar
                    label="Fee sustainability"
                    score={valuation.feeSustainabilityScore}
                  />
                  <ScoreBar
                    label="Governance quality"
                    score={valuation.governanceQualityScore}
                  />
                  <ScoreBar label="Security" score={valuation.securityScore} />
                </>
              )}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground">
        Model {valuation.methodologyVersion} · ratios use SafeMath guards (no
        divide-by-zero).
        {!isChain && !isReserve
          ? ' Governance is a diversification proxy until on-chain governance signals ship.'
          : null}
      </p>
    </div>
  )
}
