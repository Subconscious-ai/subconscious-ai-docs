---
id: index
title: Subconscious.ai documentation
description: "Run causal experiments through an API: conjoint analysis, synthetic respondent populations, and human-validated baselines."
slug: /
---

# Subconscious.ai documentation

Subconscious.ai runs causal experiments on simulated respondents. You ask a
question about human behaviour; the platform designs a conjoint experiment,
builds a representative synthetic population, runs the survey, and returns
estimated effects.

Everything the product does is available through the SuperEgo REST API.

## Start here

| If you want to | Go to |
| --- | --- |
| Make your first API call in ten minutes | [Quickstart](/get-started/quickstart) |
| Get and use an access token | [Authentication](/get-started/authentication) |
| Understand what an experiment actually does | [How it works](/concepts/how-it-works) |
| Look up an endpoint | [API reference](/api-reference/superego) |
| Drive experiments from Claude or Cursor | [MCP server](/guides/mcp-server) |

## What the API covers

- **Experiment design**: generate attributes and levels for a research
  question, build an orthogonal design matrix, and write respondent
  instructions.
- **Populations**: select and validate a synthetic respondent population from
  demographic and trait targeting.
- **Execution**: run the survey against simulated respondents.
- **Results**: retrieve AMCEs, importance scores, willingness-to-pay, and the
  raw artifacts behind them.
- **Human baselines**: compare simulated results against replicated human
  studies.

## Conventions

The API is versioned in the path (`/api/v1`, `/api/v2`). A version is never
changed in place; new behaviour arrives as a new path. Requests and responses
are JSON. All published endpoints require a bearer token.

Long-running work is asynchronous: you receive a run id immediately and poll
for completion. See [Poll a run](/guides/poll-a-run), which also covers the
known reliability caveats.
