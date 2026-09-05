import { describe, it, expect } from "vitest";
import formatCents from "@/lib/billing/formatCents";

describe("formatCents", () => {
  it("formats whole and fractional USD amounts", () => {
    expect(formatCents(9900, "usd")).toBe("$99.00");
    expect(formatCents(500000, "usd")).toBe("$5,000.00");
    expect(formatCents(0, "usd")).toBe("$0.00");
  });
  it("falls back to USD when currency is null", () => {
    expect(formatCents(100, null)).toBe("$1.00");
  });
});
