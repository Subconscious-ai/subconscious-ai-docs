---
id: reproducible-runs
title: Reproducible runs
description: Make two runs of the same experiment comparable, and know how much noise remains.
---

# Reproducible runs

To compare two runs, keep the population, design, respondent instructions,
model, analysis, and artifact lineage explicit. A fixed seed controls a
particular draw. It does not establish that the whole pipeline or an external
model provider will return identical bytes.

The current request schema already defaults `llm_temperature` to `0.0`,
`resample_population` to `false`, and `population_seed` to `100`. Design and
latent-variable generation need additional controls for a planned comparison.

| Field                                     | Comparable value       | Default               | What it pins                                                                                                            |
| ----------------------------------------- | ---------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `llm_temperature`                         | `0.0`                  | `0.0`                 | respondent sampling                                                                                                     |
| `resample_population` + `population_seed` | `false` + a fixed seed | `false`, `100`        | which respondents answer                                                                                                |
| `design_seed`                             | any fixed integer      | `null` (fresh design) | the choice tasks and their order                                                                                        |
| `deterministic_stages`                    | `true`                 | `false`               | the pre-survey stages (latent variables, persona bios, mood statements) run at `llm_temperature` instead of a fixed 0.7 |
| `latent_variables_from_run`               | the first run's name   | `null`                | reuses the first run's latent-variable battery and scores, so respondent prompts repeat                                 |

## Apply the settings to a complete request

Merge this settings fragment into the study request from
[Run an experiment](/guides/run-an-experiment), after reviewing its population,
attributes, levels, privacy, and cost:

```json
{
  "llm_temperature": 0.0,
  "resample_population": false,
  "population_seed": 100,
  "design_seed": 42,
  "deterministic_stages": true
}
```

Retain the returned `wandb_run_name` with the request and artifacts. For a
later run of the same definition, set `latent_variables_from_run` to that
actual run name. This reuses the latent-variable bundle instead of generating
a new one. It requires the same population; inspect the reused artifact and
its respondent mapping rather than assuming that a matching count proves
matching identities.

## Measure the variation that remains

Keep the model and provider version, complete settings, realized design,
population artifact, latent-variable bundle, and analysis code with each run.
Compare the same estimand on the same scale and report the repeat-run variation
for your own study. Do not apply a correlation from another benchmark as a
universal noise threshold.

Temperature zero does not guarantee identical model responses. A repeated
synthetic result is also not validation against human behavior. Use the
[research validity checklist](/concepts/methodology#research-validity-checklist)
when deciding what the comparison supports.

## What the controls do not replace

Seeds preserve repeatability of specific random draws when the surrounding
inputs and implementation remain fixed. They do not remove randomization
within a design, freeze external services, repair a population mismatch, or
make two different study definitions comparable.
