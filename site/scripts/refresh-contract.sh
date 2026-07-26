#!/usr/bin/env bash
# Re-vendor the design-system contract.
#
# contract.css is copied in rather than imported: the design-system CDN
# (subconscious-ai.github.io/design-system/) 404s, and a docs build must not
# depend on a dead URL. The copy therefore drifts — this makes refreshing it
# one command, and stamps the source commit so drift is visible.
set -euo pipefail

SRC="${DESIGN_SYSTEM:-$HOME/subconscious-ai/design-system}"
DEST="$(dirname "$0")/../src/css/contract.css"

[ -f "$SRC/contract.css" ] || { echo "design-system not found at $SRC"; exit 1; }

SHA=$(git -C "$SRC" rev-parse --short HEAD)
{
  echo "/* VENDORED from Subconscious-ai/design-system @ $SHA — do not edit here."
  echo "   Refresh with: bash scripts/refresh-contract.sh */"
  echo
  cat "$SRC/contract.css"
} > "$DEST"

echo "contract.css refreshed from design-system @ $SHA"
