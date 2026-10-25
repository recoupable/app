import { expect, it } from "vitest";
import { parseCatalogStreamComparison } from "../parseCatalogStreamComparison";
import { catalogStreamComparisonFixture as fixture } from "./catalogStreamComparisonFixture";

it("preserves the API's supplied calculations without recomputing daily observations", () => {
  const result = parseCatalogStreamComparison(fixture)!;
  expect(result.recordings[0].absolute_growth).toBe(25);
  expect(result.recordings[0].percentage_growth).toBe(25);
});
it.each([
  ["provider", "spotify"],
  ["platform", "spotify"],
  ["territory", "US"],
  ["metric", "listeners"],
  ["summary_scope", "catalog"],
  ["catalog_id", "unknown"],
])("rejects unsupported %s", (key, value) => {
  expect(parseCatalogStreamComparison({ ...fixture, [key]: value })).toBeNull();
});
it.each([
  { ...fixture.periods, timezone: "America/New_York" },
  { ...fixture.periods, days: 2 },
  {
    ...fixture.periods,
    current: { start: "2026-10-03", end_exclusive: "2026-10-04" },
  },
  {
    ...fixture.periods,
    previous: { start: "2026-02-30", end_exclusive: "2026-10-02" },
  },
])("rejects incompatible periods %#", (periods) => {
  expect(parseCatalogStreamComparison({ ...fixture, periods })).toBeNull();
});
it.each([
  { previous_streams: null },
  { current_streams: -1 },
  { absolute_growth: null },
  { current_streams: Number.MAX_SAFE_INTEGER + 1 },
  { percentage_growth: Infinity },
  { percentage_growth: null },
  { zero_baseline: true },
  { provider_recording_id: null },
  { retrieved_at: null },
  { missing_days: ["2026-10-01"] },
])("rejects malformed comparable figures or evidence %#", (patch) => {
  expect(
    parseCatalogStreamComparison({
      ...fixture,
      recordings: [{ ...fixture.recordings[0], ...patch }],
    }),
  ).toBeNull();
});
it("accepts zero baseline with an undefined percentage", () => {
  expect(
    parseCatalogStreamComparison({
      ...fixture,
      recordings: [
        {
          ...fixture.recordings[0],
          previous_streams: 0,
          absolute_growth: 125,
          percentage_growth: null,
          zero_baseline: true,
        },
      ],
    }),
  ).not.toBeNull();
});
it("rejects duplicate recording identities and responses exceeding the API page bound", () => {
  expect(
    parseCatalogStreamComparison({
      ...fixture,
      recordings: Array(2).fill(fixture.recordings[0]),
    }),
  ).toBeNull();
  expect(
    parseCatalogStreamComparison({
      ...fixture,
      recordings: Array.from({ length: 26 }, (_, i) => ({
        ...fixture.recordings[0],
        isrc: `synthetic-${i}`,
      })),
    }),
  ).toBeNull();
});
it.each([null, [], "Unavailable for delegated OAuth", {}])(
  "rejects non-contract output %#",
  (value) => {
    expect(parseCatalogStreamComparison(value)).toBeNull();
  },
);
