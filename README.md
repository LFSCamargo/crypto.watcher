# Crypto Watcher

Crypto Watcher is a risk analysis tool for crypto assets, projects and protocols. It helps users decide whether a project is worth investing in based on **expert review**, transparent methodology and evidence — not popularity or purchasable influence.

## Core Idea

- Analyze projects based on their risk and potential rewards using **vetted expert reviewers**.
- Protect users from investing in projects that are not worth investing in.
- Publish official risk scores and structured reports from a **governor council** with expertise in smart contract security, protocol design, tokenomics, compliance, infrastructure and on-chain analysis.
- **Regular users do not vote on the final risk score.** They can consume reports, view ratings, submit evidence, report incidents and participate in discussions — but score authority stays with governors.
- A **governance token** powers **protocol governance** (reviewer selection, methodology, accountability) — not vote-to-rate on projects.
- Each reviewed project can have an on-chain registry/contract anchoring the published outcome for auditability.
- While under review, anyone can comment and submit evidence off-chain; governors synthesize this into the official report.
- Review requested → Project in analysis → Governor review → Report published → Score shown to users

## Getting started

Requires **Node 22.13** (see `.nvmrc`). With [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install    # reads .nvmrc (22.13)
nvm use
pnpm install
docker compose up -d          # Postgres + MailHog
pnpm --filter api db:migrate  # run DB migrations
pnpm run dev                  # web (5173) + api (3000)
```

For a full run/test/deploy guide (local dev, Docker, contract tests, and Base
Sepolia deployment) see [RUNNING.md](./RUNNING.md).

### Run everything in Docker (with HMR)

Spin up Postgres, MailHog, the API and the web app in containers; source is
bind-mounted so edits hot-reload (Vite HMR + `tsx watch`):

```bash
pnpm run docker:dev   # = docker compose up --build
# web → http://localhost:5173, api → http://localhost:3000, MailHog → http://localhost:8025
```

### Deploy contracts to testnet (Base Sepolia)

```bash
cp .env.example .env   # set BASE_SEPOLIA_RPC_URL + DEPLOYER_PRIVATE_KEY
pnpm run deploy:testnet
```

See [contracts/README.md](./contracts/README.md#deploy) for details.

## Quality gates

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run format
```

## Tech Stack

### Monorepo

- Nx + pnpm
- ESLint + Prettier
- Husky + Commitlint
- Typescript

### Emails

- React Email
- Nodemailer + SMTP (locally using MailHog)

### Frontend

- Vite + React + TypeScript + TailwindCSS
- Shadcn/UI
- Zustand
- React Hook Form
- React Router
- Sonner
- Phosphor Icons
- Vitest + Testing Library + Playwright

### Web3 Stack

- RainbowKit
- Wagmi
- Viem + viem-react
- Solidity + Foundry

### Backend

- Express + Zod
- Kysely + PostgreSQL
- Vitest + Node (tsx)
- Docker
- Pino + Pino-pretty
- Generate OpenAPI docs from Zod schemas using @asteasolutions/zod-to-openapi

### Github Actions

- CI / CD
- Security

### Deployment

- Hetzner
- Docker
- Nginx
- SSL

### Observability

- Sentry (free-tier)
- Better Stack (free-tier)

### Contracts

Install [Foundry](https://book.getfoundry.sh/getting-started/installation) if needed:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Then:

```bash
cd contracts
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge build
forge test
```
