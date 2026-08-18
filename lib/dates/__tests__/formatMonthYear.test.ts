import { describe, it, expect } from "vitest";
import { formatMonthYear } from "@/lib/dates/formatMonthYear";

describe("formatMonthYear", () => {
  it("formats an ISO timestamp as 'Mon YYYY'", () => {
    expect(formatMonthYear("2026-08-01T12:00:00.000Z")).toBe("Aug 2026");
    expect(formatMonthYear("2025-12-31T23:59:59Z")).toBe("Dec 2025");
  });

  it("returns an empty string for an unparsable value", () => {
    expect(formatMonthYear("not-a-date")).toBe("");
    expect(formatMonthYear("")).toBe("");
  });
});
