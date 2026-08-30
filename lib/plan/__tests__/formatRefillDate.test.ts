import { describe, expect, it } from "vitest";
import { formatRefillDate } from "@/lib/plan/formatRefillDate";

describe("formatRefillDate", () => {
  it("is one month after the last refill, as day and short month", () => {
    expect(formatRefillDate("2026-08-01T10:00:00Z")).toBe("1 Sep");
    expect(formatRefillDate("2026-12-15T00:00:00Z")).toBe("15 Jan");
  });
  it("is empty when the timestamp is missing or invalid", () => {
    expect(formatRefillDate(null)).toBe("");
    expect(formatRefillDate("nope")).toBe("");
  });
});
