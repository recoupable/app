import { describe, expect, it } from "vitest";
import { getUpgradeTriggerCopy } from "@/lib/upgrade/getUpgradeTriggerCopy";

describe("getUpgradeTriggerCopy", () => {
  it("names the trigger when the balance is low", () => {
    const copy = getUpgradeTriggerCopy("credits_low", { remainingUsd: "$0.20", totalUsd: "$3.33" });
    expect(copy.title).toMatch(/\$0\.20/);
    expect(copy.body).toMatch(/\$3\.33/);
  });

  it("names the trigger when the balance is gone", () => {
    const copy = getUpgradeTriggerCopy("credits_exhausted", { remainingUsd: "$0.00", totalUsd: "$3.33" });
    expect(copy.title.toLowerCase()).toMatch(/used|out of/);
    expect(copy.body).toMatch(/\$3\.33/);
  });

  it("never uses em or en dashes", () => {
    for (const trigger of ["credits_low", "credits_exhausted"] as const) {
      const copy = getUpgradeTriggerCopy(trigger, { remainingUsd: "$0", totalUsd: "$3.33" });
      expect(`${copy.title}${copy.body}`).not.toMatch(/[–—]/);
    }
  });
});
