import {
  annualizeFromWindowSum,
  clamp,
  coefficientOfVariation,
  countSeriesInWindow,
  finiteOrNull,
  normalizedEntropy,
  safeDivide,
  safeMultiply,
  safePercentChange,
  sumSeriesInWindow,
  weightedAverage,
} from '../../lib/safe-math/safe-math'
import { DAY_MS } from './protocol-metrics-changes'
import type { ChainTvlBreakdown, TimeSeriesPoint } from './protocol-metrics.types'
import type { ProtocolValuation } from './protocol-metrics.types'
import {
  PROTOCOL_VALUATION_METHODOLOGY,
  type CompositeBreakdownEntry,
  type CompositeComponent,
} from './protocol-valuation.types'

const WINDOW_30D = 30
const WINDOW_365D = 365
const TARGET_FEE_YIELD = 0.15
const TARGET_REVENUE_TO_TVL = 0.08

export interface ProtocolValuationInput {
  entityType: 'protocol' | 'chain' | 'stablecoin'
  tvl: number
  mcap: number | null
  fees30d: number | null
  revenue30d: number | null
  feesHistory: TimeSeriesPoint[]
  revenueHistory: TimeSeriesPoint[]
  chainBreakdown: ChainTvlBreakdown[]
  chainCount: number
  exploitCount: number
  totalExploitLossUsd: number | null
}

function resolveReferenceTimestamp(
  feesHistory: TimeSeriesPoint[],
  revenueHistory: TimeSeriesPoint[],
): number | null {
  const timestamps = [
    feesHistory.at(-1)?.timestamp,
    revenueHistory.at(-1)?.timestamp,
  ].filter((timestamp): timestamp is number => timestamp != null)

  if (timestamps.length === 0) return null
  return Math.max(...timestamps)
}

function annualizeFromHistory(
  history: TimeSeriesPoint[],
  referenceTimestamp: number,
  windowDays: number,
): number | null {
  const windowStart = referenceTimestamp - windowDays * DAY_MS
  const windowSum = sumSeriesInWindow(history, windowStart, referenceTimestamp)
  const pointCount = countSeriesInWindow(history, windowStart, referenceTimestamp)

  if (pointCount >= 7) {
    return annualizeFromWindowSum(windowSum, windowDays)
  }

  return null
}

function annualizeFromSummary(
  summary30d: number | null,
  historyAnnualized: number | null,
): number | null {
  if (historyAnnualized != null) return historyAnnualized
  if (summary30d == null || summary30d < 0) return null
  return safeMultiply(summary30d, 365 / 30)
}

function growthFromHistory(
  history: TimeSeriesPoint[],
  referenceTimestamp: number,
  windowDays: number,
): number | null {
  const currentStart = referenceTimestamp - windowDays * DAY_MS
  const previousStart = referenceTimestamp - 2 * windowDays * DAY_MS

  const currentSum = sumSeriesInWindow(history, currentStart, referenceTimestamp)
  const previousSum = sumSeriesInWindow(history, previousStart, currentStart)

  if (countSeriesInWindow(history, currentStart, referenceTimestamp) < 7) return null
  if (countSeriesInWindow(history, previousStart, currentStart) < 7) return null

  return safePercentChange(currentSum, previousSum)
}

function scoreRevenueCaptureRate(captureRate: number | null): number | null {
  if (captureRate == null) return null
  return clamp(captureRate * 100, 0, 100)
}

function scoreGrowthPercent(growthPercent: number | null): number | null {
  if (growthPercent == null) return null
  return clamp(50 + growthPercent, 0, 100)
}

function computeFeeSustainabilityScore(
  annualizedFees: number | null,
  tvl: number,
  feesHistory: TimeSeriesPoint[],
  referenceTimestamp: number,
): number | null {
  const feeYieldScore =
    annualizedFees != null && tvl > 0
      ? clamp(
          ((safeDivide(annualizedFees, tvl, 0) ?? 0) / TARGET_FEE_YIELD) * 100,
          0,
          100,
        )
      : null

  const windowStart = referenceTimestamp - WINDOW_30D * DAY_MS
  const dailyFees = feesHistory
    .filter(
      (point) => point.timestamp >= windowStart && point.timestamp <= referenceTimestamp,
    )
    .map((point) => point.value)
    .filter((value) => value >= 0)

  const cv = coefficientOfVariation(dailyFees)
  const consistencyScore = cv == null ? null : clamp((1 - Math.min(cv, 1)) * 100, 0, 100)

  const feeGrowth30d = growthFromHistory(feesHistory, referenceTimestamp, WINDOW_30D)
  const growthScore = scoreGrowthPercent(feeGrowth30d)

  return weightedAverage([
    { value: feeYieldScore, weight: 0.5 },
    { value: consistencyScore, weight: 0.3 },
    { value: growthScore, weight: 0.2 },
  ])
}

function computeGovernanceQualityScore(
  entityType: ProtocolValuationInput['entityType'],
  chainBreakdown: ChainTvlBreakdown[],
  chainCount: number,
): number | null {
  if (entityType !== 'protocol') return null
  if (chainCount <= 0 && chainBreakdown.length === 0) return null

  const shares = chainBreakdown.map((item) => item.share)
  const topShare = shares.length > 0 ? Math.max(...shares) : 100
  const diversification = normalizedEntropy(shares) * 30
  const chainBonus = clamp(chainCount * 3, 0, 15)
  const concentrationPenalty = topShare > 85 ? 20 : topShare > 70 ? 10 : 0

  return clamp(55 + diversification + chainBonus - concentrationPenalty, 0, 100)
}

function computeSecurityScore(
  exploitCount: number,
  totalExploitLossUsd: number | null,
  tvl: number,
): number | null {
  let score = 100
  score -= Math.min(exploitCount * 12, 60)

  if (totalExploitLossUsd != null && totalExploitLossUsd > 0 && tvl > 0) {
    const lossRatio = safeDivide(totalExploitLossUsd, tvl, 0) ?? 0
    score -= clamp(lossRatio * 5000, 0, 40)
  }

  return clamp(score, 0, 100)
}

function computeValueScore(
  revenueToTvlRatio: number | null,
  priceToSalesRatio: number | null,
): number | null {
  const revenueYieldScore =
    revenueToTvlRatio != null
      ? clamp((revenueToTvlRatio / TARGET_REVENUE_TO_TVL) * 100, 0, 100)
      : null

  const psScore =
    priceToSalesRatio != null
      ? clamp(100 - Math.min(priceToSalesRatio, 20) * 5, 0, 100)
      : null

  return weightedAverage([
    { value: revenueYieldScore, weight: 0.6 },
    { value: psScore, weight: 0.4 },
  ])
}

interface CompositeInput {
  component: CompositeComponent
  score: number | null
  weight: number
}

function buildCompositeBreakdown(
  components: CompositeInput[],
): CompositeBreakdownEntry[] {
  const applicable = components.filter(({ weight }) => weight > 0)
  const scoredWeight = applicable.reduce(
    (sum, { score, weight }) =>
      score != null && Number.isFinite(score) ? sum + weight : sum,
    0,
  )
  return applicable.map(({ component, score, weight }) => {
    const finiteScore = score == null ? null : finiteOrNull(score)
    return {
      component,
      score: finiteScore,
      share: finiteScore != null && scoredWeight > 0 ? weight / scoredWeight : 0,
    }
  })
}

export function computeProtocolValuation(
  input: ProtocolValuationInput,
): ProtocolValuation | null {
  const referenceTimestamp = resolveReferenceTimestamp(
    input.feesHistory,
    input.revenueHistory,
  )
  const hasFinancials =
    input.fees30d != null ||
    input.revenue30d != null ||
    input.feesHistory.length > 0 ||
    input.revenueHistory.length > 0

  if (!hasFinancials && input.entityType !== 'protocol') return null

  const feesFromHistory =
    referenceTimestamp != null
      ? annualizeFromHistory(input.feesHistory, referenceTimestamp, WINDOW_365D)
      : null
  const revenueFromHistory =
    referenceTimestamp != null
      ? annualizeFromHistory(input.revenueHistory, referenceTimestamp, WINDOW_365D)
      : null

  const feesAnnualizedUsd = annualizeFromSummary(input.fees30d, feesFromHistory)
  const revenueAnnualizedUsd = annualizeFromSummary(input.revenue30d, revenueFromHistory)

  const revenueCaptureRate =
    feesAnnualizedUsd != null && revenueAnnualizedUsd != null && feesAnnualizedUsd > 0
      ? safeDivide(revenueAnnualizedUsd, feesAnnualizedUsd, null)
      : null

  const revenueGrowth30d =
    referenceTimestamp != null
      ? growthFromHistory(input.revenueHistory, referenceTimestamp, WINDOW_30D)
      : null
  const revenueGrowth1y =
    referenceTimestamp != null
      ? growthFromHistory(input.revenueHistory, referenceTimestamp, WINDOW_365D)
      : null

  const feeSustainabilityScore =
    referenceTimestamp != null
      ? computeFeeSustainabilityScore(
          feesAnnualizedUsd,
          input.tvl,
          input.feesHistory,
          referenceTimestamp,
        )
      : feesAnnualizedUsd != null && input.tvl > 0
        ? clamp(
            ((safeDivide(feesAnnualizedUsd, input.tvl, 0) ?? 0) / TARGET_FEE_YIELD) * 100,
            0,
            100,
          )
        : null

  const governanceQualityScore = computeGovernanceQualityScore(
    input.entityType,
    input.chainBreakdown,
    input.chainCount,
  )

  const securityScore =
    input.entityType === 'protocol'
      ? computeSecurityScore(input.exploitCount, input.totalExploitLossUsd, input.tvl)
      : null

  const revenueToTvlRatio =
    revenueAnnualizedUsd != null && input.tvl > 0
      ? finiteOrNull(
          safeMultiply(safeDivide(revenueAnnualizedUsd, input.tvl, 0) ?? 0, 100) ?? 0,
        )
      : null

  const feeToTvlRatio =
    feesAnnualizedUsd != null && input.tvl > 0
      ? finiteOrNull(
          safeMultiply(safeDivide(feesAnnualizedUsd, input.tvl, 0) ?? 0, 100) ?? 0,
        )
      : null

  const priceToSalesRatio =
    input.mcap != null && revenueAnnualizedUsd != null && revenueAnnualizedUsd > 0
      ? safeDivide(input.mcap, revenueAnnualizedUsd, null)
      : null

  const fundamentalsScore = weightedAverage([
    { value: scoreRevenueCaptureRate(revenueCaptureRate), weight: 0.35 },
    { value: scoreGrowthPercent(revenueGrowth30d), weight: 0.35 },
    { value: feeSustainabilityScore, weight: 0.3 },
  ])

  const valueScore = computeValueScore(
    revenueToTvlRatio != null ? revenueToTvlRatio / 100 : null,
    priceToSalesRatio,
  )

  const compositeComponents: CompositeInput[] = [
    { component: 'fundamentals', score: fundamentalsScore, weight: 0.35 },
    {
      component: 'security',
      score: securityScore,
      weight: input.entityType === 'protocol' ? 0.3 : 0,
    },
    {
      component: 'governance',
      score: governanceQualityScore,
      weight: input.entityType === 'stablecoin' ? 0 : 0.15,
    },
    { component: 'value', score: valueScore, weight: 0.2 },
    {
      component: 'feeSustainability',
      score: feeSustainabilityScore,
      weight: input.entityType === 'chain' ? 0.35 : 0,
    },
  ]
  const compositeScore = weightedAverage(
    compositeComponents.map(({ score, weight }) => ({ value: score, weight })),
  )

  if (
    feesAnnualizedUsd == null &&
    revenueAnnualizedUsd == null &&
    compositeScore == null &&
    securityScore == null
  ) {
    return null
  }

  return {
    feesAnnualizedUsd,
    revenueAnnualizedUsd,
    revenueCaptureRate:
      revenueCaptureRate != null ? finiteOrNull(revenueCaptureRate * 100) : null,
    revenueGrowth30d,
    revenueGrowth1y,
    feeSustainabilityScore,
    governanceQualityScore,
    securityScore,
    compositeScore,
    compositeBreakdown: buildCompositeBreakdown(compositeComponents),
    revenueToTvlRatio,
    feeToTvlRatio,
    priceToSalesRatio,
    methodologyVersion: PROTOCOL_VALUATION_METHODOLOGY,
  }
}
