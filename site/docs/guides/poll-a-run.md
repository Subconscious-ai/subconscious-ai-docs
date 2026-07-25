---
id: poll-a-run
title: Poll a run
description: How to track a Subconscious.ai experiment to completion, including the known reliability limits of the status endpoint.
---

# Poll a run

Starting an experiment returns immediately with a run id. Everything after that
is polling.

```bash
curl "https://api.subconscious.ai/api/v1/runs/$RUN_ID/status" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

## States

| State | Terminal | Meaning |
| --- | --- | --- |
| `in-queue` | no | Accepted and waiting for a worker |
| `running` | no | Executing |
| `finished` | yes | Completed |
| `failed` | yes | Failed during execution |
| `crashed` | yes | Worker died |
| `killed` | yes | Cancelled |
| `lost` | yes | The platform lost track of the run |
| `not found` | yes | No such run id |

## Poll politely

Experiments take tens of minutes. Poll every 30–60 seconds with a ceiling on
total attempts. A tight loop gains you nothing and will get rate limited.

## Known limits

:::warning The status endpoint is not fully reliable
Two failure modes are known and currently open:

- A **queued** run can report a terminal `lost` state. The run is often still
  alive.
- A **failed** run that produced no artifacts can report `finished`.

Treat status as a hint, not as truth.
:::

The dependable check is whether the run produced artifacts. A run that reports
`finished` and has no artifacts did not succeed, whatever the status says:

```bash
curl "https://api.subconscious.ai/api/v1/runs/$RUN_ID" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

Recommended logic:

1. Poll status until terminal, or until your timeout.
2. On any terminal state, fetch the run and check for artifacts.
3. Artifacts present → succeeded. Artifacts absent → treat as failed,
   regardless of the reported state.

## Accepted is not queued

`POST /api/v1/experiments` can return a run id for a run that never starts. If
a run has not appeared after roughly 25 minutes, resubmit rather than continuing
to poll.

If you hit this repeatedly, tell us — include the run ids in your message to
[support](/support/contact).
