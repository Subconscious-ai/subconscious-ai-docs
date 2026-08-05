---
id: methodology
title: Methodology
description: "How Subconscious.ai designs conjoint experiments and estimates effects: orthogonal designs, AMCEs, and the three estimators applied to every run."
---

# Methodology

A Subconscious.ai experiment is a discrete choice experiment (a conjoint
study), run against simulated respondents rather than recruited humans. The
statistical machinery is the same one used for human conjoint data.

## Experimental design

An experiment describes a set of **attributes** (the features under study) and
their **levels** (the values each feature can take). From these the platform
builds a **design matrix**: each row is one choice task, and each task presents
a respondent with several complete profiles.

The design is orthogonal and blocked:

- **Orthogonal**: attribute levels vary independently of one another, so the
  effect of each attribute can be estimated separately rather than being
  confounded with its neighbours.
- **Blocked**: the full set of tasks is partitioned so no single respondent
  answers all of them, while the design as a whole remains balanced.

Levels are shuffled and profiles are randomised per respondent, with seeded
randomness so a run can be reproduced.

## What gets estimated

The headline quantity is the **AMCE**, the average marginal component effect:
the average change in the probability that a profile is chosen when one
attribute moves from its baseline level to another, holding everything else
fixed. Because the design is randomised and orthogonal, an AMCE is a causal
estimate within the experiment, not a correlation.

Derived quantities include:

- **Importance**: how much an attribute moves choice relative to the others.
- **Willingness to pay**: an effect expressed in the units of a price
  attribute, when the design includes one.
- **Market share simulation**: predicted shares for a set of competing
  profiles.

## Estimators

Three estimators run on every successful conjoint survey:

1. **OLS**: a linear probability model. Fast, and a useful sanity check.
2. **Conditional (multinomial) logit**: the standard discrete choice model,
   estimating utilities over the choice set.
3. **Hierarchical Bayes mixed logit**: estimated by MCMC, allowing
   preferences to vary across respondents rather than assuming one shared
   taste vector. This is what supports segment-level and mindset analysis.



![Statistician asking a t-distribution why it cannot just be normal](/img/memes/t-distribution.png)

Reporting several estimators is deliberate. Agreement between them is evidence
the result is not an artefact of one model's assumptions; disagreement is a
signal to look harder before acting on the finding.

## Validation

Simulated respondents are only useful if they behave like the humans they
stand in for. The platform is validated by replicating published human
conjoint studies and comparing effect estimates against the original results.
See [Human baselines](/concepts/human-baselines).

## Reading a result honestly

- An AMCE is an average. A large average effect can hide a segment that moves
  the other way; look at the mixed logit output before assuming uniformity.

![Point estimate as Barbie, confidence interval as Oppenheimer](/img/memes/point-estimate-vs-confidence-interval.png)

A point estimate on its own is a decoration. The interval is the finding.

- Effects are defined relative to a baseline level. Changing the baseline
  changes the numbers without changing the underlying preference.
- The experiment measures choice among the profiles you specified. It says
  nothing about options you did not put in the design.

## Research validity checklist

Use four checks before taking a result into a product or market decision.

**Decision validity**

- The experiment names the decision, chooser, alternatives, and outcome.
- The planned action and success threshold were set before the result was seen.

**Design validity**

- Attributes are distinct and actionable.
- Levels are plausible, mutually exclusive within an attribute, and cover the
  range the decision owner can use.
- The baseline and opt-out reflect a real choice.

**Estimation validity**

- The run produced its expected artifacts.
- The result reports the design and population that were approved before
  launch.
- Effects are read with uncertainty, relative to their baselines.
- OLS, conditional logit, and hierarchical Bayes estimates broadly agree, or
  their disagreement is investigated.
- Segment-level effects are checked before using an average as a universal
  claim.

**External validity**

- The population faces the decision in the stated time and place.
- Simulated choice is described as simulated choice, not observed sales,
  prevalence, or recruitment yield.
- Market simulations contain feasible products and only support comparisons
  among the submitted alternatives.

See [From question to decision](/guides/from-question-to-decision) for the
operational workflow that applies this checklist.
