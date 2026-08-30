import assert from "node:assert/strict";
import test from "node:test";

import {requireEnvironment} from "./require-ci-env.mjs";
import {runReindex} from "./reindex-search.mjs";

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

test("refuses to run the scraper when the reindex credentials are missing", () => {
  let spawned = false;

  assert.throws(
    () => runReindex({
      env: {APPLICATION_ID: "app-id"},
      readFile: () => "{}",
      spawn: () => {
        spawned = true;
        return {status: 0};
      },
    }),
    /API_KEY/,
  );
  assert.equal(spawned, false);
});

test("passes validated credentials and compact config to the scraper", () => {
  const calls = [];
  const env = {APPLICATION_ID: "app-id", API_KEY: "write-key"};

  runReindex({
    env,
    readFile: () => '{\n  "index_name": "docs"\n}',
    spawn: (...args) => {
      calls.push(args);
      return {status: 0};
    },
  });

  assert.equal(calls.length, 1);
  const [command, args, options] = calls[0];
  assert.equal(command, "docker");
  assert.deepEqual(args, [
    "run",
    "--rm",
    "-e",
    "APPLICATION_ID",
    "-e",
    "API_KEY",
    "-e",
    "CONFIG",
    "algolia/docsearch-scraper",
  ]);
  assert.equal(options.env.APPLICATION_ID, "app-id");
  assert.equal(options.env.API_KEY, "write-key");
  assert.equal(options.env.CONFIG, '{"index_name":"docs"}');
});

test("propagates a scraper failure", () => {
  assert.throws(
    () => runReindex({
      env: {APPLICATION_ID: "app-id", API_KEY: "write-key"},
      readFile: () => "{}",
      spawn: () => ({status: 17}),
    }),
    /status 17/,
  );
});

test("names the signal when the scraper is killed rather than exiting", () => {
  assert.throws(
    () => runReindex({
      env: {APPLICATION_ID: "app-id", API_KEY: "write-key"},
      readFile: () => "{}",
      spawn: () => ({status: null, signal: "SIGKILL"}),
    }),
    /terminated by signal SIGKILL/,
  );
});
