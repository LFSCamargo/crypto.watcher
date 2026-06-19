import { Link, useParams } from 'react-router-dom'
import { useGovernanceProposal, useGovernanceProposals } from './hooks/use-governance'

export function GovernancePage() {
  const { data, isLoading, isError } = useGovernanceProposals()

  if (isLoading) return <p>Loading governance proposals…</p>
  if (isError) return <p>Failed to load governance proposals.</p>

  return (
    <section>
      <h1 className="text-2xl font-semibold">Governance</h1>
      <p className="text-sm text-muted-foreground">
        MVP governance is live from launch through token voting and timelock execution.
      </p>
      <div className="mt-6 space-y-3">
        {data?.map((proposal) => (
          <article className="rounded-lg border p-4" key={proposal.id}>
            <Link className="font-medium" to={`/governance/${proposal.onchainId}`}>
              {proposal.title}
            </Link>
            <p className="text-sm text-muted-foreground">{proposal.state}</p>
          </article>
        ))}
        {data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No proposals indexed yet.</p>
        )}
      </div>
    </section>
  )
}

export function GovernanceDetailPage() {
  const { onchainId } = useParams()
  const { data, isLoading, isError } = useGovernanceProposal(onchainId)

  if (isLoading) return <p>Loading proposal…</p>
  if (isError || !data) return <p>Proposal not found.</p>

  return (
    <article className="max-w-3xl rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{data.state}</p>
      <h1 className="text-2xl font-semibold">{data.title}</h1>
      <p className="mt-4 whitespace-pre-wrap">{data.description ?? 'No description.'}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="font-medium">On-chain ID</dt>
          <dd className="break-all text-muted-foreground">{data.onchainId}</dd>
        </div>
        <div>
          <dt className="font-medium">Proposer</dt>
          <dd className="break-all text-muted-foreground">{data.proposerAddress}</dd>
        </div>
      </dl>
    </article>
  )
}
