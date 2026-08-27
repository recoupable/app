import { describe, it, expect } from "vitest";
import formatUsageDate from "@/lib/usage/formatUsageDate";

describe("formatUsageDate", () => {
  it("drops the year on a row timestamp, the period already says which year", () => {
    expect(formatUsageDate("2026-08-27T18:26:00.000Z")).toBe("Aug 27, 6:26 PM");
  });

  it("keeps the year on a period bound", () => {
    expect(formatUsageDate("2026-08-01T00:00:00.000Z", false)).toBe(
      "Aug 1, 2026",
    );
  });
});
