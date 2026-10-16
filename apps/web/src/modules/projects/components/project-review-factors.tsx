import { RiAlertLine, RiCheckboxCircleLine } from '@remixicon/react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import type { ProjectReviewProfile } from '../lib/project-review-types'

export function ProjectReviewFactors({ profile }: { profile: ProjectReviewProfile }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RiCheckboxCircleLine className="h-4 w-4 text-success-strong" />
            Why it&apos;s rated well
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {profile.strengths.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RiAlertLine className="h-4 w-4 text-warning-strong" />
            Risks to understand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {profile.risks.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
