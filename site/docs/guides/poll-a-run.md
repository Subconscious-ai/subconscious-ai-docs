---
id: poll-a-run
title: Poll a run
description: Track the original experiment run, handle uncertain states, and verify its result artifacts.
---

# Poll a run

Keep the `wandb_run_id` returned by your launch request. Poll that identity until
there is a terminal result or your client stops waiting.

```bash
curl "https://api.subconscious.ai/api/v1/runs/$RUN_ID/status" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

## Read the state

| State | Terminal | What to do |
| --- | --- | --- |
| `in-queue` | No | Wait for a worker and keep polling. |
| `running` | No | Keep polling the original run. |
| `unknown` | No | The status stores have insufficient evidence. Keep the ID; do not infer failure. |
| `finished` | Yes | Inspect the result and expected artifacts. |
| `failed` | Yes | Inspect the failure before designing a new run. |
| `crashed` | Yes | Inspect the failed run and contact support if needed. |
| `killed` | Yes | Execution was stopped; inspect available evidence. |
| `lost` | Yes | An existing non-terminal run record exceeded the six-hour grace window. Reconcile that run before retrying. |

A missing record is not a terminal `not found` state. The status service reports
`unknown` when it lacks evidence. The run-details endpoint can separately return
`404` while the original run has no results record yet; inspect its retry
information and continue polling status.

## Poll politely

Poll every 30–60 seconds and bound how long your client waits. Completion time
depends on the design, population and queue. If your client times out, save the
run ID and resume polling later. A client timeout does not cancel the server run.

## Inspect the result

```bash
curl "https://api.subconscious.ai/api/v1/runs/$RUN_ID" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

The response wraps the result in `run_details`. Review the recorded design,
population and available artifacts in Analytics Studio or through the
[customer MCP tools](/reference/mcp-tools). A `finished` label alone does not
prove that the expected evidence is present. Artifact existence alone does not
prove that the experiment is valid; apply the
[research validity checklist](/concepts/methodology#research-validity-checklist).

## Recover an ambiguous launch

Do not automatically resubmit after a fixed delay. REST does not provide the
MCP draft-and-launch idempotency protocol. An automatic retry can create a
second experiment while the first is still running.

If launch timed out before returning an ID, check Holodeck and contact
[support@subconscious.ai](mailto:support@subconscious.ai) with the approximate
submission time and any run ID you received. Reconcile the original submission
before launching again. Never include your access token in the message.
