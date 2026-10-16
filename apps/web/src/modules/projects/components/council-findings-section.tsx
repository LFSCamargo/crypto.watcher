import { Link } from 'react-router-dom'
import { RiBookOpenLine } from '@remixicon/react'
import type { ProjectState } from '../../../lib/api/types'
import { projectStateMeta } from '../lib/format'

export function CouncilFindingsSection({
  state,
  projectName,
  referenceSlug,
}: {
  state: ProjectState
  projectName: string
  referenceSlug?: string
}) {
  const published = state === 'analyzed'

  return (
    <section
      aria-labelledby="council-findings-title"
      className="glass-card-flat space-y-4 p-6"
    >
      <h2 id="council-findings-title" className="text-base font-semibold">
        Council findings
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {published
          ? 'The score above is the outcome the governor council published. Its structured findings are not available in the app yet.'
          : `${projectStateMeta(state).description} Findings will appear here once the council publishes its report.`}
      </p>
      {referenceSlug ? (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
          <RiBookOpenLine
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          />
          <p className="text-muted-foreground">
            Crypto Watcher also keeps a reference assessment of {projectName}, compiled
            from public sources. It is separate from this council review.{' '}
            <Link
              to={`/app/reference/${referenceSlug}`}
              className="font-semibold text-primary-strong underline-offset-4 hover:underline"
            >
              View the reference assessment
            </Link>
          </p>
        </div>
      ) : null}
    </section>
  )
}
