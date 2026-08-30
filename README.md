# subconscious-ai-docs

Source for [docs.subconscious.ai](https://docs.subconscious.ai), built with
[Docusaurus](https://docusaurus.io) 3.

This replaced two earlier systems: a Fern site (last substantive change
December 2024, preserved at tag `fern-final`) and an unmodified Mintlify
starter template that was serving on the domain.

The authoritative two-repository architecture, source inventory, route map, and
retirement gates are in
[`MIGRATION_RETIREMENT.md`](MIGRATION_RETIREMENT.md). That plan records unknowns
as blockers and does not authorize deleting or disabling a source.

## Current architecture

As of 2026-07-28:

| Concern | Source of truth | Published through |
| --- | --- | --- |
| Public narrative docs | This repository, `site/docs/` | `docs.subconscious.ai` |
| Public REST contract | Rehoboam `develop` | Pinned OpenAPI artifact in this repository |
| Public MCP contract | Ghostshell `main` | Pinned tool artifact in this repository |
| Internal narrative docs | Private `subconscious-ai-docs-internal` repository | Exact artifact mounted by Holodeck |
| Internal access control | Holodeck | Existing Auth0 session boundary at `/internal-docs/*` |

The source repositories generate runtime contracts. This repository pins and
publishes them. A source pull request, its merge, the downstream pin, and the
production read-back are separate evidence.

## Layout

```
site/
  docs/                handwritten pages
  docs/api-reference/  GENERATED from the spec — gitignored, do not edit
  openapi/             the published API spec, synced from rehoboam
  scripts/             spec sync and llms.txt generation
  static/              images, robots.txt, the downloadable spec
```

## Working on it

```bash
cd site
pnpm install --frozen-lockfile
pnpm run gen-api-docs              # needed before pnpm start after a clean clone
pnpm start
bash scripts/agent/validate-fast.sh   # the pre-merge gate; run this before opening a PR
```

`scripts/agent/validate-fast.sh` is the same gate the Build docs workflow runs,
so a green run locally means a green run in CI. It runs, in order:

```bash
pnpm run test:release-proof           # deployment proof
pnpm run test:ci-contracts            # CI credential and reindex behavior
pnpm run check:migration-evidence     # route map and source inventory
pnpm run test:agent-source-contracts  # pinned source digests
pnpm typecheck
pnpm build
```

`pnpm build` is the clean-checkout production command and runs five steps in
order: generate the API reference, stamp the revision, build the site, write
`llms.txt`, write the agent artifacts. It fails on a broken link or broken
anchor. That is deliberate: a broken link in docs becomes a support ticket.

## What a build publishes besides pages

| Path | What it is |
| --- | --- |
| `/revision.json` | The commit this build came from. CI asserts the stamp matches the SHA it was told to build, and `verify-production.mjs` checks the live site serves the deployed commit. |
| `/llms.txt`, `/llms-full.txt` | The site as plain text for model consumption. |
| `/docs-manifest.json` | Every published page with its disposition. |
| `/mcp/tools.json`, `/openapi/openapi-manifest.json` | The MCP tool registry and the API schema, pinned by revision and SHA-256 in `site/provenance/sources.json`. |

This repository and those published agent surfaces are the canonical public
documentation. Company-internal ownership, execution routing, and runbooks stay
in private repositories; do not copy or link private material into this public
site.

## Data placement

Put customer-facing explanations in `site/docs/`. Change executable API or MCP
contracts in their owning service repositories, then republish the pinned
artifacts here. Keep brand source language in design-system and keep internal
operations, customer records, credentials, and agent memory out of this public
repository. The private Hermes source registry routes internal agents; this
public repository does not copy or expose that registry.

`scripts/agent-source-contracts.mjs` fails the build when a pinned source no
longer matches its digest. `pnpm run sync-spec` updates both committed schema
copies, the owner manifest, the consumer revision, and both raw-byte digests as
one contract. rehoboam owns the OpenAPI schema and ghostshell owns the MCP
registry; this repository validates and republishes, and must not become a
second source of truth.

`migration/route-map.json` and `migration/source-inventory.json` record what the
migration produced, validated on every build by
`scripts/check-migration-evidence.mjs`. `MIGRATION_RETIREMENT.md` is the
decision record and authorizes nothing on its own.

Docusaurus is configured with `url: "https://docs.subconscious.ai"` and
`baseUrl: "/"`. Local or preview URLs do not change the canonical public base.

## Updating the API reference

The reference is generated from `openapi.public.json`, which is built in
[rehoboam](https://github.com/Subconscious-ai/rehoboam) from the visibility
rules in its `docs/api/public_surface.yml`. Nothing about the published API
surface is decided in this repo.

```bash
cd site
pnpm run sync-spec        # pull the spec from rehoboam (REHOBOAM_REF=develop)
pnpm run rebuild-api-docs # regenerate the MDX
pnpm build
```

To change **which** endpoints are published, or to add an example to one, edit
`docs/api/public_surface.yml` or `docs/api/overlay.yaml` in rehoboam and open a
PR there.

## Conventions

- Structure follows [Diátaxis](https://diataxis.fr): get started (learning),
  guides (tasks), API reference (information), concepts (understanding).
- Do not restate marketing claims without a source. `CONTENT_TRIAGE.md` lists
  the claims deliberately withheld from the old site.
- Legal pages are migrated verbatim. Do not edit them for style.
- Generated API pages are build artifacts. Fix the spec, not the MDX.

## Operational notes

Traps that produced a green build while the site was broken. Each one cost real
time on 2026-07-25; none is obvious from the Docusaurus docs.

**`cleanUrls` must stay true in `vercel.json`.** With `trailingSlash: false`
Docusaurus emits `page.html`. Without `cleanUrls`, Vercel 404s every
extensionless route — which is every internal link and every sitemap URL. The
homepage still works, so it presents as a content problem.

**Verify deployed routes without following redirects.** Vercel preview
deployments are SSO-protected, so `curl -L` lands on a login page and reports
200. Check page text, not status codes:

```bash
curl -sS "https://docs.subconscious.ai/get-started/quickstart?cb=$RANDOM" | grep -o "<title>[^<]*"
```

**Capitalized JSX disappears in `.md` files.** Imported pages are CommonMark, so
`<Cards>`, `<Card>` and friends are handed to the browser as unknown tags and
dropped — content vanishes rather than rendering as text. After any import, run:

```bash
grep -rho "<[A-Z][A-Za-z]*" docs/ | sort -u   # must be empty
```

**Generated API pages are build output.** `docs/api-reference/` is gitignored
and rewritten by `pnpm run gen-api-docs`. Change the spec in rehoboam
(`docs/api/public_surface.yml`, `docs/api/overlay.yaml`), never the MDX.

**A merged pull request is not a deployment.** On 2026-07-27 Vercel stopped
producing production deployments for merges to `main` while pull request
previews kept building. It left no record: not a skipped deployment, not an
errored one. Thirteen merges across the two docs repositories shipped nothing
and no check went red. `.github/workflows/deploy.yml` now creates the
deployment explicitly with the commit pinned and polls it to `READY`, because
that is the only path that has worked reliably. If that job is red, the site
did not update.

Ruled out at the time, so nobody repeats the work: a duplicate Vercel project
on the same repository (real, deleted, not the cause), `Require Verified
Commits` (the merges that failed were GitHub-signed and the direct push that
succeeded was unsigned), a custom ignored build step, and a paused project.

**A check can be green and testing nothing.** `gitleaks-action` refuses to run
on an organisation repository without a paid licence, so the secret scan failed
on the licence check for weeks and scanned no code. It now installs the binary,
which is free, pinned by version and sha256. Before trusting any check, read one
of its logs.

**Pin the package manager.** `packageManager` in `site/package.json` is load
bearing. An unattended agent resolved pnpm 11 through corepack while CI used
pnpm 10; pnpm 11 ignores `pnpm.onlyBuiltDependencies` in `package.json`, so the
install stopped for an interactive approval that no agent can give.

**The archive is `unlisted`, not deleted.** `/wiki` and `/fern` stay reachable
by direct URL but are excluded from the sidebar, search and sitemap. Remove the
`unlisted: true` frontmatter to surface a page after editing it.

**The explicit deployment workflow is the production path.** Vercel previews
still build, but merge-triggered production builds proved unreliable.
`.github/workflows/deploy.yml` creates a commit-pinned production deployment and
waits for `READY`. Do not infer production state from the merge or preview.
`vercel.json` must stay in both the repo root and `site/`; losing either copy
silently breaks `cleanUrls`.

The authoritative GitHub deployment environment is **`Production – docs`**.
The older **`Production – subconscious-ai-docs`** project is a duplicate and
is not production evidence. It is intentionally left untouched here.

**Production proves its exact revision.** Every build writes
`/revision.json` from `VERCEL_GIT_COMMIT_SHA` (or the CI source SHA). After an
independently authorized successful `Production – docs` deployment, the
`Verify production docs`
workflow requests the canonical domain without following redirects, checks
that `/revision.json` matches the deployed SHA, and asserts content on `/`,
`/human-baselines`, `/api-reference/superego`, `/search`, `/llms.txt`, and the
downloadable OpenAPI document. A login or 404 body is a failure even if its
HTTP status is `200`.

**`onBrokenLinks` is `throw`.** It caught a broken link in the privacy policy
and twelve in the human-baselines index. Keep it that way.

**The API contract syncs itself.** `.github/workflows/sync-spec.yml` runs the
same provenance-aware sync used locally on weekdays and opens a PR when the
schema, downloadable copy, owner manifest, revision, or digest differs. It
requires the `REHOBOAM_READ_TOKEN` secret and fails when it is missing, so a
lost credential shows up as a red job rather than a silent skip.

**Verify a merge before deleting the branch.** A squash merge of the migration
PR landed on `main` without 80 of its pages — the imports, `/human-baselines`,
the assets and the `cleanUrls` setting were all in branch commits that the
squash did not carry over, and `--delete-branch` removed the remote copy. Check
before cleaning up:

```bash
git diff --stat <merge-commit> <branch-tip>   # expect empty
```

Then re-verify the live site, by page content rather than status codes. After a
deploy-method change the old deployment can still be serving, so the site looks
fine while the new build is broken.

**Regenerating the social card.** `static/img/social-card.png` is generated, not
hand-drawn. The only Docusaurus OG plugin is at `1.0.4-alpha`, which is not
worth putting in the deploy path, so the card is rendered once from SVG through
`sharp` (already present via `plugin-ideal-image`) and committed. Per-page
override still works: set `image:` in a page's frontmatter.
