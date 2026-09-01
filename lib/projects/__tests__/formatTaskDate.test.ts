import { describe, it, expect } from "vitest";
import { formatTaskDate } from "@/lib/projects/formatTaskDate";

describe("formatTaskDate", () => {
  it("renders a due date as a calendar day, with no timezone shift", () => {
    // A bare date must not be parsed as UTC midnight and rendered as the day
    // before in a negative-offset timezone.
    expect(formatTaskDate("2026-09-12")).toBe("Sep 12");
  });

  it("renders a completion timestamp as a calendar day", () => {
    expect(formatTaskDate("2026-08-31T18:04:00Z")).toBe("Aug 31");
  });

  it("returns null when there is no date", () => {
    expect(formatTaskDate(null)).toBeNull();
  });
});
