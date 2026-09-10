// Exercise production content assertions before publication, against the exact
// build output. A homepage rewrite must update its release proof in the same PR.
import assert from "node:assert/strict";
import {readFile, readdir} from "node:fs/promises";
import {inflateSync} from "node:zlib";
import {PRODUCTION_ROUTES} from "./verify-production.mjs";

const build = new URL("../build/", import.meta.url);
for (const {path, expected} of PRODUCTION_ROUTES) {
  const file = path === "/" ? "index.html"
    : /\.[a-z]+$/i.test(path) ? path.slice(1) : `${path.slice(1)}.html`;
  const body = await readFile(new URL(file, build), "utf8");
  assert.ok(body.includes(expected), `${path}: build is missing ${JSON.stringify(expected)}`);
}
console.log(`Verified production content assertions against ${PRODUCTION_ROUTES.length} built routes.`);

// Generation must remove retired pages, including their search/agent content.
// Compare the generator's embedded method/path with the source-owned spec.
const spec = JSON.parse(await readFile(new URL("../openapi/subconscious.public.json", import.meta.url)));
const expectedOperations = Object.entries(spec.paths).flatMap(([path, item]) =>
  Object.keys(item).filter(method => /^(get|post|put|patch|delete|head|options|trace)$/.test(method))
    .map(method => `${method.toUpperCase()} ${path}`)).sort();
const generated = new URL("../docs/api-reference/", import.meta.url);
const actualOperations = [];
for (const file of await readdir(generated)) {
  if (!file.endsWith(".api.mdx")) continue;
  const body = await readFile(new URL(file, generated), "utf8");
  const encoded = body.match(/^api: (.+)$/m)?.[1];
  assert.ok(encoded, `${file}: missing generated operation contract`);
  const operation = JSON.parse(inflateSync(Buffer.from(encoded, "base64")));
  actualOperations.push(`${operation.method.toUpperCase()} ${operation.path}`);
}
assert.deepEqual(actualOperations.sort(), expectedOperations,
  "Generated API pages differ from the customer contract; clean and regenerate them.");
console.log(`Verified ${actualOperations.length} generated API pages against the customer contract.`);
