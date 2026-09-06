---
id: reproducible-runs
title: Reproducible runs
description: Make two runs of the same experiment comparable, and know how much noise remains.
---

# Reproducible runs

By default every run draws a fresh choice-task design and generates a fresh
latent-variable battery for its respondents. That is right for a one-off
study. It is wrong when you want to compare two runs, because the noise
between two identical runs is then larger than most effects you are
looking for.

Five request fields make two runs comparable. All of them default to the
non-comparable behaviour, so nothing changes unless you ask.

| Field | Comparable value | Default | What it pins |
|---|---|---|---|
| `llm_temperature` | `0.0` | `0.0` | respondent sampling |
| `resample_population` + `population_seed` | `false` + a fixed seed | `false`, `100` | which respondents answer |
| `design_seed` | any fixed integer | `null` (fresh design) | the choice tasks and their order |
| `deterministic_stages` | `true` | `false` | the pre-survey stages (latent variables, persona bios, mood statements) run at `llm_temperature` instead of a fixed 0.7 |
| `latent_variables_from_run` | the first run's name | `null` | reuses the first run's latent-variable battery and scores, so respondent prompts repeat |

## Run 1

```json
{
  "why_prompt": "Which vaccine attributes drive uptake?",
  "llm_temperature": 0.0,
  "resample_population": false,
  "population_seed": 100,
  "design_seed": 42,
  "deterministic_stages": true
}
```

Note the `wandb_run_name` in the response.

## Every later run of the same definition

Add the first run's name:

```json
{ "latent_variables_from_run": "echo-26-09-06-03-47-08-783" }
```

The run reuses the artifact `experiment_latent_variables_<name>` and skips
generation. It requires the same population: a respondent-count mismatch
is rejected, never silently partial.

## How much noise remains

Measured on seven published conjoint studies, two identical runs with the
full recipe agree at a median Pearson of 0.995 between their AMCE vectors
(minimum 0.938). The same respondent, shown the same task with the same
prompt, picks the same option about 80% of the time; that residue is the
model's own sampling at temperature 0. Without the recipe the same
comparison sat at 0.85 on the noisiest study.

Treat the per-study number as the band a prompt, model, or population
change must exceed before it means anything.

## What stays random

With no flags set, the design is a fresh draw every run and two runs share
no choice tasks. The seeds only make a draw repeatable when you ask; they
never remove the randomization inside a run.
