# Public documentation site

This directory contains the Docusaurus site published at
[docs.subconscious.ai](https://docs.subconscious.ai). The repository root
[`README.md`](../README.md) is the authoritative development and deployment
guide.

From this directory:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm run test:release-proof
pnpm build
```

`pnpm build` generates the API reference and release metadata before producing
the site. Production deployment is currently blocked on a repaired and observed
provider path; a green merge or preview is not production proof. Do not use
Docusaurus's GitHub Pages deployment command.
