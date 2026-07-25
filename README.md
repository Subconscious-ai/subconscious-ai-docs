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
