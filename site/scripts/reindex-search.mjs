import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {fileURLToPath, pathToFileURL} from "node:url";

import {requireEnvironment} from "./require-ci-env.mjs";

const CONFIG_PATH = fileURLToPath(new URL("./docsearch.json", import.meta.url));

export function runReindex({
  env = process.env,
  readFile = readFileSync,
  spawn = spawnSync,
} = {}) {
  requireEnvironment(["APPLICATION_ID", "API_KEY"], env);
  const config = JSON.stringify(JSON.parse(readFile(CONFIG_PATH, "utf8")));
  const result = spawn(
    "docker",
    [
      "run",
      "--rm",
      "-e",
      "APPLICATION_ID",
      "-e",
      "API_KEY",
      "-e",
      "CONFIG",
      "algolia/docsearch-scraper",
    ],
    {
      env: {...env, CONFIG: config},
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      result.status === null && result.signal
        ? `DocSearch scraper was terminated by signal ${result.signal}`
        : `DocSearch scraper exited with status ${result.status}`,
    );
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    runReindex();
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}
