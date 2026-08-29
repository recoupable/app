import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { trackUpgradePromptShown } from "@/lib/upgrade/trackUpgradePromptShown";
import { trackUpgradePromptClicked } from "@/lib/upgrade/trackUpgradePromptClicked";

vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));

describe("upgrade prompt events", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upgrade_prompt_shown carries the trigger and the plans offered, comma joined", () => {
    trackUpgradePromptShown({ trigger: "credits_low", plans: ["starter", "pro"] });
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_shown", {
      trigger: "credits_low",
      plan_offered: "starter,pro",
    });
  });

  it("upgrade_prompt_clicked carries the chosen plan and the trigger", () => {
    trackUpgradePromptClicked({ trigger: "credits_exhausted", plan: "pro" });
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_clicked", {
      plan: "pro",
      trigger: "credits_exhausted",
    });
  });
});
