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
- Effects are defined relative to a baseline level. Changing the baseline
  changes the numbers without changing the underlying preference.
- The experiment measures choice among the profiles you specified. It says
  nothing about options you did not put in the design.
