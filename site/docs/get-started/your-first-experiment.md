---
id: your-first-experiment
title: Your first experiment
description: What actually happens when you start a Subconscious.ai experiment, and how to tell a good run from a bad one.
---

# Your first experiment

The [Quickstart](/get-started/quickstart) gets a run out the door. This page
explains what that run did, so you can judge whether the answer is any good.

## What happens after you POST

1. **Design.** The research question is turned into attributes (the features
   under study) and levels (the values each can take), then into an orthogonal,
   blocked design matrix of choice tasks.
2. **Population.** A synthetic respondent population is assembled from your
   targeting, or from the default general population.
3. **Execution.** Simulated respondents answer the choice tasks.
4. **Estimation.** Three models are fitted — OLS, conditional logit, and a
   hierarchical Bayes mixed logit — and effects are written to the run.

This takes tens of minutes. The smallest conjoint experiment is roughly 2,400
model calls.

## Judging the result

Before you believe a finding, check three things.

**Did it produce artifacts?** A run reporting `finished` with no artifacts did
not succeed. See [Poll a run](/guides/poll-a-run).

**Do the attributes make sense?** If two attributes mean nearly the same thing,
their effects are split between them and both look weak. If a level is
implausible, respondents avoid it and you learn nothing you can act on.

**Do the estimators agree?** Broad agreement across the three models is
evidence the effect is real. Disagreement means look closer before acting.

## What it does not tell you

- Anything about options that were not in the design.
- A market forecast. It is an experiment about relative preference, not a
  prediction of sales.
- A single answer for everyone. The average effect can conceal segments that
  move in opposite directions.

## Next

- [Run an experiment](/guides/run-an-experiment) — the loop in full.
- [Methodology](/concepts/methodology) — what AMCE and importance mean.
- [Human baselines](/concepts/human-baselines) — why simulated respondents are
  trusted at all.
