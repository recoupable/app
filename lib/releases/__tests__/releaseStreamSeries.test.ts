import { describe, expect, it } from "vitest";
import { buildReleaseStreamSeries } from "../buildReleaseStreamSeries";
import { getStreamPeriod } from "../getStreamPeriod";
import { first, current, history } from "./streamSeriesFixture";
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
    conflict.tracks[1].title = conflict.tracks[0].title;
    expect(buildReleaseStreamSeries(conflict, history).total).toBe(14);
    conflict.identity_observations.candidates[1].mappingState = "unresolved";
    expect(buildReleaseStreamSeries(conflict, history).total).toBeNull();
    conflict.identity_observations.candidates[1].mappingState = "conflict";
    expect(buildReleaseStreamSeries(conflict, history)).toMatchObject({
      total: null,
      unknownIdentity: true,
    });
    const wrong = structuredClone(history);
    wrong.recordings[1].isrc = "USABC2699999";
    expect(buildReleaseStreamSeries(current, wrong).total).toBeNull();
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
