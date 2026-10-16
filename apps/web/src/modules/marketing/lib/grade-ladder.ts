import {
  CREDIT_RATING_SCALE,
  resolveCreditRatingFromSafetyScore,
  type SpCreditRating,
} from '../../../lib/ratings/credit-rating'
import type { CuratedProject } from '../../projects/lib/curated-projects'

export interface GradeRung {
  grade: SpCreditRating
  projects: CuratedProject[]
}

/** Grades from the lowest one present up to AAA, lowest first, each sorted by score. */
export function buildGradeLadder(
  all: CuratedProject[],
  visible: CuratedProject[],
): GradeRung[] {
  const lowestRank = Math.max(
    ...all.map((project) =>
      CREDIT_RATING_SCALE.findIndex(
        (step) => step.sp === resolveCreditRatingFromSafetyScore(project.score).sp,
      ),
    ),
  )
  const byGrade = new Map<SpCreditRating, CuratedProject[]>()
  for (const project of visible) {
    const grade = resolveCreditRatingFromSafetyScore(project.score).sp
    const bucket = byGrade.get(grade) ?? []
    bucket.push(project)
    byGrade.set(grade, bucket)
  }
  return CREDIT_RATING_SCALE.slice(0, lowestRank + 1)
    .map((step) => ({
      grade: step.sp,
      projects: (byGrade.get(step.sp) ?? []).sort((a, b) => b.score - a.score),
    }))
    .reverse()
}
