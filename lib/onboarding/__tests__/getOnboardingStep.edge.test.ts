import { describe, expect, it } from "vitest";
import { getOnboardingStep } from "@/lib/onboarding/getOnboardingStep";

describe("getOnboardingStep edge cases", () => {
  it("treats null, undefined and empty account_socials as no socials", () => {
    for (const account_socials of [null, undefined, []]) {
      expect(
        getOnboardingStep({
          artists: [{ account_socials }],
          catalogs: [{ id: "c1" }],
          tasks: [{ enabled: true }],
        }),
      ).toBe("socials");
    }
  });

  it("requires every rostered artist to have at least one social", () => {
    expect(
      getOnboardingStep({
        artists: [{ account_socials: [{ id: "s1" }] }, { account_socials: [] }],
        catalogs: [{ id: "c1" }],
        tasks: [{ enabled: true }],
      }),
    ).toBe("socials");
  });

  // Turning the auto-created report off pauses it (recoupable/app#1941); that
  // is a decision, so the gate must not reopen setup and create it again.
  it("treats a paused task as the task step done", () => {
    expect(
      getOnboardingStep({
        artists: [{ account_socials: [{ id: "s1" }] }],
        catalogs: [{ id: "c1" }],
        tasks: [{ enabled: false }],
      }),
    ).toBe("complete");
  });

  it("does not count a task with no on/off state", () => {
    expect(
      getOnboardingStep({
        artists: [{ account_socials: [{ id: "s1" }] }],
        catalogs: [{ id: "c1" }],
        tasks: [{ enabled: null }],
      }),
    ).toBe("task");
  });
});
