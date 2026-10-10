import type { ReleaseCase } from "../types";
import type { StreamHistory } from "../streamTypes";
export const first = "USABC2600001";
export const second = "USABC2600002";
export const current = {
  tracks: [
    { slot_index: 0, title: "First" },
    { slot_index: 1, title: "Second" },
  ],
  identity_observations: {
    candidates: [
      { slotIndex: 0, isrc: first, mappingState: "unmapped" },
      { slotIndex: 1, isrc: second, mappingState: "existing_identifier_match" },
    ],
  },
  track_page: { hasMore: false },
} as ReleaseCase;
export const history = {
  periods: {
    previous: { start: "2026-10-01", end_exclusive: "2026-10-03" },
    current: { start: "2026-10-03", end_exclusive: "2026-10-05" },
    days: 2,
    timezone: "UTC",
  },
  recordings: [first, second].map((isrc) => ({
    isrc,
    provider_recording_id: isrc,
    retrieved_at: "2026-10-06T09:00:00Z",
    state: "comparable",
    days: [1, 2, 3, 4].map((day) => ({
      date: `2026-10-0${day}`,
      streams: day < 3 ? 0 : day,
    })),
  })),
} as StreamHistory;
