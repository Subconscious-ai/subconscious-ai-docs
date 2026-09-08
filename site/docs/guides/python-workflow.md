---
id: python-workflow
title: Run an experiment in Python
description: Supply a reviewed design, launch once, poll its run ID, and retrieve the run with Python.
---

# Run an experiment in Python

This workflow uses the supported customer API. Install `httpx` and set
`SUBCONSCIOUS_TOKEN` in your environment using the
[authentication guide](/get-started/authentication).

## Review the design

The example compares smartphone price, battery life and warranty. Replace these
illustrative levels with feasible alternatives for your decision. The US adult
selection is a starting population, not a claim that its respondents are smartphone
buyers. See [Design a population](/guides/design-a-population).

Sending the launch request starts a real experiment. Review the configuration
before running the script. For a guided draft and approval step, use
[Holodeck](https://app.subconscious.ai/ideation) or [MCP](/guides/mcp-server).

## Launch once and retain the run ID

```python
import json
import os
import time
from pathlib import Path

import httpx

BASE_URL = "https://api.subconscious.ai"
headers = {"Authorization": f"Bearer {os.environ['SUBCONSCIOUS_TOKEN']}"}
experiment = {
    "why_prompt": "How do price, battery life and warranty affect smartphone choice?",
    "experiment_type": "conjoint",
    "target_population": {"age": [18, 99]},
    "is_private": True,
    "null_levels": False,
    "pre_cooked_attributes_and_levels_lookup": [
        ["Price", ["$649", "$849", "$1049"]],
        ["Battery life", ["18 hours", "24 hours", "30 hours"]],
        ["Warranty", ["1 year", "2 years", "3 years"]],
    ],
}

with httpx.Client(base_url=BASE_URL, headers=headers, timeout=300.0) as client:
    launch = client.post("/api/v1/experiments", json=experiment)
    launch.raise_for_status()
    run = launch.json()
    run_id = run["wandb_run_id"]
    Path("subconscious-run.json").write_text(json.dumps(run, indent=2))
    print("Keep this run ID:", run_id)

    deadline = time.monotonic() + 3600
    terminal = {"finished", "failed", "crashed", "killed", "lost"}
    while time.monotonic() < deadline:
        response = client.get(f"/api/v1/runs/{run_id}/status")
        response.raise_for_status()
        status = response.json()["status"]
        if status in terminal:
            break
        time.sleep(45)
    else:
        raise TimeoutError(f"Resume polling {run_id}; do not launch a duplicate")

    if status != "finished":
        raise RuntimeError(f"Run {run_id} ended with status {status}")

    response = client.get(f"/api/v1/runs/{run_id}")
    response.raise_for_status()
    details = response.json()["run_details"]
    Path("subconscious-result.json").write_text(json.dumps(details, indent=2))
```

The script deliberately does not retry the launch. If that request times out
before returning an ID, reconcile the submission in Holodeck or with
[support@subconscious.ai](mailto:support@subconscious.ai) before launching again.
If polling times out, resume from the saved run ID. Do not rerun the launch block.

## Inspect the evidence

A `finished` status does not establish that all expected results exist. Review
the returned run and its available artifacts in Analytics Studio, or use the
[customer MCP tools](/reference/mcp-tools) to discover and read authorized run
artifacts. The run response is not a universal analytics table with fixed columns.

For terminal states and retryable missing records, see
[Poll a run](/guides/poll-a-run). For effect interpretation, see
[Methodology](/concepts/methodology).
