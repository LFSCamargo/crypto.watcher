/**
 * Safe numeric helpers for financial ratios — avoids NaN/Infinity from divide-by-zero
 * and non-finite inputs (Solidity SafeMath-style guards for TypeScript).
 */

export function finiteOrNull(value: number): number | null {
  return Number.isFinite(value) ? value : null
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function safeDivide(
  numerator: number,
  denominator: number,
  fallback: number | null = null,
): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return fallback
  if (denominator === 0) return fallback
  const result = numerator / denominator
  return Number.isFinite(result) ? result : fallback
}

export function safePercentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null
  if (previous <= 0) return null
  const result = ((current - previous) / previous) * 100
  return Number.isFinite(result) ? result : null
}

export function safeMultiply(a: number, b: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  const result = a * b
  return Number.isFinite(result) ? result : null
}

export function weightedAverage(
  components: ReadonlyArray<{ value: number | null; weight: number }>,
): number | null {
  let weightedSum = 0
  let totalWeight = 0

  for (const { value, weight } of components) {
    if (value == null || !Number.isFinite(value) || weight <= 0) continue
    weightedSum += value * weight
    totalWeight += weight
  }

  if (totalWeight <= 0) return null
  return finiteOrNull(weightedSum / totalWeight)
}

export function sumSeriesInWindow(
  points: ReadonlyArray<{ timestamp: number; value: number }>,
  windowStartMs: number,
  windowEndMs: number,
): number {
  let sum = 0
  for (const point of points) {
    if (point.timestamp < windowStartMs || point.timestamp > windowEndMs) continue
    if (!Number.isFinite(point.value) || point.value < 0) continue
    sum += point.value
  }
  return sum
}

export function countSeriesInWindow(
  points: ReadonlyArray<{ timestamp: number; value: number }>,
  windowStartMs: number,
  windowEndMs: number,
): number {
  let count = 0
  for (const point of points) {
    if (point.timestamp < windowStartMs || point.timestamp > windowEndMs) continue
    if (!Number.isFinite(point.value)) continue
    count += 1
  }
  return count
}

export function annualizeFromWindowSum(windowSum: number, windowDays: number): number | null {
  if (!Number.isFinite(windowSum) || windowSum < 0 || windowDays <= 0) return null
  const dailyAverage = safeDivide(windowSum, windowDays, null)
  if (dailyAverage == null) return null
  return safeMultiply(dailyAverage, 365)
}

export function coefficientOfVariation(values: readonly number[]): number | null {
  if (values.length < 2) return null

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  if (mean <= 0) return null

  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  const stdev = Math.sqrt(variance)
  return safeDivide(stdev, mean, null)
}

export function normalizedEntropy(shares: readonly number[]): number {
  const positive = shares.filter((share) => share > 0)
  if (positive.length <= 1) return 0

  const total = positive.reduce((sum, share) => sum + share, 0)
  if (total <= 0) return 0

  let entropy = 0
  for (const share of positive) {
    const p = share / total
    entropy -= p * Math.log(p)
  }

  const maxEntropy = Math.log(positive.length)
  if (maxEntropy <= 0) return 0
  return clamp(entropy / maxEntropy, 0, 1)
}
