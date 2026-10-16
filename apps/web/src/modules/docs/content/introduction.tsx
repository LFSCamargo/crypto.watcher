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
} from '../components'

export function DocsIntroduction() {
  return (
    <div>
      <DocsHero
        icon={BookOpen}
        eyebrow="Introduction"
        title="Introduction to Crypto Watcher"
        description="Crypto Watcher is an expert-governed risk analysis platform for crypto projects. Official scores come from a vetted governor council — not from public vote-to-rate."
      />

      <DocsSection icon={ShieldCheck} title="What is Crypto Watcher?">
        <DocsP>
          In the fast-moving world of cryptocurrency, making informed investment decisions
          is crucial. Crypto Watcher provides a transparent system for analyzing the risk
          and potential of crypto projects through{' '}
          <strong className="text-foreground">expert review</strong>, structured reports
          and evidence-based scoring.
        </DocsP>
        <DocsP>
          Unlike crowd-sourced rating sites, Crypto Watcher restricts review authority to
          a <strong className="text-foreground">curated governor council</strong> with
          demonstrated expertise in smart contract security, protocol design, tokenomics,
          compliance, infrastructure and on-chain analysis. Trust comes from reviewer
          expertise and transparency — not token ownership or popularity.
        </DocsP>
      </DocsSection>

      <DocsSection icon={Lightning} title="Core Features">
        <DocsCardGrid columns={2}>
          <DocsFeatureCard icon={Scales} title="Expert Governor Reviews">
            Only vetted reviewers investigate projects and publish official risk scores
            and structured reports.
          </DocsFeatureCard>
          <DocsFeatureCard icon={Cube} title="On-Chain Audit Trail">
            Published outcomes are anchored on-chain for transparency and immutability.
          </DocsFeatureCard>
          <DocsFeatureCard icon={Coins} title="Protocol Governance">
            CWT holders govern reviewer selection, methodology and accountability — not
            individual project scores.
          </DocsFeatureCard>
          <DocsFeatureCard icon={ChartPieSlice} title="Per-Project Registry">
            Each reviewed project gets an on-chain record for auditability.
          </DocsFeatureCard>
        </DocsCardGrid>
      </DocsSection>

      <DocsSection icon={Lightning} title="How It Works">
        <DocsSteps
          steps={[
            {
              title: 'Review Requested',
              description:
                'A user or team requests a review; the request enters the review queue.',
            },
            {
              title: 'Analysis Period',
              description:
                'Governors investigate; anyone signed in can comment and share evidence.',
            },
            {
              title: 'Governor Review',
              description:
                'The council evaluates risks, audits available information and drafts a structured report.',
            },
            {
              title: 'Report Published',
              description:
                'The official risk score and report are published for all users to read.',
            },
          ]}
        />
      </DocsSection>

      <DocsSection icon={ShieldCheck} title="Getting Started">
        <DocsSteps
          steps={[
            {
              title: 'Browse projects',
              description:
                'Search the safety index and read expert-reviewed scores — no wallet required.',
            },
            {
              title: 'Participate in discussion',
              description:
                'Share evidence and sources in project comments to help governors investigate.',
            },
            {
              title: 'Request a review',
              description:
                'Submit a project for the governor council to investigate — free during launch.',
            },
          ]}
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <Link to="/docs/whitepaper">
              Read the whitepaper
              <ArrowRight size={16} aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app">Browse projects</Link>
          </Button>
        </div>
      </DocsSection>
    </div>
  )
}
