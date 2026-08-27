import { describe, expect, it } from "vitest";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";

describe("formatCreditsAsUsd", () => {
  it("formats a balance as currency, not a raw count", () => {
    // Shown raw, the free allotment reads "3,330,000", which tells a customer
    // nothing; shown as dollars it is the same number they were told.
    expect(formatCreditsAsUsd(3_330_000)).toBe("$3.33");
    expect(formatCreditsAsUsd(99_990_000)).toBe("$99.99");
  });

  it("shows whole cents, so a sub-cent charge is visible as its cent bound", () => {
    expect(formatCreditsAsUsd(120_000)).toBe("$0.12");
    expect(formatCreditsAsUsd(2_000)).toBe("$0.00");
  });
});
