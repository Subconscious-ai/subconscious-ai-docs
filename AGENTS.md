# AGENTS.md

Public documentation for Subconscious.ai. Merging to `main` deploys
https://docs.subconscious.ai. Treat every change as customer-facing.

## Layout

| Path | What it is |
| --- | --- |
| `site/` | The Docusaurus root. Run every command from here. |
| `site/docs/` | Handwritten pages. This is what you edit. |
| `site/docs/api-reference/` | Generated from the spec. Gitignored. Never edit. |
| `site/openapi/subconscious.public.json` | The published spec, synced from rehoboam. |
| `site/static/` | Images and assets, served from the URL root. |
| `vercel.json` and `site/vercel.json` | Two identical copies. Both are required. |

## Commands

```bash
cd site
pnpm install --frozen-lockfile
pnpm run gen-api-docs   # regenerate the API reference from the spec
pnpm build              # the only check that matters
pnpm start              # local dev server
```

`pnpm build` is the gate. `onBrokenLinks` and `onBrokenAnchors` are set to
`throw`, so a bad link fails the build rather than shipping a dead page.

## What to change where

- **Page text**: edit the `.md` file under `site/docs/`.
- **Which API operations are published**: not here. Edit
  `docs/api/public_surface.yml` in `Subconscious-ai/rehoboam`, then run
  `pnpm run sync-spec` in this repo.
- **Navigation**: `site/sidebars.ts`. The API section is generated; the rest is
  hand-listed on purpose.
- **Styling**: `site/src/css/custom.css`, which maps Infima onto the vendored
  `contract.css` from the design-system repo. Change the contract copy by
  re-copying it, not by editing it in place.

## Writing rules

These are enforced by review, not by CI. They come from the design-system
`WRITING.md`.

- No em-dashes inside a sentence. Use a comma, a colon, or a full stop.
- Banned vocabulary: delve, robust, seamless, comprehensive, leverage, unlock,
  supercharge, elevate, transform, empower.
- Do not publish code or instructions that do not work. Less is more.
- Do not publish open questions or notes to ourselves. If a page raises a
  question, answer it or delete it.
- Do not publish performance or accuracy claims without a source on the page.

## Constraints

- **`cleanUrls: true` and `trailingSlash: false`** in both `vercel.json` files.
  Removing either returns 404 on every extensionless route while the build
  stays green. This has broken the site twice.
- **Do not pipe `pnpm build` into `grep`, `rg`, `head`, or a pager.** The
  writer dies on SIGPIPE, the build stops early, and the exit code is still 0.
  Redirect to a file and read the file.
- **Never commit a credential.** `.gitleaks.toml` holds the allowlist and CI
  runs a secret scan. A key that reaches this repo is public immediately.
- `sharp` needs a native build: `pnpm.onlyBuiltDependencies` lists it. Do not
  remove that entry.

## Pull requests

- Base branch: `main`.
- The `build` and `gitleaks` checks must both pass. They are required, and
  nothing merges without them.
- No approving review is required. `CODEOWNERS` still requests review from
  `@aviyashchin` on every file, but it does not block, so an agent can merge
  its own pull request once the checks are green.
- Direct pushes to `main` are refused. Everything goes through a pull request.

Merging deploys to a live customer-facing site with no human in the path.
Re-read what you wrote before you merge it.

## Confirm the deploy

A green merge is not a deploy. Vercel builds `main` through its GitHub
integration, and on 2026-07-27 that stopped firing for several hours while pull
request previews kept building, so eleven merges landed and none of them
shipped. Nothing reported the failure. The cause was two Vercel projects
connected to this one repository, `docs` and a duplicate that errored on every
build; the duplicate was deleted the same day.

Keep it at one project per repository. A second one competing for the same
pushes is how the first failure hid for a day.

After merging anything that changes the site, fetch the page you changed and
look for your text. If it is not there within a few minutes, check the project's
deployments in Vercel rather than assuming a delay.
