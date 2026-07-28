---
id: from-question-to-decision
title: From question to decision
description: Design, run, and interpret one conjoint experiment in Holodeck or through the API.
---

# From question to decision

The useful output of an experiment is a decision, not a dashboard. This guide
follows the current Holodeck journey from a business question to a bounded
recommendation, using a premium smartphone choice as the running example.

The same journey was used for the Antler hackathon. The workflow below replaces
that walkthrough's older requests and fixed waits with the current product and
API contracts.

## Start with the decision

Write down five things before opening Holodeck:

| Question | Smartphone example |
| --- | --- |
| What decision will change? | Which features and price range enter the next product brief? |
| Who owns it? | The product lead |
| Who is making the choice? | US premium smartphone buyers |
| What alternatives are in scope? | The proposed product and current flagship competitors |
| What evidence would change the decision? | A predeclared effect direction and threshold that holds across estimators and relevant segments |

Now state one choice question:

> When choosing a premium smartphone, how do buyers weigh price, camera,
> processor, battery, display, and weight?

This is narrower than “What do people want in a phone?” It names a decision,
the chooser, and the trade-offs the experiment can vary.

## Build the experiment in Holodeck

Open **[Holodeck](https://app.subconscious.ai/ideation)** and follow the five
steps shown in the experiment builder.

### 1. Why: What do you want to learn?

Enter the choice question. Use **Check suitability** before continuing.

The question drives the generated attributes, respondent instruction, and
outcome. If it does not name a choice, stop and rewrite it.

### 2. When/where: Time and location

Choose the country, year, and states when applicable. These values define the
context respondents should use and the demographic data available to the
population builder.

Do not choose a location merely because it is large. Choose it because the
people in that market face the decision you are studying.

### 3. Who: Who are you studying?

Use **Define characteristics** for demographic boundaries, **US Based
Population Group** for a reusable named group, or **Upload Population** when
you have an approved first-party audience.

Keep only traits that could plausibly change the choice. Validate a targeted
population before launch. A large estimated pool does not guarantee recruitment
yield or representativeness.

### 4. What: Features to test

Review every generated attribute and level.

- Each attribute should represent one distinct trade-off.
- Each level should be realistic and mutually exclusive within its attribute.
- Price should use the units and range the decision owner can act on.
- Include an opt-out when choosing none is realistic.
- Remove an attribute if its result would not change the decision.

For the smartphone example, “processor performance” and “thermal management”
may need separate operational definitions. Leaving them as overlapping labels
would make their effects hard to interpret.

### 5. Settings: Experiment configuration

Use the default settings unless the research question gives you a reason to
change them. Review the respondent count, tasks per respondent, privacy, model,
and any advanced settings before selecting **Run experiment**.

The smallest run still costs time and money. Record the decision rule and
analysis plan before launch, while you cannot yet optimize them around the
result.

## Run and verify

After launch, Holodeck opens **Experiment Results**. A successful result should
show respondents, tasks per respondent, sample size, variance explained, and
an **Analytics Studio** link.

A terminal label alone is insufficient. For API runs, verify that the expected
artifacts exist. See [Poll a run](/guides/poll-a-run).

## Read the result in decision order

Open **Analytics Studio** and read the evidence in this order:

1. **Experiment Summary.** Confirm the question, population, location, year,
   sample, and choice task match the plan. In the current production view,
   these details appear at the top of **Attribute Importance**.
2. **Attribute Importance.** Identify which attributes moved modeled choice
   most within this design. Then read its feature-level effects and
   willingness-to-pay sections. Effects are relative to the declared baseline.
   Use willingness to pay only when the price coefficient has the expected
   direction and the feature and price coefficients share a valid scale.
3. **Market Simulation.** Compare feasible products, not imaginary bundles that
   cannot be built or sold.
4. **Diverse Preferences.** Look for segments that move against the average.
5. **Segmentation.** When available, check whether the proposed action still
   makes sense for each decision-relevant segment.

Do not turn the largest bar into the recommendation. Combine effect size,
uncertainty, feasibility, segment variation, and the cost of acting.

## Choose the matching analytics operation

The seven analytics operations answer different decision questions. Each
reference page contains a checked request, response, interpretation, and
do-not-infer boundary.

| Decision question | Operation | Read the result as |
| --- | --- | --- |
| How would these exact product profiles split preference? | [Simulate preference share](/api-reference/create-analytics-market-share) | Relative preference within the submitted choice set |
| Which submitted share and revenue points are non-dominated? | [Find efficient scenarios](/api-reference/create-analytics-pareto-frontier) | A shortlist for further business review |
| How does one product's modeled share and revenue change with price? | [Simulate a price curve](/api-reference/create-analytics-price-elasticity) | A conditional price trade-off, not a demand forecast |
| What is the price-equivalent difference between two levels? | [Compare willingness to pay](/api-reference/create-analytics-wtp) | A coefficient-scale conversion |
| What is the average part worth for each level? | [Aggregate respondent part worths](/api-reference/create-aggregated-betas) | A summary of respondent-level estimates |
| Which attributes mattered most on average? | [Aggregate attribute importance](/api-reference/create-aggregated-importance) | Relative importance within this experiment |
| What is average respondent willingness to pay? | [Aggregate respondent willingness to pay](/api-reference/create-aggregated-wtp) | A distribution summary that still requires outlier and segment checks |

## The same path through the API

| Holodeck step | API contract |
| --- | --- |
| Why | Set `why_prompt` on [Create an experiment](/api-reference/create-experiments) |
| When/where | Set `country`, `year`, and applicable location fields |
| Who | [Start a population recommendation](/api-reference/create-populations-location-recommendation), then [poll it](/api-reference/get-populations-location-recommendation-by-job-id) |
| Validate who | [Validate a US population](/api-reference/create-populations-validate) or [validate a non-US population](/api-reference/create-populations-validate-non-us) |
| Check reversed scales | [Classify response scale direction](/api-reference/create-populations-statement-direction) |
| What | Generate or supply attributes and levels, then review them |
| Run | Create the experiment and [poll the run](/guides/poll-a-run) |
| Decide | Retrieve the result and call only the analytics operation that matches the decision |

For a complete executable client, see
[Run an experiment in Python](/guides/python-workflow).

## Make the decision

Before treating the output as decision evidence, run the canonical
[research validity checklist](/concepts/methodology#research-validity-checklist).
If a check fails, revise and rerun the design. Do not repair weak evidence by
adding confidence to the prose.
