---
id: study-compatibility
title: Choose a study for your decision
description: Eight business decisions mapped to research methods, required inputs, answer shapes, and the current REST, MCP, and guided study workflows.
---

# Choose a study for your decision

**Test the decision before committing the budget.** Subconscious connects
controlled experiments on synthetic populations with models of choice, price,
product configuration, and competitive response. Start with the action you can
take, then choose the study that can distinguish its effect.

The eight decision families below follow the
[Subconscious business research catalogue](https://subconscious.ai/).
A business workflow can combine an experiment, analysis of a fitted model, and
customer-supplied market inputs. The method names are not interchangeable API
settings; use the [execution compatibility](#execution-compatibility) section
before configuring a run.

## Eight decisions, eight answer shapes

| Business decision | Study method | Answer to deliver |
| --- | --- | --- |
| **What should we charge? Can we take an increase?** | Discrete choice with price | Willingness to pay, a calibrated demand curve, and the price that optimizes the stated revenue or contribution objective. |
| **Which features and claims actually earn their keep?** | MaxDiff / best–worst | Ranked priorities and differences by segment. For effects of feature levels on product choice, use a conjoint design. |
| **What should the product or pack actually be?** | Build-your-own + adaptive choice | A preferred feasible configuration, the trade-offs behind it, and its cost to serve. |
| **Why should a retailer give us the shelf?** | Category shelf simulation | Source of volume: incremental category demand versus switching from existing products. |
| **How many will they buy, and how often?** | Volumetric choice | Unit forecasts over a stated period, with basket size and repeat-purchase assumptions. |
| **Which message or concept wins, and why?** | Concept test + complete ranking | Ranked concepts, the measured response differences, and separately labeled respondent explanations. |
| **Who do we go after first?** | Preference-based segmentation | Segments with different preferences, their estimated size and value, and the action that changes choice in each. |
| **What if a competitor cuts price next quarter?** | Market simulator on the fitted model | Conditional share, revenue, and margin under specified competitive scenarios. |

These are the deliverables to agree in the study brief. A ranking does not
automatically provide causal effects, and a fitted choice model does not supply
market size, costs, distribution, or repeat purchases on its own.

## Bring the inputs that make the answer useful

| Decision family | Inputs beyond the common population and study brief |
| --- | --- |
| **Price** | Currency and billing period; realistic tested prices; current offer and competitors; a meaningful outside option; costs and market calibration for revenue or contribution forecasts. |
| **Priorities** | A finite list of distinct features or claims; the best–worst task and exposure plan; the segments to compare. Attribute importance from a conjoint is a different statistic from a MaxDiff score. |
| **Product / pack** | Feasible attribute levels, prohibited combinations, manufacturing or service constraints, and costs. Record which questions adapt and the rule that selects the next task. |
| **Shelf** | Current assortment, proposed additions/removals, availability, an outside option, and a category-demand baseline. Switching within a shelf alone cannot establish category growth. |
| **Volume** | Quantity and frequency measures, period, eligible market size, availability, and evidence for adoption and repeat behavior. A probabilistic choice response is not a quantity measurement. |
| **Message / concept** | Fixed stimuli, evaluation statements or choice tasks, presentation order controls, ranking rule, and the population. A generated reason is explanatory material, not an identified psychological mechanism. |
| **Segments** | Respondent-level preference data; the segmentation method; minimum group sizes; stability checks; external weights and value inputs for market sizing. A sample cluster's proportion is not automatically a market proportion. |
| **Competition** | A fitted model; complete competitor configurations using tested levels; baseline and changed scenarios; costs, market size, and distribution assumptions where financial outputs are required. |

For every family, record the intervention, comparison, outcome, decision rule,
and evidence that would change your mind. Use the
[study brief](/guides/research-design#write-the-study-brief) and
[population guide](/guides/design-a-population).

## Execution compatibility

Choose an entry point by the measured task, not by the business label. The
published REST and MCP contracts define what an integration can submit today.

| Path | Supported configuration | How to use it |
| --- | --- | --- |
| **Controlled choice experiment** | `experiment_type: "conjoint"`; `response_type: "discrete"` or `"probabilistic"`; reviewed attributes and levels; explicit population. | Use [Holodeck](/guides/from-question-to-decision), [REST](/guides/python-workflow), or an [MCP draft](/guides/mcp-server). Use this for price, product trade-offs, and experimentally varied messages. |
| **Concept evaluation** | `experiment_type: "concept_testing"`; concept description/stimuli and evaluation statements with labels. | Use the [experiment request schema](/api-reference/create-experiments) or a fully specified MCP launch. MCP draft creation/revision currently covers conjoint. A concept rating task does not itself produce a complete ranking or conjoint posterior. |
| **Analysis of a completed choice experiment** | The run's available respondent-level artifacts, exact mapped attributes/levels, and supported segment labels. | Use Analytics Studio or the [customer analytics tools](/reference/mcp-tools). Inspect metadata first; an aggregate-only concept result cannot satisfy a posterior-analysis request. |
| **Dedicated best–worst, adaptive, shelf, volume, or complete-ranking study** | A study-specific task, response record, estimator, and agreed deliverables. These method names are not public `experiment_type` values. | Send the business brief to [support@subconscious.ai](mailto:support@subconscious.ai) to confirm the configuration and delivery path before launch. Do not substitute a generic conjoint or concept request and label it a different method. |

### Options that change the interpretation

- **Supplied designs:** `pre_cooked_attributes_and_levels_lookup` fixes the
  submitted attribute levels. Set `null_levels: false` to avoid adding a
  `Not available` level. This is separate from `add_neither_option`, which
  controls the choice-task opt-out.
- **Response format:** `discrete` records a choice; `probabilistic` requests a
  probability allocation. Neither setting creates a dedicated best–worst,
  complete-ranking, or quantity/frequency instrument.
- **Population:** select a supported population mode before adding modeled
  traits. A modeled trait enriches respondents; it is not verified behavioral
  recruitment. See [Design a population](/guides/design-a-population).
- **Repeatability:** retain the actual design, population settings, seeds,
  model, run identity, and artifacts. Use
  [reproducible run controls](/guides/reproducible-runs) for paired comparisons.
  Repeating a configuration is different from preserving accuracy across time.
- **Uncertainty:** distinguish a confidence interval on an estimated effect,
  variation across respondent utilities, and uncertainty in a calibrated
  forecast. The request's `confidence_level` is a configuration setting, not a
  measured guarantee about the result.

### Read the analysis contract

`get_analytics_metadata` supplies exact labels for the run. `get_market_share`
compares complete product configurations using the fitted respondent utilities;
its shares are conditional on the submitted set. `get_clusters_or_segments`
finds preference patterns under its sample-size constraints.

Two names deserve particular care: `get_posterior_distribution` summarizes
respondent utilities with empirical intervals, not population confidence
intervals or probability-point causal effects. The legacy
`get_willingness_to_pay` tool returns categorical utility ratios, **not currency
willingness to pay**. A monetary premium requires a valid signed price slope in
currency units and an appropriate uncertainty calculation. Read the actual
returned scale before naming a business metric.

## Turn a scenario into a prospective forecast

A choice model lets you change an offer in the model before changing it in the
market. That is the starting point for prospective decision analysis.

To forecast units, revenue, or contribution, connect the modeled response to a
declared market size and time period, availability, adoption/choice calibration,
quantity and repeat behavior, and costs as applicable. Validate that connection
against relevant held-out human or market evidence. Carry uncertainty from both
the experiment and these additional inputs into the result.

For a competitor-price decision, preserve the baseline assortment, change the
competitor's price within the modeled range, and compare the resulting shares.
Add market and cost inputs before presenting a revenue or margin forecast.
If a new competitor introduces an untested attribute or changes the decision
context, revise the study instead of extrapolating silently.

This lets one fitted model inform multiple decisions while making the conditions
behind each answer inspectable. See
[Causal and prospective analytics](/concepts/prospective-analytics) for the
difference between observing behavior, estimating an intervention, and forecasting
its business consequences.

## Start with the decision you face

Choose a row, complete its inputs, and name the outcome and decision threshold.
Then [design the study](/guides/research-design), review its execution path, and
retain the result with its assumptions and validation evidence. For a specialized
study, include the chosen method and required deliverables in your
[support request](mailto:support@subconscious.ai).
