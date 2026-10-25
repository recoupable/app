# OAuth consent validation

The `/oauth/authorize` page is disabled unless the server environment has `OAUTH_CONSENT_ENABLED=true` and an explicit `OAUTH_ISSUER` such as `https://api.recoupable.dev/api/oauth`. It requires the matching API implementation in [API PR #963](https://github.com/recoupable/api/pull/963). Keep both gates disabled until the remaining launch work in [epic #207](https://github.com/recoupable/mono/issues/207) is complete.

The page uses the existing Privy provider without mounting workspace onboarding, account overrides or checkout effects. Only the configured API receives the Privy token. Requests include the browser's API interaction cookie, and the API permits only its configured chat Origin. Deploy chat/API under same-site HTTPS domains for cookie compatibility; unrelated Vercel preview domains are not equivalent.

The first consent slice covers personal-account access until disconnected (existing 30-day approvals keep their original deadline), including requested write scopes. Organization selection, Connected Apps and production tool authorization remain separate launch requirements. Client names are unverified text. Approval and cancellation are explicit; the browser cannot submit account IDs or scopes. Returned navigation must stay on the issuer's authorization resume path before the OAuth provider redirects to the client.

Run:

```bash
pnpm test -- lib/oauth/__tests__/createConsentClient.test.ts components/OAuth/__tests__/OAuthConsent.test.tsx
pnpm exec playwright install chromium --only-shell
pnpm exec vitest run --config vitest.oauth.browser.config.ts
```

The Chromium suite uses the real React component with synthetic Privy/API fixtures. It verifies sign-in gating, visible read/write and persistent-access consent, explicit approval/denial, and stale-account protection. API tests separately exercise the actual provider, Next HTTP boundary, cookies, durable PostgreSQL storage and token exchange. These checks do not constitute real Privy or named-agent interoperability evidence.

## User-verified read-only registration

`/oauth/claim?claim_attempt_token=…` requires `OAUTH_CONSENT_ENABLED=true`,
`OAUTH_AGENT_REGISTRATION_ENABLED=true`, and the configured `OAUTH_ISSUER`.
It uses the existing Privy-only OAuth
layout. The account holder must sign in, enter the six-digit code shown by their
agent, and approve personal read access for one hour. Decline needs no code.
The API requires a matching verified email and a one-use approval ticket.

The client sends no account ID, scopes, or lifetime. It validates the server's
personal `mcp:read` policy before rendering consent, binds displayed metadata and
typed codes to the current account/issuer/attempt, and rejects redirects. The browser
carries the opaque `claim_attempt_token` from the URL; it never receives the agent's
polling `claim_token` or resulting API credential. Failed submissions
reload a fresh ticket before retrying. Locked or expired claims require a new
request in the agent.

OAuth routes retain `no-store`, `no-referrer`, and frame-ancestor protections.
Page analytics omits these routes and filters OAuth events after navigation.
Connected Agents already supports the finite one-hour grant and revocation.

Deploy the matching database migration and API with its registration flag disabled,
then enable this page on the configured consent origin. Enable API discovery last,
after the account-holder verification page is reachable. Existing OAuth authorization
and Connected Agents keep their current flags and behavior.

## Connected Agents client-adapter acceptance

`components/OAuth/__tests__/OAuthConnectionsClient.test.tsx` renders the actual
Connected Agents component with its real `createConnectionsClient` adapter.
Only first-party identity and HTTP responses are synthetic. It checks that a
failed DELETE retains both clients, a successful DELETE removes only the
selected client, refresh preserves the second client, and an empty list shows
connection instructions rather than claiming an automatic reconnect. A newly
approved grant appears only after a successful list readback.

Run the focused checks with:

```bash
pnpm test -- components/OAuth/__tests__/OAuthConnectionsClient.test.tsx components/OAuth/__tests__/OAuthConnections.test.tsx lib/oauth/__tests__/createConnectionsClient.test.ts
```

These checks complement the API's disposable-PostgreSQL HTTP-controller tests.
They do not verify real Privy login, production storage, an actual approval or a
named agent host. Native component fixtures must retain those same boundaries;
a narrow component container is not a mobile viewport test.
