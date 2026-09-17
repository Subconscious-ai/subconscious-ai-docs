# Agent artifact source gate

`sources.json` pins the exact Rehoboam revision and raw SHA-256 digests consumed
by this build. The files under `sources/` come from that source-owned revision;
do not edit them by hand. Rehoboam owns both public REST and native MCP contracts.

`release.json` records the successful production workflow run and exact revision
confirmed by the live backend health receipt at synchronization time. It is a
release receipt, not a perpetual assertion about current runtime health.

`scripts/agent-source-contracts.mjs` rejects changed bytes, mismatched owners,
and unsafe MCP transport or authentication metadata. The build then publishes
`/llms-full.txt`, `/docs-manifest.json`, `/openapi/openapi-manifest.json`, and
`/mcp/tools.json`, plus generated human-readable REST and MCP references.

## Updating the pins

From `site/`, run `REHOBOAM_REF=<verified-production-sha> pnpm run sync-spec`.
The existing sync command downloads both contracts before changing tracked files,
checks their provenance and ancestry, and refreshes all consumer digests together.
The scheduled workflow resolves a successful production release and checks its
revision against backend health before calling this same command.

## Revision semantics

- `revision` is the exact production commit from which the artifact was copied.
- Version-2 source manifests bind contract content and allowlist digests. They
  contain no commit IDs or commit timestamps; squash merges leave them unchanged.
- For version 2, MCP `registry_revision` is the exact downloaded release commit.
- Version-1 manifests remain supported for older releases. Their embedded
  `source.revision` must still be reachable from the downloaded release and own
  the same schema. Version-1 ancestry failures remain errors.

The sync records the resolved commit and raw artifact digests together. The
producer's CI still rejects stale schema/tool/policy bytes. No follow-up
provenance commit is needed for version 2 after a squash merge. Raw artifact
digests cover every nested schema; there is no second cross-language JSON
checksum with ambiguous numeric spelling.

See [maintenance policy](../../docs/maintenance.md) for cadence and merge bounds.
