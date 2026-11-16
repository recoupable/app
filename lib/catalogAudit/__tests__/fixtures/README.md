# Released catalog audit contract fixture

`released-catalog-audit.json` comes from API merge
`486d32ee3346d6ff4b41d7e13be415ac9dc124be` (tree
`eb30766e807cd79cc0dec4c769ec3af91b5c2a11`). The API feature head `b7bddd14`
has the same tree. This is synthetic source evidence, not a production response.
No account, database, provider or hosted session was used.

The original producer is API's
`lib/contracts/__tests__/contextOperationExamples.test.ts`. It executes the
real domain/HTTP/MCP processors with synthetic auth/storage and fenced networking.
In an API checkout at the recorded tree, run:

```sh
RECOUP_CONTEXT_EXAMPLES_OUTPUT=/tmp/catalog-operation-examples.json \
RECOUP_SELECTED_EVIDENCE_EXAMPLES_OUTPUT=/tmp/catalog-selected-evidence-examples.json \
pnpm exec vitest run lib/contracts/__tests__/contextOperationExamples.test.ts
```

The committed `prepare` is the complete `prepare_catalog_audit` entry from the
first export's `examples` array. `selectedEvidence` is the complete
`read_brief_selected_available_legacy` entry from the second export. Copy those
entries unchanged; record the released commit/tree and SHA-256 of the producer
and each complete export in `provenance`. Do not substitute manually recreated
snapshots or infer missing evidence. Both exports and the producer test run are
retained in the source-qualification packet.

The transport tests run the real App hook and `/api/context` route/proxy, with
only upstream API replies and identity/connection providers supplied by the test.
They compare the entire snapshot and the exact uncertain-write body, preserving
fingerprints, assessment text, input manifest, freshness, gaps and all collections.
The separately selected-evidence response is forwarded intact; it is not invented
as an additional preparation field. Reopen/save receipts are explicitly synthetic
storage echoes. They do not verify persisted database behavior or permissions.

Existing Catalog Reviews and Company Assessment suites retain the broader scope,
redaction, uncertain-write and unsaved-note recovery coverage. These tests add the
released API source binding; they do not establish browser or intended-account
acceptance.
