# Public documentation site

This directory contains the Docusaurus site published at
[docs.subconscious.ai](https://docs.subconscious.ai). The repository root
[`README.md`](../README.md) is the authoritative development and deployment
guide.

From this directory:

```bash
pnpm install --frozen-lockfile
bash scripts/agent/validate-fast.sh
```

`validate-fast.sh` is the pre-merge gate the Build docs workflow runs. The root
[`README.md`](../README.md) lists the individual steps it runs.

`pnpm build` generates the API reference and release metadata before producing
the site. Production deployment is currently blocked on a repaired and observed
provider path; a green merge or preview is not production proof. Do not use
Docusaurus's GitHub Pages deployment command.
