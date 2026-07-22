// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readOnboardingFlag } from "@/lib/onboarding/readOnboardingFlag";
import { getOnboardingFlagKey } from "@/lib/onboarding/getOnboardingFlagKey";

describe("readOnboardingFlag", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("returns false when the flag was never set", () => {
    expect(readOnboardingFlag("skipped", "acct-a")).toBe(false);
  });

  it("returns true only for the account that set the flag", () => {
    window.sessionStorage.setItem(
      getOnboardingFlagKey("skipped", "acct-a"),
      "1",
    );
    expect(readOnboardingFlag("skipped", "acct-a")).toBe(true);
    expect(readOnboardingFlag("skipped", "acct-b")).toBe(false);
  });

  it("fails open (false) when sessionStorage access throws", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });
    expect(readOnboardingFlag("skipped", "acct-a")).toBe(false);
    getItem.mockRestore();
  });
});
