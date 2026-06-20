import {
  ChartLineDown,
  Coins,
  Gift,
  Lock,
  Scales,
  ShieldWarning,
  Stack,
  TrendUp,
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
} from '../components/docs-ui'

export function DocsTokenomics() {
  return (
    <div>
      <DocsHero
        icon={Coins}
        eyebrow="Tokenomics"
        title="Tokenomics"
        description="Understanding the economic model and token distribution of the Crypto Watcher governance token."
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
      </DocsSection>

      <DocsSection icon={ChartLineDown} title="Token Distribution">
        <DocsSubheading>Initial Allocation</DocsSubheading>
        <DocsTable
          headers={['Category', 'Allocation', 'Vesting']}
          rows={[
            ['Community Rewards', '40%', 'Released over 4 years'],
            ['Team & Advisors', '20%', '2-year cliff, 4-year vest'],
            ['Treasury', '20%', 'Governed by DAO'],
            ['Early Supporters', '15%', '1-year cliff, 2-year vest'],
            ['Liquidity', '5%', 'Immediate'],
          ]}
        />
      </DocsSection>

      <DocsSection icon={Stack} title="Token Utility">
        <DocsSubheading>Governance</DocsSubheading>
        <DocsP>CWT holders can participate in protocol governance by:</DocsP>
        <DocsList
          items={[
            'Creating proposals for protocol changes',
            'Voting on active proposals',
            'Delegating voting power to other addresses',
          ]}
        />
        <DocsSubheading>Staking</DocsSubheading>
        <DocsP>Tokens can be staked to:</DocsP>
        <DocsList
          items={[
            'Increase reputation weight',
            'Earn additional rewards',
            'Demonstrate long-term commitment',
          ]}
        />
        <DocsSubheading>Rewards</DocsSubheading>
        <DocsP>Tokens are distributed as rewards for:</DocsP>
        <DocsList
          items={[
            'Accurate voting (aligned with final outcomes)',
            'Active participation in analysis',
            'Quality contributions to the community',
          ]}
        />
      </DocsSection>

      <DocsSection icon={TrendUp} title="Emission Schedule">
        <DocsP>
          Community rewards are distributed according to a declining emission schedule:
        </DocsP>
        <DocsParams
          params={[
            { label: 'Year 1', value: '40% of allocation' },
            { label: 'Year 2', value: '30% of allocation' },
            { label: 'Year 3', value: '20% of allocation' },
            { label: 'Year 4', value: '10% of allocation' },
          ]}
        />
      </DocsSection>

      <DocsSection icon={ShieldWarning} title="Economic Security">
        <DocsSubheading>Slashing</DocsSubheading>
        <DocsP>To discourage malicious behavior, staked tokens can be slashed for:</DocsP>
        <DocsList
          items={[
            'Coordinated voting manipulation',
            'Sybil attack attempts',
            'Spreading false information',
          ]}
        />
        <DocsSubheading>Minimum Stake Requirements</DocsSubheading>
        <DocsP>Certain actions require minimum token stakes:</DocsP>
        <DocsParams
          params={[
            { label: 'Creating proposals', value: '10,000 CWT' },
            { label: 'Enhanced voting weight', value: '1,000 CWT' },
            { label: 'Becoming a validator', value: '50,000 CWT' },
          ]}
        />
      </DocsSection>

      <DocsSection icon={Scales} title="Future Considerations">
        <DocsP>
          The tokenomics model may evolve through governance decisions, including:
        </DocsP>
        <DocsCardGrid columns={2}>
          <DocsFeatureCard icon={Gift} title="Adjusting reward rates">
            Tune emission and reward distribution as the community grows.
          </DocsFeatureCard>
          <DocsFeatureCard icon={ShieldWarning} title="Modifying slashing parameters">
            Calibrate penalties to keep the system fair and secure.
          </DocsFeatureCard>
          <DocsFeatureCard icon={Stack} title="Adding new utility functions">
            Expand what CWT can do across the protocol over time.
          </DocsFeatureCard>
          <DocsFeatureCard icon={Lock} title="Cross-chain expansion">
            Extend the token and voting to additional networks.
          </DocsFeatureCard>
        </DocsCardGrid>
      </DocsSection>
    </div>
  )
}
