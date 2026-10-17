import type { ProtocolMetricsSnapshot } from './protocol-metrics.types'
import { hasDisplayableValuation } from './compute-protocol-valuation'

export type ValuationAvailability =
  | { status: 'available' }
  | { status: 'unavailable'; title: string; description: string }

const MIN_FEE_HISTORY_DAYS = 7

export function getValuationAvailability(
  snapshot: ProtocolMetricsSnapshot,
): ValuationAvailability {
  if (hasDisplayableValuation(snapshot.valuation)) {
    return { status: 'available' }
  }

  if (snapshot.entityType === 'stablecoin') {
    return {
      status: 'unavailable',
      title: 'Valuation model not applicable',
      description:
        'Stablecoins are assessed on reserve quality, peg mechanism, and issuer risk — not DeFi protocol fees or revenue. See circulating supply and chain breakdown above.',
    }
  }

  const feeHistoryDays = snapshot.feesHistory.length
  const hasFeeSummary =
    snapshot.fees30d != null || snapshot.fees24h != null || snapshot.fees7d != null

  if (!hasFeeSummary && feeHistoryDays < MIN_FEE_HISTORY_DAYS) {
    return {
      status: 'unavailable',
      title: 'On-chain valuation unavailable',
      description:
        'DeFi Llama has not indexed daily fee data for this project yet. Our valuation model (CW-Valuation-v1) needs at least a week of fee history to compute sustainability and composite scores.',
    }
  }

  if (
    snapshot.entityType === 'protocol' &&
    hasFeeSummary &&
    snapshot.revenue30d == null
  ) {
    return {
      status: 'unavailable',
      title: 'Revenue data missing',
      description:
        'Fees are indexed but protocol revenue is not reported on DeFi Llama for this entity. Revenue capture and P/S require revenue; fee sustainability can still be computed when enough history is available.',
    }
  }

  return {
    status: 'unavailable',
    title: 'On-chain valuation unavailable',
    description:
      'Not enough indexed on-chain activity to run the valuation model yet. Metrics refresh from DeFi Llama every 12 hours.',
  }
}
