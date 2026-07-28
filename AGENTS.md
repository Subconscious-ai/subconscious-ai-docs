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
pnpm run gen-api-docs                 # regenerate the API reference from the spec
pnpm build                            # runs five steps, see below
pnpm start                            # local dev server

pnpm run test:release-proof           # deployment proof
pnpm run check:migration-evidence     # route map and source inventory
pnpm run test:agent-source-contracts  # pinned source digests
```

`pnpm build` runs five steps in order: generate the API reference, stamp the
revision, build the site, write `llms.txt`, write the agent artifacts.
`onBrokenLinks` and `onBrokenAnchors` are set to `throw`, so a bad link fails
the build rather than shipping a dead page.

Three checks run in CI beside the build, and all three are cheap enough to run
before opening a pull request. `test:agent-source-contracts` is the one that
will surprise you: it fails when a pinned source in `site/provenance/` no longer
matches its recorded SHA-256. That is not a flake. It means rehoboam or
ghostshell changed a contract this repository republishes, and the pin needs
updating deliberately rather than silently.

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
- **`packageManager` in `site/package.json` is load bearing.** It pins pnpm 10.
  An unattended agent once resolved pnpm 11 through corepack, and pnpm 11 moved
  `onlyBuiltDependencies` out of `package.json`, so the declaration above was
  ignored and the install stopped waiting for an approval no agent can give.
- **Two Vercel projects can attach to one repository.** Keep it at one. A second
  project errors on every pull request and puts a permanent red check on work
  that is fine.

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

A green merge is not a deploy. On 2026-07-27 Vercel stopped producing
production deployments for merges to `main` while pull request previews kept
building. Thirteen merges landed and none of them shipped. Vercel recorded
nothing at all: no deployment, not skipped, not errored.

**The cause is still unknown.** These were ruled out, each with evidence, so
nobody repeats the work:

- A duplicate Vercel project on the same repository. Real, and deleted. Merges
  still did not deploy afterwards, so this was not the cause.
- `Require Verified Commits`. The merges that failed were all GitHub-signed; the
  one direct push that succeeded was unsigned. Exactly backwards.
- A custom ignored build step, a paused project, a wrong production branch, a
  wrong root directory, a suspended GitHub App. All checked, all fine.
- A deploy hook. Vercel answers HTTP 201 with a PENDING job and then builds
  nothing.

`.github/workflows/deploy.yml` sidesteps all of it by creating the deployment
explicitly with the commit pinned, which has worked every time, then polling it
to `READY`. **If that job is red, the site did not update.**

To check any commit reached production:

```bash
curl -s https://docs.subconscious.ai/revision.json
```

The returned `revision` is the commit the live site was built from. Comparing
that to `git rev-parse origin/main` is the whole check. Do not infer a deploy
from a green merge.
