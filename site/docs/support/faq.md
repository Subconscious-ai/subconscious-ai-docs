---
id: faq
title: FAQ
description: "Common questions about Subconscious.ai: what it is, how experiments work, cost, timing, and data handling."
---

# FAQ

## What is Subconscious.ai?

A platform for running causal experiments at scale. Instead of recruiting human
respondents, it builds a synthetic population for the study and runs a
randomised discrete choice experiment against it. Causal experiments of this
kind are standard in product design, transport, political science, public
health, and economics, wherever a decision-maker needs to know how a population
will respond to different options.

## Who uses it?

Researchers and product teams who need to know why a population chooses what it
chooses: in academia, in industry, and in policy.

## How is this different from asking a language model?

An experiment is not a question to a model. Attributes are randomised
independently, respondents see structured choice tasks, and effects are
estimated with the same statistics used on human conjoint data. Randomisation
supports causal comparisons within the simulated experiment. Generalizing those
comparisons to human behavior requires validation.

## Why should I trust simulated respondents?

Because the platform is checked against human studies rather than assumed to
work. Published human conjoint studies are replicated and compared effect by
effect. See [Human baselines](/concepts/human-baselines).

## How long does an experiment take?

Completion time depends on the design, population and queue. Poll every
30–60 seconds and retain the original run ID; see [Poll a run](/guides/poll-a-run).

## What does it cost?

Experiments consume model capacity and are billed accordingly. Check your plan
in [Settings](https://app.subconscious.ai/settings), and review a design before
launching it rather than after.

## Can I use my own attributes and levels?

Yes. Generate them from your question and edit, or supply your own outright.
See [Run an experiment](/guides/run-an-experiment).

## Can I bring my own audience?

Choose demographic constraints, a supported population group, or the
application's population upload flow. Modeled traits enrich selected respondents;
they are not observed-behavior filters. `external_personas` is a separate
LinkedIn-profile input. See [Design a population](/guides/design-a-population).

## Is my experiment private?

Set `is_private: true` on the request and the run is hidden from other users.

## My run says `finished` but there are no results

Check the expected artifacts before treating the run as usable. A terminal
label alone does not establish that the evidence you need exists. See
[Poll a run](/guides/poll-a-run).

## Is there an SDK?

Not yet. The API is plain JSON over HTTP, and there is an
[MCP server](/guides/mcp-server) for driving it from Claude or Cursor. The
published spec is available at
[`/openapi/subconscious.public.json`](https://docs.subconscious.ai/openapi/subconscious.public.json)
if you want to generate a client.

## How do I report a problem?

[Contact us](/support/contact) with the run id and the exact request body.
