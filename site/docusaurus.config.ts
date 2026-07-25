import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";

const config: Config = {
  title: "Subconscious.ai Docs",
  tagline: "Generative AI for experimental design",
  favicon: "img/favicon.ico",

  url: "https://docs.subconscious.ai",
  baseUrl: "/",
  trailingSlash: false,

  organizationName: "Subconscious-ai",
  projectName: "subconscious-ai-docs",

  // A broken link is a support ticket. Fail the build, do not warn.
  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",

  markdown: {
    format: "detect",
    hooks: { onBrokenMarkdownLinks: "throw" },
  },

  i18n: { defaultLocale: "en", locales: ["en"] },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
          // Required by the OpenAPI theme: it swizzles the doc item to render
          // parameters, schemas and the try-it panel.
          docItemComponent: "@theme/ApiItem",
          editUrl:
            "https://github.com/Subconscious-ai/subconscious-ai-docs/edit/main/site/",
          // Builds now run from a git clone via the Vercel Git integration.
          showLastUpdateTime: true,
        },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
        sitemap: {
          lastmod: "date",
          changefreq: "weekly",
          filename: "sitemap.xml",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    "docusaurus-plugin-sass",
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "api",
        docsPluginId: "classic",
        config: {
          superego: {
            specPath: "openapi/subconscious.public.json",
            outputDir: "docs/api-reference",
            // One sidebar category per tag, with the tag description as the
            // category landing page.
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            downloadUrl:
              "https://docs.subconscious.ai/openapi/subconscious.public.json",
            showSchemas: true,
          } satisfies OpenApiPlugin.Options,
        },
      },
    ],
    [
      "@easyops-cn/docusaurus-search-local",
      {
        // Algolia DocSearch needs a public site. Local search keeps the site
        // usable either way; swap it out if the repo goes public.
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: "/",
        highlightSearchTermsOnTargetPage: true,
      },
    ],
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          // The generated API landing page is named after the spec title.
          // Keep the obvious URL working.
          { from: "/api-reference", to: "/api-reference/superego" },
          // Mintlify starter URLs that are live on this domain today.
          { from: "/introduction", to: "/" },
          { from: "/features", to: "/concepts/how-it-works" },
          {
            from: "/api-reference/authentication",
            to: "/get-started/authentication",
          },
          // Fern URLs, from the period when Fern held this domain.
          { from: "/wiki/get-started/welcome-to-subconscious-ai", to: "/" },
          {
            from: "/wiki/get-started/reference-implementation",
            to: "/get-started/quickstart",
          },
          {
            from: "/wiki/get-started/use-cases-industries",
            to: "/concepts/use-cases",
          },
          {
            from: "/wiki/knowledge-base/getting-started",
            to: "/get-started/quickstart",
          },
        ],
      },
    ],
  ],

  themes: ["docusaurus-theme-openapi-docs"],

  headTags: [
    {
      // Answer-engine and search structured data. Docusaurus emits page HTML
      // statically, so crawlers and assistants see real content.
      tagName: "script",
      attributes: { type: "application/ld+json" },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TechArticle",
        name: "Subconscious.ai API Documentation",
        description:
          "REST API for designing and running causal experiments — conjoint " +
          "analysis, synthetic respondent populations, and human baselines.",
        publisher: {
          "@type": "Organization",
          name: "Subconscious.ai",
          url: "https://subconscious.ai",
        },
      }),
    },
  ],

  themeConfig: {
    image: "img/logo-dark.png",
    metadata: [
      {
        name: "description",
        content:
          "Design and run causal experiments through an API: conjoint " +
          "analysis, synthetic respondent populations, and human baselines.",
      },
    ],
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: "Subconscious.ai",
      logo: { alt: "Subconscious.ai", src: "img/logo-dark.png" },
      items: [
        {
          to: "/get-started/quickstart",
          label: "Get started",
          position: "left",
        },
        { to: "/guides/run-an-experiment", label: "Guides", position: "left" },
        { to: "/api-reference/superego", label: "API reference", position: "left" },
        { to: "/concepts/methodology", label: "Concepts", position: "left" },
        {
          href: "https://github.com/Subconscious-ai/ghostshell",
          label: "MCP server",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Quickstart", to: "/get-started/quickstart" },
            { label: "API reference", to: "/api-reference/superego" },
          ],
        },
        {
          title: "Support",
          items: [
            { label: "FAQ", to: "/support/faq" },
            { label: "Contact", to: "/support/contact" },
          ],
        },
        {
          title: "Legal",
          items: [
            { label: "Terms of use", to: "/support/terms-of-use" },
            { label: "Privacy policy", to: "/support/privacy-policy" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Subconscious.ai`,
    },
    prism: {
      additionalLanguages: ["bash", "json", "python", "r"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
