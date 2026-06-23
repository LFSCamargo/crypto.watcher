/** S&P / Fitch letter grades (investment → speculative → default). */
export type SpCreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D'

/** Moody's letter grades (parallel scale to S&P). */
export type MoodysCreditRating =
  | 'Aaa'
  | 'Aa'
  | 'A'
  | 'Baa'
  | 'Ba'
  | 'B'
  | 'Caa'
  | 'Ca'
  | 'C'
  | 'D'

/** Top-level bucket — mirrors credit-agency investment vs speculative split. */
export type CreditRatingGroup = 'investment_grade' | 'speculative_grade'

export interface CreditRating {
  sp: SpCreditRating
  moodys: MoodysCreditRating
  group: CreditRatingGroup
}

export interface CreditRatingScaleStep extends CreditRating {
  /** Inclusive minimum safety score (0–100, higher = safer). */
  minSafetyScore: number
}

/** Ordered highest → lowest; BBB/Baa is the last investment-grade notch. */
export const CREDIT_RATING_SCALE: readonly CreditRatingScaleStep[] = [
  { minSafetyScore: 97, sp: 'AAA', moodys: 'Aaa', group: 'investment_grade' },
  { minSafetyScore: 94, sp: 'AA', moodys: 'Aa', group: 'investment_grade' },
  { minSafetyScore: 90, sp: 'A', moodys: 'A', group: 'investment_grade' },
  { minSafetyScore: 85, sp: 'BBB', moodys: 'Baa', group: 'investment_grade' },
  { minSafetyScore: 78, sp: 'BB', moodys: 'Ba', group: 'speculative_grade' },
  { minSafetyScore: 70, sp: 'B', moodys: 'B', group: 'speculative_grade' },
  { minSafetyScore: 60, sp: 'CCC', moodys: 'Caa', group: 'speculative_grade' },
  { minSafetyScore: 50, sp: 'CC', moodys: 'Ca', group: 'speculative_grade' },
  { minSafetyScore: 40, sp: 'C', moodys: 'C', group: 'speculative_grade' },
  { minSafetyScore: 0, sp: 'D', moodys: 'D', group: 'speculative_grade' },
] as const

const INVESTMENT_GRADE_RATINGS = new Set<SpCreditRating>(['AAA', 'AA', 'A', 'BBB'])

export function resolveCreditRatingGroup(
  sp: SpCreditRating,
): CreditRatingGroup {
  return INVESTMENT_GRADE_RATINGS.has(sp) ? 'investment_grade' : 'speculative_grade'
}

export function normalizeSafetyScore(rawValue: string | number): number {
  const numeric = typeof rawValue === 'number' ? rawValue : Number.parseFloat(rawValue)
  if (!Number.isFinite(numeric)) return 0
  if (numeric > 100) return numeric / 100
  return numeric
}

export function resolveCreditRatingFromSafetyScore(
  safetyScore: string | number,
  options?: { forceDefault?: boolean },
): CreditRating {
  if (options?.forceDefault) {
    return { sp: 'D', moodys: 'D', group: 'speculative_grade' }
  }

  const clamped = Math.max(0, Math.min(100, normalizeSafetyScore(safetyScore)))
  const step =
    CREDIT_RATING_SCALE.find((entry) => clamped >= entry.minSafetyScore) ??
    CREDIT_RATING_SCALE.at(-1)!

  return {
    sp: step.sp,
    moodys: step.moodys,
    group: step.group,
  }
}

export function getCreditRatingGroupLabel(group: CreditRatingGroup): string {
  return group === 'investment_grade' ? 'Investment grade' : 'Speculative grade'
}

export function formatCreditRatingLabel(rating: CreditRating): string {
  return `${rating.sp} · ${rating.moodys}`
}
