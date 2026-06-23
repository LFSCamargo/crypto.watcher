# Crypto Watcher — Contracts

Solidity + Foundry. Modular layout documented in
[../docs/CONTRACTS.mdc](../docs/CONTRACTS.mdc).

## Setup

Install [Foundry](https://book.getfoundry.sh/getting-started/installation):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Install dependencies and run tests:

```bash
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge build
forge test -vvv
```

## Modules

- `governance/` — `GovernanceToken` (ERC20Votes), `CryptoWatcherGovernor`,
  `Timelock`, `ProtocolSettings` (governed methodology version). `[MVP]`
- `review/` — `ProjectReview` (governor-only report record + audit trail) +
  `ProjectWatcherFactory` (backend-gated registry). `[MVP]`
- `reputation/` — `ReputationRegistry` (council governor allow-list + weight). `[MVP → Phase 1]`
- `access/` — shared `Roles` (`GOVERNOR_ROLE`, `REPUTATION_MANAGER_ROLE`).

## Tests

Unit + fuzz tests live in `test/` mirroring `src/`:

```bash
forge test -vvv
```

### Testnet integration tests `[MVP]`

`test/integration/` holds fork-based integration tests that deploy the full MVP
stack and drive the project-review + governance flows against a **Sepolia** fork.
They skip automatically when no RPC is configured, so `forge test` stays green
offline. To run them, export a Sepolia RPC endpoint (defined in the root `.env`):

```bash
export SEPOLIA_RPC_URL="https://your-sepolia-rpc"
forge test --match-path 'test/integration/*' -vv
```

The endpoint is wired through `[rpc_endpoints]` in `foundry.toml`.

## Deploy

Target network: **Base Sepolia** (chain `84532`).

1. Configure env: `cp .env.example .env` (at the repo root) and fill in `BASE_SEPOLIA_RPC_URL` and a
   funded `DEPLOYER_PRIVATE_KEY` (get Base Sepolia ETH from a faucet, e.g.
   <https://www.alchemy.com/faucets/base-sepolia>). Need a key?
   `cast wallet new`. Optionally set `BASESCAN_API_KEY` to verify, and
   `BACKEND_SUBMITTER` (defaults to the deployer).
2. Deploy:

```bash
# from the repo root
pnpm run deploy:testnet
# or directly
bash contracts/script/deploy-base-sepolia.sh
```

The script broadcasts `script/Deploy.s.sol` via the `base_sepolia` RPC endpoint
(`foundry.toml`) and verifies on Basescan when `BASESCAN_API_KEY` is set. It
prints every deployed address (token, timelock, governor, reputation registry,
`ProjectWatcherFactory`, settings) and the configured factory backend.
