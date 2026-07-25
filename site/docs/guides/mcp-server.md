---
id: mcp-server
title: MCP server
description: Run Subconscious.ai experiments from Claude, Cursor, or any MCP-compatible client.
---

# MCP server

Subconscious.ai ships an MCP server, so an AI assistant can design and run
experiments directly. It is the fastest way to try the platform without writing
integration code.

## Connect a hosted client

Use your access token from [Settings](https://app.subconscious.ai/settings).

**Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "subconscious-ai": {
      "url": "https://ghostshell-runi.vercel.app/api/sse?token=YOUR_TOKEN"
    }
  }
}
```

**Cursor** — `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "subconscious-ai": {
      "url": "https://ghostshell-runi.vercel.app/api/sse?token=YOUR_TOKEN"
    }
  }
}
```

Restart the client after editing its config.

## What you can ask for

The server exposes the experiment loop as tools, so requests in plain language
work:

- "Run a conjoint experiment on what drives choice of electric vehicles."
- "What's the status of run a1b2c3d4?"
- "Show me the AMCEs for that run."

Progress streams over server-sent events, so a long-running experiment reports
back as it goes.

## The request shape

The MCP layer takes a deliberately small request: the research question, the
experiment type, whether the run is private, and an optional population
selection. Anything else goes in an `advanced` object that passes through to
the REST API.

That small surface is a good model for your own integration too — see
[Run an experiment](/guides/run-an-experiment).

## Source

The server is open at
[Subconscious-ai/ghostshell](https://github.com/Subconscious-ai/ghostshell),
including instructions for running it locally instead of using the hosted
endpoint.
