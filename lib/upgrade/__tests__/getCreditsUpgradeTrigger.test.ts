import { describe, expect, it } from "vitest";
import { getCreditsUpgradeTrigger } from "@/lib/upgrade/getCreditsUpgradeTrigger";

describe("getCreditsUpgradeTrigger", () => {
  it("is null while the balance is healthy", () => {
    expect(getCreditsUpgradeTrigger({ remaining: 3_000_000, total: 3_330_000 })).toBeNull();
  });

  it("is null at exactly 10 percent, the prompt starts under it", () => {
    expect(getCreditsUpgradeTrigger({ remaining: 333_000, total: 3_330_000 })).toBeNull();
  });

  it("is credits_low under 10 percent of the monthly total", () => {
    expect(getCreditsUpgradeTrigger({ remaining: 300_000, total: 3_330_000 })).toBe("credits_low");
  });

  it("is credits_exhausted at zero", () => {
    expect(getCreditsUpgradeTrigger({ remaining: 0, total: 3_330_000 })).toBe("credits_exhausted");
  });

  it("is credits_exhausted when the balance went negative", () => {
    expect(getCreditsUpgradeTrigger({ remaining: -5, total: 3_330_000 })).toBe("credits_exhausted");
  });

  it("is null before the credits have loaded, so a fresh login never sees it", () => {
    expect(getCreditsUpgradeTrigger({ remaining: 0, total: 0 })).toBeNull();
    expect(getCreditsUpgradeTrigger(undefined)).toBeNull();
  });
});
