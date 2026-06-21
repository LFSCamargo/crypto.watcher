import type { ProjectReviewProfile } from '../lib/project-review-types'
import { ProjectGovernorAssessment } from './project-governor-assessment'
import { ProjectReviewFactors } from './project-review-factors'
import { ProjectSafetyVerdict } from './project-safety-verdict'
import { ProjectSecurityAudits } from './project-security-audits'

export function ProjectReviewDetail({ profile }: { profile: ProjectReviewProfile }) {
  return (
    <div className="space-y-6">
      <ProjectSafetyVerdict profile={profile} />
      <ProjectReviewFactors profile={profile} />
      <ProjectSecurityAudits profile={profile} />
      <ProjectGovernorAssessment profile={profile} />
    </div>
  )
}
