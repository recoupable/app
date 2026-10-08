export interface ReleaseCaseItem {
  request_id: string;
  url: string;
  created_at: string;
  status: string;
}
export interface ReleaseCase {
  request_id: string;
  title: string | null;
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
