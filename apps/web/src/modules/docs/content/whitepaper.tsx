import {
  Cube,
  Lock,
  Rocket,
  ShieldCheck,
  Stack,
  Star,
  Warning,
} from '@phosphor-icons/react'
import {
  DocsCardGrid,
  DocsHero,
  DocsList,
  DocsP,
  DocsPhaseCard,
  DocsSection,
  DocsSubheading,
} from '../components/docs-ui'

export function DocsWhitepaper() {
  return (
    <div>
      <DocsHero
        icon={Rocket}
        eyebrow="Whitepaper"
        title="Whitepaper"
        description="A comprehensive overview of the Crypto Watcher protocol, its design principles, and technical implementation."
      />

      <DocsSection icon={Star} title="Abstract">
        <DocsP>
          The cryptocurrency market faces a significant information asymmetry problem.
          Investors struggle to distinguish legitimate projects from scams, and existing
          rating systems often lack transparency or can be manipulated.
        </DocsP>
        <DocsP>
          Crypto Watcher introduces a novel approach to project risk assessment using
          reputation-weighted community voting. By leveraging blockchain technology and
          economic incentives, we create a trustworthy, manipulation-resistant system for
          evaluating crypto projects.
        </DocsP>
      </DocsSection>

      <DocsSection icon={Warning} title="Problem Statement">
        <DocsSubheading>Information Asymmetry</DocsSubheading>
        <DocsP>
          The crypto market is characterized by significant information asymmetry between
          project teams and potential investors. Teams have complete knowledge of their
          project's technical details, financial situation, and future plans, while
          investors must rely on limited public information.
        </DocsP>
        <DocsSubheading>Rating Manipulation</DocsSubheading>
        <DocsP>Traditional rating systems are vulnerable to manipulation through:</DocsP>
        <DocsList
          items={[
            'Sybil attacks (creating multiple fake accounts)',
            'Paid reviews and ratings',
            'Conflicts of interest among rating providers',
            'Centralized control over rating methodology',
          ]}
        />
      </DocsSection>

      <DocsSection icon={Stack} title="Solution Architecture">
        <DocsSubheading>Reputation System</DocsSubheading>
        <DocsP>
          At the core of Crypto Watcher is a reputation system that assigns weights to
          user votes based on their track record. Reputation is earned through:
        </DocsP>
        <DocsList
          items={[
            'Accurate predictions (voting aligned with eventual outcomes)',
            'Tenure in the community',
            'Stake in the governance token',
            'Contributions to project analysis',
          ]}
        />
        <DocsSubheading>Per-Project Voting Contracts</DocsSubheading>
        <DocsP>Each project under analysis receives its own smart contract that:</DocsP>
        <DocsList
          items={[
            'Records all votes immutably on-chain',
            'Enforces eligibility requirements',
            'Calculates weighted scores automatically',
            'Emits events for indexing and analytics',
          ]}
        />
        <DocsSubheading>Governance</DocsSubheading>
        <DocsP>Protocol parameters are controlled through on-chain governance:</DocsP>
        <DocsList
          items={[
            'Voting duration periods',
            'Minimum reputation thresholds',
            'Reward distribution rates',
            'Eligibility criteria',
          ]}
        />
      </DocsSection>

      <DocsSection icon={Cube} title="Economic Model">
        <DocsSubheading>Token Utility</DocsSubheading>
        <DocsP>The governance token serves multiple purposes:</DocsP>
        <DocsList
          items={[
            <>
              <strong className="text-foreground">Voting Power:</strong> Token holders
              can vote on protocol changes
            </>,
            <>
              <strong className="text-foreground">Staking:</strong> Staked tokens
              contribute to reputation weight
            </>,
            <>
              <strong className="text-foreground">Rewards:</strong> Distributed to
              accurate voters
            </>,
            <>
              <strong className="text-foreground">Penalties:</strong> Slashed for
              malicious behavior
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection icon={Lock} title="Security Considerations">
        <DocsP>The protocol implements several security measures:</DocsP>
        <DocsList
          items={[
            'Timelock on governance actions',
            'Multi-sig requirements for critical operations',
            'Pause functionality for emergencies',
            'Gradual decentralization roadmap',
          ]}
        />
      </DocsSection>

      <DocsSection icon={Rocket} title="Roadmap">
        <DocsCardGrid columns={3}>
          <DocsPhaseCard
            phase="Phase 1"
            title="MVP"
            active
            items={[
              'Basic reputation system',
              'Per-project voting contracts',
              'Governance token launch',
              'Web application',
            ]}
          />
          <DocsPhaseCard
            phase="Phase 2"
            title="Enhanced Features"
            items={[
              'Multi-factor reputation',
              'Reward distribution',
              'Advanced analytics',
            ]}
          />
          <DocsPhaseCard
            phase="Phase 3"
            title="Decentralization"
            items={[
              'Full DAO governance',
              'Multi-chain deployment',
              'External data integrations',
            ]}
          />
        </DocsCardGrid>
      </DocsSection>

      <DocsSection icon={ShieldCheck} title="Conclusion">
        <DocsP>
          Crypto Watcher represents a significant step forward in creating transparent,
          community-driven risk assessment for crypto projects. By combining reputation
          systems with blockchain technology, we can create a more trustworthy
          information ecosystem for the crypto industry.
        </DocsP>
      </DocsSection>
    </div>
  )
}
