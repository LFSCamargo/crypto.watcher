import { useScore } from '../hooks/use-score'

export function ScorePanel({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = useScore(projectId)

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading score…</p>
  if (isError || !data) {
    return (
      <section className="rounded-lg border p-4">
        <h2 className="font-medium">Score</h2>
        <p className="text-sm text-muted-foreground">Score is not available yet.</p>
      </section>
    )
  }

  const percentage = Number(data.value) / 100

  return (
    <section className="rounded-lg border p-4">
      <h2 className="font-medium">Score</h2>
      <p className="mt-2 text-3xl font-semibold">{percentage.toFixed(2)}%</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between">
          <dt>For weight</dt>
          <dd>{data.breakdown.weightFor}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Against weight</dt>
          <dd>{data.breakdown.weightAgainst}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Total weight</dt>
          <dd>{data.breakdown.totalWeight}</dd>
        </div>
      </dl>
    </section>
  )
}
