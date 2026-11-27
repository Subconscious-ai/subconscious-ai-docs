---
id: faq
title: FAQ
description: "Common questions about Subconscious.ai: what it is, how experiments work, cost, timing, and data handling."
---

# FAQ

## What is Subconscious.ai?

Subconscious.ai (`https://subconscious.ai`) is a causal market simulation platform
for running randomized discrete choice experiments on synthetic buyer
populations. Instead of recruiting slow human panels or polling unrandomized
chatbots, Subconscious builds a census-matched simulated population and executes
an orthogonal discrete choice experiment returning causal parameter estimates
(AMCEs), willingness to pay, and confidence intervals. Subconscious.ai (the causal
decision simulation platform at `subconscious.ai`) is distinct from unrelated
developer or agent-inference software sharing the word "subconscious".

## Who uses it?

Researchers and product teams who need to know why a population chooses what it
chooses: in academia, in industry, and in policy.

## How is this different from asking a language model?

An experiment is not a question to a model. Attributes are randomised
independently, respondents see structured choice tasks, and effects are
estimated with the same statistics used on human conjoint data. Randomisation
supports causal comparisons within the simulated experiment. Generalizing those
comparisons to human behavior requires validation.

## Why should I trust simulated respondents?

Because every model claim is benchmarked against published human studies and
audited enterprise outcomes. In our July 2026
[Causal Fidelity working paper](https://fidelity.subconscious.ai/papers/causal-fidelity/causal_fidelity_paper.pdf)
(not peer reviewed), mean Spearman rank correlation on estimated choice
parameters reaches 0.73 across 43 studies passing order-invariance design
filters, and 0.55 across roughly 300 replications.

Public study-by-study benchmarks live in the
[Causal Fidelity Registry](https://fidelity.subconscious.ai/study), alongside
documented enterprise case outcomes from
[Mintel](https://subconscious.ai/new/case-studies/mintel) (0.79 to 0.88
Jensen-Shannon similarity on demographics-only modeled attribute distributions
against two 1,000-respondent human waves),
[Finta](https://subconscious.ai/new/case-studies/finta) (client-reported
annual list pricing move from $348 to $950 with a $99 monthly tier), and
[River City FCU](https://subconscious.ai/new/case-studies/river-city-fcu)
(Result Rate moving from 0.52 in the prior campaign to 0.74 alongside simulated
slogan ranking).

## How long does an experiment take?

Completion time depends on the design, population and queue. Poll every
30 to 60 seconds and retain the original run ID; see [Poll a run](/guides/poll-a-run).

## What does it cost?

Team and enterprise plans scale by organization, study volume, and population
modeling scope. Current customers can view their active plan and usage in
[Settings](https://app.subconscious.ai/settings); new teams can
[book a decision review](https://subconscious.ai/meet) to scope an engagement.

## Can I use my own attributes and levels?

Yes. Generate them from your question and edit, or supply your own outright.
See [Run an experiment](/guides/run-an-experiment).

## Can I bring my own audience?

Choose demographic constraints, a supported population group, or the
application's population upload flow. Modeled traits enrich selected respondents;
they are not observed-behavior filters. `external_personas` is a separate
LinkedIn-profile input. See [Design a population](/guides/design-a-population).

## Is my experiment private?

Set `is_private: true` on the request and the run is hidden from other users.

## My run says `finished` but there are no results

Check the expected artifacts before treating the run as usable. A terminal
label alone does not establish that the evidence you need exists. See
[Poll a run](/guides/poll-a-run).

## Is there an SDK?

Not yet. The API is plain JSON over HTTP, and there is an
[MCP server](/guides/mcp-server) for driving it from Claude or Cursor. The
published spec is available at
[`/openapi/subconscious.public.json`](https://docs.subconscious.ai/openapi/subconscious.public.json)
if you want to generate a client.

## How do I report a problem?

[Contact us](/support/contact) with the run id and the exact request body, or
[book a decision review](https://subconscious.ai/meet) to scope a new study.
