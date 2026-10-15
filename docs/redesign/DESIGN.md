# Redesign reference — R0 audit and design specification

Companion to [REDESIGN_PLAN.md](../REDESIGN_PLAN.md). This file is the concrete
reference each implementation milestone builds against. Screenshots live in
[`screenshots/`](./screenshots) (`<stage>-<screen>-<desktop|mobile>-<theme>.jpg`,
recorded with `CAPTURE_STAGE=<stage> pnpm --filter web exec playwright test capture`).
Metrics live in [`baseline-metrics.json`](./baseline-metrics.json).

## 1. R0 findings

### Data provenance (what each visible value really is)

| Visible value | Where it renders | Real source | Decision |
| --- | --- | --- | --- |
| Safety score `86.5 / 100` | API project detail sidebar | `GET /projects/:id/score` — basis points 0–10000 from the governor authority vote tally; **higher is safer** | Show as "Official safety score" with round and review-factor count. Never invert to a risk score. |
| Credit rating (S&P / Moody's style) | Score panel, catalog cards | Derived from the safety score (`lib/ratings/credit-rating`) | Label as derived from the safety score. |
| "Council verdict 92%" | API project detail, next to the official score | Static curated data (`curated-projects.ts`) | **Conflict.** Remove from API detail; link to the reference assessment instead. |
| "Safety index" / "Reviewed safe" | `/app/reference/:slug`, catalog | Static curated reference data | Label "Reference assessment — not a published council report". |
| "100+ projects reviewed", "Authority-verified scores" | Landing hero, auth shell | 100 curated reference entries; zero published council reports in an empty DB | Replace with verifiable statements ("100 reference assets", "No wallet needed"). |
| Review fee ("pay the review fee", "Paid review") | Landing CTA, footer, request page, economics section | `feeAmount` is always `'0'`; no payment endpoint | Requests are free today; fees are a future CWT governance parameter. |
| Comment "anti-spam fee" | Onboarding | `comment_fee_paid` column exists but is never enforced | Remove the claim. |
| "Mark safe / Mark unsafe" (project detail) | Governor panel | Toast only — no API call | Remove simulated actions; point governors to the real queue. |
| "Mark safe / Mark unsafe" (queue) | `/app/in-analysis` | `PATCH /analysis-requests/:id` (team/admin) | Real action; relabel as approve/reject *request* (not a score). |
| "Submit evidence" | Project and reference detail | Links to the analysis-request form; no evidence API | Relabel "Request a review"; evidence intake is `TODO` product work. |
| Protocol governance vote | `/app/governance/*` | Read-only indexed proposals; no in-app `castVote` | Show state and "how to participate"; do not render a vote button. |
| Project vote | `/app/projects/:slug/vote` | `ProjectVoting.castVote` (obsolete public scoring) | Redirect to project detail (R4). |

### Usability, accessibility and performance defects

- Docs and blog layouts render a nested `<main>` inside the shell `<main>`.
- Missing API projects take >5 s to show "not found" (404 is retried three times).
- CLS 0.435 on docs/blog and 0.28 on reference detail: the footer renders before lazy
  route content and is pushed down when it arrives.
- `web3-*.css` (RainbowKit) is linked from `index.html` on every route.
- The landing hero renders eight rich chart cards that fetch market data immediately.
- Mobile bottom navigation exposes only Projects and In Analysis; Resources,
  Governance and account actions are unreachable on mobile without the footer.
- No skip link; route changes do not move focus; `motion` page transitions ignore
  `prefers-reduced-motion`.
- After sign-in, users always land on `/app/profile` regardless of where they started.

### Baseline (R0)

Lighthouse (mobile throttling, local preview): performance 44–63, accessibility 96,
best practices 96, SEO 100 on all six audited routes. Bundle: 1.53 MB gzip total JS,
302 KB gzip initial (entry + react + query + motion + CSS). Browser journeys:
`apps/web/e2e/baseline.spec.ts` (redirects, 404, browsing, governance, sign-in/OTP,
analysis requests) pass on desktop (1440×900) and mobile (Pixel 7).

## 2. Liquid-glass system

Glass is a **surface treatment**, never a content container for long reading.

### Recipe

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--glass-tint` | `45 44% 99%` | `0 0% 8%` | Base fill (HSL, alpha applied per surface) |
| `--glass-nav-alpha` | `0.90` | `0.88` | Header, mobile nav, floating CTA |
| `--glass-card-alpha` | `0.72` | `0.86` | Elevated cards over the page background |
| `--glass-panel-alpha` | `0.94` | `0.92` | Dialogs, popovers, dropdowns, command palette |
| `--glass-border` | `0 0% 100% / 0.65` | `0 0% 100% / 0.10` | 1px inner rim |
| `--glass-edge` | `42 22% 70% / 0.35` | `0 0% 0% / 0.6` | Outer hairline separating glass from content |
| `--glass-highlight` | `0 0% 100% / 0.85` | `0 0% 100% / 0.07` | Inset top highlight (`inset 0 1px 0`) |
| `--glass-shadow` | `30 20% 20% / 0.14` | `0 0% 0% / 0.55` | `0 12px 40px -16px` diffuse drop shadow |
| `--glass-blur` | `20px` | `24px` | `backdrop-filter: blur()` |
| `--glass-saturate` | `180%` | `150%` | `backdrop-filter: saturate()` |

Component classes (in `styles/index.css`): `glass-nav`, `glass-card`, `glass-panel`,
plus `glass-sheen` (decorative diagonal highlight for showcase cards only).

### Fallbacks and limits

- `@supports not (backdrop-filter: blur(1px))` and
  `@media (prefers-reduced-transparency: reduce)`: alpha becomes 1 (opaque tint).
- At most three blurred layers visible at once (header + one overlay + one showcase
  card). Lists of cards use `glass-card` without blur (`glass-card-flat`).
- Glass never sits behind body copy longer than three lines.

### Contrast matrix (measured, alpha-blended against the worst background)

Ratios for `--foreground` / `--muted-foreground` text; AA requires 4.5.

| Surface | Light worst case | Dark worst case |
| --- | --- | --- |
| Nav over black CTA block (light) / cream card (dark) | 15.66 / 4.91 | 12.14 / 4.99 |
| Panel over black block / cream card | 17.11 / 5.37 | 13.71 / 5.63 |
| Card over brand-yellow grid accent | 17.16 / 5.38 | 12.0 / 4.6 |
| Card over page background | 19.26 / 6.04 | 17.2 / 7.1 |

Cards are only permitted over the page background and grid accent; content that can
scroll under a surface (header, mobile nav) uses the denser nav alpha.

## 3. Foundations (R1)

- **Type.** Raleway stays (brand). Scale: display 56/60, h1 40/44, h2 30/36, h3 22/28,
  body 16/26, small 14/20, caption 12/16; numerals in scores use `tabular-nums`.
- **Radii.** `--radius: 1rem`; glass surfaces use `rounded-3xl` (1.5rem), pills stay full.
- **Status colors (non-brand).** `success` (published / low risk), `warning`
  (in review / moderate), `destructive` (failed / elevated risk), `info` (reference
  data). Brand yellow is emphasis only, never a status. Every status chip carries text
  and an icon, not color alone.
- **Chart palette.** `--chart-1..5` tokens; price line uses `--chart-1` with gradient
  fill, comparison series `--chart-2..5`.
- **Motion.** `--ease-glass: cubic-bezier(.2,.8,.2,1)`, durations 160/240/320 ms;
  page transitions are opacity only and disabled under reduced motion.
- **Focus.** 2px `ring` with 2px offset on every interactive element; skip link to
  `#main-content`; focus moves to the main region on route change.
- **Brand yellow as text.** `--primary` (#ffca0a) on cream is 1.5:1, so it is never a
  text color. Use `text-primary-strong` (dark amber in light mode, brand yellow in
  dark mode) for accent text such as the wordmark. Remaining `text-primary` text
  usages are migrated screen by screen in R4–R7.

## 4. Screen references

Each row is the content hierarchy implementers follow (top to bottom).

| Screen | Hierarchy | Glass surfaces |
| --- | --- | --- |
| Shell | Logo · Projects · In Analysis · Governance · Resources · search · theme · account. Mobile: sticky header (logo, search, menu) + bottom bar (Projects, In Analysis, Governance, Menu) opening a sheet with resources and account actions. | Header, bottom bar, menu sheet, command palette |
| Landing | Hero (claim, sub-claim, search, Browse projects / Get started — Request a review when signed in) → illustrative report preview (figcaption "Illustrative example") → methodology pillars → 5-step review lifecycle → 4 reference assessments (labeled, linked to `/app/reference/:slug`, no charts) → CWT governance vs score separation → resources → final CTA. Implemented in R2. | Hero report-preview card, final CTA card |
| Auth | Single centered glass panel over the grid; title, one-line purpose, form, inline errors (`role="alert"`), secondary links. Desktop adds a short value column. | Auth panel |
| Onboarding | 3 steps (how scores work, how to participate, optional wallet) with progress, Back, Skip. | Step panel |
| Catalog | Title + count, search + category chips (URL-backed), source legend (Reference vs Council report), card grid, empty state with reset, API projects section with its own loading/error. | Filter bar (flat) |
| API project | Identity + lifecycle status → official score card (meaning, round, provenance) → findings / reference link → market + protocol data (labeled "Market context") → discussion. | Score summary card |
| Reference asset | Identity + "Reference assessment" banner → reference index with disclaimer → audit coverage → market context → request-review CTA. | Reference index card |
| Queue / request | Queue: lifecycle legend, request cards with status chip and next step, on-chain projects in analysis. Request: what happens next (free today), grouped form with inline validation, persistent success panel with link to profile history. | Success panel |
| Docs / blog | Sticky glass sidebar on desktop, glass sheet on mobile; opaque reading column (max 70ch), on-page heading anchors. | Sidebar, mobile sheet |
| Profile / reviewer / governance / admin | Profile: identity header, settings form, wallet status, request history. Reviewer: council status, weight, credential explanation. Governance: state legend, proposal list, detail with lifecycle and participation guidance. Admin: role-gated forms with explicit forbidden state. | Header summary cards |

## 5. Data gaps (require separate product/API work)

- Evidence and incident submission API — listed under `[MVP]` in the roadmap but not
  implemented; the UI links to "Request a review" until it exists.
- Analysis fee payment and verification — UI states requests are free.
- In-app protocol governance voting (`CryptoWatcherGovernor.castVote`) — UI explains
  participation and links to the docs; no simulated transaction states.
- Published report body (findings, methodology version, reviewer list, on-chain
  anchor) per API project — UI shows only fields the API returns.
- Seed script for local deterministic data — browser tests use network fixtures.
- Server-side OTP resend cooldown / rate limiting — the UI applies a 30-second
  client cooldown and maps HTTP 429 if the API adds limits later.
- Transaction states (pending / confirmed / failed) — there is no in-app contract
  write after the R4 voting removal; wallet sign-in is a message signature only.
