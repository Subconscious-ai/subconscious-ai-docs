---
id: quickstart
title: Quickstart
description: Authenticate, launch a Subconscious.ai experiment, and retrieve its run.
---

# Quickstart

This walks through one full loop: authenticate, start an experiment, wait for
it, read the result.

## Before you start

You need an access token. Get one at
**[app.subconscious.ai/settings](https://app.subconscious.ai/settings)** →
**Generate API Token**, then copy it from **Your Access Token**. Full detail in
[Authentication](/get-started/authentication).

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

State the question and choose a population. This example uses US
adult demographic constraints; review its [selection limits](/guides/design-a-population).

```bash
curl -X POST "$SUBCONSCIOUS_API/api/v1/experiments" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "why_prompt": "What factors drive consumer choice of electric vehicles?",
    "experiment_type": "conjoint",
    "target_population": {"age": [18, 99]},
    "is_private": true
  }'
```

The response gives you the run id to track:

```json
{
  "wandb_run_id": "a1b2c3d4",
  "wandb_run_name": "eloquent-sunset-42"
}
```

:::caution Keep the original run identity
Continue polling `in-queue`, `running`, or `unknown`. A missing result or a
client timeout does not establish that a run failed. Do not resubmit until the
original launch is reconciled. See [Poll a run](/guides/poll-a-run).
:::

## 3. Wait for it

Completion time depends on the design, population and queue. The status
response reports progress; it does not promise a completion time.

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

- [Your first experiment](/get-started/your-first-experiment): the same loop,
  explained rather than pasted.
- [Design a population](/guides/design-a-population): target who answers.
- [API reference](/api-reference/superego): every published endpoint.
