# Assessment snapshot verification

Owning work: app #2116 (Context), #2140 (evidence intake), mono #361 (release evidence).

The existing assessment viewer uses the existing `brief`, `save_brief` and
`read_brief` actions through the authenticated `/api/context` proxy. There is no
new store, acceptance operation, provider collection or guest-claim operation.

## Two distinct actions

- Context guest preview: **Keep song details / Sign in to keep details** claims the
  existing guest request into the personal account. It does not create an
  assessment snapshot. The existing HttpOnly-cookie and sign-in flow is unchanged.
- Evidence summary: **Save assessment snapshot** saves the server-compiled summary
  and input-version manifest. **Open saved assessment** reopens its saved ID.
  A preview is labeled unsaved; a snapshot may report newer evidence or become
  unavailable. Accepted evidence can still be an unverified customer assertion.

Expand **Snapshot and source details** to compare snapshot ID, creation time,
compiler/method, request IDs, document/result/subject IDs, document versions and
source-version IDs. These references come from the returned snapshot, not the
currently selected release. Older responses without a manifest explicitly report
that source-version details are unavailable. Missing result/source IDs are never
invented. Unavailable or denied responses clear the prior brief and provenance.

A network or 5xx save failure can be retried with its original idempotency key.
Concurrent clicks are suppressed. A new preview starts a new save revision.
Client retry does not establish database idempotency: the existing server/database
must reject changed output under an already used key. No automatic retry is made.

## Local evidence — October 18, 2026

Starting app revision: d13bdcb7b112ff0ed8d9d243ae7c6fd56f9a80d4.
API fixture source: e4d9b6902879936e5a5f159dab85acd4f82cfb48.

- 52 app tests across 16 suites: release/assessment controls, Context funnel,
  request proxy and their hooks. Includes exact snapshot references, legacy
  missing-manifest state, same-key retry after network/503 failures, duplicate
  clicks, and clearing previously visible provenance after 401/403/404 responses.
- 20 existing API Context tests across four suites: owner authorization,
  membership recheck/revocation and failures, server-built snapshots, shared
  operations and company assessments. Credential/provider/database boundaries
  are fixtures; these tests do not prove deployed row isolation or actual token
  revocation.
- `pnpm exec tsc --noEmit` passes with the usual generated Next image typings.
  `pnpm lint` passes with existing repository warnings; changed files have no
  lint warnings/errors.
- Local synthetic browser fixture: preview, save, reopen, keyboard disclosure and
  narrow-screen wrapping checked. Effective narrow viewport and content width
  both measured 433 CSS pixels (no horizontal page overflow). This fixture uses
  the actual components/styles and no connected account or hosted API.
- Local PostgreSQL snapshot fixture was not executed: the documented disposable
  server at 127.0.0.1:55439 was unavailable. No schema or database was modified.

Repeat the app checks:

```sh
pnpm exec vitest run components/Releases components/Context hooks/__tests__/useContextFunnel.test.tsx hooks/__tests__/useReleaseCaseReview.test.tsx lib/context
pnpm exec tsc --noEmit
pnpm lint
```

## Hosted acceptance still required

1. Verify intended Recoup database/environment, applied Context foundation and
   evidence migrations, `20260926170000_context_brief_snapshots.sql` and
   `20261010010000_context_company_assessment.sql`, and the intended owner-scoped
   function definitions/grants. The existing `read_context_brief(uuid,uuid)` and
   `save_context_brief(uuid,text,jsonb)` operations are server-only. An unrelated
   accessible Supabase project is not a substitute. Database metadata access was
   unavailable during this work.
2. After an approved release, Records reopens its existing private request and
   exact snapshot in web and MCP. Compare exact text, complete input manifest,
   coverage, missing topics and each displayed version reference. Keep customer
   IDs and contents in Records' owning private receipt, not this public file.
3. With explicit hosted test actor/write scope, test controlled save/reopen,
   same-key replay, changed-output conflict, cross-company denial, revoked
   membership, withdrawn evidence and superseded snapshots. No hosted write is
   authorized or performed by this UI task.
4. Draft workspace files remain working state. Changes to them do not accept
   Context facts, update rights or alter financial records. Shared file operations
   and expected-version conflicts remain a separate checkpoint dependency.

A feature PR, local fixture, CI result or automatic preview build does not complete
hosted web/MCP acceptance. No manual deployment, production write, credential
rotation, paid action, client import or merge is part of this change.

## Exact snapshot reopen identity — November 18, 2026

The saved-assessment hook captures the requested brief ID before awaiting access
or readback. It withholds a response for a different snapshot, clears prior text
and capture eligibility, and preserves the entered ID for explicit recovery. UUID
letter casing and surrounding input whitespace do not change the intended ID.
Editing the input while a request is pending does not retarget that request.

This repairs a concrete source-substitution case within App #2231/#2207 using the
existing Context `save_brief`/`read_brief` private snapshot path. Tests use the real
hook/request adapter and mounted viewer with synthetic HTTP responses: save/reopen
after hook loss preserves the exact snapshot and document/source versions; missing
or denied reads withhold prior content without looking up another source. This is
not a new ArtifactRef, generic file resolver, mutable working-surface store, public
upload fallback, cross-host authority proof, or live persistence acceptance. The
separate selected-evidence check remains limited to its existing API-supported
company-onboarding contract. Broader destination and artifact coverage in #2231
remains incomplete.

### Captured-reference recovery

The evidence selection panel now accepts the exact JSON emitted by **Captured
evidence references** after the user reopens its original saved assessment.
Recovery parses only `brief_id` and the existing `selected_evidence` tuple, rejects
extra fields/malformed input and a different brief ID, then calls the existing
current-auth/current-organization `read_brief` validation. It preserves document,
result, subject, topic, document version and source-version identities without
reconstructing them from labels. Checked evidence is withheld until the exact
server response passes `readAssessmentEvidenceValidation`; editing the recovery
input or changing the assessment/workspace invalidates pending validation.

This is an explicit local reference roundtrip through the existing private Context
brief destination. Copying references is not a server save acknowledgement. The
historical assessment summary remains distinct from checked selection results.
There is no new working-surface store, generic artifact reference, model dispatch,
public upload, provider call or Files/path-move support. Unsupported/superseded
snapshots cannot enter this selection path. #2207 durable surface saves and #2231
broad artifact/destination acceptance remain incomplete.

`CompanyAssessmentRecovery.test.tsx` exercises capture → unmount → reopen → paste →
server revalidation, exact request fields/current organization, no-store, malformed
and foreign references, access denial, unavailable evidence, superseded/mismatched
responses, and delayed edit/workspace invalidation. These are synthetic mounted
component tests, not authenticated runtime or cross-host acceptance.
