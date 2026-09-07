---
id: mcp-server
title: Connect through MCP
description: Connect an assistant to Rehoboam, review a study draft, explicitly approve a paid launch, and retrieve interpretable results.
---

# Connect through MCP

Use MCP when you want an assistant to help design and inspect an experiment.
Rehoboam owns the server and its tool schemas. The complete
[tool reference](/reference/mcp-tools) is generated from native discovery;
[the manifest](https://docs.subconscious.ai/mcp/tools.json) records the source revision and exact schemas.

## Connect your client

Configure a remote MCP connection to **`https://api.subconscious.ai/mcp/`**
using **Streamable HTTP**. Supply your access token in the
`Authorization: Bearer YOUR_ACCESS_TOKEN` header. Obtain the token through
[the authentication guide](/get-started/authentication).

The transport is session-aware. Your client must retain the MCP session and
support the server's elicitation flow to approve a paid launch. Configuration
syntax differs between clients; use the client's remote MCP connection settings.
A client that can list tools is not necessarily able to complete launch approval.

Never put an access token in a URL, a research prompt, or a shared notebook.
The server derives caller identity from verified authentication; an assistant
cannot grant itself access by supplying a user ID.

Start by connecting and listing tools. Discovery does not launch an experiment.
The published manifest describes its pinned source; your connected server's
`tools/list` response is the authority for the capabilities available in that session.
The older Ghostshell stdio instructions describe a different registry and should
not be used to configure this connection.

## Follow a study from question to evidence

| Stage                  | Tools                                                                        | Your decision                                                     |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Frame the question     | `check_causality`                                                            | Is this a sufficiently clear choice question?                     |
| Draft the task         | `generate_attributes_levels`, `generate_dependent_variable`                  | Are the attributes, levels, and outcome meaningful?               |
| Review a stored design | `create_experiment_draft`, `get_experiment_draft`, `revise_experiment_draft` | Does the reviewed draft match your study brief?                   |
| Launch                 | `start_experiment`                                                           | Do you approve this exact experiment and its cost?                |
| Follow progress        | `get_experiment_status`                                                      | Keep the original run identity while it is non-terminal           |
| Inspect results        | `get_experiment_details`, `ask_experiment`                                   | Are the expected artifacts present and relevant to your question? |
| Analyze                | The analytics tools below                                                    | Which contrast answers the decision you planned?                  |

A useful initial instruction is:

> Help me design a study of job-offer preferences. Compare salary, working
> arrangement, and commute for my stated target population. Explain the
> assumptions and show me the draft before asking for launch approval.

Treat generated designs as proposals. Use
[Design your first study](/guides/research-design) to check population,
comparisons, interpretation, and the plan for human validation.

## Review before approving a paid launch

Draft creation and revision support conjoint designs. `start_experiment` also
accepts the direct request shapes described in its schema. A stored draft and a
direct request are different inputs; inspect the exact tool definition before
constructing a call.

The server asks for confirmation through the MCP client's trusted elicitation
flow. An approval sentence inside an assistant message is not that confirmation.
Review the displayed experiment, retain its idempotency key and launch receipt,
and use the same identity to reconcile an interrupted attempt. Do not invent a
new key merely because a response timed out.

The `advanced` object is a closed, typed set of options. It is not an arbitrary
REST passthrough. See [the complete input schemas](/reference/mcp-tools) for
required keys, defaults, enumerations, nested options, and constraints. Browser,
REST, and MCP defaults can differ, so inspect the resolved request you approve.

After launch, poll the original run. `in-queue`, `running`, and `unknown` are
non-terminal. A missing provider record does not prove failure. Check for the
expected result artifacts even after `finished`; see
[Poll a run](/guides/poll-a-run).

## Choose an analysis tool deliberately

| Tool                                 | Use it for                                               | Interpretation boundary                                                   |
| ------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `get_analytics_metadata`             | Discover the available attributes, levels, and analyses  | Availability is not a finding                                             |
| `get_feature_importance`             | Compare modeled attribute importance within a design     | Importance depends on the levels tested                                   |
| `get_posterior_distribution`         | Inspect estimated preference variation                   | Utility variation is not automatically a population confidence interval   |
| `get_willingness_to_pay`             | Inspect a coefficient-based trade-off                    | Check the returned scale; a ratio is not automatically a currency amount  |
| `get_market_share`                   | Compare modeled preference within a submitted choice set | This is not observed market share or a sales forecast                     |
| `get_factors_affecting_latent_trait` | Inspect modeled associations with a specified trait      | A model association is not independent human validation of a construct    |
| `get_clusters_or_segments`           | Explore patterns of preference heterogeneity             | Exploratory segments need stability checks and a justified interpretation |

Use metadata to obtain actual identifiers rather than guessing attribute,
level, or segment keys. Inspect each tool's output schema before turning its
result into a chart or report. The [methodology guide](/concepts/methodology)
sets out the research validity checks to apply before sharing a conclusion.

## Read the same documentation programmatically

- [/llms.txt](https://docs.subconscious.ai/llms.txt): page index for assistants.
- [/llms-full.txt](https://docs.subconscious.ai/llms-full.txt): rendered public documentation text.
- [/docs-manifest.json](https://docs.subconscious.ai/docs-manifest.json): page digests and documentation revision.
- [/mcp/tools.json](https://docs.subconscious.ai/mcp/tools.json): complete pinned MCP tool contract.
- [/openapi/openapi-manifest.json](https://docs.subconscious.ai/openapi/openapi-manifest.json): REST provenance.

Use the [REST API](/get-started/quickstart) for an application integration that
needs explicit HTTP requests and responses. Use the browser workflow when you
want to inspect each study-design step visually.
