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
} from '../components'

export function DocsWhitepaper() {
  return (
    <div>
      <DocsHero
        icon={Rocket}
        eyebrow="Whitepaper"
        title="Whitepaper"
        description="A comprehensive overview of the Crypto Watcher protocol — expert-governed risk assessment, transparent methodology and protocol governance."
      />

      <DocsSection icon={Star} title="Abstract">
        <DocsP>
          The cryptocurrency market faces a significant information asymmetry problem.
          Investors struggle to distinguish legitimate projects from scams, and existing
          rating systems often lack transparency or can be manipulated.
        </DocsP>
        <DocsP>
          Crypto Watcher introduces a professional approach to project risk assessment: a
          vetted governor council with expertise in smart contract security, protocol
          design, tokenomics, compliance, infrastructure and on-chain analysis publishes
          official scores and structured reports. Trust comes from reviewer expertise and
          transparency — not from token-weighted public voting or popularity.
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
        <DocsP>
          Traditional and crowd-sourced rating systems are vulnerable to manipulation
          through:
        </DocsP>
        <DocsList
          items={[
            'Vote-to-rate models where influence can be purchased',
            'Sybil attacks and coordinated brigading',
            'Paid reviews and astroturfed sentiment',
            'Conflicts of interest among rating providers',
            'Popularity mistaken for expertise',
          ]}
        />
      </DocsSection>

      <DocsSection icon={Stack} title="Solution Architecture">
        <DocsSubheading>Expert Governor Council</DocsSubheading>
        <DocsP>
          At the core of Crypto Watcher is a curated council of vetted reviewers. Only
          governors/admins may investigate projects and publish official risk scores.
          Reviewers are selected for demonstrated expertise and held accountable through:
        </DocsP>
        <DocsList
          items={[
            'Transparent, versioned review methodology',
            'Conflict-of-interest disclosure on every report',
            'Evidence-based scoring with cited findings',
            'Appeals and re-review by the council (not token votes)',
            'Whistleblowing and community incident reporting',
          ]}
        />
        <DocsSubheading>Public Participation (Without Score Influence)</DocsSubheading>
        <DocsP>Regular users contribute to the ecosystem by:</DocsP>
        <DocsList
          items={[
            'Reading expert reports and published scores',
            'Sharing evidence and sources in project comments',
            'Requesting a review of a project (free during launch)',
            'Reporting incidents through a dedicated flow (planned)',
          ]}
        />
        <DocsSubheading>Per-Project On-Chain Registry</DocsSubheading>
        <DocsP>Each reviewed project receives an on-chain record that:</DocsP>
        <DocsList
          items={[
            'Anchors the published score and methodology version',
            'Provides an immutable audit trail',
            'Emits events for indexing and analytics',
            'Does not enable public vote-to-rate on scores',
          ]}
        />
        <DocsSubheading>Protocol Governance</DocsSubheading>
        <DocsP>CWT governs protocol parameters — not individual project ratings:</DocsP>
        <DocsList
          items={[
            'Reviewer council roster and policy',
            'Review methodology versions',
            'Fee schedules and treasury allocations',
            'Whistleblowing and appeals policy',
          ]}
        />
      </DocsSection>

      <DocsSection icon={Cube} title="Economic Model">
        <DocsSubheading>Token Utility</DocsSubheading>
        <DocsP>The governance token serves protocol governance only:</DocsP>
        <DocsList
          items={[
            <>
              <strong className="text-foreground">Protocol voting:</strong> CWT holders
              vote on reviewer policy and methodology — not project scores
            </>,
            <>
              <strong className="text-foreground">Treasury:</strong> Funds reviewer
              operations and compensation
            </>,
            <>
              <strong className="text-foreground">Accountability:</strong> Penalties for
              governor misconduct
            </>,
            <>
              <strong className="text-foreground">Explicitly excluded:</strong>{' '}
              Pay-to-rate, vote-to-rate, or purchasable score influence
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
            'Role-gated score publication (governors only)',
            'Gradual decentralization of protocol governance',
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
              'Governor council reviews + structured reports',
              'Per-project on-chain registry',
              'Protocol governance token launch',
              'Public comments + evidence submission',
            ]}
          />
          <DocsPhaseCard
            phase="Phase 2"
            title="Accountability"
            items={[
              'Reviewer reputation + misconduct penalties',
              'Whistleblowing workflow',
              'Methodology versioning on-chain',
            ]}
          />
          <DocsPhaseCard
            phase="Phase 3"
            title="Scale"
            items={[
              'Expanded council specializations',
              'Multi-chain deployment',
              'External data integrations for governors',
            ]}
          />
        </DocsCardGrid>
      </DocsSection>

      <DocsSection icon={ShieldCheck} title="Conclusion">
        <DocsP>
          Crypto Watcher creates a trustworthy information layer for crypto investing by
          combining expert review with transparent methodology — similar to how people
          trust security auditors, credit rating agencies and professional analysts.
          Influence on scores is earned through expertise and accountability, not token
          ownership.
        </DocsP>
      </DocsSection>
    </div>
  )
}
