---
id: faq
title: FAQ
description: Common questions about Subconscious.ai — what it is, how experiments work, cost, timing, and data handling.
---

# FAQ

## What is Subconscious.ai?

A platform for running causal experiments at scale. Instead of recruiting human
respondents, it builds a representative synthetic population and runs a
randomised discrete choice experiment against it. Causal experiments of this
kind are standard in product design, transport, political science, public
health, and economics, wherever a decision-maker needs to know how a population
will respond to different options.

## Who uses it?

Researchers and product teams who need to know why a population chooses what it
chooses — in academia, in industry, and in policy.

## How is this different from asking a language model?

An experiment is not a question to a model. Attributes are randomised
independently, respondents see structured choice tasks, and effects are
estimated with the same statistics used on human conjoint data. Randomisation
is what makes the result causal, and the design is what makes it measurable.

## Why should I trust simulated respondents?

Because the platform is checked against human studies rather than assumed to
work. Published human conjoint studies are replicated and compared effect by
effect. See [Human baselines](/concepts/human-baselines).

## How long does an experiment take?

Tens of minutes, not seconds. The smallest conjoint experiment is roughly 2,400
model calls. Poll every 30–60 seconds; see [Poll a run](/guides/poll-a-run).

## What does it cost?

Experiments consume model capacity and are billed accordingly. Check your plan
in [Settings](https://app.subconscious.ai/settings), and review a design before
launching it rather than after.

## Can I use my own attributes and levels?

Yes. Generate them from your question and edit, or supply your own outright.
See [Run an experiment](/guides/run-an-experiment).

## Can I bring my own audience?

Yes — supply external personas, or target a population by traits and
demographics. Note that external personas and named population groups are
mutually exclusive. See
[Design a population](/guides/design-a-population).

## Is my experiment private?

Set `is_private: true` on the request and the run is hidden from other users.

## My run says `finished` but there are no results

Then it did not succeed. The status endpoint has known failure modes in both
directions; artifacts are the reliable signal. See
[Poll a run](/guides/poll-a-run).

## Is there an SDK?

Not yet. The API is plain JSON over HTTP, and there is an
[MCP server](/guides/mcp-server) for driving it from Claude or Cursor. The
published spec is available at
[`/openapi/subconscious.public.json`](https://docs.subconscious.ai/openapi/subconscious.public.json)
if you want to generate a client.

## How do I report a problem?

[Contact us](/support/contact) with the run id and the exact request body.
