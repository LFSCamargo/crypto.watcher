import { RiLineChartLine, RiRefreshLine } from '@remixicon/react'
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
  const { data, isLoading, isError, error } = useMarketPrice(slug)
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
        {isLoading ? (
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
        ) : unavailable ? (
          <p className="text-sm text-muted-foreground">
            {error.message} Safety reviews for network layers without a native token are still
            available above.
          </p>
        ) : isError || !data ? (
          <p className="text-sm text-muted-foreground">
            Unable to load price data right now. Try again in a few minutes — history is cached for
            3 hours once fetched.
          </p>
        ) : (
          <>
            <div>
              <p className="text-3xl font-bold">{formatUsd(data.price)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <RiRefreshLine className="h-3.5 w-3.5" />
                Updated {new Date(data.cachedAt).toLocaleString()} · refreshes every 3 hours
                {data.stale ? ' · showing last saved prices' : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ChangeBadge label="24h" value={data.change24h} />
              <ChangeBadge label="7d" value={data.change7d} />
              <ChangeBadge label="1m" value={data.change1m} />
              <ChangeBadge label="1y" value={data.change1y} />
            </div>
          </>
        )}
      </CardContent>

      {!isLoading && data ? (
        <PriceChart history={data.history} layout="panel" defaultRange="1y" />
      ) : null}
    </Card>
  )
}
