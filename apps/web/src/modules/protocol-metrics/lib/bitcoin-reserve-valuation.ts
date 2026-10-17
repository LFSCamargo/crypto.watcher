import { clamp, safeDivide } from '../../../lib/safe-math/safe-math'

export const BITCOIN_RESERVE_SLUG = 'bitcoin'
export const BITCOIN_RESERVE_METHODOLOGY = 'CW-Reserve-v1'

const BITCOIN_GENESIS_MS = Date.parse('2009-01-03T18:15:05Z')
const BITCOIN_BLOCK_MS = 10 * 60 * 1000
const BITCOIN_HALVING_INTERVAL = 210_000
const BITCOIN_INITIAL_SUBSIDY_BTC = 50
const BITCOIN_BLOCKS_PER_YEAR = (365 * 24 * 60) / 10
const TARGET_SECURITY_BUDGET = 0.0005
const MAX_DILUTION = 0.02
const NVT_BEST = 30
const NVT_WORST = 120

export function isBitcoinReserveSlug(slug: string | undefined): boolean {
  return slug === BITCOIN_RESERVE_SLUG
}

/** Annual BTC issuance from the subsidy schedule at `asOf`. O(1). */
export function bitcoinAnnualIssuanceBtc(asOf: number): number {
  if (!Number.isFinite(asOf) || asOf < BITCOIN_GENESIS_MS) return 0

  const blocksSinceGenesis = (asOf - BITCOIN_GENESIS_MS) / BITCOIN_BLOCK_MS
  const era = Math.floor(blocksSinceGenesis / BITCOIN_HALVING_INTERVAL)
  if (era < 0 || era >= 64) return 0

  const subsidy = BITCOIN_INITIAL_SUBSIDY_BTC / 2 ** era
  return subsidy * BITCOIN_BLOCKS_PER_YEAR
}

export function scoreSecurityBudget(
  annualFeesUsd: number | null,
  marketCapUsd: number | null,
): number | null {
  if (annualFeesUsd == null || marketCapUsd == null || marketCapUsd <= 0) return null
  const yieldRatio = safeDivide(annualFeesUsd, marketCapUsd, null)
  if (yieldRatio == null) return null
  return clamp((yieldRatio / TARGET_SECURITY_BUDGET) * 100, 0, 100)
}

export function scoreDilution(
  marketCapUsd: number | null,
  priceUsd: number | null,
  asOf: number,
): number | null {
  if (marketCapUsd == null || priceUsd == null || priceUsd <= 0 || marketCapUsd <= 0) {
    return null
  }
  const circulating = safeDivide(marketCapUsd, priceUsd, null)
  if (circulating == null || circulating <= 0) return null
  const issuance = bitcoinAnnualIssuanceBtc(asOf)
  const dilution = safeDivide(issuance, circulating, null)
  if (dilution == null) return null
  return clamp(100 - (dilution / MAX_DILUTION) * 100, 0, 100)
}

export function scoreSettlement(
  marketCapUsd: number | null,
  settlementVolume1yUsd: number | null,
): number | null {
  if (marketCapUsd == null || settlementVolume1yUsd == null || settlementVolume1yUsd <= 0) {
    return null
  }
  const nvt = safeDivide(marketCapUsd, settlementVolume1yUsd, null)
  if (nvt == null) return null
  return clamp(100 - ((nvt - NVT_BEST) / (NVT_WORST - NVT_BEST)) * 100, 0, 100)
}
