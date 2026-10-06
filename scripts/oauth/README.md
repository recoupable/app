# OAuth consent validation

The `/oauth/authorize` page is disabled unless the server environment has `OAUTH_CONSENT_ENABLED=true` and an explicit `OAUTH_ISSUER` such as `https://api.recoupable.dev/api/oauth`. It requires the matching API implementation in [API PR #963](https://github.com/recoupable/api/pull/963). Keep both gates disabled until the remaining launch work in [epic #207](https://github.com/recoupable/mono/issues/207) is complete.

The page uses the existing Privy provider without mounting workspace onboarding, account overrides or checkout effects. Only the configured API receives the Privy token. Requests include the browser's API interaction cookie, and the API permits only its configured chat Origin. Deploy chat/API under same-site HTTPS domains for cookie compatibility; unrelated Vercel preview domains are not equivalent.

The first consent slice covers personal-account access for 30 days, including requested write scopes. Organization selection, Connected Apps and production tool authorization remain separate launch requirements. Client names are unverified text. Approval and cancellation are explicit; the browser cannot submit account IDs or scopes. Returned navigation must stay on the issuer's authorization resume path before the OAuth provider redirects to the client.

Run:

```bash
pnpm test -- lib/oauth/__tests__/createConsentClient.test.ts components/OAuth/__tests__/OAuthConsent.test.tsx
pnpm exec playwright install chromium --only-shell
pnpm exec vitest run --config vitest.oauth.browser.config.ts
```

The Chromium suite uses the real React component with synthetic Privy/API fixtures. It verifies sign-in gating, visible read/write and persistent-access consent, explicit approval/denial, and stale-account protection. API tests separately exercise the actual provider, Next HTTP boundary, cookies, durable PostgreSQL storage and token exchange. These checks do not constitute real Privy or named-agent interoperability evidence.
