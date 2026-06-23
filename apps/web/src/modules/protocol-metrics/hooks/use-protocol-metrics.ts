import { useQuery } from '@tanstack/react-query'
import { protocolMetricsApi } from '../api/protocol-metrics.api'
import { PROTOCOL_METRICS_STALE_TIME_MS } from '../lib/protocol-metrics.types'

export function useProtocolMetrics(slug: string | undefined) {
  return useQuery({
    queryKey: ['protocol-metrics', slug],
    queryFn: () => protocolMetricsApi.project(slug ?? ''),
    enabled: Boolean(slug),
    staleTime: PROTOCOL_METRICS_STALE_TIME_MS,
    gcTime: PROTOCOL_METRICS_STALE_TIME_MS,
    retry: false,
  })
}
