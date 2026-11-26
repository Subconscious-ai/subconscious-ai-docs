import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import test from "node:test";

import {requireEnvironment} from "./require-ci-env.mjs";

const DEPLOY_WORKFLOW_PATH = new URL(
  "../../.github/workflows/deploy.yml",
  import.meta.url,
);
const LIVE_REVISION_URL = "https://docs.subconscious.ai/revision.json";
const EXPECTED_SHA = "a".repeat(40);
const STALE_SHA = "b".repeat(40);

function indentOf(line) {
  return line.match(/^ */)[0].length;
}

function isIgnorableLine(line) {
  return /^\s*(?:#.*)?$/.test(line);
}

function stripYamlScalar(raw) {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed.replace(/\s+#.*$/, "").trim();
}

function findChildKeyIndent(lines, startIndex, parentIndent) {
  for (let i = startIndex; i < lines.length; i += 1) {
    if (isIgnorableLine(lines[i])) continue;
    const indent = indentOf(lines[i]);
    return indent > parentIndent ? indent : -1;
  }
  return -1;
}

function findMappingSection(lines, targetKey, startIndex, parentIndent) {
  const keyIndent =
    parentIndent < 0 ? 0 : findChildKeyIndent(lines, startIndex, parentIndent);
  if (keyIndent === -1) return null;

  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i];
    if (isIgnorableLine(line)) continue;
    const indent = indentOf(line);
    if (indent < keyIndent) return null;
    if (indent !== keyIndent) continue;

    const match = line.match(/^\s*([^:#\s][^:]*):\s*(?:#.*)?$/);
    if (match && match[1].trim() === targetKey) {
      return {indent, nextIndex: i + 1};
    }
  }
  return null;
}

function readBlockScalar(lines, startIndex, parentIndent, indicator) {
  const body = [];
  let minIndent = Infinity;
  let i = startIndex;
  for (; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === "") {
      body.push("");
      continue;
    }
    const indent = indentOf(line);
    if (indent <= parentIndent) break;
    minIndent = Math.min(minIndent, indent);
    body.push(line);
  }

  const dedented = body.map((line) =>
    line === "" ? "" : line.slice(Math.min(minIndent, line.length)),
  );
  if (indicator.startsWith("|-")) {
    while (dedented.length > 0 && dedented[dedented.length - 1] === "") {
      dedented.pop();
    }
  }
  return {value: dedented.join("\n"), nextIndex: i};
}

function parseStepBlock(rawLines) {
  const firstLine = rawLines[0];
  const dashMatch = firstLine.match(/^(\s*)-(\s*)(.*)$/);
  assert.ok(dashMatch, `Invalid YAML step header: ${firstLine}`);
  const normalized = [
    dashMatch[3]
      ? `${" ".repeat(dashMatch[1].length + 1 + dashMatch[2].length)}${dashMatch[3]}`
      : "",
    ...rawLines.slice(1),
  ];

  let keyIndent = -1;
  for (const line of normalized) {
    if (!isIgnorableLine(line)) {
      keyIndent = indentOf(line);
      break;
    }
  }
  assert.notEqual(keyIndent, -1, "Step block must contain at least one key");

  const step = {env: {}};
  for (let i = 0; i < normalized.length; i += 1) {
    const line = normalized[i];
    if (isIgnorableLine(line) || indentOf(line) !== keyIndent) continue;

    const match = line.match(/^\s*([^:#\s][^:]*):(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const rawValue = match[2].trim();

    if (/^[|>][+-]?(?:\s+#.*)?$/.test(rawValue)) {
      const scalar = readBlockScalar(normalized, i + 1, keyIndent, rawValue);
      step[key] = scalar.value;
      i = scalar.nextIndex - 1;
      continue;
    }

    if (key === "env" && (rawValue === "" || rawValue.startsWith("#"))) {
      let j = i + 1;
      for (; j < normalized.length; j += 1) {
        const envLine = normalized[j];
        if (isIgnorableLine(envLine)) continue;
        if (indentOf(envLine) <= keyIndent) break;
        const envMatch = envLine.match(/^\s*([^:#\s][^:]*):(.*)$/);
        if (envMatch) {
          step.env[envMatch[1].trim()] = stripYamlScalar(envMatch[2]);
        }
      }
      i = j - 1;
      continue;
    }

    step[key] = stripYamlScalar(rawValue);
  }
  return step;
}

function parseDeploySteps(workflowText) {
  const lines = workflowText.split(/\r?\n/);
  const jobs = findMappingSection(lines, "jobs", 0, -1);
  assert.ok(jobs, "deploy.yml must define jobs");
  const deploy = findMappingSection(lines, "deploy", jobs.nextIndex, jobs.indent);
  assert.ok(deploy, "deploy.yml must define jobs.deploy");
  const stepsSection = findMappingSection(
    lines,
    "steps",
    deploy.nextIndex,
    deploy.indent,
  );
  assert.ok(stepsSection, "deploy.yml must define jobs.deploy.steps");

  const rawSteps = [];
  let itemIndent = null;
  let current = null;
  let scalarParentIndent = null;

  for (let i = stepsSection.nextIndex; i < lines.length; i += 1) {
    const line = lines[i];
    if (scalarParentIndent !== null) {
      if (line.trim() === "" || indentOf(line) > scalarParentIndent) {
        current.push(line);
        continue;
      }
      scalarParentIndent = null;
    }

    if (isIgnorableLine(line)) {
      if (current) current.push(line);
      continue;
    }

    const indent = indentOf(line);
    const dashMatch = line.match(/^(\s*)-(\s+)(.*)$/);
    const isBareDash = /^\s*-\s*(?:#.*)?$/.test(line);
    const isItemStart =
      (dashMatch || isBareDash) &&
      (itemIndent === null ? indent >= stepsSection.indent : indent === itemIndent);

    if (itemIndent !== null && indent < itemIndent) break;
    if (itemIndent === null && !isItemStart && indent <= stepsSection.indent) {
      break;
    }

    if (isItemStart) {
      itemIndent = indent;
      current = [line];
      rawSteps.push(current);
      if (dashMatch && /^[^:#\s][^:]*:\s*[|>][+-]?(?:\s+#.*)?$/.test(dashMatch[3])) {
        scalarParentIndent = dashMatch[1].length + 1 + dashMatch[2].length;
      }
      continue;
    }

    if (current) {
      current.push(line);
      if (/^\s*[^:#\s][^:]*:\s*[|>][+-]?(?:\s+#.*)?$/.test(line)) {
        scalarParentIndent = indent;
      }
    }
  }

  return rawSteps.map(parseStepBlock);
}

function requireLiveRevisionVerificationStep(workflowText) {
  const steps = parseDeploySteps(workflowText);
  const readyIndex = steps.findIndex(
    (step) => step.name === "Wait for it to be READY",
  );
  assert.notEqual(
    readyIndex,
    -1,
    "deploy.yml must include a 'Wait for it to be READY' step",
  );

  const verificationStep = steps
    .slice(readyIndex + 1)
    .find(
      (step) =>
        typeof step.run === "string" && step.run.includes(LIVE_REVISION_URL),
    );
  assert.ok(
    verificationStep,
    `deploy.yml must verify ${LIVE_REVISION_URL} in a step after 'Wait for it to be READY'`,
  );
  assert.match(
    verificationStep.env?.SHA ?? "",
    /^\$\{\{\s*github\.sha\s*\}\}$/,
    "verification step must bind SHA to ${{ github.sha }} in env",
  );
  assert.notEqual(
    String(verificationStep["continue-on-error"] ?? "").toLowerCase(),
    "true",
    "verification step must not swallow failures with continue-on-error: true",
  );
  assert.doesNotMatch(
    String(verificationStep.if ?? "").trim(),
    /^(?:\$\{\{\s*)?false(?:\s*\}\})?$/i,
    "verification step must not be disabled with if: false",
  );

  return verificationStep;
}

function runVerificationScript(script, {responses, sha}) {
  const root = mkdtempSync(join(tmpdir(), "deploy-verify-"));
  try {
    const binDir = join(root, "bin");
    mkdirSync(binDir);
    const responsesFile = join(root, "responses.json");
    const callsFile = join(root, "calls.json");
    const sleepsFile = join(root, "sleeps.json");

    writeFileSync(responsesFile, JSON.stringify(responses));
    writeFileSync(callsFile, JSON.stringify([]));
    writeFileSync(sleepsFile, JSON.stringify([]));

    writeFileSync(
      join(binDir, "curl"),
      `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
const url = args.find((arg) => /^https?:\\/\\//.test(arg)) ?? null;
const hasFailFlag = args.some((arg) => arg === "--fail" || /^-[a-zA-Z]*f/.test(arg));
const calls = JSON.parse(fs.readFileSync(${JSON.stringify(callsFile)}, "utf8"));
calls.push({ url, hasFailFlag, args });
fs.writeFileSync(${JSON.stringify(callsFile)}, JSON.stringify(calls));

const responses = JSON.parse(fs.readFileSync(${JSON.stringify(responsesFile)}, "utf8"));
const next = responses[Math.min(calls.length - 1, responses.length - 1)];
if (next.exitCode && next.exitCode !== 0) {
  if (next.stderr) process.stderr.write(next.stderr + "\\n");
  process.exit(next.exitCode);
}
if (hasFailFlag && typeof next.status === "number" && next.status >= 400) {
  process.stderr.write("curl: (22) The requested URL returned error: " + next.status + "\\n");
  process.exit(22);
}
process.stdout.write(next.body ?? "");
`,
      {mode: 0o755},
    );

    writeFileSync(
      join(binDir, "sleep"),
      `#!/usr/bin/env node
const fs = require("node:fs");
const sleeps = JSON.parse(fs.readFileSync(${JSON.stringify(sleepsFile)}, "utf8"));
sleeps.push(process.argv.slice(2));
fs.writeFileSync(${JSON.stringify(sleepsFile)}, JSON.stringify(sleeps));
`,
      {mode: 0o755},
    );

    const result = spawnSync("bash", ["-c", script], {
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH}`,
        SHA: sha,
      },
      encoding: "utf8",
    });
    assert.equal(result.error, undefined);

    return {
      exitCode: result.status ?? 1,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      calls: JSON.parse(readFileSync(callsFile, "utf8")),
      sleeps: JSON.parse(readFileSync(sleepsFile, "utf8")),
    };
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
}

test("rejects an empty credential contract", () => {
  assert.throws(
    () => requireEnvironment([], {}),
    /At least one required environment variable must be named/,
  );
});

test("rejects a degraded run when a required credential is missing", () => {
  assert.throws(
    () =>
      requireEnvironment(["APPLICATION_ID", "API_KEY"], {
        APPLICATION_ID: "app-id",
      }),
    /API_KEY/,
  );
});

test("deploy workflow verifies live revision.json succeeds immediately on exact SHA match", () => {
  const workflow = readFileSync(DEPLOY_WORKFLOW_PATH, "utf8");
  const step = requireLiveRevisionVerificationStep(workflow);

  const result = runVerificationScript(step.run, {
    sha: EXPECTED_SHA,
    responses: [
      {
        status: 200,
        body: JSON.stringify({
          repository: "Subconscious-ai/subconscious-ai-docs",
          revision: EXPECTED_SHA,
        }),
      },
    ],
  });

  assert.equal(result.exitCode, 0, result.stderr);
  assert.equal(result.calls.length, 1);
  assert.equal(result.calls[0].url, LIVE_REVISION_URL);
  assert.equal(result.sleeps.length, 0);
});

test("deploy workflow live revision verification retries transient curl, JSON, and stale SHA failures before matching", () => {
  const workflow = readFileSync(DEPLOY_WORKFLOW_PATH, "utf8");
  const step = requireLiveRevisionVerificationStep(workflow);

  const result = runVerificationScript(step.run, {
    sha: EXPECTED_SHA,
    responses: [
      {exitCode: 22, stderr: "curl: (22) The requested URL returned error: 503"},
      {status: 500, body: "Internal Server Error"},
      {status: 200, body: "<html>502 Bad Gateway</html>"},
      {status: 200, body: "{}"},
      {
        status: 200,
        body: JSON.stringify({
          repository: "Subconscious-ai/subconscious-ai-docs",
          revision: STALE_SHA,
        }),
      },
      {
        status: 200,
        body: JSON.stringify({
          repository: "Subconscious-ai/subconscious-ai-docs",
          revision: EXPECTED_SHA,
        }),
      },
    ],
  });

  assert.equal(result.exitCode, 0, result.stderr);
  assert.equal(result.calls.length, 6);
  assert.ok(result.calls.every((call) => call.url === LIVE_REVISION_URL));
  assert.equal(result.sleeps.length, 5);
});

test("deploy workflow live revision verification fails with exit 1 on persistent stale revision", () => {
  const workflow = readFileSync(DEPLOY_WORKFLOW_PATH, "utf8");
  const step = requireLiveRevisionVerificationStep(workflow);

  const result = runVerificationScript(step.run, {
    sha: EXPECTED_SHA,
    responses: [
      {
        status: 200,
        body: JSON.stringify({
          repository: "Subconscious-ai/subconscious-ai-docs",
          revision: STALE_SHA,
        }),
      },
    ],
  });

  assert.equal(result.exitCode, 1);
  assert.ok(result.calls.length >= 2 && result.calls.length <= 20);
  assert.ok(result.calls.every((call) => call.url === LIVE_REVISION_URL));
  assert.equal(result.sleeps.length, result.calls.length - 1);
  assert.match(`${result.stdout}\n${result.stderr}`, new RegExp(STALE_SHA));
  assert.match(`${result.stdout}\n${result.stderr}`, new RegExp(EXPECTED_SHA));
});

test("rejects workflows missing post-READY verification, misordered steps, or disabled verification", () => {
  const workflow = readFileSync(DEPLOY_WORKFLOW_PATH, "utf8");
  const validStep = requireLiveRevisionVerificationStep(workflow);

  const withoutVerification = [
    "jobs:",
    "  deploy:",
    "    steps:",
    "      - name: Wait for it to be READY",
    "        run: echo READY",
  ].join("\n");
  assert.throws(
    () => requireLiveRevisionVerificationStep(withoutVerification),
    /must verify https:\/\/docs\.subconscious\.ai\/revision\.json in a step after 'Wait for it to be READY'/,
  );

  const beforeReadyWithAltFormatting = [
    "jobs:",
    "  deploy:",
    "    steps:",
    "    - env:",
    "        SHA: ${{ github.sha }}",
    "      run: |",
    `        curl -fsS ${LIVE_REVISION_URL}`,
    "      name: Verify live revision",
    "    - run: echo READY",
    "      name: Wait for it to be READY",
  ].join("\n");
  assert.throws(
    () => requireLiveRevisionVerificationStep(beforeReadyWithAltFormatting),
    /must verify https:\/\/docs\.subconscious\.ai\/revision\.json in a step after 'Wait for it to be READY'/,
  );

  const withDifferentIndentAndKeyOrder = [
    "jobs:",
    "  deploy:",
    "    steps:",
    "    - run: echo READY",
    "      name: Wait for it to be READY",
    "    - env:",
    "        SHA: ${{ github.sha }}",
    "      run: |",
    ...validStep.run.split("\n").map((line) => `        ${line}`),
    "      name: Check live site",
  ].join("\n");
  assert.equal(
    requireLiveRevisionVerificationStep(withDifferentIndentAndKeyOrder).name,
    "Check live site",
  );

  const ignoredFailure = withDifferentIndentAndKeyOrder.replace(
    "      name: Check live site",
    "      continue-on-error: true\n      name: Check live site",
  );
  assert.throws(
    () => requireLiveRevisionVerificationStep(ignoredFailure),
    /continue-on-error: true/,
  );

  const disabledStep = withDifferentIndentAndKeyOrder.replace(
    "      name: Check live site",
    "      if: false\n      name: Check live site",
  );
  assert.throws(
    () => requireLiveRevisionVerificationStep(disabledStep),
    /if: false/,
  );

  const missingShaEnv = withDifferentIndentAndKeyOrder.replace(
    "        SHA: ${{ github.sha }}",
    "        OTHER: value",
  );
  assert.throws(
    () => requireLiveRevisionVerificationStep(missingShaEnv),
    /must bind SHA/,
  );
});
