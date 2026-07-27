---
id: python-workflow
title: Run an experiment in Python
description: End-to-end Python workflow. Supply your own attributes and levels, launch a conjoint experiment, and retrieve the analytics output.
---

# Run an experiment in Python

The [Quickstart](/get-started/quickstart) uses curl and the smallest possible
request. This is the fuller path: you supply the attributes and levels yourself,
launch the experiment, and pull the analytics artifact when it finishes.

Adapted from the workflow we hand to hackathon teams. Every field below was
checked against the published spec.

## Setup

```python
import httpx

BASE_URL = "https://api.subconscious.ai"
headers = {"Authorization": f"Bearer {TOKEN}"}

# Requests are slow by design. A conjoint experiment is thousands of model
# calls; generation endpoints take minutes. Five minutes is a sane floor.
client = httpx.Client(timeout=300.0)
```

Get `TOKEN` from [Settings → Generate API Token](/get-started/authentication).

## 1. Generate attributes and levels

Attributes are the features under study; levels are the values each can take.
Let the platform propose them from your research question:

```python
response = client.post(
    f"{BASE_URL}/api/v1/product-attributes-levels",
    headers=headers,
    json={"why_prompt": "What drives consumer choice of premium smartphones?"},
)
response.raise_for_status()
proposed = response.json()
```

**Read what comes back before running anything.** Two attributes that mean
almost the same thing split their effect between them and both look weak. A
level no real product would offer produces a finding you cannot act on. Editing
here is cheaper than re-running later.

## 2. Launch the experiment

Pass your edited design as `pre_cooked_attributes_and_levels_lookup`: a list of
`[attribute, [levels...]]` pairs. Omit it and the platform generates its own.

```python
experiment = {
    "why_prompt": "What drives consumer choice of premium smartphones?",
    "country": "United States",
    "year": "2026",
    "pre_cooked_attributes_and_levels_lookup": [
        ["Price", ["$649.99", "$859.99", "$999.99", "$1299.99"]],
        ["Display", [
            "6.2-inch AMOLED, 120Hz",
            "6.7-inch AMOLED, 120Hz",
            "6.7-inch foldable AMOLED, 120Hz",
        ]],
        ["Rear camera", [
            "50MP main, 12MP ultrawide",
            "50MP main, 12MP ultrawide, 10MP telephoto 3x",
            "200MP main, 12MP ultrawide, 10MP telephoto 3x, 50MP telephoto 5x",
        ]],
        ["Battery", [
            "4500mAh, 25W charging",
            "5000mAh, 45W charging",
        ]],
    ],
}

response = client.post(f"{BASE_URL}/api/v1/experiments", headers=headers, json=experiment)
response.raise_for_status()
run = response.json()

run_id = run["wandb_run_id"]
run_name = run["wandb_run_name"]
```

:::caution Accepted is not queued
A run id does not guarantee the run was enqueued. If nothing appears within
about 25 minutes, resubmit. See [Poll a run](/guides/poll-a-run).
:::

## 3. Wait for it

Expect tens of minutes. Poll every 30–60 seconds, not in a tight loop.

```python
import time

def wait_for(run_id: str, timeout_s: int = 3600) -> dict:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        status = client.get(
            f"{BASE_URL}/api/v1/runs/{run_id}/status", headers=headers
        ).json()
        if status.get("status") in {"finished", "failed", "crashed", "killed", "lost"}:
            return status
        time.sleep(45)
    raise TimeoutError(f"{run_id} did not finish in {timeout_s}s")
```

The status endpoint is unreliable in both directions: it can report `lost` for a
queued run and `finished` for a failed one. Treat artifacts as the real signal;
[Poll a run](/guides/poll-a-run) explains the cross-check.

## 4. Retrieve the results

The analytics artifact is named after the run:

```python
artifact = client.get(
    f"{BASE_URL}/api/v1/runs/artifact/Analytics_output_{run_name}",
    headers=headers,
)
artifact.raise_for_status()
results = artifact.json()
```

Note it uses `wandb_run_name`, not `wandb_run_id`. Mixing them up returns
nothing and looks like a missing result.

For what the numbers mean. AMCEs, importance, willingness to pay, see
[Methodology](/concepts/methodology).

## Complete workflow

```python
import httpx, time

BASE_URL = "https://api.subconscious.ai"
headers = {"Authorization": f"Bearer {TOKEN}"}
client = httpx.Client(timeout=300.0)

run = client.post(f"{BASE_URL}/api/v1/experiments", headers=headers, json={
    "why_prompt": "What drives consumer choice of premium smartphones?",
    "country": "United States",
    "year": "2026",
}).raise_for_status().json()

print("started", run["wandb_run_id"])

while True:
    status = client.get(
        f"{BASE_URL}/api/v1/runs/{run['wandb_run_id']}/status", headers=headers
    ).json()
    if status.get("status") in {"finished", "failed", "crashed", "killed", "lost"}:
        break
    time.sleep(45)

results = client.get(
    f"{BASE_URL}/api/v1/runs/artifact/Analytics_output_{run['wandb_run_name']}",
    headers=headers,
).json()
```

## Getting good results

- **Spend the time on the question.** `why_prompt` drives the attributes, the
  respondent instructions, and the dependent variable. A vague question produces
  a vague design.
- **Keep designs narrow.** More attributes means more tasks and less precision
  per attribute. Run a small experiment, drop what did not move choice, re-run.
- **Set generous timeouts.** Generation endpoints take minutes; the default
  httpx timeout of 5 seconds will fail every call.
- **Hold the population fixed** when comparing two designs. Changing the
  audience and the design at once makes the comparison meaningless.
