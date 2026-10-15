# Where we're going — the Crypto Watcher roadmap

Every product decision at Crypto Watcher maps to a phase. We publish this roadmap so contributors, governors, and users know what ships when — and what we will never ship (like public vote-to-rate on scores).

## MVP — First launch _(now)_

**Goal:** a usable, end-to-end product where users browse expert-reviewed projects, governors publish structured reports, the public can comment and submit evidence, and protocol governance manages the reviewer council.

What launches:

- Project catalog with lifecycle states and expert risk scores
- Structured review reports (methodology, findings, risk factors, conflicts disclosed)
- Public off-chain commenting, with evidence shared in the discussion
- Wallet + email authentication
- Governor-only score publication with expertise tags
- Per-project on-chain registry for published outcomes
- CWT governance token + Governor/Timelock for **protocol** decisions
- CI/CD, security scanning, API docs, observability

> Governance is a launch requirement — not a later bolt-on.

## Phase 1 — Trust & accountability

**Goal:** make reviewer quality, accountability and transparency robust.

- Reviewer reputation: performance, timeliness, overturn rate on appeals
- Onboarding/offboarding workflow for the governor council
- Formal methodology versioning (immutable references per report)
- Whistleblowing and incident triage for governors
- Appeals process (council re-review — not token vote)
- Slashing/penalties for governor misconduct
- In-app + email notification center

## Phase 2 — Scale & decentralization

**Goal:** scale review throughput while keeping authority with the expert council.

- Expanded governor council with domain specializations
- Multi-chain project registry
- Subgraph/indexer for on-chain governance and outcomes
- Delegated **protocol** governance (CWT delegation — not score voting)
- Team/admin console for reviewer operations
- Economic gating for review request prioritization

## Phase 3 — Ecosystem & integrations

**Goal:** become a platform others build on.

- Public read-only API and API keys
- Webhooks for project/report/governance events
- Embeddable expert-reviewed score badges
- Data provider integrations to assist governor analysis
- Mobile-friendly PWA
- Automated risk **signals** for governors (human-in-the-loop — never auto-score)

## Final — Maturity & sustainability

**Goal:** a sustainable, transparent, expert-governed rating protocol.

- Mature DAO governance of protocol parameters
- Decentralized credentials for governor expertise
- Self-serve review onboarding with economic anti-spam
- Sustainable treasury and reviewer compensation
- Formal verification/audits of core contracts
- Multi-region infrastructure with SLAs

## Cross-cutting — every phase

These never move:

| Concern              | Commitment                                        |
| -------------------- | ------------------------------------------------- |
| **Review authority** | Always restricted to vetted governors             |
| **Governance**       | Present from MVP; deepened each phase             |
| **Security**         | Audits scale with phase; CI scanning from day one |
| **Testing**          | Vitest, Playwright, Foundry — mandatory           |
| **Documentation**    | `docs/` stays in sync with every change           |

## How to participate

- **Investors & users:** browse the [safety index](/app) and read published reports
- **Community:** submit evidence, comment, report incidents
- **Projects:** [request a formal review](/app/analysis-request)
- **Experts:** reach out if you want to join the governor council conversation
- **Token holders:** participate in [protocol governance](/docs/governance) — methodology and council policy, not project grades

We are building the information layer crypto should have had from the start. The roadmap is long; the launch is here.

[Read our launch story →](/blog/launch-story) · [View documentation →](/docs)
