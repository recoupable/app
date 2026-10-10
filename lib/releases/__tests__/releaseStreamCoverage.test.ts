import { expect, it } from "vitest";
import { buildReleaseStreamSeries } from "../buildReleaseStreamSeries";
import { current, history } from "./streamSeriesFixture";
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
    buildReleaseStreamSeries(current, invalid).daily.map((row) => row.streams),
  ).toEqual([null, null]);
});
it("rejects unsafe aggregate totals", () => {
  const large = structuredClone(history);
  large.recordings.forEach((recording) =>
    recording.days.forEach(
      (row) => (row.streams = Math.ceil(Number.MAX_SAFE_INTEGER / 4)),
    ),
  );
  expect(
    buildReleaseStreamSeries(current, large).daily.every((row) =>
      Number.isSafeInteger(row.streams),
    ),
  ).toBe(true);
  expect(buildReleaseStreamSeries(current, large).total).toBeNull();
});
