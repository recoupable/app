# Local selection continuity fixture — #2224 / #2207

The playground's **Selection continuity** example consumes `projectSubjectContext`
through `SelectionReview`. It is available only behind the existing development
chat gate (`NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT=true`); production builds cannot
mount it. It does not change the 10,000-row explorer, wire collection rows or
ordinary chat selection behavior.

`createSelectionFixtureHost` uses twelve existing synthetic catalog descriptors,
with fixture authority. It publishes coherent collection snapshots through the
actual `createSnapshotConsumer`, then reads the accepted revision and opaque
lifecycle binding. Explicit fixture controls replace workspace, subject, purpose,
source versions or revision; these are authored synthetic scenarios, not service
refresh or authorization. Returning to a workspace advances the consumer epoch.

Inline and expanded review share one controlled ObjectRef selection. Filtering
changes only visible choices. Capturing a preview detaches the proposed refs;
every render revalidates against the current binding, accepted revision, subject,
purpose and source descriptors. Selection edits also invalidate the capture.
An explicit refresh can capture the current selection, including an empty one;
it cannot repair old workspace or source refs. The serialized output comes only
from the strict projection contract, excluding labels, values, hidden fields,
unselected records and host binding keys. Unavailable previews have no payload.

This is a real consumed fixture-host slice, not persistence or an authorized
follow-up endpoint. No storage, model send, implicit typed message, provider action,
new grants or backend request is added. Leaving the example discards its working
state. Generic schema-v1 collection row IDs are not converted into ObjectRefs.

Run `pnpm exec vitest run components/IntelligentUI/__tests__/SelectionReview.test.tsx lib/intelligent-ui/subject-context`.
Mounted tests cover selection edits, filter continuity, workspace leave/return,
accepted revision changes, independent same-revision subject/purpose/source changes,
ambiguous descriptors, hidden-field exclusion and the eight-record limit. Native
acceptance separately verifies expansion, focus return and stale outcomes.
