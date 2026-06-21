#!/usr/bin/env bash
# Husky pre-commit: bootstrap hook PATH, then run scoped quality gates.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# GUI git clients often skip shell profiles; Foundry lives in ~/.foundry/bin.
if [[ ":${PATH}:" != *":${HOME}/.foundry/bin:"* ]]; then
  export PATH="${HOME}/.foundry/bin:${PATH}"
fi

# Prefer the repo-pinned Node version when nvm is available.
if [[ -s "${HOME}/.nvm/nvm.sh" ]]; then
  export NVM_DIR="${NVM_DIR:-${HOME}/.nvm}"
  # shellcheck disable=SC1091
  . "${NVM_DIR}/nvm.sh"
  if [[ -f .nvmrc ]]; then
    nvm use --silent >/dev/null 2>&1 || nvm install >/dev/null 2>&1 || true
    nvm use --silent >/dev/null 2>&1 || true
  fi
fi

export NX_DAEMON=false
export NX_ISOLATE_PLUGINS=false

pnpm run check:spaghetti
pnpm exec nx run-many -t lint --projects=o1-check,api,web
pnpm exec nx run-many -t typecheck --projects=o1-check,api,web

if git diff --cached --name-only --diff-filter=ACMR | grep -q '^contracts/'; then
  if ! command -v forge >/dev/null 2>&1; then
    echo "pre-commit: forge not found on PATH." >&2
    echo "Install Foundry (https://book.getfoundry.sh) or unstage contracts/ changes." >&2
    exit 1
  fi
  forge fmt --check --root contracts
  forge build --root contracts
fi
