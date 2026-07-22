import { describe, expect, it } from "vitest";
import { getOnboardingStepContent } from "@/lib/onboarding/getOnboardingStepContent";
import { ONBOARDING_STEP_IDS } from "@/lib/onboarding/types";

describe("getOnboardingStepContent", () => {
  it("provides a titled card with an in-app link for every step", () => {
    for (const id of ONBOARDING_STEP_IDS) {
      const content = getOnboardingStepContent(id);
      expect(content.title.length, id).toBeGreaterThan(0);
      expect(content.description.length, id).toBeGreaterThan(0);
      expect(content.linkLabel.length, id).toBeGreaterThan(0);
      expect(content.href.startsWith("/"), id).toBe(true);
    }
  });

  it("links each step to the relevant existing page", () => {
    expect(getOnboardingStepContent("artists").href).toBe("/artists");
    expect(getOnboardingStepContent("socials").href).toBe("/artists");
    expect(getOnboardingStepContent("catalog").href).toBe("/catalogs");
    expect(getOnboardingStepContent("task").href).toBe("/tasks");
  });
});
