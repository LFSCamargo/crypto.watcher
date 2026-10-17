import { apiFetch } from '../../../lib/api/client'
import {
  ProtocolMetricsUnavailableError,
  isApiUnavailable,
} from '../lib/protocol-metrics-errors'
import { normalizeProtocolMetricsSnapshot } from '../lib/normalize-protocol-metrics-snapshot'
import {
  readProtocolMetricsCache,
  writeProtocolMetricsCache,
} from '../lib/protocol-metrics-local-cache'
import {
  PROTOCOL_METRICS_SNAPSHOT_VERSION,
  type ProtocolMetricsSnapshot,
} from '../lib/protocol-metrics.types'

function parseProtocolMetricsResponse(raw: unknown): ProtocolMetricsSnapshot {
  if (typeof raw === 'string' && raw.trimStart().startsWith('<!')) {
    throw new Error(
      'Protocol metrics API returned HTML instead of JSON. Check that the dev proxy includes /protocol-metrics.',
    )
  }

  const snapshot = normalizeProtocolMetricsSnapshot(raw)
  if (!snapshot) {
    throw new Error('Invalid protocol metrics response')
  }
  return snapshot
}

export async function fetchProjectProtocolMetrics(
  slug: string,
): Promise<ProtocolMetricsSnapshot> {
  const cached = readProtocolMetricsCache(slug)
  if (cached && !cached.stale) return cached

  try {
    const response = await apiFetch<ProtocolMetricsSnapshot>(
      `/protocol-metrics/projects/${slug}?v=${PROTOCOL_METRICS_SNAPSHOT_VERSION}`,
    )
    const snapshot = parseProtocolMetricsResponse(response)
    writeProtocolMetricsCache(slug, snapshot)
    return snapshot
  } catch (error) {
    if (cached) return { ...cached, stale: true }

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
