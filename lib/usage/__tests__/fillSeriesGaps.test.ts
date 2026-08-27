import { describe, expect, it } from "vitest";
import fillSeriesGaps from "@/lib/usage/fillSeriesGaps";

const point = (start: string, credits_deducted: number, events: number) => ({
  start,
  credits_deducted,
  usd: `$${(credits_deducted / 1_000_000).toFixed(2)}`,
  events,
});

describe("fillSeriesGaps", () => {
  it("adds a zero bucket for every day the api left out", () => {
    const filled = fillSeriesGaps(
      [
        point("2026-08-25T00:00:00.000Z", 10000, 1),
        point("2026-08-27T00:00:00.000Z", 20000, 2),
      ],
      "day",
      "2026-08-24T15:00:00.000Z",
      "2026-08-27T15:00:00.000Z",
    );
    expect(filled.map((p) => p.start)).toEqual([
      "2026-08-24T00:00:00.000Z",
      "2026-08-25T00:00:00.000Z",
      "2026-08-26T00:00:00.000Z",
      "2026-08-27T00:00:00.000Z",
    ]);
    expect(filled[2]).toEqual({
      start: "2026-08-26T00:00:00.000Z",
      credits_deducted: 0,
      usd: "$0.00",
      events: 0,
    });
    expect(filled[3].usd).toBe("$0.02");
  });

  it("walks hours, weeks and months at their own step", () => {
    expect(
      fillSeriesGaps(
        [],
        "hour",
        "2026-08-27T13:30:00.000Z",
        "2026-08-27T15:10:00.000Z",
      ),
    ).toHaveLength(3);
    expect(
      fillSeriesGaps(
        [],
        "week",
        "2026-08-03T00:00:00.000Z",
        "2026-08-24T00:00:00.000Z",
      ),
    ).toHaveLength(3);
    expect(
      fillSeriesGaps(
        [],
        "month",
        "2026-05-10T00:00:00.000Z",
        "2026-08-27T00:00:00.000Z",
      ).map((p) => p.start),
    ).toEqual([
      "2026-05-01T00:00:00.000Z",
      "2026-06-01T00:00:00.000Z",
      "2026-07-01T00:00:00.000Z",
      "2026-08-01T00:00:00.000Z",
    ]);
  });
});
