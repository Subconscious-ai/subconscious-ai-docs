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
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SCHEMA_DEST="${SITE_DIR}/openapi/subconscious.public.json"
DOWNLOAD_DEST="${SITE_DIR}/static/openapi/subconscious.public.json"
MANIFEST_DEST="${SITE_DIR}/provenance/sources/openapi.public.provenance.json"
SOURCES_DEST="${SITE_DIR}/provenance/sources.json"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

mkdir -p "$(dirname "$SCHEMA_DEST")" "$(dirname "$DOWNLOAD_DEST")" \
  "$(dirname "$MANIFEST_DEST")"

RESOLVED_REVISION="$(
  gh api "repos/Subconscious-ai/rehoboam/commits/${REHOBOAM_REF}" --jq '.sha'
)"

echo "Fetching the public API contract from rehoboam@${RESOLVED_REVISION}"
gh api \
  "repos/Subconscious-ai/rehoboam/contents/openapi.public.json?ref=${RESOLVED_REVISION}" \
  --jq '.content' | base64 -d > "${TEMP_DIR}/schema.json"
gh api \
  "repos/Subconscious-ai/rehoboam/contents/openapi.public.provenance.json?ref=${RESOLVED_REVISION}" \
  --jq '.content' | base64 -d > "${TEMP_DIR}/manifest.json"

SOURCE_REVISION="$(
  python3 - "${TEMP_DIR}/manifest.json" <<'PY'
import json
import sys

print(json.load(open(sys.argv[1]))["source"]["revision"])
PY
)"

# The embedded source revision must remain reachable and own the same schema.
# This catches a provenance manifest stranded by a squash merge.
gh api "repos/Subconscious-ai/rehoboam/commits/${SOURCE_REVISION}" >/dev/null
gh api \
  "repos/Subconscious-ai/rehoboam/contents/openapi.public.json?ref=${SOURCE_REVISION}" \
  --jq '.content' | base64 -d > "${TEMP_DIR}/source-schema.json"

python3 - \
  "${TEMP_DIR}/schema.json" \
  "${TEMP_DIR}/manifest.json" \
  "${TEMP_DIR}/source-schema.json" \
  "$SOURCES_DEST" \
  "${TEMP_DIR}/sources.json" \
  "$RESOLVED_REVISION" <<'PY'
import hashlib
import json
import re
import sys
from pathlib import Path

schema_path, manifest_path, source_schema_path, pins_path, output_path, revision = sys.argv[1:]
schema_bytes = Path(schema_path).read_bytes()
manifest_bytes = Path(manifest_path).read_bytes()
schema = json.loads(schema_bytes)
manifest = json.loads(manifest_bytes)
source_schema = json.loads(Path(source_schema_path).read_bytes())

def canonical_sha256(value):
    payload = json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode()
    return hashlib.sha256(payload).hexdigest()

methods = {"get", "put", "post", "delete", "options", "head", "patch", "trace"}
paths = schema["paths"]
operations = sum(
    1
    for path_item in paths.values()
    for method in path_item
    if method.lower() in methods
)
print(f"  {len(paths)} paths, {operations} operations, "
      f"{len(schema.get('components', {}).get('schemas', {}))} schemas")

# A spec without servers renders a try-it panel that posts nowhere.
assert schema.get("servers"), "spec is missing a servers block"
# Guard against pulling the internal spec by mistake.
leaked = [p for p in paths if p.startswith(("/api/v1/payments", "/api/v3/"))]
assert not leaked, f"internal operations present: {leaked}"
assert re.fullmatch(r"[0-9a-f]{40}", revision), "resolved revision is not a commit SHA"
assert manifest["manifest_version"] == 1
assert manifest["source"]["repository"] == "Subconscious-ai/rehoboam"
assert re.fullmatch(r"[0-9a-f]{40}", manifest["source"]["revision"])
assert manifest["schema"]["filename"] == "openapi.public.json"
assert manifest["schema"]["canonical_sha256"] == canonical_sha256(schema)
assert manifest["schema"]["path_count"] == len(paths)
assert manifest["schema"]["operation_count"] == operations
assert canonical_sha256(source_schema) == canonical_sha256(schema), (
    "manifest source revision does not own the downloaded schema"
)

pins = json.loads(Path(pins_path).read_text())
pin = pins["openapi"]
pin["repository"] = "Subconscious-ai/rehoboam"
pin["revision"] = revision
pin["schema_path"] = "openapi.public.json"
pin["schema_sha256"] = hashlib.sha256(schema_bytes).hexdigest()
pin["manifest_path"] = "openapi.public.provenance.json"
pin["manifest_sha256"] = hashlib.sha256(manifest_bytes).hexdigest()
Path(output_path).write_text(json.dumps(pins, indent=2) + "\n")
PY

cp "${TEMP_DIR}/schema.json" "$SCHEMA_DEST"
cp "${TEMP_DIR}/schema.json" "$DOWNLOAD_DEST"
cp "${TEMP_DIR}/manifest.json" "$MANIFEST_DEST"
cp "${TEMP_DIR}/sources.json" "$SOURCES_DEST"

echo "Wrote the schema, downloadable copy, provenance manifest, and source pins"
echo "Next: pnpm run gen-api-docs && pnpm build"
