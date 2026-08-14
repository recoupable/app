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

  it("ignores disabled and paused (null-enabled) tasks", () => {
    expect(
      getOnboardingStep({
        artists: [{ account_socials: [{ id: "s1" }] }],
        catalogs: [{ id: "c1" }],
        tasks: [{ enabled: false }, { enabled: null }],
      }),
    ).toBe("task");
  });
});
