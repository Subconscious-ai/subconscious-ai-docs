import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";

import {
  validateMcpSource,
  validateOpenApiSource,
} from "./agent-source-contracts.mjs";

const BUILD_DIR = new URL("../build/", import.meta.url).pathname;
const PROVENANCE_DIR = new URL("../provenance/", import.meta.url);
const SITE = "https://docs.subconscious.ai";
const SKIP_PREFIXES = [
  "/api-playground",
  "/api-reference/",
  "/fern",
  "/search",
  "/wiki",
  "/404",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

function extract(html, tag) {
  const patterns = {
    title: /<title[^>]*>([^<]*)<\/title>/i,
    description: /<meta[^>]*\sname="description"[^>]*\scontent="([^"]*)"/i,
  };
  return html.match(patterns[tag])?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function decodeHtml(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (entity, code) => {
      if (code.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
      }
      if (code.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
      }
      return named[code.toLowerCase()] ?? entity;
    },
  );
}

function articleText(html) {
  const article =
    html.match(
      /<div class="theme-doc-markdown markdown">([\s\S]*?)<footer class="theme-doc-footer/,
    )?.[1] ?? "";
  return decodeHtml(
    article
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(h[1-6]|p|li|pre|blockquote)>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\u200b/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sourceRevision() {
  const revision =
    process.env.DOCS_SOURCE_REVISION ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (!/^[0-9a-f]{40}$/.test(revision)) {
    throw new Error("Docs source revision must be a full Git SHA");
  }
  const generatedAt = execFileSync(
    "git",
    ["show", "-s", "--format=%cI", "HEAD"],
    { encoding: "utf8" },
  ).trim();
  return { revision, generatedAt };
}

const pages = [];
for await (const file of walk(BUILD_DIR)) {
  const route = file
    .slice(BUILD_DIR.length - 1)
    .replace(/\/index\.html$/, "")
    .replace(/\.html$/, "");
  const url = route === "/index" ? "/" : route || "/";
  if (SKIP_PREFIXES.some((prefix) => url.startsWith(prefix))) continue;

  const html = await readFile(file, "utf8");
  if (html.includes('http-equiv="refresh"')) continue;
  const content = articleText(html);
  if (!content) continue;

  pages.push({
    url: `${SITE}${url}`,
    title: extract(html, "title").replace(/ \| Subconscious\.ai Docs$/, ""),
    description: extract(html, "description"),
    content,
  });
}
pages.sort((left, right) => left.url.localeCompare(right.url));

const { revision, generatedAt } = sourceRevision();
const docsManifest = {
  schema_version: 1,
  canonical_url: `${SITE}/docs-manifest.json`,
  generated_at: generatedAt,
  source: {
    repository: "Subconscious-ai/subconscious-ai-docs",
    revision,
  },
  page_count: pages.length,
  pages: pages.map(({ content, ...page }) => ({
    ...page,
    content_sha256: sha256(content),
  })),
};
const llmsFull = [
  "# Subconscious.ai documentation",
  "",
  `Source revision: ${revision}`,
  "",
  ...pages.flatMap((page) => [
    `## ${page.title}`,
    "",
    `Source: ${page.url}`,
    "",
    page.content,
    "",
  ]),
].join("\n");

const pins = JSON.parse(
  await readFile(new URL("sources.json", PROVENANCE_DIR), "utf8"),
);
const openapi = validateOpenApiSource(
  await readFile(new URL("../openapi/subconscious.public.json", PROVENANCE_DIR)),
  await readFile(
    new URL("sources/openapi.public.provenance.json", PROVENANCE_DIR),
  ),
  pins.openapi,
);
const mcp = validateMcpSource(
  await readFile(new URL("sources/mcp-tools.public.json", PROVENANCE_DIR)),
  pins.mcp,
);
const openapiManifest = {
  ...openapi.manifest,
  canonical_url: `${SITE}/openapi/openapi-manifest.json`,
  source_artifact: {
    repository: pins.openapi.repository,
    revision: pins.openapi.revision,
    path: pins.openapi.manifest_path,
    sha256: pins.openapi.manifest_sha256,
  },
  schema: {
    ...openapi.manifest.schema,
    canonical_url: `${SITE}/openapi/subconscious.public.json`,
  },
};
const mcpManifest = {
  ...mcp,
  canonical_url: `${SITE}/mcp/tools.json`,
  source_artifact: {
    repository: pins.mcp.repository,
    revision: pins.mcp.revision,
    path: pins.mcp.path,
    sha256: pins.mcp.sha256,
  },
};

const serialized = [
  JSON.stringify(docsManifest),
  llmsFull,
  JSON.stringify(openapiManifest),
  JSON.stringify(mcpManifest),
].join("\n");
for (const forbidden of [
  "app.gitbook.com",
  "RPAuLvXI0lCcTz39j3BR",
  "?token=",
]) {
  if (serialized.includes(forbidden)) {
    throw new Error(`Agent artifacts contain forbidden value: ${forbidden}`);
  }
}

await mkdir(join(BUILD_DIR, "mcp"), { recursive: true });
await mkdir(join(BUILD_DIR, "openapi"), { recursive: true });
await writeFile(
  join(BUILD_DIR, "docs-manifest.json"),
  `${JSON.stringify(docsManifest, null, 2)}\n`,
);
await writeFile(join(BUILD_DIR, "llms-full.txt"), llmsFull);
await writeFile(
  join(BUILD_DIR, "openapi", "openapi-manifest.json"),
  `${JSON.stringify(openapiManifest, null, 2)}\n`,
);
await writeFile(
  join(BUILD_DIR, "mcp", "tools.json"),
  `${JSON.stringify(mcpManifest, null, 2)}\n`,
);

console.log(
  `Wrote agent artifacts for ${pages.length} pages, ` +
    `${openapi.manifest.schema.operation_count} API operations, and ` +
    `${mcp.tool_count} MCP tools.`,
);
