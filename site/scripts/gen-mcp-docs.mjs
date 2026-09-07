// A small adapter from the native discovery manifest to Docusaurus Markdown.
// All option detail comes from the source schema; no handwritten parameter copy.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { validateMcpSource } from "./agent-source-contracts.mjs";

const root = new URL("../", import.meta.url);
const pins = JSON.parse(
  await readFile(new URL("provenance/sources.json", root), "utf8"),
);
const manifest = validateMcpSource(
  await readFile(new URL("provenance/sources/mcp-tools.public.json", root)),
  pins.mcp,
);
const cell = (value) =>
  String(value)
    .replaceAll("|", "&#124;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", " ");
const lines = [
  "---",
  "id: mcp-tools",
  "title: MCP tool reference",
  "description: Source-generated MCP tool descriptions, required inputs, defaults, constraints and complete input/output schemas.",
  "---",
  "",
  "# MCP tool reference",
  "",
  "Use [Connect through MCP](/guides/mcp-server) for setup, approval, run lifecycle, and interpretation.",
  "",
  `This reference contains **${manifest.tool_count} tools**, generated from the pinned Rehoboam discovery manifest.`,
  `Source revision: \`${manifest.source.revision}\`. [Download the complete manifest](https://docs.subconscious.ai/mcp/tools.json).`,
  "",
  "Required and nullable are different. A required key must be present; a nullable value may be null. Nested schemas, unions, enumerations, defaults and output definitions are preserved below. Runtime authorization and cross-field validation still apply.",
  "",
];
for (const tool of manifest.tools) {
  lines.push(
    `## ${tool.name}`,
    "",
    tool.description || "See the protocol schema below.",
    "",
    "| Input | Required | Meaning |",
    "| --- | --- | --- |",
  );
  for (const [name, field] of Object.entries(
    tool.inputSchema.properties ?? {},
  )) {
    lines.push(
      `| \`${cell(name)}\` | ${tool.inputSchema.required?.includes(name) ? "yes" : "no"} | ${cell(field.description || "See the typed definition below.")} |`,
    );
  }
  lines.push(
    "",
    "<details>",
    "<summary>Complete input and output contract</summary>",
    "",
    "```json",
    JSON.stringify(tool, null, 2),
    "```",
    "",
    "</details>",
    "",
  );
}
await mkdir(new URL("docs/reference/", root), { recursive: true });
await writeFile(new URL("docs/reference/mcp-tools.md", root), lines.join("\n"));
console.log(`Generated MCP reference for ${manifest.tool_count} tools.`);
