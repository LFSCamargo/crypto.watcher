# Safe provisioning guide

How to stand up Crypto Watcher (local, testnet, or production) without leaking
secrets or leaving insecure defaults in place.

For day-to-day local run and contract deploy steps, see [RUNNING.md](./RUNNING.md).
This document focuses on **what to configure**, **where secrets live**, and **what
must change before anything public-facing goes live**.

---

## How configuration works

The monorepo uses a **single central env file** at the repo root:

| Source         | Purpose                                                          |
| -------------- | ---------------------------------------------------------------- |
| `.env.example` | Committed template — copy to `.env`, never put real secrets here |
| `.env`         | Shared local defaults (git-ignored)                              |
| `.env.local`   | Machine-local secret overrides (git-ignored; wins over `.env`)   |
| Process env    | Docker, Coolify, CI — **always wins** over files                 |

Load order: real process env → `.env.local` → `.env`. The API reads files via
`apps/api/src/core/config/load-env.ts`; the web app loads `VITE_*` vars from the
repo root at build time (`apps/web/vite.config.ts`).

**Rule:** treat `.env` and `.env.local` as secret stores. They are in `.gitignore`
and must never be committed, pasted into tickets, or baked into Docker images.

---

## Secrets inventory

| Variable                           | Sensitive? | Notes                                                                                   |
| ---------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`                     | **Yes**    | Full DB credentials. Use a dedicated DB user in production.                             |
| `DEPLOYER_PRIVATE_KEY`             | **Yes**    | On-chain deploy key. Fund only for deploy, then drain or retire.                        |
| `SMTP_USER` / `SMTP_PASS`          | **Yes**    | Production mail provider credentials.                                                   |
| `BASESCAN_API_KEY`                 | Mild       | API key for contract verification only — still keep private.                            |
| `VITE_WALLETCONNECT_PROJECT_ID`    | Public     | Embedded in the browser bundle by design.                                               |
| `VITE_*` (all others)              | Public     | Anything `VITE_`-prefixed is shipped to clients. **Never** put private keys here.       |
| `RPC_URL` / `BASE_SEPOLIA_RPC_URL` | Mild       | Prefer a provider URL with your own API key; rate limits apply.                         |
| `BACKEND_SUBMITTER`                | **Yes**    | Wallet the platform uses to emit on-chain project reviews — separate from the deployer. |

Session auth uses server-side sessions in PostgreSQL and an `httpOnly` cookie
(`cw_session`). There is no separate `SESSION_SECRET` today; protecting the
database and setting `NODE_ENV=production` (secure cookies) is what matters.

---

## Environment profiles

### Local development (safe defaults)

Use the values in `.env.example` as-is:

- Postgres and MailHog via `docker compose -f docker-compose.dev.yml up -d postgres mailhog`
- Default DB password (`postgres:postgres`) is fine on localhost only
- MailHog catches email — no real SMTP credentials needed
- Leave `DEPLOYER_PRIVATE_KEY` empty until you deploy contracts

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d postgres mailhog
pnpm --filter api run db:migrate
pnpm run dev
```

### Testnet (Base Sepolia)

For contract deploy and app wiring against chain `84532`:

1. Create a **throwaway deployer** (`cast wallet new`), fund from a faucet, deploy once.
2. Put the private key in `.env.local`, not `.env`, if others share the machine.
3. Set `BACKEND_SUBMITTER` to the wallet your API will use for on-chain submissions
   (not the deployer key unless you are only experimenting locally).
4. Record addresses from `contracts/deployments/base-sepolia.json` — do not redeploy
   unless you intend to.

See [RUNNING.md — Deploy contracts](./RUNNING.md#deploy-contracts-to-base-sepolia).

### Production

Target stack (see [README.md](./README.md)): Hostinger + Coolify, Docker, Nginx, TLS.

**`docker-compose.yml`** is the default production stack (Postgres + API + nginx web).
Coolify picks it up automatically. No MailHog — configure real SMTP via env vars.

```bash
# Local prod smoke test
cp .env.example .env
# Set POSTGRES_PASSWORD, WEB_URL, VITE_SITE_URL, CORS_ORIGINS, SMTP_* (see checklist below)

docker compose up -d --build
# web → http://localhost:80 (or WEB_PORT), API proxied same-origin via nginx
```

#### Coolify

1. Point Coolify at this repo — it uses `docker-compose.yml` by default.
2. Set **all required env vars** in the Coolify UI (see checklist below). A root
   `.env` file is optional; Coolify injects vars as process environment.
3. Expose the **`web`** service on **container port `80`** — Coolify’s proxy handles public HTTP/HTTPS (do not bind host `:80` in compose; Coolify already uses it).
4. Set `WEB_URL` and `VITE_SITE_URL` to your public `https://` domain (rebuild
   when `VITE_*` build args change).
5. Leave `VITE_API_URL` empty — nginx on the web container proxies API routes
   same-origin.
6. Postgres and API stay on the internal network; do not publish them publicly.

Production images:

| Service | Dockerfile | Notes |
| --- | --- | --- |
| API | `apps/api/Dockerfile` | Runs DB migrations on start, non-root user, health check |
| Web | `apps/web/Dockerfile` | Vite build + nginx; proxies `/auth`, `/projects`, etc. to API |

Leave `VITE_API_URL` empty so the browser hits the API through nginx on the same
origin. Put TLS in front (Coolify / host nginx) and set `WEB_URL` / `VITE_SITE_URL`
to your public `https://` URL.

Inject configuration through **Coolify environment variables** (or your orchestrator’s
secret store), not checked-in files. Build the web app with production `VITE_*` values
at **build time** — they are compiled into static assets (rebuild the `web` image when
they change).

---

## Production checklist

Work through this before exposing the app on the public internet.

### Application

- [ ] `NODE_ENV=production` on the API (enables `Secure` session cookies).
- [ ] `WEB_URL` = public HTTPS URL of the web app (used in email links).
- [ ] `VITE_SITE_URL` = same public HTTPS URL (SEO, canonical links, sitemap).
- [ ] `CORS_ORIGINS` = exact production web origin(s) only — no `*` , no stray localhost entries.
- [ ] `VITE_API_URL` empty when using the default `docker-compose.yml` (nginx same-origin proxy), or set to a public API URL if split across hosts.
- [ ] `LOG_LEVEL=info` (or `warn`) — avoid `debug` in production.
- [ ] `VITE_WALLETCONNECT_PROJECT_ID` set (create a project at [WalletConnect Cloud](https://cloud.walletconnect.com)).

### Database

- [ ] Dedicated PostgreSQL instance; not the Docker Compose dev defaults.
- [ ] Strong, unique password; dedicated application user with least privilege.
- [ ] `DATABASE_URL` only reachable on a private network — **do not** expose port `5432` publicly.
- [ ] Run migrations once per deploy: `pnpm --filter api run db:migrate` (or rely on the API container entrypoint in `docker-compose.yml`).
- [ ] Backups enabled on the host or managed DB provider.

### Email

- [ ] Real SMTP host with TLS (`SMTP_SECURE=true` when required by your provider).
- [ ] `MAIL_FROM` uses a domain you control and has SPF/DKIM configured.
- [ ] MailHog is **not** used outside local dev.

### On-chain

- [ ] Contracts deployed with a dedicated key; deployer key **not** stored on the app server.
- [ ] `BACKEND_SUBMITTER` set to the platform hot wallet authorized by `ProjectWatcherFactory`.
- [ ] `RPC_URL` points to a reliable Base Sepolia (or mainnet) endpoint with your own API key.
- [ ] Deployed addresses synced from `contracts/deployments/*.json` into app config — redeploy only deliberately.

### Infrastructure

- [ ] TLS terminated at Nginx (or Coolify’s proxy); force HTTPS redirects.
- [ ] Secrets supplied as platform env vars, not copied into the image or repo.
- [ ] Postgres and API on internal Docker networks; only web/API ports published as needed.
- [ ] Observability (Sentry, Better Stack, etc.) configured with **server-side** DSNs/tokens — not `VITE_` unless intentionally public.

---

## Key separation (contracts)

Use **different keys** for different jobs:

```
Deployer key     → one-time (or rare) contract deploy via forge script
Backend wallet   → day-to-day on-chain submissions (BACKEND_SUBMITTER)
Governance       → timelock + governor own protocol changes after deploy
```

Never reuse the deployer private key as the backend submitter in production.
Never commit any private key. Prefer `.env.local` on laptops and Coolify secrets
in the cloud.

---

## Common mistakes

| Mistake                                | Risk                                      |
| -------------------------------------- | ----------------------------------------- |
| Committing `.env` or `.env.local`      | Full credential leak via git history      |
| `postgres:postgres` in production      | Trivial DB compromise                     |
| `CORS_ORIGINS=*` or including dev URLs | Cross-site API abuse from arbitrary sites |
| Private key in a `VITE_` variable      | Key exposed in every browser bundle       |
| `NODE_ENV=development` in production   | Session cookies sent without `Secure`     |
| Exposing Postgres to the internet      | Direct database attack surface            |
| Storing deployer key on the API server | Server compromise → full chain control    |

---

## Minimal production env reference

Set these via your host (Coolify). Adjust URLs to your domain.

```bash
# Shared
NODE_ENV=production
WEB_URL=https://app.example.com

# API
PORT=3000
DATABASE_URL=postgres://cw_app:STRONG_PASSWORD@postgres.internal:5432/crypto_watcher
LOG_LEVEL=info
CORS_ORIGINS=https://app.example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM="Crypto Watcher <noreply@example.com>"
RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Web (build-time — set before `pnpm --filter web run build` or docker compose prod build)
VITE_API_URL=
VITE_SITE_URL=https://app.example.com
VITE_WALLETCONNECT_PROJECT_ID=...
VITE_DEFAULT_CHAIN_ID=84532

# Contracts (deploy machine only — not on the API container)
# BASE_SEPOLIA_RPC_URL=...
# DEPLOYER_PRIVATE_KEY=...   # deploy workstation / CI secret store
# BACKEND_SUBMITTER=0x...      # hot wallet address, not private key on server unless required
```

---

## After provisioning

1. Hit the web app over HTTPS and sign up — confirm OTP email delivery.
2. Confirm API health and that cookies are `Secure` + `HttpOnly` in browser devtools.
3. Verify CORS: requests from your domain succeed; arbitrary origins fail.
4. Run smoke tests: `pnpm run test` and `pnpm run build` in CI before promoting deploys.

For local workflows and contract deploy commands, continue with [RUNNING.md](./RUNNING.md).
