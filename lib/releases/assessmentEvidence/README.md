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

“Check captured evidence” explicitly sends a read-only `read_brief` request through
`/api/context`, with the captured brief ID and selection plus current organization.
Capture itself sends no request. Existing preview/save/read operations retain their
original bodies. Checking does not save a follow-up or send anything to chat.

Validation uses a separate generation guard. Edits, clear and recapture invalidate
it synchronously; assessment operations revoke the accepted snapshot before token
acquisition. Delayed tokens cannot dispatch after invalidation, and delayed responses
cannot restore checked status. Scope leave-return creates a fresh session.

The response must pass the API-owned runtime schema and match the captured snapshot
ID. Available requires a saved, explicitly non-superseded snapshot, the exact ordered
document/subject pairs, and complete source-version sets with no missing, extra or
duplicate authority rows. Source ordering is immaterial. The UI retains the server's
actual kind; it never infers ObjectRefs, target kinds or accepted view revisions.
Unavailable, malformed/error and available are distinct states. A successful check
is a point-in-time evidence read, not factual confirmation or permission to act.

## API-owned schema pin

`vendor/source-pin.json` pins the two authoritative API schema sources at
`97eb158f7634a856adafdcf99a127421068d4799`. These are vendored source dependencies,
not independently authored wire types. Local adaptations only change module paths:
`zod` becomes `zod/v4` (included by App's existing zod 3.25 dependency), and the target-schema alias
becomes a sibling relative import. Do not manually change their fields or constraints;
refresh from an approved API commit and update hashes. Approved API commits may change
fields or constraints. Source formatting is retained.
UI values/types are inferred from this schema. No imports cross runtime repositories.
Only the explicit Check button opts into `explain_evidence_validation: true`.
Existing read/save/preview requests are unchanged. Opted-in unavailable responses
may contain one of five coarse reasons: saved assessment unavailable, selection
mismatch, current evidence unavailable, identity unconfirmed, or validation limit
exceeded. Plain-language messages describe what the check could not verify; they
never diagnose withdrawal, false facts, rights or permission. An omitted reason
retains the legacy unavailable message. Unknown reasons fail strict parsing and
show the existing error state. No automatic retry or repair action is added.

Merge/activation requires the release coordinator’s exact API #1209 serving receipt.
Local synthetic acceptance does not establish deployed compatibility or explain
any existing customer's unavailable result.

Malformed/out-of-bound or ambiguous manifests disable selection, while the existing
saved-summary display/read flow remains available. Historical missing `superseded`
metadata is not treated as explicit false. Current authorization and confirmed target
kinds are determined by the API read, not by local capture validation.
