import { useEffect, useState } from 'react'
import { RiRefreshLine } from '@remixicon/react'
import { cn } from '../lib/utils'
import { Button } from './ui'

function windowOpen(expiresAt: string, now: number) {
  const expires = Date.parse(expiresAt)
  return Number.isFinite(expires) && now >= expires
}

export function CacheRefreshStatus({
  cachedAt,
  expiresAt,
  refreshing,
  savedLabel,
  refreshingLabel,
  onRefresh,
}: {
  cachedAt: string
  expiresAt: string
  refreshing: boolean
  savedLabel: string
  refreshingLabel: string
  onRefresh: () => void
}) {
  const [now, setNow] = useState(() => Date.now())
  const ready = windowOpen(expiresAt, now)

  useEffect(() => {
    const expires = Date.parse(expiresAt)
    if (!Number.isFinite(expires) || expires <= Date.now()) return
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, expires - Date.now()))
    return () => window.clearTimeout(timer)
  }, [expiresAt])

  const detail = refreshing
    ? refreshingLabel
    : ready
      ? savedLabel
      : `refresh available ${new Date(expiresAt).toLocaleString()}`

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="flex items-center gap-1 text-xs text-muted-foreground" role="status">
        <RiRefreshLine
          className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')}
          aria-hidden
        />
        {refreshing ? detail : `Updated ${new Date(cachedAt).toLocaleString()} · ${detail}`}
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!ready || refreshing}
        onClick={() => {
          if (!ready || refreshing) return
          onRefresh()
        }}
      >
        Refresh
      </Button>
    </div>
  )
}
