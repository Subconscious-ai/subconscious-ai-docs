import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCTION_ROUTES,
  verifyProduction,
} from "./verify-production.mjs";

const SHA = "a".repeat(40);

function response(body, status = 200, headers = {}) {
  return new Response(body, {status, headers});
}

function successfulFetch(pathOverrides = {}) {
  const bodies = Object.fromEntries(
    PRODUCTION_ROUTES.map(({path, expected}) => [path, expected]),
  );
  bodies["/revision.json"] = JSON.stringify({
    repository: "Subconscious-ai/subconscious-ai-docs",
    revision: SHA,
  });
  Object.assign(bodies, pathOverrides);

  return async (url) => {
    const path = new URL(url).pathname;
    return response(bodies[path] ?? "missing", bodies[path] ? 200 : 404);
  };
}

test("correlates the canonical domain to the successful deployment SHA", async () => {
  const proof = await verifyProduction({
    fetchImpl: successfulFetch(),
    baseUrl: "https://docs.subconscious.ai",
    expectedRevision: SHA,
    deploymentEnvironment: "Production",
    deploymentState: "success",
  });

  assert.equal(proof.revision, SHA);
  assert.equal(proof.environment, "Production");
  assert.equal(proof.routes, PRODUCTION_ROUTES.length + 1);
});

// Vercel emitted "Production – docs" while a duplicate project was attached to
// this repository. That project is gone, but a second one could appear again,
// so both names stay accepted and both stay covered.
test("still accepts the project-qualified environment name", async () => {
  const proof = await verifyProduction({
    fetchImpl: successfulFetch(),
    baseUrl: "https://docs.subconscious.ai",
    expectedRevision: SHA,
    deploymentEnvironment: "Production – docs",
    deploymentState: "success",
  });

  assert.equal(proof.environment, "Production – docs");
});

test("rejects an unrelated environment", async () => {
  await assert.rejects(
    verifyProduction({
      fetchImpl: successfulFetch(),
      baseUrl: "https://docs.subconscious.ai",
      expectedRevision: SHA,
      deploymentEnvironment: "Preview",
      deploymentState: "success",
    }),
    /Expected one of/,
  );
});

test("rejects redirects before accepting a login page", async () => {
  await assert.rejects(
    verifyProduction({
      fetchImpl: async () =>
        response("", 302, {location: "https://vercel.com/sso-api"}),
      baseUrl: "https://docs.subconscious.ai",
      expectedRevision: SHA,
      deploymentEnvironment: "Production – docs",
      deploymentState: "success",
    }),
    /expected 200 without redirects/,
  );
});

test("rejects a 200 login body", async () => {
  await assert.rejects(
    verifyProduction({
      fetchImpl: successfulFetch({"/": "Sign in to Vercel"}),
      baseUrl: "https://docs.subconscious.ai",
      expectedRevision: SHA,
      deploymentEnvironment: "Production – docs",
      deploymentState: "success",
    }),
    /login or error body/,
  );
});

test("rejects a canonical site serving another revision", async () => {
  await assert.rejects(
    verifyProduction({
      fetchImpl: successfulFetch({
        "/revision.json": JSON.stringify({
          repository: "Subconscious-ai/subconscious-ai-docs",
          revision: "b".repeat(40),
        }),
      }),
      baseUrl: "https://docs.subconscious.ai",
      expectedRevision: SHA,
      deploymentEnvironment: "Production – docs",
      deploymentState: "success",
    }),
    /revision mismatch/,
  );
});
