import { getReleaseStreamIdentities } from "./getReleaseStreamIdentities";
import type { StreamRelease } from "./catalogStreamTypes";
/** Keep catalog completeness separate from the metadata-review projection contract. */
export function getStreamReleaseIdentities(current: StreamRelease) {
  return "recordings" in current
    ? { identities: current.recordings, complete: current.complete }
    : {
        identities: getReleaseStreamIdentities(current),
        complete: !current.track_page.hasMore,
      };
}
