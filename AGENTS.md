# Crypto Watcher — Agent Guide

Context and operating rules for AI agents (and humans) working in this repo.

## What this project is

Crypto Watcher is an expert-governed, on-chain risk-analysis tool for crypto
projects. Reviews and official scores are published by a vetted governor council —
not by token-weighted public voting. Read these first — they are the source of truth:

- Product overview: [README.md](./README.md)
- Roadmap & phases (`MVP → Final`): [docs/ROADMAP.mdc](./docs/ROADMAP.mdc)
- Smart contracts: [docs/CONTRACTS.mdc](./docs/CONTRACTS.mdc)
- Backend/API: [docs/BACKEND.mdc](./docs/BACKEND.mdc)
- Frontend/web: [docs/FRONTEND.mdc](./docs/FRONTEND.mdc)

## Repository layout (Nx + pnpm monorepo)

```
apps/
  api/        # Express + Zod + Kysely (PostgreSQL)
  web/        # Vite + React + TS + Tailwind + Shadcn/UI
packages/
  o1-check/   # CLI complexity & performance risk checker
contracts/    # Solidity + Foundry
docs/         # Design docs (source of truth)
.cursor/rules # Repo rules enforced by the agent
```

## Golden rules

1. **Docs are the source of truth.** Any implementation change not already
   described in `docs/` MUST update `docs/` in the same change
   (see `.cursor/rules/docs-sync.mdc`). Keep phase citations (`[MVP]`, `[Phase 1]`,
   `[Phase 2]`, `[Phase 3]`, `[Final]`) accurate.
2. **Test-driven.** Write/extend tests before or alongside code; no feature lands
   without tests (see `.cursor/rules/test-driven.mdc`).
3. **Quality gates must pass.** Lint, typecheck, tests, build, knip, and spaghetti layout
   check must be green before a change is considered done (see
   `.cursor/rules/quality-gating.mdc` and `.cursor/rules/spaghetti-checker.mdc`).
4. **Modular by feature.** One feature = one folder, owning its routes/components,
   service, repository, schema and tests. Never import another module's internals;
   go through its public surface (service/UI/lib).
5. **Governance is a launch feature.** Never move governance out of `MVP`.

## Common commands

```bash
pnpm install                # install all workspaces (Node 22.13 — run `nvm use` first)
pnpm run dev                # run web + api in parallel (nx)
pnpm run lint               # eslint across the monorepo
pnpm run check:spaghetti    # module layout (handlers, schemas, pages, __tests__)
pnpm run knip               # unused files, dependencies, binaries (see knip.json)
pnpm run knip:exports       # optional: unused exports and types
pnpm run o1-check -- apps/api/src --config o1-check.config.json  # complexity/performance risk scan
pnpm run typecheck          # tsc --noEmit across packages
pnpm run test               # unit/integration tests
pnpm run build              # build all apps
pnpm run lighthouse:web     # Lighthouse audits on production preview (apps/web)
pnpm run email:dev          # React Email preview at http://localhost:3030

# contracts (run inside contracts/)
forge build
forge test
```

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every pull request and push to `main`. PR checks
always validate `apps/*` and `packages/*`:

| Job | Scope | Gates |
|-----|-------|-------|
| `Spaghetti detector` | `apps/api`, `apps/web` modules | `check:spaghetti` |
| `Knip (dead code)` | monorepo (TS/JS workspaces) | `knip` |
| `packages/o1-check` | `packages/o1-check` | lint, typecheck, test (coverage), build |
| `packages/email-templates` | `packages/email-templates` | lint, typecheck, test, build |
| `apps/api` | `apps/api` | lint, typecheck, test (coverage), build, `o1-check:api` |
| `apps/web` | `apps/web` | lint, typecheck, test (coverage), build, `o1-check:web`, Lighthouse |
| `contracts` | `contracts/` | `forge build`, `forge test` (push to `main` only) |

Shared setup lives in `.github/actions/setup-pnpm`. Dependency audit and CodeQL run on
`main` pushes and weekly schedule in `.github/workflows/security.yml` (not on PRs).

## Conventions

- TypeScript everywhere (frontend + backend). Solidity for contracts.
- Conventional Commits enforced by commitlint + Husky.
- Validate all API I/O with Zod; surface OpenAPI via `@asteasolutions/zod-to-openapi`.
- DB access only via Kysely repositories; on-chain reads via Viem (`core/chain`).
- Frontend network calls via `lib/api/`; on-chain via `lib/web3/`.
