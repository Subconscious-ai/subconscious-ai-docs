---
id: human-baselines
title: Human baselines
description: How Subconscious.ai validates simulated respondents against replicated human conjoint studies.
---

# Human baselines

Simulated respondents are only worth anything if they reproduce what humans do.
Human baselines are how that gets checked, rather than asserted.

## The method

![Peer review in a cramped submersible, "I did my own research" in a roomy one](/img/memes/peer-review-vs-own-research.png)


```mermaid
flowchart LR
  H["Published human study"] --> K["Answer key checked against the paper"]
  K --> D["Same attributes, levels, design"]
  D --> S["Re-run on simulated respondents"]
  K --> C{"Compare effect by effect"}
  S --> C
  C --> Y["Direction, magnitude, ranking agree"]
  C --> N["Divergence: a bound on what to trust"]
```


Take a published human conjoint study. Check its answer key against the paper:
the published effects, the attributes and levels, and the design, each with a
page citation. Re-run it on the platform with the same attributes, levels, and
design. Compare the estimated effects against the original human results.

A wrong answer key changes the score. On Klein2020, rescoring
the same simulated responses against the corrected key moved the rank
correlation from 0.448 to 0.932 (September 2026 review, one run; see
[Human baselines](/human-baselines)).

If the simulated AMCEs track the human AMCEs: same direction, comparable
magnitude, same ranking of what matters: the platform reproduces that study.
Where they diverge, that is a finding too, and a bound on what the platform
should be trusted for.

## Review the evidence

The [study registry](https://fidelity.subconscious.ai/study) lists 154
published conjoint experiments with each study's paper, answer-key review
status, and replication scores.

Use the [methodology](/concepts/methodology) and
[research design guide](/guides/research-design) to plan a matched comparison.
For a study-specific replication record, contact
[support@subconscious.ai](mailto:support@subconscious.ai) with the study,
population, design and result you want to evaluate.

A useful record identifies the original study, the matched experimental design,
the estimator, the reported comparisons and where the simulation diverged.

## How to use this

When you present a result to someone who has not seen the platform before, the
question is always "why should I believe this?" The honest answer is the
replication record: here are published human studies, here is what the platform
produced for them, here is how closely they agree.

That record is also the right place to check before running in a new domain.
Replication in one area is evidence, not a guarantee, for another.
