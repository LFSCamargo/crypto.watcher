import {
  ChartLineDown,
  Coins,
  Gift,
  Lock,
  Scales,
  ShieldWarning,
  Stack,
  UsersThree,
} from '@phosphor-icons/react'
import {
  DocsCardGrid,
  DocsFeatureCard,
  DocsHero,
  DocsList,
  DocsP,
  DocsParams,
  DocsSection,
  DocsSubheading,
  DocsTable,
} from '../components'

export function DocsTokenomics() {
  return (
    <div>
      <DocsHero
        icon={Coins}
        eyebrow="Tokenomics"
        title="Tokenomics"
        description="The CWT token powers protocol governance — reviewer council policy, methodology and accountability. It does not buy influence over project risk scores."
      />

      <DocsSection icon={Coins} title="Token Overview">
        <DocsParams
          params={[
            { label: 'Token Name', value: 'Crypto Watcher Token' },
            { label: 'Symbol', value: 'CWT' },
            { label: 'Total Supply', value: '100,000,000 CWT' },
            { label: 'Type', value: 'ERC20 (Votes Extension)' },
            { label: 'Network', value: 'Base (Ethereum L2)' },
          ]}
        />
        <DocsP>
          CWT is a <strong className="text-foreground">protocol governance token</strong>.
          Holding CWT lets you propose and vote on how the platform operates — not on
          individual project ratings. We explicitly reject vote-to-rate models where
          influence on scores can be purchased.
        </DocsP>
      </DocsSection>

      <DocsSection icon={ChartLineDown} title="Token Distribution">
        <DocsSubheading>Initial Allocation</DocsSubheading>
        <DocsTable
          headers={['Category', 'Allocation', 'Vesting']}
          rows={[
            ['Protocol Treasury', '40%', 'Governed by DAO for reviewer ops + grants'],
            ['Team & Advisors', '20%', '2-year cliff, 4-year vest'],
            ['Community & Ecosystem', '20%', 'Governance participation incentives'],
            ['Early Supporters', '15%', '1-year cliff, 2-year vest'],
            ['Liquidity', '5%', 'Immediate'],
          ]}
        />
      </DocsSection>

      <DocsSection icon={Stack} title="Token Utility">
        <DocsSubheading>Protocol Governance</DocsSubheading>
        <DocsP>CWT holders participate in protocol decisions by:</DocsP>
        <DocsList
          items={[
            'Voting on reviewer council roster and policy changes',
            'Approving review methodology versions and fee schedules',
            'Delegating voting power for protocol proposals',
            'Funding treasury allocations for reviewer operations',
          ]}
        />
        <DocsSubheading>What CWT Does Not Do</DocsSubheading>
        <DocsList
          items={[
            'It does not grant the right to vote on individual project risk scores',
            'It does not increase public voting weight on ratings',
            'It is not a pay-to-rate mechanism',
          ]}
        />
        <DocsSubheading>Revenue model</DocsSubheading>
        <DocsP>
          The primary revenue source is fees paid by parties who request a formal review
          (projects, teams, or interested users). These fees are directed to the protocol
          treasury.
        </DocsP>
        <DocsSubheading>Reviewer Compensation</DocsSubheading>
        <DocsP>
          Governors are compensated from the treasury for completed reviews and high-quality
          work. Compensation parameters, fee schedules and treasury allocations are decided
          through CWT governance — not by individual projects or public token votes on scores.
          This model is designed to align with professional audit and research practices. `[Phase 1]`
        </DocsP>
      </DocsSection>

      <DocsSection icon={UsersThree} title="Reviewer Economics">
        <DocsP>
          Reviewers are selected and vetted by the platform, with roster changes subject
          to protocol governance. Compensation and accountability are designed around
          professional audit norms — not crowd voting rewards.
        </DocsP>
        <DocsParams
          params={[
            { label: 'Score authority', value: 'Governor council only' },
            { label: 'Public score voting', value: 'Not supported' },
            { label: 'Trust signal', value: 'Expertise + transparency' },
          ]}
        />
      </DocsSection>

      <DocsSection icon={ShieldWarning} title="Accountability">
        <DocsSubheading>Governor Misconduct Penalties</DocsSubheading>
        <DocsP>Reviewers can face penalties for:</DocsP>
        <DocsList
          items={[
            'Undisclosed conflicts of interest',
            'Falsified or negligent reports',
            'Failure to follow published methodology',
          ]}
        />
        <DocsSubheading>Proposal Thresholds (Protocol Only)</DocsSubheading>
        <DocsParams
          params={[
            { label: 'Creating protocol proposals', value: '10,000 CWT' },
            { label: 'Quorum', value: '4% of total supply' },
          ]}
        />
      </DocsSection>

      <DocsSection icon={Scales} title="Future Considerations">
        <DocsP>
          Tokenomics may evolve through governance decisions focused on protocol
          sustainability:
        </DocsP>
        <DocsCardGrid columns={2}>
          <DocsFeatureCard icon={Gift} title="Reviewer compensation model">
            Tune treasury allocations for sustainable expert review throughput.
          </DocsFeatureCard>
          <DocsFeatureCard icon={ShieldWarning} title="Accountability parameters">
            Calibrate penalties for governor misconduct.
          </DocsFeatureCard>
          <DocsFeatureCard icon={Stack} title="Methodology governance">
            On-chain references to review methodology versions.
          </DocsFeatureCard>
          <DocsFeatureCard icon={Lock} title="Cross-chain expansion">
            Extend protocol governance to additional networks.
          </DocsFeatureCard>
        </DocsCardGrid>
      </DocsSection>
    </div>
  )
}
