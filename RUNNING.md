# Running Crypto Watcher

How to run and test the stack locally, and how to deploy the contracts to the
**Base Sepolia** testnet.

- Apps: `apps/web` (Vite/React, port `5173`) and `apps/api` (Express, port `3000`).
- Contracts: `contracts/` (Solidity + Foundry), deploy target **Base Sepolia** (chain `84532`).

## Prerequisites

- Node `20` (`.nvmrc`) — run `nvm use`.
- `pnpm` `9` (`corepack enable`).
- Docker + Docker Compose (for Postgres/MailHog or the full Docker dev flow).
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `cast`) for contracts.

```bash
nvm use
corepack enable
pnpm install
git submodule update --init --recursive   # fetch Foundry libs (forge-std, openzeppelin)
```

> The `contracts/lib/*` dependencies are **git submodules**, not committed source.
> If `git status` shows `contracts/lib/... (new commits)`, reset with the command
> above — it's just dependency-version drift, not your changes.

---

## Run locally

### Option A — apps on host, infra in Docker

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

docker compose up -d postgres mailhog   # Postgres (5432) + MailHog (1025/8025)
pnpm --filter api run db:migrate         # run DB migrations
pnpm run dev                             # web (5173) + api (3000) in parallel
pnpm --filter web icons:sync             # fetch curated coin logos (first time / after catalog changes)
```

- Web: <http://localhost:5173>
- API: <http://localhost:3000>
- MailHog UI: <http://localhost:8025>

### Option B — everything in Docker (with HMR)

Runs Postgres, MailHog, the API (`tsx watch`) and the web app (Vite) in
containers. Source is bind-mounted, so file edits hot-reload.

```bash
pnpm run docker:dev          # = docker compose up --build
# in another shell, run migrations against the containerized DB:
docker compose exec api pnpm --filter api run db:migrate
```

- Web: <http://localhost:5173> · API: <http://localhost:3000> · MailHog: <http://localhost:8025>

> HMR in containers uses polling (`VITE_USE_POLLING` / `CHOKIDAR_USEPOLLING` are
> set in `docker-compose.yml`).

---

## Test locally

### Quality gates (whole monorepo)

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

> If Nx is slow/flaky, run a single workspace directly, e.g.
> `pnpm --filter api run test` or `pnpm --filter web run typecheck`.

### Contracts

```bash
forge build --root contracts
forge test  --root contracts            # unit + fuzz (fork tests skip without RPC)
forge fmt   --check --root contracts    # lint
```

### Contract integration tests against a fork

These deploy the full stack and drive the voting + governance flows against a
real **Ethereum Sepolia** fork. They skip automatically when no RPC is set.

```bash
export SEPOLIA_RPC_URL="https://your-sepolia-rpc"
forge test --root contracts --match-path 'test/integration/*' -vv
```

---

## Deploy contracts to Base Sepolia

### 1. Create + fund a deployer account

```bash
cast wallet new            # prints a fresh address + private key
```

Fund the address with Base Sepolia ETH from a faucet
(e.g. <https://www.alchemy.com/faucets/base-sepolia>).

### 2. Configure env

```bash
cp contracts/.env.example contracts/.env
```

Fill in `contracts/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `BASE_SEPOLIA_RPC_URL` | yes | Base Sepolia RPC (default `https://sepolia.base.org`). |
| `DEPLOYER_PRIVATE_KEY` | yes | Funded deployer key (`0x`-prefixed). |
| `BASESCAN_API_KEY` | no | Set to verify contracts on Basescan. |
| `BACKEND_SUBMITTER` | no | Backend allowed to emit projects (defaults to deployer). |
| `INITIAL_SUPPLY` / `VOTING_DURATION` / `TIMELOCK_MIN_DELAY` / `MIN_REPUTATION_WEIGHT` | no | Deploy params (sane defaults in `Deploy.s.sol`). |

### 3. Deploy

```bash
pnpm run deploy:testnet
# or directly:
bash contracts/script/deploy-base-sepolia.sh
```

The script broadcasts `contracts/script/Deploy.s.sol` via the `base_sepolia` RPC
endpoint and verifies on Basescan when `BASESCAN_API_KEY` is set. It **saves the
deployed addresses** to `contracts/deployments/base-sepolia.json` (committed, so
you only deploy once) and prints every deployed address:

```
GovernanceToken:      0x...
Timelock:             0x...
CryptoWatcherGovernor:0x...
ReputationRegistry:   0x...
ProjectWatcherFactory:0x...
Factory backend:      0x...
ProtocolSettings:     0x...
```

### 4. Point the apps at the deployment

- Addresses are recorded in `contracts/deployments/base-sepolia.json` — read from
  there instead of re-deploying.
- Set `RPC_URL=https://sepolia.base.org` in `apps/api/.env` (already the default).
- The web app already includes Base Sepolia (`VITE_DEFAULT_CHAIN_ID=84532`).
- Wire the deployed `ProjectWatcherFactory` / token addresses into the app config
  as needed.

> The deploy is idempotent in the sense that addresses are saved to the JSON file;
> only re-run `pnpm run deploy:testnet` when you actually want to redeploy.

---

## Quality checks

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run check:spaghetti   # module layout (handlers, pages, __tests__)
pnpm run o1-check:api      # API complexity / DB risk scan (fail below 50)
pnpm run o1-check:web      # Web UI scan (docs content excluded)
```

See `packages/o1-check/README.md` and root `o1-check.config.json` / `o1-check.web.config.json`.

---

## Ports reference

| Service | URL |
| --- | --- |
| Web (Vite) | <http://localhost:5173> |
| API (Express) | <http://localhost:3000> |
| MailHog UI | <http://localhost:8025> |
| Postgres | `localhost:5432` |
