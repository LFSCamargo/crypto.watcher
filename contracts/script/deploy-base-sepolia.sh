#!/usr/bin/env bash
# Deploy the Crypto Watcher contracts to Base Sepolia.
#
# Usage:
#   1. cp .env.example .env  (at the repo root, then fill it in)
#   2. pnpm run deploy:testnet   (or: bash contracts/script/deploy-base-sepolia.sh)
#
# Requires a funded DEPLOYER_PRIVATE_KEY (Base Sepolia ETH from a faucet).
set -euo pipefail

# Run from the contracts/ directory regardless of where this is invoked.
cd "$(dirname "$0")/.."

# Load env from the central repo-root files (.env then .env.local override),
# falling back to a local contracts/.env if present.
load_env_file() {
  if [ -f "$1" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$1"
    set +a
  fi
}
load_env_file ../.env
load_env_file ../.env.local
load_env_file .env

: "${BASE_SEPOLIA_RPC_URL:?Set BASE_SEPOLIA_RPC_URL (see contracts/.env.example)}"
: "${DEPLOYER_PRIVATE_KEY:?Set DEPLOYER_PRIVATE_KEY (see contracts/.env.example)}"

verify_args=()
if [ -n "${BASESCAN_API_KEY:-}" ]; then
  verify_args=(--verify)
fi

echo "Deploying to Base Sepolia (chain 84532)..."
forge script script/Deploy.s.sol:Deploy \
  --rpc-url base_sepolia \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --broadcast \
  "${verify_args[@]}" \
  -vvv
