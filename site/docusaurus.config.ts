import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const config: Config = {
  title: "Subconscious.ai Docs",
  tagline: "Generative AI for experimental design",
  favicon: "img/dag-mark.svg",

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

  // Supplied by the Vercel environment. Both are publishable client-side
  // identifiers (GA4 measurement id, PostHog project key); keeping them in the
  // environment means rotation does not need a commit, and a local build with
  // neither set simply runs without analytics.
  customFields: {
    posthogKey: "phc_BtQX3ltCKgwlMS3TDF4zhV8eMeepa8qY0Y3c9Gp6m70",
  },

  // Rspack/SWC/Lightning CSS instead of webpack+Babel. @docusaurus/faster was
  // already a dependency but never switched on; the default toolchain drifted
  // to the full 2GB --max-old-space-size ceiling building a 2.1MB corpus.
  // ssgWorkerThreads is left off deliberately: it requires future.v4, and
  // flipping v4 behaviour is a separate decision from cutting build memory.
  future: {
    faster: {
      rspackBundler: true,
      rspackPersistentCache: true,
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
      ssgWorkerThreads: false,
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
          // Replication pages carry correlation statistics as LaTeX.
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
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
          // The playground is client-rendered: a crawler fetching it gets an
          // empty shell. The generated reference pages are the indexable ones.
          ignorePatterns: ["/api-playground"],
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
      "@docusaurus/plugin-google-gtag",
      { trackingID: "G-52WK8DDZLF", anonymizeIP: true },
    ],
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
      // Scalar: a single interactive playground at /api-playground, with a
      // request client built in. It complements -- does not replace -- the
      // generated per-operation pages, which are what search engines and
      // answer engines actually index (one URL per endpoint).
      "@scalar/docusaurus",
      {
        label: "",
        route: "/api-playground",
        showNavLink: false,
        configuration: {
          url: "/openapi/subconscious.public.json",
          hideDownloadButton: false,
        },
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

  clientModules: ["./src/analytics/posthog.ts"],

  scripts: [
    {
      // Sentry Loader Script. The key is the project's public key and is meant
      // to sit in client HTML; SDK version and which features are enabled
      // (performance, replay) are controlled from the Sentry project settings,
      // not here, so this needs no redeploy to tune.
      src: "https://js.sentry-cdn.com/2fbafc5214e26466d3b1c6a764c4dcfb.min.js",
      crossorigin: "anonymous",
      async: true,
    },
  ],

  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css",
      type: "text/css",
      crossorigin: "anonymous",
    },
    // Brand type: Inter Tight and IBM Plex Mono, the public stack from the
    // design-system repo.
    "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
  ],

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
    algolia: {
      appId: "BNEN1CKK95",
      // Search-only key: safe to publish, and it is in the client bundle by
      // design. The write key never leaves CI.
      apiKey: "4a1a16de76e172055e7a15abff1d87df",
      indexName: "subconscious_docs",
      contextualSearch: false,
    },
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
      logo: { alt: "Subconscious.ai", src: "img/dag-mark.svg" },
      items: [
        {
          to: "/get-started/quickstart",
          label: "Get started",
          position: "left",
        },
        { to: "/guides/run-an-experiment", label: "Guides", position: "left" },
        {
          type: "dropdown",
          label: "API",
          position: "left",
          items: [
            { to: "/api-reference/superego", label: "Reference" },
            { to: "/api-playground", label: "Playground (try it)" },
            {
              href: "https://docs.subconscious.ai/openapi/subconscious.public.json",
              label: "OpenAPI spec",
            },
          ],
        },
        {
          to: "/human-baselines",
          label: "Human baselines",
          position: "left",
        },
        { to: "/concepts/methodology", label: "Concepts", position: "left" },
        {
          href: "https://discord.gg/3bgj4ZhABz",
          label: "Discord",
          position: "right",
        },
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
            { label: "Discord", href: "https://discord.gg/3bgj4ZhABz" },
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
