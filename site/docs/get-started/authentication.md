---
id: authentication
title: Authentication
description: Retrieve a Subconscious.ai API access token, use it as a bearer token, and handle authentication errors.
---

# Authentication

Every published endpoint requires a bearer token.

## Get your token

**→ [app.subconscious.ai/settings](https://app.subconscious.ai/settings)**

1. Sign in and open **Settings**.
2. In the access-token section, select **Get Access Token**.
3. The token appears below, under **Your Access Token**. Use the copy button
   and store it somewhere safe.

:::tip Retrieving a token is not revocation
The button retrieves an access token for your signed-in session. Clicking it
again does not guarantee that a previously copied token has been revoked.
If a token is exposed, contact [support@subconscious.ai](mailto:support@subconscious.ai)
for help securing the account. Never include the token in your message.
:::

## Use the token

Send it in the `Authorization` header on every request:

```bash
curl https://api.subconscious.ai/api/v1/traits \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

An expired or invalid bearer token returns `401`. Missing credentials or an
unsupported authorization scheme can return `403`. A `403` on a protected
resource can also mean that your account lacks access, even with a valid token.
Read the response detail before deciding to replace a token or request access.

## Keep it secret

The token identifies your account; resource access also depends on its permissions.
Experiments cost money to run. Treat the token as a credential:

- Never commit it to a repository or paste it into a shared document.
- Keep it in an environment variable or a secret manager, not in source.
- If it may have leaked, stop sharing it and contact support about revocation.
