import {
  Coins,
  Gear,
  Lifebuoy,
  Question,
  Scales,
  Star,
} from '@phosphor-icons/react'
import { DocsFaqItem, DocsHero, DocsList, DocsP, DocsSection } from '../components/docs-ui'

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
            Crypto Watcher is a reputation-weighted risk analysis platform for crypto
            projects. It uses community voting to assess the risk and potential of crypto
            projects, with votes weighted by user reputation.
          </DocsP>
        </DocsFaqItem>
        <DocsFaqItem question="How is this different from other rating sites?">
          <DocsList
            items={[
              'Stores all data on-chain for transparency',
              'Weights votes by reputation, not just count',
              'Rewards accurate voters with tokens',
              'Is governed by the community',
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

      <DocsSection icon={Scales} title="Voting">
        <DocsFaqItem question="Who can vote?">
          <DocsP>To vote on project risk assessments, you must:</DocsP>
          <DocsList
            items={[
              'Connect a wallet with a verified address',
              'Meet the minimum reputation threshold',
              'Not have voted on the same project already',
            ]}
          />
        </DocsFaqItem>
        <DocsFaqItem question="How is my vote weighted?">
          <DocsP>
            Your vote weight is determined by your reputation score, which is based on:
          </DocsP>
          <DocsList
            items={[
              'Historical voting accuracy',
              'Time in the community',
              'Token stake',
              'Contribution quality',
            ]}
          />
        </DocsFaqItem>
        <DocsFaqItem question="Can I change my vote?">
          <DocsP>
            No, once a vote is cast, it cannot be changed. This is by design to prevent
            vote manipulation based on late-breaking information.
          </DocsP>
        </DocsFaqItem>
      </DocsSection>

      <DocsSection icon={Star} title="Reputation">
        <DocsFaqItem question="How do I build reputation?">
          <DocsList
            items={[
              <>
                <strong className="text-foreground">Accurate voting:</strong> Votes that
                align with the final outcome
              </>,
              <>
                <strong className="text-foreground">Time:</strong> Longer membership
                increases reputation
              </>,
              <>
                <strong className="text-foreground">Staking:</strong> Staked tokens
                contribute to reputation
              </>,
              <>
                <strong className="text-foreground">Contributions:</strong> Quality
                analysis and comments
              </>,
            ]}
          />
        </DocsFaqItem>
        <DocsFaqItem question="Can I lose reputation?">
          <DocsP>Yes, reputation can decrease due to:</DocsP>
          <DocsList
            items={[
              'Consistently inaccurate voting',
              'Malicious behavior (slashing)',
              'Inactivity decay',
            ]}
          />
        </DocsFaqItem>
      </DocsSection>

      <DocsSection icon={Coins} title="Tokens">
        <DocsFaqItem question="What is the CWT token used for?">
          <DocsList
            items={[
              'Governance voting on protocol changes',
              'Staking to increase reputation weight',
              'Rewards for accurate voting',
            ]}
          />
        </DocsFaqItem>
        <DocsFaqItem question="How do I earn tokens?">
          <DocsList
            items={[
              'Voting accurately on project assessments',
              'Staking rewards',
              'Community contribution rewards',
            ]}
          />
        </DocsFaqItem>
        <DocsFaqItem question="Where can I buy CWT tokens?">
          <DocsP>
            During the testnet phase, tokens are not tradeable. Once the mainnet launches,
            token availability will be announced.
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
