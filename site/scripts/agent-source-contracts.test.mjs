import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
  const bytes = Buffer.from(
    JSON.stringify({
      openapi: "3.1.0",
      info: { title: "Public API", version: "1" },
      paths: { "/health": { get: {} } },
    }),
  );
  const result = validateOpenApiSource(bytes, {
    repository: "Subconscious-ai/rehoboam",
    revision: "a".repeat(40),
    path: "openapi.public.json",
    sha256: sha256(bytes),
  });
  assert.equal(result.source.sha256, sha256(bytes));

  assert.throws(
    () =>
      validateOpenApiSource(Buffer.from(`${bytes} `), {
        repository: "Subconscious-ai/rehoboam",
        revision: "a".repeat(40),
        path: "openapi.public.json",
        sha256: sha256(bytes),
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
