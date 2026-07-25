import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// The API reference sidebar is generated from the spec by
// `pnpm run gen-api-docs`. It is a build artifact and is gitignored.
// The generated module default-exports the item array itself.
import apiSidebarItems from "./docs/api-reference/sidebar";

/**
 * Structure follows Diátaxis: learning-oriented (get started), task-oriented
 * (guides), information-oriented (reference), understanding-oriented
 * (concepts). Readers arrive from search with a job in mind, so the top level
 * names jobs, not our org chart.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    "index",
    {
      type: "category",
      label: "Get started",
      collapsed: false,
      items: [
        "get-started/quickstart",
        "get-started/authentication",
        "get-started/your-first-experiment",
      ],
    },
    {
      type: "category",
      label: "Guides",
      items: [
        "guides/run-an-experiment",
        "guides/design-a-population",
        "guides/poll-a-run",
        "guides/mcp-server",
      ],
    },
    {
      type: "category",
      label: "Concepts",
      items: [
        "concepts/how-it-works",
        "concepts/methodology",
        "concepts/human-baselines",
        "concepts/use-cases",
      ],
    },
    {
      type: "category",
      label: "Support",
      items: [
        "support/faq",
        "support/contact",
        "support/terms-of-use",
        "support/privacy-policy",
      ],
    },
  ],

  apiSidebar: [
    {
      type: "category",
      label: "API reference",
      link: { type: "doc", id: "api-reference/superego" },
      items: apiSidebarItems,
    },
  ],
};

export default sidebars;
