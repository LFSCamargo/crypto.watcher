export type LighthouseCategory = 'performance' | 'accessibility' | 'best-practices' | 'seo'

export type LighthouseThresholds = Partial<Record<LighthouseCategory, number>>

export type AuditCategoryResult = {
  category: LighthouseCategory
  score: number
  minimum: number
  passed: boolean
}

export type AuditEvaluation = {
  url: string
  passed: boolean
  categories: AuditCategoryResult[]
}

/** Normalize Lighthouse scores (0–1 or 0–100) to a 0–100 scale. */
export function normalizeLighthouseScore(score: number | null | undefined): number {
  if (score == null || Number.isNaN(score)) {
    return 0
  }
  return score <= 1 ? Math.round(score * 100) : Math.round(score)
}

export function evaluateLighthouseAudit(
  url: string,
  scores: Partial<Record<LighthouseCategory, number | null | undefined>>,
  thresholds: LighthouseThresholds,
): AuditEvaluation {
  const categories = (Object.keys(thresholds) as LighthouseCategory[]).map((category) => {
    const minimum = thresholds[category] ?? 0
    const score = normalizeLighthouseScore(scores[category])
    return {
      category,
      score,
      minimum,
      passed: score >= minimum,
    }
  })

  return {
    url,
    passed: categories.every((entry) => entry.passed),
    categories,
  }
}
