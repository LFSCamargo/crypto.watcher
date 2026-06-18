# Crypto Watcher

Crypto Watcher is a risk analysis tool for crypto assets/projects/protocols. The tool is designed to help users analyze whether or not a project is worth investing in, based on the risk and potential rewards.

## Core Idea

- Analyze projects based on their risk and potential rewards.
- Protect users from investing in projects that are not worth investing in.
- Provide a voting system for users to vote on the risk and potential rewards.
- Not everyone will be allowed to vote on the risk and potential rewards. Only trustworthy users will be allowed to vote, they will be rewarded with tokens for their votes.
- The voting system will be based on the reputation of the user. The more trustworthy the user is, the more votes they will be able to cast.
- The governance token will be distributed to users.
- In order to use the voting system, user will be able to interact with a smart contract that will be deployed on the blockchain, for each project.
- While voting will be closed, everyone can comment on the project, this will be a publically available information, off-chain stored, that will be used to analyze the project.
- Deploy contract -> Project in analysis by team (Voting system will be deployed on the contract) -> Project is ready for voting -> Voting starts -> Voting ends -> Project is analyzed -> Score is calculated -> And shown to the users

## Getting started

```bash
pnpm install
docker compose up -d          # Postgres + MailHog
pnpm --filter api db:migrate  # run DB migrations
pnpm run dev                  # web (5173) + api (3000)
```

## Quality gates

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
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

- Elysia + Typebox
- Kysely + PostgreSQL
- Vitest + Node (tsx)
- Docker
- Pino + Pino-pretty
- Generate docs for the API using @elysia/openapi

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

```bash
cd contracts
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge build
forge test
```
