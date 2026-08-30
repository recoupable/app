import { describe, expect, it } from "vitest";
import { getUpgradeTriggerCopy } from "@/lib/upgrade/getUpgradeTriggerCopy";

describe("getUpgradeTriggerCopy", () => {
  it("leads with the balance as the headline when it is low", () => {
    const copy = getUpgradeTriggerCopy("credits_low", { remaining: 200_000, total: 3_330_000 });
    expect(copy.headline).toBe("$0.20 left");
    expect(copy.sub).toBe("of $3.33 this month");
    expect(copy.ratio).toBeCloseTo(0.06, 2);
    expect(copy.body).toBe("Your next report will use most of what is left. Upgrading keeps every agent running.");
  });

  it("collapses an exhausted balance to $0.00 left with an empty meter", () => {
    const copy = getUpgradeTriggerCopy("credits_exhausted", { remaining: -50_000, total: 3_330_000 });
    expect(copy.headline).toBe("$0.00 left");
    expect(copy.ratio).toBe(0);
    expect(copy.body).toBe("You have used this month's credits. Upgrading keeps every agent running.");
  });

  it("never uses em or en dashes", () => {
    for (const trigger of ["credits_low", "credits_exhausted"] as const) {
      const copy = getUpgradeTriggerCopy(trigger, { remaining: 0, total: 3_330_000 });
      expect(`${copy.headline}${copy.sub}${copy.body}`).not.toMatch(/[–—]/);
    }
  });
});
