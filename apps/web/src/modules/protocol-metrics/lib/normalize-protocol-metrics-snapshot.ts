import type { ProtocolMetricsSnapshot } from './protocol-metrics.types'
import { EMPTY_PROTOCOL_METRICS } from './protocol-metrics.types'
import { enrichProtocolMetricsSnapshot } from './enrich-protocol-metrics-snapshot'

export function normalizeProtocolMetricsSnapshot(raw: unknown): ProtocolMetricsSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const snapshot = raw as ProtocolMetricsSnapshot
  if (typeof snapshot.slug !== 'string' || typeof snapshot.tvl !== 'number') return null
  if (!Array.isArray(snapshot.tvlHistory)) return null

  const normalized: ProtocolMetricsSnapshot = {
    ...snapshot,
    entityType: snapshot.entityType ?? 'protocol',
    mcap: snapshot.mcap ?? null,
    chainBreakdown: snapshot.chainBreakdown ?? EMPTY_PROTOCOL_METRICS.chainBreakdown,
    tokenComposition: snapshot.tokenComposition ?? EMPTY_PROTOCOL_METRICS.tokenComposition,
    feesHistory: snapshot.feesHistory ?? EMPTY_PROTOCOL_METRICS.feesHistory,
    revenueHistory: snapshot.revenueHistory ?? EMPTY_PROTOCOL_METRICS.revenueHistory,
    dexVolume24h: snapshot.dexVolume24h ?? null,
    dexVolume7d: snapshot.dexVolume7d ?? null,
    dexVolume30d: snapshot.dexVolume30d ?? null,
    dexVolumeChange1d: snapshot.dexVolumeChange1d ?? null,
    dexVolumeHistory: snapshot.dexVolumeHistory ?? EMPTY_PROTOCOL_METRICS.dexVolumeHistory,
    valuation: snapshot.valuation ?? null,
  }

  return enrichProtocolMetricsSnapshot(normalized)
}
