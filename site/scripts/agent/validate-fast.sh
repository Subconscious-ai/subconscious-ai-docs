#!/usr/bin/env bash
set -euo pipefail

SITE_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$SITE_ROOT"

export DOCS_SOURCE_REVISION="${DOCS_SOURCE_REVISION:-$(git rev-parse HEAD)}"

pnpm run test:release-proof
pnpm run test:ci-contracts
pnpm run check:migration-evidence
pnpm run test:agent-source-contracts
pnpm typecheck
pnpm build
