export interface ReleaseCaseItem {
  request_id: string;
  url: string;
  created_at: string;
  status: string;
}
/** Observed Spotify release format; the server never infers UPC, reissue or physical format. */
export interface ReleaseFormat {
  source: "spotify_album_observation";
  state: "observed" | "uncollected";
  observed_type: string | null;
  format_state: "single" | "album" | "compilation" | "unknown";
  reported_total_tracks: number | null;
  release_date: string | null;
  release_date_precision: string | null;
  label: string | null;
  upc: string | null;
  upc_state: "observed" | "not_observed" | "uncollected";
  /** "partial" when a page limit or failed page left reported track slots uncollected. */
  track_coverage: "full" | "partial" | "uncollected";
  /** Null unless every reported slot was collected with a disc number. */
  disc_count: number | null;
  multi_disc: boolean | null;
  reissue: "unknown";
  physical_format: "unknown";
}
export interface ReleaseCase {
  request_id: string;
  title: string | null;
  /** Optional so responses from an older API still render. */
  release_format?: ReleaseFormat;
  fingerprint: string;
  readiness: string;
  reviewable: boolean;
  tracks: {
    slot_index: number;
    title: string | null;
    spotify_track_id: string;
    disc_number: number | null;
    track_number: number | null;
    credited_artists: { name: string; spotify_artist_id: string }[];
  }[];
  gaps: string[];
  evidence_manifest: {
    source_version_id: string;
    result_id: string;
    source_url: string;
    retrieved_at: string;
  }[];
  track_page: {
    state: string;
    hasMore: boolean;
    linkedSlots?: number;
    reportedTotal?: number;
    coverage?: string;
  };
  identity_observations: {
    state: string;
    candidates: {
      slotIndex: number;
      isrc: string | null;
      mappingState: string;
    }[];
  };
  latest_review: null | {
    id: string;
    decision: string;
    created_at: string;
    stale: boolean;
  };
}
