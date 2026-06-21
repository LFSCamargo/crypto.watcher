import { RiShieldLine } from '@remixicon/react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import type { ProjectReviewProfile } from '../lib/project-review-types'

export function ProjectGovernorAssessment({ profile }: { profile: ProjectReviewProfile }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiShieldLine className="h-4 w-4 text-primary" />
          Governor council notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{profile.governorNotes}</p>
        <p>
          Reviewed by{' '}
          <span className="font-semibold text-foreground">Crypto Watcher Governor Council</span>
          . Scores reflect expert analysis — not community voting or token-weighted input.
        </p>
      </CardContent>
    </Card>
  )
}
