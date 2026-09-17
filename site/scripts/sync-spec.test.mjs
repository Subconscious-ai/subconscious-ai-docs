import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const sha = (text) => createHash("sha256").update(text).digest("hex");
const revision = "c".repeat(40);
const legacyRevision = "b".repeat(40);

for (const version of [1, 2]) {
  for (const corrupt of (version === 1 ? [false, "schema"] : [false, "schema", "tools"])) {
    test(`sync v${version} ${corrupt ? `rejects corrupt ${corrupt}` : "pins downloaded content to its release"}`, () => {
      const root = mkdtempSync(join(tmpdir(), "contract-sync-"));
      try {
        mkdirSync(join(root, "site/scripts"), { recursive: true });
        mkdirSync(join(root, "site/provenance"), { recursive: true });
        mkdirSync(join(root, "bin"));
        copyFileSync(new URL("./sync-spec.sh", import.meta.url), join(root, "site/scripts/sync-spec.sh"));
        const pinsFile = join(root, "site/provenance/sources.json");
        const initialPins = JSON.stringify({ openapi: {} });
        writeFileSync(pinsFile, initialPins);
        const schema = { openapi: "3.1.0", paths: { "/health": { get: {} } }, servers: [{ url: "https://example.invalid" }] };
        const canonicalSchema = JSON.stringify(schema); // keys above are sorted
        const source = { repository: "Subconscious-ai/rehoboam", ...(version === 1 ? { revision: legacyRevision } : {}) };
        const manifest = {
          manifest_version: version, source,
          schema: { filename: "openapi.public.json", canonical_sha256: corrupt === "schema" ? "0".repeat(64) : sha(canonicalSchema), path_count: 1, operation_count: 1 },
        };
        const tools = [{ inputSchema: { type: "object" }, name: "published" }];
        const mcp = {
          manifest_version: version, source,
          transport: { type: "streamable-http", path: "/mcp/", stateful: true },
          authentication: { type: "bearer", delivery: "header", header: "Authorization" },
          tool_count: 1, tools,
          ...(version === 2 ? { tools_sha256: corrupt === "tools" ? "0".repeat(64) : sha(JSON.stringify(tools)) } : {}),
        };
        writeFileSync(join(root, "fixtures.json"), JSON.stringify({
          "openapi.public.json": schema,
          "openapi.public.provenance.json": manifest,
          "mcp-tools.public.json": mcp,
        }));
        // Exercise the real shell/Python sync boundary without network or credentials.
        writeFileSync(join(root, "bin/gh"), `#!/usr/bin/env node
const fs = require('node:fs');
const endpoint = process.argv[3];
const files = JSON.parse(fs.readFileSync(process.env.SYNC_FIXTURES));
if (endpoint.includes('/contents/')) {
  const [name, query] = endpoint.split('/contents/')[1].split('?');
  if (![${JSON.stringify(revision)}, ${JSON.stringify(legacyRevision)}].includes(new URLSearchParams(query).get('ref'))) process.exit(2);
  process.stdout.write(Buffer.from(JSON.stringify(files[name])).toString('base64'));
} else if (endpoint.includes('/compare/')) {
  process.stdout.write('ahead');
} else if (endpoint.includes('/commits/')) {
  process.stdout.write(${JSON.stringify(revision)});
} else process.exit(2);
`, { mode: 0o755 });
        const run = () => execFileSync("bash", [join(root, "site/scripts/sync-spec.sh")], {
          env: { ...process.env, PATH: `${join(root, "bin")}:${process.env.PATH}`, REHOBOAM_REF: revision, SYNC_FIXTURES: join(root, "fixtures.json") },
          stdio: "pipe",
        });
        if (corrupt) {
          assert.throws(run, (error) => /AssertionError/.test(error.stderr.toString()));
          assert.equal(readFileSync(pinsFile, "utf8"), initialPins);
        } else {
          run();
          const pins = JSON.parse(readFileSync(pinsFile));
          assert.equal(pins.openapi.revision, revision);
          assert.equal(pins.mcp.registry_revision, version === 1 ? legacyRevision : revision);
          assert.equal(pins.mcp.sha256, sha(readFileSync(join(root, "site/provenance/sources/mcp-tools.public.json"))));
        }
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  }
}
