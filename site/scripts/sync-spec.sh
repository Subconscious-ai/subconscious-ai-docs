#!/usr/bin/env bash
# Pull the published API spec from rehoboam into this repo.
#
# We commit the spec rather than fetching it at build time, for three reasons:
#   - the docs build stays reproducible and offline
#   - a spec change shows up as a reviewable diff in a docs PR
#   - a broken backend deploy cannot break the docs site
#
# Pin REHOBOAM_REF to a tag when cutting a docs release. It defaults to
# `develop` for day-to-day refreshes.
set -euo pipefail

REHOBOAM_REF="${REHOBOAM_REF:-develop}"
DEST="$(dirname "$0")/../openapi/subconscious.public.json"

mkdir -p "$(dirname "$DEST")"

echo "Fetching openapi.public.json from rehoboam@${REHOBOAM_REF}"
gh api "repos/Subconscious-ai/rehoboam/contents/openapi.public.json?ref=${REHOBOAM_REF}" \
  --jq '.content' | base64 -d > "$DEST"

python3 - "$DEST" <<'PY'
import json
import sys

spec = json.load(open(sys.argv[1]))
paths = spec["paths"]
operations = sum(len(v) for v in paths.values())
print(f"  {len(paths)} paths, {operations} operations, "
      f"{len(spec.get('components', {}).get('schemas', {}))} schemas")

# A spec without servers renders a try-it panel that posts nowhere.
assert spec.get("servers"), "spec is missing a servers block"
# Guard against pulling the internal spec by mistake.
leaked = [p for p in paths if p.startswith(("/api/v1/payments", "/api/v3/"))]
assert not leaked, f"internal operations present: {leaked}"
PY

cp "$DEST" "$(dirname "$DEST")/../static/openapi/subconscious.public.json"
echo "Wrote $DEST"
echo "Next: pnpm run gen-api-docs && pnpm build"
