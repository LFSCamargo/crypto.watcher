import { useMarketCacheWorker } from '../hooks/use-market-cache-worker'

function marketLabel(slug: string) {
  return slug
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function MarketList({ label, slugs }: { label: string; slugs: readonly string[] }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul
        aria-label={label}
        className="mt-1 max-h-24 space-y-0.5 overflow-y-auto text-xs text-foreground"
      >
        {slugs.length === 0 ? (
          <li className="text-muted-foreground">None</li>
        ) : (
          slugs.map((slug) => <li key={slug}>{marketLabel(slug)}</li>)
        )}
      </ul>
    </div>
  )
}

/** Schedules the background market warmup once, on the first render of the shell. */
export function MarketCacheWarmup({
  slugs,
  showProgress = import.meta.env.DEV,
}: {
  slugs: readonly string[]
  /** The loading card is a development aid. Production keeps the worker silent. */
  showProgress?: boolean
}) {
  const progress = useMarketCacheWorker(slugs)
  const finished = progress.phase === 'done' && progress.remaining.length === 0
  if (!showProgress || progress.phase === 'idle' || progress.total === 0 || finished) return null

  const percent = Math.round((progress.saved.length / progress.total) * 100)

  return (
    <section
      aria-label="Background market loading"
      className="glass-nav fixed bottom-24 left-4 right-4 z-30 rounded-2xl p-3 shadow-lg lg:bottom-6 lg:left-auto lg:right-6 lg:w-96"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <p className="font-medium">Saving market prices</p>
        <p className="tabular-nums text-muted-foreground">
          {progress.saved.length} of {progress.total}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Market prices saved locally"
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.saved.length}
        aria-valuetext={`${progress.saved.length} of ${progress.total} saved`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 flex gap-3">
        <MarketList label="Saved" slugs={progress.saved} />
        <MarketList label="Still loading" slugs={progress.remaining} />
      </div>
    </section>
  )
}
