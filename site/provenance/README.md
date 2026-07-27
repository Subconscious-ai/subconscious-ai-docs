# Agent artifact source gate

The requested `/llms-full.txt`, `/docs-manifest.json`,
`/openapi/openapi-manifest.json`, and `/mcp/tools.json` endpoints are not wired
into the production build yet.

Rehoboam #2140 was closed as not planned. Its accepted provenance is the exact
Git commit plus the revision-named Actions artifact, not a second manifest.
Ghostshell #15 contains the source-owned MCP manifest but remains an open draft.

`scripts/agent-source-contracts.mjs` is the validated consumption boundary. It
accepts:

- the curated OpenAPI bytes plus an exact Rehoboam repository, revision, path,
  and SHA-256 pin; and
- the source-owned Ghostshell manifest with an exact revision, deterministic
  tool digest, supported stdio transport, and environment-delivered bearer
  token.

The scaffold emits nothing. Production generation remains blocked until the
Ghostshell manifest is merged and both accepted inputs are pinned. Do not copy
the abandoned Rehoboam draft manifest into this repository.
