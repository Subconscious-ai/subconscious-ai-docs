import assert from "node:assert/strict";
import test from "node:test";
import { releasedContract } from "./resolve-released-contract.mjs";

const run = {
  id: 123,
  conclusion: "success",
  head_branch: "production",
  head_sha: "a".repeat(40),
};
const health = {
  status: "ok",
  service: "rehoboam-api",
  environment: "prod",
  git_sha: run.head_sha,
};
test("adopts the exact successful and currently serving production revision", () => {
  assert.equal(releasedContract(run, health).revision, run.head_sha);
});
test("rejects a failed release, non-production run, unhealthy server, or different live revision", () => {
  for (const candidate of [
    undefined,
    { ...run, conclusion: "failure" },
    { ...run, head_branch: "develop" },
  ]) {
    assert.throws(() => releasedContract(candidate, health));
  }
  for (const candidate of [
    { ...health, status: "degraded" },
    { ...health, environment: "dev" },
    { ...health, git_sha: "b".repeat(40) },
  ]) {
    assert.throws(() => releasedContract(run, candidate));
  }
});
