---
id: mcp-server
title: MCP server
description: Run Subconscious.ai experiments from Claude, Cursor, or any MCP-compatible client.
---

# MCP server

Subconscious.ai ships an MCP server, so an AI assistant can design and run
experiments directly. It is the fastest way to try the platform without writing
integration code.

## Supported: run locally over stdio

Use your access token from [Settings](https://app.subconscious.ai/settings).
Clone [Subconscious-ai/ghostshell](https://github.com/Subconscious-ai/ghostshell),
create a Python virtual environment, and install the repository:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
```

Add this server to your client's MCP configuration. Use absolute paths:

```json
{
  "mcpServers": {
    "subconscious-ai": {
      "command": "/absolute/path/to/ghostshell/venv/bin/python3",
      "args": ["/absolute/path/to/ghostshell/server/main.py"],
      "env": {
        "AUTH0_JWT_TOKEN": "YOUR_TOKEN",
        "API_BASE_URL": "https://api.subconscious.ai"
      }
    }
  }
}
```

Keep the configuration private because it contains a bearer credential. Restart
the client after editing its configuration.

The hosted SSE transport is experimental. It accepts bearer credentials only
in the `Authorization` header. Never put a token in a URL. Hosted setup is not
recommended until its credentialed protocol smoke test is complete.

You can verify the supported local protocol without calling a paid tool:

```bash
python scripts/smoke_stdio_mcp.py
```

## What you can ask for

The server exposes the experiment loop as tools, so requests in plain language
work:

- "Run a conjoint experiment on what drives choice of electric vehicles."
- "What's the status of run a1b2c3d4?"
- "Show me the AMCEs for that run."

Long-running experiment status is available through the status tools.

## The request shape

The MCP layer takes a deliberately small request: the research question, the
experiment type, whether the run is private, and an optional population
selection. Anything else goes in an `advanced` object that passes through to
the REST API.

That small surface is a good model for your own integration too: see
[Run an experiment](/guides/run-an-experiment).

## Source

The server is open at
[Subconscious-ai/ghostshell](https://github.com/Subconscious-ai/ghostshell),
including instructions for running it locally instead of using the hosted
endpoint.
