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
// an assistant better than 141 near-identical entries. The client-rendered
// playground also has no useful static content to publish.
const SKIP_PREFIXES = [
  "/api-playground",
  "/api-reference/",
  "/search",
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
  if (tag === "title") {
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match ? match[1].replace(/\s+/g, " ").trim() : "";
  }
  // Docusaurus minifier drops quotes on single-token attributes (`name=description`).
  for (const [meta] of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (!/\sname=(?:"description"|'description'|description(?=\s|>))/i.test(meta)) {
      continue;
    }
    const content = meta.match(/\scontent=(?:"([^"]*)"|'([^']*)'|([^\s>]*))/i);
    if (content) {
      return (content[1] ?? content[2] ?? content[3] ?? "").replace(/\s+/g, " ").trim();
    }
  }
  return "";
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
  "> Controlled experiments and prospective decision analysis with synthetic",
  "> populations: eight business decision workflows, research methods, REST and MCP",
  "> contracts, and scoped human-baseline comparisons.",
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
  "## Subconscious.ai Ecosystem",
  "",
  "- [Subconscious.ai](https://subconscious.ai/llms.txt): main site overview and article index.",
  "- [Research & Blog](https://subconscious.ai/blog): pricing, discrete choice, validation, and competitor guides.",
  "- [Causal Fidelity Registry](https://fidelity.subconscious.ai/llms.txt): public human-baseline replications and working papers.",
  "- [Book a decision review](https://subconscious.ai/meet): scope a causal simulation with the team.",
  "",
];

await writeFile(join(BUILD_DIR, "llms.txt"), lines.join("\n"));
console.log(`Wrote build/llms.txt (${pages.length} pages)`);
