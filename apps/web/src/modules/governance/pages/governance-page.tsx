import { Link } from 'react-router-dom'
import { RiBookOpenLine, RiScales3Line } from '@remixicon/react'
import { Button, FormAlert, Skeleton } from '../../../components/ui'
import { PageHero } from '../../../components/layout/page-hero'
import { GovernanceFaq } from '../components/governance-faq'
import { GovernanceMilestones } from '../components/governance-milestones'
import { GovernanceToday } from '../components/governance-today'
import { ProposalCard } from '../components/proposal-card'
import { ProposalStateLegend } from '../components/proposal-state-legend'
import { useGovernanceProposals } from '../hooks/use-governance'

export function GovernancePage() {
  const { data, isLoading, isError, refetch, isRefetching } = useGovernanceProposals()

  return (
    <div className="space-y-12">
      <PageHero
        icon={RiScales3Line}
        tone="violet"
        accentTone="amber"
        eyebrow="Protocol governance"
        title="Governance"
        status="Pre-launch · CWT not minted"
        description={
          <p>
            CWT is planned as the protocol&apos;s governance token for the reviewer
            roster, methodology and accountability rules. It hasn&apos;t been minted and
            no mint date is set. Project scores are published by the governor council and
            are never put to a token vote.
          </p>
        }
        actions={
          <>
            <Button asChild className="gap-1.5 rounded-full">
              <Link to="/docs/governance">
                <RiBookOpenLine aria-hidden className="h-4 w-4" />
                How governance will work
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/docs/tokenomics">Planned tokenomics</Link>
            </Button>
          </>
        }
        stats={[
          { label: 'CWT status', value: 'Not minted' },
          { label: 'Mint date', value: 'Not scheduled' },
          { label: 'On-chain proposals', value: data?.length ?? '—' },
        ]}
      />

      <GovernanceMilestones />

      <GovernanceToday />

      <section aria-labelledby="proposals-title" className="space-y-4">
        <div className="space-y-1">
          <h2 id="proposals-title" className="text-xl font-semibold">
            On-chain proposals
          </h2>
          <p className="text-sm text-muted-foreground">
            Protocol proposals appear here once the Governor contract is live.
          </p>
        </div>
        <ProposalStateLegend />
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
          <div className="glass-card-flat rounded-3xl border-dashed p-10 text-center">
            <p className="font-medium">No proposals yet.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Proposals open once CWT is minted and the Governor contract is deployed.
              Nothing has been submitted on-chain so far.
            </p>
          </div>
        )}
      </section>

      <GovernanceFaq />
    </div>
  )
}
