import type { CuratedProject } from './curated-projects'
import type { ExternalSecurityReview, ProjectReviewProfile, SafetyVerdict } from './project-review-types'
import { resolveCreditRatingFromSafetyScore } from '../../../lib/ratings/credit-rating'

const METHODOLOGY_VERSION = 'CW-Review-v1.2'

const REVIEW_OVERRIDES: Partial<
  Record<string, Omit<ProjectReviewProfile, 'lastReviewedAt' | 'methodologyVersion' | 'creditRating'>>
> = {
  bitcoin: {
    verdict: 'low_risk',
    headline: 'Battle-tested monetary network with no smart-contract attack surface',
    summary:
      'Bitcoin has no general-purpose smart contracts. Its risk profile is driven by protocol maturity, consensus security, and operational custody practices rather than code exploits in DeFi-style contracts.',
    strengths: [
      'No Turing-complete smart contracts — eliminates reentrancy, integer overflow, and most contract-level exploit classes',
      '20+ years of continuous operation with the highest cumulative proof-of-work security',
      'Minimal, well-understood monetary rules with transparent issuance',
    ],
    risks: [
      'User risk is almost entirely in custody, exchange, and self-custody key management',
      'Mining concentration and fee market dynamics during congestion',
      'Regulatory treatment of Bitcoin as an asset class',
    ],
    externalReviews: [
      {
        provider: 'Other',
        title: 'Bitcoin Core — Public security process and historical vulnerabilities',
        completedAt: 'Ongoing',
        url: 'https://github.com/bitcoin/bitcoin/blob/master/SECURITY.md',
        status: 'informational',
        scope: 'Reference implementation disclosure process',
      },
    ],
    governorNotes:
      'No smart contract surface to audit. Safety for holders depends on wallet hygiene and custody choice, not protocol code audits.',
  },
  ethereum: {
    verdict: 'low_risk',
    headline: 'Mature base layer with extensive client and contract audit history',
    summary:
      'The Ethereum base layer (consensus + execution) has been reviewed by multiple independent teams. Smart contract risk lives in the applications built on top, not the L1 itself.',
    strengths: [
      'Multiple independent client implementations with public security reviews',
      'Long history of bug bounties and coordinated disclosure for the EVM and consensus',
      'Standards (ERC-20/721 etc.) have been battle-tested at massive scale',
    ],
    risks: [
      'Application-layer smart contracts on Ethereum can still be exploited regardless of L1 security',
      'Cross-L2 bridge and messaging risk for assets moving off the canonical chain',
      'MEV and transaction ordering can create economic attacks on DeFi apps',
    ],
    externalReviews: [
      {
        provider: 'Consensys Diligence',
        title: 'Ethereum 2.0 / Beacon Chain and deposit contract reviews (public reports)',
        completedAt: '2020-2022',
        url: 'https://consensys.io/diligence/audits/2020/11/ethereum-2-deposit-contract/',
        status: 'passed',
        scope: 'Deposit contract and early consensus components',
      },
    ],
    governorNotes:
      'L1 score does not mean “every dApp on Ethereum is safe”. Individual smart contracts must still be reviewed.',
  },
  solana: {
    verdict: 'moderate_risk',
    headline: 'High-performance chain; base layer has seen client and runtime issues historically',
    summary:
      'Solana uses a custom runtime (not EVM). There is no single “Solana smart contract audit”. Safety depends heavily on the specific program being used. The base layer has had multiple validator/client incidents.',
    strengths: [
      'Rapid finality and high throughput for payments/DeFi use cases',
      'Several major programs have received professional Rust audits',
      'Active validator set and significant economic security via stake',
    ],
    risks: [
      'Past network halts and client restarts demonstrated operational risk',
      'Most user risk is in unaudited or low-quality programs, not the base runtime',
      'Validator concentration and geographic distribution',
    ],
    externalReviews: [
      {
        provider: 'OtterSec',
        title: 'Multiple Solana program security reviews (example public work)',
        completedAt: '2023-2025',
        url: 'https://osec.io/',
        status: 'passed_with_issues',
        scope: 'Individual on-chain programs (not base layer)',
      },
    ],
    governorNotes:
      'Solana has no equivalent to “EVM contract audited by OpenZeppelin”. Every major program needs its own review. Base layer incidents have occurred.',
  },
  uniswap: {
    verdict: 'low_risk',
    headline: 'Market-leading DEX with repeatedly audited core contracts',
    summary:
      'Uniswap’s concentrated liquidity and routing contracts are among the most reviewed in DeFi. Risk remains in peripheral integrations, unvetted forks and governance proposals that alter fee switches or deployments.',
    strengths: [
      'Multiple independent audits on v2/v3/v4 core contracts with public reports',
      'Minimal upgradeability on deployed pool factories reduces admin-key surprise risk',
      'Deep liquidity and long operational track record across market cycles',
    ],
    risks: [
      'Governance can enable fee switches or new deployments — monitor proposals',
      'Third-party interfaces and fake tokens create phishing rather than protocol risk',
      'Composable hooks/extensions increase review surface in newer versions',
    ],
    externalReviews: [
      {
        provider: 'Trail of Bits',
        title: 'Uniswap V3 Core Security Assessment',
        completedAt: '2021-03',
        url: 'https://github.com/Uniswap/v3-core/blob/main/audits/tob/audit.pdf',
        status: 'passed',
        scope: 'UniswapV3Pool, Factory, and core math libraries',
      },
      {
        provider: 'OpenZeppelin',
        title: 'Uniswap v4 Core & Periphery Security Review',
        completedAt: '2024-05',
        url: 'https://github.com/Uniswap/v4-core/tree/main/audits',
        status: 'passed_with_issues',
        scope: 'PoolManager, hooks framework, and periphery',
      },
    ],
    governorNotes:
      'Always verify you interact with canonical Uniswap frontend/contracts; impersonators are a common user failure mode.',
  },
  aave: {
    verdict: 'low_risk',
    headline: 'Blue-chip lending protocol with transparent audit trail',
    summary:
      'Aave v3 maintains conservative risk parameters, oracle dependencies and liquidation logic that have been reviewed by multiple top firms. Residual risk tracks market volatility, oracle manipulation and governance parameter changes.',
    strengths: [
      'Repeated OpenZeppelin and partner audits with public artifacts',
      'Isolation mode and e-mode reduce cross-asset contagion versus early lending designs',
      'Active security council and bug-bounty program',
    ],
    risks: [
      'Oracle and liquidation cascades during extreme market moves',
      'Governance can list new assets — review listings before supplying exotic collateral',
      'Cross-chain deployments inherit bridge and messaging risk',
    ],
    externalReviews: [
      {
        provider: 'OpenZeppelin',
        title: 'Aave V3 Security Assessment',
        completedAt: '2021-11',
        url: 'https://github.com/aave/aave-v3-core/blob/master/audits/01-11-2021_OpenZeppelin_AaveV3.pdf',
        status: 'passed',
        scope: 'Pool, AToken, VariableDebtToken, and core logic',
      },
      {
        provider: 'Trail of Bits',
        title: 'Aave V3 Security Assessment',
        completedAt: '2022-01',
        url: 'https://github.com/aave/aave-v3-core/blob/master/audits/07-01-2022_TrailOfBits_AaveV3.pdf',
        status: 'passed',
        scope: 'V3 core lending contracts',
      },
    ],
    governorNotes:
      'Supply/borrow risk is asset-specific — USDC markets differ materially from long-tail collateral.',
  },
  chainlink: {
    verdict: 'low_risk',
    headline: 'Critical oracle infrastructure with broad audit coverage',
    summary:
      'Chainlink feeds underpin much of DeFi pricing. Security hinges on oracle network decentralization, staleness checks and consumer-side integration patterns.',
    strengths: [
      'Extensive documentation on oracle security and integration best practices',
      'Multiple audit partners across CCIP, Data Feeds and Functions products',
      'Large operator set and economic incentives for honest reporting',
    ],
    risks: [
      'Consumer contracts must handle staleness and circuit breakers correctly',
      'Cross-chain messaging products add bridge-adjacent failure modes',
      'Market manipulation on illiquid pairs can affect specific feed implementations',
    ],
    externalReviews: [
      {
        provider: 'OpenZeppelin',
        title: 'Chainlink CCIP Smart Contract Audit (community + professional reviews)',
        completedAt: '2023',
        url: 'https://github.com/code-423n4/2023-05-chainlink',
        status: 'passed_with_issues',
        scope: 'CCIP core contracts (Code4rena public audit)',
      },
    ],
    governorNotes:
      'Integrators inherit oracle risk — a secure feed paired with a flawed consumer contract is still dangerous.',
  },
  arbitrum: {
    verdict: 'moderate_risk',
    headline: 'Leading optimistic rollup with published audit history',
    summary:
      'Arbitrum One combines Ethereum security inheritance with sequencer and bridge-specific assumptions. Fraud-proof window and upgrade paths are well documented but require user awareness for large withdrawals.',
    strengths: [
      'Canonical Nitro stack audits from Consensys Diligence and Trail of Bits',
      'High TVL and developer adoption improve monitoring and incident response',
      'Transparent docs on challenge periods and escape hatches',
    ],
    risks: [
      'Centralized sequencer liveness assumptions during outages',
      'Bridge liquidity and message passing are high-value attack targets',
      'Governance upgrades can alter security parameters — follow on-chain votes',
    ],
    externalReviews: [
      {
        provider: 'Trail of Bits',
        title: 'Arbitrum Nitro Security Assessment (Part 1)',
        completedAt: '2022-03',
        url: 'https://docs.arbitrum.io/assets/files/2022_03_14_trail_of_bits_security_audit_nitro_1_of_2-d777111730bd602222978f7d98713d40.pdf',
        status: 'passed',
        scope: 'Nitro node & core contracts',
      },
      {
        provider: 'Trail of Bits',
        title: 'Arbitrum Nitro Security Assessment (Part 2)',
        completedAt: '2022-10',
        url: 'https://docs.arbitrum.io/assets/files/2022_10_22_trail_of_bits_security_audit_nitro_2_of_2-11d8ca6bdf6e154c9b62e401b3220b1e.pdf',
        status: 'passed_with_issues',
        scope: 'Nitro node & core contracts',
      },
    ],
    governorNotes:
      'L2 score reflects rollup infrastructure — dApps deployed on Arbitrum need separate review.',
  },
  optimism: {
    verdict: 'moderate_risk',
    headline: 'OP Stack rollup with active superchain security program',
    summary:
      'Optimism’s OP Stack powers multiple chains; security depends on shared upgrade keys, fault proofs maturity and cross-chain governance via the Optimism Collective.',
    strengths: [
      'Public audit index for Bedrock and subsequent releases',
      'Fault-proof roadmap and immunefi bounty coverage',
      'Strong alignment with Ethereum security research community',
    ],
    risks: [
      'Shared upgrade infrastructure across superchain members',
      'Withdrawal delays during fault-proof challenges',
      'Governance token influence on protocol upgrades',
    ],
    externalReviews: [
      {
        provider: 'OpenZeppelin',
        title: 'Optimism Bedrock and Periphery Security Review',
        completedAt: '2022-09',
        url: 'https://github.com/ethereum-optimism/optimism/blob/develop/docs/security-reviews/2022_09-Bedrock_and_Periphery-Zeppelin.pdf',
        status: 'passed',
        scope: 'Bedrock contracts and periphery',
      },
    ],
    governorNotes:
      'Monitor Collective governance for changes affecting bridge or proof parameters.',
  },
  'lido-dao': {
    verdict: 'moderate_risk',
    headline: 'Dominant liquid staking with documented audit program',
    summary:
      'Lido’s risk centers on validator set governance, slashing socialization and smart-contract upgrades across multiple chains. Audit coverage is strong but staking derivatives carry systemic correlation in stress events.',
    strengths: [
      'Published audit hub covering stETH, withdrawal queue and modules',
      'Transparent operator metrics and governance forum for parameter changes',
      'Large bug-bounty and incident response playbooks',
    ],
    risks: [
      'Validator slashing and correlation during network incidents',
      'Governance control over node operators and fee parameters',
      'stETH/ETH peg dynamics during liquidity crunches',
    ],
    externalReviews: [
      {
        provider: 'Statemind',
        title: 'Lido V2 Smart Contract Security Audit',
        completedAt: '2023-04',
        url: 'https://github.com/lidofinance/audits/blob/main/Statemind%20Lido%20V2%20Audit%20Report%2004-23.pdf',
        status: 'passed',
        scope: 'Lido V2 core, withdrawal queue, and staking router',
      },
    ],
    governorNotes:
      'Liquid staking is systemic — treat Lido as infrastructure with concentration risk.',
  },
  xrp: {
    verdict: 'caution',
    headline: 'Payment network under regulatory and centralization scrutiny',
    summary:
      'XRP Ledger offers fast settlement but our council flags legal/regulatory overhang, validator decentralization questions and reliance on Ripple-linked infrastructure as material non-technical risks.',
    strengths: [
      'Fast finality and low fees for payment use cases',
      'Long operational history with predictable ledger rules',
      'Active development on XRPL DeFi features',
    ],
    risks: [
      'Regulatory outcomes can affect US accessibility and exchange listings',
      'Validator set concentration relative to ideal censorship resistance',
      'Issuer trust assumptions for IOUs and bridged assets on ledger',
    ],
    externalReviews: [
      {
        provider: 'Other',
        title: 'XRPL Foundation security & responsible disclosure',
        completedAt: '2024-05',
        url: 'https://xrpl.org/docs/infrastructure/security',
        status: 'informational',
        scope: 'Ripple protocol & tooling',
      },
    ],
    governorNotes:
      'Marked “under watch” due to regulatory and decentralization factors independent of technical audits.',
  },
  'usd-coin': {
    verdict: 'low_risk',
    headline: 'Regulated fiat-backed stablecoin with attestation program',
    summary:
      'USDC risk is primarily issuer and banking-partner counterparty rather than on-chain contract logic. Circle publishes attestations and blacklisting controls that users must understand.',
    strengths: [
      'Monthly attestation reports from major accounting firms',
      'Transparent reserve composition and redemption policies',
      'Wide integration with compliant on/off ramps',
    ],
    risks: [
      'Issuer can freeze addresses via centralized blacklist function',
      'Banking partner and reserve custody concentration',
      'Regulatory changes affecting stablecoin issuance in key jurisdictions',
    ],
    externalReviews: [
      {
        provider: 'Other',
        title: 'Circle USDC — Independent Accountants’ Examination Report (Grant Thornton)',
        completedAt: '2026-03',
        url: 'https://6778953.fs1.hubspotusercontent-na1.net/hubfs/6778953/USDCAttestationReports/2026/2026%20USDC_Examination%20Report%20March%2026.pdf',
        status: 'monitoring',
        scope: 'Reserve assets vs USDC in circulation (attestation)',
      },
      {
        provider: 'OpenZeppelin',
        title: 'Centre USDC ERC-20 Token Contract Audit',
        completedAt: '2018-10',
        url: 'https://github.com/centrehq/centre-tokens',
        status: 'passed',
        scope: 'USDC token contract',
      },
    ],
    governorNotes:
      'On-chain safety ≠ fiat-banking risk — review attestations and jurisdiction.',
  },
  tether: {
    verdict: 'elevated_risk',
    headline: 'Dominant stablecoin with transparency and reserve-quality concerns',
    summary:
      'USDT maintains deep liquidity but our council weighs historical reserve disclosure gaps, freeze authority and complexity across multiple chains as elevated non-smart-contract risk.',
    strengths: [
      'Deepest stablecoin liquidity across CEX and DeFi venues',
      'Operational track record maintaining peg through multiple crises',
      'Increasing transparency reports in recent years',
    ],
    risks: [
      'Centralized freeze and recovery keys on major deployments',
      'Reserve composition and audit frequency below USDC standard',
      'Multi-chain bridge/wrapper variants increase integration confusion',
    ],
    externalReviews: [
      {
        provider: 'Other',
        title: 'Tether — ISAE 3000R Assurance Report on Financial Figures & Reserves (BDO)',
        completedAt: '2026-03',
        url: 'https://assets.ctfassets.net/vyse88cgwfbl/6crn1tXbl6AtWZBWucZnfg/c4ff472d70c1b48c2f689f27b54c84f5/ISAE_3000R_-_Opinion_Tether_International_Financial_Figure_31-03-2026.pdf',
        status: 'monitoring',
        scope: 'Reserves backing USDT (attestation under ISAE 3000R)',
      },
    ],
    governorNotes:
      'Score reflects issuer transparency and operational risk more than contract bugs.',
  },
}

const CATEGORY_STRENGTHS: Record<CuratedProject['category'], string[]> = {
  layer1: [
    'Base-layer consensus provides security inheritance for ecosystem apps',
    'Validator/staker set and client diversity support network liveness',
    'Public documentation on protocol upgrades and disclosure programs',
  ],
  layer2: [
    'Rollup design inherits Ethereum security assumptions with lower fees',
    'Published audit trails for core bridge and proof contracts',
    'Growing ecosystem liquidity improves monitoring and incident response',
  ],
  defi: [
    'Protocol revenue and TVL attract ongoing security review',
    'Bug-bounty programs common among top DeFi primitives',
    'Composable design enables battle-testing across market cycles',
  ],
  infrastructure: [
    'Critical middleware benefits from multiple independent audits',
    'Operator incentives align with honest service delivery',
    'Documentation covers integration pitfalls for developers',
  ],
  stablecoin: [
    'Simple token contracts reduce exploit surface versus complex DeFi',
    'Issuer transparency pages and attestations provide off-chain assurance',
    'Deep liquidity supports peg stability in normal conditions',
  ],
  tokenization: [
    'Real-world asset workflows include compliance and custody controls',
    'Institutional partners often require third-party review',
    'On-chain representations benefit from standardized token interfaces',
  ],
  depin: [
    'Hardware/network incentives create economic security for services',
    'Open metrics for node participation and rewards',
    'Growing audit coverage as protocols mature',
  ],
  nft: [
    'Marketplace contracts frequently audited by major firms',
    'Standard interfaces (ERC-721/1155) are well understood',
    'Royalty and escrow patterns are documented in security guides',
  ],
  privacy: [
    'Cryptographic designs undergo academic and professional review',
    'Bug bounties on proving systems and circuit implementations',
    'Clear documentation on anonymity set assumptions',
  ],
  payments: [
    'Payment-focused designs optimize for throughput and finality',
    'Compliance integrations on major fiat ramps',
    'Operational track record on remittance use cases',
  ],
}

const CATEGORY_RISKS: Record<CuratedProject['category'], string[]> = {
  layer1: [
    'Smart-contract risk on the chain is separate from base-layer score',
    'Client bugs or consensus failures can halt the network',
    'Governance upgrades may alter monetary or security parameters',
  ],
  layer2: [
    'Sequencer downtime and bridge liquidity are user-visible risks',
    'Withdrawal delays during fault/challenge windows',
    'Shared upgrade keys across superchain or stack deployments',
  ],
  defi: [
    'Oracle manipulation and liquidation cascades during volatility',
    'Governance can list risky assets or enable dangerous parameters',
    'Composability amplifies exploit impact across integrated protocols',
  ],
  infrastructure: [
    'Consumer misconfiguration can defeat otherwise secure middleware',
    'Operator collusion or liveness failures affect service guarantees',
    'Cross-chain messaging introduces bridge-adjacent attack surfaces',
  ],
  stablecoin: [
    'Issuer freeze keys and banking counterparty risk',
    'Reserve transparency varies materially by issuer',
    'Wrapper/bridge USDT/USDC variants may not be fungible',
  ],
  tokenization: [
    'Off-chain asset custody and legal enforceability gaps',
    'KYC/regulatory changes can restrict redemption',
    'Smart-contract bugs in permissioning modules',
  ],
  depin: [
    'Token incentives may not match long-term hardware reliability',
    'Sybil resistance depends on proof mechanisms and geography',
    'Centralized bootstrap phases before full decentralization',
  ],
  nft: [
    'Phishing and fake collections dominate user-facing losses',
    'Royalty enforcement changes on marketplaces',
    'Low liquidity on long-tail assets',
  ],
  privacy: [
    'Regulatory scrutiny on privacy tooling and mixers',
    'Anonymity set size affects practical privacy guarantees',
    'Circuit bugs can break soundness or privacy claims',
  ],
  payments: [
    'Validator/decentralization trade-offs for throughput',
    'Compliance and sanctions screening on regulated gateways',
    'Issuer or foundation influence on network parameters',
  ],
}

function verdictFromProject(project: CuratedProject): SafetyVerdict {
  if (project.status === 'watch') return 'caution'
  if (project.score >= 92) return 'low_risk'
  if (project.score >= 85) return 'moderate_risk'
  return 'elevated_risk'
}

function headlineFromProject(project: CuratedProject, verdict: SafetyVerdict): string {
  const labels: Record<SafetyVerdict, string> = {
    low_risk: 'Strong safety profile with mature controls',
    moderate_risk: 'Solid fundamentals with domain-specific caveats',
    elevated_risk: 'Material risks require careful due diligence',
    caution: 'Elevated watch status — non-technical risks flagged',
  }
  return `${project.name}: ${labels[verdict]}`
}

function defaultExternalReviews(_project: CuratedProject): ExternalSecurityReview[] {
  // Only return something if we actually have a narrow, useful link.
  // Otherwise return empty so the UI can show "No specific public smart contract audit indexed".
  return []
}

function resolveCreditRatingForProject(project: CuratedProject) {
  return resolveCreditRatingFromSafetyScore(project.score, {
    forceDefault: project.status === 'watch',
  })
}

function buildDefaultReview(project: CuratedProject): ProjectReviewProfile {
  const verdict = verdictFromProject(project)
  const statusLabel =
    project.status === 'safe'
      ? 'reviewed safe'
      : project.status === 'reference'
        ? 'reference-grade'
        : 'under active watch'

  return {
    verdict,
    creditRating: resolveCreditRatingForProject(project),
    headline: headlineFromProject(project, verdict),
    summary: `Our governor council rated ${project.name} as ${statusLabel} (${project.score}/100) after reviewing public audit disclosures, operational history, liquidity depth and ${projectCategoriesLabel(project)}-specific risk factors. This is analytical guidance — not investment advice.`,
    strengths: CATEGORY_STRENGTHS[project.category].slice(0, 3),
    risks: CATEGORY_RISKS[project.category].slice(0, 3),
    externalReviews: defaultExternalReviews(project),
    governorNotes:
      'No specific public smart contract audit report from a recognized firm is indexed for this project in our current dataset. The score is based on category risk factors, liquidity, operational history, and the absence of major known incidents. Request a formal governor review for deeper analysis.',
    lastReviewedAt: '2025-06-01',
    methodologyVersion: METHODOLOGY_VERSION,
  }
}

function projectCategoriesLabel(project: CuratedProject): string {
  return project.category.replace('_', ' ')
}

export function getProjectReviewProfile(project: CuratedProject): ProjectReviewProfile {
  const creditRating = resolveCreditRatingForProject(project)
  const override = REVIEW_OVERRIDES[project.slug]
  if (override) {
    return {
      ...override,
      creditRating,
      lastReviewedAt: '2025-06-01',
      methodologyVersion: METHODOLOGY_VERSION,
    }
  }
  return buildDefaultReview(project)
}

export function getVerdictLabel(verdict: SafetyVerdict): string {
  switch (verdict) {
    case 'low_risk':
      return 'Low risk'
    case 'moderate_risk':
      return 'Moderate risk'
    case 'elevated_risk':
      return 'Elevated risk'
    case 'caution':
      return 'Under watch'
  }
}
