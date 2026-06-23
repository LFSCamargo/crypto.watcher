import { apiFetch } from '../../../lib/api/client'
import { ProtocolMetricsUnavailableError, isApiUnavailable } from '../lib/protocol-metrics-errors'
import { normalizeProtocolMetricsSnapshot } from '../lib/normalize-protocol-metrics-snapshot'
import type { ProtocolMetricsSnapshot } from '../lib/protocol-metrics.types'

function parseProtocolMetricsResponse(raw: unknown): ProtocolMetricsSnapshot {
  const snapshot = normalizeProtocolMetricsSnapshot(raw)
  if (!snapshot) {
    throw new Error('Invalid protocol metrics response')
  }
  return snapshot
}

export async function fetchProjectProtocolMetrics(slug: string): Promise<ProtocolMetricsSnapshot> {
  try {
    const response = await apiFetch<ProtocolMetricsSnapshot>(`/protocol-metrics/projects/${slug}`)
    return parseProtocolMetricsResponse(response)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('API 404')) {
      throw new ProtocolMetricsUnavailableError()
    }

    if (!isApiUnavailable(error)) {
      throw error
    }

    throw new ProtocolMetricsUnavailableError('Unable to load protocol metrics right now.')
  }
}

export const protocolMetricsApi = {
  project: fetchProjectProtocolMetrics,
}
