import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  validateMcpSource,
  validateOpenApiSource,
} from "./agent-source-contracts.mjs";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

test("accepts an exact native OpenAPI revision pin", () => {
  const schema = {
    openapi: "3.1.0",
    info: { title: "Public API", version: "1" },
    paths: { "/health": { get: {} } },
  };
  const schemaBytes = Buffer.from(JSON.stringify(schema));
  const manifest = {
    manifest_version: 1,
    source: {
      repository: "Subconscious-ai/rehoboam",
      revision: "b".repeat(40),
    },
    schema: {
      filename: "openapi.public.json",
      canonical_sha256: sha256(JSON.stringify(canonicalize(schema))),
      path_count: 1,
      operation_count: 1,
    },
  };
  const manifestBytes = Buffer.from(JSON.stringify(manifest));
  const result = validateOpenApiSource(schemaBytes, manifestBytes, {
    repository: "Subconscious-ai/rehoboam",
    revision: "a".repeat(40),
    schema_path: "openapi.public.json",
    schema_sha256: sha256(schemaBytes),
    manifest_path: "openapi.public.provenance.json",
    manifest_sha256: sha256(manifestBytes),
  });
  assert.equal(result.source.schema_sha256, sha256(schemaBytes));

  assert.throws(
    () =>
      validateOpenApiSource(Buffer.from(`${schemaBytes} `), manifestBytes, {
        repository: "Subconscious-ai/rehoboam",
        revision: "a".repeat(40),
        schema_path: "openapi.public.json",
        schema_sha256: sha256(schemaBytes),
        manifest_path: "openapi.public.provenance.json",
        manifest_sha256: sha256(manifestBytes),
      }),
    /Expected values to be strictly equal/,
  );
});

test("accepts only the source-owned safe MCP transport contract", () => {
  const tools = [
    {
      name: "check_causality",
      description: "Check a research question.",
      inputSchema: { type: "object", properties: {} },
    },
  ];
  const manifest = {
    manifest_version: 1,
    source: {
      repository: "Subconscious-ai/ghostshell",
      revision: "b".repeat(40),
    },
    transport: { type: "stdio", status: "supported" },
    authentication: {
      type: "bearer",
      delivery: "environment",
      environment_variable: "AUTH0_JWT_TOKEN",
    },
    tool_count: tools.length,
    tools,
    tools_sha256: sha256(JSON.stringify(canonicalize(tools))),
  };
  const bytes = Buffer.from(JSON.stringify(manifest));
  const pin = {
    repository: "Subconscious-ai/ghostshell",
    revision: "c".repeat(40),
    registry_revision: "b".repeat(40),
    path: "mcp-tools.public.json",
    sha256: sha256(bytes),
  };

  assert.equal(validateMcpSource(bytes, pin).tool_count, 1);

  const unsafe = {
    ...manifest,
    authentication: { ...manifest.authentication, delivery: "query" },
  };
  const unsafeBytes = Buffer.from(JSON.stringify(unsafe));
  assert.throws(
    () =>
      validateMcpSource(unsafeBytes, {
        ...pin,
        sha256: sha256(unsafeBytes),
      }),
    /environment/,
  );
});

test("accepts the exact checked source artifacts", async () => {
  const provenanceRoot = new URL("../provenance/", import.meta.url);
  const pins = JSON.parse(
    await readFile(new URL("sources.json", provenanceRoot), "utf8"),
  );
  const openapi = validateOpenApiSource(
    await readFile(new URL("../openapi/subconscious.public.json", provenanceRoot)),
    await readFile(
      new URL("sources/openapi.public.provenance.json", provenanceRoot),
    ),
    pins.openapi,
  );
  const mcp = validateMcpSource(
    await readFile(new URL("sources/mcp-tools.public.json", provenanceRoot)),
    pins.mcp,
  );

  assert.equal(openapi.manifest.schema.path_count, 58);
  assert.equal(mcp.tool_count, 15);
});
