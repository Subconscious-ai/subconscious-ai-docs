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

For a reviewed draft, use [Holodeck](https://app.subconscious.ai/ideation)
or the [MCP workflow](/guides/mcp-server) before launching. In REST, supply your
reviewed design through `pre_cooked_attributes_and_levels_lookup`:

```json
{
  "pre_cooked_attributes_and_levels_lookup": [
    ["Price", ["$30,000", "$40,000", "$50,000"]],
    ["Range", ["200 miles", "300 miles", "400 miles"]]
  ],
  "null_levels": false
}
```

This is a request fragment to add to the launch request below. Omit the lookup
to let the engine generate attributes and levels. Set `null_levels: false` when
the design should contain only your submitted levels.

## 3. Select a population

Choose explicit demographic constraints. See
[Design a population](/guides/design-a-population).

## 4. Run it

Before launch, record the research contract:

- the decision owner and the action this result could change
- the population that faces the decision
- the primary comparison and its baseline
- the attributes, levels, and alternatives that are deliberately out of scope
- the evidence threshold for revising the decision

Then check that each attribute is distinct, every level is plausible, and the
population is large enough for the requested run. This is a good point to catch
a design problem. The
[research validity checklist](/concepts/methodology#research-validity-checklist)
covers checks across the full workflow, before and after the run.

```bash
curl -X POST "$SUBCONSCIOUS_API/api/v1/experiments" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "why_prompt": "What factors drive consumer choice of electric vehicles?",
    "experiment_type": "conjoint",
    "target_population": {"age": [18, 99]},
    "is_private": true
  }'
```

Review the [request schema](/api-reference/create-experiments) for supported
options. A run consumes resources; review its design and population before
launching. A timeout is not authorization to start a duplicate run.

## 5. Track it

Keep the returned run ID and follow [Poll a run](/guides/poll-a-run).

## 6. Read the results

Fetch the run for the design and estimated effects. To interpret AMCEs,
importance, and willingness to pay, see [Methodology](/concepts/methodology).
For the full path from a business question through Analytics Studio to a
bounded recommendation, see
[From question to decision](/guides/from-question-to-decision).

## Iterate

The useful loop is narrow, not wide: run a small experiment, look at which
attributes moved choice, then re-run with the dead attributes replaced. Adding
attributes to an existing design costs tasks and dilutes precision.
