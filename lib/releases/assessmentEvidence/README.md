# Local saved-assessment evidence capture

`CompanyAssessment` displays a local selection alongside its existing saved-summary
flow. Only a returned saved snapshot with `superseded === false`, company-onboarding
purpose, and complete valid manifest rows can be captured. The saved brief ID comes
from that snapshot; editable open-ID input and the current release request never
supply capture identity. Selected entries are detached six-field manifest copies,
with explicit selection order and original numeric/document/source versions.

The request/organization keyed session is additionally keyed by account and release
fingerprint in `ReleaseCasesPage`. Every assessment operation synchronously revokes
the accepted snapshot before token acquisition, and advances a local operation key
that resets selection state. The event-time identity guard covers the interval before
React renders pending state. Scope changes, replacement, errors and unmount do not
restore old captures. This operation key is not a server or surface revision.

No validation request is sent. The captured envelope remains local, unsaved, and not
sent to chat. Existing preview/save/read operations retain their original request
bodies. A saved evidence origin does not make a new follow-up saved or authorized.
Future backend validation must be explicit and separately activated, preserve the
captured scope/snapshot binding through the asynchronous response, and fail closed
when it changes. Do not infer target kinds or ObjectRefs from topics, labels or IDs.

## API-owned schema pin

`vendor/source-pin.json` pins the two authoritative API schema sources at
`1de332ebeae6b74c6f21866482175d33cd843009`. These are vendored source dependencies,
not independently authored wire types. Only module paths change: `zod` becomes
`zod/v4` (included by App's existing zod 3.25 dependency), and the target-schema alias
becomes a sibling relative import. Do not manually change their fields or constraints;
refresh from an approved API commit and update hashes. Source formatting is retained.
UI values/types are inferred from this schema. No imports cross runtime repositories.
The validation response schema is retained with its owning source but no network
consumer is activated in this slice.

Malformed/out-of-bound or ambiguous manifests disable selection, while the existing
saved-summary display/read flow remains available. Historical missing `superseded`
metadata is not treated as explicit false. Current authorization and confirmed target
kinds are determined by the future API consumer, not by local schema validation.
