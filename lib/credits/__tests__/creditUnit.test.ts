import { describe, it, expect } from "vitest";
import { CREDITS_PER_USD, creditsToUsd, formatCreditsAsUsd } from "@/lib/credits/creditUnit";

describe("credit unit", () => {
  it("agrees with the API that a credit is a cent today", () => {
    expect(CREDITS_PER_USD).toBe(100);
  });

  it("converts a balance to dollars", () => {
    expect(creditsToUsd(333)).toBeCloseTo(3.33, 10);
  });

  it("formats a balance as currency, not a raw count", () => {
    // The free allotment is 333 credits. Shown raw it survives a unit change
    // as "3,330,000", which tells a customer nothing.
    expect(formatCreditsAsUsd(333)).toBe("$3.33");
    expect(formatCreditsAsUsd(9999)).toBe("$99.99");
  });

  it("is consistent at the unit boundary", () => {
    expect(creditsToUsd(CREDITS_PER_USD)).toBe(1);
  });
});
