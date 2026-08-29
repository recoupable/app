// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { isUpgradePromptDismissed } from "@/lib/upgrade/isUpgradePromptDismissed";
import { dismissUpgradePrompt } from "@/lib/upgrade/dismissUpgradePrompt";

describe("upgrade prompt dismissal", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("is not dismissed by default", () => {
    expect(isUpgradePromptDismissed("credits_low")).toBe(false);
  });

  it("dismissal is per trigger and lives in sessionStorage", () => {
    dismissUpgradePrompt("credits_low");
    expect(isUpgradePromptDismissed("credits_low")).toBe(true);
    expect(isUpgradePromptDismissed("credits_exhausted")).toBe(false);
    expect(window.sessionStorage.length).toBe(1);
  });
});
