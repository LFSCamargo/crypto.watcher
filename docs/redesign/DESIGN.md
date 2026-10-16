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
- **Landing palette.** Six tones — amber (brand), coral, violet, sky, teal, pink —
  each with a base (`--tone-*`, glows and tile fills) and a strong variant
  (`--tone-*-strong`, text and icons; ≥ 4.6:1 on page, card and tinted tile in both
  themes). Sections each own two tones: hero amber/sky/violet, methodology teal/violet,
  lifecycle coral/sky (steps run amber → teal), references amber/pink, governance
  violet/sky, resources coral/teal, CTA amber/violet/teal. Resource links keep one
  tone everywhere (menu, landing, mobile).
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
| Shell | Floating rounded glass pill (`.glass-nav.glass-pill`): Logo · Projects · Governance · Resources · search · theme · account. Scrolling down compacts it (shorter, narrower, wordmark and search text fade, "Request a review" hidden); hovering or clicking expands it, a click keeps it open until the reader scrolls another 48px, and returning to the top restores full size. Width/height/padding animate with `--ease-glass`; reduced motion disables the transition. Mobile: sticky pill (logo, search, menu) + bottom bar (Projects, Governance, Menu) opening a sheet with resources and account actions. | Header, bottom bar, menu sheet, command palette |
| Landing | Hero (claim with a drawn yellow highlighter on "safe", sub-claim, search, Browse projects / Get started — Request a review when signed in) → illustrative report preview (figcaption "Illustrative example") over a "watcher" radar: a yellow sweep rotates every 6s and asset chips ping as it passes (md+); each chip is a link to its reference assessment, scales up and shows its name on hover/focus, and sits on a layer above the card. Hovering (or focusing) a chip opens a glass hover card: reference index, grade and verdict; live DefiLlama data (TVL with 7d change, fees, DEX volume, revenue, exploit count and losses); the CW-Valuation-v1 composite with each component's score × share; and the top strength and risk. The card states that the composite is market fundamentals, separate from the reference index. The hero search is a button that opens the global command palette (no second inline search). The preview is audited live: a scan line sweeps the card, the score counts up to 82 (announced once as text), finding bars fill in sequence and the "Report published" badge stamps in. Decorative layers are `aria-hidden`; reduced motion shows the final frame. CSS-only apart from the count-up → asset ticker (mouse-only marquee of reference grades, pauses on hover, `aria-hidden` with `tabindex=-1` links) → methodology bento (council expertise chips orbiting a shield; illustrative report whose factor bars fill on view; "Try to buy a better score" button that shakes the locked 82 and announces it never changes via `role=status`; evidence chat bubbles popping in) → lifecycle tour (5 steps with a moving progress track; auto-advances every 4s only while in view and without reduced motion, Pause/Play control, picking a step stops the tour; detail panel with who acts / what you see / result) → rating ladder (reference assets bucketed by grade B→AAA as bars that grow on view, category filter chips, selected grade lists up to 6 linked assets with score range; labeled as not council reports) → governance (pre-launch pill, "CWT will vote on" vs "Never on a vote" lanes, milestone bar from `governance-milestones.ts`) → resources (featured latest blog post with more posts, 3-step "start here" path, tokenomics/governance tiles) → CTA with rotating conic gradient border and drifting coin icons. Sections fade up once on scroll (`Reveal`); cards use a pointer-following toned glow. Implemented in R2, refreshed after R8. | Hero report-preview card, final CTA card |
| Auth | Single centered glass panel over the grid; title, one-line purpose, form, inline errors (`role="alert"`), secondary links. Desktop adds a short value column. | Auth panel |
| Onboarding | 3 steps (how scores work, how to participate, optional wallet) with progress, Back, Skip. | Step panel |
| App page hero | Shared `PageHero` (`components/layout/page-hero.tsx`) on Projects and Governance: toned eyebrow + icon, optional status pill, `h1`, description, actions, at-a-glance stats; decorative toned glows and slowly orbiting rings around the page icon (`aria-hidden`, static under reduced motion). | None blurred (`.glass-card-flat`) |
| Expandables | Shared `Disclosure` (`components/ui/disclosure.tsx`): button with `aria-expanded` in an optional heading; the panel animates height via a `grid-template-rows` 0fr→1fr transition with fade, slight slide and chevron rotation (300ms `--ease-glass`); closed panels are `inert`. Used by the docs FAQ, proposal-state legend and governance FAQ. | None |
| Catalog | `PageHero` → `SegmentedTabs` (Catalog / In analysis with live count; sliding indicator, arrow keys, `?view=in-analysis`) → search (catalog tab only) (URL `?search=`, debounced, history replace) → **Council projects** first (own loading / retry / empty states) → **Reference assessments** (source note, category chips with `aria-pressed`, count, 24-per-page "Show more", empty state with Clear filters). Implemented in R4. | None blurred; cards use `.glass-card-flat` |
| API project | Identity + lifecycle status → official score card (meaning, round, provenance) → council findings (lifecycle text; separate reference link) → "Market context" (not part of the score) → discussion. Side column: review progress steps, on-chain record, request CTA. Implemented in R4. | Score summary card (`.glass-card`) |
| Reference asset | Identity + "Reference assessment" badge and note → analyst review sections → market context; side column: reference index (meaning, disclaimer), audit coverage, "Request a council review". Partner trade links removed. Implemented in R4. | None blurred (flat cards) |
| Queue / request | Queue (In analysis tab on `/app`): request-status legend ("a request is not a review"), request cards with status chip, next step and council notes, team triage actions, council projects in analysis. Request: grouped form with inline validation, what happens next (free during launch), your requests list, persistent focused success panel linking to the queue. Implemented in R5. | Request form panel (`.glass-panel`) |
| Docs / blog | Sticky glass sidebar on desktop, glass sheet on mobile (current page as trigger label); opaque reading column (max 72ch), section anchors, "On this page" on `xl`, previous/next pager (docs), "More from the blog" (articles); wide tables scroll in a focusable region. Single `main` (layouts render a `div`). Implemented in R6. | Sidebar, mobile sheet |
| Profile / reviewer / governance / admin | Profile: identity header, settings form with inline validation, wallet status, council tools (team/admin), request history. Reviewer: address, neutral council status, weight for members, credential explanation. Governance: `PageHero` with "Pre-launch · CWT not minted" status → milestone tracker (built / up next, not scheduled / after mint / Phase 2) → who decides today + what CWT will govern → collapsible state legend and proposal list (honest empty state) → token FAQ. Proposal detail with lifecycle and a "Your vote" panel covering wallet/network/eligibility/transaction states. Admin: guest and forbidden states, create form, one-step lifecycle move via project picker. Implemented in R7. | Profile header, reviewer header, vote panel (`.glass-card`); forms flat |

## 5. Data gaps (require separate product/API work)

- Evidence and incident submission API — listed under `[MVP]` in the roadmap but not
  implemented; the UI links to "Request a review" until it exists.
- Analysis fee payment and verification — UI states requests are free. The legacy
  `paid` request status reads as "Received".
- Request idempotency — the API has no idempotency key; the UI blocks repeat
  submissions while one is pending but cannot dedupe across reloads.
- Comment anti-spam fee — not implemented server-side; UI copy removed in R5.
- Governor deployment address — in-app voting (`castVote`, R7) needs
  `VITE_GOVERNOR_ADDRESS`; no deployed address is recorded in the repo, so local and
  preview builds show "In-app voting isn't enabled". In-app delegation remains `[Phase 2]`.
- Invalid project transitions — the API throws a plain `Error` (HTTP 500) instead of a
  400; the admin UI only offers the allowed next state so this path is not reachable
  from the page.
- Published report body (findings, methodology version, reviewer list, on-chain
  anchor) per API project — UI shows only fields the API returns.
- Seed script for local deterministic data — browser tests use network fixtures.
- Server-side OTP resend cooldown / rate limiting — the UI applies a 30-second
  client cooldown and maps HTTP 429 if the API adds limits later.
- Score in the project list payload — `GET /projects` omits the score, so council
  cards say "Score on the report" for published projects instead of a number.
- Token symbol — docs and the UI call the governance token CWT, but
  `GovernanceToken.sol` deploys symbol `WATCH` (also used in the tokenomics meta
  description). Product must pick one name before launch; R6 did not rename either.
- Rating labels — scores map to "S&P"/"Moody's"-style letter grades
  (`lib/ratings/credit-rating.ts`). These are Crypto Watcher's own scale, not ratings
  issued by those agencies; product/legal should confirm the naming before launch.

## 6. R8 regression and release audit

- **Inventory regression.** `apps/web/e2e/regression.spec.ts` (desktop project) loads
  every inventory route — guest, signed-in user and team/admin variants — in light and
  dark. Each route must not scroll horizontally at 360, 768, 720 (1440 at 200% zoom)
  and 1440 CSS pixels, must render exactly one `h1`, and must have no axe-core
  WCAG 2.0/2.1 A/AA violations. Guest routes are also tabbed through (every focus
  target visible), and the shell is checked under reduced transparency (opaque nav)
  and reduced motion.
- **Fixes found by the audit.** The header search button now uses its visible text
  as its accessible name (with `aria-keyshortcuts`). The auth-shell logo link and the
  account menu trigger have accessible names that contain their visible text. Dark
  `--destructive` darkened to `0 72% 45%` so white text on destructive badges is 5.8:1.
  Catalog (`/app`) card grids got `grid-cols-1` so they no longer overflow at 360px.
- **Resilience.** Direct entry and reload (auth, analysis), history navigation
  (catalog), API failures (sign-in, request submit, profile save, governance reads)
  and expired sessions or reset links are covered by the milestone journeys in
  `apps/web/e2e/`. Email templates are covered by `packages/email-templates` tests.
- **Results vs R0** ([`r8-metrics.json`](./r8-metrics.json), same method as R0).
  Lighthouse on the six audited routes: performance 44–63 → 64, accessibility 96 → 100,
  best practices 96 (unchanged), SEO 100 (unchanged), CLS 0.28–0.435 → 0 on every
  route. LCP is unchanged (≈ 8 s under mobile throttling, now under 8.2 s on every route;
  the home route dropped from 10 s). Initial payload 302 KB → 296 KB gzip; total JS
  1.53 MB → 1.55 MB gzip (wallet chunks, loaded on demand).
- **Screenshots.** `screenshots/r8-*` captures the full inventory (desktop and mobile,
  both themes) for comparison with `r0-*`.
- **Rollout.** Not exercised from this workspace: no preview/staging deployment or
  release history is reachable here. Before release, record the current production
  build, deploy via the existing Docker/Coolify stack, smoke-test the inventory routes
  and watch existing error reporting; roll back by redeploying the recorded build.
