import { useState, type FormEvent } from 'react'
import { Button, FormAlert, Label, Skeleton } from '../../../components/ui'
import { useProjects } from '../hooks/use-projects'
import { useTransitionProject } from '../hooks/use-transition-project'
import { adminErrorMessage } from '../lib/admin-error-message'
import { formatProjectState } from '../lib/format'
import { NEXT_PROJECT_STATE } from '../lib/next-project-state'

export function AdminTransitionForm() {
  const { data: projects, isLoading, isError, refetch } = useProjects()
  const [projectId, setProjectId] = useState('')
  const [moved, setMoved] = useState<string>()
  const transition = useTransitionProject()

  const selected = projects?.find((project) => project.id === projectId)
  const nextState = selected ? NEXT_PROJECT_STATE[selected.state] : undefined

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !nextState || transition.isPending) return
    setMoved(undefined)
    transition.mutate(
      { id: selected.id, state: nextState },
      {
        onSuccess: (project) =>
          setMoved(`${project.name} is now ${formatProjectState(project.state)}.`),
      },
    )
  }

  return (
    <form
      aria-labelledby="transition-project-title"
      onSubmit={handleSubmit}
      className="glass-card-flat space-y-4 rounded-3xl p-6"
    >
      <h2 id="transition-project-title" className="text-lg font-semibold">
        Move a project forward
      </h2>
      <p className="text-sm text-muted-foreground">
        Projects move one lifecycle step at a time. The server rejects any other
        transition.
      </p>
      {transition.isError ? (
        <FormAlert>{adminErrorMessage(transition.error)}</FormAlert>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-10 w-full rounded-2xl" />
      ) : isError ? (
        <div className="space-y-2">
          <FormAlert>Projects couldn&apos;t be loaded.</FormAlert>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="admin-transition-project">Project</Label>
          <select
            id="admin-transition-project"
            value={projectId}
            onChange={(event) => {
              setProjectId(event.target.value)
              setMoved(undefined)
              transition.reset()
            }}
            className="flex h-11 w-full rounded-2xl border border-input bg-secondary px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Choose a project</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selected ? (
        <div className="space-y-1 text-sm">
          <p>Current: {formatProjectState(selected.state)}</p>
          {nextState ? (
            <p className="font-medium">Next: {formatProjectState(nextState)}</p>
          ) : (
            <p className="text-muted-foreground">
              Report published is the final state. There is nothing left to move.
            </p>
          )}
        </div>
      ) : null}

      {moved ? <FormAlert tone="success">{moved}</FormAlert> : null}

      {nextState ? (
        <Button type="submit" className="rounded-full" disabled={transition.isPending}>
          {transition.isPending ? 'Moving…' : `Move to ${formatProjectState(nextState)}`}
        </Button>
      ) : null}
    </form>
  )
}
