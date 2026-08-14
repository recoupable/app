import { describe, expect, it } from "vitest";
import { getOnboardingStepTitle } from "@/lib/onboarding/getOnboardingStepTitle";
import { ONBOARDING_STEP_IDS } from "@/lib/onboarding/types";

describe("getOnboardingStepTitle", () => {
  it("names each checkpoint in the product's flow language", () => {
    expect(getOnboardingStepTitle("artists")).toBe("Confirm your artists");
    expect(getOnboardingStepTitle("socials")).toBe("Verify socials");
    expect(getOnboardingStepTitle("catalog")).toBe("Claim your catalog");
    expect(getOnboardingStepTitle("task")).toBe("Schedule your first report");
  });

  it("covers every step id, so the checklist can never render undefined", () => {
    for (const step of ONBOARDING_STEP_IDS) {
      expect(getOnboardingStepTitle(step)).toBeTruthy();
    }
  });
});
