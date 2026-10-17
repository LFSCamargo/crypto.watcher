import { useQuery } from '@tanstack/react-query'
import { protocolMetricsApi } from '../api/protocol-metrics.api'
import { readProtocolMetricsCache } from '../lib/protocol-metrics-local-cache'
import {
  PROTOCOL_METRICS_RETENTION_MS,
  PROTOCOL_METRICS_SNAPSHOT_VERSION,
  PROTOCOL_METRICS_STALE_TIME_MS,
} from '../lib/protocol-metrics.types'

function savedSnapshot(slug: string | undefined) {
  if (!slug) return undefined
  return readProtocolMetricsCache(slug) ?? undefined
}

export function useProtocolMetrics(slug: string | undefined) {
  return useQuery({
    queryKey: ['protocol-metrics', `v${PROTOCOL_METRICS_SNAPSHOT_VERSION}`, slug],
    queryFn: () => protocolMetricsApi.project(slug ?? ''),
    enabled: Boolean(slug),
    staleTime: PROTOCOL_METRICS_STALE_TIME_MS,
    gcTime: PROTOCOL_METRICS_RETENTION_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: (query) => {
      const updatedAt = query.state.dataUpdatedAt
      if (!updatedAt) return PROTOCOL_METRICS_STALE_TIME_MS
      const remaining = PROTOCOL_METRICS_STALE_TIME_MS - (Date.now() - updatedAt)
      return remaining > 0 ? remaining : PROTOCOL_METRICS_STALE_TIME_MS
    },
    retry: false,
    initialData: () => savedSnapshot(slug),
    initialDataUpdatedAt: () => {
      const cached = savedSnapshot(slug)
      return cached ? Date.parse(cached.cachedAt) : undefined
    },
  })
}
