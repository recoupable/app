import type { ReleaseCase, ReleaseFormat } from "@/lib/releases/types";
export const formatTrack = (
  slot_index: number,
  title: string,
  disc_number: number,
  track_number: number,
): ReleaseCase["tracks"][number] => ({
  slot_index,
  title,
  spotify_track_id: `track-${slot_index}`,
  disc_number,
  track_number,
  credited_artists: [],
});
export const observedFormat: ReleaseFormat = {
  source: "spotify_album_observation",
  state: "observed",
  observed_type: "album",
  format_state: "album",
  reported_total_tracks: 3,
  release_date: "2024-05-17",
  release_date_precision: "day",
  label: "Fixture label",
  upc: null,
  upc_state: "not_observed",
  track_coverage: "full",
  disc_count: 2,
  multi_disc: true,
  reissue: "unknown",
  physical_format: "unknown",
};
export const formatCase: ReleaseCase = {
  request_id: "request",
  title: "Fixture double album",
  fingerprint: "a".repeat(64),
  readiness: "partial",
  reviewable: true,
  tracks: [
    formatTrack(0, "First", 1, 1),
    formatTrack(1, "Second", 1, 2),
    formatTrack(2, "Third", 2, 1),
  ],
  gaps: [],
  evidence_manifest: [],
  track_page: { state: "ready", hasMore: false },
  identity_observations: { state: "not_collected", candidates: [] },
  latest_review: null,
};
