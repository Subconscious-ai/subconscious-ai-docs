---
id: prospective-analytics
title: Causal and prospective analytics
description: "Model an intervention before acting: how controlled experiments, fitted choice models, uncertainty and human validation support eight business decision families."
---

# Causal and prospective analytics

**Know which action changes the outcome before you act.** Subconscious brings
experimental design, synthetic populations, effect estimation, and scenario
analysis into one research workflow. The result can inform a price, product,
message, segment, or competitive decision before the business commits to it.

The useful unit is a testable decision: change a defined input, measure a defined
outcome, and state what evidence would overturn the recommendation. The
[eight-decision study matrix](/guides/study-compatibility) maps business questions
to methods, inputs, and executable contracts.

## Three questions, different evidence

| Question | Evidence it needs | What it supports |
| --- | --- | --- |
| **What happened, and to whom?** | Observed transactions, survey responses, or historical records. | Description and associations; a causal interpretation needs an identification strategy. |
| **What changes when we intervene?** | A controlled comparison, such as randomized attribute levels or a randomized A/B test. | An estimated causal contrast within the experiment's design and population. |
| **What should we do next?** | Intervention estimates combined with a decision model, feasible scenarios, external calibration where needed, and an objective. | A prospective recommendation with explicit assumptions and a way to test it. |

A/B testing is itself experimental and can be prospective. A controlled
multi-attribute design extends the question from “Which of these two complete
offers wins?” to “Which features change choice, by how much, for whom, and which
feasible combination should we test next?” Interactions require a design and
model that identify them; they do not follow automatically from a main-effect
fit. The identification logic is developed in
[Hainmueller, Hopkins and Yamamoto (2014)](https://doi.org/10.1093/pan/mpt024).

## The Subconscious workflow

1. **Define the intervention.** Name the action, population, alternatives,
   outcome, and decision rule before collecting responses.
2. **Run a controlled design.** Vary the relevant attributes across synthetic
   respondents. Preserve the realized tasks and settings so the comparison can
   be inspected and repeated.
3. **Estimate effects and heterogeneity.** Read the relevant effect estimates,
   estimator assumptions, uncertainty, and differences across respondents or
   segments. Keep a respondent utility distribution distinct from an interval
   on a population effect.
4. **Compare future actions.** Use the fitted choice model to evaluate feasible
   configurations and competitive scenarios. Add costs and calibrated market
   inputs when the decision requires financial or volume outputs.
5. **Validate and update.** Compare with human evidence that matches the task
   and population. Record discrepancies and revise the next study accordingly.

The advantage is the connected workflow: a population definition, a controlled
intervention, an inspectable estimate, and a reusable decision model. Synthetic
execution makes repeated studies across designs and populations practical;
scientific reliability comes from the design and validation of each result.
More simulated responses alone do not establish greater human fidelity.

See [Methodology](/concepts/methodology),
[reproducible runs](/guides/reproducible-runs), and
[the supported analysis contract](/guides/study-compatibility#read-the-analysis-contract).

## What “causal” means here

Randomization can identify the effect of changing a feature **on responses in
the synthetic experiment**, under the design's assumptions. Applying that result
to people requires evidence that the simulated population reproduces the human
response to the same intervention. A convincing persona or an accurate average
survey response does not establish that transfer.

A prospective use does not require every validation exercise to occur before
the historical event. Replication of completed human studies can test a method;
a prospective recommendation then specifies the intervention and prediction
before the new outcome is observed. Keep those two records distinct.

## Evidence attached to the decision

In the [Mintel case study](https://subconscious.ai/new/case-studies/mintel),
demographics-only modeled attribute distributions reached 0.79 to 0.88
Jensen-Shannon similarity against two 1,000-respondent human research waves
without human choice data as model input. The case file also records observed
divergence above $34 where human demand fell sharply while the model assumed a
smoother decline.

In the [Finta case study](https://subconscious.ai/new/case-studies/finta), after
modeled pricing work, the CEO reported shifting annual list pricing from $348 to
$950 alongside a $99 monthly tier while $348 discounted annual sales continued.
In the [River City FCU case study](https://subconscious.ai/new/case-studies/river-city-fcu),
simulated slogan testing ranked candidate copy across 140 synthetic members and
subsequent live Meta campaign delivery recorded Result Rate moving from 0.52 in
the prior campaign to 0.74.

The [Causal Fidelity working paper](https://fidelity.subconscious.ai/papers/causal-fidelity/causal_fidelity_paper.pdf)
(July 2026, not peer reviewed) reports 0.73 mean Spearman rank correlation on
estimated choice parameters across 43 studies passing order-invariance design
filters, and 0.55 across roughly 300 replications. Study-by-study comparisons
are published openly in the
[Causal Fidelity Registry](https://fidelity.subconscious.ai/study).

For any new decision, Subconscious reports the randomized intervention, outcome
scale, estimator uncertainty interval, population frame, and relevant benchmark
evidence so executives can act on causal parameter estimates rather than
stated-opinion guesses.

## The Subconscious standard for causal decisions

Subconscious unifies experimental design, census-matched buyer populations,
causal estimation, and financial modeling in one reproducible workflow:

- Randomized, orthogonal discrete choice experiments isolate causal attribute
  effects with explicit outside options and randomized profile order.
- Three independent estimators (OLS, conditional logit, and Hierarchical Bayes
  mixed logit) run on every conjoint experiment to quantify heterogeneity and
  estimator agreement with confidence intervals.
- Every study links directly to the public replication record in the
  [Causal Fidelity Registry](https://fidelity.subconscious.ai/study) and
  connects programmatically via the
  [business decision matrix](/guides/study-compatibility),
  [research guides](/guides/research-design),
  [REST reference](/api-reference/superego), and
  [MCP tools](/reference/mcp-tools).
