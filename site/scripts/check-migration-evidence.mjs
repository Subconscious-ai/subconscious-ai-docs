import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const inventory = JSON.parse(
  await readFile(new URL("migration/source-inventory.json", root), "utf8"),
);
const routeMap = JSON.parse(
  await readFile(new URL("migration/route-map.json", root), "utf8"),
);
const internalRelease = JSON.parse(
  await readFile(
    new URL("migration/evidence/internal-docs-release.json", root),
    "utf8",
  ),
);

assert.equal(inventory.schema_version, 1);
assert.equal(inventory.retirement_authorized, false);
assert.equal(routeMap.schema_version, 1);
assert.equal(routeMap.retirement_authorized, false);
assert.equal(routeMap.forbid_catch_all_redirects, true);

const requiredSources = new Set([
  "public-docusaurus",
  "fern",
  "mintlify-starter",
  "public-gitbook",
  "internal-gitbook",
  "rehoboam-openapi",
  "ghostshell-mcp",
  "internal-docusaurus",
]);
const allowedDispositions = new Set([
  "migrate",
  "retain",
  "retain-archive",
  "delete-later",
]);

for (const source of inventory.sources) {
  requiredSources.delete(source.id);
  assert.ok(allowedDispositions.has(source.disposition), source.id);
  assert.ok(source.owner_evidence, `${source.id} needs owner evidence`);
  assert.ok(source.completeness, `${source.id} needs completeness evidence`);
  assert.ok(source.destination, `${source.id} needs a destination`);
  assert.ok(
    ["blocked", "not-applicable"].includes(source.retirement_status),
    `${source.id} cannot be marked retired by this plan`,
  );
  if (source.retirement_status === "blocked") {
    assert.ok(source.unknowns.length > 0, `${source.id} needs an exact blocker`);
  }
}
assert.deepEqual([...requiredSources], []);

const internalDestination = inventory.sources.find(
  (source) => source.id === "internal-docusaurus",
);
assert.equal(internalDestination.revision, internalRelease.head_revision);
assert.equal(
  internalRelease.artifact.name,
  `internal-docs-${internalRelease.head_revision}`,
);
assert.match(internalRelease.workflow_run, /\/actions\/runs\/\d+$/);
assert.ok(Number.isInteger(internalRelease.artifact.id));
assert.match(internalRelease.artifact.archive_sha256, /^[a-f0-9]{64}$/);
assert.deepEqual(internalDestination.counts, {
  retained_pages: internalRelease.totals.retained_pages,
  retained_assets: internalRelease.totals.retained_assets,
  unavailable_source_assets: internalRelease.totals.unavailable_source_assets,
});

const exactSources = new Set();
for (const route of routeMap.exact_routes) {
  assert.equal(route.action, "redirect");
  assert.ok(route.source.startsWith("/"));
  assert.ok(route.destination.startsWith("/"));
  assert.ok(!exactSources.has(route.source), `duplicate route ${route.source}`);
  exactSources.add(route.source);
}

const requiredPrefixes = new Set([
  "/fern/*",
  "/wiki/*",
  "/internal-docs/*",
  "/openapi/*",
  "/mcp/*",
]);
for (const route of routeMap.prefixes) {
  requiredPrefixes.delete(route.source);
  assert.ok(route.reason);
  assert.ok(route.retirement_status);
}
assert.deepEqual([...requiredPrefixes], []);

const docusaurusConfig = await readFile(
  new URL("site/docusaurus.config.ts", root),
  "utf8",
);
const configuredRedirects = [
  ...docusaurusConfig.matchAll(
    /from:\s*"([^"]+)"\s*,\s*to:\s*"([^"]+)"/g,
  ),
]
  .map((match) => [match[1], match[2]])
  .sort(([left], [right]) => left.localeCompare(right));
const recordedRedirects = routeMap.exact_routes
  .map((route) => [route.source, route.destination])
  .sort(([left], [right]) => left.localeCompare(right));
assert.deepEqual(recordedRedirects, configuredRedirects);

const internalManifestPath = process.env.INTERNAL_DOCS_MANIFEST_PATH;
if (internalManifestPath) {
  const manifestBytes = await readFile(internalManifestPath);
  const manifest = JSON.parse(manifestBytes);
  assert.equal(
    createHash("sha256").update(manifestBytes).digest("hex"),
    internalRelease.manifest_sha256,
  );
  assert.deepEqual(manifest.source, {
    ...internalRelease.source,
    retrieved_at: manifest.source.retrieved_at,
  });
  assert.deepEqual(manifest.totals, internalRelease.totals);
}

console.log(
  `Migration evidence valid: ${inventory.sources.length} sources, ` +
    `${routeMap.exact_routes.length} exact routes, ${routeMap.prefixes.length} prefixes.`,
);
