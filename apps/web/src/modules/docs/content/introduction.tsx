import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  ChartPieSlice,
  Coins,
  Cube,
  Lightning,
  Scales,
  ShieldCheck,
} from '@phosphor-icons/react'
import { Button } from '../../../components/ui'
import {
  DocsCardGrid,
  DocsFeatureCard,
  DocsHero,
  DocsP,
  DocsSection,
  DocsSteps,
} from '../components/docs-ui'

export function DocsIntroduction() {
  return (
    <div>
      <DocsHero
        icon={BookOpen}
        eyebrow="Introduction"
        title="Introduction to Crypto Watcher"
        description="Crypto Watcher is a reputation-weighted risk analysis platform for crypto projects. It helps users make informed investment decisions through community-driven analysis."
      />

      <DocsSection icon={ShieldCheck} title="What is Crypto Watcher?">
        <DocsP>
          In the fast-moving world of cryptocurrency, making informed investment
          decisions is crucial. Crypto Watcher provides a transparent, on-chain system
          for analyzing the risk and potential of crypto projects through community
          participation.
        </DocsP>
        <DocsP>
          Unlike traditional rating systems, Crypto Watcher uses{' '}
          <strong className="text-foreground">reputation-weighted voting</strong>. This
          means that votes from trustworthy, experienced users carry more weight than
          those from newcomers or unverified accounts.
        </DocsP>
      </DocsSection>

      <DocsSection icon={Lightning} title="Core Features">
        <DocsCardGrid columns={2}>
          <DocsFeatureCard icon={Scales} title="Reputation-Weighted Voting">
            Your voting power is proportional to your reputation score, so trusted
            voices shape the outcome.
          </DocsFeatureCard>
          <DocsFeatureCard icon={Cube} title="On-Chain Transparency">
            All votes and scores are stored on the blockchain and cannot be tampered
            with.
          </DocsFeatureCard>
          <DocsFeatureCard icon={Coins} title="Governance Token">
            Earn tokens by participating and use them to shape the protocol's future.
          </DocsFeatureCard>
          <DocsFeatureCard icon={ChartPieSlice} title="Per-Project Contracts">
            Each project gets its own smart contract for maximum transparency.
          </DocsFeatureCard>
        </DocsCardGrid>
      </DocsSection>

      <DocsSection icon={Lightning} title="How It Works">
        <DocsSteps
          steps={[
            {
              title: 'Project Submission',
              description:
                'A project is submitted for analysis and a voting contract is deployed.',
            },
            {
              title: 'Analysis Period',
              description:
                'Community members can comment and share their research.',
            },
            {
              title: 'Voting Period',
              description: 'Eligible users cast their weighted votes.',
            },
            {
              title: 'Score Calculation',
              description:
                'The final risk score is calculated and recorded on-chain.',
            },
          ]}
        />
      </DocsSection>

      <DocsSection icon={ShieldCheck} title="Getting Started">
        <DocsSteps
          steps={[
            {
              title: 'Connect your wallet',
              description: 'MetaMask, Rainbow, or any WalletConnect wallet.',
            },
            {
              title: 'Build your reputation',
              description: 'Participate in the community to grow your voting power.',
            },
            {
              title: 'Start voting',
              description:
                'Vote on projects once you meet the eligibility requirements.',
            },
          ]}
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <Link to="/docs/whitepaper">
              Read Whitepaper
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app">Launch App</Link>
          </Button>
        </div>
      </DocsSection>
    </div>
  )
}
