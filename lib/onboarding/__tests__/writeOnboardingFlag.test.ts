// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { writeOnboardingFlag } from "@/lib/onboarding/writeOnboardingFlag";
import { readOnboardingFlag } from "@/lib/onboarding/readOnboardingFlag";

describe("writeOnboardingFlag", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("sets a flag readable for the same account only", () => {
    writeOnboardingFlag("skipped", "acct-a", true);
    expect(readOnboardingFlag("skipped", "acct-a")).toBe(true);
    expect(readOnboardingFlag("skipped", "acct-b")).toBe(false);
  });

  it("clears a flag when written false", () => {
    writeOnboardingFlag("skipped", "acct-a", true);
    writeOnboardingFlag("skipped", "acct-a", false);
    expect(readOnboardingFlag("skipped", "acct-a")).toBe(false);
  });

  it("no-ops instead of throwing when sessionStorage access throws", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });
    expect(() => writeOnboardingFlag("skipped", "acct-a", true)).not.toThrow();
    setItem.mockRestore();
  });
});
