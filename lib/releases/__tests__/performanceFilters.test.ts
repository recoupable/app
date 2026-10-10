import { expect, it } from "vitest";
import { buildReleaseStreamSeries } from "../buildReleaseStreamSeries";
import { getStreamPeriod } from "../getStreamPeriod";
import {
  history,
  release,
} from "@/components/Releases/__tests__/streamFixture";
it("totals a selected set once and refuses a recording outside the release", () => {
  const selected = buildReleaseStreamSeries(release, history, [
    "USABC2600001",
    "USABC2600001",
  ]);
  expect(selected.daily).toEqual(
    buildReleaseStreamSeries(release, history, "USABC2600001").daily,
  );
  expect(
    buildReleaseStreamSeries(release, history, ["outside"]).total,
  ).toBeNull();
});
it("uses the selected historical start date for a custom period", () => {
  expect(
    getStreamPeriod(14, new Date("2026-10-10T12:00:00Z"), "2026-08-01"),
  ).toEqual({ days: 14, since: "2026-08-01" });
});
