// Exercise production content assertions before publication, against the exact
// build output. A homepage rewrite must update its release proof in the same PR.
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PRODUCTION_ROUTES} from "./verify-production.mjs";

const build = new URL("../build/", import.meta.url);
for (const {path, expected} of PRODUCTION_ROUTES) {
  const file = path === "/" ? "index.html"
    : /\.[a-z]+$/i.test(path) ? path.slice(1) : `${path.slice(1)}.html`;
  const body = await readFile(new URL(file, build), "utf8");
  assert.ok(body.includes(expected), `${path}: build is missing ${JSON.stringify(expected)}`);
}
console.log(`Verified production content assertions against ${PRODUCTION_ROUTES.length} built routes.`);
