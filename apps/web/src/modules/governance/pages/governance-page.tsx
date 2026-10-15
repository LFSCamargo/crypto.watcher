import { Link } from 'react-router-dom'
import { Scales } from '@phosphor-icons/react'
import { Button, FormAlert, Skeleton } from '../../../components/ui'
import { ProposalCard } from '../components/proposal-card'
import { ProposalStateLegend } from '../components/proposal-state-legend'
import { useGovernanceProposals } from '../hooks/use-governance'

export function GovernancePage() {
  const { data, isLoading, isError, refetch, isRefetching } = useGovernanceProposals()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-3">
        <h1 className="heading-2 flex items-center gap-3">
          <Scales
            size={28}
            className="text-primary-strong"
            weight="duotone"
            aria-hidden
          />
          Governance
        </h1>
        <p className="body-large max-w-2xl">
          CWT holders vote on protocol policy — the reviewer roster, methodology and
          accountability rules. Project scores are published by the governor council and
          are never put to a token vote.
        </p>
        <Link
          to="/docs/governance"
          className="inline-block text-sm font-semibold underline underline-offset-2"
        >
          Read the governance guide
        </Link>
      </header>

      <ProposalStateLegend />

      <section aria-labelledby="proposals-title" className="space-y-3">
        <h2 id="proposals-title" className="text-lg font-semibold">
          Protocol proposals
        </h2>
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-24 w-full rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="space-y-3">
            <FormAlert>
              Proposals couldn&apos;t be loaded. Check your connection and try again.
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
        ) : data?.length ? (
          <ul className="space-y-3">
            {data.map((proposal) => (
              <li key={proposal.id}>
                <ProposalCard proposal={proposal} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass-card-flat rounded-3xl p-10 text-center">
            <p className="font-medium">No proposals have been indexed yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              New protocol proposals appear here once they are created on-chain.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
