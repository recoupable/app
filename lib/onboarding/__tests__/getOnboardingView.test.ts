import { describe, expect, it } from "vitest";
import { getOnboardingView } from "@/lib/onboarding/getOnboardingView";

describe("getOnboardingView", () => {
  it("shows nothing until account state has resolved", () => {
    expect(
      getOnboardingView({ isReady: false, step: "artists", skipped: false }),
    ).toBe("none");
  });

  it("never surfaces onboarding for a fully activated account", () => {
    for (const skipped of [false, true]) {
      expect(
        getOnboardingView({ isReady: true, step: "complete", skipped }),
      ).toBe("none");
    }
  });

  it("resumes the sequence by default for incomplete accounts", () => {
    expect(
      getOnboardingView({ isReady: true, step: "task", skipped: false }),
    ).toBe("sequence");
  });

  it("keeps the checklist pinned after skip — it is never dismissible", () => {
    expect(
      getOnboardingView({ isReady: true, step: "socials", skipped: true }),
    ).toBe("checklist");
  });
});
