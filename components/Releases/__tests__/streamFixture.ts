import type { ReleaseCase } from "@/lib/releases/types";
import type { StreamHistory } from "@/lib/releases/streamTypes";
export const release = {
  request_id: "preview",
  title: "Sample release",
  fingerprint: "preview",
  tracks: [
    { slot_index: 0, title: "First song" },
    { slot_index: 1, title: "Second song" },
  ],
  identity_observations: {
    state: "observed",
    candidates: [0, 1].map((slotIndex) => ({
      slotIndex,
      isrc: `USABC260000${slotIndex + 1}`,
      mappingState: "unmapped",
    })),
  },
  track_page: { hasMore: false },
} as ReleaseCase;
export const history = {
  catalog_id: "preview-catalog",
  provider: "luminate",
  platform: "all_dsps",
  territory: "worldwide",
  metric: "daily_streams",
  periods: {
    previous: { start: "2026-08-13", end_exclusive: "2026-09-10" },
    current: { start: "2026-09-10", end_exclusive: "2026-10-08" },
    days: 28,
    timezone: "UTC",
  },
  pagination: { page: 1, total_count: 2, has_more: false },
  recordings: [0, 1].map((song) => ({
    isrc: `USABC260000${song + 1}`,
    provider_recording_id: `sample-${song}`,
    retrieved_at: "2026-10-09T09:00:00Z",
    state: "comparable",
    days: Array.from({ length: 56 }, (_, i) => ({
      date: new Date(Date.parse("2026-08-13T00:00:00Z") + i * 86400000)
        .toISOString()
        .slice(0, 10),
      streams: i % 7 === song ? (i >= 28 ? 3 : 2) : i % 5 === song ? 1 : 0,
    })),
  })),
} as StreamHistory;
