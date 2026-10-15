# Application redesign implementation plan

Status: replanned 2026-10-15 and in implementation on `feat/redesign-foundations`
(see the [milestone tracker](#milestone-tracker)). Original planning branch:
`feat/application-redesign-plan`, created from local `master` at `49fa525`.

## Replan — verified starting point (2026-10-15)

- An earlier R0/R1 attempt (Playwright specs, `docs/redesign/*`, header and
  mobile-navigation components) was reverted; only this plan was committed
  (`d69ef3e`). `apps/web/e2e/` and `docs/redesign/` started empty and the
  `test:e2e` script existed without a `@playwright/test` dependency or config.
- The local API had no database (`/health` reported `degraded`). Postgres and
  MailHog now run from `docker-compose.dev.yml`; migrations apply cleanly but no
  seed script exists, so the database is empty. Browser journeys therefore mock
  the HTTP API at the network layer with typed fixtures (`apps/web/e2e/fixtures.ts`)
  instead of depending on database contents. This keeps them deterministic in CI.
- Server capability audit (drives copy in R2, R5 and R6):
  - `POST /analysis-requests` always stores `feeAmount = '0'`; there is no payment
    endpoint or transaction verification. Fee/payment copy must not claim that a
    fee is charged today. Fee schedules remain a CWT governance parameter.
  - `GET /projects/:id/score` returns a **safety** score in basis points
    (0–10000, higher is safer) computed from the governor authority vote tally.
    The UI shows it on a 0–100 scale; it is never inverted into a risk score.
  - Curated reference assets (`/app/reference/:slug`) use static frontend data
    (`modules/projects/lib/curated-*`). They are reference assessments, not
    published council reports, and must be labeled as such.
  - The governor "Mark safe / Mark unsafe" panel only showed a success toast
    without calling any API. It must not simulate a recorded decision.
  - There is no evidence-submission API; "Submit evidence" links pointed at the
    analysis-request form.
- Baseline gates (`check:spaghetti`, `knip`, web `lint`, `typecheck`, `test`) were
  green before implementation started.

## Objective and boundaries

Redesign the complete journey from discovering Crypto Watcher to researching a
project, requesting analysis, creating an account, and participating in protocol
governance. Include desktop and mobile, light and dark themes, and every supporting
state rather than only successful page layouts.

“Project scenes” means the catalog and both project-detail experiences. “Signing”
includes sign-in, registration, verification, recovery, wallet connection and
signature feedback. “Get started” covers entry CTAs and onboarding. “Resources”
includes navigation, documentation and the blog.

This is an incremental redesign of the existing React application, using its
current routing, feature modules and APIs. Backend, payment and contract additions
require separately scoped work when an audited screen depends on missing behavior.
Do not introduce a framework migration or a new CMS as part of visual work.

Milestones **R0–R8 below are redesign delivery stages**, not the product phases in
[ROADMAP](./ROADMAP.mdc). Existing features retain their product phase citations:
core browsing, auth, review requests and protocol governance are `[MVP]`;
expanded reviewer accountability and notifications remain `[Phase 1]`. Governance
stays accessible throughout the redesign and remains a launch requirement.

## Starting point and risks discovered in source

- `apps/web/src/app/router.tsx` owns public, auth, resource and application routes;
  most pages already load lazily through `app/lazy-routes.tsx`.
- `app/layout/app-layout.tsx` supplies one shared shell. Desktop has a Resources
  menu; the mobile bottom navigation exposes Projects and In Analysis. Design
  explicit mobile access to resources, governance and account actions.
- `styles/index.css` and `tailwind.config.js` already provide theme foundations.
  Current branding uses cream, yellow, black, rounded controls and Raleway.
- API projects (`/app/projects/:slug`) and curated reference assets
  (`/app/reference/:slug`) have different data sources. Do not imply that every
  reference asset has an official published governor report.
- Legacy `/app/projects/:slug/vote` still renders project voting, contrary to the
  intended governor-only score model. Resolve its navigation and redirect in R4;
  retain protocol governance voting. Do not redesign the obsolete scoring model.
- Analysis-request and onboarding copy describes fees, but the request page only
  submits project details. Audit actual backend/payment support before showing
  paid, confirmed or queued-for-payment states.
- Project detail currently links “Submit evidence” to the analysis-request form.
  Distinguish those actions; do not present a request as completed evidence intake.
- The docs mention Playwright, but this checkout had no Playwright configuration.
  R0 establishes executable browser tests rather than assuming a working suite.

These are source-review findings. Live visual screenshots, API capability checks
and usability baselines are R0 deliverables, not completed audits.

## Proposed experience and visual direction

Use a clear research workspace: restrained brand color, strong typography,
readable report sections and compact data summaries. Retain recognizable branding
as the starting point; compare concrete desktop/mobile designs in R0 before
changing fonts, palette or logo. Distinguish brand emphasis from risk/status colors.

### Liquid-glass design language

The redesign is guided by a liquid-glass visual language (translucent, layered
surfaces) applied on top of the existing cream/yellow/black brand palette. The
exact recipe lives in [redesign/DESIGN.md](./redesign/DESIGN.md).

- **One token layer.** `--glass-*` CSS variables (tint, border, highlight, shadow,
  blur, saturation) for both themes in `apps/web/src/styles/index.css`, consumed
  through shared `glass-*` component classes. No ad-hoc `bg-x/80 backdrop-blur`.
- **Where glass applies.** Sticky header, mobile navigation, command palette,
  dialogs, popovers and dropdown menus, landing hero and report-preview cards,
  floating CTAs and elevated summary cards over the page grid background.
- **Where it does not.** Long-form reading surfaces (docs and blog article
  bodies, report text, forms) stay opaque for legibility.
- **Depth.** Inner top highlight, 1px translucent border, soft diffuse shadow and
  large radii; motion is gentle opacity/scale and honors reduced motion.
- **Guardrails.** WCAG AA contrast over the busiest background a surface can sit
  on; an opaque fallback under `prefers-reduced-transparency` and when
  `backdrop-filter` is unsupported; at most three simultaneous blurred layers per
  view because `backdrop-filter` is GPU-costly. Lighthouse must not regress.

Public navigation exposes Projects, In Analysis, Resources and Governance, with
Sign in and Get started for guests. Signed-in users get account actions and a
clear Request analysis entry. Resources groups docs, whitepaper, tokenomics,
governance explanation, FAQ and blog. Keep URLs stable; changing a navigation
label does not require creating a new route.

The landing page explains the expert-review model, shows a clearly attributed
report preview, explains the review lifecycle and leads to browsing or signup.
Project detail puts review status, score meaning and provenance before supporting
market charts. A reference page explicitly labels market context and review
availability. Avoid guarantees of safety and invented review counts or outcomes.

Get started continues to `/auth/signup` for guests and `/app` for existing users.
Browsing remains available without an account or wallet. After verification,
onboarding explains scores and participation with an optional wallet step. Preserve
a valid internal return destination when authentication interrupts another task;
reject external redirect targets.

## Complete route and surface inventory

| Surface                                                    | Current routes / components                                                                 | Delivery                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Shared navigation, search, footer, theme, session controls | `app/layout`, `components/layout`, `components/search`, `components/ui`, `components/theme` | R1                                                 |
| Landing and marketing sections                             | `/`, `modules/marketing`                                                                    | R2                                                 |
| Registration and sign-in                                   | `/auth/signup`, `/auth/signin`                                                              | R3                                                 |
| OTP and recovery                                           | `/auth/verify-otp`, `/auth/forgot-password`, `/auth/reset-password`                         | R3                                                 |
| Get started and wallet onboarding                          | `/auth/onboarding`, auth CTAs and wallet controls                                           | R3                                                 |
| Project catalog and search results                         | `/app`, global command palette                                                              | R4                                                 |
| API project and report details                             | `/app/projects/:slug`, scoring, comments                                                    | R4                                                 |
| Reference asset details and supporting data                | `/app/reference/:slug`, market, protocol-metrics                                            | R4                                                 |
| Deprecated project voting entry                            | `/app/projects/:slug/vote`                                                                  | R4 redirect with regression test                   |
| Analysis queue and request submission                      | `/app/in-analysis`, `/app/analysis-request`                                                 | R5                                                 |
| Resource navigation and docs                               | `/docs`, `/docs/whitepaper`, `/docs/tokenomics`, `/docs/governance`, `/docs/faq`            | R6                                                 |
| Blog index and article                                     | `/blog`, `/blog/:slug`                                                                      | R6                                                 |
| Profile and account                                        | `/app/profile`, `/app/me`                                                                   | R7                                                 |
| Reviewer credentials                                       | `/app/u/:address`                                                                           | R7; retain `[MVP → Phase 1]` scope                 |
| Protocol proposals and voting                              | `/app/governance`, `/app/governance/:onchainId`                                             | R7; available from `[MVP]` throughout              |
| Existing admin project operations                          | `/app/admin`                                                                                | R7; no expansion into the `[Phase 2]` team console |
| Compatibility routes                                       | `/projects`, `/projects/:slug`, `/profile`, `/analysis`                                     | R0 baseline, R8 verification                       |
| Not found, loading, failures, dialogs and toasts           | `*`, route fallback and feature states                                                      | Each milestone; R8 audit                           |
| Transactional emails                                       | `packages/email-templates` existing verification/recovery templates                         | R3 brand alignment; R8 link verification           |

Do not create new rewards or notification-center screens merely to fill out the
redesign; those remain separately scheduled `[Phase 1]` product work. Include any
existing visible controls in the audit and label unavailable functionality honestly.

## Phased implementation

### R0 — Audit, design decisions and regression baseline

Dependencies: none. Suggested PRs: baseline tests; design specification.

- Run the current app with deterministic project, review, user and governance data.
  Capture all routes for guest, member and authorized operator states. Record
  desktop/mobile and both themes, including empty/error states.
- Map each visible score, lifecycle label, fee claim, role and report field to its
  actual API/contract source. Record missing capabilities and score direction
  (risk versus safety) explicitly; never silently invert a score.
- Produce wireframes for landing, catalog, report, auth, analysis and resource
  reading. Then specify representative high-fidelity desktop/mobile designs,
  tokens, component states and content hierarchy as implementation references.
- Establish Playwright configuration/dependency and deterministic fixtures, plus
  baseline journeys for browsing, auth, review requests and governance. Do not
  make tests depend on public RPCs or market APIs.
- Record current Lighthouse scores, bundle sizes, accessibility issues and route
  redirects. Define the intended CTA/return-destination behavior in tests.

Exit: route/state checklist, design references, data-gap list and reproducible
baseline tests exist. Resolve score provenance and any required API work before
implementing the affected screen. No visual replacement starts without a concrete
reference for that screen.

### R1 — Design foundations and shared shell

Dependencies: R0. Suggested PRs: additive tokens/primitives; navigation and shell.

- Define spacing, type, surfaces, borders, radii, focus, semantic status colors,
  chart colors and motion tokens for both themes.
- Extend existing Shadcn/Radix primitives for buttons, forms, cards, badges,
  menus, dialogs, tabs, tables, skeletons and feedback. Add only consumed variants.
- Implement responsive header/mobile navigation, footer, search entry and account
  controls. Keep all current destinations reachable and preserve lazy loading.
- Add skip navigation, visible focus, reduced-motion behavior and route focus
  management. Test keyboard menus, dialog focus restoration and active links.
- Prefer additive component variants over global token changes that unintentionally
  restyle every unmigrated screen. Check the old pages whenever the shell changes.

Exit: desktop/mobile shell works for guests and signed-in users; existing routes
remain usable in both themes; shared component interaction tests pass.

### R2 — Landing page

Dependencies: R1. Suggested PR: landing sections, content and SEO.

- Rebuild hero, product/report preview, expert methodology, lifecycle explanation,
  resource links and final CTAs as focused components in `modules/marketing`.
- Use real supported data or clearly labeled illustrative content. Separate
  Browse projects from Get started; keep protocol governance discoverable.
- Preserve metadata/canonical behavior and optimize images/fonts without loading
  wallet or chart dependencies into the initial landing bundle unnecessarily.

Exit: all CTAs reach their intended routes; mobile layout and keyboard traversal
work; no unsupported authority or payment claims; Lighthouse does not regress.

### R3 — Sign-in, Get started and account entry

Dependencies: R1; coordinate CTA behavior with R2. Suggested PRs: auth/recovery;
onboarding/wallet feedback; matching email presentation where needed.

- Apply a consistent auth shell to sign-in, signup, OTP and recovery; retain
  server validation, session rules and email-enumeration protections.
- Design invalid/expired OTP, resend cooldown, incorrect credentials, expired
  reset link, loading, network failure and success states with accessible errors.
- Shorten onboarding, retain skip/back controls and optional wallet linking.
  Separate wallet connection, account authentication and transaction signing.
- Cover rejected signatures, unsupported network and pending/confirmed/failed
  transactions where supported. Do not represent a submitted hash as confirmation.
- Preserve the user’s intended task across authentication. Align existing
  verification/recovery emails with the UI and test their links and OTP flow.

Exit: registration → OTP → onboarding → app, sign-in → intended destination,
recovery, logout and optional wallet paths pass component and browser tests.

### R4 — Projects, reports and research data

Dependencies: R1 and R0 data decisions. Suggested PRs: catalog/search; API project
detail; reference detail/charts; obsolete vote entry cleanup.

- Redesign discovery, search, supported filters, pagination and project cards.
  Preserve URL-backed filters where supported; specify/test any new URL behavior.
- Build a report hierarchy: identity/status → official score and explanation →
  findings/evidence/methodology → supporting market/protocol data → discussion.
  Show reviewer, version, date and on-chain references only when available.
- Clearly separate reference data, draft assessments and published council
  outcomes. Display unavailable or stale data instead of invented zero values.
- Unify chart ranges, labels, legends and accessible summaries; preserve cached
  data/error behavior, responsive charts and external source links.
- Preserve comments and authentication prompts. Correct the evidence/request
  distinction without inventing a missing evidence-submission API.
- Replace legacy project-vote navigation with the expert-review explanation and
  redirect `/app/projects/:slug/vote` to its project detail. Remove unreachable
  frontend code only after dependency checks; API/contract removal is separate.

Exit: reviewed, unreviewed, reference-only, missing and unavailable-data projects
render correctly; score meaning is consistent; no public score-voting CTA remains;
search, deep links, comments and back navigation pass tests.

### R5 — Analysis queue and request journey

Dependencies: R3 and R4 patterns. Suggested PRs: queue; request form and result.

- Redesign the queue around supported lifecycle states, useful project context
  and the next action. Do not conflate request status with published-review status.
- Improve form grouping, field help, validation, pending submission and persistent
  success feedback. Retain entered data on failure and prevent accidental repeated
  clicks while pending; backend idempotency requires separate API work if absent.
- Explain what happens after a request using actual backend behavior. Show fees
  and payment confirmations only if the corresponding flow exists and is tested.
- Add visible links to existing request tracking/profile information where supported.

Exit: guest authentication/return, invalid form, server failure/retry and successful
request paths pass; status and fee copy accurately reflect server capabilities.

### R6 — Resources, documentation and blog

Dependencies: R1; reuse terminology settled in R4/R5. Suggested PRs: docs/navigation;
blog index and article layouts.

- Rebuild resource navigation, docs sidebar/mobile menu, reading typography,
  tables, callouts and long-page navigation. Preserve existing article URLs.
- Give the blog a consistent index, article hierarchy and related navigation
  using existing content/metadata; avoid introducing an unnecessary CMS.
- Reconcile explanations of scores, council authority, protocol governance, fees
  and roadmap availability with the implemented experience.
- Preserve headings, anchor links, canonical metadata, sitemap behavior and
  structured data; test wide tables and long content on mobile.

Exit: every resource is reachable on mobile and desktop; article deep links and
metadata work; content and application terminology agree.

### R7 — Profile, governance, reviewer and operator surfaces

Dependencies: R1, R3, R4 and R5. Suggested PRs: profile/reviewer; governance;
existing admin operations. This is visual migration order, not delayed availability.

- Redesign profile editing/avatar upload, wallet information and existing request
  history. Preserve compression/upload behavior and existing account permissions.
- Present reviewer credentials without implying ordinary accounts can publish
  scores. Keep advanced accountability fields within their product phase.
- Redesign protocol proposal list/detail, eligibility, voting progress and outcomes.
  Exercise disconnected, ineligible, wrong-network, rejected, pending and failed
  transaction states; preserve actual contract actions and authorization.
- Restyle existing admin project forms and lifecycle controls. Test forbidden
  responses and role visibility; frontend hiding never replaces server enforcement.

Exit: role-specific journeys pass; protocol governance remains functional; no
score-publication permission or contract semantics change through visual work.

### R8 — Full regression, rollout and cleanup

Dependencies: R2–R7 complete.

- Audit every inventory row and state, all redirects and email links. Test direct
  entry, reload, history navigation, slow/unavailable APIs and session expiry.
- Review at 360, 768 and 1440 CSS-pixel widths, 200% zoom, both themes, keyboard-only
  navigation and reduced motion. Ensure fixed navigation does not cover content.
- Run all quality gates and browser journeys. Compare Lighthouse/bundle results
  with R0 and investigate regressions before release.
- Remove superseded frontend variants/assets after checking consumers and Knip;
  synchronize frontend docs with the final implementation.
- Release through the existing deployment process; record the previous working
  release, smoke-test deployed routes and monitor existing error reporting.

Exit: the inventory has no unexplained omissions, all gates pass, and rollout and
rollback steps have been exercised on preview/staging.

## Delivery controls and verification

Implement milestones in order by default. Each suggested PR is independently
reviewable and keeps the application functional. R2, R3, R4 and R6 can be scheduled
independently after R1, but avoid concurrent changes to shared primitives. Assign
one implementation owner and one reviewer per PR when scheduling the work.

Use short-lived implementation branches from the integrated baseline and merge
small completed slices. The planning branch contains documentation only; do not
accumulate the entire redesign into one unreviewable application PR. No fixed
calendar estimate is assumed until R0 establishes design and data dependencies.

Prefer complete route slices and reversible PRs. Use a temporary route-level flag
only when staged exposure is actually needed; give it an owner and removal
milestone, and test both values. Do not maintain two entire applications. For a
failed rollout, revert the affected presentation PR or restore the previous build;
keep independently fixed auth/authorization and score-integrity corrections intact.
Any required data migration needs its own compatibility and rollback plan.

For every implementation PR:

- Write failing behavior tests before implementing changed interactions. Use
  Testing Library in `__tests__/*.test.tsx` and deterministic Playwright journeys
  for auth, scoring and governance; add API/Foundry coverage if those layers change.
- Include screenshots for affected layouts/themes and loading, empty, error,
  unauthorized, success and transaction states as applicable. New visual baselines
  require review rather than automatic acceptance of every changed screenshot.
- Check accessible labels/errors, focus order/traps, semantic headings, contrast
  and non-color status cues. Target WCAG AA contrast and usable touch controls;
  automated scores alone do not establish accessibility.
- Run `pnpm run check:spaghetti`, `pnpm run knip`, `pnpm run lint`,
  `pnpm run typecheck`, `pnpm run test`, and `pnpm run build` under Node 22.13.
  Run web/API o1-check targets as applicable and preserve CI coverage thresholds.
  Run `forge build` and `forge test` if contracts change.
- Run browser journeys and `pnpm run lighthouse:web` for affected experiences.
  Existing Lighthouse floors are performance 40, accessibility 90, best practices
  90 and SEO 95; treat these as minimums, require no regression versus R0, and set
  tighter page budgets from measured baselines rather than weakening thresholds.
- Keep API calls in existing client boundaries and feature internals private.
  Update [FRONTEND](./FRONTEND.mdc), and backend/contract docs when applicable,
  with accurate product phase citations and no fabricated available features.

The first implementation task is **R0: route/state baseline and design reference
package**. Track each milestone as planned → implementing → verified → released,
with its PRs, screenshots, checks and unresolved dependencies linked here.

## Milestone tracker

| Milestone | Status | Notes |
| --- | --- | --- |
| R0 — Audit, design decisions and baseline | verified | [DESIGN.md](./redesign/DESIGN.md), `baseline-metrics.json`, `r0-*` screenshots, `e2e/baseline.spec.ts` |
| R1 — Foundations and shared shell | verified | Glass tokens + fallbacks in `styles/index.css`, Card/Dialog/Sheet/Menu variants, `components/layout/*` shell with unit tests, `e2e/shell.spec.ts`, `r1-*` screenshots |
| R2 — Landing page | implementing | |
| R3 — Sign-in, Get started and account entry | planned | |
| R4 — Projects, reports and research data | planned | |
| R5 — Analysis queue and request journey | planned | |
| R6 — Resources, documentation and blog | planned | |
| R7 — Profile, governance, reviewer and operator surfaces | planned | |
| R8 — Full regression, rollout and cleanup | planned | |
