import { useQuery } from '@tanstack/react-query'
import { marketApi } from '../api/market.api'
import { readLocalMarketCache } from '../lib/market-local-cache'
import { MARKET_RETENTION_MS, MARKET_STALE_TIME_MS } from '../lib/market.types'

function savedSnapshot(slug: string | undefined) {
  if (!slug) return undefined
  return readLocalMarketCache(slug) ?? undefined
}

export function useMarketPrice(slug: string | undefined, options?: { fetch?: boolean }) {
  const fetch = options?.fetch ?? true
  const cached = savedSnapshot(slug)

  return useQuery({
    queryKey: ['market', slug],
    queryFn: () => marketApi.project(slug ?? ''),
    enabled: Boolean(slug) && fetch,
    staleTime: MARKET_STALE_TIME_MS,
    gcTime: MARKET_RETENTION_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: (query) => {
      const updatedAt = query.state.dataUpdatedAt
      if (!updatedAt) return MARKET_STALE_TIME_MS
      const remaining = MARKET_STALE_TIME_MS - (Date.now() - updatedAt)
      return remaining > 0 ? remaining : MARKET_STALE_TIME_MS
    },
    retry: false,
    initialData: cached,
    initialDataUpdatedAt: cached ? Date.parse(cached.cachedAt) : undefined,
    placeholderData: cached,
  })
}
