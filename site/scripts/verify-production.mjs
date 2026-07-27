import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

const AUTHORITATIVE_ENVIRONMENT = "Production – docs";
const REPOSITORY = "Subconscious-ai/subconscious-ai-docs";
const FORBIDDEN_BODY =
  /vercel\.com\/sso-api|sign in to vercel|page not found|<title[^>]*>404/i;

export const PRODUCTION_ROUTES = [
  {path: "/", expected: "Subconscious.ai documentation"},
  {path: "/human-baselines", expected: "Human baselines"},
  {path: "/api-reference/superego", expected: "SuperEgo API"},
  {path: "/search", expected: "Search"},
  {path: "/llms.txt", expected: "# Subconscious.ai"},
  {
    path: "/openapi/subconscious.public.json",
    expected: '"openapi": "3.1.0"',
  },
];

async function readRoute({
  fetchImpl,
  baseUrl,
  path,
  expectedRevision,
}) {
  const url = new URL(path, baseUrl);
  url.searchParams.set("proof", expectedRevision);
  const response = await fetchImpl(url, {
    redirect: "manual",
    headers: {"cache-control": "no-cache"},
  });
  if (response.status !== 200) {
    throw new Error(
      `${path}: expected 200 without redirects, got ${response.status}`,
    );
  }
  const body = await response.text();
  if (FORBIDDEN_BODY.test(body)) {
    throw new Error(`${path}: received a login or error body`);
  }
  return body;
}

export async function verifyProduction({
  fetchImpl = fetch,
  baseUrl,
  expectedRevision,
  deploymentEnvironment,
  deploymentState,
}) {
  if (deploymentEnvironment !== AUTHORITATIVE_ENVIRONMENT) {
    throw new Error(
      `Expected deployment environment ${AUTHORITATIVE_ENVIRONMENT}, got ${deploymentEnvironment}`,
    );
  }
  if (deploymentState !== "success") {
    throw new Error(`Expected successful deployment, got ${deploymentState}`);
  }
  if (!/^[0-9a-f]{40}$/i.test(expectedRevision ?? "")) {
    throw new Error("Expected a 40-character deployment SHA");
  }

  const revisionBody = await readRoute({
    fetchImpl,
    baseUrl,
    path: "/revision.json",
    expectedRevision,
  });
  const revision = JSON.parse(revisionBody);
  if (
    revision.repository !== REPOSITORY ||
    revision.revision !== expectedRevision
  ) {
    throw new Error(
      `Production revision mismatch: expected ${expectedRevision}, got ${revision.revision}`,
    );
  }

  for (const route of PRODUCTION_ROUTES) {
    const body = await readRoute({
      fetchImpl,
      baseUrl,
      path: route.path,
      expectedRevision,
    });
    if (!body.includes(route.expected)) {
      throw new Error(
        `${route.path}: expected content ${JSON.stringify(route.expected)}`,
      );
    }
  }

  return {
    environment: deploymentEnvironment,
    revision: expectedRevision,
    routes: PRODUCTION_ROUTES.length + 1,
  };
}

async function main() {
  const proof = await verifyProduction({
    baseUrl: process.env.PRODUCTION_URL ?? "https://docs.subconscious.ai",
    expectedRevision: process.env.DEPLOYMENT_SHA,
    deploymentEnvironment: process.env.DEPLOYMENT_ENVIRONMENT,
    deploymentState: process.env.DEPLOYMENT_STATE,
  });
  console.log(JSON.stringify(proof, null, 2));
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  await main();
}
