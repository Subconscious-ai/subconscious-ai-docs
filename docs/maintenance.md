# Documentation maintenance

Keep the public site on Docusaurus and existing GitHub Actions. Markdown and
source-owned contracts stay in Git; ordinary builds require no paid search,
documentation service, or AI provider. Existing hosting and CI quotas still apply.

## Ownership

Rehoboam owns endpoint and native MCP definitions, visibility allowlists, field
descriptions, examples, and committed contract exports. Holodeck owns its route
inventory and application workflows. This repository owns public research
explanations and publishes pinned contracts from a successful production release.
Update meaning at its source; generated references are never hand-edited.

A field contract should explain purpose, accepted values, units, defaults,
constraints, and important interactions. Workflow prose adds when to use it,
prerequisites, cost or side effects, error recovery, and interpretation limits.
Presence checks cannot establish scientific validity or complete business context.

## Quiet cadence

| Trigger | Work | Engineer experience |
| --- | --- | --- |
| Relevant PR | Existing source export/inventory checks; public build, links, pins and release-proof checks | Existing check suite; no bot comment per push. Objective build/contract failures block; prose suggestions do not. |
| Successful backend release | Hourly detector checks deployment success and matching live health SHA; syncs released REST and MCP | One shared `chore/sync-api-spec` PR, updated in place. Detection may lag an hour. |
| Daily | Full reconciliation of the same release and pins | No PR when unchanged. Persistent missing credentials or release mismatches fail visibly. |
| Weekly | Bounded semantic review and eligible contract PR publication | At most one documentation PR per affected repository; notify only actionable changes, failures, or completed publication. |

The weekly review is an existing Codex task heartbeat, Monday 09:00 America/New_York,
limited to 30 minutes and ten materially changed prose pages. It records actual
coverage, carries excess work forward, and does not hold up normal builds if its
AI allowance is unavailable. The tracked implementation plan is the initial
review baseline; subsequent reviews advance only the revisions actually reviewed.

## Generated update merge policy

The weekly reviewer may merge the shared sync PR only after all required checks
pass on its exact head, successful production release evidence matches backend
health, and the entire diff is confined to:

- `site/openapi/subconscious.public.json`
- `site/static/openapi/subconscious.public.json`
- `site/provenance/sources/openapi.public.provenance.json`
- `site/provenance/sources/mcp-tools.public.json`
- `site/provenance/sources.json`
- `site/provenance/release.json`

Changes to public visibility policy or operation/tool membership require ordinary
review. Narrative, scientific claims, runtime changes, and new access scopes do
not qualify for this generated-file path. Engineers can review and merge sooner;
release detection itself does not silently publish a changed public contract.
After merge, verify the existing explicit docs deployment, live revision stamp,
and production content checks. Record the deployed revision separately from merge.

## Operations

`sync-spec.yml` reuses `REHOBOAM_READ_TOKEN` with source Contents and Actions read
access. The workflow token writes this repository's shared PR and dispatches the
normal build and secret scan for its branch. Explicit dispatch is necessary because
PRs created using `GITHUB_TOKEN` do not trigger ordinary PR workflows.

Run the workflow manually after changing synchronization behavior. Confirm its
release receipt, resulting PR or no-op, exact-head checks, and live read-back.
An hourly mismatch can be a deployment transition; a daily/manual mismatch must
be investigated. Do not resolve it by documenting an unreleased default branch.
No repeated comments, per-endpoint issues, extra scheduler, or paid experiment
execution is part of maintenance.
