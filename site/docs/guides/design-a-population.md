---
id: design-a-population
title: Design a population
description: Target and validate the synthetic respondent population for a Subconscious.ai experiment.
---

# Design a population

By default an experiment runs against a general population. Targeting narrows
who answers.

## Traits

Traits are the characteristics a respondent can have. Fetch the catalogue
before you target — the ids are what the API expects:

```bash
curl "$SUBCONSCIOUS_API/api/v1/traits" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

Each trait carries a short and long description, a measurement type, and
whether it is ordinal.

## Target by trait

Pass trait filters on the experiment request:

```json
{
  "why_prompt": "What factors drive consumer choice of electric vehicles?",
  "population_traits": {
    "Travel frequency": ["Weekly"]
  }
}
```

## Target by demographics

US demographic targeting goes in `target_population`; outside the US, use
`non_us_target_population`. Available axes include age, income, education,
racial group, home ownership, household size, and households with children.

## Validate before running

Validation tells you whether a targeted population can actually be built.
Over-constrained targeting is the most common cause of a disappointing run:
each additional filter shrinks the pool, and a thin pool produces noisy
estimates.

```bash
curl -X POST "$SUBCONSCIOUS_API/api/v1/populations/validate" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "target_population": { } }'
```

Use `/api/v1/populations/validate-non-us` for non-US populations.

## Population groups and external personas

You can run against a named population group, or supply your own personas.
These two are mutually exclusive — pick one. Supplying personas is the right
move when you have first-party audience data; a named group is the right move
when you want a familiar segment reproduced consistently across runs.

## Practical advice

- Target on what plausibly changes the decision. Filters that do not affect the
  choice cost you precision and buy nothing.
- Validate first, then run.
- Keep the population fixed when comparing two designs. Changing the audience
  and the design at once makes the comparison meaningless.
