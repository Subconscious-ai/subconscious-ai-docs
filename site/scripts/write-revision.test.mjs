import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveRevision,
  revisionDocument,
} from "./write-revision.mjs";

test("uses the exact provider revision with deterministic output", () => {
  const revision = resolveRevision(
    {
      DOCS_SOURCE_REVISION: "a".repeat(40),
      VERCEL_GIT_COMMIT_SHA: "b".repeat(40),
      GITHUB_SHA: "c".repeat(40),
    },
    "d".repeat(40),
  );

  assert.equal(revision, "a".repeat(40));
  assert.deepEqual(revisionDocument(revision), {
    repository: "Subconscious-ai/subconscious-ai-docs",
    revision: "a".repeat(40),
  });
});

test("rejects missing or ambiguous revision values", () => {
  assert.throws(
    () => resolveRevision({}, "not-a-commit"),
    /40-character Git SHA/,
  );
});
