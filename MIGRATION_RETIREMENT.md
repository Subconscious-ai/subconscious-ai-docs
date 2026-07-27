# Documentation architecture and retirement evidence

This is the decision record for the documentation migration. It describes what
exists, who may change it, and the proof required before a separate retirement
change. It does not authorize a deletion, redirect, DNS change, merge, or
deployment.

Machine-readable source and route data live in
[`migration/source-inventory.json`](migration/source-inventory.json) and
[`migration/route-map.json`](migration/route-map.json).

## Architecture

| Surface | Authority | Delivery | Access | Owner |
| --- | --- | --- | --- | --- |
| Public documentation | [`Subconscious-ai/subconscious-ai-docs`](https://github.com/Subconscious-ai/subconscious-ai-docs), `site/` | `docs.subconscious.ai` from `main` through Vercel | Public | `@aviyashchin`, from this repository's `CODEOWNERS` |
| Internal documentation | Private [`Subconscious-ai/subconscious-ai-docs-internal`](https://github.com/Subconscious-ai/subconscious-ai-docs-internal) | Exact private artifact served by [`Subconscious-ai/holodeck`](https://github.com/Subconscious-ai/holodeck) at `/internal-docs/*` | Auth0 session required | Source owner is unassigned; Holodeck delivery owner is `@Subconscious-ai/dev-team` |
| Public REST contract | [`Subconscious-ai/rehoboam`](https://github.com/Subconscious-ai/rehoboam), `openapi.public.json` generated from `develop` | Copied into the public site and rendered as API pages | Public allowlist only | Rehoboam maintainer approval is unconfirmed |
| Public MCP contract | [`Subconscious-ai/ghostshell`](https://github.com/Subconscious-ai/ghostshell), exported tool manifest | Copied into the public site's agent endpoints | Public allowlist only | Ghostshell maintainer approval is unconfirmed |

The public and internal repositories remain separate. No private page, asset,
manifest, or credential may enter the public repository. Rehoboam and
Ghostshell own their generated contracts; this repository consumes pinned
artifacts and does not redefine either surface.

## Source disposition

| Source | Evidence | Disposition | Retirement state |
| --- | --- | --- | --- |
| Current public Docusaurus site | This repository and the public deployment proof in [#36](https://github.com/Subconscious-ai/subconscious-ai-docs/issues/36) | Retain as the public authority | Not retireable |
| Fern | Tag `fern-final` at `cc8816f2eb5d7cb71ed54e241cdfc30e285696b5`; 44 source pages; [`CONTENT_TRIAGE.md`](CONTENT_TRIAGE.md) | Retain the tag and `/fern/*` unlisted archive. Redirect only the four routes already mapped. Delete later only after the gates below. | Blocked |
| Mintlify starter | README history and three existing redirects. No exact source artifact or revision remains in this repository. | Keep redirects. The absent starter may be declared retired only after an owner confirms the historical inventory. | Blocked |
| Public GitBook space `Hz13MXZLCbJ7iCAVovhQ` | 36 mirrored pages at revision `MSWFgR11LfbMSYER7Xsh` under `/wiki/*` | Retain the unlisted mirror. Do not disable the source or add broad redirects until completeness is proven. | Blocked |
| Internal GitBook space `RPAuLvXI0lCcTz39j3BR` | Private manifest at revision `A4XseydnDgCEynfCFOLP`: 53 pages and 79 assets | Retain the source and private mirror. The release keeps 41 pages, removes 12 reviewed pages, and keeps 32 pages marked review-required. | Blocked |
| Rehoboam OpenAPI | Curated public spec and native Git/Actions provenance; [#2140](https://github.com/Subconscious-ai/rehoboam/issues/2140) and [#2146](https://github.com/Subconscious-ai/rehoboam/pull/2146) closed unmerged as not planned | Retain the current allowlisted artifact. Consumers pin the exact Git commit and revision-named Actions artifact; no custom source manifest will merge. | Active; not a retirement target |
| Ghostshell MCP tools | Safe export draft [ghostshell#15](https://github.com/Subconscious-ai/ghostshell/pull/15) | Migrate only the pinned public tool manifest into the current Docusaurus site. | Blocked on merge and deployed read-back |
| Internal Docusaurus release | Private artifact from [internal docs#2](https://github.com/Subconscious-ai/subconscious-ai-docs-internal/pull/2), consumed by [holodeck#1273](https://github.com/Subconscious-ai/holodeck/pull/1273) | Retain as the private destination after exact-revision Auth0 proof. | Blocked on merge, deployment, and authenticated read-back |

## Known unknowns

- The Fern tag contains 44 Markdown pages. The triage classifies 42 source
  pages: six migrated, three rewritten, 14 needing product review, seven
  killed, and 12 deferred. Its summary says five killed pages and also counts
  two new destination pages as rewrites.
  `human_validation/replicated_studies.mdx` and `support/careers.mdx` are not
  classified at all. Both remain ambiguous blockers. The 14 UI pages and 12
  replication studies also need named approvals before Fern retirement.
- The public GitBook mirror has 36 unique page IDs at one revision, but no
  source manifest proves that 36 was the complete space. All 36 are therefore
  retained and the GitBook space stays active.
- The Mintlify starter has no pinned source artifact or exact revision in Git
  history. Its three legacy routes stay redirected, but source retirement
  cannot be reconstructed from the repository alone.
- The internal release still contains 32 review-required pages. Its source
  owner is not established in repository governance.
- Rehoboam #2140 and PR #2146 closed unmerged as not planned. The accepted
  provenance is native Git history plus the revision-named Actions artifact.
  Ghostshell PR #15 remains a draft, so [#37](https://github.com/Subconscious-ai/subconscious-ai-docs/issues/37)
  stops at non-publishing consumption scaffolding until that source contract
  merges.
- The internal artifact and Holodeck Auth0 integration are draft pull requests.
  An authorized authenticated production read-back has not occurred.

## Route policy

Exact redirects already implemented in `site/docusaurus.config.ts` are listed
in `migration/route-map.json`. Everything else follows these rules:

1. `/fern/*` and `/wiki/*` remain unlisted, directly reachable archives.
2. A legacy route receives a redirect only when the destination preserves its
   purpose. No catch-all redirect may conceal an unmapped page.
3. `/internal-docs/*` is private. Anonymous requests must enter Auth0 with the
   original path as `returnTo`; authenticated responses must be private,
   no-store, and noindex.
4. API and MCP artifacts must identify their source repository and exact
   revision. Generated files are changed at their source, not by hand here.
5. A missing or ambiguous destination keeps its source active.

## Retirement gate

A separately authorized retirement pull request may act on one source only
after all of the following evidence is attached:

- source inventory completeness at an exact revision, including assets;
- named source owner approval and a rollback owner;
- merged source and destination pull requests;
- exact deployed revisions for the public or authenticated internal surface;
- content-aware read-back for representative pages, assets, 404s, cache,
  indexing, and auth behavior;
- every legacy route classified as redirect, retained archive, or intentional
  404, with redirect-loop and destination-content checks;
- retained archive location and checksums;
- rollback instructions tested without deleting the only source copy; and
- no unresolved `blocked` or `unknown` entry for that source in
  `migration/source-inventory.json`.

Current closure evidence is tracked by [#36](https://github.com/Subconscious-ai/subconscious-ai-docs/issues/36),
[#37](https://github.com/Subconscious-ai/subconscious-ai-docs/issues/37),
[internal docs#1](https://github.com/Subconscious-ai/subconscious-ai-docs-internal/issues/1),
[holodeck#1269](https://github.com/Subconscious-ai/holodeck/issues/1269),
[rehoboam#2140](https://github.com/Subconscious-ai/rehoboam/issues/2140),
[rehoboam#2131](https://github.com/Subconscious-ai/rehoboam/issues/2131), and
[ghostshell#13](https://github.com/Subconscious-ai/ghostshell/issues/13).
