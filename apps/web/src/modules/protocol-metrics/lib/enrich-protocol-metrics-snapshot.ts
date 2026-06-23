import type { ProtocolMetricsSnapshot } from './protocol-metrics.types'
import {
  computeProtocolValuationFromSnapshot,
  hasDisplayableValuation,
} from './compute-protocol-valuation'

export function enrichProtocolMetricsSnapshot(
  snapshot: ProtocolMetricsSnapshot,
): ProtocolMetricsSnapshot {
  if (hasDisplayableValuation(snapshot.valuation)) {
    return snapshot
  }

  const computed = computeProtocolValuationFromSnapshot(snapshot)
  if (!computed) {
    return { ...snapshot, valuation: null }
  }

  return { ...snapshot, valuation: computed }
}
