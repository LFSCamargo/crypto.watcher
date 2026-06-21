export type SecurityReviewProvider =
  | 'CertiK'
  | 'Trail of Bits'
  | 'OpenZeppelin'
  | 'Consensys Diligence'
  | 'Halborn'
  | 'Quantstamp'
  | 'Runtime Verification'
  | 'Sigma Prime'
  | 'Statemind'
  | 'Spearbit'
  | 'OtterSec'
  | 'Other'

export type ExternalReviewStatus =
  | 'passed'
  | 'passed_with_issues'
  | 'monitoring'
  | 'informational'

export type SafetyVerdict = 'low_risk' | 'moderate_risk' | 'elevated_risk' | 'caution'

export interface ExternalSecurityReview {
  provider: SecurityReviewProvider
  title: string
  completedAt: string
  url: string
  status: ExternalReviewStatus
  scope?: string
}

export interface ProjectReviewProfile {
  verdict: SafetyVerdict
  headline: string
  summary: string
  strengths: string[]
  risks: string[]
  externalReviews: ExternalSecurityReview[]
  governorNotes: string
  lastReviewedAt: string
  methodologyVersion: string
}
