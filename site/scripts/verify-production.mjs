import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

// Vercel names the GitHub deployment environment after the project only when
// more than one project is attached to the repository. A duplicate project
// existed until 2026-07-27, which is where "Production – docs" came from;
// with one project it is plain "Production". Accept both so this keeps
// working either way, and so it fails loudly rather than never running.
const AUTHORITATIVE_ENVIRONMENTS = new Set(["Production", "Production – docs"]);
const REPOSITORY = "Subconscious-ai/subconscious-ai-docs";
const REQUEST_TIMEOUT_MS = 15_000;
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
  timeoutMs = REQUEST_TIMEOUT_MS,
}) {
  const url = new URL(path, baseUrl);
  url.searchParams.set("proof", expectedRevision);
  // A stalled response would hang the job until the runner times out, with no
  // useful error. Bound every request instead.
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  let response;
  try {
    response = await fetchImpl(url, {
      signal: abort.signal,
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
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`${path}: no response within ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyProduction({
  timeoutMs = REQUEST_TIMEOUT_MS,
  fetchImpl = fetch,
  baseUrl,
  expectedRevision,
  deploymentEnvironment,
  deploymentState,
}) {
  if (!AUTHORITATIVE_ENVIRONMENTS.has(deploymentEnvironment)) {
    throw new Error(
      `Expected one of ${[...AUTHORITATIVE_ENVIRONMENTS].join(" or ")}, got ${deploymentEnvironment}`,
    );
  }
  if (deploymentState !== "success") {
    throw new Error(`Expected successful deployment, got ${deploymentState}`);
  }
  if (!/^[0-9a-f]{40}$/i.test(expectedRevision ?? "")) {
    throw new Error("Expected a 40-character deployment SHA");
  }

  const revisionBody = await readRoute({
    timeoutMs,
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
      timeoutMs,
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
