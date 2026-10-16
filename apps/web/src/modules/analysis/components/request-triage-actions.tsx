import { Button, FormAlert } from '../../../components/ui'
import type { AnalysisRequest } from '../api/analysis-requests.api'
import { useUpdateAnalysisRequest } from '../hooks/use-update-analysis-request'
import { REQUEST_TRIAGE_ACTIONS } from '../lib/request-status'

export function RequestTriageActions({ request }: { request: AnalysisRequest }) {
  const update = useUpdateAnalysisRequest()
  const actions = REQUEST_TRIAGE_ACTIONS[request.status]
  if (!actions) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Triage request">
        {actions.map((action) => (
          <Button
            key={action.status}
            type="button"
            size="sm"
            variant={action.status === 'rejected' ? 'outline' : 'default'}
            className="rounded-full"
            disabled={update.isPending}
            onClick={() => update.mutate({ id: request.id, status: action.status })}
          >
            {action.label}
          </Button>
        ))}
      </div>
      {update.isError ? (
        <FormAlert>
          <p>The status couldn&apos;t be updated. Try again in a moment.</p>
        </FormAlert>
      ) : null}
    </div>
  )
}
