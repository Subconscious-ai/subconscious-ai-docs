---
id: authentication
title: Authentication
description: How to generate a Subconscious.ai API access token and use it as a bearer token.
---

# Authentication

Every published endpoint requires a bearer token.

## Generate a token

1. Sign in and open [Settings](https://app.subconscious.ai/settings).
2. Select **Generate Access Token**.
3. Copy the token and store it somewhere safe. It is shown once.

![The Generate Access Token control on the settings page](/img/token.jpeg)

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
