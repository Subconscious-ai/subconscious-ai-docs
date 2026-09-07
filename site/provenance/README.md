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
- OpenAPI `source.revision` owns the schema and visibility policy bytes.
- MCP `registry_revision` owns the source tool definitions and public allowlist.

An owner revision may precede the consumer revision, but must be reachable from
it. After a squash merge, refresh source-owned revision manifests on the durable
branch before downstream adoption. Raw artifact digests cover all nested schemas;
there is no second cross-language JSON checksum with ambiguous numeric spelling.

See [maintenance policy](../../docs/maintenance.md) for cadence and merge bounds.
