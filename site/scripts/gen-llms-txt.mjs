// Generate /llms.txt from the built site.
//
// Answer engines (Claude, ChatGPT, Perplexity) use llms.txt as a map of what a
// documentation site contains. The Mintlify site we are replacing published
// one, so dropping it would be a regression in exactly the channel we care
// most about. This reads the build output rather than a hand-maintained list,
// so it cannot drift from the site.
//
// Runs as a postbuild step. No dependencies.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BUILD_DIR = new URL("../build/", import.meta.url).pathname;
const SITE = "https://docs.subconscious.ai";

// Reference pages are numerous and repetitive; one pointer to the spec serves
// an assistant better than 141 near-identical entries. Archives and the
// client-rendered playground also have no useful static content to publish.
const SKIP_PREFIXES = [
  "/api-playground",
  "/api-reference/",
  "/fern",
  "/search",
  "/wiki",
  "/404",
];

// With `trailingSlash: false` Docusaurus emits `route.html`, not
// `route/index.html`, so match every HTML file.
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
    // Docusaurus injects react-helmet attributes, so `name` is not first.
    description: /<meta[^>]*\sname="description"[^>]*\scontent="([^"]*)"/i,
  };
  const match = html.match(patterns[tag]);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
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
  // Redirect stubs carry no content worth listing.
  if (html.includes('http-equiv="refresh"')) continue;

  pages.push({
    url,
    title: extract(html, "title").replace(/ \| Subconscious\.ai Docs$/, ""),
    description: extract(html, "description"),
  });
}

pages.sort((a, b) => a.url.localeCompare(b.url));

const lines = [
  "# Subconscious.ai",
  "",
  "> REST API for running causal experiments — conjoint analysis on synthetic",
  "> respondent populations, validated against replicated human studies.",
  "",
  "## Docs",
  "",
  ...pages.map(
    (page) =>
      `- [${page.title}](${SITE}${page.url})${
        page.description ? `: ${page.description}` : ""
      }`,
  ),
  "",
  "## API",
  "",
  `- [OpenAPI specification](${SITE}/openapi/subconscious.public.json): the`,
  "  published API surface, machine readable.",
  `- [API reference](${SITE}/api-reference/superego): rendered endpoint`,
  "  documentation with request and response schemas.",
  "",
];

await writeFile(join(BUILD_DIR, "llms.txt"), lines.join("\n"));
console.log(`Wrote build/llms.txt (${pages.length} pages)`);
