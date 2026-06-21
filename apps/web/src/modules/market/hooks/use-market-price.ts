import { useQuery } from '@tanstack/react-query'
import { marketApi } from '../api/market.api'
import { MARKET_STALE_TIME_MS } from '../lib/market.types'

export function useMarketPrice(slug: string | undefined) {
  return useQuery({
    queryKey: ['market', slug],
    queryFn: () => marketApi.project(slug ?? ''),
    enabled: Boolean(slug),
    staleTime: MARKET_STALE_TIME_MS,
    gcTime: MARKET_STALE_TIME_MS,
    retry: false,
  })
}
