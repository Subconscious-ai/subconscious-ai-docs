---
id: quickstart
title: Quickstart
description: Run your first Subconscious.ai causal experiment through the API in about ten minutes.
---

# Quickstart

This walks through one full loop: authenticate, start an experiment, wait for
it, read the result.

## Before you start

You need an access token. See [Authentication](/get-started/authentication).

```bash
export SUBCONSCIOUS_TOKEN="your-token"
export SUBCONSCIOUS_API="https://api.subconscious.ai"
```

## 1. Check your credentials

Listing the trait catalogue is the cheapest authenticated call:

```bash
curl "$SUBCONSCIOUS_API/api/v1/traits" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

A JSON array means you are ready. A `403` means the token is wrong or expired.

## 2. Start an experiment

The only field an experiment truly needs is the research question. Everything
else has a default.

```bash
curl -X POST "$SUBCONSCIOUS_API/api/v1/experiments" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "why_prompt": "What factors drive consumer choice of electric vehicles?",
    "experiment_type": "conjoint",
    "is_private": false
  }'
```

The response gives you the run id to track:

```json
{
  "wandb_run_id": "a1b2c3d4",
  "wandb_run_name": "eloquent-sunset-42"
}
```

:::caution Accepted is not the same as queued
A run id does not guarantee the run was enqueued. If nothing appears within
about 25 minutes, resubmit. [Poll a run](/guides/poll-a-run) explains how to
tell the difference.
:::

## 3. Wait for it

Experiments are not fast. The smallest conjoint experiment is roughly 2,400
model calls, so plan for tens of minutes, not seconds.

```bash
curl "$SUBCONSCIOUS_API/api/v1/runs/a1b2c3d4/status" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

Poll every 30–60 seconds. Do not poll in a tight loop.

## 4. Read the results

```bash
curl "$SUBCONSCIOUS_API/api/v1/runs/a1b2c3d4" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

The run carries the experimental design and the estimated effects. For what
AMCEs and importance scores mean, see [Methodology](/concepts/methodology).

## Next

- [Your first experiment](/get-started/your-first-experiment) — the same loop,
  explained rather than pasted.
- [Design a population](/guides/design-a-population) — target who answers.
- [API reference](/api-reference/superego) — every published endpoint.
