import { describe, expect, it } from "vitest";
import { buildReleaseStreamSeries } from "../buildReleaseStreamSeries";
import { getStreamPeriod } from "../getStreamPeriod";
import type { ReleaseCase } from "../types";
import type { StreamHistory } from "../streamTypes";
const first = "USABC2600001";
const second = "USABC2600002";
const current = {
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
const history = {
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
describe("release daily streams", () => {
  it("sums exact identities, counts duplicates once and preserves observed zeros", () => {
    const duplicate = {
      ...current,
      tracks: [...current.tracks, { ...current.tracks[0], slot_index: 2 }],
      identity_observations: {
        ...current.identity_observations,
        candidates: [
          ...current.identity_observations.candidates,
          { slotIndex: 2, isrc: first, mappingState: "unmapped" },
        ],
      },
    };
    const result = buildReleaseStreamSeries(duplicate, history);
    expect(result.daily.map((row) => row.streams)).toEqual([6, 8]);
    expect(result).toMatchObject({
      previous: 0,
      total: 14,
      growth: 14,
      percentage: null,
      uniqueTracks: 2,
      matchedTracks: 2,
    });
  });
  it("a missing track-day makes the release day unavailable, while other songs still chart", () => {
    const incomplete = structuredClone(history);
    incomplete.recordings[1].days.pop();
    expect(buildReleaseStreamSeries(current, incomplete)).toMatchObject({
      total: null,
      growth: null,
      missingDays: 1,
    });
    expect(
      buildReleaseStreamSeries(current, incomplete).daily.map(
        (row) => row.streams,
      ),
    ).toEqual([6, null]);
    expect(buildReleaseStreamSeries(current, incomplete, first).total).toBe(7);
  });
  it("does not merge another recording with the same title, or unresolved/conflicting identities", () => {
    const conflict = structuredClone(current);
    conflict.identity_observations.candidates[1].mappingState = "conflict";
    expect(buildReleaseStreamSeries(conflict, history)).toMatchObject({
      total: null,
      unknownIdentity: true,
    });
    const wrong = structuredClone(history);
    wrong.recordings[1].isrc = "USABC2699999";
    expect(buildReleaseStreamSeries(current, wrong).total).toBeNull();
  });
  it("does not invent a complete release for truncated tracks or missing source identity", () => {
    expect(
      buildReleaseStreamSeries(
        { ...current, track_page: { ...current.track_page, hasMore: true } },
        history,
      ).total,
    ).toBeNull();
    const missingIdentity = structuredClone(history);
    missingIdentity.recordings[0].provider_recording_id = null;
    expect(buildReleaseStreamSeries(current, missingIdentity).total).toBeNull();
  });
  it("treats explicit nulls and duplicate daily rows as gaps", () => {
    const invalid = structuredClone(history);
    invalid.recordings[0].days[2].streams = null;
    invalid.recordings[0].days.push(invalid.recordings[0].days[3]);
    expect(
      buildReleaseStreamSeries(current, invalid).daily.map(
        (row) => row.streams,
      ),
    ).toEqual([null, null]);
  });
  it("rejects unsafe aggregate totals", () => {
    const large = structuredClone(history);
    large.recordings[0].days.forEach(
      (row) => (row.streams = Number.MAX_SAFE_INTEGER),
    );
    expect(buildReleaseStreamSeries(current, large).total).toBeNull();
  });
  it("uses completed UTC days including the two-day provider buffer across month boundaries", () => {
    expect(getStreamPeriod(28, new Date("2026-03-01T00:01:00Z"))).toEqual({
      days: 28,
      since: "2026-01-31",
    });
    expect(getStreamPeriod(7, new Date("2026-10-10T23:59:00Z"))).toEqual({
      days: 7,
      since: "2026-10-02",
    });
  });
});
