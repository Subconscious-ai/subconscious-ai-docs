---
id: authentication
title: Authentication
description: How to generate a Subconscious.ai API access token and use it as a bearer token.
---

# Authentication

Every published endpoint requires a bearer token.

## Get your token

**→ [app.subconscious.ai/settings](https://app.subconscious.ai/settings)**

1. Sign in and open **Settings**.
2. Under *Get a Subconscious.ai API key*, select **Generate API Token**.
3. The token appears below, under **Your Access Token**. Use the copy button
   and store it somewhere safe.

![The Generate API Token control on the settings page](/img/token.jpeg)

:::tip
Regenerating replaces the previous token. Anything still using the old one
starts returning `403`.
:::

## Use the token

Send it in the `Authorization` header on every request:

```bash
curl https://api.subconscious.ai/api/v1/traits \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

A missing or invalid token returns `403`.

## Keep it secret

The token carries your account's full API access, and experiments cost money to
run. Treat it as a credential:

- Never commit it to a repository or paste it into a shared document.
- Keep it in an environment variable or a secret manager, not in source.
- Rotate it from the settings page if you think it has leaked.
