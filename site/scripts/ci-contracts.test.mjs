import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

import {requireEnvironment} from "./require-ci-env.mjs";

const DEPLOY_WORKFLOW_PATH = new URL("../../.github/workflows/deploy.yml", import.meta.url);

export function assertDeployVerifiesLiveRevision(workflowText) {
  const readyHeader = "      - name: Wait for it to be READY";
  const readyIndex = workflowText.indexOf(readyHeader);
  assert.notEqual(readyIndex, -1, "deploy.yml must include Wait for it to be READY");

  const stepsAfterReady = workflowText
    .slice(readyIndex + readyHeader.length)
    .split(/\n      - name: /)
    .slice(1);
  assert.ok(
    stepsAfterReady.length > 0,
    "deploy.yml must run a verification step after Wait for it to be READY",
  );

  const verificationStep = stepsAfterReady.find((step) =>
    step.includes("https://docs.subconscious.ai/revision.json"),
  );
  assert.ok(
    verificationStep,
    "deploy.yml must verify https://docs.subconscious.ai/revision.json after Wait for it to be READY",
  );
  assert.match(
    verificationStep,
    /\bSHA:\s*\$\{\{\s*github\.sha\s*\}\}/,
    "verification step must bind SHA to github.sha",
  );
  assert.match(
    verificationStep,
    /\bcurl\b[\s\S]*?-fsS\b/,
    "verification step must use curl -fsS",
  );
  assert.match(
    verificationStep,
    /\.revision\b/,
    "verification step must inspect .revision from revision.json",
  );
  assert.match(
    verificationStep,
    /"\$SHA"/,
    "verification step must compare live revision against $SHA",
  );
  assert.match(
    verificationStep,
    /\b(seq|deadline)\b/,
    "verification step must use bounded retries",
  );
  assert.match(
    verificationStep,
    /\bexit 1\b/,
    "verification step must fail with exit 1 on mismatch",
  );
}

test("rejects an empty credential contract", () => {
  assert.throws(
    () => requireEnvironment([], {}),
    /At least one required environment variable must be named/,
  );
});

test("rejects a degraded run when a required credential is missing", () => {
  assert.throws(
    () => requireEnvironment(["APPLICATION_ID", "API_KEY"], {
      APPLICATION_ID: "app-id",
    }),
    /API_KEY/,
  );
});

test("deploy workflow verifies live revision.json against deployed commit SHA after READY", () => {
  const workflow = readFileSync(DEPLOY_WORKFLOW_PATH, "utf8");
  assertDeployVerifiesLiveRevision(workflow);
});

test("rejects deploy workflow missing post-READY live revision verification", () => {
  const withoutVerification = [
    "      - name: Wait for it to be READY",
    "        run: echo READY",
  ].join("\n");
  assert.throws(
    () => assertDeployVerifiesLiveRevision(withoutVerification),
    /must run a verification step after Wait for it to be READY/,
  );

  const beforeReady = [
    "      - name: Verify live revision matches deployed SHA",
    "        env:",
    "          SHA: ${{ github.sha }}",
    "        run: |",
    "          for attempt in $(seq 1 12); do",
    '            curl -fsS "https://docs.subconscious.ai/revision.json" | jq -r ".revision" | grep -qx "$SHA" || exit 1',
    "          done",
    "      - name: Wait for it to be READY",
    "        run: echo READY",
  ].join("\n");
  assert.throws(
    () => assertDeployVerifiesLiveRevision(beforeReady),
    /must run a verification step after Wait for it to be READY/,
  );
});
