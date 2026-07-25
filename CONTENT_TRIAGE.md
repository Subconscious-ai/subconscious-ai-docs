# Content triage: Fern → Docusaurus

Every page in the retired Fern site, classified. The Fern source is preserved
at tag `fern-final` and in `fern/` until this migration merges.

Classification was done against the live API spec and the rehoboam source. It
is **not** verified against the current product UI — nobody has re-run the
screenshots. That is the main open task, marked **NEEDS PRODUCT REVIEW**.

Last updated: 2026-07-25.

## Summary

| Verdict | Pages | Meaning |
| --- | --- | --- |
| Migrated | 6 | Carried over, rewritten against current API |
| Rewritten | 5 | New page covering the same ground, old text discarded |
| Needs product review | 14 | Content depends on UI screenshots nobody has verified |
| Killed | 5 | Stale, redundant, or no longer true |
| Deferred | 12 | Showcase studies — worth keeping, needs a decision on form |

## Migrated

| Fern page | New page | Note |
| --- | --- | --- |
| `support/terms.mdx` | `/support/terms-of-use` | **Verbatim.** Legal text, not rewritten. Still dated "December 12, 2022". |
| `support/pp.mdx` | `/support/privacy-policy` | **Verbatim** except one fix: the source contained a broken placeholder link `[Link]()` at section 6.1, which broke the build. It is now plain text. **Legal needs to supply the intended target.** |
| `support/contact.mdx` | `/support/contact` | Addresses carried over unchanged. |
| `tutorial/token_gen.mdx` | `/get-started/authentication` | Steps still accurate; screenshot reused. |
| `product/FAQ.mdx` | `/support/faq` | See "claims withheld" below. |
| `use_cases.mdx` | `/concepts/use-cases` | Restructured; industry claims not carried over unverified. |

## Rewritten

| Fern page | New page | Why |
| --- | --- | --- |
| `welcome.mdx` | `/` and `/concepts/how-it-works` | Old page mixed a landing page, a philosophy statement, and a YouTube embed. Split. |
| `getting_started.mdx` | `/get-started/quickstart` | Described endpoints that no longer exist at those paths. |
| `knowledge_base/run_an_exp.mdx` | `/guides/run-an-experiment` | Now written against the real request model. |
| — | `/guides/poll-a-run` | New. Nothing in Fern documented async polling, which is where customers get stuck. |
| — | `/guides/mcp-server` | New. `ghostshell` is public and was documented nowhere. |

## Needs product review

These describe the dashboard UI. Screenshots date from 2024 and none have been
checked against the current build. **Do not publish until someone with the
product open confirms them.**

`knowledge_base/getting_started.mdx`, `knowledge_base/dashboard.mdx`,
`knowledge_base/step1.mdx`, `knowledge_base/step2.mdx`,
`knowledge_base/step3.mdx`, `knowledge_base/step4.mdx`,
`knowledge_base/experiment_results.mdx`, `knowledge_base/market_sim.mdx`,
`knowledge_base/personalize.mdx`, `product/compare_result.mdx`,
`product/experiment_performance_showcase.mdx`,
`product/experiment_result_performance.mdx`, `settings/settings.mdx`,
`tutorial/exp_replication.mdx`

Roughly 30 images and GIFs sit behind these pages.

## Killed

| Page | Why |
| --- | --- |
| `road_map.mdx` | A 2024 roadmap. Worse than no roadmap. |
| `our_team.mdx` | Belongs on the marketing site, not in docs. |
| `product/feature_bug.mdx` | Pointed at a GitHub Discussions board on the archived `sublime` repo. |
| `support/diag.mdx` | Diagnostics for a UI flow that no longer matches. |
| `tutorial/embedding.mdx`, `tutorial/research_programming.mdx`, `tutorial/goal.mdx` | Describe an API shape that no longer exists (no `/api/v1` prefix, endpoints since renamed). Rewrite from scratch if the capability still exists. |

## Deferred: the 12 replication showcases

`product/showcase/{Adam,Adida,Ares,Claret,Dutch,Hainmueller,Kreps,Luthi,Netchel,Rao,Skreli,Wu}.mdx`

These are the strongest credibility asset in the whole site — published human
studies replicated on the platform — and they were buried three levels deep
under "Product". They should be promoted, not dropped.

They are deferred rather than migrated because each one makes a quantitative
claim about how closely a replication matched its human baseline, and those
numbers are two years old. Re-running them, or confirming the figures still
hold, is a research task rather than a docs task.

Proposal: one landing page under `/concepts/human-baselines` plus one page per
study, published as figures are confirmed.

## Claims withheld pending sign-off

Carried in the Fern site, deliberately **not** repeated in the new docs. Each
is a marketing claim that needs an owner willing to stand behind it:

- "10,000x less costly and 1,000x less time" (FAQ)
- "Reduces the time and cost … by up to 100x" (welcome) — note this conflicts
  with the FAQ figure
- "guaranteed human-level reliability" (welcome excerpt)
- "As of February 2023 …" (FAQ) — stale framing, dropped

The new FAQ says what the platform does and how it is validated, without a
multiplier. Add the numbers back when someone can source them.

## Other findings

- The API exposes W&B in field names (`wandb_run_id`, `wandb_run_name`), so
  public docs must mention a vendor the customer does not otherwise care about.
  Worth a naming decision before the API is more widely adopted.
- Tag metadata in `app/config.py` links to a GitBook workspace
  (`app.gitbook.com/...`) for experiment request fields — a **fourth**
  documentation system, private, and referenced from the live spec. Those
  `externalDocs` links should point at docs.subconscious.ai.
