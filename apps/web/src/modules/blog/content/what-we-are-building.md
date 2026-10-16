# What we've been building — a progress update

Crypto Watcher started with a simple question: *Is this crypto project safe to invest in?* Answering that at scale requires more than a landing page — it requires methodology, tooling, governance, and people. Here is where we stand as we prepare for our first public launch.

## The product today

### A public safety index

Anyone can browse curated and on-chain projects without connecting a wallet. Search is global (⌘K), fast, and built for discovery — from reference assets like Bitcoin and Ethereum to projects entering formal review.

Each project page shows **lifecycle status** (`In analysis → Under review → Report published`), **expert score breakdown**, structured report factors, market context where relevant, and a public comment thread.

### Expert review workflow

We built the full governor pipeline:

- **In Analysis** queue for projects awaiting investigation
- **Review request** flow for submitting projects to the council (free during launch)
- Backend workflow for review requests with role-gated governor actions
- Conflict-of-interest disclosure fields on published reports

Review authority is restricted to vetted governors. Regular users contribute evidence and discussion — they do not set the score.

### Protocol governance (launch requirement)

Governance is not a Phase 2 afterthought. From day one, CWT holders govern **protocol** parameters:

- Reviewer council roster and policy
- Review methodology versions
- Fee schedules and treasury allocations
- Emergency pause and backend submitter rotation

The governance token **does not** grant the right to vote on individual project risk scores. That separation is core to the product.

### On-chain audit trail

Each reviewed project can anchor published outcomes in a **per-project on-chain registry** — an immutable record of what the council published and when. Smart contracts cover reputation gating, project submission, and protocol governance (Governor + Timelock).

### Auth, profiles, and community

Users can register with email/password, link a wallet for protocol governance votes, and maintain a public profile. Onboarding walks new users through search, expert scores, project discussion, and optional wallet linking.

## Platform and engineering

Behind the UI:

- **Monorepo** (Nx + pnpm): React web app, Express API, Foundry contracts
- **OpenAPI** generated from Zod schemas
- **CI quality gates**: lint, typecheck, tests, spaghetti layout checks, contract tests
- **Observability** hooks for Sentry and structured logging
- **Transactional email** infrastructure (React Email + MailHog locally)

We dogfood our own docs-sync rule: every feature change updates `docs/` with phase tags so design and code stay aligned.

## What we explicitly rejected

While building, we said no to patterns that undermine trust:

- Vote-to-rate on project scores
- Pay-to-influence grading
- Popularity-based safety signals
- Governance tokens that double as rating votes

These show up constantly in crypto. We chose the harder path: **credentialed reviewers, transparent methodology, accountable publication.**

## What's next

The MVP launch covers catalog, expert scores, governor workflow, public comments with shared evidence, on-chain registry, and protocol governance. Phase 1 deepens reviewer accountability — reputation tracking, appeals, whistleblowing workflows, and notification center.

We will share each milestone here. If you want the full phase breakdown, read [Where we're going](/blog/where-we-are-going).

[Explore the app →](/app) · [Request a review →](/app/analysis-request)
