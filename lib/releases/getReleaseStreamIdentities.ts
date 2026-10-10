import type { ReleaseCase } from "./types";
/** Use one non-conflicting saved ISRC observation per release slot. */
export function getReleaseStreamIdentities(current: ReleaseCase) {
  return current.tracks.map((track) => {
    const candidates = current.identity_observations.candidates.filter(
      (candidate) => candidate.slotIndex === track.slot_index,
    );
    const identity = candidates.length === 1 ? candidates[0] : null;
    return {
      title: track.title ?? `Track ${track.slot_index + 1}`,
      isrc:
        identity &&
        identity.mappingState !== "conflict" &&
        identity.mappingState !== "unresolved" &&
        /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(identity.isrc ?? "")
          ? identity.isrc
          : null,
    };
  });
}
