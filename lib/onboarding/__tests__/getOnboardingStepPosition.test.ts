import { describe, expect, it } from "vitest";
import { getOnboardingStepPosition } from "@/lib/onboarding/getOnboardingStepPosition";
import { ONBOARDING_STEP_IDS } from "@/lib/onboarding/types";

describe("getOnboardingStepPosition", () => {
  it("numbers each step against the one shared checkpoint vocabulary", () => {
    expect(getOnboardingStepPosition("artists")).toEqual({
      number: 1,
      total: 4,
    });
    expect(getOnboardingStepPosition("socials")).toEqual({
      number: 2,
      total: 4,
    });
    expect(getOnboardingStepPosition("catalog")).toEqual({
      number: 3,
      total: 4,
    });
    expect(getOnboardingStepPosition("task")).toEqual({ number: 4, total: 4 });
  });

  it("derives the denominator from ONBOARDING_STEP_IDS, never a private count", () => {
    // The regression this guards: RosterSocialsFlow rendered "Step 1 of 2" from
    // its own local state while the checklist said "of 4" — same account, two
    // denominators (chat#1889).
    for (const step of ONBOARDING_STEP_IDS) {
      expect(getOnboardingStepPosition(step).total).toBe(
        ONBOARDING_STEP_IDS.length,
      );
    }
  });

  it("is 1-indexed for display", () => {
    expect(getOnboardingStepPosition(ONBOARDING_STEP_IDS[0]).number).toBe(1);
  });
});
