import assert from "node:assert/strict";
import test from "node:test";

import {requireEnvironment} from "./require-ci-env.mjs";

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
