import {
  Coins,
  Gear,
  Lifebuoy,
  Question,
  Scales,
  ShieldCheck,
  Star,
} from '@phosphor-icons/react'
import { DocsFaqItem, DocsHero, DocsList, DocsP, DocsSection } from '../components'

export function DocsFAQ() {
  return (
    <div>
      <DocsHero
        icon={Question}
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Common questions about Crypto Watcher and how to use the platform."
      />

      <DocsSection icon={Question} title="General">
        <DocsFaqItem question="What is Crypto Watcher?">
          <DocsP>
            Crypto Watcher is an expert-governed risk analysis platform for crypto
            projects. Official risk scores and structured reports are published by a
            vetted governor council — not by public token-weighted voting.
          </DocsP>
        </DocsFaqItem>
        <DocsFaqItem question="How is this different from other rating sites?">
          <DocsList
            items={[
              'Scores come from vetted expert reviewers, not crowd votes',
              'Transparent methodology and conflict-of-interest disclosure',
              'Public can submit evidence and report incidents — but not set the score',
              'Protocol governed by CWT holders; project scores governed by experts',
            ]}
          />
        </DocsFaqItem>
        <DocsFaqItem question="What blockchain does Crypto Watcher use?">
          <DocsP>
            Crypto Watcher is deployed on Base, an Ethereum Layer 2 network. This provides
            low transaction costs while maintaining Ethereum security.
          </DocsP>
        </DocsFaqItem>
      </DocsSection>

      <DocsSection icon={ShieldCheck} title="Reviews & Scores">
        <DocsFaqItem question="Who publishes project risk scores?">
          <DocsP>
            Only vetted governors/admins on the expert council. They investigate projects,
            audit available information, evaluate risks and publish structured reports with
            an official score.
          </DocsP>
        </DocsFaqItem>
        <DocsFaqItem question="Can regular users vote on project scores?">
          <DocsP>
            No. Regular users cannot influence the final risk score through tokens or public
            voting. You can read reports, submit evidence, report incidents and discuss —
            but score authority stays with the governor council.
          </DocsP>
        </DocsFaqItem>
        <DocsFaqItem question="How can I contribute without voting on scores?">
          <DocsList
            items={[
              'Submit evidence for governor review',
              'Report incidents or suspicious activity',
              'Participate in public comments and discussion',
              'Request a paid review for a project you care about',
            ]}
          />
        </DocsFaqItem>
      </DocsSection>

      <DocsSection icon={Star} title="Reviewer Council">
        <DocsFaqItem question="How are reviewers selected?">
          <DocsP>
            Reviewers are carefully selected and vetted by the platform for demonstrated
            expertise in areas such as smart contract security, protocol design, tokenomics,
            compliance, infrastructure and on-chain analysis. Roster changes are subject to
            protocol governance.
          </DocsP>
        </DocsFaqItem>
        <DocsFaqItem question="How are reviewers held accountable?">
          <DocsList
            items={[
              'Conflict-of-interest disclosure on every report',
              'Transparent, versioned review methodology',
              'Appeals and re-review by the council',
              'Penalties for misconduct (Phase 1)',
            ]}
          />
        </DocsFaqItem>
      </DocsSection>

      <DocsSection icon={Coins} title="Tokens">
        <DocsFaqItem question="What is the CWT token used for?">
          <DocsList
            items={[
              'Protocol governance: reviewer policy, methodology, fees, treasury',
              'Vote delegation for protocol proposals',
              'Does NOT grant influence over individual project risk scores',
            ]}
          />
        </DocsFaqItem>
        <DocsFaqItem question="Can I buy influence on project ratings with CWT?">
          <DocsP>
            No. Crypto Watcher explicitly rejects vote-to-rate and pay-to-rate models.
            Trust comes from reviewer expertise and transparency, not token ownership.
          </DocsP>
        </DocsFaqItem>
        <DocsFaqItem question="Where can I buy CWT tokens?">
          <DocsP>
            During the testnet phase, tokens are not tradeable. Once the mainnet launches,
            token availability will be announced.
          </DocsP>
        </DocsFaqItem>
      </DocsSection>

      <DocsSection icon={Scales} title="Governance">
        <DocsFaqItem question="What can I vote on with CWT?">
          <DocsP>
            Protocol decisions only: reviewer council roster, review methodology, fee
            schedules, treasury allocations and similar platform parameters. You cannot use
            CWT to vote on individual project risk scores.
          </DocsP>
        </DocsFaqItem>
      </DocsSection>

      <DocsSection icon={Gear} title="Technical">
        <DocsFaqItem question="What wallets are supported?">
          <DocsP>
            Crypto Watcher supports any wallet that works with WalletConnect, including:
          </DocsP>
          <DocsList
            items={['MetaMask', 'Rainbow', 'Coinbase Wallet', 'Trust Wallet', 'And many more']}
          />
        </DocsFaqItem>
        <DocsFaqItem question="Are the smart contracts audited?">
          <DocsP>
            The contracts are currently on testnet and undergoing internal review.
            Professional audits are planned before mainnet deployment.
          </DocsP>
        </DocsFaqItem>
        <DocsFaqItem question="Is the code open source?">
          <DocsP>
            Yes, all smart contract code is open source and available on GitHub for
            review.
          </DocsP>
        </DocsFaqItem>
      </DocsSection>

      <DocsSection icon={Lifebuoy} title="Support">
        <DocsFaqItem question="Where can I get help?">
          <DocsList
            items={[
              'Join our Discord community',
              'Follow us on Twitter for updates',
              'Check this documentation',
              'Open an issue on GitHub',
            ]}
          />
        </DocsFaqItem>
      </DocsSection>
    </div>
  )
}
