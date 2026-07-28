# Developer Portal Consolidation Design

**Date:** 2026-07-25

**Status:** Superseded. This file preserves the original design context but is
not the current architecture or retirement authority. The live design uses
separate public and private repositories and native Git and Actions provenance.
See [`MIGRATION_RETIREMENT.md`](../../../MIGRATION_RETIREMENT.md).

## Purpose

Build one docs-as-code system that gives human developers and software agents
a clear path to the Subconscious.ai REST API, MCP server, and source code.
Retire the old Fern presentation and the internal GitBook after their retained
content has a canonical home.

The system has one repository and two fail-closed builds:

- `docs.subconscious.ai` contains reviewed public developer documentation.
- `internal.docs.subconscious.ai` contains the public documentation plus
  authenticated internal engineering material.

Internal source files must never enter the public build artifact. Hiding
internal routes in client-side navigation is not an access control.

The repository remains private while it contains internal source. Contributor
access is limited to the internal documentation group, and CI jobs receive only
the least privilege needed for their build. Public deployment jobs cannot read
internal deployment credentials. If the repository is ever made public,
`internal/` and `.reference/gitbook/internal/` must first move to a separate
private repository with the same build interface.

## Observable outcomes

The work is complete only when all of the following are true:

1. A new public developer can authenticate, make one safe REST request, connect
   a supported MCP client, and find the relevant public source repository
   without private help.
2. An internal developer can use one authenticated portal to find architecture,
   operations, local-development, API, MCP, and repository guidance.
3. An agent can discover the documentation, public OpenAPI contract, MCP tool
   schemas, page manifest, and source revisions without scraping navigation UI.
4. Every retained Fern or GitBook page has an explicit disposition and owner.
5. Public and internal build manifests prove that no internal page or asset
   appears in the public artifact.
6. Generated API and MCP reference material matches the exact source revision
   named in the deployed build.
7. GitBook and Fern are retired only after redirects and retained-content
   coverage are verified in production.

Implemented, validated, merged, deployed, and production-verified are separate
states. No workstream may infer a later state from an earlier one.

“Public developer” means a person can read the public guide without signing in,
then signs into an existing Subconscious.ai account to obtain an access token
from the application Settings page. Account approval and subscription purchase
remain product processes, not documentation behavior. The acceptance test uses
a pre-provisioned test account and the cheapest authenticated read,
`GET /api/v1/traits`; it does not require an anonymous API operation.

The first-release MCP compatibility claim is limited to clients that pass a
recorded live smoke test. The target matrix is MCP Inspector, Claude Desktop,
and Cursor. A client that does not pass is omitted from the supported list
rather than documented from assumed compatibility.

## Current state

### Legacy Git documentation

The `Subconscious-ai/subconscious-ai-docs` repository historically stored Fern
configuration and MDX. The legacy source is preserved at Git tag `fern-final`.
It has already been classified in `CONTENT_TRIAGE.md`; stale pages and
unsupported claims were not carried into the Docusaurus draft.

### Internal GitBook

The internal source is GitBook space
`RPAuLvXI0lCcTz39j3BR`. It has not been durably imported. An earlier
authenticated crawl was not committed and no surviving complete local copy is
available. The migration must use the authenticated page graph, retain source
paths and page IDs, and write to a new internal-only location.

### REST API

`https://api.subconscious.ai/openapi.json` is a live FastAPI-rendered OpenAPI
3.1 contract with 99 operations. Rehoboam is authoritative. The docs draft
uses a curated public export with 52 operations and a production server URL.
The public selection belongs in Rehoboam, not in the docs repository.

### MCP server

Ghostshell exposes 15 tools and a public tool-schema endpoint. Its hosted MCP
connection currently uses the legacy HTTP+SSE transport. Published setup
examples place an access token in the query string. Current MCP requires
Streamable HTTP for the primary remote transport and forbids bearer tokens in
the URI query string.

### Docusaurus

A Docusaurus 3 draft exists on branch `docusaurus-migration` and is visible at
`docs.subconscious.ai`. It includes task guides, generated API reference,
machine-readable OpenAPI, local search, redirects, and `llms.txt`. GitHub
`main` still contains the legacy source. The exact production deployment SHA
has not been proven, and the deployment is not yet governed by a reviewed
merge-to-main workflow.

## Source-of-truth model

| Concern | Authority | Docs-repository representation |
| --- | --- | --- |
| Public narrative docs | `subconscious-ai-docs/site/docs` | Handwritten MDX |
| Internal narrative docs | `subconscious-ai-docs/internal/docs` | Handwritten or reviewed imported MDX |
| Legacy Fern content | Git tag `fern-final` | Immutable archive plus disposition map |
| Internal GitBook content | GitBook export snapshot | Internal staging MDX plus manifest |
| REST contract | Rehoboam FastAPI/OpenAPI exporter | Generated public and internal specs |
| Public API selection | Rehoboam visibility rules | Generated public reference |
| MCP tool contract | Ghostshell tool registry | Generated tool-schema JSON and reference |
| Repository operation | Each code repository | Linked or synchronized owned guides |

The docs repository composes these sources. It does not become the authority
for runtime contracts or copy internal code documentation that changes with
the code.

## Repository layout

The target layout is:

```text
subconscious-ai-docs/
├── site/                         # public Docusaurus build
│   ├── docs/
│   ├── openapi/
│   ├── generated/mcp/
│   └── static/
├── internal/                     # internal-only Docusaurus content/config
│   ├── docs/
│   └── docusaurus.config.ts
├── shared/                       # reviewed content imported by both builds
│   └── docs/
├── .reference/
│   ├── fern/                     # pointers and inventory, not a second site
│   └── gitbook/internal/         # source-faithful migration staging corpus
│       ├── manifest.json
│       ├── pages/
│       └── assets/
├── scripts/                      # deterministic sync and validation
└── docs/superpowers/             # design and execution records
```

The exact internal Docusaurus wiring may reuse the public config, but the public
build command must enumerate only `site/` and `shared/`. It must not rely on
negative globs to exclude `internal/` or `.reference/`.

## Cross-repository artifact interfaces

Runtime repositories publish deterministic, source-stamped artifacts. The docs
repository consumes only immutable full commit SHAs.

### Rehoboam export

Rehoboam emits:

- `openapi.public.json`;
- optional `openapi.internal.json`;
- `openapi-manifest.json` containing `schema_version`, `source_repository`,
  `source_sha`, `generated_at`, and SHA-256 values for each artifact.

The docs sync command requires `REHOBOAM_REF=<full-sha>`, fetches the artifacts
through authenticated GitHub API access, verifies the hashes, and commits the
manifest beside the copied spec. Branch names such as `develop` are allowed for
local discovery but never recorded as deployment provenance.

### Ghostshell export

Ghostshell emits:

- `mcp-tools.json`, sorted by tool name with exact input and output schemas;
- `mcp-manifest.json` with the same provenance and hash fields.

The exporter reads the source tool registry without starting a server or
requiring credentials. The docs sync command requires
`GHOSTSHELL_REF=<full-sha>` and verifies the manifest before generation.

### Dependency order

```text
portal baseline
  ├── GitBook migration ──┐
  ├── two-build boundary ─┼── human and agent journeys ── retirement
  ├── Rehoboam export ────┤
  └── Ghostshell repair ──┘
```

The journeys workstream may use fixtures while exporters are under review, but
it cannot be marked validated until it consumes the merged, source-stamped
artifacts. Retirement depends on every preceding workstream.

## Content model

Canonical narrative pages use frontmatter that records:

```yaml
owner: team-or-person
audience: public | internal
source: handwritten | fern | gitbook | rehoboam | ghostshell
source_revision: immutable-identifier
last_verified: YYYY-MM-DD
status: current | review-required | deprecated
```

Imported GitBook pages begin as `audience: internal` and
`status: review-required`. Importing a page never approves it for publication.

The information architecture follows three developer jobs:

1. **Use the REST API:** authentication, safe quickstart, experiment lifecycle,
   task guides, errors, and generated reference.
2. **Connect an agent:** client setup, tool catalogue, safe example tasks,
   authorization, confirmation behavior, and troubleshooting.
3. **Work on the code:** repository map, architecture, local setup, tests,
   deployment, observability, ownership, and source links.

Conceptual material supports these jobs but must not block the first successful
request.

## Build and publication boundaries

### Public build

The public build contains:

- reviewed public and shared MDX;
- the curated public OpenAPI contract and generated API reference;
- public MCP setup and tool reference;
- public repository links;
- `llms.txt`, `llms-full.txt`, `docs-manifest.json`, and public tool schemas.

The public build fails if an internal source path, internal audience marker,
private GitBook URL, credential, or prohibited asset appears in its output.

### Internal build

The internal build contains the public material plus:

- reviewed internal GitBook migrations;
- architecture, operations, deployment, and incident guidance;
- internal repository and environment maps;
- the internal OpenAPI view when one is deliberately defined.

The internal deployment is protected by organization SSO or an equivalent
server-side gate. If the available hosting cannot provide a verified gate,
the build may be completed and validated locally, but it must not be deployed.

The gate covers HTML, JavaScript, source maps, images, downloads, OpenAPI, MCP
schemas, `llms` files, manifests, origin URLs, and CDN cache URLs. An
unauthenticated request to every artifact class must return no protected bytes.
Internal responses must not be stored in a public cache. Page-level redirects
or hidden navigation do not satisfy this requirement.

## GitBook migration

The importer performs a one-time authenticated migration:

1. Traverse the rendered internal page graph breadth-first.
2. Record the GitBook page ID, source URL, source path, title, and retrieval
   timestamp.
3. Prefer GitBook Markdown when available; use rendered content only to fill
   gaps.
4. Convert GitBook hints, tabs, cards, code, tables, and links to supported
   Docusaurus MDX.
5. Download authenticated images and files into the internal archive.
6. Rewrite internal links to relative MDX paths.
7. Remove scripts, trackers, UI chrome, signed URLs, and remote asset tokens.
8. Mark every page internal and review-required.
9. Validate queue exhaustion, unique source URLs, assets, internal links,
   MDX compilation, and a combined artifact hash.

Browser cookies, local storage, authorization headers, session tokens, and
signed asset query strings are never written to the repository, manifest, logs,
or page frontmatter. Crawl intermediates live in a task-specific temporary
directory. The importer copies only sanitized MDX and content-addressed assets
into the private repository, then removes the temporary directory after success
or failure. A secret scan is required before any commit.

The importer is complete when the manifest and the authenticated source graph
have the same page set. If authenticated browser access is unavailable, this
workstream is `BLOCKED`; a partial crawl is not a migration.

## REST reference

Rehoboam continues to generate the OpenAPI contract. The public exporter must:

- fail closed for new operations;
- include only explicitly approved public operations;
- set the canonical production server;
- remove private GitBook links and internal descriptions;
- preserve unique operation IDs;
- include auth, success, and material error responses;
- add examples to golden-path operations;
- emit its source commit SHA as provenance.

The docs build copies an exact exported artifact. It fails when the generated
reference is stale or the source SHA does not match the recorded manifest.

The interactive request panel is disabled for production mutations. It may be
enabled for safe reads or for all operations only after a sandbox exists.

## MCP reference and transport

Ghostshell remains authoritative for tool names and JSON schemas. The docs build
captures the tool catalogue from the source or a deterministic exporter, not
from prose tables.

The MCP repair workstream:

- adds a Streamable HTTP `/mcp` endpoint;
- keeps legacy SSE only as a bounded compatibility path;
- implements OAuth 2.1 authorization, protected-resource metadata,
  authorization server discovery, resource indicators, and audience validation
  for the hosted `/mcp` endpoint;
- sends access tokens only in the `Authorization` header;
- validates `Origin` for remote HTTP;
- documents stdio for local use and Streamable HTTP for hosted use;
- tests initialization, `tools/list`, one read-only tool, and one guarded
  mutating tool;
- publishes a generated `mcp-tools.json` with source SHA.

Documentation must not claim current-protocol compliance until the hosted
endpoint passes the protocol-level checks.

The first-release remote contract is Streamable HTTP plus MCP OAuth 2.1; static
query-string tokens are not a supported remote contract. The stdio server uses
an environment variable and remains the supported fallback while hosted OAuth
is incomplete. If the authorization-provider integration exceeds the bounded
workstream, the hosted remote path is marked `BLOCKED`, the stdio path ships,
and OAuth returns as a separate issue. The docs must not describe the legacy
query-token path as recommended during that interval.

## Agent-readable surface

The public portal emits:

- `/llms.txt`: concise routing index;
- `/llms-full.txt`: consolidated reviewed prose, excluding generated schema
  bulk;
- `/openapi/subconscious.public.json`: exact public REST contract;
- `/mcp/tools.json`: exact public MCP tool catalogue;
- `/docs-manifest.json`: canonical URL, title, audience, owner, source,
  verification date, and source revision for every page.

The internal portal emits equivalent internal artifacts behind the same access
gate as the internal HTML. Public artifacts must not link to internal ones.

These files complement human pages. They do not replace primary OpenAPI or MCP
contracts with bespoke summaries.

## Developer experience requirements

Each golden path contains:

- prerequisites and the cheapest safe validation call;
- copyable commands for curl and the supported SDK languages;
- expected success output;
- explicit failure output and recovery;
- links to the next task and exact generated reference;
- no real credential in URLs, examples, analytics, or logs.

The initial scope supports curl, Python, and TypeScript examples. Generated SDK
publication is deferred until repeated integration demand proves its value.

## Validation

### Content and build

- public and internal Docusaurus production builds;
- TypeScript checks;
- broken links, anchors, and redirects fail the build;
- MDX compilation for every imported page;
- local asset and internal-link closure;
- frontmatter schema validation;
- secret and signed-URL scan;
- public-output denylist for internal paths, hosts, and audience markers;
- deterministic manifest and `llms` generation.

### Contract

- Rehoboam export freshness and public-surface checks;
- OpenAPI lint and generated-reference build;
- Ghostshell tool export matches `tools/list`;
- MCP initialization and tool-list protocol tests;
- no query-string credentials;
- source SHA recorded in every generated contract.

### Journey

- anonymous public user can read the safe REST quickstart, then a
  pre-provisioned test user can retrieve a token from Settings and complete
  `GET /api/v1/traits`;
- authenticated user can connect an MCP client without placing a token in a
  URL;
- internal user can find and build the relevant repository from the internal
  portal;
- an agent can route from `llms.txt` to OpenAPI, MCP tools, and source ownership.

### Production

- verify the exact deployed revision;
- verify DNS, TLS, redirects, sitemap, robots, machine artifacts, and canonical
  URLs;
- verify the internal gate using unauthenticated denial and authenticated
  access;
- verify durable receipts for any test that creates a real experiment.

Every workstream writes an evidence record with the implemented SHA, validation
commands and raw result summary, merged SHA, deployment ID, production URL, and
production verification timestamp. Fields that do not yet exist remain
explicitly `not-merged`, `not-deployed`, or `not-production-verified`.

## Workstream decomposition

This program is deliberately not one implementation plan. Each workstream has
one repository boundary and one independently provable outcome.

1. **Portal baseline and provenance**
   - Repository: `subconscious-ai-docs`
   - Outcome: reviewed Docusaurus source on the production branch, Git-backed
     preview/production deployment, exact SHA evidence.

2. **Internal GitBook migration**
   - Repository: `subconscious-ai-docs`
   - Outcome: complete internal MDX staging corpus, assets, manifest, and
     migration triage; no public output.

3. **Two-build boundary**
   - Repository: `subconscious-ai-docs`
   - Outcome: public and internal builds with automated leakage tests; internal
     deployment only after a proven SSO gate.

4. **REST contract quality**
   - Repository: Rehoboam
   - Outcome: source-stamped public/internal exports and golden-path examples
     that pass lint and docs generation.

5. **MCP protocol repair**
   - Repository: Ghostshell
   - Outcome: Streamable HTTP and header-based authorization with protocol
     tests and generated tool catalogue.

6. **Human and agent journeys**
   - Repository: `subconscious-ai-docs`
   - Outcome: REST, MCP, and code golden paths plus the agent-readable surface.

7. **Retirement**
   - Systems: GitBook, Fern hosting, legacy docs routes
   - Outcome: verified redirects and coverage, followed by explicit
     approval-gated shutdown and secret removal.

## Pareto cuts

The following are not required for the first complete developer portal:

- generated client SDK publication;
- conversational or custom AI search;
- more than curl, Python, and TypeScript examples;
- Docusaurus documentation versioning before a second supported API contract;
- production mutation from an embedded “try it” panel;
- page-level authorization inside one static build;
- continuous two-way GitBook synchronization;
- visual redesign beyond clear navigation, readable typography, and accessible
  components;
- broad code ingestion or semantic indexing.

If any cut becomes necessary for the observable outcomes, it returns as a
separate issue with its trigger and evidence. It must not remain as an
unbounded deferred item in this program.

## Error handling and stop rules

- Authentication unavailable for GitBook: stop after three distinct bounded
  access attempts and request user sign-in; do not substitute the public wiki.
- Internal hosting gate unavailable: finish and validate the internal build
  locally, leave deployment blocked, and do not weaken the boundary.
- API or MCP contract drift: fail generation and fix the authoritative
  repository; do not patch generated MDX.
- Runtime experiment test is expensive or unreliable: use the cheapest safe
  read and a single bounded end-to-end run only when required.
- Public deployment cannot be tied to a source SHA: report `BLOCKED`; a visible
  page is not production provenance.

## Retirement gates

Fern or GitBook may be retired only when:

1. the source inventory is complete;
2. every retained page has a canonical destination;
3. redirects are validated from the old URLs;
4. the new public and internal builds pass their gates;
5. the exact deployed revisions are recorded;
6. an explicit owner approves the external shutdown or billing change;
7. retired credentials and integration secrets are removed and verified.

Retirement is destructive and remains approval-gated even when all technical
conditions pass.

GitBook redirect support is not required when the provider cannot express the
old private routes. In that case the retirement evidence includes the complete
old-to-new route map, a downloadable authenticated archive, and a tombstone
index at the last controllable internal URL. This fallback does not waive
content coverage or owner approval.
