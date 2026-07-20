import { describe, expect, it } from "vitest";
import { getOnboardingView } from "@/lib/onboarding/getOnboardingView";

describe("getOnboardingView", () => {
  it("shows nothing until account state has resolved", () => {
    expect(
      getOnboardingView({
        isReady: false,
        step: "artists",
        skipped: false,
        checklistDismissed: false,
      }),
    ).toBe("none");
  });

  it("never surfaces onboarding for a fully activated account", () => {
    for (const skipped of [false, true]) {
      expect(
        getOnboardingView({
          isReady: true,
          step: "complete",
          skipped,
          checklistDismissed: false,
        }),
      ).toBe("none");
    }
  });

  it("resumes the sequence by default for incomplete accounts", () => {
    expect(
      getOnboardingView({
        isReady: true,
        step: "task",
        skipped: false,
        checklistDismissed: false,
      }),
    ).toBe("sequence");
  });

  it("drops to the app with the checklist pinned after skip", () => {
    expect(
      getOnboardingView({
        isReady: true,
        step: "socials",
        skipped: true,
        checklistDismissed: false,
      }),
    ).toBe("checklist");
  });

  it("hides the checklist once dismissed", () => {
    expect(
      getOnboardingView({
        isReady: true,
        step: "socials",
        skipped: true,
        checklistDismissed: true,
      }),
    ).toBe("none");
  });
});
