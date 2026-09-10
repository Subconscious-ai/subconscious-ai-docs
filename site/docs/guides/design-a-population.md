---
id: design-a-population
title: Design a population
description: Define who is sampled, which characteristics are modeled, and what stays fixed across experiments.
---

# Design a population

A population defines who faces the decision. A persona is a simulated respondent
constructed for that population. Demographic selection, modeled traits, and a
respondent's generated answers are different parts of the experiment.

## Choose who is sampled

Start with one population mode. For a US adult starting point, use an explicit
age range. With no state specified, the standard US draw uses twelve
representative states; this is not a promise of a nationally weighted
probability sample.

```json
{
  "why_prompt": "How do price and driving range affect electric vehicle choice?",
  "experiment_type": "conjoint",
  "target_population": {"age": [18, 99]},
  "is_private": true
}
```

For a narrower US population, narrow the demographic constraints:

```json
{
  "why_prompt": "How do price and driving range affect electric vehicle choice among adults aged 25 to 45?",
  "experiment_type": "conjoint",
  "target_population": {"age": [25, 45]},
  "is_private": true
}
```

Submit either complete example through
[Create an experiment](/api-reference/create-experiments). Review the question,
design and cost before launch. These examples illustrate selection; they do not
establish that the sampled adults are vehicle buyers.

| Selection option | Meaning and constraint |
| --- | --- |
| `target_population` | US demographic selection. Age and income are inclusive ranges; other supported constraints use allowed-value lists. Supply an explicit constraint for the population you intend to study. |
| `non_us_target_population` | A separate non-US population mode. Coverage and constraint support depend on the population builder; use Holodeck to review the available configuration. |
| `use_population_group` and `population_group` | Select one named segment from the schema's allowed labels. A named segment is a selection rule, not a guarantee of identical individuals across runs. |

Do not combine competing selection modes. For supported fields and allowed
values, use the [experiment request schema](/api-reference/create-experiments).
For guided design and review before a paid launch, use
[Holodeck](https://app.subconscious.ai/ideation) or the [MCP workflow](/guides/mcp-server).

## Add modeled traits

`population_traits` adds modeled characteristics to already selected
respondents. It does **not** filter a population by observed behavior or prove
that a respondent has a real-world characteristic.

Fetch the catalogue to read the trait descriptions:

```bash
curl "$SUBCONSCIOUS_API/api/v1/traits" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

The experiment dictionary uses trait **names** and modeled values, rather than
catalogue IDs alone. For example, add this field to either complete request above:

```json
{"population_traits": {"Travel frequency": ["Weekly"]}}
```

This gives selected respondents modeled travel context. It does not identify
verified weekly travelers. Always pair modeled traits with an explicit supported population selection.

## Keep persona sources distinct

An uploaded population and `external_personas` are separate inputs.
`external_personas` contains LinkedIn profile URLs when
`use_external_personas` is enabled; it is not an arbitrary customer-data upload
format. Holodeck's population upload uses a separate stored respondent file.
Use the application's supported upload flow, and contact
[support@subconscious.ai](mailto:support@subconscious.ai) about a first-party
population before incorporating sensitive customer information.

## Make comparisons reproducible

Record the selection rule, modeled traits, respondent count and seeds with the
experiment. Holding `population_seed` and the configuration fixed with
`resample_population: false` preserves the respondent draw under the same
population data and implementation. Changing the source data or implementation
can change that draw. Set `resample_population: true` when independent draws are
part of the analysis plan.

A repeatable draw does not establish that the answers match human behavior.
Keep the population definition alongside the design and validation evidence.
See [Research design](/guides/research-design) and
[Human baselines](/concepts/human-baselines).

## Review before launch

- State who is included and excluded, and why that boundary matters to the decision.
- Separate observed demographic selection from modeled behavioral assumptions.
- Check the configured population and respondent count in Holodeck or the MCP draft.
- Keep selection and design fixed when the comparison is meant to isolate one change.
- Treat sample feasibility and external validity as separate questions.
