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
