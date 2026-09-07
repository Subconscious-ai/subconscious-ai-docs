import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function releasedContract(run, health) {
  assert.equal(run?.conclusion, "success", "No successful production release");
  assert.equal(run.head_branch, "production");
  assert.match(run.head_sha, /^[a-f0-9]{40}$/);
  assert.equal(health.status, "ok", "Production is not healthy");
  assert.equal(health.service, "rehoboam-api");
  assert.equal(health.environment, "prod");
  assert.equal(
    health.git_sha,
    run.head_sha,
    "Live revision differs from successful release; leave docs unchanged",
  );
  assert.ok(Number.isSafeInteger(run.id) && run.id > 0);
  return {
    repository: "Subconscious-ai/rehoboam",
    revision: run.head_sha,
    workflow_run_id: run.id,
    workflow_run_url: `https://github.com/Subconscious-ai/rehoboam/actions/runs/${run.id}`,
  };
}

async function main() {
  const runs = JSON.parse(
    execFileSync(
      "gh",
      [
        "api",
        "repos/Subconscious-ai/rehoboam/actions/workflows/deploy_to_ec2_prod.yml/runs?branch=production&status=success&per_page=1",
      ],
      { encoding: "utf8" },
    ),
  );
  const response = await fetch("https://api.subconscious.ai/health", {
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  assert.ok(response.ok, `Production health returned ${response.status}`);
  console.log(
    JSON.stringify(
      releasedContract(runs.workflow_runs[0], await response.json()),
      null,
      2,
    ),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
