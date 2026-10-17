import { RiLineChartLine } from '@remixicon/react'
import { CacheRefreshStatus } from '../../../components/cache-refresh-status'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '../../../components/ui'
import { useMarketPrice } from '../hooks/use-market-price'
import { MarketUnavailableError } from '../lib/market-errors'
import { changeTone, formatPercentChange, formatUsd } from '../lib/format-price'
import { PriceChart } from './price-chart'

function ChangeBadge({ label, value }: { label: string; value: number | null }) {
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

export function ProjectPricePanel({ slug }: { slug: string }) {
  const { data, isLoading, isFetching, error, refetch } = useMarketPrice(slug)
  const refreshing = Boolean(data && isFetching)
  const unavailable = error instanceof MarketUnavailableError

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiLineChartLine className="h-4 w-4 text-primary" />
          Price movement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        {isLoading && !data ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : data ? (
          <>
            <div>
              <p className="text-3xl font-bold">{formatUsd(data.price)}</p>
              <div className="mt-1">
                <CacheRefreshStatus
                  cachedAt={data.cachedAt}
                  expiresAt={data.expiresAt}
                  refreshing={refreshing}
                  savedLabel="showing last saved prices"
                  refreshingLabel="Refreshing saved prices"
                  onRefresh={() => {
                    void refetch()
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ChangeBadge label="24h" value={data.change24h} />
              <ChangeBadge label="7d" value={data.change7d} />
              <ChangeBadge label="1m" value={data.change1m} />
              <ChangeBadge label="1y" value={data.change1y} />
            </div>
          </>
        ) : unavailable ? (
          <p className="text-sm text-muted-foreground">
            {error.message} Safety reviews for network layers without a native token are still
            available above.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Unable to load price data right now. A saved snapshot from the last week is shown when
            one exists; otherwise try again later.
          </p>
        )}
      </CardContent>

      {data ? (
        <PriceChart history={data.history} layout="panel" defaultRange="1y" />
      ) : null}
    </Card>
  )
}
