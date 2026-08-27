import { describe, expect, it } from "vitest";
import formatBucketLabel from "@/lib/usage/formatBucketLabel";

describe("formatBucketLabel", () => {
  it("labels a bucket start at its own granularity", () => {
    expect(formatBucketLabel("2026-08-27T14:00:00.000Z", "hour")).toBe("2 PM");
    expect(formatBucketLabel("2026-08-27T00:00:00.000Z", "day")).toBe("Aug 27");
    expect(formatBucketLabel("2026-08-24T00:00:00.000Z", "week")).toBe(
      "Aug 24",
    );
    expect(formatBucketLabel("2026-08-01T00:00:00.000Z", "month")).toBe(
      "Aug 2026",
    );
  });
});
