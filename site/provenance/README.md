# Agent artifact source gate

`sources.json` pins the exact Rehoboam and Ghostshell revisions and SHA-256
digests consumed by this build. The files under `sources/` are copied from those
source-owned revisions. Do not edit them by hand.

`scripts/agent-source-contracts.mjs` rejects source drift and unsafe MCP
transport or authentication metadata. `scripts/gen-agent-artifacts.mjs` then
publishes:

- `/llms-full.txt`
- `/docs-manifest.json`
- `/openapi/openapi-manifest.json`
- `/mcp/tools.json`

Rehoboam remains the owner of the curated OpenAPI schema and its provenance
manifest. Ghostshell remains the owner of the MCP tool registry. This repository
only validates, pins, and publishes those contracts with the public docs.

Run `pnpm run sync-spec` from `site/` to update the OpenAPI contract. The command
resolves one exact Rehoboam commit, copies both committed schema copies and the
owner manifest, updates both raw-byte digests and the consumer revision, and
checks that the manifest's source revision is reachable and owns the same schema.
The weekday synchronization workflow calls this same command, so manual and
scheduled refreshes enforce one contract.

## Revision semantics

The consumer revision and the artifact-owner revision can differ after a squash
merge:

- `revision` is the exact default-branch commit from which this repository
  copied the file.
- The OpenAPI manifest's `source.revision` is the reachable commit that owns the
  schema bytes.
- `registry_revision` is the reachable Ghostshell commit that owns the exported
  tool registry.

This distinction is intentional. A green source pull request proves proposed
bytes, not default-branch adoption. After any source merge, regenerate
revision-bearing evidence from the final lineage, then refresh every downstream
revision and digest together.
