---
id: run-an-experiment
title: Run an experiment
description: "The full experiment loop through the Subconscious.ai API: question, design, population, execution, results."
---

# Run an experiment

An experiment answers one causal question: which features of a choice move
behaviour, and by how much. This guide covers the loop end to end.

## 1. State the question

The research question (`why_prompt`) drives everything downstream: the
attributes generated, the respondent instructions, and the dependent variable.

A good question names a decision and a population:

> What factors drive consumer choice of electric vehicles?

A vague question produces a vague design. Time spent here pays back more than anything else in the run.

## 2. Choose the design

You can let the platform generate attributes and levels from the question, or
supply your own.

Generate them:

```bash
curl -X POST "$SUBCONSCIOUS_API/api/v1/attributes-levels" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"why_prompt": "What factors drive consumer choice of electric vehicles?"}'
```

Review what comes back before running. Attributes that overlap in meaning
produce muddled effects, and levels that no real product would offer produce
findings you cannot act on.

## 3. Select a population

Defaults give you a general population. To target, see
[Design a population](/guides/design-a-population).

## 4. Run it

```bash
curl -X POST "$SUBCONSCIOUS_API/api/v1/experiments" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "why_prompt": "What factors drive consumer choice of electric vehicles?",
    "experiment_type": "conjoint",
    "is_private": false
  }'
```

The request model accepts around 105 fields. Nearly all are internal tuning
knobs with sensible defaults, and a few are inert. Start with the four fields
above; add more only when you have a reason.

:::note Size and cost
The smallest conjoint experiment is roughly 2,400 model calls. Experiments cost
real money to run: check the design before you launch, not after.
:::

## 5. Track it

See [Poll a run](/guides/poll-a-run), including the cases where the status
endpoint reports the wrong thing.

## 6. Read the results

Fetch the run for the design and estimated effects. To interpret AMCEs,
importance, and willingness to pay, see [Methodology](/concepts/methodology).

## Iterate

The useful loop is narrow, not wide: run a small experiment, look at which
attributes moved choice, then re-run with the dead attributes replaced. Adding
attributes to an existing design costs tasks and dilutes precision.
