import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { RiCheckboxCircleLine } from '@remixicon/react'
import { Button } from '../../../components/ui'
import type { AnalysisRequest } from '../api/analysis-requests.api'
import { requestStatusMeta } from '../lib/request-status'

export function RequestSuccessPanel({
  request,
  onRequestAnother,
}: {
  request: AnalysisRequest
  onRequestAnother: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const status = requestStatusMeta(request.status)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="space-y-4 text-center">
      <RiCheckboxCircleLine
        aria-hidden
        className="mx-auto h-10 w-10 text-success-strong"
      />
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        Request received
      </h2>
      <p className="text-sm text-muted-foreground">
        {request.projectName} is in the queue as {status.label}. {status.nextStep} You can
        follow its status in the review queue and below.
      </p>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild className="rounded-full">
          <Link to="/app/in-analysis">Open the review queue</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={onRequestAnother}
        >
          Request another review
        </Button>
      </div>
    </div>
  )
}
