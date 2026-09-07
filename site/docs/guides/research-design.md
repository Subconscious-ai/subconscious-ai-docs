---
id: research-design
title: Design your first study
description: Turn a behavioral research question into a choice experiment with a stated population, comparison, interpretation, and validation plan.
---

# Design your first study

Begin with a comparison you can explain. A conjoint experiment varies attributes
of alternatives and records which alternative a respondent chooses. In
Subconscious.ai, those respondents are synthetic: the observations are model
responses, not responses collected from people.

Use the workflow below to explore a hypothesis and prepare a study for further
validation. For the exact browser steps, see
[From question to decision](/guides/from-question-to-decision). For an executable
client, use [Run an experiment in Python](/guides/python-workflow).

## Write the study brief

Complete this brief before generating a design. Keep it with the request and
result artifacts so another researcher can understand what you intended.

| Decision          | Record                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Question          | One choice a respondent can make in a specified context                                         |
| Target population | Who the finding is intended to describe, and why the available synthetic population is relevant |
| Comparison        | Attributes, levels, baseline, and any excluded combinations                                     |
| Outcome           | The choice or response the task actually records                                                |
| Analysis          | The contrast, estimator, segments, and sensitivity checks you will use                          |
| Decision rule     | What result would change the next research or business decision                                 |
| Validation        | What human evidence would support, contradict, or limit the interpretation                      |

A demographic filter describes how synthetic records are selected. It does not
by itself establish that their responses represent the target population.
Read [Design a population](/guides/design-a-population) before launching.

## Three illustrative designs

These examples show how to formulate a choice task. They are not completed
studies, validated instruments, or measured findings. The levels are illustrative;
replace them with values justified for your setting.

### Economics

**Question:** What makes a job worth taking?

Ask a defined population of job seekers to choose between job offers. Hold the
role and location context constant while varying annual salary, working
arrangement, and commute. State the currency, working hours, and whether “neither
offer” is a realistic response.

| Attribute           | Illustrative levels                     |
| ------------------- | --------------------------------------- |
| Annual salary       | $60,000; $70,000; $80,000               |
| Working arrangement | Five days in office; three days at home |
| Commute each way    | 20 minutes; 45 minutes                  |

**Interpretation:** Compare modeled preferences within these offers and levels.
If converting a feature effect to a money-equivalent quantity, verify the price
or salary coefficient, units, direction, and estimator. An unstable denominator
can make a ratio misleading. This design does not measure actual job acceptance
or equilibrium wages.

**Human validation:** Compare against an appropriately matched job-choice study
or collect responses to the same task. Match population, design, outcome, and
analysis before comparing estimates.

### Sociology

**Question:** Which housing proposal earns support?

Describe a concrete proposal and define the population whose views matter.
Vary the proportion of affordable homes, building height, and walking distance
to public transport. Explain what “affordable” means in this setting; a label
with different meanings across respondents is a different treatment.

| Attribute        | Illustrative levels                   |
| ---------------- | ------------------------------------- |
| Affordable homes | 20%; 40% of homes                     |
| Building height  | Four floors; eight floors             |
| Public transport | Five-minute walk; fifteen-minute walk |

**Interpretation:** Compare modeled support within the tested proposal features.
This does not establish community consent, estimate turnout, or predict a vote.
State which affected groups the design omits and inspect relevant segments
without treating exploratory differences as predeclared findings.

**Human validation:** Use a matched community survey or study with documented
sampling and the same proposal wording. Report disagreement as evidence about
the limits of the simulation.

### Psychology

**Question:** What encourages someone to seek support?

Study a hypothetical service choice by varying appointment delay, session
format, and cost. Keep the wording neutral and define the situation carefully.
Avoid implying that a model response reveals a person's diagnosis, internal
state, or future clinical outcome.

| Attribute         | Illustrative levels               |
| ----------------- | --------------------------------- |
| First appointment | Within one week; within one month |
| Session format    | Video call; in person             |
| Cost per session  | $15; $40                          |

**Interpretation:** The outcome is modeled preference for a service profile.
It is not treatment effectiveness, help-seeking behavior observed in people,
or validation of a psychological construct.

**Human validation:** Use an appropriate human study and review its measurement,
consent, and population requirements through your institution's process.
Do not substitute a synthetic choice task for validation of a clinical instrument.

## Review the generated design

Generation is a drafting aid. Inspect the actual task before you accept it:

- Each attribute changes one interpretable feature.
- Levels have explicit units and plausible ranges.
- Alternatives are understandable and feasible in the stated setting.
- The response options match the question, including an opt-out when appropriate.
- The number of attributes and tasks is justified by the comparison you need.
- Respondent instructions do not ask the model to produce the result you hope to find.

When you supply levels yourself, review settings that can add levels or response
options. Read the exact [experiment request schema](/api-reference/create-experiments)
instead of assuming browser defaults and API defaults are identical.

## Launch with a record you can audit

Choose [the browser workflow](/guides/from-question-to-decision),
[REST](/guides/python-workflow), or [MCP](/guides/mcp-server). Before launch,
review the population, design, model, respondent count, tasks per respondent,
privacy, and cost. Keep the submitted request, resolved design, run identity,
source/version information, and result artifacts together.

Use [reproducible run settings](/guides/reproducible-runs) deliberately. A fixed
seed is one control; it does not freeze external model behavior or establish
scientific validity. Poll the original run using
[the run lifecycle guide](/guides/poll-a-run). An inconclusive status read is not
a reason to create another potentially chargeable run.

## Report the result with its scope

A useful report states the question, population construction, design, analysis,
effect scale, uncertainty, sensitivity checks, and relevant human comparison.
Separate predeclared tests from exploratory analyses. Avoid translating a
modeled preference share into a sales, adoption, or election forecast.

Use this reporting sentence as a starting point:

> In this synthetic choice experiment, with the stated population construction,
> attributes, levels, and model settings, we estimated [contrast] on [scale].
> The result informs [bounded decision]. Its use beyond this design depends on
> [validation and assumptions].

Before sharing the result, work through the
[research validity checklist](/concepts/methodology#research-validity-checklist)
and read how [human-baseline comparisons](/human-baselines) are scoped.
