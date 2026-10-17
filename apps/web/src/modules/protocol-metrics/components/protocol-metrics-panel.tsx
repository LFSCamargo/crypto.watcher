import { RiAlertLine, RiBarChartGroupedLine, RiShieldCheckLine } from '@remixicon/react'
import { CacheRefreshStatus } from '../../../components/cache-refresh-status'
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { useProtocolMetrics } from '../hooks/use-protocol-metrics'
import { ProtocolMetricsUnavailableError } from '../lib/protocol-metrics-errors'
import {
  changeTone,
  formatCompactUsd,
  formatPercentChange,
  formatShortDate,
} from '../lib/format-metrics'
import type { ProtocolMetricsSnapshot } from '../lib/protocol-metrics.types'
import { BreakdownBarChart } from './breakdown-bar-chart'
import { METRIC_CHART_RANGE_OPTIONS } from '../lib/metric-chart-range'
import { MetricHistoryChart } from './metric-history-chart'
import { ProtocolValuationSection } from './protocol-valuation-section'

function MetricBadge({ label, value }: { label: string; value: number | null }) {
  const tone = changeTone(value)
  const variant =
    tone === 'positive' ? 'success' : tone === 'negative' ? 'destructive' : 'secondary'

  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Badge variant={variant} className="mt-1 rounded-full px-2 py-0.5 text-xs">
        {formatPercentChange(value)}
      </Badge>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function ProtocolMetricsContent({
  data,
  refreshing,
  onRefresh,
}: {
  data: ProtocolMetricsSnapshot
  refreshing: boolean
  onRefresh: () => void
}) {
  const isChain = data.entityType === 'chain'
  const isStablecoin = data.entityType === 'stablecoin'
  const isProtocol = data.entityType === 'protocol'
  const showChainBreakdown = data.chainBreakdown.length > 0
  const showTokenComposition = data.tokenComposition.length > 0
  const metricLabel = isStablecoin
    ? 'Circulating supply'
    : isChain
      ? 'DeFi TVL on network'
      : 'Total value locked'
  const changePrefix = isStablecoin ? 'Supply' : 'TVL'
  const historyTitle = isStablecoin ? 'Circulating supply history' : 'TVL history'
  const chainBreakdownTitle = isStablecoin ? 'Supply by chain' : 'TVL by chain'
  const hasRevenue =
    data.revenue24h != null ||
    data.revenue7d != null ||
    data.revenue30d != null ||
    data.revenueHistory.length >= 2
  const showFinancials =
    !isStablecoin &&
    (data.fees24h != null ||
      data.fees7d != null ||
      data.fees30d != null ||
      hasRevenue ||
      data.dexVolume24h != null ||
      data.dexVolume7d != null ||
      data.dexVolume30d != null)
  const revenueLabel = isChain ? 'Network revenue' : 'Revenue'

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-bold">{formatCompactUsd(data.tvl)}</p>
          <p className="text-sm text-muted-foreground">{metricLabel}</p>
          {data.mcap != null ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {isChain ? 'Network mcap' : 'Market cap'} {formatCompactUsd(data.mcap)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.category ? <Badge variant="secondary">{data.category}</Badge> : null}
          {data.chains.length > 0 ? (
            <Badge variant="outline">
              {data.chains.length} chain{data.chains.length === 1 ? '' : 's'}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricBadge label={`${changePrefix} 24h`} value={data.tvlChange24h} />
        <MetricBadge label={`${changePrefix} 7d`} value={data.tvlChange7d} />
        <MetricBadge label={`${changePrefix} 30d`} value={data.tvlChange30d} />
      </div>

      <MetricHistoryChart
        title={historyTitle}
        history={data.tvlHistory}
        valueKey="tvl"
        rangeOptions={METRIC_CHART_RANGE_OPTIONS}
      />

      {showChainBreakdown || showTokenComposition ? (
        <div
          className={cn(
            'grid gap-4',
            showChainBreakdown && showTokenComposition && 'lg:grid-cols-2',
          )}
        >
          {showChainBreakdown ? (
            <BreakdownBarChart
              title={chainBreakdownTitle}
              items={data.chainBreakdown.map((item) => ({
                key: item.chain,
                label: item.chain,
                value: item.tvl,
                share: item.share,
              }))}
              formatValue={formatCompactUsd}
              iconVariant="chain"
              wide={!showTokenComposition}
            />
          ) : null}
          {showTokenComposition ? (
            <BreakdownBarChart
              title="TVL token composition"
              items={data.tokenComposition.map((item) => ({
                key: item.symbol,
                label: item.symbol,
                value: item.usd,
                share: item.share,
              }))}
              formatValue={formatCompactUsd}
              iconVariant="token"
              wide={!showChainBreakdown}
            />
          ) : null}
        </div>
      ) : null}

      {showFinancials ? (
        <div>
          <p className="mb-2 text-sm font-medium">Financial activity</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.dexVolume24h != null ? (
              <StatCell
                label="DEX volume 24h"
                value={formatCompactUsd(data.dexVolume24h)}
              />
            ) : null}
            {data.dexVolume7d != null ? (
              <StatCell
                label="DEX volume 7d"
                value={formatCompactUsd(data.dexVolume7d)}
              />
            ) : null}
            {data.dexVolume30d != null ? (
              <StatCell
                label="DEX volume 30d"
                value={formatCompactUsd(data.dexVolume30d)}
              />
            ) : null}
            <StatCell label="Fees 24h" value={formatCompactUsd(data.fees24h)} />
            <StatCell label="Fees 7d" value={formatCompactUsd(data.fees7d)} />
            <StatCell label="Fees 30d" value={formatCompactUsd(data.fees30d)} />
            {hasRevenue ? (
              <>
                <StatCell
                  label={`${revenueLabel} 24h`}
                  value={formatCompactUsd(data.revenue24h)}
                />
                <StatCell
                  label={`${revenueLabel} 7d`}
                  value={formatCompactUsd(data.revenue7d)}
                />
                <StatCell
                  label={`${revenueLabel} 30d`}
                  value={formatCompactUsd(data.revenue30d)}
                />
              </>
            ) : null}
          </div>
          {data.dexVolumeChange1d != null ? (
            <p className="mt-2 text-xs text-muted-foreground">
              DEX volume {formatPercentChange(data.dexVolumeChange1d)} vs prior day
            </p>
          ) : null}
          {data.feesChange1d != null ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Daily fees {formatPercentChange(data.feesChange1d)} vs prior day
            </p>
          ) : null}
        </div>
      ) : null}

      <ProtocolValuationSection data={data} />

      {data.dexVolumeHistory.length >= 2 ? (
        <MetricHistoryChart title="DEX volume" history={data.dexVolumeHistory} />
      ) : null}

      {data.feesHistory.length >= 2 ? (
        <MetricHistoryChart title="Daily fees" history={data.feesHistory} />
      ) : null}

      {data.revenueHistory.length >= 2 ? (
        <MetricHistoryChart
          title={isChain ? 'Daily network revenue' : 'Daily revenue'}
          history={data.revenueHistory}
        />
      ) : null}

      {isProtocol ? (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="mb-2 flex items-center gap-2">
            {data.exploitCount > 0 ? (
              <RiAlertLine className="h-4 w-4 text-destructive" />
            ) : (
              <RiShieldCheckLine className="h-4 w-4 text-primary" />
            )}
            <p className="text-sm font-medium">Security incidents</p>
          </div>
          {data.exploitCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reported exploit incidents for this protocol.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {data.exploitCount} incident{data.exploitCount === 1 ? '' : 's'}
                {data.totalExploitLossUsd != null
                  ? ` · ${formatCompactUsd(data.totalExploitLossUsd)} reported loss`
                  : ''}
              </p>
              <ul className="space-y-1 text-muted-foreground">
                {data.exploits.slice(0, 3).map((exploit) => (
                  <li key={`${exploit.date}-${exploit.name}`}>
                    · {formatShortDate(exploit.date)} — {exploit.name}
                    {exploit.amountUsd != null
                      ? ` (${formatCompactUsd(exploit.amountUsd)})`
                      : ''}
                    {exploit.returnedFunds != null && exploit.returnedFunds > 0
                      ? ' · funds returned'
                      : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      <CacheRefreshStatus
        cachedAt={data.cachedAt}
        expiresAt={data.expiresAt}
        refreshing={refreshing}
        savedLabel="showing last saved data"
        refreshingLabel="Refreshing saved data"
        onRefresh={onRefresh}
      />
    </>
  )
}

export function ProtocolMetricsPanel({ slug }: { slug: string }) {
  const { data, isLoading, isFetching, error, refetch } = useProtocolMetrics(slug)
  const refreshing = Boolean(data && isFetching)
  const unavailable = error instanceof ProtocolMetricsUnavailableError
  const panelTitle =
    data?.entityType === 'chain'
      ? 'On-chain DeFi activity'
      : data?.entityType === 'stablecoin'
        ? 'Stablecoin fundamentals'
        : 'Protocol fundamentals'

  if (!data && unavailable) {
    return null
  }

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiBarChartGroupedLine className="h-4 w-4 text-primary" />
          {isLoading && !data ? 'Protocol fundamentals' : panelTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pb-4">
        {isLoading && !data ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : data ? (
          <ProtocolMetricsContent
            data={data}
            refreshing={refreshing}
            onRefresh={() => {
              void refetch()
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Unable to load protocol metrics right now. A saved snapshot from the last week
            is shown when one exists; otherwise try again later.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
