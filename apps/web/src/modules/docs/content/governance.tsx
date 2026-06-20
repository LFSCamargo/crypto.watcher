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
} from '../components/docs-ui'

export function DocsGovernance() {
  return (
    <div>
      <DocsHero
        icon={Scales}
        eyebrow="Governance"
        title="Governance"
        description="How the Crypto Watcher protocol is governed and how you can participate in shaping its future."
      />

      <DocsSection icon={Scales} title="Overview">
        <DocsP>
          Crypto Watcher uses on-chain governance to make protocol decisions. Token
          holders can propose and vote on changes, ensuring the protocol evolves
          according to community consensus.
        </DocsP>
      </DocsSection>

      <DocsSection icon={Gavel} title="Governance Structure">
        <DocsSubheading>Governor Contract</DocsSubheading>
        <DocsP>
          The CryptoWatcherGovernor contract manages the proposal and voting process:
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
                'Before creating an on-chain proposal, discuss your idea with the community through our Discord or forum. This helps refine the proposal and gauge support.',
            },
            {
              title: 'Creating a Proposal',
              description:
                'Provide at least 10,000 CWT in voting power, a clear description of the proposed change, and the specific contract calls to execute.',
            },
            {
              title: 'Voting',
              description:
                'Token holders vote For (support), Against (oppose), or Abstain (counted for quorum but not for/against).',
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
            <DocsSubheading>Voting</DocsSubheading>
            <DocsList
              items={[
                'Voting duration for project analysis',
                'Minimum reputation threshold for voting',
                'Reputation weight calculations',
              ]}
            />
          </div>
          <div className="space-y-3">
            <DocsSubheading>Economic</DocsSubheading>
            <DocsList
              items={[
                'Reward distribution rates',
                'Slashing penalties',
                'Staking requirements',
              ]}
            />
          </div>
          <div className="space-y-3">
            <DocsSubheading>Protocol</DocsSubheading>
            <DocsList
              items={[
                'Backend submitter address',
                'Factory contract settings',
                'Emergency pause functionality',
              ]}
            />
          </div>
        </DocsCardGrid>
      </DocsSection>

      <DocsSection icon={HandsClapping} title="Vote Delegation">
        <DocsP>
          If you hold CWT but don't want to actively vote, you can delegate your voting
          power to another address. The delegate will vote on your behalf, but your
          tokens remain in your wallet.
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
        <DocsP>The governance system is designed for progressive decentralization:</DocsP>
        <DocsCardGrid columns={3}>
          <DocsPhaseCard
            phase="Phase 1"
            title="Current"
            active
            items={[
              'Team multisig controls timelock admin',
              'Community can propose and vote',
              'Emergency pause available to team',
            ]}
          />
          <DocsPhaseCard
            phase="Phase 2"
            title="Transition"
            items={[
              'Timelock admin transferred to governor',
              'Team retains emergency guardian role',
              'Lower proposal thresholds',
            ]}
          />
          <DocsPhaseCard
            phase="Phase 3"
            title="Target"
            items={[
              'Full DAO control',
              'Community-elected security council',
              'No centralized control',
            ]}
          />
        </DocsCardGrid>
      </DocsSection>

      <DocsSection icon={UsersThree} title="Get Involved">
        <DocsList
          items={[
            'Join the community discussion before proposing changes',
            'Build voting power and reputation by participating',
            'Delegate to active community members if you can not vote yourself',
          ]}
        />
      </DocsSection>
    </div>
  )
}
