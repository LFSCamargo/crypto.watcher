import { useParams } from 'react-router-dom'
import { useReputation } from './hooks/use-reputation'

export function ReputationPage() {
  const { address } = useParams()
  const { data, isLoading, isError } = useReputation(address)

  if (isLoading) return <p>Loading reputation…</p>
  if (isError || !data) return <p>Reputation not found.</p>

  return (
    <section className="max-w-xl rounded-lg border p-4">
      <h1 className="text-2xl font-semibold">Reputation</h1>
      <p className="mt-2 break-all text-sm text-muted-foreground">{data.walletAddress}</p>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between">
          <dt>Eligible</dt>
          <dd>{data.eligible ? 'Yes' : 'No'}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Weight</dt>
          <dd>{data.weight}</dd>
        </div>
      </dl>
    </section>
  )
}
