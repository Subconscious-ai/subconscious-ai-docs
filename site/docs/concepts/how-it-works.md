---
id: how-it-works
title: How it works
description: Synthetic respondents, causal experimental design, and where Subconscious.ai fits against traditional market research.
---

# How it works

Traditional causal market research is slow and expensive because recruiting
humans is slow and expensive. Subconscious.ai replaces the recruited panel with
simulated respondents, and keeps the experimental design and statistics
unchanged.

```mermaid
flowchart LR
  Q["Research question"] --> A["Attributes and levels"]
  A --> D["Orthogonal design matrix"]
  P["Synthetic population"] --> R
  D --> R["Choice tasks"]
  R --> E["Simulated respondents answer"]
  E --> M["OLS · conditional logit · hierarchical Bayes"]
  M --> O["AMCEs, importance, willingness to pay"]
```

## The four parts

**Synthetic respondents.** AI-generated respondent profiles, built to be
demographically representative rather than convenient. Because the population
is constructed rather than recruited, it does not suffer from self-selection
bias or oversampling of whoever answers surveys.

**Causal experimental design.** Every study is a randomised discrete choice
experiment. Randomisation is what licenses causal claims: attributes vary
independently of one another, so an effect can be attributed to the attribute
rather than to what it correlates with.

![Causation cannot be pinned down by correlation alone; a controlled experiment can](/img/memes/causation-r2-controlled-experiment.png)

Correlational work can rule things in. Only a randomised design rules things
out.

![xkcd 925: correlation between cancer incidence and cell phone users](/img/memes/xkcd-cell-phones-cancer.png)

<small>xkcd 925, Randall Munroe, CC BY-NC 2.5.</small>


**Interactive design.** You supply a question; the platform proposes
attributes, levels, and respondent instructions, and you correct them before
running.

**Automation.** Design, execution, and analysis run without a human in the
loop, which is where the cost and time reduction comes from.

## What is genuinely different



![Statistics, framed as machine learning, framed as artificial intelligence, to an audience](/img/memes/statistics-ml-ai.png)

The claim is not that a language model can guess what people want. It is that a
well-specified experiment run against a representative simulated population
reproduces the effects measured in human studies: a claim that is testable,
and tested. See [Human baselines](/concepts/human-baselines).

## How it compares to surveys and forecasts

Traditional surveys recruit human panels and gather stated opinions weeks after
the question is asked. Persona chatbots generate unrandomized conversational text
without experimental controls. Subconscious.ai replaces both with randomized
discrete choice experiments executed on representative simulated buyer
populations.

Conjoint experiments estimate causal parameter effects (AMCEs, attribute importance, and,
when a price attribute is included, willingness to pay) with confidence intervals
using the same estimators applied to human conjoint data. When a decision requires
revenue, cost, or scenario modeling, teams pair estimated choice shares and
utilities with Monte Carlo financial modeling at
[models.subconscious.ai](https://models.subconscious.ai). Review
study-by-study replication proof in the
[Causal Fidelity Registry](https://fidelity.subconscious.ai/study) and the
[buyer validation guide](https://subconscious.ai/blog/methods-and-validation/synthetic-respondent-validation-against-human-studies).
