import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { Button, FormAlert, Skeleton } from '../../../components/ui'
import { ApiError } from '../../../lib/api/client'
import { ProposalLifecycle } from '../components/proposal-lifecycle'
import { ProposalStateBadge } from '../components/proposal-state-badge'
import { ProposalVoteSection } from '../components/proposal-vote-section'
import { useGovernanceProposal } from '../hooks/use-governance'
import { proposalStateMeta } from '../lib/proposal-state'

export function GovernanceDetailPage() {
  const { onchainId } = useParams()
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGovernanceProposal(onchainId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4" aria-busy="true">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    )
  }

  if ((error instanceof ApiError && error.status === 404) || (!isError && !data)) {
    return (
      <section className="glass-card mx-auto max-w-xl space-y-3 rounded-3xl p-8 text-center">
        <h1 className="text-xl font-semibold">Proposal not found</h1>
        <p className="text-sm text-muted-foreground">
          It may not be indexed yet, or the link is wrong.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/app/governance">Back to governance</Link>
        </Button>
      </section>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <FormAlert>
          This proposal couldn&apos;t be loaded. Check your connection and try again.
        </FormAlert>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => void refetch()}
          disabled={isRefetching}
        >
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/app/governance"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden />
        All proposals
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="glass-card-flat space-y-6 rounded-3xl p-6">
          <header className="space-y-3">
            <ProposalStateBadge state={data.state} />
            <h1 className="heading-3 text-balance">{data.title}</h1>
            <p className="text-sm text-muted-foreground">
              {proposalStateMeta(data.state).description}
            </p>
          </header>
          <ProposalLifecycle state={data.state} />
          <section aria-labelledby="proposal-description-title" className="space-y-2">
            <h2 id="proposal-description-title" className="text-base font-semibold">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {data.description ?? 'The proposer did not add a description.'}
            </p>
          </section>
          <dl className="grid gap-4 rounded-2xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="font-medium">Proposal ID</dt>
              <dd className="break-all font-mono text-xs text-muted-foreground">
                {data.onchainId}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="font-medium">Proposer</dt>
              <dd className="break-all font-mono text-xs text-muted-foreground">
                {data.proposerAddress}
              </dd>
            </div>
            {data.startBlock && data.endBlock ? (
              <div className="sm:col-span-2">
                <dt className="font-medium">Voting window</dt>
                <dd className="text-muted-foreground">
                  Blocks {data.startBlock} to {data.endBlock}
                </dd>
              </div>
            ) : null}
          </dl>
        </article>

        <aside>
          <ProposalVoteSection proposal={data} />
        </aside>
      </div>
    </div>
  )
}
