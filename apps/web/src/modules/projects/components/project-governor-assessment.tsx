import { RiFileTextLine } from '@remixicon/react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import type { ProjectReviewProfile } from '../lib/project-review-types'

export function ProjectGovernorAssessment({
  profile,
}: {
  profile: ProjectReviewProfile
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiFileTextLine aria-hidden className="h-4 w-4 text-primary-strong" />
          Analyst notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{profile.governorNotes}</p>
        <p>
          Compiled by Crypto Watcher from public sources. This reference assessment is not
          a governor council report; official scores appear only on council-reviewed
          project pages.
        </p>
      </CardContent>
    </Card>
  )
}
