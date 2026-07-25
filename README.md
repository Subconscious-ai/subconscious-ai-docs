# subconscious-ai-docs

Source for [docs.subconscious.ai](https://docs.subconscious.ai), built with
[Docusaurus](https://docusaurus.io) 3.

This replaced two earlier systems: a Fern site (last substantive change
December 2024, preserved at tag `fern-final`) and an unmodified Mintlify
starter template that was serving on the domain.

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
pnpm install
pnpm run gen-api-docs     # generate the API reference (needed after a clone)
pnpm start                # dev server
pnpm build                # production build; also writes build/llms.txt
```

`pnpm build` fails on a broken link or a broken anchor. That is deliberate: a
broken link in docs becomes a support ticket.

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

**The archive is `unlisted`, not deleted.** `/wiki` and `/fern` stay reachable
by direct URL but are excluded from the sidebar, search and sitemap. Remove the
`unlisted: true` frontmatter to surface a page after editing it.

**Deploys are CLI, not Git-triggered.** `vercel deploy --prod --scope subconcious`
from `site/`. `main` is therefore not automatically what is live. Connecting the
Vercel Git integration would fix that, and would also let
`showLastUpdateTime` and sitemap `lastmod` be re-enabled — both are off only
because CLI deploys upload without git history.

**`onBrokenLinks` is currently `warn`**, relaxed for the import. Restore `throw`
once the imported sections have been edited; it is what caught a broken link in
the privacy policy.

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
