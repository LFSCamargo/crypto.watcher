import {
  Gavel,
  GitBranch,
  HandsClapping,
  ListChecks,
  Scales,
  Sliders,
  UsersThree,
} from '@phosphor-icons/react'
import {
  DocsCardGrid,
  DocsHero,
  DocsList,
  DocsP,
  DocsParams,
  DocsPhaseCard,
  DocsSection,
  DocsSteps,
  DocsSubheading,
} from '../components'

export function DocsGovernance() {
  return (
    <div>
      <DocsHero
        icon={Scales}
        eyebrow="Governance"
        title="Governance"
        description="How the Crypto Watcher protocol is governed — reviewer council policy, methodology and accountability. Not vote-to-rate on projects."
      />

      <DocsSection icon={Scales} title="Overview">
        <DocsP>
          Crypto Watcher uses on-chain governance for <strong className="text-foreground">protocol</strong>{' '}
          decisions. CWT holders propose and vote on how the platform operates: who reviews,
          how reviews are conducted and how reviewers are held accountable. Individual project
          risk scores are published by the governor council — not by token-weighted public votes.
        </DocsP>
      </DocsSection>

      <DocsSection icon={Gavel} title="Governance Structure">
        <DocsSubheading>Governor Contract</DocsSubheading>
        <DocsP>
          The CryptoWatcherGovernor contract manages protocol proposals and voting:
        </DocsP>
        <DocsParams
          params={[
            { label: 'Proposal Threshold', value: '10,000 CWT' },
            { label: 'Voting Period', value: '3 days' },
            { label: 'Quorum', value: '4% of total supply' },
            { label: 'Timelock Delay', value: '1 day' },
          ]}
        />
        <DocsSubheading>Timelock Controller</DocsSubheading>
        <DocsP>
          All governance actions are executed through a timelock, providing a delay
          period for users to review and react to passed proposals.
        </DocsP>
      </DocsSection>

      <DocsSection icon={ListChecks} title="Proposal Process">
        <DocsSteps
          steps={[
            {
              title: 'Discussion',
              description:
                'Before creating an on-chain proposal, discuss your idea with the community. Protocol changes affect reviewer policy and methodology — not individual project scores.',
            },
            {
              title: 'Creating a Proposal',
              description:
                'Provide at least 10,000 CWT in voting power, a clear description of the proposed protocol change, and the specific contract calls to execute.',
            },
            {
              title: 'Voting',
              description:
                'CWT holders vote For, Against or Abstain on protocol proposals only.',
            },
            {
              title: 'Execution',
              description:
                'If the proposal passes (more For than Against, quorum met), it enters the timelock queue. After the delay, anyone can execute it.',
            },
          ]}
        />
      </DocsSection>

      <DocsSection icon={Sliders} title="Governable Parameters">
        <DocsCardGrid columns={3}>
          <div className="space-y-3">
            <DocsSubheading>Reviewer Council</DocsSubheading>
            <DocsList
              items={[
                'Reviewer roster additions and removals',
                'Expertise domain assignments',
                'Conflict-of-interest policy',
              ]}
            />
          </div>
          <div className="space-y-3">
            <DocsSubheading>Methodology</DocsSubheading>
            <DocsList
              items={[
                'Review methodology version approval',
                'Evidence submission requirements',
                'Appeals and re-review policy',
              ]}
            />
          </div>
          <div className="space-y-3">
            <DocsSubheading>Protocol</DocsSubheading>
            <DocsList
              items={[
                'Review fee schedules',
                'Backend submitter address',
                'Emergency pause functionality',
              ]}
            />
          </div>
        </DocsCardGrid>
      </DocsSection>

      <DocsSection icon={HandsClapping} title="Vote Delegation">
        <DocsP>
          If you hold CWT but don't want to actively vote on protocol proposals, you can
          delegate your voting power to another address. The delegate votes on your behalf;
          your tokens remain in your wallet.
        </DocsP>
        <DocsSubheading>How to Delegate</DocsSubheading>
        <DocsSteps
          steps={[
            {
              title: 'Open Governance',
              description: 'Go to the Governance page in the app.',
            },
            {
              title: 'Choose a delegate',
              description: 'Click "Delegate" and enter the delegate address.',
            },
            {
              title: 'Confirm',
              description:
                'Confirm the transaction. You can change your delegate at any time, or delegate to yourself to vote directly.',
            },
          ]}
        />
      </DocsSection>

      <DocsSection icon={GitBranch} title="Progressive Decentralization">
        <DocsP>
          Protocol governance decentralizes over time. Review authority always remains with
          the expert council — decentralization applies to protocol policy, not public
          score voting.
        </DocsP>
        <DocsCardGrid columns={3}>
          <DocsPhaseCard
            phase="Phase 1"
            title="Current"
            active
            items={[
              'Team multisig controls timelock admin',
              'Community can propose and vote on protocol params',
              'Governor council publishes all project scores',
            ]}
          />
          <DocsPhaseCard
            phase="Phase 2"
            title="Transition"
            items={[
              'Timelock admin transferred to governor',
              'Delegated protocol governance at scale',
              'Expanded reviewer council specializations',
            ]}
          />
          <DocsPhaseCard
            phase="Phase 3"
            title="Target"
            items={[
              'Full DAO control of protocol parameters',
              'Community-elected reviewer policy council',
              'Transparent methodology on-chain',
            ]}
          />
        </DocsCardGrid>
      </DocsSection>

      <DocsSection icon={UsersThree} title="Get Involved">
        <DocsList
          items={[
            'Read expert reports and submit evidence to help governors investigate',
            'Report incidents and whistleblow on suspicious projects',
            'Participate in protocol governance if you hold CWT',
            'Delegate protocol votes to active community members',
          ]}
        />
      </DocsSection>
    </div>
  )
}
