import { describe, expect, it } from "vitest";
import { getOnboardingFlagKey } from "@/lib/onboarding/getOnboardingFlagKey";

describe("getOnboardingFlagKey", () => {
  it("scopes the skipped flag by account id", () => {
    expect(getOnboardingFlagKey("skipped", "acct-a")).toBe(
      "recoup-onboarding-skipped:acct-a",
    );
  });

  it("produces distinct keys for distinct accounts (no cross-account leak)", () => {
    expect(getOnboardingFlagKey("skipped", "acct-a")).not.toBe(
      getOnboardingFlagKey("skipped", "acct-b"),
    );
  });
});
