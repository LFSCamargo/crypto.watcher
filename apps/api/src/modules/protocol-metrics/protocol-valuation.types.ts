export const PROTOCOL_VALUATION_METHODOLOGY = 'CW-Valuation-v1'

export interface ProtocolValuation {
  /** Sum of daily fees over the trailing window, extrapolated to 365 days. */
  feesAnnualizedUsd: number | null
  /** Sum of daily revenue over the trailing window, extrapolated to 365 days. */
  revenueAnnualizedUsd: number | null
  /** Protocol revenue ÷ fees generated (0–100%). */
  revenueCaptureRate: number | null
  /** Trailing 30d revenue vs prior 30d (%). */
  revenueGrowth30d: number | null
  /** Trailing 365d revenue vs prior 365d (%). */
  revenueGrowth1y: number | null
  /** 0–100 score from fee yield, consistency and fee growth. */
  feeSustainabilityScore: number | null
  /** 0–100 proxy from chain diversification and concentration. */
  governanceQualityScore: number | null
  /** 0–100 score penalizing exploits and loss/TVL. */
  securityScore: number | null
  /** Weighted composite 0–100 from fundamentals, security and governance. */
  compositeScore: number | null
  /** Annual revenue ÷ TVL (%). */
  revenueToTvlRatio: number | null
  /** Annual fees ÷ TVL (%). */
  feeToTvlRatio: number | null
  /** Market cap ÷ annualized revenue (P/S). Null when mcap or revenue missing. */
  priceToSalesRatio: number | null
  methodologyVersion: string
}
