import assert from "node:assert/strict";
import { createHash } from "node:crypto";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function validateOpenApiSource(schemaBytes, manifestBytes, pin) {
  assert.equal(pin.repository, "Subconscious-ai/rehoboam");
  assert.match(pin.revision, /^[0-9a-f]{40}$/);
  assert.equal(pin.schema_path, "openapi.public.json");
  assert.equal(pin.manifest_path, "openapi.public.provenance.json");
  assert.equal(sha256(schemaBytes), pin.schema_sha256);
  assert.equal(sha256(manifestBytes), pin.manifest_sha256);

  const schema = JSON.parse(schemaBytes);
  const manifest = JSON.parse(manifestBytes);
  assert.match(schema.openapi, /^3\./);
  assert.equal(typeof schema.info?.title, "string");
  assert.equal(typeof schema.paths, "object");
  assert.equal(manifest.manifest_version, 1);
  assert.equal(manifest.source.repository, pin.repository);
  assert.match(manifest.source.revision, /^[0-9a-f]{40}$/);
  assert.equal(manifest.schema.filename, pin.schema_path);
  assert.equal(manifest.schema.path_count, Object.keys(schema.paths).length);
  assert.equal(
    manifest.schema.operation_count,
    Object.values(schema.paths).reduce(
      (count, path) =>
        count +
        Object.keys(path).filter((key) =>
          [
            "get",
            "put",
            "post",
            "delete",
            "options",
            "head",
            "patch",
            "trace",
          ].includes(key.toLowerCase()),
        ).length,
      0,
    ),
  );

  return {
    schema,
    manifest,
    source: {
      repository: pin.repository,
      revision: pin.revision,
      schema_path: pin.schema_path,
      schema_sha256: pin.schema_sha256,
      manifest_path: pin.manifest_path,
      manifest_sha256: pin.manifest_sha256,
    },
  };
}

export function validateMcpSource(bytes, pin) {
  assert.equal(pin.repository, "Subconscious-ai/rehoboam");
  assert.match(pin.revision, /^[0-9a-f]{40}$/);
  assert.equal(pin.path, "mcp-tools.public.json");
  assert.equal(sha256(bytes), pin.sha256);

  const manifest = JSON.parse(bytes);
  assert.equal(manifest.manifest_version, 1);
  assert.equal(manifest.source.repository, pin.repository);
  assert.equal(manifest.source.revision, pin.registry_revision);
  assert.equal(manifest.transport.type, "streamable-http");
  assert.equal(manifest.transport.path, "/mcp/");
  assert.equal(manifest.transport.stateful, true);
  assert.equal(manifest.authentication.type, "bearer");
  assert.equal(manifest.authentication.delivery, "header");
  assert.equal(manifest.authentication.header, "Authorization");
  assert.equal(manifest.tool_count, manifest.tools.length);
  // The raw artifact SHA above binds every nested schema byte. Re-serializing
  // its numbers in JavaScript would change Python's 0.0 to 0 and reject an
  // otherwise exact source artifact.


  return manifest;
}
