# Crypto Watcher — Contracts

Solidity + Foundry. Modular layout documented in
[../docs/CONTRACTS.mdc](../docs/CONTRACTS.mdc).

## Setup

```bash
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
forge test -vvv
```

## Modules

- `governance/` — `GovernanceToken` (ERC20Votes). Governor + Timelock to follow. `[MVP]`
- `voting/` — `ProjectVoting` + `ProjectVotingFactory`. `[MVP]`
- `reputation/` — `ReputationRegistry` (eligibility + weight). `[MVP → Phase 1]`
- `access/` — shared `Roles`.

## Deploy

```bash
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```
